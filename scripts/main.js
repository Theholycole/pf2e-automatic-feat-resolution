// PF2e Automatic Feat Resolution (2026-10-30, docs/feats.md): a character's feats and actions, compiled with the character's own DCs and
// played by the ability module's cards. A feat it doesn't read stays PF2e's.

import { compileFeat } from "../src/compiler/index.js";
import { characterDCs } from "./character.js";
import { setUpRules } from "./rules.js";
import { applyFeatEffect } from "./effects.js";
import { onOwnUse, onRollMessage, onTurnChange, registerReminderSetting } from "./reminders.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const ABILITY_MODULE = "pf2e-automatic-ability-resolution";

const abilityApi = () => (game.modules.get(ABILITY_MODULE)?.active ? game.modules.get(ABILITY_MODULE).api ?? null : null);
const isActiveGM = () => game.users.activeGM?.isSelf ?? game.user.isGM;

// PF2e's own roll data for the paths in a feat's damage ("@item.flags.system.rulesSelections.damageType").
const withRollData = (dcs, item) => (dcs ? { ...dcs, resolve: (formula) => Roll.replaceFormulaData(formula, item?.getRollData?.() ?? {}) } : null);

function compileItem(item) {
    const dcs = withRollData(characterDCs(item?.actor), item);
    if (!dcs) return null;
    try {
        return compileFeat(item, { dcs, basicActions: abilityApi()?.basicActions });
    } catch (error) {
        console.warn(`${MODULE_ID} | ${item?.name} didn't compile.`, error);
        return null;
    }
}

const isFeatMessage = (message) => ["action", "feat"].includes(message.flags?.pf2e?.origin?.type) && !message.flags?.pf2e?.context?.type;

// The player's own targets on the message of a character's feat or action, as it's posted (their client: the GM's card needs them).
function recordTargets(message, _data, _options, userId) {
    if (userId !== game.user.id || !isFeatMessage(message)) return;
    const actor = message.speaker?.actor ? game.actors.get(message.speaker.actor) : null;
    if (actor?.type !== "character" && message.speakerActor?.type !== "character") return;
    const targets = [...game.user.targets].map((token) => token.document?.uuid).filter(Boolean);
    if (targets.length) message.updateSource({ [`flags.${MODULE_ID}.targets`]: targets });
}

// A character's feat or action: its card when it reads into a save, a check or healing on its targets, or a Strike feat's (its hit's
// results when the player's Strike hits). Its other readings (a PF2e Effect, a builtin) only with the world setting (D2).
const CARD_KINDS = new Set(["save", "check", "healing"]);
const SETTING = "featCards";
function registerSetting() {
    game.settings.register(MODULE_ID, SETTING, {
        name: "Cards for characters' feats",
        hint: "Which of a character's feats get the ability module's card when used. The rest stay PF2e's.",
        scope: "world",
        config: true,
        type: String,
        choices: { checks: "Saves, checks, healing and Strike feats", all: "Also Effects and the other readings" },
        default: "checks"
    });
}
const allCards = () => game.settings.get(MODULE_ID, SETTING) === "all";
async function cardForFeat(message) {
    if (!isFeatMessage(message) || !message.flags.pf2e.origin.uuid) return;
    const item = await fromUuid(message.flags.pf2e.origin.uuid);
    if (item?.actor?.type !== "character") return;
    const plan = compileItem(item);
    // (Slice 5: the module's own Effect on the character, not a card; none for a feat PF2e gives its own Effect, D9.)
    if (plan?.builtin === "feat-effect") return item.system?.selfEffect ? null : applyFeatEffect(item, plan);
    const play = abilityApi()?.live?.playAbility;
    if (!play) return;
    const sourceToken = message.token ?? item.actor.getActiveTokens(true, true)[0] ?? null;
    if (plan?.builtin === "strike-activity") return play(item, plan, sourceToken);
    if (!plan || plan.builtin === "no-effect" || (plan.trigger?.event ?? "use") !== "use") return;
    if (!(plan.resolution && CARD_KINDS.has(plan.resolution.kind)) && !allCards()) return;
    // (Damage still naming something the feat's roll data doesn't hold: PF2e's own card, not a wrong roll; D3.)
    if (/"formula":"[^"]*@/.test(JSON.stringify(plan.resolution ?? plan))) return;
    const recorded = message.getFlag?.(MODULE_ID, "targets") ?? [];
    const targets = recorded.map((uuid) => fromUuidSync(uuid)).filter(Boolean).map((token) => token.object ?? token);
    return play(item, plan, sourceToken, new Set(targets));
}

Hooks.once("init", () => {
    registerSetting();
    registerReminderSetting();
    // (The module's rule elements, docs/rules.md: before any actor prepares; PF2e's item classes are in CONFIG by the system's own init.)
    setUpRules();
});

Hooks.once("ready", () => {
    if (!abilityApi()?.live?.playAbility) console.warn(`${MODULE_ID} | needs PF2e Automatic Ability Resolution 0.9.6 or later for its cards.`);
    Hooks.on("preCreateChatMessage", recordTargets);
    // (Slice 6: reminders at a character's turn.)
    Hooks.on("combatTurnChange", (combat, prior, current) => {
        if (isActiveGM()) onTurnChange(combat, prior, current);
    });
    Hooks.on("createChatMessage", (message) => {
        if (!isActiveGM()) return;
        cardForFeat(message).catch((error) => console.error(`${MODULE_ID} | feat card`, error));
        // (Slice 7: reminders of reactions an attack or damage aimed at a character triggers.)
        onRollMessage(message).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
        // (Slice 8: reminders of reactions the character's own action or spell triggers.)
        onOwnUse(message).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
    });
    const module = game.modules.get(MODULE_ID);
    if (module) module.api = Object.freeze({ compileFeat: compileItem, characterDCs });
});

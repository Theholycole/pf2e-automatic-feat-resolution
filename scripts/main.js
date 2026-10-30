// PF2e Automatic Feat Resolution (2026-10-30, docs/feats.md): a character's feats and actions, compiled with the character's own DCs and
// played by the ability module's cards. A feat it doesn't read stays PF2e's.

import { compileFeat } from "../src/compiler/index.js";
import { characterDCs } from "./character.js";
import { setUpRules } from "./rules.js";
import { registerSenses, wrapDetectionModes } from "./senses.js";
import { registerTruesight, truesightSoon } from "./truesight.js";
import { applyFeatEffect } from "./effects.js";
import { areaOf, inArea } from "../src/compiler/area-targets.js";
import { actingItem } from "../src/compiler/companion.js";
import { onConditionGained, onFoeAction, onForeignSpell, onJoinEncounter, onOwnUse, onSaveAsked, onTokenMoved, onRollMessage, onTurnChange, registerReminderSetting, tokenCenter } from "./reminders.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const ABILITY_MODULE = "pf2e-automatic-ability-resolution";

const SPELL_MODULE = "pf2e-automatic-resolution";
const spellApi = () => (game.modules.get(SPELL_MODULE)?.active ? game.modules.get(SPELL_MODULE).api ?? null : null);
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

// (An eidolon or animal companion is a PF2e character too; a familiar has its own type, 2026-10-30 "Companions".)
const PLAYS = new Set(["character", "familiar"]);
const isFeatMessage = (message) => ["action", "feat"].includes(message.flags?.pf2e?.origin?.type) && !message.flags?.pf2e?.context?.type;

// The player's own targets on the message of a character's feat or action, as it's posted (their client: the GM's card needs them).
function recordTargets(message, _data, _options, userId) {
    if (userId !== game.user.id || !isFeatMessage(message)) return;
    const actor = message.speaker?.actor ? game.actors.get(message.speaker.actor) : null;
    if (!PLAYS.has(actor?.type) && !PLAYS.has(message.speakerActor?.type)) return;
    const targets = [...game.user.targets].map((token) => token.document?.uuid).filter(Boolean);
    if (targets.length) message.updateSource({ [`flags.${MODULE_ID}.targets`]: targets });
}

// A character's feat or action: its card when it reads into a save, a check or healing on its targets, or a Strike feat's (its hit's
// results when the player's Strike hits). Its other readings (a PF2e Effect, a builtin) only with the world setting (D2).
// (Slice 13: "effect", one of PF2e's own Effects the feat links, on the character, its target or its allies.)
const CARD_KINDS = new Set(["save", "check", "healing", "effect"]);
const SETTING = "featCards";
function registerSetting() {
    game.settings.register(MODULE_ID, SETTING, {
        name: "Cards for characters' feats",
        hint: "Which of a character's feats get the ability module's card when used. The rest stay PF2e's.",
        scope: "world",
        config: true,
        type: String,
        choices: { checks: "Saves, checks, healing, Strike feats and the PF2e Effects feats link", all: "Also the other readings" },
        default: "checks"
    });
}
const allCards = () => game.settings.get(MODULE_ID, SETTING) === "all";
async function cardForFeat(message) {
    if (!isFeatMessage(message) || !message.flags.pf2e.origin.uuid) return;
    const posted = await fromUuid(message.flags.pf2e.origin.uuid);
    if (!PLAYS.has(posted?.actor?.type)) return;
    // (2026-10-30, "Companions": Constricting Hold on the summoner's sheet is the eidolon's, with its numbers and from its token.)
    const world = { actors: [...game.actors], users: [...game.users] };
    let item = actingItem(posted, world);
    let plan = compileItem(item);
    // (A feat its companion acts in, Death Dive's mount: the companion's Strike.)
    if (plan?.by === "companion" && item === posted) {
        item = actingItem(posted, world, { companion: true });
        if (item !== posted) plan = compileItem(item);
    }
    // (Slice 5: the module's own Effect on the character, not a card; none for a feat PF2e gives its own Effect, D9.)
    if (plan?.builtin === "feat-effect") return item.system?.selfEffect ? null : applyFeatEffect(item, plan);
    const play = abilityApi()?.live?.playAbility;
    // (Warned at the first card, not at ready: the ability module sets its live API only once its basic actions load; 2026-10-30 Foundry test.)
    if (!play) return warnOnce();
    const sourceToken = (item === posted ? message.token : null) ?? item.actor.getActiveTokens(true, true)[0] ?? null;
    if (plan?.builtin === "strike-activity") return play(item, plan, sourceToken);
    if (plan?.builtin === "spell-like") return castSpellLike(item, plan, sourceToken, message);
    // (The ability module's own reading of "You cast Enlarge", its UUID by id as Foundry has it: the same cast, at the plan's DC or the
    // character's best; 2026-10-30 Foundry test, Dire Growth and Rat Form cast nothing.)
    if (plan?.builtin === "cast-spell" && plan.spell?.uuid) {
        const dcs = characterDCs(item.actor) ?? {};
        const best = [dcs.class, dcs.spell].filter((value) => Number.isFinite(value));
        return castSpellLike(item, { ...plan, dc: plan.dc ?? (best.length ? Math.max(...best) : null) }, sourceToken, message);
    }
    if (!plan || plan.builtin === "no-effect" || (plan.trigger?.event ?? "use") !== "use") return;
    if (!(plan.resolution && CARD_KINDS.has(plan.resolution.kind)) && !allCards()) return;
    // (Damage still naming something the feat's roll data doesn't hold: PF2e's own card, not a wrong roll; D3.)
    if (/"formula":"[^"]*@/.test(JSON.stringify(plan.resolution ?? plan))) return;
    const recorded = message.getFlag?.(MODULE_ID, "targets") ?? [];
    const targets = recorded.map((uuid) => fromUuidSync(uuid)).filter(Boolean).map((token) => token.object ?? token);
    // ("Each enemy within 30 feet": every one on the scene in range, not only the GM's targets; 2026-10-30.)
    const area = areaOf(plan.targeting?.target);
    const source = sourceToken?.object ?? sourceToken;
    if (area && source && canvas?.tokens) {
        const around = canvas.tokens.placeables.filter((token) => token.actor && inArea(area, {
            distance: edgeDistance(source, token),
            disposition: token.document.disposition,
            sourceDisposition: source.document.disposition,
            elevation: token.document.elevation ?? 0,
            self: token === source || token.actor === item.actor,
            defeated: !!token.combatant?.defeated || (token.actor.hitPoints?.value ?? 1) <= 0
        }));
        if (around.length) return play(item, plan, sourceToken, new Set(around));
    }
    // ("You": a condition the feat puts on the character itself, Nanite Shroud's concealment; the loop, 2026-10-30.)
    if (/^you$/i.test(plan.targeting?.target ?? "") && source) return play(item, plan, sourceToken, new Set([source]));
    // ("You and your allies", Defiant Banner: the character with the GM's targets.)
    if (/^you and\b/i.test(plan.targeting?.target ?? "") && source) targets.push(source);
    return play(item, plan, sourceToken, new Set(targets));
}

// (Between the tokens' edges, not their centers: a Large token adjacent to the character is 5 feet away, not 10; 2026-10-30 Foundry test,
// Pouncing Transformation found no one adjacent.)
function edgeDistance(source, token) {
    const centers = canvas.grid.measurePath([source.center, token.center]).distance;
    const sizes = ((Math.max(source.document.width, 1) - 1) + (Math.max(token.document.width, 1) - 1)) / 2;
    return Math.max(0, centers - sizes * canvas.grid.distance);
}

// (2026-10-30, "Spell-like feats": Webslinger's 2nd-rank Web at the character's DC, cast through PF2e by the spell module, whose card resolves
// it. Its UUID by name in the text ("…Item.Web") is the pack's entry of that name.)
async function castSpellLike(item, plan, sourceToken, message) {
    const cast = spellApi()?.castFromItem;
    if (!cast) return;
    let uuid = plan.spell.uuid;
    const parts = /^Compendium\.([\w-]+)\.([\w-]+)\.Item\.(.+)$/.exec(uuid);
    if (parts && !/^[A-Za-z0-9]{16}$/.test(parts[3])) {
        const entry = game.packs.get(`${parts[1]}.${parts[2]}`)?.index?.getName?.(parts[3]);
        if (!entry) return;
        uuid = `Compendium.${parts[1]}.${parts[2]}.Item.${entry._id}`;
    }
    const recorded = (message.getFlag?.(MODULE_ID, "targets") ?? []).map((each) => fromUuidSync(each)).filter(Boolean).map((token) => token.object ?? token);
    await cast({ actor: item.actor, token: sourceToken, spell: uuid, rank: plan.rank, dc: plan.dc, targets: recorded.length ? recorded : null,
        item: { name: item.name, uuid: item.uuid, img: item.img }, ...(plan.actions ? { actions: plan.actions } : {}) });
}

let warned = false;
function warnOnce() {
    if (warned) return;
    warned = true;
    console.warn(`${MODULE_ID} | needs PF2e Automatic Ability Resolution 0.9.6 or later for its cards.`);
}

Hooks.once("init", () => {
    registerSetting();
    registerReminderSetting();
    // (The module's rule elements, docs/rules.md: before any actor prepares; PF2e's item classes are in CONFIG by the system's own init.)
    setUpRules();
    // (Senses on tokens, docs/feats.md "Senses": their detection modes now, the wrapper once PF2e's token class is in CONFIG.)
    registerSenses();
    registerTruesight();
});

Hooks.once("setup", () => wrapDetectionModes());

Hooks.once("ready", () => {
    Hooks.on("preCreateChatMessage", recordTargets);
    // (Slice 6: reminders at a character's turn.)
    Hooks.on("combatTurnChange", (combat, prior, current) => {
        if (isActiveGM()) onTurnChange(combat, prior, current);
    });
    // (Slice 10: a condition gained, or 0 Hit Points.)
    Hooks.on("createItem", (item) => {
        if (isActiveGM() && item.type === "condition" && item.actor) onConditionGained(item.actor, item.slug).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
    });
    Hooks.on("updateActor", (actor, changed) => {
        if (isActiveGM() && foundry.utils.getProperty(changed, "system.attributes.hp.value") === 0) onConditionGained(actor, "0-hp").catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
    });
    // (Slice 11: a foe's token moving near a character; where it started, kept before the move.)
    Hooks.on("preUpdateToken", (document, changed, options) => {
        if (("x" in changed || "y" in changed) && canvas?.grid) options[`${MODULE_ID}.from`] = tokenCenter(document);
    });
    Hooks.on("updateToken", (document, changed, options) => {
        // (Not forced movement or a teleport: a Shove's push isn't a move action; 2026-10-30 Foundry test.)
        const forced = options?.["pf2e-resolution-core"]?.forcedMovement || options?.teleport || Object.values(options?.movement ?? {}).some((each) => ["displace", "teleport"].includes(each?.method ?? each?.action));
        if (isActiveGM() && ("x" in changed || "y" in changed) && !forced) onTokenMoved(document, options[`${MODULE_ID}.from`] ?? null, changed);
    });
    // (Truesight, docs/feats.md: a secret counteract check against each illusion that comes within range, once per illusion.)
    for (const hook of ["createToken", "createMeasuredTemplate", "createRegion"]) Hooks.on(hook, (document) => isActiveGM() && truesightSoon(document.parent));
    Hooks.on("updateToken", (document, changed) => isActiveGM() && ("x" in changed || "y" in changed) && truesightSoon(document.parent));
    Hooks.on("createItem", (item) => isActiveGM() && item.type === "effect" && truesightSoon());
    Hooks.on("canvasReady", () => isActiveGM() && truesightSoon());
    Hooks.on("createCombatant", (combatant) => {
        if (isActiveGM()) onJoinEncounter(combatant).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
    });
    Hooks.on("createChatMessage", (message) => {
        if (!isActiveGM()) return;
        cardForFeat(message).catch((error) => console.error(`${MODULE_ID} | feat card`, error));
        // (Slice 7: reminders of reactions an attack or damage aimed at a character triggers.)
        onRollMessage(message).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
        // (Slice 8: reminders of reactions the character's own action or spell triggers.)
        onOwnUse(message).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
        onForeignSpell(message).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
        // (Slice 9: before a save the GM's targets are asked for.)
        onSaveAsked(message).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
        // (Slice 11: a foe's manipulate, concentrate or move action near a character.)
        onFoeAction(message).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
    });
    const module = game.modules.get(MODULE_ID);
    if (module) module.api = Object.freeze({ compileFeat: compileItem, characterDCs });
});

// PF2e Automatic Feat Resolution (2026-10-30, docs/feats.md): a character's feats and actions, compiled with the character's own DCs and
// played by the ability module's cards. A feat it doesn't read stays PF2e's.

import { compileFeat } from "../src/compiler/index.js";
import { characterDCs } from "./character.js";
import { setUpRules } from "./rules.js";
import { registerConditionFeats } from "./conditions.js";
import { registerTerrainOptions } from "./terrain.js";
import { registerCompanionGrowth } from "./companion-growth.js";
import { registerGrants } from "./grants.js";
import { registerPreRoll } from "./pre-roll.js";
import { registerManeuverMap } from "./maneuver-map.js";
import { registerRetaliation } from "./retaliation.js";
import { registerNonlethal, toggleNonlethal } from "./nonlethal.js";
import { registerSenses, wrapDetectionModes } from "./senses.js";
import { registerTruesight, truesightSoon } from "./truesight.js";
import { guardOwnModes, registerSenseZones } from "./sense-zones.js";
import { applyFeatEffect, byName, togglePassiveEffect } from "./effects.js";
import { areaOf, inArea } from "../src/compiler/area-targets.js";
import { actingItem, findMaster } from "../src/compiler/companion.js";
import { fallEases, temperatureProtections, weatherIgnores } from "../src/plans/environment.js";
import { afterStrikeCard, onOfferMessage, registerOffers } from "./offers.js";
import { registerWorkbench } from "./workbench.js";
import { registerSkillActions } from "./skill-actions.js";
import { onConditionGained, onConditionLost, onFalling, onFell, onFoeAction, onForeignSpell, onJoinEncounter, onOwnUse, onSaveAsked, onTokenMoved, onRollMessage, onTurnChange, registerReminderSetting, tokenCenter } from "./reminders.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const ABILITY_MODULE = "pf2e-automatic-ability-resolution";
const ITEM_MODULE = "pf2e-automatic-item-resolution";
const itemApi = () => (game.modules.get(ITEM_MODULE)?.active ? game.modules.get(ITEM_MODULE).api ?? null : null);
// (The item module's readers, loaded at ready when that module is on: a reroll or a Stride, Step or Leap feat's card; round 94.)
let itemReaders = null;

const SPELL_MODULE = "pf2e-automatic-resolution";
const spellApi = () => (game.modules.get(SPELL_MODULE)?.active ? game.modules.get(SPELL_MODULE).api ?? null : null);
const abilityApi = () => (game.modules.get(ABILITY_MODULE)?.active ? game.modules.get(ABILITY_MODULE).api ?? null : null);
const isActiveGM = () => game.users.activeGM?.isSelf ?? game.user.isGM;

// PF2e's own roll data for the paths in a feat's damage ("@item.flags.system.rulesSelections.damageType").
const withRollData = (dcs, item) => (dcs ? { ...dcs, resolve: (formula) => Roll.replaceFormulaData(formula, item?.getRollData?.() ?? {}) } : null);

// The item module's card for a feat's plan it read (plan.builtin "teleport", "reroll"), or nothing without that module.
function postItemCard(item, plan, sourceToken, message) {
    const post = itemApi()?.live?.postCard;
    if (!post) return Promise.resolve(null);
    const token = sourceToken?.object ?? sourceToken ?? item.actor.getActiveTokens?.(true)?.[0] ?? null;
    return post({ plan, item, actor: item.actor, token, message });
}

function compileItem(item) {
    // (An NPC's: no class or spell DC of a character's, only its ally's Effect is played; cardForFeat.)
    const dcs = withRollData(characterDCs(item?.actor) ?? (item?.actor?.type === "npc" ? {} : null), item);
    if (!dcs) return null;
    try {
        return compileFeat(item, { dcs, basicActions: abilityApi()?.basicActions, itemReaders });
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
    if (!PLAYS.has(actor?.type) && !PLAYS.has(message.speakerActor?.type) && actor?.type !== "npc") return;
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
    // (An NPC's action is the ability module's, but for an ally's Effect, which it doesn't play: Teams+'s underlings' Little Buddy; 2026-10-31
    // Foundry test.)
    const npc = posted?.actor?.type === "npc";
    if (!PLAYS.has(posted?.actor?.type) && !npc) return;
    // (2026-10-30, "Companions": Constricting Hold on the summoner's sheet is the eidolon's, with its numbers and from its token.)
    const world = { actors: [...game.actors], users: [...game.users] };
    let item = actingItem(posted, world);
    // (Round 108: a feat that follows the character's last Strike, Drink of my Foes: its own card, scripts/offers.js.)
    if (await afterStrikeCard(item)) return;
    let plan = compileItem(item);
    // (A feat its companion acts in, Death Dive's mount: the companion's Strike.)
    if (plan?.by === "companion" && item === posted) {
        item = actingItem(posted, world, { companion: true });
        if (item !== posted) plan = compileItem(item);
    }
    // (An NPC's action plays only for an ally's Effect: a toggle on its targets, or an Effect it links for its allies, Teams+ underlings'
    // Battle Caller and Team Spirit; round 65 Foundry test.)
    const linksAnEffect = plan?.resolution?.kind === "effect" && (plan.resolution.applications ?? []).some((application) => application.kind === "native-spell-effect");
    if (npc && !(plan?.builtin === "feat-effect" && plan.who === "target") && !linksAnEffect) return;
    // (On the player's targets, who "target": as a passive's PF2e Effect is.)
    const targetActors = () => (message.getFlag?.(MODULE_ID, "targets") ?? []).map((uuid) => fromUuidSync(uuid)?.actor).filter(Boolean);
    const untargeted = () => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: item.actor }), whisper: ChatMessage.getWhisperRecipients("GM").map((user) => user.id), content: `<p><strong>${item.name}</strong>: target the creature first, then post it again.</p>` });
    // (A timer's, with no targets: nothing, its words already in chat; round 43.)
    if (plan?.builtin === "feat-effect" && plan.who === "target") return targetActors().length ? applyFeatEffect(item, plan, targetActors()) : plan.timer ? null : untargeted();
    // (Slice 5: the module's own Effect on the character, not a card; none for a feat PF2e gives its own Effect, D9.)
    // (A timer with a move, Chemical Spill's: its move card too; round 94.)
    if (plan?.builtin === "feat-effect" && plan.move) await postItemCard(item, plan.move, item === posted ? message.token : null, message).catch((error) => console.error(`${MODULE_ID} | move card`, error));
    if (plan?.builtin === "feat-effect") return item.system?.selfEffect ? null : applyFeatEffect(item, plan);
    // (A Focus or Mythic Point back: added to the pool, up to its maximum; 2026-10-30, the loop.)
    if (plan?.builtin === "regain-point") return regainPoint(item, plan);
    // (A passive's PF2e Effect for its moment, on and off: on the character, or on the player's targets; 2026-10-30, docs/rules.md.)
    if (plan?.builtin === "passive-effect") {
        const actors = plan.who === "you" ? [item.actor] : targetActors();
        if (!actors.length) return untargeted();
        return togglePassiveEffect(item, plan, actors);
    }
    const play = abilityApi()?.live?.playAbility;
    // (Warned at the first card, not at ready: the ability module sets its live API only once its basic actions load; 2026-10-30 Foundry test.)
    if (!play) return warnOnce();
    const sourceToken = (item === posted ? message.token : null) ?? item.actor.getActiveTokens(true, true)[0] ?? null;
    if (plan?.builtin === "strike-activity") return play(item, plan, sourceToken);
    // (An Effect linked by name: by id, which the ability module's card looks up; 2026-10-30 Foundry test, "Effect: Rend Armor wasn't found".)
    if (plan?.resolution?.kind === "effect") plan = { ...plan, resolution: { ...plan.resolution, applications: plan.resolution.applications.map((application) => ({ ...application, uuid: byName(application.uuid) ?? application.uuid })) } };
    // (And a degree's, a check's results: the marshal stances'.)
    if (plan?.resolution?.outcomes && Object.values(plan.resolution.outcomes).some((row) => row?.nativeEffects?.length)) {
        plan = { ...plan, resolution: { ...plan.resolution, outcomes: Object.fromEntries(Object.entries(plan.resolution.outcomes).map(([degree, row]) => [degree, row?.nativeEffects ? { ...row, nativeEffects: row.nativeEffects.map((effect) => ({ ...effect, uuid: byName(effect.uuid) ?? effect.uuid })) } : row])) } };
    }
    if (plan?.builtin === "spell-like") return castSpellLike(item, plan, sourceToken, message);
    // (The ability module's own reading of "You cast Enlarge", its UUID by id as Foundry has it: the same cast, at the plan's DC or the
    // character's best; 2026-10-30 Foundry test, Dire Growth and Rat Form cast nothing.)
    if (plan?.builtin === "cast-spell" && plan.spell?.uuid) {
        const dcs = characterDCs(item.actor) ?? {};
        const best = [dcs.class, dcs.spell].filter((value) => Number.isFinite(value));
        // (castWith "perception": the spell's numbers are the character's Perception, True Gaze's counteract checks; round 83 Foundry test.)
        const perception = Number(item.actor.perception?.mod ?? item.actor.system?.perception?.mod);
        const own = plan.castWith === "perception" && Number.isFinite(perception) ? perception + 10 : null;
        return castSpellLike(item, { ...plan, dc: own ?? plan.dc ?? (best.length ? Math.max(...best) : null) }, sourceToken, message);
    }
    // (A reroll or a Stride, Step or Leap feat, read by the item module's readers: its card — PF2e's reroll of the roll; Pick and click, the
    // token moved; round 94.)
    if (["teleport", "reroll", "roll-twice"].includes(plan?.builtin)) return postItemCard(item, plan, sourceToken, message);
    // (A save at a DC the character hasn't got, Primal Howl's spell DC on a master with no spellcasting: said to the GM, not silent;
    // round 77 Foundry test.)
    if (!plan) {
        const missing = missingDC(item);
        if (missing) return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: item.actor }), whisper: ChatMessage.getWhisperRecipients("GM").map((user) => user.id), content: `<p><strong>${item.name}</strong>: no ${missing} was found for ${dcOwner(item.actor).name}, so there's no card. Call for the save by hand, at the DC you set.</p>` });
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

// Whose DC a companion's save uses: its master's (scripts/character.js); round 78 Foundry test, the whisper named the companion.
const dcOwner = (actor) => findMaster(actor, { actors: [...(game.actors ?? [])], users: [...(game.users ?? [])] }) ?? actor;

// The DC a feat's save is against that the character lacks ("spell DC", "class DC"), or null.
function missingDC(item) {
    const html = String(item?.system?.description?.value ?? "");
    const against = [...html.matchAll(/@Check\[[^\]]*\bagainst:([\w-]+)/g)].map((match) => match[1]);
    if (!against.length) return null;
    const dcs = characterDCs(item.actor) ?? {};
    const has = (value) => Number.isFinite(value);
    for (const kind of against) {
        if (kind === "spell" && !has(dcs.spell)) return "spell DC";
        if (kind === "class" && !has(dcs.class)) return "class DC";
        if (kind === "class-spell" && !has(dcs.class) && !has(dcs.spell)) return "class or spell DC";
    }
    return null;
}

// "You regain 1 Focus Point, up to your usual maximum": the pool on the character's sheet, and a line in the chat saying so.
const POOLS = { focus: { path: "system.resources.focus", label: "Focus Point" }, mythic: { path: "system.resources.mythicPoints", label: "Mythic Point" } };
async function regainPoint(item, plan) {
    const pool = POOLS[plan.resource];
    const actor = item.actor;
    const current = foundry.utils.getProperty(actor, pool?.path ?? "");
    if (!pool || !current) return;
    const value = Number(current.value) || 0;
    const max = Number(current.max);
    const next = Number.isFinite(max) ? Math.min(max, value + plan.value) : value + plan.value;
    if (next !== value) await actor.update({ [`${pool.path}.value`]: next });
    const notes = (plan.notes ?? []).map((note) => `<p>${note}</p>`).join("");
    // (No pool at all, a world without mythic rules: said so, not "all 0"; 2026-10-30 Foundry test.)
    const said = max === 0 ? `has no ${pool.label}s` : next === value ? `already has all ${max} ${pool.label}s` : `regains ${next - value} ${pool.label}${next - value === 1 ? "" : "s"} (${next}${Number.isFinite(max) ? ` of ${max}` : ""})`;
    return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${item.name}</strong>: ${actor.name} ${said}.</p>${notes}` });
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
    const uuid = byName(plan.spell.uuid);
    if (!uuid) return;
    const recorded = (message.getFlag?.(MODULE_ID, "targets") ?? []).map((each) => fromUuidSync(each)).filter(Boolean).map((token) => token.object ?? token);
    await cast({ actor: item.actor, token: sourceToken, spell: uuid, rank: plan.rank, dc: plan.dc, targets: recorded.length ? recorded : null,
        item: { name: item.name, uuid: item.uuid, img: item.img }, ...(plan.actions ? { actions: plan.actions } : {}) });
    if (plan.castWith === "perception") await counteractWithPerception(item, plan);
    // (The feat's own notes, which the spell module's card doesn't carry: a line of their own; round 83 Foundry test.)
    // (Not the card's own lines: "You cast …", "Cast as …", "The feat names no DC" (noise on a spell with no save, Heal; round 85 test).)
    const notes = (plan.notes ?? []).filter((note) => !/^(?:You cast|Cast as|The feat names no DC)\b/.test(note));
    if (notes.length) await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: item.actor }), content: `<p><strong>${item.name}</strong>:</p>${notes.map((note) => `<p>${note}</p>`).join("")}` });
}

// (True Gaze, round 83 Foundry test: PF2e rolls the item-cast entry's counteract from its own counteraction statistic, not the spell
// module's item statistic. A modifier on the spell module's "its spells' numbers" Effect for this cast brings it to the character's
// Perception: on counteract checks with the spell's traits, as the roll carries no item or entry option.)
async function counteractWithPerception(item, plan) {
    const actor = item.actor;
    const perception = Number(actor.perception?.mod ?? actor.system?.perception?.mod);
    const entry = (actor.itemTypes?.spellcastingEntry ?? []).find((each) => each.flags?.[SPELL_MODULE]?.itemCastEntry?.itemUuid === item.uuid);
    const stat = (actor.itemTypes?.effect ?? []).find((each) => each.flags?.[SPELL_MODULE]?.itemCastStat === item.uuid);
    const current = Number(entry?.counteraction?.check?.mod ?? entry?.counteraction?.mod);
    if (!stat || !Number.isFinite(perception) || !Number.isFinite(current)) return;
    const spell = await fromUuid(byName(plan.spell.uuid));
    const traits = (spell?.system?.traits?.value ?? []).filter((trait) => !["concentrate", "manipulate"].includes(trait));
    // (Exactly one of ours, whatever the Effect held: round 83 recheck, a second cast added a second copy.)
    const ours = (rule) => rule.key === "FlatModifier" && [rule.selector].flat().includes("counteract-check") && rule.slug === "feat-perception";
    const all = foundry.utils.deepClone(stat.system.rules ?? []);
    // (The statistic's own modifier never holds ours: it's predicated on the spell's traits, which the statistic alone doesn't carry.)
    const before = Number(all.find(ours)?.value) || 0;
    const value = perception - current;
    const kept = all.filter((rule) => !ours(rule));
    if (all.length - kept.length === 1 && before === value) return;
    await stat.update({ "system.rules": [...kept, { key: "FlatModifier", selector: "counteract-check", slug: "feat-perception", label: `${item.name} (Perception)`, value, ...(traits.length ? { predicate: traits } : {}) }] });
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
    registerOffers();
    // (Round 109: PF2e Workbench's Basic Action Macro window and its Treat Wounds and Battle Medicine heals.)
    registerWorkbench({ compileItem });
    // (Round 110: Administer First Aid, Treat Poison and Disease, Hide, Sneak, Seek and Point Out applied from a card after the roll.)
    registerSkillActions();
    // (The module's rule elements, docs/rules.md: before any actor prepares; PF2e's item classes are in CONFIG by the system's own init.)
    setUpRules();
    // (Senses on tokens, docs/feats.md "Senses": their detection modes now, the wrapper once PF2e's token class is in CONFIG.)
    registerSenses();
    registerTruesight();
    registerSenseZones();
    // (Friend of Fear, Calm and Centered: a condition's value as it changes, src/plans/condition-feats.js.)
    registerConditionFeats();
    // (Difficult terrain's roll option, for the feats that make foes in it off-guard: scripts/terrain.js.)
    registerTerrainOptions();
    // (The /nonlethal command: scripts/nonlethal.js.)
    registerNonlethal();
    // (A master's feat that advances its companion: scripts/companion-growth.js.)
    registerCompanionGrowth();
    // (A feat's given spell or action: scripts/grants.js.)
    registerGrants();
});

// (In init, after PF2e's own: by setup the world's tokens had prepared without them; 2026-10-30 Foundry test. PF2e's hearing and tremorsense,
// set by its init, are stopped by the Senses areas too.)
Hooks.once("init", () => {
    wrapDetectionModes();
    guardOwnModes();
});
// (A scene's tokens prepared before the modes were in place, if any: prepared again.)
Hooks.on("canvasReady", () => {
    for (const token of canvas.scene?.tokens ?? []) token.reset?.();
    canvas.perception?.update?.({ initializeVision: true });
});

Hooks.once("ready", () => {
    // (The item module's move reader, by its own path beside this module's; round 94.)
    if (game.modules.get(ITEM_MODULE)?.active) Promise.all([import("../../pf2e-automatic-item-resolution/src/compiler/move.js"), import("../../pf2e-automatic-item-resolution/src/compiler/rerolls.js"), import("../../pf2e-automatic-item-resolution/src/compiler/spend.js"), import("../../pf2e-automatic-item-resolution/src/compiler/fortune.js")]).then(([move, rerolls, spend, fortune]) => { itemReaders = { movePlan: move.movePlan, rerollPlan: rerolls.rerollPlan, withSpend: spend.withSpend, rollTwicePlan: fortune.rollTwicePlan }; }).catch((error) => console.warn(`${MODULE_ID} | the item module's readers didn't load.`, error));
    // (A fall, the environment module's hooks: scripts/reminders.js; round 47.)
    Hooks.on("pf2e-automatic-environment-resolution.falling", (data) => { if (isActiveGM()) onFalling(data).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error)); });
    Hooks.on("pf2e-automatic-environment-resolution.fell", (data) => { if (isActiveGM()) onFell(data).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error)); });
    // (Before your own roll, a feat used then: scripts/pre-roll.js; round 45.)
    registerPreRoll();
    // (A maneuver's lower multiple attack penalty, Agile Maneuvers: scripts/maneuver-map.js; round 54.)
    registerManeuverMap();
    // (Damage back on a creature that hits or grabs you, Inviolable: scripts/retaliation.js; round 57.)
    registerRetaliation();
    Hooks.on("preCreateChatMessage", recordTargets);
    // (Slice 6: reminders at a character's turn.)
    Hooks.on("combatTurnChange", (combat, prior, current) => {
        if (isActiveGM()) onTurnChange(combat, prior, current);
    });
    // (Slice 10: a condition gained, or 0 Hit Points.)
    Hooks.on("deleteItem", (item) => {
        if (isActiveGM() && item.type === "condition" && item.actor) onConditionLost(item.actor, item.slug).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
    });
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
        const forced = options?.["pf2e-resolution-core"]?.forcedMovement || Object.values(options?.movement ?? {}).some((each) => ["displace", "teleport"].includes(each?.method ?? each?.action));
        if (isActiveGM() && ("x" in changed || "y" in changed) && !forced) onTokenMoved(document, options[`${MODULE_ID}.from`] ?? null, changed);
    });
    // (Truesight, docs/feats.md: a secret counteract check against each illusion that comes within range, once per illusion.)
    for (const hook of ["createToken", "createRegion"]) Hooks.on(hook, (document) => isActiveGM() && truesightSoon(document.parent));
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
        // (Round 106: reactions offered with a button as their trigger's roll is posted.)
        onOfferMessage(message).catch((error) => console.error(`${MODULE_ID} | reaction offer`, error));
    });
    const module = game.modules.get(MODULE_ID);
    // (What its feats ease of the weather, the temperature and falls, for the environment module: src/plans/environment.js.)
    if (module) module.api = Object.freeze({ compileFeat: compileItem, characterDCs, temperatureProtections, weatherIgnores, fallEases, toggleNonlethal });
});

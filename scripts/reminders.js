// Reminders at a character's turn (2026-10-30, docs/feats.md, slice 6): its reactions and free actions whose trigger is its own turn
// starting or ending, whispered to its owners and the GM as that turn comes. Nothing is used for them; the player decides.

import { turnReminders } from "../src/compiler/turn-reminders.js";
import { asksForSave, eventTrigger, fitsSave, savesAsked, eventsOf, ownStrikeEvents, ownUseTrigger, preRollTrigger, usesTrigger, weaponFits } from "../src/compiler/event-reminders.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const SETTING = "turnReminders";
const PASSIVE = "passiveReminders";

export function registerReminderSetting() {
    game.settings.register(MODULE_ID, SETTING, {
        name: "Reminders for characters' reactions",
        hint: "Whisper a character's owners the reactions and free actions that trigger at the start or end of its turn (\"Your turn begins.\"), or when an attack or damage is aimed at it or an ally nearby (\"A creature hits you with a melee Strike.\").",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });
    // (Passive feats that say when they apply, "Whenever you critically succeed on a Strike, …": the loop, 2026-10-30. Their own switch, as
    // they come more often.)
    game.settings.register(MODULE_ID, PASSIVE, {
        name: "Reminders for passive feats too",
        hint: "Also whisper passive feats that say when they apply (\"Whenever you critically succeed on a Strike, …\", \"At the start of each of your turns, you gain an additional reaction …\").",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });
}

// (Without the passive feats when that setting is off.)
const shown = (due) => (game.settings.get(MODULE_ID, PASSIVE) ? due : due.filter(({ read }) => read?.kind !== "passive"));

const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

async function remind(combatant, when) {
    const actor = combatant?.actor;
    if (actor?.type !== "character" || combatant.defeated) return;
    const items = [...actor.itemTypes.feat, ...actor.itemTypes.action];
    // (Slice 9: dying at the turn's start, its recovery check to come.)
    const dying = when === "start" && actor.hasCondition?.("dying") ? items.map((item) => ({ item, read: preRollTrigger(item) })).filter(({ read }) => read?.event === "pre-recovery") : [];
    const due = shown([...turnReminders(items, when, (slug) => !!actor.hasCondition?.(slug)), ...dying]);
    if (!due.length) return;
    const owners = game.users.filter((user) => user.isGM || actor.testUserPermission(user, "OWNER")).map((user) => user.id);
    const lines = due.map(({ item, read }) => `<li>@UUID[${item.uuid}]{${escape(item.name)}} (${read.kind}): ${escape(read.trigger)}</li>`).join("");
    await ChatMessage.create({
        content: `<p><strong>${escape(actor.name)}</strong>, ${when === "start" ? "your turn begins" : "your turn ends"}. Feats that may apply:</p><ul>${lines}</ul>`,
        speaker: ChatMessage.getSpeaker({ actor }),
        whisper: owners,
        flags: { [MODULE_ID]: { reminder: when } }
    });
}

// (The GM's client, once per change of turn: the last combatant's end, the new one's start.)
export function onTurnChange(combat, prior, current) {
    if (!game.settings.get(MODULE_ID, SETTING) || !combat?.started) return;
    const before = prior?.combatantId ? combat.combatants.get(prior.combatantId) : null;
    const now = current?.combatantId ? combat.combatants.get(current.combatantId) : combat.combatant;
    if (before && before !== now) remind(before, "end").catch((error) => console.error(`${MODULE_ID} | turn reminder`, error));
    if (now) remind(now, "start").catch((error) => console.error(`${MODULE_ID} | turn reminder`, error));
    if (now) foeTurnStart(now).catch((error) => console.error(`${MODULE_ID} | turn reminder`, error));
}

// A foe starting its turn near a character ("Whenever an enemy starts its turn adjacent to you"; round 38).
async function foeTurnStart(combatant) {
    const foe = combatant.token?.object ?? null;
    if (!foe) return;
    for (const token of canvas?.tokens?.placeables ?? []) {
        const actor = token.actor;
        if (actor?.type !== "character" || token === foe || token.document.disposition === foe.document.disposition) continue;
        const distance = distanceBetween(token, foe);
        const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "foe-turn-start" && distance !== null && distance <= read.within);
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${escape(combatant.name)} starts its turn near you.`, due);
    }
}

// A condition lost by a character ("You lose the Dying condition"; round 38).
export async function onConditionLost(actor, slug) {
    if (!game.settings.get(MODULE_ID, SETTING) || actor?.type !== "character") return;
    const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "self-condition-lost" && read.conditions?.includes(slug));
    if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong> loses ${escape(slug)}.`, due);
}

// When PF2e posts an attack or damage roll aimed at a character (the GM's client): the character's reactions and free actions that
// trigger on it, and each other character's that trigger on an ally's (in range, when the trigger gives one), whispered to their owners
// (slice 7, src/compiler/event-reminders.js).
const distanceBetween = (a, b) => (a && b && canvas?.grid ? canvas.grid.measurePath([a.center, b.center]).distance : null);

// (PF2e 8.6 posts a spell's cast with context type "spell-cast": a use, not a later roll from it; 2026-10-30 Foundry test.)
const isUse = (message) => {
    const type = message.flags?.pf2e?.context?.type;
    return !type || type === "spell-cast";
};

async function whisper(actor, heading, all) {
    const due = shown(all);
    if (!due.length) return;
    const owners = game.users.filter((user) => user.isGM || actor.testUserPermission(user, "OWNER")).map((user) => user.id);
    const lines = due.map(({ item, read }) => `<li>@UUID[${item.uuid}]{${escape(item.name)}} (${read.kind}): ${escape(read.trigger)}</li>`).join("");
    await ChatMessage.create({ content: `<p>${heading} Feats that may apply:</p><ul>${lines}</ul>`, speaker: ChatMessage.getSpeaker({ actor }), whisper: owners, flags: { [MODULE_ID]: { reminder: "event" } } });
}

export async function onRollMessage(message) {
    if (!game.settings.get(MODULE_ID, SETTING)) return;
    const context = message.flags?.pf2e?.context;
    remindOthersRoll(message, context).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
    const events = eventsOf(context?.type, context?.outcome);
    const targetToken = context?.target?.token ? fromUuidSync(context.target.token)?.object ?? null : null;
    const target = targetToken?.actor ?? (context?.target?.actor ? fromUuidSync(context.target.actor) : null);
    // (The character's own save: its feats that trigger on that degree of that save, "You succeed or critically succeed at a Reflex saving
    // throw"; the loop, 2026-10-30.)
    if (context?.type === "saving-throw" && message.actor?.type === "character" && context.outcome) {
        const saver = message.actor;
        const domains = context.domains ?? [];
        const kind = ["fortitude", "reflex", "will"].find((each) => domains.includes(each) || context.statistic === each) ?? null;
        const due = [...saver.itemTypes.feat, ...saver.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "own-save" && read.outcomes.includes(context.outcome) && (!read.saves.length || (kind && read.saves.includes(kind))));
        if (due.length) await whisper(saver, `<strong>${escape(saver.name)}</strong>: your ${kind ?? ""} save's result.`.replace("your  save", "your save"), due);
        return;
    }
    // (Its own skill or Perception check: "You fail, but don't critically fail, a Deception or Performance check".)
    if (["skill-check", "perception-check"].includes(context?.type) && message.actor?.type === "character" && context.outcome) {
        const roller = message.actor;
        const domains = context.domains ?? [];
        const due = [...roller.itemTypes.feat, ...roller.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "own-check" && read.outcomes.includes(context.outcome) && (!read.action || (context.options ?? []).includes(`action:${read.action}`)) && (!read.skills.length || read.skills.some((skill) => domains.includes(skill) || (context.options ?? []).includes(`action:${skill}`))));
        if (due.length) await whisper(roller, `<strong>${escape(roller.name)}</strong>: your check's result.`, due);
        return;
    }
    // (The character's own Strike: its feats that trigger on its hit, critical hit or miss; the loop, 2026-10-30.)
    const attacker = message.actor;
    const own = ownStrikeEvents(context?.type, context?.outcome);
    if (attacker?.type === "character" && own.length) {
        const due = [...attacker.itemTypes.feat, ...attacker.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read && own.includes(read.event) && weaponFits(read.weapons, context.options ?? []));
        const result = own.includes("own-critical-hit") ? "critically hits" : own.includes("own-hit") ? "hits" : "misses";
        if (due.length) await whisper(attacker, `<strong>${escape(attacker.name)}</strong>: your Strike ${result}.`, due);
    }
    if (!events.length || !target) return;
    const source = message.speaker?.alias ?? message.actor?.name ?? "A creature";
    const ofItems = (actor) => [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read);
    // (A trigger only for some attackers, "A creature with the animal … trait": by the attacker's traits.)
    const attackerTraits = message.actor?.system?.traits?.value ?? [];
    const byFits = ({ read }) => (!read.by || read.by.some((trait) => attackerTraits.includes(trait))) && !(read.notCritical && events.includes("critical-hit"));
    if (target.type === "character") {
        const due = ofItems(target).filter(({ read }) => events.includes(read.event)).filter(byFits);
        if (due.length) await whisper(target, `<strong>${escape(target.name)}</strong>: ${escape(source)}'s ${context.type === "damage-roll" ? "damage" : "attack"} is aimed at you.`, due);
    }
    // (An ally's: each other character on the scene, the target one of its allies.)
    for (const token of canvas?.tokens?.placeables ?? []) {
        const actor = token.actor;
        if (actor?.type !== "character" || actor === target || !targetToken || token.document.disposition !== targetToken.document.disposition) continue;
        const distance = distanceBetween(token, targetToken);
        const due = ofItems(actor).filter(({ read }) => events.includes(read.event.replace(/^ally-/, "")) && read.event.startsWith("ally-") && (!read.within || (distance !== null && distance <= read.within))).filter(byFits);
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${escape(source)}'s ${context.type === "damage-roll" ? "damage" : "attack"} is aimed at your ally ${escape(target.name)}.`, due);
    }
}

// Another creature's roll (the loop, 2026-10-30): each character on the scene with feats that trigger on that roll's degree by an ally, an
// enemy or any creature in range ("An ally within 30 feet of you critically succeeds at an attack roll or skill check"). In an encounter.
async function remindOthersRoll(message, context) {
    const kinds = ["attack-roll", "spell-attack-roll", "skill-check", "saving-throw"];
    if (!kinds.includes(context?.type) || !context.outcome || !game.combat?.started) return;
    const rollerToken = message.token?.object ?? message.actor?.getActiveTokens?.(true)[0] ?? null;
    if (!rollerToken) return;
    for (const token of canvas?.tokens?.placeables ?? []) {
        const actor = token.actor;
        if (actor?.type !== "character") continue;
        const self = actor === rollerToken.actor;
        const allied = token.document.disposition === rollerToken.document.disposition;
        const distance = self ? 0 : distanceBetween(token, rollerToken);
        const fits = (read) => (self ? read.who === "self-or-ally" : read.who === "creature" || (allied ? ["ally", "self-or-ally"].includes(read.who) : read.who === "enemy"));
        const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "others-roll" && fits(read) && read.outcomes.includes(context.outcome) && read.rolls.includes(context.type) && (!read.within || (distance !== null && distance <= read.within)));
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${self ? "your" : `${escape(rollerToken.name)}'s`} roll.`, due);
    }
}

// The character's own action or spell (slice 8): when its message is posted, its reactions and free actions that trigger on using that
// action or casting that spell ("You use Orc Ferocity.", "You Shield Block …", "You Cast a Spell using a spell slot.").
export async function onOwnUse(message) {
    if (!game.settings.get(MODULE_ID, SETTING)) return;
    const origin = message.flags?.pf2e?.origin;
    // (Its use, not a later roll from it: a check or damage message has a context type.)
    if (!origin?.uuid || !isUse(message)) return;
    const item = await fromUuid(origin.uuid).catch(() => null);
    const actor = item?.actor;
    if (actor?.type !== "character") return;
    const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].filter((each) => each !== item).map((each) => ({ item: each, read: ownUseTrigger(each) })).filter(({ read }) => usesTrigger(read, item.name, item.type, item.system?.traits?.value ?? []));
    if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: you used ${escape(item.name)}.`, due);
}

// Another creature's spell (slice 8): each character on the scene whose disposition isn't the caster's, and its feats that trigger on a
// spell cast ("A creature Casts a Spell that you have prepared", Counterspell), in range when the trigger gives one.
export async function onForeignSpell(message) {
    if (!game.settings.get(MODULE_ID, SETTING)) return;
    const origin = message.flags?.pf2e?.origin;
    if (origin?.type !== "spell" || !isUse(message)) return;
    const casterToken = message.token?.object ?? null;
    const caster = message.actor ?? casterToken?.actor ?? null;
    if (!caster) return;
    for (const token of canvas?.tokens?.placeables ?? []) {
        const actor = token.actor;
        if (actor?.type !== "character" || actor === caster) continue;
        // (An ally's spell, "An ally within 30 feet Casts a Spell": Accompany's, Spell Relay's; round 37.)
        const event = casterToken && token.document.disposition === casterToken.document.disposition ? "ally-casts" : "foe-casts";
        const distance = casterToken ? distanceBetween(token, casterToken) : null;
        const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === event && (!read.within || (distance !== null && distance <= read.within)));
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${escape(caster.name)} casts a spell.`, due);
    }
}

// Before a save (slice 9): a hostile spell or ability whose card asks for a save, posted by the GM with characters targeted (the GM's
// own targets, on this client), whispers each of them its feats used before the save ("… but you haven't rolled yet").
export async function onSaveAsked(message) {
    if (!game.settings.get(MODULE_ID, SETTING) || !message.author?.isSelf || !isUse(message) || !asksForSave(message.content)) return;
    const source = message.actor ?? message.token?.actor ?? null;
    if (!source || source.type === "character") return;
    // (The localised "Basic" from the key PF2e builds the label with, "Basic {save}"; round 37c.)
    const basicWord = game.i18n?.has?.("PF2E.InlineCheck.BasicWithSave") ? game.i18n.format("PF2E.InlineCheck.BasicWithSave", { save: "" }).trim() : "basic";
    const asked = savesAsked(message.content, basicWord || "basic");
    for (const token of game.user.targets) {
        const actor = token.actor;
        if (actor?.type !== "character") continue;
        const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: preRollTrigger(item) })).filter(({ read }) => read?.event === "pre-save" && fitsSave(read, asked));
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${escape(source.name)} calls for your save (before you roll it).`, due);
    }
}

// Before initiative (slice 9): a character added to an encounter without its initiative yet.
export async function onJoinEncounter(combatant) {
    if (!game.settings.get(MODULE_ID, SETTING) || combatant.initiative !== null) return;
    const actor = combatant.actor;
    if (actor?.type !== "character") return;
    const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: preRollTrigger(item) })).filter(({ read }) => read?.event === "pre-initiative");
    if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: an encounter is starting (before you roll initiative).`, due);
}

// A condition gained, or 0 Hit Points (slice 10): the creature's own feats that trigger on it ("You would gain the Fatigued condition",
// "You would be reduced to 0 Hit Points"), and other characters' that trigger on an ally's or any creature's ("An ally within 30 feet gains
// the Frightened condition", "A creature within 60 feet gains the Frightened condition"), in range.
export async function onConditionGained(actor, slug) {
    if (!game.settings.get(MODULE_ID, SETTING) || !actor) return;
    const matches = (read, event) => read?.event === event && read.conditions?.includes(slug);
    const forActor = (each, event) => [...each.itemTypes.feat, ...each.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => matches(read, event));
    const words = slug === "0-hp" ? "is reduced to 0 Hit Points" : `gains ${slug}`;
    if (actor.type === "character") {
        const due = forActor(actor, "self-condition");
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong> ${escape(words)}.`, due);
    }
    const token = actor.getActiveTokens(true)[0] ?? null;
    if (!token) return;
    // (A foe dropped: the character whose turn it is ("You reduce an enemy to 0 Hit Points"), and its allies in range ("An ally within 30
    // feet brings an enemy to 0 Hit Points"); the loop, 2026-10-30.)
    const current = game.combat?.started ? game.combat.combatant : null;
    const killerToken = current?.token?.object ?? null;
    if (slug === "0-hp" && current?.actor?.type === "character" && killerToken && killerToken.document.disposition !== token.document.disposition) {
        const killer = current.actor;
        const of = (each, event) => [...each.itemTypes.feat, ...each.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === event);
        const due = of(killer, "own-kill");
        if (due.length) await whisper(killer, `<strong>${escape(killer.name)}</strong>: ${escape(actor.name)} is reduced to 0 Hit Points on your turn.`, due);
        for (const other of canvas?.tokens?.placeables ?? []) {
            const each = other.actor;
            if (each?.type !== "character" || each === killer || other.document.disposition !== killerToken.document.disposition) continue;
            const distance = distanceBetween(other, killerToken);
            const near = of(each, "ally-kill").filter(({ read }) => !read.within || (distance !== null && distance <= read.within));
            if (near.length) await whisper(each, `<strong>${escape(each.name)}</strong>: your ally ${escape(killer.name)} brings ${escape(actor.name)} to 0 Hit Points.`, near);
        }
    }
    for (const other of canvas?.tokens?.placeables ?? []) {
        const each = other.actor;
        if (each?.type !== "character" || each === actor) continue;
        const distance = distanceBetween(other, token);
        const inRange = ({ read }) => !read.within || (distance !== null && distance <= read.within);
        const ally = other.document.disposition === token.document.disposition ? forActor(each, "ally-condition") : [];
        const due = [...ally, ...forActor(each, "creature-condition")].filter(inRange);
        if (due.length) await whisper(each, `<strong>${escape(each.name)}</strong>: ${escape(actor.name)} ${escape(words)}.`, due);
    }
}

// A foe near a character moving, or using a manipulate, concentrate or move action (slice 11): each character on the scene whose
// disposition isn't the foe's, with feats that trigger on it ("A creature within your reach leaves a square during a move action"), when
// the foe's token starts or ends its move in range, or its action's or spell's message (its traits) is posted.
async function remindFoeActs(foeToken, test, words, positions = null) {
    // (In an encounter only: out of one, every walk past would remind.)
    if (!game.settings.get(MODULE_ID, SETTING) || !foeToken?.actor || !game.combat?.started) return;
    for (const token of canvas?.tokens?.placeables ?? []) {
        const actor = token.actor;
        if (actor?.type !== "character" || actor === foeToken.actor || token.document.disposition === foeToken.document.disposition) continue;
        const distances = positions ? positions.map((point) => canvas.grid.measurePath([token.center, point]).distance) : [distanceBetween(token, foeToken)];
        const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "foe-acts" && test(read) && distances.some((distance) => distance !== null && distance <= read.within));
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${escape(foeToken.name)} ${escape(words)} near you.`, due);
    }
}

// (Foundry 14: a token document's x and y follow the move's animation, even in its update hooks; its _source and the change don't.)
export const tokenCenter = (document, changed = {}) => {
    const source = document._source ?? document;
    const x = changed.x ?? source.x;
    const y = changed.y ?? source.y;
    return { x: x + ((changed.width ?? source.width) * canvas.grid.size) / 2, y: y + ((changed.height ?? source.height) * canvas.grid.size) / 2 };
};

// An ally of a character moving near it (the loop, 2026-10-30): each other character of the mover's disposition with feats that trigger on
// it ("An ally ends a move action adjacent to you"), when the move starts or ends in range. In an encounter only.
async function remindAllyMoves(allyToken, positions) {
    if (!game.settings.get(MODULE_ID, SETTING) || !allyToken?.actor || !game.combat?.started) return;
    for (const token of canvas?.tokens?.placeables ?? []) {
        const actor = token.actor;
        if (actor?.type !== "character" || actor === allyToken.actor || token.document.disposition !== allyToken.document.disposition) continue;
        const distances = positions.map((point) => canvas.grid.measurePath([token.center, point]).distance);
        const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "ally-moves" && distances.some((distance) => distance !== null && distance <= read.within));
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${escape(allyToken.name)} moves near you.`, due);
    }
}

export function onTokenMoved(document, from, changed = {}) {
    const token = document.object;
    if (!token || !from) return;
    if (token.actor?.type === "character") {
        remindAllyMoves(token, [from, tokenCenter(document, changed)]).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
        return;
    }
    // (Where it ends, from the change: during the move's animation token.center and the document's x and y are still on the way; 2026-10-30
    // Foundry test.)
    const to = tokenCenter(document, changed);
    remindFoeActs(token, (read) => read.moves || read.traits.includes("move"), "moves", [from, to]).catch((error) => console.error(`${MODULE_ID} | reaction reminder`, error));
}

export async function onFoeAction(message) {
    const origin = message.flags?.pf2e?.origin;
    if (!origin?.uuid || !isUse(message)) return;
    const token = message.token?.object ?? null;
    if (!token || token.actor?.type === "character") return;
    const item = await fromUuid(origin.uuid).catch(() => null);
    const traits = (item?.system?.traits?.value ?? []).filter((trait) => ["manipulate", "concentrate", "move", "auditory", "visual"].includes(trait));
    if (!traits.length) return;
    await remindFoeActs(token, (read) => read.traits.some((trait) => traits.includes(trait)), `uses ${item.name} (${traits.join(", ")})`);
}

// A fall (round 47): the environment module's "falling" hook as a creature starts to fall, before the GM applies its damage, and "fell"
// once it's done. The faller's own feats ("You fall from a height of 15 feet or higher": Cushion Landing, Arrest a Fall, Grab an Edge),
// others' in range ("A creature within 60 feet is falling": Air Cushion); after, "You fall at least 10 feet and land" (Impressive Landing).
const feetOf = (value) => Number(value) || 0;
export async function onFalling({ token, feet } = {}) {
    if (!game.settings.get(MODULE_ID, SETTING)) return;
    const faller = token?.actor ?? token?.object?.actor ?? null;
    const fallerToken = token?.object ?? token ?? null;
    if (!faller) return;
    if (faller.type === "character") {
        const due = [...faller.itemTypes.feat, ...faller.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "self-falling" && feetOf(feet) >= read.feet);
        if (due.length) await whisper(faller, `<strong>${escape(faller.name)}</strong> is falling ${feetOf(feet)} feet (before its damage).`, due);
    }
    for (const other of canvas?.tokens?.placeables ?? []) {
        const actor = other.actor;
        if (actor?.type !== "character" || actor === faller) continue;
        const distance = distanceBetween(other, fallerToken);
        const ally = fallerToken?.document && other.document.disposition === fallerToken.document.disposition;
        const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "creature-falling" && (!read.ally || ally) && (!read.within || (distance !== null && distance <= read.within)));
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${escape(faller.name)} is falling ${feetOf(feet)} feet.`, due);
    }
}

export async function onFell({ token, feet, applied } = {}) {
    if (!game.settings.get(MODULE_ID, SETTING)) return;
    const faller = token?.actor ?? token?.object?.actor ?? null;
    if (faller?.type !== "character") return;
    const due = [...faller.itemTypes.feat, ...faller.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "self-fell" && feetOf(feet) >= read.feet && (!read.noDamage || !feetOf(applied)));
    if (due.length) await whisper(faller, `<strong>${escape(faller.name)}</strong> fell ${feetOf(feet)} feet.`, due);
}

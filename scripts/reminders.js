// Reminders at a character's turn (2026-10-30, docs/feats.md, slice 6): its reactions and free actions whose trigger is its own turn
// starting or ending, whispered to its owners and the GM as that turn comes. Nothing is used for them; the player decides.

import { turnReminders } from "../src/compiler/turn-reminders.js";
import { asksForSave, eventTrigger, eventsOf, ownUseTrigger, preRollTrigger, usesTrigger } from "../src/compiler/event-reminders.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const SETTING = "turnReminders";

export function registerReminderSetting() {
    game.settings.register(MODULE_ID, SETTING, {
        name: "Reminders for characters' reactions",
        hint: "Whisper a character's owners the reactions and free actions that trigger at the start or end of its turn (\"Your turn begins.\"), or when an attack or damage is aimed at it or an ally nearby (\"A creature hits you with a melee Strike.\").",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });
}

const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

async function remind(combatant, when) {
    const actor = combatant?.actor;
    if (actor?.type !== "character" || combatant.defeated) return;
    const items = [...actor.itemTypes.feat, ...actor.itemTypes.action];
    // (Slice 9: dying at the turn's start, its recovery check to come.)
    const dying = when === "start" && actor.hasCondition?.("dying") ? items.map((item) => ({ item, read: preRollTrigger(item) })).filter(({ read }) => read?.event === "pre-recovery") : [];
    const due = [...turnReminders(items, when), ...dying];
    if (!due.length) return;
    const owners = game.users.filter((user) => user.isGM || actor.testUserPermission(user, "OWNER")).map((user) => user.id);
    const lines = due.map(({ item, read }) => `<li>@UUID[${item.uuid}]{${escape(item.name)}} (${read.kind}): ${escape(read.trigger)}</li>`).join("");
    await ChatMessage.create({
        content: `<p><strong>${escape(actor.name)}</strong>, ${when === "start" ? "your turn begins" : "your turn ends"}. You may be able to use:</p><ul>${lines}</ul>`,
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
}

// When PF2e posts an attack or damage roll aimed at a character (the GM's client): the character's reactions and free actions that
// trigger on it, and each other character's that trigger on an ally's (in range, when the trigger gives one), whispered to their owners
// (slice 7, src/compiler/event-reminders.js).
const distanceBetween = (a, b) => (a && b && canvas?.grid ? canvas.grid.measurePath([a.center, b.center]).distance : null);

async function whisper(actor, heading, due) {
    const owners = game.users.filter((user) => user.isGM || actor.testUserPermission(user, "OWNER")).map((user) => user.id);
    const lines = due.map(({ item, read }) => `<li>@UUID[${item.uuid}]{${escape(item.name)}} (${read.kind}): ${escape(read.trigger)}</li>`).join("");
    await ChatMessage.create({ content: `<p>${heading} You may be able to use:</p><ul>${lines}</ul>`, speaker: ChatMessage.getSpeaker({ actor }), whisper: owners, flags: { [MODULE_ID]: { reminder: "event" } } });
}

export async function onRollMessage(message) {
    if (!game.settings.get(MODULE_ID, SETTING)) return;
    const context = message.flags?.pf2e?.context;
    const events = eventsOf(context?.type, context?.outcome);
    const targetToken = context?.target?.token ? fromUuidSync(context.target.token)?.object ?? null : null;
    const target = targetToken?.actor ?? (context?.target?.actor ? fromUuidSync(context.target.actor) : null);
    if (!events.length || !target) return;
    const source = message.speaker?.alias ?? message.actor?.name ?? "A creature";
    const ofItems = (actor) => [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read);
    if (target.type === "character") {
        const due = ofItems(target).filter(({ read }) => events.includes(read.event));
        if (due.length) await whisper(target, `<strong>${escape(target.name)}</strong>: ${escape(source)}'s ${context.type === "damage-roll" ? "damage" : "attack"} is aimed at you.`, due);
    }
    // (An ally's: each other character on the scene, the target one of its allies.)
    for (const token of canvas?.tokens?.placeables ?? []) {
        const actor = token.actor;
        if (actor?.type !== "character" || actor === target || !targetToken || token.document.disposition !== targetToken.document.disposition) continue;
        const distance = distanceBetween(token, targetToken);
        const due = ofItems(actor).filter(({ read }) => events.includes(read.event.replace(/^ally-/, "")) && read.event.startsWith("ally-") && (!read.within || (distance !== null && distance <= read.within)));
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${escape(source)}'s ${context.type === "damage-roll" ? "damage" : "attack"} is aimed at your ally ${escape(target.name)}.`, due);
    }
}

// The character's own action or spell (slice 8): when its message is posted, its reactions and free actions that trigger on using that
// action or casting that spell ("You use Orc Ferocity.", "You Shield Block …", "You Cast a Spell using a spell slot.").
export async function onOwnUse(message) {
    if (!game.settings.get(MODULE_ID, SETTING)) return;
    const origin = message.flags?.pf2e?.origin;
    // (Its use, not a later roll from it: a check or damage message has a context type.)
    if (!origin?.uuid || message.flags?.pf2e?.context?.type) return;
    const item = await fromUuid(origin.uuid).catch(() => null);
    const actor = item?.actor;
    if (actor?.type !== "character") return;
    const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].filter((each) => each !== item).map((each) => ({ item: each, read: ownUseTrigger(each) })).filter(({ read }) => usesTrigger(read, item.name, item.type));
    if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: you used ${escape(item.name)}.`, due);
}

// Another creature's spell (slice 8): each character on the scene whose disposition isn't the caster's, and its feats that trigger on a
// spell cast ("A creature Casts a Spell that you have prepared", Counterspell), in range when the trigger gives one.
export async function onForeignSpell(message) {
    if (!game.settings.get(MODULE_ID, SETTING)) return;
    const origin = message.flags?.pf2e?.origin;
    if (origin?.type !== "spell" || message.flags?.pf2e?.context?.type) return;
    const casterToken = message.token?.object ?? null;
    const caster = message.actor ?? casterToken?.actor ?? null;
    if (!caster) return;
    for (const token of canvas?.tokens?.placeables ?? []) {
        const actor = token.actor;
        if (actor?.type !== "character" || actor === caster || (casterToken && token.document.disposition === casterToken.document.disposition)) continue;
        const distance = casterToken ? distanceBetween(token, casterToken) : null;
        const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: eventTrigger(item) })).filter(({ read }) => read?.event === "foe-casts" && (!read.within || (distance !== null && distance <= read.within)));
        if (due.length) await whisper(actor, `<strong>${escape(actor.name)}</strong>: ${escape(caster.name)} casts a spell.`, due);
    }
}

// Before a save (slice 9): a hostile spell or ability whose card asks for a save, posted by the GM with characters targeted (the GM's
// own targets, on this client), whispers each of them its feats used before the save ("… but you haven't rolled yet").
export async function onSaveAsked(message) {
    if (!game.settings.get(MODULE_ID, SETTING) || !message.author?.isSelf || message.flags?.pf2e?.context?.type || !asksForSave(message.content)) return;
    const source = message.actor ?? message.token?.actor ?? null;
    if (!source || source.type === "character") return;
    for (const token of game.user.targets) {
        const actor = token.actor;
        if (actor?.type !== "character") continue;
        const due = [...actor.itemTypes.feat, ...actor.itemTypes.action].map((item) => ({ item, read: preRollTrigger(item) })).filter(({ read }) => read?.event === "pre-save");
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

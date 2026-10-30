// Reminders at a character's turn (2026-10-30, docs/feats.md, slice 6): its reactions and free actions whose trigger is its own turn
// starting or ending, whispered to its owners and the GM as that turn comes. Nothing is used for them; the player decides.

import { turnReminders } from "../src/compiler/turn-reminders.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const SETTING = "turnReminders";

export function registerReminderSetting() {
    game.settings.register(MODULE_ID, SETTING, {
        name: "Turn reminders for characters' feats",
        hint: "At the start or end of a character's turn, whisper its owners the reactions and free actions that trigger then (\"Your turn begins.\").",
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
    const due = turnReminders([...actor.itemTypes.feat, ...actor.itemTypes.action], when);
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

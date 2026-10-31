// Condition feats in play (src/plans/condition-feats.js): as a character's frightened or stupefied is gained or lowered, its feats' change on
// top, by the active GM, with a chat line. The module's own change is marked so it isn't changed again.

import { conditionAfter, conditionFeatsOf } from "../src/plans/condition-feats.js";
import { sourceOf } from "../src/rules/index.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const OURS = `${MODULE_ID}.condition`;
// (The value before, carried in the update's options: the client that changes it isn't always the GM's, and options reach every client.)
const BEFORE = `${MODULE_ID}.before`;
const valueOf = (item) => Number(item?.system?.value?.value ?? (item ? 1 : 0)) || 0;

async function settle(item, from, to) {
    const actor = item?.actor;
    if (!actor || actor.type !== "character" || !game.users.activeGM?.isSelf) return;
    const entries = conditionFeatsOf(actor.items, sourceOf);
    if (!entries.length) return;
    const change = conditionAfter(entries, item.slug, from, to);
    if (!change) return;
    if (change.value <= 0) await item.delete({ [OURS]: true });
    else await item.update({ "system.value.value": change.value }, { [OURS]: true });
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), whisper: ChatMessage.getWhisperRecipients("GM").map((user) => user.id), content: `<p><strong>${change.by.join(", ")}</strong>: ${actor.name}'s ${item.name.replace(/\s+\d+$/, "")} is ${change.value > 0 ? change.value : "gone"} instead of ${to}.</p>` });
}

export function registerConditionFeats() {
    Hooks.on("createItem", (item, options) => {
        if (item.type === "condition" && !options?.[OURS]) settle(item, 0, valueOf(item));
    });
    Hooks.on("preUpdateItem", (item, changes, options) => {
        if (item.type === "condition" && !options?.[OURS] && foundry.utils.hasProperty(changes, "system.value.value")) options[BEFORE] = valueOf(item);
    });
    Hooks.on("updateItem", (item, changes, options) => {
        if (item.type !== "condition" || options?.[OURS] || !Number.isFinite(options?.[BEFORE])) return;
        settle(item, options[BEFORE], valueOf(item));
    });
}

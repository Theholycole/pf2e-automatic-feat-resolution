import test from "node:test";
import assert from "node:assert/strict";
import { eventTrigger } from "../src/compiler/event-reminders.js";

const reaction = (trigger) => ({ type: "action", name: "Reaction", system: { actionType: { value: "reaction" }, description: { value: `<p><strong>Trigger</strong> ${trigger}</p>` } } });

test("champion's reactions: the enemy must be in range too (2026-11-21 playtest)", () => {
    const retributive = eventTrigger(reaction("An enemy damages your ally, and both are within 15 feet of you."));
    assert.deepEqual([retributive.event, retributive.within, retributive.foeWithin], ["ally-damaged", 15, 15]);
    const foeOnly = eventTrigger(reaction("An enemy within 15 feet damages your ally."));
    assert.deepEqual([foeOnly.within, foeOnly.foeWithin], [null, 15]);
    const allyOnly = eventTrigger(reaction("An ally within 30 feet is hit by an attack."));
    assert.deepEqual([allyOnly.event, allyOnly.within, allyOnly.foeWithin], ["ally-hit", 30, undefined]);
});

import test from "node:test";
import assert from "node:assert/strict";

import { timerEffect } from "../src/compiler/timer-effect.js";

const act = (html, type = "action") => ({ name: "Test", system: { actionType: { value: type }, actions: { value: 1 }, description: { value: html } } });

test("timer effect: yours, the target's, none", () => {
    const self = timerEffect(act("<p>Until the beginning of your next turn, you gain the @UUID[Compendium.pf2e.actionspf2e.Item.abcdefghijklmnop]{Absorb into the Aegis} reaction.</p>"));
    assert.equal(self.builtin, "feat-effect");
    assert.equal(self.who, undefined);
    assert.deepEqual(self.effect.rules, []);
    assert.equal(self.effect.duration.expiry, "turn-start");
    const target = timerEffect(act("<p>On a critical failure, the creature also becomes @UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{Off-Guard} until the end of your next turn.</p>"));
    assert.equal(target.who, "target");
    assert.equal(target.effect.duration.expiry, "turn-end");
    assert.equal(timerEffect(act("<p>The ally is then immune to Stand Firm for 1 minute.</p>")), null);
    assert.equal(timerEffect(act("<p>For 1 minute, you gain a lot.</p>", "passive")), null);
});

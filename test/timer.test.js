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
    const target = timerEffect(act("<p>The creature also becomes @UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{Off-Guard} until the end of your next turn.</p>"));
    assert.equal(target.who, "target");
    assert.equal(target.effect.duration.expiry, "turn-end");
    assert.equal(timerEffect(act("<p>The ally is then immune to Stand Firm for 1 minute.</p>")), null);
    assert.equal(timerEffect(act("<p>For 1 minute, you gain a lot.</p>", "passive")), null);
});

test("timer effect: none for an outcome's", () => {
    const act = (html) => ({ name: "Test", system: { actionType: { value: "action" }, description: { value: html } } });
    assert.equal(timerEffect(act("<p>On a critical failure, the creature also becomes Off-Guard until the end of your next turn.</p>")), null);
    assert.equal(timerEffect(act("<p>If this shot hits its target, the target becomes Off-Guard until the end of your next turn.</p>")), null);
});

test("timer effect: none when the feat links its own PF2e Effect", () => {
    const act = { name: "To War!", system: { actionType: { value: "action" }, description: { value: "<p>Allies gain @UUID[Compendium.pf2e.feat-effects.Item.3zNPch2pttYW2n1j]{Effect: To War!}. These benefits last until the end of your next turn.</p>" } } };
    assert.equal(timerEffect(act), null);
});

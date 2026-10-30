import test from "node:test";
import assert from "node:assert/strict";

import { BATCHES, compendiumUuid, rulesFor } from "../src/rules/index.js";
import { readRules, sentenceRules } from "../src/rules/read.js";

// The rule elements the module adds (docs/rules.md): only ones PF2e builds from data alone, that never write back to their own source.
const SAFE_KEYS = new Set(["FlatModifier", "AdjustModifier", "Resistance", "Immunity", "Weakness", "Sense", "BaseSpeed", "Note", "DamageDice", "AdjustDegreeOfSuccess", "RollOption"]);

test("every batch entry: a compendium item, rules PF2e builds from data alone", () => {
    const seen = new Set();
    for (const entry of BATCHES.flat()) {
        assert.match(entry.uuid, /^Compendium\.[\w-]+\.[\w-]+\.Item\.[A-Za-z0-9]{16}$/, entry.name);
        assert.ok(!seen.has(entry.uuid), `${entry.name} twice`);
        seen.add(entry.uuid);
        assert.ok(entry.rules.length, entry.name);
        for (const rule of entry.rules) {
            assert.ok(SAFE_KEYS.has(rule.key), `${entry.name}: ${rule.key}`);
            assert.ok(!(rule.key === "RollOption" && rule.toggleable), `${entry.name}: a toggle writes back to its source`);
        }
    }
});

test("PF2e's pack folders as its compendium names", () => {
    assert.equal(compendiumUuid("pf2e", "feats", "SCgqIo8VQZZKZ1Ws"), "Compendium.pf2e.feats-srd.Item.SCgqIo8VQZZKZ1Ws");
    assert.equal(compendiumUuid("pf2e", "heritages", "x".repeat(16)), `Compendium.pf2e.heritages.Item.${"x".repeat(16)}`);
    assert.equal(compendiumUuid("clerics-remaster", "clerics-features", "Rt6l4guHRNSJU6ia"), "Compendium.clerics-remaster.clerics-features.Item.Rt6l4guHRNSJU6ia");
});

test("an item's rules by its compendium source, less any it has already", () => {
    const orcSight = { sourceId: "Compendium.pf2e.feats-srd.Item.SCgqIo8VQZZKZ1Ws", system: { rules: [] } };
    assert.deepEqual(rulesFor(orcSight), [{ key: "Sense", selector: "darkvision" }]);
    assert.deepEqual(rulesFor({ _stats: { compendiumSource: orcSight.sourceId }, system: { rules: [] } }).length, 1, "Foundry's own source field");
    assert.deepEqual(rulesFor({ ...orcSight, system: { rules: [{ key: "Sense", selector: "darkvision" }] } }), [], "PF2e added it since");
    assert.deepEqual(rulesFor({ sourceId: "Compendium.pf2e.feats-srd.Item.nothingHere00000", system: { rules: [] } }), []);
});

test("senses and Speeds said outright; not under a condition, a form or a choice", () => {
    assert.deepEqual(sentenceRules("You gain darkvision, allowing you to see in darkness and dim light just as well as you can in bright light."), [{ key: "Sense", selector: "darkvision" }]);
    assert.deepEqual(sentenceRules("You gain low-light vision, or you gain darkvision if your ancestry already has low-light vision."), [{ key: "Sense", selector: "low-light-vision" }, { key: "Sense", predicate: ["self:low-light-vision:from-ancestry"], selector: "darkvision" }]);
    assert.deepEqual(sentenceRules("You gain imprecise scent with a range of 30 feet."), [{ key: "Sense", acuity: "imprecise", range: 30, selector: "scent" }]);
    assert.deepEqual(sentenceRules("You gain a swim Speed equal to your land Speed."), [{ key: "BaseSpeed", selector: "swim", value: "@actor.system.movement.speeds.land.value" }]);
    assert.equal(sentenceRules("While raging, you gain darkvision."), null);
    const passive = (html, rules = []) => ({ type: "feat", system: { actionType: { value: "passive" }, description: { value: html }, rules } });
    assert.deepEqual(readRules(passive("<p>You gain a fly Speed of 10 feet. You can remain in this form for up to 1 minute.</p>")), []);
    assert.deepEqual(readRules(passive("<p>Choose two of the following options. You gain a climb Speed equal to your land Speed.</p>")), []);
    assert.deepEqual(readRules(passive("<p>You gain a swim Speed of 15 feet.</p>", [{ key: "BaseSpeed", selector: "swim-speed", value: 15 }])), [], "PF2e's own, by either selector");
});

import test from "node:test";
import assert from "node:assert/strict";

import { GROWTH_FEATS, SPECIALIZATIONS, SPECIALIZED, STAGES, growthChoices, growthOf } from "../src/plans/companion-growth.js";

test("companion growth: every feat once, a known stage", () => {
    const seen = new Set();
    for (const each of GROWTH_FEATS) {
        assert.match(each.uuid, /^Compendium\.[\w-]+\.[\w-]+\.Item\.[A-Za-z0-9]{16}$/, each.name);
        assert.ok(!seen.has(each.uuid), each.name);
        seen.add(each.uuid);
        assert.ok(STAGES[each.stage], each.name);
    }
    assert.equal(GROWTH_FEATS.length, 31);
});

test("companion growth: the choices", () => {
    const mature = growthOf("Compendium.pf2e.feats-srd.Item.tpkJXDpSuGznfzGJ");
    assert.deepEqual(growthChoices(mature), STAGES.mature);
    assert.equal(growthChoices(growthOf("Compendium.pf2e.feats-srd.Item.U52NMdeSNbjSSRHE")).length, 2);
    const specialized = growthOf("Compendium.pf2e.feats-srd.Item.Fai5VMyrtOrYC5JL");
    assert.deepEqual(growthChoices(specialized, []), [SPECIALIZED]);
    const again = growthChoices(specialized, [SPECIALIZED, SPECIALIZATIONS[0]]);
    assert.equal(again.length, SPECIALIZATIONS.length - 1);
    assert.ok(!again.includes(SPECIALIZATIONS[0]));
    assert.ok(growthOf("Compendium.pf2e.feats-srd.Item.cTR67ZKDD1EKntXw").construct);
    assert.equal(growthOf("nope"), null);
});

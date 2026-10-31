import test from "node:test";
import assert from "node:assert/strict";
import { maneuverPenalty } from "../scripts/maneuver-map.js";

test("Agile Maneuvers: −4/−8 on maneuvers, −3/−6 with panache and an agile weapon (round 54)", () => {
    const feat = { _stats: { compendiumSource: "Compendium.pf2e.feats-srd.Item.Ba6SLqAghsZgqhua" } };
    const panache = { type: "effect", slug: "panache" };
    assert.equal(maneuverPenalty({ items: [] }, 1), null);
    assert.equal(maneuverPenalty({ items: [feat] }, 1), -4);
    assert.equal(maneuverPenalty({ items: [feat] }, 3), -8);
    assert.equal(maneuverPenalty({ items: [feat, panache] }, 2, { traits: new Set(["agile"]) }), -6);
    assert.equal(maneuverPenalty({ items: [feat, panache] }, 1), -4);
});

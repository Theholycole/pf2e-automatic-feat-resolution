import test from "node:test";
import assert from "node:assert/strict";

import { grantsIn } from "../src/plans/grants.js";

const feat = (html, rules = []) => ({ system: { description: { value: html }, rules } });

test("grants: whose and what", () => {
    assert.deepEqual(grantsIn(feat("<p>You gain the @UUID[Compendium.pf2e.spells-srd.Item.abcdefghijklmnop]{Magic Hide} warden spell. Increase the number of Focus Points…</p>")),
        [{ uuid: "Compendium.pf2e.spells-srd.Item.abcdefghijklmnop", who: "self", spell: true, kind: "warden spell" }]);
    const [shed] = grantsIn(feat("Your familiar gains the @UUID[Compendium.pf2e.actionspf2e.Item.abcdefghijklmnop] activity."));
    assert.equal(shed.who, "familiar");
    assert.equal(shed.spell, false);
    assert.equal(grantsIn(feat("You gain the @UUID[Compendium.pf2e.spells-srd.Item.Life Boost] hex, and your familiar learns @UUID[Compendium.pf2e.spells-srd.Item.Spirit Link].")).length, 1);
});

test("grants: none where PF2e grants it, or nothing is given", () => {
    assert.deepEqual(grantsIn(feat("You gain the @UUID[Compendium.pf2e.spells-srd.Item.x] focus spell.", [{ key: "GrantItem", uuid: "x" }])), []);
    assert.deepEqual(grantsIn(feat("You gain a +1 circumstance bonus.")), []);
    assert.deepEqual(grantsIn(feat("When you gain the @UUID[Compendium.pf2e.conditionitems.Item.x] condition, you can Step.")), []);
});

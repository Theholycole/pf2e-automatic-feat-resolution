import test from "node:test";
import assert from "node:assert/strict";
import { attackModifier } from "../src/plans/index.js";

test("an attack roll's modifier: the best spell attack, or the best Strike that fits (2026-10-31)", () => {
    const dcs = { spell: 24, attacks: { spell: 15, strikes: [{ group: "firearm", ranged: true, mod: 17 }, { group: "firearm", ranged: true, mod: 19 }, { group: "sword", ranged: false, mod: 21 }] } };
    assert.equal(attackModifier({ roll: "spell" }, dcs), 15);
    assert.equal(attackModifier({ roll: "spell" }, { spell: 24 }), 14);
    assert.equal(attackModifier({ roll: "strike", group: "firearm", ranged: true }, dcs), 19);
    assert.equal(attackModifier({ roll: "strike" }, dcs), 21);
    assert.equal(attackModifier({ roll: "strike", group: "bow" }, dcs), null);
});

test("a built attack: a weapon category's proficiency plus an ability plus a bonus (round 66, Spirit's Wrath)", () => {
    const dcs = { abilities: { str: 4 }, attacks: { proficiency: { martial: 12 } } };
    assert.equal(attackModifier({ roll: "built", proficiency: "martial", ability: "str", bonus: 2 }, dcs), 18);
    assert.equal(attackModifier({ roll: "built", proficiency: "advanced", ability: "str" }, dcs), null);
});

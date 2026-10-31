import test from "node:test";
import assert from "node:assert/strict";
import { eventOf, retaliationsFor, RETALIATIONS } from "../src/plans/retaliation.js";

const source = (item) => item.source;
const items = RETALIATIONS.map((entry) => ({ source: entry.uuid }));

test("damage back on a hit or a maneuver (round 57)", () => {
    const hit = eventOf({ type: "attack-roll", outcome: "success", options: ["item:melee", "item:category:unarmed"] });
    assert.deepEqual(retaliationsFor(items, source, [], hit, 5).map((each) => each.name), ["Inviolable", "Defensive Needles", "Poisonous Blood"]);
    assert.deepEqual(retaliationsFor(items, source, ["self:effect:stoked-flame-stance"], hit, 5).map((each) => each.name), ["Inviolable", "Inner Fire (Monk)", "Defensive Needles", "Poisonous Blood"]);
    const sword = eventOf({ type: "attack-roll", outcome: "criticalSuccess", options: ["item:melee"] });
    assert.deepEqual(retaliationsFor(items, source, ["self:trait:plant"], sword, 5).map((each) => each.name), ["Inviolable", "Pesh Skin"]);
    assert.equal(eventOf({ type: "attack-roll", outcome: "failure", options: [] }), null);
    const trip = eventOf({ type: "skill-check", outcome: "success", options: ["action:trip"] });
    assert.deepEqual(retaliationsFor(items, source, ["self:condition:persistent-damage:fire"], trip, 5).map((each) => each.name), ["Torch Goblin"]);
    assert.deepEqual(retaliationsFor(items, source, [], hit, 30).map((each) => each.name), ["Inviolable", "Poisonous Blood"]);
});

test("Blessed Blood: a fiend or undead's piercing or slashing melee hit", () => {
    const items = [{ uuid: "Compendium.pf2e.feats-srd.Item.BuaOQzmRNgIhGsfN" }];
    const source = (item) => item.uuid;
    const event = (options) => ({ kind: "hit", options: ["item:melee", ...options] });
    assert.deepEqual(retaliationsFor(items, source, [], event(["item:damage:type:piercing", "self:trait:undead"]), 5).map((each) => each.name), ["Blessed Blood (Nephilim)"]);
    assert.deepEqual(retaliationsFor(items, source, [], event(["item:damage:type:bludgeoning", "self:trait:undead"]), 5), []);
    assert.deepEqual(retaliationsFor(items, source, [], event(["item:damage:type:slashing", "self:trait:humanoid"]), 5), []);
});

test("Ambersoul: a penalty Effect for the weapon that hit", async () => {
    const { effectRules } = await import("../src/plans/retaliation.js");
    const entry = RETALIATIONS.find((each) => each.name === "Ambersoul");
    assert.deepEqual(effectRules(entry, ["item:melee", "item:slug:jaws"]), [{ key: "FlatModifier", selector: "attack-roll", type: "circumstance", value: -1, predicate: ["item:slug:jaws"] }]);
});

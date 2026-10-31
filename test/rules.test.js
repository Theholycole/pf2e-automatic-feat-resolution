import test from "node:test";
import assert from "node:assert/strict";

import { BATCHES, compendiumUuid, rulesFor } from "../src/rules/index.js";
import { readRules, sentenceRules, readNotes, readTriggerNotes } from "../src/rules/read.js";

// The rule elements the module adds (docs/rules.md): only ones PF2e builds from data alone, that never write back to their own source.
const SAFE_KEYS = new Set(["FlatModifier", "AdjustModifier", "Resistance", "Immunity", "Weakness", "Sense", "BaseSpeed", "Note", "DamageDice", "AdjustDegreeOfSuccess", "RollOption", "ActiveEffectLike", "EphemeralEffect", "CreatureSize", "ActorTraits", "ItemAlteration"]);

test("every batch entry: a compendium item, rules PF2e builds from data alone", () => {
    const seen = new Set();
    for (const entry of BATCHES.flat()) {
        assert.match(entry.uuid, /^Compendium\.[\w-]+\.[\w-]+\.Item\.[A-Za-z0-9]{16}$/, entry.name);
        assert.ok(!seen.has(entry.uuid), `${entry.name} twice`);
        seen.add(entry.uuid);
        const rules = typeof entry.rules === "function" ? entry.rules({ actor: { items: [] } }) : entry.rules;
        assert.ok(rules.length, entry.name);
        for (const rule of rules) {
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

test("a passive about an action's roll: a Note on that roll, with the degrees it names", () => {
    const passive = (html) => ({ type: "feat", system: { actionType: { value: "passive" }, description: { value: html }, rules: [] } });
    const [note] = readNotes(passive("<p>When you successfully @UUID[Compendium.pf2e.actionspf2e.Item.Shove]{Shove} a creature, increase the distance by 5 feet.</p>"));
    assert.deepEqual(note, { key: "Note", selector: "athletics", predicate: ["action:shove"], outcome: ["success", "criticalSuccess"], title: "{item|name}", text: "<p>When you successfully Shove a creature, increase the distance by 5 feet.</p>" });
    const both = readNotes(passive("<p>When you Steal or Palm an Object, you can do so to two objects at once.</p>"));
    assert.deepEqual(both.map((rule) => rule.predicate[0]), ["action:steal", "action:palm-an-object"]);
    assert.deepEqual(readNotes(passive("<p>When you Steal Spell, you keep it longer.</p>")), [], "another action whose name starts the same");
    assert.deepEqual(readNotes({ ...passive("<p>When you Demoralize, …</p>"), system: { actionType: { value: "action" }, description: { value: "<p>When you Demoralize, …</p>" }, rules: [] } }), [], "passives only");
});

test("a passive about a Strike's degree or initiative: a Note on the attack roll or initiative", () => {
    const passive = (html) => ({ type: "feat", system: { actionType: { value: "passive" }, description: { value: html }, rules: [] } });
    const [critical] = readNotes(passive("<p>Your critical hits unnerve your foes. When you critically hit an enemy and deal damage, the target is Frightened 1.</p>"));
    assert.equal(critical.selector, "strike-attack-roll");
    assert.deepEqual(critical.outcome, ["criticalSuccess"]);
    assert.equal(critical.text, "<p>When you critically hit an enemy and deal damage, the target is Frightened 1.</p>");
    const [initiative] = readNotes(passive("<p>When you roll initiative and can see a giant, you can Hunt Prey as a free action.</p>"));
    assert.equal(initiative.selector, "initiative");
    assert.equal(initiative.outcome, undefined);
});

test("a reaction triggered by the character's own roll: a note on that roll, for the degrees named", () => {
    const reaction = (trigger) => ({ type: "feat", system: { actionType: { value: "reaction" }, description: { value: `<p><strong>Trigger</strong> ${trigger}</p><hr /><p>You reroll.</p>` }, rules: [] } });
    const both = readTriggerNotes(reaction("You fail a Fortitude or Will save."));
    assert.deepEqual(both.map((rule) => [rule.selector, rule.outcome]), [["fortitude", ["failure", "criticalFailure"]], ["will", ["failure", "criticalFailure"]]]);
    assert.match(both[0].text, /You can use this reaction now/);
    assert.deepEqual(readTriggerNotes(reaction("You fail a skill check or saving throw.")).map((rule) => rule.selector), ["skill-check", "saving-throw"]);
    assert.deepEqual(readTriggerNotes(reaction("You succeed at a Demoralize check.")).map((rule) => rule.predicate), [["action:demoralize"]]);
    assert.equal(readTriggerNotes(reaction("You roll initiative."))[0].selector, "initiative");
    assert.deepEqual(readTriggerNotes(reaction("You attempt a saving throw against a magical effect, but you haven't rolled yet.")), [], "before the roll");
});

test("a master's feats' rules for its companion: PF2e's safe keys, labelled with the feat", async () => {
    const { COMPANION_RULES, companionRulesFrom } = await import("../src/rules/companion.js");
    for (const entry of COMPANION_RULES) for (const rule of entry.rules) assert.ok(SAFE_KEYS.has(rule.key), `${entry.name}: ${rule.key}`);
    const summoner = { items: [{ name: "Expanded Senses", sourceId: "Compendium.pf2e.feats-srd.Item.rPzEnABFjkbOARiB" }, { name: "Other", sourceId: "Compendium.pf2e.feats-srd.Item.nothingHere00000" }] };
    assert.deepEqual(companionRulesFrom(summoner).map((rule) => rule.selector), ["low-light-vision", "darkvision", "scent"]);
    assert.equal(companionRulesFrom(summoner)[2].range, 30);
    assert.deepEqual(companionRulesFrom(null), []);
});

test("Stargazer's Eyes: low-light vision, darkvision over an ancestry's low-light vision or when taken twice", () => {
    const uuid = "Compendium.pf2e.feats-srd.Item.5KXJkEs39y1gaPEm";
    const feat = (actor) => ({ sourceId: uuid, actor, system: { rules: [] } });
    const selectors = (item) => rulesFor(item).map((rule) => rule.selector);
    assert.deepEqual(selectors(feat({ items: [{ sourceId: uuid }], ancestry: { system: { vision: "normal" } } })), ["low-light-vision"]);
    assert.deepEqual(selectors(feat({ items: [{ sourceId: uuid }], ancestry: { system: { vision: "lowLightVision" } } })), ["low-light-vision", "darkvision"]);
    assert.deepEqual(selectors(feat({ items: [{ sourceId: uuid }, { sourceId: uuid }] })), ["low-light-vision", "darkvision"]);
});

test("Wandering Oasis: its own and an ally's within 60 feet; Land on Your Feet halves a fall", async () => {
    const { temperatureProtections, fallEases } = await import("../src/plans/environment.js");
    const oasis = { type: "feat", name: "Wandering Oasis", sourceId: "Compendium.pf2e.feats-srd.Item.BlfgmJHjDyTVGdPs" };
    const druid = { name: "Druid", items: [oasis], skills: { survival: { rank: 3 } } };
    const ally = { name: "Ally", items: [] };
    assert.deepEqual(temperatureProtections(druid, () => [])[0].counts, { "severe-cold": "normal", "severe-heat": "normal" });
    assert.equal(temperatureProtections(ally, () => [{ actor: druid, distance: 60 }])[0].source, "Wandering Oasis (Druid)");
    assert.deepEqual(temperatureProtections(ally, () => [{ actor: druid, distance: 65 }]), []);
    assert.equal(Object.keys(temperatureProtections(ally, () => [{ actor: { ...druid, skills: { survival: { rank: 4 } } }, distance: 30 }])[0].counts).length, 4);
    assert.deepEqual(temperatureProtections(druid, { temperature: "severe-cold", nearby: () => [] })[0].source, "Wandering Oasis", "the environment module's options");
    assert.doesNotThrow(() => temperatureProtections(ally, { temperature: "severe-cold" }), "no canvas: no allies");
    const feet = { type: "feat", name: "Land on Your Feet", sourceId: "Compendium.pf2e.ancestryfeatures.Item.sL1hHxrHdMNIZVAd" };
    assert.deepEqual(fallEases({ items: [feet] }), [{ halved: true, landsOnFeet: true, source: "Land on Your Feet" }]);
});

test("an animal companion while it prepares: its class, before its minion trait", async () => {
    const { isCompanion } = await import("../src/compiler/companion.js");
    assert.ok(isCompanion({ type: "character", traits: new Set(["animal"]), items: [{ type: "class", slug: "animal-companion", name: "Animal Companion" }] }));
    assert.ok(isCompanion({ type: "character", traits: new Set(["animal"]), items: [], flags: { "pf2e-automatic-feat-resolution": { master: "abc" } } }));
    assert.ok(!isCompanion({ type: "character", traits: new Set(["human"]), items: [{ type: "class", slug: "fighter", name: "Fighter" }] }));
});

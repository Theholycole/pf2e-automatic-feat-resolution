// Batch 7 (2026-10-30, docs/rules.md, Cole's choice "Passive bonuses as rule elements"): the passives that say a bonus or a proficiency
// outright, by hand in the shapes PF2e's own items use. The rest of the passives' bonuses hang on something PF2e can't see by itself
// (docs/rules.md, "Batch 7").

const upgrade = (path, value) => ({ key: "ActiveEffectLike", mode: "upgrade", path, value });
const concealObject = { key: "FlatModifier", predicate: ["action:conceal-an-object"], selector: "stealth", type: "circumstance", value: 2 };

export default [
    // "+2 circumstance bonus to Stealth checks to Conceal the Object" in it (the mirror's or the sheath's item).
    {"uuid":"Compendium.pf2e.feats-srd.Item.EIbppwlEu11ltC7n","name":"Reflective Pocket","rules":[concealObject]},
    {"uuid":"Compendium.pf2e.feats-srd.Item.2AeGnjk4EAqFDvK8","name":"Spirit Sheath","rules":[concealObject]},
];

// Batch 7 (2026-10-30, docs/rules.md, Cole's choice "Passive bonuses as rule elements"): the passives that say a bonus or a proficiency
// outright, by hand in the shapes PF2e's own items use. The rest of the passives' bonuses hang on something PF2e can't see by itself
// (docs/rules.md, "Batch 7").

const upgrade = (path, value) => ({ key: "ActiveEffectLike", mode: "upgrade", path, value });
const concealObject = { key: "FlatModifier", predicate: ["action:conceal-an-object"], selector: "stealth", type: "circumstance", value: 2 };

export default [
    // "You become a master in Perception." (PF2e's Second Decree (Secrets).)
    {"uuid":"Compendium.pf2e.feats-srd.Item.W7Rkw1L5QxHvgeUW","name":"Eagle Eye","rules":[upgrade("system.perception.rank", 3)]},
    // "You become an expert in the alchemist class DC." (PF2e's Brilliant Crafter, the inventor's.)
    {"uuid":"Compendium.pf2e.feats-srd.Item.f6k9lIrIS4SfnCnG","name":"Alchemical Power","rules":[upgrade("system.proficiencies.classDCs.alchemist.rank", 2)]},
    // "You become an expert in runesmith class DC."
    {"uuid":"Compendium.pf2e.feats-srd.Item.9uYVO7GkRJq4gZDb","name":"Runic Expertise","rules":[upgrade("system.proficiencies.classDCs.runesmith.rank", 2)]},
    // "You become an expert in kineticist class DC and impulse attack rolls." (PF2e's impulse attacks follow the kineticist class DC's rank.)
    {"uuid":"Compendium.pf2e.feats-srd.Item.DCjkgCbjIa4er09y","name":"Expert Kinetic Control","rules":[upgrade("system.proficiencies.classDCs.kineticist.rank", 2)]},
    // "You become a master in simple weapons and unarmed attacks." (PF2e's Martial Experience.)
    {"uuid":"Compendium.pf2e-team-plus-adventures.pf2e-misc.Item.4rJqche0yY1285qx","name":"Fourth Facet (Keeper)","rules":[upgrade("system.proficiencies.attacks.simple.rank", 3), upgrade("system.proficiencies.attacks.unarmed.rank", 3)]},
    {"uuid":"Compendium.pf2e-team-plus-adventures.pf2e-misc.Item.EUZRRLBq1YKelTbk","name":"Fourth Facet (Wanderer)","rules":[upgrade("system.proficiencies.attacks.simple.rank", 3), upgrade("system.proficiencies.attacks.unarmed.rank", 3)]},
    // "+2 circumstance bonus to Stealth checks to Conceal the Object" in it (the mirror's or the sheath's item).
    {"uuid":"Compendium.pf2e.feats-srd.Item.EIbppwlEu11ltC7n","name":"Reflective Pocket","rules":[concealObject]},
    {"uuid":"Compendium.pf2e.feats-srd.Item.2AeGnjk4EAqFDvK8","name":"Spirit Sheath","rules":[concealObject]},
];

// Batch 9 (2026-10-31, the loop): passives said outright that PF2e's rule elements can carry. Proficiency raises as "upgrade" (never
// lowering what the class already gives, so a class that raises it too changes nothing), two senses, and the off-guard of foes in difficult
// terrain: scripts/terrain.js gives a creature whose token stands in a region that's difficult terrain for its movement the roll option
// self:terrain:difficult (target:terrain:difficult, as a Strike's target), and an EphemeralEffect puts Off-Guard on that target for the roll.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const feature = (id) => `Compendium.pf2e.classfeatures.Item.${id}`;
const clerics = (id) => `Compendium.clerics-remaster.clerics-features.Item.${id}`;
const upgrade = (path, rank) => ({ key: "ActiveEffectLike", mode: "upgrade", path: `system.proficiencies.${path}.rank`, value: rank });
const OFF_GUARD = "Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg";
const offGuardIf = (...predicate) => ({ key: "EphemeralEffect", affects: "target", selectors: ["strike-attack-roll", "spell-attack-roll", "strike-damage", "attack-spell-damage"], predicate, uuid: OFF_GUARD });
const sense = (selector, acuity = null, range = null, predicate = null) => ({ key: "Sense", selector, ...(acuity ? { acuity } : {}), ...(range ? { range } : {}), ...(predicate ? { predicate } : {}) });

export default [
    { uuid: "Compendium.pf2e.classfeatures.Item.j2R64kwUgEJ1TudD", name: "Nature's Edge", rules: [offGuardIf("target:terrain:difficult")] },
    // (Not lizardfolk. Its second sentence, foes in water without a swim Speed, has no roll option yet.)
    { uuid: pf2e("FrzskqwNWexKY5BA"), name: "Terrain Advantage", rules: [offGuardIf("target:terrain:difficult", { not: "target:trait:lizardfolk" })] }
];

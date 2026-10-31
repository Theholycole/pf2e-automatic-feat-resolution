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
    { uuid: pf2e("XgUQ6Tm9LKxcZGHW"), name: "Knight in Shining Armor", rules: [upgrade("defenses.heavy", 2)] },
    { uuid: feature("2mVEzA3OtfLMBNRm"), name: "Unbreakable Expertise", rules: [upgrade("defenses.medium", 2), upgrade("defenses.heavy", 2)] },
    { uuid: feature("tgh1l7cWQtdpkJvC"), name: "Unbreakable Mastery", rules: [upgrade("defenses.medium", 3), upgrade("defenses.heavy", 3), upgrade("defenses.light", 2), upgrade("defenses.unarmored", 2)] },
    { uuid: feature("myvcir1LEkaVxOlE"), name: "Master Tricks", rules: [upgrade("attacks.simple", 3), upgrade("attacks.martial", 3), upgrade("attacks.unarmed", 3)] },
    { uuid: feature("D34mPo29r1J3DPaX"), name: "Second Doctrine (Warpriest)", rules: [upgrade("attacks.martial", 1)] },
    { uuid: clerics("BlvO3unU7e70Nfos"), name: "Fourth Doctrine (Armorclad)", rules: [upgrade("spellcasting", 2)] },
    { uuid: clerics("Qz8u5Q9AeyDlJq3E"), name: "Fourth Doctrine (Seeker)", rules: [upgrade("spellcasting", 2)] },
    { uuid: pf2e("kjRMXN95lQmIi2hP"), name: "Earthsense", rules: [sense("tremorsense", "imprecise", 30)] },
    // (Low-light vision; darkvision instead when its ancestry already sees in low light, or when it's taken a second time.)
    {
        uuid: pf2e("5KXJkEs39y1gaPEm"), name: "Stargazer's Eyes",
        rules: (item) => {
            const twice = [...(item?.actor?.items ?? [])].filter((each) => each.sourceId === pf2e("5KXJkEs39y1gaPEm") || each._stats?.compendiumSource === pf2e("5KXJkEs39y1gaPEm")).length > 1;
            const seesLow = item?.actor?.ancestry?.system?.vision === "lowLightVision";
            return [sense("low-light-vision"), ...(twice || seesLow ? [sense("darkvision")] : [])];
        }
    },
    { uuid: "Compendium.pf2e.classfeatures.Item.j2R64kwUgEJ1TudD", name: "Nature's Edge", rules: [offGuardIf("target:terrain:difficult")] },
    // (Not lizardfolk. Its second sentence, foes in water without a swim Speed, has no roll option yet.)
    { uuid: pf2e("FrzskqwNWexKY5BA"), name: "Terrain Advantage", rules: [offGuardIf("target:terrain:difficult", { not: "target:trait:lizardfolk" })] }
];

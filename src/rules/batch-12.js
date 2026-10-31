// Batch 12 (2026-10-31, the loop, the largest group first: passives in other words): proficiencies and senses said outright in a longer text.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const sense = (selector, acuity = null, range = null) => ({ key: "Sense", selector, ...(acuity ? { acuity } : {}), ...(range ? { range } : {}) });

export default [
    // (Expert in divine spell attacks and DCs: PF2e keeps one spellcasting proficiency, so all of the character's.)
    { uuid: pf2e("Bi4rdz48MgkSY7su"), name: "Crimson Oath Devotion", rules: [{ key: "ActiveEffectLike", mode: "upgrade", path: "system.proficiencies.spellcasting.rank", value: 2 }] },
    { uuid: "Compendium.pf2e.classfeatures.Item.flEx8eY0NinF9XZU", name: "Master Detective", rules: [{ key: "ActiveEffectLike", mode: "upgrade", path: "system.proficiencies.classDCs.investigator.rank", value: 3, predicate: ["class:investigator"] }] },
    // (Its tremorsense; "if you already have tremorsense, increase its range by 5 feet" is the GM's.)
    { uuid: pf2e("92fmK6O9y8Wf03P4"), name: "Terra Dragonblood", rules: [sense("tremorsense", "imprecise", 30)] },
    { uuid: pf2e("20Yax5lEqjftKBHZ"), name: "Vigilant Mask", rules: [sense("scent", "precise", 60)] },
    { uuid: pf2e("lkl5QaDb1mlSD7SC"), name: "Visual Fidelity", rules: [sense("darkvision"), sense("low-light-vision")] },
    { uuid: pf2e("krgoR0Ykqw59MDbg"), name: "Uncanny Awareness", rules: [sense("motion-sense", "imprecise", 30)] },
    { uuid: pf2e("G1BPXzTzrUE4IndV"), name: "Defy the Darkness", rules: [sense("greater-darkvision")] },
    { uuid: pf2e("iNrR4WOB1UO9iiNE"), name: "Lifesense", rules: [sense("lifesense", "imprecise", 10)] },
    { uuid: pf2e("3GjfoEl3lbmhLin5"), name: "Vestigial Magicsense", rules: [sense("magicsense", "vague", 30)] },
    { uuid: pf2e("DYc108IqRBP9N9W6"), name: "Soulsight (Bard)", rules: [sense("spiritsense", "imprecise", 60)] },
    { uuid: pf2e("YGBPIpHaOgCsa2qO"), name: "Soulsight (Sorcerer)", rules: [sense("spiritsense", "imprecise", 60)] },
    // (The module's nonlethal penalty, src/plans/nonlethal.js, not with a butterfly sword.)
    { uuid: pf2e("zMT3etCcdPdtAdOn"), name: "Butterfly's Kiss", rules: [{ key: "AdjustModifier", selector: "strike-attack-roll", slug: "nonlethal", suppress: true, predicate: ["item:base:butterfly-sword"] }] }
];

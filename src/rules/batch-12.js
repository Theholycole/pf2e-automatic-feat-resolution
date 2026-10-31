// Batch 12 (2026-10-31, the loop, the largest group first: passives in other words): proficiencies and senses said outright in a longer text.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const sense = (selector, acuity = null, range = null) => ({ key: "Sense", selector, ...(acuity ? { acuity } : {}), ...(range ? { range } : {}) });

export default [
    { uuid: pf2e("3GjfoEl3lbmhLin5"), name: "Vestigial Magicsense", rules: [sense("magicsense", "vague", 30)] },
    // (The module's nonlethal penalty, src/plans/nonlethal.js, not with a butterfly sword.)
    { uuid: pf2e("zMT3etCcdPdtAdOn"), name: "Butterfly's Kiss", rules: [{ key: "AdjustModifier", selector: "strike-attack-roll", slug: "nonlethal", suppress: true, predicate: ["item:base:butterfly-sword"] }] }
];

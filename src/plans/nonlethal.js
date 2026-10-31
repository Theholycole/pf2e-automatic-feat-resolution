// Nonlethal attacks with a lethal weapon (2026-10-31, Cole: "there isnt one native to pf2e specifically for nonlethal"): PF2e has no
// toggle or penalty for them, so the module's own Effect gives one. With it on, the character's weapons without the nonlethal trait are
// tagged nonlethal-by-choice and gain the trait, so their damage is nonlethal, and a Strike with a tagged weapon takes the -2 circumstance
// penalty, slug "nonlethal". Stage Fighting, Nonlethal Takedown and Protector of the Wilds suppress that slug (src/rules/batch-10.js).
// (The tag goes first: once the trait is on, "not item:trait:nonlethal" no longer tells which weapons were lethal.)

export const NONLETHAL_TAG = "nonlethal-by-choice";
export const NONLETHAL_SLUG = "nonlethal";

export const NONLETHAL_RULES = [
    { key: "ItemAlteration", itemType: "weapon", mode: "add", property: "other-tags", value: NONLETHAL_TAG, predicate: [{ not: "item:trait:nonlethal" }] },
    { key: "ItemAlteration", itemType: "weapon", mode: "add", property: "traits", value: "nonlethal" },
    { key: "FlatModifier", selector: "strike-attack-roll", type: "circumstance", value: -2, slug: NONLETHAL_SLUG, label: "Nonlethal attack", predicate: [`item:tag:${NONLETHAL_TAG}`] }
];

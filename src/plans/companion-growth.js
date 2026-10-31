// A master's feat that advances its companion (2026-10-31, the loop; research with pf2e-animal-companions 7.7.3): "Your animal companion
// becomes a mature animal companion". PF2e's feats carry no rules for it; the animal companions module's own items do (AC-Feats: Mature,
// Nimble, Savage, Indomitable, Specialized and the specializations; AC-Construct-Companions: Advanced, Incredible, Paragon Construct), and a
// GM drops them on the companion by hand. scripts/companion-growth.js puts the item on the master's companions as the feat is gained (the
// GM choosing where the feat gives a choice) and takes it off as the feat goes.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const clerics = (id) => `Compendium.clerics-remaster.clerics-feats.Item.${id}`;
const AC = (id) => `Compendium.pf2e-animal-companions.AC-Feats.Item.${id}`;
const CC = (id) => `Compendium.pf2e-animal-companions.AC-Construct-Companions.Item.${id}`;

export const STAGES = {
    mature: [AC("K3c8ztEUX27RHeZe")],
    "nimble-or-savage": [AC("89eT819I4MYWndcu"), AC("h262IUT47dLqZLFZ")],
    "indomitable-or-savage": [AC("u9dXZwKANlsC9MDM"), AC("h262IUT47dLqZLFZ")],
    specialized: [AC("alc3ET2e0J4TSbfD")],
    "construct-advanced": [CC("5v2Kj6Jh2YYGaSQq")],
    "construct-incredible": [CC("f9ydomcD8DnSEXYV")],
    "construct-paragon": [CC("B3XfI8hQKdr7WG4R")]
};
// (A second specialization, Specialized Companion taken again: the specialization alone.)
export const SPECIALIZED = AC("alc3ET2e0J4TSbfD");
export const SPECIALIZATIONS = ["wRzmLu4JR4A421So", "OUoQGBy9Gk3DSWWi", "Pa0h9IoePPvnEvUn", "wDiFVxRBktQVj7uI", "umbj0foct0eZ7Jcj", "wZXL6VgEK88BCF0C", "lm4QlSITABQKhx5K", "eoQnmkqWXaLwNQhG", "SiFB8P1upTvdhLpx", "c04kGEFIMMwsKCEP", "Sb8e7jIDTGghYvEk"].map(AC);

const entry = (uuid, name, stage) => ({ uuid, name, stage, construct: stage.startsWith("construct") });
export const GROWTH_FEATS = [
    entry(pf2e("tpkJXDpSuGznfzGJ"), "Mature Animal Companion (Ranger)", "mature"),
    entry(pf2e("yozSCfdLFHVBbTxj"), "Mature Animal Companion (Druid)", "mature"),
    entry(pf2e("uCElsebJ45ltmZMT"), "Mature Beastmaster Companion", "mature"),
    entry(pf2e("n3eOMWQd4kdR3A0l"), "Mature Trained Companion", "mature"),
    entry(pf2e("Nxke8WzifQafSa4I"), "Impressive Mount", "mature"),
    entry(pf2e("adWnAp41sCCx02Ap"), "Mature Dragon Companion", "mature"),
    entry(pf2e("opP9j7RP7JPyt8Zj"), "Mature Megafauna Companion", "mature"),
    entry(clerics("vlEffX9hbmegI3Ok"), "Chosen Animal", "mature"),
    entry(pf2e("U52NMdeSNbjSSRHE"), "Incredible Companion (Ranger)", "nimble-or-savage"),
    entry(pf2e("qgW8uHJXJGl3DKBS"), "Incredible Companion (Druid)", "nimble-or-savage"),
    entry(pf2e("aEws1NR19Lbu1Kio"), "Incredible Beastmaster Companion", "nimble-or-savage"),
    entry(pf2e("AYBfwGImT28lUdue"), "Incredible Mount", "nimble-or-savage"),
    entry(pf2e("OjGUJyeArTj5gZyG"), "Incredible Dragon Companion", "nimble-or-savage"),
    entry(pf2e("AvN95M5eVLLEu2qk"), "Splendid Companion", "nimble-or-savage"),
    entry(pf2e("ollJpDIYG2z8oSm1"), "Battle-Hardened Companion", "nimble-or-savage"),
    entry(clerics("sRMcbImRmiKpnDf0"), "Blessed Animal", "nimble-or-savage"),
    entry(pf2e("lUjWE40fjAjHecNQ"), "Incredible Megafauna Companion", "indomitable-or-savage"),
    entry(pf2e("Fai5VMyrtOrYC5JL"), "Specialized Companion (Ranger)", "specialized"),
    entry(pf2e("3r5rg0BCqSh5RBNS"), "Specialized Companion (Druid)", "specialized"),
    entry(pf2e("hdt3RHZljLrO49kq"), "Specialized Companion (Animal Trainer)", "specialized"),
    entry(pf2e("bki36RiEM5FR4aiT"), "Specialized Beastmaster Companion", "specialized"),
    entry(pf2e("9DECwTTiVpHJc4B6"), "Specialized Megafauna Companion", "specialized"),
    entry(pf2e("hH2utNrlunNjpkKF"), "Peerless Mascot Companion", "specialized"),
    entry(pf2e("uixN9wbfe0veOHRn"), "Auspicious Mount", "specialized"),
    entry(clerics("OFsB7oqjD8JOtifL"), "Sacred Avatar", "specialized"),
    entry(pf2e("cTR67ZKDD1EKntXw"), "Advanced Construct Companion", "construct-advanced"),
    entry(pf2e("yUZXOEGqqXKhkGNE"), "Advanced Reanimated Companion", "construct-advanced"),
    entry(pf2e("58LYCoLrCzG2Ll8b"), "Incredible Construct Companion", "construct-incredible"),
    entry(pf2e("xhFsHEsMTAvzwJhr"), "Incredible Reanimated Companion", "construct-incredible"),
    entry(pf2e("R5hdEbfKdIVAQs24"), "Paragon Companion", "construct-paragon"),
    entry(pf2e("UxurtbOOvCkngsKN"), "Paragon Reanimated Companion", "construct-paragon")
];

const BY_UUID = new Map(GROWTH_FEATS.map((each) => [each.uuid, each]));
export const growthOf = (sourceId) => BY_UUID.get(sourceId) ?? null;

// The items to choose from for a companion: its stage's; a specialization when it's specialized already. → [uuid], one = no choice.
export function growthChoices(growth, companionSources = []) {
    if (!growth) return [];
    if (growth.stage === "specialized" && companionSources.includes(SPECIALIZED)) return SPECIALIZATIONS.filter((uuid) => !companionSources.includes(uuid));
    return STAGES[growth.stage] ?? [];
}

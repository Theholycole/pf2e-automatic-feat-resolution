// Passives whose bonus holds only in a moment PF2e can't see, with no Effect of PF2e's for it (2026-10-30, Cole's choice "Toggle Effects
// from the chat card"; docs/rules.md, "Toggled Effects"). Each is the module's own Effect, its rules from the feat's text: posting the feat
// puts it on the character, posting it again takes it off. What the rules can't tell apart (which creature, which trap) is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const bonus = (selector, value, type = "circumstance", predicate) => ({ key: "FlatModifier", selector, type, value, ...(predicate ? { predicate } : {}) });
const ROUND = { value: 1, unit: "rounds", expiry: "turn-start", sustained: false };
const THIS_TURN = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    {
        uuid: pf2e("BqcAwmNjDlKEI84X"), name: "Shadow Master",
        toggle: { rules: [{ key: "Resistance", type: "all-damage", value: 5, exceptions: ["force", "ghost-touch"] }, { key: "RollTwice", selector: "reflex", keep: "higher" }] },
        notes: ["On while you're in dim light or darkness: post Shadow Master again when you leave it."]
    },
    {
        uuid: pf2e("6DkylvU5RF1O6DTT"), name: "Daredevil's Gambit",
        toggle: { rules: [bonus("ac", 2)], duration: ROUND },
        notes: ["While you share the target's space: it's off-guard to your attacks, and this ends early if it moves. A hit from any other creature pushes you out."]
    },
    {
        uuid: pf2e("MZgE2yonw4HUAyMk"), name: "The Harder They Fall (Hellknight)",
        toggle: { rules: [bonus("ac", 1), bonus("saving-throw", 1)], duration: ROUND },
        notes: ["Only against the Huge or larger creature you chose."]
    },
    {
        uuid: pf2e("9CIy4cJJTcRM30Vz"), name: "Tough Tumbler",
        toggle: { rules: [bonus("ac", 1)], duration: THIS_TURN },
        notes: ["Only against reactions you trigger by failing to Tumble Through."]
    },
    {
        uuid: pf2e("uYhaIKxlvGj4YNCc"), name: "Emboldened with Glorious Purpose",
        toggle: { rules: [bonus("will", 1, "status", [{ not: { or: ["item:trait:emotion", "item:trait:fear"] } }]), bonus("will", 2, "status", [{ or: ["item:trait:emotion", "item:trait:fear"] }])] },
        notes: ["Until your next daily preparations: post it again then. Your once-each rerolls (a Will save, an attack roll, the blessed skill's check) are yours to call."]
    },
    {
        uuid: pf2e("qUBr1YsQw3BSNy9c"), name: "Glyph Expert",
        toggle: { rules: [bonus("perception", 2), bonus("ac", 2), bonus("saving-throw", 2), bonus("thievery", 2)] },
        notes: ["Only to find magical traps, against their attacks and saves, and to Disable them: on while you deal with one. Against a trap of magical writing, a success on the save is a critical success and a critical failure a failure."]
    },
    {
        uuid: pf2e("HRVCODLOrhjRDtGb"), name: "Sure Foot",
        toggle: { rules: [bonus("acrobatics", 2), bonus("athletics", 2)] },
        notes: ["Only to move within your favored terrain (Balance, Climb, Swim, Fly …)."]
    },
    {
        uuid: pf2e("oSi9mUtYWYekxX0B"), name: "Able Ritualist",
        toggle: { rules: [bonus("skill-check", 2)] },
        notes: ["On for the primary and secondary checks of a ritual you're casting."]
    },
    {
        uuid: pf2e("yMj9WfPctWQC7be2"), name: "Thaumaturgic Ritualist",
        toggle: { rules: [bonus("skill-check", 2)] },
        notes: ["On for the primary checks of a ritual you're casting."]
    },
    {
        uuid: pf2e("JgM1DMPcceeHYhQ8"), name: "Harrow Ritualist",
        toggle: { rules: [bonus("skill-check", 2, "status")] },
        notes: ["On for the checks of a ritual you've worked harrow cards into."]
    },
    {
        uuid: pf2e("reoylyGMDPl7H6L5"), name: "Macabre Virtuoso",
        toggle: { rules: [bonus("skill-check", 2)] },
        notes: ["On for your primary check as primary caster of a create undead ritual."]
    },
    {
        uuid: pf2e("6VWLyjurMGi33XAT"), name: "Reading the Signs",
        toggle: { rules: [bonus("skill-check", 2, "status"), bonus("saving-throw", 2, "status", ["item:trait:divination"])] },
        notes: ["On for a skill check that draws cards or resolves a divination effect (a save against a hostile divination effect counts too)."]
    },
    {
        uuid: "Compendium.pf2e.classfeatures.Item.wYOdTCWQQ6ec8I6b", name: "Advanced Vials (Mutagenist)",
        toggle: { rules: [{ key: "Resistance", type: "physical", value: "floor(@actor.level/2)" }] },
        notes: ["On when you drink one of your field vials, for as long as its effect lasts."]
    }
];

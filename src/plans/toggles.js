// Passives whose bonus holds only in a moment PF2e can't see, with no Effect of PF2e's for it (2026-10-30, Cole's choice "Toggle Effects
// from the chat card"; docs/rules.md, "Toggled Effects"). Each is the module's own Effect, its rules from the feat's text: posting the feat
// puts it on the character, posting it again takes it off. What the rules can't tell apart (which creature, which trap) is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const bonus = (selector, value, type = "circumstance", predicate, slug) => ({ key: "FlatModifier", selector, type, value, ...(predicate ? { predicate } : {}), ...(slug ? { slug } : {}) });
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
        // (Two slugs: with one, the label's, the second replaced the first; 2026-10-30 Foundry test.)
        toggle: { rules: [bonus("will", 1, "status", [{ not: { or: ["item:trait:emotion", "item:trait:fear"] } }], "emboldened"), bonus("will", 2, "status", [{ or: ["item:trait:emotion", "item:trait:fear"] }], "emboldened-emotion")] },
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
    },
    // (2026-10-30, the loop: resistance 5, +5 at 10th level and every 4 levels after.)
    {
        uuid: pf2e("stsCnc8hR6db1Get"), name: "Kinetic Dampening",
        toggle: { rules: [{ key: "Resistance", type: "physical", value: "5 * floor((@actor.level - 2) / 4)" }], duration: ROUND },
        notes: ["Awakening: for an extra action, the creatures you choose within 15 feet get it too (by hand); or also resistance to fire, electricity or sonic, your choice."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-barbarians.items.Item.Ha4JUcgOaQRLarvk", name: "Unravel Into Runes",
        toggle: { rules: [{ key: "Resistance", type: "all-damage", value: "@actor.level" }], duration: { value: 4, unit: "rounds", expiry: "turn-start", sustained: false } },
        notes: ["You're incorporeal and can't make attacks (by hand). In an ally's space you can give it your runes' effects and a +4 status bonus to damage rolls; leaving its space, or it falling unconscious, ends this."]
    },
    {
        uuid: pf2e("3aUlLF4V2KW7Hga5"), name: "Born in the Saddle",
        // (Only with PF2e's Effect: Mounted on, whose -2 it softens; 2026-10-30 Foundry test.)
        toggle: { rules: [bonus("reflex", 1, "circumstance", ["self:effect:mounted"], "born-in-the-saddle")] },
        notes: ["Your -2 circumstance penalty to Reflex saves while mounted (PF2e's Effect: Mounted) is only -1. If your mount is knocked prone, see the feat."]
    },
    {
        uuid: pf2e("8pmd9gMl3TamFx3u"), name: "Deft Cooperation",
        toggle: { rules: [bonus("attack", 1, "circumstance", undefined, "deft-cooperation-attack"), bonus("ac", 1, "circumstance", undefined, "deft-cooperation-ac")], duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false } },
        notes: ["After you successfully Aid an ally's attack roll or AC: only against that enemy, until the end of your next turn."]
    },
    // Actions whose bonus goes on an ally, with no PF2e Effect for it (2026-10-31, the loop): who "target", the module's Effect on each of the
    // player's targets, its numbers the character's. Posting it again with the same target takes it off.
    {
        uuid: pf2e("ASWqQ6RB7cfCsUo0"), name: "Protect Ally",
        toggle: { who: "target", rules: [bonus("ac", 1, "circumstance", undefined, "protect-ally")], duration: ROUND },
        notes: ["On one adjacent ally, until the start of your next turn; it ends early once the ally isn't adjacent to you. Only one ally at a time."]
    },
    {
        uuid: pf2e("q4wFELOV4BQO4cDd"), name: "Transfusion",
        toggle: { who: "target", rules: [{ key: "FastHealing", value: 1 }], duration: { value: 5, unit: "rounds", expiry: "turn-start", sustained: false } },
        notes: ["Spend 5 sanguimancy Hit Points (by hand). Each 5 more raises the fast healing by 1, to 8 at most: edit the Effect's value."]
    },
    {
        uuid: pf2e("Fe5m807oeqJw3YUd"), name: "Bloom of Health",
        toggle: { who: "target", rules: [{ key: "FastHealing", value: "floor(@actor.level / 2)" }], duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false } },
        notes: ["On your knights who hear you: target them first."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-adventures.pf2e-items.Item.FVp2POzJHwBGZVi4", name: "Little Buddy",
        toggle: { who: "target", rules: [bonus("attack", 1, "status", undefined, "little-buddy-attack"), bonus("damage", 2, "status", undefined, "little-buddy-damage")] },
        notes: ["For the rest of the encounter: delete the Effect when it ends. The ally is then immune to Little Buddy for 1 day."]
    },
    {
        uuid: pf2e("YKPaD42aJf2C5V3B"), name: "Snap Falling Fruit",
        toggle: { who: "target", rules: [bonus("ac", 2, "circumstance", undefined, "snap-falling-fruit")], duration: THIS_TURN },
        notes: ["Only against the triggering physical ranged attack (target yourself if it's you): delete the Effect after it. If it misses, you knock it out of the air."]
    },
    {
        uuid: pf2e("G3NBWaItq6oLEJxx"), name: "Redirecting Draft",
        toggle: { who: "target", rules: [bonus("ac", 2, "circumstance", undefined, "redirecting-draft")], duration: THIS_TURN },
        notes: ["Only against the triggering ranged physical Strike (target yourself if it's you): delete the Effect after it."]
    }
];

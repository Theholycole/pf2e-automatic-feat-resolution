// Attack rolls against a defense (2026-10-31, Cole's call "build the new card types first"): a spell attack or a weapon's attack roll
// against a creature's AC or a save DC, as a check card at the character's own attack modifier, its results by degree. attack.roll:
// "spell" (the character's best spell attack modifier) or "strike" (its best Strike that fits: group, ranged or melee). The modifier is
// the attack's as the sheet shows it, without the multiple attack penalty or a bonus only to one roll.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

export default [
    {
        uuid: "Compendium.pf2e-team-plus-oracles-remastered.items.Item.jZ3J2KttgssjnODb", name: "Rainbow Beam",
        attack: { roll: "spell", against: "ac", target: "1 enemy", range: "30 feet",
            outcomes: { success: { damage: "(@actor.level)d4[fire]" }, criticalSuccess: { damage: "2*((@actor.level)d4)[fire]" } } },
        notes: ["Then roll [[/r 1d8 #Rainbow Beam color]] for the color's extra effect on a hit (see the feat's table)."]
    },
    {
        uuid: pf2e("skPVYOSDj7oC6PSX"), name: "Bleed Out",
        attack: { roll: "spell", against: "ac", target: "1 creature", range: "60 feet", ranged: true },
        notes: ["On a hit: persistent bleed damage equal to the rank of the spell you just cast (double on a critical hit). Give it from the condition by hand."]
    },
    {
        uuid: pf2e("dtPXuS8MiWrz5UNK"), name: "Hot Foot",
        attack: { roll: "strike", group: "firearm", ranged: true, against: "reflex", target: "1 creature", range: "your firearm's first range increment",
            outcomes: {
                criticalSuccess: { nativeEffects: [{ uuid: "Compendium.pf2e.feat-effects.Item.Effect: Hot Foot (Critical Success)", label: "Effect: Hot Foot (Critical Success)" }] },
                success: {} } },
        notes: ["On a success it can't use reactions until the start of its next turn; on a critical success it's also off-guard and takes a –2 circumstance penalty to Reflex saves (the Effect)."]
    }
];

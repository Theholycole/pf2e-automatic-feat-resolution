// The combat feats no reader or hand plan covered, from the simulator's feat gap index, batch 2 (2026-11-04, Cole: "Prioritize the combat
// passives and actions in the feat module and simulator module"): a passive's rider after a critical hit or a maneuver, as its own card
// (post it after the roll, as gaps-1.js's riders); a save the text says in a way the reader leaves; a toggled resistance.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const ROUND_END = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    // A critical hit's rider.
    {
        uuid: pf2e("DYUlMxh7TDgEh9xB"), name: "Brutal Beating",
        affect: { target: "the creature your Strike critically hit", effects: [{ slug: "frightened", value: 1 }] },
        notes: ["Only when the critical hit dealt damage."]
    },
    {
        uuid: pf2e("4f65nrWVzTG8Njj8"), name: "Unbalancing Blow",
        affect: { target: "the creature your Strike critically hit", effects: [{ slug: "off-guard", duration: rounds(1, "turn-end") }] },
        notes: ["Only when the critical hit dealt damage. It's off-guard against your attacks only, until the end of your next turn."]
    },
    {
        uuid: pf2e("ulrGnvF0KAgEaifX"), name: "Cornered Fury",
        affect: { target: "the larger foe that critically hit and damaged you", effects: [{ slug: "off-guard", duration: rounds(1) }] },
        notes: ["It's off-guard to you only, for 1 round."]
    },
    // A maneuver's rider.
    {
        uuid: pf2e("qnMdgukNGmLWtSbZ"), name: "The Harder They Fall (Kingmaker)", activity: true,
        text: "<p>The creature you successfully Tripped takes @Damage[1d8[bludgeoning]] damage.</p>",
        notes: ["Only a foe larger than you. 2d8 on a critical success. If you're a master in Athletics, 2d8, or 4d8 on a critical success."]
    },
    // At the start of your turn.
    {
        uuid: pf2e("p0ghAUQYzymGVpot"), name: "Nature Prowler",
        affect: { target: "your hunted prey", effects: [{ slug: "off-guard", duration: rounds(0, "turn-end") }] },
        notes: ["Post it at the start of your turn when you begin it hidden from or unnoticed by your hunted prey: it's off-guard to you only, until the end of your turn."]
    },
    // Saves.
    {
        uuid: pf2e("eRSgUQLhGWhICwpT"), name: "Siren Song",
        text: `<p>Each creature in a @Template[emanation|distance:60] attempts a @Check[will|against:performance] save against your Performance DC.</p><hr /><p><strong>Critical Success</strong> The target is unaffected.</p><p><strong>Success</strong> The target is @UUID[Compendium.pf2e.conditionitems.Item.Fascinated]{Fascinated}.</p><p><strong>Failure</strong> The target is @UUID[Compendium.pf2e.conditionitems.Item.Fascinated]{Fascinated} and @UUID[Compendium.pf2e.conditionitems.Item.Stupefied]{Stupefied 1}.</p><p><strong>Critical Failure</strong> The target is @UUID[Compendium.pf2e.conditionitems.Item.Fascinated]{Fascinated} and @UUID[Compendium.pf2e.conditionitems.Item.Stupefied]{Stupefied 2}.</p>`,
        notes: ["Fascinated with you until the end of your next turn; stupefied as long as it's fascinated. A critical success makes it immune for 24 hours. Sustain: each creature still affected saves again. Your party is usually immune."]
    },
    {
        uuid: pf2e("WY7CjISdz6uwXwIb"), name: "Collateral Thrash", activity: true, target: "another enemy adjacent to the creature you Thrash",
        text: `<p>The other enemy takes @Damage[(@actor.abilities.str.mod)[bludgeoning]] bludgeoning damage with a @Check[reflex|against:barbarian|basic] save against your class DC.</p>`,
        notes: ["Post it with Thrash. Add your weapon specialization damage and your Rage damage to the card's damage, as Thrash's."]
    },
    // A resistance for the turn.
    {
        uuid: pf2e("MRMW0EiuOO20pzG2"), name: "Ongoing Selfishness",
        toggle: { rules: [{ key: "Resistance", type: "all-damage", value: "floor((2 + floor(@actor.level / 2)) / 2)" }], duration: ROUND_END },
        notes: ["After you use Selfish Shield: only against the triggering enemy's damage, until the end of that turn."]
    }
];

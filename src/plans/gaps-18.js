// One-off combat feats, batch 18 (2026-11-05, Cole: "Grind everything"): conditions and temporary Hit Points the module only had as a
// reminder timer — on you (Cautious Word's slowed, Metabolize Element's quickened, Exsanguinate's and Absorb Strength's temporary Hit
// Points), on a foe (Lethal Edge, Dazzling Dragonet Disappearance, Tragic Lament's save) or about you (Mystical Flare).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const MINUTE = { mode: "fixed", value: 1, unit: "minutes", expiry: "turn-start", anchor: "effect-start" };
const slowed1 = "@UUID[Compendium.pf2e.conditionitems.Item.xYTAsEpcJE1Ccni3]{Slowed 1}";

export default [
    { uuid: pf2e("2i6sEZ4rQm1Pd5nD"), name: "Cautious Word", affect: { target: "you", effects: [{ slug: "slowed", value: 1, duration: rounds(1) }] }, notes: ["You also cast shield again (its +1 circumstance bonus to AC applies to the triggering Strike): use your shield spell's Effect."] },
    { uuid: pf2e("URtcR1BU2OgfKHfm"), name: "Metabolize Element", affect: { target: "you", effects: [{ slug: "quickened", duration: rounds(1, "turn-end") }] }, notes: ["The extra action only to Step or Stride."] },
    { uuid: pf2e("d7qKSoYixczsD5nL"), name: "Exsanguinate", affect: { target: "you", effects: [{ kind: "temp-hp", formula: "floor(@actor.level/2)", duration: rounds(1, "turn-end") }] }, notes: ["Sanguimancy Hit Points, only after a piercing or slashing hit (or a failed save) on a creature within 10 feet that can bleed."] },
    { uuid: pf2e("iFSy6WtIUUKSYP2C"), name: "Absorb Strength", affect: { target: "you", effects: [{ kind: "temp-hp", formula: "@actor.level", duration: MINUTE }] }, notes: ["Temporary Hit Points equal to the dead enemy's level: the card uses yours, so edit them if it was lower or higher."] },
    { uuid: pf2e("Xz9jmwwJnx17PjCu"), name: "Lethal Edge", affect: { target: "the frightened creature your spectral dagger hit", effects: [{ slug: "enfeebled", value: 1, duration: rounds(1, "turn-end") }] }, notes: ["Or instead the target can't use reactions until the end of your next turn: then remove the enfeebled."] },
    { uuid: pf2e("zeXHH7xFOOFXH9gB"), name: "Dazzling Dragonet Disappearance", affect: { target: "the adjacent enemy that hit you", effects: [{ slug: "dazzled", duration: rounds(1) }] }, notes: ["You're also affected by a 4th-rank invisibility: put its Spell Effect on yourself."] },
    { uuid: pf2e("pkfa1pc72gOeyO4c"), name: "Mystical Flare", affect: { target: "each creature in your spellsurge aura", effects: [{ slug: "concealed", duration: rounds(1, "turn-end") }] }, notes: ["Creatures outside the aura are also concealed to those inside it; you ignore this concealment. Sustain once a round for another round."] },
    {
        uuid: pf2e("qq7QHfysWzBn4z36"), name: "Tragic Lament", target: "the creature whose Strike critically hit you",
        text: `<p>The target attempts a @Check[will|against:class] save against your class DC.</p><hr /><p><strong>Critical Success</strong> The target is unaffected.</p><p><strong>Success</strong> The target is unaffected.</p><p><strong>Failure</strong> The target is ${slowed1} for 1 round.</p><p><strong>Critical Failure</strong> The target is ${slowed1} for 1 round.</p>`,
        notes: ["The triggering Strike deals normal damage, not critical damage (other critical hit effects still happen): roll its damage as a hit."]
    }
];

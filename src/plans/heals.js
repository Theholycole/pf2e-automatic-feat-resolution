// Healing and temporary Hit Points said around a choice or a cost, rewritten by hand (2026-10-30, the loop): the heal on the card, the
// choice or cost a note. Areas are affect entries: the card finds the creatures itself (src/compiler/area-targets.js).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });

export default [
    {
        uuid: pf2e("03mVGvudDLyGEpTZ"), name: "Spirit's Absolution",
        text: "<p>You or an adjacent ally regains @Damage[(@actor.level)d4[healing,vitality]] Hit Points.</p>",
        notes: ["For a spirit wisp. For a spirit remnant instead: 1d6 Hit Points per level of the incorporeal undead or haunt it came from, by hand."]
    },
    {
        uuid: pf2e("ffLzfZIq7LoNXqWO"), name: "Floral Restoration",
        text: "<p>You regain @Damage[(ceil(@item.level/2))d8[healing]] Hit Points.</p>",
        notes: ["You also regain 1 Focus Point. Only among 15 by 15 feet of healthy plant life, and those plants can't be used for it again for 24 hours."]
    },
    {
        uuid: pf2e("icSHA9Bx0SfIuqRo"), name: "Vital Compound Invocation",
        text: "<p>One creature within 30 feet regains @Damage[((@actor.level*2)+5)[healing]] Hit Points.</p>",
        notes: ["After you Invoke the two runes (one divine, one primal), each with its own effect; the creature must be within 30 feet of both."]
    },
    {
        uuid: action("8UJaVPsT5FA8XH87"), name: "Instant Recovery",
        text: "<p>You regain @Damage[(max(1,@actor.abilities.con.mod)*@actor.level)[healing]] Hit Points.</p>",
        notes: ["Spend a Mythic Point. Also remove the fatigued condition, and attempt a save at mythic proficiency against each recurring affliction (it can only lower the stage)."]
    },
    {
        uuid: pf2e("KGxGE0yv69ND2hct"), name: "Waters of Creation",
        affect: { target: "each creature within 15 feet", effects: [{ kind: "heal", formula: "(floor(@actor.level/2))d6" }] },
        notes: ["At Cursebound 3, d8s instead of d6s, by hand."]
    },
    {
        uuid: pf2e("xEeCaJsQeDtRAVk1"), name: "Plant Banner",
        affect: { target: "each ally within 30 feet", effects: [{ kind: "temp-hp", formula: "4*(1+floor(@actor.level/4))", duration: rounds(1) }] },
        notes: ["Renewed for another round each time an ally starts its turn in the burst. Apply PF2e's Effect: Plant Banner from the feat for the banner's other rules."]
    },
    // (Round 51.)
    {
        uuid: pf2e("Ofk2WfHbj3nWRhJy"), name: "Healer's Halo",
        affect: { target: "1 creature within 30 feet", effects: [{ kind: "heal", formula: "1d6" }] },
        notes: ["Only while your Halo is active, on a creature that just recovered Hit Points from a positive healing effect. It's then immune for 10 minutes."]
    },
    {
        uuid: pf2e("bebyS7XJ1Z3S4Ud1"), name: "Life's Blood",
        affect: { target: "1 willing living creature adjacent to you", effects: [{ kind: "heal", formula: "(max(3,floor((@actor.level-4)/2)))d6" }] },
        notes: ["You lose the same number of Hit Points the target regains: take it off yourself by hand (it can't be resisted or prevented). The target is then immune for 24 hours."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-tian-xia.player-options.Item.We9abqydQAV3UOes", name: "Natural Remedy",
        affect: { target: "the creature you healed", effects: [{ kind: "heal", formula: "floor(@actor.level/2)" }] },
        notes: ["Use it as you restore Hit Points to a creature: it regains half your level more."]
    },
    // (Round 69: heals from a 10-minute rest, posted when the rest ends.)
    {
        uuid: pf2e("zpQEOqMDoujexNfA"), name: "Replenishing Hydration",
        text: "<p>You regain @Damage[(max(1,floor(@actor.level/2)*@actor.abilities.con.mod))[healing]] Hit Points.</p>",
        activity: true, notes: ["After resting 10 minutes submerged in water."]
    },
    {
        uuid: pf2e("7vUOlVqjheZV0Nmc"), name: "Vivacious Conduit",
        text: "<p>You regain @Damage[(max(1,floor(@actor.level/2)*@actor.abilities.con.mod))[healing]] Hit Points.</p>",
        activity: true, notes: ["After resting 10 minutes."]
    },
    {
        uuid: pf2e("LrPfGV6snjCrZ4h2"), name: "Nodal Healing",
        text: "<p>You regain @Damage[(max(1,floor(@actor.level/2)*@actor.abilities.con.mod))[healing]] Hit Points.</p>",
        activity: true, notes: ["After resting 10 minutes."]
    },
    {
        uuid: "Compendium.pf2e.ancestryfeatures.Item.BgHrucbZ9TH92RDv", name: "Sunlight Healing",
        text: "<p>You regain @Damage[(max(1,ceil(@actor.level/2)))d8[healing]] Hit Points.</p>",
        activity: true, notes: ["After 10 minutes meditating in direct sunlight. Then you're immune to it for 1 day."]
    }
];

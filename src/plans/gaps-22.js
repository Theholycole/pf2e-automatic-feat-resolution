// One-off combat feats, batch 22 (2026-11-05, Cole: "Grind everything"): a sanguimancer's needle burst, a runesmith's penalty to saves
// against its invocations, a touch that drains an emotion.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });

export default [
    {
        // (Its damage is twice the sanguimancy Hit Points spent: the card rolls the minimum, 3 spent.)
        uuid: pf2e("KgyJw7fmcUWymYyb"), name: "Venipuncture", target: "each creature in a 30-foot emanation about you",
        text: "<p>Each creature in a @Template[type:emanation|distance:30] takes @Damage[6[piercing]] damage with a @Check[reflex|against:class-spell|basic] save.</p>",
        notes: ["The damage is twice the sanguimancy Hit Points you spend (all you have left, at least 3; at most 80 damage): the card shows the minimum, so edit the damage to twice what you spent."]
    },
    {
        uuid: pf2e("SCIczsxMTcwD5I4e"), name: "Edifying Trace",
        toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: -1 }], duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false } },
        notes: ["Trace a Rune onto the adjacent enemy, then Recall Knowledge about it: only on a success, put this Effect on it. The −1 is only to saves against your invocations. Using it on another enemy ends it for this one."]
    },
    {
        uuid: pf2e("ZvrzK8NM390k139E"), name: "Drain Emotion", affect: { target: "you", effects: [{ kind: "temp-hp", formula: "@actor.level", duration: rounds(1) }] },
        notes: ["Only if your counteract check against an emotion or fear effect on the touched creature succeeds. The temporary Hit Points last rounds equal to your Charisma modifier (at least 1): extend the Effect."]
    }
];

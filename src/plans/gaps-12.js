// Combat passives no reader or hand plan covered, from the simulator's feat gap index, batch 12 (2026-11-04, Cole: "keep going"): a
// poison's persistent fire, a gunslinger's off-guard opening shot, an alchemist's mega bomb.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });

export default [
    {
        uuid: pf2e("Pcv6IF8V1yT9tYrN"), name: "Combustible Poison", activity: true, target: "the creature that failed its initial save against your poison",
        text: "<p>The target takes @Damage[1d4[persistent,fire]] damage.</p>",
        notes: ["A creature already taking persistent fire damage instead takes a –1 circumstance penalty to its initial save against the poison."]
    },
    {
        uuid: pf2e("aviDW7htxA77iarV"), name: "Hair Trigger",
        affect: { target: "the creature your initial deed's Strike hit", effects: [{ slug: "off-guard", value: null, duration: rounds(0, "turn-end") }] },
        notes: ["Until the end of your first turn of the encounter."]
    },
    {
        uuid: pf2e("mMMIHLVSr8fyvVQL"), name: "Mega Bomb", activity: true,
        text: "<p>Each creature in a @Template[burst|distance:30] takes @Damage[4d8[fire]] damage with a @Check[reflex|against:alchemist|basic] save.</p>",
        notes: ["Within 60 feet; a 2-action throw, not a Strike. The card rolls a major alchemist's fire: use your own bomb's dice and type. On a failed save, a creature also takes the bomb's primary-target extras (like bottled lightning's off-guard)."]
    }
];

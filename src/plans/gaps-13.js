// Combat passives no reader or hand plan covered, from the simulator's feat gap index, batch 13 (2026-11-04, Cole: "keep going"):
// archetype riders — a horde's off-guard, a grab's divine throttle, an illusion's barbs.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });

export default [
    {
        uuid: pf2e("lJxoW6ser5naDGqf"), name: "Grasping Corpses",
        affect: { target: "a creature your horde's Mobbing Assault damaged", effects: [{ slug: "off-guard", value: null, duration: rounds(1) }] },
        notes: ["Until the beginning of your next turn."]
    },
    {
        uuid: pf2e("vU2wlSpnBTZK72MB"), name: "Throttle the Divine", activity: true, target: "the creature you have grabbed",
        text: "<p>The target takes @Damage[(2d6 + @actor.abilities.str.mod)[bludgeoning]] damage.</p>",
        notes: ["Each time it attempts a divine manipulate action while you have it grabbed; it also rolls that action's flat check twice and takes the worse."]
    },
    {
        uuid: pf2e("Ud1OVw0NcqvA0Jy4"), name: "And Yet it Still Hurts", activity: true, target: "the creature that tried to disbelieve your illusion",
        text: "<p>The target takes @Damage[(2*ceil(@actor.level/2))[mental]] damage.</p>",
        notes: ["Nonlethal, whatever the outcome. Twice the illusion spell's rank: the card takes your highest rank."]
    }
];

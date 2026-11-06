// Combat passives no reader or hand plan covered, from the simulator's feat gap index, batch 11 (2026-11-04, Cole: "keep going"): a
// vishkanya's blood restorative, off-guard after a swarm's bites.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });

export default [
    {
        uuid: pf2e("a3eKpbAQnxGrlnGq"), name: "Restoring Blood", activity: true, target: "you or an adjacent creature that drinks the restorative",
        text: "<p>The target regains @Damage[(ternary(gte(@actor.level,15),5,3))d6[healing]] Hit Points.</p>",
        notes: ["From your Envenom, at most once per 10 minutes; drinking it is an Interact. It spoils at the start of your next turn."]
    },
    {
        uuid: pf2e("yLZWUZHI5SHfwL7E"), name: "Distracting Bites",
        affect: { target: "a creature your swarm's Bite and Sting damaged", effects: [{ slug: "off-guard", value: null, duration: rounds(0, "turn-end") }] },
        notes: ["Only against the first Strike you make against it this turn: remove it after that Strike."]
    }
];

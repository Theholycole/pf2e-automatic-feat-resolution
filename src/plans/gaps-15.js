// Combat actions no reader or hand plan covered, from the simulator's feat gap index, batch 15 (2026-11-04, Cole: "Keep working on feats
// for the feat and simulator modules"): a psychic's Recall Knowledge bonus. (Battle Assessment and Combat Reading: their own card,
// scripts/assessment.js.)

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const NEXT_TURN = { value: 1, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    {
        uuid: pf2e("KNhmeUpZCSW5eHqg"), name: "Scour the Library",
        toggle: { rules: [{ key: "FlatModifier", selector: "attack-roll", type: "circumstance", value: 1 }, { key: "FlatModifier", selector: "ac", type: "circumstance", value: 1 }], duration: NEXT_TURN },
        notes: ["After a successful Recall Knowledge about a creature within 60 feet: only for your next attack roll against it and your AC against its next attack (remove the Effect after those). +2 on a critical success: edit the Effect."]
    }
];

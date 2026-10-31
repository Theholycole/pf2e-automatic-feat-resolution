// Batch 14 (2026-10-31, round 53; Cole's scope "feats that change a card we already play"): a feat that changes a basic action, as the rule
// PF2e reads for that action's roll.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

export default [
    // (Agile Maneuvers is scripts/maneuver-map.js: PF2e reads no MultipleAttackPenalty rule for maneuvers; round 54 Foundry test.)
    { uuid: pf2e("xOMwuKCf02aFzyp3"), name: "Paragon Battle Medicine", rules: [
        { key: "Note", selector: "medicine", predicate: ["action:battle-medicine"], outcome: ["success", "criticalSuccess"], title: "{item|name}", text: "<p>You can also reduce the target's sickened, enfeebled or clumsy condition by 1 (not one an effect keeps applying, like enlarge). Legendary in Medicine: frightened or stunned instead.</p>" }] }
];

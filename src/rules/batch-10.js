// Batch 10 (2026-10-31, the loop): penalties a feat says it ignores, as PF2e's AdjustModifier suppressing that modifier by its slug. The
// slugs (nonlethal, improvised, prone) are PF2e's own for the modifiers it adds; a Foundry test confirms each.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const suppress = (selector, slug, predicate = null) => ({ key: "AdjustModifier", selector, slug, suppress: true, ...(predicate ? { predicate } : {}) });

export default [
    { uuid: pf2e("1wTXeBrYU6BVEEOn"), name: "Stage Fighting", rules: [suppress("strike-attack-roll", "nonlethal")] },
    { uuid: pf2e("k5C1WNuYQ4u7nSHt"), name: "Nonlethal Takedown", rules: [suppress("strike-attack-roll", "nonlethal")] },
    { uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.XbYAgEhGa0ocdGi1", name: "Protector of the Wilds", rules: [suppress("strike-attack-roll", "nonlethal", [{ or: ["target:trait:animal", "target:trait:beast", "target:trait:plant", "target:trait:fungus"] }])] },
    { uuid: pf2e("KQVE4FsDd9RFpWRz"), name: "Improvisational Defender", rules: [suppress("strike-attack-roll", "improvised")] },
    // (Its Trip bonus is PF2e's own already; this is the prone penalty to its attack rolls.)
    { uuid: pf2e("ifiaewasPbc091BQ"), name: "Ankle Biter", rules: [suppress("attack-roll", "prone", ["self:condition:prone"])] }
];

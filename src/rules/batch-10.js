// Batch 10 (2026-10-31, the loop): penalties a feat says it ignores, as PF2e's AdjustModifier suppressing that modifier by its slug. The
// slugs (improvised, prone) are PF2e's own for the modifiers it adds (round 34). PF2e 8.6 adds no penalty for a nonlethal Strike with a
// lethal weapon, so Stage Fighting, Nonlethal Takedown and Protector of the Wilds have nothing to suppress: a decision for Cole.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const suppress = (selector, slug, predicate = null) => ({ key: "AdjustModifier", selector, slug, suppress: true, ...(predicate ? { predicate } : {}) });

export default [
    { uuid: pf2e("KQVE4FsDd9RFpWRz"), name: "Improvisational Defender", rules: [suppress("strike-attack-roll", "improvised")] },
    // (Its Trip bonus is PF2e's own already; this is the prone penalty to its attack rolls.)
    { uuid: pf2e("ifiaewasPbc091BQ"), name: "Ankle Biter", rules: [suppress("attack-roll", "prone", ["self:condition:prone"])] }
];

// Batch 14 (2026-10-31, round 53; Cole's scope "feats that change a card we already play"): a feat that changes a basic action, as the rule
// PF2e reads for that action's roll.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const QUICKENED = "Compendium.pf2e.conditionitems.Item.nlCjDvLMf2EkV2dl";

export default [
    // (Agile Maneuvers is scripts/maneuver-map.js: PF2e reads no MultipleAttackPenalty rule for maneuvers; round 54 Foundry test.)
    // (One-handed axes thrown 10 feet; an axe that's already thrown gets 10 feet more, and a thrown axe's critical hit its critical
    // specialization: by hand.)
    { uuid: pf2e("pewPAMlURmTqBqJx"), name: "Axe Thrower", rules: [
        { key: "ItemAlteration", itemType: "weapon", mode: "add", property: "traits", value: "thrown-10", predicate: ["item:group:axe", "item:usage:hands:1", { nor: ["item:trait:thrown", "item:trait:thrown-10", "item:trait:thrown-15", "item:trait:thrown-20", "item:trait:thrown-30", "item:trait:thrown-40"] }] }] },
    { uuid: pf2e("xOMwuKCf02aFzyp3"), name: "Paragon Battle Medicine", rules: [
        { key: "Note", selector: "medicine", predicate: ["action:battle-medicine"], outcome: ["success", "criticalSuccess"], title: "{item|name}", text: "<p>You can also reduce the target's sickened, enfeebled or clumsy condition by 1 (not one an effect keeps applying, like enlarge). Legendary in Medicine: frightened or stunned instead.</p>" }] },
    // (Round 78: the Swim half; a success to Balance on a wet surface is the player's, as PF2e can't see the surface.)
    { uuid: pf2e("kS4wxSKrZxcOvSNK"), name: "Shore Step", rules: [
        { key: "AdjustDegreeOfSuccess", selector: "athletics", predicate: ["action:swim"], adjustment: { success: "one-degree-better" } }] },
    // (Round 80: an unarmed attack the feat gives; its Enhancement's climb Speed and free hand are the player's.)
    { uuid: pf2e("0wuB3W7EeXrnhCmw"), name: "Powerful Tail", rules: [
        { key: "Strike", category: "unarmed", group: "brawling", slug: "tail", label: "PF2E.BattleForm.Attack.Tail", img: "systems/pf2e/icons/unarmed-attacks/tail.webp", damage: { base: { damageType: "bludgeoning", dice: 1, die: "d6" } }, range: null, traits: ["unarmed"] }] },
    // (Round 88: always quickened, as PF2e's own Perfect Readiness and Enduring Quickness give it: an in-memory condition. What the
    // extra action can be used for is the player's.)
    ...[
        { uuid: pf2e("aZ5JdFKA7L8NYl4o"), name: "Tower Shield Mastery" },
        { uuid: "Compendium.clerics-remaster.clerics-feats.Item.YGmbY1wddpmgxmcr", name: "Fervant Vessel" },
        { uuid: "Compendium.pf2e-team-plus-alchemists.pf2e-misc.Item.B27sgI8aE60pzTG7", name: "Instant Circles" }
    ].map((entry) => ({ ...entry, rules: [{ key: "GrantItem", uuid: QUICKENED, inMemoryOnly: true }] }))
];

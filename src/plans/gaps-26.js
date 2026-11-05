// One-off combat reactions, batch 26 (2026-11-05, Cole: "Grind everything", and don't settle for reminders): reactions the module only
// reminded of at their trigger, now with a card when they're posted — a condition lowered (Reassuring Presence, Creature Comforts,
// Comforting Presence, Mask of Fear) or a bonus to the roll they're about to make (Premonition of Avoidance, Orc Superstition, Relinquish
// Control, Archaeologist's Warning). The bonuses for one roll end after that roll (toggle endsAfter, scripts/effects.js).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const lower = (slug, by) => ({ kind: "condition", slug, value: 0, duration: null, stack: { by } });
const ROUND = { value: 1, unit: "rounds", expiry: "turn-start", sustained: false };

export default [
    { uuid: pf2e("95PmHIS041KiYIks"), name: "Reassuring Presence", affect: { target: "the ally within 30 feet who became frightened", effects: [lower("frightened", -1)] }, notes: ["The ally is then immune to your Reassuring Presence for 1 hour."] },
    { uuid: pf2e("E6fkmjX6b8Nz5B0y"), name: "Creature Comforts", affect: { target: "you", effects: [lower("frightened", -1)] }, notes: ["Only while you're under a morph or polymorph effect."] },
    { uuid: pf2e("MMaUL7r99DY7nvds"), name: "Comforting Presence", affect: { target: "each adjacent ally", effects: [lower("frightened", -1), lower("stupefied", -1)] }, notes: ["You take it on: raise your own frightened and stupefied values by as much as the allies' went down."] },
    { uuid: pf2e("KboQgBhYXI2WdCt8"), name: "Mask of Fear", affect: { target: "you", effects: [lower("frightened", -4)] }, notes: ["Your warmask is destroyed until your next daily preparations."] },
    { uuid: pf2e("KYl1rWFOHe0e6VqJ"), name: "Premonition of Avoidance", toggle: { rules: [{ key: "FlatModifier", selector: "saving-throw", type: "circumstance", value: 2 }], duration: ROUND, endsAfter: ["saving-throw"] }, notes: ["Only for a save against a hazard; it ends after that save."] },
    { uuid: pf2e("EFhh3AenX7wtAmrs"), name: "Orc Superstition", toggle: { rules: [{ key: "FlatModifier", selector: "saving-throw", type: "circumstance", value: 1 }], duration: ROUND, endsAfter: ["saving-throw"] }, notes: ["Only for a save against a spell or magical effect; it ends after that save."] },
    { uuid: pf2e("Gw8tjM91F6i3fOnR"), name: "Relinquish Control", toggle: { rules: [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: 4, predicate: [{ or: ["inflicts:controlled", "item:slug:charm", "item:slug:command", "item:trait:mental"] }] }, { key: "FlatModifier", selector: "lore-skill-check", type: "circumstance", value: 2, predicate: ["action:recall-knowledge"] }], duration: ROUND }, notes: ["Against effects that would control you or influence your actions (Charm, Command and the like): the bonus is set for mental effects too, so remove it from a save it doesn't fit. Until then you can only Recall Knowledge, Step, Strike, Cast an apparition or vessel Spell, Sustain a vessel spell or use an apparition action."] },
    { uuid: pf2e("7O0PrMoXd5L8dRfg"), name: "Archaeologist's Warning", toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "initiative", type: "circumstance", value: 1 }], duration: ROUND }, notes: ["Target your companions, before they roll initiative."] }
];

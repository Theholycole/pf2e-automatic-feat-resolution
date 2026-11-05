// One-off combat reactions, batch 26 (2026-11-05, Cole: "Grind everything", and don't settle for reminders): reactions the module only
// reminded of at their trigger, now with a card when they're posted — a condition lowered (Reassuring Presence, Creature Comforts,
// Comforting Presence, Mask of Fear) or a bonus to the roll they're about to make (Premonition of Avoidance, Orc Superstition,
// Archaeologist's Warning; not Relinquish Control, which has PF2e's own Effect), misfortune on a foe (Harbinger's Caw, Ill Tide) or resistance to the triggering hit (Planar Sidestep,
// Preemptive Reconfiguration, Faultless Defense). The bonuses for one roll end after that roll (toggle endsAfter, scripts/effects.js).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const lower = (slug, by) => ({ kind: "condition", slug, value: 0, duration: null, stack: { by } });
const NOW = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };
const MINUTE = { value: 1, unit: "minutes", expiry: "turn-start", sustained: false };
const ROUND = { value: 1, unit: "rounds", expiry: "turn-start", sustained: false };

export default [
    { uuid: pf2e("95PmHIS041KiYIks"), name: "Reassuring Presence", affect: { target: "the ally within 30 feet who became frightened", effects: [lower("frightened", -1)] }, notes: ["The ally is then immune to your Reassuring Presence for 1 hour."] },
    { uuid: pf2e("E6fkmjX6b8Nz5B0y"), name: "Creature Comforts", affect: { target: "you", effects: [lower("frightened", -1)] }, notes: ["Only while you're under a morph or polymorph effect."] },
    { uuid: pf2e("MMaUL7r99DY7nvds"), name: "Comforting Presence", affect: { target: "each adjacent ally", effects: [lower("frightened", -1), lower("stupefied", -1)] }, notes: ["You take it on: raise your own frightened and stupefied values by as much as the allies' went down."] },
    { uuid: pf2e("KboQgBhYXI2WdCt8"), name: "Mask of Fear", affect: { target: "you", effects: [lower("frightened", -4)] }, notes: ["Your warmask is destroyed until your next daily preparations."] },
    { uuid: pf2e("KYl1rWFOHe0e6VqJ"), name: "Premonition of Avoidance", toggle: { rules: [{ key: "FlatModifier", selector: "saving-throw", type: "circumstance", value: 2 }], duration: ROUND, endsAfter: ["saving-throw"] }, notes: ["Only for a save against a hazard; it ends after that save."] },
    { uuid: pf2e("EFhh3AenX7wtAmrs"), name: "Orc Superstition", toggle: { rules: [{ key: "FlatModifier", selector: "saving-throw", type: "circumstance", value: 1 }], duration: ROUND, endsAfter: ["saving-throw"] }, notes: ["Only for a save against a spell or magical effect; it ends after that save."] },
    { uuid: pf2e("TvVqZHp7qvkPakKf"), name: "Mistaken Identity", toggle: { rules: [{ key: "RollTwice", selector: "saving-throw", keep: "higher", removeAfterRoll: false }], duration: ROUND, endsAfter: ["saving-throw"] }, notes: ["Only for a save against a mental effect; it ends after that save. You're also Frightened 1: add it."] },
    { uuid: pf2e("7O0PrMoXd5L8dRfg"), name: "Archaeologist's Warning", toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "initiative", type: "circumstance", value: 1 }], duration: ROUND }, notes: ["Target your companions, before they roll initiative."] },
    { uuid: pf2e("KRfZcToCc5nvcQRa"), name: "Harbinger's Caw", toggle: { who: "target", rules: [{ key: "RollTwice", selector: ["attack-roll", "skill-check"], keep: "lower", removeAfterRoll: true }], duration: ROUND }, notes: ["Target the creature about to attempt the attack roll or skill check: it rolls that check twice and takes the lower result."] },
    { uuid: pf2e("EAoMrpAEH9VBcDHK"), name: "Ill Tide", toggle: { who: "target", rules: [{ key: "RollTwice", selector: ["attack-roll", "skill-check", "saving-throw"], keep: "lower", removeAfterRoll: true }], duration: MINUTE }, notes: ["Target the creature that critically failed: its next attack roll, skill check or save is rolled twice, the worse kept."] },
    { uuid: pf2e("HWLD3zGFBIjCDATo"), name: "Planar Sidestep", toggle: { rules: [{ key: "Resistance", type: "all-damage", value: 25 }], duration: NOW }, notes: ["Only against the triggering Strike: remove the Effect once its damage is applied."] },
    { uuid: pf2e("NEl8G3SlwxOR9Zx1"), name: "Preemptive Reconfiguration", toggle: { rules: [{ key: "Resistance", type: "physical", value: "@actor.level" }], duration: NOW }, notes: ["Only the triggering damage's type (bludgeoning, piercing or slashing) and only that damage: remove the Effect once it's applied."] },
    { uuid: pf2e("LZsVmDfGPGjWIoSS"), name: "Faultless Defense", toggle: { rules: [{ key: "Resistance", type: "all-damage", value: "floor(@actor.level/2)" }], duration: NOW }, notes: ["Spend a Mythic Point. Only against the triggering Strike's damage: remove the Effect once it's applied. Then Strike the attacker at mythic proficiency; if it hits and deals damage, the attacker is Slowed 1."] }
];

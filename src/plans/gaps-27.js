// One-off combat reactions, batch 27 (2026-11-05, Cole: "Grind everything", and don't settle for reminders): more reactions the module
// only reminded of — a condition lowered (Quick Recovery, Reminder of the Greater Fear), a defense against the triggering attack (Body
// Shield; its own slug, as the feat's PF2e toggle has a switched-off +2 "body-shield"), a penalty to the triggering critical hit's damage (Cringe) and fiery damage back at a melee attacker (Blazing Spirit).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const lower = (slug, by) => ({ kind: "condition", slug, value: 0, duration: null, stack: { by } });
const NOW = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    { uuid: pf2e("aBbpdmbMGN5ox0WT"), name: "Quick Recovery", affect: { target: "you", effects: [lower("wounded", -1)] } },
    { uuid: pf2e("dHJw5Yv0gY3suBZo"), name: "Reminder of the Greater Fear", affect: { target: "the creature within 30 feet that just became frightened", effects: [lower("frightened", -1)] }, notes: ["Use it once the frightened condition is on the creature."] },
    { uuid: pf2e("XnFSS0nBcEMPA8oZ"), name: "Body Shield", toggle: { rules: [{ key: "FlatModifier", selector: "ac", type: "circumstance", value: 2, slug: "body-shield-thrall" }, { key: "Resistance", type: "all-damage", value: "@actor.level" }], duration: NOW }, notes: ["Only against the triggering attack: remove the Effect once it's resolved. The adjacent thrall is destroyed either way."] },
    { uuid: pf2e("WoKiYMCXV27szBdy"), name: "Cringe", toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "strike-damage", type: "circumstance", value: "-(@actor.level+2)", critical: true }], duration: NOW }, notes: ["Target the attacker before it rolls the critical hit's damage. The penalty is critical-only, which PF2e adds after doubling. Subtract it by hand if the damage was already rolled. The attacker is then immune to your Cringe for 24 hours."] },
    {
        uuid: pf2e("kRERboV7vHN6EiTt"), name: "Blazing Spirit", target: "the creature that damaged you with a melee attack",
        text: "<p>The target takes @Damage[(ternary(gte(@actor.level,18),3,ternary(gte(@actor.level,12),2,1)))d6[fire]] damage and @Damage[(ternary(gte(@actor.level,18),3,ternary(gte(@actor.level,12),2,1)))[persistent,fire]] damage.</p>",
        notes: ["You also gain resistance equal to your level against the triggering damage: subtract it when you apply that damage."]
    }
];

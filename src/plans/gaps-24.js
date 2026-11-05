// One-off combat feats, batch 24 (2026-11-05, Cole: "Grind everything"): a familiar's resolve against fear, a song that gives weapons a
// rune and thralls immune to area damage.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const ROUND = { value: 1, unit: "rounds", expiry: "turn-start", sustained: false };
const UNTIL_NEXT_TURN_ENDS = { value: 1, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    {
        uuid: pf2e("BQ50m0Jb9qyoPchi"), name: "Familiar's Resolve",
        toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: "ternary(gte(@actor.level,14),3,2)", predicate: [{ or: ["item:trait:fear", "inflicts:doomed", "inflicts:frightened"] }] }], duration: ROUND },
        notes: ["After your next action, if it's Cast a Spell: on you or one ally within 30 feet. Only against effects that would make it doomed or frightened. The bonus is your level's (+3 from 14th)."]
    },
    {
        uuid: pf2e("cV2CZxD6HB7HFeFv"), name: "Sing to the Steel",
        toggle: { who: "target", rules: [{ key: "DamageDice", selector: "strike-damage", diceNumber: 1, dieSize: "d6", damageType: "fire" }], duration: UNTIL_NEXT_TURN_ENDS },
        notes: ["Target you and your allies within 30 feet. The card gives the flaming rune's 1d6 fire; for corrosive (acid), frost (cold) or shock (electricity) change the type, and use the rune's own effects for vitalizing, ghost touch or thundering. One weapon or unarmed attack per creature. An action (concentrate) extends it a round, up to 1 minute."]
    },
    {
        uuid: pf2e("JBfJSrPlfH4Dwp6k"), name: "Collateral Reinforcement",
        toggle: { who: "target", rules: [{ key: "Immunity", type: "area-damage" }], duration: ROUND },
        notes: ["Target your thralls. Splash damage is also excluded (PF2e has no splash-damage immunity type): the GM ignores it."]
    }
];

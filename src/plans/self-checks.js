// Checks against a DC of the character's level ("attempt a @Check[diplomacy|dc:@self.level|adjustment:-2] check", an easy DC), whose
// results are PF2e's Effects linked in the text (2026-10-30, the loop; docs/feats.md, "Checks against your level's DC"). The marshal
// stances' check enters the stance; Helpful Tinkering's gives its ally the Effect. The card rolls the check and applies each degree's.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const effect = (name) => ({ uuid: `Compendium.pf2e.feat-effects.Item.${name}`, label: name });
const both = (row) => ({ criticalSuccess: row, success: row });

export default [
    {
        uuid: pf2e("bvOsJNeI0ewvQsFa"), name: "Inspiring Marshal Stance",
        selfCheck: { statistic: "diplomacy", adjustment: -2, outcomes: both({ nativeEffects: [effect("Stance: Inspiring Marshal Stance")] }) },
        notes: ["On a critical failure you can't take this action again for 1 minute. The GM can set a different DC."]
    },
    {
        uuid: pf2e("R7c4PyTNkZb0yvoT"), name: "Dread Marshal Stance",
        selfCheck: { statistic: "intimidation", adjustment: -2, outcomes: both({ nativeEffects: [effect("Stance: Dread Marshal Stance")] }) },
        notes: ["On a critical failure you can't take this action again for 1 minute. The GM can set a different DC."]
    },
    {
        uuid: pf2e("OqqytsF2RIjB0EPR"), name: "Devrin's Cunning Stance",
        selfCheck: { statistic: "deception", outcomes: both({ nativeEffects: [effect("Stance: Devrin's Cunning Stance")] }) },
        notes: ["On a critical success your marshal's aura is 20 feet. On a critical failure you can't take this action again for 1 minute."]
    },
    {
        uuid: pf2e("fJwsZM6WXwP8EStV"), name: "Strategist Stance",
        selfCheck: { statistic: "society", outcomes: both({ nativeEffects: [effect("Stance: Strategist Stance")] }) },
        notes: ["You can roll Warfare Lore instead. On a critical success your marshal's aura is 20 feet."]
    },
    {
        uuid: pf2e("qUSWPWxYF8gfhfHM"), name: "Helpful Tinkering",
        selfCheck: { statistic: "crafting", adjustment: 2, target: "1 ally", outcomes: both({ nativeEffects: [effect("Effect: Helpful Tinkering")] }) },
        notes: ["Target the ally in your reach. On Apply, PF2e asks which of the ally's weapons gets the boost: the card finishes once it's picked. On a critical failure your ally takes your offensive boost's damage: roll it by hand."]
    },
    // Against a DC of the target's level (the ally's), each target's own on the card.
    {
        uuid: pf2e("LmsjuqB3rrZTqqa6"), name: "Guiding Words",
        selfCheck: { statistic: "diplomacy", level: "target", adjustment: 2, target: "1 ally", range: "30 feet", outcomes: both({ nativeEffects: [effect("Effect: Guiding Words")] }) },
        notes: ["Whatever the result, the ally is immune to Guiding Words for 10 minutes."]
    },
    {
        uuid: pf2e("2zxF682cNhgLMu26"), name: "Invincible Army",
        selfCheck: { statistic: "diplomacy", level: "target", adjustment: 2, target: "1 ally", outcomes: both({ nativeEffects: [effect("Effect: Invincible Army")] }) },
        notes: ["You can roll Deception instead. On Apply, PF2e's Effect asks which DC you chose (hard, or very hard for two types from a wider list) and the damage type. A very hard DC is 3 more than the card's."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.u1Yj7NCED4myTRDu", name: "Quick Cuisine",
        selfCheck: { statistic: "cooking-lore", level: "target", target: "1 ally", outcomes: both({ nativeEffects: [{ uuid: "Compendium.pf2e-team-plus-feats.pf2e-misc.Item.F7MX2YhI0mMy3aGG", label: "Effect: Quick Cuisine" }] }) },
        notes: ["Takes 10 minutes. With two or four allies, the DC is the highest level's. On a critical success the ally also gets temporary Hit Points equal to half your level plus your Intelligence modifier."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-barbarians.items.Item.f7DtQ9kQ02gAuqyr", name: "Call of the Ancestor",
        selfCheck: { statistic: "perception", outcomes: both({ nativeEffects: [{ uuid: "Compendium.pf2e-team-plus-barbarians.misc.Item.NQvBAbJB8uUlmntt", label: "Effect: Call of the Ancestor" }] }) },
        notes: ["+1 on a success, +2 on a critical success: your next attack roll with your vestige weapon this turn."]
    }
];

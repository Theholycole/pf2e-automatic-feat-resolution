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
        notes: ["Target the ally in your reach; the boost is for the weapon you chose. On a critical failure your ally takes your offensive boost's damage: roll it by hand."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-barbarians.items.Item.f7DtQ9kQ02gAuqyr", name: "Call of the Ancestor",
        selfCheck: { statistic: "perception", outcomes: both({ nativeEffects: [{ uuid: "Compendium.pf2e-team-plus-barbarians.misc.Item.NQvBAbJB8uUlmntt", label: "Effect: Call of the Ancestor" }] }) },
        notes: ["+1 on a success, +2 on a critical success: your next attack roll with your vestige weapon this turn."]
    }
];

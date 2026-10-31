// Batch 1 (2026-10-30, docs/rules.md): senses and Speeds said outright (read by src/rules/read.js, tools/rules-batch.mjs, each reviewed
// against its text), and the plainest bonuses and resistances, written by hand in the shape PF2e's own items give the same words.

export default [
    {"uuid":"Compendium.pf2e.feats-srd.Item.XYtnVNKt6uPcRrdH","name":"Tree Climber (Goblin)","rules":[{"key":"BaseSpeed","selector":"climb","value":10}]},
    {"uuid":"Compendium.pf2e-team-plus-magic.items.Item.huTig9LF2n5cCDTn","name":"Shadowsight","rules":[{"key":"Sense","selector":"greater-darkvision"}]},
    // PF2e's Community-Minded is the shape: "+1 circumstance bonus to your Perception DC against Lies and Impersonations".
    {"uuid":"Compendium.pf2e.feats-srd.Item.Vxs9btOk61C7KpP2","name":"Cynical","rules":[{"key":"FlatModifier","predicate":[{"or":["action:lie","action:impersonate"]}],"selector":"perception","type":"circumstance","value":1}]},
    // "+1 circumstance bonus to checks to Escape" (PF2e's Break Free: the Escape statistics).
    {"uuid":"Compendium.pf2e.feats-srd.Item.Dc5hLCC2qxCDWjX5","name":"Tip the Scales","rules":[{"key":"FlatModifier","predicate":["action:escape"],"selector":["athletics","acrobatics","unarmed-attack-roll"],"type":"circumstance","value":1}]},
    // "+2 circumstance bonus to saving throws against effects that would cause you to become Drained, Enfeebled, Fatigued, Sickened, or Slowed … +3 at 18th level" (PF2e's Constructed).
    {"uuid":"Compendium.pf2e.feats-srd.Item.SOXivCy3ko3jDewI","name":"Vigorous Victor","rules":[{"key":"FlatModifier","predicate":[{"or":["inflicts:drained","inflicts:enfeebled","inflicts:fatigued","inflicts:sickened","inflicts:slowed"]}],"selector":"saving-throw","type":"circumstance","value":"ternary(gte(@actor.level,18),3,2)"}]},
    // "resistance to fire equal to half your level" (its upgrade to your level, with another such resistance, the GM's: PF2e keeps the higher).
    {"uuid":"Compendium.pf2e.feats-srd.Item.mprVzno2BR2VhRSJ","name":"Winter's Kiss","rules":[{"key":"Resistance","type":"fire","value":"floor(@actor.level/2)"}]},
    // "+2 circumstance bonus to your Fortitude or Reflex DC against attempts to Shove or Trip you … saving throws against … knock you prone … rock dwarf, +3" (PF2e's Anchor).
    {"uuid":"Compendium.pf2e.feats-srd.Item.QEOe9AhQzdqIx1ei","name":"Steadying Stone","rules":[{"key":"FlatModifier","predicate":[{"or":["action:shove","action:trip","inflicts:prone"]}],"selector":"saving-throw","slug":"steadying-stone","type":"circumstance","value":2},{"key":"AdjustModifier","mode":"add","predicate":["heritage:rock-dwarf"],"selector":"saving-throw","slug":"steadying-stone","value":1}]},
    // The same, +2, on the inventor's armor (Teams+).
    {"uuid":"Compendium.pf2e-team-plus-inventors.inventors-features.Item.TA36HBgcBTOlBgyP","name":"Ankle-weighted Stabilizers","rules":[{"key":"FlatModifier","predicate":[{"or":["action:shove","action:trip","inflicts:prone"]}],"selector":"saving-throw","type":"circumstance","value":2}]},
    // "+4 status bonus to Perception checks to detect when a creature is disguised or is using Impersonate" (Clerics+).
    {"uuid":"Compendium.clerics-remaster.clerics-features.Item.Rt6l4guHRNSJU6ia","name":"Sacred Executioner","rules":[{"key":"FlatModifier","predicate":["action:impersonate"],"selector":"perception","type":"status","value":4}]},
    // "+1 circumstance bonus to Diplomacy" with animals (the +2 with animals of your own kind, the GM's).
    {"uuid":"Compendium.pf2e.feats-srd.Item.SEvwIS22R92vDDMk","name":"Natural Ambassador","rules":[{"key":"FlatModifier","predicate":["target:trait:animal"],"selector":"diplomacy","type":"circumstance","value":1}]},
];

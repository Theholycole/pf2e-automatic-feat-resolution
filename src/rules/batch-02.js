// Batch 2 (2026-10-30, docs/rules.md): bonuses, a skill, a resistance and a sense, by hand in the shapes PF2e's own items use.

export default [
    // "+2 circumstance bonus to Crafting checks to reverse engineer a formula from an item" (PF2e's Reverse Engineer, the inventor's).
    {"uuid":"Compendium.pf2e.feats-srd.Item.f0s3WwaJN5f2UTYY","name":"Reverse Engineering","rules":[{"key":"FlatModifier","predicate":["action:reverse-engineer"],"selector":"crafting","type":"circumstance","value":2}]},
    // The same, Teams+'s.
    {"uuid":"Compendium.pf2e-team-plus-inventors.inventors-feats.Item.e4ChmcvdBwVWhORx","name":"Reverse Engineer","rules":[{"key":"FlatModifier","predicate":["action:reverse-engineer"],"selector":"crafting","type":"circumstance","value":2}]},
    // "You become trained in Deception." (PF2e's Shrouded Mien; the expert choice when already trained, the player's.)
    {"uuid":"Compendium.pf2e.feats-srd.Item.LlV0KHIebzdczgyD","name":"Rose Warden Dedication","rules":[{"key":"ActiveEffectLike","mode":"upgrade","path":"system.skills.deception.rank","value":1}]},
    // "You both gain darkvision and a +1 status bonus to saving throws against effects with the darkness or shadow trait." (Yours; the horse's
    // its own. PF2e's Aegis of the Dissolution for the traits.)
    {"uuid":"Compendium.pf2e.feats-srd.Item.KGskOgyMJVlpNtua","name":"Nidalese Horselord Dedication","rules":[{"key":"Sense","selector":"darkvision"},{"key":"FlatModifier","predicate":[{"or":["item:trait:darkness","item:trait:shadow"]}],"selector":"saving-throw","type":"status","value":1}]},
    // "When you have your shield raised, you gain your shield's circumstance bonus to saving throws against effects that would deal void
    // damage." (PF2e's Reflexive Shield and Emblazon Energy.)
    {"uuid":"Compendium.pf2e.feats-srd.Item.R337W7VveJxlEddE","name":"Necromantic Bulwark","rules":[{"key":"FlatModifier","predicate":["self:effect:raise-a-shield","item:damage:type:void"],"selector":"saving-throw","type":"circumstance","value":"@actor.system.attributes.shield.ac"}]},
    // "Bolster the Blood: You gain resistance to persistent bleed 2" (bleed is persistent damage).
    {"uuid":"Compendium.pf2e.backgrounds.Item.kW9aZ5uxAuACeYRL","name":"Blooded by the Dead","rules":[{"key":"Resistance","type":"bleed","value":2}]},
];

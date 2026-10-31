// Saves said in words, round 50 (2026-10-31, the loop): the damage the text names in words, as PF2e's tags.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

export default [
    {
        uuid: pf2e("rMPL11JRcmlutvRi"), name: "Thrash", target: "the enemy you have grabbed or restrained",
        text: `<p>An enemy you have grabbed or restrained takes @Damage[(@actor.abilities.str.mod)[bludgeoning]] bludgeoning damage with a @Check[fortitude|against:barbarian|basic] save against your class DC.</p>`,
        notes: ["Add your weapon specialization damage and your Rage damage to the card's damage before applying it."]
    }
];

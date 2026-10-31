// Saves said in words, round 50 (2026-10-31, the loop): the damage the text names in words, as PF2e's tags.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

export default [
    {
        uuid: pf2e("rMPL11JRcmlutvRi"), name: "Thrash", target: "the enemy you have grabbed or restrained",
        text: `<p>An enemy you have grabbed or restrained takes @Damage[(@actor.abilities.str.mod)[bludgeoning]] bludgeoning damage with a @Check[fortitude|against:barbarian|basic] save against your class DC.</p>`,
        notes: ["Add your weapon specialization damage and your Rage damage to the card's damage before applying it."]
    },
    // (Round 52.)
    {
        uuid: "Compendium.pf2e.actionspf2e.Item.JjSNVfQO7qc4bgz1", name: "Gluttonous Feast", target: "each living creature adjacent to a spirit",
        text: `<p>Each living creature adjacent to a spirit takes @Damage[4d6[void]] damage per adjacent spirit with a @Check[fortitude|against:class-spell|basic] save against the higher of your class DC or spell DC.</p>`,
        notes: ["Spend 1 Mythic Point. The card rolls one spirit's 4d6: for a creature next to two, three or four spirits, roll more by hand (16d6 at most). You gain temporary Hit Points equal to half the most damage one creature took, for 1 minute."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-oracles-remastered.items.Item.5Ikns5WszW9t6oxu", name: "Arrange the Board", target: "2 + twice your cursebound value creatures within 30 feet",
        text: `<p>Each target attempts a @Check[will|against:spell] save against your spell DC. On a failure, it Steps in a direction of your choice.</p>`,
        notes: ["Allies can choose to fail. Move the tokens by hand."]
    }
];

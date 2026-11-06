// Companion feats no module covers, from the simulator's feat gap index (2026-11-04, Cole: "Automate the spellcasting and companion feats
// not handled by other modules"): an eidolon's damage from its secondary attack, played from its token (by: "companion", eidolons.js's).
// (The secondary attack's base die, 1d6, and the eidolon's Strength: a note says to add its extra weapon dice.)

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const secondary = (type) => `(1d6+@actor.abilities.str.mod)[${type}]`;

export default [
    {
        uuid: pf2e("7GGxxoYNA4YrtML9"), name: "Eidolon's Trample", by: "companion", target: "each creature your eidolon Tramples",
        text: `<p>Each creature your eidolon Tramples takes @Damage[${secondary("bludgeoning")}] damage with a @Check[reflex|against:spell|basic] save against your spell DC.</p>`,
        notes: ["Your eidolon Strides up to double its Speed through the spaces of creatures at least one size smaller, each once. The card rolls the secondary attack's 1d6: add its extra weapon dice."]
    },
    {
        uuid: pf2e("R7EaZPYtsy5H8lwn"), name: "Merciless Rend", by: "companion", target: "the enemy your eidolon hit twice",
        text: `<p>The target takes @Damage[${secondary("slashing")}] damage.</p>`,
        notes: ["After two consecutive unarmed Strikes that hit the same enemy and dealt slashing damage this turn. The card rolls the secondary attack's 1d6 as slashing: add its extra weapon dice and use its own damage type."]
    }
];

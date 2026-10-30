// Feats with a save the readers leave alone on purpose, rewritten by hand (2026-10-30): the part the card can play in the readers' own
// words with PF2e's tags, so the character's DC still fills in; the rest a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const frightened = (value) => `@UUID[Compendium.pf2e.conditionitems.Item.Frightened]{Frightened ${value}}`;

export default [
    {
        uuid: pf2e("lmo55Y5NS5iZa56o"), name: "Fling Head",
        text: `<p>You fling your head at an enemy within 30 feet. Your target must attempt a @Check[will|against:class-spell] save against your class DC or spell DC, whichever is higher.</p><hr /><p><strong>Critical Success</strong> The creature is unaffected.</p><p><strong>Success</strong> The creature is ${frightened(1)}.</p><p><strong>Failure</strong> The creature is ${frightened(2)}.</p><p><strong>Critical Failure</strong> The creature is ${frightened(3)}.</p>`,
        notes: ["One more creature within 20 feet of the first for each extra action spent. On a failure it can't reduce its frightened below 1 while within 30 feet of you."]
    },
    {
        uuid: pf2e("sIN6t7nCWdI5u1HK"), name: "Spirit's Anguish",
        text: `<p>All creatures in a @Template[cone|distance:30] take @Damage[(@actor.level)d4[sonic]|options:area-damage] damage, with a @Check[will|against:class-spell|basic|options:area-effect] save against your class DC or spell DC, whichever is higher.</p>`,
        notes: ["That's a spirit wisp's damage; a spirit remnant deals 1d6 sonic per level of the undead or haunt it came from instead."]
    }
];

// Feats with a save the readers leave alone on purpose, rewritten by hand (2026-10-30): the part the card can play in the readers' own
// words with PF2e's tags, so the character's DC still fills in; the rest a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const boulder = "@Damage[(@actor.level + @actor.abilities.str.mod)[bludgeoning]]";
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
    },
    {
        uuid: pf2e("WRZZItgiMmpLnhdh"), name: "Pandemonium Eruption",
        text: `<p>Each creature within @Template[emanation|distance:15]{15 feet} of you takes @Damage[14d6[acid]|options:area-damage] damage, with a @Check[reflex|against:class-spell|basic|options:area-effect] save against the higher of your class DC or spell DC. A creature that critically fails is also @UUID[Compendium.pf2e.conditionitems.Item.Confused] until the end of its next turn.</p>`,
        notes: ["Once per day. The type is random for each target: acid, electricity or sonic (the card rolls acid; change it per target). –2 to the save for a creature hit by the type you currently resist."]
    },
    {
        uuid: action("yWTdfPklh8jL94GZ"), name: "Mobbing Assault",
        text: `<p>Each enemy in a @Template[type:emanation|distance:5] around your horde takes @Damage[(ternary(gte(@actor.level,18),8,ternary(gte(@actor.level,14),6,ternary(gte(@actor.level,10),4,2))))d6[bludgeoning]|options:area-damage] damage with a @Check[reflex|against:spell|basic|options:area-effect] save against your spell DC.</p>`,
        notes: ["Bludgeoning for a zombie horde; a skeleton horde deals slashing instead."]
    },
    {
        uuid: pf2e("ZZxePfQkBPuTHkt1"), name: "Boulder Roll",
        text: `<p>A foe your size or smaller can attempt a @Check[fortitude|against:athletics] saving throw against your Athletics DC.</p><hr /><p><strong>Critical Success</strong> The foe is unaffected.</p><p><strong>Success</strong> The foe takes ${boulder} damage.</p><p><strong>Failure</strong> The foe takes ${boulder} damage.</p><p><strong>Critical Failure</strong> The foe takes ${boulder} damage.</p>`,
        notes: ["You Step into its square and it moves into the space behind it. It can choose not to save and just move; a success or better at the save blocks your Step; any save but a critical success costs it the damage. No effect if it has nowhere to go."]
    },
    {
        uuid: pf2e("SC5oZbyvLO5CQwhl"), name: "Sonic Dash",
        text: `<p>All creatures other than you in a @Template[type:emanation|distance:5] take @Damage[floor(@actor.level/2)d4[sonic]|options:area-damage] damage, with a @Check[fortitude|against:deviant|basic|options:area-effect,inflicts:deafened] save. Creatures that fail are @UUID[Compendium.pf2e.conditionitems.Item.Deafened] for 1 round, or 1 minute on a critical failure.</p>`,
        notes: ["Stride twice in a straight line first. The sonic boom comes only with its Awakening; without it, skip the card."]
    }
];

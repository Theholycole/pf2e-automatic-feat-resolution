// Saves and checks said in words, rewritten by hand (2026-10-30, the loop, after the senses work): the readers' words, PF2e's tags; what the
// card can't do is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const condition = (id, label) => `@UUID[Compendium.pf2e.conditionitems.Item.${id}]{${label}}`;
const frightened = (value) => condition("TBSHQspnbcqxsmjL", `Frightened ${value}`);
const degrees = (success, failure, criticalFailure, criticalSuccess = "The creature is unaffected.") =>
    `<hr /><p><strong>Critical Success</strong> ${criticalSuccess}</p><p><strong>Success</strong> ${success}</p><p><strong>Failure</strong> ${failure}</p><p><strong>Critical Failure</strong> ${criticalFailure}</p>`;

export default [
    {
        uuid: pf2e("mAoykPgP5OALqeq3"), name: "Frightening Power", target: "each enemy within 20 feet",
        text: `<p>Each enemy within 20 feet must attempt a @Check[will|against:class-spell] save against your class DC or spell DC, whichever is higher.</p>${degrees(`The creature is ${frightened(1)}.`, `The creature is ${frightened(2)}.`, `The creature is ${frightened(4)}.`)}`,
        notes: ["Your spectral dragon can be the emanation's origin while you're Channeling Draconic Essence. Whatever its save, a creature is immune for 24 hours."]
    },
    {
        uuid: pf2e("7y8DKd24c7eqzJGV"), name: "Breath of the Dragon (Dragonblood)",
        text: `<p>All creatures in a @Template[type:cone|distance:15] take @Damage[(ceil(@actor.level/2))d4[untyped]|options:area-damage] damage with a @Check[reflex|against:class-spell|basic|options:area-effect] save against your class DC or spell DC, whichever is higher.</p>`,
        notes: ["Your draconic exemplar's shape (a 15-foot cone or a 30-foot line), damage type and save: the card rolls untyped damage and Reflex. You can't use it again for 1d4 rounds."]
    },
    {
        uuid: pf2e("mUL0C7O4HSnPSXea"), name: "Warped Constriction", target: "the creature you have grabbed",
        text: `<p>The creature you have grabbed or restrained takes @Damage[(@actor.level)[bludgeoning]] bludgeoning damage and @Damage[(max(@actor.abilities.int.mod,@actor.abilities.wis.mod,@actor.abilities.cha.mod))[mental]] mental damage with a @Check[will|against:class-spell|basic] save against your class DC or spell DC, whichever is higher.</p>`,
        notes: []
    },
    {
        uuid: pf2e("UJcuACMlspc1raL1"), name: "Curse of the Saumen Kar",
        text: `<p>A Huge or smaller creature within 60 feet must attempt a @Check[reflex|against:class-spell] save against your class DC or spell DC, whichever is higher.</p>${degrees("The creature is pushed outside the prison into a space of its choice.", "The creature is trapped inside the icy prison.", "The creature is trapped inside the icy prison.", "The creature is pushed outside the prison into a space of its choice.")}`,
        notes: ["Also each creature sharing its space. The prison has AC 10, Hardness 20 and 40 Hit Points, immune to cold, critical hits and precision damage; it lasts until destroyed, you make another, or you die."]
    },
    {
        uuid: pf2e("bWW2q4HUtWeX0SA2"), name: "Spellbinding Speech",
        text: `<p>Attempt a @Check[arcana|against:will] check against the Will DC of a creature within 30 feet who can hear and understand you.</p><hr /><p><strong>Critical Success</strong> The target can't use reactions until the start of your next turn.</p><p><strong>Success</strong> The target can't use reactions until the start of your next turn.</p>`,
        notes: ["Whatever the result, it's immune for 24 hours."]
    },
    {
        uuid: "Compendium.pf2e.actionspf2e.Item.V4HToYPQlkw8AW50", name: "Embrace of Destiny", target: "1 enemy within 20 feet",
        text: `<p>An enemy within 20 feet must attempt a @Check[will|against:class|options:forced-movement] save against your class DC.</p>${degrees("The creature is unaffected.", "You pull the creature up to 20 feet toward you.", "You pull the creature up to 20 feet toward you.")}`,
        notes: ["Pulled straight toward you, into a square adjacent to you: stop it there."]
    }
];

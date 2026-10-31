// More feats with a save, rewritten by hand (2026-10-30, the loop after the Foundry test): the readers take the save when it's said in
// their words, so the text is said that way (PF2e's tags kept, the character's DC filled in); what the card can't do is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const teams = (module, pack, id) => `Compendium.${module}.${pack}.Item.${id}`;
const condition = (id, label) => `@UUID[Compendium.pf2e.conditionitems.Item.${id}]{${label}}`;
const slowed = (value) => condition("xYTAsEpcJE1Ccni3", `Slowed ${value}`);
const stunned = (value) => condition("dfCMdR4wnpbYNTix", value ? `Stunned ${value}` : "Stunned");
const clumsy = (value) => condition("i3OJZU2nk64Df3xm", `Clumsy ${value}`);
const frightened = (value) => condition("TBSHQspnbcqxsmjL", `Frightened ${value}`);
const fascinated = condition("AdPVz7rbaVSRxHFg", "Fascinated");
const prone = condition("j91X7x0XSomq8d60", "Prone");
const dazzled = condition("TkIyaNPgTZFBCCuh", "Dazzled");
const blinded = condition("XgEqL1kFApUbl5Z2", "Blinded");
const degrees = (success, failure, criticalFailure, criticalSuccess = "The creature is unaffected.") =>
    `<hr /><p><strong>Critical Success</strong> ${criticalSuccess}</p><p><strong>Success</strong> ${success}</p><p><strong>Failure</strong> ${failure}</p><p><strong>Critical Failure</strong> ${criticalFailure}</p>`;

export default [
    {
        uuid: pf2e("SA8rnheHFtjkATrJ"), name: "Shifting Terrain",
        text: `<p>Each creature within your area of difficult terrain must attempt a @Check[reflex|against:spell] saving throw against your spell DC.</p>${degrees(`The creature is ${clumsy(1)} for 1 round.`, `The creature is ${clumsy(2)} for 1 round.`, `The creature is ${clumsy(2)} for 1 round and falls ${prone}.`)}`,
        notes: ["Target the creatures in your Rough Terrain Stance's difficult terrain. You can't use it again for 1d4 rounds."]
    },
    {
        uuid: pf2e("UCFGUbmDnzRGmN9I"), name: "Steal Time",
        text: `<p>A creature within 30 feet must attempt a @Check[fortitude|against:class-spell] saving throw against your chronoskimmer DC.</p>${degrees(`The creature is ${slowed(1)} for 1 round.`, `The creature is ${slowed(1)} for 1 minute.`, `The creature is ${slowed(2)} for 1 minute.`)}`,
        notes: ["Slow's results, by its save."]
    },
    {
        uuid: pf2e("P092yzkGN4UYYVXB"), name: "Statement Strut",
        text: `<p>All enemies within 30 feet must attempt a @Check[will|against:class-spell] save against your class DC or spell DC, whichever is higher.</p>${degrees("The creature is unaffected.", "The creature can't use reactions until the end of your next turn.", "The creature can't use reactions until the end of your next turn.")}`,
        notes: ["You Stride first: the enemies within 30 feet of any point of your movement."]
    },
    {
        uuid: pf2e("Cf0CDTZvGaYDAXUN"), name: "Calaca's Showstopper",
        text: `<p>Each enemy in a @Template[type:emanation|distance:30] must attempt a @Check[will|against:class-spell] save against your class DC or spell DC, whichever is higher.</p>${degrees(`The creature is ${stunned(1)}.`, `The creature is ${stunned(2)}.`, `The creature is ${stunned()} for 1 round.`)}`,
        notes: ["Synaptic Pulse's results, auditory rather than mental."]
    },
    {
        uuid: pf2e("a57EppvkRS1x3OFs"), name: "Fearful Symmetry",
        text: `<p>All enemies within 30 feet must attempt a @Check[will|against:class] save against your class DC.</p>${degrees("The creature is unaffected.", `The creature is ${frightened(1)} and ${fascinated} for 1 round.`, `The creature is ${frightened(1)} and ${fascinated} for 1 round.`)}`,
        notes: ["Within 30 feet of the creature you critically hit. Your hostile actions don't end the fascination, your allies' do. Each is immune for 1 hour."]
    },
    {
        uuid: pf2e("cBYTVYqw1EFVEuzs"), name: "Bolera's Interrogation",
        text: `<p>A creature within 30 feet must attempt a @Check[will|against:perception] save against your Perception DC.</p>${degrees("The creature is unaffected.", "The creature can't speak any deliberate lies and takes a –2 penalty to Deception checks for 10 minutes.", "The creature can't speak any deliberate lies and takes a –4 penalty to Deception checks for 10 minutes.")}`,
        notes: ["Only while you're within 30 feet and it knows. Immune for 24 hours after."]
    },
    {
        uuid: teams("pf2e-team-plus-tian-xia", "misc", "LKTXD51n2B8C7Gzj"), name: "Kneel Before the Soverign",
        text: `<p>The target must succeed at a @Check[will|against:class-spell] save against your class DC or spell DC, whichever is higher, or fall ${prone}.</p>`
    },
    {
        uuid: teams("pf2e-team-plus-tian-xia", "misc", "MqxPoVbO4jirQfg4"), name: "Protect the Meek",
        text: `<p>The triggering creature must attempt a @Check[reflex|against:class-spell] save against your class DC or spell DC, whichever is higher. A creature that fails is ${dazzled} for 1 round, or 1 minute on a critical failure.</p>`,
        notes: ["Immune for 10 minutes after."]
    },
    {
        uuid: teams("pf2e-team-plus-tian-xia", "player-options", "Ti0G4Vkq66r2zZxz"), name: "Sparkling Glory",
        text: `<p>An enemy adjacent to you must attempt a @Check[will|against:class-spell] save against your class DC or spell DC, whichever is higher.</p>${degrees("The creature is unaffected.", `The creature is ${dazzled} for 1 round.`, `The creature is ${blinded} for 1 round and ${dazzled} for 1 minute.`)}`,
        notes: ["Immune for 10 minutes after."]
    },
    {
        uuid: teams("pf2e-team-plus-adventures", "pf2e-misc", "wvZxkCAUwwKETzzG"), name: "Release Horrors",
        text: `<p>All creatures within the area of your vessel's presence take @Damage[(4+floor((@actor.level-7)/2))d10[bludgeoning]|options:area-damage] damage with a @Check[reflex|against:class|basic|options:area-effect] save against your class DC. Creatures that critically fail their save are also ${frightened(2)}.</p>`,
        notes: ["Bludgeoning, piercing or slashing, your choice: the card rolls bludgeoning. Target the creatures in your presence."]
    }
];

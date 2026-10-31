// More feats with a save or a check against a DC, rewritten by hand (2026-10-30, the loop): said in the readers' words, PF2e's tags kept;
// what the card can't do is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const condition = (id, label) => `@UUID[Compendium.pf2e.conditionitems.Item.${id}]{${label}}`;
const frightened = (value) => condition("TBSHQspnbcqxsmjL", `Frightened ${value}`);
const prone = condition("j91X7x0XSomq8d60", "Prone");
const degrees = (success, failure, criticalFailure, criticalSuccess = "The creature is unaffected.") =>
    `<hr /><p><strong>Critical Success</strong> ${criticalSuccess}</p><p><strong>Success</strong> ${success}</p><p><strong>Failure</strong> ${failure}</p><p><strong>Critical Failure</strong> ${criticalFailure}</p>`;

export default [
    {
        uuid: pf2e("PPUNMjRLQYnmwQvF"), name: "Kobold Breath",
        text: `<p>All creatures in a @Template[type:cone|distance:15] take @Damage[(ceil(@actor.level/2))d4[fire]|options:area-damage] damage with a @Check[reflex|against:class-spell|basic|options:area-effect] save against your class DC or spell DC, whichever is higher.</p>`,
        notes: ["Your draconic benefactor's shape (a 30-foot line or a 15-foot cone), damage type and save: the card rolls fire and Reflex. You can't use it again for 1d4 rounds."]
    },
    {
        uuid: pf2e("AYHhuLIDtIEewfRf"), name: "Wrath of the Hold",
        text: `<p>All foes in a @Template[type:cone|distance:30] take @Damage[(floor(@actor.level/2))d6[spirit]|options:area-damage] damage with a @Check[will|against:class-spell|basic|options:area-effect] save against your class DC or spell DC, whichever is higher.</p>`,
        notes: ["Spends one use of your storied skin's Living History."]
    },
    {
        uuid: pf2e("P8P5PwLgxk84bRQw"), name: "Luring Chomp",
        text: `<p>A creature within 30 feet must attempt a @Check[will|against:class-spell|options:forced-movement] save against your class DC or spell DC, whichever is higher.</p>${degrees("The creature is unaffected.", "You pull the creature up to 30 feet toward you.", "You pull the creature up to 30 feet toward you.")}`,
        notes: ["If it ends the pull within reach of your jaws, you can make a jaws Strike against it. Whatever its save, it's immune for 24 hours."]
    },
    {
        uuid: pf2e("D7g9z4MuIeS4iRwN"), name: "Public Execution",
        text: `<p>All creatures within 30 feet must attempt a @Check[will|against:class-spell] save against your class DC or spell DC, whichever is higher.</p>${degrees("The creature is unaffected.", "The creature can't attack you or otherwise perform hostile actions against you until the end of your next turn.", "The creature can't attack you or otherwise perform hostile actions against you until the end of your next turn.")}`,
        notes: ["Only those who can see and hear you. It ends if you use a hostile action against anyone but your mark. Your mark is immune for 1 day."]
    },
    {
        uuid: pf2e("Sav50NxWdLnbaDWQ"), name: "Ferocious Gust",
        text: `<p>Each creature in a @Template[type:line|distance:60] must attempt a @Check[fortitude|against:class-spell|traits:air] save against your class DC or spell DC, whichever is higher.</p>${degrees("The creature can't move against the wind.", `The creature falls ${prone}.`, `The creature is pushed 30 feet in the wind's direction, falls ${prone} and takes @Damage[2d6[bludgeoning]] damage.`)}`,
        notes: ["Gust of Wind's results, by its save: on a failure a flying creature is pushed 30 feet instead of falling prone. It also puts out small fires and disperses gases in the line."]
    },
    {
        uuid: pf2e("uBOToHKQJr5JBEsg"), name: "Mummy's Despair",
        text: `<p>The target must attempt a @Check[will|against:class-spell] save against your class DC or spell DC, whichever is higher.</p>${degrees("The creature is unaffected.", `The creature is ${frightened(1)}.`, `The creature is ${frightened(2)}.`)}`,
        notes: ["A 30-foot aura for 5 rounds: use it again for each creature that enters or begins its turn there. One that succeeds is immune for 10 minutes."]
    },
    {
        uuid: pf2e("nCmsylaV144Pr4TZ"), name: "Bestial Snarling", target: "each enemy within 5 feet",
        text: `<p>Attempt a @Check[performance|defense:will] check against the Will DC of each enemy adjacent to you.</p><hr /><p><strong>Critical Success</strong> The target is ${frightened(1)}.</p><p><strong>Success</strong> The target is ${frightened(1)}.</p>`,
        notes: ["Or Nature. An animal is frightened 2 instead. Also each enemy adjacent to your animal minion. Each is immune for 10 minutes."]
    }
];

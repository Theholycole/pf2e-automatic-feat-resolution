// More feats with damage or a save, rewritten by hand (2026-10-30, the loop): said in the readers' words, PF2e's tags kept; what the card
// can't do is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const teams = (module, pack, id) => `Compendium.${module}.${pack}.Item.${id}`;
const condition = (id, label) => `@UUID[Compendium.pf2e.conditionitems.Item.${id}]{${label}}`;
const clumsy = (value) => condition("i3OJZU2nk64Df3xm", `Clumsy ${value}`);
const enfeebled = (value) => condition("MIRkyAjyBeXivMa7", `Enfeebled ${value}`);
const degrees = (success, failure, criticalFailure, criticalSuccess = "The creature is unaffected.") =>
    `<hr /><p><strong>Critical Success</strong> ${criticalSuccess}</p><p><strong>Success</strong> ${success}</p><p><strong>Failure</strong> ${failure}</p><p><strong>Critical Failure</strong> ${criticalFailure}</p>`;

export default [
    {
        uuid: pf2e("7aHYM9fawA3PQwtM"), name: "Self Destruct",
        text: `<p>All creatures in a @Template[type:emanation|distance:30] take @Damage[((2*@actor.level)d6)[fire]|options:area-damage] damage with a @Check[reflex|against:class-spell|basic|options:area-effect,damaging-effect] save against your class DC or spell DC, whichever is higher.</p>`,
        notes: ["The 30-foot burst is centred on your reanimated clockwork companion, not you."]
    },
    {
        uuid: pf2e("h0gwBDI61MxkvVPC"), name: "Kneel Before the Rightful Heir",
        text: `<p>All enemies within 40 feet must attempt a @Check[will|against:class-spell] save against your class DC or spell DC, whichever is higher.</p>${degrees("The creature takes @Damage[3d6[persistent,mental]] damage.", "The creature takes @Damage[6d6[persistent,mental]] damage.", `The creature takes @Damage[6d6[persistent,mental]] damage and is ${clumsy(2)}.`)}`,
        notes: ["Only those who can see and hear you; each is immune for 24 hours. The clumsy lasts as long as the persistent damage, which ends only if it Drops Prone where you can see and doesn't Stand until its next turn."]
    },
    {
        uuid: pf2e("pKoW1X95LjmWn5Jq"), name: "Poisoner's Twist",
        text: `<p>The target takes @Damage[1d6[untyped]] damage and @Damage[1d6[poison]] damage.</p>`,
        notes: ["The untyped die is the required Strike's damage type. At 18th level, 2d6 of each."]
    },
    {
        uuid: pf2e("mOWtfL7lhW9XpdBN"), name: "Stranglehold",
        text: `<p>The target takes @Damage[(2*@actor.abilities.str.mod)[bludgeoning]] damage.</p>`,
        notes: ["The creature you have grabbed or restrained. Until the start of your next turn or until it Escapes, it can barely speak: DC 10 flat check or lose any action that needs speech (a single DC 10 for a spell that also has manipulate, not grabbed's extra DC 5)."]
    },
    {
        uuid: pf2e("LFS9M737RCt0Jq8r"), name: "Rejoice in Solstice Storm",
        text: `<p>All creatures in a @Template[type:emanation|distance:30] take @Damage[(ceil((1+@actor.level)/2))d8[electricity]|options:area-damage] damage with a @Check[reflex|against:class|basic|options:area-effect] save against your class DC.</p>`,
        notes: ["Four seasonal cones: the card rolls spring's electricity. Summer is bludgeoning (critical failure: prone), fall slashing (off-guard until the end of its next turn), winter cold (stupefied until the end of its next turn); spring's critical failure: clumsy until the end of its next turn."]
    },
    {
        uuid: pf2e("5Jc2ySGLVi053qpz"), name: "Twist the Knife",
        text: `<p>The target takes @Damage[(1+floor((@actor.level+1)/6))[persistent,bleed]] damage.</p>`,
        notes: ["Persistent bleed equal to your sneak attack dice: the card counts a rogue's (1 at 1st, 2 at 5th, 3 at 11th, 4 at 17th). After a melee Strike that dealt sneak attack damage to an off-guard target."]
    },
    {
        uuid: teams("clerics-remaster", "clerics-feats", "KD1HERdiPVfiLhQz"), name: "Spirit Burn",
        text: `<p>The target takes @Damage[(floor((@actor.level -1)/2) +1)[persistent,spirit]] damage and is ${enfeebled(1)}.</p>`,
        notes: ["The enfeeblement lasts as long as the persistent damage. One that removes it is immune for 1 minute."]
    },
    {
        uuid: teams("pf2e-team-plus-oracles-remastered", "items", "lPmoD6uDLfXLeESI"), name: "Feel My Pain",
        text: `<p>A creature within 30 feet must attempt a @Check[will|against:spell] save against your spell DC.</p>${degrees("The creature is unaffected.", "The creature takes the same persistent damage you took.", "The creature takes the same persistent damage you took.")}`
    },
    {
        uuid: teams("pf2e-team-plus-oracles-remastered", "items", "cqHkO95lnvRc4iFu"), name: "Inevitable Fate",
        text: `<p>The triggering creature must attempt a @Check[will|against:spell] save against your spell DC.</p>${degrees("The creature is unaffected.", "The triggering action gains the misfortune trait.", "The triggering action gains the misfortune trait.")}`,
        notes: ["Only against a fortune action. A misfortune action instead gains the fortune trait, with no save: the two cancel out."]
    }
];

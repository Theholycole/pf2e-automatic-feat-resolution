// One-off combat feats, batch 17 (2026-11-05, Cole: "Grind everything" — the feats the module had only as a reminder timer or not at all):
// an oracle's bones and
// conditions the timer only reminded of (Flashing Shield, Defy Sorrow, Aggressive Block, Call the Hunt).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const offGuard = "@UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{Off-Guard}";

export default [
    {
        // (The Bad result, the one with a roll: its Will save. The Good one is PF2e's own Effect, linked in the feat.)
        uuid: pf2e("7Q7HWETkvOM9pYwV"), name: "Roll the Bones of Fate", target: "one creature you observe within 30 feet",
        text: "<p>The target attempts a @Check[will|against:spell] save against your spell DC.</p><hr /><p><strong>Critical Success</strong> The target is unaffected.</p><p><strong>Success</strong> The target is unaffected.</p><p><strong>Failure</strong> The target rolls twice on its next attack roll or skill check that takes an action, and takes the lower result.</p><p><strong>Critical Failure</strong> The target rolls twice on its next attack roll or skill check that takes an action, and takes the lower result.</p>",
        notes: ["Roll [[/r 1d4 #Roll the Bones of Fate]] first. 1 Good: PF2e's Effect: Roll the Bones of Fate (Good) on you or an ally within 30 feet (in the feat). 2 Bad: this save. 3 Mixed: both. 4 Cursed: every creature within 30 feet rolls twice on its next attack roll or skill check (odd highest die: lower, even: higher). Any earlier result ends."]
    },
    {
        uuid: pf2e("1NS6AM2oVNKb4LhX"), name: "Flashing Shield", target: "the undead whose attack you Shield Blocked",
        text: `<p>The target takes @Damage[(floor(@actor.level/2))[vitality]] damage and is ${offGuard} for 1 round.</p>`,
        notes: ["Only an adjacent undead."]
    },
    { uuid: pf2e("L9i3zTvw9htpyK6r"), name: "Defy Sorrow", affect: { target: "you", effects: [{ slug: "quickened", duration: rounds(1, "turn-end") }] }, notes: ["The extra action only to Step or Stride."] },
    { uuid: pf2e("19OLlTrxvEtDAOHc"), name: "Aggressive Block", affect: { target: "the adjacent creature whose attack you Shield Blocked", effects: [{ slug: "off-guard", duration: rounds(1) }] }, notes: ["The creature chooses: off-guard until your next turn, or Shoved 5 feet in a direction you choose (then remove the condition and move its token). It must take off-guard if the push would hit a wall, difficult terrain or a creature."] },
    { uuid: pf2e("syIPNelJTQSkErvu"), name: "Call the Hunt", affect: { target: "your hunted prey", effects: [{ slug: "off-guard", duration: rounds(1) }] }, notes: ["Off-guard only to melee attacks, and only while it's within reach of you and an ally. If you're sanctified, your and your allies' Strikes against it gain your sanctification."] }
];

// Batch 28 (2026-11-05): reactions that were only reminders. Lucky Escape gives the attacker misfortune on the
// triggering attack, Scout's Warning puts +1 initiative on the allies you target, and Commitment to Valor lowers
// frightened and swaps fleeing for stupefied. Deflecting Shot (+2 AC on the hit ally) and Sacrifice Armor
// (resistance twice the armor's level) cover the triggering hit only. (Leshy Superstition and Reactive Resilience already have PF2e toggles;
// Prescience has PF2e's own Effect.)

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const NOW = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };
const ROUND = { value: 1, unit: "rounds", expiry: "turn-start", sustained: false };

export default [
    { uuid: pf2e("Xb8CyW9sYS27ElcC"), name: "Lucky Escape", toggle: { who: "target", rules: [{ key: "RollTwice", selector: "attack-roll", keep: "lower", removeAfterRoll: true }], duration: ROUND }, notes: ["Target the attacker before it rolls: it rolls the triggering attack twice and takes the worse result."] },
    { uuid: pf2e("Tpcq3Lk7qEOZ3LDP"), name: "Scout's Warning", toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "initiative", type: "circumstance", value: 1 }], duration: ROUND }, notes: ["Target your allies before they roll initiative. +2 instead if you were Scouting: raise the Effect's bonus."] },
    { uuid: pf2e("LuVFotZD7ifyUROq"), name: "Commitment to Valor", affect: { target: "you", effects: [{ kind: "condition", slug: "frightened", value: 0, duration: null, stack: { by: -1 } }, { slug: "stupefied", value: 1, duration: null }] }, notes: ["Instead of fleeing: remove Fleeing if PF2e added it. Stupefied 1 lasts as long as you would have been fleeing; remove it then."] },
    { uuid: pf2e("ToZw6ZjB0JhWwMeR"), name: "Deflecting Shot", toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "ac", type: "circumstance", value: 2, slug: "deflecting-shot" }], duration: NOW }, notes: ["Target the ally that was hit: +2 AC against the triggering attack only. If that turns the hit into a miss, undo its damage. Remove the Effect after."] },
    { uuid: pf2e("bYijGvCvCmJnW6aA"), name: "Sacrifice Armor", toggle: { rules: [{ key: "Resistance", type: "physical", value: "2*@actor.wornArmor.level", slug: "sacrifice-armor" }], duration: NOW }, notes: ["Only the triggering Strike's damage: remove the Effect once it's applied. Your armor becomes broken (Hit Points to its Broken Threshold), or is destroyed if it was already damaged."] }
];

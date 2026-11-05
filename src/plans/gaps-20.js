// One-off combat feats, batch 20 (2026-11-05, Cole: "Grind everything"): saves that stupefy (Histrionic Injury, a witch familiar's
// Patron's Presence), off-guard foes (Noble Sacrifice, Sudden Mindfulness), smoke that conceals (Swing the Censer), a house's extra damage
// (For My House!) and a sovereign's +2 to its knights (Sovereign's Blade).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const ROUND = { value: 1, unit: "rounds", expiry: "turn-start", sustained: false };
const stupefied = (value) => `@UUID[Compendium.pf2e.conditionitems.Item.Stupefied]{Stupefied ${value}}`;
const save = (check, fail, critFail) => `<p>The target attempts a ${check} save.</p><hr /><p><strong>Critical Success</strong> The target is unaffected.</p><p><strong>Success</strong> The target is unaffected.</p><p><strong>Failure</strong> The target is ${fail}.</p><p><strong>Critical Failure</strong> The target is ${critFail}.</p>`;

export default [
    {
        uuid: pf2e("47ZB8mYBtBt1C7zh"), name: "Histrionic Injury", target: "the creature whose melee Strike damaged you",
        text: save("@Check[will|against:class-spell]", `${stupefied(1)} for 1 round`, `${stupefied(2)} for 1 round`),
        notes: ["Once per hour."]
    },
    {
        uuid: action("VBwNo2Wbfd4n4Y3g"), name: "Patron's Presence", target: "each enemy in the 15-foot emanation about your familiar",
        text: save("@Check[will|against:spell]", stupefied(2), stupefied(3)),
        notes: ["The aura lasts until the end of your next turn (your familiar can Sustain it up to 1 minute): post it again for an enemy that enters it or starts its turn there. The stupefied lasts only while the enemy stays in the aura."]
    },
    { uuid: pf2e("K0zDniOVUL4C77lk"), name: "Noble Sacrifice", affect: { target: "the enemy whose Strike would have hit your knight", effects: [{ slug: "off-guard", duration: rounds(1, "turn-end") }] }, notes: ["Spend a Mythic Point. Your knight Steps, you Stride into its space (ignoring difficult terrain) and take the damage instead; you can Shield Block it."] },
    { uuid: pf2e("qT68NpouO667sUMA"), name: "Sudden Mindfulness", affect: { target: "the creature whose effect you saved against", effects: [{ slug: "off-guard", duration: rounds(1, "turn-end") }] }, notes: ["Your success on the triggering save is a critical success. The creature is off-guard only to you."] },
    { uuid: action("gfIwrgl03Y4mCmhC"), name: "Swing the Censer", affect: { target: "each creature in your censer's smoke", effects: [{ slug: "concealed", duration: rounds(1) }] }, notes: ["Creatures outside the smoke are also concealed to those inside it."] },
    {
        uuid: action("DRHtgPhncTSs7Sdd"), name: "For My House!",
        toggle: { rules: [{ key: "FlatModifier", selector: ["strike-damage", "spell-damage"], value: 1 }], duration: ROUND },
        notes: ["Only against creatures that witnessed the display. +2 if you're expert in Cheliax Lore, Genealogy Lore, Heraldry Lore, Performance or Warfare Lore, +3 master, +4 legendary: edit the Effect."]
    },
    {
        uuid: pf2e("YXuhZHEUXXi9Dhqx"), name: "Sovereign's Blade",
        toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "attack-roll", type: "status", value: 2 }], duration: ROUND },
        notes: ["Spend a Mythic Point; you counteract magical darkness of counteract rank 7 or lower. Target the knights adjacent to you after they Stride (each may Stride twice toward you as a reaction)."]
    }
];

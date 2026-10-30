// More feats that put a condition on the character, its target, its allies or its foes with no roll, by hand (2026-10-30, the loop): as
// affects.js.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const untilYourNextTurnStarts = rounds(1);
const untilYourNextTurnEnds = rounds(1, "turn-end");

export default [
    { uuid: pf2e("SyxXnSk2R0AM9HSn"), name: "Flickering Twirl", affect: { target: "you", effects: [{ slug: "concealed", duration: untilYourNextTurnStarts }] }, notes: ["You can't use it to Hide."] },
    { uuid: action("AJeLwbQBt1YH3S6v"), name: "Fade Into Daydreams", affect: { target: "you", effects: [{ slug: "concealed", duration: untilYourNextTurnStarts }] }, notes: ["You can't use it to Hide."] },
    { uuid: pf2e("9L0iFYeSCMvrzme4"), name: "Banner Twirl", affect: { target: "you and each ally within 5 feet", effects: [{ slug: "concealed", duration: untilYourNextTurnStarts }] }, notes: ["Concealed only from ranged attacks."] },
    { uuid: pf2e("n4755xLnUbsKYfUM"), name: "Statue", affect: { target: "you", effects: [{ slug: "off-guard", duration: null }] }, notes: ["Until you next act: remove it then. You look like a statue and don't need to eat, drink or breathe; see the feat for your Deception DC."] },
    { uuid: pf2e("F6VlPyZZpqV6d2CS"), name: "Flensing Slice", affect: { target: "the creature both your Double Slice attacks hit", effects: [{ slug: "off-guard", duration: untilYourNextTurnStarts }] }, notes: ["It also takes 1d8 persistent bleed damage per weapon damage die of your bigger weapon (at most 4d8), and its resistances to physical damage are 5 lower until your next turn: PF2e's Effect: Flensing Slice, from the feat."] },
    { uuid: pf2e("gXAAJCnjfCDK7YV2"), name: "Cleansing Light", affect: { target: "each enemy within 20 feet", effects: [{ slug: "dazzled", duration: untilYourNextTurnEnds }] }, notes: ["You and each ally within 20 feet benefit from a 4th-rank Restoration, by hand."] }
];

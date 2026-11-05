// Combat reactions no reader or hand plan covered, from the simulator's feat gap index, batch 16 (2026-11-05, Cole: "keep going for as
// long as you can"): a thaumaturge's superstition against a misfortune, a herald's shout against an auditory effect.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const THIS_TURN = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    {
        // (A fortune on the next check, the Effect gone after it: with the misfortune on that roll, PF2e cancels the two and rolls once —
        // endsAfter, as PF2e's removeAfterRoll doesn't fire on that plain 1d20, and not with it, as PF2e's own delete then throws; Foundry tests. Hey! Over Here!'s, after the auditory save.)
        uuid: pf2e("17jjQPpnBkHRkzPE"), name: "Turn Away Misfortune",
        toggle: { rules: [{ key: "RollTwice", selector: "check", keep: "higher", removeAfterRoll: false }], duration: THIS_TURN, endsAfter: ["check"] },
        notes: ["Only as you're about to attempt a roll a misfortune effect affects: the Effect cancels it on that roll, then goes. No other fortune on that roll."]
    },
    {
        uuid: pf2e("rVgEkpTLfbeOdzzw"), name: "Hey! Over Here!",
        toggle: { who: "target", rules: [{ key: "AdjustDegreeOfSuccess", selector: "saving-throw", predicate: ["item:trait:auditory"], adjustment: { all: "one-degree-better" } }], duration: THIS_TURN, endsAfter: ["saving-throw", "item:trait:auditory"] },
        notes: ["Target the ally within 30 feet about to save against an auditory effect: one degree better on that save. The ally is then immune for 24 hours."]
    }
];

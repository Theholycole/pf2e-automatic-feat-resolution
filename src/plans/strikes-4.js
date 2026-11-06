// Class and archetype Strike feats, by hand (2026-11-03, Cole's pick: the Strike riders in the feat module): what the reader can't take from
// the text — a push said outside a hit sentence, a number that grows with level, a finisher's own dice. As strikes-3.js, the card plays the
// Strike; what the card doesn't apply is a note for the GM. Numbers that grow with level are their first step; the note gives the rest.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const ranged = { strike: "ranged", anyStrike: false };

export default [
    // ("As long as you don't critically fail, the target becomes Off-Guard … until the start of your next turn": on a hit here; a failure's
    // off-guard is the GM's.)
    { uuid: pf2e("jIMeialR9CBo1bx9"), name: "Levering Strike", strike: { melee: true, onHit: { conditions: [{ slug: "off-guard", value: null, duration: { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-start", anchor: "source-turn" } }] }, notes: ["With your staff. On a failure too (not a critical failure), the target is off-guard until the start of your next turn; it also takes –2 to its DCs against Shove, Trip and Tumble Through."] } },
    // ("If you hit and deal damage to the target, you push them up to 15 feet away from you.")
    { uuid: pf2e("X5SZIwtYpx0r9MPx"), name: "Demolishing Knockback", strike: { onHit: { push: 15 }, notes: ["Spend a Mythic Point; the Strike is at mythic proficiency. Pushed through an object of Hardness 5 or less, the target takes 2d6 bludgeoning more."] } },
    // ("Critical Success The target is pushed 10 feet away from you. Success The target is pushed 5 feet away from you. Failure The target is
    // Off-Guard for 1 round.")
    { uuid: pf2e("0qL4a3CarG1e0pfB"), name: "Forceful Shot", strike: { ...ranged, onHit: { push: 5, criticalPush: 10 }, notes: ["On a failure, the target is off-guard for 1 round."] } }
];

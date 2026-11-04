// Combat passives no reader or hand plan covered, from the simulator's feat gap index, batch 6 (2026-11-04, Cole: "Prioritize the combat
// passives and actions"): PF2e's own Effect linked in the text, toggled from the card (passive-effects.js's), and a heal spell's rider.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const effect = (name) => `Compendium.pf2e.feat-effects.Item.Effect: ${name}`;
const RANK = "ceil(@actor.level/2)";

export default [
    { uuid: pf2e("hLYoIjH8gPEVXyWG"), name: "Distracting Feint", passiveEffect: { effect: effect("Distracting Feint"), who: "target" }, notes: ["While the creature is off-guard from your Feint."] },
    { uuid: pf2e("hXYnwpi95E77qfAu"), name: "Goading Feint", passiveEffect: { effect: effect("Goading Feint"), who: "target" }, notes: ["Instead of Feint's own results: on a success, its next attack roll against you; on a critical success, all of them until the end of its next turn."] },
    { uuid: pf2e("aMef2VM4mSxl0pmy"), name: "Replenishment of War", passiveEffect: { effect: effect("Replenishment of War"), who: "you" }, notes: ["When you damage a creature with a Strike using your deity's favored weapon (your level on a critical hit). Shared Replenishment: target an ally within 10 feet instead."] },
    { uuid: pf2e("QCUylerXd0VB9jU9"), name: "Defender's Grit", passiveEffect: { effect: effect("Defender's Grit"), who: "you" }, notes: ["When you start your turn adjacent to your designated ally."] },
    { uuid: pf2e("CkK7WwaWnrLXK9sW"), name: "Methodical Debilitations", passiveEffect: { effect: effect("Methodical Debilitations (Cover)"), who: "target" }, notes: ["The cover debilitation, from your Debilitating Strike. For the flanking one, PF2e's Effect: Methodical Debilitations (Flanking)."] },
    // A heal spell's rider on the undead it damaged.
    {
        uuid: pf2e("PGyzFBwuTgypU8cD"), name: "Panic the Dead",
        affect: { target: "each undead that failed its save against your heal spell", effects: [{ slug: "frightened", value: 1 }] },
        notes: ["On a critical failure it's also fleeing until the start of your next turn. Mindless undead aren't immune."]
    },
    {
        uuid: pf2e("nLTTph2tgwcQghVq"), name: "Cremate Undead", activity: true, target: "each undead your heal spell damaged",
        text: `<p>The target takes @Damage[(${RANK})[persistent,fire]] damage.</p>`,
        notes: ["Persistent fire equal to the heal spell's rank: the card takes your highest rank."]
    }
];

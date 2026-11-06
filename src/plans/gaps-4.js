// The combat feats no reader or hand plan covered, from the simulator's feat gap index, batch 4 (2026-11-04, Cole: "Prioritize the combat
// passives and actions"): a frightened lowered by 1 (Wave the Flag's, affects-3.js), and long moves with the item module's move card
// (teleports.js's, Beneath My Feet's Trample).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const lessFrightened = { kind: "condition", slug: "frightened", value: 0, duration: null, stack: { by: -1 } };

export default [
    {
        uuid: pf2e("auv1lss6LxM0q3gz"), name: "Shake it Off",
        affect: { target: "you", effects: [lessFrightened] },
        notes: ["Then a Fortitude save against your sickened's DC, as if retching: sickened −1 on a failure, −2 on a success, −3 on a critical success, none on a critical failure."]
    },
    {
        uuid: pf2e("L2mQO4q8nPdUDVjO"), name: "Banner's Inspiration",
        affect: { target: "each ally within 30 feet", effects: [lessFrightened] },
        notes: ["Only allies benefiting from your commander's banner. Each can retry a save against one mental effect now, and is then immune to Banner's Inspiration for 10 minutes."]
    },
    {
        uuid: pf2e("WU9G9p2ezx2YDLhv"), name: "Trample (Centaur)",
        teleport: { speedTimes: 2, move: { verb: "Stride", lines: ["Through the spaces of creatures at least one size smaller, Trampling each creature whose space you enter"] } },
        notes: ["Each creature you Trample (once each) takes your hoof attack's bludgeoning damage (your unarmed attack's without one), basic Reflex save against your class DC: by hand."]
    },
    {
        uuid: pf2e("7GGxoXYNA4YrtML9"), name: "Trample (Sarangay)",
        teleport: { speedTimes: 2, move: { verb: "Stride", lines: ["Through the spaces of creatures at least one size smaller, Trampling each creature whose space you enter"] } },
        notes: ["Each creature you Trample (once each) takes your horns attack's piercing damage, basic Reflex save against the higher of your class or spell DC: by hand."]
    },
    {
        uuid: pf2e("p2I4o9Cc6UrXvjhO"), name: "Furious Sprint",
        teleport: { speedTimes: 5, move: { verb: "Stride", lines: ["In a straight line", "Up to eight times your Speed with 3 actions", "Any Stride can be a Balance with Athletics"] } }
    }
];

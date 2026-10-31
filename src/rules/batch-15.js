// Batch 15 (2026-10-31, round 95; Cole's pick "then terrain"): passives that hold in a kind of terrain, on PF2e's own terrain roll options
// ("terrain:urban", "terrain:aquatic"), which the scene's environment and the environment module's regions set where the token stands. The
// off-guard of a foe in difficult terrain is scripts/terrain.js's target:terrain:difficult, as batch 9's.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const OFF_GUARD = "Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg";
const offGuardIf = (selectors, ...predicate) => ({ key: "EphemeralEffect", affects: "target", selectors, predicate, uuid: OFF_GUARD });
const ATTACKS = ["strike-attack-roll", "spell-attack-roll", "strike-damage", "attack-spell-damage"];

export default [
    // (Its Step into difficult terrain is the player's; "outdoor" PF2e can't tell, the urban terrain it can.)
    { uuid: pf2e("MII0ybm76DkDxsId"), name: "Cobble Dancer", rules: [offGuardIf(ATTACKS, "terrain:urban", "target:terrain:difficult")] },
    // (Your ranged attacks while you're in water, against a creature that isn't: "above you or on land". One above you in the water too is the
    // player's.)
    { uuid: pf2e("7RWQZDidyK2MYbE8"), name: "Concealing Currents", rules: [offGuardIf(["strike-attack-roll", "strike-damage"], "terrain:aquatic", "item:ranged", { not: "target:terrain:aquatic" })] },
    // (Round 104: Spirit Walk's bonus as a note on Recall Knowledge, which carries no target options in PF2e 8.6; Marshal Dedication's
    // own +1 against fear is PF2e's Effect: Marshal's Aura.)
    { uuid: pf2e("CmGe2c5fecj837P9"), name: "Spirit Walk", rules: [{ key: "Note", selector: "skill-check", predicate: ["action:recall-knowledge"], title: "{item|name}", text: "<p>+2 status bonus if the subject is a spirit, haunt or undead (you and allies within 30 feet).</p>" }] },
    // (Round 105: its living creatures as PF2e's lifesense; a nonliving one with the electricity trait is the player's.)
    { uuid: pf2e("hHeh1ct8YceyeykX"), name: "Attuned Electroreceptors", rules: [{ key: "Sense", selector: "lifesense", acuity: "imprecise", range: 20 }] }
];

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
    // (Round 104: the bonus's own part for you; an aura's for allies is PF2e's Aura rule, which needs an Effect: the allies' by hand.)
    { uuid: pf2e("MYzRfNExDYp25rro"), name: "Marshal Dedication", rules: [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: 1, predicate: ["item:trait:fear"] }] },
    { uuid: pf2e("CmGe2c5fecj837P9"), name: "Spirit Walk", rules: [{ key: "FlatModifier", selector: "skill-check", type: "status", value: 2, predicate: ["action:recall-knowledge", { or: ["target:trait:spirit", "target:trait:undead", "target:trait:haunt"] }] }] }
];

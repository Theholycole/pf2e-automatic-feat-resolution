// Batch 8 (2026-10-31, Cole: "We have a environment module with difficult terrain"): the passives that ignore difficult terrain, as PF2e's
// own entries on the creature (Unimpeded Journey's ActiveEffectLike on system.movement.terrain). PF2e applies the entries for every
// environment and feature; the environment module's terrain costs (scripts/terrain-cost.js) apply the ones naming an environment or a
// feature. Ignoring difficult terrain makes greater difficult terrain difficult; a "greater" entry ignores that too.

const ignore = (environment, feature, greater = false) => ({ key: "ActiveEffectLike", mode: "add", path: `system.movement.terrain.${greater ? "greater" : "difficult"}.ignored`, value: { environment, feature } });
const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const heritage = (id) => `Compendium.pf2e.heritages.Item.${id}`;

export default [
    { uuid: pf2e("6UucEQumAx9sAEvF"), name: "Skilled Swimmer", rules: [ignore("aquatic", "all")] },
    { uuid: pf2e("ZBm542xaWmneueq4"), name: "Fishblooded", rules: [ignore("aquatic", "all")] },
    { uuid: pf2e("chM3Pya6H8QGnEGo"), name: "Water Dancer", rules: [ignore("aquatic", "all"), ignore("swamp", "all")] },
    { uuid: pf2e("PfEx4s0TRFgAaITi"), name: "Aquatic Passage", rules: [ignore("aquatic", "all"), ignore("swamp", "all")] },
    { uuid: pf2e("NHlCta7B1Lmt3S7w"), name: "Jungle Runner", rules: [ignore("forest", "undergrowth")] },
    { uuid: pf2e("lKgpe2JKaeLjgnYF"), name: "Forest Passage", rules: [ignore("all", "undergrowth")] },
    { uuid: pf2e("6Qd7AA3Hp0KlALnF"), name: "Bamboo and Silt Repose", rules: [ignore("all", "undergrowth"), ignore("swamp", "all")] },
    { uuid: pf2e("FZuQPFnQ5UkBWLU9"), name: "Steady on Stone", rules: [ignore("all", "rubble")] },
    { uuid: pf2e("p6j4nLPRwksjfwPW"), name: "Snow Step", rules: [ignore("all", "snow"), ignore("all", "ice")] },
    { uuid: pf2e("Mix4IwZRuCz7JS3T"), name: "Greater Snow Step", rules: [ignore("all", "snow", true), ignore("all", "ice", true)] },
    { uuid: pf2e("2sCzFjq8sKvBR3Jh"), name: "Ultimate Skirmisher", rules: [ignore("all", "all"), ignore("all", "all", true)] },
    { uuid: pf2e("4o9g5g12yyrfZ3Xd"), name: "Light Step", rules: [ignore("all", "all")] },
    { uuid: pf2e("kMPnfNzTuXrLTUii"), name: "Crushing Step", rules: [{ ...ignore("all", "all"), predicate: [{ or: ["armor:category:medium", "armor:category:heavy"] }] }] },
    { uuid: heritage("HpqQ5VQ0w4HqYgVC"), name: "Jungle Catfolk", rules: [ignore("all", "undergrowth")] },
    { uuid: heritage("xtRIYizCjLg9qe1Z"), name: "Wildwood Halfling", rules: [ignore("all", "undergrowth")] },
    { uuid: heritage("lDT5h3f5GXRj42Ir"), name: "Stonestep Shisk", rules: [ignore("all", "rubble")] },
    { uuid: heritage("ClshvrjvBTMm3INX"), name: "Bandaagee Vanara", rules: [ignore("all", "crowd")] }
];

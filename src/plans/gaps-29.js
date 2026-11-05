// Batch 29 (2026-11-05): "the triggering attack roll targets your <statistic> DC instead of your AC" (Foresee Danger, Sense the
// Strike, Night's Warning, Hunter's Defense, You Failed to Account For... This!). The Effect is an untyped modifier to AC of that DC
// minus your AC as it is when you post it (fillNow), so the attack meets the DC; your conditions still apply as the feats say, since
// they stay on you (an off-guard PF2e adds only during the attack, as from flanking, still lowers it by 2). It ends after the next attack roll against you (endsAfter "attacked", scripts/effects.js).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const NOW = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };
const insteadOfAC = (uuid, name, dc, more = []) => ({
    uuid: pf2e(uuid), name,
    toggle: { rules: [{ key: "FlatModifier", selector: "ac", type: "untyped", value: `${dc} - @actor.attributes.ac.value`, slug: `${name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}-dc` }], duration: NOW, endsAfter: ["attacked"], fillNow: true },
    notes: ["Post it before the attacker rolls: your AC becomes that DC for the triggering attack, and the Effect goes after it. If the attacker gets off-guard from flanking, the GM adds 2 back.", ...more]
});

export default [
    insteadOfAC("pVDgiaqu1RbCOhuv", "Foresee Danger", "@actor.perception.dc.value"),
    insteadOfAC("h85DAkAPGjRFwIuf", "Sense the Strike", "@actor.skills.survival.dc.value"),
    insteadOfAC("Pk6qGMlef5SMhhwE", "Night's Warning", "@actor.skills.occultism.dc.value", ["Once per hour, and only where you can see the night sky."]),
    insteadOfAC("KYTSvAEqK7KAyVwi", "Hunter's Defense", "@actor.skills.nature.dc.value", ["Once per hour, against an animal, beast, elemental, fey, fungus or plant."]),
    insteadOfAC("zBS1qFyIpFuCGhWW", "You Failed to Account For... This!", "@actor.skills.crafting.dc.value")
];

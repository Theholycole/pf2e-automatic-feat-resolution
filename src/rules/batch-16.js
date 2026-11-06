// Batch 16 (2026-11-04, the simulator's feat gap index, Cole: "Prioritize the combat passives and actions"): a proficiency the feat raises
// with no rule element of PF2e's for it.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const upgrade = (path, value) => ({ key: "ActiveEffectLike", mode: "upgrade", path, value });

export default [
    { uuid: pf2e("VD446AflrQ3kO1al"), name: "Evasiveness", rules: [upgrade("system.saves.reflex.rank", 3)] }
];

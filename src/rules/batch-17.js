// Combat passives PF2e's rules don't hold, batch 17 (2026-11-04, Cole: "Keep going"): a 20th-level rogue's full sneak attack on a target
// that isn't off-guard, in place of Sly Striker's dice.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const SNEAK = "@actor.flags.system.sneakAttackDamage.number";
const SLY = `ternary(gte(@actor.level,14),ternary(gte(${SNEAK},3),2,1),1)`;
const dice = (diceNumber, predicate) => ({ key: "DamageDice", selector: "strike-damage", category: "precision", diceNumber, dieSize: "d{actor|flags.system.sneakAttackDamage.faces}", predicate: ["item:tag:sneak-attack", { not: "target:condition:off-guard" }, ...predicate] });

export default [
    // (With Sly Striker, the dice its rule already adds are counted: what's left of the full sneak attack.)
    { uuid: pf2e("mSqzGGttJvj4LxK9"), name: "Impossible Striker", rules: [dice(`${SNEAK} - ${SLY}`, ["feat:sly-striker"]), dice(SNEAK, [{ not: "feat:sly-striker" }])] }
];

// An eidolon's actions, by hand (2026-10-30, the loop: "Companions"). They play from the eidolon's token with its own Strikes, Strength
// and level, and its saves are against the summoner's spell DC (src/compiler/companion.js finds the summoner).

const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const summoners = (id) => `Compendium.pf2e-summoners-plus.misc.Item.${id}`;
const condition = (id, label) => `@UUID[Compendium.pf2e.conditionitems.Item.${id}]{${label}}`;
const slowed = condition("xYTAsEpcJE1Ccni3", "Slowed 1");
const confused = condition("yblD8fOR1J8rDwEQ", "Confused");
const degrees = (success, failure, criticalFailure, criticalSuccess = "The creature is unaffected.") =>
    `<hr /><p><strong>Critical Success</strong> ${criticalSuccess}</p><p><strong>Success</strong> ${success}</p><p><strong>Failure</strong> ${failure}</p><p><strong>Critical Failure</strong> ${criticalFailure}</p>`;
const recharge = "Your eidolon can't use it again for 1d4 rounds.";
const demoralize = (uuid, name, target, notes = []) => ({ uuid, name, act: "demoralize", ...(target ? { target } : {}), notes });

export default [
    // Saves against your spell DC
    {
        uuid: action("Vr3w3t028ZKDg0mO"), name: "Dragon Breath (Eidolon)",
        text: `<p>All creatures in a @Template[type:cone|distance:30] take @Damage[(ceil(@actor.level/2))d6[@item.flags.pf2e.rulesSelections.dragonBreathDamage]|options:area-damage] damage with a @Check[reflex|against:spell|basic|options:area-effect] save against your spell DC.</p>`,
        notes: ["Your eidolon's own area: the card's template is a 30-foot cone (a 60-foot line if that's your eidolon's); target the creatures in it.", recharge]
    },
    {
        uuid: action("Cb9XbKqHBHPAbQKk"), name: "Elemental Burst",
        text: `<p>All creatures in a @Template[type:burst|distance:20] within 60 feet take @Damage[(max(6,(@actor.level - 1)))d6[untyped]|options:area-damage] damage with a @Check[reflex|against:spell|basic|options:area-effect] save against your spell DC.</p>`,
        notes: ["Fire for a fire elemental, otherwise your eidolon's primary attack's physical type: the card rolls untyped. Your eidolon first loses Hit Points equal to your level."]
    },
    {
        uuid: action("Wukpm200zHDuS85V"), name: "Swarming Assault",
        text: `<p>Each creature in your eidolon's space takes @Damage[(ceil(@actor.level/2))d6[piercing]|options:area-damage] damage with a @Check[reflex|against:spell|basic|options:area-effect] save against your spell DC.</p>`,
        notes: ["Target the creatures in its space. Piercing or slashing, your choice: the card rolls piercing.", recharge]
    },
    {
        uuid: pf2e("si8FGX2ZRxetdVHp"), name: "Constricting Hold", target: "the creature you have grabbed",
        text: `<p>The creature you have grabbed or restrained takes @Damage[(@actor.level+@actor.abilities.str.mod)[bludgeoning]] damage with a @Check[fortitude|against:spell|basic] save against your spell DC.</p>`,
        notes: []
    },
    {
        uuid: action("iJLzVonevhsi2uPs"), name: "Visions of Sin",
        text: `<p>A creature within 30 feet must attempt a @Check[will|against:spell|traits:emotion,mental] save against your spell DC.</p>${degrees("The creature can't use reactions until the end of your next turn.", `The creature is ${slowed} until the end of your next turn and can't use reactions.`, `As failure, and the creature is also ${confused} for 1 round.`)}`,
        notes: ["Your eidolon can Sustain it to 1 minute. An unholy target takes a –2 circumstance penalty to its save. Whatever its save, it's immune for 1 day."]
    },
    {
        uuid: summoners("0fvd9aASh27TJYOj"), name: "Incarnate Arrival",
        text: `<p>All creatures in a @Template[type:emanation|distance:10] take @Damage[(2+(floor(@actor.level/2)))d4[untyped]|options:area-damage] damage with a @Check[reflex|against:spell|basic|options:area-effect] save against your spell DC.</p>`,
        notes: ["Only on the turn your eidolon manifests. The damage type it chose from its list: the card rolls untyped."]
    },
    // Demoralize
    demoralize(action("kbUymGTjbesOKsV6"), "Primal Roar", "each enemy within 30 feet", ["One Intimidation check against each enemy that can hear it, with no penalty for not sharing a language."]),
    demoralize(action("4oHjLO6qMfxIchRB"), "Haunting Visage", null, ["A creature within 15 feet. Visual, not auditory, with no penalty for not sharing a language. On a success it's also off-guard for 1 round."]),
    demoralize(summoners("1GrcVMZtL3xAay6x"), "Be Not Afraid!", null, ["+2 circumstance against an unholy creature. Then each ally within 30 feet reduces its frightened condition by 1."]),
    demoralize(summoners("CqysXOAp6rpgojAF"), "Glory Seeker", null, ["No penalty for not sharing a language. On a success, its frightened can't drop below 1 while your eidolon has Struck it or used an Athletics maneuver on it since its last turn."]),
    // Strikes
    // (Its save after the hit, rewritten with the void damage: 2026-10-30 Foundry test, the half-level damage was a note.)
    {
        uuid: action("JPHWzD2soqjffeSU"), name: "Drain Life",
        text: `<p>You Strike a living enemy. If the Strike hits and deals damage, the target must attempt a @Check[fortitude|against:spell|options:damaging-effect,inflicts:drained] save against your spell DC.</p>${degrees(`The target takes @Damage[(floor(@actor.level/2))[void]] damage.`, `The target takes @Damage[(floor(@actor.level/2))[void]] damage and is ${condition("4D2KBtexWXa6oUMR", "Drained 1")}.`, `The target takes @Damage[(floor(@actor.level/2))[void]] damage and is ${condition("4D2KBtexWXa6oUMR", "Drained 2")}.`, "No effect.")}`,
        strike: { melee: true, notes: ["The save on a hit is on its card; on a critical hit, the target uses the result one degree worse. On a failure, your eidolon gains temporary Hit Points equal to the enemy's level (double on a critical failure) for 1 minute."] }
    },
    { uuid: action("cx0juTYewwBmrYWv"), name: "Beast's Charge", strike: { melee: true, strides: 2, notes: ["+1 circumstance to the attack roll if your eidolon moved at least 20 feet in a straight line."] } },
    { uuid: action("tu5viJZT4zFE1sYn"), name: "Whirlwind Maul", strike: { melee: true, notes: ["Against up to four enemies within reach, each with any unarmed attack; the multiple attack penalty rises only after all of them. Use it again for each."] } },
    { uuid: action("H8EXYfvFOSuq6vo8"), name: "Elemental Maelstrom", strike: { melee: true, strides: 1, notes: ["One Strike against each enemy that comes within reach during the Stride; the multiple attack penalty rises only after all of them."] } },
    { uuid: pf2e("tqbldgibtisKjfgf"), name: "Surprising Leap", strike: { melee: true, notes: ["Leap, High Jump or Long Jump (distance up to double your eidolon's Speed), with the Strike at any point of it; it lands upright."] } },
    // The summoner's or rider's feats the companion acts in (by: "companion"): played as its one companion's Strike, from its token
    { uuid: pf2e("exVjUkpAdbzJsxxg"), name: "Tandem Strike", by: "companion", strike: { melee: true, notes: ["Then you make a melee Strike against the same creature. If both hit, combine their damage for resistances and weaknesses; the multiple attack penalty rises only after both."] } },
    { uuid: pf2e("pfos1p4SurbUgpjQ"), name: "Magical Onslaught", by: "companion", strike: { melee: true, notes: ["Then you cast a 1- or 2-action cantrip at the same creature. If this Strike hit, it's off-guard against your spell attack, or takes a –2 circumstance penalty to its save."] } },
    // (Round 77: the beastmaster's and rider's companion activities, "Your companions … learn the X activity": the companion's Strike.)
    { uuid: pf2e("1VLIJgnTUxNlf7T8"), name: "Ferocious Charge", by: "companion", strike: { actions: 2, melee: true, strides: 2, notes: ["In a straight line, then an antlers, head or horn Strike. If it moved at least 20 feet, add @Damage[1d8[untyped]] damage (2d8 if your companion is specialized). It can Burrow, Climb, Fly or Swim instead of Striding."] } },
    { uuid: pf2e("NfNCSLCNmLZZyGqU"), name: "Running Kick", by: "companion", strike: { actions: 2, melee: true, strides: 2, notes: ["A hoof, foot or talon Strike at any point of the movement; the movement doesn't provoke reactions from a creature the Strike damaged."] } },
    { uuid: pf2e("RBvmQJ661GpT5lkt"), name: "Sweeping Tail", by: "companion", strike: { actions: 2, melee: true, onHit: { push: 5, criticalPush: 10 }, notes: ["A tail Strike. Then a second tail Strike against a different creature within reach (post it again), the multiple attack penalty as normal."] } },
    { uuid: pf2e("NtWM5UgKBYvrTLQ4"), name: "Vicious Rend", by: "companion", strike: { actions: 2, melee: true, notes: ["A claw, fist, pincer or talon Strike, then a second against the same target, the multiple attack penalty as normal. If both hit, the target takes @Damage[1d6[persistent,bleed]] damage (2d6 if your companion is specialized)."] } },
    {
        uuid: pf2e("obqFjbH0fciMH5F9"), name: "Sinking Jaws", by: "companion", activity: 1,
        text: `<p>The target takes @Damage[(@actor.level+@actor.abilities.str.mod)[piercing]] damage.</p>`,
        notes: ["Only a creature it has grabbed or restrained with its jaws or fangs."],
        target: "the creature you have grabbed or restrained"
    },
    { uuid: pf2e("BKdKyftmphU9n3Wq"), name: "Death Dive", by: "companion", strike: { melee: true, onHit: { conditions: [{ slug: "prone", value: null, duration: null }] }, notes: ["Your mount Flies twice first, ending lower than it began its turn; you both get +4 circumstance to AC against reactions to it. Prone only if the target is smaller than your mount (on a critical hit, the same size or smaller)."] } }
];

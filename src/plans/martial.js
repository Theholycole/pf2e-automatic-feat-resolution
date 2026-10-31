// The rogue's, ranger's, barbarian's and monk's Strike feats, by hand (2026-10-30). As fighter.js: what a hit does that the readers
// missed, the rest as notes. Saves at the class DC (Felling Shot, Silencing Strike, Master Strike) are left to the readers, which fill the
// character's own class DC.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const untilYourNextTurn = { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-start", anchor: "effect-start" };
const untilItsTurnEnds = { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-end", anchor: "target-turn" };
const oneMinute = { mode: "fixed", value: 1, unit: "minutes", expiry: null, anchor: "effect-start" };

export default [
    // Rogue
    { uuid: pf2e("htOsE4hnSj2gzKdi"), name: "Mug", strike: { melee: true, notes: ["Against an adjacent enemy. If it hits and deals sneak attack damage, you can also Steal from the target, even in combat."] } },
    { uuid: pf2e("qI5ZyuNVME95iXhJ"), name: "Fantastic Leap", strike: { melee: true, notes: ["High Jump or Long Jump first (a High Jump's height as a Long Jump's length), then the melee Strike at the end; you then fall, landing upright with no damage if the fall is no more than the jump's height."] } },
    { uuid: pf2e("qFt6zyWVX1njJf1l"), name: "Quick Draw", strike: { notes: ["Interact to draw the weapon first."] } },
    { uuid: pf2e("4I1Kq53Qfzrrmg2E"), name: "Skirmish Strike", strike: { notes: ["Step and then Strike, or Strike and then Step."] } },
    // Ranger
    { uuid: pf2e("HVwmYfSLhrnCksHV"), name: "Targeting Shot", strike: { strike: "ranged", anyStrike: false, notes: ["Against your hunted prey: ignore its concealed condition and all cover."] } },
    { uuid: pf2e("zrIrpVOvbGS6a3ux"), name: "Perfect Shot", strike: { strike: "ranged", anyStrike: false, notes: ["Against your hunted prey, with a weapon you haven't reloaded since your last turn. On a hit the Strike deals maximum damage (GM: use the maximum, not the roll). Your turn ends after it."] } },
    { uuid: pf2e("xM0vwRFLZgmmI4YJ"), name: "Time Dilation Cascade", strike: { strikes: [null, null, null, null, null, null], notes: ["Six Strikes, at the multiple attack penalty as normal; combine damage on the same creature against resistances and weaknesses. You regain only 1 action next turn."] } },
    { uuid: pf2e("asELpoofuVihcqJ1"), name: "Galloping Launch", strike: { strike: "ranged", anyStrike: false, notes: ["A thrown weapon: its range increment is 15 feet longer (20 if your mount's Speed is 40 feet or more)."] } },
    // Barbarian
    { uuid: pf2e("9kY9B5WgtEleOicn"), name: "Resounding Blow", strike: { melee: true, onHit: { conditions: [{ slug: "deafened", value: null, duration: untilYourNextTurn }], critical: [{ slug: "deafened", value: null, duration: oneMinute }] }, notes: ["Only if the Strike deals damage; a weapon that deals bludgeoning damage."] } },
    { uuid: pf2e("mqLPCNdCSNyY7gyI"), name: "Mage Hunter", strike: { melee: true, onHit: { conditions: [{ slug: "stupefied", value: 1, duration: untilYourNextTurn }], critical: [{ slug: "stupefied", value: 2, duration: untilYourNextTurn }] }, notes: ["Only against a creature you've seen Cast a Spell, and only if the Strike deals damage."] } },
    { uuid: pf2e("nL82Dzh0QwkNkJDA"), name: "Disarming Assault", strike: { melee: true, onHit: { follow: "disarm" } } },
    { uuid: pf2e("5gnBhockV7O32jTR"), name: "Furious Finish", strike: { notes: ["On a hit, a circumstance bonus to damage equal to the rounds left in your Rage (at most 10). Then your Rage ends and you're Fatigued until you rest 10 minutes."] } },
    { uuid: pf2e("7QLLwcSKNGPWdOGG"), name: "Annihilating Swing", strike: { melee: true, notes: ["The Strike ignores the target's resistances. Against an object or surface, it may be destroyed outright (see the feat)."] } },
    { uuid: pf2e("tBMMKWYfzD2OMD30"), name: "Penetrating Projectile", strike: { strike: "ranged", anyStrike: false, notes: ["A piercing ranged or thrown weapon: one Strike against each creature in a 30-foot line, ignoring cover from creatures; roll damage once for all of them."] } },
    // Monk
    { uuid: pf2e("2OYJOFaEkhc8dFbl"), name: "Knockback Strike", strike: { melee: true, onHit: { follow: "shove" }, notes: ["The Shove uses the Strike's multiple attack penalty and doesn't add to it."] } },
    { uuid: pf2e("mXQG0WtHHGVyJfZf"), name: "Wave Dashes Rocks", strike: { melee: true, onHit: { conditions: [{ slug: "prone", value: null, duration: null }, { slug: "clumsy", value: 1, duration: untilItsTurnEnds }, { slug: "enfeebled", value: 1, duration: untilItsTurnEnds }] }, notes: ["Against the creature you have grabbed or restrained, which is then released. Prone, clumsy and enfeebled only if the Strike deals damage."] } },
    { uuid: pf2e("oltE3dIYZlM8s5BI"), name: "Blazing Streak", strike: { melee: true, strides: 2, strikes: ["melee", "melee", "melee", "melee"], notes: ["Strikes against up to four different creatures at any point in the two Strides; flashing spark Strikes deal fire damage instead of slashing."] } },
    { uuid: pf2e("u2fgdFIdQDplKOS3"), name: "Peafowl Strut", strike: { melee: true, notes: ["Step twice, then Strike with the sword Peafowl Stance requires."] } },
    { uuid: pf2e("d7DQhCJKYcLxpHen"), name: "Focused Shot", strike: { strike: "ranged", anyStrike: false, notes: ["Within the weapon's first range increment: ignore the target's concealed condition and all cover."] } },
    { uuid: pf2e("ewbt80Yin18k6oLq"), name: "Tangled Forest Rake", strike: { melee: true, notes: ["A lashing branch Strike. If it hits and deals damage, Reposition the target up to 10 feet, through your space if you like."] } },
    { uuid: pf2e("E4xubBMtj81kX5Bk"), name: "Shattering Strike (Monk)", strike: { melee: true, notes: ["The unarmed Strike bypasses the target's resistances and treats its Hardness as half."] } },
    { uuid: pf2e("wB1ONG2uO7RnD1iC"), name: "Flying Kick", strike: { melee: true, notes: ["Leap, High Jump or Long Jump first; if you end adjacent to a foe, the unarmed Strike, even if it's in midair. You then fall, landing upright with no damage if the fall is no more than the jump's height."] } }
];

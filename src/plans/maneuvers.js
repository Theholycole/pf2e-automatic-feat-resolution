// Feats that use a basic action as written (2026-10-30, docs/feats.md, "Hand-picked"): Dazzling Display's Demoralize against each enemy
// within 30 feet, Tail Spin's Trip, Drive Back's Shove. Each plays the ability module's card for that action, rolled with the character's
// own skill; what the feat changes about it (a bonus, another DC, a wider range) is a note for the GM. Also the Strike feats that end in
// one (Shackles of Law) and the few that put a condition on their target with no roll (Instant Opening).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
// Teams+ (its module's own packs).
const teams = (module, pack, id) => `Compendium.${module}.${pack}.Item.${id}`;
const feats = (id) => teams("pf2e-team-plus-feats", "pf2e-player-options", id);
const tianXia = (id) => teams("pf2e-team-plus-tian-xia", "player-options", id);
const untilYourNextTurnEnds = { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-end", anchor: "effect-start" };
// (Its immunity "for 1 minute" in the notes: the feat's own, not Demoralize's 10 minutes.)
const ownImmunity = (notes) => (notes.some((note) => /\bimmune for 1 minute\b/.test(note)) ? { immunity: { duration: { value: 1, unit: "minutes" }, raw: "Each creature is then temporarily immune for 1 minute." } } : {});
const demoralize = (uuid, name, target, notes = []) => ({ uuid, name, act: "demoralize", ...(target ? { target } : {}), ...ownImmunity(notes), notes });
const each30 = "each enemy within 30 feet";

export default [
    // Demoralize
    demoralize(pf2e("lk80TBn933RECRD7"), "Dazzling Display", each30, ["+1 circumstance if your last action was a critical hit or dropped an enemy. Each creature is then immune for 1 minute."]),
    demoralize(pf2e("HjinlKihkadhkQ4Z"), "Terrifying Howl", each30, ["No penalty for a creature that doesn't understand your language. Each target is then immune for 1 minute."]),
    demoralize(pf2e("UFVw57jWNC4UCfyN"), "Deimatic Display", each30, ["One roll for all, visual instead of auditory, no language penalty; +2 circumstance against animals, beasts and fungi (see the feat)."]),
    demoralize(pf2e("rAUNZfiulXh4zcm6"), "Terrifying Transformation", each30, ["Visual instead of auditory, no language penalty. Each creature is then immune for 1 minute."]),
    demoralize(pf2e("DJn652sW7nstvXf5"), "Threatening Pursuit", each30, ["No language penalty; +2 circumstance if the targets are in a maze or similar place."]),
    demoralize(pf2e("qbFRPTHP96Q9kGpk"), "Flash Your Badge", "each creature in a 30-foot cone", ["Visual. One degree worse against a creature that hasn't broken a law this past week."]),
    demoralize(pf2e("nkYBSuqCWcIgqjj0"), "Brandish Authority", each30, ["Your sign of power stays for 1 minute (see the feat)."]),
    demoralize(pf2e("j305O6rhKvx4sT38"), "Talmandor's Shout", "each enemy within 60 feet", ["Once per day, after an enemy damaged an ally within 30 feet since your last turn."]),
    demoralize(pf2e("ssrublnppwFSvVcb"), "Reach for the Sky", each30, ["One roll for all, after firing into the air. A creature frightened by it raises its hands (and loses a raised shield)."]),
    demoralize(pf2e("SWkeel82rdttxUD3"), "Majestic Proclamation", each30, ["Visual instead of auditory. On a success also dazzled for 1 minute; on a critical success also blinded for 1 round."]),
    demoralize(pf2e("tXn6fJO3Q2dAvCZC"), "Sudden Terror", "1 creature within 30 feet", ["Visual instead of auditory, no language penalty. If you were hidden from it: +2 circumstance, and frightened 2 on a success."]),
    demoralize(pf2e("T8tNZANOWUZiXuzO"), "Terrifying Croak", "1 creature within 30 feet", ["No language penalty. On a success it can't reduce its frightened below 1 for 1 round."]),
    demoralize(pf2e("PLix02TPp7VaClka"), "Idol Threat", null, ["+2 circumstance, against the creature whose precious item you threaten (see the feat for the rest)."]),
    demoralize(pf2e("Xhphe5Lsa4kuU4RG"), "Crossbow Terror", null, ["Reload a crossbow first; +2 circumstance if you hit with a crossbow Strike this turn."]),
    demoralize(pf2e("WQtt44keeBP8t25P"), "Voice Cold as Death", null, ["No language penalty; see the feat for its extra effect."]),
    demoralize(pf2e("TzBP8yiZQHNhei1V"), "Walk the Plank", null, ["On a success you can also make the target Stride up to its Speed along a path you choose (not into obvious harm)."]),
    demoralize(pf2e("XQEoKoFtq8n3wgA3"), "Warning Shot", null, ["Out to the firearm's maximum range; no language penalty."]),
    demoralize(pf2e("RCjMbLyRnG70R7cO"), "Frighten Undead", "1 undead", ["Religion instead of Intimidation if it's higher (then it loses the emotion and mental traits and works on mindless undead)."]),
    demoralize(pf2e("IaJ91ilthFr6PA9q"), "Get Used to Disappointment", "1 creature within 30 feet", ["Against the creature that failed against you on its last turn; it's then immune for 1 minute."]),
    demoralize(pf2e("oFcn7SDOH6W2QhJl"), "Too Angry to Die", null, ["As you stand up after waking from unconscious."]),
    demoralize(action("W4M8L9WepGLamlHs"), "Threatening Approach", null, ["Stride to be adjacent first. On a success the foe is frightened 2 instead of 1."]),
    // Feint
    // (Round 79: the Feint before a Spellstrike, as the feat says; the Spellstrike is then the player's.)
    { uuid: pf2e("tIeVe9jOmxW7NgCK"), name: "Distracting Spellstrike", act: "feint", notes: ["The Feint has the arcane and visual traits and only its basic effects. Then make your Spellstrike against the same target. In Arcane Cascade stance, add your Arcane Cascade extra damage as a status bonus to the Deception check by hand."] },
    { uuid: pf2e("gS9FYlD0Vt8yyZkP"), name: "Grovel", act: "feint", target: "1 creature within 30 feet", notes: ["Against its Will DC instead of its Perception DC, and from up to 30 feet away."] },
    { uuid: pf2e("hPfqQpiq6W8RPCxz"), name: "It Was Me All Along!", act: "feint", target: "1 creature within 30 feet", notes: ["Once per day: drop your disguise, Stride up to your Speed, then Feint a target within 30 feet."] },
    { uuid: pf2e("A2EBy2L4acrehiAA"), name: "Pistol Twirl", act: "feint", notes: ["Within the weapon's first range increment; on a success the foe is off-guard to your melee and ranged attacks."] },
    { uuid: pf2e("AtpMrGXaMPJtDIDR"), name: "Prayer Attack", act: "feint", target: "1 enemy within 30 feet", notes: ["After a success, later uses make the target off-guard to your melee attacks without a roll (see the feat)."] },
    // Trip
    { uuid: pf2e("rnEfO5eyRw7Fywzb"), name: "Tail Spin", act: "trip", target: "up to two adjacent creatures", successAsCritical: true, notes: ["One Athletics check for both; a success counts as a critical success."] },
    { uuid: pf2e("z5fUX9jeqfAViOd8"), name: "Shove Down", act: "trip", notes: ["After a successful Shove, against the same target, even out of reach."] },
    { uuid: pf2e("Yazy4gex46FLwsph"), name: "Tumbling Opportunist", act: "trip", notes: ["Against the enemy whose space you tumbled through; Acrobatics can replace Athletics."] },
    { uuid: pf2e("7x1r2w7C7A4Uy7wG"), name: "Topple Foe", act: "trip", notes: ["Against the enemy your ally just hit."] },
    { uuid: pf2e("zEvU1ZlqSsXNPghw"), name: "Flying Tackle", act: "trip", notes: ["Stride and Leap (or High Jump or Long Jump) first; a success counts as a critical success."] },
    { uuid: pf2e("fLlCodqKXyXbZR7C"), name: "Wave Spiral", act: "trip", target: "each creature on the ground within 10 feet", notes: ["The multiple attack penalty rises only after all of them."] },
    { uuid: pf2e("HXjDDIannDMNxMIz"), name: "Wing Bounce", act: "trip", notes: ["Leap first (or Fly); no free hand needed. If it knocks the target prone, you can Leap again."] },
    // Shove
    { uuid: pf2e("8PmPjoqqbOzvUmO2"), name: "Friendly Nudge", act: "shove", target: "1 ally", notes: ["No free hand needed; a willing ally counts the result one degree better."] },
    { uuid: pf2e("wvpDbFZZ9I8aAtmg"), name: "Wing Shove", act: "shove", target: "two enemies flanking you", notes: ["No free hand needed; the second Shove uses the first's multiple attack penalty."] },
    { uuid: pf2e("goFxIDlbWd8GN0kj"), name: "Clear the Way", act: "shove", target: "up to five adjacent creatures", notes: ["No free hand needed. Then Stride up to half your Speed without triggering their reactions."] },
    { uuid: pf2e("ylDAxUpT0rXxilro"), name: "Scattering Charge", act: "shove", target: "up to three creatures in reach", notes: ["Stride up to your Speed first; no free hand needed. The penalty rises only after all of them."] },
    { uuid: pf2e("X6nwiA2uJ2UQIOKB"), name: "Drive Back", act: "shove", notes: ["Your shield has the shove trait for it; see the feat for what a success does to the attack."] },
    { uuid: pf2e("IeAbL6fkRsd1hL6r"), name: "Repulse the Wicked", act: "shove", notes: ["Against the undead that critically missed you."] },
    { uuid: pf2e("jwcNyPDVw313KXZU"), name: "Armored Rebuff", act: "shove", notes: ["No free hand needed; you can't Stride to follow it."] },
    { uuid: pf2e("hAsaNx1dd3xvvAsE"), name: "Say That Again!", act: "shove", notes: ["Against the creature that critically failed to Lie to or Demoralize you."] },
    // Grapple
    { uuid: pf2e("GsICYVRwfcry2s6K"), name: "Jotun's Grasp", act: "grapple", notes: ["Step first."] },
    { uuid: pf2e("0Iv3VbR1DMPbZIjD"), name: "Drag Down", act: "grapple", notes: ["On a success you also pull it under the water (see the feat)."] },
    { uuid: pf2e("MADUYJxUdhkCvI1B"), name: "Steal for the Depths", act: "grapple", notes: ["On a success you also pull it under the water (see the feat)."] },
    { uuid: pf2e("BVHDkBa4JMmmj5Sn"), name: "Opportunistic Grapple", act: "grapple", notes: ["Against your prey that critically missed you."] },
    { uuid: pf2e("muyEI60L0FmCHuWb"), name: "Ensnaring Wrappings", act: "grapple", notes: ["Against the creature your Strike just damaged."] },
    { uuid: pf2e("t9SlriJulwgxDPwX"), name: "Reactive Tangle", act: "grapple", notes: ["With your net, against the moving creature; it must stay within your reach instead of the rope's."] },
    { uuid: pf2e("gxzTEt37M0z1WY1M"), name: "Spinebreaker", act: "grapple", notes: ["Against the creature you have grabbed: on a success clumsy 1 until the end of its next turn; on a critical success clumsy 2 until then and clumsy 1 for 1 minute."] },
    { uuid: pf2e("ZXaDS4OJvsQYvhBZ"), name: "Submission Hold", act: "grapple", notes: ["Against the creature you have grabbed: on a success enfeebled 1 until the end of its next turn; on a critical success enfeebled 2 until then and enfeebled 1 for 1 minute."] },
    { uuid: action("pFgkxLJsAcImb0Eg"), name: "Puncture Flesh", act: "grapple", notes: ["On a success also 1d8 persistent piercing damage (2d8 on a critical success)."] },
    // Disarm
    { uuid: pf2e("y0Ru2hRmoRwkRsxZ"), name: "Tongue Disarm", act: "disarm", target: "1 creature within 10 feet", notes: ["No free hand needed."] },
    { uuid: pf2e("sQLgEcqoQ0SYtbTg"), name: "Tail Snatch", act: "disarm", notes: ["No free hand needed; your tail can't hold what it disarms."] },
    { uuid: pf2e("NnpUhj7d4RmfOKTE"), name: "Scorching Disarm", act: "disarm", notes: ["Once per day, no free hand needed. Success: 4d6 fire unless it drops the weapon; critical success: 4d6 fire and it drops it."] },
    { uuid: pf2e("WlgaSpTSGQQrHKlx"), name: "Mockingbird's Disarm", act: "disarm", notes: ["Against the enemy whose space you tumbled through; Acrobatics can replace Athletics."] },
    { uuid: pf2e("HoDs90589eYQwcre"), name: "Disarming Intercept", act: "disarm", notes: ["No free hand needed; an item bonus equal to your armor's potency rune."] },
    { uuid: action("jl1euufxNpAhVt26"), name: "Disarming Interception", act: "disarm", notes: ["+2 status; a success disrupts the attack. On a critical success with a hand free, you can catch the weapon."] },
    // Reposition
    { uuid: pf2e("yFc0tN9HviAJnG1r"), name: "Divert Streamflow", act: "reposition", notes: ["Against the creature that damaged you; on a success you can Step as a free action."] },
    { uuid: pf2e("E1WXnYE2QwhHQxQb"), name: "Sleeper Hold", act: "grapple", notes: ["Against the creature you have grabbed, with other results: success, clumsy 1 until the end of its next turn; critical success, unconscious for 1 minute (still standing). See the feat."] },
    // Teams+
    demoralize(feats("jCQB9VIAhEQcjW3L"), "Menacing Approach", null, ["Then Stride toward it; after a success the movement doesn't provoke its reactions. A single action if you're legendary in Intimidation."]),
    demoralize(teams("pf2e-team-plus-barbarians", "items", "2vbX1nwyfYm8tnln"), "HIT ME!", null, ["Against the enemy attacking your ally; see the feat for a success."]),
    demoralize(tianXia("PZ1nVWZLv1Ae17n6"), "Monstrous Turn", null, ["Before the attack, against the attacker."]),
    demoralize(tianXia("pKNWK8e4cLuH7WR7"), "Intimidating Channel", null, ["After casting Channel Imperial Dragon."]),
    demoralize(teams("pf2e-team-plus-inventors", "inventors-feats", "GCyGoDtYQ2AeHxcj"), "Maniacal Laughter!", "each enemy the unstable action affected", ["Crafting instead of Intimidation."]),
    { uuid: feats("GJRq9nCzL1amXtY4"), name: "Monumental Shove", act: "shove", notes: ["On a success it moves further: the check's result ÷ 2, rounded up to 5 feet. See the feat for a critical success into an obstacle."] },
    { uuid: feats("J1xFhXLePB7I61Pa"), name: "Mid-air Tackle", act: "grapple", target: "1 airborne creature", notes: ["Leap first (High Jump or Long Jump with 3 actions); see the feat for the extra results."] },
    { uuid: tianXia("3LMWofoux3UQicIv"), name: "Clearing The Way", act: "disarm", notes: ["Step before or after. Stepping onto a weapon you disarmed, you can pick it up as a free action."] },
    // More (the loop, 2026-10-30)
    { uuid: pf2e("dPmJ91qawZW2U8K3"), name: "Staff Sweep", act: "trip", target: "up to two foes within reach", notes: ["Or Shove, with your staff. One roll against both foes' DCs; they must be within 5 feet of each other."] },
    { uuid: pf2e("pmz1itHp13JtcrjW"), name: "Unbalancing Sweep", act: "trip", target: "up to three enemies within reach", notes: ["Or Shove all three. A separate check against each; the multiple attack penalty rises only after all of them."] },
    { uuid: pf2e("MyDluIbnX2sjm3pB"), name: "Ranged Disarm", act: "disarm", notes: ["Roll a ranged attack with your simple firearm or combination weapon instead of Athletics, against the target's Reflex DC."] },
    { uuid: pf2e("XlagOGG88w6D3G3Z"), name: "Wheeling Grab", act: "grapple", notes: ["Enter claw stance and Tumble Through first; the Grapple only against an enemy whose space you moved through."] },
    { uuid: pf2e("A981119DMdqE9Pg1"), name: "Running Tackle", act: "grapple", notes: ["Or Shove. Stride twice first, or High Jump or Long Jump and use it at any point of the jump (the jump ends there)."] },
    { uuid: pf2e("3KVFBmWPVSItUuq3"), name: "Protect the Royal Line", act: "shove", successAsCritical: true, notes: ["Or Reposition, against an enemy flanking you. +2 circumstance if you can see one of your designated knights, +4 if one is adjacent. A critical success moves it 5 feet farther."] },
    { uuid: pf2e("SzkpazSZ0pi1WZsH"), name: "Squirm Free", act: "escape" },
    { uuid: pf2e("2hwNGs7WQnO6yv0Q"), name: "Toppling Transformation", act: "shove", notes: ["Or Trip, an adjacent creature; use your size after the transformation."] },
    { uuid: pf2e("W7IfFi6MkTDfO2hb"), name: "Disengaging Twist", act: "escape", notes: ["Athletics, with a +2 circumstance bonus."] },
    { uuid: pf2e("jCIBYryi6Y3JwmqH"), name: "Mixed Maneuver", act: "grapple", notes: ["Any two of Grapple, Reposition, Shove and Trip, against the same or different creatures; use the other's card too. The penalty rises only after both."] },
    // Strikes that end in a maneuver
    { uuid: pf2e("AGiIjgLOFuahmwiT"), name: "Shackles of Law", strike: { melee: true, onHit: { follow: "grapple" }, notes: ["The Grapple only if it deals damage. With a flail or spiked chain no free hand is needed, and a success counts as a critical success."] } },
    { uuid: pf2e("74MnTnoqSveet8Sy"), name: "Reflexive Grapple", strike: { strike: "lash", anyStrike: false, onHit: { follow: "grapple" }, notes: ["The penalty rises only after both."] } },
    { uuid: pf2e("ZTxiM8NExDmxHJDf"), name: "Pin to the Spot", strike: { melee: true, onHit: { conditions: [{ slug: "restrained", value: null, duration: null }] }, notes: ["Only if it deals damage: restrained as by a critical Grapple."] } },
    { uuid: tianXia("x7j3E1HlpkpzxRoi"), name: "Dreadnought Slam", strike: { melee: true, onHit: { follow: "trip" }, notes: ["An unarmed Strike; the Trip only if it deals damage. The penalty rises only after both."] } },
    { uuid: pf2e("hENWnoZNljeJnZBR"), name: "Elbow Breaker", strike: { melee: true, notes: ["An unarmed Strike against the creature you have grabbed. Critical hit: one held item falls. Hit: +2 circumstance to Disarm that item, and –2 circumstance to its checks with it, until it changes its grip."] } },
    { uuid: pf2e("1rbB6bYDqjR4gVTH"), name: "Unsteadying Strike", strike: { melee: true, notes: ["On a hit, until your next turn: –2 circumstance to its Fortitude DC against Grapple, Reposition and Shove, and to its Reflex DC against Disarm."] } },
    // A condition with no roll
    { uuid: pf2e("9zH7IOsmhRBEqXAV"), name: "Instant Opening", affect: { target: "1 creature", range: "30 feet", effects: [{ slug: "off-guard", duration: untilYourNextTurnEnds }] }, notes: ["Off-guard only to your attacks."] },
    { uuid: pf2e("Vzbu8tclrsS2IBYU"), name: "Seize", affect: { target: "the foe your fist Strike hit", effects: [{ slug: "grabbed" }] }, notes: ["As if you'd succeeded at a Grapple."] },
    { uuid: pf2e("7HPXQvPH3ovwtVae"), name: "Furious Grab", affect: { target: "the foe your Strike hit", effects: [{ slug: "grabbed" }] }, notes: ["As if you'd succeeded at a Grapple."] }
];

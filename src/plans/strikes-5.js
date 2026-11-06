// Class and archetype Strike feats, by hand (2026-11-03, Cole: "Keep working on strike riders"). As strikes-4.js: the card plays the Strike
// and what the readers miss; the rest is a note for the GM. rulesDamage is damage PF2e's own rules add once the feat's toggle is on (or the
// GM adds): the card leaves it, so it isn't counted twice, and the combat simulator counts it. Numbers that grow with level are their first
// step; the note gives the rest.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const untilYourNextTurnEnds = { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-end", anchor: "source-turn" };

export default [
    // ("This Strike gains the holy trait and deals an additional 1d4 spirit damage, or 2d4 spirit damage against fiends.")
    { uuid: pf2e("K2oSXGmqTUrcQYar"), name: "Blessed Sentinel", strike: { onHit: { rulesDamage: ["1d4[spirit]"] }, notes: ["The Strike is holy and deals 1d4 spirit damage more (2d4 against a fiend): PF2e adds it with the feat's toggle on."] } },
    // ("you deal additional void damage equal to your key attribute modifier to the target and all enemies within 30 feet … a critical hit,
    // twice as much … and persistent void damage equal to your key attribute modifier": +5 at 14th level, the target's; the rest the GM's.)
    { uuid: pf2e("T0LazeBYiLnUzQXC"), name: "History of Violence", strike: { oncePerFight: true, onHit: { rulesDamage: ["5[void]"] }, notes: ["If it hits, the target and every enemy within 30 feet take void damage equal to your key attribute modifier (twice that on a critical hit, and the target also takes that much persistent void damage). GM: add it by hand."] } },
    // ("If it's successful and deals damage … The target takes 1d6 bleed damage, which has the unholy trait.")
    { uuid: pf2e("VAIr1TpHZdxWovqG"), name: "Fiendish Brand", strike: { onHit: { rulesDamage: ["1d6[persistent,bleed]"] }, notes: ["A piercing or slashing Strike. On a hit that deals damage, 1d6 persistent bleed damage (unholy): PF2e adds it with the feat's toggle on. While it bleeds, the target must succeed at a DC 5 flat check to cast a holy spell."] } },
    // ("On a success, the Strike deals an additional 1d12 electricity damage to the target, as well as 1d4 electricity damage to up to two
    // other foes within 10 feet"; 2d12 and 2d4 from 18th level.)
    { uuid: pf2e("A0keRhzNlcB1u4gD"), name: "Stasian Smash", strike: { onHit: { rulesDamage: ["1d12[electricity]"] }, notes: ["A dynamo Strike. On a hit, 1d12 electricity damage more (2d12 at 18th level; PF2e adds it with the feat's toggle on), and 1d4 electricity (2d4 at 18th) to up to two other foes within 10 feet. On a critical failure, you take 1d12 electricity damage."] } },
    // ("If you hit, you take a circumstance penalty to damage equal to the number of weapon damage dice, and the damage gains the nonlethal
    // trait. However, the target … becomes Clumsy 1 until the end of your next turn.")
    { uuid: pf2e("0VOzclP73W0txuvF"), name: "Ivy Playhouse Strike", strike: { melee: true, damagePerWeaponDie: -1, nonlethal: true, onHit: { conditions: [{ slug: "clumsy", value: 1, duration: untilYourNextTurnEnds }] }, notes: ["On a hit, the damage is nonlethal and takes a penalty equal to the weapon's damage dice (PF2e's toggle)."] } },
    // ("Make a Strike against a creature you know is undead. … If this Strike hits, you deal one extra die of vitality damage, with the same die
    // size as the weapon": two from 10th level, three from 18th — PF2e's toggle adds them; vitality harms only undead, as the weapon's dice do here.)
    { uuid: pf2e("jr2LYiMvjnTNhfMM"), name: "Slayer's Strike", strike: { targetTraits: ["undead"], extraWeaponDice: 1, notes: ["Only against an undead you know is one. On a hit, one extra die of vitality damage of the weapon's size (two at 10th level, three at 18th; PF2e's toggle adds it). Your further Strikes with that weapon at it until your next turn deal extra vitality damage equal to the weapon's damage dice."] } },
    // ("This counts as three attacks … If this Strike hits, you get a critical hit. If you roll a critical hit, your weapon … gains the deadly
    // d12 trait … Whether or not you hit, you become Stunned 1 and are Off-Guard until the start of your next turn.")
    { uuid: pf2e("eOwjwVAbl99ZTy5D"), name: "Overwhelming Blow", strike: { melee: true, hitCrits: true, deadly: 12, selfAfter: [{ slug: "stunned", value: 1, until: "save" }, { slug: "off-guard", until: "own-turn-start" }], notes: ["If the Strike hits, it's a critical hit (GM: count it as one); a rolled critical hit gains deadly d12. Hit or miss, you're stunned 1 and off-guard until the start of your next turn."] } },
    // (2026-11-03: a Strike at each enemy in reach, or one roll against up to two foes — each: true, max — the simulator plays as a Strike at
    // each at the same penalty; the card plays them one by one, the penalty a note.)
    { uuid: pf2e("SGgK4BoUooA0HhTj"), name: "Avalanche Strike", strike: { melee: true, each: true, notes: ["With a two-handed melee weapon, a Strike against each enemy within its reach, each at the same multiple attack penalty; it rises only after all of them."] } },
    { uuid: pf2e("JbrVcOf82oFXk3mY"), name: "Swipe", strike: { melee: true, each: true, max: 2, notes: ["One melee Strike's roll against the ACs of up to two adjacent enemies in reach; roll damage once and apply it to each one hit. It counts as two attacks (a sweep weapon's bonus applies)."] } },
    { uuid: pf2e("0SbHdwYumvmzwWw3"), name: "Piston Punch", strike: { melee: true, each: true, max: 2, notes: ["A bludgeoning or piercing dynamo Strike's roll against two foes in a line (the second adjacent to the first, away from you); damage rolled once and applied to each one hit. It counts as two attacks; reduce your dynamo's operational time by 1 hour."] } },
    { uuid: pf2e("f88lisILiPrOQv2r"), name: "Swiping Trace", strike: { melee: true, each: true, max: 2, notes: ["One melee Strike's roll against up to two enemies in reach; damage rolled once and applied to each one hit, and you can Trace the same rune on each one damaged. It counts as two attacks."] } },
    { uuid: pf2e("otBBb0ndASgPdAXW"), name: "Penetrating Shot", strike: { strike: "ranged", anyStrike: false, each: true, max: 2, notes: ["One ranged Strike's roll against your hunted prey and the creature giving it lesser cover (that cover ignored); damage rolled once and applied to each one hit. It counts as two attacks."] } },
    { uuid: pf2e("YlaLePtgDXGB0Fsf"), name: "Penetrating Fire", strike: { strike: "ranged", anyStrike: false, each: true, max: 2, notes: ["One ranged Strike's roll against two targets, the nearer giving the other lesser cover (ignored); damage rolled once and applied to each one hit. It counts as two attacks."] } },
    // ("Make a melee or ranged Strike with a –2 circumstance penalty. On a hit, the next ally to target the same creature with a Strike gains a
    // +2 circumstance bonus to their attack roll. On a critical hit, the bonus applies to any allies who act before the start of your next
    // turn": the simulator plays the hit as Set-Up Strike's, off-guard to the next ally's attack.)
    { uuid: pf2e("nLFP7rT0jhM11nFR"), name: "Lead by Example", strike: { attackBonus: -2, setUp: true, notes: ["On a hit, the next ally to Strike that creature gets +2 circumstance to the attack roll; on a critical hit, every ally who acts before your next turn (PF2e's Effect: Lead by Example)."] } },
    // ("Make a melee Strike against a creature you have grabbed. … If the Strike hits, the creature must attempt a Fortitude save against your
    // class DC; this is an incapacitation effect": the readers took it as a save alone, with no Strike; the save after the hit is the reader's.)
    { uuid: pf2e("2HoDwBAmPIAoKUVF"), name: "Dazing Blow", strike: { melee: true, notes: ["Against a creature you have grabbed; its weapon damage is bludgeoning. If it hits, the target attempts a Fortitude save against your class DC (incapacitation): stunned 1, 2 or 3 on a success, failure or critical failure."] } },
    // (Speed penalties on a hit, for a round: PF2e's own Effect on the card where it has one — Kneecap's, Staggering Fire's —, a note
    // otherwise; the simulator slows the target's Speed.)
    { uuid: pf2e("1muxLx8Vacn2SLHc"), name: "Kneecap", strike: { melee: true, noDamage: true, onHit: { speedPenalty: { value: 10, critical: 15, type: "status", rounds: 1 }, nativeEffects: [{ uuid: "Compendium.pf2e.feat-effects.Item.kZdVPBO58uq38KIR", label: "Effect: Kneecap" }] }, notes: ["The Strike deals no damage. On a hit, –10-foot status penalty to the target's Speed for 1 round (–15 feet on a critical hit), if it uses legs for its land Speed."] } },
    { uuid: pf2e("fCsIyglmpb7NYwiy"), name: "Harrying Strike", strike: { melee: true, onHit: { speedPenalty: { value: 10, critical: 15, type: "status", rounds: 1 } }, notes: ["Until the start of your next turn, the target takes a –10-foot status penalty to its Speeds (–15 feet on a critical hit, –5 feet even on a miss that isn't a critical miss). GM: apply it by hand."] } },
    { uuid: pf2e("fngPLUD4Sltho2kn"), name: "Staggering Fire", strike: { strike: "ranged", anyStrike: false, onHit: { speedPenalty: { value: 5, critical: 10, type: "circumstance", rounds: 1 }, nativeEffects: [{ uuid: "Compendium.pf2e.feat-effects.Item.qaIqu9H9OdX1B5wy", label: "Effect: Staggering Fire" }] }, notes: ["With a bow or crossbow. On a hit, –5-foot circumstance penalty to the target's Speed until the end of its turn (–10 feet on a critical hit)."] } },
    // ("Make a melee Strike against a flying creature up to one size larger than you; if you hit … the creature moves to the nearest
    // unoccupied ground space adjacent to you and can't Fly, levitate, or otherwise leave the ground for 1 round. On a critical hit, … for
    // 1 minute": grounds, the simulator's landed and grounded; the card's GM moves it.)
    { uuid: pf2e("SxRmlDYhYEkq10Ak"), name: "Serpentcoil Slam", strike: { melee: true, oncePerFight: true, onHit: { grounds: { rounds: 1, critical: 10 } }, notes: ["Once per minute, against a flying creature up to one size larger than you. On a hit, it moves to the nearest open ground space adjacent to you and can't Fly, levitate or otherwise leave the ground for 1 round (1 minute on a critical hit). GM: move it and note it."] } }
];

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
    { uuid: pf2e("eOwjwVAbl99ZTy5D"), name: "Overwhelming Blow", strike: { melee: true, hitCrits: true, deadly: 12, selfAfter: [{ slug: "stunned", value: 1, until: "save" }, { slug: "off-guard", until: "own-turn-start" }], notes: ["If the Strike hits, it's a critical hit (GM: count it as one); a rolled critical hit gains deadly d12. Hit or miss, you're stunned 1 and off-guard until the start of your next turn."] } }
];

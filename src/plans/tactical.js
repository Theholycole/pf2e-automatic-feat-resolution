// The swashbuckler's, gunslinger's, guardian's, magus's and champion's Strike feats, by hand (2026-10-30). As fighter.js: what a hit does
// that the readers missed, the rest as notes. A save after the hit (Stunning Finisher, Ring Their Bell, Bloody Denial) is a note for now:
// the card names the save and the GM rolls it from the note's link.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const untilYourNextTurn = { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-start", anchor: "effect-start" };
const untilYourNextTurnEnds = { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-end", anchor: "effect-start" };
const untilYourTurnEnds = { mode: "fixed", value: 0, unit: "rounds", expiry: "turn-end", anchor: "effect-start" };
const ranged = { strike: "ranged", anyStrike: false };

export default [
    // Swashbuckler
    { uuid: pf2e("SlwgsFXscR49tRio"), name: "Halyard Strike", strike: { notes: ["Swing on a rope up to twice your Speed, with a one-handed weapon or unarmed Strike at any point during the swing."] } },
    { uuid: pf2e("BuaTJxALqxM5EZav"), name: "Perfect Finisher", strike: { notes: ["Roll the attack twice and use the better result."] } },
    { uuid: pf2e("E25gWBCsDm3DbJdO"), name: "Brandishing Draw", strike: { notes: ["Interact to draw a weapon first; the Strike (or one-action finisher) uses the weapon you drew."] } },
    { uuid: pf2e("HxMkvkxd8QMXcQ67"), name: "Retreating Finisher", strike: { melee: true, notes: ["On a miss (not a critical miss), Step as a free action."] } },
    { uuid: pf2e("a5jZJPZO8RPQjqE7"), name: "Illimitable Finisher", strike: { notes: ["Step first. The finisher gains the bravado trait; if it gives you panache back, you can attempt another finisher as part of this action."] } },
    { uuid: pf2e("dxujgA0NgiEvA0H8"), name: "Bleeding Finisher", strike: { notes: ["A slashing or piercing Strike. On a hit, persistent bleed damage equal to your precise strike finisher damage."] } },
    { uuid: pf2e("jkBzlMB4TS1sS2Fm"), name: "Stunning Finisher", strike: { melee: true, notes: ["On a hit, the foe attempts a Fortitude save against your class DC (incapacitation): success, no reactions until its next turn; failure, stunned 1; critical failure, stunned 3."] } },
    // Gunslinger
    { uuid: pf2e("ySr510TkpUO3N6Ty"), name: "Trick Shot", strike: { ...ranged, notes: ["Against an easy DC for your level, at an object near the target: on a success, one of the feat's effects instead of a hit on the foe."] } },
    { uuid: pf2e("7spk6rZPiNk2S0yA"), name: "Blood in the Air", strike: { ...ranged, notes: ["Against a concealed or hidden enemy you damaged with a ranged weapon in the last minute: ignore concealed, and the hidden flat check is DC 5."] } },
    { uuid: pf2e("c7mCj6wUdb47rrnw"), name: "Ricochet Shot", strike: { ...ranged, notes: ["You can work out the target's cover from a solid surface within the first range increment instead of from you."] } },
    { uuid: pf2e("Q4NiHmThMtk8razS"), name: "Headshot", strike: { ...ranged, notes: ["On a critical hit against a target you damaged with this weapon in the last minute, it attempts a Fortitude save against your class DC (death, incapacitation); see the feat."] } },
    { uuid: pf2e("A7uJCDT9odsuwlqW"), name: "Triggerbrand Blitz", strike: { strides: 1, strikes: [null, null, null], notes: ["Once per minute. Up to three Strikes with your combination weapon during the Stride, each against a different target, melee or ranged without changing modes."] } },
    { uuid: pf2e("BmAk6o14CutgnIOG"), name: "Risky Reload", strike: { ...ranged, notes: ["Interact to reload first. If the Strike fails, the firearm misfires."] } },
    { uuid: pf2e("Q1O4P1YIkCfeedHH"), name: "Alchemical Shot", strike: { ...ranged, notes: ["The bomb's damage type and splash go on the shot (see the feat); on a critical miss, the firearm misfires."] } },
    { uuid: pf2e("FNO2hfGmxqJngD4A"), name: "Drifter's Juke", strike: { strikes: ["ranged", "melee"], notes: ["Step, Strike, Step, Strike: one ranged Strike with your firearm or crossbow and one melee Strike, in either order."] } },
    { uuid: pf2e("BkEOwv3SRtefczpO"), name: "Phalanx Breaker", strike: { ...ranged, onHit: { push: 10, criticalPush: 20 }, notes: ["Within the first range increment. If the push ends against an obstacle, the target takes bludgeoning damage equal to half your level."] } },
    { uuid: pf2e("L9sRaFl0tHT5AFIQ"), name: "Scatter Blast", strike: { ...ranged, notes: ["Range increment +20 feet and scatter radius +20 feet. On a miss the firearm misfires; on a critical miss it misfires and you take the scatter damage too (see the feat)."] } },
    { uuid: pf2e("Z4fZuktYgozKUxVV"), name: "Seize an Advantage", strike: { ...ranged, notes: ["After a Dirty Trick: the Strike (or a reload) doesn't trigger the foe's reactions."] } },
    { uuid: pf2e("WDid62NmmC6NiTE6"), name: "Smoke Curtain", strike: { ...ranged, notes: ["A 20-foot emanation of smoke on you: creatures inside are concealed, and those outside are concealed to those inside."] } },
    { uuid: action("YMhmebfXAoOFXeSB"), name: "Drifter's Wake", strike: { strides: 1, strikes: [null, null, null], notes: ["Up to three Strikes during the Stride, each against a different enemy; the multiple attack penalty rises only after all of them."] } },
    { uuid: action("4IxCKbGaEM9nUhld"), name: "Finish The Job", strike: { melee: true, notes: ["With your other hand, after a missed one-handed firearm or crossbow Strike; same multiple attack penalty as that Strike."] } },
    { uuid: action("O1iircZOOCo42r9Y"), name: "Ghost Shot", strike: { ...ranged, notes: ["If you're hidden from or undetected by the target, add One Shot, One Kill's precision damage. Undetected or unnoticed becomes hidden (undetected with a silencer)."] } },
    { uuid: action("vO0Y1dVjNfbDyT4S"), name: "Vital Shot", strike: { ...ranged, notes: ["Against an off-guard target: one extra weapon die, and persistent bleed equal to One Shot, One Kill's precision damage."] } },
    // Guardian
    { uuid: pf2e("HtLFPJeL0QTDLEfq"), name: "Shoulder Check", strike: { melee: true, onHit: { conditions: [{ slug: "off-guard", value: null, duration: untilYourTurnEnds }], critical: [{ slug: "off-guard", value: null, duration: untilYourNextTurnEnds }] }, notes: ["A fist (or gauntlet) Strike. Off-guard only to your melee attacks: on a hit the next one this turn, on a critical hit until the end of your next turn. On a critical miss you're off-guard to its melee attacks until the end of your next turn."] } },
    { uuid: pf2e("Wk1qjeuofFyLFdTQ"), name: "Belly Flop", strike: { melee: true, onHit: { conditions: [{ slug: "immobilized", value: null, duration: null }] }, notes: ["You drop prone first, without the prone attack penalty. The immobilization ends if you Stand or move; its Escape DC can add your armor's item bonus."] } },
    { uuid: pf2e("k4TsVHoGtBJNJw8a"), name: "Momentum Strike", strike: { melee: true, notes: ["If it hits and deals damage, move an enemy your size or smaller up to 5 feet (10 on a critical hit) within your reach; into another creature, see the feat."] } },
    { uuid: pf2e("41zc9MdLoTy02kim"), name: "Weakening Assault", strike: { strikes: [null, null], onHit: { conditions: [{ slug: "enfeebled", value: 1, duration: untilYourNextTurn }] }, notes: ["Against your taunted enemy. If both Strikes hit, enfeebled 3 instead."] } },
    { uuid: pf2e("Um5owecqPW17dtl2"), name: "Taunting Strike", strike: { notes: ["Hit or miss, you Taunt the target (the Taunt gains the visual trait)."] } },
    { uuid: pf2e("YHeKwgJq1zkdcV0p"), name: "Proud Nail", strike: { melee: true, notes: ["Against your taunted, off-guard enemy: one extra weapon die on a hit (two at 10th level, three at 18th)."] } },
    { uuid: pf2e("SiGvSOPQmZ0nyXVO"), name: "Lock Down", strike: { melee: true, notes: ["If it hits and deals damage, the enemy can't move beyond this weapon's reach until your next turn, until you move, or until you attack with it again."] } },
    { uuid: pf2e("NMRBes7gGfGldOrn"), name: "Ring Their Bell", strike: { melee: true, notes: ["A fist (or gauntlet) Strike against your taunted enemy. If it hits and deals damage, a Fortitude save against your class DC (incapacitation): success stunned 1, failure stunned 2, critical failure stunned 3."] } },
    { uuid: pf2e("Xik9lMAA4e5xFegM"), name: "Shield Wallop", strike: { melee: true, onHit: { conditions: [{ slug: "stupefied", value: 1, duration: untilYourNextTurn }], critical: [{ slug: "stupefied", value: 2, duration: untilYourNextTurn }] }, notes: ["A shield Strike, only if it deals damage. With a tower or fortress shield, one step higher (stupefied 2, or 3 on a critical hit)."] } },
    { uuid: pf2e("8okUez3GQOdrE4Ov"), name: "Bloody Denial", strike: { notes: ["On a hit, a Fortitude save against your class DC, one degree worse on a critical hit: success, no reactions against an ally you choose; failure, no reactions; critical failure, also stunned 1. Until the start of your next turn."] } },
    // Magus
    { uuid: pf2e("iHUuWrvkT2uR0PnK"), name: "Whirlwind Spell", strike: { melee: true, notes: ["Spellstrike with a melee Strike against each enemy in reach; a multitarget or area spell affects every foe you hit."] } },
    { uuid: pf2e("Fs88vjez9px2mmrC"), name: "Spell Swipe", strike: { melee: true, strikes: ["melee", "melee"], notes: ["Spellstrike against two adjacent creatures in your reach; a multitarget or area spell affects whichever you hit."] } },
    { uuid: pf2e("8uyo7y5zqRUT1kbt"), name: "Recharging Flurry", strike: { melee: true, strikes: ["melee", "melee"], notes: ["One Strike with each weapon, then recharge your Spellstrike whether they hit or not."] } },
    // Champion
    { uuid: pf2e("gVXefUaMzg7S1vpm"), name: "Knock Sense", strike: { notes: ["Against a confused ally: nonlethal with no penalty. If it hits and deals damage, the ally automatically succeeds at the flat check to end confused."] } }
];

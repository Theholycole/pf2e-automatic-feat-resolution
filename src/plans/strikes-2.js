// More of the martial classes' Strike feats, by hand (2026-10-30): the fighter's, rogue's, ranger's, barbarian's, monk's, swashbuckler's
// and gunslinger's that the readers don't take. As fighter.js: what a hit does that the readers missed, the rest as notes. Many of these
// already carry PF2e's own rules (Deadly Aim's damage, Tiger Slash's dice, Flesh Wound's failure); the card only plays the Strike and names
// the rest. A stance's Strike goes by its name ("tiger claw").

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const ranged = { strike: "ranged", anyStrike: false };
const named = (strike) => ({ strike, anyStrike: false });

export default [
    // Fighter
    { uuid: pf2e("kcWdo5zzldDTqCBP"), name: "Spear Dancer", strike: { melee: true, notes: ["With a spear or polearm: Step and then Strike, or Strike and then Step."] } },
    { uuid: pf2e("h5DzKmKDADGhvmF9"), name: "Certain Strike", strike: { melee: true, notes: ["On a miss (not a critical miss), it still deals a hit's damage without any damage dice."] } },
    { uuid: pf2e("UiQbjeqBUFjUtgUR"), name: "Assisting Shot", strike: { ...ranged, notes: ["On a hit, the next other creature to attack the target before your next turn gets +1 circumstance (+2 on a critical hit); PF2e's Effect: Assisting Shot."] } },
    { uuid: pf2e("1sD5Gu8jQL09Yz2j"), name: "Sever Space", strike: { melee: true, notes: ["80-foot reach with a slashing weapon. Afterwards, hit or miss, you teleport next to the target, or try to pull it next to you (it can negate with a Will save against your class DC)."] } },
    { uuid: pf2e("JHcvySfCM9uYNb9N"), name: "Revealing Stab", strike: { melee: true, notes: ["A piercing weapon: no flat check against concealed, DC 5 against hidden. If it hits and deals damage, you can leave the weapon lodged in it, revealing it (see the feat)."] } },
    { uuid: pf2e("NY2AkQscVIHEC8hQ"), name: "Impossible Volley", strike: { ...ranged, attackBonus: -2, notes: ["One Strike at –2 against each enemy in a 10-foot burst at or beyond volley range; roll damage once. The multiple attack penalty rises only after all of them."] } },
    { uuid: pf2e("BkKWTt3ufaCN2ZdI"), name: "Sudden Leap", strike: { melee: true, notes: ["Leap, High Jump or Long Jump (up to double your Speed), with one melee Strike at any point; then you fall, landing upright with no damage if the fall is no more than the jump's height."] } },
    // Rogue
    { uuid: pf2e("6AXAJuMEMpxU27PJ"), name: "Dispelling Slice", strike: { notes: ["Against an off-guard creature. If it deals sneak attack damage, counteract one spell on the target: rank half your level, modifier your class DC – 10."] } },
    { uuid: pf2e("eoDDjIGAA67Z7rQt"), name: "Underhanded Assault", strike: { melee: true, notes: ["Sneak (–2) up to a foe adjacent to an ally, as though hidden from it; if the Stealth check succeeds, the melee Strike at the end."] } },
    { uuid: pf2e("cTQMtd2IVlvgJwAn"), name: "Slice and Swipe", strike: { melee: true, notes: ["A slashing weapon. If it hits and deals damage and the attack roll beats the target's Perception DC, you Steal a small object from it."] } },
    { uuid: pf2e("cISZPoI675He4aNh"), name: "Sawtooth Grapple", strike: { melee: true, strikes: ["melee", "melee"], onHit: { follow: "grapple" }, notes: ["One Strike with each weapon at the same creature. The Grapple only if you dealt sneak attack damage; no multiple attack penalty on it if both Strikes dealt damage."] } },
    { uuid: pf2e("ZdL8pPPV0QCkBML1"), name: "Subtle Shank", strike: { melee: true, offGuard: true, notes: ["Draw the concealed weapon, Strike (the target is off-guard), then Conceal it again with Stealth."] } },
    // Ranger
    { uuid: pf2e("COe0bYyVCyC78rzP"), name: "Second Sting", strike: { melee: true, notes: ["Against your hunted prey. On a miss (not a critical miss), deal the other weapon's hit damage without any damage dice."] } },
    { uuid: pf2e("qav9ec9cR4lFcz3C"), name: "Disrupt Prey", strike: { melee: true, notes: ["Against your hunted prey; a critical hit disrupts the triggering action."] } },
    { uuid: pf2e("enPAJ1oSDutts7ic"), name: "Deadly Aim", strike: { ...ranged, attackBonus: -2, notes: ["Against your hunted prey: –2 to hit, +4 circumstance to damage (+6 at 11th, +8 at 15th)."] } },
    { uuid: pf2e("s2GbcUIXG1ZBurSd"), name: "Hamstringing Strike", strike: { attackBonus: -2, notes: ["Against your hunted prey: on a hit a –5-foot status penalty to its Speed, –10 on a critical hit (PF2e's Effect: Hamstringing Strike); not on a creature immune to bleed."] } },
    // Barbarian
    { uuid: pf2e("8INrcMUv5vzWMG3X"), name: "Sunder Spell", strike: { melee: true, notes: ["Against a creature, object or spell manifestation (a wall: usually AC 10). On a hit, counteract one spell or magical effect on it, rank half your level, with the attack roll."] } },
    { uuid: pf2e("0kkiE74cyHyxdPe6"), name: "Vengeful Strike", strike: { melee: true, notes: ["Against the creature that hit you; a free action instead if its attack was a critical hit."] } },
    { uuid: pf2e("GE96a0UGPYM74qjI"), name: "Cleave", strike: { melee: true, notes: ["Against an enemy adjacent to the one you just dropped."] } },
    { uuid: pf2e("9Q0tPGtOawPTU2TU"), name: "Follow-Up Assault", strike: { melee: true, notes: ["After a missed melee Strike: the same weapon, with backswing and forceful for this Strike."] } },
    // Monk
    { uuid: pf2e("P13ZhZcR67Ev0vrS"), name: "Disrupt Qi", strike: { melee: true, onHit: { conditions: [{ slug: "enfeebled", value: 1, duration: null }] }, notes: ["Only against a living creature and only if it deals damage: persistent void damage, 1d6 per 6 levels (3d6 at 18th); enfeebled 1 until that persistent damage ends."] } },
    { uuid: pf2e("wKx7BWdQu5sEjL9j"), name: "Wild Winds Gust", strike: { ...named("wind crash"), notes: ["A wind crash Strike against each creature in a 30-foot cone or 60-foot line; the penalty rises only after all of them."] } },
    { uuid: pf2e("07TYbc4cOQi5tduT"), name: "Godbreaker", strike: { melee: true, strikes: ["melee", "melee", "melee"], notes: ["Against the creature you have grabbed or restrained: each hit lifts it 20 feet more and allows the next Strike; a miss ends it, and you both fall (see the feat)."] } },
    { uuid: pf2e("S14S52HjszTgIy4l"), name: "Crane Flutter", strike: { ...named("crane wing"), attackBonus: -2, notes: ["In Crane Stance: +3 circumstance to AC against the attack; the crane wing Strike only if it misses and the attacker is in reach."] } },
    { uuid: pf2e("AsOVi8AqE3v10ee0"), name: "Culvert's Collapse", strike: { ...named("flooded river"), notes: ["In Flood Stance, against the enemy that damaged you since your last turn: 1d8 extra bleed damage."] } },
    { uuid: pf2e("nRjyyDulHnP5OewA"), name: "Gorilla Pound", strike: { ...named("gorilla slam"), notes: ["Demoralize first. On a hit, a circumstance bonus to damage equal to triple the target's frightened value."] } },
    { uuid: pf2e("6J2ZSGNsXPKPcJGV"), name: "Tiger Slash", strike: { ...named("tiger claw"), notes: ["Two extra weapon dice (three at 14th), and you can push the target 5 feet as a Shove. On a critical hit that deals damage, add your Strength modifier to the tiger claw's bleed."] } },
    { uuid: pf2e("uJpghjJtNbqKUxRd"), name: "Wolf Drag", strike: { ...named("wolf jaw"), onHit: { conditions: [{ slug: "prone", value: null, duration: null }] }, notes: ["The wolf jaw gains fatal d12 for this Strike."] } },
    { uuid: pf2e("GEonUnKYVyWoHh1O"), name: "Snakebird's Shadow", strike: { melee: true, notes: ["In Waterfowl Stance with a sword: a melee Strike against each enemy in a 15-foot line; the penalty rises only after all of them."] } },
    // Swashbuckler
    { uuid: pf2e("83zzG4XBiL5I3NZv"), name: "Revitalizing Finisher", strike: { notes: ["On a hit, you and all allies within 30 feet gain temporary Hit Points equal to half your level; on a miss, only you."] } },
    { uuid: pf2e("lGuoGim7J8Z97kor"), name: "Distracting Toss", strike: { ...ranged, notes: ["Feint first (bravado), at any target within 30 feet; then draw and throw. A successful Feint makes it off-guard to your thrown weapons."] } },
    // Gunslinger
    { uuid: pf2e("Xdf00Kmv5C3qqrtK"), name: "Flesh Wound", strike: { ...ranged, notes: ["On a miss (not a critical miss), one weapon damage die plus weapon specialization damage."] } },
    { uuid: pf2e("r4ZVpDjX2X0yrmhw"), name: "Blast Tackle", strike: { ...ranged, notes: ["Grapple first; only if it succeeds, the Strike, with 3d6 extra precision damage."] } },
    { uuid: pf2e("bSC18SbdaNXfBHu9"), name: "Dance of Thunder", strike: { ...ranged, strikes: ["ranged", "ranged", "ranged"], notes: ["Once per minute. Step, Strike and reload in any order; a hit lets you repeat the set, up to three times. You're fatigued for 1 minute afterwards."] } },
    { uuid: pf2e("mDczSj3GolIbkhGJ"), name: "Instant Return", strike: { ...ranged, notes: ["Against the attacker that missed you, with its own ammunition (its special effects apply)."] } },
    { uuid: pf2e("K9hM3AdWGbU3VE8L"), name: "Final Shot", strike: { ...ranged, notes: ["A success becomes a critical success; a failure misfires. Afterwards you're off-guard until your next turn and stunned 1."] } },
    { uuid: `Compendium.pf2e.actionspf2e.Item.UyMkWfVqdabLTgkH`, name: "Wind Them Up", strike: { melee: true, notes: ["Then Steal at –5 with Thievery, no free hand needed; if it succeeds, the target is off-guard to your ranged attacks until your next turn."] } }
];

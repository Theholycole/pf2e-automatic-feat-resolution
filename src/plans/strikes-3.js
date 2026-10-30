// Archetype and class Strike feats, by hand (2026-10-30, the loop): as strikes-2.js, the card plays the Strike and the rest is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const ranged = { strike: "ranged", anyStrike: false };
const named = (strike) => ({ strike, anyStrike: false });

export default [
    { uuid: pf2e("0idzh4dww7B7cbnW"), name: "Reloading Trick", strike: { ...ranged, notes: ["Interact to reload your unloaded hand crossbow or gauntlet bow first."] } },
    { uuid: pf2e("ug1uJSKxYmpJ1KNz"), name: "Hit and Run", strike: { strides: 1, notes: ["Only while unnoticed or undetected by the target. Stride or Step first and Sneak away after; none of this movement triggers reactions."] } },
    { uuid: pf2e("nY8HtHNJMqP0hz3v"), name: "Phase Bullet", strike: { ...ranged, notes: ["A crossbow or firearm, against a foe observed or hidden. It passes through non-magical walls and ignores cover, concealment, hidden and shields' circumstance bonuses; +4 status to hit a creature wearing armor; a non-magical Shield Block can't reduce it."] } },
    { uuid: pf2e("3OHdjgDGn4yzMD9b"), name: "Guiding Shot", strike: { ...ranged, notes: ["On a hit, the next other creature to attack the target before your next turn gets +1 circumstance (+2 on a critical hit); PF2e's Effect: Guiding Shot."] } },
    { uuid: pf2e("ZuKEEP4S4b4fbgAt"), name: "Gods' Palm", strike: { ...named("fist"), notes: ["On a hit, choose: all its damage is spirit damage, or you gain temporary Hit Points equal to half your level for 1 round (PF2e's Effect: God's Palm)."] } },
    { uuid: pf2e("3q7uo810lJJ09ghv"), name: "Opportune Opening", strike: { melee: true, offGuard: true, notes: ["Against the creature your ally just critically hit."] } },
    { uuid: pf2e("6RDMR41SGsBBVqcA"), name: "Death Roll", strike: { ...named("jaws"), onHit: { conditions: [{ slug: "prone", value: null, duration: null }] }, notes: ["Against the creature you have grabbed: +2 circumstance in water. On a miss, it escapes your grab."] } },
    { uuid: pf2e("aJBnBvbwqxQRhNZF"), name: "Wukong Extension", strike: { melee: true, notes: ["With your weapon innovation; your reach for this Strike is 30 feet."] } },
    { uuid: pf2e("rDrEZhs59LUxzjJu"), name: "Dizzying Spin Dance", strike: { melee: true, notes: ["Tumble Through its space first. If both succeed, it's off-guard to the next attack before your next turn, and you can do it again to a second and then a third opponent."] } },
    { uuid: pf2e("04Smj4ZsEBD8WIXv"), name: "Dual-Weapon Blitz", strike: { melee: true, strides: 1, strikes: ["melee", "melee"], notes: ["Stride up to your Speed, with one Strike with each one-handed weapon at any point of it."] } },
    { uuid: pf2e("PcayTyfEv6s9wRfN"), name: "Cornered Animal", strike: { melee: true, strikes: ["melee", "melee"], notes: ["Against two different creatures flanking you; –2 if the unarmed attack isn't agile. The penalty rises only after both."] } },
    { uuid: pf2e("S450JMWfF90oOcv9"), name: "Path of Iron", strike: { melee: true, strides: 1, strikes: ["melee", "melee", "melee"], notes: ["Stride without triggering reactions, with up to three Strikes at any point, each against a different enemy; the penalty rises only after all of them."] } },
    { uuid: pf2e("lTBARjqQZc1duLIX"), name: "Engraving Strike", strike: { melee: true, notes: ["On a hit, Trace Rune onto the target."] } },
    { uuid: pf2e("Ks4CgusuaXn2aE1U"), name: "Deathblow", strike: { ...ranged, notes: ["A blowgun or sling with your poisoned ammunition. If it hits while you're hidden, unnoticed or undetected, the target must succeed at a Fortitude save against your class DC or die (death, incapacitation); one that survives is immune for 1 day."] } }
];

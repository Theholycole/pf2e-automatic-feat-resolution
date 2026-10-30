// The fighter's Strike feats, by hand (2026-10-30). PF2e's own rules already play Lunge, Dual-Handed Assault, Advantageous Assault, Dazing
// Blow and Agile Shield Grip; what's here is what a hit does that the readers missed, the rest of each feat on the card as notes.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const untilEndOfTurn = { mode: "fixed", value: 0, unit: "rounds", expiry: "turn-end", anchor: "effect-start" };

export default [
    { uuid: pf2e("gt9pvIicabSOe6pB"), name: "Brutish Shove", strike: { melee: true, onHit: { conditions: [{ slug: "off-guard", value: null, duration: untilEndOfTurn }], push: 5, criticalPush: 10 }, notes: ["Only a target your size or smaller is off-guard and Shoved; with a two-handed melee weapon. You can Stride after it as Shove allows."] } },
    { uuid: pf2e("yAgFDUU8HfVK4KTy"), name: "Dragging Strike", strike: { melee: true, onHit: { conditions: [{ slug: "off-guard", value: null, duration: untilEndOfTurn }] }, notes: ["On a hit against a target your size or smaller: pull it 5 feet toward you (you can move with it; no reactions).", "On a failure, the target is still off-guard until the end of your turn (GM)."] } },
    { uuid: pf2e("39CqlOzlHjEhh0E4"), name: "Slam Down", strike: { melee: true, onHit: { follow: "trip" }, notes: ["The Trip only if the Strike dealt damage; a two-handed weapon needs no free hand. Both count toward your multiple attack penalty, but it rises only after both."] } },
    { uuid: pf2e("4PvmSnyp3URIqJUM"), name: "Parting Shot", strike: { strike: "ranged", anyStrike: false, offGuard: true, notes: ["Step first, then Strike: the target is off-guard against it."] } },
    { uuid: pf2e("SnIx3FhBuuq6AZD0"), name: "Quick Reversal", strike: { melee: true, strikes: ["melee", "melee"], notes: ["Two Strikes, each against a different enemy flanking you; the second at the first's multiple attack penalty and not counting toward it."] } },
    { uuid: pf2e("5SBFayX7JqKYANwa"), name: "Rebounding Toss", strike: { strike: "ranged", anyStrike: false, strikes: ["ranged", "ranged"], notes: ["A thrown weapon; if the first Strike hits, the second is against an enemy within 10 feet of the first target. The penalty rises only after both."] } },
    { uuid: pf2e("d1jQ0HyIOyUdCCaN"), name: "Dashing Strike", strike: { melee: true, strides: 1, notes: ["Stride up to your Speed, ending within reach of a different enemy than the one you started adjacent to, then the melee Strike."] } },
    { uuid: pf2e("TEH73yqZBqByO624"), name: "Positioning Assault", strike: { melee: true, notes: ["On a hit, Reposition the target 5 feet (no check). A two-handed melee weapon, the target within reach."] } },
    { uuid: pf2e("Bm8votckjbge54bl"), name: "Sleek Reposition", strike: { melee: true, notes: ["On a hit against a target your size or smaller, Reposition it with no check (a critical hit: Reposition's critical success). A weapon with reach uses its reach."] } },
    { uuid: pf2e("9t6Kfk8Yw8WJYY8Z"), name: "Guiding Finish", strike: { melee: true, notes: ["On a hit, Reposition the target up to 10 feet, through your space if you like; on a failure, 5 feet."] } },
    { uuid: pf2e("Ad0XBuETAkMD6doj"), name: "Felling Strike", strike: { notes: ["On a hit that damages a flying target, it falls up to 120 feet, gently (no fall damage). On a critical hit, it can't Fly, Leap or otherwise leave the ground until the end of your next turn."] } },
    { uuid: pf2e("fCDC53WOOYrsyVIR"), name: "Incredible Ricochet", strike: { strike: "ranged", anyStrike: false, notes: ["Against a creature you already attacked this turn: ignore its concealed condition and all cover."] } },
    { uuid: pf2e("AGydz5DKJ2KHSO4S"), name: "Whirlwind Strike", strike: { melee: true, notes: ["A melee Strike against each enemy within reach, each at the same multiple attack penalty; it rises only after all of them."] } },
    { uuid: pf2e("3y459uK2qfWtS9q4"), name: "Everstand Strike", strike: { notes: ["With the shield wielded in two hands. If it hits and deals damage, you also Raise your Shield."] } }
];

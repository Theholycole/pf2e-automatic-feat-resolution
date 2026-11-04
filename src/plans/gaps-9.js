// Combat passives and reactions no reader or hand plan covered, from the simulator's feat gap index, batch 9 (2026-11-04, Cole: "keep doing
// combat gaps"): a heal spell's second heal, a poison's bigger damage, quickened after a champion's reaction, a short resistance.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const ROUND = { value: 1, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    {
        uuid: pf2e("yExxOkHN1PN37hUa"), name: "Communal Healing", activity: true, target: "another willing living creature within your heal spell's range",
        text: "<p>The target regains @Damage[(ceil(@actor.level/2))[healing]] Hit Points.</p>",
        notes: ["When you cast heal on a single creature: the heal spell's rank, the card takes your highest rank."]
    },
    {
        uuid: pf2e("9Eufa07qvXG41QmG"), name: "Improved Poison Weapon", activity: true, target: "the creature your poisoned Strike hit",
        text: "<p>The target takes @Damage[2d4[poison]] damage.</p>",
        notes: ["Instead of your Poison Weapon's 1d4. A critically failed attack roll doesn't waste the poison."]
    },
    {
        uuid: pf2e("AYXherMu9gFTyXjp"), name: "Deadly Poison Weapon", activity: true, target: "the creature your poisoned Strike hit",
        text: "<p>The target takes @Damage[4d4[poison]] damage.</p>",
        notes: ["Instead of your Poison Weapon's 1d4. An injury poison you apply has its DC raised by 2, to your class DC at most."]
    },
    {
        uuid: pf2e("ZoVC0Ni7QdiWvoIx"), name: "Swift Retribution",
        affect: { target: "you", effects: [{ slug: "quickened", duration: rounds(1, "turn-end") }] },
        notes: ["When an enemy triggers your champion's reaction: quickened on your next turn, the extra action only to move closer to that enemy or Strike it."]
    },
    {
        uuid: pf2e("QkDZ96UR3PzW8FDB"), name: "Spell Survivor",
        toggle: { rules: [{ key: "Resistance", type: "all-damage", value: "1 + floor(max(0, @actor.level - 5) / 4)" }], duration: ROUND },
        notes: ["After you critically succeed at a save against a spell with Orc Superstition or Pervasive Superstition: only against that caster's damage, until the end of its next turn."]
    },
    {
        uuid: pf2e("gTg3D9Dv9L4NEVhV"), name: "Gardener's Resolve", target: "you",
        text: "<p>The target takes @Damage[(@actor.level*2)[mental]] damage.</p>",
        notes: ["Your failed Will save against the fear effect becomes a success."]
    }
];

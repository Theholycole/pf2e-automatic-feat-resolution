// Feats that put a condition on the character, its target or its allies with no roll, by hand (2026-10-30, the loop): the affect entries
// of maneuvers.js. target "you": the character's own token; "each ally within N feet": every ally in range, found by the card.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const minutes = (value) => ({ mode: "fixed", value, unit: "minutes", expiry: "turn-start", anchor: "effect-start" });
const untilYourTurnEnds = { mode: "fixed", value: 0, unit: "rounds", expiry: "turn-end", anchor: "source-turn" };
const untilYourNextTurnEnds = rounds(1, "turn-end");
const concealedSelf = (uuid, name, duration, notes) => ({ uuid, name, affect: { target: "you", effects: [{ slug: "concealed", duration }] }, notes });

export default [
    // On the character
    concealedSelf(pf2e("tB6V6rWv8vAFsKsX"), "Nanite Shroud", null, ["For rounds equal to half your level. You can't use it to Hide or Sneak."]),
    concealedSelf(pf2e("Ewk7h9aQpKvy1RJo"), "Extraplanar Haze", minutes(1), ["You can't use it to Hide or Sneak; see the feat for its other effects."]),
    concealedSelf(pf2e("nAVLB5MLYWUu8N71"), "Storm Shroud", minutes(1), ["You can't use it to Hide or Sneak."]),
    concealedSelf(pf2e("JDH1AIUF0XpmXpYt"), "Pollinate", rounds(1), []),
    // On a target
    { uuid: pf2e("FBtm9rZzk0tCQu9H"), name: "Spark of Independence", affect: { target: "1 minion", range: "touch", effects: [{ slug: "quickened", duration: rounds(1) }] }, notes: ["The extra action only to Step, Stride or Strike. Immune for 10 minutes after."] },
    { uuid: pf2e("m9lf0M1h72tMIBKm"), name: "Lesson of Mutual Gambits", affect: { target: "the creature you Feinted", effects: [{ slug: "off-guard", duration: untilYourNextTurnEnds }] }, notes: ["Off-guard only to your student's first Strike or spell attack roll against it."] },
    { uuid: pf2e("WLFvgbP8aQRhNHgZ"), name: "Emotional Push", affect: { target: "the creature that failed its save", effects: [{ slug: "off-guard", duration: untilYourNextTurnEnds }] }, notes: ["Off-guard only against your next attack."] },
    { uuid: pf2e("tCKme98RHrTZ8QdS"), name: "Pouncing Transformation", affect: { target: "each creature within 5 feet", effects: [{ slug: "off-guard", duration: untilYourTurnEnds }] }, notes: ["Change Shape (or dismiss it) and Stride first: those adjacent at the end. Each is immune for 1 hour."] },
    // On the character's allies
    { uuid: pf2e("WoUwDqhA6i6abwen"), name: "Song of Grace and Speed", affect: { target: "you and each ally within 30 feet", effects: [{ slug: "quickened", duration: minutes(1) }] }, notes: ["The extra action only to Strike, Stride or Step."] },
    { uuid: pf2e("l0pcURfMUGwnJgeU"), name: "Quickening Banner", affect: { target: "each ally within 30 feet", effects: [{ slug: "quickened", duration: rounds(1) }] }, notes: ["The allies in your banner's aura. The extra action only to Strike or Stride."] },
    { uuid: pf2e("8l3qDZrfhxUGijjB"), name: "Rallying Cry", affect: { target: "each ally within 30 feet", effects: [{ slug: "quickened", duration: minutes(1) }, { kind: "temp-hp", formula: "@actor.level", duration: minutes(1) }] }, notes: ["The extra action only to Step, Stride or Strike."] },
    { uuid: pf2e("a9zzu4kb7vstq0HQ"), name: "Cadence Call", affect: { target: "each ally within 10 feet", effects: [{ slug: "quickened", duration: untilYourNextTurnEnds }] }, notes: ["Willing allies in your marshal's aura, until the end of their next turn. The extra action only to Stride; one that uses it is slowed 1 at the end of its turn."] }
];

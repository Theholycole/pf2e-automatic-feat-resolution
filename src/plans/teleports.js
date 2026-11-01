// Round 99: feats that teleport their user a short way, as the item module's teleport card plays an item's (Pick, click a space within
// range, the token moved; the module's src/live/teleport-card.js). An entry is { uuid, name, teleport: { within } | { speedTimes } }; played
// only with the item module on (scripts/main.js), PF2e's own card otherwise.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const misc = (id) => `Compendium.pf2e-team-plus-adventures.pf2e-misc.Item.${id}`;

export default [
    { uuid: pf2e("KwbteWlCzFT5veZO"), name: "Dart Between", teleport: { within: 60 }, notes: ["A space you can see. Not with another creature along, even in an extradimensional container. On arrival you can Part the Veil as a free action; hidden with cover or concealment, you stay hidden."] },
    { uuid: pf2e("27ruxnDDCc2rQpMX"), name: "Plane Hop", teleport: { speedTimes: 1 }, notes: ["Any point you could reach with your Speed."] },
    { uuid: action("FomdyTNeKcV1dQMx"), name: "Fey Jump", teleport: { within: 60 }, notes: ["An empty space you can see. With another creature along, the action is lost."] },
    { uuid: "Compendium.pf2e-team-plus-inventors.inventors-features.Item.G1vSjlohvJMNkPjR", name: "World-Warp Rig", teleport: { speedTimes: 2 }, notes: ["Within line of sight. In Overdrive, you can have all creatures in a 5-foot emanation take fire damage equal to your level, at your departure and your arrival: by hand."] },
    { uuid: pf2e("hOZP7qOMsNYOe90o"), name: "Wandering Thoughts", teleport: { within: 15 }, notes: ["A square you can see, while your Psyche is Unleashed, after you Cast a Spell."] },
    // (Moves the readers leave, their Stride linked or after another step: the move card, teleport.move its verb and lines; round 100.)
    { uuid: pf2e("meQJfsKVar9tm6c9"), name: "Running Reload", teleport: { speedTimes: 1, move: { verb: "Stride", lines: ["Or Step or Sneak instead", "Then Interact to reload"] } } },
    { uuid: misc("34Mp77lZxHkFQbsT"), name: "Quick Footed", teleport: { speedTimes: 1, move: { verb: "Stride", lines: [] } }, notes: ["First increase your frustrated condition by 1."] },
    { uuid: misc("JXJwAHcjmuEvqGyN"), name: "Winding Movements", teleport: { speedTimes: 1, move: { verb: "Stride", lines: ["You don't provoke reactions from this Stride"] } }, notes: ["First increase your frustrated condition by 1."] },
    { uuid: misc("WQNkkfjLe4i4Vj7c"), name: "Beneath My Feet", teleport: { speedTimes: 2, move: { verb: "Stride", lines: ["Through the spaces of creatures at least one size smaller, Trampling each creature whose space you enter"] } }, notes: ["Each creature you Trample (once each) takes bludgeoning damage equal to one of your monster form's Strikes, basic Reflex save: by hand."] },
    // (Round 101.)
    { uuid: pf2e("E3NsAdbp7kkOvfnr"), name: "Quick Positioning", teleport: { within: 10, move: { verb: "Step", lines: ["Up to twice"] } } },
    { uuid: pf2e("Pay7XmMLgLtzxklN"), name: "Tight Follower", teleport: { speedTimes: 1, move: { verb: "Stride", lines: ["Closer to your designated ally, ending within 10 feet of them"] } } },
    { uuid: "Compendium.pf2e-team-plus-feats.pf2e-misc.Item.2XWMN181rq3h8K5j", name: "Crash Together", teleport: { speedTimes: 0.5, move: { verb: "Stride", lines: ["In the same direction as your Castling Crashers partner"] } } },
    // (Round 102: Strides three times, Steps twice, and moves beside another action.)
    { uuid: pf2e("lEtQVtPtoJtHVgGx"), name: "Incredible Sprint", teleport: { speedTimes: 3, move: { verb: "Stride", lines: ["Three times"] } } },
    { uuid: pf2e("kvhouG3yJ2vQkzah"), name: "Rabid Sprint", teleport: { speedTimes: 3, move: { verb: "Stride", lines: ["Three times, on all fours"] } } },
    { uuid: pf2e("aIm2qi4JZerthZmF"), name: "Elf Step", teleport: { within: 10, move: { verb: "Step", lines: ["5 feet twice"] } } },
    { uuid: pf2e("etaixAdHNlHnLH0i"), name: "Guarded Advance", teleport: { within: 10, move: { verb: "Step", lines: ["Twice, and Raise a Shield, in any order"] } } },
    { uuid: pf2e("Nb8MUoTpyX9u8di4"), name: "Guarded Advance (Knight Vigilant)", teleport: { within: 5, move: { verb: "Step", lines: ["Before or after you Raise a Shield"] } } },
    { uuid: pf2e("Q47qXtK2cevjYUXe"), name: "Running Recharge", teleport: { speedTimes: 0.5, move: { verb: "Stride", lines: ["Or Step instead"] } }, notes: ["Your Spellstrike is recharged too."] },
    { uuid: pf2e("vXH0HWMHzevA1Wox"), name: "Winding Flow", teleport: { speedTimes: 1, move: { verb: "Stride", lines: ["Two of Stand, Step and Stride, in any order, not the same one twice"] } } },
    // (Round 103: PF2e's own basic moves, posted from the sheet: the same card, Pick and click.)
    { uuid: action("Bcxarzksqt9ezrs6"), name: "Stride", teleport: { speedTimes: 1, move: { verb: "Stride", lines: [] } } },
    { uuid: action("UHpkTuCtyaPqiCAB"), name: "Step", teleport: { within: 5, move: { verb: "Step", lines: ["Doesn't trigger reactions triggered by move actions"] } } },
    { uuid: action("Tj055UcNm6UEgtCg"), name: "Crawl", teleport: { within: 5, move: { verb: "Crawl", lines: ["You stay prone"] } } },
    { uuid: action("eBgO5gp5kKhGtmk9"), name: "Water Transfer", teleport: { within: 120 }, notes: ["A space on land adjacent to the same body of water."] }
];

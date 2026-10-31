// Round 99: feats that teleport their user a short way, as the item module's teleport card plays an item's (Pick, click a space within
// range, the token moved; the module's src/live/teleport-card.js). An entry is { uuid, name, teleport: { within } | { speedTimes } }; played
// only with the item module on (scripts/main.js), PF2e's own card otherwise.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;

export default [
    { uuid: pf2e("KwbteWlCzFT5veZO"), name: "Dart Between", teleport: { within: 60 }, notes: ["A space you can see. Not with another creature along, even in an extradimensional container. On arrival you can Part the Veil as a free action; hidden with cover or concealment, you stay hidden."] },
    { uuid: pf2e("27ruxnDDCc2rQpMX"), name: "Plane Hop", teleport: { speedTimes: 1 }, notes: ["Any point you could reach with your Speed."] },
    { uuid: action("FomdyTNeKcV1dQMx"), name: "Fey Jump", teleport: { within: 60 }, notes: ["An empty space you can see. With another creature along, the action is lost."] },
    { uuid: "Compendium.pf2e-team-plus-inventors.inventors-features.Item.G1vSjlohvJMNkPjR", name: "World-Warp Rig", teleport: { speedTimes: 2 }, notes: ["Within line of sight. In Overdrive, you can have all creatures in a 5-foot emanation take fire damage equal to your level, at your departure and your arrival: by hand."] },
    { uuid: pf2e("hOZP7qOMsNYOe90o"), name: "Wandering Thoughts", teleport: { within: 15 }, notes: ["A square you can see, while your Psyche is Unleashed, after you Cast a Spell."] }
];

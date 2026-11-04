// Combat passives and actions no reader or hand plan covered, from the simulator's feat gap index, batch 10 (2026-11-04, Cole: "keep
// going"): rogue debilitations, a feint's attack penalty, frightened from a question, a gunslinger's bomb burst, a shove's slam damage.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const ROUND = { value: 1, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    {
        uuid: pf2e("30iI5riJ2E2UHyhL"), name: "Heartless Debilitations",
        toggle: { who: "target", rules: [{ key: "Weakness", type: "bleed", value: 5 }, { key: "Weakness", type: "poison", value: 5 }], duration: ROUND },
        notes: ["A debilitation for your Debilitating Strike, until the end of your next turn. The other one instead makes the target @UUID[Compendium.pf2e.conditionitems.Item.Frightened]{Frightened 1}."]
    },
    {
        uuid: pf2e("QicYF43HqgpOBLzo"), name: "Bloody Debilitation", activity: true, target: "the creature your Debilitating Strike hit",
        text: "<p>The target takes @Damage[3d6[bleed]] damage.</p>",
        notes: ["A debilitation for your Debilitating Strike, in place of the others."]
    },
    {
        uuid: pf2e("kUv9eiP8Zhck70WZ"), name: "Eldritch Debilitations",
        affect: { target: "the creature your Debilitating Strike hit", effects: [{ slug: "stupefied", value: 1, duration: rounds(1, "turn-end") }] },
        notes: ["A debilitation for your Debilitating Strike, until the end of your next turn. The other one instead stops the target from Stepping."]
    },
    {
        uuid: pf2e("9CaaU5szcf3mtJXD"), name: "Overextending Feint",
        toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "attack", type: "circumstance", value: -2 }], duration: ROUND },
        notes: ["After your successful Feint, in place of off-guard: only on attacks against you, until the end of its next turn. On a success only its next attack; remove it after that."]
    },
    {
        uuid: pf2e("SwkIcrtHO60FkhEH"), name: "Make 'Em Sweat",
        affect: { target: "the creature you succeeded at a Pointed Question against", effects: [{ slug: "frightened", value: 1, duration: null }] },
        notes: ["Frightened 2 on a critical success: post it again. It's an emotion and fear effect."]
    },
    {
        uuid: pf2e("7r79fZBr37qBN2EF"), name: "Shattering Shot",
        text: "<p>Each creature in a @Template[burst|distance:15] takes @Damage[(floor((@actor.level+6)/6))d8[fire]] damage with a @Check[reflex|against:gunslinger|basic] save.</p>",
        notes: ["The burst is centered on a corner within your firearm's first range increment. The card rolls a greater (major at 18th level) alchemist's fire: use your own bomb's dice and type. No splash or persistent damage."]
    },
    {
        uuid: pf2e("oIE88rIDEFNm83Mr"), name: "Powerful Shove", activity: true, target: "the creature you Shoved or knocked back into an object",
        text: "<p>The target takes @Damage[(max(1,@actor.abilities.str.mod))[bludgeoning]] damage.</p>",
        notes: ["When it has to stop moving because it would hit an object. Aggressive Block and Brutish Shove also work on creatures up to two sizes larger than you."]
    },
    {
        uuid: pf2e("N4wCUZH2KG6FoGqh"), name: "Shared Stratagem",
        affect: { target: "the creature you hit with your Devise a Stratagem attack", effects: [{ slug: "off-guard", value: null, duration: rounds(1) }] },
        notes: ["Off-guard only to the ally you name, on that ally's next attack against it, before the start of your next turn: remove it after that attack."]
    }
];

// One-off combat feats, batch 19 (2026-11-05, Cole: "Grind everything"): a runesmith's +4 against a magical attack, a familiar's cloud,
// a beacon that dazzles the unholy, a pool of blood that heals.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const THIS_TURN = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };
const dazzled = "@UUID[Compendium.pf2e.conditionitems.Item.TkIyaNPgTZFBCCuh]{Dazzled}";

export default [
    {
        uuid: pf2e("grA1PUgdYNTP66oG"), name: "Return Unto Runes",
        toggle: { rules: [{ key: "FlatModifier", selector: "ac", type: "circumstance", value: 4 }], duration: THIS_TURN },
        notes: ["Only against the triggering spell attack or magical attack: remove the Effect after it. If it misses, the spell is sealed in a rune you can Trace until the end of your next turn (by hand)."]
    },
    { uuid: pf2e("lGB1C4r2EtqDY9oy"), name: "Apparition Cloud", affect: { target: "you", effects: [{ slug: "concealed", duration: rounds(1) }] }, notes: ["Concealed only from the triggering attack: remove it after that. Until your next turn your familiar can't be targeted, and the spaces next to you are difficult terrain for enemies."] },
    {
        uuid: pf2e("xmf6oUYarFJGajtr"), name: "Holy Light", target: "each unholy creature in the 30-foot radius about you",
        text: `<p>The target attempts a @Check[will|against:class-spell] save.</p><hr /><p><strong>Critical Success</strong> The target is unaffected.</p><p><strong>Success</strong> The target is unaffected.</p><p><strong>Failure</strong> The target is ${dazzled} for 1 round.</p><p><strong>Critical Failure</strong> The target is ${dazzled} for 1 round.</p>`,
        notes: ["The beacon sheds bright light in a 30-foot radius (100 feet high) until your next turn."]
    },
    {
        uuid: pf2e("4AVT6Ux0GDsxXLyJ"), name: "Blood Pool", target: "the ally who absorbs the blood pool",
        text: "<p>The target regains @Damage[(@actor.level)[healing]] Hit Points.</p>",
        notes: ["Post it when an ally enters the pool's space and absorbs it (a free action); the pool lasts 1 minute."]
    }
];

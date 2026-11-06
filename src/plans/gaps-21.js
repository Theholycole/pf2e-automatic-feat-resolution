// One-off combat feats, batch 21 (2026-11-05, Cole: "Grind everything"): a weakness to all damage (Marked for Rebuke), the Crimson Oath's
// last power (The Tyrant Falls!), a phoenix's last burst (Blazing Conflagration), a reflected glare (Reflective Defense), and conditions
// and temporary Hit Points the module only had as a reminder timer (Tactical Retreat, Feast, Wrapped In Smoke, Pincer Attack).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const MINUTE = { mode: "fixed", value: 1, unit: "minutes", expiry: "turn-start", anchor: "effect-start" };
const dazzled = "@UUID[Compendium.pf2e.conditionitems.Item.TkIyaNPgTZFBCCuh]{Dazzled}";
const blinded = "@UUID[Compendium.pf2e.conditionitems.Item.Blinded]{Blinded}";

export default [
    {
        uuid: pf2e("k8c0E7YyeIQJjRzB"), name: "Marked for Rebuke",
        toggle: { who: "target", rules: [{ key: "Weakness", type: "all-damage", value: 10 }], duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false } },
        notes: ["Target one creature your next damaging spell damaged. It's then immune to Marked for Rebuke for 24 hours."]
    },
    {
        uuid: pf2e("H63SJLkenhLDkVnN"), name: "The Tyrant Falls!",
        toggle: { rules: [{ key: "Resistance", type: "all-damage", value: "floor(@actor.level/2)" }, { key: "DamageDice", selector: "strike-damage", diceNumber: 2, dieSize: "d6", damageType: "vitality", predicate: ["item:melee"] }], duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false } },
        notes: ["Drained 1 at the start of each of your turns (or 1 higher), which you can't reduce; it doesn't penalize your Fortitude saves. Your melee weapon gains reach (or 5 feet more). The extra 2d6 is vitality or void, whichever is worse for the target: change the type on a living target. Invoke the Crimson Oath at will in a 40-foot cone."]
    },
    {
        uuid: action("XotRIv6tKRtuAGAF"), name: "Blazing Conflagration", target: "each creature in a 10-foot burst about you",
        text: `<p>Each creature in a @Template[type:burst|distance:10] takes @Damage[max(16,(2*(floor(@actor.level/2))))d6[fire]|options:area-damage] damage with a @Check[fortitude|against:spell|basic|options:area-effect] save. A creature that critically fails is ${blinded} for 1 round.</p>`,
        notes: ["Your phoenix form ends. You gain 8d6 temporary Hit Points (9d6 at 18th level, 10d6 at 20th). At 18th and 20th level the burst deals 2d6 more fire damage each."]
    },
    {
        uuid: pf2e("Bi79QIvSE9JxJGkp"), name: "Reflective Defense", target: "the creature within 30 feet that targeted you",
        text: `<p>The target attempts a @Check[reflex|against:class] save.</p><hr /><p><strong>Critical Success</strong> The target is unaffected.</p><p><strong>Success</strong> The target is unaffected.</p><p><strong>Failure</strong> The target is ${dazzled} until the end of your next turn.</p><p><strong>Critical Failure</strong> The target is ${dazzled} until the end of your next turn.</p>`,
        notes: ["Once per 10 minutes, in dim or bright light."]
    },
    { uuid: action("KInVpdfrxg0AqjRt"), name: "Tactical Retreat", affect: { target: "you", effects: [{ slug: "fleeing", duration: rounds(1) }] }, notes: ["Then Stride. Once per hour."] },
    { uuid: pf2e("Tln47zk8F8nswrEI"), name: "Feast", affect: { target: "you", effects: [{ kind: "temp-hp", formula: "floor(@actor.level/2)", duration: MINUTE }] }, notes: ["A living creature also takes your jaws' damage (roll your jaws Strike's damage). You can instead take twice your level, then succeed at a DC 6 flat check or your body deteriorates: edit the temporary Hit Points."] },
    { uuid: pf2e("VPnkSL25EfrEpPSX"), name: "Wrapped In Smoke", affect: { target: "each creature in the 5-foot emanation about your innovation", effects: [{ slug: "concealed", duration: MINUTE }] }, notes: ["The cloud lasts 1 minute; creatures outside it are concealed to those inside. Remove it from a creature that leaves the smoke."] },
    { uuid: action("zLFfwNmmPTND6OMO"), name: "Pincer Attack", affect: { target: "each opponent a squadmate Stepped next to", effects: [{ slug: "off-guard", duration: rounds(1) }] }, notes: ["Off-guard only to melee attacks from you and the squadmates who responded."] }
];

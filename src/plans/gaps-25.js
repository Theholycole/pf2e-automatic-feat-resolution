// One-off combat feats, batch 25 (2026-11-05, Cole: "Grind everything"): exemplar ikon actions whose save is against "exemplar" (an exemplar's class
// DC, so any class's here, as an archetype gives it) — Captivating Charm's fascinated, Skirt the Underworld's blinded, Ringing Challenge's basic
// damage —, and conditions or temporary Hit Points the module only had as a reminder timer (All This Has Happened Before, Sidestep Through
// Time, Patronize the Arts, Hidden Paragon, Vomit Stomach) and two circumstance bonuses (Fierce Competitor, Wait For It...).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const MINUTE = { mode: "fixed", value: 1, unit: "minutes", expiry: "turn-start", anchor: "effect-start" };
const condition = (id, label) => `@UUID[Compendium.pf2e.conditionitems.Item.${id}]{${label}}`;
const fascinated = condition("AdPVz7rbaVSRxHFg", "Fascinated");
const blinded = condition("XgEqL1kFApUbl5Z2", "Blinded");
const deafened = condition("9PR9y0bi4JPKnHPR", "Deafened");
const rows = (save, failure, criticalFailure = failure) => `<p>The target attempts a ${save} save against your class DC.</p><hr /><p><strong>Critical Success</strong> The target is unaffected.</p><p><strong>Success</strong> The target is unaffected.</p><p><strong>Failure</strong> ${failure}</p><p><strong>Critical Failure</strong> ${criticalFailure}</p>`;

export default [
    {
        uuid: action("jTfJzj1yfmPLsxmj"), name: "Captivating Charm", target: "one creature within 30 feet",
        text: rows("@Check[will|against:class]", `The target is ${fascinated} until the start of your next turn.`),
        notes: ["Fascinated by you. It ends if you use a hostile action against the target (not against its allies)."]
    },
    {
        uuid: action("exuTl8tvVlewxVGJ"), name: "Skirt the Underworld", target: "each enemy adjacent to you during your Fly",
        text: rows("@Check[fortitude|against:class|options:inflicts:blinded]", `The target is ${blinded} for 1 minute.`),
        notes: ["You're Invisible for 1 round (add the condition), +1 round for each creature this blinds, then Fly up to your Speed. On a critical failure the blindness is permanent: edit its duration. Undead and psychopomps are immune."]
    },
    {
        uuid: action("mBqZ2IahMT9Jvo7k"), name: "Ringing Challenge", target: "each creature in a 30-foot cone or 15-foot emanation",
        text: "<p>Each creature in the area takes @Damage[(max(1,(floor((@actor.level - 2)/2))))d4[spirit]|options:area-damage] damage and @Damage[(max(1,(floor((@actor.level - 2)/2))))d4[sonic]|options:area-damage] damage with a @Check[fortitude|against:class|basic|options:area-effect] save against your class DC.</p><hr /><p><strong>Critical Success</strong> The creature is unaffected.</p><p><strong>Success</strong> The creature takes half damage.</p><p><strong>Failure</strong> The creature takes full damage.</p><p><strong>Critical Failure</strong> The creature takes double damage and is " + deafened + " for 1 minute.</p>"
    },
    { uuid: pf2e("A2X3EBf8s5XSCYG0"), name: "All This Has Happened Before", affect: { target: "you", effects: [{ slug: "quickened", duration: rounds(1, "turn-end") }] }, notes: ["Also a +4 circumstance bonus to the triggering initiative roll: add it to your initiative. The extra action only to Recall Knowledge or Step."] },
    { uuid: action("gCVox3KLuKFXCUqZ"), name: "Sidestep Through Time", affect: { target: "you", effects: [{ slug: "off-guard", duration: rounds(1) }] }, notes: ["Teleport up to 10 feet first: if that takes you out of the area, you don't attempt the Reflex save."] },
    { uuid: pf2e("5lGNRo5QarJHrkaA"), name: "Patronize the Arts", affect: { target: "the ally who critically succeeded", effects: [{ kind: "temp-hp", formula: "floor(@actor.level/2)+@actor.abilities.cha.mod", duration: MINUTE }] }, notes: ["This is the Persistence choice. For Eagerness, the ally Feints, Interacts, Leaps, Reloads or Steps as a reaction instead; for Validation, it gains panache. The ally is then immune for 1 day."] },
    { uuid: pf2e("Kl1O0WK37KMTumv1"), name: "Hidden Paragon", affect: { target: "you", effects: [{ slug: "invisible", duration: MINUTE }] }, notes: ["Even if you use a hostile action. Revealing Light, See the Unseen and the like don't reveal you; Seek still can."] },
    { uuid: pf2e("MFcsGkzPYaWxwW4d"), name: "Vomit Stomach", affect: { target: "you", effects: [{ kind: "condition", slug: "sickened", value: 0, duration: null, stack: { by: -2 } }, { slug: "off-guard", duration: rounds(1) }] }, notes: ["Then attempt a save against any ingested poison from the last minute with a +2 circumstance bonus."] },
    { uuid: pf2e("SEtFRKVV9bt4MJEn"), name: "Fierce Competitor", toggle: { who: "target", rules: [{ key: "FlatModifier", selector: ["acrobatics", "athletics"], type: "circumstance", value: 2 }], duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false } }, notes: ["Target you and the ally you challenge. Only on the competition's one use of Acrobatics or Athletics; it ends when one of you wins. The winner (you) then gets +2 status to Intimidation for 1 hour."] },
    { uuid: action("5stdIykWux9WHqce"), name: "Wait For It...", toggle: { who: "target", rules: [{ key: "FlatModifier", selector: ["ac", "saving-throw"], type: "circumstance", value: 1 }], duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false } }, notes: ["Up to two squadmates in your banner's aura, only while they Delay or Ready: remove it when they stop Delaying or use the Readied action."] },
    { uuid: pf2e("4DbkL74DuVbMcYuG"), name: "Clear as Air", affect: { target: "you", effects: [{ slug: "invisible", duration: rounds(1, "turn-end") }] }, notes: ["Used again within 10 minutes: Concealed instead (swap the condition). Below 10th level it ends after a hostile action; from 10th a hostile action makes you Concealed instead until your next turn; from 16th it doesn't matter. Sustain to extend."] },
    { uuid: pf2e("Yjet0FGAHPx7gjod"), name: "Hardening Necrosis", affect: { target: "you", effects: [{ slug: "slowed", value: 1, duration: rounds(1) }] }, notes: ["Resistance 6 to the triggering critical hit's physical damage (8 from 13th level, 10 from 17th): subtract it when you apply that damage."] },
    { uuid: pf2e("HEZeZcBWQR1QeWDo"), name: "Astonishing Explosion", affect: { target: "each creature your bomb Strike hit", effects: [{ slug: "fascinated", duration: rounds(1) }] }, notes: ["Fascinated by you. On a critical hit the target is also Stunned 1: add it."] }
];

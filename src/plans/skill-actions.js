// Skill actions' results applied after the roll (round 110, Cole's pick "Those plus detection", 2026-11-01): PF2e posts the check, from the
// sheet or PF2e Workbench's Basic Action Macro; scripts/skill-actions.js whispers a card whose Apply button does what the degree says.
// Pure: which action a roll is for, and what each degree does.

const DEGREES = ["criticalFailure", "failure", "success", "criticalSuccess"];

// The skill action a PF2e check is for, from its roll options: { slug, variant } or null.
export function skillActionOf(options = [], flavor = "", pointOutTitle = null) {
    const has = (slug) => options.includes(`action:${slug}`);
    if (has("administer-first-aid")) {
        const variant = options.some((option) => /stop-bleeding/.test(option)) || /Stop Bleeding/i.test(flavor) ? "stop-bleeding" : options.some((option) => /stabilize/.test(option)) || /Stabilize/i.test(flavor) ? "stabilize" : null;
        return { slug: "administer-first-aid", variant };
    }
    for (const slug of ["treat-poison", "treat-disease", "hide", "sneak", "seek", "point-out"]) if (has(slug)) return { slug, variant: null };
    // (PF2e's Point Out posts no context, only its title; pointOutTitle: the localized one; round 110 Foundry test.)
    const titles = ["Point Out", pointOutTitle].filter(Boolean).map((title) => title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!options.length && new RegExp(`<strong>\\s*(?:${titles.join("|")})\\s*</strong>`).test(flavor)) return { slug: "point-out", variant: null };
    return null;
}

// Administer First Aid on the patient: { dying: "remove" | "+1" | null, bleed: "remove" | "damage" | null }.
export function firstAidResult(variant, outcome) {
    const good = ["success", "criticalSuccess"].includes(outcome);
    if (variant === "stabilize") return { dying: good ? "remove" : outcome === "criticalFailure" ? "+1" : null, bleed: null };
    if (variant === "stop-bleeding") return { dying: null, bleed: good ? "remove" : outcome === "criticalFailure" ? "damage" : null };
    return { dying: null, bleed: null };
}

// Treat Poison or Treat Disease: the patient's bonus (or penalty) to its next save against it, or null.
export function treatmentBonus(slug, outcome) {
    const value = { criticalSuccess: 4, success: 2, criticalFailure: -2 }[outcome];
    if (!value) return null;
    const trait = slug === "treat-poison" ? "poison" : "disease";
    return { value, trait, rules: [{ key: "FlatModifier", selector: "saving-throw", type: "circumstance", value, predicate: [`item:trait:${trait}`], label: slug === "treat-poison" ? "Treat Poison" : "Treat Disease" }] };
}

// A degree from a total against a DC (no natural 20 or 1: the die isn't known for each observer's DC here; it is passed when it is).
export function degreeAgainst(total, dc, die = null) {
    let step = total >= dc + 10 ? 3 : total >= dc ? 2 : total <= dc - 10 ? 0 : 1;
    if (die === 20) step = Math.min(3, step + 1);
    if (die === 1) step = Math.max(0, step - 1);
    return DEGREES[step];
}

// Detection per observer (round 110, Cole: "when a creature sneaks then only creatures that seek and roll high enough can see them", unless
// they have special senses). Each state is the sneaker's to one observer: "undetected", "hidden" or "observed".
const RANK = { observed: 0, hidden: 1, undetected: 2 };
const VISION = new Set(["darkvision", "greater-darkvision", "low-light-vision", "see-invisibility", "infrared-vision", "truesight", "vision"]);

// The best the sneaker can be to an observer with these senses ([{ type, acuity, range }]) at this distance: a precise non-visual sense in
// range sees it ("observed"); an imprecise one (scent, tremorsense) knows its square ("hidden"); else "undetected".
export function senseCap(senses = [], feet = 0) {
    const inRange = (sense) => !VISION.has(sense.type) && (sense.range === null || sense.range === undefined || !Number.isFinite(Number(sense.range)) || Number(sense.range) >= feet);
    if (senses.some((sense) => sense.acuity === "precise" && inRange(sense))) return "observed";
    if (senses.some((sense) => sense.acuity === "imprecise" && inRange(sense))) return "hidden";
    return "undetected";
}
const lower = (state, cap) => (RANK[state] > RANK[cap] ? cap : state);

// Sneak or Hide against each observer: [{ id, name, dc, degree, state }]. Sneak: undetected on a success, hidden on a failure, observed on a
// critical failure. Hide: hidden on a success, as it was otherwise. Each capped by the observer's senses (cap).
export function stealthByObserver(slug, total, die, observers) {
    return observers.map((observer) => {
        const degree = degreeAgainst(total, observer.dc, die);
        const beat = ["success", "criticalSuccess"].includes(degree);
        const before = observer.state ?? "observed";
        let state = slug === "sneak" ? (beat ? "undetected" : degree === "failure" ? "hidden" : "observed") : beat ? (before === "undetected" ? "undetected" : "hidden") : before;
        state = lower(state, observer.cap ?? "undetected");
        return { ...observer, degree, state };
    });
}

// The PF2e condition that holds against every observer (its flat checks and off-guard), or null: undetected if undetected to all, hidden if
// at least hidden to all.
export function commonCondition(states) {
    const values = Object.values(states ?? {});
    if (!values.length) return null;
    if (values.every((state) => state === "undetected")) return "undetected";
    if (values.every((state) => RANK[state] >= 1)) return "hidden";
    return null;
}

// Seek by one observer: its new state for the sought creature. Critical success: observed; success: undetected → hidden, hidden → observed.
export function seekState(state, degree) {
    if (degree === "criticalSuccess") return "observed";
    if (degree === "success") return state === "undetected" ? "hidden" : "observed";
    return state;
}

// After the sneaker attacks an observer: undetected → hidden, hidden → observed.
export const afterAttack = (state) => (state === "undetected" ? "hidden" : "observed");

// The DC of the poison or disease afflicting the patient (PF2e's affliction items, or an Effect or condition with that trait and a DC), or
// null.
export function treatmentDC(actor, trait) {
    const items = [...(actor?.items ?? [])];
    for (const item of items) {
        const traits = item.system?.traits?.value ?? [];
        if (!traits.includes(trait)) continue;
        const dc = Number(item.system?.save?.dc ?? item.system?.save?.value ?? item.system?.dc?.value ?? item.system?.dc);
        if (Number.isFinite(dc) && dc > 0) return dc;
    }
    return null;
}

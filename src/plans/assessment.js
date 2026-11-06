// Battle Assessment and Combat Reading (2026-11-04, Cole: "keep working on feats"): a secret check against the higher of the enemy's
// Deception and Stealth DCs; on a success the GM tells one fact about it (two on a critical success), on a critical failure a false one.
// The facts (pure, for scripts/assessment.js and the tests): its highest weakness, its lowest save, one immunity, its highest resistance.

export const ASSESSMENTS = { "battle-assessment": { statistic: "perception", label: "Perception" }, "combat-reading": { statistic: "occultism", label: "Occultism" } };
const SAVES = { fortitude: "Fortitude", reflex: "Reflex", will: "Will" };
const words = (type) => String(type ?? "").replace(/-/g, " ");

// creature: { weaknesses: [{ type, value }], resistances: [{ type, value }], immunities: [type], saves: { fortitude, reflex, will } }.
export function assessmentFacts(creature) {
    const facts = [];
    const top = (list) => [...(list ?? [])].filter((entry) => Number(entry.value) > 0).sort((a, b) => b.value - a.value);
    const weak = top(creature.weaknesses);
    if (weak.length) facts.push({ kind: "weakness", text: `Its highest weakness is ${words(weak[0].type)} ${weak[0].value}.` });
    const saves = Object.entries(SAVES).filter(([key]) => Number.isFinite(creature.saves?.[key]));
    if (saves.length) {
        const low = Math.min(...saves.map(([key]) => creature.saves[key]));
        const lowest = saves.filter(([key]) => creature.saves[key] === low);
        facts.push({ kind: "save", text: `Its lowest save is ${lowest.map(([, name]) => name).join(" or ")}.` });
    }
    if ((creature.immunities ?? []).length) facts.push({ kind: "immunity", options: creature.immunities.map((type) => `It is immune to ${words(type)}.`) });
    const resist = top(creature.resistances);
    if (resist.length) facts.push({ kind: "resistance", text: `Its highest resistance is ${words(resist[0].type)} ${resist[0].value}.` });
    return facts;
}

// Ties and "one immunity" picked at random (random: () => [0, 1)).
const pick = (list, random) => list[Math.floor(random() * list.length) % list.length];
const say = (fact, random) => fact.text ?? pick(fact.options, random);

// What the character learns at a degree: true facts (1, or 2 on a critical success), none on a failure, a false one on a critical failure.
export function assessmentResult(creature, degree, random = Math.random) {
    const facts = assessmentFacts(creature);
    if (degree === "failure") return { lines: [], false: false };
    if (degree === "criticalFailure") return { lines: [falseFact(creature, random)], false: true };
    const count = degree === "criticalSuccess" ? 2 : 1;
    const chosen = [];
    const left = [...facts];
    while (chosen.length < count && left.length) chosen.push(left.splice(Math.floor(random() * left.length) % left.length, 1)[0]);
    return { lines: chosen.map((fact) => say(fact, random)), false: false };
}

const TYPES = ["acid", "cold", "electricity", "fire", "sonic", "poison", "mental", "vitality", "void", "spirit", "slashing", "piercing", "bludgeoning", "holy", "unholy"];
export function falseFact(creature, random = Math.random) {
    const has = (list, type) => (list ?? []).some((entry) => (entry.type ?? entry) === type);
    const saves = Object.keys(SAVES).filter((key) => Number.isFinite(creature.saves?.[key]));
    const low = saves.length ? Math.min(...saves.map((key) => creature.saves[key])) : null;
    const wrongSaves = saves.filter((key) => creature.saves[key] !== low);
    const options = [
        () => `Its highest weakness is ${words(pick(TYPES.filter((type) => !has(creature.weaknesses, type) && !has(creature.immunities, type)), random))} ${Math.max(5, Math.round((creature.level ?? 1) / 2) + 2)}.`,
        ...(wrongSaves.length ? [() => `Its lowest save is ${SAVES[pick(wrongSaves, random)]}.`] : []),
        () => `It is immune to ${words(pick(TYPES.filter((type) => !has(creature.immunities, type) && !has(creature.weaknesses, type)), random))}.`
    ];
    return pick(options, random)();
}

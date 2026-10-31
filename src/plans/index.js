// Plans written by hand for feats the readers don't take (2026-10-30, docs/feats.md, "Hand-picked"): the most-played class feats first,
// each from its own text. An entry is { uuid, name, strike } (a Strike feat: what differs from a plain Strike, merged into the
// strike-activity builtin the readers make), { uuid, name, act } (a basic action it uses as written: "demoralize", "feint", "trip" …, the
// ability module's card for it), { uuid, name, affect } (conditions it puts on its target with no roll) or { uuid, name, text } (the feat's rules rewritten in the plain words the readers take, with
// PF2e's own tags, so the character's numbers still fill in). Looked up by the item's compendium source.

import { sourceOf } from "../rules/index.js";
import { fillCharacterNumbers } from "../compiler/character-dcs.js";
import fighter from "./fighter.js";
import martial from "./martial.js";
import tactical from "./tactical.js";
import strikes2 from "./strikes-2.js";
import maneuvers from "./maneuvers.js";
import saves from "./saves.js";
import saves2 from "./saves-2.js";
import checks from "./checks.js";
import damage from "./damage.js";
import saves3 from "./saves-3.js";
import damage2 from "./damage-2.js";
import strikes3 from "./strikes-3.js";
import affects from "./affects.js";
import eidolons from "./eidolons.js";
import saves4 from "./saves-4.js";
import saves5 from "./saves-5.js";
import heals from "./heals.js";
import checks2 from "./checks-2.js";
import affects2 from "./affects-2.js";
import passiveEffects from "./passive-effects.js";
import toggles from "./toggles.js";
import linkedEffects from "./linked-effects.js";
import selfChecks from "./self-checks.js";
import attacks from "./attacks.js";
import affects3 from "./affects-3.js";

export const PLAN_BATCHES = [fighter, martial, tactical, strikes2, maneuvers, saves, saves2, checks, damage, saves3, damage2, strikes3, affects, eidolons, saves4, saves5, heals, checks2, affects2, passiveEffects, toggles, linkedEffects, selfChecks, affects3, attacks];
const BY_UUID = new Map(PLAN_BATCHES.flat().map((entry) => [entry.uuid, entry]));

export const handEntry = (item) => BY_UUID.get(sourceOf(item)) ?? null;

// A strike entry → the strike-activity plan. base: what the readers made of the feat, when they read it as a Strike activity; its save
// after the hit (at the character's own DC) stays unless the entry gives one, and the entry's notes replace its unread sentences.
export function handStrike(item, entry, base = null) {
    const strike = entry.strike ?? {};
    const read = base?.builtin === "strike-activity" ? base : null;
    const plan = {
        builtin: "strike-activity",
        actions: Number(item.system?.actions?.value) || 1,
        strides: 0,
        strike: null,
        anyStrike: !strike.melee && strike.strike !== "ranged",
        melee: false,
        attackBonus: 0,
        damageBonus: 0,
        offGuard: false,
        requires: null,
        oncePerFight: false,
        source: { name: item.name, type: item.type },
        notes: [],
        ...(read ?? {}),
        ...strike,
        onHit: { conditions: [], critical: null, push: null, damage: [], save: null, size: null, ...(read ? { save: read.onHit?.save ?? null, size: read.onHit?.size ?? null } : {}), ...(strike.onHit ?? {}) }
    };
    // (No save read, the character without that class's DC — a Fighter with Stunning Finisher, no Swashbuckler Dedication: the note says
    // to roll it by hand, not that it's on the card; 2026-10-30 Foundry test.)
    // (The companion makes it, played as the companion's: scripts/main.js; 2026-10-30, "Companions".)
    if (entry.by) plan.by = entry.by;
    if (!plan.onHit.save) plan.notes = (plan.notes ?? []).map((note) => (note === "The save on a hit is on its card." ? "No class DC was found for the save on a hit: call for it by hand." : note));
    return plan;
}

// A linked entry → the linked-Effect plan (src/compiler/linked-effect.js) for its Effect. entry.linked: { effect, recipients, target, within }.
export function handLinked(item, entry) {
    const linked = entry.linked;
    const type = item.system?.actionType?.value;
    return {
        source: sourceFor(item),
        activation: { time: type === "action" || !type ? actionsOf(item) : type, traits: [...(item.system?.traits?.value ?? [])] },
        targeting: { target: linked.target ?? null, range: linked.within && linked.recipients === "target" ? `${linked.within} feet` : null, area: null },
        trigger: { event: "use" },
        resolution: { kind: "effect", applications: [{ kind: "native-spell-effect", uuid: linked.effect, label: linked.label ?? (linked.effect.split(".").at(-1).startsWith("Effect") ? linked.effect.split(".").at(-1) : `Effect: ${entry.name}`), recipients: linked.recipients }] },
        notes: [...(entry.notes ?? [])]
    };
}

const actionsOf = (item) => (item.system?.actionType?.value === "free" ? "free" : String(Number(item.system?.actions?.value) || 1));
const sourceFor = (item) => ({ name: item.name, slug: item.system?.slug ?? null, uuid: item.uuid ?? null, type: item.type ?? "feat" });

// An act entry → the basic action's plan as the feat's (its card rolls the character's own check), or null without that action's plan.
// entry.act: the action's slug; entry.target: who it's used on, as the card says it ("each enemy within 30 feet"); entry.notes.
// entry.successAsCritical: a success counts as a critical success; entry.immunity: { duration } of the feat's own immunity.
export function handAct(item, entry, basicActions) {
    const base = basicActions?.[entry.act];
    if (!base) return null;
    const plan = structuredClone(base);
    plan.source = sourceFor(item);
    plan.activation = { ...(plan.activation ?? {}), time: actionsOf(item) };
    if (entry.target) plan.targeting = { ...(plan.targeting ?? {}), target: entry.target };
    // (Tail Spin, 2026-10-30 Foundry test: "a success counts as a critical success" — the success applies the critical success's results.)
    if (entry.successAsCritical && plan.resolution?.outcomes?.criticalSuccess) plan.resolution.outcomes.success = structuredClone(plan.resolution.outcomes.criticalSuccess);
    // (Dazzling Display, 2026-10-30 Foundry test: "immune for 1 minute", not Demoralize's 10 — entry.immunity, the feat's own duration.)
    if (entry.immunity && plan.trigger?.immunity) plan.trigger.immunity = { ...plan.trigger.immunity, raw: entry.immunity.raw ?? plan.trigger.immunity.raw, duration: entry.immunity.duration };
    // (Round 80 Foundry test: the card doesn't show its target line, so a target the feat names is said in the notes too.)
    plan.notes = [...(entry.target ? [`Target: ${entry.target}.`] : []), ...(entry.notes ?? [])];
    // (Round 80: a maneuver its companion makes, Abrasive Drag's mount: played as the companion's, as a strike entry's by is.)
    if (entry.by) plan.by = entry.by;
    return plan;
}

const NONE = () => ({ damage: { mode: "none", multiplier: 0, sourceComponentIds: [] }, effects: [] });

// An affect entry → a plan with no roll: its conditions on each target. entry.affect: { effects: [{ slug, value, duration }], target,
// range }.
// (An effect with its own kind, Rallying Cry's temporary Hit Points: as given, its "@actor.level" the character's; 2026-10-30 Foundry test.)
// (Every character number, as a damage tag's: Plant Banner's level, Instant Recovery's Constitution; worked out where it can be.)
const characterFormula = (formula, dcs, item) => {
    const filled = fillCharacterNumbers(`@Damage[${formula}]`, dcs, item);
    const inner = /^@Damage\[(.*)\]$/s.exec(filled)?.[1] ?? String(formula);
    return inner.replace(/@actor\.level\b/g, String(dcs?.level ?? "@actor.level"));
};
const withCharacterNumbers = (effects, dcs, item) => effects.map((effect) => (effect.formula ? { ...effect, formula: characterFormula(effect.formula, dcs, item) } : { ...effect }));

export function handAffect(item, entry, dcs = null) {
    const affect = entry.affect ?? {};
    const level = (formula) => characterFormula(formula, dcs, item);
    const effects = (affect.effects ?? []).map((effect) => (effect.kind ? { ...effect, ...(effect.formula ? { formula: level(effect.formula) } : {}) }
        : { kind: "condition", slug: effect.slug, value: effect.value ?? null, duration: effect.duration ?? null }));
    return {
        modelVersion: 13,
        source: sourceFor(item),
        rank: 1,
        traits: [...(item.system?.traits?.value ?? [])],
        activation: { time: actionsOf(item), traits: [] },
        targeting: { target: affect.target ?? "1 creature", range: affect.range ?? null, area: null },
        trigger: { event: "use", immunity: null },
        resolution: { kind: "check", check: { roll: "automatic", statistic: "automatic" }, sharedDamage: null, outcomes: { criticalSuccess: NONE(), success: { ...NONE(), effects }, failure: NONE(), criticalFailure: NONE() } },
        automation: { level: "automatic" },
        notes: [...(entry.notes ?? [])]
    };
}

// The DC for a level (Core Rulebook's table, levels 0 to 25), as "a standard DC of your level" says it.
const LEVEL_DCS = [14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 42, 44, 46, 48, 50];

// A selfCheck entry → a check card against a DC of the character's level (2026-10-30, docs/feats.md, "Checks against your level's DC"):
// the character rolls entry.selfCheck.statistic against that DC plus its adjustment ("an easy DC", −2), and each degree's results go on
// its target ("you" or the player's targets): conditions, and PF2e's Effects linked in the text (nativeEffects). Null without a level.
// An attack roll against a defense (src/plans/attacks.js) → a check card at the character's attack modifier, or null when it has none.
export function handAttack(item, entry, dcs = null) {
    const attack = entry.attack;
    const modifier = attackModifier(attack, dcs);
    if (!Number.isFinite(modifier)) return null;
    const row = (degree) => {
        const outcome = attack.outcomes?.[degree] ?? {};
        const formula = outcome.damage ? characterFormula(outcome.damage, dcs, item) : null;
        return {
            ...NONE(),
            ...(formula ? { damage: { mode: "formulas", formulas: [{ formula }], rollScope: "target" } } : {}),
            effects: withCharacterNumbers(outcome.effects ?? [], dcs, item),
            ...(outcome.nativeEffects ? { nativeEffects: outcome.nativeEffects.map((effect) => ({ ...effect })) } : {})
        };
    };
    return {
        modelVersion: 13,
        source: sourceFor(item),
        rank: 1,
        traits: [...new Set([...(item.system?.traits?.value ?? []), "attack"])],
        activation: { time: actionsOf(item), traits: [] },
        targeting: { target: attack.target ?? "1 creature", range: attack.range ?? null, area: null },
        trigger: { event: "use", immunity: null },
        resolution: { kind: "check", check: { roll: "skill", statistic: attack.roll === "spell" ? "spell-attack" : "attack", against: { dc: "target", statistic: attack.against ?? "ac" }, modifier }, sharedDamage: null,
            outcomes: { criticalSuccess: row("criticalSuccess"), success: row("success"), failure: row("failure"), criticalFailure: row("criticalFailure") } },
        automation: { level: "automatic" },
        notes: [...(entry.notes ?? []), "The roll uses your attack modifier as your sheet shows it: take off your multiple attack penalty by hand if this isn't your first attack this turn."]
    };
}

// The character's modifier for the attack: its best spell attack, or its best Strike of that group and reach.
export function attackModifier(attack, dcs) {
    // (roll "built": the feat's own modifier, a weapon category's proficiency bonus plus an ability modifier plus a bonus.)
    if (attack?.roll === "built") {
        const proficiency = dcs?.attacks?.proficiency?.[attack.proficiency];
        const ability = dcs?.abilities?.[attack.ability];
        return Number.isFinite(proficiency) && Number.isFinite(ability) ? proficiency + ability + (attack.bonus ?? 0) : null;
    }
    if (attack?.roll === "spell") return Number.isFinite(dcs?.attacks?.spell) ? dcs.attacks.spell : Number.isFinite(dcs?.spell) ? dcs.spell - 10 : null;
    const fits = (dcs?.attacks?.strikes ?? []).filter((strike) => Number.isFinite(strike.mod) && (!attack?.group || strike.group === attack.group) && (attack?.ranged === undefined || Boolean(strike.ranged) === attack.ranged));
    return fits.length ? Math.max(...fits.map((strike) => strike.mod)) : null;
}

export function handSelfCheck(item, entry, dcs = null) {
    const check = entry.selfCheck;
    const level = Number(dcs?.level ?? item.actor?.level);
    // (check.level "target": "the hard DC for the target's level" — each target's own, the ability module's card works it out.)
    // (check.defense "perception": against each target's Perception DC, a check the text reader doesn't take (a Lore, Perception against
    // Deception; round 52 Foundry test).)
    const byTarget = check.level === "target" || Boolean(check.defense);
    // (check.dc: a fixed DC the feat names, "a @Check[medicine|dc:40] check", when the reader leaves the feat; round 89.)
    const fixed = Number.isFinite(check.dc) ? check.dc : null;
    if (fixed === null && !byTarget && (!Number.isInteger(level) || level < 0 || level >= LEVEL_DCS.length)) return null;
    const row = (degree) => ({ ...NONE(), effects: withCharacterNumbers(check.outcomes?.[degree]?.effects ?? [], dcs, item), ...(check.outcomes?.[degree]?.nativeEffects ? { nativeEffects: check.outcomes[degree].nativeEffects.map((effect) => ({ ...effect })) } : {}) });
    return {
        modelVersion: 13,
        source: sourceFor(item),
        rank: 1,
        traits: [...(item.system?.traits?.value ?? [])],
        activation: { time: actionsOf(item), traits: [] },
        targeting: { target: check.target ?? "you", range: check.range ?? null, area: null },
        trigger: { event: "use", immunity: null },
        resolution: { kind: "check", check: { roll: "skill", statistic: check.statistic, against: check.defense ? { dc: "target", statistic: check.defense } : byTarget ? { dc: "level", adjustment: check.adjustment ?? 0 } : { dc: "fixed", value: fixed ?? LEVEL_DCS[level] + (check.adjustment ?? 0) } }, sharedDamage: null,
            outcomes: { criticalSuccess: row("criticalSuccess"), success: row("success"), failure: row("failure"), criticalFailure: row("criticalFailure") } },
        automation: { level: "automatic" },
        notes: [...(entry.notes ?? [])]
    };
}

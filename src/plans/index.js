// Plans written by hand for feats the readers don't take (2026-10-30, docs/feats.md, "Hand-picked"): the most-played class feats first,
// each from its own text. An entry is { uuid, name, strike } (a Strike feat: what differs from a plain Strike, merged into the
// strike-activity builtin the readers make), { uuid, name, act } (a basic action it uses as written: "demoralize", "feint", "trip" …, the
// ability module's card for it), { uuid, name, affect } (conditions it puts on its target with no roll) or { uuid, name, text } (the feat's rules rewritten in the plain words the readers take, with
// PF2e's own tags, so the character's numbers still fill in). Looked up by the item's compendium source.

import { sourceOf } from "../rules/index.js";
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

export const PLAN_BATCHES = [fighter, martial, tactical, strikes2, maneuvers, saves, saves2, checks, damage, saves3, damage2, strikes3, affects, eidolons];
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
    plan.notes = [...(entry.notes ?? [])];
    return plan;
}

const NONE = () => ({ damage: { mode: "none", multiplier: 0, sourceComponentIds: [] }, effects: [] });

// An affect entry → a plan with no roll: its conditions on each target. entry.affect: { effects: [{ slug, value, duration }], target,
// range }.
// (An effect with its own kind, Rallying Cry's temporary Hit Points: as given, its "@actor.level" the character's; 2026-10-30 Foundry test.)
export function handAffect(item, entry, dcs = null) {
    const affect = entry.affect ?? {};
    const level = (formula) => String(formula).replace(/@actor\.level\b/g, String(dcs?.level ?? "@actor.level"));
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

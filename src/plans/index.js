// Plans written by hand for feats the readers don't take (2026-10-30, docs/feats.md, "Hand-picked"): the most-played class feats first,
// each from its own text. An entry is { uuid, name, strike } (a Strike feat: what differs from a plain Strike, merged into the
// strike-activity builtin the readers make) or { uuid, name, text } (the feat's rules rewritten in the plain words the readers take, with
// PF2e's own tags, so the character's numbers still fill in). Looked up by the item's compendium source.

import { sourceOf } from "../rules/index.js";
import fighter from "./fighter.js";
import martial from "./martial.js";
import tactical from "./tactical.js";

export const PLAN_BATCHES = [fighter, martial, tactical];
const BY_UUID = new Map(PLAN_BATCHES.flat().map((entry) => [entry.uuid, entry]));

export const handEntry = (item) => BY_UUID.get(sourceOf(item)) ?? null;

// A strike entry → the strike-activity plan.
export function handStrike(item, entry) {
    const strike = entry.strike ?? {};
    return {
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
        ...strike,
        onHit: { conditions: [], critical: null, push: null, damage: [], save: null, size: null, ...(strike.onHit ?? {}) }
    };
}

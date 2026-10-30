// The rule elements the module adds to a character's feats, heritages and backgrounds (2026-10-30, docs/rules.md), by the compendium item
// each came from. Each batch is a reviewed list; scripts/rules.js puts them on the item as it prepares, never in the item's own data.

import batch01 from "./batch-01.js";
import batch02 from "./batch-02.js";
import batch03 from "./batch-03.js";
import { selectorOf } from "./read.js";

// PF2e's pack folders (the repository's) → its compendium names.
const PF2E_PACKS = { feats: "feats-srd", "class-features": "classfeatures", actions: "actionspf2e", backgrounds: "backgrounds", heritages: "heritages", "ancestry-features": "ancestryfeatures" };

export function compendiumUuid(module, pack, id) {
    const name = module === "pf2e" ? PF2E_PACKS[pack] ?? pack : pack;
    return `Compendium.${module}.${name}.Item.${id}`;
}

export const BATCHES = [batch01, batch02, batch03];
const BY_UUID = new Map(BATCHES.flat().map((entry) => [entry.uuid, entry]));

// The item's source in a compendium: PF2e's sourceId, Foundry's _stats.compendiumSource, or the older core flag.
export const sourceOf = (item) => item?.sourceId ?? item?._stats?.compendiumSource ?? item?.flags?.core?.sourceId ?? null;

// The rules to add to this item: its entry's, less any the item has already (the same key and selector or type).
export function rulesFor(item) {
    const entry = BY_UUID.get(sourceOf(item));
    if (!entry) return [];
    const own = item?.system?.rules ?? [];
    const same = (a, b) => a.key === b.key && selectorOf(a) === selectorOf(b) && JSON.stringify(a.predicate ?? []) === JSON.stringify(b.predicate ?? []);
    return entry.rules.filter((rule) => !own.some((each) => same(each, rule)));
}

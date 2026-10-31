// Feats that change a condition's value as it changes (2026-10-31, the loop): Friend of Fear's "Anytime you gain the frightened condition,
// reduce its value by 1", Calm and Centered's "When your frightened or stupefied condition values would decrease, decrease the value by 2".
// scripts/conditions.js plays them on the active GM's client as PF2e changes the condition.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

export const CONDITION_FEATS = [
    { uuid: pf2e("FK9BiN067ornWyLR"), name: "Friend of Fear", slugs: ["frightened"], gained: -1 },
    { uuid: pf2e("MSyU208twPGKU16W"), name: "Calm and Centered", slugs: ["frightened", "stupefied"], lowered: -1 }
];
const BY_UUID = new Map(CONDITION_FEATS.map((entry) => [entry.uuid, entry]));

// The value the condition should have after a change from before (0: it had none) to after, with these feats' entries, and which feats
// changed it; null when none does. A gain is reduced (never below what it had); a decrease goes one further (gone at 0).
export function conditionAfter(entries, slug, before, after) {
    let value = after;
    const by = [];
    for (const entry of entries) {
        if (!entry.slugs.includes(slug)) continue;
        if (entry.gained && after > before) {
            value = Math.max(before, value + entry.gained);
            by.push(entry.name);
        }
        if (entry.lowered && after < before && before > 0) {
            value = Math.max(0, value + entry.lowered);
            by.push(entry.name);
        }
    }
    return by.length && value !== after ? { value, by } : null;
}

export const conditionFeatsOf = (items, sourceOf) => [...(items ?? [])].map((item) => BY_UUID.get(sourceOf(item))).filter(Boolean);

// The rule elements a master's feats give its companion (2026-10-31, the loop): an evolution feat on the summoner's sheet ("Your eidolon
// gains darkvision") is the eidolon's. scripts/rules.js puts them on the companion's ancestry as it prepares, as the module's own rules on a
// character's feats are (src/rules/index.js), when its master (src/compiler/companion.js findMaster) has the feat.

import { sourceOf } from "./index.js";

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const sense = (selector, acuity = null, range = null) => ({ key: "Sense", selector, ...(acuity ? { acuity } : {}), ...(range ? { range } : {}) });

export const COMPANION_RULES = [
    { uuid: pf2e("rPzEnABFjkbOARiB"), name: "Expanded Senses", rules: [sense("low-light-vision"), sense("darkvision"), sense("scent", "imprecise", 30)] },
    { uuid: pf2e("TgYs2m9scSyEJwdr"), name: "Vibration Sense", rules: [{ ...sense("tremorsense", "imprecise", 30), predicate: [{ not: "self:trait:aquatic" }] }, { ...sense("wavesense", "imprecise", 30), predicate: [{ or: ["self:trait:aquatic", "self:trait:amphibious"] }] }] },
    { uuid: pf2e("IeiTuTZExH5DQOqH"), name: "Burrowing Form", rules: [{ key: "BaseSpeed", selector: "burrow", value: 15 }] },
    { uuid: pf2e("a6xUSibsRaclbSz3"), name: "Ever-Vigilant Senses", rules: [{ key: "FlatModifier", selector: "perception", type: "circumstance", value: 2 }] },
    // (Its horse's: only an animal companion that's a horse has it, and only a horse's master takes the feat.)
    { uuid: pf2e("g64AWb9hj46ZmhlR"), name: "Chiardmar Steed", rules: [{ key: "FlatModifier", selector: "land-speed", type: "status", value: 5 }] },
    // (Batch 9: a dragon companion's fly Speed, a megafauna companion's size, a construct innovation's climb Speed as its land Speed.)
    { uuid: pf2e("RkaE55TeCvwmQq7E"), name: "Wing Rider", rules: [{ key: "BaseSpeed", selector: "fly", value: 25 }] },
    { uuid: pf2e("HxTqYtXRqFkkLfDQ"), name: "Gigantic Megafauna Companion", rules: [{ key: "CreatureSize", value: "huge" }] },
    { uuid: "Compendium.pf2e-team-plus-inventors.inventors-features.Item.MYqJqQAi6B5WlZpK", name: "Climbing Limbs+", rules: [{ key: "BaseSpeed", selector: "climb", value: "@actor.system.attributes.speed.value" }] },
    { uuid: "Compendium.pf2e-summoners-plus.misc.Item.nyiF0IeEkmEYEAMZ", name: "Faydhaan", rules: [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: 1, predicate: ["item:trait:water"] }] }
];

const BY_UUID = new Map(COMPANION_RULES.map((entry) => [entry.uuid, entry]));

// The rules a companion gets from its master's items: each entry's, once, with the feat's name as its label.
export function companionRulesFrom(master) {
    const out = [];
    for (const item of master?.items ?? []) {
        const entry = BY_UUID.get(sourceOf(item));
        if (entry) out.push(...entry.rules.map((rule) => ({ label: item.name, ...rule })));
    }
    return out;
}

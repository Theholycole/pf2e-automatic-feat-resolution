// A character's DCs, level and attribute modifiers as its feats' saves and damage name them (2026-10-30, docs/feats.md), read off the live PF2e actor for the compiler's
// options.dcs (src/compiler/character-dcs.js). Null for anything but a character or a familiar.
import { findMaster, isEidolon, withMasterDCs } from "../src/compiler/companion.js";

const value = (statistic) => {
    const dc = Number(statistic?.dc?.value);
    return Number.isFinite(dc) && dc > 0 ? dc : null;
};

export function characterDCs(actor) {
    if (!["character", "familiar"].includes(actor?.type)) return null;
    return companionDCs(actor, ownDCs(actor));
}

// (2026-10-30, "Companions": an eidolon's, animal companion's or familiar's abilities use its master's spell or class DC.)
function companionDCs(actor, own) {
    const master = findMaster(actor, { actors: [...(game.actors ?? [])], users: [...(game.users ?? [])] });
    if (!master || master === actor) return own;
    return withMasterDCs(own, ownDCs(master), { eidolon: isEidolon(actor) });
}

function ownDCs(actor) {
    const byClass = {};
    for (const [slug, statistic] of Object.entries(actor.classDCs ?? {})) {
        const dc = value(statistic);
        if (dc !== null) byClass[slug] = dc;
    }
    const byTradition = {};
    let spell = null;
    for (const entry of actor.spellcasting?.contents ?? actor.spellcasting ?? []) {
        const dc = value(entry?.statistic);
        if (dc === null) continue;
        spell = Math.max(spell ?? 0, dc);
        const tradition = entry.tradition ?? entry.system?.tradition?.value;
        if (tradition) byTradition[tradition] = Math.max(byTradition[tradition] ?? 0, dc);
    }
    const statistics = {};
    for (const [slug, skill] of Object.entries(actor.skills ?? {})) {
        const dc = value(skill);
        if (dc !== null) statistics[slug] = dc;
    }
    const abilities = {};
    for (const [slug, ability] of Object.entries(actor.abilities ?? actor.system?.abilities ?? {})) {
        const mod = Number(ability?.mod);
        if (Number.isFinite(mod)) abilities[slug] = mod;
    }
    return {
        level: Number(actor.level) || Number(actor.system?.details?.level?.value) || null,
        abilities,
        class: value(actor.classDC) ?? (Object.values(byClass).length ? Math.max(...Object.values(byClass)) : null),
        spell,
        perception: value(actor.perception),
        byClass,
        byTradition,
        statistics
    };
}

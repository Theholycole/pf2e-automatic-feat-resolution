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
    // (Its attack modifiers, for an attack roll against a defense (src/plans/attacks.js): its best spell attack, and each Strike's.)
    const spellAttacks = [...(actor.spellcasting?.contents ?? actor.spellcasting ?? [])].map((entry) => Number(entry?.statistic?.check?.mod)).filter(Number.isFinite);
    const strikes = [...(actor.system?.actions ?? [])].filter((action) => action?.type === "strike" && action.item).map((action) => ({
        group: action.item.group ?? action.item.system?.group ?? null,
        ranged: Boolean(action.item.isRanged),
        mod: Number(action.totalModifier ?? action.variants?.[0]?.modifier)
    })).filter((strike) => Number.isFinite(strike.mod));
    // (A proficiency bonus by weapon category, for an attack the feat builds itself: Spirit's Wrath's wisp, martial plus Strength plus 2.)
    const level = Number(actor.level) || 0;
    const proficiency = {};
    for (const [category, entry] of Object.entries(actor.system?.proficiencies?.attacks ?? {})) {
        const rank = Number(entry?.rank);
        if (Number.isFinite(rank)) proficiency[category] = rank > 0 ? rank * 2 + level : 0;
    }
    return {
        attacks: { spell: spellAttacks.length ? Math.max(...spellAttacks) : null, strikes, proficiency },
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

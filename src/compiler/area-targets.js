// A card's target that is every creature of a kind in range, "each enemy within 30 feet" (Dazzling Display, Terrifying Howl; 2026-10-30,
// after the Foundry test): the card finds them itself, not only the GM's targets. Pure.

// targeting.target → { who: "enemy" | "creature" | "ally", within, grounded }, or null for any other target.
export function areaOf(target) {
    const found = /^each (enemy|foe|creature|ally)( on the ground)? within (\d+) feet$/i.exec(String(target ?? "").trim());
    if (!found) return null;
    return { who: found[1].toLowerCase() === "foe" ? "enemy" : found[1].toLowerCase(), within: Number(found[3]), grounded: !!found[2] };
}

// Whether a creature is in the area: { distance, disposition, sourceDisposition, elevation, self, defeated }.
export function inArea(area, { distance, disposition, sourceDisposition, elevation = 0, self = false, defeated = false }) {
    if (!area || self || defeated || distance === null || distance === undefined || distance > area.within) return false;
    if (area.grounded && elevation > 0) return false;
    if (area.who === "enemy") return disposition !== sourceDisposition && disposition !== 0;
    if (area.who === "ally") return disposition === sourceDisposition;
    return true;
}

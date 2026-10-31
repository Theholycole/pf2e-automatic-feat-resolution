// Truesight's secret counteract checks (2026-10-30, Cole: "Have truesight auto roll secretly counteract checks against the spell"): "you see
// things within 60 feet as they actually are. The GM rolls a secret counteract check against any illusion within 60 feet, but only once
// per illusion." scripts/truesight.js finds the illusions and rolls; these are the numbers. Pure.

// The degree of a check: 0 critical failure … 3 critical success, a natural 20 or 1 one step better or worse.
export function degreeOf(total, dc, die) {
    let degree = total >= dc + 10 ? 3 : total >= dc ? 2 : total <= dc - 10 ? 0 : 1;
    if (die === 20) degree = Math.min(3, degree + 1);
    if (die === 1) degree = Math.max(0, degree - 1);
    return degree;
}

// PF2e counteract: whether an effect of rank targetRank is countered at this degree by counteract rank `rank`.
export function counteracts(degree, rank, targetRank) {
    const reach = [null, rank - 1, rank + 1, rank + 3][degree];
    return reach !== null && reach !== undefined && targetRank <= reach;
}

// The character's truesight counteract: its best spell attack (spell DC − 10), else its class DC − 10, at the truesight spell's rank 6
// (the rank feats and ancestries grant it at; a higher one named on the sense wins). dcs: characterDCs'.
export function truesightCounteract(dcs, rank = null) {
    const spell = Number(dcs?.spell);
    const cls = Number(dcs?.class);
    const dc = Number.isFinite(spell) && spell > 0 ? spell : Number.isFinite(cls) && cls > 0 ? cls : null;
    return { modifier: dc === null ? null : dc - 10, rank: Math.max(6, Number(rank) || 0) };
}

// An illusion's counteract rank: its spell's rank (an effect's level is its rank; a creature's or hazard's, half its level rounded up).
export const illusionRank = ({ rank = null, level = null } = {}) => (Number(rank) > 0 ? Number(rank) : Number(level) > 0 ? Math.ceil(Number(level) / 2) : null);

const DEGREES = ["critical failure", "failure", "success", "critical success"];
export const degreeName = (degree) => DEGREES[degree] ?? "unknown";

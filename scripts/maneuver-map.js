// A feat that lowers a maneuver's multiple attack penalty (round 54, the loop; Agile Maneuvers): PF2e 8.6 gives Trip, Shove, Grapple,
// Disarm and Reposition a flat −5/−10 (SingleCheckAction.use, "Math.min(2, n) * −5") and never reads a MultipleAttackPenalty rule for
// them; a negative number passed in is used as it is. So the module passes the feat's: −4/−8, or −3/−6 with panache and an agile weapon.

const MANEUVERS = ["trip", "shove", "grapple", "disarm", "reposition"];
const AGILE_MANEUVERS = "Compendium.pf2e.feats-srd.Item.Ba6SLqAghsZgqhua";
const sourceOf = (item) => item?._stats?.compendiumSource ?? item?.sourceId ?? item?.flags?.core?.sourceId ?? null;

// The penalty for the attack number (1: second attack, 2: third or more), or null when no feat changes it.
export function maneuverPenalty(actor, count, weapon = null) {
    if (!actor || !(count > 0)) return null;
    if (!(actor.items ?? []).some((item) => sourceOf(item) === AGILE_MANEUVERS)) return null;
    const panache = (actor.items ?? []).some((item) => item.type === "effect" && (item.slug ?? item.system?.slug) === "panache");
    const agile = Boolean(weapon?.traits?.has?.("agile") ?? weapon?.system?.traits?.value?.includes?.("agile"));
    return Math.min(2, count) * (panache && agile ? -3 : -4);
}

export function registerManeuverMap() {
    for (const slug of MANEUVERS) {
        const action = game.pf2e?.actions?.get?.(slug);
        if (!action || typeof action.use !== "function" || action.use.pf2eFeatWrapped) continue;
        const original = action.use.bind(action);
        const wrapped = (options = {}) => {
            const count = Number(options.multipleAttackPenalty);
            if (count > 0) {
                const actor = options.actors?.[0] ?? options.actor ?? canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
                const penalty = maneuverPenalty(actor, count, options.item ?? options.weapon ?? null);
                if (penalty !== null) return original({ ...options, multipleAttackPenalty: penalty });
            }
            return original(options);
        };
        wrapped.pf2eFeatWrapped = true;
        action.use = wrapped;
    }
}

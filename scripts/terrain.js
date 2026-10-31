// The roll option self:terrain:difficult (and self:terrain:difficult:greater) on a creature whose token stands in difficult terrain
// (2026-10-31, the loop; Cole: "We have a environment module with difficult terrain"). Difficult terrain is a region's Modify Movement
// Cost behavior, Foundry's own or the environment module's features and weather (its regions.js, sync.js): one that makes the token's
// current movement cost more. PF2e reads a Strike's target's options from its getSelfRollOptions("target"), so a feat's EphemeralEffect
// predicated on target:terrain:difficult (src/rules/batch-09.js: Nature's Edge, Terrain Advantage) makes that target off-guard for the roll.
// Worked out where the token stands at the moment it's asked, not at preparation, since moving a token doesn't prepare its actor again.

const MODULE_ID = "pf2e-automatic-feat-resolution";

// How much harder the token's square is for its current movement: 1 none, 2 difficult, 3 greater difficult.
export function terrainDifficulty(tokenDocument) {
    const action = tokenDocument?.movementAction ?? "walk";
    let worst = 1;
    for (const region of tokenDocument?.regions ?? []) {
        for (const behavior of region.behaviors ?? []) {
            if (behavior.disabled || behavior.type !== "modifyMovementCost") continue;
            const difficulties = behavior.system?.difficulties ?? {};
            const value = Number(difficulties[action] ?? difficulties.walk ?? 1);
            if (Number.isFinite(value) && value > worst) worst = value;
        }
    }
    return worst;
}

function tokenOf(actor) {
    if (!globalThis.canvas?.ready) return null;
    if (actor?.token) return actor.token.parent === canvas.scene ? actor.token : null;
    return actor?.getActiveTokens?.(true, true)?.[0] ?? null;
}

export function terrainOptions(actor, prefix = "self") {
    try {
        const difficulty = terrainDifficulty(tokenOf(actor));
        if (difficulty < 2) return [];
        return [`${prefix}:terrain:difficult`, ...(difficulty >= 3 ? [`${prefix}:terrain:difficult:greater`] : [])];
    } catch (error) {
        console.warn(`${MODULE_ID} | difficult terrain's roll option`, error);
        return [];
    }
}

// (PF2e's ActorPF2e, the class that has its own getSelfRollOptions: up the prototype chain from a character's.)
function ownerOf(name) {
    let proto = CONFIG.PF2E?.Actor?.documentClasses?.character?.prototype;
    while (proto && !Object.hasOwn(proto, name)) proto = Object.getPrototypeOf(proto);
    return proto;
}

export function registerTerrainOptions() {
    const self = ownerOf("getSelfRollOptions");
    if (self) {
        const original = self.getSelfRollOptions;
        self.getSelfRollOptions = function (prefix = "self", ...rest) {
            const options = original.call(this, prefix, ...rest);
            const more = terrainOptions(this, prefix).filter((option) => !options.includes(option));
            return more.length ? [...options, ...more] : options;
        };
    } else console.warn(`${MODULE_ID} | PF2e's actors have no getSelfRollOptions; difficult terrain's roll option is off.`);
    const all = ownerOf("getRollOptions");
    if (all) {
        const original = all.getRollOptions;
        all.getRollOptions = function (...args) {
            const options = original.apply(this, args);
            if (!Array.isArray(options)) return options;
            const more = terrainOptions(this).filter((option) => !options.includes(option));
            return more.length ? [...options, ...more] : options;
        };
    }
}

// The "Senses" region behavior (2026-10-30, docs/feats.md, "Sense regions"): an area that is water (wavesense works there), silent (no
// hearing or echolocation into, out of or through it), or blocks chosen senses. The detection modes ask senseReaches
// (src/compiler/sense-zones.js) with the areas the two tokens are in and the ones the line between them crosses.

import { BLOCKABLE, senseReaches } from "../src/compiler/sense-zones.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
export const BEHAVIOR = `${MODULE_ID}.senses`;

const LABELS = { hearing: "Hearing", tremorsense: "Tremorsense", echolocation: "Echolocation", scent: "Scent", lifesense: "Lifesense", bloodsense: "Bloodsense", spiritsense: "Spiritsense", thoughtsense: "Thoughtsense", wavesense: "Wavesense", "motion-sense": "Motion sense", "electromagnetic-sense": "Electromagnetic sense", "infrared-vision": "Infrared vision" };

export function registerSenseZones() {
    const Base = foundry.data?.regionBehaviors?.RegionBehaviorType;
    if (!Base || !CONFIG.RegionBehavior) return console.warn(`${MODULE_ID} | No region behaviors to register the Senses area with.`);
    const fields = foundry.data.fields;
    class SensesBehavior extends Base {
        static defineSchema() {
            return {
                water: new fields.BooleanField({ label: "Water", hint: "Wavesense works for creatures in this area, sensing creatures also in water." }),
                silent: new fields.BooleanField({ label: "No sound passes", hint: "Hearing and echolocation don't reach into, out of or through this area." }),
                blocks: new fields.SetField(new fields.StringField({ choices: LABELS }), { label: "Senses blocked", hint: "These senses don't reach into, out of or through this area." })
            };
        }
    }
    CONFIG.RegionBehavior.dataModels[BEHAVIOR] = SensesBehavior;
    CONFIG.RegionBehavior.typeLabels[BEHAVIOR] = "Senses";
    CONFIG.RegionBehavior.typeIcons[BEHAVIOR] = "fa-solid fa-ear-deaf";
}

const zonesOf = (scene) => {
    const zones = [];
    for (const region of scene?.regions ?? []) {
        for (const behavior of region.behaviors ?? []) {
            if (behavior.type !== BEHAVIOR || behavior.disabled) continue;
            zones.push({ region, water: !!behavior.system.water, silent: !!behavior.system.silent, blocks: [...(behavior.system.blocks ?? [])] });
        }
    }
    return zones;
};

function inside(region, point, elevation = 0) {
    try {
        if (typeof region.testPoint === "function") return region.testPoint({ x: point.x, y: point.y, elevation });
        return !!region.object?.testPoint?.(point, elevation);
    } catch {
        return false;
    }
}

const pointOf = (token) => token?.center ?? token?.object?.center ?? null;

// Whether the sense reaches from the sensing token to the target, with the scene's Senses areas. Any sense with no area on the scene:
// as before, except wavesense, which needs water.
export function reaches(sense, sourceToken, targetToken) {
    if (!BLOCKABLE.includes(sense)) return true;
    const scene = sourceToken?.document?.parent ?? sourceToken?.scene ?? canvas?.scene;
    const zones = zonesOf(scene);
    if (!zones.length) return sense !== "wavesense";
    const from = pointOf(sourceToken);
    const to = pointOf(targetToken);
    if (!from || !to) return true;
    const fromElevation = sourceToken.document?.elevation ?? 0;
    const toElevation = targetToken.document?.elevation ?? 0;
    const source = zones.filter((zone) => inside(zone.region, from, fromElevation));
    const target = zones.filter((zone) => inside(zone.region, to, toElevation));
    // (The line between them, a point every half square.)
    const step = (canvas?.grid?.size ?? 100) / 2;
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const crossed = zones.filter((zone) => !source.includes(zone) && !target.includes(zone) && Array.from({ length: Math.max(0, Math.floor(length / step) - 1) }, (_, index) => {
        const t = ((index + 1) * step) / length;
        return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
    }).some((point) => inside(zone.region, point, (fromElevation + toElevation) / 2)));
    return senseReaches(sense, { source, target, crossed });
}

// PF2e's own hearing and tremorsense modes: also stopped by the areas.
export function guardOwnModes() {
    for (const [id, sense] of [["hearing", "hearing"], ["feelTremor", "tremorsense"]]) {
        const mode = CONFIG.Canvas.detectionModes[id];
        if (!mode || mode._featSenseZones) continue;
        const original = mode._canDetect.bind(mode);
        mode._canDetect = (visionSource, target) => original(visionSource, target) && reaches(sense, visionSource?.object, target);
        mode._featSenseZones = true;
    }
}

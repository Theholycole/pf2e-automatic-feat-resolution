// A creature's senses on its token (2026-10-30, docs/feats.md, "Senses"): echolocation, scent, lifesense and the other senses PF2e's
// rules-based vision leaves off the token, as detection modes added after PF2e's own (TokenDocumentPF2e#_prepareDetectionModes rebuilds
// them on every prepare, so they're added in a wrapper of it, not stored). A precise sense shows the creature as seen; an imprecise one
// outlines where it is, as tremorsense does. Which modes, by the sense's acuity and range: src/compiler/senses.js.

import { SENSES, senseFinds, senseModes } from "../src/compiler/senses.js";
import { reaches } from "./sense-zones.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const SETTING = "senses";
const CREATURES = new Set(["character", "npc", "familiar"]);

const enabled = () => {
    try {
        return game.settings.get(MODULE_ID, SETTING) !== false;
    } catch {
        return true;
    }
};
const sensesOf = (actor) => {
    const senses = actor?.perception?.senses;
    return senses ? [...(typeof senses.values === "function" ? senses.values() : senses)] : [];
};

// The detection mode classes, built on Foundry's own: the precise one draws the creature as seen (DetectionModeAll), the imprecise one
// its outline (DetectionModeTremor's filter).
function modeClasses() {
    const perception = foundry.canvas?.perception ?? {};
    const All = perception.DetectionModeAll ?? CONFIG.Canvas.detectionModes.seeAll?.constructor;
    const Tremor = perception.DetectionModeTremor ?? CONFIG.Canvas.detectionModes.feelTremor?.constructor;
    if (!All || !Tremor) return null;
    const canDetect = (sense) => function (visionSource, target) {
        const source = visionSource?.object?.actor ?? null;
        const actor = target?.actor ?? target?.document?.actor ?? null;
        if (!actor || !CREATURES.has(actor.type) || target?.document?.hidden) return false;
        if (SENSES[sense]?.sound && source?.hasCondition?.("deafened")) return false;
        if (!senseFinds(sense, { modeOfBeing: actor.modeOfBeing ?? null, traits: new Set(actor.traits ?? actor.system?.traits?.value ?? []) })) return false;
        // (The scene's Senses areas: water for wavesense, silence for echolocation, blocked senses; scripts/sense-zones.js.)
        return reaches(sense, visionSource?.object, target);
    };
    return {
        precise: (sense) => class extends All {
            _canDetect(visionSource, target) {
                return canDetect(sense).call(this, visionSource, target);
            }
        },
        imprecise: (sense) => class extends Tremor {
            _canDetect(visionSource, target) {
                return canDetect(sense).call(this, visionSource, target);
            }
        }
    };
}

export function registerSenses() {
    game.settings.register(MODULE_ID, SETTING, {
        name: "Senses on tokens",
        hint: "Echolocation, scent, lifesense, thoughtsense, wavesense and the other senses PF2e's rules-based vision leaves off a token: a precise sense shows the creatures in range, an imprecise one outlines where they are.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => {
            if (!canvas?.ready) return;
            for (const token of canvas.tokens?.placeables ?? []) token.document.reset?.();
            canvas.perception?.update?.({ initializeVision: true });
        }
    });
    const classes = modeClasses();
    if (!classes) return console.warn(`${MODULE_ID} | No Foundry detection modes to build the senses on.`);
    const DetectionMode = foundry.canvas?.perception?.DetectionMode ?? CONFIG.Canvas.detectionModes.basicSight?.constructor;
    const OTHER = DetectionMode?.DETECTION_TYPES?.OTHER ?? 3;
    const SOUND = DetectionMode?.DETECTION_TYPES?.SOUND ?? OTHER;
    for (const [sense, { label, sound, through }] of Object.entries(SENSES)) {
        for (const precision of ["precise", "imprecise"]) {
            const id = `feat-sense-${precision}-${sense}`;
            const Mode = classes[precision](sense);
            CONFIG.Canvas.detectionModes[id] = new Mode({ id, label: `${label} (${precision})`, type: sound ? SOUND : OTHER, walls: !through, angle: false });
        }
    }
}

// After PF2e's own detection modes: the creature's other senses.
export function wrapDetectionModes() {
    const Document = CONFIG.Token.documentClass;
    const original = Document?.prototype?._prepareDetectionModes;
    if (typeof original !== "function") return;
    const add = function () {
        if (!enabled() || !CREATURES.has(this.actor?.type)) return;
        for (const mode of senseModes(sensesOf(this.actor))) {
            if (!CONFIG.Canvas.detectionModes[mode.id]) continue;
            const entry = { enabled: true, range: mode.range };
            if (Array.isArray(this.detectionModes)) {
                const at = this.detectionModes.findIndex((each) => each.id === mode.id);
                if (at >= 0) this.detectionModes[at] = { id: mode.id, ...entry };
                else this.detectionModes.push({ id: mode.id, ...entry });
            } else if (this.detectionModes) this.detectionModes[mode.id] = entry;
        }
    };
    if (globalThis.libWrapper) {
        libWrapper.register(MODULE_ID, "CONFIG.Token.documentClass.prototype._prepareDetectionModes", function (wrapped, ...args) {
            const result = wrapped(...args);
            add.call(this);
            return result;
        }, "WRAPPER");
        return;
    }
    Document.prototype._prepareDetectionModes = function (...args) {
        const result = original.apply(this, args);
        add.call(this);
        return result;
    };
}

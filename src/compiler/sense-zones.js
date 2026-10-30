// Areas that change what senses reach (2026-10-30, Cole: "regions that enable or disable senses? Wavesense only works in water. Hearing
// should not work through areas where no sound can pass"). A scene region with the module's "Senses" behavior is water, silent, or
// blocks some senses; scripts/sense-zones.js finds which such areas the sensing creature and its target are in and which the line
// between them crosses. Pure.

// The senses that travel by sound: none of them reaches into, out of or through a silent area.
export const SOUND = new Set(["hearing", "echolocation"]);
// The senses a region can block, by the id it stores ("hearing" and "tremorsense" are PF2e's own token modes).
export const BLOCKABLE = ["hearing", "tremorsense", "echolocation", "scent", "lifesense", "bloodsense", "spiritsense", "thoughtsense", "wavesense", "motion-sense", "electromagnetic-sense", "infrared-vision"];

// zones: { source, target, crossed }, each a list of { water, silent, blocks: [sense] }.
export function senseReaches(sense, { source = [], target = [], crossed = [] } = {}) {
    const all = [...source, ...target, ...crossed];
    if (all.some((zone) => (zone.blocks ?? []).includes(sense))) return false;
    if (SOUND.has(sense) && all.some((zone) => zone.silent)) return false;
    // Wavesense: "in water", the creature and what it senses both.
    if (sense === "wavesense") return source.some((zone) => zone.water) && target.some((zone) => zone.water);
    return true;
}

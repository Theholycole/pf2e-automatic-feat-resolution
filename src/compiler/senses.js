// A character's senses on its token (2026-10-30, Cole: "darkvision, true sight, echolocation and others should work as expected"). PF2e's
// rules-based vision gives the token darkvision (greater darkvision too), see invisibility and tremorsense, and nothing for the rest
// (TokenDocumentPF2e#_prepareDetectionModes). These are the detection modes for the others, by the sense's acuity: a precise sense shows
// the creature as seen, an imprecise one only where it is (an outline), as PF2e's hidden. scripts/senses.js registers the modes and adds
// them after PF2e's own. Pure.

// The creatures each sense can find (the target's actor), or null for any creature.
export const SENSES = {
    echolocation: { label: "Echolocation", sound: true },
    scent: { label: "Scent" },
    lifesense: { label: "Lifesense", finds: "living" },
    bloodsense: { label: "Bloodsense", finds: "living" },
    spiritsense: { label: "Spiritsense", finds: "spirit" },
    thoughtsense: { label: "Thoughtsense", finds: "minded", through: true },
    wavesense: { label: "Wavesense" },
    "motion-sense": { label: "Motion sense" },
    "electromagnetic-sense": { label: "Electromagnetic sense" },
    "infrared-vision": { label: "Infrared vision" }
};
// PF2e's own on the token, or with nothing to show there: low-light vision (dim light is already lit for a token), truesight (it sees
// through illusions, not invisibility or darkness), magicsense (magic, not creatures).
export const LEFT = new Set(["darkvision", "greater-darkvision", "see-invisibility", "tremorsense", "low-light-vision", "truesight", "magicsense"]);

const PRECISE_ALWAYS = new Set(["echolocation", "infrared-vision"]);

// senses: [{ type, acuity, range }] (actor.perception.senses' values) → [{ id, sense, precise, range }]. The mode ids are the module's:
// "feat-sense-precise-<sense>", "feat-sense-imprecise-<sense>". A sense with no range is unlimited.
export function senseModes(senses) {
    const modes = [];
    for (const sense of senses ?? []) {
        const type = String(sense?.type ?? "");
        if (LEFT.has(type) || !SENSES[type]) continue;
        const acuity = PRECISE_ALWAYS.has(type) ? "precise" : String(sense.acuity ?? "imprecise");
        // (Vague: knows only that something is there, not where: nothing on the map.)
        if (acuity === "vague") continue;
        const range = Number(sense.range);
        modes.push({ id: `feat-sense-${acuity === "precise" ? "precise" : "imprecise"}-${type}`, sense: type, precise: acuity === "precise", range: Number.isFinite(range) && range > 0 ? range : Infinity });
    }
    return modes;
}

// Whether the sense can find this creature: { modeOfBeing, traits: Set } of the target's actor.
export function senseFinds(sense, target) {
    const finds = SENSES[sense]?.finds;
    if (!finds || !target) return true;
    const being = target.modeOfBeing ?? null;
    const traits = target.traits ?? new Set();
    if (finds === "living") return being ? being === "living" : !traits.has("undead") && !traits.has("construct");
    if (finds === "spirit") return being ? being === "living" || being === "undead" : !traits.has("construct");
    if (finds === "minded") return !traits.has("mindless");
    return true;
}

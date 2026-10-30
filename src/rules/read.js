// Rule elements read from a passive's plainest sentences (2026-10-30, docs/rules.md, batch 1): "You gain darkvision.", "You gain low-light
// vision, or you gain darkvision if your ancestry already has low-light vision.", "You gain imprecise scent with a range of 30 feet.",
// "You gain a climb Speed of 10 feet.", "You gain a swim Speed equal to your land Speed." Each in the shape PF2e's own items give the same
// words (Sense, BaseSpeed), so the system plays them. Only for a sentence that says it outright: one with a condition before it ("When you
// …", "While …", "If …") or a time ("for 1 minute") is left alone. tools/rules-batch.mjs runs this over the packs; what it writes is
// reviewed into src/rules/batch-*.js, which is what the module ships.

import { htmlToPlainText } from "../../../pf2e-resolution-core/src/text/plain-text.js";

const SENSES = { darkvision: "darkvision", "greater darkvision": "greater-darkvision", "low-light vision": "low-light-vision", scent: "scent", lifesense: "lifesense", tremorsense: "tremorsense", echolocation: "echolocation", "wavesense": "wavesense" };
const LAND = "@actor.system.movement.speeds.land.value";

const plainOf = (html) => htmlToPlainText(String(html ?? "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1")).replace(/\s+/g, " ").trim();

function senseRule(name, acuity, range) {
    const selector = SENSES[name.toLowerCase()];
    if (!selector) return null;
    return { key: "Sense", ...(acuity ? { acuity: acuity.toLowerCase() } : {}), ...(range ? { range: Number(range) } : {}), selector };
}

// One sentence → its rules, or null when it isn't one of these said outright.
export function sentenceRules(sentence) {
    const text = sentence.trim().replace(/,? allowing you to see in darkness and dim light just as well as you can in bright light(?: \([^)]*\))?/i, "").replace(/\s+/g, " ");
    let match;
    // "You gain low-light vision, or you gain darkvision if your ancestry already has low-light vision." (PF2e's Ardande, Changeling.)
    if (/^You gain low-light vision, or (?:you gain )?darkvision if your ancestry already has low-light vision\.$/i.test(text)) {
        return [{ key: "Sense", selector: "low-light-vision" }, { key: "Sense", predicate: ["self:low-light-vision:from-ancestry"], selector: "darkvision" }];
    }
    if ((match = /^You gain (darkvision|greater darkvision|low-light vision)\.$/i.exec(text))) return [senseRule(match[1])];
    // "You gain imprecise scent with a range of 30 feet." / "You gain imprecise lifesense out to a range of 30 feet."
    if ((match = /^You gain (imprecise|precise|vague) (scent|lifesense|tremorsense|echolocation|wavesense) (?:with a range of|out to a range of|out to) (\d+) feet\.$/i.exec(text))) return [senseRule(match[2], match[1], match[3])];
    // "You gain a climb Speed of 10 feet." / "You gain a swim Speed equal to your (land )?Speed."
    if ((match = /^You gain an? (climb|swim|burrow|fly) Speed (?:of (\d+) feet|equal to your (?:land )?Speed)\.$/i.exec(text))) return [{ key: "BaseSpeed", selector: match[1].toLowerCase(), value: match[2] ? Number(match[2]) : LAND }];
    return null;
}

// PF2e writes a BaseSpeed's selector either way ("swim", "swim-speed").
export const selectorOf = (rule) => String(rule?.selector ?? rule?.type ?? "").replace(/-speed$/, "");

// A passive's rules from those sentences, none it already has (the same key and selector), or []. Not a passive that's a form or a
// choice ("You can remain in this form for up to 1 minute", "Choose two of the following options"): its sentences aren't always true.
export function readRules(item) {
    if (!["passive", null, undefined].includes(item?.system?.actionType?.value)) return [];
    const plain = plainOf(item?.system?.description?.value);
    if (/\b(?:this form|for up to \d+ (?:rounds?|minutes?|hours?)|Choose (?:one|two|three|an?) (?:of the following|option)|select this feat (?:twice|a second time))\b/i.test(plain)) return [];
    const own = item?.system?.rules ?? [];
    const has = (rule) => own.some((each) => each.key === rule.key && selectorOf(each) === selectorOf(rule));
    const sentences = plain.split(/(?<=[.!?])\s+(?=[A-Z])/);
    return sentences.flatMap((sentence) => sentenceRules(sentence) ?? []).filter((rule) => rule && !has(rule));
}

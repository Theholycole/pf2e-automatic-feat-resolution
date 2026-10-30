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

// Notes on the roll a passive is about (2026-10-30, docs/rules.md, batch 3): "When you successfully Demoralize a foe, …", "If you critically
// succeed at a check to Recall Knowledge, …", "Whenever you Treat Wounds, …". PF2e rolls these actions with the roll option action:<slug>,
// and a Note rule with that predicate (and the degrees the sentence names) puts the feat's words on that roll's card, where the player and
// GM need them. The words are the feat's own, from that sentence to the end of its paragraph.
const ACTION_STATISTICS = {
    demoralize: ["intimidation"], coerce: ["intimidation"],
    feint: ["deception"], "create-a-diversion": ["deception"], lie: ["deception"], impersonate: ["deception"],
    trip: ["athletics"], shove: ["athletics"], grapple: ["athletics"], disarm: ["athletics"], reposition: ["athletics"], climb: ["athletics"], swim: ["athletics"], "high-jump": ["athletics"], "long-jump": ["athletics"], "force-open": ["athletics"],
    escape: ["athletics", "acrobatics"],
    "recall-knowledge": ["skill-check"], "identify-magic": ["skill-check"], "decipher-writing": ["skill-check"], "learn-a-spell": ["skill-check"], "earn-income": ["skill-check"],
    seek: ["perception"], "sense-motive": ["perception"],
    hide: ["stealth"], sneak: ["stealth"], "avoid-notice": ["stealth"],
    "tumble-through": ["acrobatics"], balance: ["acrobatics"], "maneuver-in-flight": ["acrobatics"], squeeze: ["acrobatics"],
    "treat-wounds": ["medicine"], "administer-first-aid": ["medicine"], "battle-medicine": ["medicine"], "treat-poison": ["medicine"], "treat-disease": ["medicine"],
    request: ["diplomacy"], "make-an-impression": ["diplomacy"], "gather-information": ["diplomacy"],
    track: ["survival"], subsist: ["survival"],
    craft: ["crafting"], repair: ["crafting"],
    perform: ["performance"],
    "command-an-animal": ["nature"],
    "pick-a-lock": ["thievery"], "disable-a-device": ["thievery"], steal: ["thievery"], "palm-an-object": ["thievery"], "conceal-an-object": ["thievery"]
};
const ACTION_NAMES = Object.keys(ACTION_STATISTICS).map((slug) => slug.split("-").map((word) => (["a", "an"].includes(word) ? word : word[0].toUpperCase() + word.slice(1))).join(" "));
const NOTE_LEAD = new RegExp(String.raw`^(?:When|Whenever|If|Each time) you (successfully |critically succeed (?:at|on|to) |succeed (?:at|on|to) |critically fail (?:at|on|to) |fail (?:at|on|to) |roll a (?:success|critical success|failure|critical failure) (?:at|on|to) )?(?:an? |your |the )?(?:check to |checks? to |attempt to )?(${ACTION_NAMES.join("|")})\b(?! [A-Z])`);
const OUTCOMES = { successfully: ["success", "criticalSuccess"], succeed: ["success", "criticalSuccess"], "critically succeed": ["criticalSuccess"], fail: ["failure", "criticalFailure"], "critically fail": ["criticalFailure"], "roll a success": ["success"], "roll a critical success": ["criticalSuccess"], "roll a failure": ["failure"], "roll a critical failure": ["criticalFailure"] };

// The leads that aren't a skill action: a Strike's degrees (its attack roll), initiative. Each selector once per passive.
const OTHER_LEADS = [
    [/^(?:When|Whenever|If) you critically hit\b/, "strike-attack-roll", ["criticalSuccess"]],
    [/^(?:When|Whenever|If) you (?:hit|succeed at a Strike)\b/, "strike-attack-roll", ["success", "criticalSuccess"]],
    [/^(?:When|Whenever|If) you miss\b/, "strike-attack-roll", ["failure", "criticalFailure"]],
    [/^(?:When|Whenever) you (?:make a (?:[\w-]+ )?Strike|Strike)\b/, "strike-attack-roll", null],
    [/^(?:When|Whenever|If) you roll (?:Perception for )?initiative\b/, "initiative", null]
];

const plainLabels = (html) => String(html).replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/\[\[\/act ([\w-]+)[^\]]*\]\](?:\{([^}]*)\})?/g, (_all, slug, label) => label ?? slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()));

export function readNotes(item) {
    if (!["passive", null, undefined].includes(item?.system?.actionType?.value)) return [];
    if ((item?.system?.rules ?? []).some((rule) => rule.key === "Note")) return [];
    const notes = [];
    const seen = new Set();
    for (const paragraph of String(item?.system?.description?.value ?? "").split(/<\/p>|<hr\s*\/?>/i)) {
        const plain = htmlToPlainText(plainLabels(paragraph)).replace(/\s+/g, " ").trim();
        if (/^(?:Prerequisites?|Requirements?|Access|Special|Frequency|Trigger)\b/i.test(plain)) continue;
        const sentences = plain.split(/(?<=[.!?])\s+(?=[A-Z])/);
        for (const [index, sentence] of sentences.entries()) {
            // ("When you critically hit with a butterfly sword, …", "When you roll initiative, …": the attack roll's or initiative's.)
            const other = OTHER_LEADS.find(([lead]) => lead.test(sentence));
            if (other && !seen.has(other[1])) {
                seen.add(other[1]);
                notes.push({ key: "Note", selector: other[1], ...(other[2] ? { outcome: other[2] } : {}), title: "{item|name}", text: `<p>${sentences.slice(/\b(?:this way|such an?|such)\b/i.test(sentence) ? 0 : index).join(" ")}</p>` });
                continue;
            }
            const match = NOTE_LEAD.exec(sentence);
            if (!match) continue;
            // ("When you Climb, Force Open, High Jump, Long Jump, or Swim", "If you Hide or Sneak": each.)
            const names = [match[2]];
            const list = new RegExp(String.raw`^(?:,? (?:or |and )?|,? )(${ACTION_NAMES.join("|")})\b(?! [A-Z])`);
            let tail = sentence.slice(match[0].length);
            for (let more; (more = list.exec(tail)); tail = tail.slice(more[0].length)) names.push(more[1]);
            const slugs = names.map((name) => name.toLowerCase().replace(/\s+/g, "-")).filter((slug) => !seen.has(slug));
            if (!slugs.length) continue;
            for (const slug of slugs) seen.add(slug);
            const degree = match[1]?.trim().replace(/ (?:at|on|to)$/, "") ?? "";
            const outcome = OUTCOMES[degree] ?? null;
            // ("If you Hide or Sneak in this way, …": the paragraph's earlier sentences say which way.)
            const text = sentences.slice(/\b(?:this way|such an?|such)\b/i.test(sentence) ? 0 : index).join(" ");
            for (const slug of slugs) {
                for (const selector of ACTION_STATISTICS[slug]) {
                    notes.push({ key: "Note", selector, predicate: [`action:${slug}`], ...(outcome ? { outcome } : {}), title: "{item|name}", text: `<p>${text}</p>` });
                }
            }
        }
    }
    return notes;
}

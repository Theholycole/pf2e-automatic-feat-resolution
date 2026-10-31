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
// (An ActiveEffectLike by its path and value: Water Dancer's two terrain entries aren't the same rule; 2026-10-31.)
export const selectorOf = (rule) => String(rule?.selector ?? rule?.type ?? (rule?.path ? `${rule.path}:${JSON.stringify(rule.value ?? null)}` : "")).replace(/-speed$/, "");

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
const NOTE_LEAD = new RegExp(String.raw`^(?:(?:Additionally|In addition|Also|Then|However|Finally),? )?(?:[Ww]hen|[Ww]henever|[Ii]f|[Ee]ach time) you (successfully |critically succeed (?:at|on|to) |succeed (?:at|on|to) |critically fail (?:at|on|to) |fail (?:at|on|to) |roll a (?:success|critical success|failure|critical failure) (?:at|on|to) )?(?:an? |your |the )?(?:check to |checks? to |attempt to )?(${ACTION_NAMES.join("|")})\b(?! [A-Z])`);
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

// A reaction or free action whose trigger is one of the character's own rolls (2026-10-30, docs/rules.md, batch 5): "You fail a Will
// save.", "You critically hit a demon with a Strike.", "You roll initiative." A Note on that roll, for the degrees the trigger names, says
// the feat can be used now; PF2e has the roll's card on screen at that moment. Not a trigger before the roll ("but you haven't rolled
// yet", "You're about to …"): a note after it comes too late.
const DEGREES = [
    [/^(?:fail or critically fail|fail) (?:at )?/, ["failure", "criticalFailure"]],
    [/^critically fail (?:at |on )?/, ["criticalFailure"]],
    [/^(?:succeed|roll a success) (?:at |on )?/, ["success", "criticalSuccess"]],
    [/^(?:critically succeed|roll a critical success) (?:at |on )?/, ["criticalSuccess"]],
    [/^roll a critical failure (?:at |on )?/, ["criticalFailure"]],
    [/^roll a failure (?:at |on )?/, ["failure"]],
    [/^successfully (?:use [a-z]+ to )?/, ["success", "criticalSuccess"]]
];
// What's rolled → its selectors (and an action's predicate).
function rolledSelectors(words) {
    const text = words.toLowerCase();
    let match;
    if ((match = /^(?:an? |your )?((?:fortitude|reflex|will)(?:(?:,| or| and) (?:a )?(?:fortitude|reflex|will))*) (?:save|saving throw)s?\b/.exec(text))) return match[1].split(/,? or |,? and |, /).map((save) => ({ selector: save.replace(/^a /, "") }));
    if (/^(?:an? |your )?(?:basic )?(?:save|saving throw)s?\b/.test(text)) return [{ selector: "saving-throw" }];
    if (/^(?:an? |your )?skill checks?\b/.test(text)) return [{ selector: "skill-check" }];
    if ((match = /^an? (demoralize|feint|grapple|trip|shove|disarm) (?:check|attempt)\b/.exec(text))) return [{ selector: ACTION_STATISTICS[match[1]][0], predicate: [`action:${match[1]}`] }];
    if ((match = /^an? check to ([a-z ]+?)\b(?: |\.|$)/.exec(text)) && ACTION_STATISTICS[match[1].replace(/\s+/g, "-")]) return ACTION_STATISTICS[match[1].replace(/\s+/g, "-")].map((selector) => ({ selector, predicate: [`action:${match[1].replace(/\s+/g, "-")}`] }));
    if ((match = /^an? ([a-z]+) check\b/.exec(text)) && Object.values(ACTION_STATISTICS).flat().includes(match[1])) return [{ selector: match[1] }];
    // ("You successfully Grapple a creature …", "… Recall Knowledge to identify …": the action named first.)
    const named = Object.keys(ACTION_STATISTICS).find((slug) => text.startsWith(`${slug.replace(/-/g, " ")} `) || text === slug.replace(/-/g, " ") || text.startsWith(`${slug.replace(/-/g, " ")}.`));
    if (named) return ACTION_STATISTICS[named].map((selector) => ({ selector, predicate: [`action:${named}`] }));
    if (/^(?:an? |your )?(?:melee |ranged )?(?:strike|attack roll)s?\b/.test(text)) return [{ selector: /strike/.test(text) ? "strike-attack-roll" : "attack-roll" }];
    return null;
}

export function readTriggerNotes(item) {
    if (!["reaction", "free"].includes(item?.system?.actionType?.value)) return [];
    if ((item?.system?.rules ?? []).some((rule) => rule.key === "Note")) return [];
    const html = String(item?.system?.description?.value ?? "");
    const found = /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(html);
    if (!found) return [];
    const trigger = htmlToPlainText(plainLabels(found[1])).replace(/\s+/g, " ").trim().replace(/\s*Trigger\b.*$/, "").replace(/([^.])$/, "$1.");
    if (/\bhaven['’]t (?:yet )?rolled|\bhaven['’]t rolled yet|\bbut (?:you )?haven['’]t\b|\babout to\b|\bwould\b/i.test(trigger)) return [];
    const kind = item.system.actionType.value === "reaction" ? "reaction" : "free action";
    const note = (selector, predicate, outcome) => ({ key: "Note", selector, ...(predicate ? { predicate } : {}), ...(outcome ? { outcome } : {}), title: "{item|name}", text: `<p><strong>Trigger</strong> ${trigger}</p><p>You can use this ${kind} now.</p>` });
    if (/^You roll initiative\b/i.test(trigger)) return [note("initiative")];
    let match;
    if ((match = /^You (?:roll a )?critical(?:ly)? hit\b/i.exec(trigger))) return [note("strike-attack-roll", null, ["criticalSuccess"])];
    if ((match = /^You (?:hit|succeed at a (?:melee |ranged )?Strike)\b/i.exec(trigger))) return [note("strike-attack-roll", null, ["success", "criticalSuccess"])];
    const rest = trigger.replace(/^You /, "");
    const degree = DEGREES.find(([lead]) => lead.test(rest.toLowerCase()));
    if (!degree) return [];
    // ("You fail a skill check or saving throw", "an attack roll or Will save": each roll the trigger names.)
    const rolled = rest.toLowerCase().replace(degree[0], "");
    const whole = /^(?:an? |your )?(?:fortitude|reflex|will)(?:,? (?:or|and) (?:a )?(?:fortitude|reflex|will))+ sav/.test(rolled);
    const parts = whole ? [rolled] : rolled.split(/,? or (?=(?:an? |your )?(?:fortitude|reflex|will|skill|saving|save|attack|melee|ranged|strike)\b)/);
    const selectors = parts.map((part, index) => rolledSelectors(index ? `a ${part.replace(/^(?:an? |your )/, "")}` : part)).filter(Boolean).flat();
    if (!selectors.length || !rolledSelectors(parts[0])) return [];
    return selectors.map(({ selector, predicate }) => note(selector, predicate ?? null, degree[1]));
}

// A passive's bonus only in a moment PF2e can't see (2026-10-31, Cole's card "Roll notes for situational bonuses"): "You gain a +2
// circumstance bonus to Survival checks made to prepare for this weather event" → a note on the Survival check, the sentence as its text,
// for the GM to add the bonus when it fits. Only yours, on a roll (not an AC or DC), on a statistic the sentence names.
const BONUS_STATISTICS = [
    [/^(?:your )?(Acrobatics|Arcana|Athletics|Crafting|Deception|Diplomacy|Intimidation|Medicine|Nature|Occultism|Performance|Religion|Society|Stealth|Survival|Thievery) (?:checks?|DCs? and checks?)\b/i, (m) => [m[1].toLowerCase()]],
    [/^(?:your )?(?:checks? to |attempts? to )?(Impersonate|Lie|Feint|Create a Diversion)\b/i, () => ["deception"]],
    [/^(?:your )?(?:checks? to |attempts? to )?(Demoralize|Coerce)\b/i, () => ["intimidation"]],
    [/^(?:your )?(?:checks? to |attempts? to )?(Seek|Sense Motive)\b|^(?:your )?Perception checks?\b/i, () => ["perception"]],
    [/^(?:your )?(?:checks? to |attempts? to )?(?:Craft|Repair)\b/i, () => ["crafting"]],
    [/^(?:your )?(?:checks? to |attempts? to )?(?:Treat Wounds|Treat Poison|Treat Disease|Administer First Aid)\b/i, () => ["medicine"]],
    [/^(?:your )?(?:checks? to |attempts? to )?(?:Hide|Sneak|Conceal an Object)\b/i, () => ["stealth"]],
    [/^(?:your )?(?:checks? to |attempts? to )?(?:Climb|Swim|Grapple|Shove|Trip|Force Open|High Jump|Long Jump)\b/i, () => ["athletics"]],
    [/^(?:your )?(?:checks? to |attempts? to )?(?:Balance|Tumble Through|Maneuver in Flight|Squeeze)\b/i, () => ["acrobatics"]],
    [/^(?:your )?(?:checks? to |attempts? to )?(?:Track|Subsist|Sense Direction)\b/i, () => ["survival"]],
    [/^(?:your )?(?:Fortitude|Reflex|Will) (?:saves?|saving throws?)(?:,? (?:and|or) (?:Fortitude|Reflex|Will) (?:saves?|saving throws?))*\b/i, (m) => [...m[0].matchAll(/Fortitude|Reflex|Will/gi)].map((each) => each[0].toLowerCase())],
    [/^(?:your |the )?(?:next )?(?:saves?|saving throws?)\b/i, () => ["saving-throw"]],
    [/^(?:your )?initiative(?: rolls?| checks?)?\b/i, () => ["initiative"]],
    [/^(?:your |the )?(?:next )?attack rolls?\b/i, () => ["attack-roll"]]
];
const BONUS_LEAD = /\b(?:you|You) (?:also )?(?:gain|get|have|receive) an? \+\d+ (?:circumstance|status|item) bonus (?:to|on) (.+)$/;

export function readBonusNotes(item) {
    if (!["passive", null, undefined].includes(item?.system?.actionType?.value)) return [];
    if ((item?.system?.rules ?? []).length) return [];
    const notes = [];
    const seen = new Set();
    for (const paragraph of String(item?.system?.description?.value ?? "").split(/<\/p>|<hr\s*\/?>/i)) {
        const plain = htmlToPlainText(plainLabels(paragraph)).replace(/\s+/g, " ").trim();
        if (/^(?:Prerequisites?|Requirements?|Access|Special|Frequency|Trigger)\b/i.test(plain)) continue;
        for (const sentence of plain.split(/(?<=[.!?])\s+(?=[A-Z])/)) {
            const match = BONUS_LEAD.exec(sentence);
            if (!match) continue;
            const found = BONUS_STATISTICS.map(([pattern, selectors]) => [pattern.exec(match[1]), selectors]).find(([hit]) => hit);
            if (!found) continue;
            for (const selector of found[1](found[0])) {
                if (seen.has(selector)) continue;
                seen.add(selector);
                notes.push({ key: "Note", selector, title: "{item|name}", text: `<p>${sentence}</p>` });
            }
        }
    }
    return notes;
}

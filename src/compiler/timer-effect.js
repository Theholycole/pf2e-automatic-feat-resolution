// An action whose effect lasts a set time and that nothing else plays (2026-10-31, the loop; Cole's card on timed activities): an Effect
// with no rules, the feat's words for it and its duration, on whoever it affects, so its icon shows it and PF2e ends it on time. "Until the
// start of your next turn, you can't be flanked" on you; "The target can't use reactions … until the end of your next turn" on the targets.

import { htmlToPlainText } from "../../../pf2e-resolution-core/src/text/plain-text.js";
import { effectDuration } from "./self-effect.js";

const HEADINGS = /<p[^>]*>\s*<strong>\s*(Trigger|Frequency|Requirements?|Cost|Access|Prerequisites?)\s*<\/strong>[\s\S]*?<\/p>\s*(?:<hr\s*\/?>)?/gi;
const LASTS = /\b(?:until (?:the )?(?:start|beginning|end) of your next turn|for (?:\d+|one|a|an|two|three|ten) (?:round|minute|hour)s?)\b/i;
const OTHERS = /^(?:the target|the (?:enemy|foe|ally|opponent)|targets|the triggering (?:creature|enemy|foe|ally)|the creature|creatures|each (?:target|enemy|foe|ally|creature)|enemies|foes|allies|your allies|you and (?:your )?all(?:y|ies)|an? (?:enemy|foe|ally|creature)|that (?:target|enemy|foe|ally|creature)|any (?:enemy|foe|ally|creature)|all (?:enemies|foes|allies|creatures))\b/i;
const OTHERS_ANYWHERE = /\b(?:the target|the triggering (?:creature|enemy|foe|ally)|each (?:enemy|foe|ally)|enemies|foes|your allies|that (?:enemy|foe|ally))\b/i;
// (Not a timer: an immunity, a once-a-day, what you can't do again.)
const NOT_TIMED = /\bimmune\b|\b(?:rest|rests|spend|spends|work|works|study|meditate|meditates|pray|prays|practice|train|wait|search|searches|investigate|concentrate|perform|performs|craft|crafting|taking|takes|take)\b[^.,]{0,30}\bfor (?:\d+|one|a|an|two|three|ten) (?:round|minute|hour)s?\b|\bcan't (?:\w+ ){0,4}again\b|\bcan't attempt\b|\bcan't use [^.]* again\b/i;
// (Not one a roll's outcome decides, "On a critical failure, the creature also becomes Off-Guard …": the check's card's, after the roll;
// round 43, To War!.)
const OUTCOME = /^(?:on an? (?:critical )?(?:success|failure|hit)|(?:critical )?(?:success|failure)\b|if (?:you|it|they|the (?:target|creature|enemy|strike|attack)|this (?:shot|strike|attack)|your (?:strike|attack|check)) (?:succeeds?|fails?|hits?|critically|misses?|is hit|are hit)|if the (?:target|creature|enemy) (?:fails|succeeds|critically))/i;
// (Links as their words, "@UUID[…Concealed]{Concealed}" "Concealed", so a sentence doesn't end in a compendium path.)
const linkWords = (html) => html.replace(/@(?:UUID|Compendium)\[([^\]]+)\](?:\{([^}]*)\})?/g, (_all, path, label) => label ?? path.split(".").at(-1)).replace(/@\w+\[[^\]]*\](?:\{([^}]*)\})?/g, (_all, label) => label ?? "");

export function timerEffect(item) {
    const type = item?.system?.actionType?.value;
    if (!["action", "reaction", "free"].includes(type) || item.system?.selfEffect) return null;
    // (A feat that links its own PF2e Effect, To War!'s "Effect: To War!": that one is the real one; round 44.)
    if (/@UUID\[Compendium\.[\w-]+\.(?:feat-effects|spell-effects|other-effects|equipment-effects|[\w-]*effects?[\w-]*)\.Item\./i.test(String(item.system?.description?.value ?? ""))) return null;
    const html = linkWords(String(item.system?.description?.value ?? "").replace(HEADINGS, " "));
    const text = htmlToPlainText(html).replace(/\s+/g, " ").trim();
    const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
    const at = sentences.findIndex((sentence) => LASTS.test(sentence) && !NOT_TIMED.test(sentence) && !OUTCOME.test(sentence.trim()));
    if (at < 0) return null;
    const sentence = sentences[at].trim();
    const duration = effectDuration(sentence.replace(/beginning of your next turn/i, "start of your next turn"));
    if (!duration) return null;
    // (Who: the sentence's subject, past "Until the start of your next turn," or "For 1 minute,"; "You" yours, "The target" the targets.
    // Without one, the sentence before, "You apply one of the following effects, which lasts …".)
    const LEAD = /^(?:(?:critical )?(?:success|failure)\b\s*|(?:until|for|on|if|when|whenever|then|after|in addition|additionally|normally|regardless)\b[^,]{0,60},\s*)/i;
    const subject = (words) => {
        let rest = words.trim();
        for (let step = 0; step < 3 && LEAD.test(rest); step++) rest = rest.replace(LEAD, "").trim();
        return rest;
    };
    const whose = (words) => (/^any creature (?:that|who)\b/i.test(subject(words)) ? "self" : OTHERS.test(subject(words)) || /^(?:they|it)\b/i.test(subject(words)) ? "target" : /^(?:you|your)\b/i.test(subject(words)) ? "self" : null);
    const who = whose(sentence) ?? (OTHERS_ANYWHERE.test(sentence) ? "target" : whose(sentences[at - 1] ?? "") ?? "self");
    return { builtin: "feat-effect", timer: true, ...(who === "target" ? { who: "target" } : {}), effect: { name: item.name, rules: [], duration, stance: false }, notes: [sentence] };
}

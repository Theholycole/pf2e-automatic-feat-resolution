// A character's feat that changes the character's own numbers for a while (2026-10-30, docs/feats.md, slice 5): "You gain a +1 circumstance
// bonus to AC until the start of your next turn", "For 1 minute, you gain resistance 5 to fire", "While in Rain of Embers Stance, you gain a
// +1 status bonus to AC and fire resistance equal to half your level", "you take a –10-foot penalty to Speed". PF2e has no Effect for these;
// the module makes one, its rules the ones PF2e's own Effects use (FlatModifier, Resistance), and puts it on the character when the feat is
// used (scripts/effects.js). Only what lasts a set time, or a stance's while-in-it: a bonus "against the triggering attack", "to the check to
// Climb if …" or one with no end the text gives is the GM's, as a note.

import { htmlToPlainText } from "../../../pf2e-resolution-core/src/text/plain-text.js";
import { amountOf } from "./self-heal.js";
import { RULE_WORDS } from "./strikes.js";

const HEADINGS = /<p[^>]*>\s*<strong>\s*(Trigger|Frequency|Requirements?|Cost|Access|Prerequisites?|Duration)\s*<\/strong>([\s\S]*?)<\/p>\s*(?:<hr\s*\/?>)?/gi;
const NUMBER_WORDS = { one: 1, a: 1, an: 1, two: 2, three: 3, ten: 10 };
const SKILLS = ["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"];
const DAMAGE_TYPES = new Set(["acid", "bludgeoning", "cold", "electricity", "fire", "force", "mental", "piercing", "poison", "slashing", "sonic", "spirit", "vitality", "void", "bleed", "precision", "physical", "all-damage", "holy", "unholy"]);
// The actions a skill bonus can be for ("Athletics checks to Climb"): PF2e's roll option action:<slug>.
const ACTIONS = new Set(["balance", "climb", "demoralize", "disarm", "escape", "feint", "force-open", "grapple", "high-jump", "long-jump", "reposition", "seek", "shove", "sneak", "swim", "trip", "tumble-through", "hide", "create-a-diversion", "recall-knowledge", "sense-motive", "treat-wounds", "request", "coerce", "make-an-impression", "squeeze", "maneuver-in-flight", "lie", "impersonate", "track", "leap"]);

// "until the start of your next turn", "for 1 minute", "until the end of your turn" → PF2e's Effect duration, or null.
export function effectDuration(words) {
    const text = String(words ?? "").trim();
    let match;
    if ((match = /\buntil the (start|end) of your next turn\b/i.exec(text))) return { value: 1, unit: "rounds", expiry: `turn-${match[1].toLowerCase()}`, sustained: false };
    if (/\buntil the end of (?:your|this|the current) turn\b/i.test(text)) return { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };
    if ((match = /\bfor (\d+|one|a|an|two|three|ten) (round|minute|hour|day)s?\b/i.exec(text)) || (match = /^(\d+|one|a|an|two|three|ten) (round|minute|hour|day)s?$/i.exec(text))) {
        const value = Number(match[1]) || NUMBER_WORDS[match[1].toLowerCase()] || 1;
        return { value, unit: `${match[2].toLowerCase()}s`, expiry: "turn-start", sustained: false };
    }
    return null;
}

// One thing a bonus is to ("AC", "attack and damage rolls" split as "attack" / "damage rolls", "Athletics checks to Climb") → { selector,
// predicate? }, or null.
function selectorOf(term) {
    const text = term.trim().toLowerCase().replace(/^(?:your|all|the) /, "").replace(/^your /, "");
    let match;
    if (/^(?:ac|armor class)$/.test(text)) return { selector: "ac" };
    if (/^(?:attack|attack rolls?)$/.test(text)) return { selector: "attack" };
    if (/^(?:damage|damage rolls?)$/.test(text)) return { selector: "damage" };
    if (/^(?:strike|strike attack rolls?|attack rolls? with strikes)$/.test(text)) return { selector: "strike-attack-roll" };
    if (/^melee (?:attack rolls?|strikes?)$/.test(text)) return { selector: "melee-attack-roll" };
    if (/^ranged (?:attack rolls?|strikes?)$/.test(text)) return { selector: "ranged-attack-roll" };
    if (/^melee (?:damage|damage rolls|strike damage)$/.test(text)) return { selector: "melee-strike-damage" };
    if (/^(?:strike damage|damage rolls? with strikes|weapon damage)$/.test(text)) return { selector: "strike-damage" };
    if (/^(?:saving throws?|saves)$/.test(text)) return { selector: "saving-throw" };
    if ((match = /^(fortitude|reflex|will) (?:saves?|saving throws?)$/.exec(text))) return { selector: match[1] };
    if ((match = /^(fortitude|reflex|will) dc$/.exec(text))) return { selector: `${match[1]}-dc` };
    if (/^perception(?: checks?)?$/.test(text)) return { selector: "perception" };
    if (/^perception dc$/.test(text)) return { selector: "perception-dc" };
    if (/^initiative(?: rolls?| checks?)?$/.test(text)) return { selector: "initiative" };
    if (/^skill checks?$/.test(text)) return { selector: "skill-check" };
    if ((match = /^([a-z]+) (?:checks?|dc)(?: to ([a-z -]+?))?$/.exec(text)) && SKILLS.includes(match[1])) {
        const dc = /\bdc\b/.test(text);
        if (!match[2]) return { selector: dc ? `${match[1]}-dc` : match[1] };
        const action = match[2].replace(/\s+/g, "-");
        return ACTIONS.has(action) && !dc ? { selector: match[1], predicate: [`action:${action}`] } : null;
    }
    return null;
}

// "AC and saving throws", "attack and damage rolls", "Fortitude saves and your Fortitude DC" → selectors, or null if one isn't known.
function selectorsOf(list) {
    const terms = list.replace(/\battack and damage rolls\b/i, "attack rolls and damage rolls").replace(/\b(Fortitude|Reflex|Will) and (Fortitude|Reflex|Will) saves\b/i, "$1 saves and $2 saves").split(/,\s*(?:and\s+)?|\s+and\s+/i).filter(Boolean);
    const out = [];
    for (const term of terms) {
        const one = selectorOf(term);
        if (!one) return null;
        out.push(one);
    }
    return out.length ? out : null;
}

const SIGN = String.raw`[+]|[–—-]`;
// "a +2 status bonus to AC and saving throws" / "take a –1 circumstance penalty to attack rolls" (to the end of the list).
const MODIFIER = new RegExp(String.raw`(?<!against |to |for )\b(?:you|You) (?:also |instead |each )?(?:gain|get|have|take) an? (${SIGN})(\d+) (circumstance|status|item) (bonus|penalty) (?:to|on) ([A-Za-z ,]+?)(?=$|[.;]| (?:until|for|while|against|when|if|as long|but|this|that|which|during)\b|, (?:but|and you|until|for)\b| and (?:you|resistance|gain|a |an |[a-z]+ resistance|take)\b)`, "i");
// "a +10-foot status bonus to your Speed" / "a –10-foot penalty to your Speed" / "a –5-foot circumstance penalty to Speed".
const SPEED = new RegExp(String.raw`(?<!against |to |for )\b(?:you|You) (?:also |instead )?(?:gain|get|take) an? (${SIGN})(\d+)-foot (?:(circumstance|status|item) )?(bonus|penalty) to (?:your |all your )?(land )?Speeds?\b`, "i");
// "resistance 5 to fire", "resistance 10 to physical damage (except adamantine)", "fire resistance equal to half your level (minimum 1)".
const RESISTANCE = /\b(?:you (?:also )?gain|you have|and) (?:a )?(?:resistance (\d+|equal to [^,.;()]+?(?: \((?:minimum|min\.?) 1\))?) to ([a-z ,]+?)(?: damage)?(?: \(except ([a-z ]+)\))?|([a-z]+) resistance (\d+|equal to [^,.;()]+?(?: \((?:minimum|min\.?) 1\))?))(?=$|[.;,]| and | but | until | for | while )/i;

function amount(words, dcs) {
    const text = String(words).trim();
    if (/^\d+$/.test(text)) return Number(text);
    return amountOf(text.replace(/^equal to /i, ""), dcs);
}

// The rules one sentence gives the character, and what it leaves unread; or null if the sentence isn't about the character's numbers.
function sentenceRules(sentence, dcs) {
    const rules = [];
    let rest = sentence;
    let match;
    let guard = 0;
    while ((match = MODIFIER.exec(rest)) && guard++ < 4) {
        const after = rest.slice(match.index + match[0].length);
        // (A bonus only against something, or when something happens: the GM's.)
        if (/^\s*(?:against|when|if|as long|this|that|which|during)\b/i.test(after)) return null;
        const selectors = selectorsOf(match[5]);
        if (!selectors) return null;
        const value = Number(match[2]) * (match[1] === "+" ? 1 : -1) * (match[4].toLowerCase() === "penalty" && match[1] === "+" ? -1 : 1);
        for (const { selector, predicate } of selectors) rules.push({ key: "FlatModifier", selector, type: match[3].toLowerCase(), value, ...(predicate ? { predicate } : {}) });
        rest = rest.replace(match[0], " ");
    }
    if ((match = SPEED.exec(rest))) {
        const value = Number(match[2]) * (match[1] === "+" && match[4].toLowerCase() === "bonus" ? 1 : -1);
        rules.push({ key: "FlatModifier", selector: match[5] ? "land-speed" : "all-speeds", type: (match[3] ?? (value < 0 ? "untyped" : "status")).toLowerCase(), value });
        rest = rest.replace(match[0], " ");
    }
    guard = 0;
    while ((match = RESISTANCE.exec(rest)) && guard++ < 3) {
        const value = amount(match[1] ?? match[5], dcs);
        const types = (match[2] ?? match[4]).toLowerCase().replace(/\ball damage\b/, "all-damage").replace(/\bdamage\b/g, "").split(/,\s*(?:and |or )?|\s+(?:and|or)\s+/).map((type) => type.trim()).filter(Boolean);
        if (!Number.isFinite(value) || !types.length || !types.every((type) => DAMAGE_TYPES.has(type))) return null;
        const exceptions = match[3] ? [match[3].trim().toLowerCase()] : [];
        for (const type of types) rules.push({ key: "Resistance", type, value, ...(exceptions.length ? { exceptions } : {}) });
        rest = rest.replace(match[0], " ");
    }
    if (!rules.length) return null;
    return { rules, rest };
}

function plainOf(html) {
    return htmlToPlainText(String(html).replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/@Template\[[^\]]*\]\{([^}]*)\}/g, "$1")).replace(/\s+/g, " ").trim();
}

// item: the feat, its text with the character's numbers in. → { builtin: "feat-effect", effect: { name, rules, duration, stance }, notes },
// or null.
export function selfEffect(item, dcs) {
    const type = item?.system?.actionType?.value;
    if (!["action", "free"].includes(type)) return null;
    const raw = String(item.system?.description?.value ?? "");
    // (PF2e's own Effect for it, linked: PF2e's button applies it, D9.)
    if (/Effect:\s*@UUID\[[^\]]*(?:effect|Effect)/.test(raw) || /@UUID\[Compendium\.[\w-]+\.[\w-]*effects?[\w-]*\./i.test(raw)) return null;
    let lasting = null;
    const html = raw.replace(HEADINGS, (_all, heading, text) => {
        if (/^duration$/i.test(heading)) lasting = effectDuration(plainOf(text));
        return "";
    });
    // A check, a save, sections by degree, an area or someone else's numbers: another reading's, not this one.
    if (/<strong>\s*(?:Critical Success|Success|Failure)\s*<\/strong>|@Check\[|@Template\[|@Damage\[/i.test(html)) return null;
    const traits = item.system?.traits?.value ?? [];
    const stance = traits.includes("stance");
    const sentences = plainOf(html).split(/(?<=[.!?])\s+(?=[A-Z])/).map((sentence) => sentence.trim()).filter(Boolean);
    const rules = [];
    const notes = [];
    let duration = lasting;
    for (const sentence of sentences) {
        const body = sentence.replace(/\.$/, "");
        // "For 1 minute, you gain …", "While in this stance, you gain …", "Until the start of your next turn, you …": the lead-in's time.
        const lead = /^(For (?:\d+|one|a|an|two|three|ten) (?:round|minute|hour)s?|Until the (?:start|end) of your (?:next )?turn|While (?:you are |you're )?in (?:this|the|[A-Z][\w' -]+?) [Ss]tance|While this (?:effect|ability) (?:lasts|is active)|For the duration),\s*(.*)$/.exec(body);
        const words = lead ? lead[2] : body;
        const sometimes = /^(?:If|When|Whenever|Once|After|Before|Unless|At \d+(?:st|nd|rd|th) level|The first time|Each time|On (?:a|your)|In addition, (?:if|when))\b/i.test(words);
        const read = sometimes ? null : sentenceRules(words, dcs);
        if (!read) {
            if (RULE_WORDS.test(sentence) || /\bresistance\b/i.test(sentence)) notes.push(sentence);
            continue;
        }
        // (A sentence about someone else: "you and all allies within 10 feet", "your allies gain …".)
        if (/\b(?:allies|an ally|each creature|all creatures|your companion|your eidolon|your familiar)\b/i.test(words)) return null;
        const own = lead && !/^While/i.test(lead[1]) && !/^For the duration/i.test(lead[1]) ? effectDuration(lead[1]) : effectDuration(words);
        if (own) {
            if (duration && (duration.value !== own.value || duration.unit !== own.unit || duration.expiry !== own.expiry)) return null;
            duration = own;
        }
        rules.push(...read.rules);
        const rest = read.rest.replace(/\b(?:until the (?:start|end) of your (?:next )?turn|for (?:\d+|one|a|an|two|three|ten) (?:round|minute|hour)s?)\b/gi, "").replace(/^[\s,;]*(?:you|and|but|also)?[\s,;]*/i, "").replace(/[\s,;]+$/, "").trim();
        // (What the sentence also says: on the card as a note, the whole sentence so the GM reads it as written.)
        if (rest && RULE_WORDS.test(rest) && !/^(?:and|but|you|also|gain|to)$/i.test(rest)) notes.push(sentence);
    }
    if (!rules.length) return null;
    // (No end the text gives: only a stance, which lasts until the encounter ends or the character takes another stance.)
    if (!duration && !stance) return null;
    return {
        builtin: "feat-effect",
        actions: type === "free" ? 0 : Number(item.system?.actions?.value) || 1,
        effect: { name: item.name, rules, duration: duration ?? { value: -1, unit: "encounter", expiry: null, sustained: false }, stance },
        source: { name: item.name, type: item.type ?? "feat", uuid: item.uuid ?? null },
        notes
    };
}

// A character's feat that heals it or gives it temporary Hit Points (2026-10-30, docs/feats.md, slice 4): "You regain @Damage[4d6[healing]]
// Hit Points", "You gain temporary Hit Points equal to half your level that last until the start of your next turn", "You recover
// @Damage[4d6[healing]] Hit Points and gain 10 temporary Hit Points for 1 minute." The character's own numbers (its level, an attribute
// modifier) worked out; the amount on the character itself, as the core's automatic check with heal and temp-hp effects on "self". Its
// other rule sentences go to the GM as notes. Not a sentence that heals only sometimes ("If you …", "The first time each round …").

import { htmlToPlainText } from "../../../pf2e-resolution-core/src/text/plain-text.js";
import { glossarySlug } from "../../../pf2e-automatic-ability-resolution/src/compiler/monster.js";
import { readDamage } from "../../../pf2e-automatic-ability-resolution/src/compiler/inline.js";
import { RULE_WORDS } from "./strikes.js";

const HEADINGS = /<p[^>]*>\s*<strong>\s*(?:Trigger|Frequency|Requirements?|Cost|Access|Prerequisites?)\s*<\/strong>[\s\S]*?<\/p>\s*(?:<hr\s*\/?>)?/gi;
const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, ten: 10 };
const ABILITIES = { strength: "str", dexterity: "dex", constitution: "con", intelligence: "int", wisdom: "wis", charisma: "cha" };

// "your level", "half your level (minimum 1)", "twice your level", "10 + your level", "your Constitution modifier" → a number, or null.
export function amountOf(words, dcs) {
    const atLeastOne = /\s*\((?:minimum|min\.?) 1\)\s*$/i;
    const text = String(words).trim().replace(atLeastOne, "");
    const level = Number(dcs?.level);
    if (!Number.isFinite(level)) return null;
    let match;
    let value = null;
    if (/^(?:your|your character) level$/i.test(text)) value = level;
    else if ((match = /^half (?:your|your character) level(?:,? rounded (up|down))?$/i.exec(text))) value = match[1] === "up" ? Math.ceil(level / 2) : Math.floor(level / 2);
    else if (/^(?:twice|double) your level$/i.test(text)) value = 2 * level;
    else if ((match = /^(three|four) times your level$/i.exec(text))) value = NUMBER_WORDS[match[1].toLowerCase()] * level;
    else if ((match = /^(\d+) \+ your level$/i.exec(text)) || (match = /^your level \+ (\d+)$/i.exec(text))) value = Number(match[1]) + level;
    else if ((match = /^your (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) modifier$/i.exec(text))) value = Number(dcs.abilities?.[ABILITIES[match[1].toLowerCase()]]);
    if (!Number.isFinite(value)) return null;
    return atLeastOne.test(words) ? Math.max(1, value) : value;
}

// "until the start of your next turn", "for 1 minute", "which last for 1 hour" → the core's duration, or null.
function durationOf(words) {
    const text = String(words ?? "").trim();
    let match;
    if ((match = /until the (start|end) of your next turn$/i.exec(text))) return { mode: "fixed", value: 1, unit: "rounds", expiry: `turn-${match[1].toLowerCase()}`, anchor: "effect-start" };
    if ((match = /for (\d+|one|a|an) (round|minute|hour)s?$/i.exec(text))) {
        const value = Number(match[1]) || NUMBER_WORDS[match[1].toLowerCase()] || 1;
        return { mode: "fixed", value, unit: `${match[2].toLowerCase()}s`, expiry: null, anchor: "effect-start" };
    }
    return null;
}

const DURATION = String.raw`(?:,? (?:that|which) lasts? (?:until the (?:start|end) of your next turn|for (?:\d+|one|a|an) (?:round|minute|hour)s?)|,? for (?:\d+|one|a|an) (?:round|minute|hour)s?|,? until the (?:start|end) of your next turn)`;
// "You regain ⟦4d6⟧ Hit Points" / "You recover a number of ⟦8⟧ Hit Points" / "You regain Hit Points equal to your level".
const HEAL = new RegExp(String.raw`^(?:In addition, )?You (?:regain|recover|heal) (?:a number of )?(?:⟦([^⟧]+)⟧ (?:Hit Points|HP)|(\d+d\d+(?:\s*\+\s*\d+)?|\d+) (?:Hit Points|HP)|(?:Hit Points|HP) equal to (.+?))(?=$| and | but |,)`, "i");
// "You gain temporary Hit Points equal to your level" / "You gain 10 temporary Hit Points for 1 minute" / "… a number of temporary HP equal to …".
const TEMP = new RegExp(String.raw`(?:^(?:In addition, )?You (?:also )?gain|^| and gain) (?:a number of |an amount of )?(?:(\d+|⟦[^⟧]+⟧) temporary (?:Hit Points|HP)|temporary (?:Hit Points|HP) equal to (.+?))(${DURATION})?(?=$| and |,|;)`, "i");

function plainOf(html) {
    // A damage tag as its formula; its label's "Hit Points" kept ("@Damage[(8)[healing]]{Hit Points equal to your level}" → "⟦8⟧ Hit Points").
    const tagged = String(html).replace(/@Damage\[((?:[^[\]]|\[(?:[^[\]]|\[[^\]]*\])*\])*)\](?:\{([^}]*)\})?/g, (_all, raw, label) => {
        const formula = readDamage(raw).replace(/\[(?:healing|vitality|,)+\]/gi, "").replace(/^\((.*)\)$/, "$1");
        return `⟦${formula}⟧${label && /\b(?:Hit Points|HP)\b/.test(label) ? " Hit Points" : ""}`;
    });
    return htmlToPlainText(tagged.replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1")).replace(/\s+/g, " ").trim();
}

export function selfHeal(item, dcs) {
    const type = item?.system?.actionType?.value;
    if (!["action", "reaction", "free"].includes(type)) return null;
    const html = String(item.system?.description?.value ?? "").replace(HEADINGS, "").replace(/<p>\s*Effect:\s*@UUID[\s\S]*?<\/p>/gi, "");
    // Sections by degree, a check of its own, an area or allies: not the character's own healing.
    if (/<strong>\s*(?:Critical Success|Success|Failure)\s*<\/strong>|@Check\[|@Template\[/i.test(html)) return null;
    const sentences = plainOf(html).replace(/\s*Effect:\s*[^.]*$/i, "").split(/(?<=[.!?])\s+(?=[A-Z⟦])/).map((sentence) => sentence.trim()).filter(Boolean);
    const effects = [];
    const notes = [];
    for (const sentence of sentences) {
        const body = sentence.replace(/\.$/, "");
        // (A sentence that heals only sometimes, "At 15th level, you instead recover 6d6 HP", "If you …": the GM's.)
        const sometimes = /^(?:If|When|Whenever|Once|While|After|Before|Unless|Until|At \d+(?:st|nd|rd|th) level|The first time|For the next)\b/i.test(body);
        // ("They last for 1 round." after the temporary Hit Points: their time.)
        const lasting = /^(?:They|These temporary (?:Hit Points|HP)|The temporary (?:Hit Points|HP)) last (for (?:\d+|one|a|an) (?:round|minute|hour)s?|until the (?:start|end) of your next turn)$/i.exec(body);
        const last = effects.at(-1);
        if (lasting && last?.kind === "temp-hp" && !last.duration) {
            last.duration = durationOf(lasting[1]);
            continue;
        }
        const heal = sometimes ? null : HEAL.exec(body);
        const temp = sometimes ? null : TEMP.exec(body);
        if (!heal && !temp) {
            // Flavour stays out; any other rule is the GM's.
            if (RULE_WORDS.test(sentence) || /\b(?:Hit Points|HP)\b/.test(sentence)) notes.push(sentence);
            continue;
        }
        let rest = body;
        if (heal) {
            const formula = heal[1] ?? heal[2] ?? amountOf(heal[3], dcs);
            if (formula === null || formula === undefined || /@/.test(String(formula))) return null;
            effects.push({ kind: "heal", formula: String(formula).replace(/\s+/g, ""), recipient: "self" });
            rest = rest.replace(heal[0], "");
        }
        if (temp && (!heal || temp.index >= heal[0].length - 1)) {
            const amount = temp[1] ? temp[1].replace(/[⟦⟧]/g, "") : amountOf(temp[2], dcs);
            if (amount === null || /@/.test(String(amount))) return null;
            effects.push({ kind: "temp-hp", formula: String(amount), recipient: "self", duration: durationOf(temp[3]) });
            rest = rest.replace(temp[0], "");
        }
        rest = rest.replace(/^[\s,;]*(?:and|but)?\s*/i, "").replace(/[\s,;]+$/, "").trim();
        if (rest) notes.push(`${rest[0].toUpperCase()}${rest.slice(1)}.`);
    }
    if (!effects.length) return null;
    // A heal written with a condition first ("If you rest …, you regain …") isn't matched above; one that names others is no self-heal.
    if (notes.some((note) => /\b(?:allies|an ally|each creature|all creatures)\b/i.test(note) && /\b(?:Hit Points|HP)\b/.test(note))) return null;
    const traits = item.system?.traits?.value ?? [];
    const none = () => ({ damage: { mode: "none", multiplier: 0, sourceComponentIds: [] }, effects: [] });
    return {
        modelVersion: 13,
        source: { name: item.name, slug: glossarySlug(item), uuid: item.uuid ?? null, type: item.type ?? "feat" },
        rank: 1,
        traits: [...traits],
        activation: { time: ["reaction", "free"].includes(type) ? type : String(item.system?.actions?.value ?? 1), traits: [...traits] },
        automation: { level: "automatic" },
        targeting: { target: "self", range: null, area: null },
        trigger: { event: "use" },
        resolution: { kind: "check", check: { roll: "automatic", statistic: "automatic" }, sharedDamage: null, outcomes: { criticalSuccess: none(), success: { ...none(), effects }, failure: none(), criticalFailure: none() } },
        ...(notes.length ? { notes } : {})
    };
}

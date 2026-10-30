// A character's action that heals another creature (2026-10-30, docs/feats.md, slice 14): "An adjacent creature regains @Damage[100[healing]]
// Hit Points", "You prevent the creature from dying and restore @Damage[…[healing]] Hit Points to it", "You or a living creature adjacent to
// you regains …". The ability module's automatic card, its heal on the GM's target (the character too when it says "you or"). Only when one
// creature is healed and nothing else is rolled: no check, no area, no Strike; the rest of its rules as notes.

import { htmlToPlainText } from "../../../pf2e-resolution-core/src/text/plain-text.js";
import { readDamage } from "../../../pf2e-automatic-ability-resolution/src/compiler/inline.js";
import { glossarySlug } from "../../../pf2e-automatic-ability-resolution/src/compiler/monster.js";
import { RULE_WORDS } from "./strikes.js";

const HEADINGS = /<p[^>]*>\s*<strong>\s*(?:Trigger|Frequency|Requirements?|Cost|Access|Prerequisites?)\s*<\/strong>[\s\S]*?<\/p>\s*(?:<hr\s*\/?>)?/gi;
const DAMAGE = /@Damage\[((?:[^[\]]|\[(?:[^[\]]|\[[^\]]*\])*\])*)\](?:\{([^}]*)\})?/g;
// Who: "an adjacent creature", "a willing living creature within 30 feet", "the triggering creature", "one ally", "the target".
const WHO = String.raw`(?:you or )?(?:an?|one|the|that|another|the triggering|the target|your)\s+(?:(?:adjacent|willing|living|other|triggering|target|chosen|dying)\s+)*(?:creature|ally|target)(?:\s+(?:adjacent to you|within (\d+) feet(?: of you)?|you (?:can see|touch)|in your reach))?`;
const PATTERNS = [
    // "An adjacent creature regains ⟦X⟧ Hit Points"
    new RegExp(String.raw`(?:^|\b)(${WHO}) (?:regains|recovers|is healed) (?:a number of )?⟦([^⟧]+)⟧ (?:Hit Points|HP)\b`, "i"),
    // "You restore ⟦X⟧ Hit Points to an adjacent creature" / "restore ⟦X⟧ Hit Points to it"
    new RegExp(String.raw`\b(?:restore|restores|heal|heals)\s+⟦([^⟧]+)⟧ (?:Hit Points|HP) to (${WHO}|it|them)\b`, "i")
];

export function otherHeal(item) {
    const type = item?.system?.actionType?.value;
    if (!["action", "reaction", "free"].includes(type)) return null;
    const html = String(item.system?.description?.value ?? "").replace(HEADINGS, "");
    if (/@Check\[|@Template\[|<strong>\s*(?:Critical Success|Success|Failure)\s*<\/strong>/i.test(html)) return null;
    const tags = [...html.matchAll(DAMAGE)];
    if (tags.length !== 1 || !/\[[^\]]*healing[^\]]*\]/i.test(tags[0][1])) return null;
    const formula = readDamage(tags[0][1]).replace(/\[(?:healing|vitality|,)+\]/gi, "").replace(/^\((.*)\)$/, "$1").replace(/\s+/g, "");
    if (/@/.test(formula)) return null;
    const plain = htmlToPlainText(html.replace(DAMAGE, "⟦X⟧ Hit Points").replace(/⟦X⟧ Hit Points\s*(?:Hit Points|HP)\b/g, "⟦X⟧ Hit Points").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1")).replace(/\s+/g, " ").trim();
    const sentences = plain.split(/(?<=[.!?])\s+(?=[A-Z⟦])/);
    let who = null;
    let at = -1;
    for (const [index, sentence] of sentences.entries()) {
        // (Healing only later or only sometimes: "At the start of your next turn, the creature regains …", Cocoon's "If the cocoon survives …".)
        if (/^(?:If|When|Whenever|At|After|Once|Until)\b/i.test(sentence) || /^If\b/i.test(sentences[index - 1] ?? "")) continue;
        const first = PATTERNS[0].exec(sentence);
        const second = first ? null : PATTERNS[1].exec(sentence);
        if (first) who = first[1];
        else if (second) who = second[2];
        if (who) {
            at = index;
            break;
        }
    }
    if (!who || /\b(?:all|each|every)\b/i.test(who)) return null;
    // ("restore … to it", after "the creature" in the same sentence or the one before.)
    if (/^(?:it|them)$/i.test(who) && !/\b(?:creature|ally|target)\b/i.test(sentences.slice(Math.max(0, at - 1), at + 1).join(" "))) return null;
    if (/\bStrikes?\b|\bStride\b|\bCast a Spell\b/.test(plain)) return null;
    const within = Number(/\bwithin (\d+) feet\b/i.exec(who)?.[1]) || null;
    const range = within ? `${within} feet` : /\badjacent\b|\btouch|\breach\b/i.test(who) ? "touch" : null;
    // (The rest of the healing sentence, "… and reduces their Drained, Clumsy … conditions by 1": a note.)
    const rest = /\b(?:Hit Points|HP)\b(?:\s+to (?:it|them|[^,.]+?))?\s*(?:,\s*)?(?:and|but)\s+(.+)$/i.exec(sentences[at])?.[1];
    const notes = [...(rest ? [`It also ${rest.replace(/\.$/, "")}.`] : []), ...sentences.filter((sentence, index) => index !== at && RULE_WORDS.test(sentence))];
    const none = () => ({ damage: { mode: "none", multiplier: 0, sourceComponentIds: [] }, effects: [] });
    const traits = item.system?.traits?.value ?? [];
    return {
        modelVersion: 13,
        source: { name: item.name, slug: glossarySlug(item), uuid: item.uuid ?? null, type: item.type ?? "feat" },
        rank: 1,
        traits: [...traits],
        activation: { time: ["reaction", "free"].includes(type) ? type : String(item.system?.actions?.value ?? 1), traits: [...traits] },
        automation: { level: "automatic" },
        targeting: { target: /\bally\b/i.test(who) ? "1 ally" : "1 creature", range, area: null },
        trigger: { event: "use" },
        resolution: { kind: "check", check: { roll: "automatic", statistic: "automatic" }, sharedDamage: null, outcomes: { criticalSuccess: none(), success: { ...none(), effects: [{ kind: "heal", formula }] }, failure: none(), criticalFailure: none() } },
        ...(/^you or\b/i.test(who) ? { notes: ["You can heal yourself instead: target your own token.", ...notes] } : notes.length ? { notes } : {})
    };
}

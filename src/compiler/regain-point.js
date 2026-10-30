// An action that gives back a Focus Point or a Mythic Point (2026-10-30, the loop): "You regain 1 Focus Point, up to your usual maximum"
// (Energized Font, Well of Potential), "You regain 1 Mythic Point" (Summon Mythic Power, Mythic Echo). The card adds the point to the
// character's pool, never past its maximum (scripts/main.js). Only when regaining it is the whole of what the feat does: its last
// sentence, nothing rolled; what comes with it in the same sentence or after ("and then increase … doomed", "You can spend this focus
// point only …") is a note. Pure.

const HEADINGS = /<p[^>]*>\s*<strong>\s*(?:Trigger|Frequency|Requirements?|Cost|Prerequisites?|Access)\s*<\/strong>[\s\S]*?<\/p>\s*(?:<hr\s*\/?>)?/gi;
const plainOf = (html) => String(html ?? "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1")
    .replace(/<strong>\s*Effect\s*<\/strong>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const REGAIN = /^(?:(You [^.]*?) and |[Yy]ou )(?:instantly |immediately )?regain (1|one|2|two) (Focus|Mythic) Points?(?:, up to your usual maximum)?(?: and (?:then )?([^.]+))?\.$/;
const NUMBER = { 1: 1, one: 1, 2: 2, two: 2 };

// → { builtin: "regain-point", resource: "focus" | "mythic", value, notes } or null.
export function regainPoint(item) {
    const type = item?.system?.actionType?.value;
    if (!["action", "reaction", "free"].includes(type) || item?.system?.selfEffect) return null;
    const html = String(item?.system?.description?.value ?? "").replace(HEADINGS, "");
    if (/@(?:Check|Damage|Template)\[/.test(html)) return null;
    const sentences = plainOf(html).split(/(?<=[.!?])\s+(?=[A-Z])/);
    const at = sentences.findIndex((sentence) => REGAIN.test(sentence));
    if (at < 0) return null;
    // (Only an action that does this, not "When an enemy triggers your champion's reaction, you regain …", Retributive Focus.)
    const [, before, count, pool, then] = REGAIN.exec(sentences[at]);
    const after = sentences.slice(at + 1);
    // (A later sentence that is a rule of its own, "Special …", "You can spend …": a note. A later "When"/"If": the point comes only
    // sometimes; not read.)
    if (after.some((sentence) => /^(?:When|Whenever|If|While|At|After|Until)\b/.test(sentence))) return null;
    const notes = [...(before ? [`First: ${before}.`] : []), ...(then ? [`Then ${then}.`] : []), ...after];
    return { builtin: "regain-point", resource: pool.toLowerCase(), value: NUMBER[count.toLowerCase()], notes };
}

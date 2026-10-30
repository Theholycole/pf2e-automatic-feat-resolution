// A feat that is a spell (2026-10-30, Cole's choice: "Spell-like feats"): "This has the effects of a 2nd-rank Web spell using your class
// DC or spell DC, whichever is higher" (Webslinger), "You cast Enlarge" (Ka Stone Ritual). The spell module casts it through PF2e at the
// feat's rank and the character's DC (its api.castFromItem, scripts/main.js), so the spell's own card resolves it. Only actions,
// reactions and free actions: a passive's "you cast" changes another casting.

const SPELL = /@UUID\[(Compendium\.[\w-]+\.spells[\w-]*\.Item\.[^\]]+)\](?:\{([^}]*)\})?/;
const RANK = /\b(\d+)(?:st|nd|rd|th)-rank\s*$/i;
const plainOf = (html) => String(html ?? "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const finite = (value) => (Number.isFinite(Number(value)) && value !== null && value !== "" ? Number(value) : null);

// → { builtin: "spell-like", spell: { uuid, name }, rank, actions, dc, notes } or null.
export function spellLike(item, dcs) {
    const type = item?.system?.actionType?.value;
    // (PF2e's own Use button, its Effect, stays: 2026-10-30.)
    if (!["action", "reaction", "free"].includes(type) || item?.system?.selfEffect) return null;
    // (Not its trigger or requirements, "You cast Spellsurge", "You have cast Summon Undead this turn": what it does.)
    const html = String(item?.system?.description?.value ?? "").replace(/<p>\s*<strong>\s*(?:Trigger|Requirements?|Prerequisites?)\s*<\/strong>[\s\S]*?<\/p>/gi, "");
    // The sentence that names the spell as what the feat does.
    const lead = /(?:\b(?:has|have|gain|gains|get|with) the effects? of|\b[Yy]ou (?:can )?cast)\s+(?:(?:a|an|the|either a|one)\s+)?((?:the\s+)?(?:\d+-action version of\s+)?(?:(?:\d+)(?:st|nd|rd|th)-rank\s+)?)@UUID\[/;
    const found = lead.exec(html);
    if (!found) return null;
    const at = found.index + found[0].length - "@UUID[".length;
    const spell = SPELL.exec(html.slice(at));
    if (!spell) return null;
    // (Only when the sentence is what the feat does: not "when one of you casts …" or "If you succeed, … the effects of Raise Dead" after a
    // check, nor a spell it can cast "at will" for a while.)
    const sentenceStart = Math.max(html.lastIndexOf(". ", found.index), html.lastIndexOf(">", found.index)) + 1;
    const sentence = plainOf(html.slice(sentenceStart, html.slice(at + spell[0].length).search(/[.!](?:\s|<|$)/) + at + spell[0].length + 1));
    if (/^\s*(?:When|Whenever|If|While|Until|After)\b/i.test(sentence) || /\bat will\b/i.test(sentence) || /@Check\[|\bAttempt an? [\w ]*check\b/i.test(html.slice(0, at))) return null;
    const uuid = spell[1];
    const name = spell[2] ?? uuid.split(".").at(-1);
    // Two spells offered ("either … or …"): the player's choice, not the card's.
    const rest = html.slice(at + spell[0].length, at + spell[0].length + 40);
    if (/^\s*(?:spell\s+)?(?:or|,)\s*(?:a\s+|an\s+|the\s+|\d+(?:st|nd|rd|th)-rank\s+)*@UUID\[[^\]]*spells/i.test(rest)) return null;
    const words = found[1] ?? "";
    let rank = finite(RANK.exec(words.trim())?.[1]);
    const after = plainOf(html.slice(at));
    if (rank === null && /heightened to (?:a rank equal to )?half your level(?:,)? rounded up/i.test(after)) rank = Math.max(1, Math.ceil((Number(dcs?.level) || 1) / 2));
    const actions = finite(/(\d)-action version/i.exec(words)?.[1]);
    // The DC it names; otherwise the character's best of class and spell DC (an innate spell from a feat).
    const best = [dcs?.class, dcs?.spell].map(finite).filter((value) => value !== null);
    let dc = null;
    let dcNote = null;
    if (/class (?:DC )?or spell DC,? whichever is higher|spell (?:DC )?or class DC,? whichever is higher|higher of your class (?:DC )?(?:or|and) spell DC/i.test(after)) dc = best.length ? Math.max(...best) : null;
    else if (/\byour class DC\b/i.test(after)) dc = finite(dcs?.class);
    else if (/\byour spell DC\b/i.test(after)) dc = finite(dcs?.spell);
    if (dc === null && best.length) {
        dc = Math.max(...best);
        dcNote = "The feat names no DC: the card uses your class DC or spell DC, whichever is higher.";
    }
    return {
        builtin: "spell-like",
        source: { name: item.name, type: item.type ?? "feat" },
        spell: { uuid, name },
        rank,
        actions,
        dc,
        notes: [`Cast as ${name}${rank ? ` at rank ${rank}` : ""}${dc ? `, DC ${dc}` : ""}.`, ...(dcNote ? [dcNote] : [])]
    };
}

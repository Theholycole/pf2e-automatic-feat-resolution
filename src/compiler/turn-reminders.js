// A reaction or free action triggered by the character's own turn starting or ending (2026-10-30, docs/feats.md, slice 6): "Your turn
// begins.", "Your turn ends.", "You start your turn with the Frightened condition.", "Your turn begins, and you're Grabbed or Restrained."
// PF2e has no roll at that moment to put a note on, so the module reminds the character's players when it comes (scripts/reminders.js).

const plainOf = (html) => String(html ?? "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const CONDITIONS = ["blinded", "clumsy", "confused", "controlled", "dazzled", "deafened", "drained", "dying", "encumbered", "enfeebled", "fascinated", "fatigued", "fleeing", "frightened", "grabbed", "immobilized", "paralyzed", "persistent-damage", "petrified", "prone", "quickened", "restrained", "sickened", "slowed", "stunned", "stupefied", "unconscious", "wounded", "doomed"];

// The conditions a start-of-turn trigger needs the character to have ("with the Frightened condition", "you're Grabbed or Restrained").
function havingOf(trigger) {
    if (/\bnot\b|\bno longer\b|\bwithout\b/i.test(trigger)) return {};
    const words = [...trigger.toLowerCase().matchAll(/[a-z-]+/g)].map((match) => match[0]).filter((word) => CONDITIONS.includes(word));
    return words.length ? { having: [...new Set(words)] } : {};
}

// → { when: "start" | "end", trigger, kind: "reaction" | "free action" }, or null.
export function turnTrigger(item) {
    const type = item?.system?.actionType?.value;
    if (!["reaction", "free"].includes(type)) return null;
    const found = /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(String(item?.system?.description?.value ?? ""));
    if (!found) return null;
    const trigger = plainOf(found[1]).replace(/([^.])$/, "$1.");
    const kind = type === "reaction" ? "reaction" : "free action";
    // (2026-10-30 Foundry test: "You start your turn with the Frightened condition", "…, and you're Grabbed or Restrained" — only while
    // it has one of them: having.)
    if (/^(?:Your turn (?:begins|starts)|You (?:start|begin) your turn|The start of your turn)\b/i.test(trigger)) return { when: "start", trigger, kind, ...havingOf(trigger) };
    if (/^(?:Your turn ends|You end your turn|The end of your turn)\b/i.test(trigger)) return { when: "end", trigger, kind };
    return null;
}

// A character's items → the ones to remind of at the start or end of its turn.
// has(slug): whether the character has that condition now (Mask of Fear only while Frightened).
export function turnReminders(items, when, has = () => true) {
    return [...(items ?? [])].map((item) => ({ item, read: turnTrigger(item) })).filter(({ read }) => read?.when === when && (!read.having || read.having.some((slug) => has(slug))));
}

// A reaction or free action triggered by the character's own turn starting or ending (2026-10-30, docs/feats.md, slice 6): "Your turn
// begins.", "Your turn ends.", "You start your turn with the Frightened condition.", "Your turn begins, and you're Grabbed or Restrained."
// PF2e has no roll at that moment to put a note on, so the module reminds the character's players when it comes (scripts/reminders.js).

const plainOf = (html) => String(html ?? "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// → { when: "start" | "end", trigger, kind: "reaction" | "free action" }, or null.
export function turnTrigger(item) {
    const type = item?.system?.actionType?.value;
    if (!["reaction", "free"].includes(type)) return null;
    const found = /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(String(item?.system?.description?.value ?? ""));
    if (!found) return null;
    const trigger = plainOf(found[1]).replace(/([^.])$/, "$1.");
    const kind = type === "reaction" ? "reaction" : "free action";
    if (/^(?:Your turn (?:begins|starts)|You (?:start|begin) your turn|The start of your turn)\b/i.test(trigger)) return { when: "start", trigger, kind };
    if (/^(?:Your turn ends|You end your turn|The end of your turn)\b/i.test(trigger)) return { when: "end", trigger, kind };
    return null;
}

// A character's items → the ones to remind of at the start or end of its turn.
export function turnReminders(items, when) {
    return [...(items ?? [])].map((item) => ({ item, read: turnTrigger(item) })).filter(({ read }) => read?.when === when);
}

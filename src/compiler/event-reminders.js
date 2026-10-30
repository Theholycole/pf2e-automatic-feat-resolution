// A reaction or free action triggered by what others do to the character or an ally nearby (2026-10-30, docs/feats.md, slice 7): "A
// creature hits you with a melee Strike.", "You are targeted by an attack.", "While you have your shield raised, you would take damage
// from a physical attack.", "An ally within 30 feet is hit by an attack." The character's players can't watch every roll for these, so
// when PF2e posts the attack or the damage aimed at the character (or an ally in range), the module whispers them the feats they may use
// (scripts/reminders.js). Nothing is used for them; the player decides, and the trigger's other words are theirs to judge.

const plainOf = (html) => String(html ?? "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// → { event: "critical-hit" | "hit" | "targeted" | "damaged" | "ally-hit" | "ally-targeted" | "ally-damaged", within, trigger, kind }, or null.
export function eventTrigger(item) {
    const type = item?.system?.actionType?.value;
    if (!["reaction", "free"].includes(type)) return null;
    const found = /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(String(item?.system?.description?.value ?? ""));
    if (!found) return null;
    const trigger = plainOf(found[1]).replace(/([^.])$/, "$1.");
    const kind = type === "reaction" ? "reaction" : "free action";
    const within = Number(/\bwithin (\d+) feet\b/i.exec(trigger)?.[1]) || (/\badjacent\b/i.test(trigger) ? 5 : null);
    const read = (event) => ({ event, within, trigger, kind });
    // (A save's effect, "targeted by a spell … that allows a saving throw": no attack roll to watch.)
    if (/\b(?:requires|allows) a (?:save|saving throw)\b/i.test(trigger)) return null;
    const ally = /\b(?:an|your|one of your|a) (?:adjacent )?all(?:y|ies)\b|\bally you can see\b/i.test(trigger);
    if (ally) {
        if (/\b(?:is|are) (?:critically )?hit\b|\bhits (?:an|your|the) ally\b/i.test(trigger)) return read("ally-hit");
        if (/\b(?:takes?|would take) damage\b|\bis damaged\b|\bdamages (?:an|your|the) ally\b/i.test(trigger)) return read("ally-damaged");
        if (/\b(?:is|are) targeted\b|\btargets (?:an|your|the|one of your) all/i.test(trigger)) return read("ally-targeted");
        return null;
    }
    if (/\bcritically hits you\b|^You are critically hit\b/i.test(trigger)) return read("critical-hit");
    if (/\bhits you\b|^You are hit by\b/i.test(trigger)) return read("hit");
    if (/\btargets you\b|^You are (?:the )?target(?:ed)? (?:of|by)\b|\battempts? (?:a Strike|an attack(?: roll)?) against you\b|\battacks you\b|\bmakes an attack(?: roll)? against you\b/i.test(trigger)) return read("targeted");
    if (/(?:^|,\s*)You (?:or your [\w ]+? )?(?:would )?take damage\b|\bwould deal damage to you\b|\bdamages you\b|\bdeals damage to you\b/i.test(trigger) && !/\bfall(?:ing)? damage\b/i.test(trigger)) return read("damaged");
    return null;
}

// What PF2e's roll message means for a character it's aimed at: an attack roll → targeted, and hit / critical-hit by its degree; a
// damage roll → damaged.
export function eventsOf(contextType, outcome) {
    if (["attack-roll", "spell-attack-roll"].includes(contextType)) {
        return ["targeted", ...(["success", "criticalSuccess"].includes(outcome) ? ["hit"] : []), ...(outcome === "criticalSuccess" ? ["critical-hit"] : [])];
    }
    if (contextType === "damage-roll") return ["damaged"];
    return [];
}

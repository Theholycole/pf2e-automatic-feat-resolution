// A character's reaction or free action as the player uses it (2026-10-30, docs/feats.md, slice 3). PF2e writes a PC's reaction as
// "<p><strong>Trigger</strong> A creature … damages you with a melee Strike.</p><hr /><p>The attacker must succeed at …</p>", with no
// Effect heading, and the monster readings take a reaction only as "Trigger … Effect …" with a trigger they can watch. A character's
// reaction needs no watching: the player sees its trigger and uses it from the sheet, and the card follows. So its Trigger, Frequency and
// Requirements blocks (the player's to meet) are set aside, and its effect read as an action used then.

import { withText } from "./character-dcs.js";

const HEADING = /<p[^>]*>\s*<strong>\s*(Trigger|Frequency|Requirements?|Cost|Access)\s*<\/strong>([\s\S]*?)<\/p>\s*(?:<hr\s*\/?>)?/gi;

// { item: the item with its effect only and an action's type, trigger: its trigger's words } or null when there's nothing to set aside.
export function asUsed(item) {
    const type = item?.system?.actionType?.value;
    const html = item?.system?.description?.value;
    if (!["reaction", "free"].includes(type) || typeof html !== "string") return null;
    let trigger = null;
    const effect = html.replace(HEADING, (all, heading, text) => {
        if (/^trigger$/i.test(heading)) trigger = text.replace(/<[^>]+>/g, "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/\s+/g, " ").trim();
        return "";
    }).replace(/^\s*(?:<hr\s*\/?>\s*)+/, "").replace(/<strong>\s*Effect\s*<\/strong>\s*/i, "");
    if (!trigger) return null;
    const used = withText(item, effect);
    const actionType = { ...item.system.actionType, value: "action" };
    const actions = { ...(item.system.actions ?? {}), value: 1 };
    const system = new Proxy(used.system, { get: (target, key) => (key === "actionType" ? actionType : key === "actions" ? actions : Reflect.get(target, key)) });
    return { item: new Proxy(used, { get: (target, key) => (key === "system" ? system : Reflect.get(target, key)) }), trigger, time: type };
}

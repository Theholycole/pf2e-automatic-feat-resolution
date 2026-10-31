// The Nonlethal Attacks Effect on and off (src/plans/nonlethal.js): the chat command /nonlethal for the speaker's token or character, or
// game.modules.get("pf2e-automatic-feat-resolution").api.toggleNonlethal(actor).

import { NONLETHAL_RULES } from "../src/plans/nonlethal.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const NAME = "Effect: Nonlethal Attacks";

const speakerActor = () => canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;

export async function toggleNonlethal(actor = speakerActor()) {
    if (!actor) {
        ui.notifications?.warn("Nonlethal attacks: select your token first.");
        return null;
    }
    const old = actor.items.filter((item) => item.type === "effect" && item.flags?.[MODULE_ID]?.nonlethal);
    if (old.length) {
        await actor.deleteEmbeddedDocuments("Item", old.map((item) => item.id));
        await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${NAME} ends on ${foundry.utils.escapeHTML(actor.name)}: its Strikes are lethal again.</p>` });
        return false;
    }
    await actor.createEmbeddedDocuments("Item", [{
        name: NAME,
        type: "effect",
        img: "icons/skills/melee/unarmed-punch-fist.webp",
        flags: { [MODULE_ID]: { nonlethal: true } },
        system: {
            description: { value: "<p>Your Strikes are nonlethal. A weapon without the nonlethal trait gains it, with a –2 circumstance penalty to the attack roll. Type <code>/nonlethal</code> again to end it.</p>" },
            duration: { value: -1, unit: "unlimited", expiry: null, sustained: false },
            rules: foundry.utils.deepClone(NONLETHAL_RULES),
            tokenIcon: { show: true },
            level: { value: Number(actor.level) || 1 }
        }
    }]);
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${NAME} on ${foundry.utils.escapeHTML(actor.name)}: its Strikes are nonlethal.</p>` });
    return true;
}

// Nonlethal damage that brings a creature to 0 HP knocks it out instead (Cole's call, 2026-10-31): PF2e 8.6's applyDamage never checks for
// nonlethal, and marks it defeated as for lethal damage. After PF2e applies it: no dying, no defeated or dead mark it didn't have, and
// unconscious, as the environment module does for nonlethal falls (its scripts/foundry.js nonlethalDamage).
const NONLETHAL_OPTIONS = ["nonlethal", "item:trait:nonlethal", "damage:trait:nonlethal"];

export function isNonlethal(options = {}) {
    const sets = [options.rollOptions, options.damage?.options?.rollOptions];
    return sets.some((set) => set && NONLETHAL_OPTIONS.some((option) => (typeof set.has === "function" ? set.has(option) : Array.isArray(set) && set.includes(option))));
}

function wrapApplyDamage() {
    let proto = CONFIG.PF2E?.Actor?.documentClasses?.character?.prototype;
    while (proto && !Object.hasOwn(proto, "applyDamage")) proto = Object.getPrototypeOf(proto);
    if (!proto) return console.warn(`${MODULE_ID} | PF2e's actors have no applyDamage; nonlethal knock-outs are off.`);
    const original = proto.applyDamage;
    proto.applyDamage = async function (options = {}, ...rest) {
        const nonlethal = isNonlethal(options);
        const hp = () => Number(this.hitPoints?.value ?? this.system?.attributes?.hp?.value);
        const before = hp();
        const doc = options.token?.document ?? options.token ?? this.token ?? this.getActiveTokens?.(false, true)?.[0] ?? null;
        const defeated = Boolean(doc?.combatant?.isDefeated);
        const dead = Boolean(this.statuses?.has?.("dead"));
        const result = await original.call(this, options, ...rest);
        if (!nonlethal || !(before > 0) || hp() > 0) return result;
        try {
            for (const condition of (this.itemTypes?.condition ?? []).filter((entry) => entry.slug === "dying")) await condition.delete().catch(() => null);
            if (!defeated && doc?.combatant?.isDefeated) await doc.combatant.update({ defeated: false });
            if (!dead && this.statuses?.has?.("dead")) await this.toggleStatusEffect?.("dead", { active: false, overlay: true }).catch(() => null);
            if (!this.hasCondition?.("unconscious")) await this.increaseCondition?.("unconscious");
            await ChatMessage.create({ content: `<p>${foundry.utils.escapeHTML(this.name)} is knocked out by nonlethal damage: unconscious at 0 HP, not dying.</p>`, whisper: game.users.filter((user) => user.isGM).map((user) => user.id) });
        } catch (error) {
            console.warn(`${MODULE_ID} | nonlethal knock-out`, error);
        }
        return result;
    };
}

export function registerNonlethal() {
    Hooks.once("setup", wrapApplyDamage);
    Hooks.on("chatMessage", (_log, message) => {
        if (String(message ?? "").trim().toLowerCase() !== "/nonlethal") return true;
        toggleNonlethal();
        return false;
    });
}

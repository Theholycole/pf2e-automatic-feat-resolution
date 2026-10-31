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

export function registerNonlethal() {
    Hooks.on("chatMessage", (_log, message) => {
        if (String(message ?? "").trim().toLowerCase() !== "/nonlethal") return true;
        toggleNonlethal();
        return false;
    });
}

// Damage back on a creature that hits or grabs the character (round 57): src/plans/retaliation.js says which feats and when; this rolls
// the damage as PF2e posts the attack or maneuver, on the active GM's client, the attacker targeted on the card to apply it.

import { eventOf, retaliationsFor } from "../src/plans/retaliation.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const sourceOf = (item) => item?._stats?.compendiumSource ?? item?.sourceId ?? item?.flags?.core?.sourceId ?? null;
const turnKey = () => `${game.combat?.id ?? "none"}:${game.combat?.round ?? 0}:${game.combat?.turn ?? 0}`;
const once = new Set();
const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

async function onMessage(message) {
    if (!game.users?.activeGM?.isSelf) return;
    const context = message.flags?.pf2e?.context;
    const event = eventOf(context);
    if (!event || !context?.target) return;
    const targetToken = context.target.token ? fromUuidSync(context.target.token) : null;
    const defender = targetToken?.actor ?? (context.target.actor ? fromUuidSync(context.target.actor) : null);
    const attackerToken = message.token ?? null;
    const attacker = message.actor ?? attackerToken?.actor ?? null;
    if (defender?.type !== "character" || !attacker || attacker === defender) return;
    const distance = targetToken?.object && attackerToken?.object && canvas?.grid ? canvas.grid.measurePath([targetToken.object.center, attackerToken.object.center]).distance : null;
    const due = retaliationsFor(defender.items, sourceOf, defender.getRollOptions?.(["all"]) ?? [], event, distance);
    const DamageRoll = CONFIG.Dice.rolls.find((roll) => roll.name === "DamageRoll");
    if (!DamageRoll) return;
    for (const entry of due) {
        const key = `${entry.uuid}:${defender.uuid}:${attacker.uuid}:${turnKey()}`;
        if (entry.oncePerTurn && once.has(key)) continue;
        once.add(key);
        const formula = Roll.replaceFormulaData(entry.formula, defender.getRollData?.() ?? {});
        const roll = new DamageRoll(`(${formula})[${entry.type}]`);
        await roll.evaluate();
        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: defender, token: targetToken ?? undefined }),
            flavor: `<strong>${escape(entry.name)}</strong>: ${escape(attacker.name)} takes this damage. Select its token and apply.${entry.note ? ` ${escape(entry.note)}` : ""}`,
            flags: { [MODULE_ID]: { retaliation: entry.uuid }, pf2e: { context: { type: "damage-roll", actor: defender.uuid, ...(attackerToken ? { target: { actor: attacker.uuid, token: attackerToken.uuid } } : {}) } } }
        });
    }
}

export function registerRetaliation() {
    Hooks.on("createChatMessage", (message) => onMessage(message).catch((error) => console.error(`${MODULE_ID} | retaliation`, error)));
}

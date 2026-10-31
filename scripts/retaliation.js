// Damage back on a creature that hits or grabs the character (round 57): src/plans/retaliation.js says which feats and when; this rolls
// the damage as PF2e posts the attack or maneuver, on the active GM's client, the attacker targeted on the card to apply it.

import { effectRules, eventOf, retaliationsFor } from "../src/plans/retaliation.js";
import { applyFeatEffect } from "./effects.js";

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
        // (Ambersoul's sap: an Effect on the attacker, as a who "target" feat's; round 81.)
        if (entry.effect) {
            const item = defender.items.find((each) => sourceOf(each) === entry.uuid);
            if (item) await applyFeatEffect(item, { builtin: "feat-effect", who: "target", effect: { name: entry.name, rules: effectRules(entry, event.options), duration: entry.effect.duration, stance: false }, notes: [], ownTurn: true }, [attacker]);
            continue;
        }
        if (entry.save) { await postSave(entry, defender, targetToken, attacker, attackerToken); continue; }
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

// The character's class DC: its class's, else the highest of its other class DCs (an archetype's or an effect's; round 58 Foundry test).
function classDC(actor) {
    const own = actor.classDC?.dc?.value;
    if (Number.isFinite(own)) return own;
    const all = Object.values(actor.classDCs ?? {}).map((statistic) => statistic?.dc?.value).filter(Number.isFinite);
    return all.length ? Math.max(...all) : actor.system?.attributes?.classDC?.value;
}

// The attacker's save, as a chat card with PF2e's own save button and the outcomes as text.
async function postSave(entry, defender, defenderToken, attacker, attackerToken) {
    const base = entry.save.dc === "spell" ? defender.spellcasting?.base?.dc?.value ?? defender.attributes?.spellDC?.value : classDC(defender);
    if (!Number.isFinite(base)) return;
    const options = defender.getRollOptions?.(["all"]) ?? [];
    const dc = base + (entry.save.harder && options.includes(entry.save.harder.option) ? entry.save.harder.by : 0);
    const traits = entry.save.traits?.length ? `|traits:${entry.save.traits.join(",")}` : "";
    const content = `<p><strong>${escape(entry.name)}</strong>: ${escape(attacker.name)} attempts @Check[${entry.save.statistic}|dc:${dc}${traits}|name:${escape(entry.name)}].</p><p>${entry.save.text}</p>`;
    const TextEditor = foundry.applications?.ux?.TextEditor?.implementation ?? globalThis.TextEditor;
    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: defender, token: defenderToken ?? undefined }),
        content: await TextEditor.enrichHTML(content, { rollData: defender.getRollData?.() ?? {} }),
        flags: { [MODULE_ID]: { retaliation: entry.uuid } }
    });
}

export function registerRetaliation() {
    Hooks.on("createChatMessage", (message) => onMessage(message).catch((error) => console.error(`${MODULE_ID} | retaliation`, error)));
}

// Player reactions offered as their trigger happens (round 106, src/plans/offers.js): on the active GM's client, a PF2e roll message that sets
// off a character's reaction whispers its owners (and the GM) a card with a button that does the reaction's effect: a check at a DC from the
// trigger, the same action against the same target, temporary Hit Points or an Effect. The player decides whether to use it.

import { REACTION_OFFERS, afterStrikeOf, effectRulesFor, levelDC, offerFits, offerOf, rollOf, tempHPFrom, withD20 } from "../src/plans/offers.js";
import { applyFeatEffect } from "./effects.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const FLAG = "offer";
const sourceOf = (item) => item?._stats?.compendiumSource ?? item?.sourceId ?? item?.flags?.core?.sourceId ?? null;
const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
const UUIDS = new Set(REACTION_OFFERS.map((entry) => entry.uuid));
const offersOf = (actor) => [...(actor?.itemTypes?.feat ?? []), ...(actor?.itemTypes?.action ?? [])].filter((item) => UUIDS.has(sourceOf(item))).map((item) => ({ item, entry: offerOf(sourceOf(item)) }));
const distance = (a, b) => (a && b && canvas?.grid ? canvas.grid.measurePath([a.center, b.center]).distance : null);
// (Edge to edge, a Large token's.)
const edgeDistance = (a, b) => {
    const centers = distance(a, b);
    if (centers === null) return null;
    const sizes = ((Math.max(a.document.width, 1) - 1) + (Math.max(b.document.width, 1) - 1)) / 2;
    return Math.max(0, centers - sizes * canvas.grid.distance);
};
const reachOf = (actor) => Number(actor?.getReach?.({ action: "attack" })) || 5;

// Damage by type in a PF2e damage roll message: { mental: 7, … }.
function damageTotals(message) {
    const totals = {};
    for (const roll of message.rolls ?? []) for (const instance of roll.instances ?? []) totals[instance.type] = (totals[instance.type] ?? 0) + (Number(instance.total) || 0);
    return totals;
}

// Each character's last Strike, on the active GM's client: { target, outcome, damage, at } (round 108).
const lastStrikes = new Map();
function noteStrike(message, context) {
    const actor = message.actor;
    if (actor?.type !== "character") return;
    const strike = (context.options ?? []).includes("action:strike") || (context.domains ?? []).some((domain) => /strike/.test(domain));
    if (context.type === "attack-roll" && strike) lastStrikes.set(actor.uuid, { target: context.target?.token ?? context.target?.actor ?? null, outcome: context.outcome ?? null, damage: null, at: Date.now() });
    if (context.type === "damage-roll" && strike) {
        const last = lastStrikes.get(actor.uuid);
        if (last) last.damage = Number(message.rolls?.[0]?.total) || 0;
    }
}

// A feat posted that follows its last Strike: its card, or false when it isn't one.
export async function afterStrikeCard(item) {
    const entry = afterStrikeOf(sourceOf(item));
    const actor = item?.actor;
    if (!entry || actor?.type !== "character") return false;
    const last = lastStrikes.get(actor.uuid);
    const owners = game.users.filter((user) => user.isGM || actor.testUserPermission(user, "OWNER")).map((user) => user.id);
    const say = (content) => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), whisper: owners, content });
    if (!last || !entry.needs.includes(last.outcome)) {
        await say(`<p><strong>${escape(item.name)}</strong>: ${escape(actor.name)}'s last Strike ${last ? "didn't hit" : "wasn't found"}.</p>`);
        return true;
    }
    const targetDoc = last.target ? fromUuidSync(last.target) : null;
    const target = targetDoc?.actor ?? targetDoc ?? null;
    const notes = (entry.notes ?? []).map((note) => `<p>${escape(note)}</p>`).join("");
    const roll = { roll: "after-strike", damage: last.damage, outcome: last.outcome };
    let buttons;
    if (entry.does.kind === "heal-half") {
        if (!last.damage) {
            await say(`<p><strong>${escape(item.name)}</strong>: roll the Strike's damage first.</p>`);
            return true;
        }
        buttons = `<button type="button" data-action="${MODULE_ID}-offer">Regain ${Math.floor(last.damage / 2)} Hit Points</button>`;
    } else buttons = entry.does.actions.map((action) => `<button type="button" data-action="${MODULE_ID}-offer" data-choice="${action}">${action[0].toUpperCase()}${action.slice(1)}${target ? ` ${escape(target.name)}` : ""}</button>`).join(" ");
    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        whisper: owners,
        content: `<p><strong>${escape(actor.name)}</strong>: ${escape(item.name)} after your Strike${target ? ` on ${escape(target.name)}` : ""}${last.damage ? ` (${last.damage} damage)` : ""}.</p>${notes}<p>${buttons}</p>`,
        flags: { [MODULE_ID]: { [FLAG]: { actor: actor.uuid, item: item.uuid, roll, target: targetDoc?.uuid ?? null, after: true } } }
    });
    return true;
}

export async function onOfferMessage(message) {
    const context = message.flags?.pf2e?.context;
    if (context?.type) noteStrike(message, context);
    if (!context?.type || !["skill-check", "damage-roll", "attack-roll"].includes(context.type)) return;
    const roll = rollOf(context, context.type === "damage-roll" ? damageTotals(message) : null);
    // (The roll itself, for a d20 in its place or its damage again: its message, total and d20.)
    const first = message.rolls?.[0];
    Object.assign(roll, { message: message.id, total: Number(first?.total) || 0, die: Number(first?.dice?.find((die) => die.faces === 20)?.total) || null });
    const roller = message.actor ?? null;
    const rollerToken = message.token?.object ?? roller?.getActiveTokens?.(true)[0] ?? null;
    const targetDoc = context.target?.token ? fromUuidSync(context.target.token) : null;
    const target = targetDoc?.actor ?? (context.target?.actor ? fromUuidSync(context.target.actor) : null);
    if (!roller) return;
    const tokens = canvas?.tokens?.placeables ?? [];
    const characters = new Map();
    for (const token of tokens) if (token.actor?.type === "character" && !characters.has(token.actor)) characters.set(token.actor, token);
    if (roller.type === "character" && !characters.has(roller)) characters.set(roller, rollerToken);
    for (const [actor, token] of characters) {
        const self = actor === roller;
        const allied = !self && Boolean(token && rollerToken) && token.document.disposition === rollerToken.document.disposition;
        const who = self ? "self" : allied ? "ally" : "other";
        const untrainedIn = (skill) => Number(actor.skills?.[skill]?.rank ?? 0) === 0;
        const inReach = !token || !rollerToken ? false : (edgeDistance(token, rollerToken) ?? Infinity) <= reachOf(actor);
        for (const { item, entry } of offersOf(actor)) {
            if (!offerFits(entry, roll, { who, untrainedIn, hasTarget: Boolean(target), inReach })) continue;
            await postOffer({ actor, item, entry, roll, roller, target, targetDoc });
        }
    }
}

function triggerWords(entry, roll, roller, actor, target) {
    const whose = roller === actor ? "Your" : `${escape(roller.name)}'s`;
    if (roll.roll === "damage-roll") return entry.on.damageType ? `${whose} damage roll has ${roll.damage[entry.on.damageType]} ${entry.on.damageType} damage.` : `${whose} ${roll.ranged ? "ranged " : ""}damage roll is ${roll.total}.`;
    if (roll.roll === "attack-roll") return `${whose} ${roll.ranged ? "ranged " : ""}attack${target ? ` on ${escape(target.name)}` : ""} ${roll.outcome === "criticalFailure" ? "critically misses" : roll.outcome === "failure" ? "misses" : roll.outcome === "criticalSuccess" ? "critically hits" : "hits"} (${roll.total}${roll.dc ? ` against ${roll.dc}` : ""}).`;
    const degree = { criticalSuccess: "critically succeeds", success: "succeeds", failure: "fails", criticalFailure: "critically fails" }[roll.outcome] ?? roll.outcome;
    const skill = roll.skill ? roll.skill[0].toUpperCase() + roll.skill.slice(1) : "skill";
    return `${whose} ${skill} check${roll.action ? ` (${roll.action.replace(/-/g, " ")})` : ""}${target ? ` against ${escape(target.name)}` : ""} ${degree}.`;
}

function buttonLabel(entry, roll, target) {
    const does = entry.does;
    if (does.kind === "check") {
        const dc = does.dc === "trigger" ? roll.dc : levelDC(target?.level);
        return `Roll ${does.statistic[0].toUpperCase()}${does.statistic.slice(1)}${dc ? ` (DC ${dc})` : ""}`;
    }
    if (does.kind === "same-action") return `${(roll.action ?? "Action").replace(/-/g, " ").replace(/^./, (letter) => letter.toUpperCase())} ${escape(target?.name ?? "")}`.trim();
    if (does.kind === "temp-hp") return `Gain ${tempHPFrom(entry, roll)} temporary Hit Points`;
    if (does.kind === "replace-d20") return "Roll a d20 for it";
    if (does.kind === "reroll-damage") return "Roll the damage again";
    return "Use it";
}

async function postOffer({ actor, item, entry, roll, roller, target, targetDoc }) {
    const owners = game.users.filter((user) => user.isGM || actor.testUserPermission(user, "OWNER")).map((user) => user.id);
    const notes = (entry.notes ?? []).map((note) => `<p>${escape(note)}</p>`).join("");
    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        whisper: owners,
        content: `<p><strong>${escape(actor.name)}</strong>: ${triggerWords(entry, roll, roller, actor, target)} You can use @UUID[${item.uuid}]{${escape(item.name)}} (reaction).</p>${notes}<p><button type="button" data-action="${MODULE_ID}-offer">${buttonLabel(entry, roll, target)}</button></p>`,
        flags: { [MODULE_ID]: { [FLAG]: { actor: actor.uuid, item: item.uuid, roll, target: targetDoc?.uuid ?? target?.uuid ?? null } } }
    });
}

async function use(message, choice = null) {
    const data = message.flags[MODULE_ID][FLAG];
    const actor = fromUuidSync(data.actor);
    const item = await fromUuid(data.item);
    const entry = data.after ? afterStrikeOf(sourceOf(item)) : offerOf(sourceOf(item));
    if (!actor?.isOwner || !item || !entry) return;
    const roll = data.roll;
    const targetDoc = data.target ? fromUuidSync(data.target) : null;
    const target = targetDoc?.actor ?? targetDoc ?? null;
    const does = entry.does;
    if (does.kind === "heal-half") {
        const amount = Math.floor((Number(roll.damage) || 0) / 2);
        const hp = actor.system?.attributes?.hp;
        const before = Number(hp?.value) || 0;
        const next = Math.min(Number(hp?.max) || Infinity, before + amount);
        await actor.update({ "system.attributes.hp.value": next });
        return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${escape(item.name)}</strong>: ${escape(actor.name)} regains ${next - before} Hit Points (half of ${roll.damage}).</p>` });
    }
    if (does.kind === "check") {
        const dc = does.dc === "trigger" ? roll.dc : levelDC(target?.level);
        const statistic = actor.getStatistic?.(does.statistic) ?? actor.skills?.[does.statistic];
        return statistic?.roll({ ...(dc ? { dc: { value: dc } } : {}), extraRollOptions: [`origin:item:slug:${item.slug}`], label: `${item.name}: ${statistic.label}` });
    }
    if (does.kind === "choose-action") roll.action = choice;
    if (does.kind === "same-action" || does.kind === "choose-action") {
        // (The triggering target, targeted for this user, as PF2e's action reads the user's targets.)
        const token = targetDoc?.object ?? null;
        if (token) token.setTarget(true, { releaseOthers: true, groupSelection: false });
        const action = game.pf2e?.actions?.get?.(roll.action) ?? game.pf2e?.actions?.[roll.action];
        if (typeof action?.use === "function") return action.use({ actors: [actor] });
        if (typeof action === "function") return action({ actors: [actor] });
        return ui.notifications.warn(`${item.name}: PF2e's ${roll.action} wasn't found.`);
    }
    if (does.kind === "temp-hp") {
        const amount = tempHPFrom(entry, roll);
        const current = Number(actor.system?.attributes?.hp?.temp) || 0;
        if (amount > current) await actor.update({ "system.attributes.hp.temp": amount });
        return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${escape(item.name)}</strong>: ${escape(actor.name)} ${amount > current ? `gains ${amount} temporary Hit Points` : `keeps its ${current} temporary Hit Points (more than ${amount})`}.</p>${(entry.notes ?? []).map((note) => `<p>${escape(note)}</p>`).join("")}` });
    }
    if (does.kind === "replace-d20") {
        const d20 = await new Roll("1d20").evaluate();
        const result = withD20(roll.total, roll.die ?? 0, d20.total, roll.dc);
        const words = { criticalSuccess: "a critical hit", success: "a hit", failure: "a miss", criticalFailure: "a critical miss" }[result.degree] ?? "for the GM to compare";
        return d20.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `<strong>${escape(item.name)}</strong>: the ally's attack uses this d20 instead of its ${roll.die}: ${result.total}${roll.dc ? ` against ${roll.dc}` : ""}, ${words}.${(entry.notes ?? []).map((note) => `<br>${escape(note)}`).join("")}` });
    }
    if (does.kind === "reroll-damage") {
        const original = game.messages.get(roll.message)?.rolls?.[0];
        if (!original) return ui.notifications.warn(`${item.name}: the damage roll's message is gone.`);
        const again = await original.reroll();
        const higher = Math.max(Number(original.total) || 0, Number(again.total) || 0);
        return again.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `<strong>${escape(item.name)}</strong>: the damage again, ${again.total} (it was ${original.total}): keep ${higher}.` });
    }
    if (does.kind === "effect") {
        const rules = effectRulesFor(entry, roll);
        return applyFeatEffect(item, { builtin: "feat-effect", effect: { name: `${item.name}${roll.skill ? ` (${roll.skill})` : ""}`, rules, duration: does.duration, stance: false }, notes: entry.notes ?? [] });
    }
}

// (Used once: marked on the character, which its owner can change, not on the GM's whisper; round 106 Foundry test, the button stayed live.)
const USED = "offersUsed";
const usedOn = (actor, message) => Boolean(actor?.getFlag?.(MODULE_ID, USED)?.[message.id]);

function wire(message, html) {
    const data = message.flags?.[MODULE_ID]?.[FLAG];
    if (!data) return;
    const buttons = [...(html.querySelectorAll?.(`[data-action="${MODULE_ID}-offer"]`) ?? [])];
    if (!buttons.length) return;
    const actor = fromUuidSync(data.actor);
    if (usedOn(actor, message)) {
        for (const button of buttons) {
            button.disabled = true;
            button.textContent = `${button.textContent} (used)`;
        }
        return;
    }
    for (const button of buttons) button.addEventListener("click", async (event) => {
        event.preventDefault();
        if (button.disabled) return;
        for (const each of buttons) each.disabled = true;
        try {
            await use(message, button.dataset.choice ?? null);
            if (actor?.isOwner) await actor.setFlag(MODULE_ID, USED, { [message.id]: true });
            ui.chat?.updateMessage?.(message);
        } catch (error) { console.error(`${MODULE_ID} | reaction offer`, error); for (const each of buttons) each.disabled = false; }
    });
}

export function registerOffers() {
    Hooks.on("renderChatMessageHTML", (message, html) => wire(message, html));
}

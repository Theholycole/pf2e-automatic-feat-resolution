// Player reactions offered as their trigger happens (round 106, src/plans/offers.js): on the active GM's client, a PF2e roll message that sets
// off a character's reaction whispers its owners (and the GM) a card with a button that does the reaction's effect: a check at a DC from the
// trigger, the same action against the same target, temporary Hit Points or an Effect. The player decides whether to use it.

import { REACTION_OFFERS, effectRulesFor, levelDC, offerFits, offerOf, rollOf, tempHPFrom } from "../src/plans/offers.js";
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

export async function onOfferMessage(message) {
    const context = message.flags?.pf2e?.context;
    if (!context?.type || !["skill-check", "damage-roll"].includes(context.type)) return;
    const roll = rollOf(context, context.type === "damage-roll" ? damageTotals(message) : null);
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
    if (roll.roll === "damage-roll") return `${whose} damage roll has ${roll.damage[entry.on.damageType]} ${entry.on.damageType} damage.`;
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

async function use(message) {
    const data = message.flags[MODULE_ID][FLAG];
    const actor = fromUuidSync(data.actor);
    const item = await fromUuid(data.item);
    const entry = offerOf(sourceOf(item));
    if (!actor?.isOwner || !item || !entry) return;
    const roll = data.roll;
    const targetDoc = data.target ? fromUuidSync(data.target) : null;
    const target = targetDoc?.actor ?? targetDoc ?? null;
    const does = entry.does;
    if (does.kind === "check") {
        const dc = does.dc === "trigger" ? roll.dc : levelDC(target?.level);
        const statistic = actor.getStatistic?.(does.statistic) ?? actor.skills?.[does.statistic];
        return statistic?.roll({ ...(dc ? { dc: { value: dc } } : {}), extraRollOptions: [`origin:item:slug:${item.slug}`], label: `${item.name}: ${statistic.label}` });
    }
    if (does.kind === "same-action") {
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
    if (does.kind === "effect") {
        const rules = effectRulesFor(entry, roll);
        return applyFeatEffect(item, { builtin: "feat-effect", effect: { name: `${item.name}${roll.skill ? ` (${roll.skill})` : ""}`, rules, duration: does.duration, stance: false }, notes: entry.notes ?? [] });
    }
}

function wire(message, html) {
    if (!message.flags?.[MODULE_ID]?.[FLAG]) return;
    const button = html.querySelector?.(`[data-action="${MODULE_ID}-offer"]`);
    if (!button) return;
    button.addEventListener("click", async (event) => {
        event.preventDefault();
        button.disabled = true;
        try { await use(message); } catch (error) { console.error(`${MODULE_ID} | reaction offer`, error); button.disabled = false; }
    });
}

export function registerOffers() {
    Hooks.on("renderChatMessageHTML", (message, html) => wire(message, html));
}

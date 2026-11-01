// Skill actions' results (round 110, src/plans/skill-actions.js): as PF2e posts the check for Administer First Aid, Treat Poison, Treat
// Disease, Hide, Sneak or Seek (or Point Out's action), the active GM's client whispers the actor's owners and the GM a card saying what the
// degree does, with an Apply button: dying or bleeding ended, the save bonus Effect, hidden or undetected.

import { afterAttack, commonCondition, degreeAgainst, recountStealth, senseAttribute, specialSenses, treatmentDC, firstAidResult, seekState, senseCap, skillActionOf, stealthByObserver, treatmentBonus } from "../src/plans/skill-actions.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const FLAG = "skillAction";
const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
const DEGREE_WORDS = { criticalSuccess: "critical success", success: "success", failure: "failure", criticalFailure: "critical failure" };
const distance = (a, b) => (a && b && canvas?.grid ? canvas.grid.measurePath([a.center, b.center]).distance : null);
// (Not with a module that keeps detection per observer itself, PF2e Perception or PF2e Visioner: theirs.)
const perObserver = () => ["pf2e-perception", "pf2e-visioner"].some((id) => game.modules.get(id)?.active);
// The sneaker's state to each observer, on its token: { <observer token id>: "undetected" | "hidden" | "observed" }.
const DETECTION = "detection";
const statesOf = (token) => foundry.utils.deepClone(token?.document?.getFlag?.(MODULE_ID, DETECTION) ?? token?.getFlag?.(MODULE_ID, DETECTION) ?? {});
const sensesOf = (actor) => [...(actor?.perception?.senses ?? actor?.system?.perception?.senses ?? [])].map((sense) => ({ type: sense.type, acuity: sense.acuity, range: sense.range }));
const foesOf = (source) => (canvas?.tokens?.placeables ?? []).filter((token) => token.actor && token !== source && !token.document.hidden && token.document.disposition !== source.document.disposition && token.document.disposition !== 0 && !(token.actor.hitPoints?.value <= 0));

const pointOutTitle = () => (game.i18n?.has?.("PF2E.Actions.PointOut.Title") ? game.i18n.localize("PF2E.Actions.PointOut.Title") : null);
const tokenOf = (uuid) => (uuid ? fromUuidSync(uuid) : null);
const bleeds = (actor) => (actor?.itemTypes?.condition ?? []).filter((condition) => condition.slug === "persistent-damage" && condition.system?.persistent?.damageType === "bleed");
const perceptionDC = (actor) => Number(actor?.perception?.dc?.value ?? actor?.system?.perception?.dc ?? (Number(actor?.system?.perception?.mod) + 10)) || null;
const stealthDC = (actor) => Number(actor?.skills?.stealth?.dc?.value ?? (Number(actor?.skills?.stealth?.mod) + 10)) || null;

async function whisper(actor, content, data, { gmOnly = false } = {}) {
    const owners = game.users.filter((user) => user.isGM || (!gmOnly && actor.testUserPermission(user, "OWNER"))).map((user) => user.id);
    return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), whisper: owners, content, flags: { [MODULE_ID]: { [FLAG]: data } } });
}
const button = (label = "Apply") => `<p><button type="button" data-action="${MODULE_ID}-skill">${escape(label)}</button></p>`;

export async function onSkillActionMessage(message) {
    const context = message.flags?.pf2e?.context;
    const options = context?.options ?? message.flags?.pf2e?.origin?.rollOptions ?? [];
    const found = skillActionOf(options, `${message.flavor ?? ""}`, pointOutTitle());
    if (!found) return;
    const actor = message.actor;
    if (!actor) return;
    const outcome = context?.outcome ?? null;
    const total = Number(message.rolls?.[0]?.total);
    const die = Number(message.rolls?.[0]?.dice?.find((each) => each.faces === 20)?.total) || null;
    // (PF2e 8.6 posts First Aid and the treatments with no target, DC or degree: the roller's targets, recorded as it posts, and the DC and
    // degree worked out here; round 110 Foundry test.)
    const targetUuid = context?.target?.token ?? message.getFlag?.(MODULE_ID, "skillTargets")?.[0] ?? null;
    const target = tokenOf(targetUuid)?.actor ?? (context?.target?.actor ? fromUuidSync(context.target.actor) : null);
    const source = message.token?.object ?? actor.getActiveTokens?.(true)[0] ?? null;
    const degreeFor = (dc) => outcome ?? (Number.isFinite(dc) && Number.isFinite(total) ? degreeAgainst(total, dc, die) : null);
    if (found.slug === "administer-first-aid") {
        if (!target) return;
        const dc = found.variant === "stabilize" ? 15 + (Number(target.getCondition?.("dying")?.value) || 0) : Number(bleeds(target)[0]?.system?.persistent?.dc) || 15;
        if (found.variant === "stabilize" && !target.hasCondition?.("dying")) return;
        if (found.variant === "stop-bleeding" && !bleeds(target).length) return;
        const degree = degreeFor(dc);
        if (!degree) return;
        const result = firstAidResult(found.variant, degree);
        if (!result.dying && !result.bleed) return;
        const words = result.dying === "remove" ? `${escape(target.name)} is no longer dying: wounded 1 more, and still unconscious at 0 Hit Points.` : result.dying === "+1" ? `${escape(target.name)}'s dying value rises by 1.` : result.bleed === "remove" ? `${escape(target.name)}'s persistent bleed ends.` : `${escape(target.name)} takes its persistent bleed damage.`;
        return whisper(actor, `<p><strong>Administer First Aid</strong> (${total} against DC ${dc}, ${DEGREE_WORDS[degree]}): ${words}</p>${button()}`, { kind: "first-aid", target: targetUuid, result });
    }
    if (found.slug === "treat-poison" || found.slug === "treat-disease") {
        if (!target) return;
        const dc = treatmentDC(target, found.slug === "treat-poison" ? "poison" : "disease");
        const degree = degreeFor(dc);
        const name = found.slug === "treat-poison" ? "Treat Poison" : "Treat Disease";
        // (No affliction on the patient to read its DC from: the GM picks the degree.)
        if (!degree) return whisper(actor, `<p><strong>${name}</strong>: ${total}. No ${found.slug === "treat-poison" ? "poison" : "disease"} with a DC was found on ${escape(target.name)}; pick the result.</p><p>${["criticalSuccess", "success", "criticalFailure"].map((each) => `<button type="button" data-action="${MODULE_ID}-skill" data-degree="${each}">${DEGREE_WORDS[each]}</button>`).join(" ")}</p>`, { kind: "treatment", target: targetUuid, slug: found.slug, outcome: null }, { gmOnly: true });
        const bonus = treatmentBonus(found.slug, degree);
        if (!bonus) return;
        return whisper(actor, `<p><strong>${name}</strong> (${total} against DC ${dc}, ${DEGREE_WORDS[degree]}): ${escape(target.name)} gets a ${bonus.value > 0 ? "+" : ""}${bonus.value} circumstance ${bonus.value > 0 ? "bonus" : "penalty"} to its next saving throw against the ${bonus.trait}.</p>${button()}`, { kind: "treatment", target: targetUuid, slug: found.slug, outcome: degree });
    }
    if (perObserver() || !source) return;
    const tokens = canvas?.tokens?.placeables ?? [];
    // (Point Out has no roll.)
    if (found.slug === "point-out") {
        const targetToken = tokenOf(targetUuid);
        if (!targetToken) return;
        const states = statesOf(targetToken);
        const allies = tokens.filter((token) => token.actor && token !== source && token.document.disposition === source.document.disposition && (states[token.id] ?? (target.hasCondition?.("undetected") ? "undetected" : "observed")) === "undetected");
        if (!allies.length) return;
        return whisper(actor, `<p><strong>Point Out</strong>: ${escape(target.name)} is hidden instead of undetected to ${allies.map((token) => escape(token.name)).join(", ")}.</p>${button()}`, { kind: "seek", changes: allies.map((token) => ({ token: targetUuid, observer: token.id, becomes: "hidden" })) });
    }
    if (!Number.isFinite(total)) return;
    if (found.slug === "hide" || found.slug === "sneak") {
        const before = statesOf(source);
        const observers = foesOf(source).map((token) => {
            const feet = distance(source, token) ?? 0;
            const sensesFull = sensesOf(token.actor);
            return { id: token.id, name: token.name, dc: perceptionDC(token.actor), state: before[token.id] ?? "observed", feet, sensesFull, senses: specialSenses(sensesFull, feet), cap: senseCap(sensesFull, feet) };
        }).filter((row) => row.dc);
        if (!observers.length) return;
        const mods = Object.fromEntries(Object.entries(actor.abilities ?? actor.system?.abilities ?? {}).map(([key, value]) => [key, Number(value?.mod) || 0]));
        const data = { kind: "stealth", slug: found.slug, token: source.document.uuid, total, die, mods, observers, beaten: {} };
        data.rows = recountStealth(found.slug, total, die, observers, {}, mods);
        data.states = Object.fromEntries(data.rows.map((row) => [row.id, row.state]));
        return whisper(actor, stealthCard(actor, data), data);
    }
    if (found.slug === "seek") {
        const creatures = tokens.filter((token) => token.actor && token !== source && (distance(source, token) ?? Infinity) <= 30).map((token) => {
            const mine = statesOf(token)[source.id] ?? (token.actor.hasCondition?.("undetected") ? "undetected" : token.actor.hasCondition?.("hidden") ? "hidden" : "observed");
            return { token, state: mine };
        }).filter((row) => row.state !== "observed").map(({ token, state }) => ({ uuid: token.document.uuid, name: token.name, dc: stealthDC(token.actor), state })).filter((row) => row.dc);
        if (!creatures.length) return;
        const rows = creatures.map((row) => {
            const degree = degreeAgainst(total, row.dc, die);
            return { ...row, degree, becomes: seekState(row.state, degree) };
        });
        const lines = rows.map((row) => `<li>${escape(row.name)} (${row.state}, DC ${row.dc}): ${DEGREE_WORDS[row.degree]}${row.becomes !== row.state ? `, now ${row.becomes} to ${escape(source.name)}` : ""}</li>`).join("");
        const changes = rows.filter((row) => row.becomes !== row.state).map((row) => ({ token: row.uuid, observer: source.id, becomes: row.becomes }));
        return whisper(actor, `<p><strong>Seek</strong>: ${total} against the Stealth DC of each creature within 30 feet that's hidden or undetected to ${escape(source.name)}.</p><ul>${lines}</ul><p>The search area is the GM's (a 30-foot cone or a 15-foot burst).</p>${changes.length ? button() : ""}`, { kind: "seek", changes }, { gmOnly: true });
    }
}

// The Sneak or Hide card: each observer's result, and a button for each special sense that keeps it from being fooled.
const ATTRIBUTES = { str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma" };
function stealthCard(actor, data) {
    const name = data.slug === "hide" ? "Hide" : "Sneak";
    const lines = data.rows.map((row) => {
        const by = (row.senses ?? []).filter((type) => !data.beaten[type]);
        const capped = row.cap !== "undetected" && row.state === row.cap && ["success", "criticalSuccess"].includes(row.degree);
        const against = Object.keys(data.beaten).filter((type) => (row.senses ?? []).includes(type));
        return `<li>${escape(row.name)} (DC ${row.dc}): ${row.total !== data.total ? `${row.total}, ` : ""}${DEGREE_WORDS[row.degree]}, ${row.state}${capped ? ` (its ${by.join(", ")})` : ""}${against.length ? ` (also against its ${against.join(", ")})` : ""}</li>`;
    }).join("");
    // (The senses still keeping an observer from what the roll beat.)
    const open = [...new Set(data.rows.filter((row) => row.cap !== "undetected" && row.state === row.cap && ["success", "criticalSuccess", "failure"].includes(row.degree)).flatMap((row) => (row.senses ?? []).filter((type) => !data.beaten[type])))];
    const senseButtons = open.map((type) => `<span style="white-space:nowrap"><button type="button" data-action="${MODULE_ID}-sense" data-sense="${escape(type)}" style="width:auto">Also against ${escape(type)}</button> <select data-sense-attribute="${escape(type)}">${Object.entries(ATTRIBUTES).map(([key, label]) => `<option value="${key}"${key === senseAttribute(type) ? " selected" : ""}>${label}</option>`).join("")}</select></span>`).join(" ");
    const note = data.slug === "sneak" ? "You need to start hidden or undetected, and end in cover or concealment to stay so: the GM's call." : "You need cover or concealment from each of them: the GM's call.";
    // Hide only avoids being seen (Player Core sidebar): only Sneak can also count against another sense.
    if (data.slug === "hide" && open.length) return `<p><strong>${name}</strong>: ${data.total} against each foe's Perception DC.</p><ul>${lines}</ul><p>${note}</p><p>Hide only avoids being seen. To get past ${open.join(", ")} too, Sneak and say how you avoid it.</p>${button()}`;
    const senses = open.length ? `<p>If you say how you avoid a special sense too (stepping lightly against tremorsense, slowing your heart against lifesense), the roll counts against it, with your lowest applicable modifier:</p><p>${senseButtons}</p>` : "";
    return `<p><strong>${name}</strong>: ${data.total} against each foe's Perception DC.</p><ul>${lines}</ul><p>${note}</p>${senses}${button()}`;
}

const SENSE_QUERY = `${MODULE_ID}.againstSense`;
async function onSenseQuery({ messageId, type, attribute, userId } = {}) {
    const message = game.messages.get(messageId);
    const data = message?.flags?.[MODULE_ID]?.[FLAG];
    if (data?.kind !== "stealth" || data.beaten?.[type] || !(type in sensesOnCard(data))) return false;
    const user = game.users.get(userId);
    if (!user || !tokenOf(data.token)?.actor?.testUserPermission(user, "OWNER")) return false;
    if (!(attribute in ATTRIBUTES)) return false;
    await againstSense(message, type, attribute);
    return true;
}
const sensesOnCard = (data) => Object.fromEntries(data.observers.flatMap((row) => row.senses ?? []).map((type) => [type, true]));

async function againstSense(message, type, attribute) {
    if (!message.isOwner) {
        // (A player owning the sneaker asks the active GM to recount: the GM's whisper isn't the player's to change.)
        const gm = game.users.activeGM;
        if (!gm?.query) return ui.notifications.warn("The GM recounts it.");
        return gm.query(SENSE_QUERY, { messageId: message.id, type, attribute, userId: game.user.id });
    }
    const data = foundry.utils.deepClone(message.flags[MODULE_ID][FLAG]);
    data.beaten = { ...data.beaten, [type]: attribute };
    data.rows = recountStealth(data.slug, data.total, data.die, data.observers, data.beaten, data.mods);
    data.states = Object.fromEntries(data.rows.map((row) => [row.id, row.state]));
    const actor = tokenOf(data.token)?.actor;
    await message.update({ content: stealthCard(actor, data), [`flags.${MODULE_ID}.${FLAG}`]: data });
}

// The sneaker's states to its observers, and PF2e's condition where it holds for all of them.
async function setStates(tokenDocument, states) {
    const actor = tokenDocument.actor;
    const clean = Object.fromEntries(Object.entries(states).filter(([, state]) => state !== "observed"));
    if (Object.keys(clean).length) await tokenDocument.setFlag(MODULE_ID, DETECTION, clean);
    else await tokenDocument.unsetFlag(MODULE_ID, DETECTION);
    const foes = foesOf(tokenDocument.object).map((token) => token.id);
    const common = commonCondition(Object.fromEntries(foes.map((id) => [id, states[id] ?? "observed"])));
    await setDetection(actor, common ?? "observed");
}

async function setDetection(actor, becomes) {
    for (const slug of ["hidden", "undetected"]) if (slug !== becomes && actor.hasCondition(slug)) await actor.decreaseCondition(slug, { forceRemove: true });
    if (becomes !== "observed" && !actor.hasCondition(becomes)) await actor.increaseCondition(becomes);
}

async function apply(message, degree = null) {
    const data = { ...message.flags[MODULE_ID][FLAG] };
    if (degree) data.outcome = degree;
    const say = (line) => ChatMessage.create({ speaker: message.speaker, content: `<p>${line}</p>` });
    if (data.kind === "first-aid") {
        const patient = tokenOf(data.target)?.actor;
        if (!patient?.isOwner) return ui.notifications.warn("Only the GM or the patient's owner can apply it.");
        // (Losing dying: wounded 1, or 1 more, and still unconscious at 0 Hit Points; PF2e's removal takes the unconscious it gave; round 110
        // Foundry test.)
        if (data.result.dying === "remove") {
            await patient.decreaseCondition("dying", { forceRemove: true });
            await patient.increaseCondition("wounded");
            if ((Number(patient.hitPoints?.value ?? patient.system?.attributes?.hp?.value) || 0) <= 0 && !patient.hasCondition("unconscious")) await patient.increaseCondition("unconscious");
        }
        if (data.result.dying === "+1") await patient.increaseCondition("dying");
        if (data.result.bleed === "remove") await patient.deleteEmbeddedDocuments("Item", bleeds(patient).map((condition) => condition.id));
        if (data.result.bleed === "damage") {
            const DamageRoll = CONFIG.Dice.rolls.find((roll) => roll.name === "DamageRoll");
            for (const condition of bleeds(patient)) await new DamageRoll(`(${condition.system.persistent.formula})[bleed]`, {}, { evaluatePersistent: true }).toMessage({ speaker: ChatMessage.getSpeaker({ actor: patient }), flavor: `<strong>Administer First Aid</strong>: ${escape(patient.name)}'s bleed damage` });
        }
        return say(`<strong>Administer First Aid</strong>: applied to ${escape(patient.name)}.`);
    }
    if (data.kind === "treatment") {
        const patient = tokenOf(data.target)?.actor;
        if (!patient?.isOwner) return ui.notifications.warn("Only the GM or the patient's owner can apply it.");
        const bonus = treatmentBonus(data.slug, data.outcome);
        const name = data.slug === "treat-poison" ? "Treat Poison" : "Treat Disease";
        await patient.createEmbeddedDocuments("Item", [{
            name: `Effect: ${name} (${bonus.value > 0 ? "+" : ""}${bonus.value})`, type: "effect", img: "icons/svg/aura.svg",
            flags: { [MODULE_ID]: { treatment: data.slug } },
            system: { description: { value: `<p>On its next saving throw against the ${bonus.trait}; delete this Effect after that save.</p>` }, duration: { value: 1, unit: "days", expiry: "turn-start", sustained: false }, start: { value: game.time.worldTime }, rules: bonus.rules, tokenIcon: { show: true } }
        }]);
        return say(`<strong>${name}</strong>: ${escape(patient.name)} gets its ${bonus.value > 0 ? "bonus" : "penalty"} to the next save against the ${bonus.trait}.`);
    }
    if (data.kind === "stealth") {
        const token = tokenOf(data.token);
        if (!token?.isOwner) return;
        await setStates(token, { ...statesOf(token), ...data.states });
        const counts = Object.values(data.states).reduce((all, state) => ({ ...all, [state]: (all[state] ?? 0) + 1 }), {});
        return say(`${escape(token.name)} is ${Object.entries(counts).map(([state, count]) => `${state} to ${count}`).join(", ")}.`);
    }
    if (data.kind === "seek") {
        const done = [];
        for (const change of data.changes) {
            const token = tokenOf(change.token);
            if (!token?.isOwner) continue;
            const states = statesOf(token);
            // (No states yet, a PF2e condition set by hand: to every foe but this one, as it was.)
            if (!Object.keys(states).length) for (const foe of foesOf(token.object)) states[foe.id] = token.actor.hasCondition("undetected") ? "undetected" : token.actor.hasCondition("hidden") ? "hidden" : "observed";
            states[change.observer] = change.becomes;
            await setStates(token, states);
            const observer = canvas.tokens.get(change.observer);
            done.push(`${escape(token.name)} is ${change.becomes} to ${escape(observer?.name ?? "it")}`);
        }
        if (!done.length) return ui.notifications.warn("Only the GM can change those creatures.");
        return say(`<strong>Seek</strong>: ${done.join("; ")}.`);
    }
}

// The sneaker attacking an observer: undetected → hidden, hidden → observed, to that one.
async function onAttack(message) {
    const context = message.flags?.pf2e?.context;
    if (!["attack-roll", "spell-attack-roll"].includes(context?.type)) return;
    const source = message.token ?? message.actor?.getActiveTokens?.(true, true)[0] ?? null;
    const states = statesOf(source);
    const target = tokenOf(context.target?.token);
    if (!source || !target || !states[target.id]) return;
    states[target.id] = afterAttack(states[target.id]);
    await setStates(source, states);
}

// A token undetected to every token the user sees with is not drawn for that user (not the GM's, nor its own owner's).
function hideFromObservers() {
    const prototype = CONFIG.Token.objectClass.prototype;
    let owner = prototype;
    let descriptor = null;
    while (owner && !(descriptor = Object.getOwnPropertyDescriptor(owner, "isVisible"))) owner = Object.getPrototypeOf(owner);
    if (!descriptor?.get) return console.warn(`${MODULE_ID} | no Token isVisible to wrap; detection per observer is only on the cards`);
    const original = descriptor.get;
    Object.defineProperty(prototype, "isVisible", {
        configurable: true,
        get() {
            const base = original.call(this);
            if (!base || game.user.isGM || this.document.isOwner) return base;
            const states = this.document.getFlag(MODULE_ID, DETECTION);
            if (!states) return base;
            const eyes = eyesOf();
            if (!eyes.length) return base;
            return eyes.some((token) => (states[token.id] ?? "observed") !== "undetected");
        }
    });
}

// Whether a token is undetected to every token this user sees with (never for the GM or its owner).
function undetectedToUser(document) {
    if (!document || game.user.isGM || document.isOwner) return false;
    const states = document.getFlag(MODULE_ID, DETECTION);
    if (!states) return false;
    const eyes = eyesOf();
    return eyes.length > 0 && eyes.every((token) => (states[token.id] ?? "observed") === "undetected");
}

// The combat tracker: an undetected combatant's row is left out for that user, except on its turn, when a nameless "Someone unseen" row shows it is someone's turn (Cole, 2026-11-01).
const UNSEEN = "Someone unseen";
function hideTrackerRows(app, html) {
    if (game.user.isGM || perObserver()) return;
    const root = html?.jquery ? html[0] : html;
    const combat = app?.viewed ?? game.combat;
    if (!root?.querySelectorAll || !combat) return;
    for (const row of root.querySelectorAll("[data-combatant-id]")) {
        const combatant = combat.combatants.get(row.dataset.combatantId);
        if (!undetectedToUser(combatant?.token)) continue;
        if (combatant.id !== combat.combatant?.id) { row.remove(); continue; }
        row.classList.add(`${MODULE_ID}-unseen`);
        for (const image of row.querySelectorAll("img")) { image.src = "icons/svg/mystery-man.svg"; image.removeAttribute("data-src"); image.alt = UNSEEN; }
        const name = row.querySelector(".token-name .name, .token-name h4, .token-name strong, .name");
        if (name) name.textContent = UNSEEN;
        row.querySelectorAll(".token-effects, .combatant-controls, .token-resource, .resource, .token-initiative").forEach((part) => part.remove());
        row.title = UNSEEN;
        for (const type of ["click", "dblclick", "pointerdown", "mouseenter", "contextmenu"]) row.addEventListener(type, (event) => { event.stopImmediatePropagation(); event.preventDefault(); }, true);
    }
}
const renderTracker = () => {
    if (game.user.isGM) return;
    ui.combat?.render?.();
    for (const app of foundry.applications?.instances?.values?.() ?? []) if (app !== ui.combat && app.constructor?.name === "CombatTracker") app.render();
};

// The tokens the user sees with: those it controls, else every sighted token it owns.
function eyesOf() {
    const controlled = canvas.tokens.controlled.filter((token) => token.document.isOwner);
    return controlled.length ? controlled : canvas.tokens.placeables.filter((token) => token.document.isOwner && token.actor && token.document.sight?.enabled);
}

// A token hidden (not observed) to every token the user sees with is drawn faded for that user: it knows the square, not more (Cole, 2026-11-01).
const FADED = 0.45;
function fadeHidden(token) {
    if (game.user.isGM || token.document.isOwner || !token.mesh) return;
    const states = token.document.getFlag(MODULE_ID, DETECTION);
    if (!states) return;
    const eyes = eyesOf();
    if (!eyes.length || eyes.some((each) => (states[each.id] ?? "observed") === "observed")) return;
    token.mesh.alpha = Math.min(token.mesh.alpha, FADED);
}
const refreshDetected = () => {
    for (const token of canvas?.tokens?.placeables ?? []) if (token.document.getFlag(MODULE_ID, DETECTION)) token.renderFlags.set({ refreshState: true });
};

// The roller's targets on its skill action's message, as it posts (PF2e's context has none for First Aid and the treatments).
function recordSkillTargets(message, _data, _options, userId) {
    if (userId !== game.user.id) return;
    const options = message.flags?.pf2e?.context?.options ?? [];
    if (!skillActionOf(options, message.flavor ?? "", pointOutTitle())) return;
    const targets = [...game.user.targets].map((token) => token.document?.uuid).filter(Boolean);
    if (targets.length) message.updateSource({ [`flags.${MODULE_ID}.skillTargets`]: targets });
}

export function registerSkillActions() {
    if (CONFIG.queries) CONFIG.queries[SENSE_QUERY] = onSenseQuery;
    Hooks.on("preCreateChatMessage", recordSkillTargets);
    Hooks.on("createChatMessage", (message) => {
        if (!game.users.activeGM?.isSelf) return;
        onSkillActionMessage(message).catch((error) => console.error(`${MODULE_ID} | skill action`, error));
        if (!perObserver()) onAttack(message).catch((error) => console.error(`${MODULE_ID} | detection after an attack`, error));
    });
    Hooks.once("setup", () => {
        if (!perObserver()) hideFromObservers();
    });
    Hooks.on("updateToken", (document, changes) => {
        if (!foundry.utils.hasProperty(changes, `flags.${MODULE_ID}`)) return;
        canvas.perception?.update({ refreshVision: true, refreshOcclusion: true });
        document.object?.renderFlags.set({ refreshState: true });
        renderTracker();
    });
    Hooks.on("refreshToken", (token) => {
        if (!perObserver()) fadeHidden(token);
    });
    // (Another token taken in hand: what it sees.)
    Hooks.on("controlToken", () => { refreshDetected(); renderTracker(); });
    Hooks.on("renderCombatTracker", hideTrackerRows);
    Hooks.on("renderChatMessageHTML", (message, html) => {
        if (!message.flags?.[MODULE_ID]?.[FLAG]) return;
        for (const sense of html.querySelectorAll?.(`[data-action="${MODULE_ID}-sense"]`) ?? []) sense.addEventListener("click", (event) => {
            event.preventDefault();
            const type = sense.dataset.sense;
            const attribute = html.querySelector(`[data-sense-attribute="${CSS.escape(type)}"]`)?.value ?? senseAttribute(type);
            sense.disabled = true;
            againstSense(message, type, attribute).then((done) => { if (done === false) sense.disabled = false; }).catch((error) => { console.error(`${MODULE_ID} | stealth against a sense`, error); sense.disabled = false; });
        });
        const buttons = [...(html.querySelectorAll?.(`[data-action="${MODULE_ID}-skill"]`) ?? [])];
        if (!buttons.length) return;
        if (message.getFlag(MODULE_ID, "applied")) {
            for (const each of buttons) each.disabled = true;
            buttons[0].textContent = `${buttons[0].textContent} (applied)`;
            return;
        }
        for (const each of buttons) each.addEventListener("click", async (event) => {
            event.preventDefault();
            for (const other of buttons) other.disabled = true;
            try {
                await apply(message, each.dataset.degree ?? null);
                if (message.isOwner) await message.setFlag(MODULE_ID, "applied", true);
            } catch (error) { console.error(`${MODULE_ID} | skill action`, error); for (const other of buttons) other.disabled = false; }
        });
    });
}

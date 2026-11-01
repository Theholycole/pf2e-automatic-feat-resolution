// PF2e Workbench's Basic Action Macro (round 109, Cole: "I want the Feat module to work with this macro"). Workbench's window has its own
// fixed list of actions, which PF2e's actions run, so the module's cards already follow them. Three things it doesn't do, added here:
// - a row in its window for the character's feat actions the module plays (posting the feat, as from the sheet), and for its feats' PF2e
//   action links with another skill (Graceful Leaper's Long Jump with Acrobatics);
// - Workbench's Treat Wounds and Battle Medicine heal message: a card whose button applies the heal and the patient's immunity.

import { actLinks } from "../src/compiler/act-links.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const WORKBENCH = "xdy-pf2e-workbench";
const WINDOW = "xdy-pf2e-workbench-BAM-app";
const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

let compile = () => null;

// The actor the window is for: as Workbench picks it, the controlled token's, else the user's character.
const actorOf = () => canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;

function rowFor(actor) {
    const items = [...(actor.itemTypes?.feat ?? []), ...(actor.itemTypes?.action ?? [])];
    const actions = items.filter((item) => ["action", "reaction", "free"].includes(item.system?.actionType?.value) && !item.system?.selfEffect && usable(item));
    const links = items.flatMap((item) => actLinks(item.system?.description?.value).map((link) => ({ ...link, item })));
    return { actions, links };
}
const usable = (item) => {
    const plan = compile(item);
    return Boolean(plan && plan.builtin !== "no-effect");
};

function inject(application, element) {
    if (!game.modules.get(WORKBENCH)?.active) return;
    const root = element instanceof HTMLElement ? element : element?.[0];
    if (!root || root.querySelector(`.${MODULE_ID}-bam`)) return;
    const actor = actorOf();
    if (actor?.type !== "character") return;
    const { actions, links } = rowFor(actor);
    if (!actions.length && !links.length) return;
    const section = document.createElement("section");
    section.className = `${MODULE_ID}-bam`;
    section.style.cssText = "margin-top:6px;padding-top:6px;border-top:1px solid var(--color-border, #999);display:flex;flex-wrap:wrap;gap:4px;align-items:center";
    section.innerHTML = `<strong style="width:100%">Feat actions</strong>${actions.map((item) => `<button type="button" data-feat="${item.id}" title="${escape(item.name)}" style="flex:0 0 auto;width:auto"><img src="${escape(item.img)}" style="height:16px;vertical-align:middle;border:0"> ${escape(item.name)}</button>`).join("")}${links.map((link, index) => `<button type="button" data-link="${index}" title="${escape(link.item.name)}" style="flex:0 0 auto;width:auto">${escape(link.label)}</button>`).join("")}`;
    section.addEventListener("click", async (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        if (button.dataset.feat) {
            const item = actor.items.get(button.dataset.feat);
            // (Posted as the sheet posts it: the module's card follows.)
            if (item) await item.toMessage(event, { create: true });
            return;
        }
        const link = links[Number(button.dataset.link)];
        const action = game.pf2e?.actions?.get?.(link?.slug);
        if (!action) return ui.notifications.warn(`PF2e's ${link?.slug} wasn't found.`);
        await action.use({ event, actors: [actor], statistic: link.statistic });
    });
    const content = root.querySelector(".window-content") ?? root;
    content.append(section);
    application?.setPosition?.({ height: "auto" });
}

// Workbench's heal message for Treat Wounds or Battle Medicine: { patient token, healing, battle } or null.
export function workbenchHeal(message) {
    const flags = message.flags?.treat_wounds_battle_medicine ?? message.flags?.[WORKBENCH]?.treat_wounds_battle_medicine ?? null;
    if (!flags || !(Number(flags.healing) > 0)) return null;
    const words = `${message.flavor ?? ""} ${message.content ?? ""}`;
    return { tokenId: flags.id, healerId: flags.healerId, healing: Number(flags.healing), battle: /Battle Medicine/i.test(words) };
}

async function onHealMessage(message) {
    const heal = workbenchHeal(message);
    if (!heal) return;
    const token = canvas?.tokens?.get(heal.tokenId) ?? game.scenes?.active?.tokens?.get(heal.tokenId) ?? null;
    const patient = token?.actor ?? null;
    const healer = game.actors.get(heal.healerId) ?? message.actor ?? null;
    if (!patient) return;
    const owners = game.users.filter((user) => user.isGM || (healer && healer.testUserPermission(user, "OWNER"))).map((user) => user.id);
    const what = heal.battle ? "Battle Medicine" : "Treat Wounds";
    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: healer ?? undefined }),
        whisper: owners,
        content: `<p><strong>${what}</strong>: ${escape(patient.name)} regains ${heal.healing} Hit Points and is immune to your ${what} for ${heal.battle ? "1 day" : "1 hour"}.</p><p><button type="button" data-action="${MODULE_ID}-wb-heal">Apply</button></p>`,
        flags: { [MODULE_ID]: { wbHeal: { token: token.document?.uuid ?? token.uuid, healer: healer?.uuid ?? null, healing: heal.healing, battle: heal.battle, source: message.id } } }
    });
}

async function applyHeal(message, button) {
    const data = message.flags[MODULE_ID].wbHeal;
    const patient = fromUuidSync(data.token)?.actor;
    if (!patient) return;
    button.disabled = true;
    const hp = patient.system?.attributes?.hp;
    const before = Number(hp?.value) || 0;
    const next = Math.min(Number(hp?.max) || Infinity, before + data.healing);
    // (Only a client that owns the patient can change it: the GM's, or the patient's owner's.)
    if (!patient.isOwner) {
        button.disabled = false;
        return ui.notifications.warn("Only the GM or the patient's owner can apply it.");
    }
    await patient.update({ "system.attributes.hp.value": next });
    const healer = data.healer ? fromUuidSync(data.healer) : null;
    const what = data.battle ? "Battle Medicine" : "Treat Wounds";
    await patient.createEmbeddedDocuments("Item", [{
        name: `Effect: ${what} Immunity${healer ? ` (${healer.name})` : ""}`, type: "effect", img: data.battle ? "icons/svg/regen.svg" : "icons/svg/heal.svg",
        flags: { [MODULE_ID]: { immunity: { what, healer: data.healer }, source: message.id } },
        system: { description: { value: `<p>Immune to ${escape(healer?.name ?? "the healer")}'s ${what}.</p>` }, duration: { value: 1, unit: data.battle ? "days" : "hours", expiry: "turn-start", sustained: false }, start: { value: game.time.worldTime }, rules: [], tokenIcon: { show: true } }
    }]);
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: healer ?? undefined }), content: `<p><strong>${what}</strong>: ${escape(patient.name)} regains ${next - before} Hit Points (${next}/${hp?.max}).</p>` });
}

export function registerWorkbench({ compileItem }) {
    compile = compileItem;
    Hooks.on("renderApplicationV2", (application, element) => {
        if (application?.id === WINDOW || application?.options?.id === WINDOW) inject(application, element);
    });
    Hooks.on("renderApplication", (application, element) => {
        if (application?.id === WINDOW || application?.options?.id === WINDOW) inject(application, element);
    });
    Hooks.on("createChatMessage", (message) => {
        if (game.users.activeGM?.isSelf && game.modules.get(WORKBENCH)?.active) onHealMessage(message).catch((error) => console.error(`${MODULE_ID} | Workbench heal`, error));
    });
    Hooks.on("renderChatMessageHTML", (message, html) => {
        if (!message.flags?.[MODULE_ID]?.wbHeal) return;
        const button = html.querySelector?.(`[data-action="${MODULE_ID}-wb-heal"]`);
        const patient = fromUuidSync(message.flags[MODULE_ID].wbHeal.token)?.actor;
        if (button && patient?.itemTypes?.effect?.some((effect) => effect.flags?.[MODULE_ID]?.immunity && effect.flags[MODULE_ID].source === message.id)) button.disabled = true;
        button?.addEventListener("click", (event) => {
            event.preventDefault();
            applyHeal(message, button).catch((error) => { console.error(`${MODULE_ID} | Workbench heal`, error); button.disabled = false; });
        });
    });
}

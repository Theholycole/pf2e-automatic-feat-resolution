// The master's feat that advances its companion, live (src/plans/companion-growth.js): on the active GM's client, as the feat is created on
// a character, the animal companions module's item goes on each of its companions of the kind (animal or construct), the GM choosing when
// there's a choice; as the feat is deleted, the items it put there are deleted.

import { growthChoices, growthOf } from "../src/plans/companion-growth.js";
import { companionsOf, isEidolon } from "../src/compiler/companion.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const sourceOf = (item) => item?.sourceId ?? item?._stats?.compendiumSource ?? item?.flags?.core?.sourceId ?? null;
const isActiveGM = () => game.user?.isActiveGM ?? (game.user?.isGM && game.users.activeGM === game.user);
// (An animal or construct companion of the animal companions module: its class item, "Animal Companion" or a construct's; an eidolon never.)
const classWords = (actor) => (actor?.itemTypes?.class ?? []).map((item) => `${item.slug ?? ""} ${item.name ?? ""}`).join(" ").toLowerCase();
const fits = (actor, construct) => actor?.type !== "familiar" && !isEidolon(actor) && /construct|reanimated/.test(classWords(actor)) === construct;

async function choose(title, options) {
    if (options.length === 1) return options[0];
    const DialogV2 = foundry.applications?.api?.DialogV2;
    if (!DialogV2) return options[0];
    const items = await Promise.all(options.map((uuid) => fromUuid(uuid)));
    const buttons = items.map((item, index) => ({ action: String(index), label: item?.name ?? options[index] }));
    const picked = await DialogV2.wait({ window: { title }, content: `<p>${foundry.utils.escapeHTML(title)}: choose one.</p>`, buttons, rejectClose: false }).catch(() => null);
    return picked === null || picked === undefined ? null : options[Number(picked)] ?? null;
}

async function grow(feat) {
    const growth = growthOf(sourceOf(feat));
    const master = feat.actor;
    if (!growth || master?.type !== "character") return;
    const companions = companionsOf(master, { actors: [...game.actors], users: [...game.users] }).filter((each) => fits(each, growth.construct));
    if (!companions.length) {
        ui.notifications?.info(`${feat.name}: no ${growth.construct ? "construct" : "animal"} companion of ${master.name} found; add its item by hand.`);
        return;
    }
    for (const companion of companions) {
        const sources = companion.items.map((item) => sourceOf(item));
        const uuid = await choose(`${feat.name} for ${companion.name}`, growthChoices(growth, sources));
        if (!uuid) continue;
        const source = (await fromUuid(uuid))?.toObject?.();
        if (!source) {
            ui.notifications?.warn(`${feat.name}: the animal companions module's item ${uuid} wasn't found.`);
            continue;
        }
        source._stats = { ...(source._stats ?? {}), compendiumSource: uuid };
        source.flags = { ...(source.flags ?? {}), [MODULE_ID]: { grownBy: { actor: master.id, item: feat.id } } };
        const [created] = await companion.createEmbeddedDocuments("Item", [source]);
        // (The item's own choice can wait on the GM; the feat may be gone by then: round 41.)
        if (!master.items.get(feat.id)) {
            if (created) await companion.deleteEmbeddedDocuments("Item", [created.id]);
            return;
        }
        await ChatMessage.create({ content: `<p><strong>${foundry.utils.escapeHTML(feat.name)}</strong>: ${foundry.utils.escapeHTML(companion.name)} gains ${foundry.utils.escapeHTML(source.name)}.</p>`, whisper: game.users.filter((user) => user.isGM || companion.testUserPermission(user, "OWNER")).map((user) => user.id) });
    }
}

async function shrink(feat) {
    const master = feat.actor;
    if (!growthOf(sourceOf(feat)) || master?.type !== "character") return;
    for (const companion of game.actors ?? []) {
        const ids = companion.items.filter((item) => {
            const by = item.flags?.[MODULE_ID]?.grownBy;
            // (Its feat, or one gone from that master already: an orphan from a choice answered late.)
            return by?.actor === master.id && (by.item === feat.id || !master.items.get(by.item));
        }).map((item) => item.id);
        if (ids.length) await companion.deleteEmbeddedDocuments("Item", ids);
    }
}

export function registerCompanionGrowth() {
    Hooks.on("createItem", (item, _options, userId) => {
        if (isActiveGM() && item.type === "feat") grow(item).catch((error) => console.error(`${MODULE_ID} | companion growth`, error));
    });
    Hooks.on("deleteItem", (item) => {
        if (isActiveGM() && item.type === "feat") shrink(item).catch((error) => console.error(`${MODULE_ID} | companion growth`, error));
    });
}

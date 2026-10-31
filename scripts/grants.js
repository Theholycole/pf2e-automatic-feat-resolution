// A feat's given item, live (src/plans/grants.js): on the active GM's client, as the feat is created, the spell or action goes on the actor (a
// spell into its focus spellcasting) or on its companion; as the feat is deleted, the items it put there go too.

import { grantsIn } from "../src/plans/grants.js";
import { companionsOf, isEidolon } from "../src/compiler/companion.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const isActiveGM = () => game.user?.isActiveGM ?? (game.user?.isGM && game.users.activeGM === game.user);
const sourceOf = (item) => item?.sourceId ?? item?._stats?.compendiumSource ?? item?.flags?.core?.sourceId ?? null;

function holders(actor, who) {
    if (who === "self") return [actor];
    const all = companionsOf(actor, { actors: [...game.actors], users: [...game.users] });
    if (who === "familiar") return all.filter((each) => each.type === "familiar");
    if (who === "eidolon") return all.filter(isEidolon);
    return all.filter((each) => each.type !== "familiar" && !isEidolon(each));
}

const focusEntry = (actor) => (actor.itemTypes?.spellcastingEntry ?? []).find((entry) => entry.system?.prepared?.value === "focus");

async function give(feat) {
    const actor = feat.actor;
    if (!actor || !["character", "familiar", "npc"].includes(actor.type)) return;
    for (const grant of grantsIn(feat)) {
        const source = (await fromUuid(grant.uuid))?.toObject?.();
        if (!source) continue;
        for (const holder of holders(actor, grant.who)) {
            if (holder.items.some((item) => sourceOf(item) === grant.uuid)) continue;
            source._stats = { ...(source._stats ?? {}), compendiumSource: grant.uuid };
            source.flags = { ...(source.flags ?? {}), [MODULE_ID]: { grantedBy: { actor: actor.id, item: feat.id } } };
            if (source.type === "spell") {
                const entry = focusEntry(holder);
                if (!entry) {
                    ui.notifications?.info(`${feat.name}: ${holder.name} has no focus spellcasting for ${source.name}; add it by hand.`);
                    continue;
                }
                source.system = { ...(source.system ?? {}), location: { ...(source.system?.location ?? {}), value: entry.id } };
            }
            await holder.createEmbeddedDocuments("Item", [source]);
        }
    }
}

async function takeAway(feat) {
    const actor = feat.actor;
    if (!actor) return;
    for (const holder of [actor, ...companionsOf(actor, { actors: [...game.actors], users: [...game.users] })]) {
        const ids = holder.items.filter((item) => item.flags?.[MODULE_ID]?.grantedBy?.item === feat.id && item.flags[MODULE_ID].grantedBy.actor === actor.id).map((item) => item.id);
        if (ids.length) await holder.deleteEmbeddedDocuments("Item", ids);
    }
}

export function registerGrants() {
    Hooks.on("createItem", (item) => {
        if (isActiveGM() && item.type === "feat") give(item).catch((error) => console.error(`${MODULE_ID} | grants`, error));
    });
    Hooks.on("deleteItem", (item) => {
        if (isActiveGM() && item.type === "feat") takeAway(item).catch((error) => console.error(`${MODULE_ID} | grants`, error));
    });
}

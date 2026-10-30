// The module's own Effects (2026-10-30, docs/feats.md, slice 5): a feat that changes the character's own numbers for a while
// (src/compiler/self-effect.js) puts an Effect with those rules on the character when it's used, as PF2e's own feat Effects do. A stance's
// ends the character's other stance Effects from this module, as taking a new stance ends the last.

const MODULE_ID = "pf2e-automatic-feat-resolution";

const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

export async function applyFeatEffect(item, plan) {
    const actor = item?.actor;
    const effect = plan?.effect;
    if (!actor || !effect?.rules?.length) return null;
    const ours = (each) => each.flags?.[MODULE_ID]?.effect;
    // (Used again: the old one goes, so the time starts over and the bonus doesn't stack with itself.)
    const old = actor.itemTypes.effect.filter((each) => ours(each) && (each.flags[MODULE_ID].effect.source === item.sourceId || each.flags[MODULE_ID].effect.item === item.id || (effect.stance && each.flags[MODULE_ID].effect.stance)));
    if (old.length) await actor.deleteEmbeddedDocuments("Item", old.map((each) => each.id));
    // (A toggled passive's Effect, on: posting it again turns it off.)
    // (Its chat line, on and off, as PF2e-linked toggles have; 2026-10-30 Foundry test.)
    const say = (line) => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${escape(item.name)}</strong>: ${line}</p>` });
    if (plan.toggle && old.length) {
        await say(`Effect: ${escape(effect.name)} ends on ${escape(actor.name)}.`);
        return null;
    }
    const notes = (plan.notes ?? []).map((note) => `<p>${escape(note)}</p>`).join("");
    const [created] = await actor.createEmbeddedDocuments("Item", [{
        name: `${effect.stance ? "Stance" : "Effect"}: ${effect.name}`,
        type: "effect",
        img: item.img,
        flags: { [MODULE_ID]: { effect: { item: item.id, source: item.sourceId ?? null, stance: Boolean(effect.stance) } } },
        system: {
            description: { value: `<p>From <strong>${escape(item.name)}</strong>.</p>${notes}` },
            duration: effect.duration,
            start: { value: game.time.worldTime, initiative: game.combat?.started ? game.combat.combatant?.initiative ?? null : null },
            rules: foundry.utils.deepClone(effect.rules),
            traits: { value: effect.stance ? ["stance"] : [], otherTags: [] },
            tokenIcon: { show: true },
            level: { value: Number(actor.level) || 1 }
        }
    }]);
    if (plan.toggle && created) await say(`Effect: ${escape(effect.name)} on ${escape(actor.name)}.`);
    return created ?? null;
}

// A passive's PF2e Effect (2026-10-30, docs/rules.md, "Toggled Effects"): on each actor that hasn't it, off each that has. Its UUID by name
// in the text ("…feat-effects.Item.Effect: Formation Training") is the pack's entry of that name.
export async function togglePassiveEffect(item, plan, actors) {
    let uuid = plan.effect;
    const parts = /^Compendium\.([\w-]+)\.([\w-]+)\.Item\.(.+)$/.exec(uuid);
    if (parts && !/^[A-Za-z0-9]{16}$/.test(parts[3])) {
        const entry = game.packs.get(`${parts[1]}.${parts[2]}`)?.index?.getName?.(parts[3]);
        if (!entry) return null;
        uuid = `Compendium.${parts[1]}.${parts[2]}.Item.${entry._id}`;
    }
    const effect = await fromUuid(uuid);
    if (!effect) return null;
    const lines = [];
    for (const actor of actors) {
        const had = actor.itemTypes.effect.filter((each) => (each.sourceId ?? each._stats?.compendiumSource) === uuid);
        if (had.length) {
            await actor.deleteEmbeddedDocuments("Item", had.map((each) => each.id));
            lines.push(`${escape(effect.name)} ends on ${escape(actor.name)}.`);
            continue;
        }
        const source = effect.toObject();
        source._stats = { ...(source._stats ?? {}), compendiumSource: uuid };
        foundry.utils.setProperty(source, `flags.${MODULE_ID}.passive`, { item: item.id });
        await actor.createEmbeddedDocuments("Item", [source]);
        lines.push(`${escape(effect.name)} on ${escape(actor.name)}.`);
    }
    if (!lines.length) return null;
    const notes = (plan.notes ?? []).map((note) => `<p>${escape(note)}</p>`).join("");
    return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: item.actor }), content: `<p><strong>${escape(item.name)}</strong>: ${lines.join(" ")}</p>${notes}` });
}

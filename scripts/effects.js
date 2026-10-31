// The module's own Effects (2026-10-30, docs/feats.md, slice 5): a feat that changes the character's own numbers for a while
// (src/compiler/self-effect.js) puts an Effect with those rules on the character when it's used, as PF2e's own feat Effects do. A stance's
// ends the character's other stance Effects from this module, as taking a new stance ends the last.

const MODULE_ID = "pf2e-automatic-feat-resolution";

const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

export async function applyFeatEffect(item, plan, recipients = null) {
    const actor = item?.actor;
    const effect = plan?.effect;
    if (!actor || !effect?.rules?.length) return null;
    const ours = (each) => each.flags?.[MODULE_ID]?.effect;
    const say = (line) => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><strong>${escape(item.name)}</strong>: ${line}</p>` });
    // (On another creature, who "target": its numbers the character's, "@actor.level" worked out here, not the target's own; 2026-10-31.)
    const rules = recipients ? effect.rules.map((rule) => withNumbers(rule, actor.getRollData?.() ?? {})) : effect.rules;
    const lines = [];
    let created = null;
    for (const each of recipients ?? [actor]) {
        // (Used again: the old one goes, so the time starts over and the bonus doesn't stack with itself.)
        const old = each.itemTypes.effect.filter((other) => ours(other) && (other.flags[MODULE_ID].effect.source === item.sourceId || other.flags[MODULE_ID].effect.item === item.id || (effect.stance && other.flags[MODULE_ID].effect.stance)));
        if (old.length) await each.deleteEmbeddedDocuments("Item", old.map((other) => other.id));
        // (A toggled passive's Effect, on: posting it again turns it off.)
        // (Its chat line, on and off, as PF2e-linked toggles have; 2026-10-30 Foundry test.)
        if (plan.toggle && old.length) {
            lines.push(`Effect: ${escape(effect.name)} ends on ${escape(each.name)}.`);
            continue;
        }
        const notes = (plan.notes ?? []).map((note) => `<p>${escape(note)}</p>`).join("");
        [created] = await each.createEmbeddedDocuments("Item", [{
            name: `${effect.stance ? "Stance" : "Effect"}: ${effect.name}`,
            type: "effect",
            img: item.img,
            flags: { [MODULE_ID]: { effect: { item: item.id, source: item.sourceId ?? null, stance: Boolean(effect.stance) } } },
            system: {
                description: { value: `<p>From <strong>${escape(item.name)}</strong>.</p>${notes}` },
                duration: effect.duration,
                start: { value: game.time.worldTime, initiative: game.combat?.started ? game.combat.combatant?.initiative ?? null : null },
                rules: foundry.utils.deepClone(rules),
                traits: { value: effect.stance ? ["stance"] : [], otherTags: [] },
                tokenIcon: { show: true },
                level: { value: Number(actor.level) || 1 },
                ...(recipients ? { context: { origin: { actor: actor.uuid, token: null, item: item.uuid ?? null }, target: null, roll: null } } : {})
            }
        }]);
        if (plan.toggle && created) lines.push(`Effect: ${escape(effect.name)} on ${escape(each.name)}.`);
    }
    if (lines.length) await say(lines.join(" "));
    return created ?? null;
}

// A rule's formulas with the character's numbers in ("5 * floor(@actor.level / 2)" → 3 at 6th level); a formula that isn't arithmetic once
// filled stays as it is.
function withNumbers(rule, data) {
    const fill = (value) => {
        if (typeof value !== "string" || !value.includes("@")) return value;
        const filled = Roll.replaceFormulaData(value, data, { missing: "0" });
        try {
            const total = Roll.safeEval(filled);
            return Number.isFinite(total) ? total : filled;
        } catch {
            return filled;
        }
    };
    return Object.fromEntries(Object.entries(rule).map(([key, value]) => [key, fill(value)]));
}

// A compendium UUID by name, as PF2e's texts link some ("…feat-effects.Item.Effect: Formation Training") → by id, the pack's entry of that
// name; null when the pack has none.
export function byName(uuid) {
    const parts = /^Compendium\.([\w-]+)\.([\w-]+)\.Item\.(.+)$/.exec(String(uuid ?? ""));
    if (!parts || /^[A-Za-z0-9]{16}$/.test(parts[3])) return uuid;
    const entry = game.packs.get(`${parts[1]}.${parts[2]}`)?.index?.getName?.(parts[3]);
    return entry ? `Compendium.${parts[1]}.${parts[2]}.Item.${entry._id}` : null;
}

// A passive's PF2e Effect (2026-10-30, docs/rules.md, "Toggled Effects"): on each actor that hasn't it, off each that has. Its UUID by name
// in the text ("…feat-effects.Item.Effect: Formation Training") is the pack's entry of that name.
export async function togglePassiveEffect(item, plan, actors) {
    const uuid = byName(plan.effect);
    if (!uuid) return null;
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

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
    return created ?? null;
}

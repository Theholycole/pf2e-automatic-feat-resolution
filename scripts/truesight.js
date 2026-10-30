// Truesight's secret counteract checks (2026-10-30, docs/feats.md, "Truesight"): a creature with truesight rolls, secretly and once per
// illusion, a counteract check against each illusion within its range: an illusory creature, an illusion's Effect on a creature
// (Invisibility, Illusory Disguise, Blur), or an illusion's area (a template or region a spell with the illusion trait made). The result is
// whispered to the GMs; nothing is changed on the map (seeing through an illusion is the GM's to describe). The numbers:
// src/compiler/truesight.js.

import { characterDCs } from "./character.js";
import { counteracts, degreeName, degreeOf, illusionRank, truesightCounteract } from "../src/compiler/truesight.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const SETTING = "truesight";
const FLAG = "truesightChecked";

const traitsOf = (document) => new Set(document?.system?.traits?.value ?? document?.traits ?? []);
const finite = (value) => (Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null);

// A caster's DC for its illusion: its best spellcasting DC, an NPC's spell DC, else its class DC.
function spellDCOf(actor) {
    if (!actor) return null;
    const entries = [...(actor.spellcasting?.contents ?? actor.spellcasting ?? [])].map((entry) => finite(entry?.statistic?.dc?.value)).filter(Boolean);
    return entries.length ? Math.max(...entries) : finite(actor.system?.attributes?.spellDC?.value) ?? finite(actor.classDC?.dc?.value) ?? finite(actor.system?.attributes?.classDC?.value);
}

const actorOf = (uuid) => {
    try {
        const found = uuid ? fromUuidSync(uuid) : null;
        return found?.actor ?? (found?.documentName === "Actor" ? found : null);
    } catch {
        return null;
    }
};

const center = (token) => token.object?.center ?? { x: token.x + (token.width * canvas.grid.size) / 2, y: token.y + (token.height * canvas.grid.size) / 2 };

// The scene's illusions: { key, name, rank, dc, point, casterUuid, tokenId? }. Keys without dots: Foundry's flags would nest them.
const keyOf = (kind, uuid) => `${kind}-${String(uuid).replace(/\./g, "_")}`;
async function originSpell(effect) {
    const uuid = effect.system?.context?.origin?.item;
    if (!uuid) return null;
    try {
        return await fromUuid(uuid);
    } catch {
        return null;
    }
}
async function illusionsOn(scene) {
    const found = [];
    for (const token of scene.tokens) {
        const actor = token.actor;
        if (!actor) continue;
        if (traitsOf(actor).has("illusion")) {
            found.push({ key: keyOf("token", token.uuid), name: token.name, rank: illusionRank({ level: actor.level }), dc: spellDCOf(actor), point: center(token), tokenId: token.id });
        }
        for (const effect of actor.itemTypes?.effect ?? []) {
            const origin = effect.origin ?? actorOf(effect.system?.context?.origin?.actor);
            // (Its spell's traits, the whole document: a compendium spell's index entry has none; 2026-10-30 Foundry test.)
            const spell = await originSpell(effect);
            if (!traitsOf(effect).has("illusion") && !traitsOf(spell).has("illusion")) continue;
            found.push({ key: keyOf("effect", effect.uuid), name: `${effect.name} on ${token.name}`, rank: illusionRank({ rank: effect.system?.level?.value ?? spell?.rank }), dc: spellDCOf(origin), point: center(token), tokenId: token.id, casterUuid: origin?.uuid ?? null });
        }
    }
    // (PF2e's Invisibility gives only the Invisible condition: checked as an illusion, its caster's DC and rank when it says where it came
    // from, else the roll to compare by hand.)
    for (const token of scene.tokens) {
        const condition = token.actor?.itemTypes?.condition?.find((each) => each.slug === "invisible");
        if (!condition) continue;
        const origin = actorOf(condition.system?.context?.origin?.actor);
        const spell = await originSpell(condition);
        found.push({ key: keyOf("invisible", condition.uuid), name: `${token.name}'s invisibility`, rank: illusionRank({ rank: spell?.rank }), dc: spellDCOf(origin), point: center(token), tokenId: token.id, casterUuid: origin?.uuid ?? null });
    }
    // (Templates are regions in Foundry 14.)
    const areas = [...(scene.regions ?? [])];
    for (const area of areas) {
        const origin = area.flags?.pf2e?.origin ?? {};
        if (!(origin.traits ?? []).includes("illusion")) continue;
        const caster = actorOf(origin.actor);
        const bounds = area.object?.bounds;
        const point = bounds ? { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 } : { x: area.x ?? area.shapes?.[0]?.x ?? 0, y: area.y ?? area.shapes?.[0]?.y ?? 0 };
        found.push({ key: keyOf("area", area.uuid), name: origin.name ?? area.name ?? "An illusion", rank: illusionRank({ rank: origin.castRank ?? origin.rank }), dc: spellDCOf(caster), point, casterUuid: caster?.uuid ?? null });
    }
    return found;
}

const truesightOf = (actor) => {
    const senses = actor?.perception?.senses;
    const list = senses ? [...(typeof senses.values === "function" ? senses.values() : senses)] : [];
    const sense = list.find((each) => each?.type === "truesight");
    return sense ? { range: finite(sense.range) ?? 60 } : null;
};

const enabled = () => {
    try {
        return game.settings.get(MODULE_ID, SETTING) !== false;
    } catch {
        return true;
    }
};

export function registerTruesight() {
    game.settings.register(MODULE_ID, SETTING, {
        name: "Truesight counteract checks",
        hint: "A creature with truesight rolls a secret counteract check, once per illusion, against each illusion that comes within its range (an illusory creature, an illusion's Effect on a creature, or an illusion's area). The result is whispered to the GMs.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });
}

// (Checks under way, so two map changes at once don't roll twice.)
const rolling = new Set();

// Each creature with truesight on the scene against each illusion in its range it hasn't checked.
async function check(scene) {
    if (!enabled() || !scene || !canvas?.grid || scene !== canvas.scene) return;
    const illusions = await illusionsOn(scene);
    if (!illusions.length) return;
    for (const token of scene.tokens) {
        const actor = token.actor;
        const sight = truesightOf(actor);
        if (!sight) continue;
        const done = actor.getFlag(MODULE_ID, FLAG) ?? {};
        const from = center(token);
        for (const illusion of illusions) {
            const running = `${actor.uuid}|${illusion.key}`;
            if (rolling.has(running)) continue;
            if (done[illusion.key] !== undefined || illusion.tokenId === token.id || illusion.casterUuid === actor.uuid) continue;
            if (canvas.grid.measurePath([from, illusion.point]).distance > sight.range) continue;
            rolling.add(running);
            try {
                await roll(actor, token, illusion);
            } finally {
                rolling.delete(running);
            }
        }
    }
}

async function roll(actor, token, illusion) {
    const dcs = actor.type === "character" || actor.type === "familiar" ? characterDCs(actor) : { spell: spellDCOf(actor) };
    const { modifier, rank } = truesightCounteract(dcs);
    // (Recorded first: one check per illusion, even if two moves land together.)
    await actor.setFlag(MODULE_ID, FLAG, { ...(actor.getFlag(MODULE_ID, FLAG) ?? {}), [illusion.key]: modifier === null ? -1 : null });
    if (modifier === null) return whisper(actor, `<p><strong>${token.name}</strong>'s truesight: no spell or class DC to roll a counteract check against <strong>${illusion.name}</strong>. Roll it by hand.</p>`);
    const dice = await new Roll(`1d20 + ${modifier}`).evaluate();
    const die = dice.dice[0]?.total ?? null;
    const lines = [`<p><strong>${token.name}</strong>'s truesight against <strong>${illusion.name}</strong>: counteract check ${dice.total} (${die} + ${modifier}), rank ${rank}.</p>`];
    if (illusion.dc && illusion.rank) {
        const degree = degreeOf(dice.total, illusion.dc, die);
        const sees = counteracts(degree, rank, illusion.rank);
        await actor.setFlag(MODULE_ID, FLAG, { ...(actor.getFlag(MODULE_ID, FLAG) ?? {}), [illusion.key]: degree });
        lines.push(`<p>Against DC ${illusion.dc}, rank ${illusion.rank}: ${degreeName(degree)}. ${sees ? `${token.name} sees through it.` : `${token.name} doesn't see through it.`}</p>`);
    } else lines.push(`<p>The illusion's ${illusion.dc ? "rank" : "DC"} isn't known: compare it by hand (success counteracts up to rank ${rank + 1}, a critical success up to ${rank + 3}, a failure up to ${rank - 1}).</p>`);
    return whisper(actor, lines.join(""));
}

const whisper = (actor, content) => ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    whisper: game.users.filter((user) => user.isGM).map((user) => user.id),
    flavor: "Truesight (secret)",
    content
});

// Checked a moment after the map changes (several changes at once check once).
let timer = null;
export function truesightSoon(scene = canvas?.scene) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        timer = null;
        check(scene).catch((error) => console.error(`${MODULE_ID} | truesight`, error));
    }, 300);
}

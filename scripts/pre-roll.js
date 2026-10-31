// Before your own roll (round 45, the loop): a reaction or free action used "You attempt a melee Strike against your opponent, but haven't
// rolled yet", "You are about to attempt a check" (src/compiler/event-reminders.js preRollTrigger, event "pre-check"). As PF2e starts the
// check, in an encounter, the roller is asked first: roll, roll and don't ask again this encounter, or stop to use the feat. And another
// character's, "An enemy is about to use an action that requires a skill check or attack roll" (event "pre-check-other"): the roller,
// a creature it's for, is asked the same, the feat's character named.

import { fitsCheck, fitsOthersCheck, preRollTrigger } from "../src/compiler/event-reminders.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
// (The reaction reminders' own setting, scripts/reminders.js; round 45 test: there is no "eventReminders".)
const SETTING = "turnReminders";
const quiet = new Set();
const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
const optionsOf = (context) => [...(context?.options ?? [])];
// (The started encounter the creature is in, not the tracker's viewed one; round 45 test.)
// (By id: a Strike's context.actor is PF2e's contextual clone, not the actor the combatant has; round 45 test.)
const sameActor = (a, b) => Boolean(a && b) && (a === b || (a.uuid && a.uuid === b.uuid) || (!a.isToken && !b.isToken && a.id === b.id));
const encounterOf = (actor) => (game.combats ?? []).find((combat) => combat.started && combat.combatants.some((each) => sameActor(each.actor, actor))) ?? null;
// (The real actor behind the clone: the token's for an unlinked one, else the world's.)
const realActor = (context) => {
    const given = context?.actor;
    if (!given) return null;
    return (given.isToken ? context.token?.actor ?? given.token?.actor : game.actors?.get(given.id)) ?? context.token?.actor ?? given;
};
// (Ally or enemy by PF2e's alliances, isAllyOf; a token's disposition when there's none; round 45 test, Divine Rebuttal on a foe's save.)
const sideOf = (roller, actor, rollerToken, token) => {
    // (A character with no player owner is PF2e's "opposition", as the foes are: by the tokens then; round 48 test.)
    const unowned = (each) => each?.type === "character" && !Object.entries(each.ownership ?? {}).some(([id, level]) => id !== "default" && level >= 3 && !game.users.get(id)?.isGM);
    if (typeof actor.isAllyOf === "function" && !unowned(actor) && !unowned(roller)) return actor.isAllyOf(roller) ? "ally" : actor.isEnemyOf?.(roller) ?? !actor.isAllyOf(roller) ? "enemy" : null;
    return rollerToken && token ? (rollerToken.document.disposition === token.document.disposition ? "ally" : "enemy") : null;
};

function dueFor(given) {
    const context = { ...given, actor: realActor(given) };
    const actor = context.actor;
    const combat = encounterOf(actor);
    if (!actor || !combat) return [];
    const roll = {
        type: context.type,
        statistic: (context.domains ?? []).find((domain) => /^[a-z]+$/.test(domain) && domain !== "check" && domain !== "all") ?? null,
        options: optionsOf(context),
        melee: context.item?.isMelee ?? optionsOf(context).includes("item:melee"),
        ranged: context.item?.isRanged ?? optionsOf(context).includes("item:ranged")
    };
    if (context.type === "skill-check") roll.statistic = (context.domains ?? []).find((domain) => ["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"].includes(domain)) ?? roll.statistic;
    const own = actor.type === "character" ? [...actor.itemTypes.feat, ...actor.itemTypes.action, ...(actor.itemTypes.heritage ?? []), ...(actor.itemTypes.background ?? [])]
        .filter((item) => !quiet.has(`${combat.id}.${actor.id}.${item.id}`))
        .map((item) => ({ item, read: preRollTrigger(item), by: null }))
        .filter(({ read }) => fitsCheck(read, roll)) : [];
    return [...own, ...othersDue(context, roll)];
}

// (Another character's, "A creature within 60 feet is about to attempt an attack roll": each in the encounter that isn't the roller, by its
// side and how far its token is; round 46.)
function othersDue(context, roll) {
    const roller = context?.actor;
    const combat = encounterOf(roller);
    if (!roller || !combat) return [];
    const rollerToken = context.token?.object ?? roller.getActiveTokens?.(true)?.[0] ?? null;
    const out = [];
    for (const combatant of combat.combatants) {
        const actor = combatant.actor;
        if (actor?.type !== "character" || sameActor(actor, roller)) continue;
        const token = combatant.token?.object ?? null;
        const side = sideOf(roller, actor, rollerToken, token);
        for (const item of [...actor.itemTypes.feat, ...actor.itemTypes.action, ...(actor.itemTypes.heritage ?? []), ...(actor.itemTypes.background ?? [])]) {
            if (quiet.has(`${combat.id}.${actor.id}.${item.id}`)) continue;
            const read = preRollTrigger(item);
            if (!fitsOthersCheck(read, roll)) continue;
            if (read.who !== "creature" && read.who !== side) continue;
            if (read.within && !(token && rollerToken && (token.distanceTo?.(rollerToken) ?? Infinity) <= read.within)) continue;
            if (read.againstYou && !sameActor(context.target?.actor, actor)) continue;
            out.push({ item, read, by: actor });
        }
    }
    return out;
}

async function ask(actor, due) {
    const DialogV2 = foundry.applications?.api?.DialogV2;
    if (!DialogV2) return "roll";
    const list = due.map(({ item, read, by }) => `<li>${by ? `${escape(by.name)}: ` : ""}<strong>${escape(item.name)}</strong> (${escape(read.kind)}): ${escape(read.trigger)}</li>`).join("");
    return DialogV2.wait({
        window: { title: `${actor.name}: before you roll` },
        content: `<p>${due.some(({ by }) => by) ? "Before this roll, these can be used (ask their players):" : "You can use this before the roll:"}</p><ul>${list}</ul>`,
        buttons: [
            { action: "roll", label: "Roll", default: true },
            { action: "quiet", label: "Roll, don't ask this encounter" },
            { action: "stop", label: "Stop, use it first" }
        ],
        rejectClose: false
    }).catch(() => "roll");
}

export function registerPreRoll() {
    const Check = game.pf2e?.Check;
    if (!Check?.roll) return console.warn(`${MODULE_ID} | PF2e's Check.roll wasn't found; the before-the-roll reminders are off.`);
    const original = Check.roll;
    Check.roll = async function (check, context = {}, ...rest) {
        try {
            if (game.settings.get(MODULE_ID, SETTING) && !context?.isReroll) {
                const due = dueFor(context);
                if (due.length) {
                    const answer = await ask(realActor(context), due);
                    if (answer === "stop") return null;
                    if (answer === "quiet") for (const { item, by } of due) quiet.add(`${encounterOf(realActor(context))?.id}.${(by ?? realActor(context)).id}.${item.id}`);
                }
            }
        } catch (error) {
            console.error(`${MODULE_ID} | before the roll`, error);
        }
        return original.call(this, check, context, ...rest);
    };
}

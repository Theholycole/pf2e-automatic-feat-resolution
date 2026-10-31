// Before your own roll (round 45, the loop): a reaction or free action used "You attempt a melee Strike against your opponent, but haven't
// rolled yet", "You are about to attempt a check" (src/compiler/event-reminders.js preRollTrigger, event "pre-check"). As PF2e starts the
// check, in an encounter, the roller is asked first: roll, roll and don't ask again this encounter, or stop to use the feat.

import { fitsCheck, preRollTrigger } from "../src/compiler/event-reminders.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const SETTING = "eventReminders";
const quiet = new Set();
const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
const optionsOf = (context) => [...(context?.options ?? [])];

function dueFor(context) {
    const actor = context?.actor;
    if (actor?.type !== "character" || !game.combat?.started) return [];
    if (!game.combat.combatants.some((each) => each.actor === actor)) return [];
    const roll = {
        type: context.type,
        statistic: (context.domains ?? []).find((domain) => /^[a-z]+$/.test(domain) && domain !== "check" && domain !== "all") ?? null,
        options: optionsOf(context),
        melee: context.item?.isMelee ?? optionsOf(context).includes("item:melee"),
        ranged: context.item?.isRanged ?? optionsOf(context).includes("item:ranged")
    };
    if (context.type === "skill-check") roll.statistic = (context.domains ?? []).find((domain) => ["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"].includes(domain)) ?? roll.statistic;
    return [...actor.itemTypes.feat, ...actor.itemTypes.action]
        .filter((item) => !quiet.has(`${game.combat.id}.${actor.id}.${item.id}`))
        .map((item) => ({ item, read: preRollTrigger(item) }))
        .filter(({ read }) => fitsCheck(read, roll));
}

async function ask(actor, due) {
    const DialogV2 = foundry.applications?.api?.DialogV2;
    if (!DialogV2) return "roll";
    const list = due.map(({ item, read }) => `<li><strong>${escape(item.name)}</strong> (${escape(read.kind)}): ${escape(read.trigger)}</li>`).join("");
    return DialogV2.wait({
        window: { title: `${actor.name}: before you roll` },
        content: `<p>You can use this before the roll:</p><ul>${list}</ul>`,
        buttons: [
            { action: "roll", label: "Roll", default: true },
            { action: "quiet", label: "Roll, don't ask this encounter" },
            { action: "stop", label: "Stop, I'll use it first" }
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
                    const answer = await ask(context.actor, due);
                    if (answer === "stop") return null;
                    if (answer === "quiet") for (const { item } of due) quiet.add(`${game.combat.id}.${context.actor.id}.${item.id}`);
                }
            }
        } catch (error) {
            console.error(`${MODULE_ID} | before the roll`, error);
        }
        return original.call(this, check, context, ...rest);
    };
}

// Battle Assessment and Combat Reading in play (src/plans/assessment.js): the active GM's client rolls the secret check against the higher
// of the targeted enemy's Deception and Stealth DCs, tells the GM the roll and what the character learns, and whispers the character's
// players what they learn (nothing on a failure, a false fact on a critical failure, as the GM would make up).
import { ASSESSMENTS, assessmentResult } from "../src/plans/assessment.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const escape = (text) => String(text ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
const DEGREES = ["criticalFailure", "failure", "success", "criticalSuccess"];
const DEGREE_WORDS = { criticalSuccess: "critical success", success: "success", failure: "failure", criticalFailure: "critical failure" };
const gms = () => game.users.filter((user) => user.isGM).map((user) => user.id);
const dcOf = (actor, slug) => Number(actor?.skills?.[slug]?.dc?.value ?? (Number(actor?.skills?.[slug]?.mod) + 10)) || null;
const listOf = (entries) => (entries ?? []).map((entry) => ({ type: entry.type, value: Number(entry.value) || 0 }));

function creatureOf(actor) {
    const attributes = actor.system?.attributes ?? {};
    return {
        level: actor.level,
        weaknesses: listOf(attributes.weaknesses),
        resistances: listOf(attributes.resistances),
        immunities: (attributes.immunities ?? []).map((entry) => entry.type),
        saves: Object.fromEntries(["fortitude", "reflex", "will"].map((key) => [key, Number(actor.saves?.[key]?.mod ?? actor.system?.saves?.[key]?.value)]))
    };
}

// The card for an assessment feat, when the item is one; true when handled.
export async function assessmentCard(item, message) {
    const found = ASSESSMENTS[item?.slug ?? item?.system?.slug];
    if (!found) return false;
    const actor = item.actor;
    const speaker = ChatMessage.getSpeaker({ actor });
    const target = (message.getFlag?.(MODULE_ID, "targets") ?? []).map((uuid) => fromUuidSync(uuid)).find((token) => token?.actor && token.actor !== actor)?.actor ?? null;
    if (!target) {
        await ChatMessage.create({ speaker, whisper: gms(), content: `<p><strong>${escape(item.name)}</strong>: target the enemy first, then post it again.</p>` });
        return true;
    }
    const dcs = [dcOf(target, "deception"), dcOf(target, "stealth")].filter(Number.isFinite);
    const statistic = found.statistic === "perception" ? actor.perception : actor.skills?.[found.statistic];
    if (!dcs.length || !statistic?.roll) {
        await ChatMessage.create({ speaker, whisper: gms(), content: `<p><strong>${escape(item.name)}</strong>: no Deception or Stealth DC for ${escape(target.name)}, or no ${found.label} for ${escape(actor.name)}. Roll it by hand.</p>` });
        return true;
    }
    const dc = Math.max(...dcs);
    const roll = await statistic.roll({ dc: { value: dc }, rollMode: "blindroll", skipDialog: true, extraRollOptions: ["secret", `item:slug:${item.slug}`], label: item.name });
    const degree = DEGREES[roll?.degreeOfSuccess ?? -1] ?? null;
    if (!degree) return true;
    const { lines, false: lie } = assessmentResult(creatureOf(target), degree);
    const learned = lines.length ? `<ul>${lines.map((line) => `<li>${escape(line)}</li>`).join("")}</ul>` : "<p>Nothing useful.</p>";
    await ChatMessage.create({ speaker, whisper: gms(), content: `<p><strong>${escape(item.name)}</strong> on ${escape(target.name)}: ${roll.total} against DC ${dc} (higher of Deception and Stealth), ${DEGREE_WORDS[degree]}.${lie ? " A critical failure: the player is told this false fact." : ""} ${escape(actor.name)} learns:</p>${learned}<p><em>Apply any distance penalty by hand. ${escape(target.name)} is now immune to ${escape(actor.name)}'s ${escape(item.name)} for a day.</em></p>` });
    const players = game.users.filter((user) => !user.isGM && actor.testUserPermission(user, "OWNER")).map((user) => user.id);
    if (players.length) await ChatMessage.create({ speaker, whisper: players, content: `<p><strong>${escape(item.name)}</strong> on ${escape(target.name)}: you learn</p>${learned}` });
    return true;
}

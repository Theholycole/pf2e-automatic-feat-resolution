// Player reactions offered when their trigger happens (round 106, Cole's pick "Player reaction triggers", 2026-10-31): the trigger is a roll
// PF2e posts (a check's degree, a damage roll), and the reaction's effect is something the module can do from the offer card's button: a check
// at a DC from the trigger, the same action against the same target, temporary Hit Points from the damage, or an Effect. scripts/offers.js
// watches on the active GM's client and whispers the character's owners the card; the player decides whether to use it.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const teams = (module, pack, id) => `Compendium.${module}.${pack}.Item.${id}`;

// on: what triggers it.
//   { roll: "skill-check", by: "self"|"ally"|"self-or-ally", skills, actions?, outcomes } — a skill check's degree (actions: the PF2e action slugs
//   it must be for, from the roll's "action:<slug>" option); within: "reach" for a roller in your reach.
//   { roll: "damage-roll", by: "self", damageType } — your damage roll with damage of that type.
// does: what the button does.
//   { kind: "check", statistic, dc: "trigger" (the triggering check's DC) | "target-level" (a standard DC of its target's level) } ;
//   { kind: "same-action" } — the triggering action, against the triggering target;
//   { kind: "temp-hp", half: true } — temporary Hit Points from the triggering damage of that type;
//   { kind: "effect", rules, duration } — an Effect on you; skill: the triggering check's skill fills "{skill}" in the rules.
// untrained: only when you're untrained in the triggering skill.
export const REACTION_OFFERS = [
    {
        uuid: pf2e("48crF8lpg78fRdhJ"), name: "Feed on Pain",
        on: { roll: "damage-roll", by: "self", damageType: "mental" },
        does: { kind: "temp-hp", half: true },
        notes: ["Once per hour. The temporary Hit Points last 1 minute. Against several creatures, use the one that took the most."]
    },
    {
        uuid: teams("pf2e-team-plus-barbarians", "items", "mtSTGFxvzr7Ups8o"), name: "Furious Outburst",
        on: { roll: "skill-check", by: "self-or-ally", skills: ["diplomacy"], actions: ["make-an-impression"], outcomes: ["failure", "criticalFailure"] },
        does: { kind: "check", statistic: "intimidation", dc: "trigger" },
        notes: ["Your Intimidation result replaces the triggering check's. The DC is 2 lower if the creature was indifferent or better."]
    },
    {
        uuid: teams("pf2e-team-plus-feats", "pf2e-player-options", "i4bw2SfXHwelysBR"), name: "Friends in High Places",
        on: { roll: "skill-check", by: "self-or-ally", skills: ["diplomacy", "intimidation"], outcomes: ["failure", "criticalFailure"], target: true },
        does: { kind: "check", statistic: "society", dc: "target-level" },
        notes: ["Only against a creature who serves nobility or an organization. On a success the triggering check can be rerolled with a +1 circumstance bonus (+2 on a critical success)."]
    },
    {
        uuid: pf2e("5RbVfudZQrlHjIVh"), name: "Repeat Lesson",
        on: { roll: "skill-check", by: "ally", skills: ["athletics"], actions: ["disarm", "grapple", "reposition", "shove", "trip"], outcomes: ["failure", "criticalFailure"], target: true, targetWithin: "reach" },
        does: { kind: "same-action" },
        notes: ["Your student's failed action. You must meet its requirements."]
    },
    {
        uuid: pf2e("nU8W1QoA9hl3h6nR"), name: "Watch and Learn",
        on: { roll: "skill-check", by: "ally", skills: ["athletics", "acrobatics", "stealth", "thievery"], outcomes: ["success", "criticalSuccess"] },
        untrained: true,
        does: { kind: "effect", rules: [{ key: "FlatModifier", selector: "{skill}", type: "proficiency", value: "@actor.level", label: "Watch and Learn" }], duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false } },
        notes: ["Your level as a proficiency bonus to that skill for 1 minute. Not trained actions."]
    }
];
const BY_UUID = new Map(REACTION_OFFERS.map((entry) => [entry.uuid, entry]));
export const offerOf = (uuid) => BY_UUID.get(uuid) ?? null;

// The triggering roll, read from a PF2e chat message's context: { roll, skill, action, outcome, dc, damage: { type: total } }.
export function rollOf(context, damageTotals = null) {
    if (!context?.type) return null;
    const options = context.options ?? [];
    const action = options.find((option) => /^action:[a-z-]+$/.test(option))?.slice(7) ?? null;
    const domains = context.domains ?? [];
    const skill = context.type === "skill-check" ? (domains.find((domain) => SKILLS.has(domain)) ?? null) : null;
    return { roll: context.type, skill, action, outcome: context.outcome ?? null, dc: Number(context.dc?.value) || null, damage: damageTotals ?? {} };
}
const SKILLS = new Set(["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"]);

// Whether the entry's trigger is this roll. who: "self" (the character rolled it) or "ally" (an ally did). untrained: the character's rank in
// the roll's skill is 0. hasTarget: the roll had a target; inReach: the roller is in the character's reach (for targetWithin "reach").
export function offerFits(entry, roll, { who, untrainedIn = () => false, hasTarget = false, inReach = true } = {}) {
    const on = entry?.on;
    if (!on || !roll || on.roll !== roll.roll) return false;
    if (!(on.by === who || (on.by === "self-or-ally" && ["self", "ally"].includes(who)))) return false;
    if (on.roll === "damage-roll") return (roll.damage?.[on.damageType] ?? 0) > 0;
    if (on.skills && !on.skills.includes(roll.skill)) return false;
    if (on.actions && !on.actions.includes(roll.action)) return false;
    if (on.outcomes && !on.outcomes.includes(roll.outcome)) return false;
    if (on.target && !hasTarget) return false;
    if (on.targetWithin === "reach" && !inReach) return false;
    if (entry.untrained && !untrainedIn(roll.skill)) return false;
    return true;
}

// PF2e's standard DCs by level (Core Rulebook table 10-5), for "a standard DC of the creature's level".
// (From level −1, 13.)
const LEVEL_DCS = [13, 14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 42, 44, 46, 48, 50];
export const levelDC = (level) => LEVEL_DCS[Math.max(-1, Math.min(25, Number(level) || 0)) + 1] ?? null;

// The temporary Hit Points from the triggering damage.
export const tempHPFrom = (entry, roll) => Math.floor((roll.damage?.[entry.on.damageType] ?? 0) / (entry.does.half ? 2 : 1));

// The Effect's rules with the triggering skill filled in.
export const effectRulesFor = (entry, roll) => (entry.does.rules ?? []).map((rule) => JSON.parse(JSON.stringify(rule).replaceAll("{skill}", roll.skill ?? "skill-check")));

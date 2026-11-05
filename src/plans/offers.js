// Player reactions offered when their trigger happens (round 106, Cole's pick "Player reaction triggers", 2026-10-31): the trigger is a roll
// PF2e posts (a check's degree, a damage roll), and the reaction's effect is something the module can do from the offer card's button: a check
// at a DC from the trigger, the same action against the same target, temporary Hit Points from the damage, or an Effect. scripts/offers.js
// watches on the active GM's client and whispers the character's owners the card; the player decides whether to use it.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const teams = (module, pack, id) => `Compendium.${module}.${pack}.Item.${id}`;

// on: what triggers it.
//   { roll: "skill-check", by: "self"|"ally"|"self-or-ally", skills, actions?, outcomes } — a skill check's degree (actions: the PF2e action slugs
//   it must be for, from the roll's "action:<slug>" option); within: "reach" for a roller in your reach.
//   { roll: "damage-roll", by: "self", damageType?, ranged? } — your damage roll with damage of that type (ranged: a ranged Strike's).
//   { roll: "attack-roll", by, ranged?, outcomes } — an attack roll's degree (ranged: a ranged attack's).
//   weapons: only an attack with one of those weapons (its "item:slug:<slug>").
//   { roll: "saving-throw", by, saves?, outcomes } — a save's degree (saves: which of fortitude, reflex and will).
//   Any of them with traits: only a roll against something with one of those traits ("item:trait:<trait>" or "origin:item:trait:<trait>" among its options); notTraits: only one against none of them.
// does: what the button does.
//   { kind: "check", statistic, dc: "trigger" (the triggering check's DC) | "target-level" (a standard DC of its target's level) } ;
//   { kind: "same-action", action? } — the triggering action (or that PF2e action, Windborne Shove's shove), against the triggering target;
//   { kind: "temp-hp", half: true } — temporary Hit Points from the triggering damage of that type;
//   { kind: "effect", rules, duration, tempHP? } — an Effect on you; skill: the triggering check's skill fills "{skill}" in the rules;
//   who "target": the Effect on the triggering roll's target instead (Sly Disarm's off-guard, GrantItem);
//   { kind: "condition", slug, value } — a condition on the triggering roll's target (Sickening Bite's sickened);
//   tempHP: a formula of yours ("floor(@actor.level/2)"), temporary Hit Points gained with it; doubledWith: a trait the triggering roll
//   was against that doubles both (Resounding Bravery's fear);
//   { kind: "replace-d20" } — a d20 the triggering roll uses instead of its own, its new total and degree against the same DC;
//   { kind: "reroll-damage" } — the triggering damage rolled again, the higher to keep;
//   { kind: "reroll", keep? } — PF2e's reroll of the triggering check, the new result kept, or keep "lower" (Black Cat Curse) or "higher"
//   (Cat's Luck). With a list of rolls, skills and saves filter only their own kind of roll (Lucky Break).
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
    },
    // (Round 107.)
    {
        uuid: pf2e("HKNOA5WGBWGEpdmH"), name: "Redirecting Shot",
        on: { roll: "attack-roll", by: "ally", ranged: true, outcomes: ["failure", "criticalFailure"] },
        does: { kind: "replace-d20" },
        notes: ["Needs a loaded firearm or crossbow, which you discharge; the ally's attack uses a thrown weapon or ammunition, and its target is in your first range increment. The attack also ignores lesser or standard cover and the concealed flat check (not in the new total)."]
    },
    {
        uuid: teams("pf2e-team-plus-feats", "pf2e-misc", "Ig9HaamKNFhmhIYk"), name: "Pinpoint Assault",
        on: { roll: "damage-roll", by: "self", ranged: true },
        does: { kind: "reroll-damage" },
        notes: ["Only against the required enemy of Honed-Shot Precision. Take the higher of the two."]
    },
    // (Passives whose rider follows a roll of the character's: the same card, its button the rider; 2026-11-05, Cole's pick "Passive riders as
    // live hooks".)
    {
        uuid: pf2e("dTO1ShJovbzrKUY4"), name: "Resounding Bravery",
        on: { roll: "saving-throw", by: "self", saves: ["will"], outcomes: ["criticalSuccess"] },
        does: { kind: "effect", rules: [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: 1 }], duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false }, tempHP: "floor(@actor.level/2)", doubledWith: "fear" },
        notes: ["Only against a foe's ability. Doubled against a fear effect (the card doubles it when the save's roll says fear)."]
    },
    {
        uuid: pf2e("0YtidWmL4GTpONkq"), name: "Hell's Bane",
        on: { roll: "skill-check", by: "self", actions: ["recall-knowledge"], outcomes: ["criticalSuccess"] },
        does: { kind: "effect", rules: [{ key: "FlatModifier", selector: "damage", type: "status", value: 4, predicate: [{ or: ["target:trait:devil", "target:trait:hellknight"] }] }], duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false } },
        notes: ["Only for Recall Knowledge about a devil or Hellknight, and only against that creature: the bonus is set for any devil, so remove it if you fight another."]
    },
    {
        uuid: pf2e("G0Iw8ltK3Dfav8B8"), name: "Avowed Insight",
        on: { roll: "skill-check", by: "self", actions: ["recall-knowledge"], outcomes: ["success", "criticalSuccess"] },
        does: { kind: "effect", rules: [{ key: "FlatModifier", selector: ["ac", "saving-throw"], type: "circumstance", value: 1 }], duration: { value: 1, unit: "rounds", expiry: "turn-start", sustained: false } },
        notes: ["Only Recall Knowledge about the creature type your vow names, and only against that creature's attacks and abilities: remove the Effect otherwise."]
    },
    {
        uuid: pf2e("Aww98EQXcigRhY3v"), name: "Sickening Bite",
        on: { roll: "attack-roll", by: "self", weapons: ["jaws"], outcomes: ["criticalSuccess"] },
        does: { kind: "condition", slug: "sickened", value: 1 },
        notes: ["A disease effect, on a living creature. If you're satiated you can end it to do the same on a regular hit (apply Sickened 1 by hand). The GM applies it when the target isn't yours."]
    },
    {
        uuid: pf2e("C9QVzHuUznMfFQ7C"), name: "Sly Disarm",
        on: { roll: "skill-check", by: "self", skills: ["thievery"], actions: ["disarm"], outcomes: ["success", "criticalSuccess"], target: true },
        does: { kind: "effect", who: "target", rules: [{ key: "GrantItem", uuid: "Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg" }], duration: { value: 0, unit: "rounds", expiry: "turn-end", sustained: false } },
        notes: ["Off-guard only against your next attack this turn: remove the Effect after it. The GM applies it when the target isn't yours."]
    },
    {
        uuid: pf2e("VB1UK3KA5uZcxC05"), name: "Internal Dialogue",
        on: { roll: "skill-check", by: "self", outcomes: ["failure"] },
        does: { kind: "check", statistic: "incarnation-lore", dc: "trigger" },
        notes: ["Once per 10 minutes. The Incarnation Lore result replaces the failed check's."]
    },
    {
        uuid: pf2e("zodscjgydZRUSOLO"), name: "Focus Ally",
        on: { roll: "saving-throw", by: "ally", outcomes: ["failure"], traits: ["incapacitation"], targetWithin: "reach" },
        does: { kind: "reroll" },
        notes: ["Only an adjacent ally. It must take the second result. The GM presses the button when the save isn't yours."]
    },
    {
        uuid: pf2e("DMjfZvWD20SGuIO4"), name: "Show-Off",
        on: { roll: "skill-check", by: "self", skills: ["acrobatics", "athletics"], outcomes: ["success", "criticalSuccess"] },
        does: { kind: "reroll" },
        notes: ["Once per minute, and only a check the GM deems challenging. You must use the second result. On a success you gain the check's result and a +1 circumstance bonus to your next attack roll; on a failure you're off-guard until the start of your next turn."]
    },
    {
        uuid: pf2e("dmw79BbtUCJd300O"), name: "Correct the Story",
        on: { roll: ["attack-roll", "saving-throw"], by: "other", outcomes: ["criticalSuccess"] },
        does: { kind: "reroll" },
        notes: ["Spend a Mythic Point. Only an enemy's roll: it must take the new result. The GM presses the button."]
    },
    {
        uuid: pf2e("fX5FybM93HIQRRd1"), name: "Black Cat Curse",
        on: { roll: "saving-throw", by: "other", outcomes: ["success", "criticalSuccess"], within: 30 },
        does: { kind: "reroll", keep: "lower" },
        notes: ["Once per day, a creature you can see. It takes the worse result. The GM presses the button."]
    },
    {
        uuid: pf2e("fjk8VsNDkVv1rjiu"), name: "Windborne Shove",
        on: { roll: "attack-roll", by: "self", melee: true, outcomes: ["criticalSuccess"], target: true },
        does: { kind: "same-action", action: "shove" },
        notes: ["A free action. You can spend a Mythic Point to Shove at mythic proficiency."]
    },
    {
        uuid: pf2e("ztxbGySxIEeWvsAT"), name: "Pact of Infernal Prowess",
        on: { roll: ["skill-check", "saving-throw", "attack-roll"], by: "self", outcomes: ["criticalFailure"] },
        does: { kind: "reroll" },
        notes: ["Once per hour, a free action; a fortune effect. You take the new result."]
    },
    {
        uuid: pf2e("7qBuzHY8kEG8SdEP"), name: "Cat's Luck",
        on: { roll: "saving-throw", by: "self", saves: ["reflex"], outcomes: ["failure", "criticalFailure"] },
        does: { kind: "reroll", keep: "higher" },
        notes: ["Once per day, a free action; a fortune effect. You use the better result."]
    },
    {
        uuid: pf2e("lF5B49zbDG61sxXa"), name: "Lucky Break",
        on: { roll: ["saving-throw", "skill-check"], by: "self", saves: ["fortitude", "will"], skills: ["acrobatics", "athletics"], outcomes: ["failure", "criticalFailure"] },
        does: { kind: "reroll", keep: "higher" },
        notes: ["Cat's Luck, on these rolls too: still once per day in all. You use the better result."]
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
    const save = context.type === "saving-throw" ? (domains.find((domain) => SAVES.has(domain)) ?? context.statistic ?? null) : null;
    const weapon = options.find((option) => /^item:slug:[a-z0-9-]+$/.test(option))?.slice(10) ?? null;
    const traits = [...new Set(options.map((option) => /^(?:origin:)?item:trait:([a-z-]+)$/.exec(option)?.[1]).filter(Boolean))];
    const ranged = options.includes("item:ranged") || domains.some((domain) => /^ranged-(?:strike-)?(?:attack-roll|damage)$/.test(domain));
    return { roll: context.type, skill, ...(save ? { save } : {}), ...(traits.length ? { traits } : {}), ...(weapon ? { weapon } : {}), action, outcome: context.outcome ?? null, dc: Number(context.dc?.value) || null, damage: damageTotals ?? {}, ranged };
}
const SAVES = new Set(["fortitude", "reflex", "will"]);
const SKILLS = new Set(["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"]);

// Whether the entry's trigger is this roll. who: "self" (the character rolled it) or "ally" (an ally did). untrained: the character's rank in
// the roll's skill is 0. hasTarget: the roll had a target; inReach: the roller is in the character's reach (for targetWithin "reach").
// distance: feet between the character and the roller (for within).
export function offerFits(entry, roll, { who, untrainedIn = () => false, hasTarget = false, inReach = true, distance = Infinity } = {}) {
    const on = entry?.on;
    if (!on || !roll || ![].concat(on.roll).includes(roll.roll)) return false;
    if (!(on.by === who || (on.by === "self-or-ally" && ["self", "ally"].includes(who)))) return false;
    if (on.ranged && !roll.ranged) return false;
    if (on.melee && roll.ranged) return false;
    if (roll.roll === "damage-roll") return !on.damageType || (roll.damage?.[on.damageType] ?? 0) > 0;
    if (on.skills && roll.roll === "skill-check" && !on.skills.includes(roll.skill)) return false;
    if (on.saves && roll.roll === "saving-throw" && !on.saves.includes(roll.save)) return false;
    if (on.weapons && !on.weapons.includes(roll.weapon)) return false;
    if (on.traits && !on.traits.some((trait) => (roll.traits ?? []).includes(trait))) return false;
    if (on.notTraits && on.notTraits.some((trait) => (roll.traits ?? []).includes(trait))) return false;
    if (on.actions && !on.actions.includes(roll.action)) return false;
    if (on.outcomes && !on.outcomes.includes(roll.outcome)) return false;
    if (on.target && !hasTarget) return false;
    if (on.targetWithin === "reach" && !inReach) return false;
    if (on.within && !(distance <= on.within)) return false;
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
export const doubled = (entry, roll) => Boolean(entry.does.doubledWith && (roll.traits ?? []).includes(entry.does.doubledWith));
export const effectRulesFor = (entry, roll) => (entry.does.rules ?? []).map((rule) => JSON.parse(JSON.stringify(rule).replaceAll("{skill}", roll.skill ?? "skill-check")))
    .map((rule) => (doubled(entry, roll) && typeof rule.value === "number" ? { ...rule, value: rule.value * 2 } : rule));

// A d20 in place of the triggering roll's: its new total and degree against the same DC (a natural 20 or 1 one step better or worse).
export function withD20(total, oldDie, newDie, dc) {
    const value = total - oldDie + newDie;
    if (!Number.isFinite(dc)) return { total: value, degree: null };
    let step = value >= dc + 10 ? 3 : value >= dc ? 2 : value <= dc - 10 ? 0 : 1;
    if (newDie === 20) step = Math.min(3, step + 1);
    if (newDie === 1) step = Math.max(0, step - 1);
    return { total: value, degree: ["criticalFailure", "failure", "success", "criticalSuccess"][step] };
}

// Actions that follow the character's last Strike (round 108, Cole's pick "Strike riders"): "Your last action was a successful Strike …".
// Posting the feat finds that Strike (scripts/offers.js keeps each character's last attack and its damage) and whispers a card whose buttons
// do the rest: { kind: "heal-half" } regains half its damage; { kind: "choose-action", actions } takes one of those actions against the same
// foe. needs: the Strike's degrees it needs.
export const AFTER_STRIKE = [
    {
        uuid: "Compendium.pf2e.actionspf2e.Item.vZwa0PZLQvm3X5ME", name: "Drink of my Foes",
        needs: ["success", "criticalSuccess"], does: { kind: "heal-half" },
        notes: ["Your last action must have been that Strike, with the Barrow's Edge."]
    },
    {
        uuid: pf2e("NDbNNMouxnnwBqwm"), name: "Explosive Maneuver",
        needs: ["success", "criticalSuccess"], does: { kind: "choose-action", actions: ["grapple", "shove", "trip"] },
        notes: ["With your weapon innovation, which needs the trait of the action you choose. The same multiple attack penalty as that Strike (set it in PF2e's dialog), and it still rises after."]
    }
];
const AFTER_BY_UUID = new Map(AFTER_STRIKE.map((entry) => [entry.uuid, entry]));
export const afterStrikeOf = (uuid) => AFTER_BY_UUID.get(uuid) ?? null;

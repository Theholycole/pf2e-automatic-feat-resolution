// Damage back on a creature that hits or grabs you (round 57, Cole's scope "triggered combat feats"): "Creatures that hit you with an
// attack take 3d6 spirit damage" (Inviolable). scripts/retaliation.js rolls it on the active GM's client as PF2e posts the attack or
// maneuver aimed at the character, the attacker named on the damage card.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

// on: "hit" (an attack roll that hits), "maneuver" (a successful check with one of the actions against you). unarmed: only an unarmed
// attack. adjacent: only from an adjacent creature. requires: roll options the character must have. oncePerTurn: once per attacker per
// turn.
export const RETALIATIONS = [
    { uuid: pf2e("jtstZYC8S4YmAbIE"), name: "Inviolable", on: ["hit"], formula: "3d6", type: "spirit" },
    { uuid: pf2e("PdQAAKtCW5dS9IYj"), name: "Inner Fire (Monk)", on: ["hit", "maneuver"], actions: ["grab", "grapple"], unarmed: true, requires: ["self:effect:stoked-flame-stance"], formula: "max(1,@actor.abilities.wis.mod)", type: "fire", oncePerTurn: true },
    { uuid: pf2e("B9IytVeJ1SMSJawB"), name: "Defensive Needles", on: ["hit", "maneuver"], actions: ["grapple"], unarmed: true, adjacent: true, formula: "ceil(@actor.level/4)", type: "piercing" },
    { uuid: pf2e("U5FcfRvveTKtgebq"), name: "Torch Goblin", on: ["maneuver"], actions: ["grapple", "shove", "trip"], requires: ["self:condition:persistent-damage:fire"], formula: "1d6", type: "fire", note: "If it used a weapon for the maneuver, the weapon takes the damage instead." },
    { uuid: pf2e("hPanopG3TbXKr52O"), name: "Pesh Skin", on: ["hit"], melee: true, adjacent: true, requires: ["self:trait:plant"], formula: "1d6", type: "piercing", note: "2d6 if your polymorph spell is 8th rank or higher, 3d6 at 10th: roll the rest by hand." }
];
const BY_UUID = new Map(RETALIATIONS.map((entry) => [entry.uuid, entry]));

// What the roll is to the character it's aimed at: "hit" for an attack roll that hits, "maneuver:<slug>" for a successful maneuver.
export function eventOf(context) {
    const success = ["success", "criticalSuccess"].includes(context?.outcome);
    if (!success) return null;
    if (["attack-roll", "spell-attack-roll"].includes(context?.type)) return { kind: "hit", options: context.options ?? [] };
    const action = (context?.options ?? []).find((option) => /^action:(?:grab|grapple|shove|trip)$/.test(option));
    if (context?.type === "skill-check" && action) return { kind: "maneuver", action: action.slice(7), options: context.options ?? [] };
    return null;
}

// The entries due: the character's items (by source), its roll options, the event, and the distance in feet (null: unknown).
export function retaliationsFor(items, sourceOf, selfOptions, event, distance) {
    if (!event) return [];
    const has = new Set(selfOptions ?? []);
    const unarmed = event.options.includes("item:category:unarmed") || event.options.includes("item:trait:unarmed");
    const melee = event.options.includes("item:melee") || (!event.options.includes("item:ranged") && unarmed);
    return [...(items ?? [])].map((item) => BY_UUID.get(sourceOf(item))).filter(Boolean).filter((entry) => {
        if (!entry.on.includes(event.kind)) return false;
        if (event.kind === "maneuver" && !(entry.actions ?? []).includes(event.action)) return false;
        if (event.kind === "hit" && entry.unarmed && !unarmed) return false;
        if (event.kind === "hit" && entry.melee && !melee) return false;
        if (entry.adjacent && distance !== null && distance > 5) return false;
        return (entry.requires ?? []).every((option) => has.has(option));
    });
}

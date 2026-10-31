// The rule elements a master's feats give its companion (2026-10-31, the loop): an evolution feat on the summoner's sheet ("Your eidolon
// gains darkvision") is the eidolon's. scripts/rules.js puts them on the companion's ancestry as it prepares, as the module's own rules on a
// character's feats are (src/rules/index.js), when its master (src/compiler/companion.js findMaster) has the feat.

import { sourceOf } from "./index.js";

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const classFeature = (id) => `Compendium.pf2e.classfeatures.Item.${id}`;
const hasItem = (master, uuid) => (master?.items ?? []).some((item) => sourceOf(item) === uuid);
const hasSlug = (master, slug) => (master?.items ?? []).some((item) => item.slug === slug || item.system?.slug === slug);
const sense = (selector, acuity = null, range = null) => ({ key: "Sense", selector, ...(acuity ? { acuity } : {}), ...(range ? { range } : {}) });

export const COMPANION_RULES = [
    { uuid: pf2e("rPzEnABFjkbOARiB"), name: "Expanded Senses", rules: [sense("low-light-vision"), sense("darkvision"), sense("scent", "imprecise", 30)] },
    { uuid: pf2e("TgYs2m9scSyEJwdr"), name: "Vibration Sense", rules: [{ ...sense("tremorsense", "imprecise", 30), predicate: [{ not: "self:trait:aquatic" }] }, { ...sense("wavesense", "imprecise", 30), predicate: [{ or: ["self:trait:aquatic", "self:trait:amphibious"] }] }] },
    { uuid: pf2e("IeiTuTZExH5DQOqH"), name: "Burrowing Form", rules: [{ key: "BaseSpeed", selector: "burrow", value: 15 }] },
    { uuid: pf2e("a6xUSibsRaclbSz3"), name: "Ever-Vigilant Senses", rules: [{ key: "FlatModifier", selector: "perception", type: "circumstance", value: 2 }] },
    // (Its horse's: only an animal companion that's a horse has it, and only a horse's master takes the feat.)
    { uuid: pf2e("g64AWb9hj46ZmhlR"), name: "Chiardmar Steed", rules: [{ key: "FlatModifier", selector: "land-speed", type: "status", value: 5 }] },
    // (Batch 9: a dragon companion's fly Speed, a megafauna companion's size, a construct innovation's climb Speed as its land Speed.)
    { uuid: pf2e("RkaE55TeCvwmQq7E"), name: "Wing Rider", rules: [{ key: "BaseSpeed", selector: "fly", value: 25 }] },
    { uuid: pf2e("HxTqYtXRqFkkLfDQ"), name: "Gigantic Megafauna Companion", rules: [{ key: "CreatureSize", value: "huge", reach: { upgrade: 15 } }] },
    { uuid: "Compendium.pf2e-team-plus-inventors.inventors-features.Item.MYqJqQAi6B5WlZpK", name: "Climbing Limbs+", rules: [{ key: "BaseSpeed", selector: "climb", value: "@actor.system.movement.speeds.land.value" }] },
    // (Batch 11: more evolution feats said outright.)
    { uuid: pf2e("h8OB6zcdIqUPS6PC"), name: "Airborne Form", rules: [{ key: "BaseSpeed", selector: "fly", value: "@actor.system.movement.speeds.land.value" }] },
    { uuid: pf2e("N02sHmzuF9XQj93m"), name: "Resilient Shell", rules: [{ key: "Resistance", type: "physical", value: "ternary(gte(@actor.level,17),6,5)" }] },
    { uuid: pf2e("U6lS758rtYGR6aw9"), name: "Amphibious Form", rules: [{ key: "ActorTraits", add: ["amphibious"] }] },
    { uuid: pf2e("cTTOH6yJibgvRlLX"), name: "Demon-Hunting Companion", rules: [sense("scent", "imprecise", 30)] },
    { uuid: pf2e("Veaf8vm2M9w8bcBI"), name: "Alacritous Action", rules: [{ key: "FlatModifier", selector: "land-speed", value: 10 }] },
    // (An apocalypse mount's fly Speed as its land Speed.)
    { uuid: pf2e("XHbdG50JIO8pEaQ4"), name: "Night Terror", rules: [{ key: "BaseSpeed", selector: "fly", value: "@actor.system.movement.speeds.land.value" }] },
    // (Round 42, evolution feats and the summoner's eidolon features: size, unarmed specialization, proficiency.)
    { uuid: pf2e("H6qletvAJUCC1aIa"), name: "Hulking Size", rules: (master) => (hasItem(master, pf2e("ixIKF2LMmbFthI8Z")) ? [] : [{ key: "CreatureSize", value: "large", reach: { upgrade: 10 } }]) },
    { uuid: pf2e("ixIKF2LMmbFthI8Z"), name: "Towering Size", rules: [{ key: "CreatureSize", value: "huge", reach: { upgrade: 15 } }] },
    { uuid: classFeature("oCnyGRvkfjTsZXcX"), name: "Eidolon Weapon Specialization", rules: [
        { key: "FlatModifier", selector: "unarmed-damage", slug: "weapon-specialization", label: "PF2E.WeaponSpecialization", value: 2, hideIfDisabled: true, predicate: [{ gte: ["item:proficiency:rank", 2] }] },
        { key: "AdjustModifier", mode: "upgrade", selector: "unarmed-damage", slug: "weapon-specialization", value: 3, priority: 0, predicate: ["item:proficiency:rank:3"] },
        { key: "AdjustModifier", mode: "upgrade", selector: "unarmed-damage", slug: "weapon-specialization", value: 4, priority: 0, predicate: ["item:proficiency:rank:4"] }] },
    { uuid: classFeature("B5SyM7qHrU0gTGR0"), name: "Greater Eidolon Specialization", rules: [{ key: "AdjustModifier", mode: "multiply", selector: "unarmed-damage", slug: "weapon-specialization", value: 2 }] },
    { uuid: pf2e("pKttKO84dxzRLBIC"), name: "Expert Combat Eidolon", rules: (master) => [
        { key: "ActiveEffectLike", mode: "upgrade", path: "system.proficiencies.attacks.unarmed.rank", value: 2 },
        ...((master?.system?.proficiencies?.defenses?.unarmored?.rank ?? 0) >= 2 ? [{ key: "ActiveEffectLike", mode: "upgrade", path: "system.proficiencies.defenses.unarmored.rank", value: 2 }] : []),
        ...(hasSlug(master, "weapon-specialization") ? [{ key: "FlatModifier", selector: "unarmed-damage", slug: "weapon-specialization", label: "PF2E.WeaponSpecialization", value: 2, hideIfDisabled: true, predicate: [{ gte: ["item:proficiency:rank", 2] }] }] : [])] },
    { uuid: pf2e("lpG7ZXFDZygmkbH4"), name: "Bloodletting Claws", rules: [{ key: "Note", selector: "unarmed-attack-roll", outcome: ["criticalSuccess"], predicate: [{ or: ["item:damage:type:slashing", "item:damage:type:piercing"] }, "item:melee"], title: "Bloodletting Claws", text: "The target takes @Damage[(1d6+@item.system.runes.potency)[persistent,bleed]] damage." }] },
    // (Round 49: "When one of your companions rolls a success on a saving throw, it gets a critical success instead.")
    { uuid: pf2e("WlFJyOz73m67HmW2"), name: "Heightened Instincts", rules: [{ key: "AdjustDegreeOfSuccess", selector: "saving-throw", adjustment: { success: "one-degree-better" } }] },
    // (Round 52: a companion's skill and creature type.)
    { uuid: pf2e("mXNwdRSM9kZrT2Um"), name: "Fell Rider", rules: [{ key: "ActiveEffectLike", mode: "upgrade", path: "system.skills.intimidation.rank", value: 1 }] },
    { uuid: pf2e("espST21gwaZQFxpw"), name: "Undead Companion", rules: [{ key: "ActorTraits", add: ["undead"], remove: ["animal"] }, { key: "ActiveEffectLike", mode: "override", path: "system.attributes.hp.negativeHealing", value: true }] },
    // (Round 58: as PF2e's own Agile Grace.)
    { uuid: pf2e("UANazM5XMYdMkVtX"), name: "Nimble Form", rules: [{ key: "MultipleAttackPenalty", selector: "attack", predicate: ["item:trait:agile"], value: -3 }] },
    // (Clerics+ sacred animal: bright light 20 feet, dim 20 more; it can suppress it, by turning the light off on its token.)
    { uuid: "Compendium.clerics-remaster.clerics-features.Item.yNMcUM88PbPkko2t", name: "Sheathed in Light", rules: [{ key: "TokenLight", value: { bright: 20, dim: 40 } }] },
    { uuid: "Compendium.pf2e-summoners-plus.misc.Item.nyiF0IeEkmEYEAMZ", name: "Faydhaan", rules: [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: 1, predicate: ["item:trait:water"] }] },
    // (Round 77: a winged companion's gust; its master takes the feat for it.)
    { uuid: pf2e("um6NtNmEpWxGelom"), name: "Billowing Wings", rules: [
        { key: "Strike", category: "unarmed", group: "brawling", slug: "gust", label: "Gust", img: "systems/pf2e/icons/unarmed-attacks/wing.webp", damage: { base: { damageType: "bludgeoning", dice: 1, die: "d4" } }, range: { increment: 30 }, traits: ["air", "propulsive", "unarmed"] },
        { key: "Note", selector: "strike-attack-roll", predicate: ["item:slug:gust"], outcome: ["criticalSuccess"], title: "Billowing Wings", text: "The target is pushed back 5 feet (forced movement)." }] },
    // (Round 71: 2d4 for a specialized companion is the player's to add.)
    { uuid: pf2e("6B7ksTtpbfp114sA"), name: "Nature's Precision", rules: [{ key: "DamageDice", selector: "strike-damage", diceNumber: 1, dieSize: "d4", category: "precision", predicate: ["target:condition:off-guard", "item:category:unarmed", { or: ["item:trait:agile", "item:trait:finesse"] }] }] }
];

const BY_UUID = new Map(COMPANION_RULES.map((entry) => [entry.uuid, entry]));

// The rules a companion gets from its master's items: each entry's, once, with the feat's name as its label.
export function companionRulesFrom(master) {
    const out = [];
    for (const item of master?.items ?? []) {
        const entry = BY_UUID.get(sourceOf(item));
        if (entry) out.push(...(typeof entry.rules === "function" ? entry.rules(master) : entry.rules).map((rule) => ({ label: item.name, ...rule })));
    }
    return out;
}

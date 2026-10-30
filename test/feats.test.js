import test from "node:test";
import assert from "node:assert/strict";

import { characterStrike, compileFeat, dcFor, fillCharacterDCs, fillCharacterNumbers } from "../src/compiler/index.js";
import { activityRider, strikeMatches } from "../../pf2e-automatic-ability-resolution/src/live/activity.js";

// A 8th-level character: class DC 25, spell DC 27 (occult), Strength +4.
const DCS = { level: 8, class: 25, spell: 27, perception: 24, byClass: { exemplar: 26 }, byTradition: { occult: 27 }, statistics: { deception: 23 }, abilities: { str: 4, cha: 3 } };
const feat = (name, html, actions = 2) => ({ name, type: "feat", system: { description: { value: html }, actionType: { value: "action" }, actions: { value: actions }, traits: { value: [] }, rules: [] } });

test("a character's DCs by PF2e's slugs", () => {
    assert.equal(dcFor("class", DCS), 25);
    assert.equal(dcFor("classDC", DCS), 25);
    assert.equal(dcFor("class-spell", DCS), 27, "the higher of the two");
    assert.equal(dcFor("spell", DCS), 27);
    assert.equal(dcFor("occult", DCS), 27);
    assert.equal(dcFor("exemplar", DCS), 26);
    assert.equal(dcFor("deception", DCS), 23);
    assert.equal(dcFor("perception", DCS), 24);
    assert.equal(dcFor("mystery", DCS), null);
});

test("saves get the character's DC; a check against a target's DC and an unknown statistic stay", () => {
    assert.equal(fillCharacterDCs("@Check[reflex|against:class-spell|basic|options:area-effect]", DCS), "@Check[reflex|basic|options:area-effect|dc:27]");
    assert.equal(fillCharacterDCs("@Check[will|dc:resolve(@actor.attributes.classDC.value)]", DCS), "@Check[will|dc:25]");
    assert.equal(fillCharacterDCs("@Check[fortitude|dc:resolve(@actor.system.attributes.classOrSpellDC.value)]", DCS), "@Check[fortitude|dc:27]");
    assert.equal(fillCharacterDCs("@Check[athletics|against:fortitude]", DCS), "@Check[athletics|against:fortitude]");
    assert.equal(fillCharacterDCs("@Check[will|against:mystery]", DCS), "@Check[will|against:mystery]");
    assert.equal(fillCharacterDCs("@Check[will|dc:20]", DCS), "@Check[will|dc:20]", "a number of its own stays");
});

test("damage scaled by level or an attribute is worked out", () => {
    assert.equal(fillCharacterNumbers("@Damage[(floor(@actor.level/2)d6)[bludgeoning]|options:area-damage]", DCS), "@Damage[(4d6)[bludgeoning]|options:area-damage]");
    assert.equal(fillCharacterNumbers("@Damage[ceil(@actor.level/2)d6[sonic]]", DCS), "@Damage[4d6[sonic]]");
    assert.equal(fillCharacterNumbers("@Damage[(@actor.level+2)d8[fire]]", DCS), "@Damage[10d8[fire]]");
    assert.equal(fillCharacterNumbers("@Damage[(max(1,@actor.abilities.str.mod)+2)[fire]]", DCS), "@Damage[(6)[fire]]");
    assert.equal(fillCharacterNumbers("@Damage[(@actor.flags.pf2e.fabricate)d6[fire]]", DCS), "@Damage[(@actor.flags.pf2e.fabricate)d6[fire]]", "a flag stays");
    // PF2e's Invoke the Elements and Call Hellfire: a ternary by level, the damage type the player chose, the feat's own level.
    const chosen = { flags: { system: { rulesSelections: { changelingType: "cold" } } }, system: { level: { value: 8 } } };
    assert.equal(fillCharacterNumbers("@Damage[(ternary(gte(@actor.level,17),3,ternary(gte(@actor.level,13),2,1)))d12[@item.flags.system.rulesSelections.changelingType]]", { ...DCS, level: 14 }, chosen), "@Damage[2d12[cold]]");
    assert.equal(fillCharacterNumbers("@Damage[((floor(@item.level/2) -1 ) * 2)d6[fire]]", DCS, chosen), "@Damage[6d6[fire]]");
});

// PF2e's Fleeing Shriek (kobold ancestry feat), as the pack has it.
const FLEEING_SHRIEK = "<p><strong>Frequency</strong> once per hour</p><hr /><p>You let out an ear-piercing screech. Each creature in a @Template[emanation|distance:10] takes @Damage[ceil(@actor.level/2)d6[sonic]|options:area-damage] damage, with a @Check[fortitude|against:class-spell|basic|options:area-effect] saving throw against the higher of your class DC or spell DC. You then Stride, and this movement doesn't trigger reactions from any creature that failed or critically failed its saving throw.</p>";
// PF2e's Tectonic Stomp (deviant feat), its first paragraph.
const TECTONIC_STOMP = "<p>You cause minor tremors that topple your enemies. All creatures in a @Template[emanation|distance:30] who are standing on the ground take @Damage[(floor(@actor.level/2)d6)[bludgeoning]|options:area-damage]{1d6 bludgeoning damage for every 2 levels} you have, with a @Check[reflex|against:class-spell|basic|options:area-effect,inflicts:prone,inflicts:stunned] save. A creature that fails its save also falls @UUID[Compendium.pf2e.conditionitems.Item.Prone].</p>";

test("a character's save feat compiles with its own DC and dice", () => {
    const actor = { type: "character", system: { details: { level: { value: 8 } } } };
    assert.equal(compileFeat(feat("Fleeing Shriek", FLEEING_SHRIEK), { actor }), null, "without the character's DCs there's no number to save against");
    const shriek = compileFeat(feat("Fleeing Shriek", FLEEING_SHRIEK), { actor, dcs: DCS });
    assert.equal(shriek.resolution.kind, "save");
    assert.deepEqual([shriek.resolution.check.statistic, shriek.resolution.check.basic, shriek.resolution.check.against.value], ["fortitude", true, 27]);
    assert.equal(shriek.resolution.sharedDamage.components[0].formula, "4d6[sonic]");
    assert.deepEqual(shriek.targeting.area, { type: "emanation", value: 10 });
    const stomp = compileFeat(feat("Tectonic Stomp", TECTONIC_STOMP), { actor, dcs: DCS });
    assert.equal(stomp.resolution.sharedDamage.components[0].formula, "(4d6)[bludgeoning]");
    assert.ok(["failure", "criticalFailure"].every((degree) => stomp.resolution.outcomes[degree].effects.some((effect) => effect.slug === "prone")), "prone on a failure");
});

// Slice 2: a character's Strike feats as Strike activities (src/compiler/strikes.js).

test("a Strike feat: its Strides, attack count, bonus and its hit's results", () => {
    const actor = { type: "character", system: { details: { level: { value: 8 } } } };
    const frightened = "@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{Frightened 1}";
    const charge = compileFeat(feat("Test Charge", "<p>You rush forward with a battle cry. Stride twice, then make a melee Strike. You gain a +1 circumstance bonus to your attack roll. If the Strike hits, the target is " + frightened + ".</p>"), { actor, dcs: DCS });
    assert.equal(charge.builtin, "strike-activity");
    assert.deepEqual([charge.strides, charge.attackBonus, charge.melee, charge.anyStrike], [2, 1, true, false]);
    assert.deepEqual(charge.onHit.conditions.map((entry) => [entry.slug, entry.value]), [["frightened", 1]]);
    assert.ok(!charge.notes.some((note) => /battle cry|circumstance bonus/.test(note)), "flavour and the bonus read aren't notes");
    // PF2e's Spiritual Disruption: two attacks for the penalty, persistent damage on a hit; its stupefied's own end the GM's.
    const disruption = compileFeat(feat("Spiritual Disruption", "<p>You channel disruptive power that severs a foe's spiritual connection to their magic. Make a melee Strike. This counts as two attacks when calculating your multiple attack penalty. If the attack hits, the target takes @Damage[1d6[persistent,spirit]] damage. The target is @UUID[Compendium.pf2e.conditionitems.Item.Stupefied]{Stupefied 1} until it stops taking the persistent spirit damage.</p>"), { actor, dcs: DCS });
    assert.equal(disruption.countsAs, 2);
    assert.deepEqual(disruption.onHit.damage, ["1d6[persistent,spirit]"]);
    const rider = activityRider(disruption);
    assert.equal(rider.plan.resolution.outcomes.success.damage.formulas[0].formula, "1d6[persistent,spirit]");
    // Written-out damage: PF2e's Fatal Shot.
    const fatal = compileFeat(feat("Fatal Shot", "<p>Make a ranged Strike. On a hit, you deal an additional 10d10 precision damage.</p>"), { actor, dcs: DCS });
    assert.deepEqual([fatal.strike, fatal.onHit.damage], ["ranged", ["10d10[precision]"]]);
});

test("any Strike when the feat names none; not a feat about an ally's Strike", () => {
    assert.equal(strikeMatches({ anyStrike: true }, { name: "Longbow", isRanged: true }), true);
    assert.equal(strikeMatches({}, { name: "Longbow", isRanged: true }), false, "a monster's activity with no Strike named stays melee");
    assert.equal(characterStrike(feat("Test Order", "<p>Your ally can make a Strike. If the Strike hits, the target is @UUID[Compendium.pf2e.conditionitems.Item.Prone].</p>")), null);
});

// Slice 3: a character's reaction, its effect read as the player uses it (src/compiler/used.js); the words its save says its DC in.
import { inReaderWords } from "../src/compiler/character-dcs.js";

test("a PC save's DC words, once it has the number", () => {
    assert.equal(inReaderWords("@Check[fortitude|dc:27] saving throw against your class or spell DC, whichever is higher, or become"), "@Check[fortitude|dc:27] save or become");
    assert.equal(inReaderWords("@Check[will|dc:25] save against your class DC or become"), "@Check[will|dc:25] save or become");
    assert.equal(inReaderWords("@Check[reflex|basic|dc:27] save against your class DC or spell DC (whichever is higher). Next"), "@Check[reflex|basic|dc:27] save. Next");
    assert.equal(inReaderWords("@Check[will|against:mystery] save against your class DC"), "@Check[will|against:mystery] save against your class DC", "no number, no change");
});

// PF2e's Gaping Flesh (ancestry feat), as the pack has it.
const GAPING_FLESH = "<p><strong>Frequency</strong> once per day</p>\n<p><strong>Trigger</strong> A creature you are aware of damages you with a melee Strike.</p>\n<hr />\n<p>Your wound yawns open, appalling your attacker. The attacker must succeed at a @Check[fortitude|against:class-spell] saving throw against your class or spell DC, whichever is higher, or become @UUID[Compendium.pf2e.conditionitems.Item.Sickened]{Sickened 1} (@UUID[Compendium.pf2e.conditionitems.Item.Sickened]{Sickened 2} on a critical failure). It can't recover from the sickened condition while it's adjacent to you.</p>";
const reaction = (name, html) => ({ name, type: "feat", system: { description: { value: html }, actionType: { value: "reaction" }, actions: { value: null }, traits: { value: [] }, rules: [] } });

test("a reaction's effect as the player uses it, at the character's DC", () => {
    const plan = compileFeat(reaction("Gaping Flesh", GAPING_FLESH), { dcs: DCS });
    assert.equal(plan.resolution.kind, "save");
    assert.deepEqual([plan.resolution.check.statistic, plan.resolution.check.against.value], ["fortitude", 27]);
    assert.deepEqual(plan.resolution.outcomes.criticalFailure.effects.map((effect) => [effect.slug, effect.value]), [["sickened", 2]]);
    assert.equal(plan.activation.time, "reaction");
    assert.equal(plan.usedOn, "A creature you are aware of damages you with a melee Strike.");
    assert.equal(plan.trigger.event, "use", "the player saw the trigger and used it");
});

// Slice 4: the character healing itself or gaining temporary Hit Points (src/compiler/self-heal.js).
import { amountOf } from "../src/compiler/self-heal.js";

test("amounts by the character's level and attributes", () => {
    assert.equal(amountOf("your level", DCS), 8);
    assert.equal(amountOf("half your level", DCS), 4);
    assert.equal(amountOf("half your level (minimum 1)", { level: 1 }), 1);
    assert.equal(amountOf("twice your level", DCS), 16);
    assert.equal(amountOf("10 + your level", DCS), 18);
    assert.equal(amountOf("your Strength modifier", DCS), 4);
    assert.equal(amountOf("the enemy's level", DCS), null);
});

test("self-healing and temporary Hit Points, with their time; a heal only sometimes is the GM's", () => {
    const success = (plan) => plan.resolution.outcomes.success.effects;
    // PF2e's Cantorian Rejuvenation: the dice by level, then 10 temporary HP for a minute; the 15th-level sentence a note at 8th.
    const cantorian = compileFeat(feat("Cantorian Rejuvenation", "<p><strong>Frequency</strong> once per day</p><hr /><p>The life-giving energy that flows in your blood revitalizes you. You recover @Damage[ternary(gte(@actor.level,15),6,4)d6[healing]] Hit Points and gain 10 temporary Hit Points for 1 minute. At 15th level, you instead recover 6d6 HP and gain 15 temporary HP.</p>"), { dcs: DCS });
    assert.equal(cantorian.targeting.target, "self");
    assert.deepEqual(success(cantorian).map((effect) => [effect.kind, effect.formula, effect.duration?.unit ?? null]), [["heal", "4d6", null], ["temp-hp", "10", "minutes"]]);
    assert.deepEqual(cantorian.notes, ["At 15th level, you instead recover 6d6 HP and gain 15 temporary HP."]);
    // PF2e's Draw From the Land: "They last for 1 round." the next sentence.
    const draw = compileFeat(feat("Draw From the Land", "<p><strong>Requirements</strong> You gained a terrain attunement benefit this turn, and it matched the terrain you're in.</p>\n<hr />\n<p>You pull strength from the surrounding terrain. You gain temporary Hit Points equal to your level. They last for 1 round. If you previously gained the plains terrain attunement effect this turn, combine the temporary Hit Points together.</p>", 1), { dcs: DCS });
    assert.deepEqual(success(draw).map((effect) => [effect.formula, effect.duration.value, effect.duration.unit]), [["8", 1, "rounds"]]);
    assert.equal(compileFeat(feat("Test Rest", "<p>If you rest for 10 minutes, you regain Hit Points equal to your level.</p>"), { dcs: DCS }), null);
});

test("a feat that changes the character's own numbers for a while: the module's Effect, its rules and time", () => {
    const stance = { ...feat("Rain of Embers Stance", "<p><strong>Requirements</strong> You're unarmored.</p><hr /><p>You enter a stance of fiery strikes. While in Rain of Embers Stance, you gain a +1 status bonus to AC and fire resistance equal to half your level (minimum 1).</p>", 1) };
    stance.system.traits.value = ["stance"];
    const plan = compileFeat(stance, { dcs: DCS });
    assert.equal(plan.builtin, "feat-effect");
    assert.deepEqual(plan.effect.rules, [{ key: "FlatModifier", selector: "ac", type: "status", value: 1 }, { key: "Resistance", type: "fire", value: 4 }]);
    assert.equal(plan.effect.stance, true);
    assert.equal(plan.effect.duration.unit, "encounter");
    const shield = compileFeat(feat("Raise Symbol", "<p>You present your religious symbol emphatically. You gain a +2 circumstance bonus to saving throws until the start of your next turn. While it's raised, if you roll a success at a saving throw against a vitality or void effect, you get a critical success instead.</p>", 1), { dcs: DCS });
    assert.deepEqual(shield.effect.rules, [{ key: "FlatModifier", selector: "saving-throw", type: "circumstance", value: 2 }]);
    assert.deepEqual(shield.effect.duration, { value: 1, unit: "rounds", expiry: "turn-start", sustained: false });
    assert.equal(shield.notes.length, 1, "the sometimes-sentence is the GM's");
    const climb = compileFeat(feat("Grip", "<p>For 1 minute, you gain a +2 circumstance bonus to Athletics checks to Climb.</p>", 1), { dcs: DCS });
    assert.deepEqual(climb.effect.rules, [{ key: "FlatModifier", selector: "athletics", type: "circumstance", value: 2, predicate: ["action:climb"] }]);
    assert.equal(climb.effect.duration.unit, "minutes");
    // Not: someone else's bonus, one against the triggering attack, one with no end and no stance.
    assert.equal(compileFeat(feat("Eddies", "<p>All ranged attacks against you take a –1 circumstance penalty to the attack roll until the end of your next turn.</p>", 1), { dcs: DCS }), null);
    assert.equal(compileFeat(feat("Dodge", "<p>You gain a +2 circumstance bonus to AC against the triggering attack.</p>", 1), { dcs: DCS }), null);
    assert.equal(compileFeat(feat("Forever", "<p>You gain a +1 status bonus to AC.</p>", 1), { dcs: DCS }), null);
});

test("a reaction or free action triggered by the character's own turn: a reminder at its start or end", async () => {
    const { turnTrigger, turnReminders } = await import("../src/compiler/turn-reminders.js");
    const free = (trigger) => ({ name: "X", system: { actionType: { value: "free" }, description: { value: `<p><strong>Trigger</strong> ${trigger}</p><hr /><p>You Sustain a spell.</p>` } } });
    assert.deepEqual(turnTrigger(free("Your turn begins.")), { when: "start", trigger: "Your turn begins.", kind: "free action" });
    assert.equal(turnTrigger(free("Your turn ends and you have a status penalty to your Speed"))?.when, "end");
    assert.equal(turnTrigger(free("You start your turn with the Frightened condition."))?.when, "start");
    assert.equal(turnTrigger(free("You fail a Will save.")), null);
    assert.equal(turnReminders([free("Your turn begins."), free("Your turn ends.")], "end").length, 1);
});

test("a reaction triggered by what others do: the event an attack or damage roll brings", async () => {
    const { eventTrigger, eventsOf } = await import("../src/compiler/event-reminders.js");
    const reaction = (trigger) => ({ name: "X", system: { actionType: { value: "reaction" }, description: { value: `<p><strong>Trigger</strong> ${trigger}</p><hr /><p>You Step.</p>` } } });
    assert.equal(eventTrigger(reaction("An enemy hits you with a melee Strike.")).event, "hit");
    assert.equal(eventTrigger(reaction("A creature targets you with an attack and you can see the attacker.")).event, "targeted");
    assert.equal(eventTrigger(reaction("While you have your shield raised, you would take damage from a physical attack.")).event, "damaged");
    assert.deepEqual([eventTrigger(reaction("An adjacent ally is hit by an attack.")).event, eventTrigger(reaction("An adjacent ally is hit by an attack.")).within], ["ally-hit", 5]);
    assert.equal(eventTrigger(reaction("Your eidolon would take damage.")), null, "someone else's damage, not an ally's roll the module sees");
    assert.equal(eventTrigger(reaction("One of your allies within 30 feet is targeted by a spell or ability that allows a saving throw.")), null);
    assert.deepEqual(eventsOf("attack-roll", "criticalSuccess"), ["targeted", "hit", "critical-hit"]);
    assert.deepEqual(eventsOf("attack-roll", "failure"), ["targeted"]);
    assert.deepEqual(eventsOf("damage-roll"), ["damaged"]);
});

test("a reaction triggered by the character's own action or spell: matched to the item it used", async () => {
    const { ownUseTrigger, usesTrigger } = await import("../src/compiler/event-reminders.js");
    const free = (trigger) => ({ name: "X", system: { actionType: { value: "free" }, description: { value: `<p><strong>Trigger</strong> ${trigger}</p><hr /><p>You Stride.</p>` } } });
    const ferocity = ownUseTrigger(free("You use Orc Ferocity."));
    assert.deepEqual(ferocity.names, ["orc ferocity"]);
    assert.ok(usesTrigger(ferocity, "Orc Ferocity", "feat"));
    assert.ok(!usesTrigger(ferocity, "Orc Weapon Familiarity", "feat"));
    assert.ok(usesTrigger(ownUseTrigger(free("You Cast a Spell using a spell slot.")), "Fireball", "spell"));
    assert.ok(usesTrigger(ownUseTrigger(free("You Shield Block a melee Strike made with a held weapon.")), "Shield Block", "action"));
    assert.equal(ownUseTrigger(free("You use an action or cast a spell with the teleportation trait.")), null);
});

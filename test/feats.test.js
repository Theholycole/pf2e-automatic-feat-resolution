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
    assert.deepEqual(eventsOf("attack-roll", "failure"), ["targeted", "miss"]);
    assert.deepEqual(eventsOf("damage-roll"), ["damaged"]);
    assert.equal(eventTrigger(reaction("A creature within your reach critically fails a Strike against you.")).event, "critical-miss");
    assert.deepEqual(eventsOf("attack-roll", "criticalFailure"), ["targeted", "miss", "critical-miss"]);
    assert.equal(eventTrigger(reaction("A creature missed you with a melee attack.")).event, "miss");
    assert.equal(eventTrigger(reaction("You are struck by a critical hit that deals physical damage.")).event, "critical-hit");
    assert.equal(eventTrigger(reaction("A critical hit deals physical damage to you.")).event, "critical-hit");
    assert.equal(eventTrigger(reaction("A creature you can see attempts a ranged Strike against you.")).event, "targeted");
    assert.equal(eventTrigger(reaction("A Large or larger enemy ends a move action adjacent to you.")).event, "foe-acts");
    assert.equal(eventTrigger(reaction("A foe ends its movement adjacent to you.")).moves, true);
    assert.equal(eventTrigger(reaction("You critically hit a foe with a melee weapon Strike or a melee unarmed attack.")).event, "own-critical-hit");
    assert.equal(eventTrigger(reaction("You succeed at a melee Strike.")).event, "own-hit");
    assert.equal(eventTrigger(reaction("You miss with a firearm or crossbow Strike.")).event, "own-miss");
    const verse = eventTrigger({ name: "Of Verse Unbroken", system: { actionType: { value: "passive" }, description: { value: "<p>Whenever you critically succeed on a Strike, you gain a +1 status bonus.</p>" } } });
    assert.deepEqual([verse.event, verse.kind], ["own-critical-hit", "passive"]);
    const { ownUseTrigger, usesTrigger } = await import("../src/compiler/event-reminders.js");
    const pride = ownUseTrigger({ system: { actionType: { value: "passive" }, description: { value: "<p>Whenever you cast an illusion spell, you gain a bonus.</p>" } } });
    assert.equal(usesTrigger(pride, "Illusory Object", "spell", ["illusion", "visual"]), true);
    assert.equal(usesTrigger(pride, "Fireball", "spell", ["fire"]), false);
    const { weaponFits } = await import("../src/compiler/event-reminders.js");
    const recall = eventTrigger(reaction("You miss with a firearm or crossbow Strike."));
    assert.equal(weaponFits(recall.weapons, ["item:group:crossbow", "item:ranged"]), true);
    assert.equal(weaponFits(recall.weapons, ["item:group:dart", "item:ranged"]), false, "a javelin");
    assert.equal(eventTrigger(reaction("You reduce an enemy to 0 Hit Points.")).event, "own-kill");
    const cartwheel = eventTrigger(reaction("You succeed or critically succeed at a Reflex saving throw."));
    assert.deepEqual([cartwheel.event, cartwheel.outcomes, cartwheel.saves], ["own-save", ["criticalSuccess", "success"], ["reflex"]]);
    assert.deepEqual(eventTrigger(reaction("You fail (but don't critically fail) a saving throw against an effect with the visual trait.")).outcomes, ["failure"]);
    const name = eventTrigger(reaction("You fail or critically fail a Deception, Diplomacy, Intimidation, or Society check."));
    assert.deepEqual([name.event, name.outcomes, name.skills], ["own-check", ["failure", "criticalFailure"], ["deception", "diplomacy", "intimidation", "society"]]);
    const tide = eventTrigger(reaction("A creature within 30 feet of you critically fails an attack roll, skill check, or saving throw."));
    assert.deepEqual([tide.event, tide.who, tide.outcomes, tide.within], ["others-roll", "creature", ["criticalFailure"], 30]);
    assert.equal(eventTrigger(reaction("An ally within 30 feet brings an enemy to 0 Hit Points.")).event, "ally-kill");
    assert.equal(eventTrigger(reaction("You would be hit by a Strike.")).event, "hit");
    assert.equal(eventTrigger(reaction("You would take acid, cold, electricity, poison, fire, or sonic damage.")).event, "damaged");
    assert.deepEqual(eventTrigger(reaction("You're reduced to 0 Hit Points.")).conditions, ["0-hp"]);
    assert.deepEqual([eventTrigger(reaction("An ally ends a move action adjacent to you.")).event, eventTrigger(reaction("An ally ends a move action adjacent to you.")).within], ["ally-moves", 5]);
    assert.equal(eventTrigger(reaction("An ally within your reach uses a move action or leaves a square during a move action they're using.")).within, 10);
    const frightened = eventTrigger(reaction("An ally within 30 feet would become Frightened, Drained, or Sickened."));
    assert.deepEqual([frightened.event, frightened.conditions, frightened.within], ["ally-condition", ["frightened", "drained", "sickened"], 30]);
    assert.deepEqual(eventTrigger(reaction("You would be reduced to 0 Hit Points but not immediately killed.")).conditions, ["0-hp"]);
    assert.equal(eventTrigger(reaction("You would gain the Fatigued condition.")).event, "self-condition");
    const snag = eventTrigger(reaction("A creature within your reach uses a move action or leaves a square during a move action it's using."));
    assert.deepEqual([snag.event, snag.within, snag.traits, snag.moves], ["foe-acts", 10, ["move"], true]);
    assert.deepEqual(eventTrigger(reaction("A creature within your reach uses a concentrate action.")).traits, ["concentrate"]);
    assert.deepEqual([eventTrigger(reaction("A creature within 30 feet casts a spell.")).event, eventTrigger(reaction("A creature within 30 feet casts a spell.")).within], ["foe-casts", 30]);
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

test("a reaction used before the character's own roll: a reminder before the save, initiative or recovery check", async () => {
    const { preRollTrigger, asksForSave } = await import("../src/compiler/event-reminders.js");
    const reaction = (trigger) => ({ name: "X", system: { actionType: { value: "reaction" }, description: { value: `<p><strong>Trigger</strong> ${trigger}</p><hr /><p>You roll twice.</p>` } } });
    assert.equal(preRollTrigger(reaction("You attempt a saving throw against a magical effect, but you haven't rolled yet.")).event, "pre-save");
    assert.equal(preRollTrigger(reaction("You're about to roll initiative.")).event, "pre-initiative");
    assert.equal(preRollTrigger(reaction("You have the dying condition and are about to attempt a recovery check.")).event, "pre-recovery");
    assert.equal(preRollTrigger(reaction("You fail a Will save.")), null, "after the roll: a note on it");
    assert.equal(preRollTrigger(reaction("Your ally is about to roll a saving throw.")), null);
    assert.ok(asksForSave('<a class="inline-check" data-pf2-check="reflex" data-pf2-dc="25">'));
});

test("a feat with a hand-written plan: the plan, by the item's compendium source", async () => {
    const { PLAN_BATCHES } = await import("../src/plans/index.js");
    const uuids = PLAN_BATCHES.flat().map((entry) => entry.uuid);
    assert.equal(new Set(uuids).size, uuids.length, "each feat once");
    const item = { ...feat("Brutish Shove", "<p>Make a Strike with a two-handed melee weapon. …</p>", 1), sourceId: "Compendium.pf2e.feats-srd.Item.gt9pvIicabSOe6pB" };
    const plan = compileFeat(item, { dcs: DCS });
    assert.equal(plan.builtin, "strike-activity");
    assert.equal(plan.melee, true);
    assert.equal(plan.onHit.push, 5);
    assert.equal(plan.onHit.conditions[0].slug, "off-guard");
    const resounding = compileFeat({ ...feat("Resounding Blow", "<p>…</p>"), sourceId: "Compendium.pf2e.feats-srd.Item.9kY9B5WgtEleOicn" }, { dcs: DCS });
    assert.equal(resounding.onHit.critical[0].duration.unit, "minutes");
    const phalanx = compileFeat({ ...feat("Phalanx Breaker", "<p>…</p>", 2), sourceId: "Compendium.pf2e.feats-srd.Item.BkEOwv3SRtefczpO" }, { dcs: DCS });
    assert.equal(phalanx.strike, "ranged");
    assert.equal(phalanx.onHit.criticalPush, 20);
    const stunning = compileFeat({ ...feat("Stunning Finisher", "<p>Make a melee Strike. If you hit, your foe must attempt a @Check[fortitude|against:class] save against your class DC with the following results.</p><hr /><p><strong>Critical Success</strong> The target is unaffected.</p><p><strong>Success</strong> The target can't use reactions until its next turn.</p><p><strong>Failure</strong> The target is @UUID[Compendium.pf2e.conditionitems.Item.Stunned]{Stunned 1}.</p><p><strong>Critical Failure</strong> The target is @UUID[Compendium.pf2e.conditionitems.Item.Stunned]{Stunned 3}.</p>"), sourceId: "Compendium.pf2e.feats-srd.Item.jkBzlMB4TS1sS2Fm" }, { dcs: DCS });
    assert.equal(stunning.onHit.save?.resolution?.kind, "save", "the readers' save stays under the entry");
    assert.deepEqual(stunning.notes, ["The save on a hit is on its card."]);
});

test("a hand entry that uses a basic action, or puts a condition on its target with no roll", async () => {
    const basicActions = { demoralize: { source: { name: "Demoralize" }, activation: { time: "1", traits: ["mental"] }, targeting: { target: "1 creature", range: "30 feet", area: null }, resolution: { kind: "check", check: { roll: "skill", statistic: "intimidation" }, outcomes: {} } } };
    const display = compileFeat({ ...feat("Dazzling Display", "<p>…</p>", 1), sourceId: "Compendium.pf2e.feats-srd.Item.lk80TBn933RECRD7" }, { dcs: DCS, basicActions });
    assert.equal(display.resolution.check.statistic, "intimidation");
    assert.equal(display.source.name, "Dazzling Display");
    assert.equal(display.targeting.target, "each enemy within 30 feet");
    assert.equal(basicActions.demoralize.source.name, "Demoralize", "the action's own plan is left alone");
    assert.equal(compileFeat({ ...feat("Dazzling Display", "<p>…</p>", 1), sourceId: "Compendium.pf2e.feats-srd.Item.lk80TBn933RECRD7" }, { dcs: DCS }), null, "no card without the action's plan");
    const opening = compileFeat({ ...feat("Instant Opening", "<p>…</p>", 1), sourceId: "Compendium.pf2e.feats-srd.Item.9zH7IOsmhRBEqXAV" }, { dcs: DCS });
    assert.equal(opening.resolution.check.roll, "automatic");
    assert.equal(opening.resolution.outcomes.success.effects[0].slug, "off-guard");
});

test("a Strike feat whose hit adds nothing the readers take: the Strike's card, its rules as notes, never a companion's Strike", () => {
    const plain = compileFeat(feat("Returning Throw", "<p>Make a ranged Strike with a thrown weapon. If your hands are full when the weapon returns, it falls to the ground in your space.</p>", 1), { dcs: DCS });
    assert.equal(plain.builtin, "strike-activity");
    assert.equal(plain.plain, true);
    assert.ok(plain.notes.some((note) => /falls to the ground/.test(note)));
    assert.equal(compileFeat(feat("Pounce Order", "<p>Your companion makes a Strike against an enemy.</p>", 1), { dcs: DCS }), null);
    const passive = { ...feat("Lingering", "<p>Make a Strike with a bomb; it lingers.</p>"), system: { ...feat("x", "").system, description: { value: "<p>Make a Strike with a bomb; it lingers.</p>" }, actionType: { value: "passive" } } };
    assert.equal(compileFeat(passive, { dcs: DCS }), null);
});


test("fixes from the Foundry test: Tail Spin's success, Mask of Fear only while Frightened, Hunter's Defense's attackers, Stunning Finisher without the DC", async () => {
    const crit = { damage: { mode: "none" }, effects: [{ kind: "condition", slug: "prone" }], note: "1d6 bludgeoning" };
    const basicActions = { trip: { source: { name: "Trip" }, activation: { time: "1" }, targeting: { target: "1 creature" }, resolution: { kind: "check", check: { roll: "skill", statistic: "athletics" }, outcomes: { criticalSuccess: crit, success: { effects: [{ kind: "condition", slug: "prone" }] } } } } };
    const spin = compileFeat({ ...feat("Tail Spin", "<p>…</p>", 1), sourceId: "Compendium.pf2e.feats-srd.Item.rnEfO5eyRw7Fywzb" }, { dcs: DCS, basicActions });
    assert.deepEqual(spin.resolution.outcomes.success, crit);
    assert.notEqual(basicActions.trip.resolution.outcomes.success, crit, "the action's own plan is left alone");

    const { turnReminders } = await import("../src/compiler/turn-reminders.js");
    const reaction = (trigger) => ({ name: trigger, system: { actionType: { value: "reaction" }, description: { value: `<p><strong>Trigger</strong> ${trigger}</p>` } } });
    const mask = reaction("You start your turn with the @UUID[Compendium.pf2e.conditionitems.Item.Frightened] condition.");
    assert.equal(turnReminders([mask], "start", () => false).length, 0);
    assert.equal(turnReminders([mask], "start", (slug) => slug === "frightened").length, 1);

    const { eventTrigger } = await import("../src/compiler/event-reminders.js");
    assert.deepEqual(eventTrigger(reaction("A creature with the animal, beast, elemental, fey, fungus, or plant trait attacks you, and you can see the attacker.")).by, ["animal", "beast", "elemental", "fey", "fungus", "plant"]);

    const html = "<p>Make a melee Strike. If you hit, your foe must attempt a @Check[fortitude|against:class] save against your class DC with the following results.</p><hr /><p><strong>Success</strong> The target can't use reactions until its next turn.</p><p><strong>Failure</strong> The target is Stunned 1.</p>";
    const fighter = compileFeat({ ...feat("Stunning Finisher", html), sourceId: "Compendium.pf2e.feats-srd.Item.jkBzlMB4TS1sS2Fm" }, { dcs: { ...DCS, class: null, byClass: {} } });
    assert.equal(fighter.onHit.save, null);
    assert.ok(fighter.notes.some((note) => /by hand/.test(note)));
});

test("each enemy within 30 feet: the card finds them itself", async () => {
    const { areaOf, inArea } = await import("../src/compiler/area-targets.js");
    const area = areaOf("each enemy within 30 feet");
    assert.deepEqual(area, { who: "enemy", within: 30, grounded: false });
    assert.equal(areaOf("1 creature within 30 feet"), null);
    assert.equal(inArea(area, { distance: 25, disposition: -1, sourceDisposition: 1 }), true);
    assert.equal(inArea(area, { distance: 35, disposition: -1, sourceDisposition: 1 }), false, "out of range");
    assert.equal(inArea(area, { distance: 10, disposition: 1, sourceDisposition: 1 }), false, "an ally");
    assert.equal(inArea(area, { distance: 10, disposition: 0, sourceDisposition: 1 }), false, "a neutral");
    assert.equal(inArea(area, { distance: 10, disposition: -1, sourceDisposition: 1, defeated: true }), false, "a defeated foe");
    const ground = areaOf("each creature on the ground within 10 feet");
    assert.equal(inArea(ground, { distance: 5, disposition: -1, sourceDisposition: 1, elevation: 10 }), false, "flying");
    assert.equal(inArea(ground, { distance: 5, disposition: 1, sourceDisposition: 1 }), true, "any creature, allies too");
});

test("slice 13: an action that grants one of PF2e's own Effects, on the character, its target or its allies", async () => {
    const { linkedEffect } = await import("../src/compiler/linked-effect.js");
    const { areaOf, inArea } = await import("../src/compiler/area-targets.js");
    const action = (name, html, type = "action") => ({ name, type: "feat", system: { description: { value: html }, actionType: { value: type }, actions: { value: 1 }, traits: { value: [] } } });
    const link = (name) => `<p>@UUID[Compendium.pf2e.feat-effects.Item.abcdefghijklmnop]{Effect: ${name}}</p>`;
    const self = linkedEffect(action("Ceremony of Protection", `<p>You manipulate your exoskeleton to overlap itself. You gain a +1 circumstance bonus to AC until the start of your next turn.</p>${link("Ceremony of Protection")}`));
    assert.deepEqual(self.resolution.applications[0], { kind: "native-spell-effect", uuid: "Compendium.pf2e.feat-effects.Item.abcdefghijklmnop", label: "Effect: Ceremony of Protection", recipients: "self" });
    const ally = linkedEffect(action("Watch Your Back", `<p>You shout a warning to an ally about encroaching foes. Choose a target ally within 60 feet. Until the beginning of your next turn, the target can't be Off-Guard due to flanking.</p>${link("Watch Your Back")}`));
    assert.equal(ally.resolution.applications[0].recipients, "target");
    const reroll = linkedEffect(action("Fear No Pain!", `<p><strong>Trigger</strong> An ally within 30 feet fails a save against a mental effect.</p><hr /><p>You have learned to endure pain. When you give them a shout of encouragement, the triggering ally can reroll their failed save with a +2 circumstance bonus.</p>${link("Fear No Pain!")}`, "reaction"));
    assert.equal(reroll.resolution.applications[0].recipients, "target");
    const tempo = linkedEffect(action("Fleet Tempo", `<p>You ring a sprightly tone. You and all allies within 30 feet gain a +10-foot status bonus to all Speeds for 1 minute.</p>${link("Fleet Tempo")}`));
    assert.equal(tempo.targeting.target, "you and each ally within 30 feet");
    const area = areaOf(tempo.targeting.target);
    assert.equal(inArea(area, { distance: 0, disposition: 1, sourceDisposition: 1, self: true }), true, "the character too");
    assert.equal(inArea(area, { distance: 20, disposition: -1, sourceDisposition: 1 }), false, "not a foe");
    assert.equal(linkedEffect(action("Hot Foot", `<p>You make a Strike against the ground near a target.</p>${link("Hot Foot")}`)), null, "something else to do");
    assert.equal(linkedEffect(action("Two", `<p>You gain a bonus.</p>${link("A")}<p>@UUID[Compendium.pf2e.feat-effects.Item.zzzzzzzzzzzzzzzz]{Effect: B}</p>`)), null, "two Effects");
    assert.equal(linkedEffect({ ...action("Own", `<p>You gain a +1 bonus to AC.</p>${link("Own")}`), system: { ...action("Own", `<p>You gain a +1 bonus to AC.</p>${link("Own")}`).system, selfEffect: { uuid: "x" } } }), null, "PF2e's own Use button");
});

test("slice 14: an action that heals one other creature", async () => {
    const { otherHeal } = await import("../src/compiler/other-heal.js");
    const action = (name, html) => ({ name, type: "feat", system: { description: { value: html }, actionType: { value: "action" }, actions: { value: 1 }, traits: { value: [] } } });
    const ease = otherHeal(action("Ease the Burden", "<p>An adjacent creature regains @Damage[(2d8+4)[healing]] Hit Points and reduces their Drained and Clumsy conditions by 1.</p>"));
    assert.equal(ease.targeting.target, "1 creature");
    assert.equal(ease.targeting.range, "touch");
    assert.deepEqual(ease.resolution.outcomes.success.effects, [{ kind: "heal", formula: "2d8+4" }]);
    assert.equal(ease.notes[0], "It also reduces their Drained and Clumsy conditions by 1.");
    const self = otherHeal(action("Searing", "<p>You or a living creature adjacent to you regains @Damage[4d10[healing]] Hit Points.</p>"));
    assert.equal(self.notes[0], "You can heal yourself instead: target your own token.");
    assert.equal(otherHeal(action("Cocoon", "<p>You spin a cocoon. If the cocoon survives, the creature inside regains @Damage[3d8[healing]] Hit Points.</p>")), null, "only sometimes");
    assert.equal(otherHeal(action("Wave", "<p>Each ally within 30 feet regains @Damage[2d8[healing]] Hit Points.</p>")), null, "more than one");
});

test("companions: an eidolon's master, its DCs and its words", async () => {
    const { findMaster, withMasterDCs, eidolonWords, actingItem } = await import("../src/compiler/companion.js");
    const { namedDCs } = await import("../src/compiler/character-dcs.js");
    const users = [{ id: "gm", isGM: true }, { id: "p1", isGM: false }, { id: "p2", isGM: false }];
    const summoner = { id: "s", type: "character", class: { slug: "summoner" }, traits: new Set(["human"]), ownership: { p1: 3 } };
    const fighter = { id: "f", type: "character", class: { slug: "fighter" }, traits: new Set(["elf"]), ownership: { p1: 3 } };
    const other = { id: "o", type: "character", class: { slug: "summoner" }, traits: new Set([]), ownership: { p2: 3 } };
    const eidolon = { id: "e", type: "character", class: { slug: "eidolon" }, traits: new Set(["eidolon", "beast"]), ownership: { p1: 3 } };
    const wolf = { id: "w", type: "character", traits: new Set(["animal", "minion"]), ownership: { p1: 3 } };
    const familiar = { id: "fa", type: "familiar", system: { master: { id: "o" } }, ownership: { p2: 3 } };
    const actors = [summoner, fighter, other, eidolon, wolf, familiar];
    assert.equal(findMaster(eidolon, { actors, users }), summoner, "the player's summoner");
    assert.equal(findMaster(wolf, { actors, users }), null, "two of the player's characters, neither assigned");
    assert.equal(findMaster(wolf, { actors, users: [...users.slice(0, 1), { id: "p1", isGM: false, character: fighter }] }), fighter, "the player's own character");
    assert.equal(findMaster({ ...wolf, flags: { "pf2e-automatic-feat-resolution": { master: "s" } } }, { actors, users }), summoner, "the module's flag");
    assert.equal(findMaster(familiar, { actors, users }), other, "PF2e's own link");
    assert.equal(findMaster(fighter, { actors, users }), null, "not a companion");
    const dcs = withMasterDCs({ class: null, spell: null, byClass: {}, byTradition: {}, level: 8 }, { class: 24, spell: 26, byClass: { summoner: 24 }, byTradition: { primal: 26 }, level: 8 }, { eidolon: true });
    assert.equal(dcs.spell, 26);
    assert.equal(dcs.byTradition.primal, 26);
    assert.equal(withMasterDCs({ spell: 19, byClass: {}, byTradition: {} }, { spell: 26, byClass: {}, byTradition: {} }, { eidolon: true }).spell, 26, "an eidolon's spell DC is the summoner's");
    assert.equal(withMasterDCs({ spell: 19, byClass: {}, byTradition: {} }, { spell: 26, byClass: {}, byTradition: {} }).spell, 19, "a familiar's own first");
    assert.equal(eidolonWords("Your eidolon Strikes a living enemy. If your eidolon has a creature grabbed, your eidolon's reach"), "You Strike a living enemy. If you have a creature grabbed, your reach");
    assert.equal(namedDCs("the target must attempt a @Check[fortitude|options:damaging-effect] save against your spell DC"), "the target must attempt a @Check[fortitude|options:damaging-effect|against:spell] save against your spell DC");
    assert.equal(namedDCs("Each enemy must attempt a Will saving throw against the higher of your class DC or spell DC."), "Each enemy must attempt a @Check[will|against:class-spell] save.");
    assert.equal(namedDCs("Attempt an Athletics check against the foe's Fortitude DC."), "Attempt a @Check[athletics|against:fortitude] check against the target's Fortitude DC.");
    assert.equal(namedDCs("a @Check[reflex|basic|against:spell] save against your spell DC"), "a @Check[reflex|basic|against:spell] save against your spell DC", "already has one");
    const hold = { name: "Constricting Hold", actor: summoner, system: { traits: { value: ["eidolon", "evolution", "summoner"] } } };
    assert.equal(actingItem(hold, { actors, users }).actor, eidolon, "the summoner's evolution feat is the eidolon's");
    assert.equal(actingItem({ ...hold, system: { traits: { value: ["summoner"] } } }, { actors, users }).actor, summoner);
});

test("companions: eidolon actions by hand", async () => {
    const dcs = { level: 8, class: null, spell: 26, byClass: {}, byTradition: {}, statistics: {}, abilities: { str: 4 } };
    const action = (name, uuid, html, traits = ["eidolon"]) => ({ name, type: "action", sourceId: uuid, system: { description: { value: html }, actionType: { value: "action" }, actions: { value: 2 }, traits: { value: traits }, rules: [] } });
    const breath = compileFeat(action("Dragon Breath (Eidolon)", "Compendium.pf2e.actionspf2e.Item.Vr3w3t028ZKDg0mO", "<p>Breath.</p>"), { dcs });
    assert.equal(breath.resolution.check.against.value, 26);
    assert.equal(breath.targeting.area.type, "cone");
    const fire = compileFeat({ ...action("Dragon Breath (Eidolon)", "Compendium.pf2e.actionspf2e.Item.Vr3w3t028ZKDg0mO", "<p>Breath.</p>"), flags: { pf2e: { rulesSelections: { dragonBreathDamage: "fire" } } } }, { dcs });
    assert.equal(fire.resolution.sharedDamage.components[0].formula, "4d6[fire]", "the eidolon's own damage type");
    const drain = compileFeat(action("Drain Life", "Compendium.pf2e.actionspf2e.Item.JPHWzD2soqjffeSU", "<p>Drain.</p>"), { dcs });
    assert.equal(drain.onHit.save.resolution.outcomes.failure.damage.formulas[0].formula, "(4)[void]");
    const hold = compileFeat(action("Constricting Hold", "Compendium.pf2e.feats-srd.Item.si8FGX2ZRxetdVHp", "<p>Hold.</p>"), { dcs });
    assert.equal(hold.targeting.target, "the creature you have grabbed");
    const charge = compileFeat(action("Beast's Charge", "Compendium.pf2e.actionspf2e.Item.cx0juTYewwBmrYWv", "<p>Charge.</p>"), { dcs });
    assert.equal(charge.builtin, "strike-activity");
    assert.equal(charge.strides, 2);
    // Read without a hand plan: "Your eidolon makes a melee Strike" is the readers' "You make a melee Strike".
    const furious = compileFeat(action("Furious", null, "<p>Your eidolon makes a melee Strike. This counts as two attacks when calculating your multiple attack penalty.</p>"), { dcs });
    assert.equal(furious.builtin, "strike-activity");
    assert.equal(furious.countsAs, 2);    const { eventTrigger } = await import("../src/compiler/event-reminders.js");
    const dive = compileFeat(action("Death Dive", "Compendium.pf2e.feats-srd.Item.BKdKyftmphU9n3Wq", "<p>Dive.</p>", ["archetype"]), { dcs });
    assert.equal(dive.by, "companion", "the mount's Strike");
    assert.equal(dive.onHit.conditions[0].slug, "prone");
    const reaction = (name, trigger, actor) => ({ name, actor, system: { description: { value: `<p><strong>Trigger</strong> ${trigger}</p><hr /><p>Effect.</p>` }, actionType: { value: "reaction" }, traits: { value: ["eidolon"] } } });
    assert.equal(eventTrigger(reaction("Anatomy", "An enemy adjacent to your eidolon deals damage to your eidolon")).event, "damaged");
    assert.equal(eventTrigger(reaction("Redistribute", "An enemy's Strike against your eidolon is a critical hit.")).event, "critical-hit");
    assert.equal(eventTrigger(reaction("Anatomy", "An enemy adjacent to your eidolon deals damage to your eidolon", { type: "character", traits: new Set(["human"]) })), null, "on the summoner's sheet, as written");
});

test("spell-like feats: the spell, its rank and the character's DC", async () => {
    const { spellLike } = await import("../src/compiler/spell-like.js");
    const dcs = { level: 8, class: 25, spell: 27 };
    const feat = (html, type = "action") => ({ name: "Test", type: "feat", system: { description: { value: html }, actionType: { value: type }, actions: { value: 2 }, traits: { value: [] } } });
    const web = spellLike(feat("<p>This has the effects of a 2nd-rank @UUID[Compendium.pf2e.spells-srd.Item.Web] spell using your class or spell DC, whichever is higher.</p>"), dcs);
    assert.deepEqual([web.spell.name, web.rank, web.dc], ["Web", 2, 27]);
    const stomp = spellLike(feat("<p>You gain the effects of the @UUID[Compendium.pf2e.spells-srd.Item.Earthquake]{earthquake} spell, using your class DC.</p>"), dcs);
    assert.deepEqual([stomp.spell.name, stomp.rank, stomp.dc], ["earthquake", null, 25]);
    const heal = spellLike(feat("<p>You cast the 3-action version of @UUID[Compendium.pf2e.spells-srd.Item.Heal], heightened to a rank equal to half your level rounded up.</p>"), dcs);
    assert.deepEqual([heal.actions, heal.rank], [3, 4]);
    assert.equal(spellLike(feat("<p><strong>Trigger</strong> You cast @UUID[Compendium.pf2e.spells-srd.Item.Spellsurge].</p><hr /><p>Allies gain a bonus.</p>", "free"), dcs), null, "its trigger");
    assert.equal(spellLike(feat("<p>When one of you casts the @UUID[Compendium.pf2e.spells-srd.Item.Shield] spell, the other gains +1.</p>"), dcs), null, "a condition");
    assert.equal(spellLike(feat("<p>You can cast @UUID[Compendium.pf2e.spells-srd.Item.Invoke] at will.</p>"), dcs), null, "at will");
    assert.equal(spellLike(feat("<p>Attempt a @Check[crafting|dc:40] check. If you succeed, the target returns with the effects of @UUID[Compendium.pf2e.spells-srd.Item.Raise Dead].</p>"), dcs), null, "after a check");
    assert.equal(spellLike(feat("<p>You can cast @UUID[Compendium.pf2e.spells-srd.Item.Heal] once per day.</p>", "passive"), dcs), null, "a passive");
});

test("senses on tokens: the modes PF2e leaves off, by acuity and range", async () => {
    const { senseModes, senseFinds } = await import("../src/compiler/senses.js");
    const modes = senseModes([
        { type: "darkvision", acuity: "precise", range: Infinity },
        { type: "echolocation", acuity: "precise", range: 40 },
        { type: "scent", acuity: "imprecise", range: 30 },
        { type: "scent", acuity: "vague", range: 30 },
        { type: "lifesense", acuity: "precise", range: 10 },
        { type: "tremorsense", acuity: "imprecise", range: 30 },
        { type: "truesight", acuity: "precise", range: 60 }
    ]);
    assert.deepEqual(modes.map((mode) => [mode.id, mode.range]), [["feat-sense-precise-echolocation", 40], ["feat-sense-imprecise-scent", 30], ["feat-sense-precise-lifesense", 10]]);
    assert.equal(senseModes([{ type: "thoughtsense", acuity: "imprecise" }])[0].range, Infinity, "no range: unlimited");
    assert.equal(senseFinds("lifesense", { modeOfBeing: "undead", traits: new Set(["undead"]) }), false);
    assert.equal(senseFinds("lifesense", { modeOfBeing: "living", traits: new Set() }), true);
    assert.equal(senseFinds("spiritsense", { modeOfBeing: "construct", traits: new Set(["construct"]) }), false);
    assert.equal(senseFinds("thoughtsense", { traits: new Set(["mindless"]) }), false);
    assert.equal(senseFinds("scent", { traits: new Set(["construct"]) }), true);
});

test("truesight: the counteract numbers", async () => {
    const { degreeOf, counteracts, truesightCounteract, illusionRank } = await import("../src/compiler/truesight.js");
    assert.equal(degreeOf(25, 25, 10), 2);
    assert.equal(degreeOf(35, 25, 10), 3);
    assert.equal(degreeOf(24, 25, 20), 2, "a natural 20 one step better");
    assert.equal(degreeOf(25, 25, 1), 1, "a natural 1 one step worse");
    assert.equal(counteracts(2, 6, 7), true);
    assert.equal(counteracts(2, 6, 8), false);
    assert.equal(counteracts(3, 6, 9), true);
    assert.equal(counteracts(1, 6, 5), true);
    assert.equal(counteracts(0, 6, 1), false);
    assert.deepEqual(truesightCounteract({ class: 24, spell: 22 }), { modifier: 12, rank: 6 }, "its spell DC first");
    assert.deepEqual(truesightCounteract({ class: 24 }), { modifier: 14, rank: 6 });
    assert.equal(illusionRank({ rank: 2 }), 2);
    assert.equal(illusionRank({ level: 7 }), 4, "a creature: half its level");
});

test("sense regions: water, silence and blocked senses", async () => {
    const { senseReaches } = await import("../src/compiler/sense-zones.js");
    const water = { water: true };
    const silent = { silent: true };
    assert.equal(senseReaches("wavesense", { source: [water], target: [water] }), true);
    assert.equal(senseReaches("wavesense", { source: [water], target: [] }), false, "the target out of the water");
    assert.equal(senseReaches("hearing", { crossed: [silent] }), false, "through a silent area");
    assert.equal(senseReaches("echolocation", { target: [silent] }), false);
    assert.equal(senseReaches("scent", { crossed: [silent] }), true, "not a sound");
    assert.equal(senseReaches("scent", { source: [{ blocks: ["scent"] }] }), false);
    assert.equal(senseReaches("tremorsense", {}), true);
    const { insideConditions } = await import("../src/compiler/sense-zones.js");
    assert.deepEqual(insideConditions({ silent: true }), ["deafened"], "silence deafens");
    assert.deepEqual(insideConditions({ silent: true, deafens: false }), []);
    assert.deepEqual(insideConditions({ conditions: ["dazzled", "nonsense"] }), ["dazzled"]);
});

test("hand-picked heals: the amount worked out, areas found by the card", () => {
    const dcs = { ...DCS, abilities: { ...DCS.abilities, con: 3 } };
    const item = (name, uuid, actions = 1) => ({ ...feat(name, "<p>Heal.</p>", actions), sourceId: uuid });
    const banner = compileFeat(item("Plant Banner", "Compendium.pf2e.feats-srd.Item.xEeCaJsQeDtRAVk1"), { dcs });
    assert.equal(banner.targeting.target, "each ally within 30 feet");
    assert.deepEqual(banner.resolution.outcomes.success.effects.map(({ kind }) => kind), ["temp-hp"]);
    assert.equal(banner.resolution.outcomes.success.effects[0].formula, "4*(3)", "4 more at 4th level and every 4 levels");
    const waters = compileFeat(item("Waters of Creation", "Compendium.pf2e.feats-srd.Item.KGxGE0yv69ND2hct", 2), { dcs });
    assert.equal(waters.resolution.outcomes.success.effects[0].formula, "4d6");
    const recovery = compileFeat(item("Instant Recovery", "Compendium.pf2e.actionspf2e.Item.8UJaVPsT5FA8XH87"), { dcs });
    assert.equal(recovery.resolution.native.healing.components[0].formula, "24", "Constitution 3 × level 8");
    const absolution = compileFeat(item("Spirit's Absolution", "Compendium.pf2e.feats-srd.Item.03mVGvudDLyGEpTZ"), { dcs });
    assert.equal(absolution.resolution.outcomes.success.effects[0].formula, "8d4");
});

test("a Focus or Mythic Point back", () => {
    const action = (html, type = "action") => ({ name: "Point", type: "feat", system: { description: { value: html }, actionType: { value: type }, actions: { value: 1 }, traits: { value: [] }, rules: [] } });
    const font = compileFeat(action("<p><strong>Frequency</strong> once per day</p><hr /><p>You can focus your mind more quickly. You regain 1 Focus Point, up to your usual maximum.</p>"), { dcs: DCS });
    assert.deepEqual(font, { builtin: "regain-point", resource: "focus", value: 1, notes: [] });
    const echo = compileFeat(action("<p><strong>Trigger</strong> You would fail a check</p><hr /><p><strong>Effect</strong> You regain 1 Mythic Point.</p>", "reaction"), { dcs: DCS });
    assert.equal(echo.resource, "mythic");
    const infernal = compileFeat(action("<p><strong>Effect</strong> You regain 1 Focus Point and then increase the value of your doomed condition by 1.</p>"), { dcs: DCS });
    assert.deepEqual(infernal.notes, ["Then increase the value of your doomed condition by 1."]);
    assert.equal(compileFeat(action("<p>When an enemy triggers your champion's reaction, you regain 1 Focus Point.</p>", "free"), { dcs: DCS }), null, "only sometimes");
});

test("spell-like feats: a spell in italics, its UUID without .Item., and a spell only paid for", () => {
    const action = (html) => ({ name: "Cast", type: "feat", system: { description: { value: html }, actionType: { value: "action" }, actions: { value: 2 }, traits: { value: [] }, rules: [] } });
    const calamity = compileFeat(action("<p>You cast <em>@UUID[Compendium.pf2e.spells-srd.kVNo3ga0lwLKPrem]{Summon Elemental Herald}</em> as an innate spell.</p>"), { dcs: DCS });
    assert.equal(calamity.builtin, "spell-like");
    assert.equal(calamity.spell.uuid, "Compendium.pf2e.spells-srd.Item.kVNo3ga0lwLKPrem");
    const believer = compileFeat(action("<p>Once per hour, you can cast @UUID[Compendium.pf2e.spells-srd.Item.MMCQsh12TPaDdPbV]{Sacred Form} as an innate divine spell with a rank equal to half your level rounded up.</p>"), { dcs: DCS });
    assert.equal(believer.rank, 4);
    assert.equal(compileFeat(action("<p>You manifest your armaments; you can spend 1 Mythic Point to also gain the effects of the @UUID[Compendium.pf2e.spells-srd.Item.wzctak6BxOW8xvFV]{Enlarge} spell.</p>"), { dcs: DCS }), null);
});

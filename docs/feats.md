# Feats

Started 2026-10-30. The user asked for automation of the player options PF2e and the suite don't automate yet ("PF2e Feat automation": class, ancestry, skill and general feats, backgrounds, heritages, and the actions they grant), Teams+ content included. The index of what's left, by mechanic pattern, is the project's `feat-automation/feat-automation-index.csv` and the doc "PF2e Feat Automation: work index". The user's instruction for this work: build, and keep the decisions for the end (listed below).

It started in the ability module (2026-10-30) and moved here the same day, when the user chose a module of its own (D1). It's built on the ability module's readings and live cards, because PC feats read like monster abilities once the character's own numbers are in:

- `src/compiler/index.js`, `compileFeat`: fills the character's numbers, then runs the ability module's `compileAbility`; a Strike feat that doesn't read whole there goes to `src/compiler/strikes.js`.
- `scripts/main.js`: the live hooks. The player's client records their targets on the feat's message; the GM's client compiles the feat and plays it with the ability module's `api.live.playAbility` (ability module 0.9.6).
- The ability module keeps the general parts: `playAbility`'s targets, `anyStrike` in `strikeMatches`, and a character's Strike taking a pending Strike activity in `cardsForRiders`.

## Slice 1: saves against the character's own DC (2026-10-30)

- **The character's numbers** (`src/compiler/character-dcs.js`, `options.dcs`; live: `scripts/character.js` reads them off the actor):
  - Saves PF2e writes against a statistic ("@Check[reflex|against:class-spell|basic]", "dc:resolve(@actor.attributes.classDC.value)") get the character's DC: class, spell, the higher of the two, a class's own (exemplar, commander…), a tradition's, Perception, a skill's.
  - Damage scaled by the character ("ceil(@actor.level/2)d6", "max(1, @actor.abilities.str.mod)", ternary by level, "@item.level", the damage type the player chose) is worked out. Live, PF2e's own roll data fills any other path first.
  - A save whose DC can't be found, or a check against the target's DC ("@Check[athletics|against:fortitude]"), is left as it was.
- **Live cards for characters** (`scripts/main.js`, `cardForFeat`): a character's feat or action posted to chat gets the confirmation card when it reads into a save, a check against a creature, or healing. The targets are the player's own, recorded on the message by their client (`recordTargets`), since the card is made on the GM's.
  - Anything else the reader makes of a character's feat stays PF2e's unless the world setting says otherwise (D2), and so does a feat whose damage still names something the roll data doesn't hold (D3).
- **Measured** on PF2e's packs and the Teams+ modules (a level 8 character, class DC 25, spell DC 27): 262 of the 4,826 options the index lists as needing work now compile to a save plan. Before, none did, because they had no number to save against.

## Slice 2: Strike feats (2026-10-30)

- **The reader** (`src/compiler/strikes.js`): a character's feat that has its user make a Strike ("Make a melee Strike", "Stride twice, then Strike", "make two dagger Strikes") and that the monster readings don't take whole becomes the strike-activity builtin the monsters' activities use:
  - its Strides before the Strike, the number of Strikes, "counts as two attacks", a circumstance bonus or penalty to the attack roll;
  - a hit's and a critical hit's results: conditions, damage (inline or written out, "an additional 10d10 precision damage"), a push, a save the creature hit attempts (with its degree sections);
  - "Make a Strike" with no kind named is any of the character's Strikes (`anyStrike`), a melee or ranged one only that kind.
  - What it doesn't read goes to the GM as notes on the card (the monster readings drop an activity they can't read whole; a feat's wordings vary too much for that). Flavour sentences are left out.
- **Live:** the player uses the feat, then rolls the Strike from the sheet; when it hits, the card offers its results (the ability module's `cardsForRiders` takes a character's Strike after one of its Strike feats, and nothing else of the monsters').
- **Measured:** 164 more options compile (138 of them from the index's "Strike variant or Strike rider" pattern, of 665).

## Slice 3: reactions and free actions as the player uses them (2026-10-30)

- **The reader** (`src/compiler/used.js`): the monster readings take a reaction only as "Trigger … Effect …" with a trigger they can watch. A character's reaction needs no watching: the player sees the trigger and uses it from the sheet. So a reaction or free action the readings don't take is read again with its Trigger, Frequency and Requirements blocks set aside, its effect as an action used then. The plan keeps its time (`activation.time`: reaction or free) and its trigger's words (`usedOn`).
- **A save's DC words** (`inReaderWords` in `src/compiler/character-dcs.js`): once a save has the character's number, "saving throw against your class DC or spell DC, whichever is higher" and its kin become "save", as the readings know a monster's.
- **Live:** no change; the card follows the reaction's chat message like any feat's, at the player's targets.

## Slice 4: healing and temporary Hit Points on the character itself (2026-10-30)

- **The reader** (`src/compiler/self-heal.js`): "You regain @Damage[4d6[healing]] Hit Points", "You gain temporary Hit Points equal to half your level that last until the start of your next turn", "They last for 1 round." become the core's automatic check with heal and temp-hp effects on the character (`recipient: "self"`). The amounts by the character's level or an attribute modifier ("twice your level", "10 + your level", "your Constitution modifier", "(minimum 1)") are worked out.
  - Its other rule sentences go to the GM as notes. A sentence that heals only sometimes ("At 15th level, you instead …", "If you rest …", "The first time each round …") is a note, never the amount.
- **Live:** an automatic check, so it gets the card like a save.

## Slice 5: the character's own numbers for a while, as the module's Effect (2026-10-30)

- **The reader** (`src/compiler/self-effect.js`): "You gain a +1 circumstance bonus to AC until the start of your next turn", "For 1 minute, you gain a +2 circumstance bonus to Athletics checks to Climb", "While in Rain of Embers Stance, you gain a +1 status bonus to AC and fire resistance equal to half your level", "you take a –10-foot penalty to your Speed" become `{ builtin: "feat-effect", effect: { name, rules, duration, stance } }`. The rules are the ones PF2e's own Effects use: FlatModifier (with `action:<slug>` for "checks to Climb") and Resistance.
  - Only a bonus with an end the text gives, or a stance's (until the encounter ends or another stance). A bonus "against the triggering attack", "against attacks you trigger this way", one for someone else ("all ranged attacks against you take …", "you and all allies") or one only sometimes ("If …", "When …") stays the GM's, as a note.
  - Not a feat that links PF2e's own Effect: PF2e's button applies that (D9).
- **Live** (`scripts/effects.js`): when the feat is used, the GM's client puts an Effect named after it on the character, with the rules, the time and the unread sentences in its description. Using it again replaces it; a stance replaces the module's other stance.
- **Measured:** 9 options in the needs-work set (stances such as Rain of Embers, Cobra, Asp and Stumbling, Raise Symbol, Blood Shield, Unstable Gearshift). Few, because the easy wordings already have PF2e's own Effect; the rest of the self-buffs are "against the triggering …" reactions.

## Slice 6: reminders at the character's turn (2026-10-30)

- **The reader** (`src/compiler/turn-reminders.js`): a reaction or free action whose trigger is the character's own turn starting or ending ("Your turn begins.", "Your turn ends.", "You start your turn with the Frightened condition.").
- **Live** (`scripts/reminders.js`): on each change of turn, the GM's client whispers the character's owners and the GM a list of those feats, linked, with their triggers: the last combatant's "turn ends" ones and the new combatant's "turn begins" ones. A world setting, "Turn reminders for characters' feats", on by default (D11).
- **Measured:** 56 options in the needs-work set (Effortless Concentration, Aura Expertise, Master of Many Styles, Flow of War, Suppress Eidolon and others).

## Slice 7: reminders when an attack or damage is aimed at the character or an ally (2026-10-30)

- **The reader** (`src/compiler/event-reminders.js`): a reaction or free action whose trigger is what another creature does: "A creature hits you with a melee Strike." (hit), "… critically hits you" (critical hit), "A creature targets you with an attack" / "You are the target of a ranged attack" (targeted), "You would take damage", "While you have your shield raised, you would take damage from a physical attack" (damaged), and the same for "an ally" / "an adjacent ally" / "an ally within 30 feet" (ally-hit, ally-targeted, ally-damaged). Not one about a save's effect ("targeted by a spell that allows a saving throw"): there's no roll to watch.
- **Live** (`scripts/reminders.js`): when PF2e posts an attack roll or a damage roll with a target, the GM's client whispers the target's owners its feats for that event (an attack: targeted, and hit or critical hit by its degree; damage: damaged), and each other character on the scene with the same disposition its ally feats, if in range. The trigger's other words ("with a melee Strike", "and you can see the attacker") are the player's to judge. Same world setting as slice 6, renamed "Reminders for characters' reactions".
- **Measured:** 106 options in the needs-work set (Reactive Shield, Dodge Away, Deflect Projectile, Faultless Defense, Guardian's Deflection, Body Shield and others).

## Slice 8: reminders when the character uses the action or spell a feat triggers on (2026-10-30)

- **The reader** (`ownUseTrigger` in `src/compiler/event-reminders.js`): "You use Orc Ferocity.", "You Shield Block a melee Strike …", "You enter Tenacious Stance.", "You Leap.", "You cast summon undead.", "You Cast a Spell using a spell slot." / "You cast a divine spell …" (any spell).
- **Live** (`onOwnUse` in `scripts/reminders.js`): when a character's action, feat or spell is posted (its use, not a later check or damage roll from it), its owners are whispered the feats that trigger on it, matched by the item's name or, for "a spell", any spell. Same setting as slices 6 and 7.
- **Another creature's spell:** "A creature Casts a Spell that you have prepared" (Counterspell), "An enemy casts a spell that targets you …", "A creature within 30 feet casts a spell." When a spell is posted, each character on the scene whose disposition isn't the caster's (in range, when the trigger gives one) is whispered those feats.
- **Measured:** 24 options for the character's own use, 19 for another's spell (Counterspell, Recognize Spell, Countercharm, Reactive Spellshift and others).

## Slice 9: reminders before the character's own roll (2026-10-30)

- **The reader** (`preRollTrigger` in `src/compiler/event-reminders.js`): a reaction or free action used before one of the character's rolls, which a note on the roll's card would reach too late: "You attempt a saving throw against a magical effect, but you haven't rolled yet." (before a save), "You're about to roll initiative." (before initiative), "You have the dying condition and are about to attempt a recovery check." (before a recovery check).
- **Live** (`scripts/reminders.js`):
  - before a save: when the GM posts a non-character's spell or ability whose card asks for a save (PF2e's inline save link) with characters targeted, each targeted character's owners are whispered its before-the-save feats;
  - before initiative: when a character joins an encounter without initiative;
  - before a recovery check: at the start of a dying character's turn, with its other turn reminders.
- **Measured:** 42 options (Charmed Life, Divine Aegis, Resist Magic, Qi Buffer, Swaggering Initiative, Oracular Warning, Reanimating Spark and others). An area save with no targets set gets no reminder; the trigger's other words are the player's to judge.

## Slice 10: reminders when a condition is gained, at 0 Hit Points, and on a critical miss (2026-10-30)

- **The reader** (`eventTrigger` in `src/compiler/event-reminders.js`, more triggers): "You would gain the Fatigued condition", "You would be reduced to 0 Hit Points" (self-condition); "An ally within 30 feet gains the Frightened condition", "An ally is reduced to 0 Hit Points" (ally-condition); "A creature within 60 feet gains the Frightened condition" (creature-condition); "A creature within your reach critically fails a Strike against you" (critical-miss, Dueling Riposte).
- **Live** (`scripts/reminders.js`): when a condition item is created on an actor, or its Hit Points drop to 0, its own feats and other characters' in range (allies by disposition for the ally ones) are whispered. A critical miss joins slice 7's attack-roll events. A "would gain" trigger is reminded once the condition is on, for the GM to undo if the player uses the feat.
- **Measured:** 48 options (Dueling Riposte, Aldori Riposte, Reassuring Presence, Avenge in Glory, Commitment to Valor, Cracked Mountain, Unkillable and others).

## Slice 11: reminders when a foe near the character moves or uses a manipulate, concentrate or move action (2026-10-30)

- **The reader** (`eventTrigger`, foe-acts): "A creature within your reach leaves a square during a move action it's using", "A creature within 10 feet of you uses a manipulate action or a move action", "A creature within your reach uses a concentrate action", "A creature moves to be within 15 feet of you". "Your reach" is counted as 10 feet, so a 5-foot reach may get a reminder it can't use.
- **Live** (`scripts/reminders.js`), in an encounter only: when a non-character's token moves and starts or ends in range of a character of another disposition; and when a non-character's action or spell is posted whose traits include the ones named.
- **Measured:** 7 options (Not So Fast!, Shoving Sweep, Hunting Snag, Opportune Throw, Reflexive Courage, Distracting Explosion, Back Off!). PF2e's own Reactive Strike and its kin were already counted handled.

## Measured (2026-10-30, after slice 4)

On PF2e's packs and the Teams+ modules, for a level 8 character, the index has 4,826 options that need work. Of those, 486 now read into a live card: 289 saves, 168 Strike feats and 29 checks. 43 more read into a PF2e Effect, which gets a card only with the world setting (D2). 48 read as having no effect in a fight.

## Decisions kept for the user

| # | Question | What's built meanwhile |
|---|---|---|
| D1 | Should the feat work stay in the ability module, or move to its own module? | **Decided 2026-10-30: its own module**, this one. |
| D2 | Should characters get cards for the ability readings beyond saves, checks and healing (Effects, builtins like stances and self-buffs)? | A world setting, "Cards for characters' feats"; by default only saves, checks, healing and Strike feats get a card. |
| D3 | A feat whose damage names a value PF2e's roll data doesn't hold: post the card anyway with the GM to fix the dice, or leave it to PF2e? | Left to PF2e. |
| D4 | The card aims at the player's targets when the feat was posted. If there were none, should it fall back to the GM's targets? | No targets: the card is posted with none. |
| D5 | Strike feats whose text the reader only partly reads: post the card with the unread sentences as GM notes, or keep such feats PF2e's until they're read whole? | Card with GM notes. |
| D6 | A feat that is only "Stride, then Strike" (Viper Strike, Looming Gait) has no hit results: just the GM note and the simulator's Strides, no card. Enough? | Note only. |
| D7 | A reaction read as used (slice 3) gets its card when the player uses it from the sheet. Should the card also show its trigger ("Used on: a creature … damages you with a melee Strike") for the GM to check? | Kept on the plan (`usedOn`), not shown. |
| D8 | What's left (about 4,300 options) is mostly passives (849 "other rule text", 148 conditional bonuses, 65 resistances, 196 daily resources), companions (475) and stances with no Effect (about 60). These don't read into a card: PF2e automates them with rule elements on the feat or an Effect. Should the module ship its own rule elements for them (a compendium of Effects, or rules added to the feat when it's on a character), batch by batch as the ability module did monsters? | Not started. The text readers go on with the long tail meanwhile. |
| D9 | 157 options have PF2e's own self-applied Effect (`selfEffect`), which PF2e already offers as a button on the feat's chat card. Should the module apply it on use instead of the button? | Left to PF2e's button. |
| D10 | A feat read in slice 5 puts the module's Effect on the character as soon as it's used, with no card or button. Should it ask first (a button on the chat card), or apply it as PF2e's own stances do? | Applied on use, whatever the D2 setting. |
| D11 | Turn reminders (slice 6), attack and damage reminders (slice 7) and own-action reminders (slice 8) before-the-roll reminders (slice 9) condition reminders (slice 10) and foe-movement reminders (slice 11) are whispered to the character's owners and the GM at each turn start or end, or attack or damage roll, where a feat triggers. On by default, or off until a group turns them on? | On by default; a world setting turns them off. |

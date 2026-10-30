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

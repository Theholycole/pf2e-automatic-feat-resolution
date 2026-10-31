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
- **More (2026-10-30, the loop).** A passive's spell by name, capitalized as the text has it ("When you cast Harm or Heal", Fast
  Channel; "you cast Force Fang", Force Jaws; Fireball, Grease, Wall of Fire, Black Tentacles), and actions named in words ("When you
  Cleave", "Emblazon an Armament", "Spit Ambient Magic", "Prepare Elemental Medicine", "Treat a Disease or a Poison", "Raise your Horde").
  28 more. Count: 2,774 of 4,826 left.
- **Measured:** 24 options for the character's own use, 19 for another's spell (Counterspell, Recognize Spell, Countercharm, Reactive Spellshift and others).

## Slice 9: reminders before the character's own roll (2026-10-30)

- **The reader** (`preRollTrigger` in `src/compiler/event-reminders.js`): a reaction or free action used before one of the character's rolls, which a note on the roll's card would reach too late: "You attempt a saving throw against a magical effect, but you haven't rolled yet." (before a save), "You're about to roll initiative." (before initiative), "You have the dying condition and are about to attempt a recovery check." (before a recovery check).
- **Live** (`scripts/reminders.js`):
  - before a save: when the GM posts a non-character's spell or ability whose card asks for a save (PF2e's inline save link) with characters targeted, each targeted character's owners are whispered its before-the-save feats;
  - before initiative: when a character joins an encounter without initiative;
  - before a recovery check: at the start of a dying character's turn, with its other turn reminders.
- **Measured:** 42 options (Charmed Life, Divine Aegis, Resist Magic, Qi Buffer, Swaggering Initiative, Oracular Warning, Reanimating Spark and others). An area save with no targets set gets no reminder; the trigger's other words are the player's to judge.

## Slice 10: reminders when a condition is gained, at 0 Hit Points, and on a critical miss (2026-10-30)

- **The reader** (`eventTrigger` in `src/compiler/event-reminders.js`, more triggers): "You would gain the Fatigued condition", "You would be reduced to 0 Hit Points" (self-condition); "An ally within 30 feet gains the Frightened condition", "An ally is reduced to 0 Hit Points" (ally-condition); "A creature within 60 feet gains the Frightened condition" (creature-condition); "A creature within your reach critically fails a Strike against you" (critical-miss, Dueling Riposte); "A creature missed you with a melee attack" (miss, Elude Trouble, Coursing Weave; added in the loop) "You are struck by a critical hit", "A critical hit deals physical damage to you", "critically succeeds on a Strike against you" (critical-hit, Stone Bones); "attempts a ranged Strike against you" (targeted); "A Large or larger enemy ends a move action adjacent to you", "A foe ends its movement adjacent to you" (foe-acts). Count: 3,164 of 4,826 left.
- **Live** (`scripts/reminders.js`): when a condition item is created on an actor, or its Hit Points drop to 0, its own feats and other characters' in range (allies by disposition for the ally ones) are whispered. A critical miss joins slice 7's attack-roll events. A "would gain" trigger is reminded once the condition is on, for the GM to undo if the player uses the feat.
- **Measured:** 48 options (Dueling Riposte, Aldori Riposte, Reassuring Presence, Avenge in Glory, Commitment to Valor, Cracked Mountain, Unkillable and others).

## Slice 11: reminders when a foe near the character moves or uses a manipulate, concentrate or move action (2026-10-30)

- **The reader** (`eventTrigger`, foe-acts): "A creature within your reach leaves a square during a move action it's using", "A creature within 10 feet of you uses a manipulate action or a move action", "A creature within your reach uses a concentrate action", "A creature moves to be within 15 feet of you". "Your reach" is counted as 10 feet, so a 5-foot reach may get a reminder it can't use.
- **Live** (`scripts/reminders.js`), in an encounter only: when a non-character's token moves and starts or ends in range of a character of another disposition; and when a non-character's action or spell is posted whose traits include the ones named.
- **Measured:** 7 options (Not So Fast!, Shoving Sweep, Hunting Snag, Opportune Throw, Reflexive Courage, Distracting Explosion, Back Off!). PF2e's own Reactive Strike and its kin were already counted handled.
- **Allies moving** (the loop, 2026-10-30): "An ally ends a move action adjacent to you", "An ally within your reach uses a move action …", "An adjacent ally moves" (ally-moves: Goblin Scuttle, Shadow Tempo, Synchronous Slither, Don't Let Go, Slingshot Maneuver). A character's token moving reminds the other characters of its side with these feats when the move starts or ends in range, in an encounter. Count: 3,159 of 4,826 left.
- **The character's own Strike** (the loop, 2026-10-30): "You critically hit a foe with a melee weapon Strike", "Your Strike critically hits …" (own-critical-hit), "You succeed at a melee Strike", "Your Strike hits an off-guard creature" (own-hit), "You miss with a firearm or crossbow Strike", "You misfire" (own-miss): its attack roll's message reminds the character itself. Also "You would be hit by a Strike" (hit), "You're targeted with a Strike" (targeted), "You would take acid, cold … damage" (damaged), "You're reduced to 0 Hit Points" (self-condition). Count: 3,125 of 4,826 left.
- **A foe dropped** (the loop, 2026-10-30): "You reduce an enemy to 0 Hit Points", "Your melee Strike reduces a creature to 0 Hit Points" (own-kill) remind the character whose turn it is when a foe falls to 0; "An ally within 30 feet brings an enemy to 0 Hit Points" (ally-kill) its allies in range. Count: 3,120 of 4,826 left.
- **The character's own save** (the loop, 2026-10-30): "You succeed or critically succeed at a Reflex saving throw", "You fail (but don't critically fail) a saving throw against …", "You critically succeed on a Fortitude save …" (own-save, with the degrees and saves it names): the save's message reminds the character. What it's against is the player's to judge. Count: 3,110 of 4,826 left.
- **The character's own check** (the loop, 2026-10-30): "You fail, but don't critically fail, a Deception or Performance check", "You succeed at a Demoralize check", "You fail a skill check" (own-check, with its degrees and the skills or actions it names): the skill or Perception check's message reminds the character. Count: 3,101 of 4,826 left.
- **Initiative** (the loop, 2026-10-30): "You roll initiative", "You roll for initiative, and you are observing …" are read as pre-initiative too (reminded as the character joins the encounter). Count: 3,093 of 4,826 left.
- **Another creature's roll** (the loop, 2026-10-30): "A creature within 30 feet critically fails an attack roll, skill check, or saving throw", "An ally within 30 feet of you critically succeeds at an attack roll or skill check", "An enemy critically succeeds at an attack roll or saving throw", "You or an ally within 30 feet fails an attack roll or skill check" (others-roll: who rolled, its degrees and kinds): any attack, skill or save message in an encounter reminds each character whose feats fit. Count: 3,083 of 4,826 left.
- **More wordings** (the loop, 2026-10-30): "You're targeted by a ranged attack", "You're the target of a physical attack", "You or an adjacent willing ally are the target of an attack" (targeted); "Your attack with a firearm misfires" (own-miss); "Your turn would end", "You complete the last action on your turn" (end of turn). Count: 3,076 of 4,826 left.
- **Passive feats** (the loop, 2026-10-30): a passive feat whose text says when it applies, "Whenever you critically succeed on a Strike, …", "When you would gain the Drained condition, …", is read the same way, its "When" clause as the trigger (kind "passive"). Count: 3,046 of 4,826 left.
- **Passive feats that change an action or spell** (the loop, 2026-10-30): "When you use Fervor, …", "Whenever you Cast or Sustain a hex, …" remind as the character uses it (own use, kind "passive"); not a Stride, Step, Leap or Interact. A spell trigger now keeps the traits or names it needs ("You cast an illusion spell", "a spell with the darkness trait", "a Harm or Heal spell") and matches only those spells. Class actions named as verbs count too ("When you Refocus", "When you Rage", "When you Hunt Prey", "When you Demoralize"), and "You successfully Strike", "You score a critical hit" are own Strike results. Count: 2,901 of 4,826 left.
- **Passive feats at the start or end of the turn** (the loop, 2026-10-30): "At the start of each of your turns, you gain an additional reaction …" (Tactical Reflexes, Improved Dueling Riposte), "At the end of your turn, reduce your frightened …" remind with the turn reminders (kind "passive"). Count: 2,925 of 4,826 left.
- **Setting** (the loop, 2026-10-30): "Reminders for passive feats too" (on by default) leaves the passive ones out when off; the whispers now say "Feats that may apply".

## Hand-picked: the core classes' feats (2026-10-30, Cole's choice after the loop)

- **How** (`src/plans/`): a feat the readers don't take gets an entry by its compendium UUID, written from its text: `strike` (what differs from a plain Strike, merged into the strike-activity builtin: Strikes, Strides, ranged or melee, off-guard, a hit's conditions, push or follow-up action) `act` (a basic action it uses as written), `affect` (conditions on its target with no roll) or `text` (its rules in plain words with PF2e's tags, so the readers fill the character's numbers). `compileFeat` looks there first. What a feat does that the card can't play goes to the GM as notes when it's used.
- **Fighter** (14): Brutish Shove, Dragging Strike, Slam Down, Parting Shot, Quick Reversal, Rebounding Toss, Dashing Strike and others. Lunge, Dual-Handed Assault, Advantageous Assault, Dazing Blow and Agile Shield Grip already have PF2e's own rules.
- **Rogue, ranger, barbarian, monk** (22): Resounding Blow, Mage Hunter, Disarming Assault, Knockback Strike, Wave Dashes Rocks, Blazing Streak, Time Dilation Cascade and others. Saves at the class DC (Felling Shot, Silencing Strike, Master Strike) the readers already take with the character's own DC. When an entry and the readers both take a feat, the entry wins but the readers' save stays.
- **Swashbuckler, gunslinger, guardian, magus, champion** (37, `tactical.js`): Phalanx Breaker (push 10, 20 on a critical hit), Shoulder Check, Belly Flop, Weakening Assault, Shield Wallop, Drifter's Juke, Triggerbrand Blitz, Spell Swipe and others. Their saves after the hit (Stunning Finisher, Ring Their Bell, Bloody Denial) come from the readers.
- **More Strike feats** (37, `strikes-2.js`): Sawtooth Grapple (Grapple after the hit), Wolf Drag (prone), Disrupt Qi (enfeebled), Subtle Shank (off-guard), Impossible Volley, Deadly Aim and Hamstringing Strike (–2 to hit), Dance of Thunder and others. A stance's Strike goes by its name (Tiger Slash: the tiger claw).
- **Basic actions** (77, `maneuvers.js`, with 9 from Teams+): a feat that uses Demoralize, Feint, Trip, Shove, Grapple, Disarm or Reposition as written gets that action's card, rolled with the character's own skill (an `act` entry), its changes as notes: Dazzling Display, Terrifying Howl, Tail Spin, Drive Back, Submission Hold and others. Strikes that end in a maneuver (Shackles of Law), and three feats that put a condition on their target with no roll (an `affect` entry: Instant Opening, Seize, Furious Grab).
- **Plain Strike feats** (slice 12, `strikes.js`): a feat whose own Strike adds nothing the readers take ("Make a ranged Strike with a thrown weapon. If your hands are full…") still gets the Strike's card, its rules as notes, marked `plain`. Only actions, reactions and free actions, and only when the Strike is the character's own, not a companion's, ally's or eidolon's. This took about 170 feats at once; the hand entries stay for the ones whose hit does something.
- **Saves rewritten** (`saves.js`): a `text` entry can carry notes for what its rewrite leaves out (Fling Head's extra targets, Spirit's Anguish's remnant damage, Pandemonium Eruption's random type, Boulder Roll's push, Sonic Dash's Awakening).
- **More saves** (`saves-2.js`, after the Foundry test): Shifting Terrain, Steal Time (Slow's results), Statement Strut, Calaca's Showstopper (Synaptic Pulse's), Fearful Symmetry, Bolera's Interrogation, and Teams+ Kneel Before the Soverign, Protect the Meek, Sparkling Glory and Release Horrors. Count: 3,251 of 4,826 left.
- **Checks against a creature's DC** (`checks.js`): Alluring Performance (each creature within 15 feet), Daring Act, Vexing Tumble, Watch Your Back, No Cause for Alarm (and Teams+'s), Convincing Illusion, Plant Evidence, and Teams+ I'm Not Finished and Establish Etiquette. A `text` entry can now name its card's `target`. Count: 3,241 of 4,826 left.
- **Damage** (`damage.js`): Mask of Pain, Infernal Anguish, Call the Swarm, Start the Festival!, Shame the Sin, Gossamer Blade, Rend Mimicry (an automatic card with the damage; lingering parts as notes); Inflict Punishment, Teams+ All-Out Friendship Blast! and Furious Cacophony (its degrees turned to the creature's save); Align Qi's self-heal. Self-heals whose amount is a label ("{1d6 Hit Points for every 2 levels} you have (minimum 1d6)", Feral Mending, Revivifying Mutagen) are read now. Count: 3,228 of 4,826 left.
- **Saves 3** (`saves-3.js`): Kobold Breath (a 15-foot fire cone with Reflex; the benefactor's shape, type and save as a note), Wrath of the Hold, Luring Chomp, Public Execution, Ferocious Gust (Gust of Wind's results), Mummy's Despair (one card for each creature that enters the aura) and Bestial Snarling (each enemy within 5 feet). Count: 3,216 of 4,826 left.
- **Damage 2** (`damage-2.js`): Self Destruct, Stranglehold, Twist the Knife (a rogue's sneak attack dice), Rejoice in Solstice Storm (spring's electricity; the other seasons as a note), Kneel Before the Rightful Heir (its save had no tag), Poisoner's Twist (two dice, two components), and Teams+ Spirit Burn, Feel My Pain and Inevitable Fate. Count: 3,210 of 4,826 left.
- **Strikes 3** (`strikes-3.js`): Reloading Trick, Hit and Run, Phase Bullet, Guiding Shot, Gods' Palm, Opportune Opening, Death Roll (prone on a hit), Wukong Extension, Dizzying Spin Dance, Dual-Weapon Blitz, Cornered Animal, Path of Iron, Engraving Strike, Crescent Spray and Deathblow. Count: 3,197 of 4,826 left.
- **Maneuvers 2** (`maneuvers.js`, "More"): Staff Sweep, Unbalancing Sweep, Ranged Disarm, Wheeling Grab, Running Tackle, Protect the Royal Line (a success counts as a critical success), Squirm Free and Disengaging Twist (Escape), Toppling Transformation and Mixed Maneuver. Count: 3,187 of 4,826 left.
- **No-roll conditions** (`affects.js`): concealed on the character (Nanite Shroud, Extraplanar Haze, Storm Shroud, Pollinate; a target of "you" now plays on the character's own token), off-guard on a target (Lesson of Mutual Gambits, Emotional Push, Pouncing Transformation), quickened on a minion or allies (Spark of Independence, Song of Grace and Speed, Quickening Banner, Rallying Cry, Cadence Call). Count: 3,175 of 4,826 left.
- **Count** after these: 3,287 of 4,826 still need work. (The count now gives the test character every class's DC, as a character with that class or its archetype has; before, feats with "against:barbarian" and the like weren't read in the count, though they are in play. The count also gives the character every skill's DC and plays the basic actions, as play does. The 161 feats whose PF2e data names their own Effect, applied by PF2e's Use button, are counted as done.)

## Slice 13: actions that grant one of PF2e's own Effects (2026-10-30)

An action, free action or reaction whose one result is an Effect its text links ("You gain a +1 circumstance bonus to AC until the start
of your next turn. Effect: Ceremony of Protection") gets the ability module's effect card, with Apply (src/compiler/linked-effect.js). Who
gets it is read from the sentence that grants it: the character ("You gain"), one ally or creature, the GM's target ("Choose a target ally
within 60 feet", "the triggering ally can reroll", "You grant one creature"), or the character and its allies ("You and all allies within
30 feet gain", found in range by the card itself; "You and all allies within the aura of your commander's banner", the GM's targets and the
character). Not when it does anything else (a check, a Strike, movement, a spell, a choice of results), links two Effects, or PF2e already
applies it from the sheet. The cards setting's default now includes these Effect cards (D12, below).
- **Measured:** 21 options (Ceremony of Protection, Fleet Tempo, Defiant Banner, Fear No Pain!, Watch Your Back …). Count: 3,261 of 4,826 left.

## Slice 14: actions that heal one other creature (2026-10-30)

An action, free action or reaction whose one roll is a healing @Damage tag given to one creature ("An adjacent creature regains …",
"restore … Hit Points to it", "You or a living creature adjacent to you regains …") gets the ability module's automatic card with its heal,
on the GM's target (src/compiler/other-heal.js). The rest of that sentence and the text's other rules are notes; "you or" adds a note to
target the character's own token. Not when the healing comes only later or only sometimes ("If the cocoon survives …"), heals more than one
creature, or the action also has a check, an area, a Strike or a spell.
- **Measured:** 5 more (Cantorian Restoration, Ease the Burden, Fermenting Liquors, Fish From the Falls' Edge, Searing Restoration; the
  others matched were already read). Count: 3,223 of 4,826 left.

## Older check syntax in third-party packs (2026-10-30, the loop)

- Teams+ and Summoners+ still write `@Check[type:will|…|basic:true]`, PF2e's older syntax; it's read as `@Check[will|…|basic]` before the
  character's DCs are filled (`currentSyntax`, `src/compiler/character-dcs.js`). Restricting Flora, Animal Mimicry and World-Shaking
  Throw now get cards; the others with it (Strike Barrage, Bomb Flurry) deal a Strike's or a bomb's damage the card can't name.

## Hand-picked: saves said in words (2026-10-30, the loop)

- `src/plans/saves-4.js`: Frightening Power (each enemy within 20 feet, Will, frightened 1/2/4), Breath of the Dragon (Dragonblood; a
  15-foot cone, untyped Reflex), Warped Constriction (the grabbed creature, bludgeoning plus mental, a basic Will save), Curse of the Saumen
  Kar (Reflex, the prison's numbers a note), Spellbinding Speech. Each against the higher of the class and spell DC.
- **Measured:** 3 more. Count: 2,843 of 4,826 left.

## Hand-picked: heals around a choice or a cost (2026-10-30, the loop)

- `src/plans/heals.js`: Spirit's Absolution (you or an adjacent ally, the spirit wisp's (level)d4), Floral Restoration, Vital Compound
  Invocation (5 + double your level, after the runes), Instant Recovery (Constitution × level). Areas, found by the card: Waters of Creation
  ((half level)d6 to each creature within 15 feet) and Plant Banner (4 temporary Hit Points, 4 more at 4th level and every 4 levels, to each
  ally within 30 feet, for 1 round). An area's amount is worked out from every character number now, not only the level.
- **Left.** You Can't Keep Us Down heals only dying or unconscious-and-wounded allies, which the card can't pick; Life's Blood heals what
  you lose; Reclaim Power and Absorb Strength depend on what was destroyed or eaten.

## A Focus or Mythic Point back (2026-10-30, the loop)

- "You regain 1 Focus Point, up to your usual maximum", "You regain 1 Mythic Point": when that is the last thing the action says and
  nothing is rolled (`src/compiler/regain-point.js`), posting it adds the point to the character's pool, never past its maximum, and says
  so in the chat (`scripts/main.js`, run by the GM). What comes with it is a note: Invoke Infernal Focus's doomed, Consume Thrall's
  thrall. Not "When an enemy triggers your champion's reaction, you regain …" (Retributive Focus): only sometimes.
- Energized Font, Well of Potential, Dissolution's Clarity, Surging Focus, Consume Thrall, Invoke Infernal Focus, Summon Mythic Power, Mythic
  Echo. Count: 2,830 of 4,826 left.
- **Foundry test (2026-10-30, 7744ee3).** Energized Font took Focus 1 to 2 of 2 and said so; again at 2 of 2 it changed nothing and said
  the pool was full. Invoke Infernal Focus the same, its doomed a note. A world without mythic rules has no Mythic Points: the line now
  says so. Instant Recovery rolled PF2e's own 24 healing; Spirit's Absolution healed 8d4, Vital Compound Invocation 21; Waters of
  Creation found the three creatures within 15 feet (an enemy too, as written) and not the character; Plant Banner gave 12 temporary Hit
  Points for 1 round to each ally within 30 feet; Frightening Power found only the enemy within 20 feet (DC 24, frightened 4 on a critical
  failure); Warped Constriction dealt 8 bludgeoning and 2 mental on one basic Will save. No errors.

## Hand-picked: more checks against a creature (2026-10-30, the loop)

- `src/plans/checks-2.js`: Whirling Throw (Athletics against the grabbed creature's Fortitude DC; (1 + half Str)d6 + Str bludgeoning on
  a success, prone too on a critical success, the distance a note), Mythic Containment (Deception against Will; grabbed and slowed 1 in
  the receptacle), Denounce Tyranny (Diplomacy against the Will DC of each ally of the creature, the GM's targets).
- Also: Embrace of Destiny in `saves-4.js` (Will against the class DC, the pull to an adjacent square by hand), and Ghostly Condemnation
  cast as a 5th-rank Vision of Death ("is subject to the effects of" now reads as a spell-like feat). Count: 2,825 of 4,826 left.

## Hand-picked: more conditions with no roll (2026-10-30, the loop)

- `src/plans/affects-2.js`: concealed on yourself until your next turn (Flickering Twirl, Fade Into Daydreams), on you and each adjacent
  ally (Banner Twirl, ranged attacks only a note); off-guard on yourself (Statue, until you act); off-guard on the creature your Double
  Slice hit twice (Flensing Slice, its bleed and resistances PF2e's Effect); dazzled on each enemy within 20 feet (Cleansing Light, its
  Restoration by hand).
- Reactions and free actions, played as the player posts them: concealed (Heat Wave, Eerie Flicker), prone ended as you Stand (Hop Up,
  Call to Battle), drained 1 or 1 more (Blood Calls Blood), dying ended with doomed 1 more (My Legend Must Be Told), and 7d10+28 healing
  on the triggering creature (Sorshen's Devotion).
- **Foundry test (2026-10-30, c8a7c8e).** All 18 played as written: Whirling Throw 15 bludgeoning and prone on a critical success,
  Mythic Containment grabbed and slowed 1, Denounce Tyranny a line per creature, Embrace of Destiny DC 24, Ghostly Condemnation a 5th-rank
  Vision of Death at DC 24, each concealment, off-guard and dazzle on the right creatures for the right time, Hop Up's prone gone, Blood
  Calls Blood drained 1 then 2, Sorshen's Devotion 63 healing. Fixed after it: My Legend Must Be Told ended dying and with it the
  unconscious PF2e grants from dying, so it puts unconscious back; Whirling Throw's note says the thrown creature is no longer grabbed.
- **Re-test (2026-10-30, 4b6e5c0).** My Legend Must Be Told left the character unconscious and doomed 1 with dying gone; Plane Step,
  Tempo Duelist, Now You See Me and Tempo Shift for the right times; Flourishing Finish on the two enemies only (frightened 1 and 2);
  Seething Frenzy 8 temporary Hit Points on the eidolon from its own sheet; the passives' reminders (Fast Channel on Heal and Harm, Invert
  Harm on Harm only, Great Cleave, Volatile Grease, none on an unrelated spell); Imperious Calamity cast Summon Elemental Herald at DC 24
  from its UUID without ".Item." (cast as arcane from the spell module's entry, not the dragon's tradition). No errors.
- Movement and tempo: concealed (Plane Step until the end of your next turn, Tempo Duelist, Now You See Me until the end of your turn),
  quickened for the round (Tempo Shift); the Stride and the foes' off-guard are notes. Flourishing Finish in `checks-2.js`: Performance
  against the Will DC of each enemy within 30 feet, frightened 1, or 2 on a critical success.

## Companions: eidolons, animal companions and familiars (2026-10-30, Cole's choice)

- **How they're built.** PF2e has no actor type for an eidolon or an animal companion. PF2e Companion Compendia makes them "character" actors: an eidolon has the Eidolon class and an ancestry with the eidolon trait, an animal companion has the minion trait. A familiar has its own type, "familiar", and the only link PF2e keeps: `system.master.id`. Neither Companion Compendia nor Summoners+ links an eidolon to its summoner.
- **The master** (`src/compiler/companion.js`, `findMaster`). The module's own flag first (`flags["pf2e-automatic-feat-resolution"].master`, an actor id). Then a familiar's PF2e link. Otherwise, the one character the same player owns that isn't a companion: a summoner first for an eidolon, then the player's assigned character when they own several. None found: the companion's own DCs, as before.
- **Its DCs.** An eidolon's "against your spell DC" is the summoner's, always. Another companion uses its master's class or spell DC only where it has none of its own. Its level, attributes and Strikes stay its own.
- **The summoner's evolution feats.** Constricting Hold or Eidolon's Trample posted from the summoner's sheet plays as the eidolon (`actingItem`): its Strength and Strikes, from its token, when the summoner has exactly one eidolon.
- **"Your eidolon".** An action with the eidolon trait is read with "Your eidolon makes a melee Strike" as "You make a melee Strike" (`eidolonWords`), so the readers take Furious Strike, Tendril Strike, Piercing Jab and Warpwave Strike as they are. A save tag with no DC followed by "against your spell DC" gets `against:spell` (`namedDCs`): Drain Life.
- **Its reactions.** The reminders read an eidolon's triggers the same way, on the eidolon's own sheet: Surprising Anatomy ("An enemy adjacent to your eidolon deals damage to your eidolon") is a damaged reminder, Redistribute a critical-hit one, Eidolon's Retort a foe-acts one, all measured from the eidolon's token. "Your eidolon" after a preposition is the object ("to you"), not the one acting.
- **Familiars** play cards too (their actor type is allowed); reminders stay for characters (eidolons and animal companions are characters, so theirs come).
- **By hand** (`src/plans/eidolons.js`): Dragon Breath (a 30-foot cone, untyped), Elemental Burst, Swarming Assault, Constricting Hold, Visions of Sin, Incarnate Arrival; Demoralize for Primal Roar (each enemy within 30 feet), Haunting Visage, Be Not Afraid!, Glory Seeker; Strikes for Drain Life (its save on the hit's card), Beast's Charge (two Strides), Whirlwind Maul, Elemental Maelstrom, Surprising Leap.
- **Feats the companion acts in.** A hand entry with `by: "companion"` plays as the master's one companion (an eidolon first for a summoner or tandem feat): Tandem Strike and Magical Onslaught (the eidolon's Strike, then yours by hand), Death Dive (the mount's Strike, prone on a hit).
- **Foundry test, companions (2026-10-30).** A level 8 summoner (spell DC 24) and Beast eidolon owned by one player: the master was found by ownership and every save was DC 24. Primal Roar found each enemy within 30 feet itself; Constricting Hold from the summoner's sheet came from the eidolon's token at 12 bludgeoning (level 8 + Str 4). Fixed after it: Dragon Breath rolls the eidolon's chosen type (`flags.pf2e.rulesSelections.dragonBreathDamage`), and Drain Life's save deals its half-level void damage. Dragon Breath's cone still hits the GM's targets, as any template does.
- **Left.** Underling actions (Teams+ adventures) are an NPC's, for the ability module. Eidolon's Trample and Field of Roots deal a Strike's damage the card can't name; Flowing Engulf, Unspeakable Demonstration and Inhibiting Excretion are lasting areas.

## Spell-like feats (2026-10-30, Cole's choice)

- **What.** An action, reaction or free action that is a spell: "This has the effects of a 2nd-rank Web spell using your class or spell DC, whichever is higher" (Webslinger), "You cast Enlarge" (Ka Stone Ritual), "the 3-action version of Heal". `src/compiler/spell-like.js` reads the spell, its rank ("Nth-rank", or "heightened to half your level rounded up") and the DC it names (class, spell, or the higher of the two). With no DC named, it uses the higher of the character's class and spell DCs, and the card says so.
- **How it plays.** The spell module's (id `pf2e-automatic-resolution`) `api.castFromItem` casts it through PF2e from a temporary innate entry with that DC, on the player's targets, and the spell module's own card resolves it (scripts/main.js, `castSpellLike`). A spell named in the text by name ("…spells-srd.Item.Web") is looked up in its pack. Without the spell module, nothing is cast.
- **Not read.** Passives (their "you can cast" changes another casting or is the spell module's granted spell), triggers and requirements ("You cast Spellsurge"), sentences starting "When", "If" or "While", spells "at will" for a while, a spell after a check (Unwind Death), two spells to choose from, and feats with PF2e's own Effect.
- **Foundry test (2026-10-30).** Webslinger cast a 2nd-rank Web at DC 24 (the higher of class 24 and spell 22), Quaking Stomp an 8th-rank Earthquake at the class DC, True Senses a 6th-rank Truesight, each with the feat's name in the card's header. Dire Growth, Ka Stone Ritual and Rat Form cast nothing: live, their spell's UUID is by id, and the ability module's own reader made them its "cast-spell" plan first. That plan now casts the same way. The spell module's temporary entry and Effect stay on the sheet for 10 minutes of world time; a card resolved after that can't find the DC.
- **More read (2026-10-30, the loop).** "Is subject to the effects of" (Ghostly Condemnation); a spell in italics after "You cast"
  (Imperious Calamity, Tandem Boost, Verdant Apotheosis, Sure Wand); a spell UUID written without ".Item." (put back); "with a rank equal
  to half your level rounded up" (Believer's Form). Not a spell the feat only lets you pay for ("you can spend 1 Mythic Point to also gain
  the effects of Enlarge", Soul-Form).
- 22 feats, among them Webslinger, True Senses, Rat Form, Bat Form, Animal Rage, Dire Growth, Quaking Stomp, Reactive Transformation and Glass Skin.

## Senses on tokens (2026-10-30, Cole: "darkvision, true sight, echolocation and others should work as expected")

- **What PF2e does.** With rules-based vision on, `TokenDocumentPF2e#_prepareDetectionModes` gives the token darkvision (greater darkvision the same), see invisibility, tremorsense and hearing, rebuilt on every prepare. It leaves every other sense off the token, and ignores acuity.
- **What the module adds** (`scripts/senses.js`, `src/compiler/senses.js`). After PF2e's own step (a libWrapper wrapper, or a plain override without libWrapper), it adds a detection mode for each of the actor's other senses at its range. A precise sense shows the creatures it finds as seen (built on Foundry's DetectionModeAll); an imprecise one outlines where they are (DetectionModeTremor's outline), as PF2e's hidden. A vague sense adds nothing.
  - Echolocation: precise (always), sound; not while deafened.
  - Scent, wavesense, motion sense, electromagnetic sense: any creature in range.
  - Lifesense and bloodsense: living creatures. Spiritsense: living or undead. Thoughtsense: not mindless, through walls.
- **Left to PF2e or with nothing to show.** Darkvision, greater darkvision, see invisibility and tremorsense (PF2e's own); low-light vision (a token already sees in dim light; concealment is the rules'); truesight (it sees through illusions, not darkness or invisibility); magicsense (magic, not creatures).
- **Setting.** "Senses on tokens", on by default.
- **Foundry test (2026-10-30).** The modes were on the token at their ranges, survived updates and reloads, and the setting removed them at once. Echolocation found creatures within 40 feet and nothing while deafened; scent within 30; lifesense skipped an undead skeleton; thoughtsense reached through a wall and skipped the mindless skeleton. PF2e's darkvision and tremorsense were unchanged. Fixed after it: PF2e's hearing (unlimited range) came first and outlined everything before the module's senses were asked, so the modes now go right after sight, precise ones first; and a precise sense drew seeAll's pale outline, so it now draws the creature as seen.

## Sense regions (2026-10-30, Cole: "regions that enable or disable senses? Wavesense only works in water. Hearing should not work through areas where no sound can pass")

- **The "Senses" region behavior** (`scripts/sense-zones.js`, declared in module.json's documentTypes). Add it to a scene region and tick:
  - **Water**: wavesense works only when the sensing creature and its target are both in such an area. With no Senses area on the scene, wavesense finds nothing.
  - **No sound passes**: hearing (PF2e's own) and echolocation don't reach into, out of or through it.
  - **Senses blocked**: any of hearing, tremorsense, echolocation, scent, lifesense, bloodsense, spiritsense, thoughtsense, wavesense, motion sense, electromagnetic sense, infrared vision; the same into, out of or through.
- **Foundry test (2026-10-30).** Water let wavesense find a wolf in the same water and nothing on dry land; a silent area across the line hid a creature from hearing and echolocation, and moving it aside restored them; a scent-blocking area stopped scent through and inside it. Fixed after it: PF2e's tremorsense takes a third argument (the level), which the guard dropped, so tremorsense found nothing; and the modes were set up at setup, after the world's tokens had prepared, so they appeared only once a token changed (now at init, and the scene's tokens prepare again when the canvas is ready).
- **Conditions inside** (2026-10-30, Cole: "the no sound region giving deafened while inside it"). A creature entering the area gets its conditions, and loses them as it leaves: deafened in a silent area (unless "Silence deafens" is unticked), plus any of blinded, concealed, dazzled, deafened, fatigued, immobilized, invisible, off-guard and prone ticked under "Conditions inside". Each is marked as the area's (`flags["pf2e-automatic-feat-resolution"].senseArea`), so leaving takes only those; one the creature already has from elsewhere isn't added again. Run by the behavior's own tokenEnter and tokenExit events on the active GM's client. A creature already inside when the area is made gets them on its next entry.
- **Re-test (2026-10-30, f5d2f2f).** Modes on tokens at a fresh page load for GM and player; tremorsense outlines again and a tremorsense-blocking area hides only what's in it; truesight gave exactly one whisper per illusion over several moves (Illusory Disguise at its caster's DC 22, rank 1; the plain Invisible condition as "compare by hand"); deafened in a silent area and gone on leaving, not doubled on a creature already deafened; dazzled and concealed from "Conditions inside". No errors or deprecation warnings.
- **How.** Each detection check asks which areas the two tokens stand in, and which the line between them crosses (a point every half square), at their elevations (`senseReaches`, `src/compiler/sense-zones.js`). PF2e's hearing and tremorsense modes are wrapped at setup to ask too.

## Truesight (2026-10-30, Cole: "Have truesight auto roll secretly counteract checks against the spell")

- "The GM rolls a secret counteract check against any illusion within 60 feet, but only once per illusion." A creature whose senses include truesight (any source: heritage, feat, the spell's own Sense rule) rolls one against each illusion that comes within its sense's range (60 feet unless it says otherwise), checked a moment after a token moves, a token, template or region is placed, an Effect is added, or the scene loads (`scripts/truesight.js`).
- **Illusions.** An illusory creature (its actor has the illusion trait; rank half its level), an illusion's Effect on a creature (the Effect's or its spell's illusion trait: Invisibility, Illusory Disguise, Blur; rank the Effect's level), and an illusion's area (a template or region whose PF2e origin has the illusion trait; rank its cast rank). The DC is the caster's best spellcasting DC. Not its own illusions, and not on itself.
- **The check** (`src/compiler/truesight.js`). 1d20 + the viewer's spell DC − 10 (class DC − 10 without one), at counteract rank 6 (truesight's). The degree and whether it counteracts are worked out when the illusion's DC and rank are known; otherwise the roll is given to compare by hand.
- **Invisibility.** PF2e's Invisibility gives only the Invisible condition, so an Invisible creature counts too: its caster's DC and the spell's rank when the condition says where it came from, else the roll to compare by hand.
- **Foundry test (2026-10-30).** Against a Phantasmal Protagonist (illusion trait, level 4, DC 24): 19 vs DC 24, a failure, which still counteracts rank 2 at rank 6; whispered to the GM only. Fixed after it: the record of checked illusions used keys with dots, which Foundry's flags nest, so it rolled again on every move (keys are dot-free now); an Effect's spell was read from the compendium index, which has no traits (now the whole spell); the Invisible condition is read; templates aren't read separately (they're regions in Foundry 14).
- **Secret.** Whispered to the GMs only. Nothing changes on the map: what the creature sees through is the GM's to describe. Each viewer keeps the illusions it checked (`flags["pf2e-automatic-feat-resolution"].truesightChecked`). Setting: "Truesight counteract checks", on by default.

## Linked Effects by hand (2026-10-30, the loop)

- **What:** 17 actions whose result is an Effect linked in their text, that the linked-Effect reader leaves because they do something
  else too (a Stride, a Mythic Point, a light) or say who gets it in their own words. `src/plans/linked-effects.js`, `linked` entries:
  the same plan the reader makes (`handLinked`), the rest a note.
- **On the character:** Augment Senses, Plane-Stepping Dash, Crystal Luminescence, Offer Story, Spiral Sworn, Conduct Energy.
- **On the target:** Rend Armor, Glimpse Vulnerability, Steel Yourself!, Overdrive Ally (30 feet), Bless Ally, Preparatory Cremation,
  Warding Protection, Off-Handed Insult.
- **On you and allies:** Indomitable Spirit and Channeled Protection (adjacent), Unbreaking Castle (your allies).
- **More (12):** Fluttering Distraction (on the attacker), Lesson of the Splintered Aegis, Snap Out of It! (Marshal), Spin Tale (60 feet),
  Share Eldritch Energy (on the ally); Educate Allies and Resounding Finale (your allies); Stymie the Gods, Blanket Defense, Secure Convoy,
  Spirit Squire, Hongali Support Benefit (on you). Foundry test (9a84a6a): Drink from the Chalice (PF2e's Effect, 8 temporary HP to the
  end of your next turn), Fluttering Distraction, Stymie the Gods passed. Spin Tale's Effect marks the user's current target as the
  villain and vanishes without one: its note says to target the villain before Apply. "You and your allies" with no range picked only the
  character: the composition reactions now look 60 feet out (a composition's usual emanation), Unbreaking Castle 120 ("allies you can see").
- **Left:** actions linking several Effects or giving a choice (Raise the Walls' "one ally of your choice" with you, Roll the Bones of
  Fate), and those whose Effect follows a check. Count: 2,672 of 4,826 left.
- **Foundry test** (2026-10-30): cards and targets right at first, but no Effect went on: PF2e's texts link these by name, and the
  ability module's card looks them up by id. The feat module now resolves a name-form link to the pack's id before the card (`byName`,
  `scripts/effects.js`), and the ability module's effect card shows the plan's notes. Re-test (feat 02bd59e, ability e1e3500): Plane-
  Stepping Dash (Speed 25 → 30), Offer Story (AC and Will +1), Rend Armor (target's AC −2), Overdrive Ally, Indomitable Spirit (you and
  the adjacent ally AC +4 and quickened, the ally 10 feet off not), Glimpse Vulnerability: all passed, no console errors.

## Checks against your level's DC (2026-10-30, the loop)

- **What:** "Attempt a @Check[diplomacy|dc:@self.level|adjustment:-2] check" (an easy DC of your level), whose results are PF2e's Effects
  linked in the text. `src/plans/self-checks.js`, `selfCheck` entries: the card rolls the check against the level's DC (the Core
  Rulebook table) plus the adjustment, and each degree's Effects go on the target (`nativeEffects`, the core's check rows; resolved by id
  before the card, as linked Effects are).
- **Six:** the marshal stances (Inspiring, Dread, Devrin's Cunning, Strategist), Helpful Tinkering (on the ally), Call of the Ancestor.
- **The target's level** (`level: "target"`): "the hard DC for the target's level" — the check's `against: { dc: "level", adjustment }`,
  which the ability module's card works out for each target from its level (ability module, `levelDCOf`). Guiding Words, Invincible
  Army, Quick Cuisine. Foundry test (feat a0f9022, ability 9afc236): Guiding Words DC 29 on a level-10 ally, its Effect applied;
  Invincible Army on two allies at once, DC 29 and DC 26, PF2e asking each for the DC chosen and the damage type. The core reports it as a gap (it reads only "target" and "fixed") but resolves it, the card giving each degree.
- **Left:** 83 options use a level's DC; most are exploration or downtime (Deep Meditation, Circadian Disciplinarian), or the DC of
  another creature than the target (Commitment to Protection: the threat's level, the ally gets the Effect).
- **Foundry test** (2026-10-30, cdb2e28): Inspiring and Dread Marshal Stance (DC 22), Strategist Stance (DC 24, its critical-success
  stance) entered the stance, PF2e's aura giving its Effect to allies inside; a failure applied nothing. Helpful Tinkering (DC 26) put
  its Effect on the ally once the GM picked the weapon in PF2e's prompt, which Apply waits on (now said in its note).

## Heals past a choice or a trigger (2026-10-30, the loop)

- `src/plans/affects-3.js`, affect entries: Rekindled Light (heals your level, wounded +1), Restore the Mind (2 + double your level),
  Valkyrie's Charge (80 to each ally within 30 feet), Spirit's Sacrifice (twice your level). Drink from the Chalice's sip is PF2e's own
  Effect (a `linked` entry): the card's temporary Hit Points lasted 1 round from a turn's start, not to the end of your next turn.
  Foundry test (effb7e1): the heals, wounded and Valkyrie's Charge's allies in range (not the one 40 feet off) all passed. The other choice (the chalice's drain, Restore the Mind's
  bonus) and what can't be applied (not dying, not knocked out) are notes.

## Tested in Foundry (2026-10-30)

Foundry 14.367, PF2e 8.6.1, a separate headless server with Teams+, a level-10 test character: 22 of the checklist's 27 checks passed. Fixed
after it:

- Wolf Drag gave no card: a Strike a stance grants (Wolf Jaws) has the stance's Effect as its message's origin. The ability module (0.9.6)
  now also matches the pending Strike feat by the roll options' item slug.
- Disruptive Stare never reminded: PF2e 8.6 posts a spell's cast with context type "spell-cast", which the use, foe-spell, foe-action and
  save reminders skipped as a later roll. They take it as the use now.
- Tail Spin's success applied only the success's results: an act entry's successAsCritical copies the critical success onto the success.
- Hunting Snag missed some moves: in Foundry 14 token.center and the document's x and y follow the move's animation, even in the update
  hooks. The start is read from the document's _source before the update, the end from the change.
- The "needs 0.9.6" warning was logged at load before the ability module had set its live API: it is logged at the first card instead.
- Hunter's Defense reminded for any attacker: a trigger's "creature with the animal, … trait" is read as by, matched to the attacker's traits.
- Mask of Fear reminded at every turn start: a start-of-turn trigger's conditions ("with the Frightened condition") are read as having,
  checked on the character.
- Stunning Finisher without a swashbuckler class DC: its note says to call for the save by hand.
- Dazzling Display, Terrifying Howl and the other "immune for 1 minute" Demoralize feats applied Demoralize's 10-minute immunity: the
  entry carries the feat's own.

- A card whose target is "each enemy within 30 feet" (Dazzling Display, Terrifying Howl and the other each-enemy Demoralizes; "each creature
  on the ground within 10 feet") covered only the GM's targets: it now finds every creature of that kind in range on the scene itself
  (src/compiler/area-targets.js), leaving out the character, defeated ones, neutrals for "enemy", and flyers for "on the ground".

### Foundry test, round 3 (2026-10-30, the loop)

Run in the test Foundry (port 30001) at 636ff0e: Ease the Burden, Kobold Breath, Staff Sweep, Protect the Royal Line, Nanite Shroud, Song
of Grace and Speed, Poisoner's Twist and Death Roll cards passed, and the reminders for Elude Trouble, Stone Bones, Goblin Scuttle,
Triumphant Inspiration, Recall Ammunition, Cartwheel Dodge, Name Drop, You're Next, MORE! MOOOORE!, Ill Tide and Big Debut. No console
errors from the modules. Fixed after it:
- Recall Ammunition reminded on a javelin miss: an own-Strike trigger that names weapons ("a firearm or crossbow Strike") now matches them
  to the Strike's roll options (`weaponFits`).
- Battle Cry gave no reminder: a passive feat saying "When you roll initiative, you can …" is now read as pre-initiative.
- A Shove's push reminded Hunting Snag and Reactive Strike: forced movement and teleports no longer count as moving.
Not fixed: the area save cards (Kobold Breath) hit only the GM's targets, with the area as a note; a heal's card line says "Damage rolled".

### Foundry test, round 4 (2026-10-30, the wide round)

A level 8 Fighter, "Wide Tester", with 22 of the day's hand-picked feats, plus re-tests on the eidolon. Passed: Dragon Breath's fire, Drain Life's void damage, Kobold Breath, Wrath of the Hold, Luring Chomp, Mummy's Despair, Bestial Snarling, Stranglehold, Twist the Knife, Poisoner's Twist, Death Roll, Staff Sweep, Running Tackle, Protect the Royal Line, Storm Shroud, Quickening Banner, Rallying Cry, Battle Cry at initiative, Recall Ammunition (crossbow, not javelin), and no move reminder on a Shove's push. No console errors.

Fixed after it:
- "Each creature within 5 feet" measures between the tokens' edges, so a Large creature next to you is in range (Pouncing Transformation found no one).
- An affect entry can give an effect of its own kind: Rallying Cry's temporary Hit Points equal to your level.

Left as notes: Drain Life's one-degree-worse save on a critical hit, Protect the Royal Line's extra 5 feet on a critical success, and Guiding Shot's Effect on a hit.

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
| D12 | Slice 13's cards that apply a PF2e Effect a feat links: in the "Cards for characters' feats" default ("checks"), or only with "all"? | In the default; the GM still presses Apply. |

### Round 11 (2026-10-30)

- Heals by hand: You Can't Keep Us Down (3 x level to the allies you target; only the dying, or unconscious and wounded, qualify), Patch Up
  (an underling's 1d8 per two levels to an adjacent ally). Linked Effects: Revitalizing Blood (Teams+ Barbarians' Effect on 1 ally within
  30 feet), Raise the Walls (you and 1 ally within 15 feet). Foundry test (feat ec8ffe1): all pass, and Spin Tale (villain targeted before
  Apply) and Educate Allies (allies within 60 feet) now pass too.
- Teams+ Magic's aspects: their saves name the spell's DC and rank by path ("dc:resolve(@actor.flags.pf2e.aspectDC)",
  "(@actor.flags.pf2e.aspectRank)d6"), which Teams+ Magic's AspectForm rule sets on the aspect each time it's prepared. The ability module
  now fills a creature's own numbers by path before reading (ability 1e15a78, src/compiler/roll-data.js), and reads "must make a … save
  or become X" (Behold!). Aspects are NPCs, so their cards are the ability module's; 13 of the index's aspect actions read. Foundry test on
  an NPC with the flags set by hand (Foundry Summons, which Teams+ Magic's summon macro needs, isn't in the test copy): Aftershock (DC 25
  basic Reflex, 3d6) and Terrifying Shriek (6d6 mental) pass.

### Round 12 (2026-10-30)

- Checks against your level's DC said in words (src/plans/self-checks.js): Ostentatious Reload, Improvise Admixture, Seasoned Command
  (hard DC for the ally's level), Fourth Wall Break, Furious Stride (a Fortitude save: the card's check rolls PF2e's save, though its line
  says "check"), Primal Intonation, Transpose Self. The outcomes are notes. Foundry test (feat 87fd97a): all pass, with the right DCs.
- Behold! (ability 039b454): DC 25 Will save, Frightened 1 on a failure, then the 1-minute immunity. A target that's immune gets no card.

### Round 13 (2026-10-30)

- Linked Effects (feat b72c2c2): Benevolent Spirit Deck, Sanctify Armament (PF2e asks which weapon), Rise Up!, Emergency Medical
  Assistance, Face Your Fears, Guide the Timeline (PF2e asks Fortune or Misfortune), Comfort of Struggle and Spiritual Memories (Teams+,
  each asks its choice): all pass.
- Kinetic Dampening's Effect came on with no resistance: PF2e reads "@actor.level-2" as the path "actor.level-2". A rule's formula needs
  spaces around a minus after a path ("@actor.level - 2").

### Round 14 (2026-10-30)

- Kinetic Dampening (resistance 5 at 8th level, to your next turn) and Unravel Into Runes (resistance to all damage equal to your level,
  4 rounds) pass. Ironblood Surge is taken out: PF2e's own feat already carries its +1 AC and Strength-modifier resistance behind a
  toggle ("ironblood-surge", in Ironblood Stance), and its modifier, with the same slug, shadowed the module's.
- 72 of the options still counted as needing work already carry PF2e's own toggle (a toggleable RollOption the player turns on from the
  sheet, which switches on the feat's own modifiers). They're now counted as PF2e's, like those with a self Effect, and left to it.

### Round 15 (2026-10-30)

- Reactions by hand (feat 9efd961): Restorative Teleportation (1d6 + level + Intelligence modifier, on you), Call From Death's Door (ends
  dying, heals twice your level), Bounce Boost (PF2e asks the bonus), Corpse-Killer's Defiance (each ally within 120 feet, not you): all pass.

### Round 16 (2026-10-30)

- Toggled passives (feat 6beee47): Clerics+ sacred animal features (Divine Flight, Transcendent Mobility, Deific Beam, Blessed Skill, on the
  targeted animal), Fist of the Acolyte (PF2e asks the weapon; its Strike becomes returning), Mythic Allies, Cavalier's Banner: all pass,
  on and off. Clerics+ is now enabled in the test copy.

### Round 17 (2026-10-30)

- Toggled passives (feat 057ff5d): Elemental Weapon Systems and Sonar Alert System on the construct, Perfect Appendages (its Strike),
  Scout and Incredible Scout on the party (the scout's own initiative is unchanged, as PF2e's Effect gives the bonus to the others): all
  pass, on and off.

### Round 18 (2026-10-30)

- Toggled passives (feat 4a729d6): Eater of Avatars, Hypersenses (PF2e asks the sense), Moonscarred (12 hours, its temporary Hit
  Points), Affliction Mithridatism (asks the result), Verse of Preparation: all pass. Teams+'s Verse of Preparation Effect works out its
  temporary Hit Points from each ally's own level (5 and 2 in the test), not the bard's: its note says so.

### Round 19 (2026-10-30)

- Deft Cooperation (+1 attack and AC to the end of your next turn) passes. Born in the Saddle's +1 to Reflex applied unmounted too; it's
  now predicated on PF2e's Effect: Mounted ("self:effect:mounted"), whose -2 it softens to -1.

### Allies' Effects from an action (2026-10-31)

- An action that gives an ally a bonus PF2e has no Effect for (Protect Ally's +1 AC, Transfusion's fast healing) is a toggle with
  `who: "target"`: the module's own Effect on each of the player's targets, its formulas worked out from the character's numbers when it's
  made (Bloom of Health's half level), with the character as its origin. Posting it again with the same target takes it off. With no target,
  the GM is told to target first. Plans: Protect Ally, Transfusion, Bloom of Health, Little Buddy, Snap Falling Fruit, Redirecting Draft
  (the last two only against the triggering attack, so a note says to delete them after).

### Round 20 (2026-10-31)

- Protect Ally, Transfusion, Bloom of Health (fast healing 4 at 8th level, a number), Snap Falling Fruit, Redirecting Draft: all pass, on
  the target only, on and off; with nothing targeted, the GM is told to target first. Little Buddy did nothing: an NPC's action, and the
  module played only characters' and familiars'. An NPC's is now played only when it's an ally's Effect (the ability module plays the rest).

### Stances by hand (2026-10-31)

- A toggle can be a stance (`stance: true`): the module's Stance Effect, which another of the module's stances ends. Haft Striker Stance and
  Forest's Heart add their Strikes (Strike rules; the haft's runes by hand), Jester's Gambol its resistance against animals, beasts, fey,
  fungi and plants (by the damage's origin traits), Flair Rider Stance its lesser cover and Reflex while mounted.

### A bonus for one moment (2026-10-31)

- Duck and Weave, Stoic as Hell, Alien Brain, Focus Anger: the module's Effect to the start of your next turn or the end of this one, what
  it's only against a note (delete it after the triggering save). Defend Summoner: on the summoner, targeted.

### Rounds 21-23 (2026-10-31)

- Little Buddy passes from an NPC (Wolf +1 attack, +2 damage, off again); other NPC actions get nothing from this module.
- The four stances pass (the Haft and Roots and Vines Strikes, Jester's Gambol's resistance against the Wolf but not the Ogre, Flair Rider
  only while mounted). Switching stances took no stance (the old one counted as the toggle's own): fixed, the line says which ended.
- Duck and Weave, Stoic as Hell, Alien Brain, Focus Anger, Defend Summoner (from an eidolon, on its target) pass. PF2e's "saving-throw"
  selector also raises the Will DC shown; the bonus ends with the turn, so that's left.
- Then: Brains! (Recall Knowledge, 1 hour), Masked Casting (saves while Averting Gaze), Free the Bound (the ally's Escape, as Tip the
  Scales's selectors), Sharpened Senses (Seek).
- Round 24: all four pass (each only on its action's roll: Recall Knowledge, Escape, Seek).
- Then: Reclaim Power (your level per thrall, posted once per thrall), Fated Not to Die (ends dying; the Shields heal by hand).
- Round 25: Reclaim Power passes. Fated Not to Die took unconscious with dying (PF2e grants it from dying): unconscious again after, as My Legend Must Be Told.
- Round 26: Fated Not to Die passes (dying gone, unconscious kept, 0 HP).
- Then: Quicken Heartbeat (quickened through your next turn; slowed by hand), Raise Neck (reach 10 on the nagaji fangs, AdjustStrike).
- Round 27: Quicken Heartbeat passes. Raise Neck's "reach-10" was ignored (a character weapon trait is only "reach"): now "reach".
- Round 28: Raise Neck passes (reach 5 → 10). Forest's Heart's "reach-30" has no label of its own, but PF2e reads it: reach 30.

### Cole's answers (2026-10-31)

- D12: yes, Effect cards (an Effect with no roll card, Protect Ally's) are on automatically.
- One-moment bonuses lasting to the end of the turn, with a note to delete them after the triggering attack or save: good enough.
- NPC actions played only for an ally's Effect (Little Buddy): yes.
- What's left: not just reminders. Use the suite's other modules where they model the rule: the environment module's difficult
  terrain (PF2e's system.movement.terrain entries, read by its terrain costs) and weather first.

### Difficult terrain, through the environment module (2026-10-31)

- Rule batch 8: 17 passives and heritages that ignore difficult terrain get PF2e's own terrain entries (ActiveEffectLike on
  system.movement.terrain.difficult/greater.ignored, as Unimpeded Journey has), by environment (aquatic, swamp, forest) or feature
  (undergrowth, rubble, snow, ice, crowd). PF2e applies the "all" ones itself; the environment module's terrain costs apply the rest. Left by
  hand: ones that hang on a choice (Favored Terrain, One with the Land, Acclimated Mount) or a moment (Lotus Above the Wind, Convergent
  Tides), and water without a feature (Shore Step).

### Weather, temperature and falls, through the environment module (2026-10-31)

- src/plans/environment.js: the feat module's api answers the environment module's three asks as the item module does
  (temperatureProtections, weatherIgnores, fallEases), for Climate Adaptation, Legendary Survivalist, Badlands Orc (temperature), Cloud
  Gazer, Murksight, Murksight+, Storm Born (weather), Skyborn Tengu, Windweb Tripkee and Cat Fall by Acrobatics rank (falls). The
  environment module asks both (its branch claude/project-thread-7muc17, foundry.js fromSuite). Left: the ones on a choice (Environmental
  Adaptability, Favored Terrain) or for allies (Environmental Guide, Angel Eidolon's aura).
- Round 29: the entries land (Crushing Step only in medium or heavy armor) and snow, deep snow pass. Jungle Runner's forest/undergrowth matched nothing: the core's undergrowth names no environment. Now all/undergrowth (undergrowth is a forest's anyway).
- Round 30 (with the environment module branch bc55cf2): Jungle Runner, Climate Adaptation, Badlands Orc, Murksight (rain: concealment lifted, its sight penalty stays, as the core has precipitation), Cat Fall by rank, Skyborn Tengu: all pass.

### A master's feats on its companion (2026-10-31)

- src/rules/companion.js: the rules an evolution feat on the summoner's sheet gives the eidolon (Expanded Senses' senses, Vibration Sense's
  tremorsense or wavesense, Burrowing Form's burrow Speed, Ever-Vigilant Senses' +2 Perception, Faydhaan's saves against water). scripts/
  rules.js puts them on the companion's ancestry as it prepares, when findMaster finds the master with the feat; companions prepare again
  once the world is ready and when the master gains or loses an item.
- Round 31: Expanded Senses, Vibration Sense, Burrowing Form, Ever-Vigilant Senses on the eidolon from the summoner's sheet: all pass, at once and after a reload, gone with the feat; the summoner gets none. Then Chiardmar Steed (+5 status Speed on the horse; its first 10 feet of difficult terrain each turn by hand).

### Condition feats (2026-10-31)

- src/plans/condition-feats.js, scripts/conditions.js: Friend of Fear (a frightened gained is 1 lower, never below what it was) and Calm and
  Centered (a frightened or stupefied lowered goes 1 further), played by the active GM as PF2e changes the condition, with a GM line. The
  value before rides in the update's options, so a player's change counts too. And Fearsense's scent (rule batch 8).
- Round 32: Calm and Centered and Fearsense pass. Friend of Fear went 2 too low: the ability module's Bravery reading (scripts/bravery.js) already lowers a gained frightened for it, so it's dropped here (its whisper says "Bravery"). PF2e's end-of-turn frightened decrease didn't fire in the test world, so Calm and Centered there is untested.

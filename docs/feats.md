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
- **How it plays.** The spell module's `api.castFromItem` casts it through PF2e from a temporary innate entry with that DC, on the player's targets, and the spell module's own card resolves it (scripts/main.js, `castSpellLike`). A spell named in the text by name ("…spells-srd.Item.Web") is looked up in its pack. Without the spell module, nothing is cast.
- **Not read.** Passives (their "you can cast" changes another casting or is the spell module's granted spell), triggers and requirements ("You cast Spellsurge"), sentences starting "When", "If" or "While", spells "at will" for a while, a spell after a check (Unwind Death), two spells to choose from, and feats with PF2e's own Effect.
- 22 feats, among them Webslinger, True Senses, Rat Form, Bat Form, Animal Rage, Dire Growth, Quaking Stomp, Reactive Transformation and Glass Skin.

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

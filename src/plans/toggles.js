// Passives whose bonus holds only in a moment PF2e can't see, with no Effect of PF2e's for it (2026-10-30, Cole's choice "Toggle Effects
// from the chat card"; docs/rules.md, "Toggled Effects"). Each is the module's own Effect, its rules from the feat's text: posting the feat
// puts it on the character, posting it again takes it off. What the rules can't tell apart (which creature, which trap) is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const bonus = (selector, value, type = "circumstance", predicate, slug) => ({ key: "FlatModifier", selector, type, value, ...(predicate ? { predicate } : {}), ...(slug ? { slug } : {}) });
const ROUND = { value: 1, unit: "rounds", expiry: "turn-start", sustained: false };
const THIS_TURN = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    {
        uuid: pf2e("BqcAwmNjDlKEI84X"), name: "Shadow Master",
        toggle: { rules: [{ key: "Resistance", type: "all-damage", value: 5, exceptions: ["force", "ghost-touch"] }, { key: "RollTwice", selector: "reflex", keep: "higher" }] },
        notes: ["On while you're in dim light or darkness: post Shadow Master again when you leave it."]
    },
    {
        uuid: pf2e("6DkylvU5RF1O6DTT"), name: "Daredevil's Gambit",
        toggle: { rules: [bonus("ac", 2)], duration: ROUND },
        notes: ["While you share the target's space: it's off-guard to your attacks, and this ends early if it moves. A hit from any other creature pushes you out."]
    },
    {
        uuid: pf2e("MZgE2yonw4HUAyMk"), name: "The Harder They Fall (Hellknight)",
        toggle: { rules: [bonus("ac", 1), bonus("saving-throw", 1)], duration: ROUND },
        notes: ["Only against the Huge or larger creature you chose."]
    },
    {
        uuid: pf2e("9CIy4cJJTcRM30Vz"), name: "Tough Tumbler",
        toggle: { rules: [bonus("ac", 1)], duration: THIS_TURN },
        notes: ["Only against reactions you trigger by failing to Tumble Through."]
    },
    {
        uuid: pf2e("uYhaIKxlvGj4YNCc"), name: "Emboldened with Glorious Purpose",
        // (Two slugs: with one, the label's, the second replaced the first; 2026-10-30 Foundry test.)
        toggle: { rules: [bonus("will", 1, "status", [{ not: { or: ["item:trait:emotion", "item:trait:fear"] } }], "emboldened"), bonus("will", 2, "status", [{ or: ["item:trait:emotion", "item:trait:fear"] }], "emboldened-emotion")] },
        notes: ["Until your next daily preparations: post it again then. Your once-each rerolls (a Will save, an attack roll, the blessed skill's check) are yours to call."]
    },
    {
        uuid: pf2e("qUBr1YsQw3BSNy9c"), name: "Glyph Expert",
        toggle: { rules: [bonus("perception", 2), bonus("ac", 2), bonus("saving-throw", 2), bonus("thievery", 2)] },
        notes: ["Only to find magical traps, against their attacks and saves, and to Disable them: on while you deal with one. Against a trap of magical writing, a success on the save is a critical success and a critical failure a failure."]
    },
    {
        uuid: pf2e("HRVCODLOrhjRDtGb"), name: "Sure Foot",
        toggle: { rules: [bonus("acrobatics", 2), bonus("athletics", 2)] },
        notes: ["Only to move within your favored terrain (Balance, Climb, Swim, Fly …)."]
    },
    {
        uuid: pf2e("oSi9mUtYWYekxX0B"), name: "Able Ritualist",
        toggle: { rules: [bonus("skill-check", 2)] },
        notes: ["On for the primary and secondary checks of a ritual you're casting."]
    },
    {
        uuid: pf2e("yMj9WfPctWQC7be2"), name: "Thaumaturgic Ritualist",
        toggle: { rules: [bonus("skill-check", 2)] },
        notes: ["On for the primary checks of a ritual you're casting."]
    },
    {
        uuid: pf2e("JgM1DMPcceeHYhQ8"), name: "Harrow Ritualist",
        toggle: { rules: [bonus("skill-check", 2, "status")] },
        notes: ["On for the checks of a ritual you've worked harrow cards into."]
    },
    {
        uuid: pf2e("reoylyGMDPl7H6L5"), name: "Macabre Virtuoso",
        toggle: { rules: [bonus("skill-check", 2)] },
        notes: ["On for your primary check as primary caster of a create undead ritual."]
    },
    {
        uuid: pf2e("6VWLyjurMGi33XAT"), name: "Reading the Signs",
        toggle: { rules: [bonus("skill-check", 2, "status"), bonus("saving-throw", 2, "status", ["item:trait:divination"])] },
        notes: ["On for a skill check that draws cards or resolves a divination effect (a save against a hostile divination effect counts too)."]
    },
    {
        uuid: "Compendium.pf2e.classfeatures.Item.wYOdTCWQQ6ec8I6b", name: "Advanced Vials (Mutagenist)",
        toggle: { rules: [{ key: "Resistance", type: "physical", value: "floor(@actor.level/2)" }] },
        notes: ["On when you drink one of your field vials, for as long as its effect lasts."]
    },
    // (2026-10-30, the loop: resistance 5, +5 at 10th level and every 4 levels after.)
    {
        uuid: pf2e("stsCnc8hR6db1Get"), name: "Kinetic Dampening",
        toggle: { rules: [{ key: "Resistance", type: "physical", value: "5 * floor((@actor.level - 2) / 4)" }], duration: ROUND },
        notes: ["Awakening: for an extra action, the creatures you choose within 15 feet get it too (by hand); or also resistance to fire, electricity or sonic, your choice."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-barbarians.items.Item.Ha4JUcgOaQRLarvk", name: "Unravel Into Runes",
        toggle: { rules: [{ key: "Resistance", type: "all-damage", value: "@actor.level" }], duration: { value: 4, unit: "rounds", expiry: "turn-start", sustained: false } },
        notes: ["You're incorporeal and can't make attacks (by hand). In an ally's space you can give it your runes' effects and a +4 status bonus to damage rolls; leaving its space, or it falling unconscious, ends this."]
    },
    {
        uuid: pf2e("3aUlLF4V2KW7Hga5"), name: "Born in the Saddle",
        // (Only with PF2e's Effect: Mounted on, whose -2 it softens; 2026-10-30 Foundry test.)
        toggle: { rules: [bonus("reflex", 1, "circumstance", ["self:effect:mounted"], "born-in-the-saddle")] },
        notes: ["Your -2 circumstance penalty to Reflex saves while mounted (PF2e's Effect: Mounted) is only -1. If your mount is knocked prone, see the feat."]
    },
    {
        uuid: pf2e("8pmd9gMl3TamFx3u"), name: "Deft Cooperation",
        toggle: { rules: [bonus("attack", 1, "circumstance", undefined, "deft-cooperation-attack"), bonus("ac", 1, "circumstance", undefined, "deft-cooperation-ac")], duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false } },
        notes: ["After you successfully Aid an ally's attack roll or AC: only against that enemy, until the end of your next turn."]
    },
    // Actions whose bonus goes on an ally, with no PF2e Effect for it (2026-10-31, the loop): who "target", the module's Effect on each of the
    // player's targets, its numbers the character's. Posting it again with the same target takes it off.
    {
        uuid: pf2e("ASWqQ6RB7cfCsUo0"), name: "Protect Ally",
        toggle: { who: "target", rules: [bonus("ac", 1, "circumstance", undefined, "protect-ally")], duration: ROUND },
        notes: ["On one adjacent ally, until the start of your next turn; it ends early once the ally isn't adjacent to you. Only one ally at a time."]
    },
    {
        uuid: pf2e("q4wFELOV4BQO4cDd"), name: "Transfusion",
        toggle: { who: "target", rules: [{ key: "FastHealing", value: 1 }], duration: { value: 5, unit: "rounds", expiry: "turn-start", sustained: false } },
        notes: ["Spend 5 sanguimancy Hit Points (by hand). Each 5 more raises the fast healing by 1, to 8 at most: edit the Effect's value."]
    },
    {
        uuid: pf2e("Fe5m807oeqJw3YUd"), name: "Bloom of Health",
        toggle: { who: "target", rules: [{ key: "FastHealing", value: "floor(@actor.level / 2)" }], duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false } },
        notes: ["On your knights who hear you: target them first."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-adventures.pf2e-items.Item.FVp2POzJHwBGZVi4", name: "Little Buddy",
        toggle: { who: "target", rules: [bonus("attack", 1, "status", undefined, "little-buddy-attack"), bonus("damage", 2, "status", undefined, "little-buddy-damage")] },
        notes: ["For the rest of the encounter: delete the Effect when it ends. The ally is then immune to Little Buddy for 1 day."]
    },
    {
        uuid: pf2e("YKPaD42aJf2C5V3B"), name: "Snap Falling Fruit",
        toggle: { who: "target", rules: [bonus("ac", 2, "circumstance", undefined, "snap-falling-fruit")], duration: THIS_TURN },
        notes: ["Only against the triggering physical ranged attack (target yourself if it's you): delete the Effect after it. If it misses, you knock it out of the air."]
    },
    {
        uuid: pf2e("G3NBWaItq6oLEJxx"), name: "Redirecting Draft",
        toggle: { who: "target", rules: [bonus("ac", 2, "circumstance", undefined, "redirecting-draft")], duration: THIS_TURN },
        notes: ["Only against the triggering ranged physical Strike (target yourself if it's you): delete the Effect after it."]
    },
    // Stances with no rules of PF2e's for them (2026-10-31, the loop): the module's own Stance Effect, as a stance the reader finds is; posting
    // another stance from the module ends it, posting it again ends it too.
    {
        uuid: pf2e("pKNnFOuHBkJEvmS1"), name: "Haft Striker Stance",
        toggle: { stance: true, rules: [{ key: "Strike", slug: "haft-striker-haft", label: "Haft", category: "simple", group: "club", traits: ["agile", "finesse"], damage: { base: { damageType: "bludgeoning", dice: 1, die: "d4" } } }] },
        notes: ["While you wield a two-handed hammer, spear or polearm. The haft shares the weapon's fundamental runes, which this Strike doesn't show: add them by hand."]
    },
    {
        uuid: pf2e("2LjTxYTlRL7RwhOS"), name: "Forest's Heart",
        toggle: { stance: true, rules: [{ key: "Strike", slug: "forests-heart-roots", label: "Roots and Vines", category: "unarmed", group: "brawling", traits: ["finesse", "grapple", "reach-30"], damage: { base: { damageType: "bludgeoning", dice: 4, die: "d8" } } }] },
        notes: ["No extra dice from striking runes; your handwraps' item bonus to attack and property runes do apply."]
    },
    {
        uuid: pf2e("dzPwwXHW5NzYGG5h"), name: "Jester's Gambol",
        toggle: { stance: true, rules: [{ key: "Resistance", type: "all-damage", value: "floor(@actor.level / 2)", predicate: [{ or: ["origin:trait:animal", "origin:trait:beast", "origin:trait:fey", "origin:trait:fungus", "origin:trait:plant"] }], label: "Jester's Gambol" }] },
        notes: ["You ignore difficult terrain (by hand)."]
    },
    {
        uuid: pf2e("dyjYNaE6Nc6zpsUM"), name: "Flair Rider Stance",
        toggle: { stance: true, rules: [bonus("ac", 1, "circumstance", ["self:effect:mounted"], "flair-rider-cover-ac"), bonus("reflex", 3, "circumstance", ["self:effect:mounted"], "flair-rider-reflex")] },
        notes: ["While mounted (PF2e's Effect: Mounted): lesser cover from your mount (+1 AC and Reflex), and the +3 to Reflex also cancels Mounted's -2."]
    },
    // (Round 39: on the adjacent creature targeted, while the shield stays raised: to the start of your next turn, when Raise a Shield ends.)
    {
        uuid: "Compendium.pf2e.feats-srd.Item.YwVdaszwpDJd6kf9", name: "Devoted Guardian",
        toggle: { who: "target", rules: [bonus("ac", 1, "circumstance", undefined, "devoted-guardian")], duration: ROUND },
        notes: ["Only while your shield stays raised and the creature stays adjacent to you; +2 instead if the shield is a tower shield (raise it on the Effect by hand)."]
    },
    // A bonus for one moment, used as a reaction or an action (2026-10-31, the loop): the module's Effect, to the end of the turn or the start
    // of your next; what it's only against is a note.
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.EkvtLALpIufz8rx7", name: "Duck and Weave",
        toggle: { rules: [bonus("ac", 2, "circumstance", undefined, "duck-and-weave")], duration: ROUND },
        notes: ["Only against the one creature within 30 feet you chose. Until then you can't Strike or take hostile actions against any other creature."]
    },
    {
        uuid: pf2e("9Co9SUJmey3LrlLl"), name: "Stoic as Hell",
        toggle: { rules: [bonus("saving-throw", 2, "circumstance", undefined, "stoic-as-hell"), bonus("will-dc", 2, "circumstance", undefined, "stoic-as-hell-dc")], duration: THIS_TURN },
        notes: ["Only against the triggering emotion or controlled effect: delete the Effect after it. If you critically succeed (or it critically fails against your Will DC), you're also immune to the effect for 1 hour."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-adventures.pf2e-misc.Item.HHcEB8E1PidijRqC", name: "Alien Brain",
        toggle: { rules: [bonus("saving-throw", 2, "status", undefined, "alien-brain")], duration: THIS_TURN },
        notes: ["Only against the triggering mental effect: delete the Effect after it. It's +3 if you're frustrated 3 (edit the value). On a critical success against a creature's effect, it becomes stupefied (by hand)."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-adventures.pf2e-misc.Item.fOeKR7JM4UOK0ZOd", name: "Focus Anger",
        toggle: { rules: [bonus("saving-throw", 2, "circumstance", undefined, "focus-anger")], duration: THIS_TURN },
        notes: ["Only against the triggering mental save: delete the Effect after it. Then you enter your monster form."]
    },
    {
        uuid: pf2e("xlparPCGhkgjdhx2"), name: "Defend Summoner",
        toggle: { who: "target", rules: [bonus("ac", 2, "circumstance", undefined, "defend-summoner")], duration: ROUND },
        notes: ["Target your summoner. Only while you're within your eidolon's reach."]
    },
    {
        uuid: pf2e("Fpsd8Y8qJ3Tdbiyz"), name: "Brains!",
        toggle: { rules: [bonus("skill-check", 1, "status", ["action:recall-knowledge"], "brains")], duration: { value: 1, unit: "hours", expiry: "turn-start", sustained: false } },
        notes: ["+2 instead if the humanoid had a higher modifier to the skill you're using (edit the value)."]
    },
    {
        uuid: pf2e("4xeDjt8eARzAGARP"), name: "Masked Casting",
        toggle: { rules: [bonus("saving-throw", 2, "circumstance", undefined, "masked-casting")], duration: ROUND },
        notes: ["Avert Gaze too (its own action). The +2 is also to checks to disbelieve illusions, by hand; it lasts while you Avert your Gaze this way."]
    },
    {
        uuid: pf2e("9oU92ttNdXEKFOGh"), name: "Free the Bound",
        toggle: { who: "target", rules: [bonus(["athletics", "acrobatics", "unarmed-attack-roll"], 1, "circumstance", ["action:escape"], "free-the-bound")], duration: THIS_TURN },
        notes: ["Target the ally about to Escape. Unless it critically fails, it can Strike an enemy within reach as a reaction; both count toward its multiple attack penalty, which goes up only after both."]
    },
    {
        uuid: pf2e("jP0D4CIyloiBaEh4"), name: "Sharpened Senses",
        toggle: { rules: [bonus("perception", 2, "circumstance", ["action:seek"], "sharpened-senses")], duration: THIS_TURN },
        notes: ["Seek now; the +2 only if you use one of your senses from Natural Senses."]
    },
    {
        uuid: "Compendium.pf2e.actionspf2e.Item.MLOkyKi1Y3N6y56Q", name: "Raise Neck",
        toggle: { rules: [{ key: "AdjustStrike", mode: "add", property: "weapon-traits", value: "reach", definition: ["item:slug:fangs"] }], duration: THIS_TURN },
        notes: ["Your nagaji fangs Strike has reach 10 feet until the end of your turn (PF2e's reach trait: 10 feet for a Medium creature)."]
    },
    // (Round 53: a free action that grows an attack until you put it away.)
    {
        uuid: pf2e("V7n3kVSl0G6a29KG"), name: "Flailtongue",
        toggle: { rules: [{ key: "Strike", category: "unarmed", group: "flail", label: "Flailtongue", slug: "flailtongue", img: "systems/pf2e/icons/unarmed-attacks/jaws.webp", damage: { base: { damageType: "bludgeoning", dice: 1, die: "d6" } }, traits: ["unarmed", "disarm", "sweep", "trip"] }] },
        notes: ["While it's out you can't make a jaws Strike. Post Flailtongue again when you Interact to reset your jaw."]
    },
    // (Round 66: on the eidolon, posted with it targeted.)
    {
        uuid: pf2e("axGS5bBJ9vl5AePc"), name: "Phase Out",
        toggle: { who: "target", rules: [{ key: "Resistance", type: "all-damage", value: "max(1,floor(@actor.level/2))", exceptions: ["force", "spirit", "vitality"] }] },
        notes: ["Target your eidolon. It can't Strike or Grapple, Reposition, Shove or Trip while phased out; it Dismisses it to return: post Phase Out again."]
    },
    // (Round 68: Teams+ actions.)
    {
        uuid: "Compendium.pf2e-team-plus-tian-xia.player-options.Item.34APHg5Ezt0yYwJ6", name: "Spirit of the Rushing River",
        toggle: {
            rules: [
                { key: "Immunity", type: "immobilized" }, { key: "Immunity", type: "grabbed" }, { key: "Immunity", type: "restrained" },
                { key: "Resistance", type: "fire", value: "max(1,floor(@actor.level/2))" }, { key: "Resistance", type: "physical", value: "max(1,floor(@actor.level/2))" },
                { key: "Weakness", type: "area-damage", value: "max(1,floor(@actor.level/2))" }, { key: "Weakness", type: "splash-damage", value: "max(1,floor(@actor.level/2))" }
            ],
            duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false }
        },
        notes: ["You gain the swarm and water traits and the Torrential Flow action, and fit through gaps a few inches wide. You can't speak, cast spells, use hand manipulate actions, activate items or Strike with your body. Dismiss it: post it again."]
    },
    {
        uuid: pf2e("zytTsipimVTmPc5U"), name: "Selfless Parry",
        toggle: { who: "target", rules: [bonus("ac", 1)] },
        notes: ["Target your allies adjacent to you while you benefit from Dueling Parry; post it again when that ends or they move away. With Dueling Riposte, you can riposte an enemy in reach that critically fails a Strike against one of them."]
    },
    {
        uuid: pf2e("P6cTyDMTXcC8HBDr"), name: "Esoteric Warden",
        toggle: { rules: [bonus("ac", 1, "status"), bonus("saving-throw", 1, "status")] },
        notes: ["After you Exploit a Vulnerability successfully: only against that creature's next attack and your next save against it (+2 on a critical success). Once a day per creature; it ends if you Exploit Vulnerability again. Post it again to take it off."]
    },
    {
        uuid: pf2e("pp04AVdROQXSeaA8"), name: "Blazing Mutagen",
        toggle: { rules: [{ key: "DamageDice", selector: "strike-damage", diceNumber: 1, dieSize: "d4", damageType: "fire", category: "persistent", predicate: ["item:melee"] }] },
        notes: ["On while your mutagen lasts and your persistent fire burns: drinking it, take @Damage[2d4[persistent,fire]] damage that ignores fire resistance and immunity. Post it again when the persistent fire ends."]
    },
    // (Round 70: bonuses and penalties a passive gives others in a moment, on its targets.)
    {
        uuid: pf2e("n0693gmx3k9wvb1N"), name: "Demanding Challenge",
        toggle: { who: "target", rules: [bonus("attack-roll", -1)], duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false } },
        notes: ["Target the foe your challenge check succeeded against: –2 on a critical success (raise it by hand). Until the end of your next turn."]
    },
    {
        uuid: pf2e("eSoMkHGw38ld4gj2"), name: "Shared Warding",
        toggle: { who: "target", rules: [bonus("ac", 1, "status"), bonus("saving-throw", 1, "status")] },
        notes: ["Target your allies within 30 feet when Esoteric Warden wards you: only against that creature's next attack and their next save against it (+2 on your critical success). Post it again to take it off."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-alchemists.pf2e-misc.Item.E6QgnzfIIEHC6dJ6", name: "Greater Field Discovery (Gastronome)",
        toggle: { who: "target", rules: [bonus("attack-roll", 1, "status"), bonus("damage", 1, "status"), bonus("saving-throw", 1, "status", ["item:trait:mental"])] },
        notes: ["Target the creatures with temporary Hit Points from your alchemical food: post it again when those run out."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-magic.items.Item.zAPlXKTaxdmY6xFL", name: "Eyes of Shadow",
        toggle: { who: "target", rules: [{ key: "Sense", selector: "darkvision" }], duration: { value: 1, unit: "minutes", expiry: "turn-start", sustained: false } },
        notes: ["Dismiss your shadow weapon. Target one creature within 30 feet; it ends early when you draw the shadow weapon again (post it again). The creature is then immune for 10 minutes."]
    },
    {
        uuid: pf2e("C5CweUNPP7HlRfBM"), name: "Muscle Mimicry",
        toggle: { rules: [bonus("athletics", 1)], duration: { value: 1, unit: "rounds", expiry: "turn-end", sustained: false } },
        notes: ["Only on your next use of the same maneuver the enemy succeeded at (+2 if it critically succeeded; raise it by hand). Remove it after that check."]
    },
    // (Round 78: a fortune for the one check it's used on: PF2e's RollTwice, gone after that roll.)
    {
        uuid: "Compendium.pf2e.actionspf2e.Item.BrCbXsCUIFYfu26E", name: "Entreat Pact",
        toggle: { rules: [{ key: "RollTwice", selector: "skill-check", keep: "higher", removeAfterRoll: true }], duration: THIS_TURN },
        notes: ["Use it as you attempt a skill check directly related to the pact's conditions; that check rolls twice and keeps the better."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-tian-xia.misc.Item.EdnmU1XpzwAobsQU", name: "Bestow Favor",
        toggle: { rules: [{ key: "RollTwice", selector: "nature", keep: "higher", removeAfterRoll: true }], duration: THIS_TURN },
        notes: ["For the Nature check to Hide: it rolls twice and keeps the better."]
    },
    // (Round 82.)
    {
        uuid: "Compendium.pf2e.actionspf2e.Item.VqGjR43bBd36k0XI", name: "Liberate Self",
        toggle: { rules: [{ key: "RollTwice", selector: ["skill-check", "attack-roll"], keep: "higher", predicate: ["action:escape"], removeAfterRoll: true }], duration: THIS_TURN },
        notes: ["Now Escape. PF2e's Escape action ignores fortune effects (8.6): roll it twice and keep the higher by hand. The Effect ends with your turn."]
    },
    {
        uuid: pf2e("NZgjqVV2HYzLCvvA"), name: "Aldori Parry",
        toggle: { rules: [bonus("ac", 1)], duration: ROUND },
        notes: ["Wielding only an Aldori dueling sword. +2 instead if your other hand or hands are free: raise it by hand."]
    }
];

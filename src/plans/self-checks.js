// Checks against a DC of the character's level ("attempt a @Check[diplomacy|dc:@self.level|adjustment:-2] check", an easy DC), whose
// results are PF2e's Effects linked in the text (2026-10-30, the loop; docs/feats.md, "Checks against your level's DC"). The marshal
// stances' check enters the stance; Helpful Tinkering's gives its ally the Effect. The card rolls the check and applies each degree's.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const effect = (name) => ({ uuid: `Compendium.pf2e.feat-effects.Item.${name}`, label: name });
const both = (row) => ({ criticalSuccess: row, success: row });

export default [
    {
        uuid: pf2e("bvOsJNeI0ewvQsFa"), name: "Inspiring Marshal Stance",
        selfCheck: { statistic: "diplomacy", adjustment: -2, outcomes: both({ nativeEffects: [effect("Stance: Inspiring Marshal Stance")] }) },
        notes: ["On a critical failure you can't take this action again for 1 minute. The GM can set a different DC."]
    },
    {
        uuid: pf2e("R7c4PyTNkZb0yvoT"), name: "Dread Marshal Stance",
        selfCheck: { statistic: "intimidation", adjustment: -2, outcomes: both({ nativeEffects: [effect("Stance: Dread Marshal Stance")] }) },
        notes: ["On a critical failure you can't take this action again for 1 minute. The GM can set a different DC."]
    },
    {
        uuid: pf2e("OqqytsF2RIjB0EPR"), name: "Devrin's Cunning Stance",
        selfCheck: { statistic: "deception", outcomes: both({ nativeEffects: [effect("Stance: Devrin's Cunning Stance")] }) },
        notes: ["On a critical success your marshal's aura is 20 feet. On a critical failure you can't take this action again for 1 minute."]
    },
    {
        uuid: pf2e("fJwsZM6WXwP8EStV"), name: "Strategist Stance",
        selfCheck: { statistic: "society", outcomes: both({ nativeEffects: [effect("Stance: Strategist Stance")] }) },
        notes: ["You can roll Warfare Lore instead. On a critical success your marshal's aura is 20 feet."]
    },
    {
        uuid: pf2e("qUSWPWxYF8gfhfHM"), name: "Helpful Tinkering",
        selfCheck: { statistic: "crafting", adjustment: 2, target: "1 ally", outcomes: both({ nativeEffects: [effect("Effect: Helpful Tinkering")] }) },
        notes: ["Target the ally in your reach. On Apply, PF2e asks which of the ally's weapons gets the boost: the card finishes once it's picked. On a critical failure your ally takes your offensive boost's damage: roll it by hand."]
    },
    // Against a DC of the target's level (the ally's), each target's own on the card.
    {
        uuid: pf2e("LmsjuqB3rrZTqqa6"), name: "Guiding Words",
        selfCheck: { statistic: "diplomacy", level: "target", adjustment: 2, target: "1 ally", range: "30 feet", outcomes: both({ nativeEffects: [effect("Effect: Guiding Words")] }) },
        notes: ["Whatever the result, the ally is immune to Guiding Words for 10 minutes."]
    },
    {
        uuid: pf2e("2zxF682cNhgLMu26"), name: "Invincible Army",
        selfCheck: { statistic: "diplomacy", level: "target", adjustment: 2, target: "1 ally", outcomes: both({ nativeEffects: [effect("Effect: Invincible Army")] }) },
        notes: ["You can roll Deception instead. On Apply, PF2e's Effect asks which DC you chose (hard, or very hard for two types from a wider list) and the damage type. A very hard DC is 3 more than the card's."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.u1Yj7NCED4myTRDu", name: "Quick Cuisine",
        selfCheck: { statistic: "cooking-lore", level: "target", target: "1 ally", outcomes: both({ nativeEffects: [{ uuid: "Compendium.pf2e-team-plus-feats.pf2e-misc.Item.F7MX2YhI0mMy3aGG", label: "Effect: Quick Cuisine" }] }) },
        notes: ["Takes 10 minutes. With two or four allies, the DC is the highest level's. On a critical success the ally also gets temporary Hit Points equal to half your level plus your Intelligence modifier."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-barbarians.items.Item.f7DtQ9kQ02gAuqyr", name: "Call of the Ancestor",
        selfCheck: { statistic: "perception", outcomes: both({ nativeEffects: [{ uuid: "Compendium.pf2e-team-plus-barbarians.misc.Item.NQvBAbJB8uUlmntt", label: "Effect: Call of the Ancestor" }] }) },
        notes: ["+1 on a success, +2 on a critical success: your next attack roll with your vestige weapon this turn."]
        },
    // (2026-10-30, the loop: checks against your level's DC whose results are said in words: the card rolls it, the notes say what each
    // degree does.)
    {
        uuid: pf2e("KU6nyh8DyQ7NoRQj"), name: "Ostentatious Reload",
        selfCheck: { statistic: "performance", adjustment: -2 },
        notes: ["Critical success: Interact to reload up to two firearms you're wielding. Success: reload one. Failure: drop one firearm and a round in your space. Critical failure: drop both and two rounds."]
    },
    {
        uuid: pf2e("H6SL2F11nlMfqCQC"), name: "Improvise Admixture",
        selfCheck: { statistic: "crafting" },
        notes: ["You regain 3 versatile vials on a critical success, 2 on a success, 1 on a failure, none on a critical failure (up to your maximum, by hand). The GM can set a different DC."]
    },
    {
        uuid: pf2e("c2hPWQ4zdc4CnrnZ"), name: "Seasoned Command",
        selfCheck: { statistic: "diplomacy", level: "target", adjustment: 2, target: "1 ally", range: "30 feet" },
        notes: ["Diplomacy or Intimidation. It counts as preparing to Aid the ally. On a success you gain an extra reaction, only to Aid that ally (with a +1 circumstance bonus on a critical success). The ally is then immune for 1 minute."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-adventures.pf2e-items.Item.LN2Qg1siq5AGhzuL", name: "Fourth Wall Break",
        selfCheck: { statistic: "deception", adjustment: 2 },
        notes: ["Make a statement about your situation to the GM. On a success the GM usually grants a +2 status bonus to your next check related to it (+4 on a critical success), or more at their discretion."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-barbarians.misc.Item.nzWQSM585O3arVtW", name: "Furious Stride",
        selfCheck: { statistic: "fortitude", adjustment: 5 },
        notes: ["Your next Stride gains the rage trait. Critical success: +10 feet to its Speed; success: +5 feet. Failure: after it, a -5-foot status penalty to Speed for 1 round (-10 feet on a critical failure)."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.BU4kBFIaEFmDQiad", name: "Primal Intonation",
        selfCheck: { statistic: "nature" },
        notes: ["With no animals around you fail. Critical success: an animal at least 6 levels lower than you comes, helpful; success: friendly. Critical failure: a hostile animal appears."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.OtbrIcEF7da4lDFK", name: "Transpose Self",
        selfCheck: { statistic: "arcana" },
        notes: ["With obstacles, creatures or difficult terrain in the way the DC is very hard (+5, by hand). Success: teleport up to 15 feet within line of sight; not again for 1 hour. Critical failure: you take force damage equal to your level; not again for 1 day."]
    },
    // (2026-10-31, round 50: more checks against your level's DC. Circadian Disciplinarian heals you on the card; the rest say each degree.)
    {
        uuid: pf2e("lFNyIFWPPXpS0qRM"), name: "On My Best Day",
        selfCheck: { statistic: "incarnation-lore", adjustment: 5 },
        notes: ["Until the end of your next turn: critical success +3 status bonus to AC and resistance to physical damage equal to your level (Sustain up to 1 minute); success +2 and half your level; failure +1 to AC; critical failure +1 to AC against the next attack only."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-adventures.pf2e-misc.Item.TguWAmyYB94Uts5S", name: "Scout Battlefield",
        selfCheck: { statistic: "perception" },
        notes: ["Increase your frustrated condition by 1. On a success you find a piece of the battlefield within 25 feet your monster can use; Reap Battlefield can then reduce frustrated by 1."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.Mkd7Qhph9eP9g1tz", name: "Peace with Death",
        selfCheck: { statistic: "religion", outcomes: both({ nativeEffects: [{ uuid: "Compendium.pf2e-team-plus-feats.pf2e-misc.Item.3DrxNxi9Xdd513ji", label: "Effect: Peace with Death" }] }) },
        notes: ["Takes 10 minutes; you're then immune to it for 1 hour. The first time you're dying within the hour, your recovery check DCs drop by 5, and healing while dying adds your level (half on a success)."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.OILWJgTq4PlQgwLZ", name: "Circadian Disciplinarian",
        selfCheck: { statistic: "survival", outcomes: {
            criticalSuccess: { effects: [{ kind: "heal", formula: "max(1,@actor.abilities.con.mod)*@actor.level", recipient: "self" }, { kind: "end-condition", slugs: ["fatigued"] }] },
            success: { effects: [{ kind: "heal", formula: "floor(max(1,@actor.abilities.con.mod)*@actor.level/2)", recipient: "self" }, { kind: "end-condition", slugs: ["fatigued"] }] } } },
        notes: ["Takes 1 hour (10 minutes if you're a master in Survival). More than a day without a full night's rest: you fail. On a success, also reduce drained by 1 by hand."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-tian-xia.player-options.Item.HOEhWXCvEtLdxOuw", name: "Vocal Mediation",
        // (One roll, yours: the card heals you; a card with targets rolls for each of them instead, round 52 Foundry test.)
        selfCheck: { statistic: "performance", outcomes: {
            criticalSuccess: { effects: [{ kind: "heal", formula: "2*@actor.level", recipient: "self" }, { kind: "end-condition", slugs: ["fatigued"] }] },
            success: { effects: [{ kind: "heal", formula: "@actor.level", recipient: "self" }, { kind: "end-condition", slugs: ["fatigued"] }] } } },
        notes: ["Takes 10 minutes. The card heals you; your allies within 30 feet regain the same (twice your level on a critical success, your level on a success) and lose fatigued: by hand. Also reduce doomed and drained by 2 on a critical success, 1 on a success, by hand."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.M8Z13CBNlNt1YZpC", name: "Astrological Divination",
        selfCheck: { statistic: "occultism" },
        notes: ["Takes 1 hour, once per day. +2 circumstance bonus with a clear night sky. Success: augury's effects for an event up to 12 hours ahead (1 day on a critical success)."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.yF3ZY56V6rEZdF5Y", name: "Planar Pedagogy",
        selfCheck: { statistic: "arcana" },
        notes: ["Takes 1d4 hours. On a success you're trained in one plane's Lore for 1 day (expert if you're a master in Arcana, master if legendary)."]
    },
    // (Round 52 Foundry test: a Lore, and Perception against Deception, against each target's DC.)
    {
        uuid: pf2e("XbMfMJq2sCQHdo1w"), name: "Improvise Strategy",
        selfCheck: { statistic: "warfare-lore", defense: "perception", target: "1 creature", range: "30 feet" },
        notes: ["Success: the target gains your choice of clumsy 1, dazzled, off-guard or stupefied 1 until the end of your next turn (put it on by hand); it can end it with a concentrate action (auditory) or an Interact (visual). Except on a critical success it's immune for 1 hour. Critical failure: you're off-guard until the start of your next turn."]
    },
    {
        uuid: pf2e("cErltcAC7OVnIyO1"), name: "Predictable!",
        selfCheck: { statistic: "perception", defense: "deception", target: "1 enemy" },
        notes: ["Use a hard DC of the foe's level instead if that's higher. Put PF2e's Effect: Predictable! on yourself from the feat: +2 to AC against it and your next save against it on a critical success, +1 on a success, –1 on a critical failure, until the start of your next turn."]
    },
    // (Round 84: against the hard DC of the creature's level; the result is the ally's, so PF2e's Effect goes on by hand.)
    {
        uuid: pf2e("gCUJYnWPQ9VM8eXk"), name: "Commitment to Protection",
        selfCheck: { statistic: "warfare-lore", level: "target", adjustment: 2, target: "1 creature or hazard you can see" },
        notes: ["Target the creature or hazard, not the ally. Then put @UUID[Compendium.pf2e.feat-effects.Item.eu7DEgjicyYyosCl]{Effect: Commitment to Protection} on an ally within 30 feet and pick the degree: +2 AC on a critical success, +1 on a success, −1 on a critical failure, against that creature's next attack. Legendary in Warfare Lore: a failure or critical failure is a success."]
    },
    // (Round 85: the hard DC and the standard DC of the target's level.)
    {
        uuid: pf2e("YeQn7mJoFO7PR6uO"), name: "Soul Thief",
        selfCheck: { statistic: "occultism", level: "target", adjustment: 2, target: "1 creature of at least 18th level that died within the last minute" },
        notes: ["Once per day. On a success you capture its soul in a gem (three gems at most). Swallowing a gem later: @UUID[Compendium.pf2e.feat-effects.Item.evFqVITRiK6AZd6d]{Effect: Soul Thief}."]
    },
    {
        uuid: pf2e("iLFGrBeG2yas8cxm"), name: "By Your Name",
        selfCheck: { statistic: "crafting", level: "target", adjustment: 0, target: "1 creature whose name you know" },
        notes: ["Once per hour; not against the same target again for 24 hours.", "Success: for 1 minute you can Trace their name as a diacritic rune; when the base rune is invoked on them, they take a −2 circumstance penalty to saves against it. Critical success: also a status bonus to its damage equal to half your level."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.kcMcqQOa32dVJqvi", name: "Venomous Visionary",
        selfCheck: { statistic: "survival", defense: "deception", target: "1 creature you can perceive", range: "30 feet" },
        notes: ["Against the target's Stealth DC instead if it is higher, or the poison's DC for an object: by hand. On a success you learn as detect poison whether it is poisonous or venomous (a 2nd-rank @UUID[Compendium.pf2e.spells-srd.Item.QqxwHeYEVylkYjsO] if you're legendary in Survival). Not on the same target again for 1 day."]
    },
    // (Round 89: fixed DCs the feat names.)
    {
        uuid: pf2e("lleedxE6fTDSK6og"), name: "Resuscitate",
        selfCheck: { statistic: "medicine", dc: 40, target: "1 creature dead no more than 3 rounds" },
        notes: ["On a success it returns to life with the effects of @UUID[Compendium.pf2e.spells-srd.Item.IkGYwHRLhkuoGReG]{Raise Dead}, keeping its wounded condition increased by 1 (wounded 1 if it had none): by hand. Either way it is immune to Resuscitate for 1 day."]
    },
    {
        uuid: pf2e("ZO37MZEQVNNtg46b"), name: "Desperate Resuscitation",
        selfCheck: { statistic: "medicine", dc: 40, target: "1 creature dead no more than 3 rounds" },
        notes: ["On a success it returns to life with the effects of @UUID[Compendium.pf2e.spells-srd.Item.IkGYwHRLhkuoGReG]{Raise Dead}, keeping its wounded condition increased by 1 (wounded 1 if it had none): by hand. Either way it is immune to Desperate Resuscitation for 1 day."]
    },
    {
        uuid: pf2e("xYNMWGEmpbtrtWXQ"), name: "Unwind Death",
        selfCheck: { statistic: "crafting", dc: 40, target: "1 creature dead no more than 3 rounds" },
        notes: ["On a success it returns to life with the effects of @UUID[Compendium.pf2e.spells-srd.Item.IkGYwHRLhkuoGReG]{Raise Dead}, keeping its wounded condition increased by 1 (wounded 1 if it had none): by hand. Either way it is immune to Unwind Death for 1 day."]
    },
    {
        uuid: pf2e("LyqXT4XYYlgf8KYK"), name: "Propelled Leap",
        selfCheck: { statistic: "athletics", dc: 30, outcomes: { criticalFailure: { effects: [{ kind: "condition", slug: "off-guard", value: null, duration: { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-start", anchor: "effect-start" } }] } } },
        notes: ["Swim toward the surface at up to twice your swim Speed first (less than 10 feet: an automatic failure). You Leap 15 feet up on a critical success, 10 on a success, 5 on a failure, and 5 feet across. Near something to hold with a free hand: Grab an Edge; otherwise you fall back into the water unharmed."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.aVhhPuhF87ACfFFd", name: "Assess Terrain",
        selfCheck: { statistic: "survival", dc: 15 },
        notes: ["Choose a 5-foot burst of natural difficult terrain within 30 feet. DC 15 for a 5-foot burst; an expert can take DC 20 for a 10-foot burst, a master DC 30 for a 20-foot burst (judge those against the roll by hand; legendary: 10 higher to include cold, earth, plant, water or wood terrain).", "Critical success: the difficult terrain is normal for you for up to 1 minute, and greater difficult terrain is difficult until the end of your next turn. Success: normal until the end of your next turn. Critical failure: the whole area is difficult (or greater difficult) terrain for you until the end of your next turn."]
    },
    {
        uuid: pf2e("epzeES7xJxvIXDdj"), name: "Dance of Intercession",
        selfCheck: { statistic: "performance", dc: 35 },
        notes: ["You Stride up to half your Speed as you dance. The second use in a day is one degree worse, the third two degrees worse: adjust by hand.", "Critical success: cast the 3-action @UUID[Compendium.pf2e.spells-srd.Item.rfZpqmj0AIIdkVIs]{Heal} or @UUID[Compendium.pf2e.spells-srd.Item.wdA52JJnsuQWeyqz]{Harm} at rank 9 during the Stride, with no spell slot; success: rank 7; failure: rank 5. Critical failure: nothing more, and no more dances until your next daily preparations."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-feats.pf2e-player-options.Item.YWRrxFEnT8n6Ykf1", name: "Beseech Fate",
        selfCheck: { statistic: "diplomacy", level: "target", adjustment: 2, target: "you or 1 creature", range: "30 feet" },
        notes: ["Once per day. Against the hard DC of the target's level, or the DC of the effect that caused the condition if that is higher: the GM's call.", "On a success, suppress its clumsy, enfeebled, frightened, sickened or stupefied condition by hand. A condition that lasts longer than 1 minute comes back after 1 minute, and the suppressed time counts toward its duration."]
    }
];

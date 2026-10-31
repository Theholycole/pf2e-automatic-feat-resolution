// Heals and temporary Hit Points with no roll to hit or save, read past a choice or a trigger (2026-10-30, the loop): the heal on the card,
// the rest a note. Affect entries: the card applies them to its target, or finds the creatures in the area itself.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const wounded = { kind: "condition", slug: "wounded", value: 1, duration: null, stack: { by: 1 } };

export default [
    {
        uuid: pf2e("eXv8ZWcASOgs8jLZ"), name: "Rekindled Light",
        affect: { target: "1 ally", effects: [{ kind: "heal", formula: "@actor.level" }, wounded] },
        notes: ["The target (you, or an ally within 30 feet of your star orb familiar) isn't knocked out: it stays at 1 Hit Point before the healing. Your familiar is dormant until your next daily preparations."]
    },
    {
        uuid: action("XkrN7gxdRXTYYBkX"), name: "Restore the Mind",
        affect: { target: "1 ally", range: "30 feet", effects: [{ kind: "heal", formula: "2+2*@actor.level" }] },
        notes: ["Or instead of the healing, a +1 status bonus to saves against mental effects until your psyche ends (by hand). The ally is immune for 10 minutes."]
    },
    {
        uuid: action("DGmzeAr4IfCnKN0R"), name: "Valkyrie's Charge",
        affect: { target: "each ally within 30 feet", effects: [{ kind: "heal", formula: "80" }] },
        notes: ["The squadmates in your banner's aura. One unconscious at 0 can Stand and pick up its weapons; each can then Stride up to twice its Speed toward an enemy and Strike it as a reaction."]
    },
    // (PF2e's own Effect for the sip, its temporary Hit Points to the end of your next turn: the 1-round card left them a turn short;
    // 2026-10-30 Foundry test.)
    {
        uuid: action("D91jQs0wleU5ml4K"), name: "Drink from the Chalice",
        linked: { effect: "Compendium.pf2e.feat-effects.Item.gjxSQgN3MopLxM35", label: "Effect: Drink from the Chalice", recipients: "target", target: "1 ally" },
        notes: ["A sip, for you or an adjacent ally (target yourself for you). To drain it instead: 3 Hit Points per level healed, by hand (once until it refills)."]
    },
    {
        uuid: pf2e("ONUvHtEccDmNEcVu"), name: "Spirit's Sacrifice",
        affect: { target: "you", effects: [{ kind: "heal", formula: "2*@actor.level" }] },
        notes: ["You don't die, and your wounded value drops to 1 if it's higher (by hand). The apparition is dispersed until your next daily preparations."]
    },
    {
        uuid: pf2e("2q8vzxnlYYWcUGJd"), name: "You Can't Keep Us Down",
        affect: { target: "each ally within 60 feet", effects: [{ kind: "heal", formula: "3*@actor.level" }] },
        notes: ["Only the allies who are dying, or unconscious and wounded, are healed: target those and press Use my targets. Then each prone ally within 60 feet can Stand as a free action that doesn't trigger reactions."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-adventures.pf2e-items.Item.ru7VGIoAlUM4kE7E", name: "Patch Up",
        affect: { target: "1 ally", range: "5 feet", effects: [{ kind: "heal", formula: "(max(1,floor(@actor.level/2)))d8" }] },
        notes: ["The ally is then immune to this underling's Patch Up for 10 minutes (Effect: Patch Up Immunity, by hand)."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-barbarians.items.Item.cl8TzbIe9JTyRFPH", name: "Revitalizing Blood",
        linked: { effect: "Compendium.pf2e-team-plus-barbarians.misc.Item.saANGEZnZQX0FTn4", label: "Effect: Revitalizing Blood", recipients: "target", target: "1 ally", within: 30 },
        notes: ["You take persistent bleed damage equal to half your level (by hand). Each time it hurts you, the ally gets that many temporary Hit Points until the start of your next turn."]
    },
    {
        uuid: action("jjxxWxnlEqWjTUur"), name: "Restorative Teleportation",
        affect: { target: "you", effects: [{ kind: "heal", formula: "1d6 + @actor.level + @actor.abilities.int.mod" }] },
        notes: ["When you arrive by teleportation; once per minute."]
    },
    {
        uuid: pf2e("24giyNqSjqrEnhN9"), name: "Call From Death's Door",
        affect: { target: "1 ally", effects: [{ kind: "end-condition", slug: "dying" }, { kind: "heal", formula: "2*@actor.level" }] },
        notes: ["Spend a Mythic Point. The ally's wounded value doesn't go up for this."]
    },
    {
        uuid: pf2e("IkqhUNVXUmi8ePEJ"), name: "Reclaim Power",
        affect: { target: "you", effects: [{ kind: "heal", formula: "@actor.level" }] },
        notes: ["This is one thrall's healing: post Reclaim Power again for each more thrall you destroy (up to three). With all three, also lower one of your clumsy, enfeebled, frightened, sickened or stupefied values by 1."]
    },
    {
        uuid: action("gU93T2UqxLsX9gyF"), name: "Fated Not to Die",
        // (Unconscious again after dying ends, as My Legend Must Be Told: PF2e's dying takes its unconscious with it; 2026-10-31 Foundry test.)
        affect: { target: "you", effects: [{ kind: "end-condition", slug: "dying", stabilize: true }, { kind: "condition", slug: "unconscious", value: null, duration: null }] },
        notes: ["You stay unconscious at 0 Hit Points. If the harrow card you draw is from the suit of Shields, you wake and regain 1d6 + your level Hit Points (by hand)."]
    },
    {
        uuid: pf2e("i8MnyasCDo3j65Xd"), name: "Quicken Heartbeat",
        affect: { target: "you", effects: [{ slug: "quickened", duration: { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-end", anchor: "effect-start" } }] },
        notes: ["Quickened during your next turn, the extra action only to Stride or Strike. If you're slowed, reduce slowed by 1 instead (don't apply this)."]
    },
    // (Round 57.)
    {
        uuid: pf2e("gBSPbQRXdagZTUwY"), name: "Kip Up",
        affect: { target: "you", effects: [{ kind: "end-condition", slugs: ["prone"], recipient: "self" }] },
        notes: ["Standing this way doesn't trigger reactions."]
    },
    // (Round 58: a lowered condition, as the ability compiler writes "reduces its slowed condition by 1".)
    {
        uuid: pf2e("OY1Ewg0dbCp52Hl5"), name: "Inner Strength",
        affect: { target: "you", effects: [{ kind: "condition", slug: "enfeebled", value: 0, duration: null, stack: { by: -1 } }] },
        notes: ["Only while you're raging."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-adventures.pf2e-misc.Item.E9CLWaNP0QjvV8fe", name: "Fever Shiver",
        affect: { target: "you", effects: [{ kind: "condition", slug: "sickened", value: 0, duration: null, stack: { by: -1 } }] },
        notes: ["Then raise your frustrated condition by 1. Or instead, attempt a new save against an affliction (and see the feat for what that costs): remove the card's change then."]
    },
    // (Round 65: the sweep.)
    {
        uuid: pf2e("CjafX7d1XktxeyTa"), name: "Deific Font",
        affect: { target: "you", effects: [{ kind: "condition", slug: "drained", value: 1, duration: null, stack: { by: 1 } }] },
        notes: ["Before the end of your next turn, a spell of 4th rank or lower you cast spends no slot, or a focus spell no Focus Point; it loses its tradition trait and gains divine."]
    },
    {
        uuid: pf2e("XyQpqznuO5LGFvhz"), name: "Coordinated Distraction",
        affect: { target: "1 enemy within 30 feet", effects: [{ slug: "off-guard", duration: { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-end", anchor: "effect-start" } }] },
        notes: ["Only against the first Strike your chosen ally (within 30 feet) makes on their next turn: remove it after that Strike, or if they don't Strike the target. Auditory or visual, as you describe it."]
    },
    {
        uuid: pf2e("9SdFlVQW4vM8ggh8"), name: "Fane's Escape",
        affect: { target: "you", effects: [{ slug: "hidden", duration: { mode: "fixed", value: 0, unit: "rounds", expiry: "turn-end", anchor: "source-turn" } }] },
        notes: ["Hidden only to creatures that see you; then Sneak, with cover enough until the end of your turn. Gathering the cards again takes several minutes."]
    },
    // (Round 66.)
    {
        uuid: pf2e("vzKvihYNModB7sJ7"), name: "Play Dead",
        affect: { target: "you", effects: [{ slug: "prone", duration: null }] },
        notes: ["While you don't move or act beyond your mind, you seem a plain skeleton: seeing through it takes a Seek or Recall Knowledge against your Deception DC. No use against those who know you're undead."]
    },
    {
        uuid: pf2e("OJLGFnmbT418dC18"), name: "Stand Firm",
        affect: { target: "1 ally within 30 feet", effects: [{ kind: "condition", slug: "frightened", value: 0, duration: null, stack: { by: -2 } }] },
        notes: ["If they're fleeing, they can retry the save at once: on a failure (not a critical failure) they spend one fewer action fleeing. Immune to it until your next turn starts."]
    },
    {
        uuid: pf2e("AYVf9MU8oo1QWbGv"), name: "Wave the Flag",
        affect: { target: "each ally within 30 feet", effects: [{ kind: "condition", slug: "frightened", value: 0, duration: null, stack: { by: -1 } }] },
        notes: ["Only allies benefiting from your Cavalier's Banner. Each can retry a save against one mental effect now, and is then immune to Wave the Flag for 10 minutes."]
    },
    // (Round 67: reactions.)
    {
        uuid: "Compendium.pf2e-team-plus-barbarians.items.Item.uT8LUuReXwe2MuJs", name: "Embrace the Eldritch",
        affect: { target: "you", effects: [{ kind: "condition", slug: "frightened", value: 2, duration: null }] },
        notes: ["Only if you weren't frightened. Your degree of success on the triggering save is one step better, and it counts as willingly accepting the spell for your instinct."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-magic.items.Item.1BDYt6q2NfX7xwdL", name: "Accelerated Dynamism",
        affect: { target: "you", effects: [{ slug: "quickened", duration: { mode: "fixed", value: 0, unit: "rounds", expiry: "turn-end", anchor: "source-turn" } }] },
        notes: ["Only for the actions to cast the three-action version of a spell you have dynamic mastery with (or for Triplicate Casting or Variable Preparation, with those feats)."]
    },
    {
        uuid: "Compendium.pf2e.feats-srd.Item.lT6yLoMfalzxGL8y", name: "Retributive Focus",
        regain: { resource: "focus", value: 1 },
        notes: ["Only when an enemy triggers your champion's reaction and your focus pool is empty."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-tian-xia.player-options.Item.GdqIBsraQK2FIofQ", name: "Fog of the Imperial",
        affect: { target: "you and each ally within 5 feet", effects: [{ slug: "concealed", duration: null }] },
        notes: ["Every creature in the fog is concealed, enemies too, and those outside are concealed to those in it. It lasts while you channel your dragon (remove it then); each Sustain can widen it by 5 feet."]
    },
    {
        uuid: "Compendium.pf2e.feats-srd.Item.QuRhGFEhvF7z0Pz9", name: "Immortal Techniques",
        affect: { target: "you", effects: [{ kind: "temp-hp", formula: "20", duration: { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-start", anchor: "effect-start" } }] },
        notes: ["Post it the first time each round you use an action with both the monk and stance traits."]
    },
    {
        uuid: "Compendium.pf2e-team-plus-tian-xia.player-options.Item.gYrJJcG5PDe5aMep", name: "Dominance of Nature",
        affect: { target: "1 animal, beast, elemental or plant within 30 feet", effects: [{ kind: "condition", slug: "slowed", value: 1, duration: { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-start", anchor: "effect-start" } }] },
        notes: ["If its level is at most yours − 3, it's controlled by you for 1 round instead (swap the condition by hand). Sustain it up to 1 minute. At the end of each of its turns it attempts a @Check[will|against:class-spell] save to end it. Immune for 1 day after."]
    },
    {
        uuid: "Compendium.pf2e.actionspf2e.Item.lgpJoFrkzfkjAzeV", name: "Inscribe Shadow Pamor",
        affect: { target: "the creature your next Strike hits", effects: [{ slug: "dazzled", duration: { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-start", anchor: "effect-start" } }] },
        notes: ["Post it after your next action, a Strike, hits: apply then. It can Interact to tear away the shadows (remove it), unless your Strike was a critical hit."]
    },
    // (Round 75: triggered combat feats.)
    {
        uuid: pf2e("xdv75qkv5TOFlHmM"), name: "Keep up the Good Fight",
        affect: { target: "you", effects: [{ kind: "temp-hp", formula: "@actor.level", duration: { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-start", anchor: "effect-start" } }, wounded] },
        notes: ["When a foe's Strike drops you to 0 Hit Points (from more than 1, and it wouldn't kill you): you're at 1 Hit Point instead of knocked out; set it by hand."]
    },
    {
        uuid: pf2e("LT5rw7JfemZSXUKB"), name: "Tenacious Endurance",
        affect: { target: "your animal companion", effects: [{ kind: "condition", slug: "wounded", value: 1, duration: null }] },
        notes: ["Target your companion when it drops to 0 Hit Points and isn't wounded: it stays standing at 1 Hit Point (set it by hand)."]
    },
    {
        uuid: pf2e("it5yM6sbwJJysm9U"), name: "Quick Root",
        affect: { target: "you", effects: [{ kind: "end-condition", slugs: ["prone"], recipient: "self" }] },
        notes: ["A force that moves you moves you half as far (at least 5 feet). Knocked prone: let it resolve, then post this to Stand."]
    },
    {
        uuid: pf2e("E7PFg8xua1nGIqHQ"), name: "Competitive Eater",
        affect: { target: "you", effects: [{ kind: "temp-hp", formula: "10 + @actor.level", duration: null }] },
        notes: ["When you become fully satiated."]
    }
];

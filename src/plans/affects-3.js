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
    }
];

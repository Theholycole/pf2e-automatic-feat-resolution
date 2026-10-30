// Heals and temporary Hit Points with no roll to hit or save, read past a choice or a trigger (2026-10-30, the loop): the heal on the card,
// the rest a note. Affect entries: the card applies them to its target, or finds the creatures in the area itself.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
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
    {
        uuid: action("D91jQs0wleU5ml4K"), name: "Drink from the Chalice",
        affect: { target: "1 ally", effects: [{ kind: "temp-hp", formula: "max(3,@actor.level)", duration: rounds(1, "turn-end") }] },
        notes: ["A sip, for you or an adjacent ally. To drain it instead: 3 Hit Points per level healed, by hand (once until it refills)."]
    },
    {
        uuid: pf2e("ONUvHtEccDmNEcVu"), name: "Spirit's Sacrifice",
        affect: { target: "you", effects: [{ kind: "heal", formula: "2*@actor.level" }] },
        notes: ["You don't die, and your wounded value drops to 1 if it's higher (by hand). The apparition is dispersed until your next daily preparations."]
    }
];

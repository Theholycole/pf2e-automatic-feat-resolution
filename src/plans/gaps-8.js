// Combat actions no reader or hand plan covered, from the simulator's feat gap index, batch 8 (2026-11-04, Cole: "keep doing combat gaps").

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

export default [
    {
        uuid: pf2e("amPQHO9O86G6AC4P"), name: "Devastating Spellstrike", target: "each enemy in a 5-foot emanation around your Spellstrike's target",
        text: "<p>Each enemy around the target takes @Damage[(floor((@actor.level + 6)/5))[untyped]] damage.</p>",
        notes: ["Make the Spellstrike first, with a spell that can deal damage; not the target itself. Use the spell's damage type; in Arcane Cascade, add its extra damage as a status bonus."]
    },
    {
        uuid: pf2e("oQVp2UhXVBcELma5"), name: "Root to Life",
        affect: { target: "an adjacent dying creature", effects: [{ kind: "end-condition", slug: "dying", stabilize: true }, { kind: "condition", slug: "unconscious", value: null, duration: null }] },
        notes: ["It's unconscious at 0 Hit Points. With 2 actions, it also attempts DC 10 flat checks to end each persistent damage."]
    },
    {
        uuid: pf2e("kPjBGlHMvBqFXNq2"), name: "Cursed Effigy",
        toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: -2 }] },
        notes: ["Only against your thaumaturge abilities and items that use your class DC, while you Exploit its Vulnerability: post it again to remove."]
    },
    {
        uuid: pf2e("lgEihn7deZwHczGE"), name: "Dragon Transformation",
        text: "<p>You gain the effects of a 6th-rank @UUID[Compendium.pf2e.spells-srd.Item.Dragon Form].</p>",
        notes: ["Use your own AC and attack modifier, add your Rage damage, and Dragon Breath uses your class DC. Add its temporary Hit Points to your Rage's. At 18th level: +20-foot fly Speed, +12 dragon Strike damage, +14 Dragon Breath damage."]
    }
];

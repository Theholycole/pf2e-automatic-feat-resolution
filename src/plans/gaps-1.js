// The combat feats no reader or hand plan covered, from the simulator's feat gap index (2026-11-04, Cole: "Prioritize the combat passives and
// actions in the feat module and simulator module"), by hand: a heal on the card, a rider after a basic action's success as its own card
// (as Mask of Pain's, src/plans/damage.js), a linked Effect on a touched creature, a Strike that sets up an ally.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

export default [
    // Heals.
    {
        uuid: pf2e("1gtWb6lKWMw1Wp1q"), name: "Ocean's Balm",
        text: "<p>A willing living creature you touch regains @Damage[(floor((max(1,@actor.level)-1)/2)+1)d8[healing]] Hit Points.</p>",
        notes: ["It also gains resistance 2 to fire for 1 minute, and if it has persistent fire damage it can attempt a flat check to remove it with especially appropriate help. It's immune to Ocean's Balm's healing for 10 minutes."]
    },
    {
        uuid: pf2e("azyp4nQgAPDI6nKv"), name: "Dash of Herbs",
        text: "<p>One living creature within 30 feet regains @Damage[((floor((max(6,@actor.level)-6)/2)+2)d8+4)[healing]] Hit Points.</p>",
        notes: ["It can also attempt a new save against the malady you chose to treat (confused, a disease, a poison or sickened), by hand."]
    },
    {
        uuid: pf2e("AQfNFH7jnjdwi4FQ"), name: "Rallying Banner",
        affect: { target: "each ally within 30 feet", effects: [{ kind: "heal", formula: "(max(4,(4 + floor((@actor.level - 8)/2))))d6" }] },
        notes: ["Only the allies in your commander's banner's aura (30 feet). Once per 10 minutes."]
    },
    {
        uuid: pf2e("ijsMs8iv9AsHQWrv"), name: "Torrent in the Blood",
        affect: { target: "each creature in a 30-foot cone", effects: [{ kind: "heal", formula: "(floor((max(6,@actor.level)-6)/2)+3)d8" }] },
        notes: ["Each creature in the cone can also attempt a new save against one poison or disease affecting it, by hand."]
    },
    // A linked Effect on the creature it touches.
    { uuid: pf2e("9p28s0zg4Vv4r5i2"), name: "Spike Skin", linked: { effect: "Compendium.pf2e.feat-effects.Item.Effect: Spike Skin", recipients: "target", target: "1 willing creature" }, notes: ["Touch: the target. It lasts 10 minutes, or until the target has taken damage from piercing attacks 10 times."] },
    // A Strike that sets up an ally.
    { uuid: pf2e("f0fpsr8ZSNrWlfAt"), name: "Set-Up Strike", strike: { onHit: { conditions: [{ slug: "off-guard", value: null, duration: { mode: "fixed", value: 1, unit: "rounds", expiry: "turn-start", anchor: "source-turn" } }] }, notes: ["The off-guard is against the next attack one of your allies attempts against it only: remove it after that attack."] } },
    // A basic action's success, then its rider (post this after the roll).
    {
        uuid: pf2e("hGjmbTNBUiJqYvsE"), name: "Crushing Grab", activity: true,
        text: "<p>The creature you successfully Grappled takes @Damage[(@actor.abilities.str.mod)[bludgeoning]] damage.</p>",
        notes: ["You can make it nonlethal with no penalty."]
    },
    {
        uuid: pf2e("3cE56QOhylFdM8UD"), name: "Punishing Shove", activity: true,
        text: "<p>The creature you successfully Shoved takes @Damage[(@actor.abilities.str.mod)[bludgeoning]] damage.</p>",
        notes: ["2 more if you're an expert in Athletics, 6 more if a master, 12 more if legendary. Double it on a critical success."]
    },
    {
        uuid: pf2e("oUhwrijg4rClCplO"), name: "Brutal Bully", activity: true,
        text: "<p>The enemy you successfully Disarmed, Grappled, Repositioned, Shoved or Tripped takes @Damage[(@actor.abilities.str.mod)[bludgeoning]] damage.</p>",
        notes: ["Only while raging. Add it to a critical Trip's damage."]
    },
    {
        uuid: pf2e("7hwTeZNq6Jmzmtz4"), name: "Agonizing Rebuke", activity: true,
        text: "<p>The enemy you successfully Demoralized takes @Damage[1d4[mental]] damage.</p>",
        notes: ["2d4 if you're a master in Intimidation, 3d4 if legendary. Post it again at the start of each of its turns: it ends once it isn't frightened, is more than 30 feet away, or after 1 minute."]
    }
];

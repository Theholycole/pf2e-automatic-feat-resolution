// Feats that deal damage with no roll to avoid it, rewritten by hand (2026-10-30): "The creature you Demoralized takes 2d6 mental damage",
// "… dealing 6d8 piercing damage to all enemies in the area". The readers take "<who> takes @Damage[…] damage" as an automatic card with
// that damage; the rest is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const teams = (module, pack, id) => `Compendium.${module}.${pack}.Item.${id}`;
const deafened = "@UUID[Compendium.pf2e.conditionitems.Item.9PR9y0bi4JPKnHPR]{Deafened}";
const offGuard = "@UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{Off-Guard}";
const cacophony = "@Damage[(max(1, @actor.level - 3))d6[sonic]]";

export default [
    {
        uuid: pf2e("ByqxxJkJiNFtjghh"), name: "Mask of Pain",
        text: "<p>The creature you successfully Demoralized takes @Damage[2d6[mental]] damage.</p>",
        notes: ["4d6 mental if you're legendary in Intimidation. Immune for 24 hours after."]
    },
    {
        uuid: pf2e("nqhqZErE8diYFabI"), name: "Infernal Anguish",
        text: "<p>The creature you successfully Demoralized takes @Damage[4d6[mental]] damage.</p>",
        notes: ["8d6 mental if you're legendary in Intimidation. Then increase your doomed value by 1."]
    },
    {
        uuid: pf2e("8azOq906HL0pFqTc"), name: "Call the Swarm",
        text: "<p>A swarm of rats fills a @Template[burst|distance:30] within 120 feet, dealing @Damage[6d8[piercing]|options:area-damage] damage to all enemies in the area.</p>",
        notes: ["Target the enemies in the burst. For the next minute the area is difficult terrain (not for you and your allies), and an enemy that ends its turn there takes 3d8 piercing."]
    },
    {
        uuid: pf2e("2VzIrCWJU4dJQV0x"), name: "Start the Festival!",
        text: "<p>Tanuki fill a @Template[type:burst|distance:30] within 120 feet, dealing @Damage[6d8[bludgeoning]|options:area-damage] damage to all enemies in the area.</p>",
        notes: ["Target the enemies in the burst. For the next minute an enemy that ends its turn there takes 3d8 bludgeoning."]
    },
    {
        uuid: pf2e("q0SPmS77pNgiQk93"), name: "Shame the Sin",
        text: "<p>The target takes @Damage[(ternary(gte(@actor.level,17),3,ternary(gte(@actor.level,13),2,1)))d6[mental]] damage.</p>",
        notes: ["Only if the demon has no special vulnerability; one that has suffers that instead."]
    },
    {
        uuid: pf2e("JoFHG7NjJ6iUNnAY"), name: "Gossamer Blade",
        text: "<p>The creature you hit takes @Damage[1d6[persistent,force]] damage.</p>",
        notes: ["1d6 persistent force per weapon damage die: add the rest by hand for a striking weapon."]
    },
    {
        uuid: pf2e("9gEVyUjYrDLUWieq"), name: "Rend Mimicry",
        text: "<p>The target takes @Damage[(ternary(gte(@actor.level,16),3,ternary(gte(@actor.level,10),2,1)))d6[slashing]] damage.</p>"
    },
    {
        uuid: pf2e("6iDd7CTzxkvMp6lB"), name: "Align Qi",
        text: "<p>You regain @Damage[(@actor.abilities.wis.mod + @actor.level)[healing]] Hit Points.</p>"
    },
    {
        uuid: action("SdjdsilE69Qz22VC"), name: "Inflict Punishment",
        text: "<p>The triggering creature takes @Damage[(floor(@actor.level/2))d8[piercing]] damage with a @Check[reflex|against:class-spell|basic] save against your class DC or spell DC, whichever is higher.</p>"
    },
    {
        uuid: teams("pf2e-team-plus-tian-xia", "misc", "ana9pvkZ63MqBCzQ"), name: "All-Out Friendship Blast!",
        text: "<p>Each creature in a @Template[type:emanation|distance:30] takes @Damage[18d6[force]|options:area-damage] damage with a @Check[reflex|against:class-spell|basic|options:area-effect] save against your class DC or spell DC, whichever is higher.</p>",
        notes: ["Each friendship counter: +1d6 damage or +10 feet to the area, your choice. Creatures who choose to believe are immune."]
    },
    {
        uuid: teams("pf2e-team-plus-barbarians", "misc", "TEjn4bZZQ9JGAM08"), name: "Furious Cacophony",
        text: `<p>All creatures in a @Template[type:cone|distance:15] must attempt a @Check[fortitude|against:performance] save against your Performance DC.</p><hr /><p><strong>Critical Success</strong> The creature is unaffected.</p><p><strong>Success</strong> The creature takes half ${cacophony} damage.</p><p><strong>Failure</strong> The creature takes ${cacophony} damage and is ${deafened} for 1 round.</p><p><strong>Critical Failure</strong> The creature takes double ${cacophony} damage and is ${deafened} and ${offGuard} for 1 round.</p>`,
        notes: ["A 30-foot cone with Mighty Rage. In the first round of an encounter you can Rage as part of it."]
    }
];

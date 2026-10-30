// Feats that deal damage with no roll to avoid it, rewritten by hand (2026-10-30): "The creature you Demoralized takes 2d6 mental damage",
// "… dealing 6d8 piercing damage to all enemies in the area". The readers take "<who> takes @Damage[…] damage" as an automatic card with
// that damage; the rest is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

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
        text: "<p>The target takes @Damage[1d6[mental]] damage.</p>",
        notes: ["2d6 at 13th level, 3d6 at 17th: add the rest by hand. Only if the demon has no special vulnerability; one that has suffers that instead."]
    },
    {
        uuid: pf2e("JoFHG7NjJ6iUNnAY"), name: "Gossamer Blade",
        text: "<p>The creature you hit takes @Damage[1d6[persistent,force]] damage.</p>",
        notes: ["1d6 persistent force per weapon damage die: add the rest by hand for a striking weapon."]
    }
];

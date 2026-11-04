// Combat passives no reader or hand plan covered, from the simulator's feat gap index, batch 14 (2026-11-04, Cole: "keep going"): a
// ghoul's healing meal, a mortal herald's escape damage.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;

export default [
    {
        uuid: pf2e("NQtIhIowH1tVywZI"), name: "Replenishing Consumption", activity: true, target: "you",
        text: "<p>The target regains @Damage[(ceil(@actor.level/2))d6[healing]] Hit Points.</p>",
        notes: ["When you Consume Flesh, once every 10 minutes."]
    },
    {
        uuid: pf2e("YIzADuxb5AV1kUvK"), name: "Free from Bonds", activity: true, target: "the creature grabbing or restraining you",
        text: "<p>The target takes @Damage[(@actor.level)[spirit]] damage.</p>",
        notes: ["When you use Flash of Omnipresence while grabbed or restrained. Teleporting next to a grabbed or restrained ally instead lets you try to free them (see the feat)."]
    }
];

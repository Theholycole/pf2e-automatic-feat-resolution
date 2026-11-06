// Combat feats no reader or hand plan covered, from the simulator's feat gap index, batch 7 (2026-11-04, Cole: "keep doing combat gaps"):
// riders after a hit or a Trip, a bonus for the turn, a situational off-guard.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const rounds = (value, expiry = "turn-start") => ({ mode: "fixed", value, unit: "rounds", expiry, anchor: "effect-start" });
const THIS_TURN = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };

export default [
    {
        uuid: pf2e("GabSQXUprub2eyUm"), name: "Lightning Rod", target: "the creature your Elemental Blast hit",
        text: "<p>The target takes @Damage[((floor((@actor.level - 6)/6)+1)d12)[electricity]] damage.</p>",
        notes: ["Make the 2-action metal Elemental Blast first; post this when it hits. The rod gives it a –1 circumstance penalty to AC and to saves against electricity (–2 if it's metal or wears metal armor) until it pulls the rod free (Interact, DC 10 Athletics)."]
    },
    {
        uuid: pf2e("F8V4dN91JmHIOQCv"), name: "Topple The Titans",
        affect: { target: "each creature in a 10-foot emanation from the toppled creature whose Reflex DC your Trip's Athletics result meets", effects: [{ slug: "prone" }] },
        notes: ["After a successful Trip that knocked a creature at least one size larger prone. Compare your Trip's result with each creature's Reflex DC: target only those it meets. Once per minute."]
    },
    {
        uuid: pf2e("tnyZHm4yz6JUi2hy"), name: "Slay Giants Unseen",
        affect: { target: "the Large or larger enemy your attack critically hit", effects: [{ slug: "prone" }] },
        notes: ["Only while you're in an area of darkness. Once per hour."]
    },
    {
        uuid: pf2e("myQ2XkWrI3scbMuv"), name: "Sea Swarmer",
        affect: { target: "an enemy within reach of you and at least two of your allies", effects: [{ slug: "off-guard", duration: rounds(0, "turn-end") }] },
        notes: ["It's off-guard to you only, while it stays within reach of you and two allies: post it on your turn."]
    },
    {
        uuid: pf2e("uc6JcNrI31wzSC2h"), name: "Bullet Dancer Burn", activity: true,
        text: "<p>The target takes @Damage[1[fire]] damage and @Damage[1[persistent,fire]] damage.</p>",
        notes: ["In Bullet Dancer Stance: on the melee attack with the same weapon (or one attached to it) after a successful ranged firearm Strike within your reach. A successful melee Strike also keeps your next ranged Strike against it from triggering reactions."]
    },
    {
        uuid: pf2e("tSmd0cxq9wokSCh4"), name: "Castigating Weapon",
        toggle: { rules: [{ key: "FlatModifier", selector: "strike-damage", damageType: "spirit", value: "ceil(@actor.level/2)" }], duration: THIS_TURN },
        notes: ["After you deal spirit damage with Divine Castigation: equal to the heal or harm spell's rank (the card takes your highest rank), and your Strikes gain your holy or unholy trait, until the end of your turn."]
    },
    {
        uuid: pf2e("hIUiDCXN82QbSIvI"), name: "Great Shield Mastery",
        toggle: { rules: [{ key: "FlatModifier", selector: "ac", type: "circumstance", value: 4 }] },
        notes: ["Taking Cover behind your raised tower or fortress shield, without the action: on while the shield is raised, post it again when you lower it."]
    }
];

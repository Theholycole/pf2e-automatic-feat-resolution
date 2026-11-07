// A master's companion passives on its own rolls, batch 22 (2026-11-07, Cole: "focus on building the feats first"): a Note on the roll.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const note = (selector, text, more = {}) => ({ key: "Note", selector, title: "{item|name}", text: `<p>${text}</p>`, ...more });

export default [
    { uuid: pf2e("TORYSZMLMAGgsSEW"), name: "Companion's Cry", rules: [note("nature", "You can spend 2 actions to Command an Animal your companion: it uses one more action.", { predicate: ["action:command-an-animal"] })] },
    { uuid: pf2e("epNrbgmjZDjJe7Ry"), name: "Legendary Rider", rules: [note("initiative", "While riding your mount you're quickened; the extra action only to Command an Animal it.")] },
    { uuid: pf2e("PDFbfCrV2z0wfMz0"), name: "Demon's Hair", rules: [note("strike-attack-roll", "Your hair Strike's die is one step larger, with reach and versatile slashing. While your familiar lives within 30 feet you're quickened, the extra action only for a hair Strike. You can deliver hexes through your hair.", { predicate: ["item:slug:hair"] })] },
    { uuid: pf2e("hYW6MsPk1UcFROFD"), name: "Twin Eidolon", rules: [note("initiative", "When you Manifest your Eidolon you can become its duplicate until it unmanifests: you use its statistics and evolutions (your own Int, Wis and Cha), and you can't cast spells.")] },
    { uuid: pf2e("YvgOUg1h0WDasGWl"), name: "Gallop Across Shadow", rules: [note("nature", "Your horse can treat empty space in darkness as solid ground, crossing gaps or rising at up to 45 degrees; outside the darkness it falls.", { predicate: ["action:command-an-animal"] })] },
    { uuid: pf2e("CvMCw6JqvgMPE5uk"), name: "Blood Frenzy", rules: [note("strike-damage", "After your eidolon's bleed damage on a living creature it can frenzy for 1 minute: Boost Eidolon, temporary Hit Points equal to your level, –1 AC; it can't end it early. Then it's fatigued.")] }
];

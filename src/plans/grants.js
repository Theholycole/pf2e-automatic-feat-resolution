// A feat that gives an item (2026-10-31, the loop): "You gain the @UUID[…Magic Hide] warden spell", "Your familiar gains the @UUID[…Shed
// Spirit] activity". PF2e gives half of these by GrantItem (682 of 1,381 feats); the rest it leaves to the player. scripts/grants.js gives
// those the same way as the feat is gained: the spell into the actor's focus spellcasting, an action onto the actor or its companion; and
// takes them away as the feat goes. Not a familiar's learned spell ("your familiar learns"), which is its master's prepared spell.

const KIND = "(?:(?:warden|link|focus|hex|composition|conflux|devotion|domain|revelation|order|school|bloodline|ki|qi|cursebound|impulse) )?(?:spell|cantrip|hex|activity|action|reaction|free action|ability)";
const WHO = { you: "self", "your familiar": "familiar", "your eidolon": "eidolon", "your animal companion": "companion", "your companion": "companion", "your mount": "companion" };
const GRANT = new RegExp(`\\b(You|Your familiar|Your eidolon|Your animal companion|Your companion|Your mount|you|your familiar|your eidolon|your animal companion|your companion|your mount) (?:also |each )?(?:gain|gains|learn|learns) the @UUID\\[([^\\]]+)\\](?:\\{[^}]*\\})? (${KIND})\\b`, "g");

export function grantsIn(item) {
    if ((item?.system?.rules ?? []).some((rule) => rule.key === "GrantItem")) return [];
    const html = String(item?.system?.description?.value ?? "");
    const out = [];
    for (const [, who, uuid, kind] of html.matchAll(GRANT)) {
        if (!/^Compendium\./.test(uuid) || out.some((each) => each.uuid === uuid)) continue;
        out.push({ uuid, who: WHO[who.toLowerCase()], spell: /spell|cantrip|hex/.test(kind) && !/hex activity/.test(kind), kind });
    }
    return out;
}

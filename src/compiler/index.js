// The feat module's compiler (2026-10-30, docs/feats.md): a character's feat or action → the plan the ability module's cards and the
// simulator play, or null. PC feats read like monster abilities once the character's own numbers are in, so the ability module's readings
// do the reading; this fills the numbers first, and reads the Strike feats those readings don't take whole.

import { compileAbility } from "../../../pf2e-automatic-ability-resolution/src/compiler/index.js";
import { withCharacterDCs, withText } from "./character-dcs.js";
import { characterStrike } from "./strikes.js";
import { asUsed } from "./used.js";
import { selfHeal } from "./self-heal.js";
import { selfEffect } from "./self-effect.js";
import { handEntry, handStrike } from "../plans/index.js";

export { dcFor, fillCharacterDCs, fillCharacterNumbers, withCharacterDCs } from "./character-dcs.js";
export { characterStrike } from "./strikes.js";

// options.dcs: the character's own DCs, level and attribute modifiers (scripts/character.js); the rest are the ability compiler's
// (basicActions, actor).
export function compileFeat(item, options = {}) {
    const { dcs, ...abilityOptions } = options;
    if (!dcs) return null;
    // (A plan written by hand for this feat, src/plans/: first.)
    const hand = handEntry(item);
    if (hand?.strike) return handStrike(item, hand);
    const filled = withCharacterDCs(hand?.text ? withText(item, hand.text) : item, dcs);
    const plan = read(filled, abilityOptions) ?? selfHeal(filled, dcs) ?? selfEffect(filled, dcs);
    if (plan) return plan;
    // (Slice 3: a reaction or free action, its effect as the player uses it; its trigger and time kept on the plan.)
    const used = asUsed(filled);
    const usedPlan = used ? read(used.item, abilityOptions) ?? selfHeal(used.item, dcs) ?? selfEffect(used.item, dcs) : null;
    if (!usedPlan) return null;
    return { ...usedPlan, ...(usedPlan.activation ? { activation: { ...usedPlan.activation, time: used.time } } : {}), usedOn: used.trigger };
}

function read(item, options) {
    return compileAbility(item, options) ?? characterStrike(item, { compileSave: (html) => compileAbility(withText(item, html), options) });
}

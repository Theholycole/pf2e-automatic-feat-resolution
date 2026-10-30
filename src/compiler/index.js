// The feat module's compiler (2026-10-30, docs/feats.md): a character's feat or action → the plan the ability module's cards and the
// simulator play, or null. PC feats read like monster abilities once the character's own numbers are in, so the ability module's readings
// do the reading; this fills the numbers first, and reads the Strike feats those readings don't take whole.

import { compileAbility } from "../../../pf2e-automatic-ability-resolution/src/compiler/index.js";
import { withCharacterDCs, withText } from "./character-dcs.js";
import { characterStrike } from "./strikes.js";

export { dcFor, fillCharacterDCs, fillCharacterNumbers, withCharacterDCs } from "./character-dcs.js";
export { characterStrike } from "./strikes.js";

// options.dcs: the character's own DCs, level and attribute modifiers (scripts/character.js); the rest are the ability compiler's
// (basicActions, actor).
export function compileFeat(item, options = {}) {
    const { dcs, ...abilityOptions } = options;
    if (!dcs) return null;
    const filled = withCharacterDCs(item, dcs);
    const plan = compileAbility(filled, abilityOptions);
    if (plan) return plan;
    return characterStrike(filled, { compileSave: (html) => compileAbility(withText(filled, html), abilityOptions) });
}

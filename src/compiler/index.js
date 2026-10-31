// The feat module's compiler (2026-10-30, docs/feats.md): a character's feat or action → the plan the ability module's cards and the
// simulator play, or null. PC feats read like monster abilities once the character's own numbers are in, so the ability module's readings
// do the reading; this fills the numbers first, and reads the Strike feats those readings don't take whole.

import { compileAbility } from "../../../pf2e-automatic-ability-resolution/src/compiler/index.js";
import { withCharacterDCs, withText } from "./character-dcs.js";
import { characterStrike } from "./strikes.js";
import { asUsed } from "./used.js";
import { selfHeal } from "./self-heal.js";
import { selfEffect } from "./self-effect.js";
import { linkedEffect } from "./linked-effect.js";
import { otherHeal } from "./other-heal.js";
import { spellLike } from "./spell-like.js";
import { regainPoint } from "./regain-point.js";
import { handAct, handAffect, handEntry, handLinked, handSelfCheck, handStrike } from "../plans/index.js";

export { dcFor, fillCharacterDCs, fillCharacterNumbers, withCharacterDCs } from "./character-dcs.js";
export { characterStrike } from "./strikes.js";

// options.dcs: the character's own DCs, level and attribute modifiers (scripts/character.js); the rest are the ability compiler's
// (basicActions, actor).
import { eidolonWords, isEidolonItem } from "./companion.js";

export function compileFeat(item, options = {}) {
    const { dcs, ...abilityOptions } = options;
    if (!dcs) return null;
    // (A plan written by hand for this feat, src/plans/: first.)
    const hand = handEntry(item);
    const written = hand?.text ? withText(item, hand.text) : item;
    // (An eidolon's action, "Your eidolon Strikes": the readers' "You Strike"; 2026-10-30, "Companions".)
    const own = !hand?.text && isEidolonItem(item) ? withText(item, eidolonWords(item.system?.description?.value ?? "")) : written;
    const filled = withCharacterDCs(own, dcs);
    if (hand?.affect) return handAffect(item, hand, dcs);
    // (A check against a DC of the character's level, its results PF2e's Effects: by hand, src/plans/self-checks.js.)
    if (hand?.selfCheck) return handSelfCheck(item, hand, dcs);
    // (A passive whose bonus holds only in a moment PF2e can't see, "while adjacent to two hobgoblin allies": its Effect, turned on and off
    // by posting the feat; 2026-10-30, docs/rules.md, "Toggled Effects".)
    // (A passive with PF2e's own Effect for its moment: that Effect, on and off the same way.)
    if (hand?.passiveEffect) return { builtin: "passive-effect", effect: hand.passiveEffect.effect, who: hand.passiveEffect.who, notes: hand.notes ?? [] };
    // (An action's linked Effect the reader leaves, by hand: as the reader's; src/plans/linked-effects.js.)
    if (hand?.linked) return handLinked(item, hand);
    // (who "target": on the player's targets, an action's bonus to an ally with no PF2e Effect, Protect Ally's; 2026-10-31, the loop.)
    if (hand?.toggle) return { builtin: "feat-effect", toggle: true, ...(hand.toggle.who === "target" ? { who: "target" } : {}), effect: { name: item.name, rules: hand.toggle.rules, duration: hand.toggle.duration ?? { value: -1, unit: "unlimited", expiry: null, sustained: false }, stance: false }, notes: hand.notes ?? [] };
    const acted = hand?.act ? handAct(item, hand, abilityOptions.basicActions) : null;
    if (acted) return acted;
    if (hand?.strike) return handStrike(item, hand, characterStrike(filled, { compileSave: (html) => compileAbility(withText(filled, html), abilityOptions) }));
    const plan = read(filled, abilityOptions) ?? selfHeal(filled, dcs) ?? linkedEffect(filled) ?? otherHeal(filled) ?? selfEffect(filled, dcs)
        // (A feat that is a spell, "the effects of a 2nd-rank Web": cast through the spell module; 2026-10-30, "Spell-like feats".)
        ?? spellLike(filled, dcs)
        // (A Focus or Mythic Point back, "You regain 1 Focus Point": added to the pool; 2026-10-30, the loop.)
        ?? regainPoint(filled);
    // (A text entry's notes: what its rewritten text leaves out.)
    // (A text entry's notes: what its rewritten text leaves out; its target, who the card is for when the rewrite can't say it.)
    if (plan && hand?.text) return { ...plan, ...(hand.notes?.length ? { notes: [...(plan.notes ?? []), ...hand.notes] } : {}), ...(hand.target ? { targeting: { ...(plan.targeting ?? {}), target: hand.target } } : {}) };
    // (The ability module's "cast-spell" for a spell the feat only lets you pay for, Soul-Form's "you can spend 1 Mythic Point to also gain
    // the effects of Enlarge": not cast every time; as spellLike.)
    if (plan?.builtin === "cast-spell" && /\byou can (?:spend|choose)\b[^.]*@UUID\[[^\]]*spells/i.test(filled.system?.description?.value ?? "")) return null;
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

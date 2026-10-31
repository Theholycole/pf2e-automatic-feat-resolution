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
import { timerEffect } from "./timer-effect.js";
import { handAct, handAffect, handAttack, handEntry, handLinked, handSelfCheck, handStrike } from "../plans/index.js";

export { dcFor, fillCharacterDCs, fillCharacterNumbers, withCharacterDCs } from "./character-dcs.js";
export { characterStrike } from "./strikes.js";

// options.dcs: the character's own DCs, level and attribute modifiers (scripts/character.js); the rest are the ability compiler's
// (basicActions, actor).
import { eidolonWords, isEidolonItem } from "./companion.js";

// (A portal, Fabricate Rift's "Stride through this portal as part of the activity to create it": not its user's move card.)
const NOT_MOVES = /^Fabricate Rift$/;
// (Another creature's roll the reader takes for its user's own, Focus Ally's "Your ally rerolls", Correct the Story's "The enemy must reroll", or
// an attack sent elsewhere, Sidestep's and Redirect Elements': not its user's reroll card.)
const NOT_REROLLS = /^(?:Redirect Elements|Sidestep|Impossible Technique|Focus Ally|Correct the Story|Companion's Reprise|Shadows Within Shadows)$/;
// An action's own item-module card (round 94, Cole's pick "Item cards first"), read by that module's readers when it's on (options.itemReaders:
// its src/compiler/rerolls.js rerollPlan, fortune.js rollTwicePlan, move.js movePlan) → its "reroll", "roll-twice" or "teleport" plan, or null. A passive's: none.
function itemCardFor(item, readers) {
    if (!readers || (item.system?.actionType?.value ?? "passive") === "passive") return null;
    const base = { source: { name: item.name, slug: item.system?.slug ?? null, uuid: item.uuid ?? null, type: item.type }, rank: 1, traits: [...(item.system?.traits?.value ?? [])], activation: { time: null, traits: [] } };
    // (Its inline checks as their words, "a DC 30 [[/act high-jump]]{Athletics} check": the card's lines are plain text.)
    const html = String(item.system?.description?.value ?? "").replace(/\[\[[^\]]*\]\]\{([^}]*)\}/g, "$1").replace(/@Check\[(\w+)[^\]]*\](?:\{([^}]*)\})?/g, (_, skill, label) => label ?? `${skill.charAt(0).toUpperCase()}${skill.slice(1)}`);
    const reroll = typeof readers.rerollPlan === "function" && !NOT_REROLLS.test(item.name) ? readers.rerollPlan(html, base) : null;
    const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    // (Its user's next roll rolled twice, the better kept: the item module's fortune card, PF2e's RollTwice — its src/compiler/fortune.js.)
    // (Liberate Self's "Attempt to Escape, rolling the check twice": that Escape's check, by hand. Vision of Foresight's "a saving throw or
    // skill check" the reader takes for a save alone: not its card.)
    const escape = item.name === "Liberate Self" ? { ...base, builtin: "roll-twice", automation: { level: "automatic" }, targeting: { target: "the user", range: null, area: null }, trigger: { event: "use" }, rollTwice: { selector: "check", keep: "higher", predicate: [{ or: ["action:escape"] }] }, notes: ["Then Escape: its check is rolled twice, the better kept."] } : null;
    const twice = escape ?? (!reroll && typeof readers.rollTwicePlan === "function" && item.name !== "Vision of Foresight" ? readers.rollTwicePlan(plain, base) : null);
    const card = reroll ?? twice ?? (typeof readers.movePlan === "function" && !NOT_MOVES.test(item.name) ? readers.movePlan(html, base) : null);
    // (Its cost, Rewrite Fate's "Spend a Mythic Point": the item module's card spends it, or refuses — its src/compiler/spend.js.)
    const spent = card && typeof readers.withSpend === "function" ? readers.withSpend(card, plain) : card;
    // (Rewrite Fate's "reroll the check or save": either roll, not a save alone.)
    if (spent?.reroll && /\breroll the (?:check or save|save or check)\b/i.test(plain)) spent.reroll = { ...spent.reroll, what: "roll", statistic: undefined };
    // (Rewrite Fate's "You expend a Mythic Point and reroll": the same cost.)
    return spent && !spent.spend && /\bYou expend (?:a|1|one) Mythic Point\b/.test(plain) ? { ...spent, spend: { mythicPoints: 1 } } : spent;
}

export function compileFeat(item, options = {}) {
    const { dcs, itemReaders, ...abilityOptions } = options;
    if (!dcs) return null;
    // (A plan written by hand for this feat, src/plans/: first.)
    const hand = handEntry(item);
    // (hand.activity: a passive's activity, "If you rest for 10 minutes, you regain …", played as an action when it's posted.)
    const written = hand?.text ? withText(item, hand.text, hand.activity ? { actionType: { value: "action" }, actions: { value: typeof hand.activity === "number" ? hand.activity : null } } : {}) : item;
    // (An eidolon's action, "Your eidolon Strikes": the readers' "You Strike"; 2026-10-30, "Companions".)
    const own = !hand?.text && isEidolonItem(item) ? withText(item, eidolonWords(item.system?.description?.value ?? "")) : written;
    const filled = withCharacterDCs(own, dcs);
    if (hand?.affect) return handAffect(item, hand, dcs);
    // (A check against a DC of the character's level, its results PF2e's Effects: by hand, src/plans/self-checks.js.)
    if (hand?.selfCheck) return handSelfCheck(item, hand, dcs);
    // (An attack roll against a defense, src/plans/attacks.js: a check card at the character's attack modifier.)
    if (hand?.attack) return handAttack(item, hand, dcs);
    // (A passive whose bonus holds only in a moment PF2e can't see, "while adjacent to two hobgoblin allies": its Effect, turned on and off
    // by posting the feat; 2026-10-30, docs/rules.md, "Toggled Effects".)
    // (A passive with PF2e's own Effect for its moment: that Effect, on and off the same way.)
    if (hand?.passiveEffect) return { builtin: "passive-effect", effect: hand.passiveEffect.effect, who: hand.passiveEffect.who, notes: hand.notes ?? [] };
    // (An action's linked Effect the reader leaves, by hand: as the reader's; src/plans/linked-effects.js.)
    if (hand?.linked) return handLinked(item, hand);
    // (A point regained in a moment the reader leaves, by hand: as the reader's regain-point; src/compiler/regain-point.js.)
    if (hand?.regain) return { builtin: "regain-point", resource: hand.regain.resource, value: hand.regain.value ?? 1, notes: hand.notes ?? [] };
    // (who "target": on the player's targets, an action's bonus to an ally with no PF2e Effect, Protect Ally's; 2026-10-31, the loop.)
    if (hand?.toggle) return { builtin: "feat-effect", toggle: true, ...(hand.toggle.who === "target" ? { who: "target" } : {}), effect: { name: item.name, rules: hand.toggle.rules, duration: hand.toggle.duration ?? { value: -1, unit: "unlimited", expiry: null, sustained: false }, stance: Boolean(hand.toggle.stance) }, notes: hand.notes ?? [] };
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
    if (plan && hand?.text) return { ...plan, ...(hand.by ? { by: hand.by } : {}), ...(hand.castWith ? { castWith: hand.castWith } : {}), ...(hand.notes?.length ? { notes: [...(plan.notes ?? []), ...hand.notes] } : {}), ...(hand.target ? { targeting: { ...(plan.targeting ?? {}), target: hand.target } } : {}) };
    // (The ability module's "cast-spell" for a spell the feat only lets you pay for, Soul-Form's "you can spend 1 Mythic Point to also gain
    // the effects of Enlarge": not cast every time; as spellLike.)
    if (plan?.builtin === "cast-spell" && /\byou can (?:spend|choose)\b[^.]*@UUID\[[^\]]*spells/i.test(filled.system?.description?.value ?? "")) return null;
    if (plan) return plan;
    // (Slice 3: a reaction or free action, its effect as the player uses it; its trigger and time kept on the plan.)
    const used = asUsed(filled);
    const usedPlan = used ? read(used.item, abilityOptions) ?? selfHeal(used.item, dcs) ?? selfEffect(used.item, dcs) : null;
    // (Round 43: a timed effect nothing above plays, its Effect with no rules: src/compiler/timer-effect.js.)
    // (Round 94: a reroll or a Stride, Step or Leap the feat is, Tactical Entry's "You Stride. This movement doesn't trigger reactions": the item
    // module's card, itemCardFor.)
    // (With a timer too, Chemical Spill's 3 rounds of its trail: the timer, its move card beside it, plan.move.)
    if (!usedPlan) {
        const moved = itemCardFor(filled, itemReaders);
        const timer = timerEffect(filled);
        return timer && moved ? { ...timer, move: moved } : moved ?? timer;
    }
    return { ...usedPlan, ...(usedPlan.activation ? { activation: { ...usedPlan.activation, time: used.time } } : {}), usedOn: used.trigger };
}

function read(item, options) {
    return compileAbility(item, options) ?? characterStrike(item, { compileSave: (html) => compileAbility(withText(item, html), options) });
}

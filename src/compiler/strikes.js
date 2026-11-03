// A character's Strike feats (2026-10-30, docs/feats.md): "Make a melee Strike. If it hits, the target is Frightened 1", "Stride twice,
// then Strike", "This counts as two attacks …", "you gain a +1 circumstance bonus to your attack roll". The monster readings take only an
// activity they read whole; a feat's own wordings vary too much for that, so this reads what it can into the strike-activity builtin the
// live cards and the simulator already play, and gives the rest to the GM as notes. The player uses the feat, then rolls the Strike from
// the sheet; its hit gets the card (the ability module's scripts/live.js, pendingActivities).

import { htmlToPlainText } from "../../../pf2e-resolution-core/src/text/plain-text.js";
import { degreeSections, inlineTags, readCheck, readConditions, readDamage, readPush } from "../../../pf2e-automatic-ability-resolution/src/compiler/inline.js";

// A sentence is a rule once it has a tag or a game word; the rest ("You rush forward with a battle cry.") is flavour, not a note.
export const RULE_WORDS = /@\w+\[|\[\[|\b(?:Strikes?|Strides?|Steps?|Leaps?|damage|checks?|saves?|saving throws?|DC|bonus|penalty|hits?|feet|actions?|reactions?|rounds?|turns?|minutes?|Hit Points|off-guard|prone|grabbed|frightened|attempts?|Speed|AC|weapon|unarmed|shield|spell|Interact|Raise|Requirements?|Frequency|Trigger)\b/;
// PF2e's conditions, for the ones a hit gives (a word like "immobilizing" isn't one).
const CONDITIONS = new Set(["blinded", "broken", "clumsy", "concealed", "confused", "controlled", "dazzled", "deafened", "doomed", "drained", "dying", "encumbered", "enfeebled", "fascinated", "fatigued", "fleeing", "frightened", "grabbed", "hidden", "immobilized", "invisible", "observed", "off-guard", "paralyzed", "persistent-damage", "petrified", "prone", "quickened", "restrained", "sickened", "slowed", "stunned", "stupefied", "unconscious", "undetected", "unnoticed", "wounded"]);
// The user makes the Strike: "Make a melee Strike", "make two dagger Strikes", "Stride, then Strike", "Strike an adjacent creature", "You Strike".
// Another creature's Strike: a companion's, a squadmate's, the target's.
const OTHERS = /\b(?:eidolon|companion|familiar|ally|allies|mount|squadmates?|underling|boss|construct|minion|summon|apparition|spirit|wisp|innovation|clone|duplicate|image)\b/i;
const USER_STRIKES = /\b(?:[Mm]ake|makes) (?:a|an|one|two|three|up to (?:two|three)|a single|another) (?:[\w'-]+ ){0,4}Strikes?\b|\b(?:then|and|you|You) Strike\b|(?:^|[.:]\s+)Strike\b|\bStrike (?:with your|an?|the|one|each|your)\b/;
const NUMBERS = { once: 1, one: 1, a: 1, an: 1, twice: 2, two: 2, three: 3, "three times": 3 };
const HIT = /^(?:If (?:the|your|this|that|either|the first) (?:Strike|attack)(?: is successful| succeeds| hits)|If (?:it|you) (?:hits?|successfully hits?|succeed)|On a hit|On a success|On a successful Strike|If it's a hit|If it deals damage(?: to an? [\w ]+?)?)(?: and (?:deals?|damages?)[^,]*)?,?\s*/i;
const CRITICAL = /^(?:If (?:the Strike|the attack|it|you) (?:is a critical hit|critically hits|critically succeeds?|critically hit)|On a critical hit|If you critically hit|If you critically succeed)\b,?\s*/i;

const sentencesOf = (html) => String(html ?? "").split(/(?<=[.!?])\s+(?=[A-Z@<[])|;\s+(?=(?:if|on a)\b)/i).map((sentence) => sentence.trim()).filter(Boolean);
const plainOf = (html) => htmlToPlainText(String(html ?? "").replace(/@(?:UUID|Compendium)\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/@Damage\[((?:[^[\]]|\[[^\]]*\])*)\](?:\{([^}]*)\})?/g, (_all, raw, label) => label ?? readDamage(raw))).replace(/\s+/g, " ").trim();

// The description's body: the Requirements, Frequency, Trigger and Effect headings set apart, the flavour before the first rule kept out.
function partsOf(html) {
    const blocks = {};
    const body = String(html ?? "").replace(/<p>\s*<strong>\s*(Requirements?|Frequency|Trigger|Cost|Access)\s*<\/strong>([\s\S]*?)<\/p>\s*(?:<hr\s*\/?>)?/gi, (_all, heading, text) => {
        blocks[heading.toLowerCase().replace(/s$/, "")] = plainOf(text);
        return "";
    }).replace(/<strong>\s*Effect\s*<\/strong>/gi, "");
    return { blocks, body };
}

// "Make two Strikes", "Strike twice", "make a Strike against each enemy": how many Strikes.
function strikeCount(plain) {
    const many = /\bmake (two|three|2|3) (?:[\w'-]+ ){0,3}Strikes\b|\bStrike (twice|three times)\b|\bmake up to (two|three) Strikes\b/i.exec(plain);
    if (many) return NUMBERS[(many[1] ?? many[2] ?? many[3]).toLowerCase()] ?? Number(many[1] ?? many[2] ?? many[3]) ?? 1;
    return 1;
}

// "Stride twice", "Stride up to your Speed, then …", "Stride and then make a melee Strike": the Strides first.
function stridesOf(plain) {
    const before = plain.split(/\bStrikes?\b/)[0];
    const counted = /\bStride (twice|three times)\b/i.exec(before);
    if (counted) return NUMBERS[counted[1].toLowerCase()];
    return /\bStride\b/.test(before) ? 1 : 0;
}

// A hit's results from one sentence: damage tags, conditions, a push; a save the creature hit attempts, with the degree sections it has.
function hitResults(sentence, html, item, compileSave) {
    const out = { conditions: [], damage: [], push: null, save: null, critical: null, follow: null, read: false };
    // (2026-11-01, the feat ratings: "If you hit and deal damage, the target is Frightened 1, or Frightened 2 on a critical hit" — the hit's own
    // words kept off the conditions' reading, which takes "you" for its user; a critical hit's in the same sentence as the critical's.)
    const body = sentence.replace(HIT, "");
    const criticalPart = /,?\s*or (.+?) on a critical hit\.?\s*$/i.exec(body);
    const conditionsOf = (text) => readConditions(text).filter((effect) => effect.recipient !== "self" && CONDITIONS.has(effect.slug));
    const conditions = conditionsOf(criticalPart ? body.slice(0, criticalPart.index) : body);
    const critical = criticalPart ? conditionsOf(criticalPart[1]) : [];
    if (critical.length && conditions.length) out.critical = critical.map(({ slug, value, duration }) => ({ slug, value: value ?? null, duration: duration ?? null }));
    if (conditions.length) {
        out.conditions = conditions.map(({ slug, value, duration }) => ({ slug, value: value ?? null, duration: duration ?? null }));
        out.read = true;
    }
    // (Stasian Smash's "… as well as 1d4 electricity damage to up to two other foes": not the target's.)
    const others = /\bother (?:foes|creatures|enemies|targets)\b/i.test(sentence);
    const damage = others ? [] : inlineTags(sentence, "Damage").map(readDamage).filter((formula) => !/@/.test(formula));
    // Written out ("you deal an additional 10d10 precision damage", "takes 4d6 extra precision damage", "1d6 persistent bleed damage").
    if (!damage.length && !others) {
        const words = plainOf(sentence);
        const written = /\b(?:an? )?(?:additional|extra) (\d+d\d+|\d+) (persistent )?([a-z]+) damage\b/i.exec(words) ?? /\b(\d+d\d+|\d+) (?:additional |extra )?(persistent )?([a-z]+) damage\b/i.exec(words);
        if (written && !/\bper\b|\bfor each\b|\bequal to\b/i.test(words)) damage.push(`${written[1]}[${written[2] ? "persistent," : ""}${written[3].toLowerCase()}]`);
    }
    if (damage.length) {
        out.damage = damage;
        out.read = true;
    }
    // (2026-11-03, Cole's pick: the Strike riders. "If it hits and deals damage, you can attempt an Athletics check to Trip the creature you
    // hit", "you can immediately attempt to Grapple the target": the basic action after the hit — the ability module's card for it.)
    const follow = /\b(?:you )?(?:can )?(?:immediately |also |then )?attempt (?:an? Athletics check )?to (?:\[\[\/act (trip|grapple|shove|disarm|reposition)\b[^\]]*\]\](?:\{[^}]*\})?|(Trip|Grapple|Shove|Disarm|Reposition)\b)/i.exec(plainOf(sentence).replace(/\[\[/g, "[[")) ?? /\b(?:you )?(?:can )?(?:immediately |also |then )?attempt (?:an? Athletics check )?to \[\[\/act (trip|grapple|shove|disarm|reposition)\b/i.exec(sentence);
    if (follow) {
        out.follow = (follow[1] ?? follow[2]).toLowerCase();
        out.read = true;
    }
    const push = readPush(sentence);
    if (push?.kind === "push") {
        out.push = push.distance;
        out.read = true;
    }
    const check = inlineTags(sentence, "Check").map(readCheck).find((entry) => entry.save && entry.dc);
    if (check && compileSave) {
        // The save as an ability of its own: the sentence and the degree sections that follow it.
        const at = html.search(/<p>\s*<strong>\s*Critical Success\s*<\/strong>/i);
        const text = `<p>${sentence.replace(HIT, "")}</p>${at >= 0 && Object.keys(degreeSections(html)).length ? html.slice(at) : ""}`;
        const plan = compileSave(text);
        if (plan?.resolution?.kind === "save") {
            out.save = plan;
            out.read = true;
        }
    }
    return out;
}

// item: the feat (its text with the character's numbers in, src/compiler/pc-dcs.js). compileSave(html): a save plan from a piece of its text.
export function characterStrike(item, { compileSave = null, ...options } = {}) {
    const html = String(item?.system?.description?.value ?? "");
    if (!/\bStrikes?\b/.test(html)) return null;
    const { blocks, body } = partsOf(html);
    const sentences = sentencesOf(body.replace(/<\/?p[^>]*>|<hr\s*\/?>/gi, " ").replace(/<strong>\s*(Critical Success|Success|Failure|Critical Failure)\s*<\/strong>[\s\S]*$/i, ""));
    const plain = plainOf(body);
    // Not a feat that only changes Strikes for a while, or one about another creature's Strike (a reaction's trigger, an ally's): those
    // aren't the user's Strike activity.
    if (!USER_STRIKES.test(plain) || /\b(?:an ally|your ally|allies|your companion|your eidolon|your familiar|your mount)\b[^.]*\bStrikes?\b/i.test(plain.split(/\.\s/)[0])) return null;
    const plan = {
        builtin: "strike-activity",
        actions: Number(item.system?.actions?.value) || 1,
        strides: stridesOf(plain),
        strike: /\branged Strike|\bStrike with a (?:bow|crossbow|firearm|ranged weapon)\b/i.test(plain) ? "ranged" : null,
        anyStrike: !/\b(?:melee|ranged) (?:unarmed )?Strike/i.test(plain),
        melee: /\bmelee (?:unarmed )?Strike/i.test(plain),
        attackBonus: 0,
        damageBonus: 0,
        offGuard: false,
        requires: blocks.requirement ?? null,
        oncePerFight: false,
        onHit: { conditions: [], critical: null, push: null, damage: [], save: null, size: null },
        source: { name: item.name, type: item.type },
        notes: []
    };
    if (plan.strike === "ranged") plan.anyStrike = false;
    const count = strikeCount(plain);
    if (count > 1) {
        plan.strikes = Array.from({ length: count }, () => plan.strike);
        plan.notes.push(`${count} Strikes; each hit gets its card.`);
    }
    const counts = /\bcounts? as (two|three) attacks\b/i.exec(plain);
    if (counts) plan.countsAs = NUMBERS[counts[1].toLowerCase()];
    const bonus = /\b(?:gain|gains|get|with) an? \+(\d+) (?:circumstance|status) bonus to (?:your|its|the|this) (?:attack roll|Strike)/i.exec(plain) ?? /\+(\d+) circumstance bonus to (?:the )?attack roll/i.exec(plain);
    if (bonus) plan.attackBonus = Number(bonus[1]);
    const penalty = /\b(?:take|takes|with) an? [–-](\d+) (?:circumstance )?penalty (?:to|on) (?:your|its|the|this|each) (?:attack roll|Strike)/i.exec(plain);
    if (penalty) plan.attackBonus = -Number(penalty[1]);
    let read = Boolean(counts || bonus || penalty || count > 1 || plan.strides);
    const unread = [];
    // (2026-11-01, the feat ratings: Vicious Swing's "you deal an extra die of weapon damage", two from 10th level and three from 18th —
    // extraWeaponDice, as a monster's activity has it; the card's GM keeps the words as a note.)
    const extraDice = /\b(?:deal|deals|add) an? (?:extra|additional) (?:weapon damage die|die of weapon damage)\b/i.test(plain);
    if (extraDice) {
        const level = Number(options.level) || 1;
        plan.extraWeaponDice = level >= 18 && /\b18th level\b[^.]*\bthree extra dice\b/i.test(plain) ? 3 : level >= 10 && /\b10th level\b[^.]*\btwo extra dice\b/i.test(plain) ? 2 : 1;
        read = true;
    }
    // (2026-11-03, the Strike riders: "it deals two additional weapon damage dice … three if you're 14th level or higher" (Tiger Slash),
    // "two additional weapon damage dice … If you are at least 18th level, increase the additional damage to three" (Grievous Blow).)
    const moreDice = !extraDice ? /\b(?:deals?|deal) (one|two|three|an?) (?:additional|extra) weapon damage (?:dice|die)\b/i.exec(plain) : null;
    if (moreDice) {
        const level = Number(options.level) || 1;
        let dice = NUMBERS[moreDice[1].toLowerCase()] ?? 1;
        const upgrade = /\((three|four) extra dice if you're (\d+)th level or higher\)|\bat least (\d+)th level, increase the additional damage to (three|four)\b|\bor (two|three) additional weapon damage dice if you're at least (\d+)th level\b/i.exec(plain);
        if (upgrade) {
            const at = Number(upgrade[2] ?? upgrade[3] ?? upgrade[6]);
            if (level >= at) dice = { two: 2, three: 3, four: 4 }[(upgrade[1] ?? upgrade[4] ?? upgrade[5]).toLowerCase()];
        }
        plan.extraWeaponDice = dice;
        read = true;
    }
    // (Brutal Finish's "After the Strike, your turn ends" — a cost the simulator must see — and its failure's "You deal damage equal to one
    // weapon damage die … two dice if you're at least 18th level".)
    if (/\bAfter (?:the|this|that) Strike, your turn ends\b/i.test(plain)) {
        plan.endsTurn = true;
        plan.notes.push("After the Strike, your turn ends.");
    }
    const failureDie = /<strong>\s*Failure\s*<\/strong>\s*You deal damage equal to (one|two) weapon damage dic?e\b([^<]*)/i.exec(html);
    if (failureDie) {
        const level = Number(options.level) || 1;
        const more = /Increase this to (two|three) dice if you're at least (\d+)th level/i.exec(failureDie[2]);
        plan.failureDice = more && level >= Number(more[2]) ? NUMBERS[more[1].toLowerCase()] : NUMBERS[failureDie[1].toLowerCase()];
        read = true;
    }
    // ("against an undead foe", "Strike a fiend": only at a creature with that trait; "a foe that can cast divine spells": a target the
    // simulator can't tell, kept as targetUnread.)
    const kind = /\b(?:Strike|attack) (?:against )?an? (undead|fiend|dragon|demon|devil|aberration|construct|elemental|giant|ooze|plant|beast|animal|spirit|celestial) (?:foe|creature|enemy|target)\b/i.exec(plain);
    if (kind) plan.targetTraits = [kind[1].toLowerCase()];
    const unreadTarget = /\bStrike (?:a|an) (?:foe|creature|enemy|target) that (?:can|has|is)\b[^.]*/i.exec(plain);
    if (unreadTarget) plan.targetUnread = unreadTarget[0];
    // ("a circumstance bonus to damage equal to the number of weapon damage dice", "… equal to twice the number of weapon damage dice":
    // damagePerWeaponDie, the simulator's and the GM's.)
    const perDie = /\bbonus to (?:the )?damage (?:roll )?equal to (twice )?the number of weapon damage dice\b/i.exec(plain);
    if (perDie && !/\bpenalty to damage equal to\b/i.test(plain)) {
        plan.damagePerWeaponDie = perDie[1] ? 2 : 1;
        read = true;
    }
    // ("Your wolf jaw gains the fatal d12 trait for this Strike", "this Strike gains the deadly d10 trait".)
    const fatal = /\bgains? the fatal d(\d+) trait\b/i.exec(plain);
    if (fatal) {
        plan.fatal = Number(fatal[1]);
        read = true;
    }
    // (Exacting Strike's "Failure This attack doesn't count toward your multiple attack penalty": the engine's exacting.)
    if (/<strong>\s*Failure\s*<\/strong>[^<]*doesn't count toward your multiple attack penalty/i.test(html)) {
        plan.exacting = true;
        plan.notes.push("On a failure, this attack doesn't count toward your multiple attack penalty.");
        read = true;
    }
    // (A check of its own before the Strike — Leaping Hedgehog Strike's Tumble Through —: its "On a success" is that check's, not the hit's.)
    const otherCheck = /\b[Aa]ttempt an? [A-Z]?\w+ check\b|@Check\[(?!fortitude|reflex|will)/.test(plain + html);
    for (let sentence of sentences) {
        const words = plainOf(sentence);
        if (CRITICAL.test(words)) {
            const results = hitResults(sentence.replace(CRITICAL, ""), html, item, compileSave);
            if (results.read) {
                plan.onHit.critical = results.conditions.length ? results.conditions : plan.onHit.critical;
                if (results.damage.length) plan.onHit.criticalDamage = [...(plan.onHit.criticalDamage ?? []), ...results.damage];
                if (results.push) plan.onHit.criticalPush = results.push;
                read = true;
                continue;
            }
        } else if (HIT.test(words) && !(/^On a success\b/i.test(words) && otherCheck)) {
            // (Suplex's "on a success, the target lands Prone, and on a critical success, the target lands prone and takes an additional
            // 2d6 bludgeoning damage": the critical's part read as a critical hit's.)
            const split = /,? and on a critical (?:success|hit),\s*/i.exec(sentence);
            if (split) {
                const crit = hitResults(sentence.slice(split.index + split[0].length), html, item, null);
                if (crit.damage.length) plan.onHit.criticalDamage = [...(plan.onHit.criticalDamage ?? []), ...crit.damage];
                if (crit.conditions.length) plan.onHit.critical = crit.conditions;
                sentence = sentence.slice(0, split.index) + ".";
            }
            const results = hitResults(sentence, html, item, compileSave);
            if (results.read) {
                plan.onHit.conditions.push(...results.conditions);
                if (results.critical) plan.onHit.critical = results.critical;
                plan.onHit.damage.push(...results.damage);
                if (results.push) plan.onHit.push = results.push;
                if (results.save) plan.onHit.save = results.save;
                if (results.follow) plan.onHit.follow = results.follow;
                // "(10 feet on a critical hit)": the critical push in the same sentence.
                const criticalPush = /\((\d+) feet on a critical hit\)/i.exec(words);
                if (criticalPush) plan.onHit.criticalPush = Number(criticalPush[1]);
                read = true;
                continue;
            }
        } else if (/\b(?:Make|make|Strike|Stride|Step|This counts as|counts as two|counts as three)\b/.test(words) && !/@(?:Damage|Check)\[/.test(sentence) && !readConditions(sentence).length) {
            // The activity's own steps, read above (its Strides, Strikes, bonus, penalty).
            if (/\b(?:Make|make) (?:a|an|two|three|up to)\b|\bStride\b|\bStrike\b|counts as/.test(words)) continue;
        }
        // (The bonus, penalty and attack count, read above.)
        if (/\bcircumstance bonus to (?:your|its|the|this) attack roll|\bcounts? as (?:two|three) attacks|\bpenalty (?:to|on) (?:your|its|the|this|each) (?:attack roll|Strike)/i.test(words)) continue;
        if (words) unread.push(words);
    }
    if (!read) {
        // (2026-10-30) A Strike feat whose hit adds nothing the readers take: the Strike's card still, the feat's own rules as notes,
        // when the Strike is plainly the character's own ("Make a melee Strike", "You Step and then Strike"), not a companion's.
        const own = plainOf(body).split(/(?<=[.!?])\s+/).find((words) => USER_STRIKES.test(words));
        if (!["action", "reaction", "free"].includes(item.system?.actionType?.value)) return null;
        if (!own || !/^(?:Make|Then|You|Strike|Attempt|Step|Stride|Interact|Leap|Spend|Choose)\b|\byou\b/.test(own) || OTHERS.test(own)) return null;
        plan.plain = true;
    }
    // What isn't read: the GM's, on the card.
    // (Not the flavour: a sentence with no game word in it.)
    plan.notes.push(...unread.filter((words) => RULE_WORDS.test(words) && (!/^(?:You|It) (?:make|makes) (?:a|an) /i.test(words) || /\b(?:if|unless|instead|only)\b/i.test(words))));
    if (plan.requires) plan.notes.unshift(`Requires: ${plan.requires}`);
    if (blocks.frequency) plan.notes.unshift(`Frequency: ${blocks.frequency}`);
    return plan;
}

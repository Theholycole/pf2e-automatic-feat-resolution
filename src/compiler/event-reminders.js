// A reaction or free action triggered by what others do to the character or an ally nearby (2026-10-30, docs/feats.md, slice 7): "A
// creature hits you with a melee Strike.", "You are targeted by an attack.", "While you have your shield raised, you would take damage
// from a physical attack.", "An ally within 30 feet is hit by an attack." The character's players can't watch every roll for these, so
// when PF2e posts the attack or the damage aimed at the character (or an ally in range), the module whispers them the feats they may use
// (scripts/reminders.js). Nothing is used for them; the player decides, and the trigger's other words are theirs to judge.

import { ownWords } from "./companion.js";
const plainOf = (html) => String(html ?? "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// → { event: "critical-hit" | "hit" | "targeted" | "damaged" | "ally-hit" | "ally-targeted" | "ally-damaged" | "foe-casts", within, trigger,
// kind }, or null.
export function eventTrigger(given) {
    const item = ownWords(given);
    // (A heritage or background, with no action type: as a passive; round 49, Kardan Bugbear.)
    const type = item?.system?.actionType?.value ?? (["heritage", "background"].includes(item?.type) ? "passive" : undefined);
    // (A passive feat that says when it applies, "Whenever you critically succeed on a Strike, …", "When you would become fatigued, …": read
    // the same way, its "When" clause as the trigger; the loop, 2026-10-30.)
    const passive = type === "passive" ? /(?:^|[.!?]\s+)When(?:ever)? ((?:you|an? (?:ally|enemy|creature|foe))\b[^,.]*),/i.exec(plainOf(item?.system?.description?.value ?? "")) : null;
    if (!passive && !["reaction", "free"].includes(type)) return null;
    const found = passive ? [null, passive[1].replace(/^./, (letter) => letter.toUpperCase())] : /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(String(item?.system?.description?.value ?? ""));
    if (!found) return null;
    const trigger = plainOf(found[1]).replace(/([^.])$/, "$1.");
    const kind = passive ? "passive" : type === "reaction" ? "reaction" : "free action";
    const within = Number(/\bwithin (\d+) feet\b/i.exec(trigger)?.[1]) || (/\badjacent\b/i.test(trigger) ? 5 : null);
    // (A fall, the environment module's: "You fall from a height of 15 feet or higher" as it starts, before its damage; "You fall at least 10
    // feet and take no damage from the fall" once it's done; "A creature within 60 feet is falling" by its distance; round 47.)
    const fall = /^You fall\b(?:(?! and take no damage| and land)[^.])*|^You fall at least (\d+) feet and (?:take no damage|land)\b|^An? (?:creature|ally)(?: within (\d+) feet)? (?:is falling|falls)\b/i.exec(trigger);
    if (fall && !passive && !/\bto 0 Hit Points\b/i.test(trigger)) {
        const feet = Number(/\b(?:height of|at least) (\d+) feet\b/i.exec(trigger)?.[1]) || 0;
        if (/^An? (?:creature|ally)/i.test(trigger)) return { event: "creature-falling", trigger, kind, ...(within ? { within } : {}), ...(/^An? ally/i.test(trigger) ? { ally: true } : {}) };
        if (/\band (?:take no damage|land)\b/i.test(trigger)) return { event: "self-fell", trigger, kind, feet, ...(/take no damage/i.test(trigger) ? { noDamage: true } : {}) };
        return { event: "self-falling", trigger, kind, feet };
    }
    // (2026-10-30 Foundry test, Hunter's Defense: "A creature with the animal, beast, elemental, fey, fungus, or plant trait attacks you" —
    // only a creature with one of those traits: by.)
    const traits = /\bcreature with the ((?:[a-z-]+,? (?:or |and )?)*[a-z-]+) traits?\b/i.exec(trigger)?.[1];
    const by = traits ? traits.toLowerCase().split(/,? (?:or |and )?|,/).map((word) => word.trim()).filter(Boolean) : null;
    const read = (event) => ({ event, within, trigger, kind, ...(by ? { by } : {}) });
    // (The character's own Strike: "You critically hit a foe with a melee weapon Strike", "Your Strike critically hits …", "You succeed at a
    // melee Strike", "You miss with a firearm or crossbow Strike": its attack roll's degree; the loop, 2026-10-30.)
    // (Only with the weapons it names, "a firearm or crossbow Strike": weapons, matched to the Strike's roll options; 2026-10-30 Foundry test,
    // Recall Ammunition on a javelin miss.)
    const weapons = [...new Set([...trigger.matchAll(/\b(firearm|crossbow|bow|sword|axe|hammer|flail|polearm|spear|knife|club|brawling|sling|dart|pick|shield|unarmed|ranged|melee|thrown)s?\b/gi)].map((match) => match[1].toLowerCase()))];
    const own = (event) => ({ ...read(event), weapons });
    if (/^(?:You critically (?:hit|succeed (?:at|on) (?:a|an|your)\b[^.]*?\bStrike)|Your\b[^.]*?\bStrike critically hits)\b/i.test(trigger)) return own("own-critical-hit");
    if (/^(?:You hit (?:a|an)\b[^.]*?\bStrike|You succeed at a (?:melee |ranged )?Strike|You successfully Strike|Your\b[^.]*?\bStrike hits)\b/i.test(trigger)) return own("own-hit");
    if (/^You score a critical hit\b/i.test(trigger)) return own("own-critical-hit");
    if (/^(?:You miss with (?:a|an|your)\b[^.]*?\bStrike|You (?:or your [\w ]+? )?(?:roll|gets?) a failure on a Strike)\b|^You misfire\b|^Your attack with a firearm misfires\b/i.test(trigger)) return own("own-miss");
    // (The character's own save: "You succeed or critically succeed at a Reflex saving throw", "You fail (but don't critically fail) a saving
    // throw against …", "You critically succeed on a Fortitude save against a poison effect": the degrees and saves it names; the loop,
    // 2026-10-30. What the save is against is the player's to judge.)
    const save = /^You ((?:(?:critically )?(?:succeed|fail)(?:,? \(?but (?:don't|do not) critically fail\)?,?)?(?:,? or |, | ))+)(?:at |on )?(?:a |an |your )?((?:(?:Fortitude|Reflex|Will)(?: or |, )?)*)\s*sav(?:e|ing throw)s?\b/i.exec(trigger);
    if (save) {
        const words = save[1].toLowerCase();
        const outcomes = [...(/critically succeed/.test(words) ? ["criticalSuccess"] : []), ...(/(?<!critically )succeed/.test(words) ? ["success"] : []), ...(/(?<!critically )fail/.test(words) ? ["failure", ...(/but (?:don't|do not) critically fail/.test(words) ? [] : ["criticalFailure"])] : []), ...(/critically fail(?!\))/.test(words) && !/but (?:don't|do not) critically fail/.test(words) ? ["criticalFailure"] : [])];
        const saves = [...save[2].matchAll(/Fortitude|Reflex|Will/gi)].map((match) => match[0].toLowerCase());
        return { ...read("own-save"), outcomes: [...new Set(outcomes)], saves };
    }
    // (The character's own skill or Perception check, the same way: "You fail, but don't critically fail, a Deception or Performance check
    // …", "You succeed or critically succeed at a Recall Knowledge check …", "You critically fail a skill check …".)
    const check = /^You ((?:(?:critically )?(?:succeed|fail)(?:,? \(?but (?:don't|do not) critically fail\)?,?)?(?:,? or |, | ))+)(?:at |on )?(?:a |an |your )?((?:[A-Z][a-z]+(?: Knowledge)?(?: or |, (?:or )?)?)*)\s*(?:skill )?check\b/.exec(trigger.replace(/^you\b/, "You"));
    if (check && !/\bflat check\b/i.test(trigger)) {
        const words = check[1].toLowerCase();
        const outcomes = [...(/critically succeed/.test(words) ? ["criticalSuccess"] : []), ...(/(?<!critically )succeed/.test(words) ? ["success"] : []), ...(/(?<!critically )fail/.test(words) ? ["failure", ...(/but (?:don't|do not) critically fail/.test(words) ? [] : ["criticalFailure"])] : []), ...(/critically fail(?!\))/.test(words) && !/but (?:don't|do not) critically fail/.test(words) ? ["criticalFailure"] : [])];
        const skills = [...check[2].matchAll(/Recall Knowledge|[A-Z][a-z]+/g)].map((match) => match[0].toLowerCase()).filter((word) => word !== "recall knowledge");
        return { ...read("own-check"), outcomes: [...new Set(outcomes)], skills };
    }
    // ("You fail, but don't critically fail, an attempt to Disable a Device on a trap": that action's check, any skill; "You roll a skill
    // check or saving throw and don't like the result": any degree; round 48.)
    const attempt = /^You ((?:(?:critically )?(?:succeed|fail)(?:,? \(?but (?:don't|do not) critically fail\)?,?)?(?:,? or |, | ))+)(?:at |on )?(?:an|your) attempt to ([A-Z][a-z]+(?: (?:a |an |the )?[A-Z][a-z]+)*)\b/.exec(trigger);
    if (attempt) {
        const words = attempt[1].toLowerCase();
        const outcomes = [...(/critically succeed/.test(words) ? ["criticalSuccess"] : []), ...(/(?<!critically )succeed/.test(words) ? ["success"] : []), ...(/(?<!critically )fail/.test(words) ? ["failure", ...(/but (?:don't|do not) critically fail/.test(words) ? [] : ["criticalFailure"])] : []), ...(/critically fail(?!\))/.test(words) && !/but (?:don't|do not) critically fail/.test(words) ? ["criticalFailure"] : [])];
        return { ...read("own-check"), outcomes: [...new Set(outcomes)], skills: [], action: attempt[2].toLowerCase().replace(/\s+(?:a|an|the)\s+/g, " ").replace(/\s+/g, "-") };
    }
    if (/^You roll a skill check(?: or saving throw)? and don't like the result\b/i.test(trigger)) return { ...read("own-check"), outcomes: ["criticalSuccess", "success", "failure", "criticalFailure"], skills: [], ...(/saving throw/i.test(trigger) ? { alsoSaves: true } : {}) };
    // (Another creature's roll result: "A creature within 30 feet critically fails an attack roll, skill check, or saving throw", "An ally
    // within 30 feet of you critically succeeds at an attack roll or skill check", "An enemy critically succeeds at an attack roll or saving
    // throw", "You or an ally within 30 feet fails an attack roll or skill check", "An ally misses … with their attack": others-roll, by who
    // rolled, its degrees and kinds of roll; the loop, 2026-10-30.)
    // ("A creature within 30 feet you can see would succeed at a save": Black Cat Curse's, read as "succeeds"; round 37.)
    // ("Would succeed" counts a critical success too; round 37.)
    const othersTrigger = trigger.replace(/\bwould succeed\b/gi, "succeeds or critically succeeds").replace(/\bwould (critically )?(succeed|fail)\b/gi, (_whole, critically = "", verb) => `${critically ?? ""}${verb}s`);
    const others = /^(You or an ally|An? (?:adjacent )?(?:ally|enemy|foe|creature(?: other than you)?))\b[^.]*?\b((?:(?:critically )?(?:succeeds|fails|misses)(?:,? \(?but (?:doesn't|does not) critically fail\)?,?)?(?:,? or |, | ))+)(?:at |on |with )?(?:a |an |their |its )?((?:(?:attack rolls?|Strikes?|spell attack rolls?|skill checks?|saving throws?|saves?|attack)(?:,? or |, )?)+)/i.exec(othersTrigger);
    if (others && !/\bagainst (?:you|your)\b|\b(?:Strike|attack) you\b/i.test(trigger)) {
        const words = others[2].toLowerCase();
        const outcomes = [...(/critically succeeds/.test(words) ? ["criticalSuccess"] : []), ...(/(?<!critically )succeeds/.test(words) ? ["success"] : []), ...(/(?<!critically )(?:fails|misses)/.test(words) ? ["failure", ...(/but (?:doesn't|does not) critically fail/.test(words) ? [] : ["criticalFailure"])] : []), ...(/critically (?:fails|misses)/.test(words) ? ["criticalFailure"] : [])];
        const kinds = others[3].toLowerCase();
        const rolls = [...(/attack|strike/.test(kinds) ? ["attack-roll", "spell-attack-roll"] : []), ...(/skill/.test(kinds) ? ["skill-check"] : []), ...(/sav/.test(kinds) ? ["saving-throw"] : [])];
        const head = others[1].toLowerCase();
        const who = head.startsWith("you or") ? "self-or-ally" : /ally/.test(head) ? "ally" : /enemy|foe/.test(head) ? "enemy" : "creature";
        return { ...read("others-roll"), who, outcomes: [...new Set(outcomes)], rolls };
    }
    // (A foe dropped by the character or an ally: "You reduce an enemy to 0 Hit Points", "Your melee Strike reduces a creature to 0 Hit
    // Points", "An ally within 30 feet brings an enemy to 0 Hit Points": whoever's turn it is when a foe falls to 0; the loop, 2026-10-30.)
    if (/^(?:You reduce|Your\b[^.]*?\b(?:Strike|attack) reduces)\b[^.]*?\bto 0 (?:Hit Points|HP)\b/i.test(trigger)) return read("own-kill");
    if (/^An? (?:adjacent )?ally\b[^.]*?\b(?:brings|reduces) (?:an enemy|a foe|a creature)\b[^.]*?\bto 0 (?:Hit Points|HP)\b/i.test(trigger)) return read("ally-kill");
    // (A save's effect, "targeted by a spell … that allows a saving throw": no attack roll to watch.)
    if (/\b(?:requires|allows) a (?:save|saving throw)\b/i.test(trigger)) return null;
    // ("A creature Casts a Spell", "An enemy casts a spell that targets you …", "Another creature within 30 feet Casts a Spell": a spell another
    // creature casts, the Counterspells' trigger.)
    if (/^(?:A|An|Another|Your) (?:creature|enemy|foe|opponent)\b[^.]*?\b[Cc]asts? a [Ss]pell\b/.test(trigger)) return read("foe-casts");
    // ("An ally within 30 feet Casts a Spell", "An ally Casts a Spell and you are within that spell's range": Accompany's, Spell Relay's;
    // round 37.)
    if (/^An? (?:adjacent )?ally\b[^.]*?\b[Cc]asts? a [Ss]pell\b/.test(trigger)) return read("ally-casts");
    // (A foe near the character moving or using a manipulate, concentrate or move action: "A creature within your reach leaves a square during
    // a move action it's using", "A creature within 10 feet of you uses a manipulate action or a move action", "A creature moves to be within
    // 15 feet of you", "A creature within your reach uses a concentrate action" — Reactive Strike's kind. Reach counted as 10 feet.)
    const near = /^(?:A|An|Another) (?:(?:Tiny|Small|Medium|Large|Huge|Gargantuan)(?: or (?:larger|smaller))? )?(?:creature|enemy|foe|opponent)\b/i.test(trigger) && (within || /\bwithin your reach\b|\badjacent to you\b|\bwithin \d+ feet of you\b/i.test(trigger));
    if (near && !/\ball(?:y|ies)\b/i.test(trigger)) {
        const reach = within ?? 10;
        const traits = [...trigger.matchAll(/\b(manipulate|concentrate|move|auditory|visual) action\b/gi)].map((match) => match[1].toLowerCase());
        const moves = /\bleaves a square\b|\bmoves\b|\bmove action\b|\bends its movement\b/i.test(trigger);
        if (traits.length || moves) return { ...read("foe-acts"), within: reach, traits: [...new Set(traits)], moves };
    }
    // ("A creature within your reach critically fails a Strike against you": Dueling Riposte's.)
    if (/\bcritically (?:fails|misses) (?:a|an|its|their) (?:melee )?(?:Strike|attack(?: roll)?)\b[^.]*\bagainst (?:you|your AC)\b/i.test(trigger)) return read("critical-miss");
    // (A creature or ally gaining a condition or falling to 0 Hit Points: "An ally within 30 feet gains the Frightened condition", "An ally
    // within 30 feet would be reduced to 0 HP but not immediately killed", "A creature within 60 feet gains the Frightened condition".)
    // ("You lose the Dying condition": Bounce Back's; "Whenever an enemy starts its turn adjacent to you": Bonekeeper's Bane's; round 38.)
    const lost = /^You lose the ([A-Za-z-]+) condition\b/i.exec(trigger)?.[1]?.toLowerCase();
    if (lost && CONDITION_WORDS.includes(lost)) return { ...read("self-condition-lost"), conditions: [lost] };
    if (/^An? (?:enemy|foe|creature|opponent)\b[^.]*?\b(?:starts|begins) (?:its|their) turn (?:adjacent to you|within (?:your reach|\d+ feet of you))/i.test(trigger)) return { ...read("foe-turn-start"), within: within ?? (/\breach\b/i.test(trigger) ? 10 : 5) };
    const conditions = conditionsOf(trigger);
    if (conditions) {
        // ("An attack or effect would reduce you to 0 Hit Points", "You witness an ally being reduced to 0 Hit Points", "You Drop Prone or
        // otherwise become Prone"; round 37.)
        const who = /^(?:An?|Another|Your|One of your) (?:adjacent )?all(?:y|ies)\b|^You witness an ally\b/i.test(trigger) ? "ally-condition"
            : /^(?:A|An)\b[^.]*\bwould reduce you to 0 (?:Hit Points|HP)\b|^You\b[^.]*\bbecome (?:the )?[A-Za-z-]+(?: condition)?\.$/i.test(trigger) ? "self-condition" : /^(?:A|An|Another) (?:[\w-]+ ){0,3}?(?:creature|enemy|foe)\b/i.test(trigger) ? "creature-condition" : /^You(?:'re| are)? (?:would )?(?:gain|become|are reduced|reduced|fall|would be reduced)\b|^You are [A-Z][a-z-]+ \d+ or greater and your\b/i.test(trigger) ? "self-condition" : null;
        // (Its kind, "an undead creature", "a Small or Medium enemy" not: a creature trait; round 48 test.)
        const kindWord = /^(?:A|An|Another) ([a-z]+) (?:creature|enemy|foe)\b/i.exec(trigger)?.[1]?.toLowerCase();
        const traits = kindWord && CREATURE_TRAITS.includes(kindWord) ? [kindWord] : [];
        if (who) return { ...read(who), conditions, ...(traits.length ? { traits } : {}) };
    }
    const ally = /\b(?:an|your|one of your|a) (?:adjacent |linked |designated )?all(?:y|ies)\b|\bally you can see\b/i.test(trigger);
    // (An ally near the character moving: "An ally ends a move action adjacent to you", "An ally within your reach uses a move action or
    // leaves a square …", "An adjacent ally moves", "A willing ally enters a space within your lash's reach using a move action": Goblin
    // Scuttle's, Shadow Tempo's; the loop, 2026-10-30. Reach counted as 10 feet.)
    if (/^(?:An?|Another) (?:adjacent |willing )?ally\b/i.test(trigger) && /\bmove action\b|\bmoves\b|\bleaves a square\b|\bends (?:its|their) movement\b/i.test(trigger)) {
        return { ...read("ally-moves"), within: within ?? (/\breach\b/i.test(trigger) ? 10 : 5) };
    }
    if (ally) {
        if (/\b(?:is|are) (?:critically )?hit\b|\bhits (?:an|your|the) ally\b/i.test(trigger)) return read("ally-hit");
        if (/\b(?:takes?|would take) damage\b|\bis damaged\b|\bwould damage\b|\bdamages (?:an|your|the) ally\b/i.test(trigger)) return read("ally-damaged");
        if (/\b(?:is|are) targeted\b|\btargets (?:an|your|the|one of your) all/i.test(trigger)) return read("ally-targeted");
        return null;
    }
    if (/\bcritically hits you\b|^You are critically hit\b|^You (?:are struck by|would take|take) a critical hit\b|^A critical hit deals [^.]*\bdamage to you\b|\bcritically succeeds (?:on|at) (?:a|an) (?:melee |ranged )?(?:Strike|attack(?: roll)?) against you\b|\bStrike against you is a critical hit\b/i.test(trigger)) return read("critical-hit");
    // ("A creature missed you with a melee attack", "A creature misses you with a ranged attack", "An adjacent creature you can see fails an
    // attack roll against you": Elude Trouble's, Coursing Weave's; the loop, 2026-10-30.)
    if (/\bmiss(?:es|ed)? you\b|\bfails an attack roll against you\b/i.test(trigger)) return read("miss");
    // ("Hits, but does not critically hit you": not on a critical hit, notCritical; round 37.)
    if (/\bhits, but (?:does not|doesn't) critically hit you\b|\bhits you\b[^.]*\bbut (?:does not|doesn't) critically\b/i.test(trigger)) return { ...read("hit"), notCritical: true };
    if (/\bhits you\b|^You(?:'re| are| would be) hit\b/i.test(trigger)) return read("hit");
    if (/\btargets you\b|^You are (?:the )?target(?:ed)? (?:of|by)\b|\battempts? (?:a (?:melee |ranged )?Strike|an attack(?: roll)?) against you\b|\battacks you\b|\bmakes an attack(?: roll)? against you\b|^You(?:'re| are) targeted (?:with|by) (?:a|an) (?:melee |ranged |physical )*(?:Strike|attack)\b|^You(?:'re| are) the target of (?:a|an) (?:melee |ranged |physical )*(?:Strike|attack)\b|^You or an? (?:adjacent )?(?:willing )?ally\b[^.]*\b(?:is|are) the target of (?:a|an) (?:melee |ranged |physical )*(?:Strike|attack)\b/i.test(trigger)) return read("targeted");
    if (/(?:^|,\s*)You (?:or your [\w ]+? )?(?:would )?take (?:(?:[a-z]+(?:,| or| and)?|or|and) )*?damage\b|^You(?:'re| are) dealt\b[^.]*\bdamage\b|\bwould deal damage to you\b|\bdamages you\b|\bdamaged you\b|\bdeals damage to you\b/i.test(trigger) && !/\bfall(?:ing)? damage\b/i.test(trigger)) return read("damaged");
    return null;
}

const CREATURE_TRAITS = ["aberration", "animal", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "fungus", "giant", "humanoid", "monitor", "ooze", "plant", "spirit", "undead", "demon", "devil", "incorporeal", "living"];
const CONDITION_WORDS = ["blinded", "clumsy", "confused", "controlled", "dazzled", "deafened", "doomed", "drained", "dying", "enfeebled", "fascinated", "fatigued", "fleeing", "frightened", "grabbed", "immobilized", "off-guard", "paralyzed", "petrified", "prone", "restrained", "sickened", "slowed", "stunned", "stupefied", "unconscious", "wounded", "hidden", "concealed", "undetected", "invisible", "quickened", "encumbered"];
// "gains the Frightened condition", "would become Frightened, Drained, …", "becomes frightened or stupefied", "falls to 0 Hit Points" → the
// conditions (with "0-hp" for the last), or null.
function conditionsOf(trigger) {
    if (/\b(?:falls to|is reduced to|are reduced to|'re reduced to|would be reduced to|being reduced to|would reduce you to|brings? [^.]*? to|drops to) (?:0|zero) (?:Hit Points|HP)\b|\bdies\b/i.test(trigger) && !/\bbrings an enemy\b/i.test(trigger)) return ["0-hp"];
    // ("You are Doomed 1 or greater and your doomed value would increase": Know Thy Doom's; round 48.)
    const raised = /\byour ([A-Za-z-]+) (?:condition )?value would increase\b/i.exec(trigger)?.[1]?.toLowerCase();
    if (raised && CONDITION_WORDS.includes(raised)) return [raised];
    const match = /\b(?:gains?|would gain|becomes?|would become)(?: the)? ((?:[A-Za-z-]+(?:,? (?:or|and) |, ))*[A-Za-z-]+)(?: condition)?\b/i.exec(trigger);
    if (!match) return null;
    const words = match[1].toLowerCase().split(/,? (?:or|and) |, /).map((word) => word.trim());
    const found = words.filter((word) => CONDITION_WORDS.includes(word));
    return found.length && found.length === words.length ? found : null;
}

// What PF2e's roll message means for a character it's aimed at: an attack roll → targeted, and hit / critical-hit by its degree; a
// damage roll → damaged.
export function eventsOf(contextType, outcome) {
    if (["attack-roll", "spell-attack-roll"].includes(contextType)) {
        return ["targeted", ...(["success", "criticalSuccess"].includes(outcome) ? ["hit"] : []), ...(outcome === "criticalSuccess" ? ["critical-hit"] : []), ...(["failure", "criticalFailure"].includes(outcome) ? ["miss"] : []), ...(outcome === "criticalFailure" ? ["critical-miss"] : [])];
    }
    if (contextType === "damage-roll") return ["damaged"];
    return [];
}

// What a character's own Strike's attack roll means for its own feats: own-hit, own-critical-hit or own-miss by its degree.
export function ownStrikeEvents(contextType, outcome) {
    if (contextType !== "attack-roll") return [];
    return [...(["success", "criticalSuccess"].includes(outcome) ? ["own-hit"] : []), ...(outcome === "criticalSuccess" ? ["own-critical-hit"] : []), ...(["failure", "criticalFailure"].includes(outcome) ? ["own-miss"] : [])];
}

// Whether a Strike's roll options fit the weapons a trigger names ("firearm", "crossbow", "melee", "unarmed"); none named fits any.
export function weaponFits(weapons, options = []) {
    if (!weapons?.length) return true;
    const has = (option) => options.includes(option);
    return weapons.some((weapon) => (weapon === "ranged" ? has("item:ranged") : weapon === "melee" ? has("item:melee") : weapon === "unarmed" ? has("item:category:unarmed") : weapon === "thrown" ? has("item:trait:thrown") || options.some((option) => option.startsWith("item:thrown")) : has(`item:group:${weapon}`)));
}

// A reaction or free action triggered by the character's own action or spell (slice 8): "You use Orc Ferocity.", "You Shield Block a melee
// Strike …", "You enter Tenacious Stance.", "You Cast a Spell using a spell slot.", "You cast summon undead." → { names: the action's or
// spell's names (lower case), spell: any spell counts, trigger, kind }, or null. Matched against the item of the character's own chat
// message when it uses one.
export function ownUseTrigger(given) {
    const item = ownWords(given);
    const type = item?.system?.actionType?.value;
    // (A passive feat that changes an action or spell when it's used, "When you use Fervor, …", "Whenever you Cast or Sustain a hex, …":
    // its "When" clause; not a basic move or Interact, which would remind at every step; the loop, 2026-10-30.)
    const passive = type === "passive" ? /(?:^|[.!?]\s+)When(?:ever)? (you\b[^,.]*),/i.exec(plainOf(item?.system?.description?.value ?? "")) : null;
    if (passive && /^you (?:Stride|Step|Leap|Interact|use the Interact)\b/i.test(passive[1])) return null;
    if (!passive && !["reaction", "free"].includes(type)) return null;
    const found = passive ? [null, passive[1].replace(/^./, (letter) => letter.toUpperCase())] : /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(String(item?.system?.description?.value ?? ""));
    if (!found) return null;
    const trigger = plainOf(found[1]).replace(/([^.])$/, "$1.");
    const kind = passive ? "passive" : type === "reaction" ? "reaction" : "free action";
    let match;
    // ("You cast an illusion spell", "a spell with the darkness trait", "a Harm or Heal spell": the traits or names it needs, if any.)
    if ((match = /^You (?:Cast|cast) (?:a|an) ((?:[\w-]+ )*?)(?:[Ss]pell|cantrip)s?\b/.exec(trigger))) {
        const words = match[1].trim().split(/\s+/).filter((word) => word && !["or", "and", "non-cantrip"].includes(word.toLowerCase()));
        const names = words.filter((word) => /^[A-Z]/.test(word)).map((word) => word.toLowerCase());
        const traits = [...words.filter((word) => /^[a-z]/.test(word)), ...[...trigger.matchAll(/\bwith the ([a-z-]+) trait\b/g)].map((each) => each[1])];
        return { names, spell: true, spellTraits: traits, trigger, kind };
    }
    if ((match = /^You (?:use|used) (?:the |your )?([A-Z][\w'’-]*(?: (?:[A-Z][\w'’-]*|of|the|a|for))*)/.exec(trigger))) return { names: [match[1].replace(/ (?:of|the|a|for)$/, "").toLowerCase()], spell: false, trigger, kind };
    if ((match = /^You (?:Cast|cast) ([a-z][\w'’ -]+?)(?=[.,]| and | to | on | with | using |$)/.exec(trigger)) && !/^(?:a|an|the|your)\b/.test(match[1])) return { names: [match[1].toLowerCase()], spell: false, trigger, kind };
    if ((match = /^You enter ((?:[A-Z][\w'’-]*\s?)+Stance)\b/.exec(trigger))) return { names: [match[1].trim().toLowerCase()], spell: false, trigger, kind };
    if ((match = /^You (Shield Block|Raise a Shield|Leap|Stride|Step|Sustain a Spell|Interact)\b/.exec(trigger))) return { names: [match[1].toLowerCase()], spell: false, trigger, kind };
    // ("Whenever you Refocus", "When you Rage", "When you Change Shape", "When you Hunt Prey": a class action named as a verb; the loop.)
    if ((match = /^You (Refocus|Rage|Change Shape|Hunt Prey|Devise a Stratagem|Overdrive|Spellstrike|Demoralize|Feint|Recall Knowledge|Seek|Treat Wounds|Battle Medicine|Administer First Aid|Exploit Vulnerability|Exploit a Vulnerability)\b/i.exec(trigger))) return { names: [match[1].toLowerCase().replace("exploit a vulnerability", "exploit vulnerability")], spell: false, trigger, kind };
    // ("When you Cleave", "Whenever you Emblazon an Armament", "you Treat a Disease or a Poison": an action named as words, its item's name.)
    const NAMED = [[/^You Cleave\b/, ["cleave"]], [/^You Spit Ambient Magic\b/, ["spit ambient magic"]], [/^You Emblazon an Armament\b/, ["emblazon armament"]],
        [/^You Prepare Elemental Medicine\b/, ["prepare elemental medicine"]], [/^You Treat a Disease or a Poison\b/, ["treat disease", "treat poison"]], [/^You Raise (?:your|the) Horde\b/, ["raise the horde"]]];
    for (const [pattern, names] of NAMED) if (pattern.test(trigger)) return { names, spell: false, trigger, kind };
    // ("You cast Harm or Heal", "you cast Force Fang": the spells by name, capitalized as the text has them.)
    if ((match = /^You (?:Cast|cast) ((?:[A-Z][\w'’-]*)(?: (?:[A-Z][\w'’-]*|of|the))*(?: or (?:[A-Z][\w'’-]*)(?: (?:[A-Z][\w'’-]*|of|the))*)*)/.exec(trigger)) && !/^(?:A|An|The|Your|Spell)\b/.test(match[1])) {
        return { names: match[1].split(/ or /).map((name) => name.trim().toLowerCase()), spell: false, trigger, kind };
    }
    return null;
}

// Whether the character's own message (its item's name and type) is what the trigger names.
export function usesTrigger(read, itemName, itemType, itemTraits = []) {
    if (!read) return false;
    const name = String(itemName ?? "").toLowerCase().replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (read.spell) return itemType === "spell" && (!read.names.length || read.names.includes(name)) && (!read.spellTraits?.length || read.spellTraits.some((trait) => itemTraits.includes(trait)));
    return read.names.some((each) => name === each || name.startsWith(`${each} `));
}

// A reaction or free action triggered before one of the character's own rolls (slice 9): "You attempt a saving throw against a magical
// effect, but you haven't rolled yet.", "You're about to roll initiative.", "You have the dying condition and are about to attempt a recovery
// check." A note on the roll's card comes too late, so the module reminds before: when a hostile spell or ability with a save is posted
// with the character targeted, when the character joins an encounter without initiative, and when its turn begins while it's dying.
export function preRollTrigger(given) {
    const item = ownWords(given);
    const type = item?.system?.actionType?.value;
    // (A passive feat that acts as initiative is rolled, Battle Cry's "When you roll initiative, you can yell a mighty battle cry and
    // Demoralize an observed foe as a free action": reminded as the character joins the encounter; 2026-10-30 Foundry test.)
    if (type === "passive") {
        const sentence = /(?:^|[.>]\s*)(When you roll (?:for )?initiative\b[^.<]*[.]?)/i.exec(String(item?.system?.description?.value ?? "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1"));
        return sentence ? { event: "pre-initiative", trigger: plainOf(sentence[1]), kind: "as you roll initiative" } : null;
    }
    if (!["reaction", "free"].includes(type)) return null;
    const found = /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(String(item?.system?.description?.value ?? ""));
    if (!found) return null;
    const trigger = plainOf(found[1]).replace(/([^.])$/, "$1.");
    const kind = type === "reaction" ? "reaction" : "free action";
    // ("You roll initiative", "You roll for initiative, and you are observing …": asked as the character joins the encounter; the loop,
    // 2026-10-30.)
    // ("You and your mystic duo roll initiative in the same encounter", "When a fight begins": Esoteric Coordination's, Primary Threat's; round 38.)
    if (/^You (?:and [^.]+? )?roll (?:for )?initiative\b|^When a fight begins\b|^(?:A|The) fight begins\b/i.test(trigger)) return { event: "pre-initiative", trigger, kind };
    // (Another's roll about to be made, "An enemy is about to use an action that requires a skill check or attack roll", "A creature within
    // 60 feet is about to attempt an attack roll or skill check": asked of the roller, before its dice; round 46. Not Aid, which needs your
    // preparing to first.)
    // ("You are attacked by a foe, but they haven't rolled yet": a foe's attack roll against you; round 48.)
    if (/^You are attacked by (?:a|an) (?:foe|enemy|creature)\b[^.]*\bhaven['’]t (?:yet )?rolled\b/i.test(trigger)) return { event: "pre-check-other", who: /creature/i.test(trigger) ? "creature" : "enemy", checks: ["attack"], againstYou: true, trigger, kind };
    const other = othersRoll(trigger, item);
    if (other) return { ...other, trigger, kind };
    if (!/^You(?:'re| are| would| attempt| have)\b/i.test(trigger) && !/^You and\b/i.test(trigger)) return null;
    // ("You attempt a basic Reflex save", "You attempt a saving throw against a disease or poison effect that affects an area": Feline Dance's,
    // Absorb Toxin's, used as the save is rolled; round 37.)
    const before = /\babout to (?:roll|attempt|make)\b|\bwould (?:roll|attempt)\b|\bhaven['’]t (?:yet )?rolled\b|^You attempt an? (?:basic )?(?:(?:Fortitude|Reflex|Will) )?(?:save|saving throw)\b/i.test(trigger);
    if (!before) return null;
    if (/\binitiative\b/i.test(trigger)) return { event: "pre-initiative", trigger, kind };
    if (/\brecovery check\b/i.test(trigger)) return { event: "pre-recovery", trigger, kind };
    // ("You are about to make an attack roll, skill check, or saving throw": any of them, a pre-check; round 48.)
    if (/\b(?:saving throws?|saves?)\b/i.test(trigger) && /\battack rolls?\b|\bskill checks?\b/i.test(trigger)) return { event: "pre-check", check: "any", trigger, kind };
    if (/\b(?:saving throws?|saves?)\b/i.test(trigger)) {
        // (Only the save it names, and only a basic one when it says so: Feline Dance's "a basic Reflex save"; round 37.)
        const save = /\b(Fortitude|Reflex|Will)\b/i.exec(trigger)?.[1]?.toLowerCase() ?? null;
        return { event: "pre-save", trigger, kind, ...(save ? { save } : {}), ...(/\bbasic\b/i.test(trigger) ? { basic: true } : {}) };
    }
    // (Your own Strike or check, "You attempt a melee Strike against your opponent, but haven't rolled yet", "You are about to attempt a
    // check": asked as the roll starts, before its dice; round 45.)
    // (Not one that hangs on a fortune or misfortune effect: no roll says it has one before it's rolled.)
    if (/\b(?:mis)?fortune\b/i.test(trigger)) return null;
    if (/\bflat check\b/i.test(trigger)) return { event: "pre-check", check: "flat", trigger, kind };
    const action = /\bRecall Knowledge\b/i.test(trigger) ? { action: "recall-knowledge" } : {};
    if (/\b(?:Strike|attack roll)s?\b/i.test(trigger)) return { event: "pre-check", check: "attack", ...(/\bmelee\b/i.test(trigger) ? { melee: true } : /\branged\b/i.test(trigger) ? { ranged: true } : {}), trigger, kind };
    const skill = /\b(Acrobatics|Arcana|Athletics|Crafting|Deception|Diplomacy|Intimidation|Medicine|Nature|Occultism|Performance|Religion|Society|Stealth|Survival|Thievery|Perception)\b/i.exec(trigger)?.[1]?.toLowerCase();
    if (skill) return { event: "pre-check", check: skill, ...action, trigger, kind };
    if (/\b(?:skill )?checks?\b|\broll\b/i.test(trigger)) return { event: "pre-check", check: /\bskill check\b/i.test(trigger) || action.action ? "skill" : "any", ...action, trigger, kind };
    return null;
}

function othersRoll(trigger, item) {
    if ((item?.system?.slug ?? "") === "aid" || /^Aid$/i.test(item?.name ?? "")) return null;
    const match = /^(An ally|Your ally|An enemy|A foe|A creature|Any creature)\b([^.;]*?)\b(?:is about to|would|attempts? .* but hasn['’]t (?:yet )?rolled)\s+([^.;]*)/i.exec(trigger);
    if (!match) return null;
    const what = match[3];
    // (After the roll, "would succeed at a save": not before it.)
    if (/^(?:succeed|fail|critically|be |take |deal )/i.test(what) || /\bor you would\b/i.test(trigger)) return null;
    const checks = [];
    if (/\battack rolls?\b|\bStrikes?\b/i.test(what)) checks.push("attack");
    if (/\bskill checks?\b|\bcheck to (?:Escape|[A-Z])/i.test(what)) checks.push("skill");
    if (/\bsaving throws?\b|\bsaves?\b/i.test(what)) checks.push("save");
    if (!checks.length) return null;
    const who = /ally/i.test(match[1]) ? "ally" : /enemy|foe/i.test(match[1]) ? "enemy" : "creature";
    const within = /\bwithin (\d+) feet\b/i.exec(match[2])?.[1] ?? (/\bwithin your reach\b/i.test(match[2]) ? "5" : null);
    return { event: "pre-check-other", who, checks, ...(within ? { within: Number(within) } : {}), ...(/\bagainst you\b/i.test(what) ? { againstYou: true } : {}), ...(/\bEscape\b/.test(what) ? { action: "escape" } : {}), ...(/\branged\b/i.test(what) ? { ranged: true } : {}) };
}

// Whether another's pre-check read fits a roll about to happen: its kind of check, and (the scripts check who and how far).
export function fitsOthersCheck(read, roll) {
    if (read?.event !== "pre-check-other" || !roll) return false;
    if (read.action && !(roll.options ?? []).includes(`action:${read.action}`)) return false;
    const kind = roll.type === "attack-roll" ? "attack" : roll.type === "skill-check" ? "skill" : roll.type === "saving-throw" ? "save" : null;
    return Boolean(kind) && read.checks.includes(kind) && (!read.ranged || roll.ranged === true);
}

const SKILLS = new Set(["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"]);
// Whether a pre-check read fits a roll about to happen: { type: PF2e's check type ("attack-roll", "skill-check", "perception-check",
// "flat-check", "saving-throw", "initiative"), statistic slug, melee, ranged }.
export function fitsCheck(read, roll) {
    if (read?.event !== "pre-check" || !roll) return false;
    const { type, statistic } = roll;
    if (read.action && !(roll.options ?? []).includes(`action:${read.action}`)) return false;
    if (read.check === "flat") return type === "flat-check";
    if (read.check === "attack") return type === "attack-roll" && (!read.melee || roll.melee === true) && (!read.ranged || roll.ranged === true);
    if (read.check === "skill") return type === "skill-check";
    if (read.check === "any") return ["attack-roll", "skill-check", "perception-check", "saving-throw"].includes(type);
    if (read.check === "perception") return type === "perception-check" || statistic === "perception";
    return SKILLS.has(read.check) && statistic === read.check;
}

// Whether a posted message's text asks for a save: PF2e's inline save links.
export const asksForSave = (content) => /data-pf2-check="(?:fortitude|reflex|will)"/.test(String(content ?? ""));

// The saves a posted message's inline links ask for: [{ save, basic }]. PF2e 8.6 marks a basic save only by its label's text ("Basic
// Reflex", localised) and the damaging-effect roll option it adds; not the link's flavor or label attributes (round 37b).
export function savesAsked(content, basicWord = "basic") {
    const word = new RegExp(`\\b${String(basicWord).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return [...String(content ?? "").matchAll(/<a\b([^>]*data-pf2-check="(fortitude|reflex|will)"[^>]*)>([\s\S]*?)<\/a>/g)].map((match) => {
        const options = /data-pf2-roll-options="([^"]*)"/.exec(match[1])?.[1] ?? "";
        const label = /<span class="label">([\s\S]*?)<\/span>\s*(?:<i|$)/.exec(match[3])?.[1] ?? match[3];
        const text = label.replace(/<[^>]+>/g, " ");
        return { save: match[2], basic: /(?:^|,)\s*damaging-effect\s*(?:,|$)/.test(options) || word.test(text) || /\bbasic\b/i.test(text) };
    });
}

// Whether a pre-save read fits the saves asked: any save when it names none; its save, and a basic one when it says basic.
export const fitsSave = (read, asked) => !read.save || asked.some((each) => each.save === read.save && (!read.basic || each.basic));

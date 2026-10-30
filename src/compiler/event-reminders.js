// A reaction or free action triggered by what others do to the character or an ally nearby (2026-10-30, docs/feats.md, slice 7): "A
// creature hits you with a melee Strike.", "You are targeted by an attack.", "While you have your shield raised, you would take damage
// from a physical attack.", "An ally within 30 feet is hit by an attack." The character's players can't watch every roll for these, so
// when PF2e posts the attack or the damage aimed at the character (or an ally in range), the module whispers them the feats they may use
// (scripts/reminders.js). Nothing is used for them; the player decides, and the trigger's other words are theirs to judge.

const plainOf = (html) => String(html ?? "").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// → { event: "critical-hit" | "hit" | "targeted" | "damaged" | "ally-hit" | "ally-targeted" | "ally-damaged" | "foe-casts", within, trigger,
// kind }, or null.
export function eventTrigger(item) {
    const type = item?.system?.actionType?.value;
    if (!["reaction", "free"].includes(type)) return null;
    const found = /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(String(item?.system?.description?.value ?? ""));
    if (!found) return null;
    const trigger = plainOf(found[1]).replace(/([^.])$/, "$1.");
    const kind = type === "reaction" ? "reaction" : "free action";
    const within = Number(/\bwithin (\d+) feet\b/i.exec(trigger)?.[1]) || (/\badjacent\b/i.test(trigger) ? 5 : null);
    // (2026-10-30 Foundry test, Hunter's Defense: "A creature with the animal, beast, elemental, fey, fungus, or plant trait attacks you" —
    // only a creature with one of those traits: by.)
    const traits = /\bcreature with the ((?:[a-z-]+,? (?:or |and )?)*[a-z-]+) traits?\b/i.exec(trigger)?.[1];
    const by = traits ? traits.toLowerCase().split(/,? (?:or |and )?|,/).map((word) => word.trim()).filter(Boolean) : null;
    const read = (event) => ({ event, within, trigger, kind, ...(by ? { by } : {}) });
    // (The character's own Strike: "You critically hit a foe with a melee weapon Strike", "Your Strike critically hits …", "You succeed at a
    // melee Strike", "You miss with a firearm or crossbow Strike": its attack roll's degree; the loop, 2026-10-30.)
    if (/^(?:You critically (?:hit|succeed (?:at|on) (?:a|an|your)\b[^.]*?\bStrike)|Your\b[^.]*?\bStrike critically hits)\b/i.test(trigger)) return read("own-critical-hit");
    if (/^(?:You hit (?:a|an)\b[^.]*?\bStrike|You succeed at a (?:melee |ranged )?Strike|Your\b[^.]*?\bStrike hits)\b/i.test(trigger)) return read("own-hit");
    if (/^(?:You miss with (?:a|an|your)\b[^.]*?\bStrike|You (?:or your [\w ]+? )?(?:roll|gets?) a failure on a Strike)\b|^You misfire\b/i.test(trigger)) return read("own-miss");
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
    // (A foe dropped by the character or an ally: "You reduce an enemy to 0 Hit Points", "Your melee Strike reduces a creature to 0 Hit
    // Points", "An ally within 30 feet brings an enemy to 0 Hit Points": whoever's turn it is when a foe falls to 0; the loop, 2026-10-30.)
    if (/^(?:You reduce|Your\b[^.]*?\b(?:Strike|attack) reduces)\b[^.]*?\bto 0 (?:Hit Points|HP)\b/i.test(trigger)) return read("own-kill");
    if (/^An? (?:adjacent )?ally\b[^.]*?\b(?:brings|reduces) (?:an enemy|a foe|a creature)\b[^.]*?\bto 0 (?:Hit Points|HP)\b/i.test(trigger)) return read("ally-kill");
    // (A save's effect, "targeted by a spell … that allows a saving throw": no attack roll to watch.)
    if (/\b(?:requires|allows) a (?:save|saving throw)\b/i.test(trigger)) return null;
    // ("A creature Casts a Spell", "An enemy casts a spell that targets you …", "Another creature within 30 feet Casts a Spell": a spell another
    // creature casts, the Counterspells' trigger.)
    if (/^(?:A|An|Another|Your) (?:creature|enemy|foe|opponent)\b[^.]*?\b[Cc]asts? a [Ss]pell\b/.test(trigger)) return read("foe-casts");
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
    if (/\bcritically fails (?:a|an|its|their) (?:melee )?(?:Strike|attack(?: roll)?)\b[^.]*\bagainst you\b/i.test(trigger)) return read("critical-miss");
    // (A creature or ally gaining a condition or falling to 0 Hit Points: "An ally within 30 feet gains the Frightened condition", "An ally
    // within 30 feet would be reduced to 0 HP but not immediately killed", "A creature within 60 feet gains the Frightened condition".)
    const conditions = conditionsOf(trigger);
    if (conditions) {
        const who = /^(?:An?|Another|Your|One of your) (?:adjacent )?all(?:y|ies)\b/i.test(trigger) ? "ally-condition" : /^(?:A|Another) creature\b/i.test(trigger) ? "creature-condition" : /^You(?:'re| are)? (?:would )?(?:gain|become|are reduced|reduced|fall|would be reduced)\b/i.test(trigger) ? "self-condition" : null;
        if (who) return { ...read(who), conditions };
    }
    const ally = /\b(?:an|your|one of your|a) (?:adjacent )?all(?:y|ies)\b|\bally you can see\b/i.test(trigger);
    // (An ally near the character moving: "An ally ends a move action adjacent to you", "An ally within your reach uses a move action or
    // leaves a square …", "An adjacent ally moves", "A willing ally enters a space within your lash's reach using a move action": Goblin
    // Scuttle's, Shadow Tempo's; the loop, 2026-10-30. Reach counted as 10 feet.)
    if (/^(?:An?|Another) (?:adjacent |willing )?ally\b/i.test(trigger) && /\bmove action\b|\bmoves\b|\bleaves a square\b|\bends (?:its|their) movement\b/i.test(trigger)) {
        return { ...read("ally-moves"), within: within ?? (/\breach\b/i.test(trigger) ? 10 : 5) };
    }
    if (ally) {
        if (/\b(?:is|are) (?:critically )?hit\b|\bhits (?:an|your|the) ally\b/i.test(trigger)) return read("ally-hit");
        if (/\b(?:takes?|would take) damage\b|\bis damaged\b|\bdamages (?:an|your|the) ally\b/i.test(trigger)) return read("ally-damaged");
        if (/\b(?:is|are) targeted\b|\btargets (?:an|your|the|one of your) all/i.test(trigger)) return read("ally-targeted");
        return null;
    }
    if (/\bcritically hits you\b|^You are critically hit\b|^You (?:are struck by|would take|take) a critical hit\b|^A critical hit deals [^.]*\bdamage to you\b|\bcritically succeeds (?:on|at) (?:a|an) (?:melee |ranged )?(?:Strike|attack(?: roll)?) against you\b/i.test(trigger)) return read("critical-hit");
    // ("A creature missed you with a melee attack", "A creature misses you with a ranged attack", "An adjacent creature you can see fails an
    // attack roll against you": Elude Trouble's, Coursing Weave's; the loop, 2026-10-30.)
    if (/\bmiss(?:es|ed)? you\b|\bfails an attack roll against you\b/i.test(trigger)) return read("miss");
    if (/\bhits you\b|^You(?:'re| are| would be) hit\b/i.test(trigger)) return read("hit");
    if (/\btargets you\b|^You are (?:the )?target(?:ed)? (?:of|by)\b|\battempts? (?:a (?:melee |ranged )?Strike|an attack(?: roll)?) against you\b|\battacks you\b|\bmakes an attack(?: roll)? against you\b|^You(?:'re| are) targeted with (?:a|an) (?:melee |ranged )?(?:Strike|attack)\b/i.test(trigger)) return read("targeted");
    if (/(?:^|,\s*)You (?:or your [\w ]+? )?(?:would )?take (?:(?:[a-z]+(?:,| or| and)?|or|and) )*?damage\b|^You(?:'re| are) dealt\b[^.]*\bdamage\b|\bwould deal damage to you\b|\bdamages you\b|\bdeals damage to you\b/i.test(trigger) && !/\bfall(?:ing)? damage\b/i.test(trigger)) return read("damaged");
    return null;
}

const CONDITION_WORDS = ["blinded", "clumsy", "confused", "controlled", "dazzled", "deafened", "doomed", "drained", "dying", "enfeebled", "fascinated", "fatigued", "fleeing", "frightened", "grabbed", "immobilized", "off-guard", "paralyzed", "petrified", "prone", "restrained", "sickened", "slowed", "stunned", "stupefied", "unconscious", "wounded"];
// "gains the Frightened condition", "would become Frightened, Drained, …", "becomes frightened or stupefied", "falls to 0 Hit Points" → the
// conditions (with "0-hp" for the last), or null.
function conditionsOf(trigger) {
    if (/\b(?:falls to|is reduced to|are reduced to|'re reduced to|would be reduced to|brings? [^.]*? to|drops to) 0 (?:Hit Points|HP)\b/i.test(trigger) && !/\bbrings an enemy\b/i.test(trigger)) return ["0-hp"];
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

// A reaction or free action triggered by the character's own action or spell (slice 8): "You use Orc Ferocity.", "You Shield Block a melee
// Strike …", "You enter Tenacious Stance.", "You Cast a Spell using a spell slot.", "You cast summon undead." → { names: the action's or
// spell's names (lower case), spell: any spell counts, trigger, kind }, or null. Matched against the item of the character's own chat
// message when it uses one.
export function ownUseTrigger(item) {
    const type = item?.system?.actionType?.value;
    if (!["reaction", "free"].includes(type)) return null;
    const found = /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(String(item?.system?.description?.value ?? ""));
    if (!found) return null;
    const trigger = plainOf(found[1]).replace(/([^.])$/, "$1.");
    const kind = type === "reaction" ? "reaction" : "free action";
    let match;
    if (/^You (?:Cast|cast) (?:a|an) (?:[\w-]+ )*?(?:spell|cantrip)\b/.test(trigger)) return { names: [], spell: true, trigger, kind };
    if ((match = /^You (?:use|used) (?:the |your )?([A-Z][\w'’-]*(?: (?:[A-Z][\w'’-]*|of|the|a|for))*)/.exec(trigger))) return { names: [match[1].replace(/ (?:of|the|a|for)$/, "").toLowerCase()], spell: false, trigger, kind };
    if ((match = /^You (?:Cast|cast) ([a-z][\w'’ -]+?)(?=[.,]| and | to | on | with | using |$)/.exec(trigger)) && !/^(?:a|an|the|your)\b/.test(match[1])) return { names: [match[1].toLowerCase()], spell: false, trigger, kind };
    if ((match = /^You enter ((?:[A-Z][\w'’-]*\s?)+Stance)\b/.exec(trigger))) return { names: [match[1].trim().toLowerCase()], spell: false, trigger, kind };
    if ((match = /^You (Shield Block|Raise a Shield|Leap|Stride|Step|Sustain a Spell|Interact)\b/.exec(trigger))) return { names: [match[1].toLowerCase()], spell: false, trigger, kind };
    return null;
}

// Whether the character's own message (its item's name and type) is what the trigger names.
export function usesTrigger(read, itemName, itemType) {
    if (!read) return false;
    if (read.spell) return itemType === "spell";
    const name = String(itemName ?? "").toLowerCase().replace(/\s*\([^)]*\)\s*$/, "").trim();
    return read.names.some((each) => name === each || name.startsWith(`${each} `));
}

// A reaction or free action triggered before one of the character's own rolls (slice 9): "You attempt a saving throw against a magical
// effect, but you haven't rolled yet.", "You're about to roll initiative.", "You have the dying condition and are about to attempt a recovery
// check." A note on the roll's card comes too late, so the module reminds before: when a hostile spell or ability with a save is posted
// with the character targeted, when the character joins an encounter without initiative, and when its turn begins while it's dying.
export function preRollTrigger(item) {
    const type = item?.system?.actionType?.value;
    if (!["reaction", "free"].includes(type)) return null;
    const found = /<strong>\s*Trigger\s*<\/strong>([\s\S]*?)<\/p>/i.exec(String(item?.system?.description?.value ?? ""));
    if (!found) return null;
    const trigger = plainOf(found[1]).replace(/([^.])$/, "$1.");
    const kind = type === "reaction" ? "reaction" : "free action";
    if (!/^You(?:'re| are| would| attempt| have)\b/i.test(trigger) && !/^You and\b/i.test(trigger)) return null;
    const before = /\babout to (?:roll|attempt)\b|\bwould (?:roll|attempt)\b|\bhaven['’]t (?:yet )?rolled\b/i.test(trigger);
    if (!before) return null;
    if (/\binitiative\b/i.test(trigger)) return { event: "pre-initiative", trigger, kind };
    if (/\brecovery check\b/i.test(trigger)) return { event: "pre-recovery", trigger, kind };
    if (/\b(?:saving throws?|saves?)\b/i.test(trigger)) return { event: "pre-save", trigger, kind };
    return null;
}

// Whether a posted message's text asks for a save: PF2e's inline save links.
export const asksForSave = (content) => /data-pf2-check="(?:fortitude|reflex|will)"/.test(String(content ?? ""));

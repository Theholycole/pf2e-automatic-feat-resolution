// A character's action whose one result is PF2e's own Effect, linked in its text (2026-10-30, docs/feats.md, slice 13): "You gain a +1
// circumstance bonus to AC until the start of your next turn. Effect: Ceremony of Protection", "Choose a target ally within 60 feet. …
// Effect: Watch Your Back", "You and all allies within 30 feet gain a +10-foot status bonus to all Speeds for 1 minute. Effect: Fleet
// Tempo". The ability module's effect card puts that Effect on the character, its target or its allies in range. Only when nothing else
// is done: no check, damage roll, Strike, spell, movement or choice of results; and when who gets it is said plainly.

import { htmlToPlainText } from "../../../pf2e-resolution-core/src/text/plain-text.js";

const HEADINGS = /<p[^>]*>\s*<strong>\s*(Trigger|Frequency|Requirements?|Cost|Access|Prerequisites?)\s*<\/strong>[\s\S]*?<\/p>\s*(?:<hr\s*\/?>)?/gi;
// An Effect in any of PF2e's or a module's effect packs (feat-effects, other-effects, a Teams+ pack's effects).
const EFFECT_LINK = /@UUID\[(Compendium\.[\w-]+\.[\w-]*effects?[\w-]*\.Item\.[^\]]+)\](?:\{([^}]*)\})?/gi;
// Something else to do than give the Effect.
const DOING = /\bStrikes?\b|\bStrides?\b|\bSteps?\b|\bLeaps?\b|\bFl(?:y|ies)\b|\bBurrows?\b|\bInteract\b|\bCasts?\b|\bspells?\b|\bcantrips?\b|\bchecks?\b|\bsaving throws? against\b|\battempts?\b|\brolls?\b|\bchoose (?:one|two|either|a type|from)\b|\bone of the following\b|\bthe following\b|\bdeals?\b|\btakes? \d|\bdamage to (?:yourself|you)\b|\bteleport|\bsummon|\bterrain\b|\bsquare\b|\bremove|\breduce|\bends?\b|\bdismiss|\bStance\b/i;
const GRANT = /\b(?:gains?|gaining|grants?|granting|gives?|become|becomes|can't be|can(?:not|'t) become|is no longer|are no longer|(?:can )?rerolls?)\b/i;

const NUMBER = { one: 1, two: 2, three: 3, four: 4, five: 5 };

// The item → the plan, or null.
export function linkedEffect(item) {
    const type = item?.system?.actionType?.value;
    if (!["action", "free", "reaction"].includes(type)) return null;
    // (Its own Effect PF2e already applies from the sheet's Use: not again.)
    if (item.system?.selfEffect) return null;
    const raw = String(item?.system?.description?.value ?? "");
    if (/@Check\[|@Damage\[|\[\[\//.test(raw)) return null;
    const html = raw.replace(HEADINGS, "");
    const links = [...html.matchAll(EFFECT_LINK)];
    const uuids = [...new Set(links.map((match) => match[1]))];
    if (uuids.length !== 1) return null;
    const label = links[0][2] ?? uuids[0].split(".").at(-1);
    // Its words without the link or any other links' markup; the Effect's numbers ("a +1 status bonus to attack rolls") aren't what it does.
    const plain = htmlToPlainText(html.replace(EFFECT_LINK, "").replace(/@Template\[(?:type:)?(\w+)\|distance:(\d+)[^\]]*\](?:\{[^}]*\})?/gi, "a $2-foot $1").replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, "$1").replace(/@UUID\[[^\]]*?\.([^.\]]+)\]/g, "$1"))
        .replace(/\s*\bSpecial\b[\s\S]*$/, "").replace(/\s+/g, " ").trim();
    const doing = plain.replace(/\b(?:bonus|penalty) to [^.;]*/gi, "").replace(/\bresistance [^.;]*/gi, "");
    if (DOING.test(doing)) return null;
    // (A leading "When you give them a shout …," is how, not what: the clause after it.)
    const sentences = plain.split(/(?<=[.!?])\s+(?=[A-Z])/).map((part) => part.replace(/^When [^,]+,\s*/i, ""));
    const found = sentences.filter((part) => GRANT.test(part) && !/^(?:If|Whenever)\b/i.test(part)).map((part) => whoGets(part, plain)).find(Boolean);
    if (!found) return null;
    const { recipients, target, within } = found;
    return {
        source: { name: item.name, slug: item.system?.slug ?? null, uuid: item.uuid ?? null, type: item.type ?? "feat" },
        activation: { time: type === "action" ? String(Number(item.system?.actions?.value) || 1) : type, traits: [...(item.system?.traits?.value ?? [])] },
        targeting: { target, range: within && recipients === "target" ? `${within} feet` : null, area: null },
        trigger: { event: "use" },
        resolution: { kind: "effect", applications: [{ kind: "native-spell-effect", uuid: uuids[0], label, recipients }] }
    };
}

// One sentence that grants it → { recipients, target, within } when who gets it is said plainly, or null.
function whoGets(sentence, plain) {
    const verb = GRANT.exec(sentence);
    const before = sentence.slice(0, verb.index).replace(/^.*[,;]\s*/, "").trim();
    // ("You grant one creature within your aura …": who it's granted to, after the verb.)
    const granted = /^(?:grants?|gives?)$/i.test(verb[0]) && /^you$/i.test(before);
    const subject = granted ? sentence.slice(verb.index + verb[0].length).trim() : before;
    const within = Number(/\bwithin (?:a )?(\d+)(?: feet|-foot)\b/i.exec(plain)?.[1]) || (/\badjacent\b/i.test(sentence) ? 5 : null);
    if (/^you and (?:all |each |every |your |any )?(?:\w+ )?(?:adjacent )?all(?:y|ies)\b/i.test(subject) || /^you and (?:all |each )?(?:\w+ )?all(?:y|ies)\b/i.test(sentence.trim())) {
        return { recipients: "allies-in-area", target: within ? `you and each ally within ${within} feet` : "you and your allies", within };
    }
    if (/^(?:you|your [\w' -]+)$/i.test(subject) && !/\b(?:all(?:y|ies)|target|creature|partner|student|companion)\b/i.test(sentence.slice(0, verb.index + 20))) return { recipients: "self", target: null, within };
    if (/^(?:you or )?(?:the|that|this|your|one|an?|each|all|every|up to \w+)?\s*(?:triggering |target |chosen |willing |bonded |adjacent |nearby )*(?:ally|allies|creature|target|partner|student|companion)\b|^(?:they|it)$/i.test(subject)) {
        const many = /^(?:each|all|every|up to \w+)\b|\ballies\b/i.test(subject);
        const count = NUMBER[/\bup to (\w+)\b/i.exec(subject)?.[1]?.toLowerCase()] ?? null;
        const target = many ? (within ? `each ally within ${within} feet` : count ? `up to ${count} allies` : "your allies") : /\bcreature\b/i.test(plain) && !/\bally\b/i.test(plain) ? "1 creature" : "1 ally";
        return { recipients: many ? "allies-in-area" : "target", target, within };
    }
    return null;
}

// A companion's master, for the DCs its abilities borrow (2026-10-30, docs/feats.md, "Companions"). An eidolon's Dragon Breath is "a basic
// Reflex save against your spell DC": the summoner's, not the eidolon's (it has none). PF2e links only a familiar to its master
// (system.master.id); an eidolon or animal companion is a "character" with the eidolon or minion trait and no link, so the module looks
// for one: its own flag (flags["pf2e-automatic-feat-resolution"].master, an actor id), else the one character the same player owns
// that isn't a companion itself (a summoner first, for an eidolon).

const MODULE_ID = "pf2e-automatic-feat-resolution";
const OWNER = 3;

const traitsOf = (actor) => {
    const traits = actor?.traits ?? actor?.system?.traits?.value ?? [];
    return new Set(traits instanceof Set ? traits : [...traits]);
};
export const isEidolon = (actor) => traitsOf(actor).has("eidolon") || actor?.class?.slug === "eidolon" || actor?.class?.name === "Eidolon";
export const isCompanion = (actor) => actor?.type === "familiar" || isEidolon(actor) || traitsOf(actor).has("minion");

const playersOf = (actor, users) => users.filter((user) => !user.isGM && (actor?.ownership?.[user.id] ?? actor?.ownership?.default ?? 0) >= OWNER).map((user) => user.id);

// actors, users: game.actors and game.users as arrays (the tests give plain objects).
export function findMaster(actor, { actors = [], users = [] } = {}) {
    if (!isCompanion(actor)) return null;
    const byId = (id) => (id ? actors.find((each) => each.id === id) ?? null : null);
    const flagged = byId(actor.flags?.[MODULE_ID]?.master);
    if (flagged) return flagged;
    if (actor.type === "familiar") return actor.master ?? byId(actor.system?.master?.id);
    const players = playersOf(actor, users);
    if (!players.length) return null;
    const candidates = actors.filter((each) => each !== actor && each.type === "character" && !isCompanion(each)
        && players.some((id) => (each.ownership?.[id] ?? 0) >= OWNER));
    if (isEidolon(actor)) {
        const summoners = candidates.filter((each) => each.class?.slug === "summoner" || each.class?.name === "Summoner");
        if (summoners.length === 1) return summoners[0];
    }
    if (candidates.length === 1) return candidates[0];
    // (Several: the player's own assigned character, when it's one of them.)
    const assigned = users.filter((user) => players.includes(user.id)).map((user) => user.character).filter((each) => candidates.includes(each));
    return assigned.length === 1 ? assigned[0] : null;
}

// The companion's DCs with its master's where its abilities use them: an eidolon's spell DC is always the summoner's; any other companion's
// class or spell DC is the master's when it has none of its own (a familiar's ability "against your spell DC").
export function withMasterDCs(own, master, { eidolon = false } = {}) {
    if (!own || !master) return own;
    const spell = eidolon ? master.spell ?? own.spell : own.spell ?? master.spell;
    return {
        ...own,
        class: own.class ?? master.class,
        spell,
        byClass: { ...master.byClass, ...own.byClass },
        byTradition: eidolon ? { ...own.byTradition, ...master.byTradition } : { ...master.byTradition, ...own.byTradition },
        master: { level: master.level, class: master.class, spell: master.spell }
    };
}

// The master's companions: its eidolon, for an evolution feat on the summoner's sheet that the eidolon uses.
export function companionsOf(master, world = {}) {
    return (world.actors ?? []).filter((each) => each !== master && isCompanion(each) && findMaster(each, world) === master);
}

// The item as its companion's: an evolution feat (the eidolon trait) the summoner posts is the eidolon's action, rolled with the eidolon's
// Strikes, Strength and level, from its token. The item itself when its actor is the eidolon or has none.
export function actingItem(item, world = {}) {
    if (!(item?.system?.traits?.value ?? []).includes("eidolon") || !item.actor || isEidolon(item.actor)) return item;
    const eidolons = companionsOf(item.actor, world).filter(isEidolon);
    if (eidolons.length !== 1) return item;
    return new Proxy(item, { get: (target, key) => (key === "actor" || key === "parent" ? eidolons[0] : Reflect.get(target, key)) });
}

// An eidolon's ability in the words the readers know (2026-10-30, "Companions"): it acts, so "Your eidolon makes a melee Strike" is
// "You make a melee Strike", "your eidolon's reach" is "your reach". Its "your spell DC" stays: that's the summoner's, given as the number.
const VERBS = { is: "are", has: "have", does: "do", was: "were" };
const plural = (verb) => VERBS[verb.toLowerCase()] ?? verb.replace(/(ss|sh|ch|x|z)es$/, "$1").replace(/([^aeiou])ies$/, "$1y").replace(/([^s])s$/, "$1");
export function eidolonWords(html) {
    return String(html)
        .replace(/\b([Yy])our eidolon's\b/g, (_all, y) => `${y}our`)
        .replace(/\b([Yy])our eidolon ((?:then |also |immediately |suddenly )?)(can't|can|must|[a-z]+s)\b/gi,
            (_all, y, adverb, verb) => `${y === "Y" ? "You" : "you"} ${adverb}${plural(verb)}`)
        .replace(/\b([Yy])our eidolon\b/g, (_all, y) => (y === "Y" ? "You" : "you"));
}

export const isEidolonItem = (item) => (item?.system?.traits?.value ?? []).includes("eidolon");

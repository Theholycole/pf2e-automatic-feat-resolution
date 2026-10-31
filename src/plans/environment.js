// What a character's feats and heritages ease of the weather, the temperature and falls, for PF2e Automatic Environment Resolution
// (2026-10-31, Cole: "We have a environment module"): the shapes its creatures read from the item module's api (the core's weather.js
// ignoresWeather, temperature counts, disasters.js easedFall), here by the compendium item each came from. scripts/environment.js answers the
// environment module's asks with them.
// temperature: { felt: what it counts as }; weather: the keys it ignores; fall: { shorter?, noDamage?, landsOnFeet? }, or by the
// character's Acrobatics rank (Cat Fall).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const heritage = (id) => `Compendium.pf2e.heritages.Item.${id}`;
const STEPS = ["incredible", "extreme", "severe", "mild"];
// (One step less severe, Badlands Orc's heat: incredible → extreme … mild → normal.)
const oneStep = (side) => Object.fromEntries(STEPS.map((step, index) => [`${step}-${side}`, index === STEPS.length - 1 ? "normal" : `${STEPS[index + 1]}-${side}`]));

export const ENVIRONMENT_FEATS = [
    { uuid: pf2e("0u1SZ1c6gDo6l0hS"), name: "Climate Adaptation", temperature: { "mild-cold": "normal", "mild-heat": "normal", "severe-cold": "mild-cold", "severe-heat": "mild-heat" } },
    // (Endures them "without taking damage": as mild, no damage.)
    { uuid: pf2e("Ta61ObC8Lk7BxTFO"), name: "Legendary Survivalist", temperature: Object.fromEntries(["severe", "extreme", "incredible"].flatMap((step) => [[`${step}-cold`, "mild-cold"], [`${step}-heat`, "mild-heat"]])) },
    { uuid: heritage("8Gsa8KFsHizEwSHU"), name: "Badlands Orc", temperature: oneStep("heat") },
    { uuid: pf2e("SzZFmcfLoHMAS0gt"), name: "Cloud Gazer", weather: ["fog-mist"] },
    { uuid: pf2e("8CLbJAtgSfwxk2rk"), name: "Murksight", weather: ["fog-mist", "precipitation"] },
    { uuid: "Compendium.witches-remaster.witches-remaster-feats.Item.nzuMPbN0KuO0nZnC", name: "Murksight+", weather: ["sight", "concealment"] },
    { uuid: pf2e("UpEjRfQkCJCruAfb"), name: "Storm Born", weather: ["sight", "fog-mist", "precipitation"] },
    { uuid: heritage("rKV11HWREwjjMIum"), name: "Skyborn Tengu", fall: { noDamage: true } },
    // (With a hand free: the environment module can't see hands, so always; its note says so.)
    { uuid: heritage("xaTTN5anLEBzWCzv"), name: "Windweb Tripkee", fall: { noDamage: true } },
    // (Batch 9: no falling damage at all; Land on Your Feet halves it and keeps it on its feet.)
    { uuid: heritage("dQqurQys37aJYb26"), name: "Leaf Leshy", fall: { noDamage: true } },
    { uuid: heritage("7kHg780SAsu2FNfP"), name: "Stuffed Poppet", fall: { noDamage: true } },
    { uuid: "Compendium.pf2e.ancestryfeatures.Item.RjWv5oPKZtNQgEiK", name: "Wings (Dragonet)", fall: { noDamage: true } },
    { uuid: "Compendium.pf2e.ancestryfeatures.Item.sL1hHxrHdMNIZVAd", name: "Land on Your Feet", fall: { halved: true, landsOnFeet: true } },
    // (Its own and its allies' within 60 feet: severe heat and cold as none, extreme too when legendary in Survival.)
    { uuid: pf2e("BlfgmJHjDyTVGdPs"), name: "Wandering Oasis", aura: 60, temperature: (actor) => Object.fromEntries((Number(actor?.skills?.survival?.rank ?? actor?.system?.skills?.survival?.rank) >= 4 ? ["severe", "extreme"] : ["severe"]).flatMap((step) => [[`${step}-cold`, "normal"], [`${step}-heat`, "normal"]])) },
    // (10 feet shorter trained, 25 expert, 50 master; legendary lands on its feet with no damage.)
    { uuid: pf2e("LQw0yIMDUJJkq1nD"), name: "Cat Fall", fall: { byAcrobatics: [null, { shorter: 10 }, { shorter: 25 }, { shorter: 50 }, { noDamage: true, landsOnFeet: true }] } }
];

const BY_UUID = new Map(ENVIRONMENT_FEATS.map((entry) => [entry.uuid, entry]));
const sourceOf = (item) => item?.sourceId ?? item?._stats?.compendiumSource ?? item?.flags?.core?.sourceId ?? null;
const FEATS = new Set(["feat", "heritage"]);
const entriesOf = (actor) => [...(actor?.items ?? [])].filter((item) => FEATS.has(item.type)).map((item) => [item, BY_UUID.get(sourceOf(item))]).filter(([, entry]) => entry);

const countsOf = (entry, actor) => (typeof entry.temperature === "function" ? entry.temperature(actor) : entry.temperature);

// (Its own, and an aura's from an ally near enough: nearby(actor) gives [{ actor, distance }] of the creatures on its side, the world's
// tokens by default. The environment module asks (actor, { temperature }): nearby as options.nearby, or a function; round 33.)
export function temperatureProtections(actor, options = {}) {
    const nearby = typeof options === "function" ? options : typeof options?.nearby === "function" ? options.nearby : alliesNear;
    const own = entriesOf(actor).filter(([, entry]) => entry.temperature).map(([item, entry]) => ({ counts: countsOf(entry, actor), source: item.name }));
    const auras = [];
    for (const { actor: ally, distance } of nearby(actor) ?? []) {
        if (!ally || ally === actor) continue;
        for (const [item, entry] of entriesOf(ally)) if (entry.aura && entry.temperature && distance <= entry.aura) auras.push({ counts: countsOf(entry, ally), source: `${item.name} (${ally.name})` });
    }
    return [...own, ...auras];
}

function alliesNear(actor) {
    const canvas = globalThis.canvas;
    if (!canvas?.ready) return [];
    const token = actor?.getActiveTokens?.(true, false)?.[0];
    if (!token) return [];
    return canvas.tokens.placeables.filter((other) => other !== token && other.actor && other.actor.alliance === actor.alliance && actor.alliance).map((other) => ({ actor: other.actor, distance: token.distanceTo?.(other) ?? Infinity }));
}

export function weatherIgnores(actor) {
    return entriesOf(actor).filter(([, entry]) => entry.weather).map(([item, entry]) => ({ ignores: entry.weather, source: item.name }));
}

export function fallEases(actor) {
    const out = [];
    for (const [item, entry] of entriesOf(actor)) {
        if (!entry.fall) continue;
        const ease = entry.fall.byAcrobatics ? entry.fall.byAcrobatics[Number(actor.skills?.acrobatics?.rank ?? actor.system?.skills?.acrobatics?.rank) || 0] : entry.fall;
        if (ease) out.push({ ...ease, source: item.name });
    }
    return out;
}

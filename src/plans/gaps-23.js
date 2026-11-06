// One-off combat feats, batch 23 (2026-11-05, Cole: "Grind everything"): a shadow spell's Perception penalty, a beast lord's swarm,
// the runelords of greed's bonuses.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const action = (id) => `Compendium.pf2e.actionspf2e.Item.${id}`;
const ROUND = { value: 1, unit: "rounds", expiry: "turn-start", sustained: false };
const MINUTE = { value: 1, unit: "minutes", expiry: "turn-start", sustained: false };

export default [
    {
        uuid: pf2e("eGgSGU1LOaRNRYR7"), name: "Shadow Spell",
        toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "perception", type: "status", value: -2 }], duration: ROUND },
        notes: ["After your next shadow spell resolves, on one creature it affected (an enemy only if your spell attack hit or it failed its save). Or instead a +2 status bonus to Stealth: edit the Effect. Using Shadow Spell again ends it."]
    },
    {
        uuid: pf2e("W3w7iGGsdkfO1GOn"), name: "Pack of the Beast Lord",
        toggle: { who: "target", rules: [{ key: "Resistance", type: "physical", value: "floor(@actor.level/2)" }, { key: "Weakness", type: "area-damage", value: "floor(@actor.level/2)" }, { key: "Immunity", type: "precision" }], duration: MINUTE },
        notes: ["Spend a Mythic Point. Target your united companion: it becomes Gargantuan for 1 minute (change its size), gains Amassed Assault, and you Command it to use it at once. The numbers are your level's: if the Effect reads the companion's level, edit them."]
    },
    {
        uuid: action("6uHxON55vtaperC2"), name: "Convocation of Greed",
        toggle: { who: "target", rules: [{ key: "FlatModifier", selector: "ac", type: "item", value: 2 }], duration: MINUTE },
        notes: ["Spend 1 Mythic Point. Up to eight bonuses to creatures within 60 feet; each picks +2 item to AC, attack rolls or saving throws (edit the Effect's selector for attack-roll or saving-throw), +4 within 100 feet of Xanderghul. A creature can get several, each to a different statistic."]
    }
];

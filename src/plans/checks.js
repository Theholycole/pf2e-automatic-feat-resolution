// Feats whose check is rolled against a creature's DC, rewritten by hand (2026-10-30): the readers take "Attempt a @Check[skill|defense:will]
// check against the Will DC of …" with its degrees, so each is said that way. A result the card can't apply is read as the GM's line on
// it; what else the feat does is a note. target: who the card is for, when the rewrite can't say it ("each creature within 15 feet").

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const teams = (module, pack, id) => `Compendium.${module}.${pack}.Item.${id}`;
const condition = (id, label) => `@UUID[Compendium.pf2e.conditionitems.Item.${id}]{${label}}`;
const fascinated = condition("AdPVz7rbaVSRxHFg", "Fascinated");
const dazzled = condition("TkIyaNPgTZFBCCuh", "Dazzled");
const offGuard = condition("AJh5ex99aV6VTggg", "Off-Guard");
const check = (skill, defense, against) => `<p>Attempt a @Check[${skill}|defense:${defense}] check against ${against}.</p><hr />`;
const results = ({ criticalSuccess = null, success = null, failure = null, criticalFailure = null }) =>
    [["Critical Success", criticalSuccess], ["Success", success], ["Failure", failure], ["Critical Failure", criticalFailure]].filter(([, text]) => text).map(([degree, text]) => `<p><strong>${degree}</strong> ${text}</p>`).join("");

export default [
    {
        uuid: pf2e("VtFuhfIIw8OoLF6v"), name: "Alluring Performance", target: "each creature within 15 feet",
        text: check("performance", "will", "the Will DC of each creature within 15 feet") + results({ criticalSuccess: `The target is ${fascinated} with you and is ${dazzled} for 1 round.`, success: `The target is ${fascinated} for 1 round and is ${dazzled} for 1 round.`, failure: `The target is ${dazzled} for 1 round.`, criticalFailure: "The target is unaffected." }),
        notes: ["A critical success's fascination lasts as long as you perform, and the dazzle as long as it's fascinated."]
    },
    {
        uuid: pf2e("cny7ouhsoiNsWJ7X"), name: "Daring Act",
        text: check("acrobatics", "reflex", "the Reflex DC of one foe within reach") + results({ criticalSuccess: `The target is ${offGuard} until the end of your turn.`, success: `The target is ${offGuard} until the end of your turn.` }),
        notes: ["Or Athletics. On a success, Stride up to half your Speed (your full Speed on a critical success) without triggering its reactions; it's off-guard against your next melee attack this turn only."]
    },
    {
        uuid: pf2e("9CXQhg4YprPhqzoL"), name: "Vexing Tumble",
        text: check("acrobatics", "reflex", "the Reflex DC of each enemy whose reach you begin in or enter") + results({ criticalSuccess: `Your movement doesn't trigger the target's reactions, and the target is ${offGuard} until the end of your turn.`, success: "Your movement doesn't trigger the target's reactions.", criticalFailure: "Your movement stops when you enter the target's reach." }),
        notes: ["Stride up to half your Speed; target the enemies whose reach you're in or enter, in order."]
    },
    {
        uuid: pf2e("zZCyJhsaugHB6mZW"), name: "Watch Your Back",
        text: check("intimidation", "will", "the Will DC of a target within 30 feet") + results({ criticalSuccess: "For 1 minute, the target gains a +2 status bonus to Perception checks against you and takes a –2 status penalty to Will saves against fear effects.", success: "For 1 minute, the target gains a +2 status bonus to Perception checks against you and takes a –2 status penalty to Will saves against fear effects." })
    },
    {
        uuid: pf2e("6ON8DjFXSMITZleX"), name: "No Cause for Alarm",
        text: check("diplomacy", "will", "the Will DC of each frightened creature within 10 feet") + results({ criticalSuccess: "The target's frightened value is reduced by 2.", success: "The target's frightened value is reduced by 1." }),
        notes: ["Target only the frightened ones. Each is immune for 1 hour."]
    },
    {
        uuid: teams("pf2e-team-plus-feats", "pf2e-player-options", "T1eqhmUdY3cAHvO3"), name: "No Cause for Alarm+",
        text: check("diplomacy", "will", "the Will DC of each frightened creature within 10 feet") + results({ criticalSuccess: "The target's frightened value is reduced by 2.", success: "The target's frightened value is reduced by 1." }),
        notes: ["Target only the frightened ones; 15 feet if you're a master in Diplomacy, 20 feet if legendary. Each is immune for 1 hour."]
    },
    {
        uuid: pf2e("bSXcyu7ExWq9qUzG"), name: "Convincing Illusion",
        text: check("deception", "perception", "the target's Perception DC") + results({ criticalSuccess: "The target fails to disbelieve the illusion.", success: "The target fails to disbelieve the illusion." })
    },
    {
        uuid: pf2e("eww9tuiXPnZFZ3DU"), name: "Plant Evidence",
        text: check("thievery", "perception", "the target's Perception DC") + results({ criticalSuccess: "You put the item on the target without it noticing.", success: "You put the item on the target without it noticing." })
    },
    {
        uuid: teams("pf2e-team-plus-adventures", "pf2e-items", "GaYZxy0Y17L6DMgI"), name: "I’m Not Finished",
        text: check("deception", "will", "the foe's Will DC") + results({ criticalSuccess: "You can be in any space adjacent to the foe, and you can first move it 5 feet in any direction.", success: "You can be in any space adjacent to the foe." }),
        notes: ["Either way, the foe gets a +4 circumstance bonus to its Will DC against this for 1 minute."]
    },
    {
        uuid: teams("pf2e-team-plus-feats", "pf2e-player-options", "hOZcktZvOn2aWQp9"), name: "Establish Etiquette",
        text: check("society", "will", "the Will DC of another creature within 30 feet") + results({ criticalSuccess: "For 1 minute, each turn the target doesn't follow your etiquette it takes a –2 circumstance penalty to its attack rolls.", success: "For 1 minute, each turn the target doesn't follow your etiquette it takes a –1 circumstance penalty to its attack rolls." }),
        notes: ["Immune for 1 hour after a success."]
    }
];

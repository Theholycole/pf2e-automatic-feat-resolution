// More checks against a creature's DC, rewritten by hand (2026-10-30, the loop): as checks.js, PF2e's tags for what the feat says in
// words; what the card can't do is a note.

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const condition = (id, label) => `@UUID[Compendium.pf2e.conditionitems.Item.${id}]{${label}}`;
const prone = condition("j91X7x0XSomq8d60", "Prone");
const grabbed = condition("kWc1fhmv9LBiTuei", "Grabbed");
const slowed = condition("xYTAsEpcJE1Ccni3", "Slowed 1");
const offGuard = condition("AJh5ex99aV6VTggg", "Off-Guard");
const stunned = condition("dfCMdR4wnpbYNTix", "Stunned 1");
const frightened = (value) => condition("TBSHQspnbcqxsmjL", `Frightened ${value}`);
const check = (skill, defense, against) => `<p>Attempt a @Check[${skill}|defense:${defense}] check against ${against}.</p><hr />`;
const results = ({ criticalSuccess = null, success = null, failure = null, criticalFailure = null }) =>
    [["Critical Success", criticalSuccess], ["Success", success], ["Failure", failure], ["Critical Failure", criticalFailure]].filter(([, text]) => text).map(([degree, text]) => `<p><strong>${degree}</strong> ${text}</p>`).join("");
const thrown = "@Damage[((floor((10+(5*@actor.abilities.str.mod))/10))d6 + @actor.abilities.str.mod)[bludgeoning]]";

export default [
    {
        uuid: pf2e("w0nSRBNwexM5Dh0D"), name: "Whirling Throw", target: "the creature you have grabbed",
        text: check("athletics", "fortitude", "the Fortitude DC of the creature you have grabbed") + results({ criticalSuccess: `The target takes ${thrown} damage and is ${prone}.`, success: `The target takes ${thrown} damage.`, criticalFailure: "The target is no longer grabbed or restrained by you." }),
        notes: ["Thrown, it's no longer grabbed or restrained by you: remove that. You throw it up to 10 feet plus 5 feet × your Strength modifier, by hand. –2 to the check against a creature one size larger (–4 larger still), +2 against one size smaller (+4 smaller still). Thrown less than the most, the damage is 1d6 per 10 feet plus your Strength modifier, unless it hit a solid obstacle."]
    },
    {
        uuid: pf2e("y3E0V6Nmq7HElfDT"), name: "Mythic Containment",
        text: check("deception", "will", "the Will DC of a creature within 30 feet") + results({ criticalSuccess: `The target enters the receptacle: it is ${grabbed} and ${slowed}.`, success: `The target enters the receptacle: it is ${grabbed} and ${slowed}.` }),
        notes: ["Spend a Mythic Point; roll at mythic proficiency, by hand, and Diplomacy or Intimidation instead if you like. Inside, it holds its breath or suffocates, and can Escape against your skill's DC at mythic proficiency; it's freed after 1 minute (another Mythic Point keeps it a minute more)."]
    },
    {
        uuid: pf2e("ISjnymvdFOPED9um"), name: "Denounce Tyranny", target: "up to three of the triggering creature's allies within 30 feet",
        text: check("diplomacy", "will", "the Will DC of each of up to three of the triggering creature's allies within 30 feet") + results({ criticalSuccess: "The target refuses to treat the triggering creature as an ally for 2 rounds.", success: "The target refuses to treat the triggering creature as an ally for 1 round." }),
        notes: ["Up to five creatures if you're a master in Diplomacy, ten if legendary."]
    },
    {
        uuid: pf2e("isdTXU8bV7ZVOAuQ"), name: "Flourishing Finish", target: "each enemy within 30 feet",
        text: check("performance", "will", "the Will DC of each foe within 30 feet who can see you") + results({ criticalSuccess: `The target is ${frightened(2)}.`, success: `The target is ${frightened(1)}.` }),
        notes: ["Only foes that can see you. Whatever the result, each is immune for 10 minutes."]
    },
    // (Round 51, triggered reactions.)
    {
        uuid: pf2e("MjPqgBQU9W4kelfz"), name: "Interrupt Charge", target: "the triggering foe",
        text: check("athletics", "fortitude", "the triggering creature's Fortitude DC") + results({ criticalSuccess: "You disrupt the movement: it stops.", success: "It takes a –10-foot circumstance penalty to its Speed for the rest of its triggering movement.", failure: "It takes a –5-foot circumstance penalty to its Speed for the rest of its triggering movement." }),
        notes: ["Use its Athletics DC instead if that's higher (the card uses Fortitude). The Speed penalty may end its movement at once: move its token back by hand."]
    },
    {
        uuid: pf2e("pQQhrcj1u6hUUc8L"), name: "Keep up Appearances", target: "each observing creature",
        text: check("deception", "perception", "the Perception DC of each creature observing you") + results({ criticalSuccess: "The creature believes you were unaffected by the emotion effect.", success: "The creature believes you were unaffected by the emotion effect." }),
        notes: ["A creature you fool can't benefit from the emotion effect or use abilities that need you under it (a will-o'-wisp's Feed on Fear)."]
    },
    {
        uuid: pf2e("XbMfMJq2sCQHdo1w"), name: "Improvise Strategy", target: "1 creature within 30 feet",
        text: check("warfare-lore", "perception", "the Perception DC of a creature within 30 feet") + results({ criticalSuccess: "The target gains your choice of clumsy 1, dazzled, off-guard or stupefied 1 until the end of your next turn, and isn't immune to Improvise Strategy.", success: "The target gains your choice of clumsy 1, dazzled, off-guard or stupefied 1 until the end of your next turn.", criticalFailure: `You are ${offGuard} until the start of your next turn.` }),
        notes: ["Pick the condition and put it on by hand. Add auditory or visual: the target can end it with a concentrate action (auditory) or an Interact (visual). Except on a critical success, the target is immune for 1 hour."]
    },
    {
        uuid: "Compendium.pf2e.actionspf2e.Item.QGeA2sPtDdryTpWw", name: "Overawe Crowd", target: "the swarm or troop",
        text: check("intimidation", "will", "the Will DC of the swarm or troop") + results({ criticalSuccess: `The target Strides twice in a direction you choose; you can move with it. It is ${stunned}.`, success: `The target Strides twice in a direction you choose; you can move with it. It is ${stunned}.`, failure: `The target Strides once in a direction you choose and you move with it. It is ${stunned}.`, criticalFailure: `The target is ${stunned}.` }),
        notes: ["Spend 1 Mythic Point; roll at mythic proficiency, by hand. Move the tokens by hand. The target is then immune for 24 hours."]
    },
    {
        uuid: pf2e("cErltcAC7OVnIyO1"), name: "Predictable!", target: "1 enemy",
        text: check("perception", "deception", "the foe's Deception DC") + results({ criticalSuccess: "+2 circumstance bonus to your AC against it until the start of your next turn, and to your next save against it.", success: "+1 circumstance bonus to your AC against it until the start of your next turn, and to your next save against it.", criticalFailure: "–1 circumstance penalty to your AC against it until the start of your next turn, and to your next save against it." }),
        notes: ["Use a hard DC of the foe's level instead if that's higher. Put PF2e's Effect: Predictable! on yourself from the feat and pick the degree."]
    }
];

// Spellcasting feats no module covers, from the simulator's feat gap index (2026-11-04, Cole: "Automate the spellcasting and companion feats
// not handled by other modules"). The spell module reads spellshape feats (src/compiler/spellshape-readers.js there) and casts the spells
// a feat grants; these are what's left that rolls something in a fight: a magus's Spellstrike rider, a breath, a delayed hit.
// (A number by the triggering spell's rank: the card takes your highest rank, half your level rounded up; a note says so.)

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const RANK = "ceil(@actor.level/2)";

export default [
    {
        uuid: pf2e("CuVvDrBaVP9nYJlt"), name: "Foretell Harm",
        text: `<p>The target takes @Damage[(2*${RANK})[untyped]] damage.</p>`,
        notes: ["Twice the triggering spell's rank: the card takes your highest rank. Post it at the start of the target's next turn, with the type of the spell's damage. The target is then immune to Foretell Harm for 24 hours."]
    },
    {
        uuid: pf2e("0PiyHEuxpB5zPctX"), name: "Shattering Spellstrike",
        text: "<p>The target your Spellstrike hit takes @Damage[2d6[force]] damage.</p>",
        notes: ["Make the Spellstrike with your improvised weapon first; post this when it hits. Add the spell's rank if it wasn't a cantrip or focus spell. No extra damage if the item's Hardness is above your level or it can't be broken."]
    },
    {
        uuid: pf2e("stwRJTOKUru9AmQC"), name: "Meteoric Spellstrike", target: "each creature in a line between you and your Spellstrike's target",
        text: `<p>Each creature in the line takes @Damage[(2*${RANK})[untyped]] damage.</p>`,
        notes: ["Make the ranged Spellstrike first (not with a cantrip or focus spell). Double the spell's rank: the card takes your highest rank. The damage type is Arcane Cascade's for the spell."]
    },
    {
        uuid: pf2e("cHOALlKY1XsCj3Fe"), name: "Disciple's Breath",
        text: "<p>Each creature in a @Template[cone|distance:30] takes @Damage[9d6[untyped]] damage with a @Check[reflex|against:class-spell|basic] save.</p>",
        notes: ["Your Dragon Breath's area and your dragon's damage type: change the template and the type if they differ. You can't use it again for 1d4 rounds."]
    },
    {
        uuid: pf2e("xYakFeP6olBsxpZN"), name: "Command Undead", target: "the undead your harm spell targets",
        text: `<p>The target attempts a @Check[will|against:spell] save against your spell DC.</p><hr /><p><strong>Critical Success</strong> The target is unaffected.</p><p><strong>Success</strong> The target is unaffected.</p><p><strong>Failure</strong> The target becomes a minion under your control for 1 minute.</p><p><strong>Critical Failure</strong> The target becomes a minion under your control for 1 hour.</p>`,
        notes: ["Instead of harm's effects, on an undead of your level − 3 or lower. A critical success makes it immune for 24 hours. If someone else commands it, they save too and it uses the better result. It ends if you or an ally attacks it."]
    }
];

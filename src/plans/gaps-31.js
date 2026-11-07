// Batch 31 (2026-11-07, Cole: "focus on building the feats first"): actions and reactions with a companion, mount, familiar or eidolon.
// The GM moves the companion; each card says what happens, and puts on what it can (temporary Hit Points, a damage reduction, a stance).

const pf2e = (id) => `Compendium.pf2e.feats-srd.Item.${id}`;
const NOW = { value: 0, unit: "rounds", expiry: "turn-end", sustained: false };
const ROUND = { value: 1, unit: "rounds", expiry: "turn-start", sustained: false };
const LASTING = { value: -1, unit: "unlimited", expiry: null, sustained: false };
const marker = (id, name, duration, notes, more = {}) => ({ uuid: pf2e(id), name, toggle: { rules: [], duration, ...more }, notes });
const note = (id, name, target, notes, effects = []) => ({ uuid: pf2e(id), name, affect: { target, effects }, notes });

export default [
    marker("wKFQreilUASJkKzV", "Collapse Construct", LASTING, ["Your construct (or you, adjacent) collapses it into its compact form or back. Compact, it can't act; Bulk 2 Small, 4 Medium, 8 Large, on wheels."]),
    note("nV29YjbLgRfEPXMR", "Dashing Pickup", "your mount", ["Command an Animal: your mount Strides (or Burrows, Climbs, Flies, Swims) past you and you Mount it as it passes. 2 actions: Stride twice; 3 actions: four times."]),
    note("sflJhnFzYfqZ2tDy", "Defend Mount", "you, instead of your mount", ["The attack against your mount uses your defense instead; if it hits, you take its effects instead of your mount."]),
    note("45L17b1vwUuE8mMc", "Faithful Stride", "your mount", ["Command an Animal: your mount Strides up to twice its Speed (three times with 3 actions), across liquids and surfaces that can't hold it; it falls in if it ends there."]),
    marker("s97nKj9Uye1KXr7A", "Meld into Eidolon", LASTING, ["You Manifest your Eidolon by becoming it (or meld into it when adjacent): you use its statistics and Boost Eidolon applies; you can only have it unmanifest itself."]),
    note("4k80lxXishAcELDg", "Mounting Leap", "the willing creature within 10 feet at least one size larger", ["Leap toward it and Mount it."]),
    note("G9l2g7sDpPVbZJza", "Quick Mount", "the adjacent willing creature at least one size larger", ["Mount it and Command an Animal to give it an order."]),
    note("usSE6mpdYSGmDdds", "Riptide Mount", "the adjacent willing swimmer at least one size larger", ["Under water: Mount it and Command an Animal to give it an order."]),
    note("XHy9inDi3oGZNd43", "No! No! I Created You!", "your construct companion", ["Once per minute, when it would become confused or controlled: roll Crafting to counteract the effect, counteract rank half your level rounded up."]),
    note("knJlRpltciLNTZba", "Protective Bond", "you and your eidolon", ["In the same damaging area: whoever would take more takes the lower of the two amounts instead."]),
    note("J7elM52meuLI3ZRy", "Pupil's Guard", "you, instead of your adjacent student", ["The reaction triggered by your student's Stride or manipulate action targets you instead: you take its damage and effects."]),
    note("3EtlXNK4vc44R3Gm", "Reactive Dismissal", "your eidolon", ["Reduce the triggering damage by double your level, and your eidolon unmanifests; you can't Manifest it again until after your next turn."], [{ kind: "heal", formula: "2*@actor.level" }]),
    marker("ks47UekSCM8gek6M", "Reckless Riding Lunge", NOW, ["Mounted with a melee weapon: until the end of your turn your melee reach is 5 feet more (edit the Strike's reach)."]),
    note("uWGpR5hfYS9znnxr", "Scatter Swarm", "the swarm sharing your familiar's space", ["Once per round. It takes damage equal to its weakness to area damage, acid, cold, electricity or fire as you choose."]),
    marker("RonS3ZJs4poFTckH", "Shrink Down", LASTING, ["Your eidolon shrinks to a smaller size of your choice (at least Small; Tiny with Miniaturize); its reach becomes 5 feet (10 if Large with Towering Size). Dismiss to return."]),
    note("pFKfYsxBWdUlmU6A", "Strafing Breath", "each creature in your mount's 10-foot emanation during its movement", ["In War Rider Stance: your dragon Strides (or Flies) three times; its aura is a 10-foot emanation as it moves, each creature in it taking its breath damage once (basic Reflex against your mount's Athletics DC)."]),
    marker("VS28L98uFhr3j1HC", "Their Master's Call", ROUND, ["A fragment of an inactive companion appears within 30 feet and grants you its support benefit until your next turn; any damage to it ends that."]),
    note("1fH3M3XaUWWOJZFM", "To War!", "each foe your apocalypse mount moves through", ["Once per 10 minutes, riding your apocalypse mount: it Strides up to twice its Speed through foes up to one size smaller, dealing its damage to each (basic Reflex) as it passes."]),
    note("t6sey3cyV8n7a78l", "Trampling Charge", "each foe your mount moves through", ["Your mount Strides up to double its Speed through foes up to one size smaller, dealing its leg Strike's damage to each (basic Reflex against your mount's or your class DC, the higher)."]),
    note("NPhH9XkHV0DG4WS9", "Transpose", "you and your eidolon", ["You each teleport to the other's place."]),
    note("km8ZBNKIlvnJexgc", "Vaulting Gallop", "your mount", ["Command an Animal: your mount Strides twice, Leaping over obstacles and creatures up to its size without provoking reactions; it must end on solid ground."]),
    { uuid: pf2e("ht9ctVLibKCaFQdc"), name: "War Rider Stance", toggle: { rules: [], duration: LASTING, stance: true }, notes: ["Your dragon companion has a 5-foot emanation: each creature starting its turn in it takes the dragon's support-benefit damage with a basic Reflex save against your mount's Athletics DC."] }
];

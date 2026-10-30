# Rule elements for passives

Started 2026-10-30, the user's call (D8 in [feats.md](feats.md)): most of what's left in the index is passives, stances with no Effect, and companion feats, which don't read into a card. PF2e automates such things with rule elements, so the module ships its own for the options that lack them, batch by batch.

## How they're added

- **Where:** `scripts/rules.js` wraps PF2e's `prepareRuleElements` on the feat, heritage and background item classes.
  - When a character's item prepares, the module's rules for it are added to its prepared `system.rules`.
  - PF2e builds the item's rule elements from those (`RuleElements.fromOwnedItem`).
  - Nothing is written into the world. Turn the module off and the rules are gone.
- **Which item:** by its compendium source (`item.sourceId`, Foundry's `_stats.compendiumSource`), as `src/rules/index.js` keys them.
  - PF2e's pack folders map to its compendium names (feats → feats-srd).
  - Teams+ items are keyed by their module and pack.
  - A copy made in the world keeps its source, so it still gets the rules. An item made from scratch doesn't.
- **None twice:** a rule the item already has (the same key and selector, or type, and the same predicate) isn't added again. So when PF2e adds one in a later version, PF2e's wins.
- **Only rules that live on data alone:** an added rule isn't in the item's source, so nothing may write back to it. That rules out ChoiceSet, GrantItem, a toggleable RollOption and Strike. `test/rules.test.js` checks every batch for this.

## Batches

Each batch is a reviewed list in `src/rules/batch-*.js`: the compendium UUID, the name, and the rules. Each rule is written in the shape PF2e's own items use for the same words; `tools/rules-batch.mjs` and a lookup of PF2e's packs find that shape.

### Batch 1 (2026-10-30): 34 options

- **Senses and Speeds said outright:** 26 options. Examples: "You gain darkvision." (Orc Sight, Nephilim Eyes, Hag's Sight and others), "You gain low-light vision, or you gain darkvision if your ancestry already has low-light vision.", "You gain imprecise scent with a range of 30 feet.", greater darkvision (Shadowdancer Dedication, Stalking Feline Mask).
  - These are read by `src/rules/read.js`, and each one was checked against its text.
  - Left out:
    - a form or a time ("You can remain in this form for up to 1 minute");
    - a choice ("Choose two of the following options");
    - a feat taken twice for two senses (Hungry Eyes, Twilight Dweller), which needs to know which time it was taken.
- **Bonuses and resistances, by hand:** 8 options.
  - Cynical: Perception against Lie and Impersonate, as PF2e's Community-Minded.
  - Tip the Scales: Escape, as Break Free.
  - Vigorous Victor: saves against what inflicts drained, enfeebled, fatigued, sickened or slowed, +3 from 18th level.
  - Winter's Kiss: fire resistance of half the character's level.
  - Steadying Stone, and Teams+'s Ankle-weighted Stabilizers: against Shove, Trip and prone, as Anchor. A rock dwarf gets +3.
  - Clerics+'s Sacred Executioner: Perception against Impersonate.
  - Natural Ambassador: Diplomacy with animals.
- **Not done, the GM's:**
  - Winter's Kiss's step up to your full level when you already have such a resistance;
  - Natural Ambassador's +2 with animals of your own kind.

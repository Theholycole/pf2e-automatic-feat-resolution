# PF2e Automatic Feat Resolution

The `pf2e-automatic-feat-resolution` Foundry module: automation for the player options PF2e and the rest of the suite don't automate yet. That covers class, ancestry, skill and general feats, backgrounds, heritages and the actions they grant, Teams+ content included. A feat is compiled with the character's own DCs, level and attribute modifiers into the plans **PF2e Resolution Core** resolves, and played by **PF2e Automatic Ability Resolution**'s confirmation cards, in live play and the PF2e Combat Simulator.

## Install

In Foundry go to **Add-on Modules → Install Module**, paste this manifest URL and click **Install**:

```
https://github.com/Theholycole/pf2e-automatic-feat-resolution/releases/latest/download/module.json
```

It needs **PF2e Resolution Core** and **PF2e Automatic Ability Resolution** (0.9.6 or later), which Foundry offers to install with it. Foundry 14 and the PF2e system 8.5 or later. MIT licensed (see [LICENSE](LICENSE)); the Pathfinder rules text it reads comes from the PF2e system under Paizo's ORC license.

## Status (2026-10-30)

See [docs/feats.md](docs/feats.md).

- **Saves against the character's own DC:** a feat's save written against a statistic (class DC, spell DC, the higher of the two, a tradition's, a skill's) gets the character's number, and its damage scaled by level or an attribute gets the character's dice. The card aims at the targets the player had when using the feat.
- **Strike feats:** "Stride twice, then make a melee Strike. If it hits, …" becomes a Strike activity. The player uses the feat, then rolls the Strike from the sheet, and when it hits the card offers its results. What the reader doesn't read goes to the GM as notes on the card.
- Anything else stays PF2e's for now.

## Development

Clone it next to the suite's other repositories (`pf2e-resolution-core`, `pf2e-automatic-ability-resolution`): it imports them by the relative paths Foundry's modules folder gives them. `npm test` runs the tests.

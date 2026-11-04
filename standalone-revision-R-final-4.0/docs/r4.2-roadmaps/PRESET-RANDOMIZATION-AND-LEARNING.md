# Roadmap - Preset randomization & learning

4.1 unfroze the 80 MACHINE presets: they re-roll from a fresh random seed on every start and Refresh, validated
against `presets.schema.json`. LAB 250 stays fixed. **4.1.3 shipped the core of phase 1: the deck is fully
determined by one recorded seed - `buildMachinePresets(seed)` rebuilds the exact same 80 presets, and the seed is
logged at every roll** (the HUD display and paste-a-seed UI remain). This roadmap makes randomization richer and -
strictly locally - able to learn what the operator likes.

## Phases
| Phase | Outcome | Exit criteria |
| --- | --- | --- |
| 1. Seeded decks | The MACHINE roll takes a visible session seed (shown in the HUD, copyable); "Refresh" advances it, a pasted seed reproduces the deck exactly | Same seed -> byte-identical deck, asserted by tests; schema validation unchanged |
| 2. Roll recipes | Named recipes bias the roll (SPARSE, DENSE, GLYPH-HEAVY, COLOUR-DRIFT, CALM), defined as data: per-voice probability and range multipliers | Recipes are manifest entries; every rolled preset still passes the schema and caps |
| 3. Keep & breed | Pin a rolled preset to keep it across Refresh; "breed" two pinned presets (per-effect crossover + bounded mutation) into a new MACHINE slot | Bred presets pass schema/caps; lineage recorded in the preset name field only |
| 4. Local taste learning | A small, local-only preference model: thumbs up/down on rolled presets adjusts per-voice weight priors used by future rolls (simple additive weights, no neural net, no telemetry, stored next to USER presets, one click to reset) | Weights file is human-readable JSON; deleting it restores stock behaviour; nothing leaves the machine |
| 5. Learned recipes | Export the learned weights as a named recipe (shareable JSON through the existing preset export) | Round-trips through import/export; schema-checked like any preset data |

## Hard rules
- Flash/Strobe: learning and breeding may only lower light values, never raise them past saved levels, and rolled
  lights stay inside the 20% / 35% caps exactly as today.
- No background learning: weights update only on an explicit thumb action.
- GHOST presets are excluded from rolling, breeding and learning.

## Risks
- Learned weights can collapse variety (everything converges on one look) - keep an exploration floor per voice.
- Seeds in screenshots become a sharing format by accident - that is fine, but document that a seed reproduces the
  deck only within the same version (manifest hash is part of the seed display).

# Roadmap - TOTAL CONFLUENCE

The host already calls itself the "TOTAL CONFLUENCE effects engine" (`host/GlitchPlayerR4.csproj`). 4.1 delivered the
definition layer: `effects.manifest.json`, `presets.schema.json`, `surfaces.manifest.json`, each with a `--check`
generator. Total confluence is the end state where **every** behaviour - effects, presets, surfaces, transitions,
lights, glyphs, governor - flows from one machine-checked definition set, and the docs are generated from it.

## Where we are
- Defined: 43 effect voices (caps, photosensitivity class, transition character), preset schema, 10 surfaces / 12
  link-tree cards.
- Guarded: glyph tables (Unicode 15.1.0 + CP437, pinned by SHA-256), manifests (`--check`), 245 tests.
- Not yet defined: transition timing tables, light-automation envelopes, governor tiers, keyboard map, ghost flow.

## Phases
| Phase | Outcome | Exit criteria |
| --- | --- | --- |
| 1. Define the rest | `transitions.manifest.json` (per-voice glide/cut character, jitter bounds), `lights.manifest.json` (retarget bounds, caps, rest chances), `governor.manifest.json` (tiers, cost classes), `input.manifest.json` (keys, chords) | Each manifest has a generator with `--check`; counts and bounds asserted by tests |
| 2. One loader | A single `definitions.js` loads, validates and freezes every manifest at startup, the way `glyph-library.js` guards the tables today | A failing manifest is excluded with a logged warning; the app still starts |
| 3. Generated docs | `tools/build-docs.mjs` renders the effects, preset, surface, transition, light and keyboard references from the manifests (markdown + Confluence storage-format bundle) | Doc build is deterministic; `--check` fails CI when docs are stale |
| 4. Confluent UI | Preset browser and effect inspector read only from the manifests (origin, twin, cost tier, caps, "why is this slider 0?") | No UI string about an effect that is not sourced from a manifest |

## Invariants that make it "total"
- No constant appears in two places: code reads the manifest, or the generator extracts the constant and the test
  fails on drift.
- Photosensitivity data (caps, classes, rates) lives in exactly one manifest and is quoted everywhere else.
- A new effect voice is added by adding a manifest entry + one draw function; everything else (HUD slider, docs,
  preset validation, governor cost) follows.

## Risks
- `glitch-player.js` (~600 KB) still holds most constants; extraction must stay test-guarded (see REBUILDING.md).
- Generated docs must never contradict the photosensitivity warnings; the warning text itself is pinned by a test.

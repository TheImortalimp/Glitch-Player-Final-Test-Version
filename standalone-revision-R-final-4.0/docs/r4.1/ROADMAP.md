# Roadmap - R4.1 (target: December 2026)

| Phase | Weeks | Outcome | Exit criteria |
| --- | --- | --- | --- |
| 1. Define | 1 | Effects, presets and surfaces manifests + schemas | Manifests extracted from code; existing tests green; counts match (43 voices, 80 + 250 presets, 125 tables) |
| 2. Cohere | 2 | Generated docs (effects, presets, ghost, landing, HUD, canvas) | Doc build is deterministic; CI fails if docs are stale |
| 3. Polish | 3 | Accessibility pass; state/animation definitions for each surface | Focus order, ARIA, contrast and reduced-motion verified |
| 4. Ship | 4 | Preset browser/inspector, regression run, CHANGELOG, RELEASE_4.1 candidate | All tests pass; photosensitivity caps verified |

## Scope by area
- **Effects:** id, origin, twin, range, cap, glyph bank, cost tier, photosensitivity class, draw order.
- **Presets:** schema shared by import/export, MACHINE, LAB, USER and GHOST; lock and glide semantics.
- **Ghost:** trigger, confirmation, MISSING LINK reveal, crimson backdrop, capped levels.
- **Landing/init card:** logo card, sheen/rim/sparkle/prism timers, link tree, backdrop.
- **Main HUD:** layout below the 36 px bar, panels, keyboard map.
- **Canvas:** layer stack, frame governor steps, Freeze Frame.

## Risks
- glitch-player.js (~600 KB) is extracted in test-guarded steps, not rewritten.
- New motion must respect reduced motion and flash/strobe caps.

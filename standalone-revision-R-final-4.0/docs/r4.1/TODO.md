# TODO - R4.1

## Phase 1: Define
- [x] Clone the repo (/root/Glitch-Player-Final-Test-Version) and run `npm test`: 132/132 pass (Node v26.12.1)
- [x] Extract `effects.manifest.json` (43 voices) via `tools/build-effects-manifest.mjs` (+ `--check`, tests/web/effects-definition.test.mjs); 135/135 tests pass. Local only, not committed.
- [x] Write `presets.schema.json`; LAB 250 validated (tests/web/presets-schema.test.mjs, 137/137 pass). MACHINE 80 and GHOST still to validate (generated inside the player at boot).
- [x] Write `surfaces.manifest.json` via `tools/build-surfaces-manifest.mjs` (10 surfaces, 12 link-tree cards); 142/142 tests pass. Animations are per CSS file, not yet per surface.
- [ ] Extend effects-manifest.test.mjs; add preset-schema and surfaces tests

## Phase 2: Cohere
- [ ] `tools/build-docs.mjs` generating docs from manifests
- [ ] Effects and preset reference pages
- [ ] Ghost, landing, HUD and canvas pages with state diagrams
- [ ] CI check for stale generated docs

## Phase 3: Polish
- [ ] Accessibility pass (focus order, ARIA, contrast)
- [ ] Reduced-motion parity audit for every animation
- [ ] Verify flash/strobe caps after changes

## Phase 4: Ship
- [ ] Preset browser search/tags/diff; effect inspector
- [ ] Opt-in local governor overlay
- [ ] CHANGELOG, BUILD_STATUS, RELEASE_4.1 candidate

## Open questions
- Confirm release date within December.
- Keep version string 4.1.0 or 4.0.x?

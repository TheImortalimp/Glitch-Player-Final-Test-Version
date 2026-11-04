# Roadmap - Rebuilding

Everything generated must be rebuildable from pinned references, and the build itself must be boringly repeatable.
4.1 already rebuilds glyph tables from Unicode 15.1.0 + CP437 (pinned by SHA-256) and manifests from code, each with
`--check`. The 4.1.0 installer was rebuilt natively on Windows with all 245 tests passing.

## Findings recorded (2026-11-04, native rebuild)
- **LF checkout is required.** With `core.autocrlf=true` the web-test harness fails
  (`ReferenceError: setDisplayRefresh is not defined`): its source-slicing markers assume `\n`.
  Fix: `git config core.autocrlf false`, then `git rm --cached -r . && git reset --hard`.
- **The CAB integration test needs the player closed**; the verified launcher refuses `--verify` while the app runs
  ("Close the player before verifying its runtime") - correct behaviour, worth documenting for builders.
- Rebuilds are not byte-identical (installer hash changes per build); the hashes published with a release are the
  hashes of that release's artifacts, not of the sources.

## Phases
| Phase | Outcome | Exit criteria |
| --- | --- | --- |
| 1. Guard rails in the build | `build.cmd` runs the three manifest/table `--check` guards before the tests, and fails fast on CRLF checkouts (probe one marker line) | A fresh clone with wrong autocrlf fails in seconds with a clear message |
| 2. .gitattributes | `* text eol=lf` (with binary exceptions) so the checkout is correct regardless of local git config | Fresh clone on stock Windows git passes `build.cmd` untouched |
| 3. Reproducibility | Deterministic publish where .NET allows it (`ContinuousIntegrationBuild`, fixed CAB timestamps), and a build manifest (`out/build-info.json`: git commit, SDK/Node/NSIS versions, all artifact hashes) emitted every build | Two rebuilds on one machine differ only where documented; build-info explains every hash |
| 4. Modular rebuild of glitch-player.js | Continue the test-guarded extraction: definitions, transitions, lights, governor and glyph routing move into modules the tests already slice at; the file shrinks, behaviour pinned by the 148 web tests | Each extraction lands with its tests moved from source-slicing to imports; no behaviour diff |
| 5. Defender & release hygiene | A post-build step scans `out\` with Microsoft Defender (`MpCmdRun.exe -Scan -ScanType 3 -File ...`) and records the verdict in build-info; release checklist requires the scan line | Every published artifact carries a recorded clean scan from the build machine |

## Invariants
- Pinned references only: any rebuild input (Unicode data, CP437 map) is named by size + SHA-256 and re-verified by
  `--check` - never fetched loose.
- The DefenderGuard host component (`host/DefenderGuard.cs`) and the verified launcher stay as-is; rebuilding hygiene
  is additive, not a replacement for runtime verification.
- No signing without the author's certificate; the pipeline stays sign-ready but unsigned.

## Risks
- Determinism fights NSIS/CAB timestamps - scope phase 3 to "explained differences", not bit-identical output.
- Extraction fatigue: each module move must keep the old slicing tests until the import-based tests land.

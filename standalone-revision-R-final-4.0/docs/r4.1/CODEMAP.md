# R4.0 code map (standalone-revision-R-final-4.0)

Surveyed from the clone at /root/Glitch-Player-Final-Test-Version. ~21,400 lines.

## Web UI (webui/)
| File | Lines | Role |
| --- | --- | --- |
| index.html | 191 | All surfaces; CSP `default-src 'none'`; script load order below |
| js/glitch-player.js | 10,590 | Main app: startup gate, effect registry (`timedEffectsDefs` / `masterEffectsDefs` / `blendProfiles`), presets (`normalizePresetSettings`, LAB/MACHINE banks, user presets), Auto Glitch, HUDs, ghost egg, Freeze Frame |
| js/r3-factories.js | 2,744 | Revision 3 effect factories (R3 twins) |
| js/r3-ghost-vsync.js | 622 | GHOST PROTOCOL and V-SYNC renderers |
| js/glitch-engine.js | 1,081 | Effects engine core |
| js/glyph-library.js / glyph-tables.js | 117 / 136 | 125 validated glyph tables; also defines the 250-entry `GlitchMachinePresets` (LAB) |
| js/landing-backdrop.js | 226 | GHOST PROTOCOL glyph rain behind landing/link tree |
| js/r4-policy.js | 171 | Limits (e.g. MAX_USER_PRESETS), media extensions |
| js/host-bridge.js, yt-embed.js | 240 / 259 | Native host messaging; privacy-enhanced YouTube embed |
| css/glitch-player.css, r4.css, welcome-screen.css | 1,567 / 512 / 316 | HUD, R4 chrome/link tree/ghost egg, landing card |

Script order: glitch-engine, glyph-tables, glyph-library, landing-backdrop, r3-factories, r3-ghost-vsync, r4-policy, host-bridge, yt-embed, glitch-player.

## Flow
landing (`welcomeScreen`) -> Choose Media -> `sourceScreen` (+ `ytLinkTree`, 12 cards, local file) -> playback.
Eight controls are `inert` until playback: rightRack, ghostBtnRack, sliderContainer, preset-toggle-btn,
preset-dropdown-container, ui-toggle-tab, earHud, nowPlayingHud.

## Host (host/, launcher/, installer/)
.NET 10 WinForms + WebView2: Program, MainForm (747), AppPolicy, CaptureGuard, CursorGuard, DefenderGuard,
LocalMediaConverter (MediaTranscoder), Settings, WindowShell; .NET Framework launcher verifies payload.cab; NSIS installer.

## Tooling and tests
tools/: build-assets, build-glyph-tables, package-cab, and new build-effects-manifest / build-surfaces-manifest.
tests/web: 17 files (142 tests pass). Cross-check done: every `getElementById`/`$('id')` literal in the JS exists in index.html.

## Definitions added so far (webui/data/)
effects.manifest.json (43 voices), presets.schema.json (LAB 250 validated), surfaces.manifest.json (10 surfaces, 12 cards).
Gaps: MACHINE 80 and GHOST presets not yet schema-validated; animations are listed per CSS file, not yet per surface.

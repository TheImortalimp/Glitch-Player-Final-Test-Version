# Changelog - Standalone Revision R Final 4.1

## 4.2.4 - 2026-11-04 (GitHub release `RELEASE_4.2.4`) - Final Confluence

**The final consolidated release of the Revision R 4.x line**, carrying every update since the r4.2 roadmaps were
created: 4.1.0 "Definition & Confluence", 4.1.1 "Breathing Room", 4.1.2 "Room & Cut" and 4.1.3 "Strands", plus the
voice-independence work below.

- **Voices untied.** No voice may move another voice's slider or value anymore. Moving an AI WARP master (B&W, Hue)
  wakes ONLY its own core voice - never its R3 twin - so ASCII no longer triggers when R3 ASCII is used and every
  voice can be independently locked, triggered or set 0-100% or off via its own slider. Only explicit randomization
  (Randomize All, Continual Randomization, aesthetic bursts) may form confluence pairs of voices.
- **A properly safe ZERO ALL.** B&W Invert can no longer start automatically after ZERO ALL: the autonomous B&W
  inversion sweep stands down and Auto Glitch's B&W rail hops are skipped while B&W is cancelled - on top of 4.1.3's
  cancellation latch that already kept CR, the unpark and the aesthetic bursts away. No weird randomness unless you
  say so.
- Tests: 175 web tests pass (new: the untied-voices and safe-B&W guards in `effect-cancellation.test.mjs`).

### Installer flow redone - 2026-11-04 (replacement build, version stays 4.2.4)

The `RELEASE_4.2.4` installer asset was replaced by a build with a redone installer flow; the app itself is unchanged.

| Download | Value |
| --- | --- |
| Installer | `Glitch-Player-R4-4.2.4-x64-setup.exe`, 44,688,622 bytes |
| SHA-256 | `2650e9a21ff8e3eaa85248e576de9bc40131ef4881f30b4e3f1ff49ab3532026` |
| CAB payload SHA-256 | `c3b54a358c3e7e477e051722fc88229141cae5a3be672a2714b06cfdd8dd948c` |
| Signed | No. Windows SmartScreen may warn. |

- **Cut-off text fixed.** The long revision name no longer truncates: the installer uses a short window caption (`Glitch Player R4 4.2.4`), explicit three-line welcome and finish titles, and short per-page headers, with the full name kept in the version keys.
- **Flow redone:** welcome (what the installer does and the flow ahead) -> installer notices -> licence -> install-folder page (new; explains normalisation and that your data lives elsewhere) -> install -> finish (run / desktop-shortcut options, signing and photosensitivity reminders).
- **Defender guard rails in the installer:** after copying everything (launcher, CAB, notices, uninstaller), Setup locates `MpCmdRun.exe` (stock path or the newest Defender Platform folder) and runs a custom scan over the installed folder. Any reported threat rolls the install back (guarded by the own-folder rule) and aborts Setup; a machine without Defender gets a logged notice. Naming and registry entries now carry `Final Confluence 4.2.4`.

### Silent update 2 - 2026-11-04 (replacement build, version stays 4.2.4) - R3 ASCII sussed out

The `RELEASE_4.2.4` installer asset was replaced again, same name; only the R3 ASCII voice changed.

| Download | Value |
| --- | --- |
| Installer | `Glitch-Player-R4-4.2.4-x64-setup.exe`, 44,696,735 bytes |
| SHA-256 | `30056151623d8a6a4203100a59d55790053e743aa28c4f37f05052bf63a67e07` |
| CAB payload SHA-256 | `9093f045ef67a10e432f9bbb80d6b982f48a9bc16daab15a09a3a663d5771b29` |
| Signed | No. Windows SmartScreen may warn. |

- **The two burst types are totally separated.** The R3 ASCII style rotor's faces no longer crossfade on screen:
  each face owns its own half of the rotor weight, so a frame never mixes the small matrix stacks with the 006
  full-grid scatter ("split bursts of different types").
- **The soothing small ASCII leads.** The voice now opens and resets on the small-stack face, which dwells ~5.2-10 s
  with gentle 0.22 s eases, while the wilder 006 scatter only strikes for ~1.2-2.4 s.
- **Split along the slider too:** below 90% the voice stays entirely on the soothing small stacks; only at
  90-100% may the rotor strike the wilder, flurrier 006 scatter, whose glyphs grow larger the deeper the slider
  sits in that band.
- **No double table rows:** stack placement is lane-kept - a spot that would double another stack's rows is
  re-rolled (up to six tries).
- **Better effects:** the R3 ASCII blend profile peak lifts from [0.14, 0.60] to [0.18, 0.72] and its rate from
  0.12 to 0.14, so randomization gives the voice more presence.
- Tests: 179 web tests pass (new: `r3-ascii-rotor.test.mjs`).

## 4.1.3 - 2026-11-04 (GitHub release `RELEASE_4.1.3`) - Strands

- **Effect cancellation.** A slider dragged to zero now CANCELS its effect, and ZERO ALL cancels every effect: a cancelled voice can never be started by any automation - not by Continual Randomization, not by Auto Glitch's unpark, not by an aesthetic burst (in any phase). Only the user wakes it: raising its slider, applying a preset, Randomize All, or picking a tuned voice pair. The lights are not latched - their confirmation-gated system already owns their stopping rules.
- **Separation & confluence timing** (following the transition-timing roadmap): each voice carries its own join odds, so retargets move the board as staggered strands instead of one block; a board-wide confluence guard lets at most two hard cuts land close together while everything else glides around them; and glide voices travel slower than before (0.78 -> 0.62) so soft transitions last visibly longer against the hard cuts.
- **Proper preset determination** (following the preset-randomization roadmap): the MACHINE deck is fully determined by one seed - `buildMachinePresets(seed)` rebuilds the exact same 80 presets, the deck seed is recorded and logged at every roll, and presets now determine exactly which voices are awake and which stay cancelled.
- **New link-tree card: BIRDCAGE** - the YOU MAN "BIRDCAGE" radio playlist (`PD3RCwNseqQ`, loops like the other radio cards). Its timing profile is based on the measured first track: 338 s (5:38), brooding mid-tempo - pace 1.05, breath 1.10, cut 0.55.
- **Glyph tables re-pulled from the online sources:** `tools\build-glyph-tables.mjs` re-downloaded the pinned Unicode 15.1.0 and CP437 references and regenerated all 125 tables / 127,648 code points, verified byte-identical by `--check`.
- Tests: 173 web tests pass (new: `effect-cancellation.test.mjs`, the confluence-guard and BIRDCAGE track-timing tests, and the seeded-deck determination test).

## 4.1.2 - 2026-11-04 (GitHub release `RELEASE_4.1.2`) - Room & Cut

- **Per-track timing from YouTube info.** Each named link-tree video (all 12 tracks, including the WHITE 2 BLACK 2 WHITE fade link and the GHOST // OF ME MISSING LINK track) carries its own transition timing - retarget pace, breathing-room odds and cut character - built from what the embed already tells the player (video id and reported duration; no new network surface). Unknown videos class themselves by duration: long-form sits calm, short tracks run livelier. Local media keeps the defaults.
- **Soft-to-hard cuts.** A hard cut no longer always jumps 85% of the way: each cut lands on a spectrum from soft (about half way) to hard (about 95%), biased by the playing track's cut character, and hard-cutting tracks cut more often while soft ones cut rarely. The lights never hard-cut, exactly as before.
- **Defender guard in the build.** `build.cmd` now ends by scanning the installer and the working package with Microsoft Defender (`MpCmdRun.exe -Scan -ScanType 3`) and fails the build on any reported threat. A machine without Defender skips the scan with a notice.
- Tests: 163 web tests pass (new: `track-timing.test.mjs`, which checks every link-tree profile, the duration classes and the cut spectrum).

## 4.1.1 - 2026-11-04 (GitHub release `RELEASE_4.1.1`) - Breathing Room

- **Breathing room between transitions.** At each retarget a voice may begin a rest: it keeps its current level and target and is skipped by retargets until its breath ends (1.1-3.4 s), so each effect's travel gets quiet space around it. Glide voices breathe slightly more often; the wild crescendo modes breathe half as often so showpieces stay lively. Lights (Flash/Strobe) are excluded - their calmer bounded automation from 4.1.0 is untouched, and the caps (20% / 35%) and sub-3 Hz rate are unchanged.
- **The beautiful effects palette grows from 12 to 16 curated aesthetic-burst groups.** The four new groups are light-free and calm by design (peaks <= 90%, holds >= 2 s, rests >= 5 s): `prismDrift` (Prism Rift + Chromatic Echo + Hue/Color Cycle), `moonlightVeil` (R3 Ghost Spectrum + Tape Grain + Scanlines), `glyphRainfall` (Cyber Rain + Matrix Chord + Ink Glyphs) and `crtDaydream` (Rolling Scan + Neon Grad + Tape Grain + Scanlines).
- Tests: 158 web tests pass (new: `breathing-room.test.mjs` and `aesthetic-palette.test.mjs`, which also validates every palette group against the effects manifest). 255 tests in total with the 96 host tests and the CAB integration test.
- Build: the NSIS installer was built natively on Windows 11 x64 with `build.cmd`, all 255 tests passing, and scanned clean by Microsoft Defender; see BUILD_STATUS.md.

| Download | Value |
| --- | --- |
| Installer | `Glitch-Player-R4-4.1.1-x64-setup.exe`, 44,691,298 bytes |
| SHA-256 | `0471ffe6e8a3ba74d2e7e67a11ee345ce4a07c0c711c01a6b0622a165b885228` |
| CAB payload SHA-256 | `6a74551874f5adf26fba564ead1b126d48f2824a63609d8c12da8301a16a6b03` |
| Signed | No. Windows SmartScreen may warn. |

## 4.1.0 - 2026-11-04 (GitHub release `RELEASE_4.1`) - Definition & Confluence

- Added machine-checked definitions: `effects.manifest.json`, `presets.schema.json`, `surfaces.manifest.json` and their generators (`tools/build-effects-manifest.mjs`, `tools/build-surfaces-manifest.mjs`, both with `--check`).
- MACHINE presets are unfrozen and regenerated from a fresh random seed on every start and Refresh. LAB presets remain frozen.
- Automatic Flash/Strobe retargeting: calmer targets, one light yields while the other is high, and per-retarget random sharpness, ease speed and rest chance within fixed bounds. Caps (20% / 35%) and the sub-3 Hz rate are unchanged; the lights never hard-cut.
- Automations: randomized AI WARP B&W and hue steps, DROP THE MILK? colour base and flowing deck order, per-voice glide/cut transition characters with per-session and in-session re-rolls, and a minimum gap between hard cuts.
- Loosened non-light aesthetic limits in the SOFT-EYE engine (ASCII, Matrix, bombs).
- Landing card and link tree styling polish.
- Tests: 148 web tests pass (new: effects, presets schema, surfaces, MACHINE presets).
- Build: the NSIS installer was built natively on Windows 11 x64 with `build.cmd`, with all 245 tests passing (96 host, 148 web, 1 CAB integration); see BUILD_STATUS.md.

| Download | Value |
| --- | --- |
| Installer | `Glitch-Player-R4-4.1.0-x64-setup.exe`, 44,648,327 bytes |
| SHA-256 | `5a0aa423d743e083e6d04052ed544ac2d49dee0f0c47e35aeff5dff25b642670` |
| CAB payload SHA-256 | `91a4cc44825dcfecf2ba7c3b510770bce790c8dc93c61058e3e969e999d17aaf` |
| Signed | No. Windows SmartScreen may warn. |

A cross-built, untested, unsigned self-contained win-x64 publish ZIP (built on Linux) is also attached to the release for reference; end users should prefer the installer above.

## 4.0.0 - 2026-11-03 (GitHub release `RELEASE_4.0`)

First published build of Revision R Final 4.0, a newly coded, hardened Windows player. It is a .NET 10 WinForms host with a locked-down Microsoft Edge WebView2 view and a per-user NSIS installer. It merges the effects engines of Glitch Player 3.0, the Glitch Canvas Projector and AI WARP ENGINE.

| Download | Value |
| --- | --- |
| Installer | `Glitch-Player-R4-4.0.0-x64-setup.exe`, 44,726,047 bytes |
| SHA-256 | `dd211d5105ab3552f53f3426bebcea5b536d9538cc94ce930cfe379618bfa6ad` |
| CAB payload SHA-256 | `ebb83358b1d4ab8ac24b410eb46c9f3dee325b71af0df1857a89042348c111c4` |
| Signed | No. Windows SmartScreen may warn. |

> **Photosensitivity warning:** source videos and effects can produce flashing and high-contrast flicker. In the original 4.0.0 build, Flash and Strobe started at zero and were manual-only; the silent update below adds an optional, confirmation-gated automatic mode. This is not a photosensitivity-safe mode.

## Final revised release — 2026-11-04 (version remains 4.0.0)

The final revised build of 4.0. It replaces the installer and checksum assets of the existing `RELEASE_4.0` release; the version and release tag remain unchanged.

| Download | Value |
| --- | --- |
| Installer | `Glitch-Player-R4-4.0.0-x64-setup.exe`, 44,706,785 bytes |
| SHA-256 | `1782632d97d6bf15e21176c06119b9faa467dea06ba48e6e99ee653ac89aee26` |
| CAB payload | 44,065,208 bytes |
| CAB SHA-256 | `eed80772daff747ebf88f1e79e00c8976a9a7da89ef4e1905d6a7e3e0303b6ec` |

- **Gold card:** the logo screen's gold card gains a silver sheen, a slowly turning gold-and-silver rim, eight soft sparkle glints and a drifting prism refraction band. About every 30 s the card briefly turns once round the colour wheel and fades through black-and-white. The link-tree cards do the same in a slow wave (every 26 s) and hold still while hovered or focused. The tints never invert or flash, and reduced motion stops them.
- **GHOST PROTOCOL backdrop:** a calm, display-only glyph rain (`landing-backdrop.js`) runs behind the logo card and the link tree. It uses the guarded glyph tables, one glyph voice per column, cycles through the engine's DIA, SPECTRUM, CRT, PLASMA and LED hues, and adds an RGB split and a slow scan bar. It doesn't touch the effects board. It pauses while the window is hidden, stops for good once playback starts, and draws one still frame with reduced motion. The logo-screen overlay is more translucent so the backdrop shows through.
- **GHOST egg on the logo screen:** Ctrl+Alt+G now plays its DATA.. / "!" show where it is pressed, including on the logo screen and the link tree; previously it jumped to the link tree. Before playback, the MISSING LINK card appears inside the gold card on the logo screen (and at the end of the link tree), and the backdrop turns crimson and reads GHOST // OF ME // ARMED. Starting the card loads GHOST before its track; if the track can't start, the link tree stays open on its card. A card, another source or a failed GHOST load started while the show is still running is respected: the end of the show no longer re-arms the egg, moves focus or replaces the GHOST notice.
- **Ghost key:** Ctrl+Alt+G follows the physical G key, so it works on any keyboard layout. Inside a text field it counts only when the key types a g, so AltGr characters can still be typed.
- **Glyph tables rebuilt and guarded:**
  - `tools\build-glyph-tables.mjs` regenerates `webui\js\glyph-tables.js` from the Unicode Character Database 15.1.0 and the IBMGRAPH/CP437 mappings, each pinned by size and SHA-256. The result is identical to the projector's 125 tables and 127,648 code points.
  - `node tools\build-glyph-tables.mjs --check` downloads the references again and fails on any difference.
  - At startup every table is validated (name, ranges, forbidden code points, count and checksum) and frozen. A failing table is left out with a logged warning.
  - The Unicode License v3 is included in THIRD-PARTY-NOTICES.
- **White specks fixed:** in the native app (seen at 150% scale on an NVIDIA GPU), the logo screen's gold glow faded to fully transparent over the live backdrop and left a static arc of white specks near the window controls. The glow now keeps a small alpha floor; the specks are gone and the glow looks the same.
- Tests: `build.cmd` passed 96 host tests, 132 web tests and 1 CAB integration test; the CAB contains 246 runtime files. New web tests cover the generated glyph tables and their guard, the landing backdrop, and the logo-screen egg flow, including the physical-key rule and a card started during the show. An independent code review found that last bug, which was fixed before this build. The installed build was checked natively: the logo screen, Ctrl+Alt+G with its confirmation, the "!" show and the armed MISSING LINK card. See BUILD_STATUS.md.

## Silent update 2 — 2026-11-04 (version remains 4.0.0)

Replacement build for the existing `RELEASE_4.0` installer and checksum assets; the version and release tag remain unchanged.

| Download | Value |
| --- | --- |
| Installer | `Glitch-Player-R4-4.0.0-x64-setup.exe`, 44,666,857 bytes |
| SHA-256 | `8c5ba4cc8b98732f5caadff27b1677ff80fffd399b3874643dda30a1b4b51b0b` |
| CAB payload | 44,098,846 bytes |
| CAB SHA-256 | `9f09ebe4114497d94c4815252410fc5e67da638d474930da0f6f17cd80c5e5ba` |

- **Glyph tables:** checked against the Glitch Canvas Projector: the same 125 printable ASCII and Unicode tables with 127,648 code points, so nothing was rebuilt. Glyphs are now picked by Unicode code point everywhere, so astral characters (for example Egyptian hieroglyphs) are no longer split into broken halves.
- **Selected table drives the voices:** the selected table now goes to the main ASCII voice. Cyber Rain, R3 ASCII, Matrix ASCII, Matrix Chord, R3 Matrix ASCII, R3 Matrix Chord, Data Bomb and R3 Data Bomb each take their own table, rotated forward from the selection, so the voices mix scripts instead of repeating one. **Engine realms (Revision 3)** keeps the original glyphs and **All scripts** mixes every table. The count next to the menu shows the rotation when hovered. Changing the table during playback takes effect immediately, including for main ASCII and R3 ASCII voices that are already running. Ink Glyphs, Font Burn, the R3 shimmer veil and the R3 ASCII brightness ramp keep their own glyphs.
- **GHOST // OF ME fixed:**
  - The preset now loads only when its MISSING LINK track (`DmStNF35o1w`) starts, and it loads before the track plays.
  - Previously, Ctrl+Alt+G before playback gave GHOST to whichever source started next. Now it only reveals and highlights the MISSING LINK card; starting any other source clears the highlight and never loads GHOST.
  - During playback, Ctrl+Alt+G loads GHOST and switches to the track. If YouTube can't start, GHOST applies over the current source.
  - A typed or pasted MISSING LINK link also loads GHOST. Automatic Flash & Strobe movement is enabled only after the Ctrl+Alt+G confirmation in the same session (or if the switch is already on).
  - If GHOST can't be applied, the track doesn't start.
- Tests: 15 new web tests run the real GHOST code and glyph routing, including the real Revision 3 runners across table changes and a check that the verbatim Revision 3 code is unchanged. `build.cmd` passed 96 host tests, 113 web tests and 1 CAB integration test.

## Silent update — 2026-11-04 (version remains 4.0.0)

Replacement build for the existing `RELEASE_4.0` installer and checksum assets; the version and release tag remain unchanged.

| Download | Value |
| --- | --- |
| Installer | `Glitch-Player-R4-4.0.0-x64-setup.exe`, 44,675,313 bytes |
| SHA-256 | `133e132475679b38b08cff44da6bd04a24d1bd1a635d7d27dc0b5661d23dc9d5` |
| CAB payload | 44,092,932 bytes |
| CAB SHA-256 | `df1896684b3992c09d2f06fe36528643a2fa24b6b5eadaeec32344de68af5332` |

- Flash and Strobe have a confirmation-gated, session-only automatic mode, capped at 20% and 35%. The switch defaults off; manual and preset levels remain active within those caps while it is off. Local paused/ended media holds automated output at zero.
- Presets now apply their saved Flash and Strobe levels through the same caps. The GHOST // OF ME egg remains separately confirmed and enables the automated mode only after applying its saved levels.
- HSL Rainbow and Hue/Color Cycle are more saturated. B&W inversion eases more gently from 50% to 75% and retains more color in the inverted range.
- `build.cmd`: 96 host tests, 98 web tests and 1 CAB integration test passed. The integrated-browser preview loaded a generated silent WAV, verified the local-playback HUD, the 20%/35% slider maxima and the confirm-gated switch, and reported no console or page errors. This was not a native installer run; Ctrl+Alt+G was not verified natively.

### Merged effects engine

- 43 effect voices, each with its own slider and lock and starting at 0:
  - 18 from the Glitch Canvas Projector;
  - 20 from Glitch Player Revision 3.0;
  - 5 from AI WARP ENGINE.
- The AI WARP MASTERS panel adds:
  - DROP THE MILK?, a dependency-free, Milkdrop-inspired feedback automation with 80 auto presets;
  - B&W Strength and Hue Offset masters that drive each core voice and its R3 twin together.
- The projector's large printable ASCII and Unicode glyph banks are kept, with their original AI Warp / Revision 3 bank credits.
- Presets:
  - USER presets are kept in the `glitchCanvasPresets_v2` format, up to 500, with validated JSON import/export.
  - The 80-preset MACHINE bank and the 250 LAB snapshots are frozen. Saving never changes a built-in preset.
- Hard user locks hold a slider through presets, the preset glide, Auto Glitch, Continual Randomization and the AUTO cycler. A lock saved in a USER preset comes back as a preset lock, which the next preset releases.
- Flash and Strobe start at zero. Optional automatic movement is session-only, confirmation-gated and capped at 20% and 35%; manual and preset levels remain active within those caps while it is off. Paused or ended local media holds automated output at zero. The separately confirmed GHOST // OF ME easter egg applies its saved levels and can enable automatic movement.
- Freeze Frame (button or **S**) saves a PNG of the picture with its effects, without the app's controls. The host captures it with the HUD hidden, and the Save dialog starts in Pictures and refuses the app's own folders.

### Smooth playback

- The ASCII scatter field and R3 ASCII now draw strips from pre-drawn glyph sheets:
  - ASCII work per frame went from about 20 ms to about 3 ms (p50);
  - the glyph-sheet readback is deferred so it no longer stalls on the GPU (p50 16.6 ms to 1.7 ms).
- The host reports every display's refresh rate, and the frame governor uses the rate that actually paces frames. A 24, 30 or 50 Hz projector or TV is no longer mistaken for overload.
- Governor recovery:
  - it steps back up after about 400 frames of headroom;
  - the wait doubles (up to 64x) after a relapse and resets once the effects get lighter;
  - an attached 30 Hz display doesn't hide a 60 Hz overload.

### Startup, window and link tree

- Startup is logo -> source picker -> effects HUD:
  - The logo screen lists every accepted audio/video type with its codec caveat.
  - Choose Media opens the local-file picker and the YouTube link tree.
  - The effects HUD appears only after YouTube or local playback actually starts. Failed media leaves the picker available.
- Borderless, draggable, resizable window with the bracketed **[R]** icon on the player, launcher, installer and uninstaller.
- Floating controls (shield, refresh, fullscreen, minimize, maximize/restore, close) sit in their own 36 px top bar, so they no longer cover Auto Glitch, Show Presets or Now Playing. The logo and source screens' scrollbars start below that bar.
- The YouTube link tree is a grid of named buttons with an artist/channel line and the full title as a tooltip. Raw URLs are no longer shown.
- WHITE 2 BLACK 2 WHITE, the 3.0 fade link, is restored:
  - it waits for confirmed playback like the other links;
  - it switches on Continual Randomization only once loading starts.
- Logo screen look:
  - the 3.0 full-screen gold scan line and panel sheen are restored;
  - the 4.0 [R] gleam is back: every 10 s a soft shine sweeps across the [R], and its tint drifts a full turn round the colour wheel every 24 s;
  - the WHITE 2 BLACK 2 WHITE card carries the same tinted gleam;
  - reduced-motion stops all of them.
- The HUD mark reads REVISION 4 // HARD LIGHT // MOONLIGHT.
- Taskbar Jump List **Refresh** (also in the floating controls) asks before stopping media and returning to the logo; No is the default.
- WATCH / SOURCE and author links ask before opening in the Windows default browser, never inside the app.
- F11, Alt+Enter and Esc fullscreen keys work while WebView2 has focus, without enabling browser shortcuts.

### Hardening

The hardening follows K-Meleon-R and AI WARP ENGINE. See [SECURITY.md](SECURITY.md) for details.

- **Web UI:**
  - strict CSP with `connect-src 'none'` and Trusted Types with no policies;
  - no inline scripts or styles;
  - tests fail the build if the CSP or the forbidden script sinks change.
- **Navigation and frames:**
  - only the app's own document may load at the top level;
  - frames are limited to the YouTube embed;
  - downloads are cancelled;
  - `javascript:`, `data:`, `file:` and theme/pointer files are blocked;
  - `chrome.webview` is removed from other documents.
- **Permissions:** every WebView2 permission request (camera, microphone, clipboard, location, notifications and others) is denied without a prompt.
- **WebView2:** no DevTools, host objects, browser accelerators or autofill. SmartScreen is required.
- **Windows media controls:** `HardwareMediaKeyHandling` is turned off, so other programs, headsets and media keys can't pause or skip playback.
- **Cursor guard** (from K-Meleon-R), at both the registry and the page layer.
- **Capture shield** (off by default) and a **Defender watchdog** that only warns.
- **Startup checks:**
  - the app refuses WebView2 environment/policy overrides, profiler and startup hooks;
  - `SetDllDirectory("")`;
  - best-effort process mitigations.
- **Packaging:**
  - a small .NET Framework launcher verifies a hash-pinned `payload.cab`;
  - it extracts the fixed manifest into a per-user runtime cache named by the CAB hash;
  - it revalidates every file on each launch and refuses unexpected or redirected entries.
  - This is verified extraction, not virtualization, encryption or code signing.
- **Installer:** per user, no administrator rights, refuses to run while the app is open, downloads nothing. No telemetry, auto-update or FFmpeg.

### Tests and verification

- `build.cmd` runs 171 tests: 96 xUnit host tests, 74 Node web tests and 1 Windows CAB integration test. All passed for this installer.
- The installed build was checked on Windows 11 Pro (x64):
  - silent install;
  - logo and card gleams, by screenshot bursts;
  - Choose Media;
  - close with no `host.log`;
  - silent uninstall.
- Earlier builds of this release covered YouTube and local playback, Refresh, fullscreen, drag/resize, Freeze Frame, presets and user locks. See [BUILD_STATUS.md](BUILD_STATUS.md) for exactly what was verified on which build.

### Not verified / known limitations

- The binaries are **not code-signed**. Compare the installer with its `.sha256` file before running it.
- This exact installer was not re-checked at 150% scaling, in fullscreen or with the HUD hidden; earlier builds of this release were.
- No other Windows versions or machines were tested.
- Uninstalling keeps `%LOCALAPPDATA%\Glitch-Player-R4` (presets, settings and the runtime cache) unless you choose to delete it.
- Security depends on the shared WebView2 Runtime staying up to date. YouTube content is third-party.

### Commits

- `b90c0ad`: add the hardened WebView2 app.
- `427b6fe`: user locks, media-key block, Freeze Frame, smooth ASCII, cadence-aware governor.
- `ed65294`: logo -> media picker -> HUD startup, borderless [R] window, CAB launcher.
- `841cc41`: window bar clears the HUD, named YouTube link tree, REVISION 4 mark.
- `abbde8d`: restored the WHITE 2 BLACK 2 WHITE fade link and the 3.0 logo gleam; scrollbars below the window bar.
- Release commit: 4.0 [R] gleam and card gleam with hue drift, changelog and release notes.

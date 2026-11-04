# Glitch Player - Standalone Revision R Final 4.1

Revision R Final 4.1 is a newly coded, hardened Windows desktop player. It is a .NET 10 WinForms host with a locked-down Microsoft Edge WebView2 view, installed per user by an NSIS setup. It merges every effect voice from Glitch Player Revision 3.0, the Glitch Canvas Projector and AI WARP ENGINE into one effects engine and one preset system.

This is release **4.2.4 "Final Confluence"**, the final consolidated release, published as the GitHub release [`RELEASE_4.2.4`](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.2.4). It carries 4.1.3 "Strands" ([`RELEASE_4.1.3`](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.1.3)), 4.1.2 "Room & Cut" ([`RELEASE_4.1.2`](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.1.2)), 4.1.1 "Breathing Room" ([`RELEASE_4.1.1`](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.1.1)), 4.1.0 "Definition & Confluence" ([`RELEASE_4.1`](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.1)) and the 4.0 line ([`RELEASE_4.0`](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.0)). See [What's new in 4.1](#whats-new-in-41).

> **Photosensitivity warning:** source videos and effects can produce flashing and high-contrast flicker. Flash and Strobe start at zero and are capped at 20% and 35%. Presets can set their saved values within those caps; Randomize does not change them. Optional automatic movement is off by default, session-only and requires confirmation. When enabled it applies on any media, fades in, and eases to zero while local media is paused or ended. The GHOST // OF ME easter egg applies its saved, capped levels when its MISSING LINK track starts (including a typed or pasted link); it enables automatic movement only after its Ctrl+Alt+G confirmation. This is not a photosensitivity-safe mode.

The installer and app are **not code-signed**. See [BUILD_STATUS.md](BUILD_STATUS.md) for what has been verified, [SECURITY.md](SECURITY.md) for the hardening and [CHANGELOG.md](CHANGELOG.md) for the changes in this release.

## About

Glitch Player R Final is a hardened Windows glitch-video player by River Lyle Reuveni (Imortalimp). Load your own audio and video, then layer 43 effect voices over the picture and steer them by hand, by presets or by automation. Everything runs locally in a locked-down WebView2 window with no network access beyond the link-tree and embed rules in [SECURITY.md](SECURITY.md). Licence: CC0 1.0. The binaries are not code-signed.

## What's new in 4.1

- **4.2.4 "Final Confluence" (final consolidated release):** every voice is untied - moving an AI WARP master wakes only its own core voice, never the R3 twin, so ASCII no longer triggers when R3 ASCII is used, and each voice is independently locked, triggered or set 0-100% via its own slider. B&W Invert can no longer start automatically after ZERO ALL (the inversion sweep and Auto Glitch rail hops respect cancellation). Only explicit randomization may form confluence pairs. Carries all of 4.1.0-4.1.3 below.
- **4.1.3 "Strands":** dragging a slider to zero cancels that effect and ZERO ALL cancels everything - no automation can restart a cancelled voice until you wake it (slider, preset, Randomize All or a tuned pick). Voices retarget as staggered strands with their own join odds, at most two hard cuts land close together, glides travel longer, MACHINE decks are reproducible from one seed, and the link tree gains the BIRDCAGE radio card with a timing profile measured from its 5:38 first track.
- **4.1.2 "Room & Cut":** every named link-tree video carries its own transition timing built from YouTube's own info - retarget pace, breathing odds and a cut character from soft to hard - and unknown videos class themselves by reported duration. Cuts now land on a soft-to-hard spectrum instead of one fixed jump. `build.cmd` ends with a Microsoft Defender scan of the installer and working package and fails on any threat.
- **4.1.1 "Breathing Room":** silence between effect transitions - at each retarget a voice may rest for 1.1-3.4 s, holding its level so each transition has room to breathe (lights excluded; wild modes breathe half as often). The curated aesthetic-burst palette grows from 12 to 16 groups with four new light-free scenes: `prismDrift`, `moonlightVeil`, `glyphRainfall` and `crtDaydream`.
- **Defined once, checked by tests.** `webui/data/effects.manifest.json` (43 voices, with caps, photosensitivity flags and transition character), `presets.schema.json` and `surfaces.manifest.json` (10 surfaces, 12 link-tree cards) describe the effects, presets and screens. `node tools/build-effects-manifest.mjs --check` and `node tools/build-surfaces-manifest.mjs --check` fail when they drift from the code.
- **Fresh MACHINE presets.** The 80 generated MACHINE presets are no longer frozen and are re-rolled on every start and Refresh. LAB presets stay fixed.
- **Calmer, non-coincident lights.** Flash (20%) and Strobe (35%) caps are unchanged. Automatic light targets are gentler, the lights rarely peak together, and each light re-rolls its sharpness, ease speed and rest chance (bounded) at every retarget. Lights never hard-cut.
- **Varied automations.** AI WARP masters, DROP THE MILK? colour and deck order, and the continual randomizer vary per session. Each voice has a glide or cut character (some swap per session) and its own timing jitter, so soft eases and occasional hard cuts mix.
- **Landing card and link tree.** Gradient title, framed media list and glowing accent link cards. Reduced motion still switches the motion off.
- **Looser aesthetic limits** for the non-light voices (ASCII, Matrix, bombs) in the SOFT-EYE engine.

## Starting and controlling the window

The sequence is **logo landing -> source selection -> playback and effects HUD**. The logo screen lists every offered audio/video extension and its codec caveat. Choose Media opens the local file picker and the YouTube link tree, not the effects HUD. The link tree is a grid of named buttons (for example TERMINAL 1987, REVISIONS, MOONLIGHT, DEFCON 1), each with an artist/channel line and the full title as a tooltip. WHITE 2 BLACK 2 WHITE, the 3.0 fade link, plays its looping fade and switches on Continual Randomization; it does not enable Flash or Strobe automation. Its card carries the same slow gleam as the logo. Controls appear only when YouTube reports playback or local media starts playing; failed media leaves the picker available.

Effects automation and whole-app filters wait until playback. The logo screen keeps the 3.0 gold look, a slow full-screen gold scan line and a soft sheen across the panel, plus the 4.0 gleam: every 10 s a soft shine sweeps across the [R], and its tint drifts slowly round the colour wheel (a full turn every 24 s). The final 4.0 gold card adds a silver sheen, a slowly turning gold-and-silver rim, eight soft sparkle glints and a drifting prism refraction band. About every 30 s the card briefly turns once round the colour wheel and fades through black-and-white; the link-tree cards do the same in a slow wave (every 26 s) and hold still while hovered or focused. The tints never invert or flash.

Behind the logo card and the link tree runs a calm GHOST PROTOCOL backdrop (`landing-backdrop.js`): glyph rain from the guarded glyph tables, one glyph voice per column, cycling through the engine's DIA, SPECTRUM, CRT, PLASMA and LED hues with an RGB split and a slow scan bar. It is display only: it doesn't touch the effects board, pauses while the window is hidden, stops for good once playback starts, and draws one still frame with reduced motion. Reduced motion also stops every card animation above. Rapid decorative UI flicker is disabled.

The window has no native/custom title strip or visible border. Drag the empty top area, logo or source heading; resize at the invisible edges and corners. Floating controls provide shield, refresh, fullscreen, minimize, maximize/restore and close. They sit in a 36 px top bar of their own, so the HUD's top row (Auto Glitch, Show Presets, Now Playing and the faint REVISION 4 // HARD LIGHT // MOONLIGHT mark) starts below them. The full **[R]** icon is embedded in the player, launcher, installer and uninstaller.

Right-click the running app's Windows taskbar icon for **Refresh** (also available in the floating controls). It asks before stopping media and returning to the logo; No is the default. Saved USER presets remain; unsaved levels reset, including manual Flash/Strobe levels. WATCH / SOURCE and author links ask before opening in the Windows default browser, never in the app.

## Merged effects

There are 43 effect voices: 39 timed overlay voices and 4 filter-path master voices. Each has its own slider and lock and starts at 0. An effect only appears when you, a preset or Auto Glitch raise its slider.

A lock you set holds its slider through presets, the preset glide, Auto Glitch, Continual Randomization and the AUTO preset cycler. Locks saved in a preset are released by the next preset you apply. ZERO ALL EFFECTS still zeroes every voice, including locked ones.

| Source | Voices |
| --- | --- |
| Glitch Canvas Projector (18) | Neon Grad, Scanlines, Flash, HSL Rainbow, ASCII, Font Burn, Strobe, Gemini Bomb, Data Bands, VHS Glitch, Chromatic Echo, Temporal Slices, Signal Tear, Cyber Rain, Prism Rift, Orbit HUD, R3 Ghost Spectrum, R3 V-Sync |
| Glitch Player Revision 3.0 (20) | Tech Artist, Data Bomb, Ink Glyphs, Matrix ASCII, Matrix Chord, B&W Invert, Hue/Color Cycle, R3 Neon Grad, R3 Scanlines, R3 Gemini Bomb, R3 Tech Artist, R3 Data Bomb, R3 Ink Glyphs, R3 Matrix ASCII, R3 Matrix Chord, R3 HSL Rainbow, R3 ASCII, R3 Font Burn, R3 Data Bands, R3 VHS Glitch |
| AI WARP ENGINE (5) | Rolling Scan, Tape Grain, Tracking Tear, R3 B&W Invert, R3 Hue/Color Cycle |

The AI WARP MASTERS panel adds:

- **DROP THE MILK?**: AI WARP's dependency-free, Milkdrop-inspired feedback automation with 80 auto presets (a fresh colour base each session, played in a flowing order) and its own opacity slider and lock.
- **B&W Strength** and **Hue Offset**: masters that drive each core voice and its R3 twin together.

HSL Rainbow and Hue/Color Cycle use a more saturated color response. B&W inversion eases more gently through the 50-75% slider range and keeps more color in its inverted output.

AI WARP's warp modes, its Three.js renderer and the R3 Flash/Strobe twins are deliberately not included. Saved Flash/Strobe values in immutable presets remain intact and are applied when loaded, capped at 20% and 35%. Automatic movement remains off unless you confirm the session-only switch; the confirmed GHOST // OF ME easter egg (Ctrl+Alt+G) also enables it.

The printable ASCII and Unicode glyph banks from the projector are included (125 tables, 127,648 code points), with their original AI Warp / Revision 3 bank credits. For the final release they were rebuilt from fixed references: `tools\build-glyph-tables.mjs` generates `webui\js\glyph-tables.js` from the Unicode Character Database 15.1.0 and the IBMGRAPH/CP437 mappings, each pinned by size and SHA-256. The rebuilt tables are identical to the projector's. `node tools\build-glyph-tables.mjs --check` downloads the references again and fails if the committed tables differ. At startup `glyph-library.js` validates every table (name, ranges, forbidden code points, count and checksum) and freezes it; a table that fails is left out, a warning is logged, and the count's hover text reports the result. Glyphs are taken by Unicode code point, so astral characters are never split. The glyph-source menu defaults to **Engine realms (Revision 3)**, which keeps every voice on its original glyphs. Choosing a table gives it to the main ASCII voice; the other glyph voices each take their own table, rotated forward from it in this order: Cyber Rain, R3 ASCII, Matrix ASCII, Matrix Chord, R3 Matrix ASCII, R3 Matrix Chord, Data Bomb and R3 Data Bomb. Hover over the count next to the menu to see the current assignment. **All scripts** mixes every table into every voice. Ink Glyphs and Font Burn keep their own alphabets, and the R3 shimmer veil and R3 ASCII brightness ramp keep the Revision 3 glyphs. Some rare-script tables can show as empty boxes where Windows has no font for them.

## Smooth playback

A frame governor watches frame timing. When the machine can't keep up, it lowers the effects canvas in up to two steps: first a lower resolution and glyph density, then lower still with effects drawn at half rate. After about 400 frames with clear headroom (about 17 s at 24 Hz, 7 s at 60 Hz) it steps back up. If a step up has to be undone soon after, the wait before the next try doubles each time, and goes back to normal once the effects get lighter.

The app reports every display's refresh rate to the page, so a 24, 30 or 50 Hz projector or TV isn't mistaken for overload. WebView2 can pace frames to the primary display rather than the one showing the window, so the governor uses the rate that matches the measured frame timing.

## Freeze Frame

Once playback has started, **FREEZE FRAME** (bottom-left buttons) or **S** saves a still of the picture with its effects, without the app's controls. The app asks where to save the PNG; the dialog starts in Pictures and refuses the app's install and data folders.

## Presets

| List | Contents |
| --- | --- |
| USER | Your own presets. Stored separately from the built-in lists, up to 500. |
| MACHINE | 80 Deepseek presets, generated from a fresh random seed on every start and Refresh. Flash and Strobe are kept under their caps and never high together. Deepseek-1 (OLD SOUL) is fixed. |
| LAB 250 | The 250 projector machine snapshots, M001 PHOSPHOR/01 to M250 SIGNAL RAIN/10. |

- LAB presets are frozen. MACHINE presets are regenerated each session and are not frozen. Saving never changes either bank; it always creates or replaces a USER preset, so save a MACHINE preset you like before closing the app.
- User presets keep the `glitchCanvasPresets_v2` storage format inside the app's WebView2 profile.
- **Export** writes `{"format":"signal-lab-presets","version":1,"presets":[...]}` (at most 500 presets and 2 MB). The save dialog opens in Documents and refuses the app's install and data folders, because an upgrade or uninstall could delete files there.
- **Import** validates every entry before asking for confirmation. Names are 1-80 characters, each preset may have up to 128 effects, and presets with matching names are replaced.

## Media

Local files are chosen with the file picker. The app plays a file directly in WebView2 when the format is supported natively.

If native playback isn't supported, the host converts the file with the Windows **MediaTranscoder**: video becomes H.264/AAC MP4 and audio becomes AAC M4A. No FFmpeg or other third-party media library is included. Only codecs installed in Windows can be decoded, and Windows N editions need the Media Feature Pack.

| Kind | File extensions offered |
| --- | --- |
| Audio | mp3, m4a, aac, wav, ogg, oga, opus, flac, wma, aif, aiff, ac3, amr |
| Video | mp4, m4v, webm, mov, mkv, avi, wmv, asf, mpg, mpeg, ts, m2ts, mts, 3gp, 3g2, ogv |

Converted files are cached under a keyed HMAC-SHA256 name and removed after 30 days.

YouTube links you enter play through the privacy-enhanced embed (`youtube-nocookie.com`). Nothing connects to the network unless you enter a link.

## Keyboard

| Key | Action |
| --- | --- |
| F11 or Alt+Enter | Toggle fullscreen |
| Esc | Leave fullscreen; close the preset browser |
| D | Toggle DROP THE MILK? (ignored while typing) |
| S | Freeze Frame (ignored while typing and on the welcome screen) |
| Ctrl+Alt+G | Hidden GHOST // OF ME easter egg. Asks for confirmation first, then plays its DATA.. / "!" show, also on the logo screen and the link tree. During playback it loads the GHOST preset and switches to its MISSING LINK track. Before playback it reveals the MISSING LINK card (inside the gold card on the logo screen, at the end of the link tree after Choose Media) and the backdrop turns crimson; GHOST loads when that track starts. Other sources never get GHOST. The confirmation also turns on automatic Flash & Strobe movement (capped at 20% / 35%; photosensitivity warning applies). A typed or pasted MISSING LINK link loads GHOST too, but without the confirmation its lights stay still. Ctrl+Alt+G uses the physical G key, so it works on any keyboard layout; inside a text field it counts only when the key types a g, so AltGr characters can still be typed there. |

Keyboard media keys, headset buttons and other apps can't control playback, because the player doesn't register with Windows media controls. Use the app's own controls.

## Install and uninstall

Requirements: 64-bit Windows 10 version 2004 (build 19041) or later, Windows .NET Framework 4.8 for the small launcher, and the Microsoft Edge WebView2 Runtime (Evergreen). The .NET 10 player runtime is bundled; no separate .NET 10 installation is needed.

1. Download `Glitch-Player-R4-4.2.4-x64-setup.exe` and its `.sha256` file from the [RELEASE_4.2.4 GitHub release](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.2.4), or build them yourself (see below). Compare the installer's SHA-256 with the `.sha256` file, then run it. Windows SmartScreen may warn because the file is unsigned.
2. Setup installs for the current account only, into `%LOCALAPPDATA%\Programs\Glitch-Player-R4`, without administrator rights. It adds a Start Menu shortcut but no desktop shortcut.
3. Setup and the uninstaller refuse to run while the app is open. At the end of the install, Setup asks Microsoft Defender to scan everything it installed and rolls the install back if a threat is reported.

Your data is kept in `%LOCALAPPDATA%\Glitch-Player-R4`: the WebView2 profile with your presets, `settings.json`, the media cache and key, and size-capped logs. Uninstalling keeps this folder unless you choose to delete it. Export your presets first if you want a backup.

### CAB payload, not a ZIP or virtualized filesystem

The working package in `out\app` is an in-folder `GlitchPlayerR4.exe` launcher plus `payload.cab` and informational SHA-256 files. The installer installs these working files; it does not install a loose copy of the player runtime.

The launcher verifies the CAB against a SHA-256 embedded at build time, then extracts its fixed manifest into `%LOCALAPPDATA%\Glitch-Player-R4\runtime\<CAB SHA-256>`. On every launch it verifies the complete cached file set and each file's size/hash before starting the player. CAB members use generated identifiers, not archive-supplied output paths. Redirected folders/files, unexpected members and extra cached files are refused; verified files stay read-locked while the player runs. An interrupted or damaged cache fails visibly; remove only the version folder named in the error to regenerate it from the verified CAB.

This is **verified extraction, not virtualization, encryption, code signing or an OS sandbox**. Executable files must exist on disk, and the unsigned launcher cannot establish publisher authenticity or defend against an already-compromised account. Runtime caches are retained with other app data on uninstall unless you choose data deletion. Runtime dependency licenses are inside the CAB and its extracted `licenses` directory.

The app includes K-Meleon-R's cursor guard. While the app runs, it resets mouse pointers that aren't built-in Windows cursors and turns off "allow themes to change mouse pointers". These per-user changes stay after the app closes; see [SECURITY.md](SECURITY.md).

## Build from source

Requirements:

- The .NET 10 SDK
- Node.js 22 or later (tests, icon generation and CAB packaging)
- NSIS 3 (`makensis.exe` on `PATH` or in Program Files)
- Windows `makecab.exe` and the .NET Framework C# compiler (the launcher uses the Windows-provided .NET Framework/WPF assemblies; no new package dependency)

From this folder, run:

```cmd
build.cmd
```

`build.cmd` is a plain cmd script that doesn't use PowerShell or change the execution policy. It:

1. Generates the nine-size [R] icon and runs the .NET and web tests.
2. Publishes the self-contained `win-x64` host to `out\publish`.
3. Checks that the publish output contains the web UI and license files, and no FFmpeg files or `.pdb` symbols.
4. Builds `out\app\payload.cab` and compiles the small launcher with pinned CAB and file hashes.
5. Tests fresh/cached extraction and rejection of changed CABs, modified files, unexpected files and redirected cache entries.
6. Compiles `out\Glitch-Player-R4-4.2.4-x64-setup.exe`, writes its SHA-256 to a `.sha256` file next to it, and ends with a Microsoft Defender scan of the installer and working package (the build fails on any reported threat). No ZIP is produced.

To run the tests on their own:

```cmd
dotnet test host.Tests\GlitchPlayerR4.Tests.csproj -c Release
npm test
```

`out\`, `bin\` and `obj\` are not committed.

## Layout

| Path | Purpose |
| --- | --- |
| `host\` | WinForms + WebView2 host: window, navigation and message policy, media conversion, cursor/Defender/capture guards |
| `host.Tests\` | xUnit tests for the pure host policy (`AppPolicy`) |
| `webui\` | The local web UI served from `https://player-r4.local/` (CSP + Trusted Types) |
| `webui\js\glitch-player.js` | Merged player core, effects registry and preset system |
| `webui\js\glitch-engine.js`, `r3-factories.js`, `r3-ghost-vsync.js`, `glyph-library.js` | Effect engines and the guarded glyph library |
| `webui\js\glyph-tables.js` | Generated glyph tables (do not edit; run `node tools\build-glyph-tables.mjs`) |
| `webui\js\landing-backdrop.js` | The display-only GHOST PROTOCOL backdrop behind the logo card and link tree |
| `webui\js\r4-policy.js`, `host-bridge.js`, `yt-embed.js` | Input validation, the narrow host bridge and the YouTube embed |
| `tests\web\` | Node tests for the merge manifest, policy, bridge, static CSP rules, host guards (cursor guard, permissions, media controls), Freeze Frame, locks, the frame governor, the GHOST // OF ME egg, the generated glyph tables and the landing backdrop |
| `installer\` | `setup.nsi` and the installer notices |
| `launcher\`, `tools\`, `assets\` | Verified CAB bootstrapper, packaging/icon tools, the glyph-table generator and the generated [R] icon |
| `tests\packaging\` | Real launcher extraction and CAB/cache integrity checks |

## Credits and license

Glitch Player is dedicated to the public domain under [CC0 1.0](LICENSE.txt) by River Lyle Reuveni (Imortalimp), <https://www.imortalimp.nl>.

It merges Glitch Player Revision 3.0, the Glitch Canvas Projector and AI WARP ENGINE (CC0 1.0 / The Unlicense) by the same author. The host hardening patterns and cursor guard come from K-Meleon-R. AI WARP ENGINE credits Arena.ai and GitHub Copilot as creative tools.

Bundled components keep their own licenses; see [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt).

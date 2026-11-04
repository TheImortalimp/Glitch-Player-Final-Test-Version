# Changelog - Standalone Revision R Final 4.0

## 4.0.0 - 2026-11-03 (GitHub release `RELEASE_4.0`)

First published build of Revision R Final 4.0, a newly coded, hardened Windows player. It is a .NET 10 WinForms host with a locked-down Microsoft Edge WebView2 view and a per-user NSIS installer. It merges the effects engines of Glitch Player 3.0, the Glitch Canvas Projector and AI WARP ENGINE.

| Download | Value |
| --- | --- |
| Installer | `Glitch-Player-R4-4.0.0-x64-setup.exe`, 44,726,047 bytes |
| SHA-256 | `dd211d5105ab3552f53f3426bebcea5b536d9538cc94ce930cfe379618bfa6ad` |
| CAB payload SHA-256 | `ebb83358b1d4ab8ac24b410eb46c9f3dee325b71af0df1857a89042348c111c4` |
| Signed | No. Windows SmartScreen may warn. |

> **Photosensitivity warning:** source videos and effects can produce flashing and high-contrast flicker. In the original 4.0.0 build, Flash and Strobe started at zero and were manual-only; the silent update below adds an optional, confirmation-gated automatic mode. This is not a photosensitivity-safe mode.

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

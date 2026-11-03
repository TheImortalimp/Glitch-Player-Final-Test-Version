# Build status - Standalone Revision R Final 4.0

This file records what was actually built and tested, and what hasn't been tested yet. "Verified" means the check was run and passed on the machine below. The binaries are **not code-signed**.

## Current build

| Item | Value |
| --- | --- |
| Installer | `out\Glitch-Player-R4-4.0.0-x64-setup.exe` (built by `build.cmd`, not committed) |
| Size | 44,674,417 bytes |
| SHA-256 | `0632d75531aa0b3b9c80cae870d9da157387cfc836c400acfd5cdae81b9ca1fb` |
| Working package | `out\app\GlitchPlayerR4.exe` (457,216 bytes) plus `payload.cab` (44,091,974 bytes) and SHA-256 files; no ZIP |
| CAB SHA-256 | `20e6e0b6b0bcbb6ece861c220b11c1ceabe9dd2a945156baace27782c21ba7b1` |
| Runtime | 244 files, 144,686,693 bytes, extracted to the per-user cache named by the CAB hash |
| Signed | No |
| Built | 2026-11-03 |

Build machine: Windows 11 Pro 10.0.26200 (x64), .NET SDK 10.0.403, WebView2 SDK 1.0.4314.35, WebView2 Runtime 155.0.4283.62, Node.js 24.19.0, NSIS 3.13, NVIDIA RTX 5060. Two monitors: the primary at 1920x1080, 24 Hz and 150% scale, and a second at 60 Hz and 100% scale.

## Automated tests

`build.cmd` runs all three suites and stops on a failure. All passed for the build above: **169 tests total**.

- **96 xUnit host tests** (`host.Tests`): the navigation, frame, external-link, message, export, media-name and folder-containment rules in `AppPolicy`, the fixed native-window command tokens, the Freeze Frame request IDs and the display refresh-rate message.
- **72 Node web tests** (`tests\web`), covering:
  - The merge manifest (43 voices, presets).
  - Input and preset validation, ID3 artwork parsing, and the host bridge, including its refresh-rate and Freeze Frame replies.
  - The exact CSP and forbidden script sinks, and the YouTube embed.
  - The host guards: cursor guard wiring and page script, the deny-all permission handler, keeping playback out of Windows media controls, and the refresh-rate push.
  - Freeze Frame: the host-side capture and Save dialog, the hidden HUD while capturing, and the S key rules.
  - User locks against presets, the preset glide and Auto Glitch.
  - Logo -> source picker -> playback-only HUD, all offered media extensions, local playback readiness and stale YouTube callbacks.
  - Manual-only Flash/Strobe across presets and automation, suspended startup effects, reduced-motion gleam, native-window message validation, default-browser handoff and focused WebView2 fullscreen-key wiring.
  - The frame governor: refresh-rate scaling, choosing the display that actually paces frames, overload detection, stepping back up after sustained headroom, and the longer wait after a relapse. Also: a 60 Hz board held to 30 fps is still treated as overloaded when a 30 Hz display is attached, and a board held back by its GPU stops retrying the faster tier but retries promptly once the load is lighter.

- **1 Windows CAB integration test** (`tests\packaging`) runs the real launcher: fresh extraction, cached launch verification, all 244 hashes/sizes, and rejection of changed HTML, an extra DLL, a redirected cache entry and a changed CAB. Test changes are restored and final verification passes.

The Release host also built with zero warnings and errors. The CAB launcher is compiled with warnings treated as errors.

The cursor guard host-guard tests were checked against deliberately broken copies of the code in the earlier release work. Removing the cursor guard wiring, or the `cssText` filter, makes them fail. The same was done for the last three governor tests: each fails with its fix removed.

## Verified on this machine

**Final installer above**

- Silent upgrade over the intermediate CAB installation exits 0. The installed layout is eight files: launcher, CAB, their hashes, notices/licenses and uninstaller. Its CAB hash matches the table above. The Start-menu shortcut and uninstall icon point to the installed [R] launcher.
- The launcher starts the player from the matching verified runtime cache. Exactly one main player window is present.
- Native UI Automation confirms the logo's complete media lists, the intermediate YouTube/local picker without the effects HUD, and the HUD appearing after playback. A generated silent WAV opens through the native picker; YouTube also reaches playback.
- F11 enters fullscreen and Esc restores the window with WebView2 focused. Fullscreen originally failed in the embedded view; the WinForms WebView2 key event now routes the fixed window shortcuts to the host without enabling browser shortcuts. Alt+Enter in/out also passed on the corrected Release host immediately before packaging.
- Native window/client bounds match, with no caption/border style. Maximize/restore and minimize work; hiding/showing the HUD also hides/restores the floating native controls.
- Launcher `--refresh` reaches the existing window, asks for confirmation, and No retains the session while Yes returns to the logo and removes the playback HUD. Playback can then start again without a second main window.
- Visible taskbar Refresh was checked with real mouse input. The auto-hide taskbar exists only on DISPLAY1, so the window was moved there first.
  - Right-clicking the "Glitch Player R4" taskbar button, which shows the [R] icon, opens its Jump List with Tasks → Refresh.
  - Clicking Refresh starts the installed launcher with `--refresh`. That process was observed, and the Jump List store records the same target and argument.
  - The "Refresh Glitch Player" confirmation appears, owned by the player window, with No focused by default.
  - No kept YouTube playing with the HUD. Yes returned to the logo with its full media lists and no HUD, in the same single player process, with the launcher still waiting. A third pass answered No again.
- At 150% display scaling in the 1280x800 window, the logo's Choose Media button sits below the fold and is reached by scrolling.
- WATCH / SOURCE displays the expected YouTube URL in a default-browser confirmation. Declining keeps the app on its own document.
- The app and waiting launcher exit normally with code 0. No `host.log` was created.
- Silent uninstall exits 0 and removes the installed folder, shortcut and uninstall entry. User data is retained.

**Intermediate CAB builds and integrated-browser checks during this change**

- Clean silent install, launcher startup and YouTube playback; confirming the source outlink hands it to Windows without navigating the app.
- A USER test preset survives Refresh and is subsequently removed through its own Delete control; other presets are untouched.
- Real mouse dragging moves the borderless window (-100,+50); invisible-corner resizing changes its dimensions (+80,+60).
- The full bracketed [R] icon was rendered and visually inspected. The generated ICO contains nine sizes, 16 through 256 pixels.
- Browser viewport checks at 480x320, 1000x800 and 1280x900 keep the logo reachable, without horizontal overflow or startup whole-app filtering.
- Flash/Strobe stay at 0/0 through Auto Glitch and Randomize. Manual levels 0.12/0.08 survive automation and AUTO preset cycling; ZERO ALL returns them to 0/0. The test page was hidden during these checks to avoid displaying flashing effects.

**Previous pre-CAB installer** (38,910,081 bytes, SHA-256 `d0960d9694964d05fef2c475c5294b71c690953dcc6e6922fba5df5cf102426f`; 83 host / 63 web tests)

- Silent install (`/S`) exits 0 and installs 248 files under `%LOCALAPPDATA%\Programs\Glitch-Player-R4`, with the uninstall entry.
- The app starts, and the welcome screen and ENTER PLAYER work. The preset selector, file input, YouTube input and Start button are present (checked with UI Automation).
- A YouTube link entered and started through UI Automation plays. The FREEZE FRAME button then appears; pressing it opens the "Save freeze frame" dialog in Pictures, and saving writes a PNG (940,366 bytes) of the video and effects without the app's controls. The YouTube player's own captions appear in the image because they are part of the embed.
- No `host.log` is written during that session, so no host errors occurred.
- The app closes normally.
- Silent uninstall exits 0 and removes the install folder and uninstall entry. The data folder is kept, as designed.

**Earlier builds of this version, before the cursor guard page layer was wired in and the permission handler was added**

- Install, upgrade over an existing install, and uninstall.
- Local playback:
  - Native MP4.
  - WMV converted by the Windows MediaTranscoder.
- Presets:
  - LAB 250, with M042 applied.
  - Saving a USER preset, then exporting and importing it.
- The export dialog opens in Documents and refuses the install and data folders.
- The app refuses to start when a `WEBVIEW2_*` environment override is set.

**Debug build with a local test-only debug port (not present in Release)**

- **YouTube.** The owner's test video plays in the `youtube-nocookie.com` embed (1280x720, playback advancing).
- **Cursor guard page layer.**
  - Unsafe values set with `setProperty('cursor', …)` and `cssText` are removed immediately; other declarations are kept.
  - Direct `style.cursor` assignments are removed by the MutationObserver before paint.
  - `setAttribute('style', …)` is blocked by the CSP.
  - The guard is present in the YouTube frame, and `chrome.webview` is absent there.
- **Permissions.** Camera, microphone, clipboard read, notification and location requests are each refused immediately, with no prompt, and logged to `host.log`. Local playback with an unmuted audio track still starts without a user gesture, and YouTube still plays.
- **Windows media controls.** Before the fix, WebView2 registered a Windows media session for the player, and another program could pause the video through it (`TryPauseAsync`; the page then reported `paused: true`). With `HardwareMediaKeyHandling` disabled, the player registers no media session (1 before, 0 after).
- **User locks.** With Continual Randomization, Auto Glitch and Automated Masters all on, user-locked Scanlines (0.42) and Global Opacity (0.66) held through LAB M006, LAB M078 and 8 s of the AUTO cycler, while unlocked voices moved. A lock saved in a USER preset came back as a preset lock and was released by the next LAB preset.
- **Freeze Frame.** Two PNGs were saved through the Save dialog during playback, before the Release check above.

## Performance measurements

**Frame pacing and effect cost (Debug build, the owner's YouTube test video, window on the 60 Hz display)**

WebView2 paced `requestAnimationFrame` to the primary display's 24 Hz even with the window on the 60 Hz display, so every frame here is 41.7 ms. "Work" is the main-thread time spent drawing a frame. Tier 0 is the full-resolution canvas (1268 px wide in this window); tier 2 draws effects at half rate and 80% scale (1014 px).

- **Refresh rate.** The frame governor's thresholds were tuned for 60 Hz, so it read 41.7 ms frames as overload and held tier 2 at idle. The host now reports every display's refresh rate, and the page uses the one that matches the measured frame cadence. The canvas then stays at tier 0 at idle.
- **ASCII scatter field** (ASCII voice alone, tier 0). Thousands of per-cell multi-script `fillText` calls per frame were replaced by strips cut from pre-drawn glyph sheets, with the same density, per-frame size jitter, hue and blend. Work p50 went from 20-21 ms to 3.1-3.4 ms, and p90 from 23-25 ms to about 5 ms. Screenshots taken before and after were compared by eye; no repeating pattern was visible.
- **R3 ASCII** (alone) uses the same painter: work p50 went from 11 ms to 8.6 ms, and p90 from 14.8 ms to 10.9 ms.
- **ASCII sheet readback.** Reading the glyph-sheet luminance right after a frame waited for the GPU, blocking 9-28 ms (p50 16.6 ms) about 8 times a second. With the read deferred by at least 80 ms it took p50 4.1 ms, and p50 1.7 ms (max 3.7 ms) once R3 ASCII used the new scatter painter.
- **LAB M042.** Before: dropped to tier 2, work p50 34 ms, p90 88 ms, mean 41 ms. After: holds tier 0 with frames at 41.7 ms, work p50 18.5 ms, p90 37 ms, mean 23 ms.
- **Governor recovery.** Previously a dropped tier could only come back if frames took under 14 ms (scaled to the refresh rate), which never happens on a 24-60 Hz display. Now a tier steps back up after 400 frames that keep the display's cadence with drawing work under 45% of the frame period, and the wait doubles (up to 64 times) each time a step up is undone soon after. The wait goes back to normal once drawing work falls below 70% of what it was at the failed step up. A forced overload (a 100 ms main-thread spin each frame for 30 s) dropped the canvas from tier 0 to tier 2. After it stopped, the canvas returned to tier 1 after about 16 s and to tier 0 after about 34 s, both with the ASCII voice alone and with M042. M042 then held tier 0 for the remaining 64 s.
- **After the review fixes** (the 30 Hz display check and the longer backoff). With YouTube and M042 the canvas was at tier 0 on both displays (1057 px on the 24 Hz display at 150% scale, 1268 px on the 60 Hz display), so 24 Hz pacing is still recognized. Work p50 was 9 ms, p90 10.9 ms and max 15.1 ms. The forced-overload check gave the same result: tier 2 under the spin, tier 1 about 16 s and tier 0 about 34 s after it stopped, then tier 0 for the remaining 25 s of the run.
- **Minimized window.** While minimized for 70 s the page reported itself hidden, and after restoring, the canvas stayed at tier 0 for the 40 s watched.

**Cursor guard and long-session checks (Debug builds, a synthetic 6-second WebM under LAB M042, 8-second windows)**

- Enabling the cursor guard page layer didn't change frame cadence.
- While the mouse moves, the guard adds up to about 0.1 s of style recalculation per 8 s, roughly 1% of the main thread.
- DOM nodes (about 3,670) and event listeners (292) stayed constant, and the JS heap cycled between 7 and 14 MB. No leak was seen.
- Main-thread busy time per 8-second window varied between about 2 and 5 s. It followed the number of lit voices (with all automations on, 38 to 55 voices), and with LAB M042 alone it stayed flat at 2.0-2.4 s, so it is load variation rather than a leak.
- One pass, run right after a build, showed single 625-833 ms hitches. A repeat pass didn't reproduce them (worst frame 83 ms).

## Not verified yet

- Code signing (not done), and SmartScreen behaviour on another machine.
- The interactive (non-silent) installer and uninstaller pages, and the uninstaller's "delete data" path.
- Ctrl+Alt+G, the capture shield button, native DPI scales other than 100% and 150%, and dragging the window between displays while playing.
- The registry layer of the cursor guard against a non-system pointer scheme.
- Refusal of WebView2 registry policy overrides, and the Defender watchdog warnings.
- Native MP4, converted WMV, preset export/import and saving a Freeze Frame PNG were checked on the earlier builds listed above, not rerun on this final CAB installer. Its local WAV/YouTube startup and window/Refresh checks are listed separately.
- The governor's step-up limits (45% of the frame period, 400 frames, doubling up to 64 times after a relapse, retrying sooner below 70% of the earlier work) were chosen by reasoning and simulation, and checked only on this machine. The GPU-bound case was only simulated; it uses main-thread drawing time as a stand-in for the load.
- A remaining ambiguity: if a 60 Hz board never shows a single 60 Hz frame for a display setup (overloaded from the start) and a 30 Hz display is attached, the governor still takes 30 fps as that display's pacing.
- Windows 10, Windows N editions, other GPUs and refresh rates, and long sessions.

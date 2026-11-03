# Build status - Standalone Revision R Final 4.0

This file records what was actually built and tested, and what hasn't been tested yet. "Verified" means the check was run and passed on the machine below. The binaries are **not code-signed**.

## Current build

| Item | Value |
| --- | --- |
| Installer | `out\Glitch-Player-R4-4.0.0-x64-setup.exe` (built by `build.cmd`, not committed) |
| Size | 38,892,199 bytes |
| SHA-256 | `246733558adea3813f212180fdb03a80816344cc3497891dadd19c3e69551ee0` |
| Signed | No |
| Built | 2026-11-03 |

Build machine: Windows 11 Pro 10.0.26200 (x64), .NET SDK 10.0.403, WebView2 SDK 1.0.4314.35, WebView2 Runtime 155.0.4283.62, Node.js 24.19.0, NSIS 3.13, NVIDIA RTX 5060 at 1920x1080 and 24 Hz.

## Automated tests

`build.cmd` runs both suites and stops if either fails:

- **73 xUnit host tests** (`host.Tests`): the navigation, frame, external-link, message, export, media-name and folder-containment rules in `AppPolicy`.
- **44 Node web tests** (`tests\web`), covering:
  - The merge manifest (43 voices, presets).
  - Input and preset validation, ID3 artwork parsing, and the host bridge.
  - The exact CSP and forbidden script sinks, and the YouTube embed.
  - The host guards: cursor guard wiring and page script, and the deny-all permission handler.

The two newest host-guard tests were checked against deliberately broken copies of the code. Removing the cursor guard wiring, or the `cssText` filter, makes them fail.

## Verified on this machine

**Final installer above**

- Silent install (`/S`) exits 0 and installs 248 files under `%LOCALAPPDATA%\Programs\Glitch-Player-R4`, with the uninstall entry.
- The app starts, and the welcome screen and ENTER PLAYER work. The preset selector, file input, YouTube input and Start button are present (checked with UI Automation).
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

## Performance measurements

These were measured in Debug builds with a synthetic 6-second WebM (no user media) playing under LAB preset M042, over 8-second windows. The display runs at 24 Hz (41.7 ms per frame), so main-thread metrics were used as well as frame timing.

- Enabling the cursor guard page layer didn't change frame cadence.
- While the mouse moves, the guard adds up to about 0.1 s of style recalculation per 8 s, roughly 1% of the main thread.
- DOM nodes (about 3,670) and event listeners (292) stayed constant, and the JS heap cycled between 7 and 12 MB. No leak was seen.
- Main-thread busy time rose from about 2.6 s to 4.6 s per 8-second window over a session, with and without the guard. The guard doesn't cause this, but it hasn't been investigated yet.
- One pass, run right after a build, showed single 625-833 ms hitches. A repeat pass didn't reproduce them (worst frame 83 ms).

## Not verified yet

- Code signing (not done), and SmartScreen behaviour on another machine.
- The interactive (non-silent) installer and uninstaller pages, and the uninstaller's "delete data" path.
- Fullscreen (F11, Alt+Enter, Esc), Ctrl+Alt+G, the capture shield button, window drag and resize, multiple monitors and other DPI scales.
- The registry layer of the cursor guard against a non-system pointer scheme.
- Refusal of WebView2 registry policy overrides, and the Defender watchdog warnings.
- The full local-media and preset flows on the final installer. These were verified only on the earlier builds listed above.
- Windows 10, Windows N editions, other GPUs and refresh rates, and long sessions.

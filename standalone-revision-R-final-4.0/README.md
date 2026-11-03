# Glitch Player - Standalone Revision R Final 4.0

Revision R Final 4.0 is a newly coded, hardened Windows desktop player. It is a .NET 10 WinForms host with a locked-down Microsoft Edge WebView2 view, installed per user by an NSIS setup. It merges every effect voice from Glitch Player Revision 3.0, the Glitch Canvas Projector and AI WARP ENGINE into one effects engine and one preset system.

> **Photosensitivity warning:** the app can produce rapid flashing, strobing and high-contrast flicker. Flash and Strobe start at zero. Some built-in MACHINE presets and the hidden GHOST / OF ME preset contain flash and strobe. Don't use these effects if you or anyone watching may be sensitive to flashing light.

The installer and app are **not code-signed**. See [BUILD_STATUS.md](BUILD_STATUS.md) for what has been verified, and [SECURITY.md](SECURITY.md) for the hardening.

## Merged effects

There are 43 effect voices: 39 timed overlay voices and 4 filter-path master voices. Each has its own slider and lock and starts at 0. An effect only appears when you, a preset or Auto Glitch raise its slider.

| Source | Voices |
| --- | --- |
| Glitch Canvas Projector (18) | Neon Grad, Scanlines, Flash, HSL Rainbow, ASCII, Font Burn, Strobe, Gemini Bomb, Data Bands, VHS Glitch, Chromatic Echo, Temporal Slices, Signal Tear, Cyber Rain, Prism Rift, Orbit HUD, R3 Ghost Spectrum, R3 V-Sync |
| Glitch Player Revision 3.0 (20) | Tech Artist, Data Bomb, Ink Glyphs, Matrix ASCII, Matrix Chord, B&W Invert, Hue/Color Cycle, R3 Neon Grad, R3 Scanlines, R3 Gemini Bomb, R3 Tech Artist, R3 Data Bomb, R3 Ink Glyphs, R3 Matrix ASCII, R3 Matrix Chord, R3 HSL Rainbow, R3 ASCII, R3 Font Burn, R3 Data Bands, R3 VHS Glitch |
| AI WARP ENGINE (5) | Rolling Scan, Tape Grain, Tracking Tear, R3 B&W Invert, R3 Hue/Color Cycle |

The AI WARP MASTERS panel adds:

- **DROP THE MILK?**: AI WARP's dependency-free, Milkdrop-inspired feedback automation with 80 auto presets and its own opacity slider and lock.
- **B&W Strength** and **Hue Offset**: masters that drive each core voice and its R3 twin together.

AI WARP's warp modes, its Three.js renderer and the R3 Flash/Strobe twins are deliberately not included.

The printable ASCII and Unicode glyph banks from the projector are included, with their original AI Warp / Revision 3 bank credits.

## Presets

| List | Contents |
| --- | --- |
| USER | Your own presets. Stored separately from the built-in lists, up to 500. |
| MACHINE | The Deepseek bank of 80 built-in presets. |
| LAB 250 | The 250 projector machine snapshots, M001 PHOSPHOR/01 to M250 SIGNAL RAIN/10. |

- Built-in presets are frozen and are never changed by saving. Saving always creates or replaces a USER preset.
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
| Ctrl+Alt+G | Hidden GHOST / OF ME preset (asks for confirmation first, because it flashes) |

## Install and uninstall

Requirements: 64-bit Windows 10 version 2004 (build 19041) or later, and the Microsoft Edge WebView2 Runtime (Evergreen), which is included with Windows 11 and current Windows 10.

1. Run `Glitch-Player-R4-4.0.0-x64-setup.exe`. Compare its SHA-256 with the `.sha256` file first. Windows SmartScreen may warn because the file is unsigned.
2. Setup installs for the current account only, into `%LOCALAPPDATA%\Programs\Glitch-Player-R4`, without administrator rights. It adds a Start Menu shortcut but no desktop shortcut.
3. Setup and the uninstaller refuse to run while the app is open.

Your data is kept in `%LOCALAPPDATA%\Glitch-Player-R4`: the WebView2 profile with your presets, `settings.json`, the media cache and key, and size-capped logs. Uninstalling keeps this folder unless you choose to delete it. Export your presets first if you want a backup.

The app includes K-Meleon-R's cursor guard. While the app runs, it resets mouse pointers that aren't built-in Windows cursors and turns off "allow themes to change mouse pointers". These per-user changes stay after the app closes; see [SECURITY.md](SECURITY.md).

## Build from source

Requirements:

- The .NET 10 SDK
- Node.js 22 or later (only for the web UI tests)
- NSIS 3 (`makensis.exe` on `PATH` or in Program Files)

From this folder, run:

```cmd
build.cmd
```

`build.cmd` is a plain cmd script that doesn't use PowerShell or change the execution policy. It:

1. Runs the .NET and web tests.
2. Publishes the self-contained `win-x64` host to `out\publish`.
3. Checks that the publish output contains the web UI and license files, and no FFmpeg files or `.pdb` symbols.
4. Compiles `out\Glitch-Player-R4-4.0.0-x64-setup.exe` and writes its SHA-256 to a `.sha256` file next to it.

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
| `webui\js\glitch-engine.js`, `r3-factories.js`, `r3-ghost-vsync.js`, `glyph-library.js` | Effect engines and glyph banks |
| `webui\js\r4-policy.js`, `host-bridge.js`, `yt-embed.js` | Input validation, the narrow host bridge and the YouTube embed |
| `tests\web\` | Node tests for the merge manifest, policy, bridge, static CSP rules and host guards (cursor guard, permissions) |
| `installer\` | `setup.nsi` and the installer notices |

## Credits and license

Glitch Player is dedicated to the public domain under [CC0 1.0](LICENSE.txt) by River Lyle Reuveni (Imortalimp), <https://www.imortalimp.nl>.

It merges Glitch Player Revision 3.0, the Glitch Canvas Projector and AI WARP ENGINE (CC0 1.0 / The Unlicense) by the same author. The host hardening patterns and cursor guard come from K-Meleon-R. AI WARP ENGINE credits Arena.ai and GitHub Copilot as creative tools.

Bundled components keep their own licenses; see [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt).

# Glitch Player Standalone Releases

## Revision R Final 4.1

Revision 4.1 is the current line of the hardened Windows player. **4.1.2 "Room & Cut"** gives every named link-tree
video its own transition timing built from YouTube's own info, lands cuts on a soft-to-hard spectrum, and ends the
build with a Microsoft Defender guard. It follows 4.1.1 "Breathing Room" (silence between transitions, 16 curated
aesthetic scenes) and 4.1.0 "Definition & Confluence" (machine-checked definitions, per-start MACHINE presets,
calmer randomized lights).

- [Download the Windows installer from the RELEASE_4.1.2 release](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.1.2) (`Glitch-Player-R4-4.1.2-x64-setup.exe`, 44,670,582 bytes). Its SHA-256 is `227d72ed712b84c47ba84fc38a6dcdfdb2b80835eddafe7d5a2a4a318238e1d9`; compare it before running setup. It is not code-signed, so Windows SmartScreen may warn.
- The installer was built natively on Windows 11 x64 with `build.cmd`; all 260 tests passed (96 .NET host, 163 web, 1 CAB integration) and the build's own Defender guard scanned it clean.
- [Read the 4.1 README](standalone-revision-R-final-4.0/README.md) for the merged effects, presets, building and installing. It includes a photosensitivity warning for the flash and strobe effects.
- [Changelog](standalone-revision-R-final-4.0/CHANGELOG.md), [security and hardening](standalone-revision-R-final-4.0/SECURITY.md), [build status](standalone-revision-R-final-4.0/BUILD_STATUS.md) and [roadmaps beyond 4.1](standalone-revision-R-final-4.0/docs/r4.2-roadmaps/README.md).

## Revision R Final 4.0

Revision 4.0 is a newly coded, hardened Windows app: a .NET 10 host with a locked-down WebView2 view and a per-user NSIS installer. It merges every effect from Revision 3.0, the Glitch Canvas Projector and AI WARP ENGINE into one effects engine and one preset system: 43 effect voices, the AI WARP masters, and 80 MACHINE and 250 LAB built-in presets alongside your own.

This is the **final revised release** of 4.0. Its installer replaces the earlier 4.0.0 builds in the same release; the version number stays 4.0.0.

- [Download the Windows installer from the RELEASE_4.0 release](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.0) (`Glitch-Player-R4-4.0.0-x64-setup.exe`, 44,706,785 bytes). Its SHA-256 is `1782632d97d6bf15e21176c06119b9faa467dea06ba48e6e99ee653ac89aee26`; compare it before running setup. It is not code-signed, so Windows SmartScreen may warn.
- [Read the 4.0 README](standalone-revision-R-final-4.0/README.md) for the merged effects, presets, building and installing. It includes a photosensitivity warning for the flash and strobe effects.
- [Changelog](standalone-revision-R-final-4.0/CHANGELOG.md), [security and hardening](standalone-revision-R-final-4.0/SECURITY.md) and [build status](standalone-revision-R-final-4.0/BUILD_STATUS.md).

The installer is published as a release asset rather than committed to the repository. You can also build it from source with `build.cmd`.

## Revision R Final 3.0

Revision 3.0 uses the Revision 3 HARD-LIGHT / MOONLIGHT player template with a standalone initialization screen, local MP3/MP4 playback, effect controls, and presets. YouTube playback requires an internet connection.

- [Download the complete portable app](standalone-revision-R-final-3.0-standalone.zip). Extract the ZIP and run `Launch-Standalone-Revision-R-Final-3.0.cmd`.
- [Download the Windows installer](standalone-revision-R-final-3.0-installer.exe).
- [Browse the 3.0 source and packaged files](standalone-revision-R-final-3.0/README.md).

The existing Revision R Final 2.0 package remains available as `standalone-revision-R-final-2.0-standalone.zip`. Its default launcher opens at 1280x720; use Alt+Enter to switch fullscreen/windowed mode.

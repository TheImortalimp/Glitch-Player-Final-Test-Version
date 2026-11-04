# Glitch Player Standalone Releases

## Revision R Final 4.1

**4.2.4 "Final Confluence"** is the final consolidated release of the Revision R 4.x line, carrying every update
since the r4.2 roadmaps were created (4.1.0 through 4.1.3) plus full voice independence: no voice triggers another's
slider or value, ASCII no longer triggers when R3 ASCII is used, B&W never starts automatically after ZERO ALL, and
only explicit randomization may form confluence pairs.

- [Download the Windows installer from the RELEASE_4.2.4 release](https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/releases/tag/RELEASE_4.2.4) (`Glitch-Player-R4-4.2.4-x64-setup.exe`, 44,707,295 bytes, silent update 3). Its SHA-256 is `0b18cc42bf1ea1ad3c610fd4e7587f19fc3d48725c6501daf6be37253d2559cc`; compare it before running setup. It is not code-signed, so Windows SmartScreen may warn.
- Silent update 3 fixes the EAR (full listen on YouTube and local media, never starved), adds a hide/show button for the audio and canvas levels monitor, and persists the EAR and auto SOFT-EYE settings.
- Silent update 2 reworked the R3 ASCII voice: the two burst types are totally separated, the soothing small stacks lead, and the wild 006 scatter only strikes at 90-100% of the slider.
- The installer flow is redone: no truncated text, an install-folder page, Final Confluence naming, and **Defender guard rails** — Setup scans everything it installed with `MpCmdRun.exe` and rolls back on any reported threat.
- The installer was built natively on Windows 11 x64 with `build.cmd`; all 272 tests passed (96 .NET host, 175 web, 1 CAB integration) and the build's own Defender guard scanned it clean.
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

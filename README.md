# Glitch Player Standalone Releases

## Revision R Final 4.0

Revision 4.0 is a newly coded, hardened Windows app: a .NET 10 host with a locked-down WebView2 view and a per-user NSIS installer. It merges every effect from Revision 3.0, the Glitch Canvas Projector and AI WARP ENGINE into one effects engine and one preset system.

- [Read the 4.0 README](standalone-revision-R-final-4.0/README.md) for the merged effects, presets, building and installing. It includes a photosensitivity warning for the flash and strobe effects.
- [Security and hardening](standalone-revision-R-final-4.0/SECURITY.md) and [build status](standalone-revision-R-final-4.0/BUILD_STATUS.md).

No prebuilt 4.0 installer is published in this repository yet. Build it from source with `build.cmd`. It is not code-signed.

## Revision R Final 3.0

Revision 3.0 uses the Revision 3 HARD-LIGHT / MOONLIGHT player template with a standalone initialization screen, local MP3/MP4 playback, effect controls, and presets. YouTube playback requires an internet connection.

- [Download the complete portable app](standalone-revision-R-final-3.0-standalone.zip). Extract the ZIP and run `Launch-Standalone-Revision-R-Final-3.0.cmd`.
- [Download the Windows installer](standalone-revision-R-final-3.0-installer.exe).
- [Browse the 3.0 source and packaged files](standalone-revision-R-final-3.0/README.md).

The existing Revision R Final 2.0 package remains available as `standalone-revision-R-final-2.0-standalone.zip`. Its default launcher opens at 1280x720; use Alt+Enter to switch fullscreen/windowed mode.

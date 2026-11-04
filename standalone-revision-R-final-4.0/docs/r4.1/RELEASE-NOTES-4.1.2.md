# Glitch Player R Final 4.1.2 - Room & Cut

- **Per-track timing from YouTube info.** Each named link-tree video (all 12 tracks, including the WHITE 2 BLACK 2
  WHITE fade link and the GHOST // OF ME MISSING LINK track) carries its own transition timing - retarget pace,
  breathing-room odds and cut character - built from what the embed already tells the player (video id and reported
  duration; no new network surface). Unknown videos class themselves by duration: long-form sits calm, short tracks
  run livelier. Local media keeps the defaults.
- **Soft-to-hard cuts.** Each cut lands on a spectrum from soft (about half way) to hard (about 95%), biased by the
  playing track's cut character; hard-cutting tracks cut more often, soft ones rarely. The lights never hard-cut,
  and the 20% / 35% caps and sub-3 Hz rate are unchanged.
- **Defender guard in the build.** `build.cmd` now ends with a Microsoft Defender scan of the installer and the
  working package and fails the build on any reported threat.
- Tests: 260 pass (96 .NET host, 163 web, 1 CAB integration). New: `track-timing.test.mjs`.

See CHANGELOG.md and README.md for details.

> **Photosensitivity warning:** effects can produce flashing and high-contrast flicker.

## Download notes
The **Windows installer** `Glitch-Player-R4-4.1.2-x64-setup.exe` (44,670,582 bytes) was built natively on Windows 11
x64 with `build.cmd`; the build's own Defender guard scanned it clean. It is **unsigned**, so SmartScreen may warn.

Installer SHA-256: `227d72ed712b84c47ba84fc38a6dcdfdb2b80835eddafe7d5a2a4a318238e1d9`

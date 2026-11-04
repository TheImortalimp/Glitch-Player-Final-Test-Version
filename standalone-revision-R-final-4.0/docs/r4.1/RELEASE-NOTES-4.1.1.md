# Glitch Player R Final 4.1.1 - Breathing Room

- **Silence between effect transitions.** At each retarget a voice may rest for 1.1-3.4 s, holding its level and
  target so each transition has room to breathe. Glide voices breathe slightly more often; the wild crescendo modes
  breathe half as often so showpieces stay lively. Lights (Flash/Strobe) are excluded - their calmer bounded
  automation, the 20% / 35% caps and the sub-3 Hz rate are unchanged.
- **The beautiful effects palette grows from 12 to 16 curated aesthetic-burst groups.** The four new groups are
  light-free and calm by design (peaks <= 90%, holds >= 2 s, rests >= 5 s): `prismDrift`, `moonlightVeil`,
  `glyphRainfall` and `crtDaydream`.
- Tests: 255 pass (96 .NET host, 158 web, 1 CAB integration). New: `breathing-room.test.mjs` and
  `aesthetic-palette.test.mjs`, which validates every palette group against the effects manifest.

See CHANGELOG.md and README.md for details.

> **Photosensitivity warning:** effects can produce flashing and high-contrast flicker.

## Download notes
The **Windows installer** `Glitch-Player-R4-4.1.1-x64-setup.exe` (44,691,298 bytes) was built natively on Windows 11
x64 with `build.cmd` and scanned clean by Microsoft Defender. It is **unsigned**, so SmartScreen may warn.

Installer SHA-256: `0471ffe6e8a3ba74d2e7e67a11ee345ce4a07c0c711c01a6b0622a165b885228`

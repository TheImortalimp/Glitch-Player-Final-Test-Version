# Glitch Player R Final 4.2.4 - Final Confluence

**The final consolidated release of the Revision R 4.x line**, carrying every update since the r4.2 roadmaps were
created: 4.1.0 "Definition & Confluence" (machine-checked definitions, per-start MACHINE presets, calmer lights),
4.1.1 "Breathing Room" (silence between transitions, 16 aesthetic scenes), 4.1.2 "Room & Cut" (per-track YouTube
timing, soft-to-hard cuts, the Defender build guard) and 4.1.3 "Strands" (effect cancellation, voice separation,
seeded decks, the BIRDCAGE card) - plus:

- **Voices untied.** Moving an AI WARP master wakes only its own core voice, never its R3 twin: ASCII no longer
  triggers when R3 ASCII is used, and every voice is independently locked, triggered or set 0-100% or off via its
  own slider. Only explicit randomization may form confluence pairs.
- **A properly safe ZERO ALL.** B&W Invert can no longer start automatically after ZERO ALL: the autonomous
  inversion sweep stands down and Auto Glitch's B&W rail hops skip a cancelled B&W. No weird randomness unless
  you say so.
- Tests: 272 pass (96 .NET host, 175 web, 1 CAB integration).

See CHANGELOG.md and README.md for details.

> **Photosensitivity warning:** effects can produce flashing and high-contrast flicker.

## Download notes
The **Windows installer** `Glitch-Player-R4-4.2.4-x64-setup.exe` (44,688,622 bytes) was built natively on Windows 11
x64 with `build.cmd`; the build's own Defender guard scanned it clean. It is **unsigned**, so SmartScreen may warn.

This replacement build also **redoes the installer flow**: no truncated titles, a new install-folder page, naming
updated to Final Confluence 4.2.4, and **Defender guard rails** - Setup scans the installed folder with
`MpCmdRun.exe` and rolls the install back on any reported threat.

Installer SHA-256: `2650e9a21ff8e3eaa85248e576de9bc40131ef4881f30b4e3f1ff49ab3532026`

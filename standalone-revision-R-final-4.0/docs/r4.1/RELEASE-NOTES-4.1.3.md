# Glitch Player R Final 4.1.3 - Strands

- **Effect cancellation.** A slider dragged to zero cancels its effect, and ZERO ALL cancels every effect: a
  cancelled voice can never be started by any automation - not by Continual Randomization, not by Auto Glitch's
  unpark, not by an aesthetic burst. Only the user wakes it: raising its slider, applying a preset, Randomize All,
  or a tuned voice pick. The lights keep their own confirmation-gated rules.
- **Separation & confluence timing.** Voices retarget as staggered strands with per-voice join odds, a board-wide
  confluence guard lets at most two hard cuts land close together, and glides travel longer against the cuts.
- **Proper preset determination.** The MACHINE deck is fully determined by one recorded seed:
  `buildMachinePresets(seed)` rebuilds the exact same 80 presets.
- **New link-tree card: BIRDCAGE** - the YOU MAN "BIRDCAGE" radio playlist, timed from its measured 5:38 first track.
- **Glyph tables re-pulled from the online Unicode 15.1.0 / CP437 sources** and verified byte-identical.
- Tests: 270 pass (96 .NET host, 173 web, 1 CAB integration). New: `effect-cancellation.test.mjs`.

See CHANGELOG.md and README.md for details.

> **Photosensitivity warning:** effects can produce flashing and high-contrast flicker.

## Download notes
The **Windows installer** `Glitch-Player-R4-4.1.3-x64-setup.exe` (44,710,285 bytes) was built natively on Windows 11
x64 with `build.cmd`; the build's own Defender guard scanned it clean. It is **unsigned**, so SmartScreen may warn.

Installer SHA-256: `4e71fc52b6d7c395bf3967675e171a1bb5087653719482212a745c987a5198a2`

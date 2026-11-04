# Glitch Player R Final 4.1.0 - Definition & Confluence

- Machine-checked definitions for effects, presets and screens (`webui/data/*`).
- MACHINE presets are unfrozen and re-rolled on every start and Refresh; LAB stays fixed.
- Calmer, randomized Flash/Strobe automation. Caps unchanged (20% / 35%), lights never hard-cut.
- Varied automations: AI WARP, DROP THE MILK?, per-voice glide/cut transitions.
- Landing card and link-tree polish.

See CHANGELOG.md and README.md for details.

> **Photosensitivity warning:** effects can produce flashing and high-contrast flicker.

## Download notes
The **Windows installer** `Glitch-Player-R4-4.1.0-x64-setup.exe` (44,648,327 bytes) was built natively on Windows 11 x64 with `build.cmd`, with all 245 tests passing (96 .NET host, 148 web, 1 CAB integration). It is **unsigned**, so SmartScreen may warn.

Installer SHA-256: `5a0aa423d743e083e6d04052ed544ac2d49dee0f0c47e35aeff5dff25b642670`

The attached ZIP is a **cross-built, unsigned, untested** self-contained win-x64 publish (run `GlitchPlayerR4.exe`; needs the WebView2 Runtime). It was built on Linux, not run on Windows. Prefer the installer above.

ZIP SHA-256: `67bf5429027bac13624e7174da11e10ba94cd94a1257ce3c7e0d822e8a67b1f8`

# Standalone Revision R Final 2.0

Source release for the Glitch Canvas standalone player.

This revision keeps the Revision R player elements and imports the current
`glitch-canvas.html` and `glitch-canvas.css` palette, including the expanded
effect definitions, Ghost Protocol, V-Sync Scan, AI Video Warp, presets,
local MP3/MP4 playback, YouTube URL validation, and the visual canvas engine.

## Run

Use `Launch-Standalone-Revision-R-Final-2.0.cmd`. It starts the actual
`app/StandaloneRevisionRFinal.exe` WebView2 shell, which hosts the new UI in a
standalone application window. YouTube iframe playback is handled by the
embedded shell origin; no standard browser or Python server is used.

## Source layout

- `webui/glitch-canvas.html`: full player UI, palette, and JavaScript engine
- `webui/glitch-canvas.css`: visual system and responsive control styling
- `Launch-Standalone-Revision-R-Final-2.0.cmd`: visible Windows launcher
- `app/StandaloneRevisionRFinal.exe`: standalone WebView2 application host
- `Start-Standalone-Revision-R-Final-2.0.ps1`: starts the shell at 1280x720
- `install.ps1`: copies this source release to a selected output directory

The incoming source was staged from the local `glitch-canvas.html` and
`glitch-canvas.css` files in the release workspace. The packaged Revision R
1.0 artifacts remain separate under the parent release directory.

## Build status

The 2.0 package reuses the verified Revision R WebView2 host and replaces its
web UI payload with the current full-effect Glitch Canvas files. The existing
1.0 binary remains untouched.

The default launcher opens the shell window at 1280x720 so controls remain
inside the physical display area. Press Alt+Enter to switch between windowed
and fullscreen modes.
# Standalone Revision R Final 3.0

Source release for the Glitch Canvas standalone player.

This revision uses the Revision 3 HARD-LIGHT / MOONLIGHT interface as its
player template, with the standalone initialization screen and local playback
support. The archived interface and its companion `glitch-engine.js` are
bundled locally; YouTube playback still requires an internet connection.

The initialization screen follows the Revision R Final 2.0 entry flow. Enter
Player reveals the redesigned control surface; local MP3 and MP4 playback,
effect controls, and presets remain available in the standalone app.

## Run

Use `Launch-Standalone-Revision-R-Final-3.0.cmd`. It starts the actual
`app/StandaloneRevisionRFinal.exe` WebView2 shell, which hosts the UI in a
standalone application window. YouTube iframe playback is handled by the
embedded shell origin; no standard browser or Python server is used.

## Source layout

- `webui/glitch-canvas-v-sync.html`: standalone WebView app entry and player UI
- `webui/glitch-canvas.html`: same redesigned player for the standard page entry
- `webui/glitch-engine.js`: local effects engine used by the player
- `webui/welcome-screen.css`: standalone initialization screen
- `webui/glitch-canvas.css`: retained Revision R Final palette
- `Launch-Standalone-Revision-R-Final-3.0.cmd`: visible Windows launcher
- `app/StandaloneRevisionRFinal.exe`: standalone WebView2 application host
- `Start-Standalone-Revision-R-Final-3.0.ps1`: starts the shell at 1280x720
- `install.ps1`: copies this source release to a selected output directory

## Build status

The existing WebView2 application host is unchanged. The launcher opens
`webui/glitch-canvas-v-sync.html`; its Revision 3 engine and initialization
styles are bundled locally alongside the page. YouTube playback needs an
internet connection. Local MP3/MP4 playback and saved presets remain available
from the standalone window.

The default launcher opens the shell window at 1280x720 so controls remain
inside the physical display area. Press Alt+Enter to switch between windowed
and fullscreen modes.

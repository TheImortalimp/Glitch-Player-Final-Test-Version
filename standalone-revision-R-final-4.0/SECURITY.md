# Security - Glitch Player Standalone Revision R Final 4.1

This document describes how Revision R Final 4.1 is hardened and what it deliberately doesn't do. It describes the code in this folder; the hardening hasn't been independently audited. The installer and app are **not code-signed**. For what has actually been tested, see [BUILD_STATUS.md](BUILD_STATUS.md).

## Reporting a problem

Open an issue at <https://github.com/TheImortalimp/Glitch-Player-Final-Test-Version/issues>. If you've found a vulnerability, don't post exploit details publicly; open an issue asking for a private contact, or use the contact details on <https://www.imortalimp.nl>.

## What the app doesn't do

- It has no telemetry, analytics, crash upload, auto-update or account sign-in.
- It connects to the network only for YouTube links you enter (the `youtube-nocookie.com` embed and `i.ytimg.com` thumbnails), and for links you confirm opening in your default browser. The web UI's `connect-src` is `'none'`.
- It doesn't download files. Every download WebView2 starts is cancelled.
- Web content can't capture the screen or use the camera, microphone, clipboard, location or notifications.
- Release builds have no DevTools and no remote debugging port.
- It doesn't need administrator rights, and includes no FFmpeg or other third-party codecs.

## Startup checks

The installed launcher (`launcher\Launcher.cs`, Windows .NET Framework 4.8) first verifies a build-pinned SHA-256 of `payload.cab`. It extracts only manifest-listed members to build-generated relative paths in a versioned per-user runtime cache. It rejects duplicate/unlisted members, split cabinets, unexpected cached files, wrong lengths/hashes and reparse points. Newly created runtime directories have protected current-user/System ACLs. Directory handles prevent directory replacement while in use; verified file handles deny writes/deletion until the player exits. Every launch revalidates the CAB and the extracted files.

The launcher refuses WebView2 and CLR profiler overrides and the .NET startup-hook/additional-dependency/shared-store variables. It uses a current-user-only mutex for single-instance launches; the taskbar Refresh command targets the matching cached host and requests a confirmation, not arbitrary execution.

**CAB packaging is not virtualization or a security boundary.** Runtime files are extracted and readable. Hashes detect a payload changed independently of the launcher; the launcher and installer are unsigned and do not authenticate the publisher. A process already running as the same user (or administrator) can replace the launcher or interfere with the app. No claim is made to resist that threat. Incomplete/invalid caches fail closed with a specific recovery path rather than silently loading a fallback.

`host\Program.cs` runs these checks before any window is created:

- The app refuses to start if any of these environment variables is set: `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS`, `WEBVIEW2_PIPE_FOR_SCRIPT_DEBUGGER`, `WEBVIEW2_WAIT_FOR_SCRIPT_DEBUGGER`, `WEBVIEW2_BROWSER_EXECUTABLE_FOLDER`, `WEBVIEW2_USER_DATA_FOLDER`, `WEBVIEW2_RELEASE_CHANNEL_PREFERENCE`, `WEBVIEW2_CHANNEL_SEARCH_KIND`.
- It also refuses to start if `HKCU` or `HKLM\Software\Policies\Microsoft\Edge\WebView2` sets `AdditionalBrowserArguments`, `BrowserExecutableFolder`, `UserDataFolder`, `ReleaseChannelPreference` or `ChannelSearchKind`, or has a `*` or `GlitchPlayerR4.exe` subkey. If the key can't be read, the app doesn't start.
- `SetDllDirectory("")` removes the current folder from the DLL search path.
- Process mitigation policies are requested on a best-effort basis:
  - Extension points are disabled: AppInit DLLs, global hook DLLs and legacy IMEs.
  - Image loading blocks remote and low-integrity images and prefers System32.
- The app manifest requests `asInvoker`.

## WebView2 configuration

- The app uses its own WebView2 profile in `%LOCALAPPDATA%\Glitch-Player-R4\profile`, with single sign-on turned off.
- These are turned off: DevTools, host objects, default context menus, the status bar, zoom, pinch zoom, swipe navigation, password autosave, general autofill and browser accelerator keys.
- SmartScreen reputation checking is required.
- The fixed browser arguments allow media to start without a user gesture and stop Chromium from throttling a covered or background window, so effects keep running smoothly.
- They also turn off `HardwareMediaKeyHandling`, so the player never registers a Windows media session. Other programs, headsets and keyboard media keys can't pause, skip or otherwise control playback. Without this, another program could pause the video through the session.

## Navigation, frames and windows

- The only top-level document allowed is `https://player-r4.local/index.html`, which is a virtual host mapped to the verified runtime's `webui` folder. Every other top-level navigation is cancelled.
- Converted media is served from `https://media-r4.local/`. The web bridge accepts only `https://media-r4.local/<64 hex>.mp4` or `.m4a` URLs from the host.
- The only frames allowed are `https://www.youtube-nocookie.com`, `https://www.youtube.com`, `about:blank` and `about:srcdoc`. Allowed URLs must use HTTPS on the default port with no user information.
- New windows never open inside the app. HTTPS links to `imortalimp.nl`, `www.imortalimp.nl`, `youtube.com`, `www.youtube.com`, `m.youtube.com`, `music.youtube.com` or `youtu.be` open through the Windows default-browser association only after a user-initiated navigation and confirmation. Anything else is blocked. The confirmation runs outside the WebView2 event callback, defaults to No and cannot stack with Refresh confirmations.
- These are always blocked:
  - The `javascript:`, `data:`, `vbscript:`, `file:` and `ms-settings:` navigation schemes.
  - Theme and pointer files: `.theme`, `.themepack`, `.deskthemepack`, `.cur` and `.ani`.
- `chrome.webview` is removed from every document that isn't the app's own.

## Permissions

Every WebView2 permission request from any frame is denied without a prompt. This covers the camera, microphone, clipboard read, location, notifications, sensors, MIDI, local fonts and file system access. Denials are never saved in the profile, and each one is written to `host.log`. The player doesn't need any of these permissions.

## Host bridge

The web UI talks to the host only through `chrome.webview.postMessage`; no host objects are exposed.

- Messages are accepted only from the app document. They must be strings of at most 2,200,000 characters, in the form `kind|payload`.
- `media:convert` must include exactly one file chosen in the app's file picker, so web content can't name an arbitrary path.
- `media:cancel` cancels the running conversion. Starting a new conversion cancels the previous one, and the web side times out after 10 minutes.
- `presets:export` is validated before the save dialog opens:
  - At most 2 MB and 500 presets; names are 1-80 characters.
  - The dialog starts in Documents and refuses the app's install and data folders.
- `log` accepts only short codes matching `^[a-z0-9][a-z0-9:._-]{0,63}$`.
- `ui:escape` leaves fullscreen.
- `window:command` accepts only fixed minimize/maximize/fullscreen/close/shield/refresh and eight resize-edge tokens. No paths, URLs, coordinates or shell commands are accepted. Refresh cancels conversion only after confirmation and reloads the same app document without deleting presets.
- `freeze:capture` (Freeze Frame) takes only a request ID of at most 20 ASCII digits, and only one capture runs at a time:
  - The page hides its controls, and the host captures the view itself with `CapturePreviewAsync`.
  - The page gets back only the request ID and success or an error message, so no image data enters the page and downloads stay blocked.
  - The PNG is written only to a file you choose in a Save dialog. The dialog starts in Pictures and refuses the app's install and data folders.

The host sends the page only these messages, and the page checks each one:

- `media:result` is accepted only for a pending conversion request, and its URL must be a converted file on `https://media-r4.local/` of the requested kind.
- `freeze:captured` is accepted only for the pending Freeze Frame request ID, and only up to 1,024 characters.
- `display:refresh` lists at most 8 distinct display refresh rates, the window's display first. The host sends only rates from 20 to 500 Hz, and the page drops any message that isn't a comma-separated list of such rates. The rates only scale the frame governor's timing thresholds.
- `window:state` accepts only `window|full` mode and `on|off` shield state, separated by a comma. This updates native-control labels and disables resize regions in fullscreen.

## Web UI

`webui\index.html` sets this Content Security Policy:

```text
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https://i.ytimg.com;
media-src 'self' blob: https://media-r4.local; frame-src https://www.youtube-nocookie.com https://www.youtube.com;
connect-src 'none'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'none';
require-trusted-types-for 'script'; trusted-types 'none'
```

- There are no inline scripts, inline styles or inline event handlers. Trusted Types with no policies blocks every HTML and script injection sink.
- The node tests in `tests\web\` fail the build if the CSP changes, or if any script uses code evaluation, HTML injection, network, storage-escape or window-opening APIs.
- The YouTube embed is a `youtube-nocookie.com` iframe sandboxed to `allow-scripts allow-same-origin allow-presentation`. Its messages are accepted only from YouTube origins and from that iframe, then type-checked and size-limited.
- User preset entries and imported files are validated before use. Built-in presets are frozen.

## Local media conversion

- Files that can't play natively are converted by the Windows `MediaTranscoder` to H.264/AAC MP4 or AAC M4A.
- Cache file names are HMAC-SHA256 values computed with a random 32-byte key generated per installation (`media-key.bin`). This means cache names don't reveal the source file names.
- Unfinished `.partial` files, and cache files older than 30 days, are deleted.

## Cursor guard (from K-Meleon-R)

The cursor guard stops themed or replaced mouse pointers, which can be used to disguise what you are clicking.

- **Registry layer.** While the app runs, it checks your per-user pointer scheme at startup, every 1.5 seconds, and whenever Windows reports a preference change:
  - A slot in `HKCU\Control Panel\Cursors` is kept only if it's empty (the Windows default) or points to a `.cur` or `.ani` file inside `%WINDIR%\Cursors`.
  - The path is checked after expanding 8.3 names and rejecting `..`, UNC, device and alternate-stream paths, symbolic links and reparse points. Any other slot is reset to the default.
  - "Allow themes to change mouse pointers" (`ThemeChangesMousePointers`) is turned off.
  - If the per-user policy key `HKCU\Software\Policies\Microsoft\Windows\Personalization` already exists, `NoChangingMousePointers` and `NoChangingSoundScheme` are set to 1. The key is never created.
  - Resets are logged to `cursor-guard.log`.
  - **These are per-user Windows settings, and they stay after the app closes or is uninstalled.** You can change pointers again in Mouse settings > Additional mouse settings > Pointers.
- **Page layer.** A script injected into every document and frame before its own scripts run keeps web content to built-in cursor keywords:
  - `style.setProperty('cursor', …)` and `style.cssText` assignments are filtered synchronously.
  - Chromium has no interceptable setter for direct `element.style.cursor = …` assignments. Those are removed by a MutationObserver at the next microtask checkpoint, before the next paint.
  - Stylesheet cursors are reset to `auto` on pointer events. This includes elements inside open shadow roots, which are reached through the event path; the MutationObserver itself doesn't see inside shadow roots.

## Capture shield and Defender watchdog

- **Capture shield** is off by default. The title-bar button applies `WDA_EXCLUDEFROMCAPTURE`, so screenshots and screen recordings show the window as excluded. It doesn't protect against cameras, kernel-level capture or other devices.
- **Defender watchdog** checks Windows Security Center at startup and every 5 minutes. It shows a warning when no antivirus is registered, real-time protection appears to be off, or definitions may be out of date. It only warns and never changes security settings.

## Logs and data

- All data lives in `%LOCALAPPDATA%\Glitch-Player-R4`.
- `host.log` records blocked navigations, denied permissions and errors; once it grows past 512 KB it is deleted and started again.
- Uninstalling keeps the data folder unless you choose to delete it.

## Installer

- The NSIS installer runs as the current user (`RequestExecutionLevel user`) and installs to `%LOCALAPPDATA%\Programs\Glitch-Player-R4`.
- It refuses to install into the data folder, and setup and the uninstaller refuse to run while the app is open.
- It doesn't download anything; if the WebView2 Runtime is missing, it tells you to install it.
- `build.cmd` writes the installer's SHA-256 to a `.sha256` file. Compare it before running setup.

## Known limitations

- Unsigned binaries trigger SmartScreen warnings, and you can't verify the publisher from a signature.
- Security depends on the shared Microsoft Edge WebView2 Runtime staying up to date.
- The process mitigations are best-effort, and failures are ignored.
- Direct `style.cursor` assignments are removed asynchronously, as described under [Page layer](#cursor-guard-from-k-meleon-r).
- YouTube content is third-party and runs in a sandboxed cross-origin frame under Google's terms.

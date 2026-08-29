(function () {
  "use strict";

  /* ── canvas / FX elements ─────────────────────────────────────── */
  const canvas     = document.getElementById("fxCanvas");
  const ctx        = canvas.getContext("2d", { alpha: true, desynchronized: true });
  const mediaLayer = document.getElementById("mediaLayer");

  /* ── revision-R blend constants ──────────────────────────────── */
  const REVISION_WEIGHTS = Object.freeze({ r2: 0.78, r1: 0.08, r3: 0.08, r4: 0.06 });
  const TAU_SECONDS      = 0.16;
  const MAX_DISPLACEMENT = 7.5;

  const state = {
    frame: 0,
    smoothJitter: 0, smoothWarp: 0, smoothHue: 0,
    smoothBloom: 0,  smoothScan: 0,
    lastTime: performance.now(),
    mediaMode: "none"   // "none" | "local" | "youtube"
  };

  const fxSettings = {
    enabled: true,
    intensity: 0.65,
    jitter: 1,
    scan: 1,
    bloom: 1
  };

  /* ── resize ───────────────────────────────────────────────────── */
  function resize() {
    const w = Math.max(1, Math.floor(window.innerWidth));
    const h = Math.max(1, Math.floor(window.innerHeight));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  /* ── blend math ───────────────────────────────────────────────── */
  function pulse(seed, speed, t) { return 0.5 + 0.5 * Math.sin(seed + speed * t); }

  function computeBlendTargets(tSec) {
    const r2 = { jitter: 0.25*pulse(0.3,0.9,tSec),  warp:0.18+0.12*pulse(1.6,0.7,tSec), hue:0.08+0.06*pulse(2.2,0.5,tSec), bloom:0.12+0.08*pulse(0.9,0.65,tSec), scan:0.13+0.09*pulse(1.1,0.55,tSec) };
    const r1 = { jitter: 0.38*pulse(2.9,1.4,tSec),  warp:0.33*pulse(2.1,1.2,tSec),       hue:0.27*pulse(0.5,0.8,tSec),       bloom:0.21*pulse(2.7,1.0,tSec),        scan:0.31*pulse(1.9,1.1,tSec) };
    const r3 = { jitter: 0.42*pulse(4.2,1.8,tSec),  warp:0.26*pulse(3.3,1.5,tSec),       hue:0.34*pulse(2.4,1.1,tSec),       bloom:0.19*pulse(1.5,1.3,tSec),        scan:0.28*pulse(2.8,1.0,tSec) };
    const r4 = { jitter: 0.48*pulse(5.4,2.0,tSec),  warp:0.31*pulse(3.9,1.6,tSec),       hue:0.39*pulse(4.0,1.2,tSec),       bloom:0.17*pulse(3.1,1.0,tSec),        scan:0.24*pulse(2.6,1.25,tSec) };
    const w  = REVISION_WEIGHTS;
    return {
      jitter: w.r2*r2.jitter + w.r1*r1.jitter + w.r3*r3.jitter + w.r4*r4.jitter,
      warp:   w.r2*r2.warp   + w.r1*r1.warp   + w.r3*r3.warp   + w.r4*r4.warp,
      hue:    w.r2*r2.hue    + w.r1*r1.hue    + w.r3*r3.hue    + w.r4*r4.hue,
      bloom:  w.r2*r2.bloom  + w.r1*r1.bloom  + w.r3*r3.bloom  + w.r4*r4.bloom,
      scan:   w.r2*r2.scan   + w.r1*r1.scan   + w.r3*r3.scan   + w.r4*r4.scan
    };
  }

  function smoothTo(cur, tgt, dt) {
    return cur + (tgt - cur) * (1 - Math.exp(-dt / TAU_SECONDS));
  }

  function updateBlend(nowMs) {
    const dt  = Math.max(0.001, Math.min(0.05, (nowMs - state.lastTime) / 1000));
    state.lastTime = nowMs;
    const tgt = computeBlendTargets(nowMs / 1000);
    state.smoothJitter = smoothTo(state.smoothJitter, tgt.jitter, dt);
    state.smoothWarp   = smoothTo(state.smoothWarp,   tgt.warp,   dt);
    state.smoothHue    = smoothTo(state.smoothHue,    tgt.hue,    dt);
    state.smoothBloom  = smoothTo(state.smoothBloom,  tgt.bloom,  dt);
    state.smoothScan   = smoothTo(state.smoothScan,   tgt.scan,   dt);
  }

  /* ── draw passes ──────────────────────────────────────────────── */
  function drawSourceFrame() {
    if (state.mediaMode !== "local" || mediaLayer.readyState < 2) return;
    const W = canvas.width, H = canvas.height;
    const strength = fxSettings.intensity * fxSettings.jitter;
    const dx = Math.sin(state.frame * 0.031) * state.smoothWarp * MAX_DISPLACEMENT * strength;
    const dy = Math.cos(state.frame * 0.027) * state.smoothWarp * MAX_DISPLACEMENT * strength;
    ctx.save();
    ctx.globalAlpha = 0.94;
    ctx.filter = "saturate(1.05) contrast(1.04)";
    ctx.drawImage(mediaLayer, dx, dy, W, H, 0, 0, W, H);
    ctx.restore();
    const ch = Math.max(0.2, state.smoothJitter * 3.0);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = (0.07 + state.smoothHue * 0.1) * strength;
    ctx.fillStyle = "rgba(255,80,80,0.45)";  ctx.fillRect(ch,  0, W, H);
    ctx.fillStyle = "rgba(80,160,255,0.3)";  ctx.fillRect(-ch, 0, W, H);
    ctx.restore();
  }

  function drawScanlines() {
    const W = canvas.width, H = canvas.height;
    const alpha = (0.022 + state.smoothScan * 0.03) * fxSettings.intensity * fxSettings.scan;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#7fdbff";
    for (let y = state.frame % 2; y < H; y += 2) ctx.fillRect(0, y, W, 1);
    ctx.restore();
  }

  function drawBloom() {
    const W = canvas.width, H = canvas.height;
    const cx = W * (0.5 + 0.05 * Math.sin(state.frame * 0.0027));
    const cy = H * (0.5 + 0.05 * Math.cos(state.frame * 0.0021));
    const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.66);
    const e  = (0.08 + state.smoothBloom * 0.13) * fxSettings.intensity * fxSettings.bloom;
    g.addColorStop(0,    "rgba(114,255,240," + e.toFixed(3) + ")");
    g.addColorStop(0.65, "rgba(243,170,83,"  + (e * 0.55).toFixed(3) + ")");
    g.addColorStop(1,    "rgba(3,8,18,0.44)");
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function render(nowMs) {
    resize();
    updateBlend(nowMs);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (fxSettings.enabled) {
      drawSourceFrame();
      drawScanlines();
      drawBloom();
    }
    state.frame += 1;
    requestAnimationFrame(render);
  }

  /* ═══════════════════════════════════════════════════════════════
     TRANSPORT CONTROLS
  ═══════════════════════════════════════════════════════════════ */
  const transport     = document.getElementById("transport");
  const playPauseBtn  = document.getElementById("playPauseBtn");
  const stopBtn       = document.getElementById("stopBtn");
  const seekBar       = document.getElementById("seekBar");
  const timeElapsed   = document.getElementById("timeElapsed");
  const timeDuration  = document.getElementById("timeDuration");
  const volBar        = document.getElementById("volBar");
  const volIcon       = document.getElementById("volIcon");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const openMediaBtn  = document.getElementById("openMediaBtn");
  const openOverlay   = document.getElementById("openOverlay");
  const statusLine    = document.getElementById("statusLine");
  const fxPanel       = document.getElementById("fxPanel");
  const fxToggleBtn   = document.getElementById("fxToggleBtn");
  const fxEnabled     = document.getElementById("fxEnabled");

  let seekDragging = false;

  function fmtTime(sec) {
    if (!isFinite(sec) || isNaN(sec)) return "0:00";
    sec = Math.floor(sec);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function setStatus(msg) { if (statusLine) statusLine.textContent = msg; }

  function showTransport() {
    transport.removeAttribute("hidden");
    transport.classList.remove("hidden");
  }

  function showOpenOverlay() {
    openOverlay.classList.remove("hidden");
  }

  function hideOpenOverlay() {
    openOverlay.classList.add("hidden");
  }

  function syncLocalCanvasPresentation() {
    document.body.classList.toggle("canvas-local-playback", state.mediaMode === "local" && fxSettings.enabled);
  }

  /* ── play/pause icon ──────────────────────────────────────────── */
  function setPlayIcon(playing) {
    playPauseBtn.textContent  = playing ? "\u23F8" : "\u25B6";
    playPauseBtn.title        = playing ? "Pause" : "Play";
    playPauseBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  /* ── volume ───────────────────────────────────────────────────── */
  function applyVolume(v) {
    mediaLayer.volume = v;
    if (ytPlayer && typeof ytPlayer.setVolume === "function") ytPlayer.setVolume(v * 100);
    volIcon.textContent = v === 0 ? "\u{1F507}" : v < 0.4 ? "\u{1F508}" : "\u{1F50A}";
  }

  volBar.addEventListener("input", function () { applyVolume(parseFloat(volBar.value)); });

  volIcon.addEventListener("click", function () {
    if (parseFloat(volBar.value) > 0) {
      volBar.dataset.prev = volBar.value;
      volBar.value = "0";
    } else {
      volBar.value = volBar.dataset.prev || "1";
    }
    applyVolume(parseFloat(volBar.value));
  });

  /* ── fullscreen ───────────────────────────────────────────────── */
  fullscreenBtn.addEventListener("click", function () {
    if (!document.fullscreenElement) {
      document.getElementById("stage").requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
  });

  document.addEventListener("fullscreenchange", function () {
    fullscreenBtn.title = document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen";
  });

  /* ── open-media button ────────────────────────────────────────── */
  openMediaBtn.addEventListener("click", function () {
    openOverlay.classList.toggle("hidden");
  });

  function bindFxRange(id, setting, outputId) {
    const input = document.getElementById(id);
    const output = document.getElementById(outputId);
    const update = function () {
      fxSettings[setting] = parseInt(input.value, 10) / 100;
      output.textContent = input.value + "%";
    };
    input.addEventListener("input", update);
    update();
  }

  fxToggleBtn.addEventListener("click", function () {
    const isHidden = fxPanel.classList.toggle("hidden");
    fxToggleBtn.setAttribute("aria-expanded", String(!isHidden));
  });
  fxEnabled.addEventListener("change", function () {
    fxSettings.enabled = fxEnabled.checked;
    syncLocalCanvasPresentation();
  });
  bindFxRange("fxIntensity", "intensity", "fxIntensityValue");
  bindFxRange("fxJitter", "jitter", "fxJitterValue");
  bindFxRange("fxScan", "scan", "fxScanValue");
  bindFxRange("fxBloom", "bloom", "fxBloomValue");

  /* ═══════════════════════════════════════════════════════════════
     LOCAL (HTML5) MEDIA
  ═══════════════════════════════════════════════════════════════ */
  const fileInput   = document.getElementById("fileInput");
  const fileChooserText = document.getElementById("fileChooserText");
  const localLoadBtn = document.getElementById("localLoadBtn");
  let localObjectUrl = null;

  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) {
      fileChooserText.textContent = fileInput.files[0].name;
    }
  });

  localLoadBtn.addEventListener("click", startLocal);

  function startLocal() {
    const file = fileInput.files && fileInput.files[0];
    if (!file) { setStatus("Select an MP3 or MP4 file first."); return; }

    stopAll();

    if (localObjectUrl) { URL.revokeObjectURL(localObjectUrl); localObjectUrl = null; }
    localObjectUrl = URL.createObjectURL(file);
    /* createObjectURL always returns a blob: URI; guard confirms this to static analysers */
    if (!localObjectUrl.startsWith("blob:")) { setStatus("Unexpected URL type — aborting."); return; }

    mediaLayer.src = localObjectUrl;
    mediaLayer.volume = parseFloat(volBar.value);
    mediaLayer.loop   = false;
    mediaLayer.muted  = false;

    mediaLayer.play().catch(function (e) {
      setStatus("Playback blocked — tap Play to start.");
      console.warn("autoplay blocked:", e);
    });

    state.mediaMode = "local";
    syncLocalCanvasPresentation();
    hideOpenOverlay();
    showTransport();
    setStatus("Playing: " + file.name);
    setPlayIcon(true);
  }

  /* HTML5 media events */
  mediaLayer.addEventListener("timeupdate", function () {
    if (seekDragging || state.mediaMode !== "local") return;
    if (mediaLayer.duration > 0) {
      seekBar.value   = Math.round((mediaLayer.currentTime / mediaLayer.duration) * 1000);
      timeElapsed.textContent  = fmtTime(mediaLayer.currentTime);
      timeDuration.textContent = fmtTime(mediaLayer.duration);
    }
  });

  mediaLayer.addEventListener("play",  function () { setPlayIcon(true);  });
  mediaLayer.addEventListener("pause", function () { setPlayIcon(false); });
  mediaLayer.addEventListener("ended", function () {
    setPlayIcon(false);
    seekBar.value = 0;
    timeElapsed.textContent = "0:00";
    setStatus("Playback ended.");
  });

  mediaLayer.addEventListener("durationchange", function () {
    timeDuration.textContent = fmtTime(mediaLayer.duration);
  });

  /* play/pause for local */
  playPauseBtn.addEventListener("click", function () {
    if (state.mediaMode === "local") {
      if (mediaLayer.paused) { mediaLayer.play(); } else { mediaLayer.pause(); }
    } else if (state.mediaMode === "youtube" && ytPlayer) {
      const ps = ytPlayer.getPlayerState();
      if (ps === YT.PlayerState.PLAYING) { ytPlayer.pauseVideo(); }
      else { ytPlayer.playVideo(); }
    }
  });

  /* stop */
  stopBtn.addEventListener("click", stopAll);

  function stopAll() {
    /* local */
    if (!mediaLayer.paused) mediaLayer.pause();
    mediaLayer.removeAttribute("src");
    mediaLayer.load();

    /* youtube */
    if (ytPlayer && typeof ytPlayer.stopVideo === "function") {
      ytPlayer.stopVideo();
    }

    state.mediaMode = "none";
    document.body.classList.remove("canvas-local-playback");
    seekBar.value = 0;
    timeElapsed.textContent  = "0:00";
    timeDuration.textContent = "0:00";
    setPlayIcon(false);
    setStatus("Stopped.");
  }

  /* seek bar */
  seekBar.addEventListener("mousedown",  function () { seekDragging = true; });
  seekBar.addEventListener("touchstart", function () { seekDragging = true; }, { passive: true });

  seekBar.addEventListener("input", function () {
    const ratio = seekBar.value / 1000;
    if (state.mediaMode === "local" && mediaLayer.duration > 0) {
      timeElapsed.textContent = fmtTime(mediaLayer.duration * ratio);
    } else if (state.mediaMode === "youtube" && ytPlayer) {
      const dur = ytPlayer.getDuration();
      if (dur > 0) timeElapsed.textContent = fmtTime(dur * ratio);
    }
  });

  seekBar.addEventListener("change", function () {
    seekDragging = false;
    const ratio = seekBar.value / 1000;
    if (state.mediaMode === "local" && mediaLayer.duration > 0) {
      mediaLayer.currentTime = mediaLayer.duration * ratio;
    } else if (state.mediaMode === "youtube" && ytPlayer) {
      const dur = ytPlayer.getDuration();
      if (dur > 0) ytPlayer.seekTo(dur * ratio, true);
    }
  });

  /* ═══════════════════════════════════════════════════════════════
     YOUTUBE IFrame Player API
  ═══════════════════════════════════════════════════════════════ */
  let ytPlayer     = null;
  let ytApiReady   = false;
  let ytPendingId  = null;
  let ytTickHandle = null;

  /* Load YT API script once */
  function loadYTApi() {
    if (document.getElementById("yt-api-script")) return;
    const s    = document.createElement("script");
    s.id       = "yt-api-script";
    s.src      = "https://www.youtube.com/iframe_api";
    s.async    = true;
    document.head.appendChild(s);
  }

  /* Called by YT API when ready */
  window.onYouTubeIframeAPIReady = function () {
    ytApiReady = true;
    if (ytPendingId) {
      createYTPlayer(ytPendingId);
      ytPendingId = null;
    }
  };

  function createYTPlayer(videoId) {
    /* destroy previous player if any */
    if (ytPlayer) {
      try { ytPlayer.destroy(); } catch (e) {}
      ytPlayer = null;
    }

    /* YT API needs a container div */
    const ytFrame = document.getElementById("ytFrame");
    while (ytFrame.firstChild) { ytFrame.removeChild(ytFrame.firstChild); }
    const inner = document.createElement("div");
    inner.id    = "ytPlayerInner";
    ytFrame.appendChild(inner);

    ytPlayer = new YT.Player("ytPlayerInner", {
      videoId: videoId,
      playerVars: {
        autoplay:       1,
        controls:       1,
        rel:            0,
        modestbranding: 1,
        playsinline:    1,
        origin:         window.location.origin || "https://localhost"
      },
      events: {
        onReady:       onYTReady,
        onStateChange: onYTStateChange,
        onError:       onYTError
      }
    });
  }

  function onYTReady(event) {
    event.target.setVolume(parseFloat(volBar.value) * 100);
    event.target.playVideo();
    const dur = event.target.getDuration();
    timeDuration.textContent = fmtTime(dur);
    startYTTick();
    setStatus("YouTube playing.");
  }

  function onYTStateChange(event) {
    const PS = YT.PlayerState;
    if (event.data === PS.PLAYING) {
      setPlayIcon(true);
      startYTTick();
      timeDuration.textContent = fmtTime(ytPlayer.getDuration());
    } else if (event.data === PS.PAUSED) {
      setPlayIcon(false);
    } else if (event.data === PS.ENDED) {
      setPlayIcon(false);
      seekBar.value = 0;
      timeElapsed.textContent = "0:00";
      stopYTTick();
      setStatus("YouTube playback ended.");
    } else if (event.data === PS.BUFFERING) {
      setStatus("Buffering…");
    }
  }

  function onYTError(event) {
    const codes = { 2: "Invalid video ID.", 5: "HTML5 player error.", 100: "Video not found or private.", 101: "Embedding disabled by owner.", 150: "Embedding disabled by owner." };
    setStatus("YouTube error: " + (codes[event.data] || "code " + event.data));
    stopYTTick();
    setPlayIcon(false);
  }

  function startYTTick() {
    stopYTTick();
    ytTickHandle = setInterval(function () {
      if (!ytPlayer || seekDragging) return;
      const cur = ytPlayer.getCurrentTime();
      const dur = ytPlayer.getDuration();
      if (dur > 0) {
        seekBar.value = Math.round((cur / dur) * 1000);
        timeElapsed.textContent  = fmtTime(cur);
        timeDuration.textContent = fmtTime(dur);
      }
    }, 500);
  }

  function stopYTTick() {
    if (ytTickHandle !== null) { clearInterval(ytTickHandle); ytTickHandle = null; }
  }

  /* ── YouTube URL input ────────────────────────────────────────── */
  const ytInput   = document.getElementById("ytInput");
  const ytLoadBtn = document.getElementById("ytLoadBtn");

  ytLoadBtn.addEventListener("click", startYouTube);
  ytInput.addEventListener("keydown", function (e) { if (e.key === "Enter") startYouTube(); });

  function parseYouTubeId(input) {
    if (!input) return null;
    const s = input.trim();
    const m = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
              s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
              s.match(/embed\/([a-zA-Z0-9_-]{11})/) ||
              s.match(/shorts\/([a-zA-Z0-9_-]{11})/) ||
              (s.match(/^[a-zA-Z0-9_-]{11}$/) ? [null, s] : null);
    return m ? m[1] : null;
  }

  function startYouTube() {
    const id = parseYouTubeId(ytInput.value);
    if (!id) { setStatus("Invalid or unrecognised YouTube URL."); return; }

    stopAll();
    state.mediaMode = "youtube";
    document.body.classList.remove("canvas-local-playback");
    hideOpenOverlay();
    showTransport();
    setStatus("Loading YouTube…");
    setPlayIcon(false);
    seekBar.value = 0;
    timeElapsed.textContent  = "0:00";
    timeDuration.textContent = "0:00";

    if (!ytApiReady) {
      ytPendingId = id;
      loadYTApi();
    } else {
      createYTPlayer(id);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     SPLASH SCREEN
  ═══════════════════════════════════════════════════════════════ */
  const splash        = document.getElementById("splash");
  const splashEnterBtn = document.getElementById("splashEnterBtn");
  const stage         = document.getElementById("stage");

  splashEnterBtn.addEventListener("click", enterPlayer);
  splash.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") enterPlayer(); });

  function enterPlayer() {
    splash.classList.add("fade-out");
    splash.addEventListener("animationend", function () {
      splash.remove();
    }, { once: true });

    stage.removeAttribute("hidden");
    resize();
    requestAnimationFrame(render);
  }

  /* ── init volume ──────────────────────────────────────────────── */
  applyVolume(parseFloat(volBar.value));
  window.addEventListener("resize", resize);
  resize();

})();

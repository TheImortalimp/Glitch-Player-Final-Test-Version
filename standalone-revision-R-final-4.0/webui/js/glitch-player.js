      'use strict';
      const R4 = window.R4Policy;
      if (!R4) throw new Error('r4-policy.js must load before glitch-player.js.');
      const welcomeScreen = document.getElementById('welcomeScreen');
      const welcomeEnterBtn = document.getElementById('welcomeEnterBtn');
      const sourceScreen = document.getElementById('sourceScreen');
      const playbackControls = ['rightRack', 'ghostBtnRack', 'sliderContainer', 'preset-toggle-btn',
          'preset-dropdown-container', 'ui-toggle-tab', 'earHud', 'nowPlayingHud'];
      playbackControls.forEach((id) => { const el = document.getElementById(id); if (el) el.inert = true; });
      document.getElementById('welcomeAudioTypes').textContent = R4.mediaExtensions.audio.join(', ').toUpperCase();
      document.getElementById('welcomeVideoTypes').textContent = R4.mediaExtensions.video.join(', ').toUpperCase();
      if (welcomeScreen && welcomeEnterBtn) {
          welcomeEnterBtn.addEventListener('click', () => {
              welcomeScreen.hidden = true;
              document.body.classList.add('welcome-dismissed');
              sourceScreen.hidden = false;
              document.getElementById('sourceHeading').focus();
          });
      }
      /* ============================================================================
         GLITCH CANVAS — RAPID FIRE v11 (Deepseek Machine-Preset Edition)
         v11 CHANGES:
         • WARP BLEND FREEDOM: B&W Invert, Strobe, Flash, HSL Rainbow,
           Hue/Color Cycle & Neon Grad now run at full 0-100% strength over the
           AI Warp Engine (boosted peaks + caps). Anti-washout pairs are
           time-limited (2.5x hold) instead of skipped, so blends burst over
           the warp but never linger into opacity mud.
         • GHOST PROTOCOL v11 — CRISP ENGINE: zero blur, hard-edged RGB channel
           splits, contrast-forward pre-filter, full-screen soft-light "mud"
           washes removed, single crisp sweeping hairline signature.
         • V-SYNC v11 — SHARP ENGINE: 1px bright scan-bar core with tight halo,
           hard-offset tear slices (no vertical channel squash), crisp roll
           band, level-gated scanline comb. Warp confluence now SHARPENS
           instead of softening.
         • GHOST/V-SYNC SLIDER LOGIC REDONE: OFF never parks or zeros the
           sliders — levels are held in memory, dragging a level slider while
           OFF re-engages the engine at that level instantly.
         • NO PARKING EXCEPT ZERO ALL: turning Auto Glitch or Continual
           Randomization OFF freezes targets where they are (nothing zeroed,
           nothing parked). Only the ZERO ALL EFFECTS button parks & zeros —
           and re-enabling CR / Auto Glitch or touching any slider restarts
           the levels (incl. master opacity un-zero + aesthetic burst wakeup).
         • FULL-RANGE SLIDERS: every effect slider (B&W Invert included) can
           linger and peak 0-100%, drift in-between, and burst-peak 50-100%
           (B&W full greyscale-inversion territory) — with temporal guards so
           white-grey-black washout and opacity-mixing never persist.
         • AESTHETIC BURSTS v11: 16 curated groups with timed 0-100 peaks AND
           timed reductions (dip phase) that fit together, creating variance
           over time. R4.1.1 adds four light-free groups: prismDrift,
           moonlightVeil, glyphRainfall and crtDaydream.
         • MACHINE PRESET MEMORY: 40 code-generated presets 'Deepseek-1' …
           'Deepseek-40' built on every page load — 40 definitively distinct
           combinations of levels, styles, locks, toggles and states. The
           preset browser gains a User(Purple-Violet)/Machine(Orange-Yellow)
           list-memory toggle (two-color gradient per state, list field tinted
           40% opaque) and a " -ʁ%AUTO%ʁ- " cycler that applies a random
           preset from either list every 2.5-5.7s, swapping the list toggle
           when the pick comes from the other memory.
         R1.9 — THE DEEPSEEK 80 (user request):
         • The machine memory DOUBLES: forty new archetype presets join the
           original forty — the list is now Deepseek-1 .. Deepseek-80. Ink
           washes, paper negatives, phosphor traces, tape archives, aurora
           gates, twin pulsars, terminal blooms and more, each voiced for
           the source-commanded ensemble. The original forty keep their
           exact slots (Deepseek-3 GLYPH SHIMMER, Deepseek-25 GLITCH
           GOSPEL, Deepseek-37 FULL ENSEMBLE are unchanged), and the wider
           busy-score spread gives the curated AUTO roulette far more to
           curate between quiet studies and full storms.
         • The AUTO-cycler's random change interval tightens to 2.5-5.7s
           (was 3.4-7.9s) — the curated roulette moves faster.

         R1.8 — THE HEARTBEAT (user request — total source command):
         • THE BOARD'S HEARTBEAT: the master breath LFO's tempo now rides
           source energy (breathRate 0.75-1.30x, accumulated phase so the
           curve never jumps) — calm video breathes ~15s, lively ~8.7s —
           and the shared STAGE anchor wanders wider on busy video
           (stageK), so every anchored voice (bloom / flash / twins /
           burst) follows the canvas's energy across the screen.
         • THE LAST CONSTANTS FALL:
           – ink stamps LINGER on dark canvas (inkLife 0.75-1.25x)
           – Font Burn's echo chases words faster on lively video (echoPace)
           – V-Sync tears multiply with motion (tearK)
           – the GHOST SMEARS with motion — real motion blur (smearK)
           – Data Bomb's swarm grows with appetite (36-52 glyphs);
             Gemini shrapnel too (4-10 shards)
           – washout pairs earn headroom on lively video (pairRoom)
         • THE PRESET ROULETTE IS CURATED: the AUTO cycler now leans its
           odds toward presets that MATCH the source's temperament
           (temper = energy + ½·motion) — lively video draws busy boards,
           calm video draws sparse ones. Still random, never forced.
         • __glitchDebug.modifiers() now exposes the full 35-key table.

         R1.7 — THE CANVAS IS THE CODE (user request — total source command):
         • THE RANDOMIZER ITSELF now answers to the canvas: the travel
           pace of every randomized slider rides source energy (randRate
           0.8-1.2x), the ambient floors the guards pull back to scale
           with it (ambientK), and the stuck-high patience shortens on
           lively video (stuckK) — a busy canvas never lets a voice peg.
         • THE CODING IS SOURCE-PICKED: Font Burn's vocabulary is banked —
           vivid video burns NEON/SYNTH/CHROME words, dark video burns
           NULL/VOID/SYSFAIL words (wordVivid/wordDark bank shares);
           burn word SIZE rides appetite (fontScale); the ASCII rain grid
           densifies on vivid video and opens on grey (asciiGap).
         • COMBO MOOD is steered: saturation x appetite, contrast x
           darkness, glow x energy (comboSat / comboCon / comboGlow).
         • HSL Rainbow: the prism spins with source motion (spinK up to
           ~1.7x) and its wash saturates with appetite (rainbowSat).
         • Gemini Bomb's twin orbit spins with energy (geminiK); Data
           Bands film grain rides motion; the B&W sweep peak rides the
           source's darkness (bwPeak 0.88-0.98); the shift-overlay
           spectrum's paper follows the source's light.
         • __glitchDebug.modifiers() now exposes the full 27-key table.

         R1.6 — THE SOURCE IS THE ENGINE (user request — B&W still too hot):
         • B&W INVERT — the ceiling drops HARD: the invert cap now tops out
           at 0.60 on the darkest video and 0.48 on the brightest (was
           0.88-0.78). Even a FULL-slam negative prints soft: its whites
           stop below ~0.58, its blacks never crush below ~0.42. Contrast
           is now FLAT (removed — every point of it pushed the whites back
           up) and the brightness lift deepens a touch. Bright sources
           print softer than dark ones, as before.
         • ONE LIVE MODIFIER TABLE (R16) — every system that still ran on
           fixed constants now reads the background canvas:
           – scanline comb tightens with source motion (busy video = dense comb)
           – strobe ruff cadence shortens with source energy
           – Data Bands weave amplitude rides source motion
           – VHS ripple amplitude rides energy + motion
           – Data Bomb burst reach rides color appetite
           – ink stamp SIZE rides darkness (dark canvas = bigger ink)
           – ink ALPHABET rides darkness — dark video strikes sigil/code
             glyphs, bright video clean letterforms (the source picks the
             "coding")
           – Neon veil + bloom radius ride darkness (dark canvas = bloom)
           – V-Sync scan speed rides energy
           – washout-pair holds lengthen on calm sources (energy-keyed)
           – combo post-process harmony strength rides color appetite
         • __glitchDebug.modifiers() exposes the whole live modifier table;
           forcePalette() can now force motion + energy for testing.

         R1.5 — SOURCE OMNIPRESENT (user request — redo every aspect):
         • B&W INVERT — the white/dark fix goes to the ROOT: the invert
           amount itself is CAPPED (CSS invert(k) blends original ×
           negative), so the negative's whites stop at ~0.78-0.87 and its
           blacks never fall below ~0.13-0.22 — printed on softer paper,
           never blazing, never crushed. The cap is SOURCE-KEYED: bright
           video inverts shallower, dark video digs deeper. Contrast stays
           nearly flat (≤1.05) and a whisper of brightness lift remains.
         • THE SOURCE COMMANDS EVERY ASPECT (completion of the redo):
           – fxGate: the resonance gates' FLOOR rises with source energy
             (on lively video no voice ever fully closes) and their pacing
             (resPhase) advances up to ~1.5× faster.
           – effectPaintAlpha: a global SOURCE FACTOR (0.86-1.14) now
             scales EVERY paint alpha in the engine — the whole board
             breathes with the background canvas.
           – Timed triggers snap tighter on busy sources; the FX chord
             picks wide sparkling chords (lydian/mixolydian/hungarian) on
             vivid video and dark minors on grey.
           – Automated masters are steered: energy → boardEnergy /
             motionScale / continualSpeed, appetite → effectIntensity,
             calm darkness → blendSoftness.
           – CR's timing TEMPERAMENT is source-set: lively footage tips
             toward burst/zoomBurst, calm footage toward linger/smooth.
           – Ink flow + ASCII rain rates × source energy; the AI-warp
             spectrum's saturation rides the appetite (vivid = full-blood,
             grey = pastel); the shift overlay intensity × appetite.
           – applyRandomSeed + randomizeBoard recolor their random boards
             by appetite (chroma voices lift on colorful video).
           – The ghost's channel split widens with source energy; the
             B&W sweep cadence follows the source's darkness.
         R1.4 — THE SOURCE IS THE ENGINE (user request):
         • The chosen video / artwork is now THE modifier of the whole FX
           engine and its randomization: the palette sampler grows a full
           SOURCE PROFILE — hue, saturation, light, energy, plus new
           CONTRAST (luminance spread), MOTION (frame-to-frame movement)
           and DARKNESS — all eased, all readable by every system.
         • NEW CONFLUENCE HUE (fxConfluenceHue): one hue shared by the
           filter paths — the source root bent by the chord tone, the
           Hue/Color Cycle slider, HSL Rainbow, the AI-warp prism and the
           combo profile. V-SYNC and GHOST PROTOCOL now paint with it, so
           they conflue with ANY other setting on the board.
         • The Ghost/V-Sync SVG filter pair (vsync-ghost-hue /
           vsync-ghost-saturate + sharpen convolve) is now LIVE — written
           every frame from the confluence state and referenced by the
           ghost's snapshot pre-filter. Ghost saturation follows the
           source sat + HSL Rainbow; B&W Invert presence desaturates the
           ghost; the curve toning, phosphor wash and sweep follow the
           source's key colors. V-Sync's hum + tearing feed on the source
           energy + motion; its field-line saturation is source-keyed.
         • B&W INVERT — white + dark levels pulled down (user: too
           high): greyscale arrives later (full at ~90%), the contrast
           boost is nearly flat and source-keyed (bright sources soften
           it further), inverted whites are tamed by a gentle brightness
           pull, the phase-1 saturation boost is halved, and the automated
           peaks (sweep + bursts) hold at 0.90-0.94 instead of 1.0.
         • AI WARP — MULTI-SPECTRUM PRISM (user request): the overlay
           triad opens into a 6-stop spectrum — root, +60, +120, +180,
           +240, +300 — the whole wheel breathing around the confluence
           root (palette-anchored aiWarpHue + the 006 drift/swings).
         • SOURCE-DRIVEN RANDOMIZATION: CR retargets are scaled by the
           source energy + motion (lively footage = livelier board, calm
           footage = restrained), the retarget cadence quickens with
           energy, colorful sources feed the chroma voices (color
           appetite), the global-opacity band follows the source
           brightness, aesthetic burst peaks ride the energy and prefer
           chroma groups on colorful sources, and Auto Glitch's pulses +
           spark cadence breathe with the source.
         • The 006 faces are source-keyed too: the ASCII scatter rainbow
           and the Ink rainbow orbit the source's spectrum when it is
           colorful (full wheel when grey), and the Font Burn prism fill
           bends toward the source's key.
         R1.3 — 006 ROTATION REVISION (user request):
         • FONT BURN + ASCII, total redo: each voice is now a MASHUP of
           its ensemble build × its final-006-glitch-canvas build, running
           a style clock that HEAVILY ROTATES between the two souls with a
           ~0.4s crossfade — and the presentation LEANS HARD toward the
           final-006 style (006 dwells ~3.2-6.8s, the ensemble face strikes
           back for ~1.1-2.7s ≈ a 70/30 split). Every activation re-opens
           on the dominant 006 face.
         • ASCII '006' face (dominant): the full-grid multi-alphabet
           RAINBOW DIFFERENCE scatter — ONE fresh random hue per frame,
           'difference' blend, 50% cell density, every cell re-rolling its
           glyph, spacing 10+(1−s)·20 budget-capped by asciiCells,
           alpha 0.8·s. ASCII 'ENS' face: the R1.2 random-appearing
           matrix stacks + glyph shimmer veil, their rate and alphas riding
           the style weight (stack frequency stays slider-governed).
         • FONT BURN '006' face (dominant): the per-frame WORD SPRAY — a
           fresh keyPhrase+phrase mashup EVERY FRAME (50%), random 9-font
           rotation, size 10+rand·80·s, random x/y, and the 006 3-phase
           hue-cycle coloring (Hue/Color Cycle <0.05: black text, white
           bloom, 'multiply'; >0.95: white text, black bloom; else the
           colorProgress·360 prism fill with an inverse-hue shadow,
           blur 5+25·s, 'lighter'). 'ENS' face: the crossfading Word Echo
           (chord-anticipating pair), its alpha riding the style weight.
         • AI WARP PRISM MATRIX (006 retouch, mashup): the warp hue now
           blends the 006 time-driven base (20°/s read at 0.62 gain) and
           its big strength swings (hue ×238, rainbow ×82) into the
           palette-anchored formula, and the shift overlay paints the
           006's true PRISM TRIAD gradient — root / +120° / +240° — with
           a whisper of jitter per 8s rebuild (color-dodge blend kept).
         R1.2 — CHORD RAIN REBORN (ASCII effect, user request):
         • The falling matrix rain is replaced by RANDOM-APPEARING glyph
           stacks — the Prism-Ink spawn model in MATRIX style.
         • Each stack strikes at a uniform-random position (stacks MAY
           OVERLAP and MAY sit far apart — no grid columns, no collision
           checks): a bright phosphor HEAD glyph whose 2-6 TRAIL glyphs rain
           into place beneath it with a staggered delay.
         • Matrix character kept: phosphor-green (chord root lerped toward
           120°) 'screen'-blend glow, the head re-rolls its character while
           fresh (matrix shimmer), heads bloom with a soft shadow glow, and
           everything decays like phosphor before lifting out.
         • The APPEARANCE FREQUENCY is set by the ASCII slider — ~0.6 stacks/s
           at a whisper up to ~9/s at full strength (gently modulated by the
           ensemble breath + resonance gate, but always slider-governed);
           timed Trigger bursts throw an opening flurry + swelling rate.
         • Kept: the rain grid machinery (spacing/budget), the v11.3 glyph
           shimmer veil, full ensemble integration (gate/duck/presets/CR/AG).
         R1.1 — PRISM INK (new ensemble voice: "Ink Glyphs"):
         • Randomly-appearing OPAQUE glyph stamps — ascii/symbol characters
           struck in THREE inks: RAINBOW (full-saturation random hues),
           JETBLACK (near-black lacquer) and WHITE LIGHT (luminous white,
           dark under-edge so it reads on any background).
         • Placement is uniform-random — stamps MAY OVERLAP (each casts a
           darker offset under-copy so overlaps read as layered ink) and
           MAY sit far apart ("spaced out"); no grid, no collision checks.
         • Stamp envelope: fast press-in, hold, fast lift-out — opacity
           never fades; the stamp scale carries the entrance/exit.
         • The ensemble keys the APPEARANCE RATE — breath, resonance gate
           (offset 0.96), auto-mix ducking and master intensity shape how
           often ink strikes; each stamp itself stays fully opaque
           (EFFECT_ALPHA_CAPS 1.0, 'source-over').
         • Full voice integration: slider + Trigger button + lock, CR /
           Auto Glitch / aesthetic bursts (digitalArt group) / parked
           protection / presets (GLYPH SHIMMER .40, SOFT CHAOS .30, RAVE
           REVISION .45, FULL ENSEMBLE .35, EVERYTHING ENGINE .40).
         GLITCH REVISION 1 — OLD-SOUL SYSTEMS BLEND (final-006 lineage):
         Every SYSTEM from final-006-glitch-canvas.html is now blended into
         the Harmonic Ensemble build — merged, tuned, never replacing:
         • CONTINUAL RANDOMIZATION (006-final math): a modesty cap — every
           randomized per-effect target is capped at 0.85 so the board gets
           lively without washing out (manual sliders stay exempt); mirror
           inversions flip 75% of the way (MIRROR_FLIP_FACTOR) so a
           whole-board mirror reads as a rolling wave; global opacity swings
           within its band (≤ 0.92) and never slams 0/1; parked sliders
           (below 0.02) are NEVER started by CR — it moves what is on;
           waking effects is Auto Glitch's unpark job; the first retarget
           after toggling CR on carries no burst (the board eases in); burst
           surges toned (rising 1.9×, falling 1.4×) and base slider ramps
           eased ~15% (006-final smoothing pass: 1.8/1.6 → 1.5/1.4 there).
         • AUTO GLITCH (006-final layer math): eased activity level
           (tau ≈ 3s), per-effect ceiling at the blend-profile peak, and the
           006 headroom curve — where the user's slider is already loud the
           layer whispers (25%), where the board is quiet it sings — over
           the 006 two-sine breath pulse (0.55 breathe + 0.19 surge).
         • GHOST PROTOCOL (006 soft passes over the crisp core): the soft
           blur-drift RGB echo at half alpha beside the hard split, the 006
           second cosine wave riding the column snap vertically, the 006
           tri-color curve toning + cyan phosphor wash (soft-light, toned to
           0.08), max effective intensity 2% (from 3%).
         • V-SYNC (006 TV-soul over the sharp engine): the dark blanking
           head + VCR tracking burr above the bright hairline, up-slip tears
           (vertical-hold pulls) mixed into the down-tears, pulsing tear
           thickness, NTSC subcarrier shimmer along the roll band, sync
           field lines when the ghost is off, and the phosphor sheen band.
         • AI WARP (006-final canvas tracking): glitchCanvas mirrors the warp
           shell's exact transform while the shell is visible, so canvas
           effects (ASCII rain, scanlines, VHS…) ride the warped surface;
           local playback stays neutral.
         • BOOT DEFAULTS (006-final): all defaultAlphas are 0 — what the
           sliders say and what renders stay in sync; the v11.3 toned boot
           levels live on as the machine preset 'Deepseek-1 · OLD SOUL'.
         • 40 MACHINE PRESETS fully rewritten for the revision — new
           archetypes voiced for the Harmonic Ensemble + old-soul blend.
         v11.2 — FX HARMONIC ENSEMBLE (complete effects-factory rewrite):
         • THE KEY: Ghost-Key home triad (Gh0sTs / D1giTaL / F34Rd0t hues)
           with voice-leading every 7-15s — every effect draws its colors
           from the live chord, resolving toward the shell.
         • THE BREATH: one ~11s master LFO every voice swells with.
         • RESONANCE: fixed phase offsets in a ~23s cycle — voices hand
           amplitude off to each other instead of colliding.
         • CROSSTALK: per-voice presence tracking, mutual auto-mix ducking on
           a busy board, and call-&-response (a spike earns its resonance
           neighbour a short answer swell).
         • THE STAGE: one shared Lissajous anchor — Neon blooms, Flash pulses,
           Gemini twins and Data bursts all key into the same geometry.
         • All 12 factories rewritten with new math, toned ceilings (0.38-0.55),
           soft blend modes, eased envelopes and coherent sinusoidal motion:
           Aurora Bloom / Comb Field / Aperture Pulse / Chord Wash / Flicker
           Gate / Chord Rain / Word Echo / Twin Orbit / Signal Weave / Tape
           Drift / Cipher Burst / chord-keyed Tech Artist.
         v11.3 — OLD-SOUL BLEND (006-glitch-canvas lineage merged in, tuned):
         Every effect implementation from the old 006 file is blended INTO the
         matching Harmonic Ensemble voice — merged, never replacing:
         • AURORA BLOOM += the old 5-stop hue-ring spectrum veil (chord-anchored
           root + k*72°, alpha ≤ 0.14, breathing) — 006 Neon Grad.
         • COMB FIELD += old strength-keyed line thickness (1+floor(s*1.5)), the
           4-8px gap band, a uniform baseline hue (chord root lerped toward the
           old cyan 200°) and an every-8th-line mesh echo — 006 Scanlines.
         • APERTURE PULSE += a faint full-frame wash (≤ 0.08) in the same chord
           tone — 006 Flash's full-frame tint, toned to a breath.
         • CHORD WASH += a slow continuous hue drift (006 time*90 spin, tuned)
           added to the chord tones.
         • FLICKER GATE += the old 0.35-probability dropout mask riding the
           coherent ~11Hz ruff sine — 006 Strobe's dice, musical cadence kept.
         • CHORD RAIN += a second-pass GLYPH SHIMMER veil: sparse full-grid
           multi-alphabet scatter (latin/katakana/cyrillic/greek/hebrew/symbols
           via FX_GLYPH_BANK) in 'difference' blend (≤ 0.10), grid-aligned,
           chord-toned, density keyed to breath + presence, cells refreshed on
           a slow ~1.7s clock — 006 ASCII, never per-frame reshuffled.
         • WORD ECHO += Ghost-Key Codex mashup (Gh0sTs 1n Th3 Sh3lLs /
           D1giTaL R3BiRtHs / f34Rd0t.C0mM4) — Font Burn re-keyed.
         • TWIN ORBIT += toned echo shrapnel: 5-8 small chord-toned shards
           (rect/circle/triangle/star/cross, star inner = outer/2.5) ejected
           along the orbit tangent on burst landings and resonance peaks,
           eased fade, absolute alpha ≤ 0.3, breath-keyed slow respawn —
           006 Gemini Bomb.
         • SIGNAL WEAVE += beat-keyed wobble swell toward the old 15px amplitude
           and an 'overlay'-composite half of the film-noise grain — 006 Data
           Bands.
         • TAPE DRIFT += variable slice height 4+floor(gate*2) (old 4-6px) and
           a coherent high-frequency sine micro-slip gated by the voice gate —
           006 VHS Glitch, no per-frame randomness.
         • TECH ARTIST GLSL: 9 → 14 raymarch layers and the 006
           smoothstep(0.15,0.85) tone curve.
         • OLD-SOUL DEFAULTS: boot levels at ~40% of the 006 defaultAlphas
           (Neon .20 / Scanlines .16 / Flash .32 / HSL .24 / ASCII .28 /
           FontBurn .40 / Strobe .40 / Gemini .36 / TechArtist .20; Data Bands,
           VHS Glitch, Data Bomb still start 0). ZERO ALL still parks all.
         KEPT FROM v10:
         • B&W Invert: 0–50% = 0 light-emission invert + hue spectrum; 50–75% eases into full light-emission invert (75%), then holds through 100%
         • Local media never body-inverted; preset browser live skin
         ============================================================================ */
      (function() {

          /* ------------------------------------------------------------------ *
           *  1. DOM + canvases                                                  *
           * ------------------------------------------------------------------ */
          const $ = (id) => document.getElementById(id);
          const mainCanvas = $('glitchCanvas');
          const gctx = mainCanvas.getContext('2d', { alpha: true, desynchronized: true });
          const ytWarpShell = $('ytWarpShell');
          const ytFrame = $('ytFrame');
          const ytPlayerMount = $('ytPlayerMount');
          const video = $('video');
          const localAudio = $('localAudio');
          const localArtEl = $('localArt');
          const ytInput = $('ytInput');
          const startBtn = $('startBtn');
          const openFileBtn = $('openFileBtn');
          const fileInput = $('fileInput');
          const openFileWrap = $('openFileWrap');
          const wiredBtn = $('wired-btn');
          const rightRack = $('rightRack');
          const ghostBtnRack = $('ghostBtnRack');
          const sliderContainer = $('sliderContainer');
          const presetToggleBtn = $('preset-toggle-btn');
          const presetDropdown = $('preset-dropdown-container');
          /* v10: preset-browser skin cache + updater.
             The Ghost Protocol / V-Sync scanline engines drive CSS custom props on
             the preset browser (--pp-hue, --pp-scan-alpha, --pp-scan-size,
             --pp-scan-dur, --pp-ghost, --pp-glow), so its ghost+scanline skin lives
             and breathes with the same systems that skin the video. */
          const ppSkinCache = {};
          let lastPresetSkinUpdate = 0;

          function setPpVar(name, value) {
              if (ppSkinCache[name] === value) return;
              ppSkinCache[name] = value;
              if (presetDropdown) presetDropdown.style.setProperty(name, value);
              if (presetToggleBtn) presetToggleBtn.style.setProperty(name, value);
          }

          function updatePresetSkin() {
              if (!presetDropdown) return;
              const gm = (typeof getGhostMode === 'function') ? getGhostMode() : 'OFF';
              const gl = (gm !== 'OFF' && ghostLevel > 0.01) ? clamp01(ghostLevel) : 0;
              const vm = (typeof getVsyncMode === 'function') ? getVsyncMode() : 'OFF';
              const vl = vm !== 'OFF' ? clamp01(activeVsyncLevel()) : 0;
              const scanFx = clamp01(effectAlphas['Scanlines'] || 0);
              const baseHue = (typeof videoPalette !== 'undefined' && videoPalette.hue) || 205;
              // Ghost-mode hue anchors mirror renderGhostProtocol's palettes
              const ghostHue = (window.GlitchEngine && GlitchEngine.ghostSkinHue(gm) != null)
                  ? GlitchEngine.ghostSkinHue(gm)
                  : { DIA: 313, SPECTRUM: 165, CRT: 42, PLASMA: 295, LED: 145 }[gm];
              const hue = gl > 0 ?
                  Math.round((((ghostHue || 174) + (baseHue - 205) * 0.25) % 360 + 360) % 360) :
                  Math.round(((baseHue % 360) + 360) % 360);
              setPpVar('--pp-hue', String(hue));
              const scan = Math.max(vl, scanFx * 0.8);
              setPpVar('--pp-scan-alpha', (0.035 + scan * 0.10 + gl * 0.03).toFixed(3));
              setPpVar('--pp-scan-size', (3 - scan * 1.2).toFixed(2) + 'px');
              setPpVar('--pp-scan-dur', (3 - scan * 1.7).toFixed(2) + 's');
              setPpVar('--pp-ghost', gl.toFixed(2));
              setPpVar('--pp-glow', (0.30 + gl * 0.5 + scan * 0.3).toFixed(2));
          }
          const uiToggleTab = $('ui-toggle-tab');
          const toggleUiBtn = $('toggle-ui-btn');
          const ghostProtocolBtn = $('ghostProtocolBtn');
          const ghostProtocolSlider = $('ghostProtocolSlider');
          const vsyncScanBtn = $('vsyncScanBtn');
          const vsyncScanSlider = $('vsyncScanSlider');
          const vsyncScanLabelEl = $('vsyncScanLabel');
          const vsyncLockBtn = $('vsyncLockBtn');
          const randomSeedSlider = $('randomSeedSlider');
          const testCanvasEl = $('testCanvas');
          const nowPlayingHud = $('nowPlayingHud');
          const npHudToggle = $('npHudToggle');
          const npHudPanel = $('npHudPanel');
          const npThumb = $('npThumb');
          const npTitle = $('npTitle');
          const npAuthor = $('npAuthor');
          const npProvider = $('npProvider');
          const npTime = $('npTime');
          const npFlags = $('npFlags');
          const npLink = $('npLink');
          const FADE_WHITE_URL = 'https://www.youtube.com/watch?v=kCP2xZvhJk0';

          /* Shared scratch + snapshot offscreens (always at most two, lazily sized). */
          const scratch = document.createElement('canvas');
          const scratchCtx = scratch.getContext('2d');
          const snap = document.createElement('canvas');
          const snapCtx = snap.getContext('2d');

          /* ------------------------------------------------------------------ *
           *  2. Core state                                                      *
           * ------------------------------------------------------------------ */
          let player = null;
          let isApiReady = false;
          let localMediaUrl = null;
          let masterOpacity = 0.92;
          let customTime = 0;
          let timeScale = 1.0;
          let beat = 0;
          let activeEffects = [];
          let isLooping = false;
          let isContinuallyRandomizing = true;  // start ON so ghost level randomizes immediately on load
          let isAutoGlitching = false;
          let isAiWarpActive = false;
          let isAutomatedMasters = false;
          let randomTargets = {};
          /* 'global' is seeded so saved global-opacity locks survive preset
             normalization (which keeps only known lock keys). */
          const sliderLocks = { global: false };
          /* Locks switched on by the last applied preset. Those are released by
             the next preset; locks the user set by hand are hard and survive. */
          const presetLockKeys = new Set();
          function toggleUserLock(key) {
              presetLockKeys.delete(key);
              sliderLocks[key] = !sliderLocks[key];
              return sliderLocks[key];
          }
          const sliderElements = {};
          const sliderWritten = {};
          const masterControls = {
              effectIntensity: 0.88,
              motionScale: 0.80,
              blendSoftness: 0.50,
              continualSpeed: 0.85,
              autoGlitchPower: 0.75,
              boardEnergy: 0.65
          };
          const masterTargets = { ...masterControls };
          let nextMasterRetargetAt = 0;
          const MASTER_KEYS = ['effectIntensity', 'motionScale', 'blendSoftness', 'continualSpeed', 'autoGlitchPower',
              'boardEnergy'
          ];

          let renderBudget = { lowPower: false, drawEveryN: 1, pixelCap: 1.25, scale: 1, asciiCells: 22000 };
          let lastFrameTime = performance.now();
          let lastDrawTime = 0;
          let frameCount = 0;
          const domCache = {};

          const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
          const clamp01 = (v) => clamp(v, 0, 1);
          const easeExp = (cur, tgt, dt, rate) => cur + (tgt - cur) * (1 - Math.exp(-rate * dt));
          const lerp = (a, b, t) => a + (b - a) * t;   /* R2 */

          /* AI WARP MASTERS (bottom panel). B&W Strength scales the paired B&W
             level, Hue Offset turns the eased hue wheel, and FX SCOPE chooses
             whether the final chain covers the whole app or only the LENS.
             Locks are hard: randomizers, automation and presets skip them. */
          const VOICE_FX_STORAGE_KEY = 'r4_voicefx_control';
          const voiceFxSettings = { bwInvert: 1, hueOffset: 0, scope: 'app' };
          const voiceFxLocks = { bwInvert: false, hueOffset: false, milkOpacity: false };
          const milk = {
              active: false, opacity: 0.30, target: 0.30, startAt: 0, lastAt: 0,
              deck: [], index: -1, preset: null,
              next: null, nextCtx: null, feedback: null, feedbackCtx: null
          };
          let aiwUi = null;
          const normalizeHueOffset = (v) => {
              const n = Number(v);
              return Number.isFinite(n) ? ((n % 360) + 360) % 360 : 0;
          };
          /* AI WARP pairStrength: a core voice and its R3 twin add together. */
          function fxPairLevel(core) {
              return clamp01((+effectAlphas[core] || 0) + (+effectAlphas['R3 ' + core] || 0));
          }
          function bwMasterLevel() {
              return clamp01(fxPairLevel('B&W Invert') * voiceFxSettings.bwInvert);
          }
          function hueMasterLevel() {
              return fxPairLevel('Hue/Color Cycle');
          }
          (function loadVoiceFxControls() {
              let saved = null;
              try {
                  const raw = localStorage.getItem(VOICE_FX_STORAGE_KEY);
                  if (typeof raw === 'string' && raw.length <= 1024) saved = JSON.parse(raw);
              } catch (e) { saved = null; }
              if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
              if (Number.isFinite(saved.bwInvert)) voiceFxSettings.bwInvert = clamp01(saved.bwInvert);
              if (Number.isFinite(saved.hueOffset)) voiceFxSettings.hueOffset = normalizeHueOffset(saved.hueOffset);
              if (saved.scope === 'app' || saved.scope === 'lens') voiceFxSettings.scope = saved.scope;
              if (Number.isFinite(saved.milkOpacity)) milk.opacity = milk.target = clamp01(saved.milkOpacity);
              const locks = saved.locks;
              if (locks && typeof locks === 'object' && !Array.isArray(locks)) {
                  Object.keys(voiceFxLocks).forEach((k) => {
                      if (typeof locks[k] === 'boolean') voiceFxLocks[k] = locks[k];
                  });
              }
          })();
          function saveVoiceFxControls() {
              try {
                  localStorage.setItem(VOICE_FX_STORAGE_KEY, JSON.stringify({
                      bwInvert: voiceFxSettings.bwInvert,
                      hueOffset: voiceFxSettings.hueOffset,
                      scope: voiceFxSettings.scope,
                      milkOpacity: milk.target,
                      locks: { ...voiceFxLocks }
                  }));
              } catch (e) {}
          }
          function randomizeVoiceFx() {
              /* B&W Strength lands near the 50 / 75 / 100% landmarks; the hue moves a
                 moderate step from where it is, so Randomize never jumps across the wheel. */
              if (!voiceFxLocks.bwInvert) {
                  const rails = [0.5, 0.75, 0.75, 1];
                  const rail = rails[(Math.random() * rails.length) | 0];
                  voiceFxSettings.bwInvert = +Math.min(1, Math.max(0.12, rail + (Math.random() - 0.5) * 0.12)).toFixed(2);
              }
              if (!voiceFxLocks.hueOffset) {
                  const step = (35 + Math.random() * 110) * (Math.random() < 0.5 ? -1 : 1);
                  voiceFxSettings.hueOffset = normalizeHueOffset(voiceFxSettings.hueOffset + step);
              }
              syncAiWarpMastersUi();
              saveVoiceFxControls();
          }

          function applyStyleIfChanged(el, prop, value) {
              if (!el || domCache[el.id + ':' + prop] === value) return;
              domCache[el.id + ':' + prop] = value;
              el.style[prop] = value;
          }

          function setElementDisplay(el, display) {
              if (el) el.style.display = display;
          }

          /* ------------------------------------------------------------------ *
           *  3. Performance profile                                             *
           * ------------------------------------------------------------------ */
          (function computeProfile() {
              const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches;
              const cores = navigator.hardwareConcurrency || 8;
              const mem = navigator.deviceMemory || 8;
              const low = !!(prefersReducedMotion || cores <= 4 || mem <= 4);
              renderBudget.lowPower = low;
              renderBudget.pixelCap = low ? 1 : 1.25;
              renderBudget.scale = low ? 0.85 : 1;
              renderBudget.drawEveryN = low ? 2 : 1;
              renderBudget.asciiCells = low ? 15000 : 42000;
          })();

          window.addEventListener('wheel', (ev) => { if (ev.ctrlKey) ev.preventDefault(); }, { passive: false });

          /* ------------------------------------------------------------------ *
           *  4. Local MP3 / MP4 path                                            *
           * ------------------------------------------------------------------ */
          function extractId3Artwork(file) {
              return file.slice(0, Math.min(file.size, 4 * 1024 * 1024)).arrayBuffer().then((buf) => {
                  const bytes = new Uint8Array(buf);
                  const art = R4.findId3Artwork(bytes);
                  return art ? URL.createObjectURL(new Blob([bytes.subarray(art.start, art.end)], { type: art.type })) : null;
              }).catch(() => null);
          }

          let localMediaGeneration = 0;
          let cancelLocalAttempt = null;

          function classifyLocalFile(file) {
              return R4.classifyLocalFile(file.name, file.type);
          }

          /* Resolves once the first frame decodes; rejects with mediaCode 3/4 when the codec or container is unusable. */
          function attemptLocalSource(el, url, kind) {
              return new Promise((resolve, reject) => {
                  let settled = false;
                  const finish = (error) => {
                      if (settled) return;
                      settled = true;
                      el.removeEventListener('error', onError);
                      el.removeEventListener('playing', onLoaded);
                      if (cancelLocalAttempt === cancel) cancelLocalAttempt = null;
                      if (error) reject(error);
                      else resolve();
                  };
                  const cancel = () => finish(new DOMException('Playback changed.', 'AbortError'));
                  const onError = () => {
                      const mediaError = el.error;
                      const error = new Error((mediaError && mediaError.message) || 'Media decoding failed.');
                      error.mediaCode = mediaError ? mediaError.code : 0;
                      finish(error);
                  };
                  const onLoaded = () => {
                      if (kind === 'video' && !(el.videoWidth > 0 && el.videoHeight > 0)) {
                          const error = new Error('The video track cannot be decoded.');
                          error.mediaCode = 4;
                          finish(error);
                          return;
                      }
                      finish();
                  };
                  cancelLocalAttempt = cancel;
                  el.addEventListener('error', onError);
                  el.addEventListener('playing', onLoaded);
                  el.crossOrigin = 'anonymous';
                  el.src = url;
                  el.load();
                  el.play().catch((error) => {
                      error.mediaCode = el.error ? el.error.code : (error.name === 'NotSupportedError' ? 4 : 0);
                      finish(error);
                  });
              });
          }

          function shortFileName(file) {
              const name = file.name || 'local file';
              return name.length > 80 ? name.slice(0, 77) + '...' : name;
          }

          async function playLocalFile(file, kind) {
              const generation = ++localMediaGeneration;
              const stale = () => generation !== localMediaGeneration;
              if (cancelLocalAttempt) cancelLocalAttempt();
              const host = window.GlitchHost;
              if (host && typeof host.cancelAllLocalMedia === 'function') host.cancelAllLocalMedia();

              const isAudio = kind === 'audio';
              const mediaEl = isAudio ? localAudio : video;
              const otherEl = isAudio ? video : localAudio;
              if (!mediaEl) return;
              if (otherEl) { try { otherEl.pause();
                      otherEl.removeAttribute('src');
                      otherEl.load(); } catch (e) {} }

              const previousUrl = localMediaUrl;
              if (window.__localArtUrl) { try { URL.revokeObjectURL(window.__localArtUrl); } catch (e) {}
                  window.__localArtUrl = null; }
              localMediaUrl = URL.createObjectURL(file);
              if (SOFT.ear) SOFT.ear.reset();   /* R2: a new file → the ear re-warms */

              try { if (player && player.pauseVideo) player.pauseVideo(); } catch (e) {}
              try { if (player && player.stopVideo) player.stopVideo(); } catch (e) {}
              if (ytWarpShell) ytWarpShell.style.display = 'none';
              if (ytFrame) ytFrame.style.display = 'none';

              if (isAudio) {
                  document.body.classList.add('local-audio');
                  document.body.classList.remove('local-video');
                  if (localArtEl) { localArtEl.removeAttribute('src');
                      localArtEl.style.display = 'none'; }
              } else {
                  document.body.classList.add('local-video');
                  document.body.classList.remove('local-audio');
              }
              softEnsureAudio(mediaEl);   /* R2: the ear listens to the file */
              const firstAttempt = attemptLocalSource(mediaEl, localMediaUrl, kind);
              if (previousUrl) { try { URL.revokeObjectURL(previousUrl); } catch (e) {} }

              const applyLocalHud = () => {
                  if (stale()) return;
                  setNowPlaying({
                      kind: isAudio ? 'local-audio' : 'local-video',
                      videoId: '',
                      playlistId: '',
                      url: '',
                      title: file.name || (isAudio ? 'Local audio' : 'Local video'),
                      author: (file.type || 'media') + (file.size ? (' · ' + Math.round(file.size / 1024) + ' KB') : ''),
                      authorUrl: '',
                      thumb: (isAudio && window.__localArtUrl) ? window.__localArtUrl : '',
                      provider: 'LOCAL FILE',
                      providerUrl: '',
                      type: isAudio ? 'audio' : 'video',
                      looping: false,
                      duration: isFinite(mediaEl.duration) ? mediaEl.duration : 0
                  });
              };
              applyLocalHud();
              mediaEl.addEventListener('loadedmetadata', applyLocalHud, { once: true });
              if (isAudio) {
                  extractId3Artwork(file).then((url) => {
                      if (!url) return;
                      if (stale()) { try { URL.revokeObjectURL(url); } catch (e) {} return; }
                      window.__localArtUrl = url;
                      if (localArtEl) { localArtEl.src = url;
                          localArtEl.style.display = 'block'; }
                      setNowPlaying({ thumb: url });
                  });
              }

              try {
                  await firstAttempt;
                  if (!stale()) activatePlaybackUi(isAudio ? 'local-audio' : 'local-video');
                  return;
              } catch (error) {
                  if (stale() || error.name === 'AbortError') return;
                  const unsupported = error.mediaCode === 3 || error.mediaCode === 4;
                  if (!unsupported) {
                      showNotificationMessage('LOCAL MEDIA PLAYBACK FAILED: ' + error.message, 7000);
                      return;
                  }
                  if (!host || !host.isNativeHost) {
                      showNotificationMessage('This codec/container cannot play here. Use the Windows app, or convert it to H.264/AAC MP4 (video) or AAC M4A (audio).',
                          8000);
                      return;
                  }
              }

              showNotificationMessage('WINDOWS NATIVE CONVERSION: ' + shortFileName(file) +
                  ' - uses installed Windows codecs; the original file is not changed', 9000);
              let convertedUrl;
              try {
                  convertedUrl = await host.convertLocalMedia(file, kind);
              } catch (error) {
                  if (!stale() && error.name !== 'AbortError') {
                      showNotificationMessage('LOCAL CONVERSION FAILED: ' + String(error.message).slice(0, 300), 9000);
                  }
                  return;
              }
              if (stale()) return;
              try {
                  await attemptLocalSource(mediaEl, convertedUrl, kind);
              } catch (error) {
                  if (!stale() && error.name !== 'AbortError') {
                      showNotificationMessage('CONVERTED MEDIA FAILED TO PLAY: ' + error.message, 8000);
                  }
                  return;
              }
              if (stale()) return;
              activatePlaybackUi(isAudio ? 'local-audio' : 'local-video');
              if (localMediaUrl) { try { URL.revokeObjectURL(localMediaUrl); } catch (e) {}
                  localMediaUrl = null; }
              applyLocalHud();
              showNotificationMessage('LOCAL CONVERSION READY: ' + shortFileName(file), 4000);
          }

          if (fileInput) {
              fileInput.addEventListener('change', (event) => {
                  const file = event.target.files && event.target.files[0];
                  if (!file) return;
                  const kind = classifyLocalFile(file);
                  if (!kind) {
                      showNotificationMessage('Choose a local audio or video file.', 4000);
                      return;
                  }
                  playLocalFile(file, kind).catch((error) => {
                      showNotificationMessage('LOCAL MEDIA PLAYBACK FAILED: ' + error.message, 7000);
                  });
              });
          }

          /* ------------------------------------------------------------------ *
           *  5. YouTube path                                                    *
           * ------------------------------------------------------------------ */
          function isHttpOrigin() {
              return window.location.protocol === 'http:' || window.location.protocol === 'https:';
          }

          function parseAllowedYouTubeInput(input) {
              return R4.parseAllowedYouTubeInput(input);
          }

          /* YouTube is driven only by the bundled yt-embed.js postMessage controller;
             no remote player script is ever loaded into the app origin. */
          function ensureYouTubeController() {
              isApiReady = !!(window.YT && typeof window.YT.Player === 'function');
              return isApiReady;
          }

          function getYouTubeIframeElement() {
              try { if (player && typeof player.getIframe === 'function') { const f = player.getIframe(); if (f) return f; } }
              catch (e) {}
              return ytFrame ? ytFrame.querySelector('iframe') : null;
          }

          /* GHOST // OF ME loads before its track starts whenever the MISSING LINK
             video is started: the revealed card, Ctrl+Alt+G during playback, or a
             typed or pasted link. Set by the easter egg; it returns the notice to
             show, or '' when the preset could not be loaded, which blocks playback. */
          const GHOST_TRACK_VIDEO_ID = 'DmStNF35o1w';
          let ghostStartHook = null;

          function startPlayback(url, loop = false) {
              if (!isHttpOrigin()) {
                  showNotificationMessage('YouTube needs the app host or a local preview server. Choose a local media file instead.',
                      5600);
                  return;
              }
              if (!isApiReady && !ensureYouTubeController()) {
                  showNotificationMessage('The bundled YouTube controller is unavailable. Local MP3/MP4 still works.',
                      6500);
                  return;
              }

              const target = parseAllowedYouTubeInput(url);
              if (!target) { alert('Please enter a valid YouTube video, playlist URL, or 11-character video ID'); return; }
              const { videoId, playlistId } = target;
              let ghostNotice = '';
              if (videoId === GHOST_TRACK_VIDEO_ID && ghostStartHook) {
                  ghostNotice = ghostStartHook();
                  if (!ghostNotice) return;
              }
              ++localMediaGeneration;
              if (cancelLocalAttempt) cancelLocalAttempt();
              if (window.GlitchHost) window.GlitchHost.cancelAllLocalMedia();
              [video, localAudio].forEach((el) => { if (el) el.pause(); });

              const playerVars = {
                  controls: 0,
                  rel: 0,
                  showinfo: 0,
                  modestbranding: 1,
                  autoplay: 1,
                  enablejsapi: 1,
                  playsinline: 1,
                  fs: 0,
                  iv_load_policy: 3,
                  disablekb: 0
              };
              if (loop && videoId && !playlistId) { playerVars.loop = 1;
                  playerVars.playlist = videoId; }
              const origin = isHttpOrigin() ? window.location.origin : undefined;
              if (origin) playerVars.origin = origin;
              if (playlistId) { playerVars.listType = 'playlist';
                  playerVars.list = playlistId; }

              const watchUrl = videoId
                  ? ('https://www.youtube.com/watch?v=' + videoId + (playlistId ? ('&list=' + playlistId) : ''))
                  : (playlistId ? ('https://www.youtube.com/playlist?list=' + playlistId) : url);

              if (!player) {
                  player = new YT.Player('ytPlayerMount', {
                      height: '100%',
                      width: '100%',
                      playerVars,
                      videoId: videoId || undefined,
                      events: {
                          onReady: onPlayerReady,
                          onStateChange: onPlayerStateChange,
                          onError: function() {
                              if (nowPlaying.kind !== 'youtube') return;
                              showNotificationMessage('YouTube could not load that video (private / region / embed blocked). Try another link or local MP3/MP4.',
                                  6500);
                          }
                      }
                  });
              } else {
                  player.unMute();
                  player.setVolume(100);
                  if (playlistId) {
                      player.loadPlaylist({ list: playlistId, listType: 'playlist', index: 0 });
                      try { player.setLoop(!!loop); } catch (e) {}
                  } else if (loop && videoId) {
                      try {
                          player.loadPlaylist([videoId]);
                          player.setLoop(true);
                      } catch (e) {
                          player.loadVideoById(videoId);
                      }
                  } else {
                      player.loadVideoById(videoId);
                      try { player.setLoop(false); } catch (e) {}
                  }
              }
              activeLoopVideoId = loop && videoId && !playlistId ? videoId : null;
              setNowPlaying({
                  kind: 'youtube',
                  videoId: videoId || '',
                  playlistId: playlistId || '',
                  url: watchUrl,
                  title: videoId ? ('YouTube · ' + videoId) : 'YouTube playlist',
                  author: '',
                  authorUrl: '',
                  thumb: videoId ? ('https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg') : '',
                  provider: 'YouTube',
                  providerUrl: 'https://www.youtube.com/',
                  type: 'video',
                  looping: !!(loop && videoId && !playlistId),
                  duration: 0
              });
              if (ytWarpShell) ytWarpShell.style.display = 'block';
              if (ytFrame) ytFrame.style.display = 'block';
              showNotificationMessage(ghostNotice ? ghostNotice + ' Loading the MISSING LINK track.' :
                  'Loading YouTube. Effects controls open when playback starts.', ghostNotice ? 6500 : 5000);
              ensureOverlayStack();
              return true;
          }

          let activeLoopVideoId = null;
          let nowPlaying = {
              kind: '', videoId: '', playlistId: '', url: '', title: '',
              author: '', authorUrl: '', thumb: '', provider: '', providerUrl: '',
              type: '', looping: false, duration: 0
          };
          let npHudOpen = true;
          try { npHudOpen = sessionStorage.getItem('glitch-np-hud-open') !== '0'; } catch (e) {}

          function fmtMediaTime(sec) {
              if (!isFinite(sec) || sec < 0) return '--:--';
              sec = Math.floor(sec);
              const h = Math.floor(sec / 3600);
              const m = Math.floor((sec % 3600) / 60);
              const s = sec % 60;
              const mm = (h ? String(m).padStart(2, '0') : String(m));
              const ss = String(s).padStart(2, '0');
              return h ? (h + ':' + mm + ':' + ss) : (mm + ':' + ss);
          }

          function applyHudOpenState() {
              if (!nowPlayingHud || !npHudToggle) return;
              nowPlayingHud.classList.toggle('is-open', npHudOpen);
              npHudToggle.setAttribute('aria-expanded', npHudOpen ? 'true' : 'false');
              npHudToggle.textContent = npHudOpen ? 'HIDE INFO' : 'NOW PLAYING';
          }

          function renderNowPlayingHud() {
              if (!nowPlayingHud) return;
              const np = nowPlaying;
              const empty = !np.kind || np.kind === 'canvas';
              nowPlayingHud.classList.toggle('is-empty', empty);
              nowPlayingHud.hidden = empty;
              if (empty) return;
              if (npTitle) npTitle.textContent = np.title || 'Untitled';
              if (npAuthor) {
                  npAuthor.textContent = np.author || '';
                  npAuthor.href = np.authorUrl || '#';
                  npAuthor.style.display = np.author ? '' : 'none';
              }
              if (npProvider) {
                  const bits = [np.provider || '', np.type || '', np.videoId ? ('id ' + np.videoId) : '']
                      .filter(Boolean);
                  npProvider.textContent = bits.join(' · ');
              }
              if (npFlags) {
                  if (np.looping) {
                      const loopTag = document.createElement('span');
                      loopTag.className = 'np-loop';
                      loopTag.textContent = 'LOOP ON';
                      npFlags.replaceChildren(loopTag);
                  } else {
                      npFlags.textContent = np.playlistId ? 'PLAYLIST' : '';
                  }
              }
              if (npThumb) {
                  if (np.thumb) {
                      npThumb.src = np.thumb;
                      npThumb.alt = np.title || '';
                      npThumb.classList.add('has-src');
                  } else {
                      npThumb.removeAttribute('src');
                      npThumb.classList.remove('has-src');
                  }
              }
              if (npLink) {
                  if (np.url && /^https?:/i.test(np.url)) {
                      npLink.href = np.url;
                      npLink.textContent = 'WATCH / SOURCE';
                      npLink.style.display = '';
                  } else {
                      npLink.removeAttribute('href');
                      npLink.style.display = 'none';
                  }
              }
              applyHudOpenState();
              tickNowPlayingTime();
          }

          function setNowPlaying(partial) {
              nowPlaying = Object.assign({}, nowPlaying, partial || {});
              renderNowPlayingHud();
          }

          function syncYouTubeNowPlaying() {
              if (!player) return;
              let data = {};
              try { data = player.getVideoData() || {}; } catch (e) { data = {}; }
              const vid = data.video_id || nowPlaying.videoId || '';
              let duration = 0;
              try { duration = player.getDuration() || 0; } catch (e) {}
              let videoUrl = nowPlaying.url;
              try {
                  const u = player.getVideoUrl && player.getVideoUrl();
                  if (u) videoUrl = u;
              } catch (e) {}
              setNowPlaying({
                  kind: 'youtube',
                  videoId: vid,
                  url: videoUrl || (vid ? ('https://www.youtube.com/watch?v=' + vid) : nowPlaying.url),
                  title: data.title || nowPlaying.title,
                  author: data.author || nowPlaying.author,
                  thumb: vid ? ('https://i.ytimg.com/vi/' + vid + '/hqdefault.jpg') : nowPlaying.thumb,
                  provider: 'YouTube',
                  providerUrl: 'https://www.youtube.com/',
                  type: 'video',
                  looping: !!(activeLoopVideoId && vid && activeLoopVideoId === vid),
                  duration: duration
              });
          }

          function tickNowPlayingTime() {
              if (!npTime) return;
              let cur = 0, dur = nowPlaying.duration || 0, state = '';
              if (nowPlaying.kind === 'youtube' && player) {
                  try { cur = player.getCurrentTime() || 0; } catch (e) {}
                  try { dur = player.getDuration() || dur; } catch (e) {}
                  try {
                      const st = player.getPlayerState();
                      state = st === 1 ? 'PLAYING' : st === 2 ? 'PAUSED' : st === 3 ? 'BUFFER' : st === 0 ? 'ENDED' : '';
                  } catch (e) {}
              } else if (nowPlaying.kind === 'local-video' && video) {
                  cur = video.currentTime || 0;
                  dur = isFinite(video.duration) ? video.duration : dur;
                  state = video.paused ? 'PAUSED' : 'PLAYING';
              } else if (nowPlaying.kind === 'local-audio' && localAudio) {
                  cur = localAudio.currentTime || 0;
                  dur = isFinite(localAudio.duration) ? localAudio.duration : dur;
                  state = localAudio.paused ? 'PAUSED' : 'PLAYING';
              }
              const bits = [fmtMediaTime(cur) + ' / ' + fmtMediaTime(dur)];
              if (state) bits.push(state);
              npTime.textContent = bits.join(' · ');
          }

          if (npHudToggle) {
              applyHudOpenState();
              npHudToggle.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  npHudOpen = !npHudOpen;
                  try { sessionStorage.setItem('glitch-np-hud-open', npHudOpen ? '1' : '0'); } catch (err) {}
                  applyHudOpenState();
              });
          }
          setInterval(tickNowPlayingTime, 250);

          function onPlayerReady() {
              if (nowPlaying.kind !== 'youtube') {
                  if (player) player.stopVideo();
                  return;
              }
              if (ytWarpShell) ytWarpShell.style.display = 'block';
              if (ytFrame) ytFrame.style.display = 'block';
              if (video) video.style.display = 'none';
              document.body.classList.remove('local-audio', 'local-video');
              try { player.unMute(); player.setVolume(100); player.playVideo(); } catch (e) {}
              if (activeLoopVideoId) {
                  try { player.setLoop(true); } catch (e) {}
              }
              syncYouTubeNowPlaying();
          }

          function onPlayerStateChange(ev) {
              if (nowPlaying.kind !== 'youtube') return;
              if (ev.data === 1) activatePlaybackUi('youtube');
              if (ev.data === 0 && activeLoopVideoId && player) {
                  try {
                      player.seekTo(0, true);
                      player.playVideo();
                  } catch (e) {}
              }
              if (ev.data === 1 || ev.data === 2 || ev.data === 5 || ev.data === 0) {
                  syncYouTubeNowPlaying();
              }
          }

          /* ------------------------------------------------------------------ *
           *  6. Shared drawing assets                                           *
           * ------------------------------------------------------------------ */
          const atlas = (function buildAtlas() {

const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:"<>,./?`~ ';
const cyrillic = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюяІЇЄЎЃЅЋЌЏіїєўѓѕћќџ';
const greek = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωςΆΈΉΊΌΎΏάέήίόύώΐΰϊϋ';
const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォッヴー';
const hebrew = 'אבגדהוזחטיכךלמםנןסעפףצץקרשת׳״־';
const arabic = 'ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهويأبتثجحخدذرزسشصضطظعغفقكلمنهويى';
const devanagari = 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहँंःॐ०१२३४५६७८९';
const thai = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮัาำิีึืุูใไ่้็๋์ๆ๐๑๒๓๔๕๖๗๘๙';
const hangul = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㄲㄸㅃㅆㅉㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ';
const hanzi = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分的一是在不了有和人這中大為上個國我以要他時來用們生到作地於出就分子你说年着那她也得里后自会家可下而过天去能对小多然心学么之都好看起发当没成只如事把还第样道想种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感';
const javanese = 'ꦀꦄꦅꦆꦇꦈꦉꦊꦋꦌꦍꦎꦏꦐꦑꦒꦓꦔꦕꦖꦗꦘꦙꦚꦛꦜꦝꦞꦟꦠꦡꦢꦣꦤꦥꦦꦧꦨꦩꦪꦫꦬꦭꦮꦯꦰꦱꦲ꧀꧐꧑꧒꧓꧔꧕꧖꧗꧘꧙';
const symbols = '░▒▓█─│┌┐└┘├┤┬┴┼═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬━┃┄┅┆┇┈┉┊┋┍┎┏┑┒┓┕┖┗┙┚┛┝┞┟┠┡┢┣┥┦┧┨┩┪┫┭┮┯┰┱┲┳┵┶┷┸┹┺┻┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋╌╍╎╏╭╮╯╰╱╲╳╴╵╶╷╸╹╺╻╼╽╾╿▀▁▂▃▄▅▆▇▉▊▋▌▍▎▏▐▔▕■□◆◇▲△▼▽●○◦★☆←↑→↓↔×÷±≠≈≤≥∞√∑∏∫∂∆';
const superscript = 'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»ÁÂÀ©¢¥ãÃ¤ðÐÊËÈıÍÎÏ¦ÌÓßÔÒõÕµþÞÚÛÙýÝ¯´≡±‗¾¶§÷¸°¨·¹³²■•̫͡ʕ͓ʔ❁◡‿♥♠♦♣♪♫☼►◄↕‼▬↨↑↓→←∟↔▲▼≈≠≤≥∑∏∫☮☯✞✡☪☢☣⚕⚖⚗⚙⚛☘☤⚚⚜✠☥♀♂⚢⚣⚤⚥⚦⚧✂✒✉☎✆✇✈☏⛴⛷⛸♨♻⚐⚑⚔⚘⚝⚞⚟✁✃✄☦☧☨☩☫☬☭☸☹☺☻☽☾♡♢♤♧♬♭♮♯⚒✎✏✑✓✔✕✖✗✘✙✚✛✜✝✟□△▶▷▽◀◁◆◇○●◦★☆⚰⚱🗜🛰🛩🕹ᔑʖᓵ↸ᒷ⎓⊣⍑⋮ꖎᒲᑑ∷ᓭℸ⚍⍊⨅';
const mathoperator = '∀∁∂∃∄∆∇∎−∓∔∕∕∗∗∙√∛∜∝∞∴∵∸∺∿≀⊌⊍⊎⊓⊔⊕⊖⊗⊘⊙⊚⊛⊜⊝⊞⊟⊠⊡⊢⊢⊺⊺⊼⊽⊿⋄⋄⋆⋇⋉⋊⋋⋌⋒⋓⟎⟏⟑⟒⟓⟓⧜⧝⧞⧸⧹⨝⨝⨝⨠⨠⨹⨺⨻⨼⨼⨼⨿⩤⩥⫶⫼⫽⫾⫿≫∦𝕲∭∄∂⋥ ⊶≋⧉ ⨇⩈𝕸 𝛙ℵ⪌⟁ ⟆⦆⌘𝛴⦻⎈';
const chars = Array.from(latin + cyrillic + greek + katakana + hebrew + arabic + devanagari + thai + hangul + hanzi + javanese + symbols + superscript + mathoperator);
              const fontPx = 16,
                  cols = 16,
                  pad = 2,
                  tile = fontPx + pad * 2;
              const rows = Math.ceil(chars.length / cols);
              const cv = document.createElement('canvas');
              cv.width = cols * tile;
              cv.height = rows * tile;
              const cx = cv.getContext('2d');
              cx.font = 'bold ' + fontPx + 'px "Courier New", monospace';
              cx.textBaseline = 'top';
              cx.fillStyle = '#fff';
              chars.forEach((ch, i) => cx.fillText(ch, (i % cols) * tile + pad, Math.floor(i / cols) * tile + pad));
              return { canvas: cv, tile, count: chars.length, chars: chars };
          })();
          window.__ASCII_CHARS = atlas.chars;
          /* ------------------------------------------------------------------ *
           *  6b. Video/artwork palette engine                                   *
           * ------------------------------------------------------------------ */
          const PALETTE_FALLBACK = { hue: 205, sat: 78, light: 60, energy: 0.45 };
          const videoPalette = {
              hue: PALETTE_FALLBACK.hue,
              sat: PALETTE_FALLBACK.sat,
              light: PALETTE_FALLBACK.light,
              energy: PALETTE_FALLBACK.energy,
              contrast: 0.40,   /* R1.4 SOURCE PROFILE: luminance spread */
              motion: 0.20,     /* R1.4: frame-to-frame movement */
              darkness: 0.40,   /* R1.4: 1 - light */
              colors: [],
              complement: (PALETTE_FALLBACK.hue + 180) % 360,
              accent: (PALETTE_FALLBACK.hue + 115) % 360,
              target: null,
              lastSampleAt: 0,
              valid: false
          };

          function paletteKeyColors(hue, sat, light) {
              return [
                  { h: hue, s: Math.max(62, sat), l: Math.min(76, light + 8) },
                  { h: (hue + 34) % 360, s: sat * 0.85, l: light * 0.82 },
                  { h: (hue + 300) % 360, s: sat * 0.78, l: light * 0.66 },
                  { h: (hue + 160) % 360, s: sat * 0.62, l: Math.min(88, light + 18) }
              ];
          }
          videoPalette.colors = paletteKeyColors(PALETTE_FALLBACK.hue, PALETTE_FALLBACK.sat, PALETTE_FALLBACK.light);

          function palH(off) { return (((videoPalette.hue + off) % 360) + 360) % 360; }

          function palHSL(off, satPct, lightPct, alpha) {
              return 'hsla(' + palH(off).toFixed(1) + ',' + satPct.toFixed(0) + '%,' + lightPct.toFixed(0) + '%,' +
                  alpha + ')';
          }

          const paletteBuf = document.createElement('canvas');
          paletteBuf.width = 32;
          paletteBuf.height = 18;
          const paletteCtx = paletteBuf.getContext('2d', { willReadFrequently: true });

          let palPrevL = null;   /* R1.4: previous sample's luminance plane */

          function samplePaletteNow() {
              let src = null;
              if (localArtEl && localArtEl.style.display !== 'none' && (localArtEl.naturalWidth || localArtEl
                  .videoWidth)) src = localArtEl;
              if (!src && video && video.style.display !== 'none' && video.readyState >= 2) src = video;
              if (!src) return;
              let data = null;
              try {
                  paletteCtx.clearRect(0, 0, 32, 18);
                  paletteCtx.drawImage(src, 0, 0, 32, 18);
                  data = paletteCtx.getImageData(0, 0, 32, 18).data;
              } catch (e) { return; }
              const H = new Float32Array(36);
              const L = new Float32Array(576);   /* R1.4: per-pixel luminance */
              const W = new Float32Array(576);   /* R1.4: per-pixel weight */
              let sSum = 0,
                  lSum = 0,
                  wSum = 0;
              for (let i = 0; i < data.length; i += 4) {
                  const r = data[i] / 255,
                      g = data[i + 1] / 255,
                      b = data[i + 2] / 255;
                  const mx = Math.max(r, g, b),
                      mn = Math.min(r, g, b);
                  const l = (mx + mn) / 2;
                  const d = mx - mn;
                  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
                  let h = 0;
                  if (d > 0) {
                      if (mx === r) h = 60 * (((g - b) / d) % 6);
                      else if (mx === g) h = 60 * ((b - r) / d + 2);
                      else h = 60 * ((r - g) / d + 4);
                      if (h < 0) h += 360;
                  }
                  const w = s * (0.3 + l);
                  const pi = i >> 2;
                  H[Math.min(35, (h / 10) | 0)] += w;
                  L[pi] = l;
                  W[pi] = w;
                  sSum += s * w;
                  lSum += l * w;
                  wSum += w;
              }
              if (wSum <= 0) return;
              let peak = 0;
              for (let i = 1; i < 36; i++)
                  if (H[i] > H[peak]) peak = i;
              let num = 0,
                  den = 0;
              for (let i = 0; i < 36; i++) {
                  let d = (i - peak) * 10;
                  if (d > 180) d -= 360;
                  if (d < -180) d += 360;
                  if (Math.abs(d) > 80) continue;
                  num += d * H[i];
                  den += H[i];
              }
              const hue = (((peak * 10 + (den > 0 ? num / den : 0)) % 360) + 360) % 360;
              const lAvg = lSum / wSum,
                  sAvg = sSum / wSum;
              /* R1.4 SOURCE PROFILE: contrast = weighted luminance spread,
                 motion = mean frame-to-frame luminance delta — the source's
                 own CODE (how busy, how punchy) joins its coloring as an
                 engine modifier. */
              let cAcc = 0;
              for (let p = 0; p < 576; p++) cAcc += W[p] * Math.pow(L[p] - lAvg, 2);
              const srcContrast = clamp(Math.sqrt(cAcc / wSum) * 2.4, 0.05, 1);
              let mAcc = 0;
              if (palPrevL) {
                  for (let p = 0; p < 576; p++) mAcc += Math.abs(L[p] - palPrevL[p]);
              }
              const srcMotion = palPrevL ? clamp((mAcc / 576) * 5, 0, 1) : 0.2;
              palPrevL = L;
              videoPalette.target = {
                  hue: hue,
                  sat: clamp(sAvg * 100, 12, 96),
                  light: clamp(lAvg * 100, 10, 90),
                  energy: clamp(lAvg * 0.72 + sAvg * 0.28, 0.05, 1),
                  contrast: srcContrast,
                  motion: srcMotion
              };
              videoPalette.valid = true;
          }

          let tintAtlas = null,
              tintAtlasKey = '';

          function maybeRebuildTintedAtlas(force) {
              const key = (force ? '!' : '') + Math.round(videoPalette.hue / 2.5) + ':' +
                  Math.round(videoPalette.sat / 6) + ':' + Math.round(videoPalette.light / 6);
              if (tintAtlas && tintAtlasKey === key) return;
              tintAtlasKey = key;
              if (!tintAtlas) tintAtlas = document.createElement('canvas');
              tintAtlas.width = atlas.canvas.width;
              tintAtlas.height = atlas.canvas.height;
              const tx = tintAtlas.getContext('2d');
              tx.clearRect(0, 0, tintAtlas.width, tintAtlas.height);
              tx.drawImage(atlas.canvas, 0, 0);
              tx.globalCompositeOperation = 'source-in';
              tx.fillStyle = 'hsla(' + videoPalette.hue.toFixed(1) + ',' + videoPalette.sat.toFixed(1) + '%,' +
                  videoPalette.light.toFixed(1) + '%,1)';
              tx.fillRect(0, 0, tintAtlas.width, tintAtlas.height);
          }
          maybeRebuildTintedAtlas(true);

          /* Glyph voices take the selected table from SignalGlyphs (rotated per
             sub-voice, see glyph-library.js); 'Engine realms (Revision 3)' keeps
             each voice on its original glyphs. */
          function voiceGlyphSet(voice, fallback) {
              const G = window.SignalGlyphs;
              return G && typeof G.setFor === 'function' ? G.setFor(voice, fallback) : fallback;
          }

          function voiceGlyph(voice, realm, toneIndex) {
              const G = window.SignalGlyphs;
              if (G && typeof G.pickFor === 'function') return G.pickFor(voice, Math.random, realm, toneIndex);
              const E = window.GlitchEngine;
              return E && E.pickGlyph ? E.pickGlyph(realm, Math.random, toneIndex) : '0';
          }

          /* Tile atlases for a voice's table: 256 slots sampled evenly across it
             (small tables repeat), so tile indices stay valid across table
             changes; redrawn when the table changes and re-tinted with the
             shared palette key. */
          const VOICE_ATLAS_SLOTS = 256;
          const voiceAtlases = new Map();

          function voiceGlyphAtlas(voice) {
              const G = window.SignalGlyphs;
              if (!G || typeof G.setFor !== 'function' || G.current === 'Engine realms (Revision 3)') {
                  return { src: tintAtlas || atlas.canvas, tile: atlas.tile, count: atlas.count };
              }
              const set = G.setFor(voice, atlas.chars);
              let va = voiceAtlases.get(voice);
              if (!va) {
                  va = { glyphVersion: null, canvas: document.createElement('canvas'),
                      tint: document.createElement('canvas'), tintKey: '', count: 0 };
                  voiceAtlases.set(voice, va);
              }
              const cols = 16, tile = atlas.tile, pad = 2;
              if (va.glyphVersion !== set.glyphVersion) {
                  const glyphs = [];
                  for (let i = 0; i < VOICE_ATLAS_SLOTS; i++) {
                      glyphs.push(set[Math.floor(i * set.length / VOICE_ATLAS_SLOTS)]);
                  }
                  const cv = va.canvas;
                  cv.width = cols * tile;
                  cv.height = Math.max(1, Math.ceil(glyphs.length / cols)) * tile;
                  const cx = cv.getContext('2d');
                  cx.font = 'bold ' + (tile - pad * 2) + 'px "Courier New", monospace';
                  cx.textBaseline = 'top';
                  cx.fillStyle = '#fff';
                  glyphs.forEach((ch, i) => cx.fillText(ch, (i % cols) * tile + pad, Math.floor(i / cols) * tile + pad));
                  va.count = glyphs.length;
                  va.glyphVersion = set.glyphVersion;
                  va.tintKey = '';
              }
              if (va.tintKey !== tintAtlasKey) {
                  va.tintKey = tintAtlasKey;
                  const tc = va.tint;
                  tc.width = va.canvas.width;
                  tc.height = va.canvas.height;
                  const tx = tc.getContext('2d');
                  tx.drawImage(va.canvas, 0, 0);
                  tx.globalCompositeOperation = 'source-in';
                  tx.fillStyle = 'hsla(' + videoPalette.hue.toFixed(1) + ',' + videoPalette.sat.toFixed(1) + '%,' +
                      videoPalette.light.toFixed(1) + '%,1)';
                  tx.fillRect(0, 0, tc.width, tc.height);
              }
              return { src: va.tint, tile, count: va.count };
          }

          function stepPalette(now, dt) {
              if (now - videoPalette.lastSampleAt > 420) {
                  videoPalette.lastSampleAt = now;
                  try { samplePaletteNow(); } catch (e) {}
              }
              let t = videoPalette.target;
              if (!t) {
                  t = {
                      hue: (PALETTE_FALLBACK.hue + Math.sin(now * 0.00013) * 18 + Math.cos(now * 0.00007 + 1.2) *
                          10) % 360,
                      sat: clamp(PALETTE_FALLBACK.sat + Math.sin(now * 0.0002) * 8, 12, 96),
                      light: clamp(PALETTE_FALLBACK.light + Math.cos(now * 0.00017) * 6, 10, 90),
                      energy: clamp(0.45 + Math.sin(now * 0.00016) * 0.1, 0.05, 1),
                      /* R1.4: the no-source fallback breathes the profile too */
                      contrast: clamp(0.38 + Math.sin(now * 0.00011) * 0.14, 0.05, 1),
                      motion: clamp(0.16 + Math.sin(now * 0.00019) * 0.12 + Math.cos(now * 0.00007) * 0.08, 0, 0.6)
                  };
              }
              let dh = t.hue - videoPalette.hue;
              if (dh > 180) dh -= 360;
              if (dh < -180) dh += 360;
              const k = 1 - Math.exp(-1.6 * dt);
              videoPalette.hue = (videoPalette.hue + dh * k + 360) % 360;
              videoPalette.sat += (t.sat - videoPalette.sat) * k;
              videoPalette.light += (t.light - videoPalette.light) * k;
              videoPalette.energy += (t.energy - videoPalette.energy) * k;
              videoPalette.contrast += ((t.contrast == null ? 0.40 : t.contrast) - videoPalette.contrast) * k;
              videoPalette.motion += ((t.motion == null ? 0.20 : t.motion) - videoPalette.motion) * k;
              videoPalette.darkness = 1 - videoPalette.light / 100;
              videoPalette.complement = (videoPalette.hue + 180) % 360;
              videoPalette.accent = (videoPalette.hue + 115) % 360;
              videoPalette.colors = paletteKeyColors(videoPalette.hue, videoPalette.sat, videoPalette.light);
              maybeRebuildTintedAtlas();
          }

          /* ==================================================================
           *  R1.4 — THE SOURCE IS THE ENGINE (user request)
           *  The chosen video / artwork is THE modifier of the whole FX
           *  engine and its randomization. These helpers expose its live
           *  profile to every system: energy / motion (how lively the
           *  source is), appetite (how colorful), spread (how tightly the
           *  random-rainbow voices orbit the source's spectrum), and the
           *  CONFLUENCE HUE — one hue, shared by the filter paths, that
           *  bends the source root by everything currently on the board:
           *  the chord tone, the Hue/Color Cycle slider, HSL Rainbow, the
           *  AI-warp prism and the combo profile.
           * ================================================================== */
          function srcEnergyK() { return clamp(videoPalette.energy, 0.05, 1); }
          function srcMotionK() { return clamp(videoPalette.motion, 0, 1); }
          function srcAppetite() { return clamp01((videoPalette.sat - 30) / 60); }
          function srcSpreadK() { return clamp(1.15 - videoPalette.sat / 140, 0.35, 1.05); }
          function srcDarkK() { return clamp01(videoPalette.darkness || 0.4); }

          /* ---- R1.6: THE SOURCE IS THE ENGINE — one live modifier table.
             Every system that still ran on fixed constants now reads the
             background canvas's profile through here. Live values are
             exposed at __glitchDebug.modifiers(). ---- */
          const R16 = {
              bwInvCap:  () => 0.75, /* Full Light Emission Inversion amount (50–100% rail) */
              scanGap:   () => 2.5 * (1 - srcMotionK()),      /* extra comb tightening, px */
              strobeP:   () => 0.9 * (1.25 - 0.45 * srcEnergyK()), /* ruff period, s */
              strobeW:   () => 0.85 + 0.30 * srcEnergyK(),    /* ruff window factor */
              bandWob:   () => 0.80 + 0.40 * srcMotionK(),    /* Data Bands weave */
              vhsAmp:    () => 0.80 + 0.20 * srcEnergyK() + 0.20 * srcMotionK(),
              bombReach: () => 0.85 + 0.30 * srcAppetite(),   /* Data Bomb spread */
              inkScale:  () => 0.85 + 0.30 * srcDarkK(),      /* ink stamp size */
              sigilBias: () => 0.30 + 0.40 * srcDarkK(),      /* ink alphabet mix */
              neonVeil:  () => 0.80 + 0.40 * srcDarkK(),      /* Neon veil + bloom */
              scanSpeed: () => 0.85 + 0.30 * srcEnergyK(),    /* V-Sync scan */
              washHold:  () => 1.30 - 0.55 * srcEnergyK(),    /* washout-pair hold */
              comboHarm: () => 0.75 + 0.50 * srcAppetite(),   /* combo post-process */
              /* ---- R1.7: the canvas is the code ---- */
              wordVivid: () => (srcAppetite() >= srcDarkK()) ?
                  (0.10 + 0.85 * srcAppetite()) : (1 - (0.10 + 0.85 * srcDarkK())),
              wordDark:  () => 1 - R16.wordVivid(),           /* Font Burn bank shares */
              fontScale: () => 0.85 + 0.30 * srcAppetite(),   /* burn word size */
              randRate:  () => 0.80 + 0.40 * srcEnergyK(),    /* randomizer travel pace */
              ambientK:  () => 0.85 + 0.30 * srcEnergyK(),    /* ambient pull floors */
              stuckK:    () => 1.35 - 0.55 * srcEnergyK(),    /* stuck-high patience */
              spinK:     () => 0.62 + 1.12 * srcMotionK(),    /* rainbow prism spin */
              rainbowSat:() => 0.85 + 0.30 * srcAppetite(),   /* rainbow wash sat */
              asciiGap:  () => 1.18 - 0.36 * srcAppetite(),   /* ASCII grid spacing factor */
              bwPeak:    () => 0.75,                          /* negative light-emission landmark */
              geminiK:   () => 0.80 + 0.40 * srcEnergyK(),    /* twin orbit spin */
              comboSat:  () => 0.75 + 0.50 * srcAppetite(),   /* combo mood saturation */
              comboGlow: () => 0.85 + 0.30 * srcEnergyK(),    /* combo mood glow */
              comboCon:  () => 0.85 + 0.30 * srcDarkK(),      /* combo mood contrast */
              /* ---- R1.8: the heartbeat ---- */
              breathRate:() => 0.75 + 0.55 * srcEnergyK(),    /* master breath LFO tempo */
              stageK:    () => 0.80 + 0.40 * srcMotionK(),    /* stage wander amplitude */
              inkLife:   () => 0.75 + 0.50 * srcDarkK(),      /* ink stamp lifetime */
              echoPace:  () => 1.30 - 0.55 * srcEnergyK(),    /* burn echo retarget */
              tearK:     () => 0.85 + 0.35 * srcMotionK(),    /* V-Sync tear count */
              smearK:    () => 0.80 + 0.40 * srcMotionK(),    /* ghost motion smear */
              pairRoom:  () => 0.88 + 0.24 * srcEnergyK(),    /* washout headroom */
              temper:    () => clamp01(srcEnergyK() + 0.5 * srcMotionK()) /* preset curation */
          };

          /* ==================================================================
           *  6c. R2 SOFT-EYE — THE EAR, THE CRESCENDO, THE LIGHT-BURST GATE
           *  Baked into the ghost (glitch-engine.js). The board is CALM by
           *  default: slow retargets, gradual travel, no regular strobing,
           *  fewer Matrix bursts. Only OCCASIONALLY (timer, a busy preset
           *  pick, or the EAR hearing a build / drop) does a CRESCENDO open:
           *  chroma voices spin fast, and Ghost / V-Sync fire colour + dia-
           *  inverted light bursts. Audio is analysed from the local
           *  <video>/<audio> element (Web Audio analyser); the YouTube
           *  iframe cannot be tapped, so the ear falls back to the canvas
           *  profile (energy / motion) — same automation, softer pulse.
           * ================================================================== */
          const SOFT = (function () {
              const E = window.GlitchEngine;
              const ok = !!(E && E.createCrescendo && E.createBurstGate && E.createEar);
              const host = {
                  ok: ok,
                  enabled: true,
                  cresc: ok ? E.createCrescendo() : null,
                  gate:  ok ? E.createBurstGate() : null,
                  ear:   ok ? E.createEar() : null,      /* mixed output the board reads */
                  earAud: ok ? E.createEar() : null,     /* R3: local MP3/MP4 spectrum */
                  earVis: ok ? E.createEar() : null,     /* R3: canvas energy/motion */
                  k: 0,                 // crescendo amount 0..1 (eased)
                  burst: 0,             // light-burst envelope 0..1
                  burstKind: null,      // 'dia' | 'color' | 'both'
                  burstSeen: 0,         // gate.count last handled
                  burstBwFrom: 0,       // B&W level when the burst began
                  beat: 0,
                  ctx: null, analyser: null, srcNodes: new WeakMap(), tapped: null,
                  freq: null, time: null, lastAudioAt: 0, audioSource: 'none',
                  earMode: 'auto',      // auto | audio | canvas
                  audioMix: 0,          // 0 canvas … 1 audio (eased)
                  hueSpin: 0            // accumulated hue-cycle spin (deg)
              };
              host.k01 = () => host.enabled ? host.k : 1;   /* disabled = legacy behaviour */
              return host;
          })();

          function softK() { return SOFT.ok ? SOFT.k01() : 1; }
          function softWild() { return softK() > 0.5; }
          function softEar() { return SOFT.ear ? SOFT.ear.state : null; }

          function softEnsureAudio(el) {
              if (!SOFT.ok || !el) return false;
              try {
                  const AC = window.AudioContext || window.webkitAudioContext;
                  if (!AC) return false;
                  if (!SOFT.ctx) {
                      SOFT.ctx = new AC();
                      SOFT.analyser = SOFT.ctx.createAnalyser();
                      SOFT.analyser.fftSize = 2048;
                      SOFT.analyser.smoothingTimeConstant = 0.72;
                      SOFT.analyser.connect(SOFT.ctx.destination);
                      SOFT.freq = new Uint8Array(SOFT.analyser.frequencyBinCount);
                      SOFT.time = new Uint8Array(SOFT.analyser.fftSize);
                  }
                  if (!SOFT.srcNodes.has(el)) {
                      const node = SOFT.ctx.createMediaElementSource(el);  // one per element, ever
                      SOFT.srcNodes.set(el, node);
                      node.connect(SOFT.analyser);
                  }
                  SOFT.tapped = el;
                  if (SOFT.ctx.state === 'suspended') SOFT.ctx.resume().catch(() => {});
                  return true;
              } catch (e) { return false; }
          }
          /* resume the context on any gesture (autoplay policy) */
          ['click', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => {
              if (SOFT.ctx && SOFT.ctx.state === 'suspended') SOFT.ctx.resume().catch(() => {});
          }, { passive: true }));

          function softCloneEar(s) {
              const o = {};
              if (!s) return o;
              for (const k in s) {
                  const v = s[k];
                  if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') o[k] = v;
              }
              return o;
          }
          function softDecayEar(s, dt, rate) {
              if (!s) return;
              const k = Math.exp(-(rate || 1.4) * dt);
              const keys = ['level', 'bass', 'mid', 'treb', 'onset', 'beat', 'flux', 'energy', 'energyFast', 'energyLong', 'build', 'drop', 'crest', 'centroid', 'warm', 'conf'];
              for (let i = 0; i < keys.length; i++) {
                  const key = keys[i];
                  if (typeof s[key] === 'number') s[key] *= k;
              }
              if (typeof s.active === 'boolean' && s.level < 0.02) s.active = false;
          }
          function softMixEarInto(dst, vis, aud, t) {
              if (!dst) return;
              t = t < 0 ? 0 : t > 1 ? 1 : t;
              const keys = ['level', 'bass', 'mid', 'treb', 'onset', 'beat', 'flux', 'fluxAvg', 'energy', 'energyFast', 'energyLong', 'build', 'drop', 'buildCredit', 'peakHold', 'quietFor', 'tempoK', 'ibi', 'warm'];
              for (let i = 0; i < keys.length; i++) {
                  const key = keys[i];
                  const a = vis && typeof vis[key] === 'number' ? vis[key] : 0;
                  const b = aud && typeof aud[key] === 'number' ? aud[key] : a;
                  dst[key] = a + (b - a) * t;
              }
              dst.ready = !!(t > 0.45 ? (aud && aud.ready) : (vis && vis.ready));
              dst.active = t > 0.18 ? !!(aud && aud.active) : !!(vis && vis.active);
              dst.source = t > 0.45
                  ? ((aud && aud.source) || 'audio')
                  : ((vis && vis.source) || 'canvas');
          }
          function softStep(now, dt) {
              if (!SOFT.ok) return;
              const ear = SOFT.ear;
              /* --- R3 feed: AUTO / AUDIO / CANVAS with dual-ear crossfade --- */
              const mode = SOFT.earMode || 'auto';
              let haveAudio = false;
              const el = SOFT.tapped;
              if (SOFT.analyser && el && !el.paused && !el.ended && el.readyState >= 2) {
                  try {
                      SOFT.analyser.getByteFrequencyData(SOFT.freq);
                      SOFT.analyser.getByteTimeDomainData(SOFT.time);
                      haveAudio = true;
                  } catch (e) {}
              }
              const allowAudio = mode !== 'canvas';
              const allowCanvas = mode !== 'audio';
              const wantAudio = allowAudio && haveAudio;
              const mixTgt = wantAudio ? 1 : 0;
              const mixRate = wantAudio ? 1.85 : (mode === 'audio' ? 0.48 : 2.15);
              SOFT.audioMix += (mixTgt - (SOFT.audioMix || 0)) * Math.min(1, dt * mixRate);

              if (SOFT.earAud) {
                  if (wantAudio) {
                      SOFT.earAud.feedSpectrum(SOFT.freq, SOFT.time, dt, SOFT.ctx.sampleRate,
                          el === localAudio ? 'local-audio' : 'local-video');
                      SOFT.lastAudioAt = now;
                  } else {
                      softDecayEar(SOFT.earAud.state, dt, mode === 'audio' ? 0.42 : 1.6);
                  }
              }
              if (SOFT.earVis) {
                  if (allowCanvas || !wantAudio) {
                      SOFT.earVis.feedVisual(videoPalette.energy, videoPalette.motion, dt);
                  } else {
                      softDecayEar(SOFT.earVis.state, dt, 0.85);
                  }
              }
              const vis = SOFT.earVis ? SOFT.earVis.state : null;
              const aud = SOFT.earAud ? SOFT.earAud.state : null;
              const mix = SOFT.audioMix || 0;
              if (aud && vis) {
                  if (mix > 0.02 && mix < 0.98) softMixEarInto(ear.state, vis, aud, mix);
                  else if (mix >= 0.98) Object.assign(ear.state, softCloneEar(aud));
                  else Object.assign(ear.state, softCloneEar(vis));
              } else if (aud && mix > 0.5) {
                  Object.assign(ear.state, softCloneEar(aud));
              } else if (vis) {
                  Object.assign(ear.state, softCloneEar(vis));
              }
              SOFT.audioSource = ear.state.source;
              SOFT.beat = ear.state.beat;
              /* --- crescendo + light-burst gate --- */
              const es = ear.state;
              const kRaw = SOFT.cresc.step(now, dt, es);
              SOFT.k += (kRaw - SOFT.k) * Math.min(1, dt * 1.85);
              const env = SOFT.gate.step(now, dt, SOFT.k01(), es);
              SOFT.burst = SOFT.enabled ? env : 0;
              SOFT.burstKind = SOFT.gate.kind();
              if (SOFT.gate.state.count !== SOFT.burstSeen) {
                  SOFT.burstSeen = SOFT.gate.state.count;
                  SOFT.burstBwFrom = effectAlphas['B&W Invert'] || 0;
              }
              /* --- the B&W DIA shader rides the burst (cur → 0.75 negative light emission → cur) --- */
              if (SOFT.burst > 0.002 && (SOFT.burstKind === 'dia' || SOFT.burstKind === 'both') &&
                  !sliderLocks['B&W Invert'] && !bwSweepActive &&
                  !(sliderElements['B&W Invert'] && document.activeElement === sliderElements['B&W Invert'])) {
                  const v = clamp01(SOFT.gate.diaValue(SOFT.burstBwFrom, SOFT.burst));
                  effectAlphas['B&W Invert'] = v;
                  randomTargets['B&W Invert'] = SOFT.burstBwFrom;
                  const bel = sliderElements['B&W Invert'];
                  if (bel && Math.abs(v - (sliderWritten['B&W Invert'] || 0)) > 0.004) {
                      sliderWritten['B&W Invert'] = v;
                      bel.value = v.toFixed(3);
                  }
              }
              /* --- hue-cycle spin accumulator: slow drift calm, rapid wheel wild --- */
              const hueOn = hueMasterLevel();
              /* calm @50%: ~3.5°/s (a wheel per ~100 s) · wild @50%: ~145°/s (a wheel per ~2.5 s) */
              const spinDps = hueOn * (4 + 6 * hueOn) * (1 + 40 * Math.pow(SOFT.k01(), 1.5)) * (1 + 0.6 * SOFT.beat);
              SOFT.hueSpin = (SOFT.hueSpin + spinDps * dt) % 360;
              softUpdateHud(now);
          }

          let softHudEl = null, softHudAt = 0;
          function softUpdateHud(now) {
              softUpdateEarHud();
              if (now - softHudAt < 260) return;
              softHudAt = now;
              if (!softHudEl) softHudEl = document.getElementById('softEyeBtn');
              if (!softHudEl) return;
              const ph = SOFT.cresc ? SOFT.cresc.phase() : 'off';
              const mix = SOFT.audioMix || 0;
              const src = SOFT.audioSource || 'none';
              const txt = 'SOFT-EYE: ' + (SOFT.enabled ? ph.toUpperCase() : 'OFF') +
                  ' · ' + src +
                  (SOFT.burst > 0.02 ? ' · ' + (SOFT.burstKind || '').toUpperCase() + ' BURST' : '');
              if (softHudEl.textContent !== txt) softHudEl.textContent = txt;
              softHudEl.classList.toggle('wild', SOFT.enabled && SOFT.k > 0.5);
              softHudEl.classList.toggle('burst', SOFT.burst > 0.02);
              softHudEl.style.setProperty('--k', SOFT.k.toFixed(3));
          }

          function softSetBar(id, v) {
              const el = document.getElementById(id);
              if (!el) return;
              const w = (Math.max(0, Math.min(1, +v || 0)) * 100).toFixed(1) + '%';
              if (el.style.width !== w) el.style.width = w;
          }
          function softUpdateEarHud() {
              const hud = document.getElementById('earHud');
              if (!hud) return;
              const es = SOFT.ear ? SOFT.ear.state : null;
              const mode = SOFT.earMode || 'auto';
              const mix = SOFT.audioMix || 0;
              hud.dataset.mode = mode;
              hud.classList.toggle('is-beat', !!(es && es.beat > 0.35));
              hud.classList.toggle('is-audio', mix > 0.5);
              softSetBar('earMeterLevel', es && es.level);
              softSetBar('earMeterBass', es && es.bass);
              softSetBar('earMeterMid', es && es.mid);
              softSetBar('earMeterTreb', es && es.treb);
              softSetBar('earMeterBuild', es && es.build);
              const modeEl = document.getElementById('earHudMode');
              const phaseEl = document.getElementById('earHudPhase');
              const srcEl = document.getElementById('earHudSrc');
              const waiting = mode === 'audio' && mix < 0.25;
              if (modeEl) {
                  const t = 'EAR ' + mode.toUpperCase() + (waiting ? ' · WAIT' : '');
                  if (modeEl.textContent !== t) modeEl.textContent = t;
              }
              if (phaseEl) {
                  const ph = SOFT.cresc ? SOFT.cresc.phase() : 'off';
                  const t = (SOFT.enabled ? ph : 'off').toUpperCase();
                  if (phaseEl.textContent !== t) phaseEl.textContent = t;
              }
              if (srcEl) {
                  const src = (es && es.source) || 'none';
                  const t = 'src ' + src + ' · mix ' + mix.toFixed(2);
                  if (srcEl.textContent !== t) srcEl.textContent = t;
              }
              if (SOFT.paintEar) SOFT.paintEar();
          }

          /* B&W INVERT MAP — 0 / 50 / 75 / 100 landmarks
             t=0.00 → hue 0°,   invert 0      (off)
             t=0.50 → hue 180°, invert 0      (0 Light Emission Inversion, Dia)
             t=0.75 → hue 270°, invert 0.75   (NEGATIVE light emission — full as asked)
             t=1.00 → hue 360°, invert 0.75   (hold 75% negative; hue completes the wheel)
             0–100% always hue-rotates the entire spectrum.
             invert() is the negative; 75% IS the full emission inversion.
          */
          function bwInvertMap(level) {
              if (window.GlitchEngine && typeof GlitchEngine.bwInvertMap === 'function') {
                  return GlitchEngine.bwInvertMap(level);
              }
              const t = clamp01(+level || 0);
              let invert = 0;
              let rail = 'hue';
              if (t <= 0.50) {
                  invert = 0;
                  rail = 'hue';
              } else if (t <= 0.75) {
                  const u = (t - 0.50) / 0.25;
                  invert = u * u * 0.75;
                  rail = 'emission';
              } else {
                  invert = 0.75; /* 75→100% holds negative light emission at 75% */
                  rail = 'emission';
              }
              const kNeg = invert / 0.75;
              return {
                  t: t,
                  hueDeg: t * 360,
                  invert: invert,
                  contrast: 1 + kNeg * 0.14,
                  sat: t <= 0.50 ? (1 + t * 0.08) : Math.max(0.82, 1 - kNeg * 0.12),
                  rail: rail,
                  live: t > 0.008,
                  negative: invert,
                  landmark: t < 0.25 ? 0 : t < 0.625 ? 0.50 : t < 0.875 ? 0.75 : 1
              };
          }
          function bwInvertCssParts(level) {
              const m = bwInvertMap(level);
              if (!m.live) return [];
              const parts = ['hue-rotate(' + m.hueDeg.toFixed(1) + 'deg)'];
              if (m.invert > 0.004) {
                  parts.push('invert(' + m.invert.toFixed(3) + ')'); /* negative light emission */
                  parts.push('contrast(' + m.contrast.toFixed(3) + ')');
                  parts.push('brightness(' + (1 - (m.invert / 0.75) * 0.05).toFixed(3) + ')');
                  if (m.sat < 0.98) parts.push('saturate(' + m.sat.toFixed(3) + ')');
              } else if (m.sat > 1.01) {
                  parts.push('saturate(' + m.sat.toFixed(3) + ')');
              }
              return parts;
          }

          function fxConfluenceHue(wobble) {
              const hueCyc = hueMasterLevel();
              const rainbow = clamp01(effectAlphas['HSL Rainbow'] || 0);
              const bw = bwInvertMap(bwMasterLevel());
              let h = videoPalette.hue;                                   /* the source root leads */
              /* COMPLETE CONFLUENCE: Ghost-Key home triad is always in the mix */
              if (typeof GHOST_KEY_HUES !== 'undefined' && GHOST_KEY_HUES && GHOST_KEY_HUES.length) {
                  h = fxLerpHue(h, GHOST_KEY_HUES[0], 0.22);
                  h = fxLerpHue(h, GHOST_KEY_HUES[1], 0.10 + 0.12 * rainbow);
                  h = fxLerpHue(h, GHOST_KEY_HUES[2], 0.08 * (bw.invert / 0.75 || 0.15));
              }
              h = fxLerpHue(h, FX_KEY.tones[1], 0.18 + 0.22 * rainbow);   /* chord tone, rainbow pulls harder */
              if (isAiWarpActive) h = fxLerpHue(h, aiWarpHue, 0.20);      /* AI-warp prism root */
              /* HSL Rainbow H-rail: the hue wheel itself joins confluence */
              if (rainbow > 0.008 && window.GlitchEngine && GlitchEngine.hslRainbowMap) {
                  const rm = GlitchEngine.hslRainbowMap(rainbow, {
                      ghost: (typeof getGhostMode === 'function') ? getGhostMode() : 'OFF',
                      vsync: (typeof getVsyncMode === 'function') ? getVsyncMode() : 'OFF',
                      warp: isAiWarpActive, bw: bw.t || 0
                  });
                  h = (h + rm.hueDeg * 0.22) % 360;
              }
              /* B&W hue rail (entire spectrum) + hue slider + combo */
              h = (h + bw.hueDeg + hueCyc * 120 + comboProfile.hueOffset * 0.30) % 360;
              /* negative emission polarity: invert 0.75 ≡ +180° photographic negative */
              if (bw.invert > 0.004) h = (h + 180 * (bw.invert / 0.75)) % 360;
              if (wobble) h += wobble;
              return ((h % 360) + 360) % 360;
          }

          let _confHslAt = -1, _confHsl = null;
          function fxConfluenceHsl() {
              if (_confHsl && _confHslAt === frameCount) return _confHsl;
              const rainbow = clamp01((effectAlphas['HSL Rainbow'] || 0) * masterOpacity);
              const map = (window.GlitchEngine && GlitchEngine.hslRainbowMap)
                  ? GlitchEngine.hslRainbowMap(rainbow, boardFilterCtx ? boardFilterCtx() : {})
                  : { satPct: 50 + rainbow * 40, lightPct: 56, satFilter: 1, brightFilter: 1, live: rainbow > 0.008 };
              _confHsl = {
                  h: fxConfluenceHue(0),
                  s: map.satPct,
                  l: map.lightPct,
                  satK: map.satFilter || 1,
                  brightK: map.brightFilter || 1,
                  live: !!map.live,
                  map: map
              };
              _confHslAt = frameCount;
              return _confHsl;
          }
          function fxConfluenceSat() { return fxConfluenceHsl().s; }
          function fxConfluenceLight() { return fxConfluenceHsl().l; }

          window.__glitchDebug = {
              softEye: () => SOFT.ok ? ({                 /* R2: crescendo / burst / ear live state */
                  enabled: SOFT.enabled, k: +SOFT.k.toFixed(3), phase: SOFT.cresc.phase(),
                  crescendos: SOFT.cresc.state.count, source: SOFT.cresc.state.source,
                  burst: +SOFT.burst.toFixed(3), burstKind: SOFT.burstKind, bursts: SOFT.gate.state.count,
                  ear: Object.assign({}, SOFT.ear.state), audio: SOFT.audioSource,
                  hueSpin: +SOFT.hueSpin.toFixed(1)
              }) : null,
              confluence: () => fxConfluenceHue(0),   /* R1.5: wobble-free confluence hue (debug) */
              confluenceHsl: () => fxConfluenceHsl(),
              hslRainbow: () => (window.GlitchEngine && GlitchEngine.hslRainbowMap)
                  ? GlitchEngine.hslRainbowMap(effectAlphas['HSL Rainbow'] || 0, boardFilterCtx())
                  : null,
              bwInvert: () => bwInvertMap(bwMasterLevel()),
              engine: () => window.GlitchEngine ? {
                  version: GlitchEngine.version,
                  realm: GlitchEngine.realmFromBoard({
                      ghost: getGhostMode(), vsync: getVsyncMode(),
                      warp: isAiWarpActive, bw: bwMasterLevel()
                  }),
                  ghost: getGhostMode(), vsync: getVsyncMode(),
                  typesets: GlitchEngine.typesetInfo ? GlitchEngine.typesetInfo() : null,
                  matrixChord: (FX_CHORDS[FX_KEY.idx] || {}).name || null
              } : null,
              ghostKey: () => (typeof GHOST_KEY === 'string' ? GHOST_KEY : ''),
              ghostHues: () => (typeof GHOST_KEY_HUES !== 'undefined' ? GHOST_KEY_HUES.slice() : []),
              keyChord: () => (FX_KEY ? { name: (FX_CHORDS[FX_KEY.idx] || {}).name, root: FX_KEY.root, tones: FX_KEY.tones.slice() } : null),
              modifiers: () => ({                    /* R1.6: the whole live modifier table */
                  bwInvCap: R16.bwInvCap(), scanGap: R16.scanGap(),
                  strobeP: R16.strobeP(), strobeW: R16.strobeW(),
                  bandWob: R16.bandWob(), vhsAmp: R16.vhsAmp(),
                  bombReach: R16.bombReach(), inkScale: R16.inkScale(),
                  sigilBias: R16.sigilBias(), neonVeil: R16.neonVeil(),
                  scanSpeed: R16.scanSpeed(), washHold: R16.washHold(),
                  comboHarm: R16.comboHarm(),
                  /* R1.7 */
                  wordVivid: R16.wordVivid(), wordDark: R16.wordDark(),
                  fontScale: R16.fontScale(), randRate: R16.randRate(),
                  ambientK: R16.ambientK(), stuckK: R16.stuckK(),
                  spinK: R16.spinK(), rainbowSat: R16.rainbowSat(),
                  asciiGap: R16.asciiGap(), bwPeak: R16.bwPeak(),
                  geminiK: R16.geminiK(), comboSat: R16.comboSat(),
                  comboGlow: R16.comboGlow(), comboCon: R16.comboCon(),
                  /* R1.8 */
                  breathRate: R16.breathRate(), stageK: R16.stageK(),
                  inkLife: R16.inkLife(), echoPace: R16.echoPace(),
                  tearK: R16.tearK(), smearK: R16.smearK(),
                  pairRoom: R16.pairRoom(), temper: R16.temper()
              }),
              palette: () => ({
                  hue: videoPalette.hue,
                  sat: videoPalette.sat,
                  light: videoPalette.light,
                  energy: videoPalette.energy,
                  contrast: videoPalette.contrast,
                  motion: videoPalette.motion,
                  darkness: videoPalette.darkness,
                  appetite: clamp01((videoPalette.sat - 30) / 60),
                  spread: clamp(1.15 - videoPalette.sat / 140, 0.35, 1.05),
                  paintScale: 0.86 + 0.28 * clamp(videoPalette.energy, 0.05, 1),
                  temperament: srcEnergyK() + 0.5 * srcMotionK(),
                  complement: videoPalette.complement,
                  accent: videoPalette.accent,
                  tinted: !!tintAtlas,
                  source: videoPalette.valid ? 'sample' : 'fallback',
                  colors: videoPalette.colors.map((c) => ({ h: c.h, s: c.s, l: c.l }))
              }),
              forcePalette: (h, s, l, motion) => {
                  h = ((h % 360) + 360) % 360;
                  videoPalette.hue = h;
                  videoPalette.sat = clamp(s, 12, 96);
                  videoPalette.light = clamp(l, 10, 90);
                  videoPalette.target = { hue: h, sat: videoPalette.sat, light: videoPalette.light,
                      energy: clamp(l / 100 + s / 300, 0.05, 1),
                      /* R1.6: motion/contrast ride in the target too, so the
                         palette eases HOLD the forced profile */
                      motion: clamp(motion === undefined ? 0.25 : motion, 0.05, 0.95),
                      contrast: 0.42 };
                  videoPalette.complement = (h + 180) % 360;
                  videoPalette.accent = (h + 115) % 360;
                  videoPalette.contrast = 0.42;
                  videoPalette.motion = videoPalette.target.motion;
                  videoPalette.energy = videoPalette.target.energy; /* R1.6: forced now, not eased */
                  videoPalette.darkness = 1 - videoPalette.light / 100;
                  videoPalette.colors = paletteKeyColors(h, videoPalette.sat, videoPalette.light);
                  maybeRebuildTintedAtlas(true);
              }
          };

          /* ================================================================ *
           *  GHOST-KEY — Font Burn Codex + Harmonic Key seed                 *
           *  ' Gh0sTs 1n Th3 Sh3lLs - D1giTaL R3BiRtHs - f34Rd0t.C0mM4 '     *
           *  Three stanzas hash to the home triad (ghost / rebirth / fear).  *
           *  The Codex is minted from the key, GitS tropes, digital-rebirth  *
           *  lexicon, fear.dot.comma punctuation, and encoded KEY-hex.       *
           * ================================================================ */
          const GHOST_KEY = 'Gh0sTs 1n Th3 Sh3lLs - D1giTaL R3BiRtHs - f34Rd0t.C0mM4';
          const GHOST_KEY_STANZAS = ['Gh0sTs 1n Th3 Sh3lLs', 'D1giTaL R3BiRtHs', 'f34Rd0t.C0mM4'];
          function ghostKeyHash(s) {
              let h = 0x811c9dc5;
              for (let i = 0; i < s.length; i++) {
                  h ^= s.charCodeAt(i);
                  h = Math.imul(h, 0x01000193);
              }
              return h >>> 0;
          }
          function ghostDeLeet(s) {
              return String(s).replace(/0/g, 'O').replace(/1/g, 'I').replace(/3/g, 'E')
                  .replace(/4/g, 'A').replace(/5/g, 'S').replace(/7/g, 'T');
          }
          const GHOST_KEY_SEED = ghostKeyHash(GHOST_KEY);
          const GHOST_KEY_HUES = GHOST_KEY_STANZAS.map((st) => ghostKeyHash(st) % 360);
          /* stanza hues: Gh0sTs… → magenta-ghost, D1giTaL… → violet-rebirth,
             F34Rd0t… → phosphor-teal. Full-key hash sits at amber-fear. */
          const GHOST_KEY_HOME = GHOST_KEY_HUES[0];
          const GHOST_KEY_FEAR = GHOST_KEY_SEED % 360;

          function buildGhostKeyCodex() {
              const bag = [];
              const add = (s) => {
                  if (s == null) return;
                  const w = String(s).trim();
                  if (w.length >= 2 && w.length <= 40) bag.push(w);
              };
              add(GHOST_KEY);
              GHOST_KEY_STANZAS.forEach((st) => {
                  add(st);
                  add(st.toUpperCase());
                  add(ghostDeLeet(st).toUpperCase());
                  st.split(/[\s.\-]+/).forEach((p) => {
                      add(p);
                      add(p.toUpperCase());
                      add(ghostDeLeet(p).toUpperCase());
                  });
              });
              [
                  'GHOST', 'GHOSTS', 'Gh0sT', 'Gh0sTs', 'SHELL', 'SHELLS', 'Sh3lL', 'Sh3lLs',
                  'DIGITAL', 'D1giTaL', 'REBIRTH', 'REBIRTHS', 'R3BiRtH', 'R3BiRtHs',
                  'FEAR', 'F34R', 'DOT', 'D0T', 'COMMA', 'C0mM4', 'C0MM4',
                  'GHOSTS IN THE SHELLS', 'DIGITAL REBIRTHS', 'FEAR.DOT.COMMA',
                  'THE NET IS VAST', 'AND INFINITE'
              ].forEach(add);
              [
                  'MAJOR', 'KUSANAGI', 'BATOU', 'TOGUSA', 'ARAMAKI', 'SECTION 9',
                  'THERMOPTIC', 'OPTIC CAMO', 'CYBERBRAIN', 'GHOST DUB', 'GHOST HACK',
                  'PUPPET MASTER', 'PROJECT 2501', 'LAUGHING MAN', 'STAND ALONE',
                  'COMPLEX', 'TACHIKOMA', 'INNOCENCE', 'NET DIVE', 'BARRIER',
                  'PROSTHETIC', 'CYBORG', 'SAC', 'PUBLIC SECURITY', 'FULL CYBORG',
                  'BRAIN CASE', 'SOUL COPY', 'BODY BANK', 'SHELL UNIT', 'GHOST WAVE',
                  'MEME', 'SURFACE', 'DEPTH', 'ACCESS', 'LOG IN', 'WIRED', 'UNWIRED'
              ].forEach(add);
              [
                  'RECOMPILE', 'REINCARNATE', 'RESURRECT', 'NEW FLESH', 'BOOTSTRAP',
                  'UPLOAD SOUL', 'DOWNLOAD GHOST', 'MIGRATE', 'CHRYSALIS', 'AWAKEN',
                  'SECOND LIFE', 'THIRD SHELL', 'REBORN CODE', 'FRESH BOOT',
                  'BACKUP GHOST', 'RESTORE POINT', 'EMERGE', 'TRANSMIGRATION',
                  'DIGITAL WOMB', 'CODE BORN', 'LIVE AGAIN', 'REBOOT HEART',
                  'NEW SHELL', 'OLD GHOST', 'NEXT FLESH'
              ].forEach(add);
              [
                  'F34RD0T', 'C0MM4', 'FEAR.DOT', 'DOT COMMA', 'PARSE ERROR',
                  'SYNTAX FEAR', 'TOKEN FEAR', 'DELIMITER', 'TERMINATOR',
                  'ELLIPSIS', 'PUNCTUM', 'COMMA SPLICE', 'FEAR PROTOCOL',
                  'DOT GHOST', 'COMMA 4', 'F34R NET', '404 FEAR', 'FEAR NOT FOUND',
                  'COMMA BOMB', 'DOT STORM', 'f34Rd0t.C0mM4'
              ].forEach(add);
              [
                  'GL1TCH', 'SIGNAL', 'NULL', 'VOID', 'SYSFAIL', 'OVERCLOCK', 'MATRIX',
                  'CODEX', 'NEON', 'PRISM', 'PHOSPHOR', 'SPECTRE', 'PHREAK', 'TERMINAL',
                  'PROTOCOL', 'ROOTKIT', 'FIREWALL', 'BLACK ICE', 'WIREFRAME',
                  'PIXELDUST', 'SYNTHWAVE', 'DARKNET', 'HARDLINE', 'UPLINK', 'DOWNLINK',
                  'REPLICANT', 'SINGULARITY', 'ENTROPY', 'ANOMALY', 'FLUX', 'CASCADE',
                  'RESONANCE', 'SPECTRUM', 'HOLOGRAPHIC', 'FRACTAL', 'CIPHER', '006',
                  'IMORTAL', 'RIVER', 'WIRED', 'DEFCON', 'INVERT', 'DIA', 'HUE',
                  'N3ON', 'Z3R0', 'V1RUS', 'C0DEX', 'GL1TCHWAVE'
              ].forEach(add);
              const A = ['GHOST', 'SHELL', 'DIGITAL', 'REBIRTH', 'FEAR', 'DOT', 'COMMA', 'MAJOR', 'NET', 'SOUL'];
              const B = ['SHELL', 'HACK', 'DIVE', 'COPY', 'CAMO', 'WAVE', 'KEY', 'CODE', 'BORN', 'COMMA'];
              for (let i = 0; i < A.length; i++) {
                  for (let j = 0; j < B.length; j++) {
                      if (A[i] !== B[j]) add(A[i] + ' ' + B[j]);
                  }
              }
              let h = GHOST_KEY_SEED;
              for (let i = 0; i < 24; i++) {
                  h = Math.imul(h ^ (h >>> 15), 0x6D2B79F5) >>> 0;
                  add('KEY-' + h.toString(16).toUpperCase().slice(0, 6));
                  add('0x' + ((h >>> 8) & 0xFFFF).toString(16).toUpperCase().padStart(4, '0'));
              }
              add('RIVER LYLE R.');
              add('ANNE FABER');
              add('IMORTALIMP');
              add('006');
              const seen = Object.create(null);
              const out = [];
              for (let i = 0; i < bag.length; i++) {
                  if (!seen[bag[i]]) { seen[bag[i]] = 1; out.push(bag[i]); }
              }
              return out;
          }
          const BURN_WORDS = buildGhostKeyCodex();
          const GHOST_KEY_PHRASES = GHOST_KEY_STANZAS.concat([
              GHOST_KEY, 'GHOSTS IN THE SHELLS', 'DIGITAL REBIRTHS',
              'FEAR.DOT.COMMA', 'THE NET IS VAST', 'AND INFINITE',
              'f34Rd0t.C0mM4', 'Gh0sTs 1n Th3 Sh3lLs'
          ]);

          const BURN_FONTS = ['BlackOut 2AM', 'Courier New', 'Lucida Console', 'Consolas', 'Impact', 'Arial Black', 'Georgia', 'Verdana', 'Trebuchet MS'];

          /* ------------------------------------------------------------------ *
           *  7. FX HARMONIC ENSEMBLE — complete effects-factory rewrite          *
           *  Every effect is now a VOICE in one ensemble:                        *
           *   • THE KEY — a rotating chord of hues (root / third / fifth). Every  *
           *     color in every effect is drawn from the live chord, and chords    *
           *     voice-lead (each tone eases independently) every 7-15s, so all    *
           *     effects transition their palettes INTO each other, together.      *
           *   • THE BREATH — one slow master LFO (~11s). All voices swell with    *
           *     it; nothing jumps, everything breathes.                          *
           *   • RESONANCE — each voice has a fixed phase offset in a master       *
           *     ~23s cycle: voices take turns swelling while their neighbours     *
           *     recede — amplitude is HANDED OFF, never collided.                 *
           *   • CROSSTALK — every voice registers presence each frame; a busy     *
           *     board gently ducks everyone (auto-mix), and a voice that spikes   *
           *     earns a short "answer" from its resonance neighbour —             *
           *     call & response.                                                 *
           *   • THE STAGE — one shared anchor drifting on a slow Lissajous       *
           *     orbit. Neon blooms, Flash pulses, the Gemini twins and Data       *
           *     bursts all key into the SAME geometry, so they visibly relate.    *
           *   • TONED DOWN BY DESIGN — soft blend modes, low ceilings, eased      *
           *     envelopes, coherent sinusoidal motion. No hard cuts anywhere.     *
           * ------------------------------------------------------------------ */

          /* --- timed wrapper: hands the render fn its 0..1 progress so bursts
                 can fade in and out instead of popping ---------------------- */
          function createTimedEffect(fn, duration) {
              if (duration === undefined) duration = Math.random() < 0.38 ? 900 + Math.random() * 1100 : 2800 + Math
                  .random() * 2600;
              /* R1.5: a busy source snaps the triggers tighter — bursts end
                 sooner on energetic footage so the board stays articulate */
              duration *= (1.15 - 0.28 * srcEnergyK() - 0.10 * srcMotionK());
              /* R2 SOFT-EYE: one-shots live longer when calm so they read as a
                 swell rather than a pop */
              if (window.GlitchEngine && GlitchEngine.SOFT_EYE) duration *= lerp(GlitchEngine.SOFT_EYE.pace.timedDurK, 1, softK());
              const start = performance.now();
              let self;
              self = function() {
                  const elapsed = performance.now() - start;
                  if (elapsed > duration) {
                      const i = activeEffects.indexOf(self);
                      if (i > -1) activeEffects.splice(i, 1);
                      return;
                  }
                  fn(Math.min(1, elapsed / duration));
              };
              return self;
          }

          /* ================= THE KEY — Ghost-Key home triad ==================
           *  Stanza hues are the home chord:
           *    Gh0sTs 1n Th3 Sh3lLs  → GHOST_KEY_HUES[0]  (ghost magenta)
           *    D1giTaL R3BiRtHs      → GHOST_KEY_HUES[1]  (rebirth violet)
           *    f34Rd0t.C0mM4         → GHOST_KEY_HUES[2]  (fear phosphor)
           *  Modes walk around that home; the root always resolves toward
           *  the Ghost-Key, blended with the source palette.
           * ================================================================== */
          const GHOST_KEY_STEPS = (function() {
              const r = GHOST_KEY_HUES[0];
              const rel = (h) => ((h - r) % 360 + 360) % 360;
              return [0, rel(GHOST_KEY_HUES[1]), rel(GHOST_KEY_HUES[2])];
          })();
          const FX_CHORDS = [
              { name: 'shell',      steps: GHOST_KEY_STEPS.slice() },
              { name: 'thermoptic', steps: [0, 140, 230] },
              { name: 'section9',   steps: [0, 90, 195] },
              { name: 'puppet',     steps: [0, 70, 175] },
              { name: 'laughing',   steps: [0, 155, 245] },
              { name: 'rebirth',    steps: [0, 115, 210] },
              { name: 'fearcomma',  steps: [0, (GHOST_KEY_FEAR % 90) + 40, 160 + (GHOST_KEY_SEED % 80)] }
          ];
          if (window.GlitchEngine && GlitchEngine.matrixChords) {
              GlitchEngine.matrixChords().forEach((ch) => {
                  if (!FX_CHORDS.some((c) => c.name === ch.name)) {
                      FX_CHORDS.push({ name: ch.name, steps: ch.steps.slice(), realm: ch.realm });
                  } else {
                      const hit = FX_CHORDS.find((c) => c.name === ch.name);
                      if (hit && !hit.realm) hit.realm = ch.realm;
                  }
              });
          }
          const FX_KEY = {
              root: GHOST_KEY_HUES[0],
              rootTarget: GHOST_KEY_HUES[0],
              tones: GHOST_KEY_HUES.slice(),
              toneTargets: GHOST_KEY_HUES.slice(),
              idx: 0,
              nextAt: 0,
              home: GHOST_KEY_HUES[0],
              ghostKey: GHOST_KEY
          };
          function stepFxKey(now, dt) {
              if (now >= FX_KEY.nextAt) {
                  FX_KEY.nextAt = now + 7000 + Math.random() * 8000;
                  /* walk the progression like a ii-V-I: step ±1, never a random
                     leap — the chord always resolves somewhere near home */
                  FX_KEY.idx = (FX_KEY.idx + (Math.random() < 0.62 ? 1 : -1) + FX_CHORDS.length) %
                      FX_CHORDS.length;
                  /* R1.5: the source's COLOR APPETITE voices the harmony — a
                     vivid video pushes the wide sparkling chords (lydian,
                     mixolydian, hungarian), a grey one sinks into the dark
                     minors (dorian, phrygian, aeolian) */
                  const ap = srcAppetite();
                  const realm = (window.GlitchEngine && GlitchEngine.realmFromBoard)
                      ? GlitchEngine.realmFromBoard({
                          ghost: getGhostMode(), vsync: getVsyncMode(),
                          warp: isAiWarpActive, bw: bwMasterLevel()
                      }) : 'mix';
                  if (window.GlitchEngine && GlitchEngine.pickMatrixChord && Math.random() < 0.62) {
                      const picked = GlitchEngine.pickMatrixChord(realm, Math.random);
                      const idx = FX_CHORDS.findIndex((c) => c.name === picked.name);
                      if (idx >= 0) FX_KEY.idx = idx;
                  } else if (Math.random() < 0.45) {
                      if (ap > 0.55) FX_KEY.idx = [1, 4, 5, 0][(Math.random() * 4) | 0]; /* thermoptic / laughing / rebirth / shell */
                      else if (ap < 0.30) FX_KEY.idx = [2, 3, 6][(Math.random() * 3) | 0]; /* section9 / puppet / fearcomma */
                  }
                  const chord = FX_CHORDS[FX_KEY.idx];
                  /* voice-leading: keep each tone's target nearest its current
                     value so the transition is a slide, not a jump */
                  for (let i = 0; i < 3; i++) {
                      let t = (FX_KEY.rootTarget + chord.steps[i]) % 360;
                      let d = t - FX_KEY.tones[i];
                      if (d > 180) t -= 360;
                      if (d < -180) t += 360;
                      FX_KEY.toneTargets[i] = t;
                  }
              }
              /* the root resolves toward the Ghost-Key home, blended with
                 the sampled video palette — the ensemble plays in the key
                 of the shell, colored by whatever is on screen */
              FX_KEY.rootTarget = fxLerpHue(GHOST_KEY_HUES[0], videoPalette.hue, 0.42);
              let dr = FX_KEY.rootTarget - FX_KEY.root;
              if (dr > 180) dr -= 360;
              if (dr < -180) dr += 360;
              const k = 1 - Math.exp(-0.35 * Math.max(0, dt));
              FX_KEY.root += dr * k;
              for (let i = 0; i < 3; i++) {
                  let d = FX_KEY.toneTargets[i] - FX_KEY.tones[i];
                  if (d > 180) d -= 360;
                  if (d < -180) d += 360;
                  FX_KEY.tones[i] = (FX_KEY.tones[i] + d * (1 - Math.exp(-0.9 * Math.max(0, dt))) + 720) % 360;
              }
              FX_KEY.root = (FX_KEY.root + 720) % 360;
          }
          /* chord tone i as an absolute hue, with optional small detune */
          function fxTone(i, detune) {
              const t = FX_KEY.tones[((i % 3) + 3) % 3] + (detune || 0);
              return ((t % 360) + 360) % 360;
          }
          function fxHsla(h, s, l, a) {
              return 'hsla(' + (h.toFixed(1)) + ',' + (Math.round(clamp(s, 0, 100))) + '%,' +
                  (Math.round(clamp(l, 0, 100))) + '%,' + (clamp01(a)).toFixed(3) + ')';
          }

          /* v11.3 hue lerp — shortest-arc interpolation between two hues */
          function fxLerpHue(a, b, t) {
              let d = ((b - a) % 360 + 540) % 360 - 180;
              return ((a + d * clamp01(t)) % 360 + 360) % 360;
          }

          /* v11.3 OLD-SOUL BLEND (006 lineage) — compact multi-alphabet glyph
             bank merged from the old ASCII scatter's sets (latin / katakana /
             cyrillic / greek / hebrew / symbols), used by the Chord Rain
             glyph-shimmer veil. */
          const FX_GLYPH_BANK = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
              '0123456789!@#$%^&*()_+-=[]{}<>?/\\|' +
              'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
              'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ' +
              'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ' +
              'אבגדהוזחטיכלמנסעפצקרשת' +
              '░▒▓█│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬▀▄▌▐■□◆◇▲▼●○★☆').split('');

          function getSelectedLocalVideo() {
              return document.body.classList.contains('local-video') && video && video.readyState >= 2 ? video : null;
          }

          function drawLocalVideoContained(ctx, source, x, y, width, height) {
              const sourceWidth = source.videoWidth || width;
              const sourceHeight = source.videoHeight || height;
              const scale = Math.min(width / sourceWidth, height / sourceHeight);
              const drawWidth = sourceWidth * scale;
              const drawHeight = sourceHeight * scale;
              ctx.drawImage(source, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
          }

          function chromaticEchoFactory(getStrength, persistent) {
              const render = () => {
                  const s = getStrength() * fxVoiceK('Chromatic Echo');
                  const source = getSelectedLocalVideo();
                  if (s < 0.001 || !source || !mainCanvas.width || !mainCanvas.height) return;
                  const w = mainCanvas.width, h = mainCanvas.height;
                  const offset = (5 + 24 * s) * Math.sin(customTime * 0.0007);
                  const turn = Math.round(fxKeyShift(115, 0.5));
                  gctx.save();
                  try {
                      gctx.globalCompositeOperation = 'screen';
                      gctx.globalAlpha = 0.12 * s;
                      gctx.filter = 'hue-rotate(' + (115 + turn) + 'deg) saturate(1.6)';
                      drawLocalVideoContained(gctx, source, offset, 0, w, h);
                      gctx.filter = 'hue-rotate(' + (285 + turn) + 'deg) saturate(1.6)';
                      drawLocalVideoContained(gctx, source, -offset, 0, w, h);
                  } finally {
                      gctx.restore();
                  }
              };
              return persistent ? render : createTimedEffect(render);
          }

          function temporalSlicesFactory(getStrength, persistent) {
              let frames = null, index = 0, lastCapture = -Infinity;
              const render = () => {
                  const s = getStrength() * fxVoiceK('Temporal Slices');
                  const source = getSelectedLocalVideo();
                  if (s < 0.001 || !source) { lastCapture = -Infinity; return; }
                  const w = mainCanvas.width, h = mainCanvas.height;
                  if (!w || !h) return;
                  const scale = Math.min(640 / w, 360 / h);
                  const fw = Math.max(1, Math.round(w * scale)), fh = Math.max(1, Math.round(h * scale));
                  if (!frames) frames = Array.from({ length: 6 }, () => document.createElement('canvas'));
                  if (frames[0].width !== fw || frames[0].height !== fh) {
                      for (const frame of frames) { frame.width = fw; frame.height = fh; }
                      index = 0;
                      lastCapture = -Infinity;
                  }
                  if (customTime - lastCapture > 160) {
                      const frame = frames[index];
                      const ctx = frame.getContext('2d');
                      if (!ctx) return;
                      ctx.clearRect(0, 0, fw, fh);
                      drawLocalVideoContained(ctx, source, 0, 0, fw, fh);
                      index = (index + 1) % frames.length;
                      lastCapture = customTime;
                  }
                  const slices = 3 + Math.floor(s * 7), sliceHeight = h / slices;
                  gctx.save();
                  try {
                      gctx.globalAlpha = 0.25 + 0.42 * s;
                      for (let i = 0; i < slices; i++) {
                          const frame = frames[(index + i) % frames.length];
                          const shift = Math.sin(customTime * 0.0015 + i * 2) * s * 28;
                          gctx.drawImage(frame, 0, i * fh / slices, fw, fh / slices,
                              shift, i * sliceHeight, w, sliceHeight + 1);
                      }
                  } finally {
                      gctx.restore();
                  }
              };
              return persistent ? render : createTimedEffect(render);
          }

          function signalTearFactory(getStrength, persistent) {
              const bands = Array.from({ length: 18 }, () => ({
                  seed: Math.random(), y: Math.random(), speed: 0.3 + Math.random() * 0.9,
                  width: 0.08 + Math.random() * 0.5
              }));
              const render = () => {
                  const s = getStrength() * fxVoiceK('Signal Tear');
                  if (s < 0.001) return;
                  const w = mainCanvas.width, h = mainCanvas.height, t = customTime / 1000;
                  if (!w || !h) return;
                  const turn = fxKeyShift(328, 0.5);
                  const tearA = fxHsla(fxTurn(328, turn), 100, 59, 1), tearB = fxHsla(fxTurn(178, turn), 88, 61, 1);
                  const edgeA = fxHsla(fxTurn(187, turn), 100, 81, 1), edgeB = fxHsla(fxTurn(324, turn), 100, 74, 1);
                  gctx.save();
                  try {
                      gctx.globalCompositeOperation = 'screen';
                      bands.forEach((band, i) => {
                          if (i >= 3 + Math.floor(s * 15)) return;
                          const y = ((band.y * h + t * 12 * band.speed) % h);
                          const x = (Math.sin(t * 0.7 + band.seed * 20) * 0.5 + 0.5) * w * 0.65;
                          const length = w * band.width * (0.55 + s * 0.8);
                          const height = 1 + (i % 4) * s * 4;
                          gctx.globalAlpha = s * (0.23 + 0.18 * Math.sin(t * 2 + band.seed * 8) ** 2);
                          gctx.fillStyle = i % 2 ? tearA : tearB;
                          gctx.fillRect(x, y, length, height);
                          gctx.fillStyle = i % 2 ? edgeA : edgeB;
                          gctx.fillRect(x + 8 * s, y + height + 1, length * 0.7, 1);
                          if (i % 3 === 0) {
                              gctx.globalAlpha = 0.15 * s;
                              gctx.fillStyle = '#ffffff';
                              gctx.fillRect(0, y + 2, w, height * 2);
                          }
                      });
                  } finally {
                      gctx.restore();
                  }
              };
              return persistent ? render : createTimedEffect(render);
          }

          function cyberRainFactory(getStrength, persistent) {
              const render = () => {
                  const s = getStrength() * fxVoiceK('Cyber Rain');
                  if (s < 0.001 || !window.SignalGlyphs) return;
                  const w = mainCanvas.width, h = mainCanvas.height, t = customTime / 1000;
                  const spacing = 35, cols = Math.min(70, Math.ceil(w / spacing));
                  const turn = fxKeyShift(151, 0.45);
                  const headHue = fxTurn(145, turn), trailHue = fxTurn(151, turn);
                  gctx.save();
                  try {
                      gctx.font = 'bold 14px monospace';
                      gctx.textAlign = 'center';
                      for (let i = 0; i < cols; i++) {
                          const seed = (i * 37 % 101) / 101;
                          if (seed > 0.17 + s * 0.68) continue;
                          const head = (t * (38 + seed * 60) + seed * h * 2) % (h + 250) - 100;
                          const trail = 3 + Math.floor(s * 8);
                          for (let j = 0; j < trail; j++) {
                              const y = head - j * 18;
                              if (y < 0 || y > h) continue;
                              const glyph = voiceGlyph('Cyber Rain');
                              gctx.fillStyle = j === 0 ?
                                  fxHsla(headHue, 100, 94, 0.7 * s) :
                                  fxHsla(trailHue, 100, 61, s * 0.65 * (1 - j / trail));
                              gctx.fillText(glyph, i * spacing + 15, y);
                          }
                      }
                  } finally {
                      gctx.restore();
                  }
              };
              return persistent ? render : createTimedEffect(render);
          }

          function prismRiftFactory(getStrength, persistent) {
              const render = () => {
                  const s = getStrength() * fxVoiceK('Prism Rift');
                  if (s < 0.001) return;
                  const w = mainCanvas.width, h = mainCanvas.height, t = customTime / 1000;
                  const turn = fxKeyShift(190, 0.5);
                  gctx.save();
                  try {
                      gctx.globalCompositeOperation = 'screen';
                      for (let i = 0; i < 4; i++) {
                          const x = w * (0.15 + i * 0.23) + Math.sin(t * 0.35 + i * 2) * w * 0.15;
                          const spread = w * (0.08 + s * 0.13);
                          const gradient = gctx.createLinearGradient(x - spread, 0, x + spread, 0);
                          const hue = fxTurn(190 + i * 70 + t * 7, turn);
                          gradient.addColorStop(0, 'transparent');
                          gradient.addColorStop(0.48, `hsla(${hue},100%,60%,${s * 0.20})`);
                          gradient.addColorStop(0.52, `hsla(${(hue + 100) % 360},100%,75%,${s * 0.38})`);
                          gradient.addColorStop(1, 'transparent');
                          gctx.fillStyle = gradient;
                          gctx.beginPath();
                          gctx.moveTo(x - spread, -10);
                          gctx.lineTo(x + spread, -10);
                          gctx.lineTo(x + spread + w * 0.13, h + 10);
                          gctx.lineTo(x - spread + w * 0.13, h + 10);
                          gctx.closePath();
                          gctx.fill();
                      }
                  } finally {
                      gctx.restore();
                  }
              };
              return persistent ? render : createTimedEffect(render);
          }

          function orbitHudFactory(getStrength, persistent) {
              const render = () => {
                  const s = getStrength() * fxVoiceK('Orbit HUD');
                  if (s < 0.001) return;
                  const w = mainCanvas.width, h = mainCanvas.height, t = customTime / 1000;
                  const cx = w * 0.64, cy = h * 0.5;
                  const radius = Math.min(w, h) * (0.15 + 0.04 * Math.sin(t * 0.45));
                  const turn = fxKeyShift(162, 0.5);
                  gctx.save();
                  try {
                      gctx.translate(cx, cy);
                      gctx.strokeStyle = fxHsla(fxTurn(162, turn), 100, 74, 0.7 * s);
                      gctx.fillStyle = fxHsla(fxTurn(152, turn), 100, 87, 0.8 * s);
                      gctx.lineWidth = 1.2;
                      gctx.shadowColor = fxHsla(fxTurn(160, turn), 100, 66, 1);
                      gctx.shadowBlur = 7 * s;
                      for (let ring = 0; ring < 3; ring++) {
                          gctx.beginPath();
                          gctx.setLineDash(ring === 1 ? [5, 12] : [2, 7]);
                          const phase = t * (ring % 2 ? -0.12 : 0.1);
                          gctx.arc(0, 0, radius + ring * 20, phase, phase + Math.PI * (1.3 + ring * 0.15));
                          gctx.stroke();
                      }
                      gctx.setLineDash([]);
                      for (let i = 0; i < 24; i++) {
                          const angle = i * Math.PI / 12 + t * 0.06, r = radius + 60;
                          gctx.beginPath();
                          gctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                          gctx.lineTo(Math.cos(angle) * (r + (i % 3 === 0 ? 14 : 5)),
                              Math.sin(angle) * (r + (i % 3 === 0 ? 14 : 5)));
                          gctx.stroke();
                      }
                      gctx.font = '10px monospace';
                      gctx.fillText('SIGNAL / ' + Math.floor((t * 17) % 999).toString().padStart(3, '0'), radius + 75, -12);
                      gctx.fillText('FREQ : ' + (0.32 + 0.15 * Math.sin(t)).toFixed(2), radius + 75, 5);
                      gctx.beginPath();
                      gctx.moveTo(-12, 0); gctx.lineTo(12, 0);
                      gctx.moveTo(0, -12); gctx.lineTo(0, 12);
                      gctx.stroke();
                  } finally {
                      gctx.restore();
                  }
              };
              return persistent ? render : createTimedEffect(render);
          }

          function rollingScanFactory(getStrength, persistent) {
              const render = () => {
                  const s = getStrength() * fxVoiceK('Rolling Scan');
                  if (s < 0.001) return;
                  const w = mainCanvas.width, h = mainCanvas.height, t = customTime / 1000;
                  const scanHue = fxTurn(153, fxKeyShift(153, 0.5));
                  gctx.save();
                  try {
                      gctx.fillStyle = `rgba(0,0,0,${0.52 * s})`;
                      const gap = 4 + Math.round(s * 2);
                      for (let y = (t * 8) % gap; y < h; y += gap)
                          gctx.fillRect(0, y, w, Math.max(1, gap * 0.35));
                      const y = (t * 24) % (h + 120) - 60;
                      const gradient = gctx.createLinearGradient(0, y - 35, 0, y + 35);
                      gradient.addColorStop(0, 'transparent');
                      gradient.addColorStop(0.5, fxHsla(scanHue, 100, 81, s * 0.14));
                      gradient.addColorStop(1, 'transparent');
                      gctx.fillStyle = gradient;
                      gctx.fillRect(0, y - 35, w, 70);
                  } finally {
                      gctx.restore();
                  }
              };
              return persistent ? render : createTimedEffect(render);
          }

          function tapeGrainFactory(getStrength, persistent) {
              const render = () => {
                  const s = getStrength() * fxVoiceK('Tape Grain');
                  if (s < 0.001) return;
                  const w = mainCanvas.width, h = mainCanvas.height, t = customTime / 1000;
                  gctx.save();
                  try {
                      const grains = Math.floor(24 + s * 110);
                      for (let i = 0; i < grains; i++) {
                          gctx.fillStyle = `rgba(225,246,233,${Math.random() * s * 0.45})`;
                          gctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * s * 3, 1);
                      }
                      const track = (t * 22) % (h + 90) - 45;
                      const gradient = gctx.createLinearGradient(0, track - 20, 0, track + 20);
                      gradient.addColorStop(0, 'transparent');
                      gradient.addColorStop(0.5, `rgba(230,246,255,${s * 0.22})`);
                      gradient.addColorStop(1, 'transparent');
                      gctx.fillStyle = gradient;
                      gctx.fillRect(0, track - 20, w, 40);
                  } finally {
                      gctx.restore();
                  }
              };
              return persistent ? render : createTimedEffect(render);
          }

          function trackingTearFactory(getStrength, persistent) {
              const render = () => {
                  const s = getStrength() * fxVoiceK('Tracking Tear');
                  if (s < 0.001) return;
                  const w = mainCanvas.width, h = mainCanvas.height, t = customTime / 1000;
                  const turn = fxKeyShift(343, 0.5);
                  const tearA = fxHsla(fxTurn(343, turn), 100, 59, s * 0.26);
                  const tearB = fxHsla(fxTurn(189, turn), 100, 60, s * 0.26);
                  gctx.save();
                  try {
                      gctx.globalCompositeOperation = 'screen';
                      for (let i = 0; i < 4 + Math.floor(s * 9); i++) {
                          const y = ((i * 97 + t * (11 + i)) % h);
                          const x = (0.5 + 0.5 * Math.sin(i * 22 + t * 0.7)) * w * 0.75;
                          gctx.fillStyle = i % 2 ? tearA : tearB;
                          gctx.fillRect(x, y, w * (0.06 + 0.2 * s), 1 + i % 3);
                          gctx.fillStyle = `rgba(255,255,255,${s * 0.18})`;
                          gctx.fillRect(0, y + 3, w, 1);
                      }
                  } finally {
                      gctx.restore();
                  }
              };
              return persistent ? render : createTimedEffect(render);
          }

          /* Indices follow R3_FACTORY_DEFS in r3-factories.js. Flash and Strobe are
             not listed: the player's own Flash and Strobe factories drive them. */
          const R3_FACTORY_INDEX = Object.freeze({
              'Neon Grad': 0, 'Scanlines': 1, 'HSL Rainbow': 3, 'ASCII': 4, 'Font Burn': 5,
              'Gemini Bomb': 7, 'Tech Artist': 8, 'Data Bands': 9, 'VHS Glitch': 10,
              'Data Bomb': 11, 'Ink Glyphs': 12, 'Matrix ASCII': 13, 'Matrix Chord': 14
          });
          let r3Engine = null, r3Runners = null, r3System = null, r3ResOffMap = null;
          const r3Errors = new Set();
          /* R3 voices keep the host's resonance seats ('R3 X' offsets), so each
             twin answers its native voice instead of firing in unison with it. */
          function r3ResOff() {
              if (r3ResOffMap) return r3ResOffMap;
              const map = {};
              for (const key in FX_RESOFF) {
                  if (key.indexOf('R3 ') === 0) map[key.slice(3)] = FX_RESOFF[key];
              }
              r3ResOffMap = Object.freeze(map);
              return r3ResOffMap;
          }
          function getR3Engine() {
              if (r3Engine) return r3Engine;
              if (!window.GC3FactoryBank || !window.R3GhostVsync)
                  throw new Error('Revision 3 engine assets are unavailable.');
              const ghostCanvas = document.createElement('canvas');
              const levels = new Proxy(Object.create(null), {
                  get(_target, key) {
                      if (typeof key !== 'string') return 0;
                      if (key.endsWith(' GC#(3)')) return effectAlphas['R3 ' + key.slice(0, -7)] || 0;
                      return effectAlphas[key] || 0;
                  }
              });
              r3Engine = {
                  canvas: mainCanvas, gctx, ghostCanvas, ghostCtx: ghostCanvas.getContext('2d'),
                  effectAlphas: levels, masterOpacity: 1, boardEnergy: 0.65, motionScale: 0.8,
                  blendSoftness: 0.5, aiWarpMode: 'aurora', aiWarpActive: false, aiWarpHue: 0,
                  softEyeK: 1, audioDrive: { beat: 0, drive: 0.5 },
                  videoPalette: { hue: 205, sat: 65, brightness: 0.48, energy: 0.5, motion: 0.1, darkness: 0.52 },
                  ghostModes: ['OFF', 'DIA', 'SPECTRUM', 'CRT', 'PLASMA', 'LED'], ghostModeIndex: 0, ghostLevel: 0,
                  vsyncModes: ['OFF', 'ON', 'GHOST_OFF', 'FULL'], vsyncModeIndex: 0, vsyncLevel: 0,
                  isAutoGlitch: false, isContinualRandom: false, isTimedAuto: false, isAutomatedMasters: false,
                  softEyeActive: false, vsyncLocked: false, autoGlitchPower: 0.75, aiWarpHuePhase: 0,
                  liveAlpha(name) {
                      const base = name.endsWith(' GC#(3)') ? 'R3 ' + name.slice(0, -7) : name;
                      /* R3 voices yield to the whole board's crowd, not just each other */
                      const duck = FX_ENS.duck[base] != null ? FX_ENS.duck[base] : 1;
                      return effectLiveStrength(base) * (0.4 + 0.6 * duck);
                  },
                  sizeFor() { return 1; }, depthFor() { return 1; }, triggerButtonEffect() {},
                  paintGlyphScatter: paintScatterField
              };
              r3Runners = window.GC3FactoryBank.createRunners(r3Engine);
              r3System = window.R3GhostVsync.create(r3Engine);
              return r3Engine;
          }

          function syncR3Engine(now) {
              const engine = getR3Engine();
              engine.gctx = gctx;
              engine.masterOpacity = 1;
              engine.boardEnergy = clamp01(masterControls.boardEnergy);
              engine.motionScale = clamp01(masterControls.motionScale);
              engine.blendSoftness = clamp01(masterControls.blendSoftness);
              engine.aiWarpActive = isAiWarpActive;
              engine.aiWarpHue = videoPalette.hue;
              engine.softEyeK = softK();
              engine.audioDrive = { beat: clamp01(SOFT.beat), drive: clamp01(videoPalette.energy) };
              engine.isAutoGlitch = isAutoGlitching;
              engine.isContinualRandom = isContinuallyRandomizing;
              engine.isAutomatedMasters = isAutomatedMasters;
              engine.softEyeActive = !!SOFT.ok;
              engine.autoGlitchPower = clamp01(masterControls.autoGlitchPower);
              const confluence = fxConfluenceHsl().h;
              engine.videoPalette = {
                  hue: fxLerpHue(videoPalette.hue, confluence, 0.5),
                  sat: videoPalette.sat,
                  brightness: clamp01(videoPalette.light / 100),
                  energy: clamp01(videoPalette.energy),
                  motion: clamp01(videoPalette.motion),
                  darkness: clamp01(videoPalette.darkness)
              };
              /* One heartbeat, one stage, one chord: the R3 bank plays inside the
                 host ensemble instead of running its own key and breath. */
              engine.ensemble = {
                  breath: FX_ENS.breath,
                  breathPhase: FX_ENS.breathPhase,
                  resPhase: FX_ENS.resPhase,
                  stage: { x: FX_ENS.stage.x, y: FX_ENS.stage.y, r: FX_ENS.stage.r },
                  root: FX_KEY.root,
                  tones: FX_KEY.tones.slice(),
                  idx: FX_KEY.idx,
                  resOff: r3ResOff()
              };
              engine.ghostModeIndex = effectLiveStrength('R3 Ghost Spectrum') > 0.001 ? 2 : 0;
              engine.ghostLevel = clamp01(effectLiveStrength('R3 Ghost Spectrum'));
              engine.vsyncModeIndex = effectLiveStrength('R3 V-Sync') > 0.001 ? 3 : 0;
              engine.vsyncLevel = clamp01(effectLiveStrength('R3 V-Sync'));
              return engine;
          }

          function r3Factory(name) {
              return function(getStrength, persistent) {
                  const render = () => {
                      if (getStrength() <= 0.001) return;
                      try {
                          syncR3Engine(customTime);
                          const runner = r3Runners[R3_FACTORY_INDEX[name]];
                          if (typeof runner !== 'function') throw new Error('Missing Revision 3 factory: ' + name);
                          runner(gctx, customTime);
                      } catch (error) {
                          if (!r3Errors.has(name)) {
                              r3Errors.add(name);
                              console.warn('Revision 3 effect unavailable:', name, error);
                          }
                      }
                  };
                  return persistent ? render : createTimedEffect(render);
              };
          }

          function r3SystemFactory(kind) {
              const name = kind === 'ghost' ? 'R3 Ghost Spectrum' : 'R3 V-Sync';
              return function(getStrength, persistent) {
                  const render = () => {
                      const value = getStrength();
                      if (value <= 0.001) return;
                      try {
                          const engine = syncR3Engine(customTime);
                          if (kind === 'ghost') r3System.setGhostMode('SPECTRUM', value);
                          else r3System.setVsyncMode('FULL', value);
                          const snapshot = r3System.captureSnapshot();
                          if (kind === 'ghost') r3System.renderGhost(customTime, snapshot);
                          else r3System.renderVsync(customTime, snapshot);
                      } catch (error) {
                          if (!r3Errors.has(name)) {
                              r3Errors.add(name);
                              console.warn('Revision 3 system effect unavailable:', name, error);
                          }
                      }
                  };
                  return persistent ? render : createTimedEffect(render);
              };
          }

          /* ================= THE ENSEMBLE — breath / resonance / stage ====== */
          const FX_VOICE_NAMES = ['Neon Grad', 'Scanlines', 'Flash', 'HSL Rainbow', 'ASCII',
              'Font Burn', 'Strobe', 'Gemini Bomb', 'Tech Artist', 'Data Bands', 'VHS Glitch',
              'Data Bomb', 'Ink Glyphs', 'Matrix ASCII', 'Matrix Chord',
              'Chromatic Echo', 'Temporal Slices', 'Signal Tear', 'Cyber Rain', 'Prism Rift',
              'Orbit HUD', 'Rolling Scan', 'Tape Grain', 'Tracking Tear',
              'R3 Neon Grad', 'R3 Scanlines', 'R3 Gemini Bomb', 'R3 Tech Artist',
              'R3 Data Bomb', 'R3 Ink Glyphs', 'R3 Matrix ASCII', 'R3 Matrix Chord',
              'R3 HSL Rainbow', 'R3 ASCII', 'R3 Font Burn', 'R3 Data Bands', 'R3 VHS Glitch',
              'R3 Ghost Spectrum', 'R3 V-Sync'
          ];
          /* fixed resonance offsets — neighbours in this list answer each other */
          const FX_RESOFF = {
              'Neon Grad': 0.00, 'Strobe': 0.09, 'Scanlines': 0.17, 'Data Bands': 0.26,
              'Flash': 0.34, 'Font Burn': 0.42, 'Tech Artist': 0.50, 'HSL Rainbow': 0.59,
              'Gemini Bomb': 0.67, 'ASCII': 0.76, 'VHS Glitch': 0.84, 'Data Bomb': 0.92,
              'Ink Glyphs': 0.96, 'Matrix ASCII': 0.80, 'Matrix Chord': 0.88,
              'Chromatic Echo': 0.045, 'Temporal Slices': 0.11, 'Signal Tear': 0.20,
              'Cyber Rain': 0.30, 'Prism Rift': 0.40, 'Orbit HUD': 0.52,
              'Rolling Scan': 0.61, 'Tape Grain': 0.70, 'Tracking Tear': 0.79,
              'R3 Neon Grad': 0.50, 'R3 Scanlines': 0.67, 'R3 Gemini Bomb': 0.17,
              'R3 Tech Artist': 0.00, 'R3 Data Bomb': 0.42, 'R3 Ink Glyphs': 0.46,
              'R3 Matrix ASCII': 0.30, 'R3 Matrix Chord': 0.38,
              'R3 HSL Rainbow': 0.09, 'R3 ASCII': 0.26, 'R3 Font Burn': 0.92,
              'R3 Data Bands': 0.76, 'R3 VHS Glitch': 0.34,
              'R3 Ghost Spectrum': 0.58, 'R3 V-Sync': 0.83
          };
          const FX_ENS = {
              breath: 0.5,          // slow master LFO 0..1 (~11s at rest)
              breathPhase: 0,       // R1.8: accumulated phase — the tempo can bend
              resPhase: 0,          // master resonance cycle 0..1 (~23s)
              stage: { x: 0.5, y: 0.5, r: 0.30 }, // shared anchor (normalized)
              presence: {},         // name -> smoothed live strength
              prevPresence: {},     // for attack detection (call & response)
              duck: {},             // name -> auto-mix multiplier
              answer: { name: null, until: 0 },   // the voice currently "answering"
              crowd: 0
          };
          /* presence is also tracked for the two filter-path effects (B&W Invert,
             Hue/Color Cycle) so canvas voices can KEY into them — but they are not
             canvas voices: they never gate, duck, or answer. */
          const FX_PRESENCE_NAMES = FX_VOICE_NAMES.concat(['B&W Invert', 'Hue/Color Cycle',
              'R3 B&W Invert', 'R3 Hue/Color Cycle']);
          function stepFxEnsemble(now, dt) {
              const t = customTime * 0.001;
              /* R1.8: the source sets the board's HEARTBEAT — the master
                 breath LFO's tempo rides energy (accumulated phase, so the
                 tempo change never jumps the curve): calm video breathes
                 ~15s, lively video ~8.7s */
              FX_ENS.breathPhase = (FX_ENS.breathPhase + (dt / 11.3) * R16.breathRate()) % 1;
              FX_ENS.breath = 0.5 + 0.5 * Math.sin(FX_ENS.breathPhase * Math.PI * 2 + 0.7);
              /* R1.5: the source sets the ensemble's pulse — an energetic,
                 moving video speeds the resonance hand-offs between voices */
              const resRate = 0.72 + 0.55 * srcEnergyK() + 0.28 * srcMotionK();
              FX_ENS.resPhase = (FX_ENS.resPhase + (dt / 23.5) * resRate) % 1;
              /* the stage drifts on a slow Lissajous figure — every keyed voice
                 (bloom / flash / twins / burst) follows the same anchor */
              /* R1.8: busy video wanders the stage wider, calm video stays
                 home — amplitude-only, so the anchor never jumps */
              const stageK = R16.stageK();
              FX_ENS.stage.x = 0.5 + 0.30 * stageK * Math.sin(t * 0.21 + 1.1);
              FX_ENS.stage.y = 0.5 + 0.24 * stageK * Math.sin(t * 0.13 + 2.6);
              FX_ENS.stage.r = 0.24 + 0.13 * FX_ENS.breath + 0.09 * beat;

              /* presence: smoothed live strength of each voice (timed triggers,
                 auto glitch and continual randomization all land here) */
              let sum = 0;
              let caller = null, callerRise = 0;
              for (let i = 0; i < FX_PRESENCE_NAMES.length; i++) {
                  const name = FX_PRESENCE_NAMES[i];
                  let live = 0;
                  try { live = clamp01(typeof effectLiveStrength === 'function' ?
                      effectLiveStrength(name) : (smoothedStrength[name] || 0)); } catch (e) { live = 0; }
                  const prev = FX_ENS.presence[name] || 0;
                  const next = easeExp(prev, live, Math.max(0, dt), 2.4);
                  FX_ENS.presence[name] = next;
                  const isVoice = FX_RESOFF[name] !== undefined; // canvas voice only
                  if (isVoice) {
                      const rise = next - (FX_ENS.prevPresence[name] || 0);
                      if (rise > callerRise && rise > 0.05) { callerRise = rise; caller = name; }
                      sum += next;
                  }
                  FX_ENS.prevPresence[name] = next;
              }
              FX_ENS.crowd = clamp01(sum / 4);
              /* auto-mix: as the board fills, everyone yields a little — and the
                 caller's resonance neighbour gets a short answer boost */
              if (caller && now > (FX_ENS.answer.until || 0)) {
                  FX_ENS.answer.name = fxNextVoice(caller);
                  FX_ENS.answer.until = now + 1500;
              }
              const answering = (FX_ENS.answer.name && now < FX_ENS.answer.until) ? FX_ENS.answer.name : null;
              for (let i = 0; i < FX_VOICE_NAMES.length; i++) {
                  const name = FX_VOICE_NAMES[i];
                  const others = sum - (FX_ENS.presence[name] || 0);
                  const busy = Math.max(0, others - 1.15) * 0.24;
                  let mix = 1 - busy;
                  if (name === answering) mix *= 1.14; // the answer swells slightly
                  FX_ENS.duck[name] = clamp(mix, 0.55, 1);
              }
          }
          /* resonance neighbour = the next offset in the circle of fifths of phase */
          function fxNextVoice(name) {
              const off = FX_RESOFF[name];
              if (off === undefined) return null;
              let best = null, bestD = 9;
              for (const k in FX_RESOFF) {
                  if (k === name) continue;
                  let d = FX_RESOFF[k] - off;
                  if (d <= 0) d += 1;
                  if (d < bestD) { bestD = d; best = k; }
              }
              return best;
          }
          /* resonance gate 0.30..1 — every voice takes its turn */
          function fxGate(name) {
              const off = FX_RESOFF[name];
              if (off === undefined) return 1;
              /* R1.5: a lively source raises the gate floor — on energetic
                 video the resonance gates never fully close, so every voice
                 keeps at least a glow while it waits its turn */
              const lo = 0.30 + 0.14 * srcEnergyK();
              return lo + (1 - lo) * (0.5 + 0.5 * Math.sin(Math.PI * 2 * (FX_ENS.resPhase + off)));
          }
          /* Projector / AI-warp voices paint their raw slider strength; this folds
             them into the same ensemble (resonance turn, crowd duck, source pulse,
             soft-eye calm) that the native voices already follow. */
          function fxVoiceK(name) {
              const gate = fxGate(name);
              const duck = FX_ENS.duck[name] != null ? FX_ENS.duck[name] : 1;
              const srcK = 0.9 + 0.25 * srcEnergyK();
              const softP = (window.GlitchEngine && GlitchEngine.softPaintK) ? GlitchEngine.softPaintK(name, softK()) : 1;
              return clamp((0.6 + 0.4 * gate) * duck * srcK * softP, 0, 1.2);
          }
          /* Degrees to add to a voice's home hue so it leans toward the shared
             confluence key; every colour in a voice gets the same turn, so its
             internal colour pairs keep their relationship. */
          function fxKeyShift(homeHue, amt) {
              const key = fxConfluenceHsl().h;
              const d = ((key - homeHue) % 360 + 540) % 360 - 180;
              return d * clamp01(amt);
          }
          function fxTurn(h, shift) {
              return (((h + (shift || 0)) % 360) + 360) % 360;
          }
          /* soft bell envelope for timed bursts */
          const envArc = (p) => Math.sin(clamp01(p) * Math.PI);
          const smooth01 = (t) => (t <= 0) ? 0 : (t >= 1) ? 1 : t * t * (3 - 2 * t);

          /* =============== FACTORY 1 — NEON GRAD · "AURORA BLOOM" ==========
             The lead voice. Two soft blooms orbit the shared stage; their hues
             are chord tones, so they re-voice with every chord change. */
          let auroraPhase = 0, auroraAngle = 22, auroraLastT = null;   /* R2: shared aurora flow */
          function glitchNeonGradientOverlayFactory(getStrength, isPersistent) {
              const paintBloom = (x, y, r, hue, a) => {
                  if (a <= 0.004 || r < 2) return;
                  const g = gctx.createRadialGradient(x, y, 0, x, y, r);
                  g.addColorStop(0.00, fxHsla(hue, 62, 78, Math.min(0.55, a * 0.50)));
                  g.addColorStop(0.22, fxHsla(hue, 58, 66, a * 0.26));
                  g.addColorStop(0.55, fxHsla(hue, 52, 56, a * 0.12));
                  g.addColorStop(1.00, fxHsla(hue, 50, 50, 0));
                  gctx.fillStyle = g;
                  gctx.fillRect(x - r, y - r, r * 2, r * 2);
              };
              const renderFn = () => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const t = customTime * 0.001;
                  const st = FX_ENS.stage;
                  /* the two blooms slowly orbit each other on the shared stage */
                  const orbit = 0.05 + 0.04 * FX_ENS.breath;
                  const x1 = (st.x + Math.cos(t * 0.11) * orbit) * w;
                  const y1 = (st.y + Math.sin(t * 0.17 + 1.3) * orbit) * h;
                  const x2 = (st.x - Math.cos(t * 0.13 + 0.7) * orbit) * w;
                  const y2 = (st.y - Math.sin(t * 0.19) * orbit) * h;
                  const r = Math.min(w, h) * (st.r + 0.05 * s) *
                      (0.90 + 0.20 * srcDarkK()); /* R1.6: bloom radius rides darkness */
                  const a = effectPaintAlpha('Neon Grad', s, (comboProfile.glowMult || 1) * 0.9);
                  const nf = (window.GlitchEngine && GlitchEngine.neonFilterMap)
                      ? GlitchEngine.neonFilterMap(s, boardFilterCtx())
                      : { sat: 62, veil: 0.12, light: 66, confMix: 0.3, blend: 'screen', realm: 'mix' };
                  const conf = fxConfluenceHue(0);
                  const bwN = bwInvertMap(bwMasterLevel());
                  const mix = nf.confMix || 0.3;
                  /* R2 NEON AURORA v2 — the better Neon Grad. Flowing light
                     RIBBONS (2 calm / 3 wild) cross the frame on a slowly
                     turning angle; crests bloom. Calm = a slow tide; inside a
                     crescendo the flow is rapid (×3.4) and beat-lifted. */
                  const au = (GlitchEngine.neonAuroraMap) ? GlitchEngine.neonAuroraMap(s, boardFilterCtx(), softK(), SOFT.beat) : null;
                  if (au) {
                      const dtA = auroraLastT == null ? 0.016 : Math.min(0.05, (customTime - auroraLastT) / 1000);
                      auroraLastT = customTime;
                      auroraPhase = (auroraPhase + au.flow * dtA) % 360;
                      auroraAngle = (auroraAngle + au.angleRate * dtA) % 360;
                  }
                  const h0 = (fxLerpHue(fxTone(0), conf, mix) + bwN.hueDeg * 0.20 +
                      (bwN.invert > 0.004 ? 180 * (bwN.invert / 0.75) * 0.25 : 0) + 360) % 360;
                  const h1 = (fxLerpHue(fxTone(1), conf, mix * 0.7) + bwN.hueDeg * 0.12 + 360) % 360;
                  const h2 = (fxLerpHue(fxTone(2), conf, mix) + bwN.hueDeg * 0.20 + 360) % 360;
                  gctx.save();
                  gctx.globalCompositeOperation = nf.blend || 'screen';
                  if ('filter' in gctx) {
                      const hslS = (typeof fxConfluenceSat === 'function') ? fxConfluenceSat() : (nf.sat || 62);
                      gctx.filter = 'saturate(' + (0.85 + ((nf.sat || 62) * 0.55 + hslS * 0.45) / 200).toFixed(3) + ')';
                  }
                  if (au) {
                      /* ribbons: a full-frame linear gradient along the turning
                         angle, hue-walked by the aurora phase, alpha-shaped as
                         soft bands (transparent → crest → transparent) */
                      const ang = auroraAngle * Math.PI / 180;
                      const cx = w / 2, cy = h / 2, L = Math.max(w, h) * 0.75;
                      const gx0 = cx - Math.cos(ang) * L, gy0 = cy - Math.sin(ang) * L;
                      const gx1 = cx + Math.cos(ang) * L, gy1 = cy + Math.sin(ang) * L;
                      const rib = gctx.createLinearGradient(gx0, gy0, gx1, gy1);
                      const n = au.ribbons;
                      const ribA = Math.min(0.34, a * 0.62) * (0.7 + 0.3 * FX_ENS.breath);
                      const stops = 24;
                      for (let i = 0; i <= stops; i++) {
                          const u = i / stops;
                          /* n travelling crests; phase walks them along the axis */
                          const ph = u * n * Math.PI * 2 - auroraPhase * Math.PI / 180;
                          const crest = Math.pow(0.5 + 0.5 * Math.sin(ph), 1.0 / Math.max(0.35, au.width * 2.2));
                          const hueU = (h0 + u * au.hueSpread * n + auroraPhase * 0.5 + 360) % 360;
                          rib.addColorStop(u, fxHsla(hueU, au.sat, au.light, ribA * crest));
                      }
                      gctx.fillStyle = rib;
                      gctx.fillRect(0, 0, w, h);
                      /* crest blooms ride the ribbons */
                      gctx.globalCompositeOperation = au.glowBlend || 'lighter';
                      paintBloom(x1, y1, r * 0.9, (h0 + auroraPhase * 0.5) % 360, a * au.bloomA * 0.8);
                      paintBloom(x2, y2, r * 0.7, (h2 + auroraPhase * 0.5) % 360, a * au.bloomA * 0.6);
                      gctx.globalCompositeOperation = nf.blend || 'screen';
                  } else {
                      paintBloom(x1, y1, r, h0, a);
                      paintBloom(x2, y2, r * 0.78, h2, a * 0.78);
                  }
                  /* faint breathing ring — the bloom's halo edge */
                  gctx.globalAlpha = Math.min(0.10, a * 0.16);
                  gctx.strokeStyle = fxHsla(h1, 55, 72, 1);
                  gctx.lineWidth = 1.5;
                  gctx.beginPath();
                  gctx.arc((st.x * w), (st.y * h), r * (0.72 + 0.06 * FX_ENS.breath), 0, Math.PI * 2);
                  gctx.stroke();
                  /* v11.3 SPECTRUM VEIL (006 Neon Grad, toned): one full-frame
                     radial veil whose five stops walk the hue ring from the
                     chord root (root + k*72°) — the old symmetric spectrum,
                     breathing with the ensemble, capped whisper-soft. */
                  const veilA = Math.min(0.14, a * 0.30) * (0.55 + 0.45 * FX_ENS.breath) *
                      R16.neonVeil() * (0.75 + 0.45 * (nf.veil || 0.12) / 0.20);
                  if (veilA > 0.004) {
                      const vg = gctx.createRadialGradient(x1, y1, 0, x1, y1, Math.max(w, h) * 0.85);
                      const rootHue = h0;
                      for (let k = 0; k < 5; k++) {
                          const stopH = fxLerpHue(rootHue, (rootHue + k * 72) % 360, 0.55 + 0.45 * FX_ENS.breath);
                          vg.addColorStop(k / 4, fxHsla(stopH,
                              (nf.sat || 64) * 0.6 + ((typeof fxConfluenceSat === 'function') ? fxConfluenceSat() : 64) * 0.4,
                              (nf.light || 58) * 0.65 + ((typeof fxConfluenceLight === 'function') ? fxConfluenceLight() : 58) * 0.35,
                              veilA * (k === 0 ? 0.85 : 0.60)));
                      }
                      gctx.fillStyle = vg;
                      gctx.fillRect(0, 0, w, h);
                  }
                  gctx.filter = 'none';
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 2 — SCANLINES · "COMB FIELD" =============
             Lines breathe (gap modulated by the master breath), the whole field
             slowly tilts back and forth, accents walk the chord. */
          function glitchScanlinesFactory(getStrength, isPersistent) {
              const renderFn = () => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  /* R1.6: the source's motion tightens the comb — busy
                     video weaves a denser field */
                  const gap = 3 + Math.round((1 - s) * 3 + FX_ENS.breath * 1.5 + R16.scanGap());
                  const thick = 1 + Math.floor(s * 1.5); // 006: strength-keyed line thickness
                  const drift = (customTime * 0.006) % (gap + 1);               // slow crawl
                  const tilt = Math.sin(customTime * 0.00008) * 0.10;           // ±5.7° tilt
                  const a = effectPaintAlpha('Scanlines', s, comboProfile.glowMult || 1);
                  if (a <= 0.004) return;
                  gctx.save();
                  gctx.translate(w / 2, h / 2);
                  gctx.rotate(tilt);
                  gctx.translate(-w / 2, -h / 2);
                  gctx.globalCompositeOperation = 'screen';
                  let n = 0;
                  const diag = Math.sqrt(w * w + h * h);
                  /* v11.3 (006 blend): non-accent lines share ONE uniform hue —
                     the chord root lerped toward the old file's cyan (200°) — so
                     the field reads as a single woven sheet; accents still walk
                     the chord. Lines take the old strength-keyed thickness and
                     every 8th line throws a faint mesh echo. */
                  const baseHue = fxLerpHue(fxTone(0), 200, 0.45);
                  for (let y = drift - gap; y < diag; y += gap + 1, n++) {
                      const isAccent = (n % 6 === 2);
                      const tone = isAccent ? fxTone(1 + (n % 2), 6) : baseHue;
                      const lineA = a * (isAccent ? (0.50 + 0.50 * FX_ENS.breath) : 0.32);
                      if (lineA < 0.01) continue;
                      gctx.fillStyle = fxHsla(tone, isAccent ? 74 : 46, isAccent ? 72 : 62, lineA);
                      gctx.fillRect(0, y, diag, thick);
                      if (n % 8 === 0) { // mesh echo — every 8th line doubles
                          gctx.fillStyle = fxHsla(fxTone(2, 8), 52, 68, lineA * 0.45);
                          gctx.fillRect(0, y + (gap + 1) * 0.5, diag, 1);
                      }
                  }
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 3 — FLASH · "APERTURE PULSE" =============
             No more full-screen slams: a localized soft pulse at the SHARED
             STAGE anchor (keys into the Neon bloom), landing on a chord tone,
             with an asymmetric decay envelope for timed bursts. */
          function glitchBrightFlashFactory(getStrength, isPersistent) {
              const renderFn = (progress) => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const env = (progress !== undefined) ?
                      Math.pow(1 - clamp01(progress), 1.6) :          // fast hit, slow release
                      (0.35 + 0.65 * FX_ENS.breath);                    // breathing when persistent
                  const st = FX_ENS.stage;                              // shared anchor
                  const x = st.x * w,
                      y = st.y * h;
                  const r = Math.min(w, h) * (0.22 + 0.42 * s * env);
                  const a = effectPaintAlpha('Flash', s * env, comboProfile.glowMult || 1);
                  if (a <= 0.004) return;
                  const tone = fxTone(Math.floor(customTime * 0.00006) % 3, 4); // lands on the chord
                  const g = gctx.createRadialGradient(x, y, 0, x, y, r);
                  g.addColorStop(0.00, fxHsla(tone, 62, 88, Math.min(0.50, a * 0.70)));
                  g.addColorStop(0.35, fxHsla(tone, 58, 78, a * 0.30));
                  g.addColorStop(1.00, fxHsla(tone, 55, 70, 0));
                  gctx.save();
                  gctx.globalCompositeOperation = 'screen';
                  gctx.fillStyle = g;
                  gctx.fillRect(0, 0, w, h);
                  /* v11.3 FULL-FRAME WASH (006 Flash tint, toned to a breath):
                     at strength the pulse leaks a faint same-tone wash so it
                     reads across the whole frame, not only its core. */
                  const wash = Math.min(0.08, a * 0.18) * env;
                  if (wash > 0.003) {
                      gctx.fillStyle = fxHsla(tone, 58, 74, wash);
                      gctx.fillRect(0, 0, w, h);
                  }
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 4 — HUE SATURATION LIGHTING RAINBOW =====
             Three confluent rails on the same 0 / 50 / 75 / 100 landmarks:
               H — hue wheel around Ghost-Key confluence + chord
               S — saturation prism (grey paper → full chroma)
               L — lighting rainbow (shade → paper → glare, polarity with B&W)
             Reality paints 3 chord stops, soft-light. Virtual opens 5–7 stops
             and adds overlay (S) + luminosity (L) passes. */
          let hslSpinAcc = 0, hslSpinLastT = null;   /* R2: shared prism spin */
          function glitchHSLRainbowFactory(getStrength, isPersistent) {
              const renderFn = () => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const a = effectPaintAlpha('HSL Rainbow', s, comboProfile.glowMult || 1);
                  if (a <= 0.004) return;
                  const map = (window.GlitchEngine && GlitchEngine.hslRainbowMap)
                      ? GlitchEngine.hslRainbowMap(s, boardFilterCtx())
                      : { hueDeg: s * 360, satPct: 74, lightPct: 64, satSwing: 18, lightSwing: 12, hueStops: 3, realm: 'mix' };
                  const t = customTime * 0.001;
                  /* R2 SOFT-EYE: the prism spin is an ACCUMULATOR — slow in calm,
                     rapid inside a crescendo (×3.4) and lifted by the ear's beat */
                  hslSpinAcc += (customTime - (hslSpinLastT == null ? customTime : hslSpinLastT)) * 0.008 *
                      R16.spinK() * GlitchEngine.softChromaSpin(softK(), SOFT.beat);
                  hslSpinLastT = customTime;
                  const spin = (hslSpinAcc + map.hueDeg * 0.18) % 360;
                  const conf = fxConfluenceHue(0);
                  const bw = bwInvertMap(bwMasterLevel());
                  const bwP = clamp01(Math.max(FX_ENS.presence['B&W Invert'] || 0, FX_ENS.presence['R3 B&W Invert'] || 0) || bw.t || 0);
                  const nStops = Math.max(3, map.hueStops || 3);
                  const satBase = (map.satPct || 74) * (1 - 0.55 * bwP) * R16.rainbowSat();
                  const lightBase = map.lightPct || 64;
                  const invK = bw.invert / 0.75;
                  gctx.save();
                  gctx.globalAlpha = Math.min(1, a * 1.12);

                  /* HUE rainbow — diagonal wash, chord × confluence × wheel */
                  const gH = gctx.createLinearGradient(0, 0, w * (map.realm === 'virtual' ? 1 : 0.42), h);
                  for (let i = 0; i < nStops; i++) {
                      const u = nStops === 1 ? 0 : i / (nStops - 1);
                      const tone = fxLerpHue(fxTone(i % 3), conf, 0.34);
                      const hue = (tone + map.hueDeg * u + spin + bw.hueDeg * 0.18 +
                          (invK > 0.004 ? 180 * invK * 0.22 : 0) + 360) % 360;
                      gH.addColorStop(u, fxHsla(hue, satBase, lightBase,
                          Math.min(0.48, a * (i === ((nStops / 2) | 0) ? 0.40 : 0.26))));
                  }
                  gctx.globalCompositeOperation = map.realm === 'reality' ? 'soft-light' : 'screen';
                  gctx.fillStyle = gH;
                  gctx.fillRect(0, 0, w, h);

                  /* SATURATION rainbow — cross-axis, grey → prism */
                  const gS = gctx.createLinearGradient(w, 0, 0, h);
                  for (let i = 0; i < nStops; i++) {
                      const u = nStops === 1 ? 0 : i / (nStops - 1);
                      const satK = clamp(satBase - (map.satSwing || 16) + (2 * (map.satSwing || 16)) * u +
                          Math.sin(t * 0.35 + i) * 6, 8, 100);
                      const hue = (conf + 120 + spin * 0.45 + i * (360 / nStops) + 360) % 360;
                      gS.addColorStop(u, fxHsla(hue, satK, lightBase, Math.min(0.32, a * 0.22)));
                  }
                  gctx.globalCompositeOperation = 'overlay';
                  gctx.fillStyle = gS;
                  gctx.fillRect(0, 0, w, h);

                  /* LIGHTING rainbow — luminosity walk, polarity with B&W invert */
                  const gL = gctx.createLinearGradient(0, h, w, 0);
                  for (let i = 0; i < nStops; i++) {
                      const u = nStops === 1 ? 0 : i / (nStops - 1);
                      let lK = lightBase - (map.lightSwing || 10) + (2 * (map.lightSwing || 10)) * u +
                          Math.sin(t * 0.22 + i * 0.9) * 7;
                      if (invK > 0.004) lK = lK * (1 - invK) + (100 - lK) * invK;
                      lK = clamp(lK, 6, 94);
                      gL.addColorStop(u, fxHsla(conf, Math.max(8, satBase * 0.22), lK, Math.min(0.28, a * 0.18)));
                  }
                  gctx.globalCompositeOperation = 'luminosity';
                  gctx.fillStyle = gL;
                  gctx.fillRect(0, 0, w, h);

                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 5 — STROBE · "FLICKER GATE" ==============
             Fires only inside its resonance window, in musical ruffs (short
             2-4 pulse bursts then rest), vignette-weighted so it reads as a
             camera flicker rather than a flat full-screen strobe. */
          function glitchStrobeFactory(getStrength, isPersistent) {
              const renderFn = () => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const gate = fxGate('Strobe');
                  if (gate < 0.42) return;                              // outside its turn: silent
                  const t = customTime * 0.001;
                  /* R1.6: the source's energy sets the flicker cadence —
                     lively video shortens the ruff period and widens the
                     pulse window, calm video flickers lazily */
                  /* R2 SOFT-EYE: the ~11 Hz flicker is gone. The strobe is now a
                     SOFT PULSE — a shaped sine at ≤1.05 Hz calm / ≤2.6 Hz wild
                     (always under the 3 Hz photosensitive band), with a longer
                     ruff period when calm and no per-frame random dropouts
                     (those read as flashing). The ear's beat leans on the pulse. */
                  const k = softK();
                  const ruffP = R16.strobeP() * lerp(2.6, 1.1, k);
                  const ruffPhase = t % ruffP;
                  const inRuff = ruffPhase < ruffP * (0.28 + 0.22 * s) * R16.strobeW();
                  if (!inRuff) return;
                  const hz = GlitchEngine.softStrobeHz(k);
                  const pulse = Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI * 2 * hz), 2.2);  /* swell, never a cut */
                  const ruffEnv = Math.sin(Math.PI * clamp01(ruffPhase / (ruffP * (0.28 + 0.22 * s) * R16.strobeW())));
                  const env = pulse * ruffEnv * (0.75 + 0.35 * clamp01(SOFT.beat));
                  if (env < 0.03) return;
                  const tone = fxTone(Math.floor(t) % 3);
                  const a = effectPaintAlpha('Strobe', s * env * (0.45 + 0.55 * gate), comboProfile.glowMult || 1);
                  if (a <= 0.004) return;
                  const g = gctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.16,
                      w / 2, h / 2, Math.max(w, h) * 0.72);
                  g.addColorStop(0, fxHsla(tone, 68, 86, Math.min(0.50, a)));
                  g.addColorStop(1, fxHsla(tone, 64, 80, a * 0.10));
                  gctx.save();
                  gctx.globalCompositeOperation = 'screen';
                  gctx.fillStyle = g;
                  gctx.fillRect(0, 0, w, h);
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 6 — ASCII · "006 SCATTER × CHORD RAIN" ==
             R1.3 total redo: the voice rotates HEAVILY between the
             final-006 full-grid RAINBOW DIFFERENCE scatter (the dominant
             face) and the R1.2 RANDOM-APPEARING matrix stacks (the
             ensemble face) — crossfaded, leaning hard to 006.
             R1.2: the falling rain is replaced by RANDOM-APPEARING glyph
             stacks — the Prism-Ink spawn model in MATRIX style. The grid
             machinery (spacing / budget / shimmer veil) is kept. Stacks
             strike at uniform-random positions (they may overlap and may sit
             far apart); each is a bright phosphor head whose trail glyphs
             rain into place beneath it with a staggered delay, the head
             re-rolls its character while fresh, and everything decays like
             phosphor. The APPEARANCE FREQUENCY is set by the ASCII slider. */
          const ASCII_RAIN = {
              cols: 0,
              rows: 0,
              spacing: 14,
              drops: null,
              glyphs: null,
              hues: null,
              live: null,
              trails: null,
              speeds: null,
              rainFrac: 0.77,
              scale: 2.35,
              alphaMin: 0.55,
              alphaMax: 0.92
          };

          function rebuildAsciiRain(w, h, strength) {
              /* R1.7: vivid video densifies the grid, grey video opens it */
              const spacing = Math.max(10, Math.round((18 - strength * 7) * R16.asciiGap()));
              let cols = Math.max(4, Math.ceil(w / spacing));
              let rows = Math.max(4, Math.ceil(h / spacing));
              const cells = cols * rows;
              if (cells > renderBudget.asciiCells) {
                  const scale = Math.sqrt(cells / renderBudget.asciiCells);
                  cols = Math.max(4, Math.floor(cols / scale));
                  rows = Math.max(4, Math.floor(rows / scale));
              }
              const A = ASCII_RAIN;
              if (A.cols === cols && A.rows === rows && A.spacing === spacing && A.drops) return;
              A.spacing = spacing;
              A.cols = cols;
              A.rows = rows;
              A.drops = new Float32Array(cols);
              A.glyphs = new Uint16Array(cols * rows);
              A.hues = new Float32Array(cols);
              A.live = new Uint8Array(cols);
              A.trails = new Uint16Array(cols);
              A.speeds = new Float32Array(cols);
              const liveCount = Math.max(3, Math.round(cols * A.rainFrac));
              const setLen = atlas.count || 200;
              for (let c = 0; c < cols; c++) {
                  A.drops[c] = Math.random() * rows;
                  A.hues[c] = Math.random() * 3; // chord-tone index per column
                  A.live[c] = c < liveCount ? 1 : 0;
                  A.trails[c] = Math.max(8, Math.round(rows * (0.22 + Math.random() * 0.50)));
                  A.speeds[c] = 0.75 + Math.random() * 1.15;
                  for (let r = 0; r < rows; r++) {
                      A.glyphs[c * rows + r] = (Math.random() * setLen) | 0;
                  }
              }
              for (let i = 0; i < cols; i++) {
                  const j = (Math.random() * cols) | 0;
                  const tmp = A.live[i];
                  A.live[i] = A.live[j];
                  A.live[j] = tmp;
              }
          }

          /* The 006 scatter re-rolls a dense multi-script glyph field every frame.
             Drawing it as one fillText per cell (thousands of font-fallback text
             runs) was most of the frame time, so the glyphs are drawn once, with the
             same fillText calls, into a few white variant sheets at a fixed
             reference pitch. Each frame assembles the field from random-length
             single-row strips taken from random variants, rows and offsets, scaled to
             the live pitch, then tints it and blends it once. Rows sit in taller
             slots so glyphs that overflow their cell vertically are not clipped.
             Sheets are kept per glyph set, built one per frame and never depend on
             the pitch, so slider fades never stall a frame. The R3 ASCII voice uses
             the same painter through its engine binding. */
          const SCATTER_REF = 24;
          const SCATTER_COLS = 64;
          const SCATTER_ROWS = 24;
          const SCATTER_MARGIN = 6;
          const SCATTER_SLOT = SCATTER_REF + 2 * SCATTER_MARGIN;
          const SCATTER_VARIANTS = 4;
          const scatterPool = { sheets: new WeakMap(), field: null, fieldCtx: null };

          function buildScatterVariant(chSet) {
              const cv = document.createElement('canvas');
              cv.width = SCATTER_COLS * SCATTER_REF;
              cv.height = SCATTER_ROWS * SCATTER_SLOT;
              const cx = cv.getContext('2d');
              cx.textBaseline = 'top';
              cx.fillStyle = '#fff';
              cx.font = 'bold ' + SCATTER_REF + 'px monospace';
              for (let r = 0; r < SCATTER_ROWS; r++) {
                  const y = r * SCATTER_SLOT + SCATTER_MARGIN;
                  for (let c = 0; c < SCATTER_COLS; c++) {
                      if (Math.random() < 0.5) cx.fillText(chSet[(Math.random() * chSet.length) | 0], c * SCATTER_REF, y);
                  }
              }
              return cv;
          }

          function paintScatterField(ctx, w, h, pitch, chSet, color, alpha) {
              const pool = scatterPool;
              let variants = pool.sheets.get(chSet);
              /* glyph voices refill their array in place when the table changes */
              if (!variants || variants.glyphVersion !== chSet.glyphVersion) {
                  variants = [];
                  variants.glyphVersion = chSet.glyphVersion;
                  pool.sheets.set(chSet, variants);
              }
              if (variants.length < SCATTER_VARIANTS) variants.push(buildScatterVariant(chSet));
              if (!pool.field) {
                  pool.field = document.createElement('canvas');
                  pool.fieldCtx = pool.field.getContext('2d');
              }
              const field = pool.field, fx = pool.fieldCtx;
              if (field.width !== w || field.height !== h) {
                  field.width = w;
                  field.height = h;
              }
              fx.globalCompositeOperation = 'source-over';
              fx.imageSmoothingEnabled = true;
              fx.imageSmoothingQuality = 'medium';
              fx.clearRect(0, 0, w, h);
              const nv = variants.length;
              const k = pitch / SCATTER_REF, slotH = SCATTER_SLOT * k, lift = SCATTER_MARGIN * k;
              for (let yy = 0; yy < h; yy += pitch) {
                  for (let xx = 0; xx < w;) {
                      const len = 16 + ((Math.random() * 17) | 0);
                      const c0 = (Math.random() * (SCATTER_COLS - len + 1)) | 0;
                      const r = (Math.random() * SCATTER_ROWS) | 0;
                      fx.drawImage(variants[(Math.random() * nv) | 0],
                          c0 * SCATTER_REF, r * SCATTER_SLOT, len * SCATTER_REF, SCATTER_SLOT,
                          xx, yy - lift, len * pitch, slotH);
                      xx += len * pitch;
                  }
              }
              fx.globalCompositeOperation = 'source-in';
              fx.fillStyle = color;
              fx.fillRect(0, 0, w, h);
              ctx.save();
              ctx.globalCompositeOperation = 'difference';
              ctx.globalAlpha *= alpha;
              ctx.drawImage(field, 0, 0);
              ctx.restore();
          }

          function glitchASCIIArtOverlayFactory(getStrength, isPersistent) {
              /* R1.3 STYLE ROTOR (user request): this voice rotates HEAVILY
                 between two souls — the final-006 full-grid rainbow
                 'difference' scatter ('006', the DOMINANT face) and the
                 R1.2 random-appearing matrix stacks + shimmer veil ('ENS')
                 — crossfaded ~0.4s; 006 dwells ~3.2-6.8s, ENS strikes
                 ~1.2-2.7s (≈70/30, leaning hard to final-006). R1.2 kept:
                 ENS stack frequency is slider-governed. */
              const stacks = [];
              const MAX_STACKS = 36;
              const asciiFallback = atlas.chars || window.__ASCII_CHARS || ['0', '1'];
              const chSet = voiceGlyphSet('ASCII', asciiFallback);
              let spawnAccum = 0;
              let lastT = null;
              let rotStyle006 = true;   // '006' scatter vs 'ENS' stacks
              let rotUntil = 0;         // style-flip timestamp (customTime)
              let rotW = 1;             // eased 006 weight 0..1
              const spawnStack = (w, h, glyphPx, baseHue, life) => {
                  const depth = 2 + ((Math.random() * 5) | 0); // 2-6 trail glyphs
                  const st = {
                      x: Math.random() * w,                        // uniform-random:
                      y: Math.random() * h,                        // may overlap, may
                      hue: (baseHue + (Math.random() * 26 - 13) + 360) % 360, // sit far apart
                      size: glyphPx * (0.75 + Math.random() * 0.55),
                      born: customTime,
                      life: life,
                      glyphs: []
                  };
                  for (let k = 0; k < depth; k++) {
                      st.glyphs.push({
                          ch: chSet[(Math.random() * chSet.length) | 0],
                          delay: k * (55 + Math.random() * 75)     // rain-into-place stagger
                      });
                  }
                  stacks.push(st);
              };
              const renderFn = (progress) => {
                  const s = getStrength();
                  if (s <= 0) {
                      stacks.length = 0;
                      lastT = null;
                      rotStyle006 = true;   // R1.3: every activation opens
                      rotUntil = 0;         // on the dominant 006 face
                      rotW = 1;
                      return;
                  }
                  // Refills chSet in place after a glyph-table change (no-op otherwise).
                  voiceGlyphSet('ASCII', asciiFallback);
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  rebuildAsciiRain(w, h, s); // spacing/grid + shimmer machinery kept

                  const A = ASCII_RAIN;
                  const cols = A.cols,
                      rows = A.rows,
                      sp = A.spacing;
                  const glyphPx = Math.max(10, (sp - 2) * A.scale);
                  const master = effectPaintAlpha('ASCII', s, comboProfile.glowMult || 1);
                  if (master <= 0.004) return;
                  const now = customTime;
                  const dt = (lastT === null) ? 0.016 :
                      Math.max(0.001, Math.min(0.1, (now - lastT) / 1000));
                  lastT = now;
                  const timed = (progress !== undefined);
                  /* matrix green: the chord root pulled toward phosphor 120° */
                  const baseHue = fxLerpHue(fxTone(0), 120, 0.55);
                  /* R1.3 style rotor: flip the face on a clock, then ease
                     the weight over ~0.4s. Entering ENS seeds a 3-stack
                     flurry so the ensemble face announces its return. */
                  if (!rotUntil) rotUntil = now + 3200 + Math.random() * 3600;
                  if (now >= rotUntil) {
                      rotStyle006 = !rotStyle006;
                      rotUntil = now + (rotStyle006 ?
                          3200 + Math.random() * 3600 :
                          1200 + Math.random() * 1500);
                      if (!rotStyle006) {
                          for (let i = 0; i < 3 && stacks.length < MAX_STACKS; i++) {
                              spawnStack(w, h, glyphPx, baseHue, 800 + Math.random() * 900);
                          }
                      }
                  }
                  rotW += ((rotStyle006 ? 1 : 0) - rotW) *
                      Math.min(1, dt / 0.09);
                  /* STYLE '006' (dominant) — the final-006 full-grid rainbow
                     scatter: ONE fresh random hue per frame, 'difference'
                     blend, 50% cell density, every cell re-rolling its
                     glyph — the whole multi-alphabet field shimmering
                     per-frame. Spacing keeps the 006 formula 10+(1−s)·20,
                     budget-capped by asciiCells. */
                  if (rotW > 0.02) {
                      const sp006 = Math.max(10 + (1 - s) * 20,
                          Math.sqrt((w * h) / renderBudget.asciiCells));
                      /* R1.4: the scatter's rainbow is source-keyed — a
                         colorful video pulls the field toward its own
                         spectrum; a grey one lets the full wheel fly */
                      const scatterHue = (videoPalette.hue +
                          (Math.random() - 0.5) * 360 * srcSpreadK() + 360) % 360;
                      paintScatterField(gctx, w, h, Math.max(4, sp006 + (Math.random() - 0.5) * s * 1.5), chSet,
                          fxHsla(scatterHue, 100, 70, 1),
                          Math.min(1, 0.8 * s) * rotW);
                  }
                  /* R1.2: the appearance FREQUENCY is set by the ASCII slider —
                     ~0.6 stacks/s at a whisper up to ~9/s at full, gently
                     breathing with the ensemble but always slider-governed */
                  let rate = (0.6 + 8.4 * s) * (0.65 + 0.35 * FX_ENS.breath) *
                      (0.7 + 0.3 * fxGate('ASCII')) * (1 - rotW) * /* R1.3 ENS weight */
                      (0.85 + 0.30 * srcEnergyK()); /* R1.5: source energy feeds the rain */
                  if (timed) {
                      rate *= (1 + 2.2 * envArc(progress));
                      if (progress < 0.06 && stacks.length === 0) {
                          for (let i = 0; i < 5; i++) spawnStack(w, h, glyphPx, baseHue,
                              700 + Math.random() * 1000);
                      }
                  }
                  spawnAccum += rate * dt;
                  while (spawnAccum >= 1) {
                      spawnAccum -= 1;
                      if (stacks.length < MAX_STACKS) {
                          spawnStack(w, h, glyphPx, baseHue,
                              timed ? 700 + Math.random() * 1100 : 1300 + Math.random() * 2000);
                      }
                  }
                  gctx.save();
                  gctx.textBaseline = 'top';
                  gctx.globalCompositeOperation = 'screen'; // phosphor glow
                  for (let i = stacks.length - 1; i >= 0; i--) {
                      const st = stacks[i];
                      const age = now - st.born;
                      if (age >= st.life + st.glyphs[st.glyphs.length - 1].delay) {
                          stacks.splice(i, 1);
                          continue;
                      }
                      const decay = Math.max(0, 1 - age / st.life); // phosphor decay
                      gctx.font = 'bold ' + st.size.toFixed(0) + 'px "Courier New", monospace';
                      for (let k = 0; k < st.glyphs.length; k++) {
                          const gph = st.glyphs[k];
                          const gAge = age - gph.delay;
                          if (gAge < 0) continue; // still raining into place
                          const cellY = st.y + k * st.size * 0.92;
                          if (cellY > h) break;
                          const kFade = Math.max(0, 1 - gAge / (st.life * 0.85));
                          if (k === 0) {
                              /* the head: bright, blooming, re-rolling its
                                 character while fresh — matrix shimmer */
                              if (decay > 0.5) gph.ch = chSet[(Math.random() * chSet.length) | 0];
                              const a = (1 - rotW) *
                                  Math.min(0.55, master * (0.25 + 0.75 * decay));
                              if (a > 0.015) {
                                  gctx.shadowColor = fxHsla(st.hue, 100, 62, 1);
                                  gctx.shadowBlur = 3 + 7 * decay;
                                  gctx.fillStyle = fxHsla(st.hue, 74, 84, a);
                                  gctx.fillText(gph.ch, st.x, cellY);
                                  gctx.shadowBlur = 0;
                              }
                          } else {
                              /* trail glyphs: dimmer, decaying faster */
                              const a = (1 - rotW) * master * 0.5 * kFade *
                                  (1 - k * 0.10) * (0.4 + 0.6 * decay);
                              if (a > 0.015) {
                                  gctx.fillStyle = fxHsla(st.hue, 54, 56, a);
                                  gctx.fillText(gph.ch, st.x, cellY);
                              }
                          }
                      }
                  }
                  gctx.font = 'bold ' + glyphPx.toFixed(0) + 'px "Courier New", monospace';
                  /* v11.3 GLYPH SHIMMER (006 ASCII scatter, tuned): a sparse
                     full-grid veil of multi-alphabet glyphs in 'difference'
                     blend — grid-aligned to the rain, chord-toned, its density
                     swelling with the ensemble breath and this voice's
                     presence. Cells refresh on a slow clock (~1.7s), never
                     per-frame, so the veil reads as weathered film, not TV
                     static. */
                  const shimmerA = Math.min(0.10, master * 0.22) *
                      (0.45 + 0.55 * FX_ENS.breath) * (0.55 + 0.45 * fxGate('ASCII')) *
                      (1 - rotW); // R1.3 ENS weight
                  if (shimmerA > 0.004) {
                      gctx.globalCompositeOperation = 'difference';
                      const dens = 0.045 + 0.055 * clamp01(FX_ENS.presence['ASCII'] || s) *
                          (0.5 + 0.5 * FX_ENS.breath);
                      const tick = Math.floor(customTime * 0.001 / 1.7); // slow cell clock
                      /* a chosen table shimmers through the veil too; the
                         Revision 3 engine realms keep the old-soul bank */
                      const bank = window.SignalGlyphs &&
                          window.SignalGlyphs.current !== 'Engine realms (Revision 3)' ? chSet : FX_GLYPH_BANK;
                      for (let c = 0; c < cols; c++) {
                          for (let rr = 0; rr < rows; rr++) {
                              const seed = ((c * 131 + rr * 337 + tick * 911) % 997) / 997;
                              if (seed > dens) continue;
                              const gTone = fxTone((c + rr) % 3, ((seed * 12) | 0) - 6);
                              gctx.fillStyle = fxHsla(gTone, 55, 70, shimmerA * (0.45 + 0.55 * seed));
                              gctx.fillText(bank[(c * 7 + rr * 13 + tick * 29) % bank.length],
                                  c * sp, rr * sp);
                          }
                      }
                  }
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* ============ FACTORY 7 — FONT BURN · "006 SPRAY × WORD ECHO" =====
             R1.3 total redo: the voice rotates HEAVILY between its two souls
             — the final-006 PER-FRAME WORD SPRAY (the dominant face: fresh
             mashup text, 9-font rotation, prism/black/white hue-cycle
             phases, fired every frame) and the ensemble WORD ECHO (each
             instance drifts its position with eased motion, old and new
             words CROSSFADE through each other, color anticipating the next
             chord tone). Crossfaded ~0.4s, leaning hard to 006; both faces
             still key into the Hue/Color Cycle level. */
          function glitchFontBurnFactory(getStrength, isPersistent) {
              /* R1.7: the source's COLORING picks the vocabulary — the word
                 pool is banked (vivid NEON/SYNTH/CHROME vs dark
                 NULL/VOID/SYSFAIL) and the live bank share sits in the
                 modifier table (wordVivid / wordDark) */
              const BURN_VIVID = /NEON|N3ON|CYBER|SYNTH|CHROME|GLOW|SPECTRUM|SPECTRE|PRISM|DREAM|SUNSET|WAVE|PUNK|CITY|AURORA|PIXELDUST|RETROBYTE|RAIN|LASER|FLUX|BLOOM|LIGHT|SHELL|REBIRTH|DIGITAL|D1giTaL|THERMOPTIC|CAMO|MAJOR|TACHIKOMA|INFINITE|PHOSPHOR|HOLO/i;
              const BURN_DARK = /NULL|VOID|FAIL|CRASH|ERROR|BURN|DARK|BLACK|GHOST|ZERO|Z3R0|DELETE|WIPE|FATAL|VIRUS|V1RUS|CORRUPT|DEAD|KILL|ICE|SHADOW|DARKNET|SYSFAIL|BURNOUT|OVERLOAD|FEAR|F34R|COMMA|C0MM4|PUPPET|DUB|BARRIER|INNOCENCE|HACK/i;
              const BURN_KEYS = GHOST_KEY_PHRASES.concat(BURN_WORDS.slice(0, 96));
              const pickWord = () => {
                  if (Math.random() < 0.14) {
                      return BURN_KEYS[(Math.random() * Math.min(BURN_KEYS.length, 12)) | 0];
                  }
                  const wv = R16.wordVivid();
                  for (let tries = 0; tries < 8; tries++) {
                      const wd = BURN_WORDS[(Math.random() * BURN_WORDS.length) | 0];
                      const viv = BURN_VIVID.test(wd), dk = BURN_DARK.test(wd);
                      if (viv && !dk && Math.random() < wv) return wd;
                      if (dk && !viv && Math.random() < 1 - wv) return wd;
                      if (!viv && !dk && Math.random() < 0.20) return wd;
                      if (viv && dk && Math.random() < 0.5) return wd;
                  }
                  return BURN_WORDS[(Math.random() * BURN_WORDS.length) | 0];
              };
              let wordA = pickWord(),
                  wordB = pickWord();
              let blend = 1;
              let px = 0.1 + Math.random() * 0.8,
                  py = 0.1 + Math.random() * 0.8;
              let tx = px,
                  ty = py;
              let fontPx = 26,
                  fontTarget = 26;
              let nextRetargetAt = 0;
              /* R1.3 STYLE ROTOR (user request): heavy rotation between the
                 ensemble Word Echo and the final-006 per-frame word spray,
                 presentation leaning hard toward 006 (~70/30 dwell). */
              let rotStyle006 = true;
              let rotUntil = 0;
              let rotW = 1;
              let lastT = null;
              const renderFn = () => {
                  const s = getStrength();
                  if (s <= 0) {
                      rotStyle006 = true;   // R1.3: every activation opens
                      rotUntil = 0;         // on the dominant 006 face
                      rotW = 1;
                      lastT = null;
                      return;
                  }
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const now = performance.now();
                  const dt = (lastT === null) ? 0.016 :
                      Math.max(0.001, Math.min(0.1, (now - lastT) / 1000));
                  lastT = now;
                  /* R1.3 style rotor: flip the face on a clock, then ease
                     the weight over ~0.4s. Entering ENS forces a fresh
                     retarget so the echo announces its return. */
                  if (!rotUntil) rotUntil = now + 3400 + Math.random() * 3400;
                  if (now >= rotUntil) {
                      rotStyle006 = !rotStyle006;
                      rotUntil = now + (rotStyle006 ?
                          3400 + Math.random() * 3400 :
                          1100 + Math.random() * 1600);
                      if (!rotStyle006) nextRetargetAt = now;
                  }
                  rotW += ((rotStyle006 ? 1 : 0) - rotW) *
                      Math.min(1, dt / 0.09);
                  /* STYLE '006' (dominant) — the final-006 per-frame word
                     spray: a fresh phrase EVERY FRAME (half of them
                     keyPhrase + ' '/'-' + phrase mashups) in a randomly
                     rolled font of the 9-font set, at 10+rand·80·s px,
                     at a random position, painted in the 006 3-phase
                     hue-cycle coloring: Hue/Color Cycle < 0.05 → black
                     text with a white bloom ('multiply'); > 0.95 → white
                     text with a black bloom; else the colorProgress·360
                     prism fill with an inverse-hue shadow ('lighter'). */
                  if (rotW > 0.02) {
                      let text;
                      /* R1.7: the whole spray draws from the source-banked
                         vocabulary (pickWord) — mashups keep their shape but
                         every word answers the canvas */
                      if (Math.random() < 0.5) {
                          text = pickWord() + (Math.random() < 0.5 ? ' ' : '-') + pickWord();
                      } else {
                          text = pickWord();
                      }
                      const hcyc = hueMasterLevel();
                      let fH = 0, fS = 0, fL = 0, sH = 0, sS = 0, sL = 0, blur, comp;
                      if (hcyc < 0.05) {           // B&W low: black text, white bloom
                          fL = 0; sL = 100; blur = 2 + s * 5; comp = 'multiply';
                      } else if (hcyc > 0.95) {    // B&W high: white text, black bloom
                          fL = 100; sL = 0; blur = 2 + s * 5; comp = 'lighter';
                      } else {                     // prism: colorProgress wheel fill
                          const cp = (hcyc - 0.05) / 0.9;
                          /* R1.4: the prism fill bends toward the source's
                             key — a colorful video recolors the burn */
                          fH = fxLerpHue(cp * 360, videoPalette.hue, 0.32 * srcAppetite());
                          sH = (fH + 180) % 360;
                          fS = 100; fL = 50; sS = 100; sL = 50;
                          blur = 5 + s * 25; comp = 'lighter';
                      }
                      gctx.save();
                      gctx.font = (10 + Math.random() * 80 * s).toFixed(0) + 'px ' +
                          BURN_FONTS[(Math.random() * BURN_FONTS.length) | 0] +
                          ', monospace';
                      gctx.textBaseline = 'alphabetic';
                      gctx.globalCompositeOperation = comp;
                      gctx.fillStyle = fxHsla(fH, fS, fL, Math.min(1, 0.8 * s) * rotW);
                      gctx.shadowColor = fxHsla(sH, sS, sL, 1);
                      gctx.shadowBlur = blur;
                      gctx.fillText(text, Math.random() * w, Math.random() * h);
                      gctx.restore();
                  }
                  /* STYLE 'ENS' (secondary) — the ensemble Word Echo. */
                  if (now >= nextRetargetAt) {
                      nextRetargetAt = now + (1800 + Math.random() * 2400) *
                          R16.echoPace(); /* R1.8: lively video, faster word chase */
                      tx = 0.08 + Math.random() * 0.84;
                      ty = 0.08 + Math.random() * 0.78;
                      fontTarget = (16 + Math.random() * 52 * (0.4 + 0.6 * s)) *
                          R16.fontScale(); /* R1.7: appetite sizes the burn */
                      wordA = wordB;
                      /* v11.3 (006 keyPhrases mashup): two phrases welded with
                         a random ' ' or '-' separator — the old word-collision */
                      wordB = (Math.random() < 0.4) ?
                          (pickWord() + (Math.random() < 0.5 ? ' ' : '-') + pickWord()) : pickWord();
                      blend = 0;
                  }
                  blend = Math.min(1, blend + 0.022 + 0.022 * s);      // ~1s crossfade
                  px += (tx - px) * 0.035;                              // eased drift
                  py += (ty - py) * 0.035;
                  fontPx += (fontTarget - fontPx) * 0.05;
                  /* R1.3: the echo alpha rides the style weight — the ENS
                     face fades out as the 006 spray takes over */
                  const a = effectPaintAlpha('Font Burn', s, comboProfile.glowMult || 1) *
                      (1 - rotW);
                  if (a <= 0.004) return;
                  const hueCycleStrength = hueMasterLevel();
                  /* anticipate the NEXT chord tone — the word leads the harmony */
                  const tone = fxTone(1 + ((Math.floor(customTime * 0.00014) + 1) % 2));
                  const x = px * w,
                      y = py * h;
                  gctx.save();
                  gctx.font = fontPx.toFixed(0) + 'px ' + BURN_FONTS[(Math.floor(customTime * 0.00007) %
                      BURN_FONTS.length)] + ', monospace';
                  gctx.textBaseline = 'middle';
                  const drawWord = (text, alpha, ox, oy) => {
                      if (alpha <= 0.01) return;
                      if (hueCycleStrength < 0.05) {
                          gctx.globalCompositeOperation = 'multiply';
                          gctx.fillStyle = fxHsla(tone, 8, 4, Math.min(0.5, alpha * 0.7));
                          gctx.shadowColor = fxHsla(tone, Math.max(55, videoPalette.sat), 86, 1);
                          gctx.shadowBlur = 2 + s * 3;
                      } else {
                          gctx.globalCompositeOperation = 'screen';
                          const cyc = (tone + hueCycleStrength * 360) % 360;
                          gctx.fillStyle = fxHsla(cyc, 88, 62, Math.min(0.5, alpha * 0.6));
                          gctx.shadowColor = fxHsla((cyc + 180) % 360, 70, 60, 1);
                          gctx.shadowBlur = 4 + s * 10;
                      }
                      gctx.fillText(text, x + ox, y + oy);
                  };
                  drawWord(wordA, a * (1 - blend), 0, 0);                    // fading echo
                  drawWord(wordB, a * blend, Math.cos(customTime * 0.001) * 2, 0); // rising voice
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 8 — GEMINI BOMB · "TWIN ORBIT" ===========
             Replaced the shape shrapnel with two soft counter-rotating ring
             glows on the shared stage — true twins: root tone and fifth tone,
             orbiting each other, connected by a faint chord line. */
          function glitchGeminiBombFactory(getStrength, isPersistent) {
              const born = customTime;
              /* v11.3 ECHO SHRAPNEL (006 Gemini Bomb, toned): 5-8 small
                 chord-toned shards from the old shape set (rect / circle /
                 triangle / star / cross) are ejected along the twins' orbit
                 tangent when a burst lands, and on resonance peaks in
                 persistent mode (slow, breath-keyed respawn). They ease out
                 on a soft fade — 'screen'-blended, absolute ceiling 0.3. */
              const SHAPES = ['rect', 'circle', 'triangle', 'star', 'cross'];
              const shards = [];
              let burstSpawned = false;
              let nextShrapnelAt = 0;
              const spawnShards = (ax, ay, bx, by, spin, w, h) => {
                  const nSh = 4 + ((Math.random() * (2 + 5 * srcAppetite())) | 0); /* R1.8: appetite seeds the shrapnel */
                  for (let i = 0; i < nSh; i++) {
                      const fromA = (i % 2 === 0);
                      const baseAng = fromA ? spin : (-spin + Math.PI);
                      const tang = baseAng + Math.PI * 0.5 * (Math.random() < 0.5 ? 1 : -1);
                      const spd = (0.01 + Math.random() * 0.022) * Math.min(w, h) * 0.6;
                      shards.push({
                          x: fromA ? ax : bx,
                          y: fromA ? ay : by,
                          vx: Math.cos(tang) * spd,
                          vy: Math.sin(tang) * spd,
                          shape: SHAPES[(Math.random() * SHAPES.length) | 0],
                          hue: fxTone((Math.random() * 3) | 0, ((Math.random() * 10) | 0) - 5),
                          size: 3 + Math.random() * 7,
                          rot: Math.random() * Math.PI * 2,
                          vrot: (Math.random() - 0.5) * 0.05,
                          life: 1
                      });
                  }
              };
              const drawShard = (sh, alpha) => {
                  gctx.save();
                  gctx.translate(sh.x, sh.y);
                  gctx.rotate(sh.rot);
                  gctx.globalAlpha = alpha;
                  gctx.fillStyle = fxHsla(sh.hue, 62, 68, 1);
                  const z = sh.size;
                  if (sh.shape === 'rect') {
                      gctx.fillRect(-z * 0.5, -z * 0.35, z, z * 0.7);
                  } else if (sh.shape === 'circle') {
                      gctx.beginPath();
                      gctx.arc(0, 0, z * 0.42, 0, Math.PI * 2);
                      gctx.fill();
                  } else if (sh.shape === 'triangle') {
                      gctx.beginPath();
                      gctx.moveTo(0, -z * 0.55);
                      gctx.lineTo(z * 0.5, z * 0.4);
                      gctx.lineTo(-z * 0.5, z * 0.4);
                      gctx.closePath();
                      gctx.fill();
                  } else if (sh.shape === 'star') {
                      const inner = z * 0.55 / 2.5;            // 006: inner = outer/2.5
                      gctx.beginPath();
                      for (let k = 0; k < 10; k++) {
                          const rr2 = (k % 2 === 0) ? z * 0.55 : inner;
                          const aa = -Math.PI * 0.5 + k * Math.PI / 5;
                          const px2 = Math.cos(aa) * rr2,
                              py2 = Math.sin(aa) * rr2;
                          if (k === 0) gctx.moveTo(px2, py2);
                          else gctx.lineTo(px2, py2);
                      }
                      gctx.closePath();
                      gctx.fill();
                  } else { // cross
                      gctx.fillRect(-z * 0.5, -z * 0.14, z, z * 0.28);
                      gctx.fillRect(-z * 0.14, -z * 0.5, z * 0.28, z);
                  }
                  gctx.restore();
              };
              const renderFn = (progress) => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const t = (customTime - born) * 0.001;
                  const st = FX_ENS.stage;
                  const cx = st.x * w,
                      cy = st.y * h;                        // shared stage anchor
                  const orbitR = Math.min(w, h) * (0.07 + 0.15 * s);
                  const spin = t * (0.45 + 0.55 * s) * R16.geminiK(); /* R1.7: energy spins the twins */
                  const env = (progress !== undefined) ? envArc(progress) :
                      (0.40 + 0.60 * FX_ENS.breath);
                  const a = effectPaintAlpha('Gemini Bomb', s * env, comboProfile.glowMult || 1);
                  if (a <= 0.004) return;
                  /* v11.3 spawn: timed bursts throw once on landing; persistent
                     mode respawns on resonance peaks on a slow breath-keyed clock */
                  const nowMs = performance.now();
                  if (progress !== undefined) {
                      if (!burstSpawned && progress < 0.2) {
                          burstSpawned = true;
                          spawnShards(cx + Math.cos(spin) * orbitR, cy + Math.sin(spin) * orbitR,
                              cx + Math.cos(-spin + Math.PI) * orbitR, cy + Math.sin(-spin + Math.PI) * orbitR,
                              spin, w, h);
                      }
                  } else if (nowMs >= nextShrapnelAt && fxGate('Gemini Bomb') > 0.80) {
                      nextShrapnelAt = nowMs + 2400 + Math.random() * 2200 + (1 - FX_ENS.breath) * 1800;
                      spawnShards(cx + Math.cos(spin) * orbitR, cy + Math.sin(spin) * orbitR,
                          cx + Math.cos(-spin + Math.PI) * orbitR, cy + Math.sin(-spin + Math.PI) * orbitR,
                          spin, w, h);
                  }
                  const ax = cx + Math.cos(spin) * orbitR,
                      ay = cy + Math.sin(spin) * orbitR;
                  const bx = cx + Math.cos(-spin + Math.PI) * orbitR,
                      by = cy + Math.sin(-spin + Math.PI) * orbitR;
                  const ringR = Math.min(w, h) * (0.05 + 0.06 * s);
                  gctx.save();
                  gctx.globalCompositeOperation = 'screen';
                  const twin = (x, y, rr, hue, aa) => {
                      const g = gctx.createRadialGradient(x, y, 0, x, y, rr * 2.4);
                      g.addColorStop(0, fxHsla(hue, 65, 80, Math.min(0.45, aa * 0.55)));
                      g.addColorStop(0.5, fxHsla(hue, 60, 66, aa * 0.22));
                      g.addColorStop(1, fxHsla(hue, 55, 60, 0));
                      gctx.fillStyle = g;
                      gctx.fillRect(x - rr * 2.4, y - rr * 2.4, rr * 4.8, rr * 4.8);
                      gctx.globalAlpha = Math.min(0.35, aa * 0.5);
                      gctx.strokeStyle = fxHsla(hue, 70, 78, 1);
                      gctx.lineWidth = 1.5;
                      gctx.beginPath();
                      gctx.arc(x, y, rr, 0, Math.PI * 2);
                      gctx.stroke();
                      gctx.globalAlpha = 1;
                  };
                  twin(ax, ay, ringR, fxTone(0), a);
                  twin(bx, by, ringR * 0.72, fxTone(2), a * 0.75);
                  /* the chord line between the twins */
                  gctx.globalAlpha = Math.min(0.16, a * 0.22);
                  gctx.strokeStyle = fxHsla(fxTone(1), 60, 74, 1);
                  gctx.lineWidth = 1;
                  gctx.beginPath();
                  gctx.moveTo(ax, ay);
                  gctx.lineTo(bx, by);
                  gctx.stroke();
                  /* v11.3 shrapnel pass — eased fade, absolute ceiling 0.3 */
                  for (let i = shards.length - 1; i >= 0; i--) {
                      const sh = shards[i];
                      sh.x += sh.vx;
                      sh.y += sh.vy;
                      sh.vx *= 0.985;
                      sh.vy *= 0.985;
                      sh.rot += sh.vrot;
                      sh.life -= 0.010 + 0.008 * s;
                      if (sh.life <= 0) { shards.splice(i, 1); continue; }
                      drawShard(sh, Math.min(0.3, a * 0.42) * smooth01(sh.life));
                  }
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 9 — DATA BANDS · "SIGNAL WEAVE" ==========
             Band offsets are now coherent — every band follows shared sinusoid
             fields (no per-frame randomness), the weave amplitude breathes,
             slices are larger/feathered by overlap, and the film-noise dots
             drift with the stage at half density. */
          function glitchVHSFactory(getStrength, isPersistent) {
              const renderFn = () => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 4 || h < 4) return;
                  const ytLive = !!(ytWarpShell && ytWarpShell.style.display !== 'none' && document.body.classList
                      .contains('playback-on'));
                  const localVid = !!(video && document.body.classList.contains('local-video') && video.readyState >=
                      2);

                  if (scratch.width !== w || scratch.height !== h) { scratch.width = w;
                      scratch.height = h; }

                  const phase = customTime * 0.00016;
                  /* v11.3 (006 blend): the weave amplitude swells on the beat
                     toward the old 15px wobble, but only while the beat holds */
                  const wobbleAmount = s * (7 * (0.6 + 0.4 * FX_ENS.breath) + 8 * clamp01(beat)) *
                      R16.bandWob(); /* R1.6: source motion feeds the weave */
                  const sliceHeight = 10;
                  let sliced = false;

                  const weave = () => {
                      for (let y = 0; y < h; y += sliceHeight) {
                          const band = y / sliceHeight;
                          /* two coherent fields — bands move as one woven sheet */
                          const wob = Math.sin(y / h * Math.PI * 3 + phase * 2) * wobbleAmount +
                              Math.sin(band * 0.35 + phase) * wobbleAmount * 0.45;
                          gctx.drawImage(scratch, 0, y, w, sliceHeight, wob, y, w, sliceHeight);
                      }
                  };
                  if (localVid) {
                      try {
                          scratchCtx.clearRect(0, 0, w, h);
                          scratchCtx.drawImage(video, 0, 0, w, h);
                          scratchCtx.drawImage(mainCanvas, 0, 0);
                          weave();
                          sliced = true;
                      } catch (e) {}
                  }
                  if (!sliced && !ytLive) {
                      scratchCtx.clearRect(0, 0, w, h);
                      scratchCtx.drawImage(mainCanvas, 0, 0);
                      weave();
                      sliced = true;
                  }

                  /* soft film noise — fewer, slower, stage-drifting */
                  gctx.save();
                  gctx.globalCompositeOperation = 'screen';
                  gctx.globalAlpha = Math.min(0.30, s * 0.22 * motionGlow());
                  const dots = Math.min(24, Math.floor(20 * s * R16.bandWob())); /* R1.7: motion feeds the grain */
                  const st = FX_ENS.stage;
                  /* v11.3 (006 blend): every other grain is painted 'overlay' —
                     the old composite that knots the noise INTO the picture
                     instead of sitting on top of it */
                  for (let i = 0; i < dots; i++) {
                      const x = ((i * 0.618 + st.x * 0.4 + customTime * 0.00001) % 1) * w;
                      const y = ((i * 0.381 + customTime * 0.00006) % 1) * h;
                      if (i & 1) {
                          gctx.globalCompositeOperation = 'overlay';
                          gctx.globalAlpha = Math.min(0.22, s * 0.16 * motionGlow());
                          gctx.fillStyle = 'rgba(255,255,255,0.5)';
                      } else {
                          gctx.globalCompositeOperation = 'screen';
                          gctx.globalAlpha = Math.min(0.30, s * 0.22 * motionGlow());
                          gctx.fillStyle = 'rgba(255,255,255,0.30)';
                      }
                      gctx.fillRect(x, y, 1.5, 1.5);
                  }
                  gctx.globalCompositeOperation = 'screen';
                  if (ytLive && !sliced) {
                      const rollY = ((customTime / 900) % 1) * h;
                      const bh = Math.max(3, 4 + s * 8);
                      const wob = Math.sin(rollY / 30 + phase) * wobbleAmount;
                      gctx.globalAlpha = Math.min(0.14, s * 0.10);
                      gctx.fillStyle = fxHsla(fxTone(0), 40, 90, 0.4);
                      gctx.fillRect(wob, rollY, w, bh);
                  }
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 10 — VHS GLITCH · "TAPE DRIFT" ===========
             The beam keeps its envelope physics, but: ripple amplitude is
             halved and breathes, the chroma-split pair is chord-toned (root /
             fifth instead of fixed red-cyan), and the comb overlay is a
             whisper. The drift eases with the ensemble breath. */
          function glitchVHSGlitchFactory(getStrength, isPersistent) {
              const renderFn = () => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 4 || h < 4) return;
                  const glow = ((comboProfile && comboProfile.glowMult) || 1);
                  const ytLive = !!(ytWarpShell && ytWarpShell.style.display !== 'none' && document.body.classList
                      .contains('playback-on'));
                  const localVid = !!(video && document.body.classList.contains('local-video') && video.readyState >=
                      2);

                  if (scratch.width !== w || scratch.height !== h) { scratch.width = w;
                      scratch.height = h; }

                  const speed = 0.00016 * (0.6 + s * 0.5 + 0.25 * FX_ENS.breath); // breathing tape
                  const phase = (customTime * speed) % 1;
                  const beamY = phase * (h + 80) - 40;
                  const rippleAmp = (3 + s * 9 * glow * (0.7 + 0.3 * FX_ENS.breath)) *
                      R16.vhsAmp(); /* R1.6: energy + motion feed the ripple */
                  const waveLen = 52 + (1 - s) * 40;
                  /* v11.3 (006 blend): slice height rides the voice gate
                     (4..6px like the old tape) and a coherent high-frequency
                     sine micro-slip — gated, never random — threads the beam */
                  const tGate = fxGate('VHS Glitch');
                  const sliceH = 4 + Math.floor(tGate * 2);

                  let sliced = false;
                  const trySlice = (srcDraw) => {
                      try {
                          scratchCtx.clearRect(0, 0, w, h);
                          srcDraw();
                          scratchCtx.drawImage(mainCanvas, 0, 0);
                          for (let y = 0; y < h; y += sliceH) {
                              const dist = (y - beamY) / (h * 0.22);
                              const envelope = Math.exp(-dist * dist * 2.2);
                              const curve = Math.sin(y / waveLen + customTime * 0.0011) * rippleAmp *
                                  envelope * s;
                              const curve2 = Math.sin(y / (waveLen * 0.55) + customTime * 0.0007) *
                                  rippleAmp * 0.35 * envelope * s;
                              const ox = curve + curve2 + Math.sin(y * 1.35 + customTime * 0.03) *
                                  (0.5 + 1.3 * tGate) * s;
                              try { gctx.drawImage(scratch, 0, y, w, sliceH, ox, y, w, sliceH); } catch (
                              e) {}
                          }
                          return true;
                      } catch (e) { return false; }
                  };

                  if (localVid && videoDistortStrength() < 0.08) {
                      sliced = trySlice(() => { scratchCtx.drawImage(video, 0, 0, w, h); });
                  }
                  if (!sliced && !ytLive) {
                      sliced = trySlice(() => {});
                  }

                  gctx.save();

                  /* comb — a whisper of interleaving darkness */
                  gctx.globalCompositeOperation = 'source-over';
                  gctx.globalAlpha = Math.min(0.18, 0.05 + s * 0.13) * glow;
                  gctx.fillStyle = 'rgba(0,0,0,0.35)';
                  const pitch = 2 + (s < 0.5 ? 1 : 0);
                  const drift = (customTime * 0.025 + phase * pitch * 4) % pitch;
                  for (let y = drift; y < h; y += pitch) {
                      const bend = Math.sin(y / waveLen + customTime * 0.001) * 0.5;
                      gctx.fillRect(bend, y, w, 1);
                  }

                  /* the beam — chord-toned halo */
                  gctx.globalCompositeOperation = 'screen';
                  const bandH = Math.max(6, h * (0.035 + s * 0.06));
                  const grad = gctx.createLinearGradient(0, beamY - bandH, 0, beamY + bandH);
                  const h0 = fxTone(0),
                      h2 = fxTone(2);
                  grad.addColorStop(0, fxHsla(h0, 70, 72, 0));
                  grad.addColorStop(0.45, fxHsla(h0, 78, 78, Math.min(0.30, 0.12 + s * 0.16)));
                  grad.addColorStop(0.55, fxHsla(h2, 80, 80, Math.min(0.32, 0.13 + s * 0.17)));
                  grad.addColorStop(1, fxHsla(h0, 70, 72, 0));
                  gctx.globalAlpha = Math.min(0.42, 0.15 + s * 0.25) * glow;
                  gctx.fillStyle = grad;
                  const beamCurve = Math.sin(customTime * 0.0008) * 9 * s;
                  gctx.fillRect(beamCurve * 0.3, beamY - bandH, w, bandH * 2);

                  /* chroma split — root/fifth pair at the beam edge */
                  gctx.globalCompositeOperation = 'screen';
                  gctx.globalAlpha = Math.min(0.20, s * 0.14) * glow;
                  gctx.fillStyle = fxHsla(h0, 80, 72, 0.5);
                  gctx.fillRect(beamCurve, beamY - 1, w, 1.5);
                  gctx.fillStyle = fxHsla(h2, 80, 72, 0.5);
                  gctx.fillRect(-beamCurve * 0.7, beamY + 1.5, w, 1.5);

                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 11 — DATA BOMB · "CIPHER BURST" ===========
             The rain of random tiles becomes a radial constellation: a swell
             of glyphs expanding outward FROM the shared stage anchor on an
             eased bell envelope, chord-toned, fading as it diffuses. */
          function glitchDataBombFactory(getStrength, isPersistent) {
              const born = performance.now();
              const CYCLE = 2.6;
              const n = 36 + Math.round(16 * srcAppetite()); /* R1.8: appetite seeds the swarm */
              const moles = [];
              for (let i = 0; i < n; i++) {
                  moles.push({
                      ang: Math.random() * Math.PI * 2,
                      dist: 0.04 + Math.random() * 0.10,
                      spd: 0.10 + Math.random() * 0.24,
                      tone: i % 3,
                      glyph: 0,
                      spin: (Math.random() - 0.5) * 0.5,
                      sz: 0.7 + Math.random() * 0.6
                  });
              }
              const renderFn = (progress) => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const glyphAtlas = voiceGlyphAtlas('Data Bomb');
                  const tile = glyphAtlas.tile;
                  const src = glyphAtlas.src;
                  if (!tile || !src) return;
                  const tAll = (performance.now() - born) * 0.001;
                  /* timed: one bell; persistent: the bell repeats on a slow cycle */
                  const tc = (progress !== undefined) ? clamp01(progress) : (tAll % CYCLE) / CYCLE;
                  const env = envArc(tc);
                  const st = FX_ENS.stage;
                  const cx = st.x * w,
                      cy = st.y * h;                     // burst from the shared stage
                  const a = effectPaintAlpha('Data Bomb', s * env, 1);
                  if (a <= 0.004) return;
                  const reach = Math.min(w, h);
                  gctx.save();
                  gctx.globalCompositeOperation = 'screen';
                  for (let i = 0; i < n; i++) {
                      const m = moles[i];
                      const rr = (m.dist + m.spd * (tc * 1.6)) * reach *
                          R16.bombReach(); /* R1.6: appetite sets the burst reach */
                      const x = cx + Math.cos(m.ang + m.spin * tc * 2) * rr;
                      const y = cy + Math.sin(m.ang + m.spin * tc * 2) * rr * 0.85;
                      if (x < 0 || x > w || y < 0 || y > h) continue;
                      if (m.glyph === 0 || m.glyph >= glyphAtlas.count || Math.random() < 0.02) {
                          m.glyph = (Math.random() * glyphAtlas.count) | 0;
                      }
                      const fade = 1 - tc * 0.8;                            // diffuses as it expands
                      gctx.globalAlpha = Math.min(0.5, a * fade * m.sz);
                      /* chord-toned tint wash behind each glyph */
                      gctx.fillStyle = fxHsla(fxTone(m.tone), 60, 60, 0.10);
                      gctx.fillRect(x, y, tile * 0.9, tile * 0.9);
                      gctx.drawImage(src, (m.glyph % 16) * tile, ((m.glyph / 16) | 0) * tile,
                          tile, tile, x, y, tile * 0.9, tile * 0.9);
                  }
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn, 1900);
          }

          /* =============== FACTORY 12 — INK GLYPHS · "PRISM INK" ============
             R1.1 (user request): randomly-appearing OPAQUE ink glyph stamps —
             ascii/symbol characters struck in THREE inks: RAINBOW
             (full-saturation hues), JETBLACK (near-black lacquer) and WHITE
             LIGHT (luminous white). Placement is uniform-random, so stamps
             MAY OVERLAP and MAY sit far apart ("spaced out") — no grid, no
             collision checks. Each glyph stamps in fast, holds, then lifts
             out; every stamp casts a darker offset under-copy so overlaps
             read as layered ink. The ensemble keys the APPEARANCE RATE
             (breath + resonance gate + auto-mix) — each stamp itself stays
             fully opaque by design. */
          function glitchInkGlyphsFactory(getStrength, isPersistent) {
              const glyphs = [];
              const MAX_INK = 40; // concurrent stamp cap
              /* R1.6: the ink's alphabet is split — letterforms vs sigils —
                 so the source's DARKNESS can choose the mix (see spawnGlyph):
                 dark video strikes dense code/sigil glyphs, bright video
                 stays with clean letterforms */
              const INK_ALPHA = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                  'abcdefghijklmnopqrstuvwxyz' +
                  '0123456789' +
                  '!@#$%^&*()_+-=[]{}|;:,.<>?/~`').split('');
              const INK_SIGIL = '░▒▓█▄▀■□◆◇▲▼●○★☆✦✧†‡§¶∞≈≠≤≥∑∫µ±÷×'.split('');
              const INK_BANK = INK_ALPHA.concat(INK_SIGIL);
              /* the three inks — rainbow dominates; jetblack and white
                 light strike through it like lacquer and glare */
              const pickInk = () => {
                  const roll = Math.random();
                  if (roll < 0.17) return 'jetblack';
                  if (roll < 0.34) return 'white';
                  return 'rainbow';
              };
              const spawnGlyph = (w, h, life) => {
                  glyphs.push({
                      x: Math.random() * w,                        // uniform-random:
                      y: Math.random() * h,                        // may overlap, may
                      ch: (Math.random() < R16.sigilBias()) ? /* R1.6: source picks the alphabet */
                          INK_SIGIL[(Math.random() * INK_SIGIL.length) | 0] :
                          INK_ALPHA[(Math.random() * INK_ALPHA.length) | 0], // sit far apart
                      /* R1.4: the rainbow ink orbits the source's spectrum —
                         vivid videos tighten the wheel, grey ones open it */
                      hue: (videoPalette.hue + (Math.random() - 0.5) * 360 * srcSpreadK() + 360) % 360,
                      kind: pickInk(),
                      size: (15 + Math.pow(Math.random(), 1.6) * 52) *
                          R16.inkScale(), /* R1.6: dark canvas, bigger ink */
                      rot: (Math.random() - 0.5) * 0.44,           // ±12.6° stamp tilt
                      vrot: (Math.random() - 0.5) * 0.10,
                      born: customTime,
                      life: life
                  });
              };
              let spawnAccum = 0;
              let lastT = null;
              const renderFn = (progress) => {
                  const s = getStrength();
                  if (s <= 0) { glyphs.length = 0; lastT = null; return; }
                  const w = mainCanvas.width,
                      h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const now = customTime;
                  const dt = (lastT === null) ? 0.016 :
                      Math.max(0.001, Math.min(0.1, (now - lastT) / 1000));
                  lastT = now;
                  /* the ensemble keys the ink's appearance RATE, never its
                     opacity — the flow carries gate + duck + masters */
                  const flow = effectPaintAlpha('Ink Glyphs', s, comboProfile.glowMult || 1);
                  if (flow <= 0.004) return;
                  const timed = (progress !== undefined);
                  /* spawn pressure: a steady scatter when persistent; a
                     swelling flurry across a timed burst (flow already carries
                     the masters, so the base rate must be generous to read) */
                  let rate = (2.4 + 16 * s) * (0.45 + 0.55 * FX_ENS.breath) *
                      (0.55 + 0.45 * fxGate('Ink Glyphs')) *
                      (0.85 + 0.30 * srcEnergyK()); /* R1.5: source energy feeds the ink flow */
                  if (timed) {
                      rate *= (1 + 2.6 * envArc(progress));
                      if (progress < 0.06 && glyphs.length === 0) {
                          for (let i = 0; i < 4; i++) spawnGlyph(w, h, 600 + Math.random() * 900);
                      }
                  }
                  spawnAccum += rate * flow * dt;
                  while (spawnAccum >= 1) {
                      spawnAccum -= 1;
                      if (glyphs.length < MAX_INK) {
                          spawnGlyph(w, h, (timed ? 600 + Math.random() * 1100 :
                              1900 + Math.random() * 2600) * R16.inkLife()); /* R1.8: dark canvas, ink lingers */
                      }
                  }
                  gctx.save();
                  gctx.globalCompositeOperation = 'source-over'; // true opaque ink
                  gctx.textAlign = 'center';
                  gctx.textBaseline = 'middle';
                  for (let i = glyphs.length - 1; i >= 0; i--) {
                      const g = glyphs[i];
                      const age = now - g.born;
                      if (age >= g.life) { glyphs.splice(i, 1); continue; }
                      /* stamp envelope: quick press-in, hold, quick lift-out —
                         opacity never fades, the stamp scale carries the exit */
                      let k = 1;
                      if (age < 140) k = 0.55 + 0.45 * smooth01(age / 140);
                      else if (age > g.life - 170) k = 0.55 + 0.45 * smooth01((g.life - age) / 170);
                      g.rot += g.vrot * dt;
                      gctx.save();
                      gctx.translate(g.x, g.y);
                      gctx.rotate(g.rot);
                      gctx.scale(k, k);
                      gctx.font = 'bold ' + g.size.toFixed(0) + 'px "Courier New", monospace';
                      /* under-copy — the offset layer that makes overlaps read
                         as stacked ink; white light gets a dark edge so it reads
                         on any background, jetblack gets a deeper black */
                      if (g.kind === 'white') {
                          gctx.fillStyle = fxHsla(g.hue, 40, 16, 1);
                          gctx.fillText(g.ch, g.size * 0.045, g.size * 0.045);
                          gctx.fillStyle = fxHsla(g.hue, 12, 96, 1);   // white light ink
                          gctx.fillText(g.ch, 0, 0);
                      } else if (g.kind === 'jetblack') {
                          gctx.fillStyle = fxHsla(g.hue, 30, 3, 1);
                          gctx.fillText(g.ch, g.size * 0.045, g.size * 0.045);
                          gctx.fillStyle = fxHsla(g.hue, 22, 7, 1);    // jetblack ink
                          gctx.fillText(g.ch, 0, 0);
                      } else {
                          gctx.fillStyle = fxHsla(g.hue, 100, 16, 1);
                          gctx.fillText(g.ch, g.size * 0.045, g.size * 0.045);
                          gctx.fillStyle = fxHsla(g.hue, 100, 58, 1);  // rainbow ink
                          gctx.fillText(g.ch, 0, 0);
                      }
                      gctx.restore();
                  }
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          const techArtist = { gl: null, canvas: null, prog: null, uni: {}, failed: false, w: 0, h: 0 };
          let taVel = { x: 0, y: 0 };


          /* =============== FACTORY 13 — MATRIX ASCII · TYPESET RAIN ==========
             Named typesets (not a flat DB). Reality draws IRL scripts:
             latin / cyrillic / greek / hebrew / arabic / devanagari / thai /
             hangul / hanzi / javanese. Virtual draws the machine rain:
             katakana (Wachowski) + CP437 box/block + Latin-1/dingbats +
             math operators. Mix interleaves both + Ghost-Key leet.
             Same Ghost-Key and 0/50/75/100 B&W rails as every other voice. */
          function glitchMatrixAsciiFactory(getStrength, isPersistent) {
              const streams = [];
              let lastT = null;
              const boardCtx = () => ({
                  ghost: getGhostMode(), vsync: getVsyncMode(),
                  warp: isAiWarpActive, bw: bwMasterLevel()
              });
              const spawnStream = (w, h, realm) => {
                  const size = 11 + Math.random() * 13;
                  const depth = 8 + ((Math.random() * 16) | 0);
                  const glyphs = [];
                  for (let k = 0; k < depth; k++) {
                      glyphs.push({
                          ch: voiceGlyph('Matrix ASCII', realm, k % 3),
                          delay: k
                      });
                  }
                  return {
                      x: Math.random() * w,
                      y: -Math.random() * h * 0.6,
                      speed: (realm === 'virtual' ? 92 : realm === 'reality' ? 26 : 54) * (0.55 + Math.random()),
                      size: size,
                      glyphs: glyphs,
                      hueJit: (Math.random() - 0.5) * 18,
                      realm: realm
                  };
              };
              const renderFn = (progress) => {
                  const s = getStrength();
                  if (s <= 0) { streams.length = 0; lastT = null; return; }
                  const w = mainCanvas.width, h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const E = window.GlitchEngine;
                  const realm = E ? E.realmFromBoard(boardCtx()) : 'mix';
                  const master = effectPaintAlpha('Matrix ASCII', s, comboProfile.glowMult || 1);
                  if (master <= 0.004) return;
                  const now = customTime;
                  const dt = lastT == null ? 0.016 : Math.min(0.05, (now - lastT) / 1000);
                  lastT = now;
                  /* R2 SOFT-EYE: fewer streams when calm (×0.48), full rain only in a crescendo */
                  const nWant = Math.round(((realm === 'virtual' ? 16 : 9) + s * (realm === 'virtual' ? 30 : 18)) *
                      GlitchEngine.softMatrixK(softK()));
                  while (streams.length < nWant) streams.push(spawnStream(w, h, realm));
                  if (streams.length > nWant) streams.length = nWant;
                  const bw = bwInvertMap(bwMasterLevel());
                  const home = (typeof GHOST_KEY_HUES !== 'undefined') ? GHOST_KEY_HUES : [313, 270, 145];
                  let baseHue;
                  if (realm === 'reality') baseHue = fxLerpHue(home[0], fxConfluenceHue(0), 0.45);
                  else if (realm === 'virtual') baseHue = fxLerpHue(120, home[2], 0.40);
                  else baseHue = fxConfluenceHue(0);
                  baseHue = (baseHue + bw.hueDeg + (bw.invert > 0.004 ? 180 * (bw.invert / 0.75) : 0) + 360) % 360;
                  gctx.save();
                  gctx.textBaseline = 'top';
                  gctx.globalCompositeOperation = realm === 'reality' ? 'source-over' : 'screen';
                  for (let i = 0; i < streams.length; i++) {
                      const st = streams[i];
                      if (st.realm !== realm && Math.random() < 0.04) {
                          streams[i] = spawnStream(w, h, realm);
                          continue;
                      }
                      st.y += st.speed * dt * (0.7 + 0.6 * s) * (0.85 + 0.30 * srcEnergyK());
                      if (st.y > h + 8) {
                          streams[i] = spawnStream(w, h, realm);
                          continue;
                      }
                      gctx.font = 'bold ' + st.size.toFixed(0) + 'px "Courier New", monospace';
                      const hue = (baseHue + st.hueJit + 360) % 360;
                      for (let k = 0; k < st.glyphs.length; k++) {
                          const cellY = st.y + k * st.size * 0.92;
                          if (cellY < -st.size || cellY > h) continue;
                          if (k === 0 && Math.random() < (realm === 'virtual' ? 0.38 : 0.12)) {
                              st.glyphs[k].ch = voiceGlyph('Matrix ASCII', realm, 0);
                          }
                          const head = k === 0;
                          const trail = 1 - k / st.glyphs.length;
                          const a = master * (head ? 0.95 : 0.16 + 0.55 * trail) *
                              (0.55 + 0.45 * fxGate('Matrix ASCII'));
                          if (a < 0.02) continue;
                          if (head) {
                              gctx.shadowColor = fxHsla(hue, 100, 70, 1);
                              gctx.shadowBlur = realm === 'virtual' ? 8 : 3;
                              gctx.fillStyle = fxHsla(hue, realm === 'reality' ? 52 : 90, 86, a);
                          } else {
                              gctx.shadowBlur = 0;
                              gctx.fillStyle = fxHsla(hue, realm === 'reality' ? 38 : 72, 46 + trail * 18, a * 0.85);
                          }
                          gctx.fillText(st.glyphs[k].ch, st.x, cellY);
                      }
                      gctx.shadowBlur = 0;
                  }
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          /* =============== FACTORY 14 — MATRIX CHORD(S) · HARMONIC RAIN ======
             Three streams = live Ghost-Key chord tones (root / third / fifth).
             Reality voicings: shell / flesh / paper / street / body (close analog).
             Virtual voicings: rain / net / code / infinite / fearcomma (wide digital).
             Typesets follow the same IRL-script vs machine-glyph split. */
          function glitchMatrixChordFactory(getStrength, isPersistent) {
              const drops = [[], [], []];
              let lastT = null;
              const boardCtx = () => ({
                  ghost: getGhostMode(), vsync: getVsyncMode(),
                  warp: isAiWarpActive, bw: bwMasterLevel()
              });
              const renderFn = (progress) => {
                  const s = getStrength();
                  if (s <= 0) { drops[0].length = drops[1].length = drops[2].length = 0; lastT = null; return; }
                  const w = mainCanvas.width, h = mainCanvas.height;
                  if (w < 8 || h < 8) return;
                  const E = window.GlitchEngine;
                  const realm = E ? E.realmFromBoard(boardCtx()) : 'mix';
                  const master = effectPaintAlpha('Matrix Chord', s, comboProfile.glowMult || 1);
                  if (master <= 0.004) return;
                  const now = customTime;
                  const dt = lastT == null ? 0.016 : Math.min(0.05, (now - lastT) / 1000);
                  lastT = now;
                  const bw = bwInvertMap(bwMasterLevel());
                  const chord = FX_CHORDS[FX_KEY.idx] || FX_CHORDS[0];
                  const nPer = 4 + Math.round(s * 9);
                  gctx.save();
                  gctx.textBaseline = 'middle';
                  gctx.globalCompositeOperation = realm === 'reality' ? 'source-over' : 'screen';
                  for (let tone = 0; tone < 3; tone++) {
                      const hue = (fxTone(tone, 0) + bw.hueDeg +
                          (bw.invert > 0.004 ? 180 * (bw.invert / 0.75) : 0) + 360) % 360;
                      const bandX0 = (w / 3) * tone;
                      const list = drops[tone];
                      while (list.length < nPer) {
                          list.push({
                              x: bandX0 + Math.random() * (w / 3),
                              y: Math.random() * h,
                              v: (realm === 'virtual' ? 74 : 22) * (0.5 + Math.random()),
                              ch: voiceGlyph('Matrix Chord', realm, tone),
                              size: 12 + Math.random() * 18
                          });
                      }
                      while (list.length > nPer) list.pop();
                      for (let i = 0; i < list.length; i++) {
                          const d = list[i];
                          d.y += d.v * dt * (0.8 + 0.5 * s) * (0.85 + 0.30 * srcEnergyK());
                          if (d.y > h + 20) {
                              d.y = -20;
                              d.x = bandX0 + Math.random() * (w / 3);
                              d.ch = voiceGlyph('Matrix Chord', realm, tone);
                          }
                          if (Math.random() < 0.08) {
                              d.ch = voiceGlyph('Matrix Chord', realm, tone);
                          }
                          gctx.font = 'bold ' + d.size.toFixed(0) + 'px "Courier New", monospace';
                          const a = master * (0.32 + 0.55 * (tone === 0 ? 1 : 0.72)) *
                              (0.55 + 0.45 * fxGate('Matrix Chord'));
                          if (a < 0.02) continue;
                          gctx.fillStyle = fxHsla(hue, realm === 'virtual' ? 86 : 48, 62, a);
                          gctx.fillText(d.ch, d.x, d.y);
                      }
                  }
                  const label = ((chord && chord.name) || 'shell').toUpperCase() + ' · ' + realm.toUpperCase();
                  const ax = (FX_ENS.stage.x || 0.5) * w;
                  const ay = (FX_ENS.stage.y || 0.5) * h;
                  gctx.globalCompositeOperation = 'lighter';
                  gctx.textAlign = 'center';
                  gctx.font = 'bold ' + (16 + s * 20).toFixed(0) + 'px "Courier New", monospace';
                  gctx.fillStyle = fxHsla(fxTone(0, 0), 82, 78, master * 0.50);
                  gctx.fillText(label, ax, ay);
                  gctx.textAlign = 'start';
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }

          function techArtistInit() {
              if (techArtist.gl || techArtist.failed) return techArtist.gl;
              const cv = document.createElement('canvas');
              const gl = cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false,
                  powerPreference: 'low-power' });
              if (!gl) { techArtist.failed = true; return null; }
              const vs = 'attribute vec2 aP;void main(){gl_Position=vec4(aP,0.0,1.0);}';
              const fs = [
                  'precision mediump float;',
                  'uniform vec2 uRes;uniform float uT;uniform vec2 uM;uniform vec2 uV;uniform float uHue;uniform float uE;',
                  'mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}',
                  'void main(){',
                  '  vec2 uv=(gl_FragCoord.xy*2.0-uRes)/uRes.y;',
                  '  float vm=length(uV);',
                  '  uv+=(uM-0.5)*0.35+uV*0.4*(0.6+0.4*sin(uT*0.6));',
                  '  vec3 rd=normalize(vec3(uv,1.0+vm*0.8));',
                  '  vec3 col=vec3(0.0);',
                  '  for(float i=0.0;i<14.0;i++){',
                  '    float z=i*1.05+0.1;',
                  '    vec3 p=z*rd;',
                  '    p.xz=rot(uT*0.2+uM.x*1.4+uV.x*2.0)*p.xz;',
                  '    p.yz=rot(uT*0.15+uM.y*1.2+uV.y*2.0)*p.yz;',
                  '    p.xy=rot(sin(uT*0.35+z*0.8+vm*5.0)*0.3)*p.xy;',
                  '    for(float d=1.0;d<4.0;d+=1.0){p-=sin(p*d+uT+i*0.1).yzx/(d*0.8);}',
                  '    vec3 q=abs(p);float mx=max(max(q.x,q.y),q.z);',
                  '    float s=p.z+p.y-uT;',
                  '    float dist=abs(2.0-mx)+abs(cos(s))/7.0;',
                  '    vec4 ph=vec4((uM.x-uM.y)*2.0+vm*3.0,2.0+uM.y*2.5+vm*2.0,4.0-uM.y*2.5-vm*2.0,0.0);',
                  '    col+=(cos(s-z*0.5-dist+ph.xyz+uHue)+1.0)/(dist*(0.5+vm*0.6)+0.015);',
                  '  }',
                  '  col=col*0.38/14.0;col=col/(1.0+col);col*=1.0+uE*0.12;',
                  '  col=smoothstep(0.15,0.85,col);',
                  '  gl_FragColor=vec4(col,1.0);',
                  '}'
              ].join('\n');

              function sh(type, src) {
                  const s = gl.createShader(type);
                  gl.shaderSource(s, src);
                  gl.compileShader(s);
                  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('TA shader:', gl
                          .getShaderInfoLog(s)); return null; }
                  return s;
              }
              const vsh = sh(gl.VERTEX_SHADER, vs),
                  fsh = sh(gl.FRAGMENT_SHADER, fs);
              if (!vsh || !fsh) { techArtist.failed = true; return null; }
              const prog = gl.createProgram();
              gl.attachShader(prog, vsh);
              gl.attachShader(prog, fsh);
              gl.linkProgram(prog);
              if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { techArtist.failed = true; return null; }
              gl.useProgram(prog);
              const buf = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, buf);
              gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
              const loc = gl.getAttribLocation(prog, 'aP');
              gl.enableVertexAttribArray(loc);
              gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
              techArtist.gl = gl;
              techArtist.canvas = cv;
              techArtist.prog = prog;
              techArtist.uni = {
                  res: gl.getUniformLocation(prog, 'uRes'),
                  t: gl.getUniformLocation(prog, 'uT'),
                  m: gl.getUniformLocation(prog, 'uM'),
                  v: gl.getUniformLocation(prog, 'uV'),
                  hue: gl.getUniformLocation(prog, 'uHue'),
                  e: gl.getUniformLocation(prog, 'uE')
              };
              return gl;
          }

          const videoDistort = {
              gl: null,
              canvas: null,
              prog: null,
              tex: null,
              uni: {},
              failed: false,
              w: 0,
              h: 0,
              buf: null
          };

          function videoDistortInit() {
              if (videoDistort.gl || videoDistort.failed) return videoDistort.gl;
              const cv = document.createElement('canvas');
              const gl = cv.getContext('webgl', {
                  antialias: false,
                  alpha: false,
                  premultipliedAlpha: false,
                  powerPreference: 'low-power',
                  preserveDrawingBuffer: false
              });
              if (!gl) { videoDistort.failed = true; return null; }

              const vs =
                  'attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*0.5+0.5;gl_Position=vec4(aP,0.0,1.0);}';
              const fs = [
                  'precision mediump float;',
                  'varying vec2 vUv;',
                  'uniform sampler2D uVideo;',
                  'uniform float uTime;',
                  'uniform float uStrength;',
                  'uniform float uMotion;',
                  'uniform float uBeam;',
                  'uniform float uRipple;',
                  'uniform float uRgb;',
                  'uniform vec2 uRes;',
                  'void main(){',
                  '  vec2 uv=vUv;',
                  '  float s=clamp(uStrength,0.0,1.0);',
                  '  float m=clamp(uMotion,0.0,1.0);',
                  '  float beam=fract(uTime*0.12*uBeam);',
                  '  float dist=uv.y-beam;',
                  '  float env=exp(-dist*dist*28.0);',
                  '  float wave=sin(uv.y*22.0+uTime*2.2)*cos(uv.y*9.0+uTime*1.1);',
                  '  uv.x+=wave*0.018*s*m*uRipple*(0.35+0.65*env);',
                  '  uv.x+=sin(uv.y*6.0+uTime*0.7)*0.006*s*m;',
                  '  uv.y+=sin(uv.x*8.0+uTime*1.3)*0.004*s*m;',
                  '  float split=0.004*s*m*uRgb*(0.5+env);',
                  '  float r=texture2D(uVideo,clamp(uv+vec2(split,0.0),0.0,1.0)).r;',
                  '  float g=texture2D(uVideo,clamp(uv,0.0,1.0)).g;',
                  '  float b=texture2D(uVideo,clamp(uv-vec2(split,0.0),0.0,1.0)).b;',
                  '  vec3 col=vec3(r,g,b);',
                  '  float line=mod(gl_FragCoord.y,2.0);',
                  '  col*=0.92+0.08*step(1.0,line);',
                  '  col+=vec3(0.08,0.12,0.16)*env*s*0.5;',
                  '  gl_FragColor=vec4(col,1.0);',
                  '}'
              ].join('\n');

              function sh(type, src) {
                  const s = gl.createShader(type);
                  gl.shaderSource(s, src);
                  gl.compileShader(s);
                  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                      console.warn('VideoDistort shader:', gl.getShaderInfoLog(s));
                      return null;
                  }
                  return s;
              }
              const vsh = sh(gl.VERTEX_SHADER, vs),
                  fsh = sh(gl.FRAGMENT_SHADER, fs);
              if (!vsh || !fsh) { videoDistort.failed = true; return null; }
              const prog = gl.createProgram();
              gl.attachShader(prog, vsh);
              gl.attachShader(prog, fsh);
              gl.linkProgram(prog);
              if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                  videoDistort.failed = true;
                  return null;
              }
              gl.useProgram(prog);
              const buf = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, buf);
              gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
              const loc = gl.getAttribLocation(prog, 'aP');
              gl.enableVertexAttribArray(loc);
              gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

              const tex = gl.createTexture();
              gl.bindTexture(gl.TEXTURE_2D, tex);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

              videoDistort.gl = gl;
              videoDistort.canvas = cv;
              videoDistort.prog = prog;
              videoDistort.tex = tex;
              videoDistort.buf = buf;
              videoDistort.uni = {
                  video: gl.getUniformLocation(prog, 'uVideo'),
                  time: gl.getUniformLocation(prog, 'uTime'),
                  strength: gl.getUniformLocation(prog, 'uStrength'),
                  motion: gl.getUniformLocation(prog, 'uMotion'),
                  beam: gl.getUniformLocation(prog, 'uBeam'),
                  ripple: gl.getUniformLocation(prog, 'uRipple'),
                  rgb: gl.getUniformLocation(prog, 'uRgb'),
                  res: gl.getUniformLocation(prog, 'uRes')
              };
              gl.uniform1i(videoDistort.uni.video, 0);
              return gl;
          }

          function videoDistortStrength() {
              const vhs = effectAlphas['VHS Glitch'] || 0;
              const bands = effectAlphas['Data Bands'] || 0;
              const warp = isAiWarpActive ? 0.45 : 0;
              const base = Math.max(vhs, bands * 0.85, warp);
              return clamp01(base * masterOpacity * clamp01(masterControls.effectIntensity));
          }

          function renderVideoDistort(now) {
              if (!document.body.classList.contains('local-video')) return false;
              if (!video || video.readyState < 2 || video.paused && video.currentTime === 0) return false;
              const strength = videoDistortStrength();
              if (strength < 0.01) return false;
              const gl = videoDistortInit();
              if (!gl) return false;

              const motion = clamp01(masterControls.motionScale);
              const w = Math.max(2, (mainCanvas.width * 0.55) | 0);
              const h = Math.max(2, (mainCanvas.height * 0.55) | 0);
              if (videoDistort.canvas.width !== w || videoDistort.canvas.height !== h) {
                  videoDistort.canvas.width = w;
                  videoDistort.canvas.height = h;
                  gl.viewport(0, 0, w, h);
              }

              gl.useProgram(videoDistort.prog);
              gl.bindBuffer(gl.ARRAY_BUFFER, videoDistort.buf);
              const loc = gl.getAttribLocation(videoDistort.prog, 'aP');
              gl.enableVertexAttribArray(loc);
              gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

              gl.activeTexture(gl.TEXTURE0);
              gl.bindTexture(gl.TEXTURE_2D, videoDistort.tex);
              try {
                  // ORIENTATION: the vertex shader maps clip space to UV as
                  // vUv = aP*0.5+0.5, so v=0 is the BOTTOM of the quad. A raw
                  // texImage2D upload puts the video's FIRST (top) row at v=0,
                  // which renders the frame upside down. WebGL uploads are not
                  // flipped by default -- ask for it explicitly.
                  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
              } catch (e) {
                  return false;
              } finally {
                  // Restore the default: this flag is GL-context state, not
                  // per-texture, and this context is shared with any other
                  // uploads that (correctly) assume it is off.
                  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
              }

              const vhs = effectAlphas['VHS Glitch'] || 0;
              const bands = effectAlphas['Data Bands'] || 0;
              gl.uniform1f(videoDistort.uni.time, now * 0.001);
              gl.uniform1f(videoDistort.uni.strength, strength);
              gl.uniform1f(videoDistort.uni.motion, motion);
              gl.uniform1f(videoDistort.uni.beam, 0.7 + vhs * 0.6);
              gl.uniform1f(videoDistort.uni.ripple, 0.5 + bands * 0.8 + vhs * 0.5);
              gl.uniform1f(videoDistort.uni.rgb, 0.4 + vhs * 0.9);
              gl.uniform2f(videoDistort.uni.res, w, h);
              gl.drawArrays(gl.TRIANGLES, 0, 3);

              gctx.save();
              gctx.globalCompositeOperation = 'source-over';
              gctx.globalAlpha = 1;
              gctx.drawImage(videoDistort.canvas, 0, 0, mainCanvas.width, mainCanvas.height);
              gctx.restore();
              return true;
          }

          function glitchTechArtistShaderFactory(getStrength, isPersistent) {
              const renderFn = () => {
                  const s = getStrength();
                  if (s <= 0) return;
                  const gl = techArtistInit();
                  if (!gl) return;
                  const w = Math.max(2, (mainCanvas.width * 0.5) | 0);
                  const h = Math.max(2, (mainCanvas.height * 0.5) | 0);
                  if (techArtist.canvas.width !== w || techArtist.canvas.height !== h) {
                      techArtist.canvas.width = w;
                      techArtist.canvas.height = h;
                      gl.viewport(0, 0, w, h);
                  }
                  taVel.x *= 0.92;
                  taVel.y *= 0.92;
                  gl.uniform2f(techArtist.uni.res, w, h);
                  gl.uniform1f(techArtist.uni.t, customTime * 0.002);
                  gl.uniform2f(techArtist.uni.m, techArtistMouse.x, techArtistMouse.y);
                  gl.uniform2f(techArtist.uni.v, taVel.x, taVel.y);
                  /* v11.2: the shader plays in the ensemble's KEY — its hue is the
                     chord root and its energy swells with the master breath */
                  gl.uniform1f(techArtist.uni.hue, fxTone(0) * 0.0174533);
                  gl.uniform1f(techArtist.uni.e, clamp01(videoPalette.energy) * (0.65 + 0.35 * FX_ENS.breath));
                  gl.drawArrays(gl.TRIANGLES, 0, 3);
                  gctx.save();
                  gctx.globalCompositeOperation = 'screen';
                  /* toned + ensemble-mixed: resonance gate and auto-mix duck apply */
                  const gate = 0.40 + 0.60 * fxGate('Tech Artist');
                  const duck = FX_ENS.duck['Tech Artist'] || 1;
                  gctx.globalAlpha = Math.min(0.45, s * 0.45 * (comboProfile.glowMult || 1)) * gate * duck;
                  gctx.drawImage(techArtist.canvas, 0, 0, mainCanvas.width, mainCanvas.height);
                  gctx.restore();
              };
              return isPersistent ? renderFn : createTimedEffect(renderFn);
          }
          let techArtistMouse = { x: 0.5, y: 0.5 };
          window.addEventListener('mousemove', (ev) => {
              const nx = ev.clientX / window.innerWidth;
              const ny = 1 - (ev.clientY / window.innerHeight);
              const dx = nx - techArtistMouse.x,
                  dy = ny - techArtistMouse.y;
              techArtistMouse = { x: nx, y: ny };
              taVel.x = clamp(dx * 6, -1, 1);
              taVel.y = clamp(dy * 6, -1, 1);
          }, { passive: true });

          /* ------------------------------------------------------------------ *
           *  8. Effect registry, alphas, slider panel                           *
           * ------------------------------------------------------------------ */
          /* R1 OLD-SOUL (006 final): all defaults are 0 on purpose — "what
             the sliders say" and "what is rendered" stay in sync: an effect
             exists on screen only if the user (or a preset / Auto Glitch)
             turned its slider up. The v11.3 toned boot levels (Neon .20 /
             Scanlines .16 / Flash .32 / HSL .24 / ASCII .28 / FontBurn .40 /
             Strobe .40 / Gemini .36 / TechArtist .20) live on as the machine
             preset 'Deepseek-1 · OLD SOUL'. */
          const timedEffectsDefs = [
              { name: 'Neon Grad', factory: glitchNeonGradientOverlayFactory, defaultAlpha: 0 },
              { name: 'Scanlines', factory: glitchScanlinesFactory, defaultAlpha: 0 },
              { name: 'Flash', factory: glitchBrightFlashFactory, defaultAlpha: 0 },
              { name: 'HSL Rainbow', factory: glitchHSLRainbowFactory, defaultAlpha: 0 },
              { name: 'ASCII', factory: glitchASCIIArtOverlayFactory, defaultAlpha: 0 },
              { name: 'Font Burn', factory: glitchFontBurnFactory, defaultAlpha: 0 },
              { name: 'Strobe', factory: glitchStrobeFactory, defaultAlpha: 0 },
              { name: 'Gemini Bomb', factory: glitchGeminiBombFactory, defaultAlpha: 0 },
              { name: 'Tech Artist', factory: glitchTechArtistShaderFactory, defaultAlpha: 0 },
              { name: 'Data Bands', factory: glitchVHSFactory, defaultAlpha: 0 },
              { name: 'VHS Glitch', factory: glitchVHSGlitchFactory, defaultAlpha: 0 },
              { name: 'Data Bomb', factory: glitchDataBombFactory, defaultAlpha: 0 },
              { name: 'Ink Glyphs', factory: glitchInkGlyphsFactory, defaultAlpha: 0 },
              { name: 'Matrix ASCII', factory: glitchMatrixAsciiFactory, defaultAlpha: 0 },
              { name: 'Matrix Chord', factory: glitchMatrixChordFactory, defaultAlpha: 0 },
              { name: 'Chromatic Echo', factory: chromaticEchoFactory, defaultAlpha: 0 },
              { name: 'Temporal Slices', factory: temporalSlicesFactory, defaultAlpha: 0 },
              { name: 'Signal Tear', factory: signalTearFactory, defaultAlpha: 0 },
              { name: 'Cyber Rain', factory: cyberRainFactory, defaultAlpha: 0 },
              { name: 'Prism Rift', factory: prismRiftFactory, defaultAlpha: 0 },
              { name: 'Orbit HUD', factory: orbitHudFactory, defaultAlpha: 0 },
              { name: 'Rolling Scan', factory: rollingScanFactory, defaultAlpha: 0 },
              { name: 'Tape Grain', factory: tapeGrainFactory, defaultAlpha: 0 },
              { name: 'Tracking Tear', factory: trackingTearFactory, defaultAlpha: 0 },
              { name: 'R3 Neon Grad', factory: r3Factory('Neon Grad'), defaultAlpha: 0 },
              { name: 'R3 Scanlines', factory: r3Factory('Scanlines'), defaultAlpha: 0 },
              { name: 'R3 Gemini Bomb', factory: r3Factory('Gemini Bomb'), defaultAlpha: 0 },
              { name: 'R3 Tech Artist', factory: r3Factory('Tech Artist'), defaultAlpha: 0 },
              { name: 'R3 Data Bomb', factory: r3Factory('Data Bomb'), defaultAlpha: 0 },
              { name: 'R3 Ink Glyphs', factory: r3Factory('Ink Glyphs'), defaultAlpha: 0 },
              { name: 'R3 Matrix ASCII', factory: r3Factory('Matrix ASCII'), defaultAlpha: 0 },
              { name: 'R3 Matrix Chord', factory: r3Factory('Matrix Chord'), defaultAlpha: 0 },
              { name: 'R3 HSL Rainbow', factory: r3Factory('HSL Rainbow'), defaultAlpha: 0 },
              { name: 'R3 ASCII', factory: r3Factory('ASCII'), defaultAlpha: 0 },
              { name: 'R3 Font Burn', factory: r3Factory('Font Burn'), defaultAlpha: 0 },
              { name: 'R3 Data Bands', factory: r3Factory('Data Bands'), defaultAlpha: 0 },
              { name: 'R3 VHS Glitch', factory: r3Factory('VHS Glitch'), defaultAlpha: 0 },
              { name: 'R3 Ghost Spectrum', factory: r3SystemFactory('ghost'), defaultAlpha: 0 },
              { name: 'R3 V-Sync', factory: r3SystemFactory('vsync'), defaultAlpha: 0 }
          ];
          /* Filter-path voices. The AI WARP GC#(3) twins pair with the core B&W and
             Hue voices and feed the same final compositor (see fxPairLevel). */
          const masterEffectsDefs = [
              { name: 'B&W Invert', defaultAlpha: 0 },
              { name: 'Hue/Color Cycle', defaultAlpha: 0 },
              { name: 'R3 B&W Invert', defaultAlpha: 0 },
              { name: 'R3 Hue/Color Cycle', defaultAlpha: 0 }
          ];
          const effectAlphas = {};
          /* 0..1 gate on Flash/Strobe output; eases to 0 while local media is held. */
          let lightHold = 1;
          function isManualLight(name) {
              return name === 'Flash' || name === 'Strobe';
          }
          function automationHeld(name) {
              return isManualLight(name) || !!sliderLocks[name];
          }
          function paintLightLock(name) {
              const group = sliderElements[name] && sliderElements[name].closest('.slider-group');
              const btn = group && group.querySelector('.lock-button');
              if (!btn) return;
              btn.classList.toggle('locked', !!sliderLocks[name]);
              btn.textContent = sliderLocks[name] ? '[LOCKED!]' : '<LOCK!>';
          }
          /* Flash and Strobe are always capped; the session switch only
             controls their automatic movement (off by default). */
          const LIGHT_CEILING = { Flash: 0.20, Strobe: 0.35 };
          const LIGHT_STOP_EPSILON = 0.005;
          const LIGHT_WANDER_RATE = 1.1;
          const LIGHT_HOLD_RATE = 3;
          const LIGHT_ARM_RATE = 3;
          const LIGHT_SWITCH_PROMPT = 'Flash & Strobe (automatic)\n\n' +
              'When on, Flash and Strobe move on their own on any media, never above 20% (Flash) or 35% (Strobe). They fade in over about a second. While local media is paused or ended, their movement stops and their output eases to 0. They resume on play. YouTube is never held. The same caps apply to manual slider and preset levels.\n\n' +
              'When off, automatic movement stops and the capped slider or preset levels remain active. Their levels and locks are kept.\n\n' +
              'Flashing lights can trigger seizures in people with photosensitive epilepsy. The caps limit the level only. This is not a photosensitivity-safe mode.\n\n' +
              'Turn it on?';
          let lightAutomationOn = false;
          let lightSwitchEl = null;
          /* The level the user set for each light. While the switch is ON,
             effectAlphas holds the moving wander position instead. */
          const lightStored = {};
          /* 0..1 fade-in of the output after the switch turns ON; 0 while OFF. */
          let lightArm = 0;
          const lightStoppedByUser = {};
          const lightWanderAt = {};
          const lightWanderTarget = {};
          function lightCap(name) {
              return Object.prototype.hasOwnProperty.call(LIGHT_CEILING, name) ? LIGHT_CEILING[name] : Infinity;
          }
          function clampLight(name, v) {
              return Math.min(lightCap(name), clamp01(+v || 0));
          }
          function paintLightSwitch() {
              if (!lightSwitchEl) return;
              lightSwitchEl.textContent = 'Flash & Strobe (automatic): ' + (lightAutomationOn ? 'ON' : 'OFF');
              lightSwitchEl.setAttribute('aria-pressed', lightAutomationOn ? 'true' : 'false');
          }
          function setLightAutomation(on) {
              const next = !!on;
              if (next !== lightAutomationOn) {
                  lightAutomationOn = next;
                  lightArm = 0;
                  /* ON: the slider levels become the stored levels. OFF restores
                     stored levels, except a hand-locked light keeps its current level. */
                  ['Flash', 'Strobe'].forEach((name) => {
                      const level = next ? (effectAlphas[name] || 0) :
                          (sliderLocks[name] ? (effectAlphas[name] || 0) : (lightStored[name] || 0));
                      setLightLevelNow(name, level);
                  });
              }
              /* Every ON call restarts the wander, including a repeat call while
                 already ON (for example from the Ghost egg). */
              if (lightAutomationOn) {
                  ['Flash', 'Strobe'].forEach((name) => {
                      lightStoppedByUser[name] = false;
                      lightWanderAt[name] = 0;
                      crParked[name] = (effectAlphas[name] || 0) < PARKED_EFFECT_EPSILON;
                  });
              }
              paintLightSwitch();
          }
          function setLightLevelNow(name, v) {
              const level = clampLight(name, v);
              effectAlphas[name] = level;
              lightStored[name] = level;
              randomTargets[name] = level;
              sliderWritten[name] = level;
              lightStoppedByUser[name] = false;
              lightWanderTarget[name] = level;
              crParked[name] = level < PARKED_EFFECT_EPSILON;
              /* Drop the eased copy so the next frame starts from the new level. */
              delete smoothedStrength[name];
              if (sliderElements[name]) sliderElements[name].value = level.toFixed(3);
              updateContinuousEffectsCache(name);
          }
          /* R4.1 per-light variation, re-rolled at each target change. Bounds keep the
             lights gentle: targets change at most about once per 1.2 s, the ease never
             speeds up past 1.2x, and the caps are applied afterwards as before. */
          const lightTrait = { Flash: { pow: 1.6, rate: 1, rest: 0.1 }, Strobe: { pow: 1.6, rate: 1, rest: 0.1 } };
          function rollLightTrait(name) {
              lightTrait[name] = {
                  pow: 1.3 + Math.random() * 1.0,
                  rate: 0.7 + Math.random() * 0.5,
                  rest: Math.random() * 0.25
              };
          }
          function stepLightWander(now, dt) {
              if (!lightAutomationOn) return;
              const eng = window.GlitchEngine;
              ['Flash', 'Strobe'].forEach((name) => {
                  if (sliderLocks[name]) return;
                  if (lightStoppedByUser[name]) {
                      lightWanderTarget[name] = 0;
                  } else if (now >= (lightWanderAt[name] || 0)) {
                      rollLightTrait(name);
                      const lt = lightTrait[name];
                      lightWanderAt[name] = now + 1200 + Math.random() * 2800;
                      /* Squaring the roll makes high levels occasional, and a light skips
                         its peak while the other one is still near its own ceiling. */
                      let t = Math.random() < lt.rest ? 0 : Math.pow(Math.random(), lt.pow) * lightCap(name);
                      const other = name === 'Flash' ? 'Strobe' : 'Flash';
                      if ((effectAlphas[other] || 0) > 0.5 * lightCap(other)) t *= 0.4;
                      if (eng && eng.softCap) t = eng.softCap(name, t, softK());
                      if (eng && eng.confineTarget) {
                          t = eng.confineTarget(name, t, {
                              ghost: getGhostMode(), vsync: getVsyncMode(),
                              warp: isAiWarpActive, bw: bwMasterLevel()
                          });
                      }
                      lightWanderTarget[name] = clampLight(name, t);
                  }
                  const cur = effectAlphas[name] || 0;
                  const goal = clampLight(name, lightWanderTarget[name] || 0);
                  let next = clampLight(name, easeExp(cur, goal, dt, LIGHT_WANDER_RATE * lightTrait[name].rate));
                  /* Snap the last sliver so a stopped light lands on exactly 0. */
                  if (Math.abs(goal - next) < 0.0005) next = goal;
                  if (next === cur) return;
                  effectAlphas[name] = next;
                  crParked[name] = next < PARKED_EFFECT_EPSILON;
                  updateContinuousEffectsCache(name);
                  const el = sliderElements[name];
                  if (el && (next === goal || sliderWritten[name] === undefined || Math.abs(next - sliderWritten[name]) > 0.006)) {
                      sliderWritten[name] = next;
                      el.value = next.toFixed(3);
                  }
              });
          }
          /* Eases the output in after the switch turns ON, so a light never
             jumps straight to its level. */
          function stepLightArm(dt) {
              if (!lightAutomationOn) { lightArm = 0; return; }
              lightArm = easeExp(lightArm, 1, dt, LIGHT_ARM_RATE);
              if (1 - lightArm < 0.001) lightArm = 1;
          }
          /* Local-media hold and fade-in apply only during automatic movement.
             Manual and preset levels remain live while the switch is OFF. */
          function lightOutputGate() {
              return lightAutomationOn ? lightArm * lightHold : 1;
          }
          /* YouTube and the canvas never hold: neither sets a local body class. */
          function localMediaHeld() {
              const body = document.body.classList;
              if (body.contains('local-video')) return !!video && (video.paused || video.ended);
              if (body.contains('local-audio')) return !!localAudio && (localAudio.paused || localAudio.ended);
              return false;
          }
          function stepLightHold(dt) {
              const target = localMediaHeld() ? 0 : 1;
              lightHold = easeExp(lightHold, target, dt, LIGHT_HOLD_RATE);
              if (Math.abs(target - lightHold) < 0.001) lightHold = target;
          }
          /* The level as the output reads it, including automation fades. */
          function heldLevel(name) {
              const v = +(effectAlphas[name] || 0);
              return isManualLight(name) ? v * lightOutputGate() : v;
          }
          const smoothedStrength = {};
          const continuousEffectCache = {};
          const triggerTimestamps = {};
          const STRENGTH_SETTLE_EPSILON = 0.004;
          let globalSliderEl = null;

          const blendProfiles = {
              /* v11: every ambient floor is > 0 — no effect is systematically parked
                 at 0 anymore. Peaks stay full-range so any slider can linger and
                 peak 0-100%. Only ZERO ALL EFFECTS parks levels. */
              'ASCII':          { ambient: [0.03, 0.14], peak: [0.25, 1.0],  rate: 0.18 },
              'B&W Invert':     { ambient: [0.02, 0.12], peak: [0.15, 1.0],  rate: 0.10 },
              'Data Bands':     { ambient: [0.03, 0.14], peak: [0.20, 1.0],  rate: 0.14 },
              'Data Bomb':      { ambient: [0.02, 0.10], peak: [0.10, 0.90], rate: 0.12 },
              'Flash':          { ambient: [0.02, 0.10], peak: [0.20, 1.0],  rate: 0.18 },
              'Font Burn':      { ambient: [0.02, 0.12], peak: [0.18, 1.0],  rate: 0.15 },
              'Gemini Bomb':    { ambient: [0.02, 0.08], peak: [0.08, 0.85], rate: 0.12 },
              'HSL Rainbow':    { ambient: [0.03, 0.14], peak: [0.25, 1.0],  rate: 0.16 },
              'Hue/Color Cycle':{ ambient: [0.03, 0.14], peak: [0.25, 1.0],  rate: 0.18 },
              'Ink Glyphs':     { ambient: [0.02, 0.12], peak: [0.15, 0.85], rate: 0.15 },
              'Matrix ASCII':   { ambient: [0.04, 0.16], peak: [0.22, 1.0],  rate: 0.16 },
              'Matrix Chord':   { ambient: [0.03, 0.14], peak: [0.18, 0.95], rate: 0.15 },
              'Neon Grad':      { ambient: [0.02, 0.12], peak: [0.20, 1.0],  rate: 0.14 },
              'Chromatic Echo':{ ambient: [0.02, 0.09], peak: [0.16, 0.75], rate: 0.12 },
              'Temporal Slices':{ ambient: [0.01, 0.07], peak: [0.12, 0.62], rate: 0.10 },
              'Signal Tear':    { ambient: [0.02, 0.10], peak: [0.16, 0.78], rate: 0.13 },
              'Cyber Rain':     { ambient: [0.02, 0.10], peak: [0.18, 0.78], rate: 0.12 },
              'Prism Rift':     { ambient: [0.02, 0.10], peak: [0.16, 0.75], rate: 0.12 },
              'Orbit HUD':      { ambient: [0.02, 0.10], peak: [0.18, 0.78], rate: 0.11 },
              'Rolling Scan':   { ambient: [0.03, 0.12], peak: [0.18, 0.70], rate: 0.13 },
              'Tape Grain':     { ambient: [0.01, 0.08], peak: [0.12, 0.60], rate: 0.10 },
              'Tracking Tear':  { ambient: [0.02, 0.10], peak: [0.16, 0.72], rate: 0.12 },
              'R3 Neon Grad':   { ambient: [0.01, 0.07], peak: [0.12, 0.55], rate: 0.12 },
              'R3 Scanlines':   { ambient: [0.02, 0.08], peak: [0.14, 0.58], rate: 0.11 },
              'R3 Gemini Bomb': { ambient: [0.01, 0.06], peak: [0.10, 0.50], rate: 0.10 },
              'R3 Tech Artist': { ambient: [0.01, 0.07], peak: [0.12, 0.52], rate: 0.11 },
              'R3 Data Bomb':   { ambient: [0.01, 0.06], peak: [0.10, 0.50], rate: 0.10 },
              'R3 Ink Glyphs':  { ambient: [0.01, 0.07], peak: [0.12, 0.55], rate: 0.11 },
              'R3 Matrix ASCII':{ ambient: [0.02, 0.08], peak: [0.14, 0.60], rate: 0.12 },
              'R3 Matrix Chord':{ ambient: [0.02, 0.08], peak: [0.14, 0.58], rate: 0.12 },
              'R3 HSL Rainbow': { ambient: [0.01, 0.07], peak: [0.12, 0.55], rate: 0.12 },
              'R3 ASCII':       { ambient: [0.02, 0.08], peak: [0.14, 0.60], rate: 0.12 },
              'R3 Font Burn':   { ambient: [0.01, 0.07], peak: [0.12, 0.55], rate: 0.11 },
              'R3 Data Bands':  { ambient: [0.01, 0.07], peak: [0.12, 0.55], rate: 0.11 },
              'R3 VHS Glitch':  { ambient: [0.01, 0.07], peak: [0.12, 0.55], rate: 0.11 },
              'R3 B&W Invert':  { ambient: [0.01, 0.06], peak: [0.10, 0.70], rate: 0.08 },
              'R3 Hue/Color Cycle':{ ambient: [0.02, 0.10], peak: [0.18, 0.80], rate: 0.14 },
              'R3 Ghost Spectrum':{ ambient: [0.01, 0.06], peak: [0.10, 0.45], rate: 0.10 },
              'R3 V-Sync':      { ambient: [0.01, 0.06], peak: [0.10, 0.45], rate: 0.10 },
              'Scanlines':      { ambient: [0.03, 0.14], peak: [0.20, 1.0],  rate: 0.14 },
              'Strobe':         { ambient: [0.02, 0.10], peak: [0.20, 1.0],  rate: 0.20 },
              'Tech Artist':    { ambient: [0.02, 0.12], peak: [0.18, 1.0],  rate: 0.14 },
              'VHS Glitch':     { ambient: [0.03, 0.12], peak: [0.18, 1.0],  rate: 0.14 }
          };
          const profileNames = Object.keys(blendProfiles);
          const peakPool = ['Hue/Color Cycle', 'HSL Rainbow', 'Neon Grad', 'Data Bands', 'VHS Glitch', 'Scanlines',
              'ASCII', 'Font Burn', 'Tech Artist', 'Ink Glyphs', 'Matrix ASCII', 'Matrix Chord', 'B&W Invert',
              'Chromatic Echo', 'Temporal Slices', 'Signal Tear', 'Cyber Rain', 'Prism Rift', 'Orbit HUD',
              'Rolling Scan', 'Tape Grain', 'Tracking Tear', 'R3 Neon Grad', 'R3 Scanlines',
              'R3 Gemini Bomb', 'R3 Tech Artist', 'R3 Data Bomb', 'R3 Ink Glyphs',
              'R3 Matrix ASCII', 'R3 Matrix Chord', 'R3 HSL Rainbow', 'R3 ASCII', 'R3 Font Burn',
              'R3 Data Bands', 'R3 VHS Glitch', 'R3 B&W Invert', 'R3 Hue/Color Cycle',
              'R3 Ghost Spectrum', 'R3 V-Sync'
          ];
          const MAX_EFFECT_CAP = 1.0;
          /* v11.2 TONED-DOWN paint ceilings — the Harmonic Ensemble keeps every
             voice polite: sliders still travel 0-100%, but the paint never
             slams. Flash/Strobe are gated temporally AND tonally now. */
          const EFFECT_ALPHA_CAPS = {
              'Neon Grad':       0.50,
              'Chromatic Echo': 0.40, 'Temporal Slices': 0.32, 'Signal Tear': 0.42,
              'Cyber Rain': 0.44, 'Prism Rift': 0.40, 'Orbit HUD': 0.42,
              'Rolling Scan': 0.38, 'Tape Grain': 0.34, 'Tracking Tear': 0.38,
              'R3 Neon Grad': 0.38, 'R3 Scanlines': 0.34, 'R3 Gemini Bomb': 0.32,
              'R3 Tech Artist': 0.35, 'R3 Data Bomb': 0.32, 'R3 Ink Glyphs': 0.52,
              'R3 Matrix ASCII': 0.42, 'R3 Matrix Chord': 0.40,
              'R3 HSL Rainbow': 0.36, 'R3 ASCII': 0.46, 'R3 Font Burn': 0.40,
              'R3 Data Bands': 0.40, 'R3 VHS Glitch': 0.38,
              'R3 B&W Invert': 1.0, 'R3 Hue/Color Cycle': 1.0,
              'R3 Ghost Spectrum': 0.30, 'R3 V-Sync': 0.30,
              'Scanlines':       0.40,
              'Flash':           0.46,
              'HSL Rainbow':     0.42,
              'ASCII':           0.55,
              'Font Burn':       0.50,
              'Strobe':          0.38,
              'Gemini Bomb':     0.42,
              'Tech Artist':     0.45,
              'Data Bands':      0.50,
              'VHS Glitch':      0.48,
              'Data Bomb':       0.42,
              'Matrix ASCII':    0.62,
              'Matrix Chord':    0.58,
              'Ink Glyphs':      1.0,   // R1.1 PRISM INK: opaque by design — the ensemble
                                         // keys the spawn RATE (gate/duck/masters), not opacity
              'B&W Invert':      1.0,   // filter-path effect (applyMasterFilters)
              'Hue/Color Cycle': 1.0    // filter-path effect (applyMasterFilters)
          };

          function effectPaintAlpha(name, strength, mult) {
              const s = Math.max(0, Math.min(1, +strength || 0));
              if (s <= 0) return 0;
              // When AI Warp is active, warp-blend effects use their boosted caps
              const cap = (isAiWarpActive && WARP_BLEND_EFFECTS && WARP_BLEND_EFFECTS.has(name) && WARP_BLEND_ALPHA_CAPS[name] != null)
                  ? WARP_BLEND_ALPHA_CAPS[name]
                  : EFFECT_ALPHA_CAPS[name];
              const peak = (cap == null) ? 0.55 : cap;
              const m = (mult == null) ? 1 : Math.max(0.35, +mult || 1);
              const intensity = masterControls ? Math.max(0.1, +masterControls.effectIntensity || 1) : 1;
              /* v11.2 HARMONIC ENSEMBLE: every paint alpha passes through the
                 voice's resonance gate (turn-taking hand-offs) and the ensemble
                 auto-mix (gentle mutual ducking on a busy board) — this is what
                 makes the effects KEY INTO each other and TRANSITION instead of
                 stacking into mush. */
              const gate = (typeof fxGate === 'function') ? fxGate(name) : 1;
              const duck = (typeof FX_ENS !== 'undefined' && FX_ENS.duck[name] != null) ? FX_ENS.duck[name] : 1;
              /* R1.5: THE source factor — every paint alpha in the engine
                 breathes with the background canvas: an energetic source
                 lifts the whole board (up to +14%), a calm one holds it back
                 (-14%). The source is the modifier of the entire engine. */
              const srcK = (typeof srcEnergyK === 'function') ? (0.86 + 0.28 * srcEnergyK()) : 1;
              /* R2 SOFT-EYE: the light voices and busy glyph voices paint
                 softer while calm; the multiplier lifts to 1.0 in a crescendo */
              const softP = (window.GlitchEngine && GlitchEngine.softPaintK) ? GlitchEngine.softPaintK(name, softK()) : 1;
              return Math.min(1, s * peak * m * intensity * gate * duck * srcK * softP);
          }

          function boardHarmony() {
              let lit = 0,
                  sum = 0;
              for (let i = 0; i < profileNames.length; i++) {
                  const a = heldLevel(profileNames[i]);
                  if (a > 0.03) { lit++;
                      sum += a; }
              }
              const systems = (isAiWarpActive ? 1 : 0) +
                  (isAutoGlitching ? 1 : 0) +
                  (isContinuallyRandomizing ? 0.5 : 0) +
                  ((getGhostMode && getGhostMode() !== 'OFF') ? 1 : 0) +
                  ((typeof getVsyncMode === 'function' && getVsyncMode() !== 'OFF') ? 1 : 0);
              const softAmt = (masterControls && masterControls.blendSoftness != null) ?
                  clamp01(masterControls.blendSoftness) : 0.45;
              const crowd = clamp(1 - lit * 0.03 * softAmt - systems * 0.04 * softAmt, 0.7, 1);
              const energy = lit ? sum / lit : 0;
              const soft = crowd * (0.88 + 0.12 * (1 - Math.min(1, energy)));
              return 1 - (1 - soft) * softAmt;
          }

          function motionGlow() {
              const g = (comboProfile && comboProfile.glowMult) || 1;
              return 1 + (g - 1) * 0.45 * boardHarmony();
          }

          function updateSmoothedStrengths(dt) {
              let settling = false;
              const glitchBoost = isAutoGlitching ? (1 + (0.08 + 0.35 * clamp01(masterControls.autoGlitchPower)) * (
                  autoGlitchLevel || 0)) : 1;
              const mode = (typeof randBehavior === 'string' ? randBehavior : 'smooth');
              const blendTempo = {
                  smooth: 0.82,
                  snap: 2.05,
                  flipflop: 1.45,
                  burst: 1.95,
                  linger: 0.32
              } [mode] || 0.82;
              let lit = 0,
                  energy = 0;
              for (let i = 0; i < profileNames.length; i++) {
                  const a = heldLevel(profileNames[i]);
                  if (a > 0.04) { lit++;
                      energy += a; }
              }
              const crowd = lit > 4 ? 0.72 : lit > 2 ? 0.88 : 1;
              const harmony = crowd * (0.85 + 0.15 * Math.min(1, energy / Math.max(1, lit)));

              const intensity = clamp01(masterControls.effectIntensity);
              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  const raw = Math.min(lightCap(name), clamp01((effectAlphas[name] || 0) * masterOpacity * (automationHeld(name) ? 1 : glitchBoost) * intensity));
                  const rate = (blendProfiles[name].rate || 0.2) * 5.0 * blendTempo * harmony * ((SOFT.enabled && SOFT.k < 0.45) ? 0.62 : 1) * (document.body.classList.contains('hard-light') ? 1.12 : 1);
                  const prev = smoothedStrength[name] === undefined ? raw : smoothedStrength[name];
                  const rateUse = raw < 0.01 ? rate * 1.28 : rate;
                  const next = dt > 0 ? easeExp(prev, raw, dt, rateUse) : raw;
                  smoothedStrength[name] = next;
                  if (Math.abs(next - raw) > STRENGTH_SETTLE_EPSILON) settling = true;
              }
              return settling;
          }

          const timedEffectDefByName = {};
          timedEffectsDefs.forEach((d) => { timedEffectDefByName[d.name] = d; });

          function effectLiveStrength(name) {
              const a = +(effectAlphas[name] || 0);
              if (a <= 0) return 0;
              const intensity = masterControls ? Math.max(0.05, +masterControls.effectIntensity || 1) : 1;
              const live = a * Math.max(0, +masterOpacity || 0) * intensity;
              const sm = smoothedStrength[name];
              const level = Math.min(lightCap(name), (sm === undefined) ? live : Math.max(+sm || 0, live));
              return isManualLight(name) ? level * lightOutputGate() : level;
          }

          function updateContinuousEffectsCache(specificName) {
              const sync = (name) => {
                  const alpha = +(effectAlphas[name] || 0);
                  let cached = continuousEffectCache[name];
                  const def = timedEffectDefByName[name];
                  if (!def || typeof def.factory !== 'function') return;

                  if (alpha > 0) {
                      if (!cached) {
                          const getStrength = () => effectLiveStrength(name);
                          try {
                              cached = def.factory(getStrength, true);
                          } catch (err) {
                              console.warn('[glitch] factory failed', name, err);
                              return;
                          }
                          if (typeof cached !== 'function') return;
                          continuousEffectCache[name] = cached;
                      }
                      if (activeEffects.indexOf(cached) === -1) activeEffects.push(cached);
                  } else if (cached) {
                      const idx = activeEffects.indexOf(cached);
                      if (idx > -1) activeEffects.splice(idx, 1);
                      delete continuousEffectCache[name];
                  }
              };
              if (specificName) { sync(specificName); return; }
              for (let i = 0; i < timedEffectsDefs.length; i++) sync(timedEffectsDefs[i].name);
          }

          (function buildSliders() {
              const globalLabel = document.createElement('label');
              globalLabel.textContent = 'Global Opacity:';
              const globalSlider = document.createElement('input');
              globalSlider.type = 'range';
              globalSlider.min = 0;
              globalSlider.max = 1;
              globalSlider.step = 0.01;
              globalSlider.value = masterOpacity;
              globalSlider.addEventListener('input', () => {
                  masterOpacity = parseFloat(globalSlider.value) || 0;
                  for (let i = 0; i < profileNames.length; i++) {
                      const n = profileNames[i];
                      const a = effectAlphas[n] || 0;
                      if (a > 0) {
                          const intensity = masterControls ? Math.max(0.05, +masterControls.effectIntensity || 1) : 1;
                          smoothedStrength[n] = Math.min(lightCap(n), a * masterOpacity * intensity);
                      }
                  }
                  updateContinuousEffectsCache();
                  if (typeof restartAutomatedLevels === 'function') restartAutomatedLevels('global');
              });
              const globalLock = document.createElement('button');
              globalLock.className = 'lock-button';
              globalLock.textContent = '<LOCK!>';
              globalLock.addEventListener('click', () => {
                  toggleUserLock('global');
                  globalLock.classList.toggle('locked', sliderLocks.global);
                  globalLock.textContent = sliderLocks.global ? '[LOCKED!]' : '<LOCK!>';
              });
              const row = document.createElement('div');
              row.className = 'slider-group';
              row.appendChild(globalLabel);
              row.appendChild(globalSlider);
              row.appendChild(globalLock);
              sliderContainer.appendChild(row);
              globalSliderEl = globalSlider;

              /* Not a slider-group: the lock-sync code keys off that class. */
              const lightSwitchRow = document.createElement('div');
              lightSwitchRow.className = 'light-switch-row';
              const lightSwitch = document.createElement('button');
              lightSwitch.type = 'button';
              lightSwitch.className = 'light-switch-button';
              lightSwitch.title = 'Off by default; session only and not saved in presets. While ON, Flash and Strobe move on their own on any media, never above 20% or 35%, fading in over about a second. While local media is paused or ended, their movement stops and output eases to 0. The same caps apply to manual slider and preset levels. While OFF, automatic movement stops but capped manual and preset levels remain active; levels and locks are kept.';
              lightSwitch.addEventListener('click', () => {
                  if (lightAutomationOn) {
                      setLightAutomation(false);
                  } else if (window.confirm(LIGHT_SWITCH_PROMPT)) {
                      setLightAutomation(true);
                  }
              });
              lightSwitchRow.appendChild(lightSwitch);
              sliderContainer.appendChild(lightSwitchRow);
              lightSwitchEl = lightSwitch;
              paintLightSwitch();

              const allDefs = [...timedEffectsDefs, ...masterEffectsDefs].sort((a, b) => (a.name < b.name ? -1 :
              1));
              allDefs.forEach((def) => {
                  const startLevel = isManualLight(def.name) ? clampLight(def.name, def.defaultAlpha) : def.defaultAlpha;
                  effectAlphas[def.name] = startLevel;
                  sliderLocks[def.name] = false;
                  const group = document.createElement('div');
                  group.className = 'slider-group';
                  const label = document.createElement('label');
                  label.textContent = (def.name === 'HSL Rainbow' ? 'Hue Saturation Lighting Rainbow' : def.name) + ':';
                  const slider = document.createElement('input');
                  slider.type = 'range';
                  slider.min = 0;
                  slider.max = 1;
                  slider.step = 0.01;
                  slider.value = startLevel;
                  slider.setAttribute('aria-label', def.name);
                  if (isManualLight(def.name)) {
                      const cap = lightCap(def.name);
                      const capText = Math.round(cap * 100) + '%';
                      slider.max = cap;
                      label.textContent = def.name + ' (max ' + capText + '):';
                      slider.title = 'Manual level, capped at ' + capText + '. Output remains active while automatic movement is OFF.';
                  }
                  sliderElements[def.name] = slider;
                  slider.addEventListener('input', () => {
                      const v = clampLight(def.name, parseFloat(slider.value) || 0);
                      effectAlphas[def.name] = v;
                      randomTargets[def.name] = v;
                      sliderWritten[def.name] = v;
                      /* R1 (006 final): a manual set is park/unpark intent —
                         dragging to 0 parks it for CR, dragging up re-arms it.
                         R4.1.3: dragging to 0 also CANCELS the effect — no
                         automation may restart it until the user wakes it. */
                      crParked[def.name] = v < PARKED_EFFECT_EPSILON;
                      setEffectCancelled(def.name, v < PARKED_EFFECT_EPSILON);
                      if (isManualLight(def.name)) {
                          lightStoppedByUser[def.name] = v < LIGHT_STOP_EPSILON;
                          lightStored[def.name] = v;
                          lightWanderTarget[def.name] = v;
                      }
                      /* v11: touching a slider after ZERO ALL EFFECTS restarts the
                         levels — a parked (0) global opacity is revived so the touch
                         is actually visible, and the automation systems wake up. */
                      if (!sliderLocks.global && (+masterOpacity || 0) <= 0.02) {
                          masterOpacity = 0.85;
                          randomTargets.global = masterOpacity;
                          sliderWritten.global = masterOpacity;
                          if (globalSliderEl) globalSliderEl.value = masterOpacity.toFixed(3);
                      }
                      const intensity = masterControls ? Math.max(0.05, +masterControls
                          .effectIntensity || 1) : 1;
                      smoothedStrength[def.name] = Math.min(lightCap(def.name),
                          v * Math.max(0.05, +masterOpacity || 1) * intensity);
                      updateContinuousEffectsCache(def.name);
                      if (typeof restartAutomatedLevels === 'function') restartAutomatedLevels('slider');
                  });
                  group.appendChild(label);
                  group.appendChild(slider);

                  if (timedEffectsDefs.some((t) => t.name === def.name)) {
                      const trigger = document.createElement('button');
                      trigger.className = 'trigger-button';
                      trigger.textContent = 'Trigger';
                      trigger.addEventListener('click', () => {
                          const now = Date.now();
                          triggerTimestamps[def.name] = (triggerTimestamps[def.name] || [])
                              .filter((ts) => now - ts < 5000);
                          if (triggerTimestamps[def.name].length < 5) {
                              triggerTimestamps[def.name].push(now);
                              triggerTimedEffect(def);
                          }
                      });
                      group.appendChild(trigger);
                  }

                  const lock = document.createElement('button');
                  lock.className = 'lock-button';
                  lock.textContent = '<LOCK!>';
                  lock.addEventListener('click', () => {
                      toggleUserLock(def.name);
                      lock.classList.toggle('locked', sliderLocks[def.name]);
                      lock.textContent = sliderLocks[def.name] ? '[LOCKED!]' : '<LOCK!>';
                  });
                  group.appendChild(lock);
                  sliderContainer.appendChild(group);
              });
          })();

          (function buildMasterDockSliders() {
              if (!sliderContainer) return;
              const defs = [
                  { key: 'effectIntensity', label: 'Effect Intensity',
                  title: 'Master opacity for all effect layers (0 = mute all)' },
                  { key: 'motionScale', label: 'Motion Scale',
                  title: 'AI Warp / Data Bands / VHS motion amplitude' },
                  { key: 'blendSoftness', label: 'Blend Softness',
                  title: 'How gently stacked effects share the board' },
                  { key: 'continualSpeed', label: 'Continual Speed',
                  title: 'How fast continual randomization moves' },
                  { key: 'autoGlitchPower', label: 'Auto Glitch Power',
                  title: 'Strength of Auto Glitch envelope' },
                  { key: 'boardEnergy', label: 'Board Energy', title: 'Beat / flash reactivity' }
              ];

              const header = document.createElement('div');
              header.className = 'slider-group master-dock-header';
              const headerLabel = document.createElement('label');
              headerLabel.className = 'dock-section-label';
              headerLabel.textContent = '— MASTER —';
              header.appendChild(headerLabel);
              sliderContainer.appendChild(header);

              defs.forEach((d) => {
                  const group = document.createElement('div');
                  group.className = 'slider-group';
                  const lab = document.createElement('label');
                  lab.textContent = d.label + ':';
                  lab.title = d.title;
                  const slider = document.createElement('input');
                  slider.type = 'range';
                  slider.min = 0;
                  slider.max = 1;
                  slider.step = 0.01;
                  slider.value = masterControls[d.key];
                  slider.title = d.title;
                  const read = document.createElement('span');
                  read.className = 'master-readout';
                  read.textContent = Math.round(masterControls[d.key] * 100) + '%';
                  if (!window.__masterSliderEls) window.__masterSliderEls = {};
                  window.__masterSliderEls[d.key] = { slider: slider, read: read };
                  slider.addEventListener('input', () => {
                      masterControls[d.key] = parseFloat(slider.value);
                      masterTargets[d.key] = masterControls[d.key];
                      read.textContent = Math.round(masterControls[d.key] * 100) + '%';
                  });
                  const lock = document.createElement('button');
                  lock.className = 'lock-button';
                  lock.textContent = '<LOCK!>';
                  lock.title = 'Lock ' + d.label;
                  sliderLocks['master:' + d.key] = false;
                  lock.addEventListener('click', () => {
                      toggleUserLock('master:' + d.key);
                      lock.classList.toggle('locked', sliderLocks['master:' + d.key]);
                      lock.textContent = sliderLocks['master:' + d.key] ? '[LOCKED!]' :
                          '<LOCK!>';
                      slider.disabled = !!sliderLocks['master:' + d.key];
                  });
                  group.appendChild(lab);
                  group.appendChild(slider);
                  group.appendChild(read);
                  group.appendChild(lock);
                  sliderContainer.appendChild(group);
              });
          })();

          /* ------------------------------------------------------------------ *
           *  8b. AI WARP MASTERS — DROP THE MILK? + B&W / Hue masters          *
           * ------------------------------------------------------------------ */
          /* DROP THE MILK? is AI WARP's original, dependency-free Milkdrop /
             projectM-inspired renderer: zoom/rotate feedback, audio-reactive
             polar waveforms and soft colour blooms over 80
             presets (8 families x 10) with a fresh colour base each session. It samples only the glitch canvas, never
             the media elements, and nothing is read back from it. */
          const MILK_PRESETS = (function buildMilkdropPresetBank() {
              /* A new colour base each session; the 80 shapes stay the same. */
              let sessionHue = 0;
              try {
                  const word = new Uint32Array(1);
                  window.crypto.getRandomValues(word);
                  sessionHue = word[0] % 360;
              } catch (e) { sessionHue = 0; }
              const families = [
                  { name: 'Liquid Orbits', composite: 'screen', yScale: 0.78 },
                  { name: 'Spiral Soup', composite: 'lighter', yScale: 0.92 },
                  { name: 'Plasma Ribbons', composite: 'screen', yScale: 0.62 },
                  { name: 'Kaleido Foam', composite: 'lighter', yScale: 1.00 },
                  { name: 'Vortex Bloom', composite: 'screen', yScale: 0.70 },
                  { name: 'Phosphor Nebula', composite: 'soft-light', yScale: 0.86 },
                  { name: 'Lissajous Milk', composite: 'lighter', yScale: 1.08 },
                  { name: 'Caustic Swirl', composite: 'screen', yScale: 0.74 }
              ];
              const bank = [];
              for (let index = 0; index < 80; index++) {
                  const familyIndex = Math.floor(index / 10), variation = index % 10, family = families[familyIndex];
                  bank.push(Object.freeze({
                      id: index + 1,
                      name: family.name + ' ' + String(variation + 1).padStart(2, '0'),
                      family: family.name,
                      composite: family.composite,
                      hueOffset: (index * 47 + variation * 19 + sessionHue) % 360,
                      zoomBias: (variation - 4.5) * 0.0013 + (familyIndex - 3.5) * 0.00065,
                      twist: 0.46 + familyIndex * 0.13 + variation * 0.095,
                      feedback: 0.27 + (variation % 6) * 0.026 + familyIndex * 0.012,
                      rings: 1 + ((familyIndex * 2 + variation) % 4),
                      waveFreq: 3 + ((familyIndex * 3 + variation) % 10),
                      waveAmp: 0.022 + (variation % 5) * 0.008 + familyIndex * 0.002,
                      bloom: 0.42 + ((familyIndex + variation) % 6) * 0.085,
                      opacity: 0.16 + ((familyIndex * 3 + variation) % 10) * 0.023,
                      yScale: family.yScale + (variation - 4.5) * 0.012,
                      mirror: ((familyIndex + variation) % 2) === 0
                  }));
              }
              return Object.freeze(bank);
          })();

          const MILK_CHROMA = /Neon Grad|HSL Rainbow|Hue\/Color Cycle|B&W Invert|Prism Rift|Chromatic Echo/;
          const MILK_RHYTHM = /Flash|Strobe|Scanlines|Data Bands|VHS Glitch|Data Bomb|Rolling Scan|Tracking Tear|Signal Tear|V-Sync/;
          const MILK_TEXTURE = /ASCII|Font Burn|Ink Glyphs|Matrix|Gemini Bomb|Cyber Rain|Tape Grain|Ghost Spectrum/;
          const MILK_GEOMETRY = /Tech Artist|Neon Grad|VHS Glitch|Data Bands|Gemini Bomb|Orbit HUD|Temporal Slices|Prism Rift/;
          const milkVoiceClasses = Object.create(null);
          function milkVoiceClass(name) {
              let c = milkVoiceClasses[name];
              if (!c) {
                  const base = name.replace(/^R3 /, '');
                  let hash = 2166136261;
                  for (let j = 0; j < base.length; j++) hash = Math.imul(hash ^ base.charCodeAt(j), 16777619) >>> 0;
                  c = milkVoiceClasses[name] = {
                      grain: (hash % 997) / 996,
                      chroma: MILK_CHROMA.test(base), rhythm: MILK_RHYTHM.test(base),
                      texture: MILK_TEXTURE.test(base), geometry: MILK_GEOMETRY.test(base)
                  };
              }
              return c;
          }

          /* Every lit voice (core and R3) leans the Milkdrop soup — confluence. */
          function milkVoiceBlend() {
              let weight = 0, chroma = 0, rhythm = 0, texture = 0, geometry = 0;
              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  const level = clamp01(heldLevel(name) * masterOpacity);
                  if (level <= 0.005) continue;
                  const c = milkVoiceClass(name);
                  weight += level;
                  chroma += level * (c.chroma ? 1.25 : 0.55 + c.grain * 0.35);
                  rhythm += level * (c.rhythm ? 1.2 : 0.42 + (1 - c.grain) * 0.35);
                  texture += level * (c.texture ? 1.2 : 0.45 + c.grain * 0.28);
                  geometry += level * (c.geometry ? 1.15 : 0.48 + (1 - c.grain) * 0.3);
              }
              const d = weight || 1;
              return {
                  activity: clamp01(weight / 3.2),
                  chroma: clamp01(chroma / d), rhythm: clamp01(rhythm / d),
                  texture: clamp01(texture / d), geometry: clamp01(geometry / d)
              };
          }

          const MILK_FLAT_BLEND = Object.freeze({
              ghostSplit: 1, ghostChroma: 1, ghostLines: 1, ghostWarp: 1, ghostGlow: 1,
              vsyncSpeed: 1, vsyncTears: 1, vsyncRoll: 1, phase: 1, huePhase: 0,
              hardLight: 1, softEye: 1, ear: 1, canvas: 1, automation: 1
          });
          const milkBlendCache = {};
          function milkBlendProfile() {
              const mode = isAiWarpActive ? 'aurora' : '';
              if (!milkBlendCache[mode]) {
                  const api = window.R3GhostVsync;
                  milkBlendCache[mode] = (api && typeof api.getWarpBlendProfile === 'function')
                      ? Object.freeze(api.getWarpBlendProfile(mode)) : MILK_FLAT_BLEND;
              }
              return milkBlendCache[mode];
          }

          function ensureMilkBuffers(w, h) {
              if (!milk.next) {
                  milk.next = document.createElement('canvas');
                  milk.nextCtx = milk.next.getContext('2d');
                  milk.feedback = document.createElement('canvas');
                  milk.feedbackCtx = milk.feedback.getContext('2d');
              }
              if (milk.next.width !== w || milk.next.height !== h) {
                  milk.next.width = w; milk.next.height = h;
                  milk.feedback.width = w; milk.feedback.height = h;
              }
              return !!(milk.nextCtx && milk.feedbackCtx);
          }

          /* Random order that never plays one family twice in a row and picks the
             nearest-hue preset out of a few random candidates, so changes flow. */
          function orderMilkDeck(bank) {
              const pool = bank.slice();
              const deck = [];
              let prev = null;
              while (pool.length) {
                  let best = -1, bestScore = Infinity;
                  for (let n = 0; n < 5; n++) {
                      const i = (Math.random() * pool.length) | 0;
                      const cand = pool[i];
                      let score = Math.random() * 20;
                      if (prev) {
                          const dh = Math.abs(cand.hueOffset - prev.hueOffset);
                          score += Math.min(dh, 360 - dh) + (cand.family === prev.family ? 400 : 0);
                      }
                      if (score < bestScore) { bestScore = score; best = i; }
                  }
                  prev = pool.splice(best, 1)[0];
                  deck.push(prev);
              }
              return deck;
          }
          function setMilkActive(active) {
              milk.active = !!active;
              milk.startAt = milk.active ? performance.now() : 0;
              milk.lastAt = 0;
              milk.index = -1;
              milk.preset = null;
              if (milk.active) {
                  milk.deck = orderMilkDeck(MILK_PRESETS);
              } else if (milk.next) {
                  /* release the two full-size feedback buffers while off */
                  milk.next.width = milk.next.height = 1;
                  milk.feedback.width = milk.feedback.height = 1;
              }
              syncAiWarpMastersUi();
              return milk.active;
          }

          function setMilkOpacity(value) {
              const level = clamp01(+value || 0);
              milk.opacity = level;
              milk.target = level;
              return level;
          }

          function renderMilkdrop(now) {
              if (!milk.active || !milk.deck.length) return;
              const w = mainCanvas.width, h = mainCanvas.height;
              if (w < 2 || h < 2 || !ensureMilkBuffers(w, h)) return;
              if (!milk.startAt) milk.startAt = now;
              const elapsed = Math.max(0, now - milk.startAt);
              const mb = milkBlendProfile();
              const presetDuration = 14000 / Math.max(0.65, mb.automation);
              const presetIndex = Math.floor(elapsed / presetDuration) % milk.deck.length;
              if (presetIndex !== milk.index || !milk.preset) {
                  milk.index = presetIndex;
                  milk.preset = milk.deck[presetIndex];
                  if (!voiceFxLocks.milkOpacity) milk.target = milk.preset.opacity;
                  syncAiWarpMastersUi();
                  saveVoiceFxControls();
              }
              const preset = milk.preset;
              const opacityDt = milk.lastAt ? Math.max(0, Math.min(0.1, (now - milk.lastAt) / 1000)) : 0;
              milk.lastAt = now;
              milk.opacity = lerp(milk.opacity, milk.target, 1 - Math.exp(-opacityDt * 2.4));
              /* a zeroed Milkdrop costs nothing */
              if (milk.opacity <= 0.001 && milk.target <= 0.001) return;

              const t = elapsed * 0.001;
              const vb = milkVoiceBlend();
              const es = SOFT.ear ? SOFT.ear.state : null;
              const drive = clamp01(videoPalette.energy || 0);
              const bass = clamp01(((es && es.bass) || drive) * mb.ear * (0.86 + vb.rhythm * 0.14));
              const mid = clamp01(((es && es.mid) || drive) * mb.ear * (0.88 + vb.texture * 0.12));
              const treble = clamp01(((es && es.treb) || 0) * mb.ear * (0.88 + vb.chroma * 0.12));
              const beatK = clamp01(((es && es.beat) || SOFT.beat || 0) * mb.ear * (0.85 + vb.rhythm * 0.15));
              const hueBase = ((videoPalette.hue || 0) + preset.hueOffset + t * (8 + treble * 26 * mb.vsyncSpeed) +
                  mb.huePhase) % 360;
              const zoom = 1.002 + preset.zoomBias + 0.006 * Math.sin(t * 0.42 + preset.id) + bass * 0.009 +
                  (mb.canvas - 1) * 0.002 + vb.geometry * 0.0015;
              const spin = Math.sin(t * 0.31 + preset.id * 0.8) * (0.002 + beatK * 0.012) * preset.twist *
                  (0.72 + mb.vsyncSpeed * 0.14 + mb.vsyncRoll * 0.14) * mb.phase;
              const fbAlpha = Math.min(0.24, preset.feedback * 0.48 + 0.025 * (0.5 + 0.5 * Math.sin(t * 0.47)) +
                  bass * 0.028 + mb.ghostWarp * 0.012 + mb.softEye * 0.008 +
                  vb.texture * 0.022 + vb.activity * 0.014);
              const dst = milk.nextCtx, fb = milk.feedbackCtx;
              dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.clearRect(0, 0, w, h);
              dst.globalCompositeOperation = 'source-over'; dst.globalAlpha = 1; dst.filter = 'none';
              dst.drawImage(mainCanvas, 0, 0, w, h);
              /* smooth feedback loop: gently zoom, rotate, hue-shift and soften prior frames */
              dst.save(); dst.translate(w * 0.5, h * 0.5); dst.rotate(spin); dst.scale(zoom, zoom);
              dst.translate(-w * 0.5, -h * 0.5);
              dst.globalCompositeOperation = 'soft-light';
              dst.globalAlpha = fbAlpha;
              dst.filter = 'hue-rotate(' + (hueBase * 0.16 + mb.ghostChroma * 8 + vb.chroma * 18).toFixed(1) +
                  'deg) saturate(' + (1.02 + mb.hardLight * 0.04 + vb.chroma * 0.12).toFixed(2) +
                  ') blur(' + (0.22 + bass * 0.45 + mb.softEye * 0.08).toFixed(2) + 'px)';
              dst.drawImage(milk.feedback, 0, 0, w, h); dst.restore(); dst.filter = 'none';
              /* Milkdrop-style polar waveforms driven by the EAR */
              const cx = w * 0.5, cy = h * 0.5, minDim = Math.min(w, h);
              const rings = Math.max(1, Math.min(5, preset.rings + (vb.geometry > 0.72 ? 1 : 0) +
                  (mb.vsyncTears > 1.18 ? 1 : 0)));
              const points = 192 + Math.round(vb.texture * 48);
              const yK = Math.max(0.48, Math.min(1.35, preset.yScale * mb.canvas + 0.12 * Math.sin(t * 0.18)));
              for (let ring = 0; ring < rings; ring++) {
                  const baseR = minDim * (0.14 + ring * 0.065 + bass * 0.035 + mb.ghostSplit * 0.004);
                  const f1 = preset.waveFreq + ring * 2 + Math.round(mb.vsyncTears * 0.6);
                  const f2 = 7 + ring * 2 + Math.round(vb.chroma * 2);
                  const amp1 = preset.waveAmp * (0.78 + mb.ghostWarp * 0.16 + vb.rhythm * 0.28) + mid * 0.085 + beatK * 0.035;
                  const amp2 = 0.012 + treble * 0.045;
                  const ph1 = t * (1.1 + ring * 0.24) * mb.vsyncSpeed;
                  const ph2 = t * 0.73 * mb.phase;
                  const roll = t * (0.07 + mb.vsyncRoll * 0.012) * (ring % 2 ? -1 : 1);
                  dst.beginPath();
                  for (let i = 0; i <= points; i++) {
                      const a = i / points * Math.PI * 2;
                      const r = baseR * (1 + Math.sin(a * f1 + ph1) * amp1 + Math.sin(a * f2 - ph2) * amp2);
                      const angle = a + roll;
                      const x = cx + Math.cos(angle) * r;
                      const y = cy + Math.sin(angle) * r * yK;
                      if (!i) dst.moveTo(x, y); else dst.lineTo(x, y);
                  }
                  dst.closePath(); dst.globalCompositeOperation = 'screen';
                  dst.globalAlpha = Math.min(0.12, 0.016 + preset.bloom * 0.022 + 0.030 * bass + 0.012 * beatK +
                      mb.ghostLines * 0.008 + vb.chroma * 0.015);
                  dst.strokeStyle = 'hsla(' + ((hueBase + ring * 72 + vb.chroma * 24) % 360).toFixed(1) + ',86%,' +
                      Math.min(62, 45 + ring * 2 + mb.hardLight * 1.5).toFixed(1) + '%,0.72)';
                  dst.lineWidth = Math.max(0.8, minDim * (0.0009 + ring * 0.00022) * Math.min(1.15, mb.ghostGlow));
                  dst.stroke();
              }
              /* soft liquid blooms: layered radial gradients make the colour soup */
              dst.globalCompositeOperation = 'soft-light';
              dst.filter = 'blur(' + (minDim * (0.005 + mb.softEye * 0.0015 + vb.texture * 0.0008)).toFixed(1) + 'px)';
              const bloomCount = Math.max(2, Math.min(5, 2 + (preset.id % 3) + (vb.texture > 0.78 ? 1 : 0)));
              for (let i = 0; i < bloomCount; i++) {
                  const a = t * (0.18 + i * 0.025) + i * Math.PI * 0.4;
                  const x = cx + Math.cos(a * (0.82 + vb.geometry * 0.30)) * minDim *
                      (0.15 + 0.045 * Math.sin(t * 0.37 + i) + vb.geometry * 0.025);
                  const y = cy + Math.sin(a * (1.05 + mb.phase * 0.12)) * minDim *
                      (0.10 + 0.04 * Math.cos(t * 0.29 + i) + vb.texture * 0.02);
                  const r = Math.max(1, minDim * (0.04 + preset.bloom * 0.022 + 0.025 * bass + vb.geometry * 0.012 +
                      0.01 * Math.sin(t * 0.6 + i)));
                  const grad = dst.createRadialGradient(x, y, r * 0.05, x, y, r);
                  grad.addColorStop(0, 'hsla(' + ((hueBase + i * (45 + mb.ghostChroma * 9) + vb.chroma * 34) % 360).toFixed(1) +
                      ',88%,' + Math.min(66, 52 + mb.hardLight * 3).toFixed(1) + '%,' +
                      (0.030 + bass * 0.025 + vb.activity * 0.018).toFixed(3) + ')');
                  grad.addColorStop(0.48, 'hsla(' + ((hueBase + i * 61 + 28 + vb.rhythm * 18) % 360).toFixed(1) +
                      ',84%,52%,' + (0.016 + vb.texture * 0.010).toFixed(3) + ')');
                  grad.addColorStop(1, 'hsla(0,0%,0%,0)');
                  dst.globalAlpha = 0.34; dst.fillStyle = grad; dst.beginPath(); dst.arc(x, y, r, 0, Math.PI * 2); dst.fill();
                  if (preset.mirror && i % 2 === 0) {
                      dst.globalAlpha = 0.16; dst.beginPath(); dst.arc(w - x, h - y, r * 0.78, 0, Math.PI * 2); dst.fill();
                  }
              }
              dst.filter = 'none'; dst.restore();
              /* persist the composite for the next frame, then lay it on the voice canvas */
              fb.save(); fb.setTransform(1, 0, 0, 1, 0, 0); fb.clearRect(0, 0, w, h); fb.drawImage(milk.next, 0, 0); fb.restore();
              gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0);
              gctx.globalCompositeOperation = 'source-over'; gctx.filter = 'none';
              gctx.globalAlpha = clamp01(milk.opacity);
              if (gctx.globalAlpha > 0.001) gctx.drawImage(milk.next, 0, 0);
              gctx.restore();
          }

          /* AI WARP activateTunedVoicePair: moving a master wakes its resting
             core voice so the change is visible. R4.2.4 UNTIED: it wakes ONLY
             the core voice — never its R3 twin. No voice may move another
             voice's slider or value; only explicit randomization (Randomize
             All, CR, aesthetic bursts) may form confluence pairs. */
          function activateTunedVoicePair(core) {
              if (fxPairLevel(core) > 0.004) return;
              let woke = false;
              [[core, 0.35]].forEach((pair) => {
                  const name = pair[0], v = pair[1];
                  if (automationHeld(name) || !Object.prototype.hasOwnProperty.call(effectAlphas, name)) return;
                  effectAlphas[name] = v;
                  randomTargets[name] = v;
                  sliderWritten[name] = v;
                  crParked[name] = false;
                  setEffectCancelled(name, false); /* R4.1.3: a tuned pick is user intent — it wakes the pair */
                  if (sliderElements[name]) sliderElements[name].value = v.toFixed(3);
                  updateContinuousEffectsCache(name);
                  woke = true;
              });
              if (woke && !sliderLocks.global && (+masterOpacity || 0) <= 0.02) {
                  masterOpacity = 0.85;
                  randomTargets.global = masterOpacity;
                  sliderWritten.global = masterOpacity;
                  if (globalSliderEl) globalSliderEl.value = masterOpacity.toFixed(3);
              }
          }

          function setAiwLock(btn, locked) {
              btn.classList.toggle('locked', !!locked);
              btn.textContent = locked ? '[LOCKED!]' : '<LOCK!>';
              btn.setAttribute('aria-pressed', String(!!locked));
          }

          function syncAiWarpMastersUi() {
              const ui = aiwUi;
              if (!ui) return;
              const p = milk.preset;
              ui.milkBtn.textContent = milk.active && p
                  ? 'DROP THE MILK? ' + String(milk.index + 1).padStart(2, '0') + '/80'
                  : 'DROP THE MILK? ' + (milk.active ? 'ON' : 'OFF');
              ui.milkBtn.title = milk.active && p
                  ? 'Now playing ' + p.name + '; the shuffled 80-preset deck advances every ~12–17 s. Key: D'
                  : 'Toggle DROP THE MILK? — 80-preset Milkdrop-inspired feedback automation. Key: D';
              ui.milkBtn.classList.toggle('active', milk.active);
              ui.milkBtn.setAttribute('aria-pressed', String(milk.active));
              ui.milkSlider.value = milk.target.toFixed(2);
              ui.milkRead.textContent = Math.round(milk.target * 100) + '%';
              setAiwLock(ui.milkLock, voiceFxLocks.milkOpacity);
              ui.bwSlider.value = voiceFxSettings.bwInvert.toFixed(2);
              ui.bwRead.textContent = Math.round(voiceFxSettings.bwInvert * 100) + '%';
              ui.bwPreview.style.opacity = String(Math.max(0.15, voiceFxSettings.bwInvert));
              setAiwLock(ui.bwLock, voiceFxLocks.bwInvert);
              ui.hueSlider.value = String(Math.round(voiceFxSettings.hueOffset));
              ui.hueRead.textContent = Math.round(voiceFxSettings.hueOffset) + '°';
              ui.huePreview.style.setProperty('--hue-position', ((voiceFxSettings.hueOffset / 360) * 100).toFixed(1) + '%');
              setAiwLock(ui.hueLock, voiceFxLocks.hueOffset);
              const app = voiceFxSettings.scope === 'app';
              ui.scopeBtn.textContent = 'FX SCOPE: ' + (app ? 'APP' : 'LENS');
              ui.scopeBtn.title = app
                  ? 'B&W / Hue masters cover the whole app (AI WARP). Click for LENS only.'
                  : 'B&W / Hue masters cover only the LENS (canvas + video). Click for the whole app.';
          }

          function toggleMilk() {
              setMilkActive(!milk.active);
              showNotificationMessage(milk.active
                  ? 'DROP THE MILK? [ON] · SOUPY FEEDBACK / POLAR WAVES / AUTO PRESETS'
                  : 'DROP THE MILK? [OFF]', 2200);
          }

          (function buildAiWarpMastersDock() {
              if (!sliderContainer) return;
              const make = (tag, className, text) => {
                  const el = document.createElement(tag);
                  if (className) el.className = className;
                  if (text !== undefined) el.textContent = text;
                  return el;
              };
              const makeButton = (className, text, title) => {
                  const b = make('button', className, text);
                  b.type = 'button';
                  if (title) b.title = title;
                  return b;
              };
              const makeRange = (min, max, step, title) => {
                  const r = document.createElement('input');
                  r.type = 'range';
                  r.min = String(min);
                  r.max = String(max);
                  r.step = String(step);
                  r.title = title;
                  return r;
              };

              const header = make('div', 'slider-group master-dock-header');
              header.appendChild(make('label', 'dock-section-label', '— AI WARP MASTERS —'));
              sliderContainer.appendChild(header);

              const buttons = make('div', 'aiw-buttons');
              const milkBtn = makeButton('aiw-button', 'DROP THE MILK? OFF');
              const rollBtn = makeButton('aiw-button', 'ROLL FX', 'Randomize the unlocked B&W Strength and Hue Offset masters');
              const scopeBtn = makeButton('aiw-button', 'FX SCOPE: APP');
              buttons.appendChild(milkBtn);
              buttons.appendChild(rollBtn);
              buttons.appendChild(scopeBtn);
              sliderContainer.appendChild(buttons);

              const milkRow = make('div', 'slider-group aiw-row');
              const milkLabel = make('label', '', 'Milk Opacity:');
              const milkSlider = makeRange(0, 1, 0.01, 'DROP THE MILK? opacity');
              const milkRead = make('span', 'master-readout', '30%');
              const milkLock = makeButton('lock-button', '<LOCK!>', 'Lock the Milk opacity against preset automation');
              const milkZero = makeButton('aiw-button', '0', 'Set the Milk opacity to 0%');
              [milkLabel, milkSlider, milkRead, milkLock, milkZero].forEach((el) => milkRow.appendChild(el));
              sliderContainer.appendChild(milkRow);

              const bwRow = make('div', 'slider-group');
              const bwLabel = make('label', '', 'B&W Strength:');
              const bwPreview = make('span', 'aiw-preview aiw-preview-bw');
              bwPreview.setAttribute('aria-hidden', 'true');
              bwLabel.appendChild(bwPreview);
              const bwSlider = makeRange(0, 1, 0.01, 'B&W Invert master strength (scales the core + R3 pair)');
              const bwRead = make('span', 'master-readout', '100%');
              const bwLock = makeButton('lock-button', '<LOCK!>', 'Lock B&W Strength against ROLL FX, Randomize and presets');
              [bwLabel, bwSlider, bwRead, bwLock].forEach((el) => bwRow.appendChild(el));
              sliderContainer.appendChild(bwRow);

              const hueRow = make('div', 'slider-group');
              const hueLabel = make('label', '', 'Hue Offset:');
              const huePreview = make('span', 'aiw-preview aiw-preview-hue');
              huePreview.setAttribute('aria-hidden', 'true');
              hueLabel.appendChild(huePreview);
              const hueSlider = makeRange(0, 359, 1, 'Hue/Color Cycle master offset (degrees)');
              const hueRead = make('span', 'master-readout', '0°');
              const hueLock = makeButton('lock-button', '<LOCK!>', 'Lock Hue Offset against ROLL FX, Randomize and presets');
              [hueLabel, hueSlider, hueRead, hueLock].forEach((el) => hueRow.appendChild(el));
              sliderContainer.appendChild(hueRow);

              aiwUi = { milkBtn, rollBtn, scopeBtn, milkSlider, milkRead, milkLock, milkZero,
                  bwSlider, bwRead, bwPreview, bwLock, hueSlider, hueRead, huePreview, hueLock };

              milkBtn.addEventListener('click', toggleMilk);
              milkSlider.addEventListener('input', () => {
                  setMilkOpacity(parseFloat(milkSlider.value));
                  milkRead.textContent = Math.round(milk.target * 100) + '%';
                  saveVoiceFxControls();
              });
              milkLock.addEventListener('click', () => {
                  voiceFxLocks.milkOpacity = !voiceFxLocks.milkOpacity;
                  if (!voiceFxLocks.milkOpacity && milk.preset) milk.target = milk.preset.opacity;
                  syncAiWarpMastersUi();
                  saveVoiceFxControls();
                  showNotificationMessage('DROP THE MILK OPACITY ' + (voiceFxLocks.milkOpacity ? 'LOCKED' : 'UNLOCKED'), 1800);
              });
              milkZero.addEventListener('click', () => {
                  setMilkOpacity(0);
                  syncAiWarpMastersUi();
                  saveVoiceFxControls();
                  showNotificationMessage('DROP THE MILK OPACITY: 0%', 1800);
              });
              bwSlider.addEventListener('input', () => {
                  voiceFxSettings.bwInvert = clamp01(parseFloat(bwSlider.value) || 0);
                  activateTunedVoicePair('B&W Invert');
                  syncAiWarpMastersUi();
                  saveVoiceFxControls();
                  applyMasterFilters();
              });
              hueSlider.addEventListener('input', () => {
                  voiceFxSettings.hueOffset = normalizeHueOffset(parseFloat(hueSlider.value));
                  activateTunedVoicePair('Hue/Color Cycle');
                  syncAiWarpMastersUi();
                  saveVoiceFxControls();
              });
              bwLock.addEventListener('click', () => {
                  voiceFxLocks.bwInvert = !voiceFxLocks.bwInvert;
                  syncAiWarpMastersUi();
                  saveVoiceFxControls();
              });
              hueLock.addEventListener('click', () => {
                  voiceFxLocks.hueOffset = !voiceFxLocks.hueOffset;
                  syncAiWarpMastersUi();
                  saveVoiceFxControls();
              });
              rollBtn.addEventListener('click', () => {
                  randomizeVoiceFx();
                  showNotificationMessage('UNLOCKED B&W / HUE SETTINGS RANDOMIZED', 1800);
              });
              scopeBtn.addEventListener('click', () => {
                  voiceFxSettings.scope = voiceFxSettings.scope === 'app' ? 'lens' : 'app';
                  masterFilterPrimed = false;
                  applyMasterFilters();
                  syncAiWarpMastersUi();
                  saveVoiceFxControls();
                  showNotificationMessage('FX SCOPE: ' + (voiceFxSettings.scope === 'app' ? 'WHOLE APP' : 'LENS ONLY'), 1800);
              });
              syncAiWarpMastersUi();
          })();

          /* Single-key shortcuts never fire while the user is typing in a field. */
          function isTypingTarget(t) {
              return !!t && (t.isContentEditable || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' ||
                  (t.tagName === 'INPUT' && !/^(range|button|checkbox|radio)$/i.test(t.type)));
          }

          /* Local keyboard only: D toggles DROP THE MILK? (never while typing). */
          document.addEventListener('keydown', (e) => {
              if (e.defaultPrevented || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
              if (e.key !== 'd' && e.key !== 'D') return;
              if (!document.body.classList.contains('playback-on')) return;
              if (isTypingTarget(e.target)) return;
              e.preventDefault();
              toggleMilk();
          });

          function triggerTimedEffect(def) {
              if (isManualLight(def.name)) {
                  if (!lightAutomationOn) {
                      showNotificationMessage(def.name + ' outputs only while Flash & Strobe (automatic) is ON. Turn that switch on first.', 3800);
                      return;
                  }
                  if (!(effectAlphas[def.name] > 0)) {
                      showNotificationMessage('Raise the ' + def.name + ' slider explicitly before triggering it.', 3500);
                      return;
                  }
                  activeEffects.push(def.factory(() => effectLiveStrength(def.name)));
                  return;
              }
              const profile = blendProfiles[def.name];
              const floorMin = profile ? profile.ambient[1] + (profile.peak[1] - profile.ambient[1]) * 0.35 : 0.2;
              const floorMax = profile ? profile.peak[1] : 0.4;
              const pulseFloor = clamp01(floorMin + Math.random() * Math.max(0, floorMax - floorMin));
              const getStrength = () => Math.max(smoothedStrength[def.name] || (effectAlphas[def.name] *
                  masterOpacity), pulseFloor);
              activeEffects.push(def.factory(getStrength));
          }

          /* ------------------------------------------------------------------ *
           *  9. Combo profile + master filters + overviews                      *
           * ------------------------------------------------------------------ */
          let comboProfile = { hueOffset: 0, satMult: 1, glowMult: 1, contrastMult: 1 };
          let comboProfileTarget = { hueOffset: 0, satMult: 1, glowMult: 1, contrastMult: 1 };

          const ghostModes = (window.GlitchEngine && GlitchEngine.GHOST_MODES)
              ? GlitchEngine.GHOST_MODES.slice()
              : ['OFF', 'DIA', 'SPECTRUM', 'CRT', 'PLASMA', 'LED'];
          let ghostModeIndex = Math.max(1, ghostModes.indexOf('SPECTRUM')); // SPECTRUM on load
          let ghostActive = false;
          let ghostLevel = parseFloat(ghostProtocolSlider ? ghostProtocolSlider.value : 1);
          const vsyncModes = ['OFF', 'ON', 'GHOST_OFF', 'FULL'];
          let vsyncModeIndex = 0;
          let vsyncActive = false;
          const V_SYNC_DEFS = {
              ON: { label: 'V-Sync Scanphasing:' },
              GHOST_OFF: { label: 'V-Sync Vertical Color Synchronization Harmony:' },
              FULL: { label: 'V-Sync Sharp:' }
          };
          const vsyncScripts = {};
          ['ON', 'GHOST_OFF', 'FULL'].forEach((m) => {
              vsyncScripts[m] = { level: 0.6, target: 0.6, nextAt: performance.now() + 1400 + Math.random() *
                      1000, lastPct: -1 };
          });
          let vsyncManualUntil = 0;
          /* v11: last live level — OFF no longer parks/zeroes the slider; the level
             is held in memory so re-engaging a mode (or dragging the slider)
             restores it instantly. */
          let vsyncLastActiveLevel = 0.6;
          sliderLocks.vsync = false;

          function activeVsyncLevel() {
              const m = getVsyncMode();
              return m === 'OFF' ? 0 : vsyncScripts[m].level;
          }

          function vsyncBand(mode) {
              /* v11: wider bands — the sharp engine stays clean at high levels */
              return mode === 'FULL' ? [0.40, 1.0] : mode === 'GHOST_OFF' ? [0.35, 1.0] : [0.30, 0.95];
          }
          const getGhostMode = () => ghostModes[ghostModeIndex] || 'OFF';
          const getVsyncMode = () => vsyncModes[vsyncModeIndex] || 'OFF';

          function updateComboProfile(now) {
              const gm = getGhostMode();
              const vm = getVsyncMode();
              const warp = isAiWarpActive;
              const t = now * 0.001;
              const ghostAmount = ghostActive ? clamp01(ghostLevel) : 0;
              const vsyncAmount = vm !== 'OFF' ? clamp01(activeVsyncLevel()) : 0;
              /* v11 CRISP CONFLUENCE: hue anchors trimmed hard (the old 120/65/110°
                 stacking read as mud), saturation/glow stacking reduced, contrast
                 raised — Ghost + V-Sync + AI Warp together now sharpen the board
                 instead of washing it. */
              const ghostAnchor = (window.GlitchEngine && GlitchEngine.comboGhostAnchor)
                  ? GlitchEngine.comboGhostAnchor(gm)
                  : ({ OFF: 0, DIA: 28, SPECTRUM: 45, CRT: 18, PLASMA: 78, LED: 96 }[gm] || 0);
              const vsyncAnchor = (window.GlitchEngine && GlitchEngine.comboVsyncAnchor)
                  ? GlitchEngine.comboVsyncAnchor(vm)
                  : ({ OFF: 0, ON: 8, GHOST_OFF: 32, FULL: 42 }[vm] || 0);
              const warpDrift = warp ? (t * 14) % 360 : 0;
              const palettePull = (videoPalette.hue - PALETTE_FALLBACK.hue) * 0.22;
              let hueOffset = ghostAnchor * ghostAmount + vsyncAnchor * vsyncAmount + warpDrift * 0.18 +
                  palettePull;
              hueOffset = ((hueOffset % 360) + 360) % 360;

              /* R1.7: the source's COLORING steers the combo mood — vivid
                 video saturates it, dark video contrasts it, lively glows */
              const hslLive = clamp01((effectAlphas['HSL Rainbow'] || 0) * masterOpacity);
              const hslM = (window.GlitchEngine && GlitchEngine.hslRainbowMap)
                  ? GlitchEngine.hslRainbowMap(hslLive, boardFilterCtx())
                  : { satFilter: 1, brightFilter: 1 };
              const satMult = 1 + (ghostAmount * 0.14 + vsyncAmount * 0.10 + (warp ? 0.08 : 0)) *
                  R16.comboSat() * (0.82 + 0.18 * (hslM.satFilter || 1));
              const glowMult = 1 + ((ghostAmount * vsyncAmount) * 0.22 +
                  (warp && ghostAmount > 0 ? 0.10 : 0) +
                  (warp && vsyncAmount > 0 ? 0.06 : 0) +
                  Math.min(0.10, ghostAmount * 0.06 + vsyncAmount * 0.05)) * R16.comboGlow() *
                  (0.88 + 0.12 * (hslM.brightFilter || 1));
              const contrastMult = 1 + (ghostAmount * 0.10 +
                  vsyncAmount * 0.08 +
                  (warp ? 0.06 : 0) +
                  (ghostAmount * vsyncAmount) * 0.12) * R16.comboCon();

              comboProfileTarget = { hueOffset, satMult, glowMult, contrastMult };
          }

          function stepComboProfile(dt) {
              const t = comboProfileTarget;
              const rate = 1.8;
              const ease = (cur, tgt) => cur + (tgt - cur) * (1 - Math.exp(-rate * Math.max(0, dt)));
              let dh = t.hueOffset - comboProfile.hueOffset;
              if (dh > 180) dh -= 360;
              if (dh < -180) dh += 360;
              comboProfile.hueOffset = ((comboProfile.hueOffset + dh * (1 - Math.exp(-rate * Math.max(0, dt))) +
                  360) % 360);
              comboProfile.satMult = ease(comboProfile.satMult, t.satMult);
              comboProfile.glowMult = ease(comboProfile.glowMult, t.glowMult);
              comboProfile.contrastMult = ease(comboProfile.contrastMult, t.contrastMult);
          }

          function getComboCanvasFilter() {
              /* R1.6: the source's color appetite carries the combo wash —
                 vivid video gets the full harmony, grey video flattens it */
              const h = boardHarmony() * R16.comboHarm();
              const sat = 1 + ((comboProfile.satMult || 1) - 1) * h;
              const c = 1 + ((comboProfile.contrastMult || 1) - 1) * h;
              const hue = (comboProfile.hueOffset || 0) * h;
              if (hue < 0.5 && sat <= 1.01 && c <= 1.02) return 'none';
              let out = 'hue-rotate(' + hue.toFixed(1) + 'deg) saturate(' +
                  sat.toFixed(2) + ') contrast(' + c.toFixed(2) + ')';
              if (hslRainbowFilter.live && Math.abs(hslRainbowFilter.bright - 1) > 0.01) {
                  out += ' brightness(' + hslRainbowFilter.bright.toFixed(3) + ')';
              }
              return out;
          }

          function applyComboPostProcess() {
              const filterValue = getComboCanvasFilter();
              if (filterValue === 'none') return;
              const w = mainCanvas.width,
                  h = mainCanvas.height;
              if (scratch.width !== w || scratch.height !== h) { scratch.width = w;
                  scratch.height = h; }
              scratchCtx.clearRect(0, 0, w, h);
              scratchCtx.drawImage(mainCanvas, 0, 0);
              gctx.clearRect(0, 0, w, h);
              gctx.save();
              gctx.filter = filterValue;
              gctx.drawImage(scratch, 0, 0);
              gctx.restore();
              gctx.filter = 'none';
          }

          let masterFilterPrimed = false;
          let lastMasterFilterApply = 0;
          /* v10: master filter chain, kept as parts so applyYouTubeSurfaceFilters()
             can compose it onto the YouTube shell/iframe surfaces. */
          let masterFilterParts = [];
          let masterFilterValue = 'none';
          /* v10: set true while an automated B&W sweep (section 14b) owns the slider,
             so anti-linger / anti-washout guards stand down instead of fighting it. */
          let bwSweepActive = false;

          /* ================================================================
           *  B&W INVERT — WORKING TWO-RAIL SCRIPT
           *  0–50%  : 0 Light Emission Inversion. Hue-rotate across the spectrum.
           *  50–100%: Full Light Emission Inversion ramping to invert(75%),
           *            hue-rotate continues through 180–360° (entire 0–100% wheel).
           *  Applied to the glitch canvas + YouTube surfaces (never document.body).
           * ================================================================ */
          const hueCycleFilter = { rot: 0, sat: 1, con: 1, live: false };
          const hslRainbowFilter = { sat: 1, bright: 1, live: false };

          function boardFilterCtx() {
              return {
                  ghost: (typeof getGhostMode === 'function') ? getGhostMode() : 'OFF',
                  vsync: (typeof getVsyncMode === 'function') ? getVsyncMode() : 'OFF',
                  warp: isAiWarpActive,
                  bw: bwMasterLevel()
              };
          }

          function stepHueCycleFilter(dt) {
              const t = clamp01(hueMasterLevel() * masterOpacity);
              const map = (window.GlitchEngine && GlitchEngine.hueCycleMap)
                  ? GlitchEngine.hueCycleMap(t, boardFilterCtx())
                  : { hueDeg: t * 360, sat: 1, contrast: 1, live: t > 0.008 };
              /* AI WARP Hue Offset master: shifts the wheel in proportion to the
                 paired Hue/Color Cycle strength (silent when both voices rest). */
              let tgt = (map.hueDeg || 0) + voiceFxSettings.hueOffset * Math.min(1, t * 1.5);
              try {
                  const conf = fxConfluenceHue(0);
                  const pal = videoPalette.hue || 0;
                  let d = ((conf - pal) % 360 + 540) % 360 - 180;
                  tgt = tgt + d * 0.16;
              } catch (e) {}
              /* R2 SOFT-EYE: the wheel keeps turning — a slow drift when calm, a
                 rapid full-wheel cycle inside a crescendo (SOFT.hueSpin) */
              tgt = (tgt + SOFT.hueSpin) % 360;
              const k = 1 - Math.exp(-(2.15 + 6.0 * softK()) * Math.max(0, dt || 0.016));
              hueCycleFilter.rot = (window.GlitchEngine && GlitchEngine.easeHueDeg)
                  ? GlitchEngine.easeHueDeg(hueCycleFilter.rot, tgt, k)
                  : tgt;
              hueCycleFilter.sat = easeExp(hueCycleFilter.sat, map.sat || 1, dt || 0.016, 2.05);
              hueCycleFilter.con = easeExp(hueCycleFilter.con, map.contrast || 1, dt || 0.016, 2.05);
              hueCycleFilter.live = !!map.live || Math.abs(hueCycleFilter.rot) > 0.4 ||
                  Math.abs(hueCycleFilter.sat - 1) > 0.008;
          }

          function stepHslRainbowFilter(dt) {
              const t = clamp01((effectAlphas['HSL Rainbow'] || 0) * masterOpacity);
              const map = (window.GlitchEngine && GlitchEngine.hslRainbowMap)
                  ? GlitchEngine.hslRainbowMap(t, boardFilterCtx())
                  : { satFilter: 1, brightFilter: 1, live: t > 0.008 };
              hslRainbowFilter.sat = easeExp(hslRainbowFilter.sat, map.satFilter || 1, dt || 0.016, 2.0);
              hslRainbowFilter.bright = easeExp(hslRainbowFilter.bright, map.brightFilter || 1, dt || 0.016, 2.0);
              hslRainbowFilter.live = !!map.live || Math.abs(hslRainbowFilter.sat - 1) > 0.008 ||
                  Math.abs(hslRainbowFilter.bright - 1) > 0.008;
          }

          function applyMasterFilters() {
              if (!document.body.classList.contains('playback-on')) {
                  document.documentElement.style.filter = '';
                  document.body.style.filter = '';
                  masterFilterPrimed = false;
                  return;
              }
              const now = performance.now();
              if (masterFilterPrimed && now - lastMasterFilterApply < 12) return;
              masterFilterPrimed = true;
              const filters = [];

              if (hueCycleFilter.live) {
                  filters.push('hue-rotate(' + hueCycleFilter.rot.toFixed(2) + 'deg)');
                  if (hueCycleFilter.con > 1.008) {
                      filters.push('contrast(' + hueCycleFilter.con.toFixed(3) + ')');
                  }
              }
              const satF = hueCycleFilter.sat * (hslRainbowFilter.live ? hslRainbowFilter.sat : 1);
              if (Math.abs(satF - 1) > 0.008) {
                  filters.push('saturate(' + satF.toFixed(3) + ')');
              }
              if (hslRainbowFilter.live && Math.abs(hslRainbowFilter.bright - 1) > 0.008) {
                  filters.push('brightness(' + hslRainbowFilter.bright.toFixed(3) + ')');
              }

              const bwParts = bwInvertCssParts(bwMasterLevel());
              for (let i = 0; i < bwParts.length; i++) filters.push(bwParts[i]);

              masterFilterParts = filters;
              const value = filters.length ? filters.join(' ') : 'none';
              masterFilterValue = value;
              const appScope = voiceFxSettings.scope === 'app';
              const scopedKey = (appScope ? 'app|' : 'lens|') + value;
              if (domCache.bodyFilter !== scopedKey) {
                  domCache.bodyFilter = scopedKey;
                  if (document.body.style.filter) document.body.style.filter = '';
                  /* FX SCOPE APP (AI WARP 6.4.26): the chain runs once on the root
                     element over the whole app. LENS (3.0 v10): it drives only the
                     glitch canvas and the YouTube surfaces. Never both, so nothing
                     is inverted twice. */
                  const root = document.documentElement;
                  const rootValue = appScope ? value : '';
                  if (root.style.filter !== rootValue) root.style.filter = rootValue;
                  if (mainCanvas) {
                      const canvasValue = appScope ? 'none' : value;
                      applyStyleIfChanged(mainCanvas, 'filter', canvasValue);
                      applyStyleIfChanged(mainCanvas, 'webkitFilter', canvasValue);
                  }
              }
              lastMasterFilterApply = now;
              applyYouTubeSurfaceFilters();
          }

          /* ------------------------------------------------------------------ *
           *  10b. B&W INVERT SWEEP — occasional curved 50%→100%→50% transitions *
           *  50% = rail switch (0 emission invert); 100% = full 75% invert.     *
           *  Fires every ~20-45s ("occasional"),                                *
           *  eases with an in-out cubic curve, stands down when the user locks  *
           *  or drags the B&W Invert slider, and only runs during playback.     *
           * ------------------------------------------------------------------ */
          const bwSweep = {
              active: false,
              phase: 'idle',          // 'leadIn' | 'rise' | 'peak' | 'fall' | 'settle'
              phaseStart: 0,
              phaseDur: 1,
              from: 0,
              to: 0,
              nextAt: Infinity        // safe sentinel; overwritten by bwSweepScheduleNext() below
          };

          function bwSweepScheduleNext(now, minDelay, maxDelay) {
              /* R1.5: darker sources invite the inversion sweep more often —
                 the source's darkness sets its cadence */
              const dk = clamp01(videoPalette.darkness || 0.4);
              const lo = (minDelay || 20000) * (1.25 - 0.45 * dk);
              const hi = (maxDelay || 45000) * (1.25 - 0.45 * dk);
              bwSweep.nextAt = now + lo + Math.random() * (hi - lo);
          }
          bwSweepScheduleNext(performance.now(), 14000, 28000);

          const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

          function bwSweepSetPhase(phase, now, dur, from, to) {
              bwSweep.phase = phase;
              bwSweep.phaseStart = now;
              bwSweep.phaseDur = Math.max(1, dur);
              bwSweep.from = from;
              bwSweep.to = to;
          }

          function bwSweepWrite(v) {
              const val = clamp01(v);
              effectAlphas['B&W Invert'] = val;
              if (randomTargets) randomTargets['B&W Invert'] = val;
              const el = sliderElements['B&W Invert'];
              if (el && Math.abs(val - (sliderWritten['B&W Invert'] || 0)) > 0.004) {
                  sliderWritten['B&W Invert'] = val;
                  el.value = val.toFixed(3);
              }
              return val;
          }

          function bwSweepStandDown(now) {
              bwSweep.active = false;
              bwSweepActive = false;
              bwSweep.phase = 'idle';
              bwSweepScheduleNext(now || performance.now());
          }

          function stepBwSweep(now) {
              // Respect the user: locked slider, cancelled effect or no playback → never sweep.
              // R4.2.4: a cancelled B&W (slider to zero or ZERO ALL) can never be swept awake.
              if (sliderLocks['B&W Invert'] || isEffectCancelled('B&W Invert') ||
                  !document.body.classList.contains('playback-on')) {
                  if (bwSweep.active) bwSweepStandDown(now);
                  else if (now >= bwSweep.nextAt) bwSweepScheduleNext(now);
                  return;
              }
              if (!bwSweep.active) {
                  if (now < bwSweep.nextAt) return;
                  bwSweep.active = true;
                  bwSweepActive = true;
                  const cur = clamp01(effectAlphas['B&W Invert'] || 0);
                  /* R2 SOFT-EYE: calm sweeps are ~1.6× longer; a crescendo makes the
                     DIA shader snap through its rails ~2× quicker */
                  const swK = lerp(1.6, 0.5, softK());
                  if (cur < 0.44) {
                      bwSweepSetPhase('leadIn', now, (450 + Math.random() * 450) * swK, cur, 0.5);
                  } else {
                      /* landmark: 75% negative light emission */
                      bwSweepSetPhase('rise', now, (1800 + Math.random() * 1400) * swK, cur, 0.75);
                  }
                  return;
              }
              const t = clamp01((now - bwSweep.phaseStart) / bwSweep.phaseDur);
              const eased = easeInOutCubic(t);
              const v = bwSweep.from + (bwSweep.to - bwSweep.from) * eased;
              switch (bwSweep.phase) {
                  case 'leadIn':
                      bwSweepWrite(v);
                      if (t >= 1) bwSweepSetPhase('rise', now, 2200 + Math.random() * 1600, 0.5, 0.75);
                      break;
                  case 'rise':
                      bwSweepWrite(v);
                      if (t >= 1) bwSweepSetPhase('peak', now, 600 + Math.random() * 900, 0.75, 0.75);
                      break;
                  case 'peak':
                      bwSweepWrite(0.75); /* R1.7: the peak rides the source's darkness */
                      if (t >= 1) bwSweepSetPhase('fall', now, 2600 + Math.random() * 1800, 0.75, 0.5);
                      break;
                  case 'fall':
                      bwSweepWrite(v);
                      if (t >= 1) bwSweepSetPhase('settle', now, 400 + Math.random() * 500, 0.5, 0.5);
                      break;
                  case 'settle':
                      bwSweepWrite(0.5);
                      if (t >= 1) bwSweepStandDown(now);
                      break;
                  default:
                      bwSweepStandDown(now);
              }
          }

          // If the user grabs the B&W Invert slider, the sweep bows out and
          // reschedules itself for later.
          if (sliderContainer) {
              sliderContainer.addEventListener('input', (e) => {
                  if (e.target === sliderElements['B&W Invert']) {
                      bwSweep.active = false;
                      bwSweepActive = false;
                      bwSweep.phase = 'idle';
                      bwSweepScheduleNext(performance.now(), 22000, 50000);
                  }
              }, true);
          }

          function getVsyncGhostFilterParts() {
              const mode = getVsyncMode();
              const ghostOn = (mode === 'GHOST_OFF' || mode === 'FULL') && activeVsyncLevel() > 0.01;
              if (!ghostOn) return null;
              const shift = clamp01(activeVsyncLevel());
              const isFull = mode === 'FULL';
              /* v11 CRISP CHAIN — the old version stacked big hue-rotations on top of
                 the combo + master chains (triple hue-rotate = mud). Now: pure
                 contrast/saturate/brightness so the ghost-synced V-Sync modes read
                 sharp and clean, and sharpen FURTHER when AI Warp is active. */
              const contrast = 1.10 + shift * (isFull ? 0.34 : 0.18) + (isAiWarpActive ? 0.08 : 0);
              const sat = 1 + shift * (isFull ? 0.55 : 0.28);
              const bright = 1 + shift * (isFull ? 0.04 : 0.02);
              const bwV = bwInvertMap(bwMasterLevel());
              const parts = [
                  'contrast(' + contrast.toFixed(2) + ')',
                  'saturate(' + (sat * (bwV.rail === 'emission' ? 0.85 : 1)).toFixed(2) + ')',
                  'brightness(' + bright.toFixed(2) + ')'
              ];
              /* Hue rail only here — emission invert lives on masterFilterParts
                 so YouTube is not double-inverted. V-Sync still conflues via
                 fxConfluenceHue (scan colour) + this saturate duck. */
              if (bwV.live && bwV.rail === 'hue') {
                  parts.push('hue-rotate(' + (bwV.hueDeg * 0.25).toFixed(1) + 'deg)');
              }
              return parts;
          }

          function ensureOverlayStack() {
              if (mainCanvas) {
                  mainCanvas.style.zIndex = '5';
                  mainCanvas.style.pointerEvents = 'none';
                  mainCanvas.style.opacity = '1';
              }
              if (ytWarpShell) {
                  ytWarpShell.style.zIndex = '1';
                  ytWarpShell.style.pointerEvents = 'none';
              }
              const iframe = (typeof getYouTubeIframeElement === 'function') ? getYouTubeIframeElement() : null;
              if (iframe) {
                  iframe.style.zIndex = '0';
                  iframe.style.pointerEvents = 'none';
              }
          }

          function applyYouTubeSurfaceFilters() {
              ensureOverlayStack();
              const base = 'brightness(1.02) contrast(1.12) saturate(1.06)';
              const iframeFilters = [base];
              const shellFilters = [base];                if (isAiWarpActive) {
                  // AI Warp: higher contrast + saturation for crisper video underneath warp
                  iframeFilters.push('saturate(1.72)', 'contrast(1.28)', 'brightness(1.06)');
                  shellFilters.push('url(#ai-warp-filter)', 'saturate(1.60)', 'contrast(1.22)',
                  'brightness(1.05)');
                  if (typeof aiWarpState !== 'undefined' && aiWarpState.aurora > 0.2) {
                      const a = aiWarpState.aurora;
                      shellFilters.push('hue-rotate(' + ((aiWarpHue || 0) * 0.22).toFixed(1) + 'deg)');
                      iframeFilters.push('saturate(' + (1.25 + a * 0.45).toFixed(2) + ')');
                  }
                  // Dynamic contrast boost tied to warp displacement
                  if (typeof aiWarpState !== 'undefined' && aiWarpState.disp > 4) {
                      const boost = clamp01((aiWarpState.disp - 4) / 10);
                      iframeFilters.push('contrast(' + (1 + boost * 0.25).toFixed(2) + ')');
                  }
              }
              const vLevel = activeVsyncLevel();
              if (getVsyncMode() !== 'OFF' && vLevel > 0.01) {
                  const sharpen = clamp01((vLevel - 0.35) / 0.65); // starts sharpening earlier
                  if (sharpen > 0.02) {
                      const br = (1 + sharpen * 0.10).toFixed(3);
                      const ct = (1 + sharpen * 0.38).toFixed(3); // stronger contrast
                      const st = (1 + sharpen * 0.18).toFixed(3); // more saturation pop
                      iframeFilters.push('brightness(' + br + ')', 'contrast(' + ct + ')', 'saturate(' + st + ')');
                      shellFilters.push('brightness(' + br + ')', 'contrast(' + (1 + sharpen * 0.24).toFixed(3) + ')', 'saturate(' + st + ')');
                      // V-Sync specific hue micro-shift for visual differentiation from AI Warp
                      const vsMode = getVsyncMode();
                      const vsHueDelta = vsMode === 'FULL' ? -22 : vsMode === 'GHOST_OFF' ? 14 : 8;
                      if (sharpen > 0.15) {
                          iframeFilters.push('hue-rotate(' + (vsHueDelta * sharpen).toFixed(1) + 'deg)');
                      }
                  }
              }
              const ghostParts = getVsyncGhostFilterParts();
              if (ghostParts) { iframeFilters.push.apply(iframeFilters, ghostParts);
                  shellFilters.push.apply(shellFilters, ghostParts); }

              /* v10: compose the master hue/B&W chain LAST on the YouTube surfaces —
                 the same visual position it used to occupy as the outermost body
                 filter, without the body-level leak into local media surfaces. */
              const lensScope = voiceFxSettings.scope !== 'app';
              if (lensScope && masterFilterParts && masterFilterParts.length) {
                  iframeFilters.push.apply(iframeFilters, masterFilterParts);
                  shellFilters.push.apply(shellFilters, masterFilterParts);
              }

              const localTargets = [];
              if (video && video.style.display !== 'none') localTargets.push(video);
              if (localArtEl && localArtEl.style.display !== 'none') localTargets.push(localArtEl);
              const bwLocal = lensScope ? bwInvertCssParts(bwMasterLevel()) : [];
              const localFilter = ((ghostParts || []).concat(bwLocal)).join(' ') || 'none';
              for (let i = 0; i < localTargets.length; i++) {
                  applyStyleIfChanged(localTargets[i], 'filter', localFilter);
              }

              if (ytWarpShell) {
                  applyStyleIfChanged(ytWarpShell, 'filter', shellFilters.join(' '));
                  applyStyleIfChanged(ytWarpShell, 'webkitFilter', shellFilters.join(' '));
                  const op = Math.min(1, youtubeIframeVisibility * 0.94 + 0.06).toFixed(3);
                  applyStyleIfChanged(ytWarpShell, 'opacity', op);
              }
              const surfaces = [];
              if (ytFrame) surfaces.push(ytFrame);
              const liveIframe = getYouTubeIframeElement();
              if (liveIframe) surfaces.push(liveIframe);
              const fv = iframeFilters.join(' ');
              for (let i = 0; i < surfaces.length; i++) {
                  applyStyleIfChanged(surfaces[i], 'filter', fv);
                  applyStyleIfChanged(surfaces[i], 'webkitFilter', fv);
                  applyStyleIfChanged(surfaces[i], 'opacity', youtubeIframeVisibility.toFixed(3));
              }
          }
          let youtubeIframeVisibility = 1;
          let youtubeIframeVisibilityTarget = 1;

          /* ------------------------------------------------------------------ *
           *  10. GHOST PROTOCOL v11 — CRISP ENGINE (total redo)                 *
           *  • ZERO blur: channel ghosts are hard-edged offsets, never smeared  *
           *  • Contrast-forward pre-filter with trimmed saturation (no grey mud)*
           *  • Full-screen soft-light "curve/glow" washes removed entirely      *
           *  • 1px hard scan lines + hard-translate column snap (no squash)     *
           *  • Single crisp sweeping hairline as the ghost's signature          *
           *  • AI Warp confluence: ghost SHARPENS further over the warp engine  *
           * ------------------------------------------------------------------ */
          /* R1.4: the Ghost/V-Sync SVG filter pair (vsync-ghost-hue /
             vsync-ghost-saturate + the sharpen convolve) is now LIVE —
             written every frame from the confluence state and referenced
             by the ghost's snapshot pre-filter, so "the filters" are a
             real, confluenced part of the pipeline. */
          const vsyncGhostHueEl = document.getElementById('vsync-ghost-hue');
          const vsyncGhostSatEl = document.getElementById('vsync-ghost-saturate');
          const vsyncGhostCache = { h: -999, s: -999 };
          function writeGhostVsyncFilter(hueDeg, satVal) {
              const hv = Math.round(((hueDeg % 360) + 360) % 360);
              const sv = Math.round(clamp(satVal, 0, 3) * 100) / 100;
              if (Math.abs(hv - vsyncGhostCache.h) > 0.5 && vsyncGhostHueEl && vsyncGhostHueEl.setAttribute) {
                  vsyncGhostHueEl.setAttribute('values', String(hv));
                  vsyncGhostCache.h = hv;
              }
              if (Math.abs(sv - vsyncGhostCache.s) > 0.01 && vsyncGhostSatEl && vsyncGhostSatEl.setAttribute) {
                  vsyncGhostSatEl.setAttribute('values', sv.toFixed(2));
                  vsyncGhostCache.s = sv;
              }
          }

          function renderGhostProtocol(now, baseSnapshot) {
              const mode = getGhostMode();
              if (mode === 'OFF' || !ghostActive || ghostLevel <= 0.01) return;
              const w = mainCanvas.width,
                  h = mainCanvas.height;
              if (w === 0 || h === 0) return;
              const t = now * 0.001;
              const warp = isAiWarpActive;
              const baseStrength = clamp01(ghostLevel);
              const intensity = baseStrength * Math.max(0.05, +masterOpacity || 0) * 0.025; // R1 (006): 2% max
              if (intensity <= 0) return;

              // CRISP ENGINE source table — blur multiplier is gone for good
              const sources = (window.GlitchEngine && GlitchEngine.GHOST_PROFILES)
                  ? GlitchEngine.GHOST_PROFILES
                  : { // blur = R1 (006) soft-pass strength
                  DIA:      { split: 0.88, chan: 0.72, lines: 0.50, glow: 0.22, warp: 0.38, blur: 0.35, hueA: 313, hueB: 145, sat: 1.22, gray: 0.06, crt: 0, led: 0, dia: 1 },
                  SPECTRUM: { split: 1.00, chan: 0.90, lines: 1.00, glow: 0.45, warp: 0.70, blur: 1.00, hueA: 135, hueB: 75, sat: 1.45, gray: 0.30, crt: 0 },
                  CRT:      { split: 0.70, chan: 0.65, lines: 1.65, glow: 0.30, warp: 0.45, blur: 0.80, hueA: 55,  hueB: 25, sat: 0.85, gray: 0.74, crt: 1 },
                  PLASMA:   { split: 1.15, chan: 1.00, lines: 0.80, glow: 0.60, warp: 0.95, blur: 1.25, hueA: 195, hueB: 100, sat: 1.85, gray: 0.16, crt: 0 },
                  LED:      { split: 1.38, chan: 1.22, lines: 0.22, glow: 0.90, warp: 1.12, blur: 0.12, hueA: 0,   hueB: 120, sat: 2.05, gray: 0.00, crt: 0, led: 1, dia: 0 }
              };
              const mp = sources[mode] || sources.SPECTRUM;
              const crispK = warp ? 1.25 : 1.0;   // warp confluence: extra contrast
              const dampK = warp ? 0.82 : 1.0;    // ...and slightly drier alphas so the warp stays readable

              if (scratch.width !== w || scratch.height !== h) { scratch.width = w;
                  scratch.height = h; }
              scratchCtx.clearRect(0, 0, w, h);
              scratchCtx.save();
              scratchCtx.globalAlpha = 1;
              /* R1.4 CONFLUENCE: the ghost's filter hue is now the board's
                 CONFLUENCE HUE — the source root bent by the chord tone,
                 the Hue/Color Cycle slider, HSL Rainbow, the AI-warp prism
                 and the combo profile (fxConfluenceHue) — plus the mode's
                 own slow wobble character at half strength. */
              const hueDeg = (Math.sin(t * 0.8) * mp.hueA * 0.5 + Math.cos(t * 0.33) * mp.hueB * 0.5 +
                  fxConfluenceHue(0));
              /* R1.4: B&W Invert presence desaturates the ghost — the
                 filters conflue with the mono state of the board */
              const bwGhost = bwInvertMap(bwMasterLevel());
              const crtGray = clamp01(mp.gray * (0.55 + baseStrength * 0.45) +
                  bwGhost.invert * 0.28);
              if ('filter' in scratchCtx) {
                  // CRISP pre-filter: strong contrast, tiny brightness lift
                  const ct = (1.18 + baseStrength * 0.85 * crispK).toFixed(2);
                  /* R1.4: saturation is confluenced too — the source's own
                     saturation and the HSL Rainbow level feed the filter.
                     The hueRotate + saturate now run inside the LIVE SVG
                     filter pair (which adds the sharpen convolve). */
                  const satConf = mp.sat * (0.70 + 0.45 * clamp01(videoPalette.sat / 80)) *
                      (1 + 0.25 * clamp01(effectAlphas['HSL Rainbow'] || 0));
                  const st = 1.05 + baseStrength * satConf * 0.85;
                  const br = (1.02 + baseStrength * 0.30).toFixed(2);
                  writeGhostVsyncFilter(hueDeg, st);
                  const bwG = bwInvertMap(bwMasterLevel());
                  const bwGhostCss = (bwG.live ? (' hue-rotate(' + bwG.hueDeg.toFixed(1) + 'deg)' +
                      (bwG.invert > 0.004 ? (' invert(' + bwG.invert.toFixed(3) + ')') : '')) : '');
                  scratchCtx.filter = 'url(#vsync-hue-ghost-filter) grayscale(' + crtGray.toFixed(2) +
                      ') contrast(' + ct + ') brightness(' + br + ')' + bwGhostCss;
              }
              scratchCtx.drawImage(baseSnapshot, 0, 0, w, h);
              scratchCtx.restore();
              scratchCtx.filter = 'none';

              /* Hard-edged channel split — NO blur pass anywhere */
              const splitOffset = (1.2 + intensity * 150) * mp.split *
                  (0.82 + 0.30 * srcEnergyK()); /* R1.5: source energy widens the split */
              const channelAlpha = Math.min(0.30, (0.05 + intensity * 10) * mp.chan) * dampK;
              const lineAlpha = Math.min(0.16, (0.025 + intensity * 5.0) * mp.lines) * dampK;
              const warpAlpha = Math.min(0.16, (0.015 + intensity * 5.5) * mp.warp) * dampK;

              gctx.save();
              gctx.globalCompositeOperation = 'screen';
              gctx.globalAlpha = channelAlpha;
              gctx.drawImage(scratch, -splitOffset, 0, w, h);
              gctx.drawImage(scratch, splitOffset * 0.85, splitOffset * 0.20, w, h);

              /* R1 OLD-SOUL (006): the soft blur-drift echo — the dreamy twin
                 of the hard split at half alpha, so both readings of "ghost"
                 coexist in one frame */
              gctx.globalAlpha = channelAlpha * 0.55;
              /* R1.8: busy video smears the ghost — motion blur, keyed live */
              gctx.filter = 'blur(' + ((0.35 + intensity * 45) * (mp.blur || 1) * R16.smearK()).toFixed(2) + 'px)';
              gctx.drawImage(scratch, -splitOffset * 0.6, 0, w, h);
              gctx.drawImage(scratch, splitOffset * 0.5, splitOffset * 0.18, w, h);
              gctx.filter = 'none';

              /* 1px hard scan lines */
              gctx.globalCompositeOperation = 'lighter';
              gctx.globalAlpha = lineAlpha;
              const lineCount = Math.round((mp.crt ? 26 : 16) * (warp ? 0.7 : 1));
              for (let i = 0; i < lineCount; i++) {
                  const y = Math.floor(((i * 53) + now * 0.08) % h);
                  const drift = Math.sin(now * 0.012 + i * 1.73) * splitOffset * 1.6;
                  gctx.drawImage(scratch, 0, y, w, 1, drift, y, w, 1);
              }

              /* Column snap — hard horizontal translate, no vertical squash */
              gctx.globalCompositeOperation = 'screen';
              gctx.globalAlpha = warpAlpha;
              const columns = mp.crt ? 10 : 14;
              const colWidth = Math.ceil(w / columns);
              const warpAmp = 1 + intensity * 110;
              for (let c = 0; c < columns; c++) {
                  const sx = c * colWidth;
                  const sw = Math.min(colWidth, w - sx);
                  if (sw <= 0) continue;
                  const wave = Math.sin(t * 5.2 + c * 0.65) * warpAmp;
                  /* R1 OLD-SOUL (006): the second cosine wave rides the columns
                     vertically (toned 55%) — a UV-style shear inside the snap */
                  const wave2 = Math.cos(t * 3.6 + c * 0.43) * warpAmp * 0.55 * 0.55;
                  gctx.drawImage(scratch, sx, 0, sw, h, sx + wave, wave2, sw, h);
              }

              /* CRT comb — subtle, 1px */
              if (mp.crt) {
                  gctx.globalCompositeOperation = 'overlay';
                  gctx.globalAlpha = Math.min(0.08, 0.015 + intensity * 3.0);
                  gctx.fillStyle = 'rgba(0,0,0,0.35)';
                  for (let y = 0; y < h; y += 2) gctx.fillRect(0, y, w, 1);
              }
              if (mp.led) {
                  gctx.globalCompositeOperation = 'screen';
                  gctx.globalAlpha = Math.min(0.16, 0.035 + intensity * 4.6);
                  const sub = Math.max(1, Math.round(w / 240));
                  for (let x = 0; x < w; x += sub * 3) {
                      gctx.fillStyle = 'rgba(255,36,36,0.55)';
                      gctx.fillRect(x, 0, sub, h);
                      gctx.fillStyle = 'rgba(36,255,72,0.55)';
                      gctx.fillRect(x + sub, 0, sub, h);
                      gctx.fillStyle = 'rgba(36,72,255,0.55)';
                      gctx.fillRect(x + sub * 2, 0, sub, h);
                  }
              }
              if (mp.dia) {
                  gctx.globalCompositeOperation = 'soft-light';
                  gctx.globalAlpha = Math.min(0.12, 0.03 + intensity * 3.5);
                  const diaGrad = gctx.createLinearGradient(0, 0, w, h);
                  diaGrad.addColorStop(0, 'hsla(313,90%,55%,1)');
                  diaGrad.addColorStop(0.5, 'hsla(145,80%,50%,1)');
                  diaGrad.addColorStop(1, 'hsla(313,90%,55%,1)');
                  gctx.fillStyle = diaGrad;
                  gctx.fillRect(0, 0, w, h);
              }

              /* R1 OLD-SOUL (006): curve toning — a tri-color soft-light gradient
                 shaping the frame like a pseudo color curve (toned to 0.08) */
              gctx.globalCompositeOperation = 'soft-light';
              gctx.globalAlpha = Math.min(0.08, 0.02 + intensity * 4.8);
              const curveGrad = gctx.createLinearGradient(0, 0, 0, h);
              /* R1.4: the curve toning follows the SOURCE's own key colors
                 (videoPalette.colors) instead of a fixed blue/green/purple */
              const cc = videoPalette.colors;
              const ccStr = (c, dl) => 'hsla(' + c.h.toFixed(1) + ',' + Math.max(40, c.s).toFixed(0) +
                  '%,' + Math.min(82, Math.max(18, c.l + dl)).toFixed(0) + '%,1)';
              curveGrad.addColorStop(0, ccStr(cc[0], -14));
              curveGrad.addColorStop(0.5, ccStr(cc[3], 10));
              curveGrad.addColorStop(1, ccStr(cc[2], -8));
              gctx.fillStyle = curveGrad;
              gctx.fillRect(0, 0, w, h);
              /* R1 OLD-SOUL (006): the cyan phosphor wash — the ghost's
                 signature glow, toned to 0.08 */
              gctx.globalAlpha = Math.min(0.08, 0.02 + intensity * 4.2);
              /* R1.4: the phosphor wash sings the confluence hue (was a
                 fixed cyan), keeping its slow wobble character */
              gctx.fillStyle = fxHsla(fxConfluenceHue(Math.sin(t * 1.2) * (mp.crt ? 9 : 18)), 100, 58, 1);
              gctx.fillRect(0, 0, w, h);

              /* R2 SOFT-EYE — GHOST LIGHT BURST. When the burst gate opens the
                 ghost fires a soft-bell light event: 'color' = a saturated
                 screen wash walking the wheel; 'dia' = a dia-inverted flare
                 (difference blend of the snapshot — the negative light emission
                 the B&W rail is passing through at the same moment); 'both'.
                 Never a cut: the bell rises and falls over 0.65–2.6 s. */
              if (SOFT.burst > 0.01) {
                  const be = SOFT.burst;
                  const kind = SOFT.burstKind || 'dia';
                  const bHue = (fxConfluenceHue(0) + t * 90 * (1 + 2 * softK()) + mp.hueA * 0.25) % 360;
                  if (kind === 'color' || kind === 'both') {
                      gctx.globalCompositeOperation = 'screen';
                      gctx.globalAlpha = Math.min(0.30, 0.06 + 0.26 * be) * dampK;
                      const cg = gctx.createLinearGradient(0, 0, w, h);
                      cg.addColorStop(0, fxHsla(bHue, 100, 60, 1));
                      cg.addColorStop(0.5, fxHsla((bHue + 120) % 360, 100, 58, 1));
                      cg.addColorStop(1, fxHsla((bHue + 240) % 360, 100, 60, 1));
                      gctx.fillStyle = cg;
                      gctx.fillRect(0, 0, w, h);
                  }
                  if (kind === 'dia' || kind === 'both') {
                      gctx.globalCompositeOperation = 'difference';
                      gctx.globalAlpha = Math.min(0.55, 0.10 + 0.50 * be) * dampK;
                      gctx.drawImage(scratch, splitOffset * 0.35 * be, 0, w, h);
                      gctx.globalCompositeOperation = 'soft-light';
                      gctx.globalAlpha = Math.min(0.22, 0.28 * be);
                      gctx.fillStyle = fxHsla((bHue + 180) % 360, 90, 55, 1);
                      gctx.fillRect(0, 0, w, h);
                  }
              }

              /* Single crisp sweeping hairline — the ghost's signature (replaces the
                 old full-screen soft-light curve + glow washes that greyed the board) */
              gctx.globalCompositeOperation = 'lighter';
              const sweepHue = fxConfluenceHue(mp.hueA * 0.5); /* R1.4 confluence */
              const sweepY = Math.floor(((t * 0.11) % 1) * h);
              gctx.globalAlpha = Math.min(0.22, 0.05 + intensity * 4) * (mp.glow * 1.4) * dampK;
              const sweepGrad = gctx.createLinearGradient(0, sweepY - 1, 0, sweepY + 1);
              sweepGrad.addColorStop(0, 'hsla(' + sweepHue.toFixed(1) + ',100%,72%,0)');
              sweepGrad.addColorStop(0.5, 'hsla(' + sweepHue.toFixed(1) + ',100%,80%,1)');
              sweepGrad.addColorStop(1, 'hsla(' + sweepHue.toFixed(1) + ',100%,72%,0)');
              gctx.fillStyle = sweepGrad;
              gctx.fillRect(0, sweepY - 1, w, 2);
              gctx.restore();
              gctx.filter = 'none';
          }

          /* ------------------------------------------------------------------ *
           *  11. V-SYNC v11 — SHARP ENGINE (total redo)                         *
           *  • 1px bright scan-bar core + tight 8px halo (no fat soft bar)      *
           *  • Tears are hard x-offset slices — no vertical channel squash      *
           *  • Roll is a single crisp displaced band with a dark separation line*
           *  • Level-gated 1px scanline comb                                    *
           *  • AI Warp confluence: full crispness retained (no softening)       *
           * ------------------------------------------------------------------ */
          const V_SYNC_METHODS = (window.GlitchEngine && GlitchEngine.VSYNC_METHODS)
              ? GlitchEngine.VSYNC_METHODS
              : {
              ON:        { bar: 1.0,  tears: 0.55, roll: 0,    hum: 0.35, snap: 0, sharp: 0.62, scanphase: 1,    harmony: 0.28 },
              GHOST_OFF: { bar: 0.35, tears: 0.12, roll: 0.14, hum: 0.18, snap: 0, sharp: 0.40, scanphase: 0.32, harmony: 1.00 },
              FULL:      { bar: 1.15, tears: 1.0,  roll: 0.85, hum: 0.85, snap: 1, sharp: 1.00, scanphase: 0.88, harmony: 0.55 }
          };

          function renderVsyncScan(now, baseSnapshot) {
              const mode = getVsyncMode();
              if (mode === 'OFF') return;
              const levelRaw = activeVsyncLevel();
              if (!(levelRaw > 0.01)) return;
              const w = mainCanvas.width,
                  h = mainCanvas.height;
              if (w === 0 || h === 0) return;
              const meth = V_SYNC_METHODS[mode] || V_SYNC_METHODS.ON;
              const warp = isAiWarpActive;
              const crispK = warp ? 1.0 : 0.9; // v11: warp keeps FULL crispness — no softening
              const t = now * 0.001;
              const level = Math.min(1, levelRaw * (mode === 'FULL' ? 1.5 : 1.25)) * crispK;
              const globalFade = clamp01(0.10 + masterOpacity * 0.30);
              if (!(level > 0.01) || !(globalFade > 0)) return;

              const scanSpeedHz = (0.22 + level * 0.3) * (warp ? 0.85 : 1) *
                  R16.scanSpeed() * (0.55 + 0.45 * (meth.scanphase != null ? meth.scanphase : 1)); /* scanphasing */
              const scanWobble = Math.sin(t * 0.23) * 0.06 + Math.cos(t * 0.11 + 1.2) * 0.04;
              const scanPos = (t * scanSpeedHz + scanWobble) % 1;
              const scanY = scanPos * h;

              const ghostOn = ghostActive && ghostLevel > 0.01;
              const ghostSync = ghostOn ? clamp01(ghostLevel * 1.2) : 0;
              /* R1.4 CONFLUENCE: the scan hue is the board's CONFLUENCE HUE
                 (source root × chord × hue slider × rainbow × AI-warp prism
                 × combo), keeping V-Sync's own wobble character — and the
                 Ghost/V-Sync SVG filter pair stays live below so the
                 filters conflue with everything too. */
              const harmK = meth.harmony != null ? meth.harmony : 0;
              const bwScan = bwInvertMap(bwMasterLevel());
              const scanGradientHue = fxConfluenceHue(
                  (ghostOn ? Math.sin(t * 1.2) * 18 : Math.sin(t * 0.7) * 16)
                  + harmK * 180 * (bwScan.invert / 0.75)
                  + harmK * (bwScan.hueDeg * 0.25));
              writeGhostVsyncFilter(scanGradientHue,
                  1 + 0.5 * clamp01(effectAlphas['HSL Rainbow'] || 0));

              const hum14ms = Math.sin(t * 62.832);
              const humAmp = (0.012 + level * 0.035) * meth.hum *
                  (0.80 + 0.40 * srcMotionK()); /* R1.4: source motion feeds the hum */
              const phase = Math.sin(t * 1.35 * (0.6 + 0.4 * meth.tears)) * 0.22 + Math.cos(t * 0.53) * 0.11 +
                  hum14ms * humAmp;
              const rollActive = meth.roll > 0 && phase < -0.03 && Math.sin(t * 0.9 + 1.3) > -0.1;
              const rollDir = phase >= 0 ? 1 : -1;
              const rollSpeedHz = (0.05 + level * 0.12) * rollDir * (0.6 + 0.4 * meth.roll);
              const rollPhase = rollActive ? ((t * rollSpeedHz) % 1) : 0;
              const snapGate = (meth.snap && rollActive && !warp) ? Math.floor(t * 12) % 8 : 0;
              const rollShift = rollActive ? rollPhase * h * 0.5 * snapGate * 0.125 * meth.roll : 0;

              const tearCount = Math.max(1, Math.round((mode === 'FULL' ? 14 : mode === 'ON' ? 8 : 3) * meth
                  .tears * (0.35 + 0.65 * level) * R16.tearK())); /* R1.8: motion tears */
              const tearGap = Math.max(2, Math.round(h / tearCount));
              /* R1 OLD-SOUL (006): tear thickness pulses — slices thicken near
                 the phase peak, thin out elsewhere */
              const tearPulse = 0.6 + 0.4 * Math.abs(Math.sin(t * 1.2 + 0.7));
              const sharpK = meth.sharp != null ? meth.sharp : 0.5;
              const sliceHeight = Math.max(sharpK > 0.85 ? 1 : 2, Math.round(h * (0.006 / (0.70 + 0.55 * sharpK)) * tearPulse));
              const jam = level * (0.24 + 0.19 * Math.abs(Math.sin(t * 6.13 + 1.7))) * meth.tears *
                  (0.75 + 0.45 * srcEnergyK() + 0.25 * srcMotionK()); /* R1.4: source-driven tearing */

              gctx.save();

              /* R1 OLD-SOUL (006): the dark blanking head + VCR tracking burr —
                 the TV vertical-hold shadow that precedes the bright hairline
                 (sub-pixel Y so it glides, toned to 60% of the 006 alpha) */
              {
                  const thick = Math.max(1, h * 0.008);
                  const headA = Math.min(0.5, 0.05 + level * 0.16) * globalFade *
                      (rollActive ? 1.55 : 1) * 0.6;
                  if (headA > 0.004) {
                      const headGrad = gctx.createLinearGradient(0, scanY - thick * 4, 0, scanY + thick * 4);
                      headGrad.addColorStop(0, 'rgba(0,0,0,0)');
                      headGrad.addColorStop(0.5, 'hsla(0,0%,8%,1)');
                      headGrad.addColorStop(1, 'rgba(0,0,0,0)');
                      gctx.globalCompositeOperation = 'source-over';
                      gctx.globalAlpha = headA;
                      gctx.fillStyle = headGrad;
                      gctx.fillRect(0, scanY - thick * 4, w, thick * 8);
                      if (rollActive) {
                          gctx.globalCompositeOperation = 'screen';
                          gctx.globalAlpha = Math.min(0.16, headA * 0.75);
                          gctx.fillStyle = 'hsla(' + scanGradientHue.toFixed(1) + ',85%,62%,1)';
                          gctx.fillRect(0, scanY - thick * 14, w, Math.max(1, thick));
                      }
                  }
              }

              /* Hairline scan bar — 1px bright core + tight 8px halo */
              const coreY = Math.max(1, Math.min(h - 1, Math.floor(scanY)));
              const halo = gctx.createLinearGradient(0, coreY - 4, 0, coreY + 4);
              halo.addColorStop(0, 'hsla(' + scanGradientHue.toFixed(1) + ', 95%, 70%, 0)');
              halo.addColorStop(0.5, 'hsla(' + scanGradientHue.toFixed(1) + ', 95%, 68%, ' + Math.min(0.22,
                  (0.08 + level * 0.10) * meth.bar * (0.85 + 0.15 * (1 + ghostSync))).toFixed(3) + ')');
              halo.addColorStop(1, 'hsla(' + scanGradientHue.toFixed(1) + ', 95%, 70%, 0)');
              gctx.globalCompositeOperation = 'screen';
              gctx.globalAlpha = globalFade * 0.6;
              gctx.fillStyle = halo;
              gctx.fillRect(0, coreY - 4, w, 8);
              gctx.globalAlpha = Math.min(0.9, (0.40 + level * 0.5) * meth.bar) * (0.5 + globalFade * 0.5);
              gctx.fillStyle = 'hsla(' + scanGradientHue.toFixed(1) + ', 96%, 76%, 1)';
              gctx.fillRect(0, coreY, w, 1);

              /* Tears — hard displaced slices (source-over = true displacement, crisp) */
              if (meth.tears > 0.05) {
                  gctx.globalCompositeOperation = 'source-over';
                  gctx.globalAlpha = clamp01(0.55 + level * 0.4) * (0.55 + globalFade * 0.45);
                  for (let i = 0; i < tearCount; i++) {
                      const bandY = (scanY + i * tearGap) % h;
                      const above = phase >= 0;
                      /* R1 OLD-SOUL (006): up-slips (odd tears) read as
                         vertical-hold pulls against the down-tears */
                      const offset = (Math.sin(t * 7.1 + i * 2.4) * 0.55 + Math.sin(t * 3.7 + i * 0.9) *
                          0.3) * jam * (above ? 1 : 0.55) * ((i & 1) ? -0.85 : 1);
                      const gx = Math.round(offset * w * 0.5); // rounded = pixel-crisp edges
                      const by = Math.max(0, Math.min(h - sliceHeight, bandY));
                      gctx.drawImage(baseSnapshot, 0, by, w, sliceHeight, gx, by, w, sliceHeight);
                  }
              }

              /* Roll — one crisp displaced band with a dark separation line */
              if (rollActive) {
                  const bandH = Math.max(8, Math.round(h * 0.16));
                  const rY = Math.max(0, Math.min(h - bandH, Math.round(rollPhase * (h + bandH)) - bandH));
                  const shift = Math.round((rollShift % (h * 0.02)) || (level * 3 + 1));
                  gctx.globalCompositeOperation = 'source-over';
                  gctx.globalAlpha = clamp01(0.30 + level * 0.40) * meth.roll;
                  gctx.drawImage(baseSnapshot, 0, rY, w, bandH, shift, rY, w, bandH);
                  gctx.globalAlpha = clamp01(0.25 + level * 0.30) * meth.roll;
                  gctx.fillStyle = 'rgba(0,0,0,0.55)';
                  gctx.fillRect(0, rY, w, 1);
                  gctx.fillRect(0, rY + bandH, w, 1);
              }

              /* R1 OLD-SOUL (006): NTSC subcarrier shimmer — fine 1px rows
                 bleeding chroma along the roll band (toned 70%) */
              if (rollActive) {
                  const thick = Math.max(1, h * 0.008);
                  const rowGap = 2 + Math.floor(level * 2);
                  for (let y = scanY - thick * 10; y < scanY + thick * 10; y += rowGap) {
                      if (y < 0 || y >= h) continue;
                      const a = (0.025 + Math.random() * 0.05) * level * globalFade * 0.7;
                      if (!(a > 0.004)) continue;
                      gctx.globalCompositeOperation = 'soft-light';
                      gctx.globalAlpha = a;
                      gctx.fillStyle = 'hsla(' + ((scanGradientHue + 14 + Math.sin(t * 8.4 + y * 0.11) * 12 + 360) % 360).toFixed(1) + ',95%,60%,1)';
                      gctx.fillRect(0, y, w, 1);
                  }
              }
              /* R1 OLD-SOUL (006): sync field lines — faint signal rows spaced
                 like VCR head-drum pulses, only while the ghost is off (toned) */
              if (!ghostOn) {
                  const spacing = Math.max(4, Math.round(Math.max(1, h * 0.008) * (14 - level * 9)));
                  for (let y = scanY % spacing; y < h; y += spacing) {
                      const a = (0.03 + Math.random() * 0.07) * level * globalFade * 0.6;
                      if (!(a > 0.004)) continue;
                      gctx.globalCompositeOperation = 'source-over';
                      gctx.globalAlpha = a;
                      gctx.fillStyle = 'hsla(' + ((scanGradientHue + (Math.random() * 30 - 15) + 360) % 360).toFixed(1) + ',' +
                          Math.round(55 + Math.min(40, videoPalette.sat * 0.45)) + '%,58%,1)'; /* R1.4: source-sat keyed */
                      gctx.fillRect(0, y, w, 1);
                  }
              }
              /* R1 OLD-SOUL (006): phosphor sheen — a soft-light glow band
                 around the bar (ghost-synced hue, toned 75%) */
              {
                  const thick = Math.max(1, h * 0.008);
                  const phosA = Math.min(0.2, 0.02 + level * 0.1 + ghostSync * 0.06 +
                      (rollActive ? 0.035 : 0)) * globalFade * 0.75;
                  if (phosA > 0.004) {
                      const glowHue = ghostSync > 0 ? scanGradientHue : (195 + Math.sin(t * 0.8) * 12 + 360) % 360;
                      const glowGrad = gctx.createLinearGradient(0, scanY - thick * 9, 0, scanY + thick * 9);
                      glowGrad.addColorStop(0, 'hsla(0,0%,0%,0)');
                      glowGrad.addColorStop(0.5, 'hsla(' + glowHue.toFixed(1) + ',90%,' +
                          (ghostSync > 0 ? 46 : 58) + '%,1)');
                      glowGrad.addColorStop(1, 'hsla(0,0%,0%,0)');
                      gctx.globalCompositeOperation = 'soft-light';
                      gctx.globalAlpha = phosA;
                      gctx.fillStyle = glowGrad;
                      gctx.fillRect(0, scanY - thick * 9, w, thick * 18);
                  }
              }

              /* Level-gated scanline comb — only when the level is high (sharp, 1px) */
              if (level > 0.55) {
                  gctx.globalCompositeOperation = 'overlay';
                  gctx.globalAlpha = (level - 0.55) * 0.35 * meth.hum;
                  gctx.fillStyle = 'rgba(0,0,0,0.5)';
                  for (let y = (t * 40) % 3; y < h; y += 3) gctx.fillRect(0, y, w, 1);
              }

              /* R2 SOFT-EYE — V-SYNC LIGHT-BURST SEQUENCE. On an open burst gate
                 the scan fires a vertical colour sequence: 3–5 wide soft bands
                 (colour harmony steps of the confluence hue) sweep down the
                 frame following the bell; on a 'dia' burst the bands are drawn
                 in 'difference' so they read as inverted light — the V-Sync
                 half of the ghost's colour + dia inverted light burst. */
              if (SOFT.burst > 0.01) {
                  const be = SOFT.burst;
                  const kind = SOFT.burstKind || 'dia';
                  const bands = softWild() ? 5 : 3;
                  const bandH = h / bands;
                  const travel = (1 - Math.cos(Math.PI * clamp01(SOFT.gate.state.p))) * 0.5; /* 0→1 over the bell */
                  const baseHue = fxConfluenceHue(0) + t * 40 * (1 + softK());
                  for (let b = 0; b < bands; b++) {
                      const y0 = ((b / bands + travel * 0.5) % 1) * h;
                      const hueB = (baseHue + b * (harmK > 0.5 ? 60 : 90)) % 360;
                      const bg = gctx.createLinearGradient(0, y0 - bandH * 0.5, 0, y0 + bandH * 0.5);
                      bg.addColorStop(0, fxHsla(hueB, 100, 62, 0));
                      bg.addColorStop(0.5, fxHsla(hueB, 100, 62, 1));
                      bg.addColorStop(1, fxHsla(hueB, 100, 62, 0));
                      gctx.globalCompositeOperation = (kind === 'dia') ? 'difference' : (kind === 'both' && (b & 1)) ? 'difference' : 'screen';
                      gctx.globalAlpha = Math.min(0.42, (0.05 + 0.40 * be) * globalFade * (meth.bar || 0.6));
                      gctx.fillStyle = bg;
                      gctx.fillRect(0, y0 - bandH * 0.5, w, bandH);
                  }
              }
              gctx.restore();
          }

          function vsyncStepScript(now, dt) {
              const mode = getVsyncMode();
              if (mode === 'OFF') {
                  vsyncActive = false;
                  /* v11: OFF holds the level — the slider is never disabled, never
                     zeroed. Only ZERO ALL EFFECTS (or the user) moves levels. */
                  if (vsyncScanSlider && !vsyncScanSlider.disabled &&
                      Math.abs((parseFloat(vsyncScanSlider.value) || 0) - vsyncLastActiveLevel) > 0.004) {
                      vsyncScanSlider.value = vsyncLastActiveLevel.toFixed(3);
                  }
                  if (vsyncScanLabelEl) vsyncScanLabelEl.textContent = 'V-Sync: OFF (level held)';
                  if (vsyncScanBtn && vsyncScanBtn.textContent !== 'V-SYNC: OFF') vsyncScanBtn.textContent =
                      'V-SYNC: OFF';
                  return;
              }
              const s = vsyncScripts[mode];
              const warp = isAiWarpActive;
              const manual = now < vsyncManualUntil;

              if (sliderLocks.vsync) {
                  s.target = s.level;
                  s.nextAt = now + 5000;
              } else if (!manual && now >= s.nextAt) {
                  const band = vsyncBand(mode);
                  const dramatic = !warp && softWild() && Math.random() < 0.16;   /* R2: dramatic hops only in a crescendo */
                  s.target = dramatic ?
                      (Math.random() < 0.5 ? 1 : 0.05) :
                      band[0] + Math.random() * (band[1] - band[0]);
                  if (warp) s.target = Math.min(s.target, 0.9);
                  const base = mode === 'FULL' ? 2600 : mode === 'ON' ? 3000 : 3600;
                  s.nextAt = now + base * (0.6 + Math.random()) * (warp ? 1.7 : 1) * lerp(1.9, 1, softK()); /* R2 */
              }

              if (manual || sliderLocks.vsync) {
                  s.level = s.target;
              } else {
                  /* v11: faster, crisper response while AI Warp is active */
                  const rate = (mode === 'FULL' ? 1.35 : mode === 'ON' ? 1.0 : 0.85) * (warp ? 0.65 : 1) *
                      lerp(0.55, 1.2, softK());   /* R2: gentle glide calm, crisp in a crescendo */
                  const next = easeExp(s.level, s.target, dt, rate);
                  if (Math.abs(next - s.level) > 0.0005) {
                      s.level = next;
                      if (vsyncScanSlider && (s.shown === undefined || Math.abs(next - s.shown) > 0.005)) {
                          s.shown = next;
                          vsyncScanSlider.value = s.level.toFixed(3);
                      }
                  }
              }
              if (s.level > 0.01) vsyncLastActiveLevel = s.level;
              vsyncActive = s.level > 0.01;

              const pct = Math.round(s.level * 100);
              if (pct !== s.lastPct) { s.lastPct = pct;
                  updateVsyncUi(); }
          }

          function updateVsyncUi() {
              const mode = getVsyncMode();
              const level = activeVsyncLevel();
              vsyncActive = mode !== 'OFF' && level > 0.01;
              updatePresetSkin(); // v10: scanline engine re-skins the preset browser
              if (vsyncScanSlider) {
                  /* v11: the level slider is enabled in every state (locked is the
                     only disable) — OFF shows the held level instead of a park. */
                  vsyncScanSlider.disabled = !!sliderLocks.vsync;
                  vsyncScanSlider.value = (mode === 'OFF' ? vsyncLastActiveLevel : level).toFixed(3);
              }
              if (vsyncLockBtn) {
                  vsyncLockBtn.disabled = false;
                  vsyncLockBtn.classList.toggle('locked', !!sliderLocks.vsync);
                  vsyncLockBtn.textContent = sliderLocks.vsync ? '[LOCKED!]' : '<LOCK!>';
              }
              if (vsyncScanLabelEl) {
                  const base = mode === 'OFF' ?
                      'V-Sync: OFF (level held)' :
                      (V_SYNC_DEFS[mode] ? V_SYNC_DEFS[mode].label : 'V-Sync:');
                  const sharpenCue = (mode !== 'OFF' && level >= 0.72) ?
                      ' · sharpen ' + Math.round(Math.min(1, (level - 0.55) / 0.45) * 100) + '%' :
                      '';
                  vsyncScanLabelEl.textContent = base + sharpenCue + (sliderLocks.vsync && mode !== 'OFF' ?
                      ' [LOCKED]' : '');
              }
              applyYouTubeSurfaceFilters();
              if (vsyncScanBtn) {
                  vsyncScanBtn.classList.toggle('active', mode !== 'OFF');
                  vsyncScanBtn.classList.toggle('mode-ghost-off', mode === 'GHOST_OFF');
                  vsyncScanBtn.classList.toggle('mode-full', mode === 'FULL');
                  vsyncScanBtn.classList.toggle('ghost-synced', vsyncActive && ghostActive);
                  const pct = Math.round(level * 100);
                  const labels = {
                      OFF: 'V-SYNC: OFF',
                      ON: 'V-SYNC SCANPHASING: ON (' + pct + '%)',
                      GHOST_OFF: 'V-SYNC VERTICAL COLOR HARMONY: ON (' + pct + '%)',
                      FULL: 'V-SYNC SHARP: FULL ON (' + pct + '%)'
                  };
                  vsyncScanBtn.textContent = labels[mode] || labels.OFF;
              }
          }

          function updateGhostUi() {
              const mode = getGhostMode();
              ghostActive = mode !== 'OFF';
              document.body.classList.toggle('ghost-protocol-active', ghostActive);
              if (ghostProtocolBtn) {
                  ghostProtocolBtn.classList.toggle('active', ghostActive);
                  const realm = (window.GlitchEngine && ghostActive)
                      ? (GlitchEngine.ghostProfile(mode).realm || '') : '';
                  ghostProtocolBtn.textContent = ghostActive ?
                      'GHOST PROTOCOL: ' + mode + (realm && realm !== 'off' ? ' [' + realm.toUpperCase() + ']' : '') +
                      ' (' + Math.round(ghostLevel * 100) + '%)' :
                      'GHOST PROTOCOL: OFF';
              }
              updatePresetSkin(); // v10: ghost protocol re-skins the preset browser
              updateVsyncUi();
          }

          function toggleGhost() { ghostModeIndex = (ghostModeIndex + 1) % ghostModes.length;
              updateGhostUi(); }
          if (ghostProtocolSlider) ghostProtocolSlider.addEventListener('input', (e) => { ghostLevel = parseFloat(e
                  .target.value);
              /* v11: dragging the Ghost level while OFF re-engages the protocol at
                 that level — the slider is never a dead control. */
              if (getGhostMode() === 'OFF') ghostModeIndex = Math.max(1, ghostModes.indexOf('SPECTRUM'));
              updateGhostUi(); });
          if (ghostProtocolBtn) ghostProtocolBtn.addEventListener('click', toggleGhost);

          function cycleVsyncMode() {
              vsyncModeIndex = (vsyncModeIndex + 1) % vsyncModes.length;
              const mode = getVsyncMode();
              if (mode !== 'OFF') {
                  const s = vsyncScripts[mode];
                  /* v11: re-engaging a mode restores the held level immediately */
                  s.level = Math.max(0.35, s.level, vsyncLastActiveLevel * 0.75);
                  s.target = Math.max(s.target, 0.35);
                  s.nextAt = performance.now() + 1400 + Math.random() * 1600;
                  vsyncManualUntil = 0;
              }
              updateVsyncUi();
          }
          if (vsyncScanSlider) {
              vsyncScanSlider.addEventListener('input', (e) => {
                  let mode = getVsyncMode();
                  /* v11: dragging the V-Sync level while OFF re-engages the engine at
                     that level — no parked/dead slider states anywhere. */
                  if (mode === 'OFF') {
                      vsyncModeIndex = 1; // ON
                      mode = 'ON';
                  }
                  if (!vsyncScripts[mode]) return;
                  const v = parseFloat(e.target.value);
                  vsyncScripts[mode].level = v;
                  vsyncScripts[mode].target = v;
                  vsyncScripts[mode].shown = v;
                  vsyncLastActiveLevel = Math.max(vsyncLastActiveLevel, v);
                  vsyncManualUntil = performance.now() + 4500;
                  updateVsyncUi();
              });
          }
          if (vsyncLockBtn) {
              vsyncLockBtn.addEventListener('click', () => {
                  toggleUserLock('vsync');
                  vsyncLockBtn.classList.toggle('locked', sliderLocks.vsync);
                  vsyncLockBtn.textContent = sliderLocks.vsync ? '[LOCKED!]' : '<LOCK!>';
                  const mode = getVsyncMode();
                  if (mode !== 'OFF' && vsyncScripts[mode]) {
                      vsyncScripts[mode].target = vsyncScripts[mode].level;
                      if (sliderLocks.vsync) vsyncManualUntil = performance.now() + 1e12;
                      else vsyncManualUntil = performance.now() + 500;
                  }
              });
          }
          if (vsyncScanBtn) vsyncScanBtn.addEventListener('click', cycleVsyncMode);
          updateGhostUi();

          /* ------------------------------------------------------------------ *
           *  12. AI Warp                                                        *
           * ------------------------------------------------------------------ */
          const feTurb = $('ai-turbulence');
          const feDisp = $('ai-displacement');
          const feHue = $('ai-color-matrix');
          const aiWarpCached = { hue: -999, freq: -999, disp: -999, lastUpdate: 0 };
          let aiWarpHue = 0;

          function retargetMasters(now) {
              MASTER_KEYS.forEach((k) => {
                  if (sliderLocks['master:' + k]) return;
                  const ranges = {
                      effectIntensity: [0.45, 1.0],
                      motionScale: [0.30, 0.98],
                      blendSoftness: [0.20, 0.85],
                      continualSpeed: [0.30, 0.95],
                      autoGlitchPower: [0.30, 0.95],
                      boardEnergy: [0.25, 0.90]
                  };
                  const r = ranges[k] || [0.2, 0.9];
                  let t = r[0] + Math.random() * (r[1] - r[0]);
                  if (Math.random() < 0.08) t = Math.random() < 0.5 ? r[0] : r[1];
                  /* R1.5: the source steers the automated masters — energy
                     feeds the motion/energy/speed controls, appetite feeds
                     the intensity, and calm dark sources soften the blend */
                  if (k === 'boardEnergy' || k === 'motionScale' || k === 'continualSpeed') {
                      t = t * (0.82 + 0.30 * srcEnergyK());
                  } else if (k === 'effectIntensity') {
                      t = t * (0.84 + 0.28 * srcAppetite());
                  } else if (k === 'blendSoftness') {
                      t = t * (0.85 + 0.25 * clamp01(videoPalette.darkness || 0.4));
                  }
                  masterTargets[k] = clamp01(t);
              });
              const spd = 0.55 + clamp01(masterControls.continualSpeed) * 1.2;
              nextMasterRetargetAt = now + (2800 + Math.random() * 4200) / spd;
          }

          function stepAutomatedMasters(now, dt) {
              if (!isAutomatedMasters) return;
              if (now >= nextMasterRetargetAt) retargetMasters(now);
              const rate = (0.35 + clamp01(masterControls.continualSpeed) * 1.1);
              MASTER_KEYS.forEach((k) => {
                  if (sliderLocks['master:' + k]) return;
                  const cur = masterControls[k];
                  const tgt = masterTargets[k];
                  const next = easeExp(cur, tgt, dt, rate);
                  if (Math.abs(next - cur) > 0.0005) {
                      masterControls[k] = next;
                      if (window.__masterSliderEls && window.__masterSliderEls[k]) {
                          const el = window.__masterSliderEls[k];
                          el.slider.value = next.toFixed(3);
                          el.read.textContent = Math.round(next * 100) + '%';
                      }
                  }
              });
          }

          const AI_WARP_MODES = ['liquid', 'prism', 'breathe', 'fold', 'aurora'];
          let aiWarpMode = 'liquid';
          let aiWarpModeUntil = 0;
          let aiWarpSeed = Math.random() * 1000;
          const aiWarpState = {
              hue: 0,
              sat: 1,
              glow: 1,
              disp: 2,
              freq: 0.001,
              driftX: 0,
              driftY: 0,
              skewX: 0,
              skewY: 0,
              scale: 1,
              pulse: 0,
              fold: 0,
              aurora: 0
          };

          function pickAiWarpMode(now) {
              const roll = Math.random();
              if (roll < 0.28) return 'liquid';
              if (roll < 0.48) return 'prism';
              if (roll < 0.68) return 'breathe';
              if (roll < 0.84) return 'fold';
              return 'aurora';
          }

          function updateAiWarp(now) {
              if (!isAiWarpActive) {
                  if (feDisp && aiWarpCached.disp !== 0) {
                      try { feDisp.setAttribute('scale', '0'); } catch (e) {}
                      aiWarpCached.disp = 0;
                  }
                  return;
              }

              const dt = Math.min(0.05, 0.016);
              const t = now * 0.001;
              const motion = clamp01(masterControls.motionScale);
              const harm = boardHarmony();
              const hueStrength = hueMasterLevel() * masterOpacity;
              const rainbowStrength = (effectAlphas['HSL Rainbow'] || 0) * masterOpacity;
              const energy = beat * (0.4 + 0.6 * clamp01(masterControls.boardEnergy));

              if (now >= aiWarpModeUntil) {
                  aiWarpMode = pickAiWarpMode(now);
                  aiWarpModeUntil = now + 6000 + Math.random() * 9000;
                  aiWarpSeed = Math.random() * 1000;
              }

              const mode = aiWarpMode;
              let tDisp = 2,
                  tFreq = 0.001,
                  tPulse = 0.3,
                  tFold = 0,
                  tAurora = 0;
              let tSkew = 0.2,
                  tDrift = 1.0,
                  tScale = 1.006;

              if (mode === 'liquid') {
                  tDisp = 3.5 + energy * 3.0 + motion * 2.5;
                  tFreq = 0.0008 + Math.sin(t * 0.07 + aiWarpSeed) * 0.00025;
                  tPulse = 0.3 + Math.sin(t * 0.11) * 0.2;
                  tDrift = 1.2;
                  tSkew = 0.35;
                  tScale = 1.012;
              } else if (mode === 'prism') {
                  tDisp = 2.8 + hueStrength * 4 + rainbowStrength * 3;
                  tFreq = 0.0012 + Math.sin(t * 0.09) * 0.0003;
                  tPulse = 0.5 + Math.sin(t * 0.19 + 1.2) * 0.25;
                  tDrift = 0.8;
                  tSkew = 0.55;
                  tScale = 1.015;
                  tAurora = 0.45;
              } else if (mode === 'breathe') {
                  tDisp = 2.0 + Math.sin(t * 0.05) * 1.8;
                  tFreq = 0.0006 + Math.sin(t * 0.04) * 0.0002;
                  tPulse = 0.6 + Math.sin(t * 0.06) * 0.4;
                  tDrift = 0.6;
                  tSkew = 0.15;
                  tScale = 1.008 + Math.sin(t * 0.05) * 0.008;
              } else if (mode === 'fold') {
                  tDisp = 4.5 + motion * 3.0;
                  tFreq = 0.0015 + Math.sin(t * 0.08 + aiWarpSeed) * 0.0004;
                  tPulse = 0.25;
                  tFold = 0.65 + Math.sin(t * 0.1) * 0.3;
                  tDrift = 1.0;
                  tSkew = 0.65;
                  tScale = 1.018;
              } else { // aurora
                  tDisp = 3.0 + rainbowStrength * 4 + energy * 2.0;
                  tFreq = 0.0009 + Math.sin(t * 0.06) * 0.00035;
                  tPulse = 0.4 + Math.sin(t * 0.13) * 0.25;
                  tAurora = 0.8 + Math.sin(t * 0.08) * 0.3;
                  tDrift = 1.1;
                  tSkew = 0.35;
                  tScale = 1.012;
              }

              const ease = (cur, tgt, r) => cur + (tgt - cur) * (1 - Math.exp(-r * dt));
              aiWarpState.disp = ease(aiWarpState.disp, tDisp * motion * harm, 0.7);
              aiWarpState.freq = ease(aiWarpState.freq, tFreq, 0.5);
              aiWarpState.pulse = ease(aiWarpState.pulse, tPulse, 0.8);
              aiWarpState.fold = ease(aiWarpState.fold, tFold, 0.6);
              aiWarpState.aurora = ease(aiWarpState.aurora, tAurora, 0.55);

              const hueSpin = (mode === 'prism' || mode === 'aurora') ? 0.08 : 0.028;
              /* R1.3 PRISM MATRIX (006-final retouch, mashup): the 006
                 time-driven base (20°/s read at 0.62 gain) and its big
                 strength swings (hue ×340 → 238, rainbow ×96 → 82,
                 retouched to the toned ensemble) now ride the
                 video-palette anchor — the warp sweeps a true prism whose
                 root still tracks the picture. */
              aiWarpHue = (videoPalette.hue * 0.45 +
                  ((now * 0.02) % 360) * 0.62 +
                  (now * hueSpin) % 360 * 0.15 +
                  hueStrength * 238 +
                  rainbowStrength * 82 +
                  aiWarpState.aurora * 40 +
                  Math.sin(t * 0.04 + aiWarpSeed) * 18) % 360;
              aiWarpState.hue = aiWarpHue;

              if (feTurb && feDisp && now - aiWarpCached.lastUpdate > 160) {
                  aiWarpCached.lastUpdate = now;
                  const freq = Math.max(0.00035, aiWarpState.freq);
                  if (Math.abs(freq - aiWarpCached.freq) > 0.00003 && feTurb.setAttribute) {
                      feTurb.setAttribute('baseFrequency', freq.toFixed(5));
                      aiWarpCached.freq = freq;
                  }
                  const dist = Math.round(Math.max(0, Math.min(25, aiWarpState.disp * (0.85 + aiWarpState
                      .pulse * 0.3))));
                  if (dist !== aiWarpCached.disp) {
                      feDisp.setAttribute('scale', String(dist));
                      aiWarpCached.disp = dist;
                  }
                  if (feHue && Math.abs(aiWarpHue - aiWarpCached.hue) > 0.2) {
                      feHue.setAttribute('values', aiWarpHue.toFixed(1));
                      aiWarpCached.hue = aiWarpHue;
                  }
              }

              aiWarpState.driftX = Math.sin(t * 0.04 + aiWarpSeed) * 1.2 * tDrift * motion +
                  Math.sin(t * 0.017) * 0.6 * motion +
                  aiWarpState.fold * Math.sin(t * 0.09) * 1.8;
              aiWarpState.driftY = Math.cos(t * 0.033 + 1.1) * 0.9 * tDrift * motion +
                  aiWarpState.fold * Math.cos(t * 0.07) * 1.0;
              aiWarpState.skewX = Math.sin(t * 0.05 + Math.cos(t * 0.02)) * tSkew * motion +
                  aiWarpState.fold * 0.45;
              aiWarpState.skewY = Math.cos(t * 0.04 + 0.6) * tSkew * 0.55 * motion;
              aiWarpState.scale = tScale + aiWarpState.pulse * 0.006 * motion;

              if (!isContinuallyRandomizing && Math.random() < 0.018 * harm) {
                  const moodPool = mode === 'prism' || mode === 'aurora' ?
                      ['Hue/Color Cycle', 'HSL Rainbow', 'Neon Grad', 'Scanlines', 'Matrix Chord'] :
                      mode === 'fold' ?
                      ['Data Bands', 'VHS Glitch', 'Scanlines', 'ASCII', 'Matrix ASCII'] :
                      ['Neon Grad', 'Scanlines', 'Font Burn', 'HSL Rainbow', 'Matrix Chord'];
                  const name = moodPool[(Math.random() * moodPool.length) | 0];
                  if (name && !automationHeld(name) && blendProfiles[name]) {
                      const p = blendProfiles[name];
                      const tgt = p.ambient[0] + Math.random() * (p.ambient[1] - p.ambient[0] + 0.02);
                      effectAlphas[name] = (effectAlphas[name] || 0) * 0.70 + tgt * 0.30;
                      randomTargets[name] = effectAlphas[name];
                      if (sliderElements[name]) sliderElements[name].value = effectAlphas[name].toFixed(
                      3);
                  }
              }

              applyYouTubeWarpMotion(now, hueStrength);
          }

          const ytMotion = { x: 0, y: 0, sx: 1, sy: 1, kx: 0, ky: 0 };

          function applyYouTubeWarpMotion(currentTime, hueStrength) {
              const iframe = getYouTubeIframeElement();
              const surfaces = [ytWarpShell, ytFrame, iframe].filter(Boolean);
              const t = currentTime * 0.001;
              const harm = boardHarmony();
              const motion = clamp01(masterControls.motionScale);
              const bands = clamp01((effectAlphas['Data Bands'] || 0) * masterOpacity) * harm * motion;
              const vhs = clamp01((effectAlphas['VHS Glitch'] || 0) * masterOpacity) * harm * motion;
              const glow = motionGlow();
              const warpOn = !!isAiWarpActive;

              if (!warpOn && bands < 0.01 && vhs < 0.01) {
                  const reset = 'translate3d(0,0,0) scale(1) skew(0deg,0deg)';
                  if (domCache.surfacesReset !== reset) {
                      surfaces.forEach((el) => {
                          el.style.transform = reset;
                          el.style.transformOrigin = '50% 50%';
                          el.style.willChange = 'auto';
                      });
                      if (mainCanvas) {
                          mainCanvas.style.transform = 'none';
                          mainCanvas.style.transformOrigin = '50% 50%';
                          domCache.canvasTransform = 'none';
                      }
                      if (ytWarpShell) ytWarpShell.style.willChange = 'auto';
                      domCache.surfacesReset = reset;
                      domCache.shellTransform = reset;
                      domCache.iframeTransform = reset;
                      domCache.canvasTransform = reset;
                      domCache.frameTransform = reset;
                      ytMotion.x = ytMotion.y = ytMotion.kx = ytMotion.ky = 0;
                      ytMotion.sx = ytMotion.sy = 1;
                  }
                  return;
              }
              domCache.surfacesReset = null;

              let driftX = 0,
                  driftY = 0,
                  scaleX = 1,
                  scaleY = 1,
                  skewX = 0,
                  skewY = 0;

              if (warpOn) {
                  driftX += aiWarpState.driftX || 0;
                  driftY += aiWarpState.driftY || 0;
                  skewX += aiWarpState.skewX || 0;
                  skewY += aiWarpState.skewY || 0;
                  const sc = aiWarpState.scale || 1.006;
                  scaleX *= sc;
                  // Anisotropic "breathe": Y counter-scales against X so the
                  // frame squashes rather than uniformly zooming.
                  // (Was `(2-sc)*0.5 + sc*0.5`, which is algebraically 1.0 for
                  // every sc -- so Y never moved at all.)
                  // Clamped positive: a negative scaleY would MIRROR the video,
                  // which is the very class of bug this pass exists to remove.
                  scaleY *= Math.max(0.5, 2 - sc);
                  if (ytWarpShell) {
                      const f = 'url(#ai-warp-filter)';
                      if (domCache.aiFilter !== f) {
                          domCache.aiFilter = f;
                      }
                  }
              }

              if (bands > 0.01) {
                  const roll = t * (0.35 + bands * 0.55);
                  const wobble = bands * 7 * glow;
                  driftX += Math.sin(roll) * wobble * 0.45 + Math.sin(roll * 0.3 + 1.1) * wobble * 0.25;
                  driftY += Math.cos(roll * 0.45) * bands * 1.6 * glow;
                  skewX += Math.sin(roll * 0.55) * bands * 1.4 * glow;
                  skewY += Math.cos(roll * 0.35 + 0.4) * bands * 0.55;
                  scaleX *= 1 + bands * 0.005;
                  scaleY *= 1 - bands * 0.003;
              }

              if (vhs > 0.01) {
                  const phase = (t * (0.18 + vhs * 0.25)) % 1;
                  const jam = vhs * 6 * glow;
                  driftX += Math.sin(t * 1.1 + phase * Math.PI * 2) * jam * 0.4;
                  driftY += (phase - 0.5) * vhs * 3.5;
                  skewX += Math.sin(t * 0.9 + phase) * vhs * 1.2 * glow;
                  skewY += Math.cos(t * 0.7) * vhs * 0.5;
                  scaleX *= 1 + vhs * 0.005;
                  scaleY *= 1 - vhs * 0.004;
              }

              const easeK = 0.08;
              const mScale = motion;
              driftX *= mScale;
              driftY *= mScale;
              skewX *= mScale;
              skewY *= mScale;
              scaleX = 1 + (scaleX - 1) * mScale;
              scaleY = 1 + (scaleY - 1) * mScale;
              ytMotion.x += (driftX - ytMotion.x) * easeK;
              ytMotion.y += (driftY - ytMotion.y) * easeK;
              ytMotion.sx += (scaleX - ytMotion.sx) * easeK;
              ytMotion.sy += (scaleY - ytMotion.sy) * easeK;
              ytMotion.kx += (skewX - ytMotion.kx) * easeK;
              ytMotion.ky += (skewY - ytMotion.ky) * easeK;
              driftX = ytMotion.x;
              driftY = ytMotion.y;
              scaleX = ytMotion.sx;
              scaleY = ytMotion.sy;
              skewX = ytMotion.kx;
              skewY = ytMotion.ky;

              if (ytWarpShell) {
                  const tf = 'translate3d(' + driftX.toFixed(2) + 'px,' + driftY.toFixed(2) + 'px,0) scale(' +
                      scaleX.toFixed(4) + ',' + scaleY.toFixed(4) + ') skew(' + skewX.toFixed(2) +
                      'deg,' + skewY.toFixed(2) + 'deg)';
                  if (domCache.shellTransform !== tf) {
                      domCache.shellTransform = tf;
                      ytWarpShell.style.transform = tf;
                      ytWarpShell.style.transformOrigin = '50% 50%';
                      if (domCache.shellWillChange !== 'transform') {
                          ytWarpShell.style.willChange = 'transform, filter';
                          domCache.shellWillChange = 'transform';
                      }
                  }
                  /* R1 OLD-SOUL (006 final): the canvas shares the shell's exact
                     box (both absolute 0,0 in effects-wrapper), so mirroring the
                     shell transform onto it keeps the canvas effects (ASCII
                     rain, scanlines, VHS…) tracking the warped surface. Local
                     surfaces aren't warped — the canvas stays neutral then. */
                  if (mainCanvas) {
                      const canvasTf = (ytWarpShell.style.display === 'none') ? 'none' : tf;
                      if (domCache.canvasTransform !== canvasTf) {
                          domCache.canvasTransform = canvasTf;
                          mainCanvas.style.transform = canvasTf;
                          mainCanvas.style.transformOrigin = '50% 50%';
                      }
                  }
              }

              if (ytFrame) {
                  const fx = driftX * 0.55 + (vhs > 0.01 ? Math.sin(t * 0.9) * vhs * 3 : 0);
                  const fy = driftY * 0.45;
                  const tf = 'translate3d(' + fx.toFixed(2) + 'px,' + fy.toFixed(2) + 'px,0) scale(' +
                      (1 + bands * 0.004 + vhs * 0.005).toFixed(4) + ',' + (1 - bands * 0.003 - vhs *
                          0.004).toFixed(4) +
                      ') skew(' + (skewX * 0.6).toFixed(2) + 'deg,' + (skewY * 0.6).toFixed(2) + 'deg)';
                  if (domCache.frameTransform !== tf) {
                      domCache.frameTransform = tf;
                      ytFrame.style.transform = tf;
                      ytFrame.style.transformOrigin = '50% 50%';
                  }
              }

              if (iframe) {
                  const ix = driftX * 0.85 +
                      (bands > 0.01 ? Math.sin(t * 0.4 + 0.3) * bands * 5 * glow : 0) +
                      (vhs > 0.01 ? Math.sin(t * 1.2) * vhs * 4 * glow : 0);
                  const iy = driftY * 0.7 + (vhs > 0.01 ? Math.sin(t * 0.35) * vhs * 2 : 0);
                  const iskx = skewX * 0.9 + (vhs > 0.01 ? Math.sin(t * 1.0) * vhs * 1.2 * glow : 0);
                  const isky = skewY * 0.85;
                  const isx = 1.008 + (hueStrength || 0) * 0.008 + bands * 0.006 + vhs * 0.006 + (warpOn ? (
                      aiWarpState.scale - 1) * 0.5 : 0);
                  const isy = 1.008 - (hueStrength || 0) * 0.004 - bands * 0.004 - vhs * 0.004;
                  const tf = 'translate3d(' + ix.toFixed(2) + 'px,' + iy.toFixed(2) + 'px,0) scale(' +
                      isx.toFixed(4) + ',' + isy.toFixed(4) + ') skew(' + iskx.toFixed(2) + 'deg,' +
                      isky.toFixed(2) + 'deg)';
                  if (domCache.iframeTransform !== tf) {
                      domCache.iframeTransform = tf;
                      iframe.style.transform = tf;
                      iframe.style.transformOrigin = '50% 50%';
                  }
              }
          }

          /* Colour-shift overlay — eased prism, confluence-rooted */
          const shiftOverlay = document.createElement('div');
          shiftOverlay.id = 'color-shift-overlay';
          Object.assign(shiftOverlay.style, {
              position: 'fixed',
              inset: '0',
              pointerEvents: 'none',
              mixBlendMode: 'color-dodge',
              zIndex: '10000',
              opacity: '0',
              transition: 'opacity 0.28s linear, mix-blend-mode 0.6s ease'
          });
          let shiftOverlayMounted = false;
          let lastShiftOpacity = '';
          let lastShiftBlend = '';
          const shiftState = {
              angle: 120, sat: 74, light: 58,
              stops: [0, 60, 120, 180, 240, 300]
          };
          const shiftTarget = {
              angle: 120, sat: 74,
              stops: [0, 60, 120, 180, 240, 300],
              nextAt: 0
          };

          function updateShiftOverlay(now, dt) {
              dt = (dt == null) ? 0.016 : dt;
              const hueA = clamp01(hueMasterLevel() * masterOpacity);
              const neonA = clamp01((effectAlphas['Neon Grad'] || 0) * masterOpacity);
              const rainA = clamp01((effectAlphas['HSL Rainbow'] || 0) * masterOpacity);
              const chroma = Math.max(hueA, neonA * 0.72, rainA);
              const ctx = boardFilterCtx();
              const map = (window.GlitchEngine && GlitchEngine.colorShiftMap)
                  ? GlitchEngine.colorShiftMap(chroma, ctx)
                  : { opacity: 0.12 + chroma * 0.2, sat: 80, blend: 'color-dodge', travel: 2.8, live: chroma > 0.02, realm: 'mix' };
              const active = isAiWarpActive || map.live || (comboProfile.hueOffset > 4 && comboProfile.satMult > 1.02);
              if (!active) {
                  if (shiftOverlayMounted) {
                      shiftOverlay.style.opacity = '0';
                      lastShiftOpacity = '0';
                  }
                  return;
              }
              if (!shiftOverlayMounted) {
                  document.body.appendChild(shiftOverlay);
                  shiftOverlayMounted = true;
              }
              if (now >= shiftTarget.nextAt) {
                  let conf = 200;
                  try { conf = fxConfluenceHue(0); } catch (e) { conf = (aiWarpHue || 200) % 360; }
                  const gk = (typeof GHOST_KEY_HUES !== 'undefined' && GHOST_KEY_HUES) ? GHOST_KEY_HUES : [conf, conf + 120, conf + 240];
                  const realm = map.realm || 'mix';
                  if (realm === 'reality') {
                      shiftTarget.stops = [
                          gk[0], fxLerpHue(gk[0], gk[1], 0.5), gk[1],
                          fxLerpHue(gk[1], gk[2], 0.5), gk[2], fxLerpHue(gk[2], gk[0], 0.5)
                      ];
                      shiftTarget.angle = 88 + (conf % 36);
                  } else {
                      shiftTarget.stops = [0, 60, 120, 180, 240, 300].map((off) => (conf + off) % 360);
                      shiftTarget.angle = 72 + (conf % 150);
                  }
                  shiftTarget.sat = map.sat;
                  shiftTarget.nextAt = now + 5500 + Math.random() * 4500;
              }
              const travel = Math.max(1.2, map.travel || 2.8);
              const k = 1 - Math.exp(-(Math.max(0, dt)) / (travel / 3));
              shiftState.angle += (shiftTarget.angle - shiftState.angle) * k;
              shiftState.sat = easeExp(shiftState.sat, shiftTarget.sat, dt, 1.6);
              const easeH = (window.GlitchEngine && GlitchEngine.easeHueDeg) ? GlitchEngine.easeHueDeg : fxLerpHue;
              for (let i = 0; i < 6; i++) {
                  shiftState.stops[i] = easeH(shiftState.stops[i], shiftTarget.stops[i], k);
              }
              const paper = Math.round(56 + 10 * clamp01(videoPalette.light / 100));
              const specSat = Math.round(shiftState.sat + 18 * srcAppetite() +
                  ((typeof fxConfluenceSat === 'function') ? (fxConfluenceSat() - 60) * 0.22 : 0));
              const grad = 'linear-gradient(' + shiftState.angle.toFixed(1) + 'deg,' +
                  shiftState.stops.map((h, i) =>
                      'hsl(' + (((h % 360) + 360) % 360).toFixed(1) + ',' + specSat + '%,' +
                      (paper - (i % 2) * 3) + '%)'
                  ).join(',') + ')';
              if (shiftOverlay.style.background !== grad) shiftOverlay.style.background = grad;
              const blend = map.blend || 'color-dodge';
              if (lastShiftBlend !== blend) {
                  lastShiftBlend = blend;
                  shiftOverlay.style.mixBlendMode = blend;
              }
              const pulse = (Math.sin(now / 14000 * Math.PI * 2) + 1) / 2;
              const intensity = (
                  (map.opacity + pulse * 0.10 + hueA * 0.10 + rainA * 0.08 + neonA * 0.06) *
                  (0.88 + 0.24 * srcAppetite())
              ).toFixed(3);
              if (lastShiftOpacity !== intensity) {
                  lastShiftOpacity = intensity;
                  shiftOverlay.style.opacity = intensity;
              }
          }

          /* ------------------------------------------------------------------ *
           *  13. Canvas sizing                                                  *
           * ------------------------------------------------------------------ */
          let lastCssW = 0,
              lastCssH = 0,
              lastDpr = 0;

          function resizeGlitchCanvas(force) {
              const cssW = window.innerWidth,
                  cssH = window.innerHeight;
              const dpr = Math.min(window.devicePixelRatio || 1, renderBudget.pixelCap);
              if (!force && cssW === lastCssW && cssH === lastCssH && dpr === lastDpr) return;
              lastCssW = cssW;
              lastCssH = cssH;
              lastDpr = dpr;
              const w = Math.max(1, Math.floor(cssW * renderBudget.scale * dpr));
              const h = Math.max(1, Math.floor(cssH * renderBudget.scale * dpr));
              if (mainCanvas.width !== w) mainCanvas.width = w;
              if (mainCanvas.height !== h) mainCanvas.height = h;
              mainCanvas.style.width = cssW + 'px';
              mainCanvas.style.height = cssH + 'px';
              gctx.setTransform(1, 0, 0, 1, 0, 0);
          }
          window.addEventListener('resize', () => resizeGlitchCanvas(false));

          /* ------------------------------------------------------------------ *
           *  14. Continual randomization — FASTER, more dynamic                  *
           * ------------------------------------------------------------------ */
          let activePeakEffects = new Set();
          const TIMING_MODES = ['smooth', 'snap', 'flipflop', 'burst', 'linger', 'flipBurst', 'zoomBurst'];
          let randBehavior = 'smooth';
          let nextBehaviorChange = performance.now() + 1800 + Math.random() * 1800;
          let nextRetargetAt = performance.now() + 1600;
          let burstUntil = 0;
          let lingerUntil = 0;
          let burstDir = {};
          let flipFlopPhase = 0;
          let ghostRandomTarget = ghostLevel;
          // flipBurst/zoomBurst state
          let flipBurstPhase = 0;          // 0=low, 1=high, toggles rapidly
          let flipBurstToggleAt = 0;        // next toggle time
          let zoomBurstTarget = 0;          // 0→1→0 zoom target
          let zoomBurstDir = 1;             // +1 rising, -1 falling
          let zoomBurstPeak = false;
          const timingRateScale = {
              smooth: 1.2,
              snap: 5.0,
              flipflop: 2.8,
              burst: 7.0,
              linger: 0.35,
              flipBurst: 12.0,  // very fast snaps 0↔100
              zoomBurst: 9.0    // fast ramp up then back down
          };
          /* R4.1 per-voice transition character. 'glide' voices always travel softly;
             'cut' voices run faster and, in the hard-cut modes, occasionally jump most of
             the way to their target (at most about once a second per voice).
             Flash and Strobe are never listed: their automation stays on the eased path. */
          const VOICE_TRANSITION = Object.freeze({
              'Hue/Color Cycle': 'glide', 'HSL Rainbow': 'glide', 'Neon Grad': 'glide', 'B&W Invert': 'glide',
              'Prism Rift': 'glide', 'Chromatic Echo': 'glide', 'Orbit HUD': 'glide', 'Cyber Rain': 'glide',
              'Ink Glyphs': 'glide', 'Tech Artist': 'glide', 'Matrix Chord': 'glide', 'Scanlines': 'glide',
              'R3 Ghost Spectrum': 'glide', 'R3 V-Sync': 'glide', 'Tape Grain': 'glide', 'Rolling Scan': 'glide',
              'Data Bands': 'cut', 'VHS Glitch': 'cut', 'Signal Tear': 'cut', 'Data Bomb': 'cut',
              'Gemini Bomb': 'cut', 'ASCII': 'cut', 'Matrix ASCII': 'cut', 'Font Burn': 'cut',
              'Temporal Slices': 'cut', 'Tracking Tear': 'cut'
          });
          const HARD_CUT_MODES = new Set(['snap', 'burst', 'flipflop']);
          const HARD_CUT_MIN_GAP_MS = 900;
          const hardCutAt = {};
          const recentHardCuts = [];   /* R4.1.3: board-wide cut confluence guard */
          /* Per-session variation: each voice may swap character and gets its own
             rate jitter and cut odds; a few voices re-roll at every behaviour change. */
          const voiceTraits = {};
          function rollVoiceTrait(name) {
              const base = VOICE_TRANSITION[String(name).replace(/^R3 /, '')] || VOICE_TRANSITION[name];
              if (!base || isManualLight(name)) return;
              const kind = Math.random() < 0.15 ? (base === 'glide' ? 'cut' : 'glide') : base;
              voiceTraits[name] = {
                  kind,
                  rate: 0.85 + Math.random() * 0.3,
                  cutOdds: 0.012 + Math.random() * 0.02,
                  join: 0.6 + Math.random() * 0.3   /* R4.1.3: per-voice retarget separation */
              };
          }
          function rerollSomeVoiceTraits() {
              const names = Object.keys(VOICE_TRANSITION);
              for (let i = 0; i < 3; i++) rollVoiceTrait(names[(Math.random() * names.length) | 0]);
          }
          function voiceTransition(name) {
              if (!voiceTraits[name]) rollVoiceTrait(name);
              return voiceTraits[name] ? voiceTraits[name].kind : 'neutral';
          }
          function voiceRateScale(name) {
              const kind = voiceTransition(name);
              const t = voiceTraits[name];
              /* R4.1.3: glides travel slower than before (0.78 -> 0.62) so soft
                 transitions last visibly longer against the hard cuts. */
              return (kind === 'glide' ? 0.62 : kind === 'cut' ? 1.35 : 1) * (t ? t.rate : 1);
          }
          /* Returns the value to jump to for a hard cut, or null to keep easing. */
          function hardCutValue(name, cur, target, now) {
              if (isManualLight(name) || voiceTransition(name) !== 'cut' || !HARD_CUT_MODES.has(randBehavior)) return null;
              if (Math.abs(target - cur) < 0.2 || now - (hardCutAt[name] || 0) < HARD_CUT_MIN_GAP_MS) return null;
              /* R4.1.2: a hard-cutting track cuts more often, a soft one rarely */
              const cutFreqK = 0.6 + 0.8 * activeTrackTiming().cut;
              if (Math.random() > voiceTraits[name].cutOdds * cutFreqK * (softWild() ? 2 : 1)) return null;
              /* R4.1.3 CONFLUENCE GUARD: at most two hard cuts may land close
                 together — the rest of the board keeps gliding around them. */
              while (recentHardCuts.length && now - recentHardCuts[0] > 600) recentHardCuts.shift();
              if (recentHardCuts.length >= 2) return null;
              recentHardCuts.push(now);
              hardCutAt[name] = now;
              /* R4.1.2 SOFT-TO-HARD CUTS: each cut lands on a spectrum — a soft
                 cut travels about half way, a hard cut nearly all the way —
                 biased by the playing track's cut character. */
              const depth = 0.5 + 0.45 * clamp01(activeTrackTiming().cut + (Math.random() - 0.5) * 0.3);
              return cur + (target - cur) * depth;
          }
          /* R4.1.2 PER-TRACK TIMING — each named link-tree video carries its own
             transition timing, built from what YouTube already tells the player
             (the embed's video id and reported duration; no new network surface).
             pace scales the retarget cadence (>1 = roomier), breath scales the
             breathing-room odds, and cut (0..1) biases the cut spectrum from
             soft toward hard. Unknown videos class themselves by duration;
             local media keeps the defaults. The lights are untouched by all
             of this: their calmer bounded automation never reads these. */
          const TRACK_TIMINGS = Object.freeze({
              'gopYmb38DgM': Object.freeze({ pace: 1.25, breath: 1.25, cut: 0.25 }), // TERMINAL 1987 — calm dev stream
              'uvSXL6ypLlw': Object.freeze({ pace: 0.95, breath: 0.90, cut: 0.60 }), // REVISIONS — album drive
              '8o6bdTOhIyE': Object.freeze({ pace: 1.10, breath: 1.10, cut: 0.40 }), // GHOSTNET.EXE — coding mix
              'QsUmvGkXhnk': Object.freeze({ pace: 0.80, breath: 0.70, cut: 0.80 }), // GLITCH SET — live set, hard
              'RgFaK6ZQifE': Object.freeze({ pace: 0.85, breath: 0.80, cut: 0.70 }), // SEWERSLVT RADIO — lively
              'u4TPBkN0vIc': Object.freeze({ pace: 1.30, breath: 1.35, cut: 0.20 }), // TRIPPY FRACTALS — drifting VJ loop
              'KlcsGjI6Jms': Object.freeze({ pace: 1.40, breath: 1.40, cut: 0.15 }), // NIGHT CITY WALK — ambience, softest
              'NpSTV8WJATc': Object.freeze({ pace: 1.20, breath: 1.15, cut: 0.45 }), // DARKSYNTH RADIO — slowed, heavy
              'jmEAP7aGo0o': Object.freeze({ pace: 0.75, breath: 0.65, cut: 0.85 }), // DEFCON 1 — hardest cuts
              'B1CL4PqHh9k': Object.freeze({ pace: 1.30, breath: 1.30, cut: 0.20 }), // MOONLIGHT — glassy calm
              'kCP2xZvhJk0': Object.freeze({ pace: 1.15, breath: 1.20, cut: 0.10 }), // WHITE 2 BLACK 2 WHITE — pure glide
              'DmStNF35o1w': Object.freeze({ pace: 1.00, breath: 1.10, cut: 0.35 }), // GHOST // OF ME — spectral mid
              'PD3RCwNseqQ': Object.freeze({ pace: 1.05, breath: 1.10, cut: 0.55 })  // BIRDCAGE — YOU MAN, 338 s measured (5:38), brooding mid-tempo
          });
          const TRACK_TIMING_DEFAULT = Object.freeze({ pace: 1, breath: 1, cut: 0.5 });
          const TRACK_TIMING_LONG = Object.freeze({ pace: 1.2, breath: 1.25, cut: 0.35 });
          const TRACK_TIMING_SHORT = Object.freeze({ pace: 0.85, breath: 0.8, cut: 0.7 });
          function trackTimingForVideo(id, durationSec) {
              if (id && TRACK_TIMINGS[id]) return TRACK_TIMINGS[id];
              /* YouTube's reported duration classes unknown videos: long-form
                 sits calm, short tracks run livelier. */
              if (durationSec >= 480) return TRACK_TIMING_LONG;
              if (durationSec > 0 && durationSec <= 150) return TRACK_TIMING_SHORT;
              return TRACK_TIMING_DEFAULT;
          }
          function activeTrackTiming() {
              if (!nowPlaying || nowPlaying.kind !== 'youtube') return TRACK_TIMING_DEFAULT;
              return trackTimingForVideo(nowPlaying.videoId, nowPlaying.duration || 0);
          }
          /* R4.1.1 BREATHING ROOM — silence between transitions. At a retarget a
             voice may begin a rest: it keeps its current level and target and is
             skipped by retargets until its breath ends, so each effect's travel
             gets quiet space around it. Glide voices breathe slightly more often;
             the wild crescendo modes breathe half as often so showpieces stay
             lively. Lights (Flash/Strobe) are excluded — their calmer bounded
             automation is untouched. */
          const BREATH_ODDS = 0.28;
          const BREATH_MS = Object.freeze([1100, 3400]);
          const voiceBreathUntil = {};
          function voiceBreathing(name, now, mode) {
              if (isManualLight(name)) return false;
              if (now < (voiceBreathUntil[name] || 0)) return true;
              const t = voiceTraits[name];
              let odds = BREATH_ODDS * (t && t.kind === 'glide' ? 1.15 : 1);
              if (HARD_CUT_MODES.has(mode) || mode === 'flipBurst' || mode === 'zoomBurst') odds *= 0.5;
              odds *= activeTrackTiming().breath;   /* R4.1.2: calm tracks breathe more */
              if (Math.random() >= odds) return false;
              voiceBreathUntil[name] = now + BREATH_MS[0] + Math.random() * (BREATH_MS[1] - BREATH_MS[0]);
              return true;
          }
          const PARKED_EPSILON = 0.02;
          /* R1 OLD-SOUL (006 final) — Continual Randomization is a background
             presence, never a takeover:
             • CONTINUAL_RANDOMIZATION_EFFECT_CAP: every randomized per-effect
               target is capped below 1.0 so the board can get lively without
               ever washing out. Manual sliders are exempt — what the user
               sets by hand is never capped.
             • MIRROR_FLIP_FACTOR: mirror inversions flip 75% of the way
               (25% -> ~62%, 10% -> ~77%), so a whole-board mirror reads as a
               wave rolling across the sliders rather than an instant slam.
             • PARKED_EFFECT_EPSILON + crParked: sliders below this count as
               "parked" (the user switched that effect off). CR moves sliders
               that are in motion; it NEVER starts a parked effect — waking
               parked effects is Auto Glitch's unpark job. */
          const CONTINUAL_RANDOMIZATION_EFFECT_CAP = 0.85;
          const MIRROR_FLIP_FACTOR = 0.75;
          const PARKED_EFFECT_EPSILON = PARKED_EPSILON;
          const crParked = {};
          /* R4.1.3 EFFECT CANCELLATION — a slider dragged to zero cancels its
             effect, and ZERO ALL cancels every effect. A cancelled voice can
             never be started by any automation: not by CR, not by Auto Glitch's
             unpark, not by an aesthetic burst. Only the user wakes it again —
             raising its slider, applying a preset or Randomize All, or picking
             a tuned voice pair. The lights are not latched here: their own
             confirmation-gated system already owns their stopping rules. */
          const userCancelled = {};
          function setEffectCancelled(name, on) {
              if (isManualLight(name)) return;
              if (on) userCancelled[name] = true;
              else delete userCancelled[name];
          }
          function isEffectCancelled(name) { return !!userCancelled[name]; }

          function randRange(r) { return r[0] + Math.random() * (r[1] - r[0]); }

          function pickPeakEffects(count) {
              const pool = peakPool.filter((name) => !isManualLight(name));
              const out = new Set();
              while (out.size < count && pool.length) {
                  out.add(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
              }
              return out;
          }

          function pickTimingMode(now) {
              /* R1.5: the source sets the board's TEMPERAMENT — an
                 energetic, moving video tips the dice toward the wild
                 burst/zoom modes; a calm one settles into linger/smooth */
              const lively = srcEnergyK() + 0.5 * srcMotionK();
              if (Math.random() < 0.35 * clamp01(lively - 0.75)) {
                  return Math.random() < 0.6 ? 'burst' : 'zoomBurst';
              }
              if (Math.random() < 0.35 * clamp01(1.15 - lively)) {
                  return Math.random() < 0.55 ? 'linger' : 'smooth';
              }
              const roll = Math.random();
              if (roll < 0.22) return 'smooth';
              if (roll < 0.38) return 'snap';
              if (roll < 0.50) return 'flipflop';
              if (roll < 0.64) return 'burst';
              if (roll < 0.74) return 'flipBurst';
              if (roll < 0.84) return 'zoomBurst';
              return 'linger';
          }

          function retargetRandomization(now, allowBurst) {
              /* R1 (006 final): allowBurst=false on the first retarget after
                 the CR toggle so the board eases into its new motion instead
                 of slamming with a burst. */
              if (allowBurst === undefined) allowBurst = true;
              // When AI warp is active, warp-blend effects join the peak pool so they
              // can be driven to their boosted ceiling ranges.
              const warpPeakPool = isAiWarpActive
                  ? peakPool.concat([...WARP_BLEND_EFFECTS])
                  : peakPool;
              const pickCount = 4 + ((Math.random() * 3) | 0);
              activePeakEffects = new Set();
              const shuffled = warpPeakPool.filter((name) => !isManualLight(name)).sort(() => Math.random() - 0.5);
              for (let i = 0; i < Math.min(pickCount, shuffled.length); i++) activePeakEffects.add(shuffled[i]);
              const mode = randBehavior;
              const allowWild = !isAutoGlitching && softWild();   /* R2: 'wild' only inside a crescendo */
              const mirror = allowWild && (mode === 'flipflop' || Math.random() < 0.22);
              const burst = allowWild && allowBurst && (mode === 'burst' || Math.random() < 0.18);
              if (burst) {
                  burstUntil = now + 1200 + Math.random() * 1600;
                  burstDir = {};
              }
              if (mode === 'linger') {
                  lingerUntil = now + 1800 + Math.random() * 2400;
              }
              if (mode === 'flipflop') flipFlopPhase = (flipFlopPhase + 1) & 1;

              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  if (automationHeld(name)) continue;
                  // Aesthetic burst has priority — don't overwrite its targets
                  if (aestheticBurstLocked && aestheticBurstLocked.has(name)) continue;
                  /* R1 (006 final): parked sliders never join the randomization
                     — CR moves what is on; it never switches effects on. */
                  /* R4.1.3: a cancelled voice never rejoins through automation */
                  if (isEffectCancelled(name)) { randomTargets[name] = 0; continue; }
                  if (crParked[name] && (effectAlphas[name] || 0) < PARKED_EFFECT_EPSILON) {
                      randomTargets[name] = 0;
                      continue;
                  }
                  /* R4.1.1: a breathing voice sits this retarget out — its level
                     and target hold still, giving the last transition room. */
                  if (voiceBreathing(name, now, mode)) continue;
                  /* R4.1.3 SEPARATION — each voice joins a retarget on its own
                     odds, so the board moves as staggered strands of confluence
                     instead of one block that turns together. */
                  const trait = voiceTraits[name];
                  if (trait && Math.random() > trait.join) continue;
                  const profile = blendProfiles[name];
                  // When AI warp is active, use boosted peak ranges for warp-blend effects
                  const effectiveProfile = (isAiWarpActive && WARP_BLEND_EFFECTS.has(name) && WARP_BLEND_PEAKS[name])
                      ? Object.assign({}, profile, { peak: WARP_BLEND_PEAKS[name] })
                      : profile;
                  const cur = effectAlphas[name] || 0;
                  let target;

                  if (mode === 'linger') {
                      target = clamp(cur + (Math.random() - 0.5) * 0.10, 0, MAX_EFFECT_CAP);
                  } else if (mode === 'flipBurst') {
                      // Hard 0↔1 flip, selected effects only
                      const isPeak = activePeakEffects.has(name);
                      flipBurstPhase = (flipBurstPhase + 1) & 1;
                      if (isPeak) {
                          target = flipBurstPhase ? Math.min(1, MAX_EFFECT_CAP) : 0;
                      } else {
                          // non-peak: keep low but also flip occasionally
                          target = Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : 0) : effectiveProfile.ambient[0] + Math.random() * effectiveProfile.ambient[1];
                      }
                  } else if (mode === 'zoomBurst') {
                      // Ramp 0→1→0, like a zoom flash
                      const isPeak = activePeakEffects.has(name);
                      if (isPeak) {
                          if (!zoomBurstPeak) {
                              // still rising
                              target = Math.min(1, MAX_EFFECT_CAP);
                          } else {
                              // falling back
                              target = 0;
                          }
                      } else {
                          target = effectiveProfile.ambient[0] + Math.random() * effectiveProfile.ambient[1] * 0.5;
                      }
                  } else if (mirror || mode === 'flipflop') {
                      /* R1 (006 final): the board inverts MIRROR_FLIP_FACTOR of
                         the way — a rolling wave, never a hard slam */
                      const inv = clamp(cur + (1 - 2 * cur) * MIRROR_FLIP_FACTOR, 0, MAX_EFFECT_CAP);
                      if (mode === 'flipflop' && activePeakEffects.has(name)) {
                          target = flipFlopPhase ? Math.max(inv, effectiveProfile.peak[0]) : Math.min(cur * 0.30,
                              effectiveProfile.ambient[1]);
                      } else {
                          target = inv;
                      }
                  } else if (mode === 'burst') {
                      const isPeak = activePeakEffects.has(name);
                      // Bursts peak 50-100% for peak effects. B&W Invert uses BOTH
                      // rails: hue-only (0–50%, 0 emission invert) OR full light
                      // emission inversion (50–100% → invert 75%).
                      let lo = Math.max(effectiveProfile.peak[0], 0.50);
                      let hi = Math.min(1, effectiveProfile.peak[1]);
                      if (name === 'B&W Invert') {
                          const rails = Math.random() < 0.5 ? [0, 0.50] : [0.75, 1.0];
                          target = rails[(Math.random() * rails.length) | 0];
                      } else {
                          target = isPeak ? randRange([lo, hi]) : randRange([0, effectiveProfile.ambient[1] * 0.6]);
                          if (Math.random() < 0.25) target = Math.random() < 0.5 ? 0 : Math.min(1, MAX_EFFECT_CAP);
                      }
                  } else if (mode === 'snap') {
                      const isPeak = activePeakEffects.has(name);
                      const range = isPeak ? effectiveProfile.peak : effectiveProfile.ambient;
                      const steps = [0, 0.15, 0.35, 0.60, 0.80, MAX_EFFECT_CAP];
                      target = steps[(Math.random() * steps.length) | 0];
                      if (isPeak) target = Math.max(target, range[0]);
                  } else {
                      const isPeak = activePeakEffects.has(name);
                      const range = isPeak ? effectiveProfile.peak : effectiveProfile.ambient;
                      target = randRange(range);
                      if (allowWild && Math.random() < ((window.GlitchEngine && GlitchEngine.isChromaVoice &&
                              GlitchEngine.isChromaVoice(name)) ? 0.04 : 0.12)) target = 1;
                      // v11: occasional full-range linger sweep — any unlocked slider
                      // can be driven across the entire 0-100% span so it lingers,
                      // peaks and everything in-between.
                      if (Math.random() < 0.08) target = Math.random();
                  }

                  /* v11: PARKING REMOVED — nothing is ever force-parked at 0 by the
                     randomizer anymore. 0 is still a legal transient beat (part of the
                     0-100% range); only ZERO ALL EFFECTS parks & zeros levels. The old
                     ambient-floor clamp that kept Flash/Strobe/B&W parked is gone. */
                  /* R1.4 SOURCE-DRIVEN RANDOMIZATION: the background canvas
                     is the randomizer's hand — an energetic, moving source
                     pushes livelier peaks; a calm one restrains the board;
                     a colorful source feeds the chroma voices (appetite). */
                  const srcK = 0.72 + 0.38 * clamp(videoPalette.energy, 0, 1) + 0.18 * srcMotionK();
                  if (name === 'Hue/Color Cycle' || name === 'HSL Rainbow' || name === 'Neon Grad') {
                      target *= 0.70 + 0.45 * srcAppetite();
                  }
                  /* R1 (006 final): modesty cap — randomized targets never
                     exceed 0.85; in-band motion below the cap is untouched */
                  randomTargets[name] = Math.min(target * srcK, MAX_EFFECT_CAP,
                      CONTINUAL_RANDOMIZATION_EFFECT_CAP);
                  /* R2 SOFT-EYE: calm ceilings for the light voices (Flash /
                     Strobe) and the busy glyph voices (Matrix / ASCII / bombs);
                     the ceilings lift toward 1.0 as a crescendo opens */
                  randomTargets[name] = GlitchEngine.softCap(name, randomTargets[name], softK());
                  if (window.GlitchEngine && GlitchEngine.confineTarget) {
                      randomTargets[name] = GlitchEngine.confineTarget(name, randomTargets[name], {
                          ghost: getGhostMode(), vsync: getVsyncMode(),
                          warp: isAiWarpActive, bw: bwMasterLevel()
                      });
                  }
                  if (burst) burstDir[name] = (randomTargets[name] || 0) >= cur ? 1 : -1;
              }

              if (!sliderLocks.global) {
                  /* R1 (006 final): global opacity swings within its band only —
                     it dims and brightens the board, it never maxes it out.
                     R1.4: the SOURCE's brightness steers the band — dark
                     footage dims the board, bright footage lifts it. */
                  const glLo = 0.50 + 0.12 * clamp01(videoPalette.light / 100);
                  const glHi = 0.86 + 0.09 * clamp01(videoPalette.light / 100);
                  if (mode === 'linger') {
                      randomTargets.global = clamp(masterOpacity + (Math.random() - 0.5) * 0.08, glLo - 0.05, glHi);
                  } else if (mode === 'snap') {
                      randomTargets.global = [glLo + 0.05, 0.70, glHi - 0.07, glHi][(Math.random() * 4) | 0];
                  } else if (mode === 'burst') {
                      randomTargets.global = Math.random() < 0.40 ? glHi : randRange([glLo, glHi]);
                  } else {
                      randomTargets.global = Math.random() < 0.15 ? glHi : randRange([glLo, glHi]);
                  }
                  if (burst) burstDir.global = randomTargets.global >= masterOpacity ? 1 : -1;
              } else {
                  randomTargets.global = masterOpacity;
              }

              if (getGhostMode() !== 'OFF') {
                  if (mode === 'linger') ghostRandomTarget = clamp(ghostLevel + (Math.random() - 0.5) * 0.08, 0.15,
                  1);
                  else if (mode === 'burst') ghostRandomTarget = Math.random() < 0.35 ? 1 : randRange([0.3, 1]);
                  else ghostRandomTarget = Math.random() < 0.25 ? 1 : randRange([0.25, 1]);
              }

              const cadence = {
                  smooth: [1800, 2600],
                  snap: [1000, 1600],
                  flipflop: [1400, 2200],
                  burst: [800, 1400],
                  linger: [2200, 3600],
                  flipBurst: [300, 700],    // very fast toggling
                  zoomBurst: [500, 900]     // fast up-then-down
              } [mode] || [1800, 2600];
              /* R1.4: an energetic, moving source quickens the retarget
                 cadence (calm footage slows it) — the source sets the pace */
              nextRetargetAt = now + (cadence[0] + Math.random() * (cadence[1] - cadence[0])) * (isAutoGlitching ?
                  1.25 : 1) * (1.18 - 0.30 * clamp(videoPalette.energy, 0, 1) - 0.12 * srcMotionK()) *
                  GlitchEngine.softCadenceK(softK()) *           /* R2: ~2.3× slower retargets when calm */
                  (1 - 0.18 * clamp01(SOFT.beat)) *              /* R2: the ear nudges the next beat */
                  activeTrackTiming().pace;                      /* R4.1.2: the track sets the room */
          }

          function stepContinualRandomization(now, dt) {
              if (now >= nextBehaviorChange) {
                  rerollSomeVoiceTraits();
                  randBehavior = pickTimingMode(now);
                  /* R2 SOFT-EYE: the wild modes (burst / flipBurst / zoomBurst)
                     only exist inside a crescendo — calm boards roll smooth,
                     linger or flipflop */
                  if (window.GlitchEngine && GlitchEngine.softPickMode) {
                      randBehavior = GlitchEngine.softPickMode(randBehavior, softK(), Math.random);
                  }
                  // reset zoomBurst state on mode entry
                  if (randBehavior === 'zoomBurst') {
                      zoomBurstTarget = 0;
                      zoomBurstDir = 1;
                      zoomBurstPeak = false;
                  }
                  if (randBehavior === 'flipBurst') {
                      flipBurstPhase = 0;
                      flipBurstToggleAt = now;
                  }
                  const hold = {
                      smooth: [2200, 3800],
                      snap: [1200, 2200],
                      flipflop: [1600, 3000],
                      burst: [1000, 1800],
                      linger: [2000, 4200],
                      flipBurst: [1800, 3200],  // total time in this mode
                      zoomBurst: [2000, 3500]
                  } [randBehavior] || [1800, 3200];
                  nextBehaviorChange = now + (hold[0] + Math.random() * (hold[1] - hold[0])) *
                      lerp(GlitchEngine.SOFT_EYE.pace.holdK, 1, softK());   /* R2: longer holds when calm */
                  if (randBehavior === 'burst') {
                      burstUntil = now + 1000 + Math.random() * 1400;
                      burstDir = {};
                  }
                  if (randBehavior === 'linger') {
                      lingerUntil = now + 1400 + Math.random() * 2000;
                  }
              }
              if (now >= nextRetargetAt) retargetRandomization(now);

              const burstOn = now < burstUntil;
              const lingerOn = now < lingerUntil || randBehavior === 'linger';
              /* R2 SOFT-EYE: calm travel uses the gentle per-mode scales; the
                 legacy slams only return inside a crescendo (lerped by k) */
              const modeScale = lerp(GlitchEngine.softTimingScale(randBehavior),
                  timingRateScale[randBehavior] || 1, softK()) * GlitchEngine.softRateK(softK());

              // zoomBurst: flip direction when peak effects reach near-target
              if (randBehavior === 'zoomBurst' && !zoomBurstPeak) {
                  let peaked = true;
                  activePeakEffects.forEach((name) => {
                      if ((effectAlphas[name] || 0) < 0.82) peaked = false;
                  });
                  if (peaked && activePeakEffects.size > 0) {
                      zoomBurstPeak = true;
                      retargetRandomization(now); // trigger fall targets
                  }
              } else if (randBehavior === 'zoomBurst' && zoomBurstPeak) {
                  let fallen = true;
                  activePeakEffects.forEach((name) => {
                      if ((effectAlphas[name] || 0) > 0.10) fallen = false;
                  });
                  if (fallen && activePeakEffects.size > 0) {
                      zoomBurstPeak = false;
                      retargetRandomization(now); // start new zoom up
                  }
              }

              // flipBurst: very rapid re-targeting every 200-500ms
              if (randBehavior === 'flipBurst' && now >= flipBurstToggleAt) {
                  flipBurstToggleAt = now + (200 + Math.random() * 300) * (softWild() ? 1.6 : 4.0); /* R2: never a 5 Hz flip */
                  retargetRandomization(now);
              }

              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  if (automationHeld(name)) continue;
                  const target = randomTargets[name];
                  if (target === undefined) continue;
                  const cur = effectAlphas[name] || 0;
                  /* R1 (006 final smoothing pass): base ramps eased ~15%
                     (1.6 -> 1.45) and burst surges toned (max ~1.9x rising,
                     1.4x falling) so a burst reads as a rolling swell */
                  let rate = (blendProfiles[name].rate || 0.2) * 0.86 * modeScale * (0.75 + 0.25 *
                      boardHarmony()) * (0.4 + 1.6 * clamp01(masterControls.continualSpeed)) *
                      R16.randRate(); /* R3: slower travel so effect handoffs roll */
                  if (window.GlitchEngine && GlitchEngine.chromaRateScale) {
                      rate *= GlitchEngine.chromaRateScale(name);
                  }
                  if (burstOn) rate *= (burstDir[name] > 0 ? 1.28 : 1.1);
                  if (lingerOn && randBehavior === 'linger') rate *= 0.45;
                  rate *= voiceRateScale(name);
                  let next;
                  const cutTo = hardCutValue(name, cur, target, now);
                  if (cutTo !== null) {
                      next = cutTo;
                  } else if (randBehavior === 'snap' && Math.abs(target - cur) > 0.04 && Math.random() < 0.40) {
                      next = cur + (target - cur) * 0.22;
                  } else {
                      next = easeExp(cur, target, dt, rate);
                  }
                  if (Math.abs(next - cur) > 0.0004) {
                      effectAlphas[name] = next;
                      const el = sliderElements[name];
                      if (el && (sliderWritten[name] === undefined || Math.abs(next - sliderWritten[name]) >
                          0.006)) {
                          sliderWritten[name] = next;
                          el.value = next.toFixed(3);
                      }
                  }
              }

              if (!sliderLocks.global && randomTargets.global !== undefined) {
                  let rate = 1.7 * modeScale; // R1 (006 final): eased global ramp
                  if (burstOn) rate *= (burstDir.global || 1) > 0 ? 1.8 : 1.4;
                  const next = easeExp(masterOpacity, randomTargets.global, dt, rate);
                  if (Math.abs(next - masterOpacity) > 0.0004) {
                      masterOpacity = next;
                      if (globalSliderEl && (sliderWritten.global === undefined || Math.abs(next - sliderWritten
                              .global) > 0.006)) {
                          sliderWritten.global = next;
                          globalSliderEl.value = next.toFixed(3);
                      }
                  }
              }
              if (getGhostMode() !== 'OFF' && !(ghostProtocolSlider && document.activeElement ===
                      ghostProtocolSlider)) {
                  const next = easeExp(ghostLevel, ghostRandomTarget, dt, 2.2 * Math.min(2.8, modeScale) * lerp(0.45, 1, softK())); /* R2 */
                  if (Math.abs(next - ghostLevel) > 0.0004) {
                      ghostLevel = next;
                      if (ghostProtocolSlider) ghostProtocolSlider.value = next.toFixed(3);
                      updateGhostUi();
                  }
              }
          }

          /* ------------------------------------------------------------------ *
           *  15. Auto glitch                                                    *
           * ------------------------------------------------------------------ */
          let autoGlitchLevel = 0;
          const AUTO_GLITCH_EASE_RATE = 0.32; // R1 (006 final): tau ~3s fade
          const autoGlitchInstances = [];
          let nextSparkAt = 0;
          let nextUnparkAt = performance.now() + 2000; // grace period so unpark never fires on the first frame
          /* v11: AUTO_GLITCH_SHUTDOWN_EFFECTS removed — turning Auto Glitch OFF
             never parks or zeroes any slider. Only ZERO ALL EFFECTS does. */

          function autoGlitchUnpark(now) {
              if (isContinuallyRandomizing || !isAutoGlitching || now < nextUnparkAt) return;
              nextUnparkAt = now + 1400 + Math.random() * 3200;
              const parked = profileNames.filter((n) =>
                  !automationHeld(n) && !isEffectCancelled(n) && (effectAlphas[n] || 0) < PARKED_EPSILON);
              if (!parked.length) return;
              const name = parked[(Math.random() * parked.length) | 0];
              const profile = blendProfiles[name];
              const value = profile ? randRange(profile.ambient) : 0.05 + Math.random() * 0.12;
              effectAlphas[name] = value;
              randomTargets[name] = value;
              if (sliderElements[name]) sliderElements[name].value = value.toFixed(3);
              crParked[name] = false; // R1: AG woke it — CR may now animate it
              updateContinuousEffectsCache(name);
          }

          /* R1 (006 final): the layer's own two-sine breath — a fast swell
             over a slow surge, 0.30..1.00 */
          function autoGlitchPulse(now) {
              const t = now * 0.001;
              const breathe = 0.5 + 0.5 * Math.sin(t * 0.55);
              const surge = 0.5 + 0.5 * Math.sin(t * 0.19 + 2.1);
              return 0.3 + 0.7 * (breathe * 0.65 + surge * 0.35);
          }

          let nextBwAgAt = 0;
          function autoGlitchBwDrive(now) {
              if (!isAutoGlitching || sliderLocks['B&W Invert'] || bwSweepActive) return;
              if (isEffectCancelled('B&W Invert')) return; /* R4.2.4: cancelled B&W never rail-hops */
              if (aestheticBurstLocked && aestheticBurstLocked.has('B&W Invert')) return;
              if (now < nextBwAgAt) return;
              nextBwAgAt = now + (1600 + Math.random() * 2800) * lerp(2.2, 1, softK()); /* R2: slower rail hops when calm */
              const power = clamp01(masterControls.autoGlitchPower);
              const pulse = autoGlitchPulse(now);
              const rails = [0, 0.50, 0.75, 1.0];
              let targetBw = rails[(Math.random() * rails.length) | 0];
              if (power > 0.55 && Math.random() < 0.42) targetBw = 0.75; /* prefer 75% negative emission */
              randomTargets['B&W Invert'] = clamp01(targetBw);
              if (!isContinuallyRandomizing) {
                  const cur = effectAlphas['B&W Invert'] || 0;
                  effectAlphas['B&W Invert'] = clamp01(cur * 0.55 + targetBw * 0.45);
                  if (sliderElements['B&W Invert']) {
                      sliderElements['B&W Invert'].value = effectAlphas['B&W Invert'].toFixed(3);
                  }
              }
          }

          function autoGlitchStep(now, dt) {
              const target = isAutoGlitching ? 1 : 0;
              autoGlitchLevel = easeExp(autoGlitchLevel, target, dt, AUTO_GLITCH_EASE_RATE);
              if (Math.abs(autoGlitchLevel - target) < 0.002) autoGlitchLevel = target;
              autoGlitchUnpark(now);
              autoGlitchBwDrive(now);

              if (isAutoGlitching && autoGlitchInstances.length === 0) {
                  timedEffectsDefs.forEach((def) => {
                      if (isManualLight(def.name)) return;
                      const profile = blendProfiles[def.name];
                      const ceiling = profile ? profile.peak[1] : 0.25;
                      const getStrength = () => {
                          if (autoGlitchLevel <= 0) return 0;
                          const base = smoothedStrength[def.name] || ((effectAlphas[def.name] || 0) *
                              masterOpacity);
                          /* R1 (006 final): where the user's slider is already
                             loud the layer whispers (25%); a quiet board sings */
                          const headroom = 1 - clamp01(base) * 0.75;
                          /* v11.2: toned — auto glitch breathes WITH the ensemble
                             instead of overriding it (softer pulse, lower ceiling) */
                          const extra = 0.82 + 0.18 * autoGlitchPulse(performance.now());
                          /* R1.4: Auto Glitch breathes with the source — an
                             energetic video pushes the pulses, a calm one
                             restrains them (inside the 0.72 ceiling) */
                          return Math.min(0.72, autoGlitchLevel * ceiling * autoGlitchPulse(
                              performance.now()) * headroom * extra * clamp01(masterControls
                              .autoGlitchPower) * (0.78 + 0.40 * clamp(videoPalette.energy, 0, 1)));
                      };
                      const fn = def.factory(getStrength, true);
                      autoGlitchInstances.push(fn);
                      activeEffects.push(fn);
                  });
              } else if (!isAutoGlitching && autoGlitchLevel <= 0 && autoGlitchInstances.length > 0) {
                  autoGlitchInstances.forEach((fn) => {
                      const i = activeEffects.indexOf(fn);
                      if (i > -1) activeEffects.splice(i, 1);
                  });
                  autoGlitchInstances.length = 0;
              }

              if (isAutoGlitching && !isContinuallyRandomizing && now >= nextSparkAt) {
                  if (activeEffects.length < 40) {
                      nextSparkAt = now + (1600 + Math.random() * 2600) *
                          (1.15 - 0.30 * clamp(videoPalette.energy, 0, 1) - 0.10 * srcMotionK()) * /* R1.4 */
                          lerp(GlitchEngine.SOFT_EYE.pace.sparkK, 0.9, softK());   /* R2: sparse sparks when calm */
                      let def = timedEffectsDefs[(Math.random() * timedEffectsDefs.length) | 0];
                      /* R2: calm sparks skip the light voices */
                      if (def && !softWild() && GlitchEngine.SOFT_EYE.lightVoices.indexOf(def.name) !== -1) {
                          def = timedEffectsDefs.find((d) => d.name === 'Neon Grad') || def;
                      }
                      if (def && !isManualLight(def.name)) {
                          const p = blendProfiles[def.name];
                          const floor = p ? p.peak[1] * 0.75 : 0.32;
                          activeEffects.push(def.factory(() => Math.min(0.75, floor * (0.55 + Math.random() *
                              0.45))));
                      }
                  } else {
                      nextSparkAt = now + 3200;
                  }
              }
          }

          /* ------------------------------------------------------------------ *
           *  16. One-shot controls                                              *
           * ------------------------------------------------------------------ */
          function randomizeBoard() {
              randomizeVoiceFx();
              activePeakEffects = pickPeakEffects(4 + ((Math.random() * 3) | 0));
              const travelTo = {};
              let chromaLead = null;
              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  if (!automationHeld(name)) {
                      const profile = blendProfiles[name];
                      const parked = (effectAlphas[name] || 0) < PARKED_EPSILON && Math.random() < 0.5;
                      let value = parked ? 0 : randRange(activePeakEffects.has(name) ? profile.peak :
                          profile.ambient);
                      if (!parked && (name === 'Hue/Color Cycle' || name === 'HSL Rainbow' ||
                              name === 'Neon Grad')) {
                          value = value + srcAppetite() * (0.30 + 0.45 * Math.random() - value) * 0.55;
                          if (chromaLead == null) chromaLead = value;
                          else value = value * 0.45 + chromaLead * 0.55;
                      }
                      if (window.GlitchEngine && GlitchEngine.confineTarget) {
                          value = GlitchEngine.confineTarget(name, value, boardFilterCtx());
                      }
                      travelTo[name] = value;
                  }
              }
              const op = sliderLocks.global ? masterOpacity : randRange([0.55, 0.95]);
              beginAlphaTravel(travelTo, op, 880);
              updateContinuousEffectsCache();
          }

          function applyRandomSeed(seed) {
              const rng = (function(s) { return function() { s = (s * 9301 + 49297) % 233280; return s /
                      233280; }; })(seed);
              customTime = rng() * 86400000;
              const travelTo = {};
              let chromaLead = null;
              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  if (!automationHeld(name)) {
                      let v = rng();
                      if (name === 'Hue/Color Cycle' || name === 'HSL Rainbow' || name === 'Neon Grad') {
                          v = v + srcAppetite() * (0.30 + 0.45 * rng() - v) * 0.55;
                          if (chromaLead == null) chromaLead = v;
                          else v = v * 0.45 + chromaLead * 0.55;
                      }
                      if (window.GlitchEngine && GlitchEngine.confineTarget) {
                          v = GlitchEngine.confineTarget(name, v, boardFilterCtx());
                      }
                      travelTo[name] = v;
                      crParked[name] = v < PARKED_EFFECT_EPSILON;
                      setEffectCancelled(name, v < PARKED_EFFECT_EPSILON); /* R4.1.3: Randomize All is user intent */
                  }
              }
              const op = sliderLocks.global ? masterOpacity : rng();
              beginAlphaTravel(travelTo, op, 720);
              if (isContinuallyRandomizing) retargetRandomization(performance.now());
              updateContinuousEffectsCache();
          }
          if (randomSeedSlider) {
              randomSeedSlider.addEventListener('input', () => {
                  applyRandomSeed(parseFloat(randomSeedSlider.value));
              });
          }

          /* ------------------------------------------------------------------ *
           *  17. Ghost / V-Sync / AI Warp button logic                          *
           * ------------------------------------------------------------------ */
          if ($('aiWarpBtn')) {
              $('aiWarpBtn').addEventListener('click', () => {
                  isAiWarpActive = !isAiWarpActive;
                  $('aiWarpBtn').textContent = 'AI Video Warp: ' + (isAiWarpActive ? 'ON' : 'OFF');
                  if (!isAiWarpActive) { domCache.aiFilter = ''; }
              });
          }
          /* R2 SOFT-EYE toggle — click: calm engine ON/OFF (OFF = legacy R1
             pacing). Shift+click: call a crescendo right now (if the gap allows). */
          if ($('softEyeBtn')) {
              $('softEyeBtn').addEventListener('click', (e) => {
                  if (!SOFT.ok) { showNotificationMessage('SOFT-EYE needs glitch-engine.js 2.0', 2400); return; }
                  if (e.shiftKey) {
                      const okReq = SOFT.cresc.request(performance.now(), 'manual', 1, 1);
                      showNotificationMessage(okReq ? 'CRESCENDO CALLED — swelling…' :
                          'CRESCENDO NOT YET — the gap keeps it occasional (' +
                          Math.ceil(Math.max(0, GlitchEngine.SOFT_EYE.crescendo.minGapMs - (performance.now() - SOFT.cresc.state.lastWildEnd)) / 1000) + 's)', 2400);
                      return;
                  }
                  SOFT.enabled = !SOFT.enabled;
                  showNotificationMessage(SOFT.enabled ?
                      'SOFT-EYE ON — calm board, occasional crescendos (ear + canvas timed)' :
                      'SOFT-EYE OFF — legacy R1 pacing (wild all the time)', 2800);
                  softHudAt = 0;
                  softUpdateHud(performance.now());
              });
          }
          if ($('automatedMastersBtn')) {
              $('automatedMastersBtn').addEventListener('click', () => {
                  isAutomatedMasters = !isAutomatedMasters;
                  $('automatedMastersBtn').textContent = 'Automated Masters: ' + (isAutomatedMasters ?
                      'ON' : 'OFF');
                  $('automatedMastersBtn').classList.toggle('active', isAutomatedMasters);
                  if (isAutomatedMasters) {
                      retargetMasters(performance.now());
                  } else {
                      MASTER_KEYS.forEach((k) => { masterTargets[k] = masterControls[k]; });
                  }
              });
          }

          /* ------------------------------------------------------------------ *
           *  ZERO ALL EFFECTS — stops all automations, parks every slider at 0  *
           * ------------------------------------------------------------------ */
          function zeroAllEffects() {
              // 1. Kill all automation systems
              if (typeof presetTravel !== 'undefined') { presetTravel.active = false; presetTravel.toG = null; }
              if (SOFT.ok && SOFT.cresc.phase() !== 'calm') {   /* R2: a zero-all ends any crescendo */
                  SOFT.cresc.state.phase = 'release';
                  SOFT.cresc.state.since = performance.now();
                  SOFT.cresc.state.until = performance.now() + 1500;
              }
              isContinuallyRandomizing = false;
              isAutoGlitching = false;
              isAutomatedMasters = false;
              setLightAutomation(false); /* ZERO ALL also switches Flash & Strobe automation OFF */
              setMilkActive(false); /* AI WARP parity: ZERO ALL drops the milk too */
              bwSweep.active = false;
              bwSweepActive = false;
              bwSweep.phase = 'idle';
              bwSweepScheduleNext(performance.now(), 30000, 60000); // push way back

              // 2. Zero every effect slider + alpha + target
              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  effectAlphas[name] = 0;
                  randomTargets[name] = 0;
                  sliderWritten[name] = 0;
                  smoothedStrength[name] = 0;
                  crParked[name] = true; // R1: everything parks — CR stays quiet
                  setEffectCancelled(name, true); // R4.1.3: and stays cancelled — nothing auto-starts after ZERO ALL
                  if (sliderElements[name]) sliderElements[name].value = '0.000';
              }

              // 3. Zero the global opacity too
              masterOpacity = 0;
              randomTargets.global = 0;
              sliderWritten.global = 0;
              if (globalSliderEl) globalSliderEl.value = '0.000';

              // 4. Clear aesthetic burst state
              aestheticBurstLocked = new Set();
              aestheticBurstGroupKey = null;
              aestheticBurstPhase = 'rest';
              aestheticBurstNextAt = performance.now() + 60000; // long rest after zero

              // 5. Freeze master controls at their current values (stop automated drift)
              MASTER_KEYS.forEach((k) => { masterTargets[k] = masterControls[k]; });

              // 5. Flush the continuous effect cache (removes all renderers)
              updateContinuousEffectsCache();

              // 6. Kill any lingering timed effect instances
              autoGlitchInstances.forEach((fn) => {
                  const i = activeEffects.indexOf(fn);
                  if (i > -1) activeEffects.splice(i, 1);
              });
              autoGlitchInstances.length = 0;
              nextUnparkAt = performance.now() + 60000; // long grace so unpark can't fire

              // 7. Sync button labels
              const crBtn = $('continualRandomizeBtn');
              if (crBtn) crBtn.textContent = 'Continual Randomization: OFF';
              const agBtn = $('autoGlitchBtn');
              if (agBtn) agBtn.textContent = 'Auto Glitch: OFF';
              const amBtn = $('automatedMastersBtn');
              if (amBtn) { amBtn.textContent = 'Automated Masters: OFF';
                  amBtn.classList.remove('active'); }

              // 8. Apply the zeroed filter chain immediately
              applyMasterFilters();
          }

          if ($('zeroAllBtn')) $('zeroAllBtn').addEventListener('click', zeroAllEffects);

          if ($('autoGlitchBtn')) {
              $('autoGlitchBtn').addEventListener('click', () => {
                  isAutoGlitching = !isAutoGlitching;
                  $('autoGlitchBtn').textContent = 'Auto Glitch: ' + (isAutoGlitching ? 'ON' : 'OFF');
                  if (isAutoGlitching) {
                      nextUnparkAt = performance.now() + 1000 + Math.random() * 2000;
                      const seed = Math.random();
                      if (randomSeedSlider) randomSeedSlider.value = seed.toFixed(3);
                      applyRandomSeed(seed);
                      /* v11: re-enabling Auto Glitch restarts the automated levels
                         (aesthetic bursts, B&W sweeps, unpark cadence) after a park. */
                      restartAutomatedLevels('autoGlitch');
                  } else {
                      /* v11: turning Auto Glitch OFF never parks or zeroes ANY
                         slider — every level stays exactly where it is. Only the
                         ZERO ALL EFFECTS button parks & zeros levels. */
                      for (let i = 0; i < profileNames.length; i++) {
                          const n = profileNames[i];
                          if (!sliderLocks[n]) randomTargets[n] = effectAlphas[n] || 0;
                      }
                      updateContinuousEffectsCache();
                  }
                  autoGlitchStep(performance.now(), 0);
              });
          }
          if ($('continualRandomizeBtn')) {
              $('continualRandomizeBtn').addEventListener('click', () => {
                  isContinuallyRandomizing = !isContinuallyRandomizing;
                  $('continualRandomizeBtn').textContent = 'Continual Randomization: ' + (
                      isContinuallyRandomizing ? 'ON' : 'OFF');
                  if (isContinuallyRandomizing) {
                      /* R1 OLD-SOUL (006 final): CR never wakes a parked effect —
                         the parked snapshot is taken at toggle-on; only sliders
                         already in motion (or raised by hand / Auto Glitch's
                         unpark afterwards) join the motion. */
                      for (let i = 0; i < profileNames.length; i++) {
                          const name = profileNames[i];
                          crParked[name] = (effectAlphas[name] || 0) < PARKED_EFFECT_EPSILON;
                      }
                      if (!sliderLocks.global && masterOpacity < PARKED_EPSILON) {
                          masterOpacity = 0.60 + Math.random() * 0.32; // R1 band, no full slam
                          if (globalSliderEl) globalSliderEl.value = masterOpacity.toFixed(3);
                          randomTargets.global = masterOpacity;
                      }
                      /* R1 (006 final): first retarget carries no burst */
                      retargetRandomization(performance.now(), false);
                      updateContinuousEffectsCache();
                      /* v11: en-action of Continual Randomization restarts the
                         automated levels (bursts / sweeps / unpark cadence). */
                      restartAutomatedLevels('continualRandomize');
                  } else {
                      /* v11: turning Continual Randomization OFF freezes every target
                         where it stands — nothing is parked, nothing is zeroed. */
                      for (let i = 0; i < profileNames.length; i++) {
                          const name = profileNames[i];
                          randomTargets[name] = effectAlphas[name] || 0;
                      }
                      randomTargets.global = masterOpacity;
                      updateContinuousEffectsCache();
                  }
              });
          }
          if ($('randomizeBtn')) {
              $('randomizeBtn').addEventListener('click', randomizeBoard);
          }

          /* ------------------------------------------------------------------ *
           *  18. Playback UI + init screen                                      *
           * ------------------------------------------------------------------ */
          function activatePlaybackUi(mode) {
              if (!document.body.classList.contains('welcome-dismissed')) return;
              /* any source start ends the egg's armed highlight; GHOST itself
                 loads only through the MISSING LINK track (ghostStartHook) */
              document.documentElement.classList.remove('ghost-egg-armed');
              sourceScreen.hidden = true;
              playbackControls.forEach((id) => { const el = $(id); if (el) el.inert = false; });
              document.body.classList.add('playback-on');
              document.body.classList.remove('local-audio', 'local-video');
              if (mode === 'local-audio') document.body.classList.add('local-audio');
              if (mode === 'local-video') document.body.classList.add('local-video');
              if (mode === 'youtube') {
                  if (ytWarpShell) ytWarpShell.style.display = 'block';
                  if (ytFrame) ytFrame.style.display = 'block';
                  if (video) video.style.display = 'none';
              }
              hidePlaybackPrompts();
              if (mode !== 'canvas') {
                  if (openFileWrap) openFileWrap.style.display = 'none';
                  if (openFileBtn) openFileBtn.style.display = 'none';
                  if (fileInput) fileInput.style.display = 'none';
              }
              applyMasterFilters();
          }

          function hidePlaybackPrompts() {
              ['ytInput', 'startBtn', 'suggestedVideo', 'suggestedVideo3', 'suggestedVideo2', 'suggestedYoutube',
                  'suggestedPlaylist', 'suggestedMoonlight', 'suggestedFractals', 'suggestedNightCity', 'suggestedDarksynth', 'suggestedBirdcage', 'testCanvas', 'Defcon1Video',
                  'ghostLink'
              ].forEach((id) => {
                  const el = $(id);
                  if (el) el.style.display = 'none';
              });
          }

          if (startBtn) {
              startBtn.addEventListener('click', () => startPlayback(ytInput ? ytInput.value : ''));
              if (ytInput) ytInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startPlayback(
                      ytInput.value); });
          }
          const SUGGESTED = [
              ['suggestedVideo', 'https://www.youtube.com/watch?v=gopYmb38DgM'],
              ['suggestedVideo3', 'https://www.youtube.com/watch?v=uvSXL6ypLlw'],
              ['suggestedVideo2', 'https://www.youtube.com/watch?v=8o6bdTOhIyE'],
              ['suggestedYoutube', 'https://www.youtube.com/watch?v=QsUmvGkXhnk'],
              ['suggestedPlaylist', 'https://www.youtube.com/watch?v=RgFaK6ZQifE&list=RDEMWUbu7UjvrEYUSE4m8ATOcw&start_radio=1'],
              ['suggestedFractals', 'https://www.youtube.com/watch?v=u4TPBkN0vIc'],
              ['suggestedNightCity', 'https://www.youtube.com/watch?v=KlcsGjI6Jms'],
              ['suggestedDarksynth', 'https://www.youtube.com/watch?v=NpSTV8WJATc&list=RDNpSTV8WJATc&start_radio=1'],
              ['Defcon1Video', 'https://www.youtube.com/watch?v=jmEAP7aGo0o'],
              ['suggestedMoonlight', 'https://www.youtube.com/watch?v=B1CL4PqHh9k&list=RDB1CL4PqHh9k&start_radio=1'],
              ['suggestedBirdcage', 'https://www.youtube.com/watch?v=PD3RCwNseqQ&list=RDPD3RCwNseqQ&start_radio=1']
          ];

          function bindSuggestedStart(el, url, loop) {
              if (!el) return;
              el.style.pointerEvents = 'auto';
              el.style.cursor = 'pointer';
              el.setAttribute('role', 'button');
              el.tabIndex = 0;
              const go = (e) => {
                  if (e) { e.preventDefault();
                      e.stopPropagation(); }
                  startPlayback(url, !!loop);
              };
              el.addEventListener('click', go, true);
              el.addEventListener('keydown', (e) => {
                  if (e.key === 'Enter' || e.key === ' ') go(e);
              });
          }
          SUGGESTED.forEach(([id, url]) => {
              bindSuggestedStart($(id), url, id === 'suggestedPlaylist' || id === 'suggestedMoonlight' || id === 'suggestedDarksynth' || id === 'suggestedBirdcage');
          });
          (function bindHardLight() {
              const btn = document.getElementById('hardLightBtn');
              if (!btn) return;
              let on = false;
              const sync = () => {
                  document.body.classList.toggle('hard-light', on);
                  btn.classList.toggle('active', on);
                  btn.textContent = on ? 'HARD-LIGHT: ON' : 'HARD-LIGHT: OFF';
              };
              btn.addEventListener('click', () => { on = !on; sync(); });
              sync();
          })();

          (function bindEar() {
              const btn = document.getElementById('earBtn');
              const modes = ['auto', 'audio', 'canvas'];
              const labels = { auto: 'EAR: AUTO', audio: 'EAR: AUDIO', canvas: 'EAR: CANVAS' };
              SOFT.earMode = SOFT.earMode || 'auto';
              const paint = () => {
                  if (!btn) return;
                  const m = SOFT.earMode || 'auto';
                  const waiting = m === 'audio' && (SOFT.audioMix || 0) < 0.25;
                  const t = waiting ? 'EAR: AUDIO · WAIT' : labels[m];
                  if (btn.textContent !== t) btn.textContent = t;
                  btn.classList.toggle('ear-auto', m === 'auto');
                  btn.classList.toggle('ear-audio', m === 'audio');
                  btn.classList.toggle('ear-canvas', m === 'canvas');
                  btn.classList.toggle('ear-wait', waiting);
                  btn.setAttribute('aria-pressed', m !== 'auto' ? 'true' : 'false');
              };
              if (btn) {
                  btn.addEventListener('click', (e) => {
                      e.stopPropagation();
                      const i = modes.indexOf(SOFT.earMode);
                      SOFT.earMode = modes[(i < 0 ? 0 : i + 1) % modes.length];
                      paint();
                  });
              }
              SOFT.paintEar = paint;
              paint();
          })();

          /* FREEZE FRAME (S or the rack button): hide every control layer, let the
             HUD-free picture paint, then ask the host to capture it. The host saves
             the PNG through its own Save dialog; no image data returns to the page.
             The hiding rule is html.freeze-frame-capture in css/r4.css. */
          (function bindFreezeFrame() {
              const btn = document.getElementById('freezeFrameBtn');
              const root = document.documentElement;
              let busy = false;
              const hudFreePaint = () => new Promise((resolve) => {
                  const fallback = setTimeout(resolve, 250);
                  requestAnimationFrame(() => requestAnimationFrame(() => {
                      clearTimeout(fallback);
                      resolve();
                  }));
              });
              async function freezeFrame() {
                  if (busy) return;
                  const host = window.GlitchHost;
                  if (!host || !host.isNativeHost || typeof host.captureFreezeFrame !== 'function') {
                      showNotificationMessage('FREEZE FRAME needs the Glitch Player app host.', 3000);
                      return;
                  }
                  busy = true;
                  if (btn) btn.disabled = true;
                  root.classList.add('freeze-frame-capture');
                  let message = 'FREEZE FRAME CAPTURED \u00b7 CHOOSE WHERE TO SAVE THE PNG';
                  try {
                      await hudFreePaint();
                      await host.captureFreezeFrame();
                  } catch (error) {
                      message = 'FREEZE FRAME failed: ' + error.message;
                  } finally {
                      root.classList.remove('freeze-frame-capture');
                      busy = false;
                      if (btn) btn.disabled = false;
                  }
                  showNotificationMessage(message, 3000);
              }
              if (btn) {
                  btn.addEventListener('click', (e) => {
                      e.stopPropagation();
                      freezeFrame();
                  });
              }
              document.addEventListener('keydown', (e) => {
                  if (e.defaultPrevented || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
                  if (e.key !== 's' && e.key !== 'S') return;
                  if (isTypingTarget(e.target) || (welcomeScreen && !welcomeScreen.hidden)) return;
                  e.preventDefault();
                  freezeFrame();
              });
          })();


          (function bindTestCanvas() {
              const el = $('testCanvas');
              if (!el) return;
              el.style.pointerEvents = 'auto';
              el.style.cursor = 'pointer';
              el.setAttribute('role', 'button');
              el.tabIndex = 0;
              const go = (e) => {
                  if (e) { e.preventDefault();
                      e.stopPropagation(); }
                  // The HUD still waits for confirmed playback; randomization is only armed once loading starts.
                  if (!startPlayback(FADE_WHITE_URL, true)) return;
                  if (!isContinuallyRandomizing) {
                      isContinuallyRandomizing = true;
                      const btn = $('continualRandomizeBtn');
                      if (btn) btn.textContent = 'Continual Randomization: ON';
                      for (let i = 0; i < profileNames.length; i++) {
                          const name = profileNames[i];
                          if (automationHeld(name)) continue;
                          const profile = blendProfiles[name];
                          const v = profile ? randRange(profile.ambient) : 0.05 + Math.random() * 0.12;
                          effectAlphas[name] = v;
                          if (sliderElements[name]) sliderElements[name].value = v.toFixed(3);
                      }
                      if (!sliderLocks.global) {
                          masterOpacity = 0.7 + Math.random() * 0.25;
                          if (globalSliderEl) globalSliderEl.value = masterOpacity.toFixed(3);
                      }
                      retargetRandomization(performance.now());
                      updateContinuousEffectsCache();
                      restartAutomatedLevels('canvas'); // v11: automation wakeup
                  }
              };
              el.addEventListener('click', go, true);
              el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') go(ev); });
          })();

          /* ------------------------------------------------------------------ *
           *  19. Presets — FIXED: dropdown fully functional (from 470baf)       *
           * ------------------------------------------------------------------ */
          const PRESET_KEY = 'glitchCanvasPresets_v2';
          const LEGACY_PRESET_KEY = 'glitch-canvas-lite-presets-v2';
          const MAX_USER_PRESETS = R4.MAX_USER_PRESETS;
          let presets = Object.create(null);

          function isPlainRecord(value) { return R4.isPlainRecord(value); }
          function validPresetSettings(settings) { return R4.validPresetSettings(settings); }
          function validPresetEntry(entry) { return R4.validPresetEntry(entry); }

          (function loadPresets() {
              try {
                  let raw = localStorage.getItem(PRESET_KEY);
                  let migrated = false;
                  if (raw === null) {
                      raw = localStorage.getItem(LEGACY_PRESET_KEY);
                      migrated = raw !== null;
                  }
                  if (raw === null) return;
                  const stored = JSON.parse(raw);
                  const entries = Array.isArray(stored) ? stored :
                      (isPlainRecord(stored) && Array.isArray(stored.presets) ? stored.presets : null);
                  if (entries) {
                      if (entries.length > MAX_USER_PRESETS) throw new RangeError('Too many saved presets.');
                      entries.forEach((entry) => {
                          if (validPresetEntry(entry)) presets[entry.name] = entry.settings;
                      });
                  } else if (isPlainRecord(stored)) {
                      Object.keys(stored).slice(0, MAX_USER_PRESETS).forEach((name) => {
                          const entry = stored[name];
                          const settings = entry && entry.settings ? entry.settings : entry;
                          if (name.length <= 80 && name.trim() && validPresetSettings(settings)) {
                              presets[name] = settings;
                          }
                      });
                      migrated = true;
                  }
                  if (migrated) persistPresets();
              } catch (error) {
                  presets = Object.create(null);
                  showNotificationMessage('Saved presets could not be loaded: ' + error.message, 5000);
              }
          })();

          function persistPresets() {
              try {
                  const entries = Object.keys(presets).map((name) => ({ name, settings: presets[name] }));
                  localStorage.setItem(PRESET_KEY, JSON.stringify(entries));
              } catch (error) {
                  showNotificationMessage('Presets could not be saved: ' + error.message, 5000);
              }
          }

          /* ================================================================ *
           *  MACHINE PRESET MEMORY — 80 Deepseek presets, ROLLED FRESH on    *
           *  every page load / refresh. Names mint from the Font Burn Codex  *
           *  (BURN_WORDS) plus HTML ids / title / JS effect names, with a    *
           *  light 1337 encoding. Values, Ghost, V-Sync, Warp and automation *
           *  are random each boot. Deepseek-1 always keeps a quiet 'OLD SOUL'*
           *  seed so the board still has a known home.                       *
           * ================================================================ */
          function mulberry32(a) {
              return function() {
                  let t = a += 0x6D2B79F5;
                  t = Math.imul(t ^ t >>> 15, t | 1);
                  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                  return ((t ^ t >>> 14) >>> 0) / 4294967296;
              };
          }
          function leetEncodeWord(word) {
              return String(word).toUpperCase()
                  .replace(/A/g, '4').replace(/E/g, '3').replace(/I/g, '1')
                  .replace(/O/g, '0').replace(/S/g, '5');
          }
          /* Frozen 4.0 baseline: live DOM ids and the title are not read, so new
             markup (such as ghostLink) cannot reshuffle the 80 MACHINE names. */
          const MACHINE_NAME_DOM_IDS = [
              'windowDrag', 'windowControls', 'windowShield', 'windowResize', 'welcomeScreen', 'welcomeAudioTypes',
              'welcomeVideoTypes', 'welcomeEnterBtn', 'moon-veil', 'rev3-mark', 'effects-wrapper', 'localArt',
              'video', 'localAudio', 'ytWarpShell', 'ytFrame', 'ytPlayerMount', 'glitchCanvas',
              'wired-btn', 'nowPlayingHud', 'npHudToggle', 'npHudPanel', 'npThumb', 'npTitle',
              'npAuthor', 'npProvider', 'npTime', 'npFlags', 'npLink', 'earHud',
              'earHudMode', 'earHudPhase', 'earMeterLevel', 'earMeterBass', 'earMeterMid', 'earMeterTreb',
              'earMeterBuild', 'earHudSrc', 'rightRack', 'autoGlitchBtn', 'randomizeBtn', 'continualRandomizeBtn',
              'aiWarpBtn', 'automatedMastersBtn', 'zeroAllBtn', 'ghostBtnRack', 'ghostProtocolBtn', 'vsyncScanBtn',
              'softEyeBtn', 'hardLightBtn', 'earBtn', 'freezeFrameBtn', 'sliderContainer', 'ghostProtocolSlider',
              'vsyncScanLabel', 'vsyncScanSlider', 'vsyncLockBtn', 'randomSeedSlider', 'sourceScreen', 'sourceHeading',
              'sourceHint', 'ytInput', 'startBtn', 'ytLinkTreeHeading', 'ytLinkTree', 'suggestedVideo',
              'suggestedVideo3', 'suggestedVideo2', 'suggestedYoutube', 'suggestedPlaylist', 'suggestedMoonlight', 'suggestedFractals',
              'suggestedNightCity', 'testCanvas', 'suggestedDarksynth', 'Defcon1Video', 'openFileWrap', 'openFileBtn',
              'fileInput', 'preset-toggle-btn', 'preset-dropdown-container', 'presetCloseZone', 'glyph-bank', 'glyph-info',
              'current-preset-display', 'presetSelect', 'presetListToggleBtn', 'presetLabBtn', 'presetAutoBtn', 'presetNameInput',
              'presetSaveBtn', 'presetDeleteBtn', 'presetDeleteAllBtn', 'presetImportBtn', 'presetExportBtn', 'presetImportInput',
              'presetPrevBtn', 'presetNextBtn', 'ui-toggle-tab', 'toggle-ui-btn', 'ai-warp-filter', 'ai-turbulence',
              'ai-displacement', 'ai-color-matrix', 'vsync-hue-ghost-filter', 'vsync-ghost-hue', 'vsync-ghost-saturate', 'vsync-ghost-sharpen'
          ];
          const MACHINE_NAME_TITLE = 'Standalone Revision R Final 4.1 \u2014 Glitch Canvas';
          function harvestNameCodex() {
              const bag = [];
              const add = (s) => {
                  if (!s) return;
                  String(s).split(/[^A-Za-z0-9]+/).forEach((p) => {
                      if (p.length >= 3 && p.length <= 16) bag.push(p.toUpperCase());
                  });
              };
              if (typeof GHOST_KEY_PHRASES !== 'undefined') GHOST_KEY_PHRASES.forEach(add);
              if (typeof GHOST_KEY_STANZAS !== 'undefined') GHOST_KEY_STANZAS.forEach(add);
              if (typeof BURN_WORDS !== 'undefined') BURN_WORDS.forEach(add);
              profileNames.forEach(add);
              ['RIVER', 'GLITCH', 'CANVAS', 'DEEPSEEK', 'WIRED', 'DEFCON', 'GHOST',
                  'VSYNC', 'WARP', 'FADE', 'WHITE', 'BLACK', 'PROTOCOL', 'MACHINE',
                  'PRESET', 'SPECTRUM', 'PLASMA', 'CRT', 'INVERT', 'EMISSION', 'DIA',
                  'HUE', 'LOOP', 'CODEX', 'FONTBURN', '006', 'IMORTAL', 'REVISION',
                  'NEON', 'PHOSPHOR', 'PRISM', 'VOID', 'SIGNAL', 'TAPE', 'AURORA',
                  'MATRIX', 'CHORD', 'TYPESET', 'KATAKANA', 'CYRILLIC', 'HANZI', 'RAIN'
              ].forEach(add);
              MACHINE_NAME_DOM_IDS.forEach(add);
              add(MACHINE_NAME_TITLE);
              const seen = Object.create(null);
              const out = [];
              for (let i = 0; i < bag.length; i++) {
                  if (!seen[bag[i]]) { seen[bag[i]] = 1; out.push(bag[i]); }
              }
              return out;
          }
          function mintPresetTag(rng, codex, used) {
              const pick = () => codex[(rng() * codex.length) | 0] || 'SIGNAL';
              for (let n = 0; n < 24; n++) {
                  const a = pick(), b = pick();
                  const forms = [
                      a + ' ' + b,
                      leetEncodeWord(a) + ' ' + b,
                      a + '-' + b,
                      '006 ' + a,
                      a + ' ' + leetEncodeWord(b),
                      b + ' ' + a,
                      a + ' CODEX',
                      'DIA ' + a,
                      'GHOST ' + a,
                      a + ' SHELL',
                      'REBIRTH ' + b,
                      'f34R ' + a
                  ];
                  let tag = forms[(rng() * forms.length) | 0];
                  if (tag.length > 28) tag = (a + ' ' + b).slice(0, 28);
                  if (!used[tag] && a !== b) { used[tag] = 1; return tag; }
              }
              const fallback = 'SEED ' + ((rng() * 0xFFFF) | 0).toString(16).toUpperCase();
              used[fallback] = 1;
              return fallback;
          }
          function randBwLevel(rng) {
              const roll = rng();
              if (roll < 0.22) return 0;
              if (roll < 0.48) return 0.50;
              if (roll < 0.82) return 0.75; /* negative light emission landmark */
              return 1.0;
          }
          /* A new seed on every start and Refresh, so the MACHINE bank is different each session. */
          function freshMachineSeed() {
              try {
                  const words = new Uint32Array(1);
                  window.crypto.getRandomValues(words);
                  if (words[0]) return words[0];
              } catch (e) { /* fall through to the key seed */ }
              return ((typeof GHOST_KEY_SEED === 'number' ? GHOST_KEY_SEED : 0xF34D07) >>> 0) || 1;
          }
          /* Keeps generated light calm and coherent: Flash/Strobe stay under their caps
             and never peak together; one lead voice carries the colour. */
          function balanceMachineLight(alphas, rng) {
              alphas['Flash'] = +Math.min(alphas['Flash'] || 0, LIGHT_CEILING.Flash * (0.35 + rng() * 0.65)).toFixed(3);
              alphas['Strobe'] = +Math.min(alphas['Strobe'] || 0, LIGHT_CEILING.Strobe * (0.35 + rng() * 0.65)).toFixed(3);
              if (alphas['Flash'] > 0.5 * LIGHT_CEILING.Flash && alphas['Strobe'] > 0.5 * LIGHT_CEILING.Strobe) {
                  alphas[rng() < 0.5 ? 'Flash' : 'Strobe'] = 0;
              }
          }
          function buildMachinePresets(seedOverride) {
              const FX = ['ASCII', 'B&W Invert', 'Data Bands', 'Data Bomb', 'Flash', 'Font Burn',
                  'Gemini Bomb', 'HSL Rainbow', 'Hue/Color Cycle', 'Ink Glyphs', 'Matrix ASCII', 'Matrix Chord',
                  'Neon Grad', 'Scanlines', 'Strobe', 'Tech Artist', 'VHS Glitch'
              ];
              const GHOST_MODES = (window.GlitchEngine && GlitchEngine.GHOST_MODES)
                  ? GlitchEngine.GHOST_MODES.slice()
                  : ['OFF', 'DIA', 'SPECTRUM', 'CRT', 'PLASMA', 'LED'];
              const VSYNC_MODES = ['OFF', 'ON', 'GHOST_OFF', 'FULL'];
              /* R4.1.3 PRESET DETERMINATION: the deck is fully determined by one
                 seed — pass it back in to rebuild the exact same 80 presets.
                 Without an override every start and Refresh rolls fresh. */
              const seed = (seedOverride >>> 0) || freshMachineSeed();
              buildMachinePresets.lastSeed = seed;
              try { console.info('[MACHINE] deck seed ' + seed + ' — reproducible via buildMachinePresets(seed)'); } catch (e) {}
              const rng = mulberry32(seed);
              const codex = harvestNameCodex();
              const usedTags = Object.create(null);
              const DEFAULT_MASTERS = {
                  effectIntensity: 0.88, motionScale: 0.80, blendSoftness: 0.50,
                  continualSpeed: 0.85, autoGlitchPower: 0.75, boardEnergy: 0.65
              };
              const out = {};
              for (let i = 0; i < 80; i++) {
                  const name = 'Deepseek-' + (i + 1);
                  const tag = (i === 0) ? 'OLD SOUL' : mintPresetTag(rng, codex, usedTags);
                  const personality = rng();
                  const alphas = {};
                  FX.forEach((fx) => { alphas[fx] = 0; });
                  if (i === 0) {
                      alphas['Neon Grad'] = 0.20; alphas['Scanlines'] = 0.16;
                      alphas['Flash'] = 0.32; alphas['HSL Rainbow'] = 0.24;
                      alphas['ASCII'] = 0.28; alphas['Font Burn'] = 0.40;
                      alphas['Strobe'] = 0.40; alphas['Gemini Bomb'] = 0.36;
                      alphas['Tech Artist'] = 0.20; alphas['B&W Invert'] = 0;
                  } else {
                      const voiceCount = 2 + ((rng() * (personality > 0.78 ? 10 : 6)) | 0);
                      const shuffled = FX.slice().sort(() => rng() - 0.5);
                      for (let v = 0; v < voiceCount; v++) {
                          const fx = shuffled[v];
                          if (fx === 'B&W Invert') alphas[fx] = randBwLevel(rng);
                          else alphas[fx] = +((0.08 + rng() * 0.84) * (personality > 0.55 ? 1 : 0.7)).toFixed(3);
                      }
                      if (rng() < 0.45) alphas['B&W Invert'] = randBwLevel(rng);
                  }
                  const gm = (i === 0) ? 'OFF' : GHOST_MODES[(rng() * GHOST_MODES.length) | 0];
                  if (i !== 0) balanceMachineLight(alphas, rng);
                  if (i !== 0) {
                      const gp = (window.GlitchEngine && GlitchEngine.ghostProfile)
                          ? GlitchEngine.ghostProfile(gm) : { realm: 'mix' };
                      const chroma = ['Hue/Color Cycle', 'HSL Rainbow', 'Neon Grad'];
                      let lead = null;
                      chroma.forEach((fx) => {
                          if (!(alphas[fx] > 0.04)) return;
                          if (gp.realm === 'reality') alphas[fx] = Math.min(alphas[fx], 0.48);
                          if (gp.realm === 'virtual') alphas[fx] = Math.max(alphas[fx], 0.22);
                          if (lead == null) lead = alphas[fx];
                          else alphas[fx] = +((alphas[fx] * 0.42 + lead * 0.58).toFixed(3));
                      });
                      if (lead != null && rng() < 0.55) {
                          chroma.forEach((fx) => {
                              if (!(alphas[fx] > 0.04)) {
                                  alphas[fx] = +(Math.max(0.08, lead * (0.55 + rng() * 0.35)).toFixed(3));
                              }
                          });
                      }
                  }
                  const vm = (i === 0) ? 'OFF' : VSYNC_MODES[(rng() * VSYNC_MODES.length) | 0];
                  const gl = gm === 'OFF' ? 0 : +(0.2 + rng() * 0.75).toFixed(3);
                  const vl = vm === 'OFF' ? 0 : +(0.25 + rng() * 0.7).toFixed(3);
                  const warp = i !== 0 && rng() < 0.22 ? 1 : 0;
                  const ag = i !== 0 && rng() < 0.32 ? 1 : 0;
                  const cr = i === 0 ? 0 : (rng() < 0.55 ? 1 : 0);
                  const am = i !== 0 && rng() < 0.28 ? 1 : 0;
                  const lockMap = {};
                  if (i !== 0 && rng() < 0.18) {
                      const lk = FX[(rng() * FX.length) | 0];
                      if (alphas[lk] > 0.15) lockMap[lk] = true;
                  }
                  const masterMix = Object.assign({}, DEFAULT_MASTERS);
                  if (i !== 0) {
                      masterMix.effectIntensity = +(0.55 + rng() * 0.45).toFixed(3);
                      masterMix.motionScale = +(0.45 + rng() * 0.55).toFixed(3);
                      masterMix.blendSoftness = +(0.25 + rng() * 0.7).toFixed(3);
                      masterMix.continualSpeed = +(0.4 + rng() * 0.6).toFixed(3);
                      masterMix.autoGlitchPower = +(0.4 + rng() * 0.6).toFixed(3);
                      masterMix.boardEnergy = +(0.35 + rng() * 0.65).toFixed(3);
                  }
                  out[name] = {
                      machine: true,
                      tag: tag,
                      seed: seed,
                      alphas: alphas,
                      masterOpacity: i === 0 ? 0.92 : +(0.62 + rng() * 0.38).toFixed(3),
                      ghostLevel: gl,
                      ghostMode: gm,
                      vsyncMode: vm,
                      aiWarp: !!warp,
                      vsyncLevels: {
                          ON: vm === 'ON' ? vl : 0.55,
                          GHOST_OFF: vm === 'GHOST_OFF' ? vl : 0.6,
                          FULL: vm === 'FULL' ? vl : 0.65
                      },
                      masterControls: masterMix,
                      locks: lockMap,
                      toggles: {
                          autoGlitch: !!ag,
                          continualRandomize: !!cr,
                          aiWarp: !!warp,
                          automatedMasters: !!am
                      }
                  };
              }
              return out;
          }
          const LAB_EFFECT_ALIASES = Object.freeze({
              'Scanlines': 'Rolling Scan',
              'Data Bands': 'Tape Grain',
              'VHS Glitch': 'Tracking Tear'
          });

          function normalizePresetSettings(settings) {
              if (!isPlainRecord(settings)) return null;
              const rawEffects = isPlainRecord(settings.effects) ? settings.effects :
                  (isPlainRecord(settings.alphas) ? settings.alphas : {});
              const alphas = {};
              profileNames.forEach((name) => {
                  const value = rawEffects[name];
                  alphas[name] = Number.isFinite(value) ? clamp01(value) : 0;
              });
              const toggles = isPlainRecord(settings.toggles) ? settings.toggles : {};
              const masterControlValues = {};
              if (isPlainRecord(settings.masterControls)) {
                  MASTER_KEYS.forEach((key) => {
                      const value = settings.masterControls[key];
                      if (Number.isFinite(value)) masterControlValues[key] = clamp01(value);
                  });
              }
              const vsyncLevels = {};
              if (isPlainRecord(settings.vsyncLevels)) {
                  ['ON', 'GHOST_OFF', 'FULL'].forEach((mode) => {
                      const value = settings.vsyncLevels[mode];
                      if (Number.isFinite(value)) vsyncLevels[mode] = clamp01(value);
                  });
              }
              const locks = {};
              const rawLocks = isPlainRecord(settings.locks) ? settings.locks :
                  (isPlainRecord(settings.sliderLocks) ? settings.sliderLocks : {});
              Object.keys(sliderLocks).forEach((key) => {
                  if (typeof rawLocks[key] === 'boolean') locks[key] = rawLocks[key];
              });
              /* AI WARP masters: B&W Strength + Hue Offset only (Milkdrop state
                 and FX scope are session controls, never preset data). */
              const rawVoiceFx = isPlainRecord(settings.voiceFx) ? settings.voiceFx :
                  (isPlainRecord(settings.voiceFxSettings) ? settings.voiceFxSettings : null);
              let voiceFx;
              if (rawVoiceFx) {
                  const vf = {};
                  if (Number.isFinite(rawVoiceFx.bwInvert)) vf.bwInvert = clamp01(rawVoiceFx.bwInvert);
                  if (Number.isFinite(rawVoiceFx.hueOffset)) vf.hueOffset = normalizeHueOffset(rawVoiceFx.hueOffset);
                  if (Object.keys(vf).length) voiceFx = Object.freeze(vf);
              }
              return {
                  alphas,
                  voiceFx,
                  masterOpacity: Number.isFinite(settings.masterOpacity) ? clamp01(settings.masterOpacity) : masterOpacity,
                  ghostLevel: Number.isFinite(settings.ghostLevel) ? clamp01(settings.ghostLevel) : undefined,
                  ghostMode: typeof settings.ghostMode === 'string' ? settings.ghostMode : undefined,
                  vsyncMode: typeof settings.vsyncMode === 'string' ? settings.vsyncMode : undefined,
                  vsyncLevels,
                  aiWarp: typeof settings.aiWarp === 'boolean' ? settings.aiWarp :
                      (typeof settings.isAiWarpActive === 'boolean' ? settings.isAiWarpActive : undefined),
                  masterControls: masterControlValues,
                  locks,
                  glyphBank: typeof settings.glyphBank === 'string' ? settings.glyphBank : undefined,
                  toggles: {
                      autoGlitch: typeof toggles.autoGlitch === 'boolean' ? toggles.autoGlitch :
                          !!settings.isAutoGlitching,
                      continualRandomize: typeof toggles.continualRandomize === 'boolean' ?
                          toggles.continualRandomize : !!settings.isContinuallyRandomizing,
                      aiWarp: typeof toggles.aiWarp === 'boolean' ? toggles.aiWarp :
                          (typeof settings.isAiWarpActive === 'boolean' ? settings.isAiWarpActive : undefined),
                      automatedMasters: typeof toggles.automatedMasters === 'boolean' ?
                          toggles.automatedMasters : !!settings.isAutomatedMastersActive
                  }
              };
          }

          function mapLabSnapshot(settings) {
              const normalized = normalizePresetSettings(settings);
              if (!normalized) throw new TypeError('A LAB snapshot has an invalid settings record.');
              const alphas = {};
              profileNames.forEach((name) => { alphas[name] = 0; });
              Object.keys(settings.effects || {}).forEach((sourceName) => {
                  const targetName = LAB_EFFECT_ALIASES[sourceName] || sourceName;
                  if (Object.prototype.hasOwnProperty.call(alphas, targetName)) {
                      const value = settings.effects[sourceName];
                      if (Number.isFinite(value)) alphas[targetName] = clamp01(alphas[targetName] + value);
                  }
              });
              normalized.alphas = alphas;
              return Object.freeze(normalized);
          }

          if (!Array.isArray(window.GlitchMachinePresets) || window.GlitchMachinePresets.length !== 250) {
              throw new Error('The immutable LAB preset bank must contain exactly 250 snapshots.');
          }
          const labPresets = Object.create(null);
          window.GlitchMachinePresets.forEach((preset) => {
              if (!preset || typeof preset.id !== 'string' || typeof preset.name !== 'string') {
                  throw new TypeError('The immutable LAB preset bank contains an invalid entry.');
              }
              labPresets[preset.id] = Object.freeze({
                  name: preset.name,
                  tag: 'LAB',
                  settings: mapLabSnapshot(preset.settings)
              });
          });
          Object.freeze(labPresets);

          /* MACHINE = the Deepseek-1…80 bank, minted from a fresh random seed on every
             start and Refresh. Entries are plain (unfrozen) objects; applying one copies
             it, and saving always writes a USER preset. Deepseek-1 (OLD SOUL) keeps its
             3.0 values; every light is capped when applied. */
          const machinePresets = Object.create(null);
          (function buildDeepseekBank() {
              const raw = buildMachinePresets();
              Object.keys(raw).forEach((name) => {
                  const entry = raw[name];
                  const settings = normalizePresetSettings(entry);
                  if (!settings) throw new TypeError('The Deepseek MACHINE bank produced an invalid snapshot.');
                  machinePresets[name] = {
                      tag: entry.tag,
                      settings: settings
                  };
              });
          })();
          const PRESET_LISTS = Object.freeze(['user', 'machine', 'lab']);
          const PRESET_LIST_LABELS = Object.freeze({ user: 'USER', machine: 'MACHINE', lab: 'LAB 250' });

          /* User presets are separate from the immutable MACHINE and LAB banks. */
          let presetListMode = 'lab';
          const presetListToggleBtn = $('presetListToggleBtn');
          const presetAutoBtn = $('presetAutoBtn');

          function captureSettings() {
              const effects = {};
              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  /* While the switch is ON a light's slider moves with its wander;
                     save the level the user set instead. */
                  effects[name] = (isManualLight(name) && lightAutomationOn) ?
                      (lightStored[name] || 0) : (effectAlphas[name] || 0);
              }
              const vsyncLevels = {};
              ['ON', 'GHOST_OFF', 'FULL'].forEach((m) => {
                  vsyncLevels[m] = vsyncScripts[m] ? vsyncScripts[m].level : 0.6;
              });
              return {
                  version: 3,
                  masterOpacity,
                  effects,
                  isAutoGlitching,
                  isContinuallyRandomizing,
                  isAiWarpActive,
                  isAutomatedMastersActive: isAutomatedMasters,
                  sliderLocks: { ...sliderLocks },
                  glyphBank: window.SignalGlyphs ? window.SignalGlyphs.current : 'Engine realms (Revision 3)',
                  ghostLevel,
                  ghostMode: getGhostMode(),
                  vsyncMode: getVsyncMode(),
                  vsyncLevels,
                  masterControls: { ...masterControls },
                  voiceFx: { bwInvert: voiceFxSettings.bwInvert, hueOffset: voiceFxSettings.hueOffset },
                  toggles: {
                      autoGlitch: isAutoGlitching,
                      continualRandomize: isContinuallyRandomizing,
                      aiWarp: isAiWarpActive,
                      automatedMasters: isAutomatedMasters
                  }
              };
          }

          const presetTravel = {
              active: false, start: 0, dur: 920,
              fromA: {}, toA: {}, fromOp: 0, toOp: 0
          };

          function beginAlphaTravel(toAlphas, toOp, dur) {
              const fromA = {};
              for (let i = 0; i < profileNames.length; i++) {
                  const n = profileNames[i];
                  fromA[n] = effectAlphas[n] || 0;
              }
              presetTravel.active = true;
              presetTravel.start = performance.now();
              presetTravel.dur = Math.max(280, dur || 920);
              presetTravel.fromA = fromA;
              presetTravel.toA = toAlphas || {};
              presetTravel.fromOp = masterOpacity;
              presetTravel.toOp = (toOp !== undefined && toOp !== null) ? toOp : masterOpacity;
              for (let i = 0; i < profileNames.length; i++) {
                  const n = profileNames[i];
                  if (presetTravel.toA[n] !== undefined) randomTargets[n] = presetTravel.toA[n];
              }
              randomTargets.global = presetTravel.toOp;
          }

          function stepPresetTravel(now) {
              if (!presetTravel.active) return false;
              const u = clamp01((now - presetTravel.start) / presetTravel.dur);
              const k = easeInOutCubic(u);
              for (let i = 0; i < profileNames.length; i++) {
                  const n = profileNames[i];
                  const to = presetTravel.toA[n];
                  if (to === undefined) continue;
                  if (isManualLight(n) || (sliderLocks[n] && !presetLockKeys.has(n))) continue;
                  const v = presetTravel.fromA[n] + (to - presetTravel.fromA[n]) * k;
                  effectAlphas[n] = v;
                  randomTargets[n] = to;
                  const el = sliderElements[n];
                  if (el && (sliderWritten[n] === undefined || Math.abs(v - sliderWritten[n]) > 0.006)) {
                      sliderWritten[n] = v;
                      el.value = v.toFixed(3);
                  }
              }
              const globalHeld = sliderLocks.global && !presetLockKeys.has('global');
              const op = globalHeld ? masterOpacity : presetTravel.fromOp + (presetTravel.toOp - presetTravel.fromOp) * k;
              masterOpacity = op;
              if (presetTravel.toG !== undefined && presetTravel.toG !== null) {   /* R2: ghost glide */
                  ghostLevel = presetTravel.fromG + (presetTravel.toG - presetTravel.fromG) * k;
                  if (ghostProtocolSlider && document.activeElement !== ghostProtocolSlider) ghostProtocolSlider.value = ghostLevel.toFixed(3);
                  if (u >= 1) { presetTravel.toG = null; if (typeof updateGhostUi === 'function') updateGhostUi(); }
              }
              if (!globalHeld) randomTargets.global = presetTravel.toOp;
              if (globalSliderEl && (sliderWritten.global === undefined || Math.abs(op - sliderWritten.global) > 0.006)) {
                  sliderWritten.global = op;
                  globalSliderEl.value = op.toFixed(3);
              }
              if (u >= 1) presetTravel.active = false;
              return true;
          }

          function applySettings(s) {
              if (!s) return;
              /* v11: presets own every unlocked control; toggle side-effects can
                 no longer overwrite the preset's saved levels, and turning a
                 saved automation OFF never zeroes anything (only ZERO ALL parks).
                 Locks the previous preset switched on are released first (no
                 leakage between presets). Locks the user set by hand are hard
                 (AI WARP parity): that voice, global opacity, master or V-Sync
                 keeps its level through the preset and its glide. */
              presetLockKeys.forEach((key) => { sliderLocks[key] = false; });
              presetLockKeys.clear();
              const held = (key) => !!sliderLocks[key];
              const travelTo = {};
              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  if (isManualLight(name) || held(name)) continue;
                  const v = s.alphas && s.alphas[name] !== undefined ? s.alphas[name] : 0;
                  travelTo[name] = v;
                  randomTargets[name] = v;
                  /* R1: parked snapshot — CR only animates sliders the preset
                     turned on. R4.1.3: a preset is user intent — it determines
                     exactly which voices are awake and which stay cancelled. */
                  crParked[name] = v < PARKED_EFFECT_EPSILON;
                  setEffectCancelled(name, v < PARKED_EFFECT_EPSILON);
              }
              /* R2 SOFT-EYE: gradual preset changes — 3.4–5.4 s glides when
                 calm, 1.3–2.0 s inside a crescendo (was a fixed 0.96 s) */
              {
                  const tr = softWild() ? GlitchEngine.SOFT_EYE.pace.presetTravelWildMs : GlitchEngine.SOFT_EYE.pace.presetTravelMs;
                  beginAlphaTravel(travelTo, held('global') ? masterOpacity : s.masterOpacity,
                      tr[0] + Math.random() * (tr[1] - tr[0]));
              }
              if (s.ghostLevel !== undefined) {
                  /* R2: the ghost level glides with the preset instead of jumping */
                  presetTravel.fromG = ghostLevel;
                  presetTravel.toG = s.ghostLevel;
                  ghostRandomTarget = s.ghostLevel;
              }
              if (s.ghostMode !== undefined) {
                  const idx = ghostModes.indexOf(s.ghostMode);
                  if (idx >= 0) ghostModeIndex = idx;
              }
              if (!held('vsync') && s.vsyncMode !== undefined) {
                  const idx = vsyncModes.indexOf(s.vsyncMode);
                  if (idx >= 0) vsyncModeIndex = idx;
              }
              if (!held('vsync') && s.vsyncLevels) {
                  ['ON', 'GHOST_OFF', 'FULL'].forEach((m) => {
                      if (s.vsyncLevels[m] !== undefined && vsyncScripts[m]) {
                          vsyncScripts[m].level = s.vsyncLevels[m];
                          vsyncScripts[m].target = s.vsyncLevels[m];
                      }
                  });
              }
              if (s.aiWarp !== undefined) {
                  isAiWarpActive = s.aiWarp;
                  const warpBtn = $('aiWarpBtn');
                  if (warpBtn) warpBtn.textContent = 'AI Video Warp: ' + (isAiWarpActive ? 'ON' : 'OFF');
              }
              if (s.masterControls) {
                  MASTER_KEYS.forEach((k) => {
                      if (s.masterControls[k] !== undefined && !held('master:' + k)) {
                          masterControls[k] = s.masterControls[k];
                          masterTargets[k] = masterControls[k];
                          if (window.__masterSliderEls && window.__masterSliderEls[k]) {
                              const el = window.__masterSliderEls[k];
                              el.slider.value = masterControls[k].toFixed(3);
                              el.read.textContent = Math.round(masterControls[k] * 100) + '%';
                          }
                      }
                  });
              }
              /* AI WARP master locks are hard: presets never move a locked master. */
              if (s.voiceFx) {
                  let changed = false;
                  if (s.voiceFx.bwInvert !== undefined && !voiceFxLocks.bwInvert) {
                      voiceFxSettings.bwInvert = clamp01(s.voiceFx.bwInvert);
                      changed = true;
                  }
                  if (s.voiceFx.hueOffset !== undefined && !voiceFxLocks.hueOffset) {
                      voiceFxSettings.hueOffset = normalizeHueOffset(s.voiceFx.hueOffset);
                      changed = true;
                  }
                  if (changed) {
                      syncAiWarpMastersUi();
                      saveVoiceFxControls();
                  }
              }
              /* Presets set capped Flash and Strobe levels before their own locks apply,
                 so only a hand lock keeps a light where it is. */
              ['Flash', 'Strobe'].forEach((name) => {
                  if (sliderLocks[name]) return;
                  setLightLevelNow(name, s.alphas && s.alphas[name] !== undefined ? s.alphas[name] : 0);
              });
              if (s.locks) {
                  for (const key in s.locks) {
                      if (s.locks.hasOwnProperty(key) && s.locks[key] && !sliderLocks[key]) {
                          sliderLocks[key] = true;
                          presetLockKeys.add(key);
                      }
                  }
              }
              if (s.glyphBank && window.SignalGlyphs) {
                  window.SignalGlyphs.set(s.glyphBank);
              }
              if (s.toggles) {
                  if (s.toggles.autoGlitch !== undefined) {
                      isAutoGlitching = s.toggles.autoGlitch;
                      const btn = $('autoGlitchBtn');
                      if (btn) btn.textContent = 'Auto Glitch: ' + (isAutoGlitching ? 'ON' : 'OFF');
                      if (isAutoGlitching) {
                          nextUnparkAt = performance.now() + 1000 + Math.random() * 2000;
                      } else {
                          nextUnparkAt = 0;
                          /* v11: AG OFF parks nothing — levels hold where they are */
                      }
                      autoGlitchStep(performance.now(), 0);
                  }
                  if (s.toggles.continualRandomize !== undefined) {
                      isContinuallyRandomizing = s.toggles.continualRandomize;
                      const btn = $('continualRandomizeBtn');
                      if (btn) btn.textContent = 'Continual Randomization: ' + (isContinuallyRandomizing ? 'ON' : 'OFF');
                      if (isContinuallyRandomizing) {
                          retargetRandomization(performance.now());
                      } else {
                          /* v11: CR OFF freezes targets — never parks, never zeroes */
                          for (let i = 0; i < profileNames.length; i++) {
                              const name = profileNames[i];
                              randomTargets[name] = effectAlphas[name] || 0;
                          }
                          randomTargets.global = masterOpacity;
                      }
                  }
                  if (s.toggles.automatedMasters !== undefined) {
                      isAutomatedMasters = s.toggles.automatedMasters;
                      const btn = $('automatedMastersBtn');
                      if (btn) {
                          btn.textContent = 'Automated Masters: ' + (isAutomatedMasters ? 'ON' : 'OFF');
                          btn.classList.toggle('active', isAutomatedMasters);
                      }
                      if (isAutomatedMasters) {
                          retargetMasters(performance.now());
                      } else {
                          MASTER_KEYS.forEach((k) => { masterTargets[k] = masterControls[k]; });
                      }
                  }
              }
              /* preset destination always wins the TARGETS; alphas ease via presetTravel */
              if (s.alphas) {
                  for (let i = 0; i < profileNames.length; i++) {
                      const name = profileNames[i];
                      if (s.alphas[name] !== undefined && travelTo[name] !== undefined) {
                          randomTargets[name] = s.alphas[name];
                          if (presetTravel.toA) presetTravel.toA[name] = s.alphas[name];
                      }
                  }
              }
              if (s.masterOpacity !== undefined && !(sliderLocks.global && !presetLockKeys.has('global'))) {
                  randomTargets.global = s.masterOpacity;
                  presetTravel.toOp = s.masterOpacity;
              }
              /* Refresh every lock button visual from the freshly applied lock state */
              function syncLockButton(container, locked) {
                  if (!container) return;
                  const lockBtn = container.querySelector('.lock-button');
                  if (lockBtn) {
                      lockBtn.classList.toggle('locked', !!locked);
                      lockBtn.textContent = locked ? '[LOCKED!]' : '<LOCK!>';
                  }
              }
              if (globalSliderEl) {
                  syncLockButton(globalSliderEl.closest('.slider-group'), sliderLocks.global);
              }
              for (const name of profileNames) {
                  if (sliderElements[name]) {
                      syncLockButton(sliderElements[name].closest('.slider-group'), sliderLocks[name]);
                  }
              }
              for (const k of MASTER_KEYS) {
                  const key = 'master:' + k;
                  if (window.__masterSliderEls && window.__masterSliderEls[k]) {
                      const parent = window.__masterSliderEls[k].slider.closest('.slider-group');
                      syncLockButton(parent, sliderLocks[key]);
                      window.__masterSliderEls[k].slider.disabled = !!sliderLocks[key];
                  }
              }
              if (vsyncLockBtn) {
                  vsyncLockBtn.classList.toggle('locked', !!sliderLocks.vsync);
                  vsyncLockBtn.textContent = sliderLocks.vsync ? '[LOCKED!]' : '<LOCK!>';
              }
              if (isAiWarpActive) updateAiWarp(performance.now());
              updateGhostUi();
              updateVsyncUi();
              updateContinuousEffectsCache();
          }

          /* === PRESET BROWSER UI — FIXED === */
          const presetSelect = $('presetSelect');
          const presetNameInput = $('presetNameInput');
          const presetSaveBtn = $('presetSaveBtn');
          const presetDeleteBtn = $('presetDeleteBtn');
          const presetDeleteAllBtn = $('presetDeleteAllBtn');
          const presetPrevBtn = $('presetPrevBtn');
          const presetNextBtn = $('presetNextBtn');
          const presetLabBtn = $('presetLabBtn');
          const presetImportBtn = $('presetImportBtn');
          const presetImportInput = $('presetImportInput');
          const presetExportBtn = $('presetExportBtn');
          const currentPresetDisplay = $('current-preset-display');
          let presetOrder = [];

          /* v11: the preset list field shows whichever list memory is active.
             'user' = browser-saved presets (blank by default), 'machine' =
             code-generated Deepseek-1…80. The field is tinted 40% opaque with
             the active list's colors (purple-violet / orange-yellow). */
          function refreshPresetList() {
              const store = getActivePresetStore();
              presetOrder = Object.keys(store);
              if (presetSelect) {
                  while (presetSelect.firstChild) presetSelect.removeChild(presetSelect.firstChild);
                  if (!presetOrder.length) {
                      const opt = document.createElement('option');
                      opt.value = '';
                      opt.textContent = presetListMode === 'user' ? '— USER memory empty —' :
                          (presetListMode === 'machine' ? '— MACHINE bank empty —' : '— LAB snapshot bank empty —');
                      opt.disabled = true;
                      presetSelect.appendChild(opt);
                  } else {
                      presetOrder.forEach((name) => {
                          const opt = document.createElement('option');
                          opt.value = name;
                          const p = store[name];
                          opt.textContent = (p && p.name) ? (name + ' · ' + p.name) :
                              ((p && p.tag) ? (name + ' · ' + p.tag) : name);
                          presetSelect.appendChild(opt);
                      });
                  }
              }
          }

          function applyPresetListSkin() {
              const mode = presetListMode;
              const user = mode === 'user';
              if (presetListToggleBtn) {
                  presetListToggleBtn.textContent = PRESET_LIST_LABELS[mode];
                  presetListToggleBtn.title = 'Preset list: ' + PRESET_LIST_LABELS[mode] +
                      ' — click to cycle USER → MACHINE → LAB 250';
                  PRESET_LISTS.forEach((m) => presetListToggleBtn.classList.toggle('list-' + m, m === mode));
              }
              if (presetSelect) {
                  PRESET_LISTS.forEach((m) => presetSelect.classList.toggle('list-' + m, m === mode));
                  presetSelect.title = user ?
                      'USER preset memory — saved in this browser (purple-violet)' :
                      (mode === 'machine' ?
                          'MACHINE preset memory — code-generated Deepseek-1…80, immutable (orange-yellow)' :
                          'LAB preset memory — 250 immutable built-in snapshots (cyan)');
              }
              if (presetLabBtn) presetLabBtn.classList.toggle('active', mode === 'lab');
              if (presetDeleteBtn) presetDeleteBtn.classList.toggle('preset-machine-locked', !user);
              if (presetDeleteAllBtn) presetDeleteAllBtn.classList.toggle('preset-machine-locked', !user);
          }

          function setPresetListMode(mode) {
              presetListMode = PRESET_LISTS.indexOf(mode) >= 0 ? mode : 'lab';
              applyPresetListSkin();
              refreshPresetList();
              setCurrentPresetDisplay('PRESET MEMORY: ' + (presetListMode === 'user' ? 'USER (browser-saved)' :
                  (presetListMode === 'machine' ? 'MACHINE (Deepseek-1…80)' : 'LAB (250 immutable snapshots)')));
          }

          function getActivePresetStore() {
              if (presetListMode === 'user') return presets;
              return presetListMode === 'machine' ? machinePresets : labPresets;
          }

          function setCurrentPresetDisplay(text) {
              if (currentPresetDisplay) currentPresetDisplay.textContent = text;
          }

          /* v10: single source of truth for the preset browser state.
             Fixes the "won't close on second click" class of bugs: the class, the
             button label and aria state can no longer desync, the panel closes on
             outside clicks, on Escape, on the top close strip, and whenever the
             control UI is hidden. */
          let presetBrowserOpen = false;

          function setPresetBrowserOpen(open) {
              if (!presetDropdown || !presetToggleBtn) return;
              open = !!open;
              presetBrowserOpen = open;
              presetDropdown.classList.toggle('open', open);
              presetToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
              presetToggleBtn.textContent = open ? 'Hide Presets' : 'Show Presets';
              if (open) refreshPresetList();
          }

          if (presetToggleBtn) {
              presetToggleBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  setPresetBrowserOpen(!presetBrowserOpen);
              });
          }
          const presetCloseZone = $('presetCloseZone');
          if (presetCloseZone) {
              presetCloseZone.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  setPresetBrowserOpen(false);
              });
          }
          // Click anywhere outside the preset browser closes it
          document.addEventListener('click', function(e) {
              if (!presetBrowserOpen) return;
              const t = e.target;
              if (presetDropdown && presetDropdown.contains(t)) return;
              if (presetToggleBtn && presetToggleBtn.contains(t)) return;
              setPresetBrowserOpen(false);
          }, true);
          // Escape closes it too
          document.addEventListener('keydown', function(e) {
              if (e.key === 'Escape' && presetBrowserOpen) setPresetBrowserOpen(false);
          });

          /* USER / MACHINE / LAB selectors keep built-in snapshots out of user storage. */
          if (presetListToggleBtn) {
              presetListToggleBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  const i = PRESET_LISTS.indexOf(presetListMode);
                  setPresetListMode(PRESET_LISTS[(i + 1) % PRESET_LISTS.length]);
              });
          }
          if (presetLabBtn) {
              presetLabBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  setPresetListMode('lab');
              });
          }

          /* v11: " -ʁ%AUTO%ʁ- " — auto-cycler. While ON, a random preset is
             picked from EITHER memory list every 9.5–19.5 seconds (3.8–6.6 inside a crescendo); if the pick
             comes from the other list, the User/Machine toggle state swaps
             with it so the browser always shows the list that was used. */
          let presetAutoActive = false;
          let presetAutoNextAt = 0;
          let presetAutoLastName = null;

          function togglePresetAuto() {
              presetAutoActive = !presetAutoActive;
              if (presetAutoBtn) {
                  presetAutoBtn.classList.toggle('auto-on', presetAutoActive);
                  presetAutoBtn.title = presetAutoActive ?
                      'AUTO-cycling ON — random preset from either list every 9.5–19.5s (3.8–6.6s in a crescendo; click to stop)' :
                      'Auto-cycle: applies a random preset from EITHER list every 9.5–19.5s (3.8–6.6s in a crescendo)';
              }
              if (presetAutoActive) {
                  presetAutoNextAt = performance.now() + 500; // first pick almost immediately
                  showNotificationMessage('PRESET AUTO-CYCLER ENGAGED — random preset every 9.5–19.5s', 2600);
              } else {
                  showNotificationMessage('PRESET AUTO-CYCLER STOPPED', 1800);
              }
          }

          function presetAutoStep(now) {
              if (!presetAutoActive) return;
              if (now < presetAutoNextAt) return;
              /* R2 SOFT-EYE: calm = a new preset every ~9.5–19.5 s; inside a
                 crescendo the roulette quickens to ~3.8–6.6 s */
              {
                  const pr = softWild() ? GlitchEngine.SOFT_EYE.pace.presetAutoWildMs : GlitchEngine.SOFT_EYE.pace.presetAutoMs;
                  presetAutoNextAt = now + pr[0] + Math.random() * (pr[1] - pr[0]);
              }
              const lists = [['user', presets], ['machine', machinePresets], ['lab', labPresets]]
                  .filter((l) => Object.keys(l[1]).length > 0);
              if (!lists.length) return;
              const pickedList = lists[(Math.random() * lists.length) | 0];
              const keys = Object.keys(pickedList[1]);
              const store = pickedList[1];
              /* R1.8: the source CURATES the roulette — its temperament
                 (energy + motion) leans the odds toward presets that match:
                 lively video draws busy boards, calm video draws sparse
                 ones. Still random, never forced. */
              const presetBusy = (entry) => {
                  try {
                      const settings = entry && entry.settings ? entry.settings : entry;
                      const normalized = normalizePresetSettings(settings);
                      const vals = normalized ? normalized.alphas : {};
                      let sSum = 0, sCnt = 0;
                      for (const k in vals) { const v = +vals[k]; if (v >= 0) { sSum += v; sCnt++; } }
                      return sCnt ? clamp01(sSum / (sCnt * 0.55)) : 0.5;
                  } catch (e) { return 0.5; }
              };
              const pickCurated = () => {
                  const temper = R16.temper();
                  const wts = keys.map((k) => 0.15 + 1.0 - Math.abs(presetBusy(store[k]) - temper));
                  let roll = Math.random() * wts.reduce((a, b) => a + b, 0);
                  let pick = keys[keys.length - 1];
                  for (let ki = 0; ki < keys.length; ki++) {
                      roll -= wts[ki];
                      if (roll <= 0) { pick = keys[ki]; break; }
                  }
                  return pick;
              };
              let name = pickCurated();
              if (keys.length > 1) {
                  let guard = 0;
                  while (name === presetAutoLastName && guard++ < 6) {
                      name = pickCurated();
                  }
              }
              presetAutoLastName = name;
              /* Swap the USER / MACHINE / LAB list state when the pick comes
                 from another list. */
              const wantMode = pickedList[0];
              if (presetListMode !== wantMode) setPresetListMode(wantMode);
              if (presetSelect) presetSelect.value = name;
              applyPresetByName(name, store);
              randomizeVoiceFx(); /* AI WARP: the auto-preset cycler rolls the unlocked masters */
              /* R2 SOFT-EYE: a BUSY preset pick may CALL a crescendo — this is
                 the "occasionally, when preset randomization calls it" hook.
                 The engine's min-gap keeps it occasional. */
              try {
                  const busy = presetBusy(store[name]);
                  if (busy > 0.55 && SOFT.cresc) {
                      SOFT.cresc.request(now, 'preset:' + name, 0.6 + 0.4 * busy,
                          GlitchEngine.SOFT_EYE.crescendo.presetWildOdds * busy);
                  }
              } catch (e) {}
          }

          if (presetAutoBtn) presetAutoBtn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              togglePresetAuto();
          });

          if (presetSaveBtn) {
              presetSaveBtn.addEventListener('click', () => {
                  const name = ((presetNameInput && presetNameInput.value.trim()) ||
                      'preset-' + (Object.keys(presets).length + 1)).slice(0, 80);
                  if (Object.keys(presets).length >= MAX_USER_PRESETS && !presets[name]) {
                      showNotificationMessage('The user preset limit is 500. Delete a preset before saving another.', 4200);
                      return;
                  }
                  presets[name] = captureSettings();
                  persistPresets();
                  /* Saving always lands in USER memory — swap the list toggle to it */
                  if (presetListMode !== 'user') setPresetListMode('user');
                  else refreshPresetList();
                  if (presetSelect) presetSelect.value = name;
                  setCurrentPresetDisplay('SAVED: ' + name + ' [USER]');
                  if (presetNameInput) presetNameInput.value = '';
              });
          }

          if (presetImportBtn && presetImportInput) {
              presetImportBtn.addEventListener('click', () => presetImportInput.click());
              presetImportInput.addEventListener('change', async () => {
                  const file = presetImportInput.files && presetImportInput.files[0];
                  if (!file) return;
                  try {
                      if (file.size > 2 * 1024 * 1024) throw new RangeError('The preset file exceeds 2 MB.');
                      const payload = JSON.parse(await file.text());
                      const entries = R4.presetBackupEntries(payload);
                      if (!entries) {
                          throw new TypeError('The file does not contain a valid user preset backup.');
                      }
                      if (!window.confirm('Import ' + entries.length +
                          ' user preset(s)? Matching names will be replaced.')) return;
                      const next = Object.assign(Object.create(null), presets);
                      entries.forEach((entry) => {
                          const name = entry.name.trim();
                          const existing = Object.keys(next).find((key) =>
                              key.toLocaleLowerCase() === name.toLocaleLowerCase());
                          next[existing || name] = entry.settings;
                      });
                      if (Object.keys(next).length > MAX_USER_PRESETS) {
                          throw new RangeError('Import would exceed the 500 user preset limit.');
                      }
                      presets = next;
                      persistPresets();
                      setPresetListMode('user');
                      showNotificationMessage('Imported ' + entries.length + ' user preset(s).', 3000);
                  } catch (error) {
                      showNotificationMessage('Preset import failed: ' + error.message, 5000);
                  } finally {
                      presetImportInput.value = '';
                  }
              });
          }

          if (presetExportBtn) {
              presetExportBtn.addEventListener('click', () => {
                  try {
                      const entries = Object.keys(presets).map((name) => ({
                          name,
                          settings: presets[name]
                      }));
                      const payload = JSON.stringify({
                          format: 'signal-lab-presets',
                          version: 1,
                          presets: entries
                      }, null, 2);
                      if (new TextEncoder().encode(payload).length > 2 * 1024 * 1024) {
                          throw new RangeError('The preset export exceeds 2 MB.');
                      }
                      if (window.GlitchHost && window.GlitchHost.isNativeHost) {
                          if (!window.GlitchHost.exportPresets(entries)) {
                              throw new Error('The local app host is unavailable.');
                          }
                      } else {
                          const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'glitchCanvasPresets_v2.json';
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }
                      showNotificationMessage('Exported ' + entries.length + ' user preset(s).', 3000);
                  } catch (error) {
                      showNotificationMessage('Preset export failed: ' + error.message, 5000);
                  }
              });
          }

          function applyPresetByName(name, store) {
              const src = store || getActivePresetStore();
              const preset = src[name];
              if (preset) {
                  const rawSettings = preset.settings || preset;
                  const settings = normalizePresetSettings(rawSettings);
                  if (!settings) return false;
                  applySettings(settings);
                  const listTag = src === labPresets ? ' [LAB]' : (src === machinePresets ? ' [MACHINE]' : ' [USER]');
                  /* LAB entries are keyed by id; show their real name, and only
                     show a tag the list badge doesn't already say */
                  const label = (typeof preset.name === 'string' && preset.name) ? preset.name : name;
                  const tag = (preset.tag && preset.tag !== 'LAB') ? ' · ' + preset.tag : '';
                  setCurrentPresetDisplay('LOADED: ' + label + tag + listTag);
                  return true;
              }
              return false;
          }
          if (presetSelect) presetSelect.addEventListener('change', () => applyPresetByName(presetSelect.value));
          if (presetDeleteBtn) {
              presetDeleteBtn.addEventListener('click', () => {
                  if (presetListMode !== 'user') {
                      showNotificationMessage('Only USER presets can be deleted — switch to USER first. MACHINE is regenerated each start; LAB is fixed.', 3200);
                      return;
                  }
                  const name = presetSelect ? presetSelect.value : '';
                  if (name && presets[name]) {
                      delete presets[name];
                      persistPresets();
                      refreshPresetList();
                      setCurrentPresetDisplay('DELETED: ' + name + ' [USER]');
                  }
              });
          }
          if (presetDeleteAllBtn) {
              presetDeleteAllBtn.addEventListener('click', () => {
                  if (presetListMode !== 'user') {
                      showNotificationMessage('Only USER presets can be deleted — switch to USER first. MACHINE is regenerated each start; LAB is fixed.', 3200);
                      return;
                  }
                  presets = Object.create(null);
                  persistPresets();
                  refreshPresetList();
                  setCurrentPresetDisplay('ALL USER PRESETS DELETED');
              });
          }
          if (presetPrevBtn) {
              presetPrevBtn.addEventListener('click', () => {
                  if (!presetOrder.length) return;
                  const cur = presetSelect ? presetOrder.indexOf(presetSelect.value) : -1;
                  const idx = (cur - 1 + presetOrder.length) % presetOrder.length;
                  if (presetSelect) presetSelect.value = presetOrder[idx];
                  applyPresetByName(presetOrder[idx]);
              });
          }
          if (presetNextBtn) {
              presetNextBtn.addEventListener('click', () => {
                  if (!presetOrder.length) return;
                  const cur = presetSelect ? presetOrder.indexOf(presetSelect.value) : -1;
                  const idx = (cur + 1) % presetOrder.length;
                  if (presetSelect) presetSelect.value = presetOrder[idx];
                  applyPresetByName(presetOrder[idx]);
              });
          }
          /* Start on the fixed LAB bank; USER and MACHINE remain selectable. */
          applyPresetListSkin();
          refreshPresetList();
          setCurrentPresetDisplay('PRESET MEMORY: LAB — 250 IMMUTABLE SNAPSHOTS');

          /* ------------------------------------------------------------------ *
           *  20. Notification helper                                            *
           * ------------------------------------------------------------------ */
          function showNotificationMessage(message, duration) {
              duration = duration || 3600;
              let el = document.querySelector('.notification');
              if (!el) { el = document.createElement('div');
                  el.className = 'notification';
                  document.body.appendChild(el); }
              el.textContent = message;
              el.style.display = 'block';
              el.style.opacity = '1';
              clearTimeout(showNotificationMessage._t);
              showNotificationMessage._t = setTimeout(() => {
                  el.style.opacity = '0';
                  setTimeout(() => { el.style.display = 'none'; }, 500);
              }, duration);
          }

          /* ------------------------------------------------------------------ *
           *  21. UI toggle tab + hover dim                                      *
           * ------------------------------------------------------------------ */
          let isUIHidden = false;
          let tabHideTimer = null;
          let uiHoverDepth = 0;

          function hideTab() {
              if (!uiToggleTab) return;
              const tabWidth = uiToggleTab.offsetWidth || 160;
              uiToggleTab.style.setProperty('--ui-tab-collapsed-right', Math.min(0, 40 - tabWidth) + 'px');
              uiToggleTab.classList.add('is-collapsed');
          }

          function showTabBriefly(duration) {
              clearTimeout(tabHideTimer);
              if (!uiToggleTab) return;
              uiToggleTab.classList.remove('is-collapsed');
              tabHideTimer = setTimeout(hideTab, duration || 1200);
          }
          if (toggleUiBtn) {
              toggleUiBtn.addEventListener('click', () => {
                  isUIHidden = !isUIHidden;
                  showTabBriefly(1200);
                  document.body.classList.toggle('ui-hidden', isUIHidden);
                  if (isUIHidden) setPresetBrowserOpen(false); // v10: never hide mid-open
                  toggleUiBtn.textContent = isUIHidden ? 'SHOW CONTROL U.I.' : 'HIDE CONTROL U.I.';
                  uiHoverDepth = 0;
                  document.body.classList.remove('ui-controls-hover');
              });
              if (uiToggleTab) {
                  uiToggleTab.addEventListener('touchstart', () => showTabBriefly(3000));
                  uiToggleTab.addEventListener('touchend', () => showTabBriefly(3000));
              }
          }
          const hoverTargets = [ytInput, startBtn, openFileBtn, openFileWrap, rightRack, sliderContainer,
              ghostBtnRack, wiredBtn, presetToggleBtn, presetDropdown, uiToggleTab, toggleUiBtn,
              nowPlayingHud, npHudToggle, npHudPanel
          ].filter(Boolean);
          hoverTargets.forEach((el) => {
              el.addEventListener('mouseenter', () => { uiHoverDepth += 1;
                  document.body.classList.add('ui-controls-hover'); });
              el.addEventListener('mouseleave', () => { uiHoverDepth = Math.max(0, uiHoverDepth - 1); if (!
                      uiHoverDepth) document.body.classList.remove('ui-controls-hover'); });
              el.addEventListener('focusin', () => { uiHoverDepth += 1;
                  document.body.classList.add('ui-controls-hover'); });
              el.addEventListener('focusout', () => { uiHoverDepth = Math.max(0, uiHoverDepth - 1); if (!
                      uiHoverDepth) document.body.classList.remove('ui-controls-hover'); });
          });

          /* ------------------------------------------------------------------ *
           *  21b. Anti-Washout Guard                                            *
           *  Detects over-saturated alpha combos and pulls back the             *
           *  worst offenders — prevents lingering washout states.               *
           * ------------------------------------------------------------------ */
          /* ------------------------------------------------------------------ *
           *  WARP BLEND EFFECTS — these six run freely on top of AI Warp,      *
           *  creating colour/strobe/flash/inversion blends over the warp engine *
           * ------------------------------------------------------------------ */
          const WARP_BLEND_EFFECTS = new Set([
              'B&W Invert', 'Strobe', 'Flash', 'HSL Rainbow', 'Hue/Color Cycle', 'Neon Grad'
          ]);

          /* v11.2: warp-blend caps — toned but with headroom over the warp engine,
             so the six warp-blend voices still read clearly as blends riding the
             AI Warp while staying ensemble-polite. */
          const WARP_BLEND_ALPHA_CAPS = {
              'B&W Invert':      1.0,
              'Strobe':          0.55,
              'Flash':           0.60,
              'HSL Rainbow':     0.55,
              'Hue/Color Cycle': 0.85,
              'Neon Grad':       0.60
          };

          /* v11: full-range blend-profile peaks used by retargetRandomization when
             AI Warp is active — the randomiser can drive every warp-blend effect
             from whisper ambience all the way to 100% over the warp engine. */
          const WARP_BLEND_PEAKS = {
              'B&W Invert':      [0.18, 1.0],
              'Strobe':          [0.22, 1.0],
              'Flash':           [0.20, 1.0],
              'HSL Rainbow':     [0.28, 1.0],
              'Hue/Color Cycle': [0.30, 1.0],
              'Neon Grad':       [0.25, 1.0]
          };

          /* ------------------------------------------------------------------ *
           *  WASHOUT PAIRS — duration-based suppression.                        *
           *  Pairs are allowed to co-exist briefly at high levels (enabling     *
           *  dramatic bursts) but pulled down if they linger too long together. *
           *  When AI Warp is active, warp-blend effects are exempt — they are   *
           *  intentionally meant to overlay the warp engine.                    *
           * ------------------------------------------------------------------ */
          const WASHOUT_PAIRS = [
              // [effectA, effectB, alphaSum trigger, holdMs before pulling]
              ['Flash',     'Strobe',      1.20,  1200],   // brief double-flash OK, 1.2s max
              ['Flash',     'HSL Rainbow', 1.40,  2000],   // colourful flashes fine for 2s
              ['Strobe',    'HSL Rainbow', 1.10,  1500],   // vivid strobe + rainbow, 1.5s max
              ['B&W Invert','Flash',       1.30,  1000],   // white-out alert, 1s max
              ['B&W Invert','Strobe',      1.20,  1000]    // desaturated strobe, 1s max
          ];
          // Duration each pair has been above its trigger sum
          const washoutPairTimer = {};
          // Tracks how long any individual effect has been stuck near max
          const stuckHighTimer = {};
          const STUCK_HIGH_THRESHOLD  = 0.88;
          const STUCK_HIGH_TIMEOUT    = 5500; // ms before auto-pull (was 3500 — more room to peak)
          const WARP_STUCK_TIMEOUT    = 9000; // extended timeout for warp-blend effects during AI warp

          function antiWashoutStep(now, dt) {
              const dtMs = dt * 1000;

              // 1. Per-effect stuck-high guard
              for (let i = 0; i < profileNames.length; i++) {
                  const name = profileNames[i];
                  if (automationHeld(name)) { stuckHighTimer[name] = 0; continue; }
                  if (name === 'B&W Invert' && bwSweepActive) { stuckHighTimer[name] = 0; continue; }
                  // Aesthetic-burst managed effects: give them a very long pass
                  if (aestheticBurstLocked && aestheticBurstLocked.has(name)) { stuckHighTimer[name] = 0; continue; }

                  const a = effectAlphas[name] || 0;
                  if (a >= STUCK_HIGH_THRESHOLD) {
                      stuckHighTimer[name] = (stuckHighTimer[name] || 0) + dtMs;
                      const timeout = (isAiWarpActive && WARP_BLEND_EFFECTS.has(name))
                          ? WARP_STUCK_TIMEOUT : STUCK_HIGH_TIMEOUT * R16.stuckK(); /* R1.7 */
                      if (stuckHighTimer[name] > timeout) {
                          const profile = blendProfiles[name];
                          const pullTarget = profile ?
                              clamp01(randRange(profile.ambient) * R16.ambientK()) :
                              0.08 + Math.random() * 0.12; /* R1.7: energy sets the floor */
                          effectAlphas[name] = easeExp(a, pullTarget, dt, 1.2);
                          randomTargets[name] = pullTarget;
                          if (sliderElements[name]) sliderElements[name].value = effectAlphas[name].toFixed(3);
                          stuckHighTimer[name] = 0;
                      }
                  } else {
                      stuckHighTimer[name] = Math.max(0, (stuckHighTimer[name] || 0) - dtMs * 0.7);
                  }
              }

              // 2. Duration-based washout-pair guard
              for (let p = 0; p < WASHOUT_PAIRS.length; p++) {
                  const [a, b, sumTrigger, holdMs] = WASHOUT_PAIRS[p];
                  const key = a + '|' + b;
                  if (automationHeld(a) && automationHeld(b)) { washoutPairTimer[key] = 0; continue; }
                  if (bwSweepActive && (a === 'B&W Invert' || b === 'B&W Invert')) { washoutPairTimer[key] = 0; continue; }
                  /* v11: warp-blend pairs are no longer skipped while AI Warp is
                     active — they get a 2.5x hold window instead, so B&W/Flash/Strobe/
                     Rainbow blends DO run over the warp engine as timed bursts but
                     never linger long enough to become opacity mud. */
                  let effectiveHold = holdMs;
                  if (isAiWarpActive && (WARP_BLEND_EFFECTS.has(a) || WARP_BLEND_EFFECTS.has(b))) {
                      effectiveHold = holdMs * 2.5;
                  }
                  /* R1.6: the source's energy sets the patience — a calm
                     canvas holds its blends longer before the ambient pull,
                     a lively one recycles them faster */
                  effectiveHold *= R16.washHold();
                  const aVal = effectAlphas[a] || 0;
                  const bVal = effectAlphas[b] || 0;
                  if (aVal + bVal > sumTrigger * R16.pairRoom()) { /* R1.8: lively video earns headroom */
                      washoutPairTimer[key] = (washoutPairTimer[key] || 0) + dtMs;
                      if (washoutPairTimer[key] > effectiveHold) {
                          // Pull the weaker unlocked effect back to ambient
                          const suppA = !automationHeld(a) && aVal <= bVal;
                          const pullTarget = (nm) => {
                              const pr = blendProfiles[nm];
                              return pr ? clamp01(randRange(pr.ambient) * R16.ambientK()) : 0.04;
                          }; /* R1.7: energy sets the floor */
                          if (suppA && !automationHeld(a)) {
                              randomTargets[a] = pullTarget(a);
                              effectAlphas[a] = easeExp(aVal, randomTargets[a], dt, 1.0);
                              if (sliderElements[a]) sliderElements[a].value = effectAlphas[a].toFixed(3);
                          } else if (!automationHeld(b)) {
                              randomTargets[b] = pullTarget(b);
                              effectAlphas[b] = easeExp(bVal, randomTargets[b], dt, 1.0);
                              if (sliderElements[b]) sliderElements[b].value = effectAlphas[b].toFixed(3);
                          }
                          washoutPairTimer[key] = 0;
                      }
                  } else {
                      washoutPairTimer[key] = Math.max(0, (washoutPairTimer[key] || 0) - dtMs * 0.8);
                  }
              }

              // 3. B&W invert: don't linger on the 50% rail-switch (hue → emission)
              if (!sliderLocks['B&W Invert'] && !bwSweepActive &&
                  !(aestheticBurstLocked && aestheticBurstLocked.has('B&W Invert'))) {
                  const bwVal = effectAlphas['B&W Invert'] || 0;
                  if (bwVal > 0.48 && bwVal < 0.52) {
                      stuckHighTimer['__bw50'] = (stuckHighTimer['__bw50'] || 0) + dtMs;
                      if (stuckHighTimer['__bw50'] > 1600) {
                          randomTargets['B&W Invert'] = [0, 0.50, 0.75, 1.0][(Math.random() * 4) | 0];
                          stuckHighTimer['__bw50'] = 0;
                      }
                  } else {
                      stuckHighTimer['__bw50'] = 0;
                  }
              }
          }

          /* ------------------------------------------------------------------ *
           *  21c. AESTHETIC BURST SYSTEM v11                                    *
           *  Timed, curated GROUP bursts and reductions between 0 and 100 that  *
           *  fit well together — creating variance over time.                   *
           *  Phase machine:  rest → peak (0..100 lock-in) → hold                *
           *                  → dip (timed reduction toward ~0) → hold           *
           *                  → rest                                             *
           *  Peaks reach full 0-100 intensity; dips pull the group back down so *
           *  nothing mixes opacities too long (temporal washout guard).         *
           * ------------------------------------------------------------------ */
          const AESTHETIC_GROUPS = {
              colorBloom: {
                  // Warm colour saturation wash — rainbow + neon + hue cycle
                  effects:   ['HSL Rainbow', 'Neon Grad', 'Hue/Color Cycle'],
                  peakRange: [0.70, 1.00],
                  holdMs:    [2200, 4500],
                  dipRange:  [0.05, 0.20],
                  dipMs:     [600, 1400],
                  restMs:    [5000, 10000]
              },
              signalStorm: {
                  // Fast light events — flash + strobe + data bands (pulls B&W down)
                  effects:   ['Flash', 'Strobe', 'Data Bands'],
                  suppress:  ['B&W Invert'],
                  peakRange: [0.60, 1.00],
                  holdMs:    [900, 2200],
                  dipRange:  [0.00, 0.10],
                  dipMs:     [400, 900],
                  restMs:    [6000, 12000]
              },
              hueDia: {
                  // B&W hue-rail only (0–50%) — 0 light emission inversion, spectrum start
                  effects:   ['B&W Invert', 'Hue/Color Cycle', 'HSL Rainbow'],
                  suppress:  ['Flash', 'Strobe'],
                  peakRange: [0.10, 0.48],
                  holdMs:    [1600, 3600],
                  dipRange:  [0.02, 0.12],
                  dipMs:     [400, 1000],
                  restMs:    [6000, 12000]
              },
              negEmission: {
                  // lock B&W Invert on the 75% NEGATIVE light-emission landmark
                  effects:   ['B&W Invert', 'Hue/Color Cycle', 'Scanlines'],
                  suppress:  ['Flash', 'Strobe'],
                  peakRange: [0.72, 0.78],
                  holdMs:    [1800, 4000],
                  dipRange:  [0.00, 0.12],
                  dipMs:     [400, 1000],
                  restMs:    [6000, 12000]
              },
              monoInvert: {
                  // B&W 75–100% — hold 75% negative, hue completes 270–360°
                  effects:   ['B&W Invert', 'Scanlines'],
                  suppress:  ['Flash', 'Strobe'],
                  peakRange: [0.75, 1.00],
                  holdMs:    [1500, 3500],
                  dipRange:  [0.02, 0.15],
                  dipMs:     [500, 1200],
                  restMs:    [7000, 14000]
              },
              digitalArt: {
                  // Font + ASCII + Tech Artist — pure glitch art wall
                  effects:   ['Font Burn', 'ASCII', 'Tech Artist', 'Ink Glyphs', 'Matrix ASCII', 'Matrix Chord'],
                  peakRange: [0.60, 1.00],
                  holdMs:    [2500, 5500],
                  dipRange:  [0.05, 0.18],
                  dipMs:     [600, 1500],
                  restMs:    [5000, 9000]
              },
              dataBomb: {
                  // VHS + data explosions
                  effects:   ['VHS Glitch', 'Data Bands', 'Gemini Bomb'],
                  peakRange: [0.50, 0.95],
                  holdMs:    [1200, 2800],
                  dipRange:  [0.00, 0.12],
                  dipMs:     [400, 1000],
                  restMs:    [5000, 11000]
              },
              warpBloom: {
                  // Only fires when AI Warp is active — colour bloom over the warp
                  effects:   ['HSL Rainbow', 'Neon Grad', 'Flash', 'B&W Invert'],
                  peakRange: [0.65, 1.00],
                  holdMs:    [2000, 4500],
                  dipRange:  [0.05, 0.20],
                  dipMs:     [500, 1200],
                  restMs:    [4000, 8000],
                  warpOnly:  true
              },
              neonPulse: {
                  // Steady neon heartbeat — neon + scanlines + hue
                  effects:   ['Neon Grad', 'Scanlines', 'Hue/Color Cycle'],
                  peakRange: [0.60, 1.00],
                  holdMs:    [1800, 3600],
                  dipRange:  [0.04, 0.16],
                  dipMs:     [500, 1100],
                  restMs:    [5000, 9500]
              },
              ghostSignal: {
                  // Broadcast-interference trio
                  effects:   ['VHS Glitch', 'Data Bomb', 'Strobe'],
                  peakRange: [0.50, 0.90],
                  holdMs:    [1000, 2400],
                  dipRange:  [0.00, 0.10],
                  dipMs:     [400, 900],
                  restMs:    [6000, 11000]
              },
              chromaRipple: {
                  // Colour-flash ripple for pure chroma moments
                  effects:   ['Hue/Color Cycle', 'HSL Rainbow', 'Flash'],
                  peakRange: [0.65, 1.00],
                  holdMs:    [1600, 3200],
                  dipRange:  [0.03, 0.14],
                  dipMs:     [500, 1000],
                  restMs:    [5500, 10500]
              },
              warpChroma: {
                  // Warp-only: hard colour + inversion blend over the warp engine
                  effects:   ['Neon Grad', 'B&W Invert', 'Strobe', 'HSL Rainbow'],
                  peakRange: [0.65, 1.00],
                  holdMs:    [1800, 4000],
                  dipRange:  [0.05, 0.18],
                  dipMs:     [500, 1200],
                  restMs:    [4200, 8200],
                  warpOnly:  true
              },
              prismDrift: {
                  // R4.1.1 — refraction drift: prism + echo over a slow hue walk (no lights)
                  effects:   ['Prism Rift', 'Chromatic Echo', 'Hue/Color Cycle'],
                  peakRange: [0.55, 0.90],
                  holdMs:    [2600, 5200],
                  dipRange:  [0.04, 0.14],
                  dipMs:     [600, 1400],
                  restMs:    [6000, 11000]
              },
              moonlightVeil: {
                  // R4.1.1 — hazy broadcast moonlight: ghost spectrum under tape weather (no lights)
                  effects:   ['R3 Ghost Spectrum', 'Tape Grain', 'Scanlines'],
                  peakRange: [0.45, 0.85],
                  holdMs:    [2800, 5600],
                  dipRange:  [0.03, 0.12],
                  dipMs:     [700, 1500],
                  restMs:    [6500, 12000]
              },
              glyphRainfall: {
                  // R4.1.1 — calm glyph rainfall: rain + chords + ink (no lights)
                  effects:   ['Cyber Rain', 'Matrix Chord', 'Ink Glyphs'],
                  peakRange: [0.50, 0.90],
                  holdMs:    [2600, 5200],
                  dipRange:  [0.05, 0.16],
                  dipMs:     [600, 1400],
                  restMs:    [5500, 10000]
              },
              crtDaydream: {
                  // R4.1.1 — warm CRT daydream: rolling scan over neon and grain (no lights)
                  effects:   ['Rolling Scan', 'Neon Grad', 'Tape Grain', 'Scanlines'],
                  peakRange: [0.50, 0.90],
                  holdMs:    [2400, 5000],
                  dipRange:  [0.04, 0.15],
                  dipMs:     [600, 1300],
                  restMs:    [5500, 10500]
              }
          };

          let aestheticBurstLocked  = new Set(); // effects currently owned by an aesthetic burst
          let aestheticBurstGroupKey = null;
          let aestheticBurstPhase   = 'rest';    // 'rest' | 'peak' | 'dip'
          let aestheticBurstNextAt  = performance.now() + 9000 + Math.random() * 14000;
          let aestheticBurstHoldUntil = 0;

          /* v11: called whenever Continual Randomization / Auto Glitch is
             re-enabled or any slider is touched — wakes the aesthetic burst
             scheduler back up after a ZERO ALL park. */
          function restartAutomatedLevels(source) {
              const now = performance.now();
              aestheticBurstPhase = 'rest';
              aestheticBurstLocked = new Set();
              aestheticBurstGroupKey = null;
              aestheticBurstNextAt = now + 1200 + Math.random() * 2800;
              bwSweepScheduleNext(now, 6000, 18000); // B&W inversion sweeps come back sooner
              nextUnparkAt = Math.min(nextUnparkAt, now + 1200);
          }

          function aestheticBurstStep(now) {
              if (aestheticBurstPhase === 'rest') {
                  if (now < aestheticBurstNextAt) return;

                  // Pick a group; warpOnly groups only fire when AI Warp is on
                  const keys = Object.keys(AESTHETIC_GROUPS).filter((k) =>
                      !AESTHETIC_GROUPS[k].warpOnly || isAiWarpActive
                  );
                  /* R1 OLD-SOUL (006 final): a burst may only voice effects that
                     are IN MOTION — parked sliders stay off under CR/AM. Auto
                     Glitch is the designed wake-up artist: with AG on, bursts
                     may still raise parked voices. */
                  const available = keys.filter((k) => {
                      const g = AESTHETIC_GROUPS[k];
                      /* R2 SOFT-EYE: groups that voice Flash / Strobe wait for a crescendo */
                      if (!GlitchEngine.softGroupAllowed(g.effects, softK())) return false;
                      return g.effects.some((n) => !automationHeld(n) && !isEffectCancelled(n) &&
                          (isAutoGlitching || !crParked[n] || (effectAlphas[n] || 0) >= PARKED_EFFECT_EPSILON));
                  });
                  if (!available.length) {
                      aestheticBurstNextAt = now + 3000;
                      return;
                  }
                  /* R1.4: a colorful source steers the curator toward the
                     chroma groups (color appetite) */
                  let pickPool = available;
                  const appetite = srcAppetite();
                  if (appetite > 0.45 && Math.random() < appetite * 0.6) {
                      const chroma = available.filter((k) => AESTHETIC_GROUPS[k].effects.some(
                          (n) => n === 'HSL Rainbow' || n === 'Hue/Color Cycle' || n === 'Neon Grad'));
                      if (chroma.length) pickPool = chroma;
                  }
                  aestheticBurstGroupKey = pickPool[(Math.random() * pickPool.length) | 0];
                  const group = AESTHETIC_GROUPS[aestheticBurstGroupKey];

                  // Lock in this group's effects and assign peak targets (0-100)
                  aestheticBurstLocked = new Set();
                  group.effects.forEach((name) => {
                      if (automationHeld(name)) return;
                      if (isEffectCancelled(name)) return; // R4.1.3: cancelled stays off, even under AG
                      if (!isAutoGlitching && crParked[name] &&
                          (effectAlphas[name] || 0) < PARKED_EFFECT_EPSILON) return; // R1: parked stays off
                      const [pMin, pMax] = group.peakRange;
                      // B&W Invert: honour the group's peakRange so hueDia stays
                      // in 0–50% (0 emission invert) and monoInvert/warp stays 50–100%.
                      const lo = pMin;
                      const hi = pMax;
                      const bK = (name === 'B&W Invert') ? 1 :
                          (0.80 + 0.25 * clamp(videoPalette.energy, 0, 1));
                      /* R2: calm peaks sit in the lower 60% of the range; a crescendo opens the full span */
                      const span = (hi - lo) * lerp(0.60, 1.0, softK());
                      randomTargets[name] = GlitchEngine.softCap(name, (lo + Math.random() * span) * bK, softK());
                      aestheticBurstLocked.add(name);
                  });

                  // Gently suppress conflicting effects (don't zero — just pull back)
                  if (group.suppress) {
                      group.suppress.forEach((name) => {
                          if (automationHeld(name)) return;
                          if (isEffectCancelled(name)) return; // R4.1.3: cancelled stays off
                          if (!isAutoGlitching && crParked[name] &&
                              (effectAlphas[name] || 0) < PARKED_EFFECT_EPSILON) return; // R1: parked stays off
                          const profile = blendProfiles[name];
                          randomTargets[name] = profile ? randRange(profile.ambient) : 0.02;
                          aestheticBurstLocked.add(name); // also lock these so retarget won't re-raise them
                      });
                  }

                  const [hMin, hMax] = group.holdMs;
                  aestheticBurstHoldUntil = now + (hMin + Math.random() * (hMax - hMin)) *
                      lerp(GlitchEngine.SOFT_EYE.pace.restK, 0.85, softK());   /* R2: longer, calmer holds */
                  aestheticBurstPhase = 'peak';

              } else if (aestheticBurstPhase === 'peak') {
                  if (now < aestheticBurstHoldUntil) return;
                  // v11: after the peak hold, drive a timed REDUCTION toward the dip
                  // range — the group breathes out instead of snapping back.
                  if (aestheticBurstGroupKey) {
                      const group = AESTHETIC_GROUPS[aestheticBurstGroupKey];
                      group.effects.forEach((name) => {
                          if (automationHeld(name)) return;
                          if (isEffectCancelled(name)) return; // R4.1.3: cancelled stays off
                          if (!isAutoGlitching && crParked[name] &&
                              (effectAlphas[name] || 0) < PARKED_EFFECT_EPSILON) return; // R1: parked stays off
                          const [dMin, dMax] = group.dipRange || [0.02, 0.15];
                          randomTargets[name] = dMin + Math.random() * (dMax - dMin);
                      });
                  }
                  const g = AESTHETIC_GROUPS[aestheticBurstGroupKey];
                  const [dMin2, dMax2] = (g && g.dipMs) ? g.dipMs : [400, 900];
                  aestheticBurstHoldUntil = now + dMin2 + Math.random() * (dMax2 - dMin2);
                  aestheticBurstPhase = 'dip';

              } else { // 'dip' — reduction finished, release everything back to ambient drift
                  if (now < aestheticBurstHoldUntil) return;
                  if (aestheticBurstGroupKey) {
                      const group = AESTHETIC_GROUPS[aestheticBurstGroupKey];
                      const allEffects = (group.effects || []).concat(group.suppress || []);
                      allEffects.forEach((name) => {
                          if (automationHeld(name)) return;
                          const profile = blendProfiles[name];
                          randomTargets[name] = profile
                              ? randRange(profile.ambient)
                              : 0.02 + Math.random() * 0.04;
                      });
                  }
                  const endedGroup = AESTHETIC_GROUPS[aestheticBurstGroupKey];
                  const [rMin, rMax] = endedGroup ? endedGroup.restMs : [5000, 10000];

                  aestheticBurstLocked = new Set();
                  aestheticBurstGroupKey = null;
                  aestheticBurstPhase = 'rest';
                  aestheticBurstNextAt = now + (rMin + Math.random() * (rMax - rMin)) *
                      lerp(GlitchEngine.SOFT_EYE.pace.restK, 0.7, softK());   /* R2: longer rests when calm */
              }
          }

          /* ------------------------------------------------------------------ *
           *  22. Main loop                                                      *
           * ------------------------------------------------------------------ */
          function draw(now) {
              resizeGlitchCanvas(false);
              updateContinuousEffectsCache();

              const w = mainCanvas.width,
                  h = mainCanvas.height;
              if (w < 2 || h < 2) return;

              gctx.setTransform(1, 0, 0, 1, 0, 0);
              gctx.globalAlpha = 1;
              gctx.globalCompositeOperation = 'source-over';
              gctx.filter = 'none';
              gctx.clearRect(0, 0, w, h);

              try { renderVideoDistort(now); } catch (e) {}

              for (let i = 0; i < activeEffects.length; i++) {
                  try {
                      gctx.save();
                      activeEffects[i]();
                      gctx.restore();
                  } catch (e) {
                      try { gctx.restore(); } catch (e2) {}
                  }
              }

              try { applyComboPostProcess(); } catch (e) {}

              const needSnap = (ghostActive && ghostLevel > 0.01) || (getVsyncMode() !== 'OFF' && activeVsyncLevel() >
                  0.01);
              if (needSnap) {
                  if (snap.width !== w || snap.height !== h) { snap.width = w;
                      snap.height = h; }
                  snapCtx.setTransform(1, 0, 0, 1, 0, 0);
                  snapCtx.clearRect(0, 0, w, h);
                  snapCtx.drawImage(mainCanvas, 0, 0, w, h);
                  try { renderVsyncScan(now, snap); } catch (e) {}
                  try { renderGhostProtocol(now, snap); } catch (e) {}
              }
              try { renderMilkdrop(now); } catch (e) {}
          }

          const QUALITY_TIERS = [
              { drawEveryN: 1, asciiCells: 42000, scale: 1, cap: 1.25 },
              { drawEveryN: 1, asciiCells: 21000, scale: 0.9, cap: 1.1 },
              { drawEveryN: 2, asciiCells: 10500, scale: 0.8, cap: 1 }
          ];
          let qualityTier = renderBudget.lowPower ? 2 : 0;
          let qualityFloor = qualityTier;
          let emaFrameMs = 16.7,
              governorSlow = 0,
              governorFast = 0;
          /* Recovery: the 14 ms "fast frame" test below can only pass on displays
             faster than ~71 Hz, so on a 24–60 Hz display a dropped tier would never
             return. A tier also steps back up once frames keep the display's cadence
             and the main-thread work of drawn frames leaves clear headroom in the
             frame period. A step up that is undone soon after doubles the wait
             before the next one, up to about 7 minutes at 60 Hz, so a board held
             back by its GPU (which main-thread work cannot show) stops probing.
             The usual wait returns once drawn frames need clearly less work than
             when the step up failed, e.g. after a lighter preset. */
          const GOVERNOR_UP_WORK = 0.45;
          const GOVERNOR_UP_FRAMES = 400;
          const GOVERNOR_RELAPSE_FRAMES = 600;
          const GOVERNOR_MAX_WAIT = 64;
          const GOVERNOR_LIGHTER_WORK = 0.7;
          let emaWorkMs = 0,
              governorFrames = 0,
              governorUpAt = -1e9,
              governorUpWait = 1,
              governorUpWork = 0,
              governorRelapseWork = 0,
              drawWorkMs = -1;
          /* The frame-time thresholds below are tuned for 60 Hz. On a 24/30/50 Hz
             projector or TV every frame legitimately takes 20–42 ms, which would
             otherwise read as overload and drop the board to half-rate drawing,
             so the native host reports the monitor's real refresh rate. WebView2
             can pace frames to another display than the one showing the window
             (it follows the primary display), so the host sends every display's
             rate, the window's first, and the measured frame cadence picks the
             one actually in use. A cadence that matches no display (a 60 Hz
             board that only manages 30 fps) is real overload and keeps the
             governor's thresholds. Half of 60 Hz looks exactly like a 30 Hz
             display, so a display slower than a cadence already measured for
             this display setup is never taken as the one pacing frames. */
          let governorPace = 1;
          let displayRates = [];
          let displayRatesKey = '';
          let fastestCadenceMs = Infinity;
          let cadenceHz = 0;
          let cadenceCount = 0;
          const cadenceRing = new Float32Array(48);
          const cadenceSorted = new Float32Array(48);

          function setGovernorHz(hz) {
              const pace = Math.max(1, 60 / hz);
              if (Math.abs(pace - governorPace) < 0.02) return;
              governorPace = pace;
              emaFrameMs = 1000 / hz;
              governorSlow = 0;
              governorFast = 0;
              if (qualityTier > qualityFloor) {
                  qualityTier = qualityFloor;
                  applyQualityTier();
              }
          }

          function setDisplayRefresh(hz, rates) {
              displayRates = Array.isArray(rates) && rates.length ? rates : [hz];
              const key = displayRates.join(',');
              if (key !== displayRatesKey) {
                  displayRatesKey = key;
                  fastestCadenceMs = Infinity;
              }
              if (!displayRates.includes(cadenceHz)) cadenceHz = 0;
              setGovernorHz(cadenceHz || hz);
          }

          function noteFrameCadence(dtMs) {
              if (!displayRates.length || !(dtMs > 0 && dtMs < 250)) return;
              cadenceRing[cadenceCount++] = dtMs;
              if (cadenceCount < cadenceRing.length) return;
              cadenceCount = 0;
              cadenceSorted.set(cadenceRing);
              cadenceSorted.sort();
              const p10 = cadenceSorted[4];
              if (p10 < fastestCadenceMs) fastestCadenceMs = p10;
              let best = 0;
              for (const hz of displayRates) {
                  if (fastestCadenceMs < 900 / hz) continue;
                  const off = Math.abs(p10 - 1000 / hz);
                  if (off <= 100 / hz && (!best || off < Math.abs(p10 - 1000 / best))) best = hz;
              }
              if (!best || best === cadenceHz) return;
              cadenceHz = best;
              setGovernorHz(best);
          }

          function applyQualityTier() {
              const t = QUALITY_TIERS[qualityTier];
              renderBudget.drawEveryN = t.drawEveryN;
              renderBudget.asciiCells = t.asciiCells;
              renderBudget.scale = t.scale;
              renderBudget.pixelCap = t.cap;
              resizeGlitchCanvas(true);
          }

          function governorStep(dtMs, workMs) {
              governorFrames++;
              emaFrameMs = emaFrameMs * 0.92 + dtMs * 0.08;
              if (workMs >= 0) emaWorkMs = emaWorkMs > 0 ? emaWorkMs * 0.9 + workMs * 0.1 : workMs;
              let lit = 0;
              for (let i = 0; i < profileNames.length; i++) {
                  if ((effectAlphas[profileNames[i]] || 0) > 0.05) lit++;
              }
              const heavy = (isContinuallyRandomizing ? 1 : 0) + (isAutoGlitching ? 1 : 0) + (lit > 6 ? 1 : 0) + (
                  isAiWarpActive ? 1 : 0) + (milk.active && milk.target > 0.001 ? 1 : 0);
              const slowThresh = (heavy >= 2 ? 24 : 27) * governorPace;
              const slowNeed = heavy >= 2 ? 50 : 80;
              const period = (1000 / 60) * governorPace;
              const headroom = emaFrameMs < period * 1.2 && emaWorkMs > 0 && emaWorkMs < GOVERNOR_UP_WORK * period;
              const upWait = governorRelapseWork > 0 && emaWorkMs > 0 &&
                  emaWorkMs < GOVERNOR_LIGHTER_WORK * governorRelapseWork ? 1 : governorUpWait;
              if (emaFrameMs > slowThresh) { governorSlow++;
                  governorFast = 0; } else if ((emaFrameMs < 14 * governorPace || headroom) && qualityTier > (renderBudget.lowPower ? 2 : 0)) {
                  governorFast++;
                  governorSlow = 0; } else { governorSlow = 0;
                  governorFast = 0; }
              if (governorSlow > slowNeed && qualityTier < 2) {
                  qualityTier++;
                  applyQualityTier();
                  if (governorFrames - governorUpAt < GOVERNOR_RELAPSE_FRAMES) {
                      governorUpWait = Math.min(GOVERNOR_MAX_WAIT, governorUpWait * 2);
                      governorRelapseWork = governorUpWork;
                  } else {
                      governorUpWait = 1;
                      governorRelapseWork = 0;
                  }
                  governorSlow = 0;
                  governorFast = 0;
              } else if (governorFast > GOVERNOR_UP_FRAMES * upWait && qualityTier > 0 && (heavy < 3 || headroom)) {
                  qualityTier--;
                  applyQualityTier();
                  governorUpAt = governorFrames;
                  governorUpWait = upWait;
                  governorUpWork = emaWorkMs;
                  emaWorkMs = 0;
                  governorSlow = 0;
                  governorFast = 0;
              }
          }

          function frame(now) {
              requestAnimationFrame(frame);
              if (document.hidden) { lastFrameTime = now; return; }
              const workStart = performance.now();
              const dtMs = now - lastFrameTime;
              const dt = Math.min(0.05, dtMs * 0.001);
              lastFrameTime = now;
              if (!document.body.classList.contains('playback-on')) {
                  noteFrameCadence(dtMs);
                  return;
              }
              customTime += dt * 1000;
              frameCount++;

              updateSmoothedStrengths(dt);
              stepLightHold(dt);
              stepLightArm(dt);
              updateComboProfile(performance.now());
              stepComboProfile(dt);
              stepPalette(now, dt);
              /* v11.2: the Harmonic Ensemble — the Key (rotating hue chord) and
                 the Ensemble (breath / resonance / crosstalk / shared stage)
                 step BEFORE any voice paints, so every factory reads the same
                 live harmony state this frame. */
              try { stepFxKey(now, dt); } catch (e) {}
              try { stepFxEnsemble(now, dt); } catch (e) {}
              try { softStep(now, dt); } catch (e) {}   /* R2 SOFT-EYE: ear → crescendo → burst gate */
              presetAutoStep(now); // v11: " -ʁ%AUTO%ʁ- " preset cycler (9.5–19.5s cadence, 3.8–6.6s in a crescendo)
              autoGlitchStep(now, dt);
              vsyncStepScript(now, dt);
              try { stepPresetTravel(now); } catch (e) {}
              if (isContinuallyRandomizing && !presetTravel.active) stepContinualRandomization(now, dt);
              /* Flash and Strobe follow their own switch, not Continual Randomization.
                 Paused or ended local media freezes their movement. */
              if (lightAutomationOn && !localMediaHeld()) stepLightWander(now, dt);
              // Aesthetic burst runs independently of CR — fires even if CR is off,
              // so long as at least one automation is active or effects are running.
              if (isContinuallyRandomizing || isAutoGlitching || isAutomatedMasters)
                  aestheticBurstStep(now);
              if (isAutomatedMasters) stepAutomatedMasters(now, dt);
              if (isAiWarpActive) {
                  updateAiWarp(now);
              } else {
                  const hueStrength = hueMasterLevel() * masterOpacity;
                  applyYouTubeWarpMotion(now, hueStrength);
              }
              let energy = 0,
                  count = 0;
              for (let i = 0; i < profileNames.length; i++) {
                  const a = heldLevel(profileNames[i]);
                  if (a > 0.01) { energy += a;
                      count++; }
              }
              energy = count ? energy / count : 0;
              beat += (energy * masterOpacity * boardHarmony() * (0.35 + 1.3 * clamp01(masterControls
                  .boardEnergy)) - beat) * Math.min(1, dt * 1.4);
              stepBwSweep(now);
              try { stepHueCycleFilter(dt); } catch (e) {}
              try { stepHslRainbowFilter(dt); } catch (e) {}
              try { updateShiftOverlay(now, dt); } catch (e) {}
              applyMasterFilters();
              if (now - lastPresetSkinUpdate > 220) { lastPresetSkinUpdate = now;
                  updatePresetSkin(); }
              antiWashoutStep(now, dt);
              updateContinuousEffectsCache();
              noteFrameCadence(dtMs);
              // A minimised or suspended window resumes with one long gap; it is not render load.
              governorStep(Math.min(dtMs, 250), drawWorkMs);
              drawWorkMs = -1;
              if ((frameCount % renderBudget.drawEveryN) === 0) {
                  draw(now);
                  drawWorkMs = performance.now() - workStart;
              }
          }

          (function adaptToConnection() {
              try {
                  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                  const save = !!(c && c.saveData);
                  const slow = c && (c.effectiveType === '2g' || c.effectiveType === 'slow-2g' || c
                      .effectiveType === '3g');
                  if (save || renderBudget.lowPower) { qualityTier = 2;
                      applyQualityTier(); } else if (slow) { qualityTier = Math.max(qualityTier, 1);
                      applyQualityTier(); }
              } catch (e) {}
              qualityFloor = qualityTier;
              if (window.GlitchHost && typeof window.GlitchHost.onDisplayRefresh === 'function')
                  window.GlitchHost.onDisplayRefresh(setDisplayRefresh);
          })();

          /* ------------------------------------------------------------------ *
           *  Easter egg: GHOST // OF ME + the 3.0 hidden track                 *
           *  Deliberate chord only (Ctrl+Alt+G) behind a photosensitivity       *
           *  confirmation. Never idle-triggered, never touches the clipboard.   *
           *  GHOST loads before the MISSING LINK track starts (ghostStartHook): *
           *  confirmed during playback, the chord loads it and switches to the  *
           *  track; confirmed before playback, it reveals the MISSING LINK card *
           *  (the 3.0 hidden track) in the gold panel on the landing page and   *
           *  in the link tree, and loads when that track is started. A typed    *
           *  or pasted MISSING LINK link loads it too. Flash and Strobe go      *
           *  through the same capped light path as presets; the automatic       *
           *  switch turns ON only behind this confirmation (or if it is already *
           *  ON). Hand locks hold.                                              *
           * ------------------------------------------------------------------ */
          (function installEasterEgg() {
              /* Hidden user snapshot from the projector app, restored as saved
                 (including automation) through the LAB effect-name mapping. */
              const GHOST_OF_ME = Object.freeze({"name":"GHOST // OF ME","settings":{"version":3,"masterOpacity":0.33,"effects":{"ASCII":0.26,"B&W Invert":1,"Cyber Rain":1,"Data Bands":0.7514000000357629,"Data Bomb":0.4104499999880806,"Flash":0.2410999997705262,"Font Burn":0.4958999998420481,"Gemini Bomb":0.6959500000625881,"HSL Rainbow":0.6052500001639146,"Hue/Color Cycle":1,"Neon Grad":0.3301500000804669,"Orbit HUD":0.17034999988973326,"Prism Rift":0.572949999988082,"R3 Data Bomb":0.39250000002980406,"R3 Gemini Bomb":0.49835000003874536,"R3 Ghost Spectrum":0.4439999999403973,"R3 Ink Glyphs":0.47480000010132933,"R3 Matrix ASCII":0.660549999877812,"R3 Matrix Chord":0.22625000002980267,"R3 Neon Grad":0.3669499999284767,"R3 Scanlines":0.4869000000804658,"R3 Tech Artist":0.9487999999821211,"R3 V-Sync":0.6183499998152283,"Scanlines":0.46410000000894275,"Signal Tear":1,"Strobe":0.4390000001043095,"VHS Glitch":0.15880000004172684},"isAutoGlitching":true,"isContinuallyRandomizing":true,"isAiWarpActive":true,"sliderLocks":{"global":true,"ASCII":true,"B&W Invert":true,"Cyber Rain":true,"Data Bands":false,"Data Bomb":false,"Flash":false,"Font Burn":false,"Gemini Bomb":false,"HSL Rainbow":false,"Hue/Color Cycle":true,"Neon Grad":false,"Orbit HUD":false,"Prism Rift":false,"R3 Data Bomb":false,"R3 Gemini Bomb":false,"R3 Ghost Spectrum":false,"R3 Ink Glyphs":false,"R3 Matrix ASCII":false,"R3 Matrix Chord":false,"R3 Neon Grad":false,"R3 Scanlines":false,"R3 Tech Artist":false,"R3 V-Sync":false,"Scanlines":false,"Signal Tear":true,"Strobe":false,"VHS Glitch":false},"glyphBank":"All scripts","randomSeed":0.494,"customTime":21312531.21593429}});
              const GHOST_TRACK_URL = 'https://www.youtube.com/watch?v=DmStNF35o1w';
              const GHOST_FONTS = ['"Courier New", monospace', 'monospace', '"Arial Black", sans-serif',
                  'Impact, sans-serif', 'Georgia, serif', '"Times New Roman", serif', 'Verdana, sans-serif'];
              const ghostLink = $('ghostLink');
              const welcomeGhostLink = $('welcomeGhostLink');
              let ghostSettings = null;
              let running = false;
              /* set for the session once the GHOST warning is confirmed */
              let ghostConsent = false;
              let ghostAttempts = 0;
              bindSuggestedStart(ghostLink, GHOST_TRACK_URL, false);
              /* The landing-page copy of the card leaves the welcome screen first,
                 so the playback UI can take over once the track starts. If the
                 track cannot start, the link tree stays open on the same card. */
              if (welcomeGhostLink) welcomeGhostLink.addEventListener('click', (e) => {
                  e.preventDefault();
                  if (!document.body.classList.contains('welcome-dismissed') && welcomeEnterBtn) welcomeEnterBtn.click();
                  if (!startPlayback(GHOST_TRACK_URL, false) && ghostLink) ghostLink.focus();
              });

              function applyGhostNow() {
                  if (!ghostSettings) ghostSettings = mapLabSnapshot(GHOST_OF_ME.settings);
                  /* Flash and Strobe land through the capped light path in
                     applySettings; a hand lock on either keeps its level. */
                  applySettings(ghostSettings);
                  /* GHOST lands at once instead of gliding like other presets
                     (+1 ms so float rounding cannot leave the glide active) */
                  if (presetTravel.active) stepPresetTravel(presetTravel.start + presetTravel.dur + 1);
                  /* The automatic movement turns ON only behind the GHOST warning
                     (or when already ON); a typed link without it keeps the capped
                     saved levels still. Motion still needs continual randomization. */
                  const automate = ghostConsent || lightAutomationOn;
                  if (automate) setLightAutomation(true);
                  updateContinuousEffectsCache();
                  /* show the saved seed without re-rolling the board */
                  if (randomSeedSlider) randomSeedSlider.value = String(GHOST_OF_ME.settings.randomSeed);
                  const lights = ['Flash', 'Strobe'].map((name) => name + ' ' + Math.round((effectAlphas[name] || 0) * 100) + '%');
                  setCurrentPresetDisplay('LOADED: ' + GHOST_OF_ME.name + ' [HIDDEN]');
                  return GHOST_OF_ME.name + ' loaded \u00b7 ' + lights.join(' \u00b7 ') + (automate ?
                      ' \u00b7 Flash & Strobe (automatic) ON.' : ' \u00b7 automatic movement OFF (Ctrl+Alt+G turns it on).');
              }
              /* Returns the loaded notice, or '' after reporting a failure. */
              function applyGhostSafely() {
                  ghostAttempts++;
                  try {
                      return applyGhostNow();
                  } catch (err) {
                      showNotificationMessage('GHOST // OF ME could not be loaded: ' + err.message, 5000);
                      return '';
                  }
              }
              ghostStartHook = applyGhostSafely;

              /* The 3.0 reveal: crimson DATA.. scatter in switching fonts, a lime
                 "!", DATA.. again, then the "!" fades (about 3.2 s), over a whole-app
                 hue sweep with three black-and-white inversion snaps (CSS). Reduced
                 motion gets one still grayscale frame instead. */
              function playGhostShow(onDone) {
                  const rootEl = document.documentElement;
                  const still = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
                  const layer = document.createElement('div');
                  layer.className = 'ghost-egg-layer';
                  layer.setAttribute('aria-hidden', 'true');
                  const bang = document.createElement('div');
                  bang.className = 'ghost-egg-bang';
                  bang.textContent = '!';
                  const words = [];
                  const timers = [];
                  let fontTimer = 0;
                  const later = (ms, fn) => { timers.push(setTimeout(fn, ms)); };
                  const randomFont = () => GHOST_FONTS[(Math.random() * GHOST_FONTS.length) | 0];
                  const scatter = (count) => {
                      words.forEach((el) => el.remove());
                      words.length = 0;
                      for (let i = 0; i < count; i++) {
                          const el = document.createElement('div');
                          el.className = 'ghost-egg-data';
                          el.textContent = 'DATA..';
                          el.style.top = (Math.random() * 90).toFixed(1) + 'vh';
                          el.style.left = (Math.random() * 90).toFixed(1) + 'vw';
                          el.style.fontSize = (5 + Math.random() * 10).toFixed(1) + 'vw';
                          el.style.fontFamily = randomFont();
                          layer.appendChild(el);
                          words.push(el);
                      }
                  };
                  const flicker = (on) => {
                      clearInterval(fontTimer);
                      fontTimer = 0;
                      if (on) fontTimer = setInterval(() => {
                          words.forEach((el) => { el.style.fontFamily = randomFont(); });
                      }, 50);
                  };
                  const fadeWords = () => {
                      flicker(false);
                      words.forEach((el) => { el.style.opacity = '0'; });
                  };
                  const finish = () => {
                      timers.forEach(clearTimeout);
                      flicker(false);
                      layer.remove();
                      rootEl.classList.remove('ghost-egg-show', 'ghost-egg-still');
                      onDone();
                  };
                  document.body.appendChild(layer);
                  if (still) {
                      rootEl.classList.add('ghost-egg-still');
                      scatter(1);
                      words[0].style.top = '10vh';
                      words[0].style.left = '6vw';
                      words[0].style.fontSize = '9vw';
                      layer.appendChild(bang);
                      later(2400, finish);
                      return;
                  }
                  rootEl.classList.add('ghost-egg-show');
                  scatter(10);
                  flicker(true);
                  later(400, fadeWords);
                  later(500, () => { scatter(0); layer.appendChild(bang); });
                  later(2000, () => { scatter(10); flicker(true); });
                  later(2400, () => { fadeWords(); bang.style.opacity = '0'; });
                  later(3200, finish);
              }

              document.addEventListener('keydown', (e) => {
                  if (!e.ctrlKey || !e.altKey || e.shiftKey || e.metaKey || e.repeat) return;
                  /* The physical G key works on any layout; inside a text field only
                     a typed g counts, so an AltGr character never opens the warning. */
                  if (String(e.key).toLowerCase() !== 'g' && (e.code !== 'KeyG' || isTypingTarget(e.target))) return;
                  e.preventDefault();
                  if (running) return;
                  if (!window.confirm('GHOST // OF ME - photosensitivity warning: flashing DATA text, strobe, whole-app hue and black-and-white inversion, and continual randomization. GHOST loads when its MISSING LINK track starts (during playback the track starts now), and it turns the Flash & Strobe (automatic) switch ON: Flash is capped at 20% and Strobe at 35%, and both move on their own while the switch is ON. This is not a photosensitivity-safe mode. Continue?')) return;
                  running = true;
                  ghostConsent = true;
                  const playing = document.body.classList.contains('playback-on');
                  if (playing) {
                      /* load now: the start hook applies GHOST, then the track
                         replaces the current source. If YouTube is unavailable,
                         GHOST still lands over the current source. */
                      const attempts = ghostAttempts;
                      if (!startPlayback(GHOST_TRACK_URL, false) && ghostAttempts === attempts) {
                          const notice = applyGhostSafely();
                          if (notice) showNotificationMessage(notice, 5200);
                      }
                  } else {
                      if (ghostLink) {
                          ghostLink.hidden = false;
                          ghostLink.style.display = '';
                      }
                      if (welcomeGhostLink) welcomeGhostLink.hidden = false;
                      if (ytInput) ytInput.value = GHOST_TRACK_URL;
                  }
                  /* The cards can be clicked while the show runs (the egg layer
                     never blocks input), so the reveal at its end yields to any
                     source start or GHOST load that happened meanwhile. */
                  const sourceGeneration = localMediaGeneration;
                  const showAttempts = ghostAttempts;
                  playGhostShow(() => {
                      running = false;
                      if (playing || document.body.classList.contains('playback-on')) return;
                      if (localMediaGeneration !== sourceGeneration || ghostAttempts !== showAttempts) return;
                      document.documentElement.classList.add('ghost-egg-armed');
                      /* The show plays where the chord was pressed: on the landing page
                         the card waits in the gold panel, otherwise in the link tree. */
                      const onLanding = !document.body.classList.contains('welcome-dismissed');
                      const card = onLanding ? welcomeGhostLink : ghostLink;
                      if (card) card.focus();
                      showNotificationMessage('MISSING LINK revealed \u00b7 start it to load GHOST // OF ME.', 5200);
                  });
              });
          })();

          /* ------------------------------------------------------------------ *
           *  23. Init                                                            *
           * ------------------------------------------------------------------ */
          resizeGlitchCanvas(true);
          requestAnimationFrame(frame);
          requestAnimationFrame(() => hideTab());
          if (!isHttpOrigin()) {
              showNotificationMessage(
                  'Running from file:// — YouTube disabled. Click any suggested link or "Open Local MP3/MP4" to unlock controls, or click "Fade WHITE 2 BLACK 2 WHITE" (loops the video when served over http).',
                  7000);
          }
      })();

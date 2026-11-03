
;/* ===== r3_gc3_factories.js ===== */
/**
 * GC#(3) FACTORY BANK — Glitch Revision 3 integration
 * Source factory block: https://www.imortalimp.nl/glitch-canvas-html/Glitch-Revision-3.html
 *
 * Important: the factory source between the two R3 markers below is copied verbatim
 * from Revision 3. This bridge deliberately does not rewrite the R3 factory bodies.
 * It gives them an isolated Canvas/WebGL runtime and maps their original names onto
 * the separate " GC#(3)" voice rails in AI Warp Engine.
 *
 * No SVG filters, filter URLs, or SVG scripting are used here.
 */
(function (root) {
    'use strict';

    const GC3_SUFFIX = ' GC#(3)';
    const GC3_BASE_VOICES = [
        'ASCII', 'B&W Invert', 'Data Bands', 'Data Bomb', 'Flash', 'Font Burn',
        'Gemini Bomb', 'HSL Rainbow', 'Hue/Color Cycle', 'Ink Glyphs',
        'Matrix ASCII', 'Matrix Chord', 'Neon Grad', 'Scanlines', 'Strobe',
        'Tech Artist', 'VHS Glitch'
    ];

    /* R3 runtime bridge — only the host bindings live outside the verbatim block. */
    let gctx = null;
    let mainCanvas = null;
    let effectAlphas = Object.create(null);
    let masterOpacity = 0.95;
    let masterControls = { effectIntensity: 1, motionScale: 0.8, blendSoftness: 0.5, boardEnergy: 0.65 };
    let isAiWarpActive = true;
    let videoPalette = { hue: 205, sat: 65, light: 45, energy: 0.5, motion: 0.1, darkness: 0.55 };
    let comboProfile = { glowMult: 1, satMult: 1, contrastMult: 1 };
    let customTime = 0;
    let beat = 0;
    let currentEngine = null;
    let currentDepth = 1;
    let activeEffects = []; // only used by R3's one-shot helper; GC#(3) runs persistent factories.
    const renderBudget = { asciiCells: 21000 };
    /* Host scratch surface used by the Data Bands / VHS Glitch GC#(3) slicers. */
    const scratch = root.document && root.document.createElement ? root.document.createElement('canvas') : { width: 0, height: 0 };
    const scratchCtx = scratch.getContext ? scratch.getContext('2d') : null;
    /* Film-grain glow multiplier for the Data Bands slicer; follows the Motion master. */
    const motionGlow = () => 0.85 + 0.30 * Math.max(0, Math.min(1, masterControls.motionScale));
    /* R3's Data Bomb and ASCII factory block expects the original glyph atlas.
       This self-contained atlas is host plumbing; the R3 factory source below
       remains byte-for-byte unchanged. */
    function buildR3Atlas() {
        const chars = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-=[]{}<>?/|░▒▓█▄▀■□△▲▽▼◆◇○●アイウエオカキクケコサシスセソ');
        const tile = 32, cols = 16, rows = Math.ceil(chars.length / cols);
        if (!root.document || typeof root.document.createElement !== 'function') {
            return { chars, count: chars.length, tile, canvas: null };
        }
        const canvas = root.document.createElement('canvas');
        canvas.width = cols * tile;
        canvas.height = rows * tile;
        const ctx = canvas.getContext && canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            chars.forEach((ch, index) => ctx.fillText(ch, (index % cols) * tile + tile / 2, ((index / cols) | 0) * tile + tile / 2));
        }
        return { chars, count: chars.length, tile, canvas };
    }
    const atlas = buildR3Atlas();
    let tintAtlas = null;

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, +v || 0));
    const clamp01 = (v) => clamp(v, 0, 1);
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeExp = (a, b, dt, rate) => a + (b - a) * (1 - Math.exp(-Math.max(0, rate || 1) * Math.max(0, dt || 0)));

    function srcEnergyK() { return clamp(videoPalette.energy, 0.05, 1); }
    function srcMotionK() { return clamp(videoPalette.motion, 0, 1); }
    function srcAppetite() { return clamp01((videoPalette.sat - 30) / 60); }
    function srcSpreadK() { return clamp(1.15 - videoPalette.sat / 140, 0.35, 1.05); }
    function srcDarkK() { return clamp01(videoPalette.darkness); }
    const R16 = {
        bwInvCap: () => 0.75, scanGap: () => 2.5 * (1 - srcMotionK()),
        strobeP: () => 0.9 * (1.25 - 0.45 * srcEnergyK()), strobeW: () => 0.85 + 0.30 * srcEnergyK(),
        bandWob: () => 0.80 + 0.40 * srcMotionK(), vhsAmp: () => 0.80 + 0.20 * srcEnergyK() + 0.20 * srcMotionK(),
        bombReach: () => 0.85 + 0.30 * srcAppetite(), inkScale: () => 0.85 + 0.30 * srcDarkK(),
        sigilBias: () => 0.30 + 0.40 * srcDarkK(), neonVeil: () => 0.80 + 0.40 * srcDarkK(),
        wordVivid: () => srcAppetite(), fontScale: () => 0.85 + 0.30 * srcAppetite(),
        spinK: () => 0.62 + 1.12 * srcMotionK(), rainbowSat: () => 0.85 + 0.30 * srcAppetite(),
        asciiGap: () => 1.18 - 0.36 * srcAppetite(), geminiK: () => 0.80 + 0.40 * srcEnergyK(),
        inkLife: () => 0.75 + 0.50 * srcDarkK(), echoPace: () => 1.30 - 0.55 * srcEnergyK()
    };
    const SOFT = { ok: false, k: 1, beat: 0 };
    function softK() { return SOFT.k; }
    function getGhostMode() {
        return currentEngine ? currentEngine.ghostModes[currentEngine.ghostModeIndex] : 'OFF';
    }
    function getVsyncMode() {
        return currentEngine ? currentEngine.vsyncModes[currentEngine.vsyncModeIndex] : 'OFF';
    }
    function boardFilterCtx() {
        return { ghost: getGhostMode(), vsync: getVsyncMode(), warp: isAiWarpActive, bw: effectAlphas['B&W Invert'] || 0 };
    }
    function bwInvertMap(level) {
        if (root.GlitchEngine && typeof root.GlitchEngine.bwInvertMap === 'function') return root.GlitchEngine.bwInvertMap(level);
        const t = clamp01(level);
        return { hueDeg: t * 360, invert: t > 0.5 ? ((t - 0.5) / 0.5) * 0.75 : 0, sat: 1, contrast: 1, live: t > 0.008 };
    }
    function fxConfluenceHue(wobble) {
        const h = videoPalette.hue + (effectAlphas['Hue/Color Cycle'] || 0) * customTime * 0.018 + (wobble || 0);
        return ((h % 360) + 360) % 360;
    }
    function fxConfluenceHsl() { return { h: fxConfluenceHue(0), s: clamp(videoPalette.sat, 20, 100), l: clamp(videoPalette.light, 20, 80) }; }
    function fxConfluenceSat() { return fxConfluenceHsl().s; }
    function fxConfluenceLight() { return fxConfluenceHsl().l; }
    function effectLiveStrength(name) { return clamp01(effectAlphas[name] || 0) * masterOpacity; }
    function effectPaintAlpha(name, strength, mult) {
        return clamp01(strength) * masterOpacity * clamp(masterControls.effectIntensity, 0.1, 1.5) *
            Math.max(0.35, +mult || 1) * currentDepth;
    }

    /* ===== BEGIN VERBATIM GLITCH REVISION 3 FACTORY SOURCE ===== */
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
                            warp: isAiWarpActive, bw: effectAlphas['B&W Invert'] || 0
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

            /* ================= THE ENSEMBLE — breath / resonance / stage ====== */
            const FX_VOICE_NAMES = ['Neon Grad', 'Scanlines', 'Flash', 'HSL Rainbow', 'ASCII',
                'Font Burn', 'Strobe', 'Gemini Bomb', 'Tech Artist', 'Data Bands', 'VHS Glitch',
                'Data Bomb', 'Ink Glyphs', 'Matrix ASCII', 'Matrix Chord'
            ];
            /* fixed resonance offsets — neighbours in this list answer each other */
            const FX_RESOFF = {
                'Neon Grad': 0.00, 'Strobe': 0.09, 'Scanlines': 0.17, 'Data Bands': 0.26,
                'Flash': 0.34, 'Font Burn': 0.42, 'Tech Artist': 0.50, 'HSL Rainbow': 0.59,
                'Gemini Bomb': 0.67, 'ASCII': 0.76, 'VHS Glitch': 0.84, 'Data Bomb': 0.92,
                'Ink Glyphs': 0.96, 'Matrix ASCII': 0.80, 'Matrix Chord': 0.88
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
            const FX_PRESENCE_NAMES = FX_VOICE_NAMES.concat(['B&W Invert', 'Hue/Color Cycle']);
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
                    g.addColorStop(0.00, fxHsla(hue, 62, 78,                     Math.min(0.85, a * 0.85)));
                                        g.addColorStop(0.22, fxHsla(hue, 62, 66, a * 0.46));
                                        g.addColorStop(0.55, fxHsla(hue, 56, 56, a * 0.22));
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
                    const bwN = bwInvertMap(effectAlphas['B&W Invert'] || 0);
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
                        const ribA = Math.min(0.62, a * 1.0) * (0.78 + 0.22 * FX_ENS.breath);
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
                    const veilA = Math.min(0.30, a * 0.55) * (0.65 + 0.35 * FX_ENS.breath) *
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
                    /* v6.4.27 colour wash: tints the whole composition so Neon Grad reads clearly */
                    gctx.globalCompositeOperation = 'overlay';
                    gctx.fillStyle = fxHsla(h0, 85, 52, Math.min(0.42, a * 0.55));
                    gctx.fillRect(0, 0, w, h);
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
                    const bw = bwInvertMap(effectAlphas['B&W Invert'] || 0);
                    const bwP = clamp01(FX_ENS.presence['B&W Invert'] || bw.t || 0);
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

            /* v6.4.27 CONTINUAL ASCII SHEET: a full-frame character sheet derived from
               the live canvas (source + voices) luminance, mapped onto a density ramp
               and the glyph atlas. When the canvas is transparent (YouTube iframe) or
               unreadable, a flowing procedural field keeps the stream running. */
            const ASCII_SHEET = { cv: null, cx: null, cols: 0, rows: 0, lum: null, cov: 0, sampledAt: -1e9, ramp: null };
            function paintAsciiSheet(w, h, s, master, baseHue, now) {
                const budget = Math.min(renderBudget.asciiCells, 7000);
                const sp = Math.max(9, Math.round(Math.sqrt((w * h) / budget)));
                const cols = Math.max(4, Math.ceil(w / sp)), rows = Math.max(4, Math.ceil(h / sp));
                const S = ASCII_SHEET;
                if (!S.cv && root.document && root.document.createElement) {
                    S.cv = root.document.createElement('canvas');
                    S.cx = S.cv.getContext('2d', { willReadFrequently: true });
                }
                if (!S.ramp) {
                    const alpha = (atlas.chars || []).filter((c) => /[A-Z0-9@#$%&*+=<>?|]/.test(c));
                    S.ramp = ['.', ':', '-', '~', '=', '+', '*', 'x', '#', '%', '@'].concat(['░', '▒', '▓', '█']);
                    S.alpha = alpha.length ? alpha : ['0', '1'];
                }
                if (S.cols !== cols || S.rows !== rows || !S.lum) {
                    S.cols = cols; S.rows = rows;
                    S.lum = new Float32Array(cols * rows);
                    S.sampledAt = -1e9;
                    if (S.cv) { S.cv.width = cols; S.cv.height = rows; }
                }
                if (S.cx && now - S.sampledAt > 90) {
                    S.sampledAt = now;
                    try {
                        S.cx.clearRect(0, 0, cols, rows);
                        S.cx.drawImage(mainCanvas, 0, 0, cols, rows);
                        const px = S.cx.getImageData(0, 0, cols, rows).data;
                        let covered = 0;
                        for (let i = 0, n = cols * rows; i < n; i++) {
                            const a = px[i * 4 + 3] / 255;
                            S.lum[i] = a > 0.05 ? (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255 : -1;
                            if (a > 0.05) covered++;
                        }
                        S.cov = covered / (cols * rows);
                    } catch (e) { S.cov = 0; }
                }
                const t = now * 0.001;
                const tick = Math.floor(now / 140);
                const ramp = S.ramp, rl = ramp.length - 1;
                const hue = fxLerpHue(videoPalette.hue, baseHue, 0.5);
                const aBase = Math.min(0.85, master * 0.9) * (0.6 + 0.4 * s);
                const LEVELS = 6;
                const buckets = [];
                for (let k = 0; k < LEVELS; k++) buckets.push([]);
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const i = r * cols + c;
                        let L = S.cov > 0.25 ? S.lum[i] : -1;
                        if (L < 0) {
                            L = 0.5 + 0.28 * Math.sin(c * 0.23 + t * 1.3) + 0.22 * Math.sin(r * 0.31 - t * 0.9 + c * 0.07);
                        }
                        L = clamp01(L * (0.8 + 0.4 * beat));
                        if (L < 0.12) continue;
                        const seed = ((c * 131 + r * 337 + tick * 53) % 997) / 997;
                        const ch = seed < 0.1 * (0.4 + L) ? S.alpha[(c * 7 + r * 13 + tick) % S.alpha.length] : ramp[Math.min(rl, (L * rl) | 0)];
                        buckets[Math.min(LEVELS - 1, (L * LEVELS) | 0)].push(ch, c * sp, r * sp);
                    }
                }
                gctx.save();
                gctx.textBaseline = 'top';
                gctx.font = 'bold ' + Math.max(8, sp - 1) + 'px "Courier New", monospace';
                for (let k = 0; k < LEVELS; k++) {
                    const list = buckets[k];
                    if (!list.length) continue;
                    const lv = (k + 1) / LEVELS;
                    gctx.fillStyle = fxHsla((hue + k * 7) % 360, 78, 38 + lv * 40, aBase * (0.35 + 0.65 * lv));
                    for (let j = 0; j < list.length; j += 3) gctx.fillText(list[j], list[j + 1], list[j + 2]);
                }
                gctx.restore();
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
                const chSet = atlas.chars || window.__ASCII_CHARS || ['0', '1'];
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
                    try { paintAsciiSheet(w, h, s, master, fxLerpHue(fxTone(0), 120, 0.55), now); } catch (e) {}
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
                        gctx.save();
                        gctx.textBaseline = 'top';
                        gctx.globalCompositeOperation = 'difference';
                        /* R1.4: the scatter's rainbow is source-keyed — a
                           colorful video pulls the field toward its own
                           spectrum; a grey one lets the full wheel fly */
                        const scatterHue = (videoPalette.hue +
                            (Math.random() - 0.5) * 360 * srcSpreadK() + 360) % 360;
                        gctx.fillStyle = fxHsla(scatterHue, 100, 70,
                            Math.min(1, 0.8 * s) * rotW);
                        gctx.font = 'bold ' +
                            (sp006 + (Math.random() - 0.5) * s * 1.5).toFixed(1) +
                            'px monospace';
                        for (let yy = 0; yy < h; yy += sp006) {
                            for (let xx = 0; xx < w; xx += sp006) {
                                if (Math.random() < 0.5) {
                                    gctx.fillText(
                                        chSet[(Math.random() * chSet.length) | 0], xx, yy);
                                }
                            }
                        }
                        gctx.restore();
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
                        const bank = FX_GLYPH_BANK;
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
                        const hcyc = effectAlphas['Hue/Color Cycle'] || 0;
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
                    const hueCycleStrength = effectAlphas['Hue/Color Cycle'] || 0;
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
                    const tile = atlas.tile;
                    const src = tintAtlas || atlas.canvas;
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
                        if (m.glyph === 0 || Math.random() < 0.02) m.glyph = (Math.random() * atlas.count) | 0;
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
                const MAX_INK = 30; // concurrent stamp cap
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
                       swelling flurry across a timed burst */
                    let rate = (0.8 + 5.4 * s) * (0.45 + 0.55 * FX_ENS.breath) *
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
                    warp: isAiWarpActive, bw: effectAlphas['B&W Invert'] || 0
                });
                const spawnStream = (w, h, realm) => {
                    const E = window.GlitchEngine;
                    const size = 11 + Math.random() * 13;
                    const depth = 8 + ((Math.random() * 16) | 0);
                    const glyphs = [];
                    for (let k = 0; k < depth; k++) {
                        glyphs.push({
                            ch: (E && E.pickGlyph) ? E.pickGlyph(realm, Math.random, k % 3) : '01'[(Math.random() * 2) | 0],
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
                    const bw = bwInvertMap(effectAlphas['B&W Invert'] || 0);
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
                                st.glyphs[k].ch = (E && E.pickGlyph) ? E.pickGlyph(realm, Math.random, 0) : st.glyphs[k].ch;
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
                    warp: isAiWarpActive, bw: effectAlphas['B&W Invert'] || 0
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
                    const bw = bwInvertMap(effectAlphas['B&W Invert'] || 0);
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
                                ch: (E && E.pickGlyph) ? E.pickGlyph(realm, Math.random, tone) : '♪',
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
                                d.ch = (E && E.pickGlyph) ? E.pickGlyph(realm, Math.random, tone) : d.ch;
                            }
                            if (Math.random() < 0.08) {
                                d.ch = (E && E.pickGlyph) ? E.pickGlyph(realm, Math.random, tone) : d.ch;
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

    /* ===== END VERBATIM GLITCH REVISION 3 FACTORY SOURCE ===== */

    const R3_FACTORY_DEFS = [
        ['Neon Grad', glitchNeonGradientOverlayFactory],
        ['Scanlines', glitchScanlinesFactory],
        ['Flash', glitchBrightFlashFactory],
        ['HSL Rainbow', glitchHSLRainbowFactory],
        ['ASCII', glitchASCIIArtOverlayFactory],
        ['Font Burn', glitchFontBurnFactory],
        ['Strobe', glitchStrobeFactory],
        ['Gemini Bomb', glitchGeminiBombFactory],
        ['Tech Artist', glitchTechArtistShaderFactory],
        ['Data Bands', glitchVHSFactory],
        ['VHS Glitch', glitchVHSGlitchFactory],
        ['Data Bomb', glitchDataBombFactory],
        ['Ink Glyphs', glitchInkGlyphsFactory],
        ['Matrix ASCII', glitchMatrixAsciiFactory],
        ['Matrix Chord', glitchMatrixChordFactory]
    ];

    let lastFrameAt = -1;
    let lastFrameTime = 0;

    function bindR3Context(engine, context, now) {
        currentEngine = engine;
        gctx = context;
        mainCanvas = engine.canvas;
        customTime = now;
        masterOpacity = clamp01(engine.masterOpacity == null ? 0.95 : engine.masterOpacity);
        masterControls = {
            effectIntensity: clamp(engine.boardEnergy == null ? 0.65 : engine.boardEnergy, 0.1, 1.5),
            motionScale: engine.motionScale == null ? 0.8 : engine.motionScale,
            blendSoftness: engine.blendSoftness == null ? 0.5 : engine.blendSoftness,
            boardEnergy: engine.boardEnergy == null ? 0.65 : engine.boardEnergy
        };
        isAiWarpActive = !!engine.aiWarpActive;
        const p = engine.videoPalette || {};
        const saturation = p.sat == null ? 65 : (p.sat <= 1.001 ? p.sat * 100 : p.sat);
        const brightness = p.brightness == null ? 0.45 : p.brightness;
        const blend = root.R3GhostVsync && typeof root.R3GhostVsync.getWarpBlendProfile === 'function'
            ? root.R3GhostVsync.getWarpBlendProfile(engine.aiWarpMode) : { canvas:1, softEye:1, ear:1 };
        videoPalette = {
            hue: p.hue == null ? 205 : p.hue,
            sat: clamp(saturation, 10, 100),
            light: clamp(brightness <= 1.001 ? brightness * 100 : brightness, 10, 90),
            energy: clamp01((p.energy == null ? (engine.audioDrive || {}).drive || 0.5 : p.energy) * blend.canvas),
            motion: clamp01((p.motion == null ? 0.1 : p.motion) * blend.canvas),
            darkness: clamp01(p.darkness == null ? 1 - brightness : p.darkness)
        };
        comboProfile = { glowMult: 0.9 + videoPalette.energy * 0.25, satMult: 1, contrastMult: 1 };
        SOFT.k = clamp01((engine.softEyeK == null ? 1 : engine.softEyeK || 1) * blend.softEye);
        SOFT.beat = clamp01(((engine.audioDrive || {}).beat || 0) * blend.ear);
        beat = SOFT.beat;
        effectAlphas = new Proxy(Object.create(null), {
            get: (_, key) => typeof key === 'string' ? clamp01(engine.effectAlphas[key + GC3_SUFFIX] || 0) : 0,
            has: (_, key) => typeof key === 'string' && (key + GC3_SUFFIX) in engine.effectAlphas
        });
        if (lastFrameAt !== now) {
            const dt = lastFrameAt < 0 ? 0.016 : Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
            lastFrameAt = now;
            lastFrameTime = now;
            try { stepFxKey(now, dt); } catch (e) {}
            try { stepFxEnsemble(now, dt); } catch (e) {}
        }
    }

    function makeR3Runner(engine, baseName, factory) {
        const render = factory(() => clamp01(engine.liveAlpha(baseName + GC3_SUFFIX)), true);
        return function renderGC3Voice(context, now) {
            bindR3Context(engine, context, now || performance.now());
            const size = clamp(engine.sizeFor(baseName + GC3_SUFFIX), 0.2, 3);
            currentDepth = clamp01(engine.depthFor(baseName + GC3_SUFFIX));
            if (engine.liveAlpha(baseName + GC3_SUFFIX) <= 0.001 || currentDepth <= 0.001) return;
            context.save();
            if (Math.abs(size - 1) > 0.01) {
                context.translate(engine.canvas.width * 0.5, engine.canvas.height * 0.5);
                context.scale(size, size);
                context.translate(-engine.canvas.width * 0.5, -engine.canvas.height * 0.5);
            }
            try { render(); } finally { context.restore(); }
        };
    }

    /* These rails are applied after the complete canvas has been composed by the
       engine, so they transform source artwork and overlays together. */
    function makeBwRunner() { return function renderGC3Bw() {}; }
    function makeHueRunner() { return function renderGC3Hue() {}; }

    root.GC3FactoryBank = {
        source: 'Glitch Revision 3',
        suffix: GC3_SUFFIX,
        baseVoices: GC3_BASE_VOICES.slice(),
        voiceNames: GC3_BASE_VOICES.map((name) => name + GC3_SUFFIX),
        createRunners(engine) {
            const runners = R3_FACTORY_DEFS.map(([name, factory]) => makeR3Runner(engine, name, factory));
            runners.push(makeBwRunner(engine), makeHueRunner(engine));
            return runners;
        }
    };
})(typeof window !== 'undefined' ? window : this);


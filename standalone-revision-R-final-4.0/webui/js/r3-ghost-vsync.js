
;/* ===== r3_ghost_vsync.js ===== */
/**
 * R3 GHOST PROTOCOL + V-SYNC ENGINE
 * Canvas-only integration of the Ghost Protocol v11 / V-Sync v11 behaviour from
 * Glitch Revision 3. SVG filter mutation and filter URLs are deliberately omitted:
 * the same confluence, channel-split, tracking, scan, roll, burst, and automation
 * behaviour is rendered by Canvas/WebGL-safe primitives instead.
 */
(function (root) {
    'use strict';

    const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
    const clamp01 = value => clamp(value, 0, 1);
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeExp = (a, b, dt, rate) => a + (b - a) * (1 - Math.exp(-Math.max(0, rate) * Math.max(0, dt)));
    const mod = (value, range) => ((value % range) + range) % range;

    const FALLBACK_GHOSTS = {
        DIA:      { split: 0.88, chan: 0.72, lines: 0.50, glow: 0.22, warp: 0.38, blur: 0.35, hueA: 313, hueB: 145, sat: 1.22, gray: 0.06, crt: 0, led: 0, dia: 1, realm: 'mix' },
        SPECTRUM: { split: 1.00, chan: 0.90, lines: 1.00, glow: 0.45, warp: 0.70, blur: 1.00, hueA: 135, hueB: 75, sat: 1.45, gray: 0.30, crt: 0, led: 0, dia: 0, realm: 'mix' },
        CRT:      { split: 0.70, chan: 0.65, lines: 1.65, glow: 0.30, warp: 0.45, blur: 0.80, hueA: 55, hueB: 25, sat: 0.85, gray: 0.74, crt: 1, led: 0, dia: 0, realm: 'reality' },
        PLASMA:   { split: 1.15, chan: 1.00, lines: 0.80, glow: 0.60, warp: 0.95, blur: 1.25, hueA: 195, hueB: 100, sat: 1.85, gray: 0.16, crt: 0, led: 0, dia: 0, realm: 'virtual' },
        LED:      { split: 1.38, chan: 1.22, lines: 0.22, glow: 0.90, warp: 1.12, blur: 0.12, hueA: 0, hueB: 120, sat: 2.05, gray: 0.00, crt: 0, led: 1, dia: 0, realm: 'virtual' }
    };

    const FALLBACK_VSYNC = {
        ON:        { bar: 1.00, tears: 0.55, roll: 0.00, hum: 0.35, snap: 0, sharp: 0.62, scanphase: 1.00, harmony: 0.28 },
        GHOST_OFF: { bar: 0.35, tears: 0.12, roll: 0.14, hum: 0.18, snap: 0, sharp: 0.40, scanphase: 0.32, harmony: 1.00 },
        FULL:      { bar: 1.15, tears: 1.00, roll: 0.85, hum: 0.85, snap: 1, sharp: 1.00, scanphase: 0.88, harmony: 0.55 }
    };

    // Deterministic per-AI-Warp blend tuning. Values are intentionally restrained;
    // they shape Ghost/V-Sync character without changing the user's master levels.
    const WARP_BLEND = {
        ai_zero:                [0.60,0.60,0.60,0.60,0.70, 0.60,0.60,0.60,0.60, 0],
        liquid:                 [1.06,0.96,0.90,0.90,0.92, 0.82,0.82,0.70,0.86, 0],
        prism:                  [0.82,1.08,1.06,1.02,1.04, 1.02,0.92,0.78,0.92, 72],
        breathe:                [0.94,0.90,0.78,0.78,0.84, 0.72,0.72,0.62,0.78, 144],
        fold:                   [0.88,1.05,1.14,1.10,0.96, 0.92,1.08,0.94,1.02, 216],
        aurora:                 [1.12,1.08,0.82,0.86,1.12, 0.76,0.78,0.66,0.80, 288],
        vortex:                 [1.10,1.10,1.00,1.16,0.96, 1.08,1.14,1.04,1.08, 36],
        cybergrid:              [0.80,0.96,1.20,1.10,0.84, 1.10,1.12,0.92,1.12, 108],
        hyperdrive:              [1.18,1.04,0.92,1.14,1.08, 1.22,1.16,1.20,1.18, 180],
        kaleidoscope:           [0.88,1.18,0.92,0.96,1.02, 0.88,0.84,0.76,0.90, 252],
        quantum:                [1.04,1.20,1.12,1.10,0.90, 1.16,1.22,1.02,1.18, 324],
        ripple:                 [1.08,0.92,0.84,0.92,0.90, 0.78,0.86,0.74,0.84, 18],
        analog_crt:             [0.76,0.90,1.16,0.88,0.74, 0.82,1.00,0.78,0.92, 90],
        newblue_roll:           [0.92,0.98,1.02,0.96,0.88, 1.18,1.10,1.30,1.12, 162],
        newblue_active_cam:     [1.10,1.08,1.10,1.10,1.00, 1.12,1.08,1.12,1.12, 234],
        newblue_shear:          [0.82,0.98,1.12,1.14,0.88, 0.94,1.18,0.96,1.06, 306],
        newblue_wiggle:         [1.14,1.02,1.16,1.06,0.92, 1.20,1.06,1.08,1.14, 45],
        newblue_zoom_blur:      [1.16,0.92,0.90,1.12,1.06, 1.18,0.96,1.12,1.14, 117],
        newblue_video_tile:     [0.80,1.12,1.10,0.94,0.86, 0.98,1.12,0.82,1.02, 189],
        newblue_twirl:          [1.12,1.08,0.94,1.10,1.00, 0.96,0.98,0.92,0.98, 261],
        newblue_light_ring:     [0.94,0.98,0.78,0.82,1.18, 0.82,0.72,0.68,0.78, 333],
        newblue_earthquake:     [1.16,1.16,1.18,1.18,0.90, 1.24,1.24,1.18,1.22, 54],
        newblue_water_drop:     [1.08,0.94,0.84,0.92,1.00, 0.78,0.88,0.74,0.84, 126],
        newblue_rgb_shift:      [1.22,1.20,0.96,1.02,0.96, 1.02,0.94,0.82,0.96, 198],
        newblue_quad_mirror:    [0.80,1.10,0.92,0.90,0.94, 0.90,0.84,0.76,0.88, 270],
        newblue_fish_eye:       [1.06,0.92,0.86,0.98,0.98, 0.86,0.82,0.72,0.84, 342],
        newblue_pinch:          [0.92,0.94,0.90,0.94,0.92, 0.88,0.86,0.76,0.86, 63],
        newblue_solarize:       [0.92,1.14,0.94,0.98,1.02, 1.04,0.94,0.80,0.98, 135],
        newblue_cathode_beam:   [0.74,0.90,1.20,0.94,0.78, 0.84,1.08,0.82,0.94, 207],
        newblue_neon_edges:     [1.02,1.16,0.88,0.96,1.20, 0.94,0.82,0.74,0.90, 279]
    };
    const WARP_AUX = {
        ai_zero:[0.80,0.80,0.80,0.60,0.80], liquid:[0.82,0.92,0.90,1.02,0.88], prism:[1.08,0.98,1.02,0.94,1.02], breathe:[0.78,0.88,0.92,0.88,0.78],
        fold:[1.04,0.96,0.94,1.06,0.98], aurora:[0.92,1.08,1.06,0.98,0.90], vortex:[1.06,1.02,1.06,1.10,1.08],
        cybergrid:[1.08,0.94,0.96,1.04,1.06], hyperdrive:[1.12,1.08,1.04,1.12,1.18], kaleidoscope:[0.98,1.02,0.98,0.96,0.92],
        quantum:[1.14,1.10,1.12,1.10,1.14], ripple:[0.84,0.90,0.94,0.92,0.82], analog_crt:[0.92,0.90,0.88,0.86,0.82],
        newblue_roll:[1.02,1.04,1.02,1.02,1.02], newblue_active_cam:[1.08,1.08,1.10,1.06,1.08], newblue_shear:[1.04,0.98,0.98,1.02,1.00],
        newblue_wiggle:[0.96,1.00,1.04,1.00,1.02], newblue_zoom_blur:[1.06,1.04,1.08,1.06,1.10], newblue_video_tile:[0.96,0.94,0.92,0.98,0.92],
        newblue_twirl:[1.00,1.00,1.02,1.00,1.00], newblue_light_ring:[0.90,1.00,1.00,0.94,0.88], newblue_earthquake:[1.16,1.12,1.08,1.16,1.18],
        newblue_water_drop:[0.86,0.92,0.96,0.92,0.84], newblue_rgb_shift:[1.10,1.04,1.00,1.04,1.04], newblue_quad_mirror:[0.94,0.96,0.94,0.96,0.90],
        newblue_fish_eye:[0.94,0.94,0.98,0.96,0.92], newblue_pinch:[0.92,0.94,0.96,0.94,0.90], newblue_solarize:[1.06,1.00,0.98,1.02,1.02],
        newblue_cathode_beam:[0.90,0.90,0.88,0.90,0.84], newblue_neon_edges:[1.08,1.06,1.02,1.02,1.04]
    };
    const DEFAULT_WARP_BLEND = [1,1,1,1,1,1,1,1,1,0];
    function warpBlendFor(mode) {
        const v = WARP_BLEND[mode] || DEFAULT_WARP_BLEND, a = WARP_AUX[mode] || [1,1,1,1,1];
        return { ghostSplit:v[0], ghostChroma:v[1], ghostLines:v[2], ghostWarp:v[3], ghostGlow:v[4],
            vsyncSpeed:v[5], vsyncTears:v[6], vsyncRoll:v[7], phase:v[8], huePhase:v[9],
            hardLight:a[0], softEye:a[1], ear:a[2], canvas:a[3], automation:a[4] };
    }
    function noise01(slot, salt) {
        const n = Math.sin(slot * 12.9898 + salt * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }

    function palette(engine) {
        const p = engine.videoPalette || {};
        const hue = mod(p.hue == null ? 205 : p.hue, 360);
        const sat = clamp(p.sat == null ? 66 : (p.sat <= 1.001 ? p.sat * 100 : p.sat), 18, 100);
        const light = clamp(p.brightness == null ? 48 : (p.brightness <= 1.001 ? p.brightness * 100 : p.brightness), 12, 88);
        const colors = Array.isArray(p.colors) && p.colors.length >= 4 ? p.colors : [
            { h: hue, s: sat, l: light }, { h: mod(hue + 72, 360), s: sat, l: light + 6 },
            { h: mod(hue + 188, 360), s: sat * 0.86, l: light - 8 }, { h: mod(hue + 286, 360), s: sat, l: light + 10 }
        ];
        return {
            hue, sat, light, colors,
            energy: clamp01(p.energy == null ? ((engine.audioDrive || {}).drive || 0.45) : p.energy),
            motion: clamp01(p.motion == null ? 0.12 : p.motion)
        };
    }

    function getGhostProfile(mode) {
        if (root.GlitchEngine && typeof root.GlitchEngine.ghostProfile === 'function') return root.GlitchEngine.ghostProfile(mode);
        return FALLBACK_GHOSTS[mode] || FALLBACK_GHOSTS.SPECTRUM;
    }

    function getVsyncMethod(mode) {
        if (root.GlitchEngine && typeof root.GlitchEngine.vsyncMethod === 'function') return root.GlitchEngine.vsyncMethod(mode);
        return FALLBACK_VSYNC[mode] || FALLBACK_VSYNC.ON;
    }

    function bwMap(value) {
        if (root.GlitchEngine && typeof root.GlitchEngine.bwInvertMap === 'function') return root.GlitchEngine.bwInvertMap(value);
        const level = clamp01(value);
        return { hueDeg: level * 360, invert: level > 0.5 ? (level - 0.5) * 1.5 * 0.75 : 0, live: level > 0.008 };
    }

    function create(engine) {
        const random = () => typeof engine.nextDeterministicValue === 'function' ? engine.nextDeterministicValue() : Math.random();
        const scripts = {
            ON: { level: Math.max(0.01, engine.vsyncLevel || 0.60), target: Math.max(0.01, engine.vsyncLevel || 0.60), nextAt: 0, lastPct: -1 },
            GHOST_OFF: { level: 0.60, target: 0.60, nextAt: 0, lastPct: -1 },
            FULL: { level: 0.66, target: 0.66, nextAt: 0, lastPct: -1 }
        };
        let heldLevel = Math.max(0.01, engine.vsyncLevel || 0.60);
        let manualVsyncUntil = 0;
        let manualGhostUntil = 0;
        let ghostTarget = clamp01(engine.ghostLevel || 0.55);
        let nextGhostRetargetAt = 0;
        let nextSystemBurstAt = 0;
        let lastBurstCount = 0;
        let burstOverride = null;
        let lastAutomationUiAt = 0;

        const getGhostMode = () => engine.ghostModes[engine.ghostModeIndex] || 'OFF';
        const getVsyncMode = () => engine.vsyncModes[engine.vsyncModeIndex] || 'OFF';
        const activeVsyncLevel = () => {
            const mode = getVsyncMode();
            return mode === 'OFF' ? 0 : (scripts[mode] ? scripts[mode].level : engine.vsyncLevel || 0);
        };
        const automationEnabled = () => !!(engine.isAutoGlitch || engine.isContinualRandom || engine.isTimedAuto || engine.isAutomatedMasters || engine.softEyeActive);

        function voiceLevel(name) {
            return clamp01((engine.effectAlphas[name] || 0) + (engine.effectAlphas[name + ' GC#(3)'] || 0));
        }

        function confluenceHue(now, extra) {
            const p = palette(engine);
            const ghostAnchor = root.GlitchEngine && root.GlitchEngine.comboGhostAnchor
                ? root.GlitchEngine.comboGhostAnchor(getGhostMode()) : ({ OFF: 0, DIA: 28, SPECTRUM: 45, CRT: 18, PLASMA: 78, LED: 96 }[getGhostMode()] || 0);
            const vsyncAnchor = root.GlitchEngine && root.GlitchEngine.comboVsyncAnchor
                ? root.GlitchEngine.comboVsyncAnchor(getVsyncMode()) : ({ OFF: 0, ON: 8, GHOST_OFF: 32, FULL: 42 }[getVsyncMode()] || 0);
            const hueCycle = voiceLevel('Hue/Color Cycle');
            const rainbow = voiceLevel('HSL Rainbow');
            const breath = Math.sin(now * 0.00034) * 12;
            return mod(p.hue + ghostAnchor * clamp01(engine.ghostLevel) + vsyncAnchor * clamp01(activeVsyncLevel()) +
                hueCycle * (now * 0.018) + rainbow * 48 + (engine.aiWarpActive ? engine.aiWarpHue || 0 : 0) * 0.18 + breath + (extra || 0), 360);
        }

        function ensureSnapshot() {
            const source = engine.canvas;
            if (!engine.r3SystemCanvas) {
                engine.r3SystemCanvas = document.createElement('canvas');
                engine.r3SystemCtx = engine.r3SystemCanvas.getContext('2d');
            }
            const snap = engine.r3SystemCanvas;
            const ctx = engine.r3SystemCtx;
            if (snap.width !== source.width || snap.height !== source.height) {
                snap.width = source.width;
                snap.height = source.height;
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.filter = 'none';
            ctx.clearRect(0, 0, snap.width, snap.height);
            ctx.drawImage(source, 0, 0);
            return snap;
        }

        function setGhostMode(mode, level) {
            if (!engine.ghostModes.includes(mode)) return getGhostMode();
            engine.ghostModeIndex = engine.ghostModes.indexOf(mode);
            if (level != null) engine.ghostLevel = clamp01(level);
            if (mode !== 'OFF' && engine.ghostLevel <= 0.01) engine.ghostLevel = 0.55;
            ghostTarget = engine.ghostLevel;
            manualGhostUntil = performance.now() + 1200;
            return getGhostMode();
        }

        function cycleGhostMode() {
            engine.ghostModeIndex = (engine.ghostModeIndex + 1) % engine.ghostModes.length;
            if (getGhostMode() !== 'OFF' && engine.ghostLevel <= 0.01) engine.ghostLevel = Math.max(0.55, ghostTarget || 0);
            // Revision 3 holds the Ghost rail while OFF; re-entering restores it.
            ghostTarget = engine.ghostLevel;
            manualGhostUntil = performance.now() + 1200;
            return getGhostMode();
        }

        function setGhostLevel(level, isManual) {
            engine.ghostLevel = clamp01(level);
            if (engine.ghostLevel > 0.02 && getGhostMode() === 'OFF') engine.ghostModeIndex = Math.max(1, engine.ghostModes.indexOf('SPECTRUM'));
            if (engine.ghostLevel <= 0.001) engine.ghostModeIndex = 0;
            ghostTarget = engine.ghostLevel;
            if (isManual !== false) manualGhostUntil = performance.now() + 4500;
            return engine.ghostLevel;
        }

        function setVsyncMode(mode, level) {
            if (engine.vsyncLocked || !engine.vsyncModes.includes(mode)) return getVsyncMode();
            engine.vsyncModeIndex = engine.vsyncModes.indexOf(mode);
            if (mode !== 'OFF') {
                const state = scripts[mode];
                const next = level == null ? Math.max(0.35, state.level, heldLevel * 0.75) : clamp01(level);
                state.level = next;
                state.target = next;
                state.nextAt = performance.now() + (1400 + random() * 1600) / warpBlendFor(engine.aiWarpMode).automation;
                heldLevel = Math.max(heldLevel, next);
                engine.vsyncLevel = next;
            } else {
                engine.vsyncLevel = heldLevel;
            }
            return getVsyncMode();
        }

        function cycleVsyncMode() {
            if (engine.vsyncLocked) return getVsyncMode();
            const nextIndex = (engine.vsyncModeIndex + 1) % engine.vsyncModes.length;
            const next = engine.vsyncModes[nextIndex];
            return setVsyncMode(next);
        }

        function setVsyncLevel(level, isManual) {
            let mode = getVsyncMode();
            const value = clamp01(level);
            if (mode === 'OFF' && value > 0.001) {
                mode = 'ON';
                engine.vsyncModeIndex = engine.vsyncModes.indexOf(mode);
            }
            if (mode !== 'OFF') {
                scripts[mode].level = value;
                scripts[mode].target = value;
                scripts[mode].nextAt = performance.now() + 1600;
            }
            heldLevel = value;
            engine.vsyncLevel = value;
            if (isManual !== false) manualVsyncUntil = performance.now() + 4500;
            return value;
        }

        function reset() {
            engine.ghostModeIndex = 0;
            engine.ghostLevel = 0;
            engine.vsyncModeIndex = 0;
            engine.vsyncLevel = 0;
            heldLevel = 0;
            ghostTarget = 0;
            Object.keys(scripts).forEach(key => { scripts[key].level = scripts[key].target = 0; });
        }

        function requestBurst(now, source, strength, kind) {
            const duration = 700 + random() * 1400;
            burstOverride = {
                source: source || 'manual', kind: kind || (random() < 0.42 ? 'dia' : random() < 0.62 ? 'color' : 'both'),
                start: now, duration, amp: clamp(strength == null ? 0.72 : strength, 0.2, 1)
            };
            if (engine.crescendo && typeof engine.crescendo.request === 'function') {
                try { engine.crescendo.request(now, source || 'manual', clamp01(strength || 0.8), 1); } catch (e) {}
            }
        }

        function burstState(now) {
            let env = 0;
            let kind = null;
            if (engine.burstGate && typeof engine.burstGate.env === 'function') {
                env = Math.max(env, engine.burstGate.env() || 0);
                kind = engine.burstGate.kind ? engine.burstGate.kind() : kind;
            }
            if (burstOverride) {
                const p = clamp01((now - burstOverride.start) / burstOverride.duration);
                if (p >= 1) burstOverride = null;
                else {
                    const overrideEnv = Math.pow(Math.sin(p * Math.PI), 1.35) * burstOverride.amp;
                    if (overrideEnv > env) { env = overrideEnv; kind = burstOverride.kind; }
                }
            }
            return { env: clamp01(env), kind: kind || 'dia' };
        }

        function feedEar(dt) {
            if (!engine.ear || typeof engine.ear.feedVisual !== 'function') return null;
            const a = engine.audioDrive || {};
            const p = palette(engine);
            const blend = warpBlendFor(engine.aiWarpMode);
            const energy = clamp01(Math.max(a.drive || 0, a.rms || 0, p.energy) * blend.ear);
            const motion = clamp01(Math.max(p.motion, a.treble || 0) * blend.canvas);
            try { return engine.ear.feedVisual(energy, motion, dt); } catch (e) { return null; }
        }

        function stepSoftEye(now, dt) {
            const ear = feedEar(dt);
            const blend = warpBlendFor(engine.aiWarpMode);
            let k = engine.softEyeK || 0;
            if (engine.crescendo && typeof engine.crescendo.step === 'function') {
                try { k = engine.crescendo.step(now, dt, engine.ear ? engine.ear.state : ear); } catch (e) {}
            }
            if (engine.burstGate && typeof engine.burstGate.step === 'function') {
                try { engine.burstGate.step(now, dt, k, engine.ear ? engine.ear.state : ear); } catch (e) {}
            }
            engine.softEyeK = clamp01(k * blend.softEye);
            const softModes = engine.softEyeModes || ['OFF', 'CALM', 'SURGE', 'CRESCENDO'];
            if (typeof engine.onSoftEyeProgress === 'function') engine.onSoftEyeProgress(engine.softEyeK, softModes[engine.softEyeModeIndex || 0] || 'CALM');
        }

        function stepVsyncScript(now, dt, systemK) {
            const mode = getVsyncMode();
            if (mode === 'OFF') { engine.vsyncLevel = heldLevel; return; }
            const state = scripts[mode];
            const automatic = automationEnabled();
            const manual = now < manualVsyncUntil;
            const p = palette(engine);
            if (engine.vsyncLocked) {
                state.target = state.level;
            } else if (automatic && !manual && now >= state.nextAt) {
                const band = mode === 'FULL' ? [0.40, 1.00] : mode === 'GHOST_OFF' ? [0.35, 1.00] : [0.30, 0.95];
                const dramatic = systemK > 0.55 && !engine.aiWarpActive && random() < 0.16;
                state.target = dramatic ? (random() < 0.5 ? 1 : 0.05) : band[0] + random() * (band[1] - band[0]);
                if (engine.aiWarpActive) state.target = Math.min(state.target, 0.90);
                const base = mode === 'FULL' ? 2600 : mode === 'ON' ? 3000 : 3600;
                state.nextAt = now + base * (0.6 + random()) * (engine.aiWarpActive ? 1.7 : 1) * lerp(1.9, 1, systemK) / warpBlendFor(engine.aiWarpMode).automation;
            }
            if (!manual && !engine.vsyncLocked) {
                const rate = (mode === 'FULL' ? 1.35 : mode === 'ON' ? 1 : 0.85) * (engine.aiWarpActive ? 0.65 : 1) * lerp(0.55, 1.2, systemK);
                state.level = easeExp(state.level, state.target, dt, rate);
            }
            heldLevel = Math.max(heldLevel, state.level);
            engine.vsyncLevel = clamp01(state.level);
        }

        function stepGhostAutomation(now, dt, systemK) {
            if (getGhostMode() === 'OFF') return;
            if (engine.isContinualRandom && now >= nextGhostRetargetAt && now >= manualGhostUntil) {
                const p = palette(engine);
                const upper = systemK > 0.55 ? 1 : 0.86;
                ghostTarget = clamp(0.22 + random() * (0.58 + p.energy * 0.18), 0.15, upper);
                if (engine.aiWarpMode === 'ai_zero') ghostTarget = Math.min(ghostTarget, 0.34);
                nextGhostRetargetAt = now + (2200 + random() * 3600) * lerp(1.8, 1, systemK) / warpBlendFor(engine.aiWarpMode).automation;
            }
            if ((engine.isContinualRandom || engine.isAutoGlitch || engine.isTimedAuto || engine.isAutomatedMasters) && now >= manualGhostUntil) {
                const rate = (engine.isTimedAuto ? 1.8 : 0.8) * lerp(0.5, 1.25, systemK);
                engine.ghostLevel = clamp01(easeExp(engine.ghostLevel, ghostTarget, dt, rate));
            }
        }

        function step(now, dt) {
            const automatic = automationEnabled();
            if (automatic && !engine.softEyeActive) {
                stepSoftEye(now, dt);
            } else if (!automatic && !engine.softEyeActive && engine.burstGate && engine.burstGate.state && engine.burstGate.state.active) {
                // Let an already-started light event finish gracefully after automation stops.
                try { engine.burstGate.step(now, dt, 0, engine.ear ? engine.ear.state : null); } catch (e) {}
            }
            const systemK = clamp01(engine.softEyeK || 0);
            stepVsyncScript(now, dt, systemK);
            stepGhostAutomation(now, dt, systemK);

            if (automatic && engine.isAutoGlitch && now >= nextSystemBurstAt) {
                nextSystemBurstAt = now + (5400 + random() * 7200) * lerp(1.65, 0.72, systemK);
                if (getGhostMode() !== 'OFF' || getVsyncMode() !== 'OFF') requestBurst(now, 'auto-glitch', 0.46 + 0.40 * (engine.autoGlitchPower || 0.75));
            }
            const b = burstState(now);
            const count = engine.burstGate && engine.burstGate.state ? engine.burstGate.state.count : 0;
            if ((count > lastBurstCount || (burstOverride && b.env > 0.12)) && now - lastAutomationUiAt > 280) {
                lastBurstCount = count;
                lastAutomationUiAt = now;
                engine.triggerButtonEffect('ghost_pulse');
                if (getVsyncMode() !== 'OFF') engine.triggerButtonEffect('vsync_pulse');
            }
        }

        function drawGhost(now, snapshot) {
            const mode = getGhostMode();
            if (mode === 'OFF' || engine.ghostLevel <= 0.01 || !snapshot) return;
            const g = engine.gctx;
            const w = engine.canvas.width, h = engine.canvas.height;
            if (!w || !h) return;
            const t = now * 0.001;
            const p = palette(engine);
            const mp = getGhostProfile(mode);
            const blend = warpBlendFor(engine.aiWarpMode);
            const baseStrength = clamp01(engine.ghostLevel) * (engine.aiWarpMode === 'ai_zero' ? 0.45 : 1);
            const intensity = baseStrength * Math.max(0.05, engine.masterOpacity || 0) * 0.025;
            if (intensity <= 0) return;
            const crispK = engine.aiWarpActive ? 1.25 : 1;
            const dampK = engine.aiWarpActive ? 0.82 : 1;
            const pre = engine.ghostCanvas;
            const preCtx = engine.ghostCtx;
            if (pre.width !== w || pre.height !== h) { pre.width = w; pre.height = h; }
            const hue = confluenceHue(now, Math.sin(t * 0.8) * mp.hueA * 0.5 + Math.cos(t * 0.33) * mp.hueB * 0.5);
            const bw = bwMap(voiceLevel('B&W Invert'));
            const gray = clamp01((mp.gray || 0) * (0.55 + baseStrength * 0.45) + (bw.invert || 0) * 0.28);
            const contrast = 1.18 + baseStrength * 0.85 * crispK;
            const saturation = 1.05 + baseStrength * (mp.sat || 1) * 0.85;
            const brightness = 1.02 + baseStrength * 0.30;
            preCtx.save();
            preCtx.setTransform(1, 0, 0, 1, 0, 0);
            preCtx.globalAlpha = 1;
            preCtx.globalCompositeOperation = 'source-over';
            preCtx.clearRect(0, 0, w, h);
            // Canvas 2D standard filters only: no SVG pipeline or URL reference.
            preCtx.filter = `grayscale(${gray.toFixed(3)}) hue-rotate(${hue.toFixed(1)}deg) saturate(${saturation.toFixed(2)}) contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})${bw.invert > 0.004 ? ` invert(${bw.invert.toFixed(3)})` : ''}`;
            preCtx.drawImage(snapshot, 0, 0, w, h);
            preCtx.restore();
            preCtx.filter = 'none';

            const split = Math.min(20, (0.7 + baseStrength * 8) * (mp.split || 1) * blend.ghostSplit * (0.86 + 0.20 * p.energy));
            const channelAlpha = Math.min(0.20, (0.035 + intensity * 6.0) * (mp.chan || 1) * blend.ghostChroma) * dampK;
            const lineAlpha = Math.min(0.11, (0.012 + intensity * 3.0) * (mp.lines || 1) * blend.ghostLines) * dampK;
            const warpAlpha = Math.min(0.12, (0.010 + intensity * 3.2) * (mp.warp || 1) * blend.ghostWarp) * dampK;
            const burst = burstState(now);

            g.save();
            // Five softly offset spectral ghost copies replace the old purple edge.
            // 72-degree hue spacing covers the full RGB spectrum at once; the shared
            // phase drifts continuously so the color does not settle into one cast.
            g.globalCompositeOperation = 'screen';
            const rgbHue = mod(confluenceHue(now, t * 26) + blend.huePhase, 360);
            const rgbOffsets = [-split, -split * 0.5, 0, split * 0.5, split];
            for (let channel = 0; channel < 5; channel++) {
                g.filter = `hue-rotate(${mod(rgbHue + channel * 72, 360)}deg) saturate(1.26)`;
                g.globalAlpha = channelAlpha * 0.25;
                const yNudge = (channel - 2) * Math.max(0.35, split * 0.045);
                g.drawImage(pre, rgbOffsets[channel], yNudge, w, h);
            }
            g.filter = 'none';
            // Softer Old-Soul echo; retain the depth without a hard colored double edge.
            g.globalAlpha = channelAlpha * 0.18;
            g.filter = `blur(${((0.25 + intensity * 22) * (mp.blur || 1) * (0.85 + 0.25 * p.motion)).toFixed(2)}px)`;
            g.drawImage(pre, -split * 0.32, 0, w, h);
            g.drawImage(pre, split * 0.28, split * 0.08, w, h);
            g.filter = 'none';

            g.globalCompositeOperation = 'lighter';
            g.globalAlpha = lineAlpha;
            const lineCount = Math.round(((mp.crt ? 26 : 16) * (engine.aiWarpActive ? 0.7 : 1)));
            for (let i = 0; i < lineCount; i++) {
                const y = Math.floor(mod(i * 53 + now * 0.08, h));
                g.drawImage(pre, 0, y, w, 1, Math.sin(now * 0.012 + i * 1.73) * split * 1.6, y, w, 1);
            }

            g.globalCompositeOperation = 'screen';
            g.globalAlpha = warpAlpha;
            const columns = mp.crt ? 10 : 14;
            const columnWidth = Math.ceil(w / columns);
            const warpAmp = (0.5 + intensity * 58) * blend.ghostWarp;
            for (let col = 0; col < columns; col++) {
                const sx = col * columnWidth, sw = Math.min(columnWidth, w - sx);
                if (sw <= 0) continue;
                g.drawImage(pre, sx, 0, sw, h, sx + Math.sin(t * 5.2 + col * 0.65) * warpAmp,
                    Math.cos(t * 3.6 + col * 0.43) * warpAmp * 0.3025, sw, h);
            }

            if (mp.crt) {
                g.globalCompositeOperation = 'overlay'; g.globalAlpha = Math.min(0.08, 0.015 + intensity * 3);
                g.fillStyle = 'rgba(0,0,0,0.35)'; for (let y = 0; y < h; y += 2) g.fillRect(0, y, w, 1);
            }
            if (mp.led) {
                g.globalCompositeOperation = 'screen'; g.globalAlpha = Math.min(0.16, 0.035 + intensity * 4.6);
                const sub = Math.max(1, Math.round(w / 240));
                for (let x = 0; x < w; x += sub * 3) {
                    g.fillStyle = 'rgba(255,36,36,0.55)'; g.fillRect(x, 0, sub, h);
                    g.fillStyle = 'rgba(36,255,72,0.55)'; g.fillRect(x + sub, 0, sub, h);
                    g.fillStyle = 'rgba(36,72,255,0.55)'; g.fillRect(x + sub * 2, 0, sub, h);
                }
            }
            if (mp.dia) {
                const dia = g.createLinearGradient(0, 0, w, h);
                const diaHue = mod(confluenceHue(now, t * 34), 360);
                dia.addColorStop(0, `hsla(${diaHue},84%,56%,1)`);
                dia.addColorStop(0.34, `hsla(${mod(diaHue + 120, 360)},82%,54%,1)`);
                dia.addColorStop(0.67, `hsla(${mod(diaHue + 240, 360)},84%,56%,1)`);
                dia.addColorStop(1, `hsla(${diaHue},84%,56%,1)`);
                g.globalCompositeOperation = 'soft-light'; g.globalAlpha = Math.min(0.12, 0.03 + intensity * 3.5); g.fillStyle = dia; g.fillRect(0, 0, w, h);
            }
            const curve = g.createLinearGradient(0, 0, 0, h);
            const colorAt = (index, delta) => { const c = p.colors[index] || p.colors[0]; return `hsla(${c.h.toFixed(1)},${Math.max(40, c.s).toFixed(0)}%,${clamp(c.l + delta, 18, 82).toFixed(0)}%,1)`; };
            curve.addColorStop(0, colorAt(0, -14)); curve.addColorStop(0.5, colorAt(3, 10)); curve.addColorStop(1, colorAt(2, -8));
            g.globalCompositeOperation = 'soft-light'; g.globalAlpha = Math.min(0.08, 0.02 + intensity * 4.8); g.fillStyle = curve; g.fillRect(0, 0, w, h);
            g.globalAlpha = Math.min(0.08, 0.02 + intensity * 4.2); g.fillStyle = `hsla(${confluenceHue(now, Math.sin(t * 1.2) * (mp.crt ? 9 : 18)).toFixed(1)},100%,58%,1)`; g.fillRect(0, 0, w, h);

            if (burst.env > 0.01) {
                const bHue = confluenceHue(now, t * 90 * (1 + 2 * clamp01(engine.softEyeK || 0)) + mp.hueA * 0.25);
                if (burst.kind === 'color' || burst.kind === 'both') {
                    const grad = g.createLinearGradient(0, 0, w, h);
                    grad.addColorStop(0, `hsla(${bHue},100%,60%,1)`); grad.addColorStop(0.5, `hsla(${mod(bHue + 120, 360)},100%,58%,1)`); grad.addColorStop(1, `hsla(${mod(bHue + 240, 360)},100%,60%,1)`);
                    g.globalCompositeOperation = 'screen'; g.globalAlpha = Math.min(0.30, 0.06 + 0.26 * burst.env) * dampK; g.fillStyle = grad; g.fillRect(0, 0, w, h);
                }
                if (burst.kind === 'dia' || burst.kind === 'both') {
                    g.globalCompositeOperation = 'difference'; g.globalAlpha = Math.min(0.55, 0.10 + 0.50 * burst.env) * dampK; g.drawImage(pre, split * 0.35 * burst.env, 0, w, h);
                    g.globalCompositeOperation = 'soft-light'; g.globalAlpha = Math.min(0.22, 0.28 * burst.env); g.fillStyle = `hsla(${mod(bHue + 180, 360)},90%,55%,1)`; g.fillRect(0, 0, w, h);
                }
            }
            const sweepY = Math.floor(mod(t * 0.11, 1) * h);
            const sweep = g.createLinearGradient(0, sweepY - 1, 0, sweepY + 1);
            const sweepHue = confluenceHue(now, mp.hueA * 0.5);
            sweep.addColorStop(0, `hsla(${sweepHue},100%,72%,0)`); sweep.addColorStop(0.5, `hsla(${sweepHue},100%,80%,1)`); sweep.addColorStop(1, `hsla(${sweepHue},100%,72%,0)`);
            g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(0.22, 0.05 + intensity * 4) * (mp.glow || 1) * blend.ghostGlow * 1.4 * dampK; g.fillStyle = sweep; g.fillRect(0, sweepY - 1, w, 2);
            g.restore();
        }

        function drawVsync(now, snapshot) {
            const mode = getVsyncMode();
            const levelRaw = activeVsyncLevel();
            if (mode === 'OFF' || levelRaw <= 0.01 || !snapshot) return;
            const g = engine.gctx, w = engine.canvas.width, h = engine.canvas.height;
            if (!w || !h) return;
            const p = palette(engine), method = getVsyncMethod(mode), blend = warpBlendFor(engine.aiWarpMode), t = now * 0.001;
            const level = Math.min(1, levelRaw * (mode === 'FULL' ? 1.5 : 1.25)) * (engine.aiWarpActive ? 1 : 0.9);
            const fade = clamp01(0.10 + engine.masterOpacity * 0.30);
            const ghostOn = getGhostMode() !== 'OFF' && engine.ghostLevel > 0.01;
            const ghostSync = ghostOn ? clamp01(engine.ghostLevel * 1.2) : 0;
            const bw = bwMap(voiceLevel('B&W Invert'));
            const scanHue = mod(confluenceHue(now, (ghostOn ? Math.sin(t * 1.2) * 18 : Math.sin(t * 0.7) * 16) + (method.harmony || 0) * 180 * ((bw.invert || 0) / 0.75)) + t * 20 * blend.vsyncSpeed + blend.huePhase, 360);
            const speed = (0.22 + level * 0.30) * blend.vsyncSpeed * (engine.aiWarpActive ? 0.85 : 1) * (0.85 + 0.30 * p.energy) * (0.55 + 0.45 * (method.scanphase == null ? 1 : method.scanphase));
            const scanY = mod(t * speed + Math.sin(t * 0.23) * 0.06 + Math.cos(t * 0.11 + 1.2) * 0.04, 1) * h;
            const phase = (Math.sin(t * 1.35 * (0.6 + 0.4 * method.tears)) * 0.22 + Math.cos(t * 0.53) * 0.11 + Math.sin(t * 62.832) * (0.012 + level * 0.035) * method.hum * (0.80 + 0.40 * p.motion)) * blend.phase;
            const rollActive = method.roll * blend.vsyncRoll > 0 && phase < -0.03 && Math.sin(t * 0.9 + 1.3) > -0.1;
            const rollPhase = rollActive ? mod(t * (0.05 + level * 0.12) * (phase >= 0 ? 1 : -1) * (0.6 + 0.4 * method.roll * blend.vsyncRoll), 1) : 0;
            const tearCount = Math.max(1, Math.round((mode === 'FULL' ? 9 : mode === 'ON' ? 5 : 2) * method.tears * blend.vsyncTears * (0.30 + 0.48 * level) * (0.80 + 0.20 * p.motion)));
            const tearGap = Math.max(2, Math.round(h / tearCount));
            const tearPulse = 0.6 + 0.4 * Math.abs(Math.sin(t * 1.2 + 0.7));
            const sliceHeight = Math.max(1, Math.round(h * (0.0035 / (0.80 + 0.35 * method.sharp)) * tearPulse));
            const jam = level * (0.12 + 0.10 * Math.abs(Math.sin(t * 6.13 + 1.7))) * method.tears * blend.vsyncTears * (0.78 + 0.22 * p.energy + 0.12 * p.motion);
            const burst = burstState(now);
            const noiseFrame = Math.floor(now / 50);

            g.save();
            const thick = Math.max(1, h * 0.0045);
            const head = g.createLinearGradient(0, scanY - thick * 4, 0, scanY + thick * 4);
            head.addColorStop(0, 'rgba(0,0,0,0)');
            head.addColorStop(0.25, `hsla(${scanHue},82%,52%,0.30)`);
            head.addColorStop(0.50, `hsla(${mod(scanHue + 144, 360)},86%,56%,0.48)`);
            head.addColorStop(0.75, `hsla(${mod(scanHue + 288, 360)},82%,52%,0.30)`);
            head.addColorStop(1, 'rgba(0,0,0,0)');
            g.globalCompositeOperation = 'source-over'; g.globalAlpha = Math.min(0.25, 0.025 + level * 0.085) * fade * (rollActive ? 1.25 : 1) * 0.55; g.fillStyle = head; g.fillRect(0, scanY - thick * 4, w, thick * 8);
            if (rollActive) { g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.065; g.fillStyle = `hsla(${scanHue},82%,62%,1)`; g.fillRect(0, scanY - thick * 14, w, Math.max(1, thick)); }

            const coreY = Math.max(1, Math.min(h - 1, Math.floor(scanY)));
            const halo = g.createLinearGradient(0, coreY - 5, 0, coreY + 5);
            const haloA = Math.min(0.14, (0.04 + level * 0.065) * method.bar * (0.88 + 0.12 * ghostSync));
            halo.addColorStop(0, `hsla(${scanHue},92%,68%,0)`);
            halo.addColorStop(0.25, `hsla(${mod(scanHue + 72, 360)},94%,66%,${(haloA * 0.65).toFixed(3)})`);
            halo.addColorStop(0.50, `hsla(${mod(scanHue + 144, 360)},96%,68%,${haloA.toFixed(3)})`);
            halo.addColorStop(0.75, `hsla(${mod(scanHue + 216, 360)},94%,66%,${(haloA * 0.65).toFixed(3)})`);
            halo.addColorStop(1, `hsla(${scanHue},92%,68%,0)`);
            g.globalCompositeOperation = 'screen'; g.globalAlpha = fade * 0.42; g.fillStyle = halo; g.fillRect(0, coreY - 5, w, 10);
            const beamAlpha = Math.min(0.48, (0.20 + level * 0.22) * method.bar) * (0.58 + fade * 0.42);
            // Five thin RGB-spectrum scan echoes replace the single warm-colored line.
            for (let channel = 0; channel < 5; channel++) {
                g.globalAlpha = beamAlpha * 0.24;
                g.fillStyle = `hsla(${mod(scanHue + channel * 72, 360)},94%,72%,1)`;
                g.fillRect(0, coreY + channel - 2, w, 1);
            }

            g.globalCompositeOperation = 'source-over'; g.globalAlpha = clamp01(0.55 + level * 0.4) * (0.55 + fade * 0.45);
            for (let i = 0; i < tearCount; i++) {
                const bandY = mod(scanY + i * tearGap, h);
                const offset = (Math.sin(t * 7.1 + i * 2.4) * 0.55 + Math.sin(t * 3.7 + i * 0.9) * 0.3) * jam * (phase >= 0 ? 1 : 0.55) * ((i & 1) ? -0.85 : 1);
                const by = Math.max(0, Math.min(h - sliceHeight, bandY));
                g.drawImage(snapshot, 0, by, w, sliceHeight, Math.round(offset * w * 0.5), by, w, sliceHeight);
            }
            if (rollActive) {
                const bandH = Math.max(8, Math.round(h * 0.16)), rY = Math.max(0, Math.min(h - bandH, Math.round(rollPhase * (h + bandH)) - bandH));
                g.globalAlpha = clamp01(0.30 + level * 0.40) * method.roll; g.drawImage(snapshot, 0, rY, w, bandH, Math.round(level * 3 + 1), rY, w, bandH);
                g.globalAlpha = clamp01(0.25 + level * 0.30) * method.roll; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, rY, w, 1); g.fillRect(0, rY + bandH, w, 1);
                for (let y = scanY - thick * 10; y < scanY + thick * 10; y += 2 + Math.floor(level * 2)) {
                    if (y < 0 || y >= h) continue;
                    g.globalCompositeOperation = 'soft-light'; g.globalAlpha = (0.025 + noise01(noiseFrame + Math.floor(y * 0.1), 7) * 0.05) * level * fade * 0.7; g.fillStyle = `hsla(${mod(scanHue + 14 + Math.sin(t * 8.4 + y * 0.11) * 12, 360)},95%,60%,1)`; g.fillRect(0, y, w, 1);
                }
            }
            if (!ghostOn) {
                const spacing = Math.max(4, Math.round(Math.max(1, h * 0.008) * (14 - level * 9)));
                for (let y = mod(scanY, spacing); y < h; y += spacing) {
                    g.globalCompositeOperation = 'source-over'; g.globalAlpha = (0.03 + noise01(noiseFrame + Math.floor(y * 0.13), 11) * 0.07) * level * fade * 0.6;
                    g.fillStyle = `hsla(${mod(scanHue + noise01(noiseFrame + Math.floor(y * 0.09), 13) * 30 - 15, 360)},${Math.round(55 + Math.min(40, p.sat * 0.45))}%,58%,1)`; g.fillRect(0, y, w, 1);
                }
            }
            const sheen = g.createLinearGradient(0, scanY - thick * 9, 0, scanY + thick * 9);
            sheen.addColorStop(0, 'hsla(0,0%,0%,0)'); sheen.addColorStop(0.5, `hsla(${ghostSync > 0 ? scanHue : mod(195 + Math.sin(t * 0.8) * 12, 360)},90%,${ghostSync > 0 ? 46 : 58}%,1)`); sheen.addColorStop(1, 'hsla(0,0%,0%,0)');
            g.globalCompositeOperation = 'soft-light'; g.globalAlpha = Math.min(0.11, 0.012 + level * 0.055 + ghostSync * 0.035 + (rollActive ? 0.02 : 0)) * fade * 0.72; g.fillStyle = sheen; g.fillRect(0, scanY - thick * 9, w, thick * 18);
            if (level > 0.68) { g.globalCompositeOperation = 'overlay'; g.globalAlpha = (level - 0.68) * 0.20 * method.hum; g.fillStyle = 'rgba(0,0,0,0.5)'; for (let y = mod(t * 40, 3); y < h; y += 3) g.fillRect(0, y, w, 1); }

            if (burst.env > 0.01) {
                const bands = engine.softEyeK > 0.5 ? 5 : 3, bandH = h / bands, travel = 0.5 * (1 - Math.cos(Math.PI * clamp01(burst.env)));
                const baseHue = confluenceHue(now, t * 40 * (1 + clamp01(engine.softEyeK || 0)));
                for (let index = 0; index < bands; index++) {
                    const y0 = mod(index / bands + travel * 0.5, 1) * h, hBand = mod(baseHue + index * ((method.harmony || 0) > 0.5 ? 60 : 90), 360);
                    const grad = g.createLinearGradient(0, y0 - bandH * 0.5, 0, y0 + bandH * 0.5);
                    grad.addColorStop(0, `hsla(${hBand},100%,62%,0)`); grad.addColorStop(0.5, `hsla(${hBand},100%,62%,1)`); grad.addColorStop(1, `hsla(${hBand},100%,62%,0)`);
                    g.globalCompositeOperation = burst.kind === 'dia' || (burst.kind === 'both' && (index & 1)) ? 'difference' : 'screen'; g.globalAlpha = Math.min(0.42, (0.05 + 0.40 * burst.env) * fade * (method.bar || 0.6)); g.fillStyle = grad; g.fillRect(0, y0 - bandH * 0.5, w, bandH);
                }
            }
            g.restore();
        }

        return {
            scripts, getGhostMode, getVsyncMode, activeVsyncLevel,
            setGhostMode, cycleGhostMode, setGhostLevel, setVsyncMode, cycleVsyncMode, setVsyncLevel,
            requestBurst, reset, stepSoftEye, step,
            captureSnapshot: ensureSnapshot, renderGhost: drawGhost, renderVsync: drawVsync,
            getBurstState: burstState
        };
    }

    root.R3GhostVsync = { create, getWarpBlendProfile: warpBlendFor };
})(typeof window !== 'undefined' ? window : this);


/* Landing backdrop (Standalone Revision R Final 4.0).
   A calm GHOST PROTOCOL field behind the welcome card and the YouTube link
   tree: glyph rain from the guarded glyph tables (every glyph voice takes its
   own column), the engine's five GHOST profiles cycling their hue, an RGB
   channel split and a slow V-Sync scan bar. Display only: it reads
   GlitchEngine and SignalGlyphs but never the board, stops for good once
   playback starts, pauses while the window is hidden and draws one still
   frame under reduced motion. Nothing flashes, strobes or inverts. */
(function landingBackdrop() {
    'use strict';
    const host = document.getElementById('landingBackdrop');
    const canvas = host ? host.querySelector('canvas') : null;
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;

    const engine = window.GlitchEngine || null;
    const glyphs = window.SignalGlyphs || null;
    const body = document.body;
    const root = document.documentElement;
    const MODES = Object.freeze(['DIA', 'SPECTRUM', 'CRT', 'PLASMA', 'LED']);
    const MODE_MS = 9000;
    const BLEND_MS = 1800;
    const SCAN_MS = 7000;
    const FRAME_MS = 1000 / 30;
    const CELL = 18;
    const FADE = 'rgba(3, 3, 5, 0.14)';
    const BASE = '#030305';
    const ARMED_HUE = 348;
    const FONT = (CELL - 3) + 'px "Courier New", "Segoe UI Symbol", monospace';
    const ghostKey = (() => {
        const set = engine && engine.TYPESETS && engine.TYPESETS.ghostkey;
        const chars = set && typeof set.chars === 'string' ? Array.from(set.chars) : [];
        return Object.freeze(chars.length ? chars : Array.from('Gh0sT1n3SlLDgiaRBtHf4d.CmM'));
    })();
    const voices = glyphs && Array.isArray(glyphs.voices) && glyphs.voices.length ? glyphs.voices : ['ASCII'];
    const reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const born = performance.now();

    let width = 0;
    let height = 0;
    let columns = [];
    let raf = 0;
    let last = 0;
    let done = false;
    let stillArmed = null;

    const armed = () => root.classList.contains('ghost-egg-armed');
    const still = () => !!(reduce && reduce.matches);
    const randomKey = () => ghostKey[(Math.random() * ghostKey.length) | 0];

    function profileOf(mode) {
        const p = engine && typeof engine.ghostProfile === 'function' ? engine.ghostProfile(mode) : null;
        return p || { realm: 'mix', split: 1, glow: 0.4 };
    }
    function hueOf(mode) {
        const h = engine && typeof engine.ghostSkinHue === 'function' ? engine.ghostSkinHue(mode) : undefined;
        return Number.isFinite(h) ? h : 165;
    }
    /* the shortest way round the colour wheel, so the cycle never snaps */
    function mixHue(a, b, t) {
        const d = ((b - a + 540) % 360) - 180;
        return (a + d * t + 360) % 360;
    }
    function look(now) {
        const t = Math.max(0, now - born);
        const index = Math.floor(t / MODE_MS) % MODES.length;
        const mode = MODES[index];
        const prev = MODES[(index + MODES.length - 1) % MODES.length];
        const blend = Math.min(1, (t % MODE_MS) / BLEND_MS);
        const hue = armed() ? ARMED_HUE : mixHue(hueOf(prev), hueOf(mode), blend);
        return { t, mode, profile: profileOf(mode), hue };
    }

    function pickGlyph(col, realm) {
        if (armed()) return randomKey();
        try {
            const g = glyphs ? glyphs.pickFor(voices[col % voices.length], Math.random, realm) : '';
            if (typeof g === 'string' && g.trim()) return g;
        } catch (e) { /* fall back to the Ghost-Key alphabet */ }
        return randomKey();
    }
    function spawn(i, scatter) {
        return {
            x: i * CELL + CELL / 2,
            y: scatter ? Math.random() * height : -CELL * (1 + Math.random() * 24),
            speed: 36 + Math.random() * 84,
            row: NaN,
            glyph: '',
        };
    }

    function resize() {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        width = Math.max(1, window.innerWidth);
        height = Math.max(1, window.innerHeight);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        columns = Array.from({ length: Math.ceil(width / CELL) }, (_, i) => spawn(i, true));
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, width, height);
    }

    function drawGlyph(g, x, y, hue, split, strength) {
        ctx.globalAlpha = 0.1 * strength;
        ctx.fillStyle = 'hsl(0 100% 62%)';
        ctx.fillText(g, x - split, y);
        ctx.fillStyle = 'hsl(188 100% 62%)';
        ctx.fillText(g, x + split, y);
        ctx.globalAlpha = 0.3 * strength;
        ctx.fillStyle = 'hsl(' + hue.toFixed(1) + ' 90% 64%)';
        ctx.fillText(g, x, y);
    }
    function scanBar(t, hue, glow) {
        const y = ((t % SCAN_MS) / SCAN_MS) * (height + 80) - 40;
        const halo = ctx.createLinearGradient(0, y - 22, 0, y + 22);
        halo.addColorStop(0, 'transparent');
        halo.addColorStop(0.5, 'hsl(' + hue.toFixed(1) + ' 90% 60% / ' + (0.04 + 0.05 * glow).toFixed(3) + ')');
        halo.addColorStop(1, 'transparent');
        ctx.globalAlpha = 1;
        ctx.fillStyle = halo;
        ctx.fillRect(0, y - 22, width, 44);
        ctx.fillStyle = 'hsl(' + hue.toFixed(1) + ' 80% 80% / 0.22)';
        ctx.fillRect(0, Math.round(y), width, 1);
    }
    function label(mode, hue) {
        ctx.globalAlpha = 0.5;
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'hsl(' + hue.toFixed(1) + ' 70% 70%)';
        ctx.fillText(armed() ? 'GHOST // OF ME // ARMED' : 'GHOST PROTOCOL // ' + mode, 22, height - 22);
        ctx.globalAlpha = 1;
    }

    function paint(now, dt) {
        const { t, mode, profile, hue } = look(now);
        const split = 1 + 2 * Math.min(1.5, Number(profile.split) || 1);
        ctx.globalAlpha = 1;
        ctx.fillStyle = FADE;
        ctx.fillRect(0, 0, width, height);
        ctx.font = FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < columns.length; i++) {
            const c = columns[i];
            c.y += c.speed * dt / 1000;
            if (c.y > height + CELL) { columns[i] = spawn(i, false); continue; }
            if (c.y < 0) continue;
            const row = Math.floor(c.y / CELL);
            if (row !== c.row) { c.row = row; c.glyph = pickGlyph(i, profile.realm); }
            drawGlyph(c.glyph, c.x, row * CELL + CELL / 2, hue, split, 1);
        }
        scanBar(t, hue, Number(profile.glow) || 0.4);
        label(mode, hue);
    }

    /* Reduced motion: one quiet, unmoving field. */
    function paintStill() {
        const { mode, profile, hue } = look(born + MODE_MS + BLEND_MS);
        ctx.globalAlpha = 1;
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, width, height);
        ctx.font = FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < columns.length; i++) {
            const top = Math.floor(Math.random() * Math.max(1, height / CELL));
            for (let k = 0; k < 4; k++) {
                drawGlyph(pickGlyph(i, profile.realm), columns[i].x, (top - k) * CELL + CELL / 2, hue, 2, 0.8 - k * 0.18);
            }
        }
        label(mode, hue);
    }

    function loop(now) {
        raf = requestAnimationFrame(loop);
        if (last && now - last < FRAME_MS - 1) return;
        const dt = last ? Math.min(100, now - last) : FRAME_MS;
        last = now;
        paint(now, dt);
    }
    function halt() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
    }
    function sync() {
        if (done) return;
        if (body.classList.contains('playback-on')) {
            /* playback owns the screen from here on; release everything */
            done = true;
            halt();
            observer.disconnect();
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', sync);
            if (reduce && reduce.removeEventListener) reduce.removeEventListener('change', sync);
            canvas.width = 1;
            canvas.height = 1;
            columns = [];
            return;
        }
        if (still()) {
            halt();
            /* repaint only when the armed tint changes, never per class change */
            if (stillArmed !== armed()) { stillArmed = armed(); paintStill(); }
            return;
        }
        stillArmed = null;
        if (document.hidden) { halt(); return; }
        if (!raf) raf = requestAnimationFrame(loop);
    }
    function onResize() {
        resize();
        stillArmed = null;
        sync();
    }

    const observer = new MutationObserver(sync);
    observer.observe(body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', sync);
    if (reduce && reduce.addEventListener) reduce.addEventListener('change', sync);
    resize();
    sync();
})();

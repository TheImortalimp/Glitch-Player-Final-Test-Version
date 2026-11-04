import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readWeb } from './harness.mjs';

const engineSource = readWeb('js/glitch-engine.js');
const backdropSource = readWeb('js/landing-backdrop.js');
const GHOST_KEY = Array.from('Gh0sT1n3SlLDgiaRBtHf4d.CmM');
const VOICES = ['ASCII', 'Cyber Rain', 'R3 ASCII'];

/* Runs the real backdrop over the real engine with a recording canvas, a
   stub glyph library and sentinels for board state it must never touch. */
function backdrop({ reduced = false, pickThrows = false, noCanvas = false } = {}) {
    const clock = { now: 1000 };
    const ops = [];
    const frames = new Map();
    let nextFrame = 0;
    const observers = [];
    const listeners = {};
    const picks = [];
    const touched = [];
    const bodyClasses = new Set();
    const rootClasses = new Set();
    const classSet = (set) => ({ add: (n) => set.add(n), remove: (n) => set.delete(n), contains: (n) => set.has(n) });
    const on = (scope) => ({
        addEventListener(type, fn) { (listeners[scope + type] = listeners[scope + type] || []).push(fn); },
        removeEventListener(type, fn) { listeners[scope + type] = (listeners[scope + type] || []).filter((f) => f !== fn); },
    });
    const ctx = {
        fillStyle: '', globalAlpha: 1, font: '', textAlign: '', textBaseline: '',
        setTransform() {},
        fillRect(x, y, w, h) { ops.push({ op: 'rect', style: this.fillStyle, alpha: this.globalAlpha, w, h }); },
        fillText(text) { ops.push({ op: 'text', text, style: this.fillStyle, alpha: this.globalAlpha }); },
        createLinearGradient() { return { addColorStop() {} }; },
    };
    const canvas = { width: 0, height: 0, getContext: (kind) => (kind === '2d' ? ctx : null) };
    const host = { querySelector: (selector) => (selector === 'canvas' ? canvas : null) };
    const document = {
        hidden: false,
        body: { classList: classSet(bodyClasses) },
        documentElement: { classList: classSet(rootClasses) },
        getElementById: (id) => (id === 'landingBackdrop' && !noCanvas ? host : null),
        ...on('doc:'),
    };
    const context = vm.createContext({
        document,
        innerWidth: 360,
        innerHeight: 240,
        devicePixelRatio: 1,
        performance: { now: () => clock.now },
        requestAnimationFrame: (fn) => { frames.set(++nextFrame, fn); return nextFrame; },
        cancelAnimationFrame: (id) => { frames.delete(id); },
        MutationObserver: class {
            constructor(fn) { this.fn = fn; this.targets = []; this.connected = true; observers.push(this); }
            observe(target, options) { this.targets.push([target, options]); }
            disconnect() { this.connected = false; }
        },
        matchMedia: (query) => ({ matches: reduced && /prefers-reduced-motion: reduce/.test(query), ...on('media:') }),
        ...on('win:'),
    });
    context.window = context;
    for (const name of ['applySettings', 'effectAlphas', 'setLightAutomation', 'localStorage', 'sessionStorage', 'GlitchHost', 'chrome']) {
        Object.defineProperty(context, name, { get() { touched.push(name); return undefined; } });
    }
    vm.runInContext(engineSource, context, { filename: 'js/glitch-engine.js' });
    context.SignalGlyphs = {
        voices: VOICES,
        pickFor(voice, rng, realm) {
            picks.push([voice, realm]);
            if (pickThrows) throw new Error('boom');
            return '\u0416';
        },
    };
    vm.runInContext(backdropSource, context, { filename: 'js/landing-backdrop.js' });
    const fire = (key) => (listeners[key] || []).slice().forEach((fn) => fn());
    return {
        ops, frames, observers, picks, touched, canvas, document, bodyClasses, rootClasses, listeners,
        step(ms = 40) {
            clock.now += ms;
            const [id, fn] = frames.entries().next().value || [];
            if (!fn) return false;
            frames.delete(id);
            fn(clock.now);
            return true;
        },
        run(ms) { for (let t = 0; t < ms; t += 40) this.step(40); },
        mutate() { observers.forEach((o) => { if (o.connected) o.fn([]); }); },
        fire,
        labels: () => ops.filter((o) => o.op === 'text' && /GHOST/.test(o.text)).map((o) => o.text),
        glyphs: () => ops.filter((o) => o.op === 'text' && !/GHOST/.test(o.text)),
    };
}

test('the landing backdrop cycles the five GHOST PROTOCOL profiles with glyphs from every voice', () => {
    const b = backdrop();
    assert.equal(b.canvas.width, 360);
    assert.equal(b.frames.size, 1, 'one animation frame is scheduled');
    assert.equal(b.observers.length, 1);
    assert.deepEqual(b.observers[0].targets.map(([, options]) => [...options.attributeFilter]), [['class'], ['class']]);

    b.run(2000);
    assert.ok(b.picks.length > 0, 'glyphs come from the glyph library');
    assert.deepEqual([...new Set(b.picks.map(([voice]) => voice))].sort(), [...VOICES].sort(), 'columns rotate through every voice');
    assert.deepEqual([...new Set(b.picks.map(([, realm]) => realm))], ['reality'], 'the DIA profile realm');
    assert.equal(b.labels().at(-1), 'GHOST PROTOCOL // DIA');

    const seen = [];
    for (let i = 0; i < 5; i++) {
        b.run(9000);
        seen.push(b.labels().at(-1).replace('GHOST PROTOCOL // ', ''));
    }
    assert.deepEqual(seen, ['SPECTRUM', 'CRT', 'PLASMA', 'LED', 'DIA']);
    assert.deepEqual(b.touched, [], 'no board state is read');
});

test('the backdrop is calm: dim glyphs, a soft trailing fade and no bright full-screen fill', () => {
    const b = backdrop();
    b.run(20000);
    const glyphs = b.glyphs();
    assert.ok(glyphs.length > 100);
    assert.ok(glyphs.every((o) => o.alpha <= 0.3), 'every glyph is drawn at 30% or less');
    assert.ok(b.labels().length > 0);
    const fullScreen = b.ops.filter((o) => o.op === 'rect' && o.w >= 360 && o.h >= 240);
    assert.ok(fullScreen.length > 0);
    for (const rect of fullScreen) assert.match(rect.style, /^(rgba\(3, 3, 5, 0\.14\)|#030305)$/, 'only the dark fade fills the screen');
    const scan = b.ops.filter((o) => o.op === 'rect' && o.h === 1);
    assert.ok(scan.length > 0 && scan.every((o) => /\/ 0\.22\)$/.test(o.style)), 'the V-Sync hairline stays faint');
});

test('playback ends the backdrop for good and releases the canvas', () => {
    const b = backdrop();
    b.run(400);
    b.bodyClasses.add('playback-on');
    b.mutate();
    assert.equal(b.frames.size, 0, 'no frame is pending');
    assert.equal(b.observers[0].connected, false);
    assert.equal(b.canvas.width, 1);
    assert.equal(b.canvas.height, 1);
    for (const key of ['win:resize', 'doc:visibilitychange', 'media:change']) {
        assert.equal((b.listeners[key] || []).length, 0, key + ' listener removed');
    }
    const drawn = b.ops.length;
    b.rootClasses.add('ghost-egg-armed');
    b.fire('doc:visibilitychange');
    assert.equal(b.frames.size, 0);
    assert.equal(b.ops.length, drawn, 'nothing is drawn after playback starts');
});

test('a hidden window pauses the backdrop and showing it again resumes', () => {
    const b = backdrop();
    b.document.hidden = true;
    b.fire('doc:visibilitychange');
    assert.equal(b.frames.size, 0);
    b.document.hidden = false;
    b.fire('doc:visibilitychange');
    assert.equal(b.frames.size, 1);
    b.fire('doc:visibilitychange');
    assert.equal(b.frames.size, 1, 'never two loops at once');
});

test('reduced motion draws one still frame and repaints only when the egg arms', () => {
    const b = backdrop({ reduced: true });
    assert.equal(b.frames.size, 0, 'no animation loop');
    assert.ok(b.glyphs().length > 0);
    assert.deepEqual(b.labels(), ['GHOST PROTOCOL // SPECTRUM']);
    const drawn = b.ops.length;
    b.bodyClasses.add('welcome-dismissed');
    b.mutate();
    assert.equal(b.ops.length, drawn, 'other class changes do not repaint');
    b.rootClasses.add('ghost-egg-armed');
    b.mutate();
    assert.equal(b.labels().at(-1), 'GHOST // OF ME // ARMED');
    assert.equal(b.frames.size, 0);
});

test('armed by the egg, the backdrop turns crimson and rains the Ghost-Key alphabet', () => {
    const b = backdrop();
    b.run(400);
    b.rootClasses.add('ghost-egg-armed');
    b.mutate();
    const picks = b.picks.length;
    const from = b.ops.length;
    b.run(4000);
    assert.equal(b.picks.length, picks, 'the glyph library is not asked while armed');
    const after = b.ops.slice(from).filter((o) => o.op === 'text' && !/GHOST/.test(o.text));
    const fresh = after.filter((o) => o.text !== '\u0416');
    assert.ok(fresh.length > 0 && fresh.every((o) => GHOST_KEY.includes(o.text)));
    assert.ok(after.some((o) => o.style === 'hsl(348.0 90% 64%)'), 'crimson main channel');
    assert.equal(b.labels().at(-1), 'GHOST // OF ME // ARMED');
});

test('a failing glyph voice falls back to the Ghost-Key alphabet; no canvas is a no-op', () => {
    const b = backdrop({ pickThrows: true });
    b.run(1000);
    assert.ok(b.picks.length > 0);
    const glyphs = b.glyphs();
    assert.ok(glyphs.length > 0 && glyphs.every((o) => GHOST_KEY.includes(o.text)));

    const none = backdrop({ noCanvas: true });
    assert.equal(none.frames.size, 0);
    assert.equal(none.observers.length, 0);
});

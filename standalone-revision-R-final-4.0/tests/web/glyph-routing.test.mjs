import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readWeb } from './harness.mjs';

const ENGINE = 'Engine realms (Revision 3)';
const ALL = 'All scripts';
const VOICES = ['ASCII', 'Cyber Rain', 'R3 ASCII', 'Matrix ASCII', 'Matrix Chord', 'R3 Matrix ASCII', 'R3 Matrix Chord',
    'Data Bomb', 'R3 Data Bomb'];
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
const visible = (ch) => !/^\s+$/u.test(ch);

function seeded(seed = 12345) {
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

function assertCodePoint(ch, label) {
    assert.equal(typeof ch, 'string', label);
    assert.equal([...ch].length, 1, `${label}: ${JSON.stringify(ch)} is not one code point`);
    assert.ok(!LONE_SURROGATE.test(ch), `${label}: lone surrogate`);
}

/* Loads the real engine, then the real glyph library over it, in one context
   with the glyph select and info line stubbed. */
function glyphSandbox() {
    const elements = {
        'glyph-bank': {
            value: '', options: [],
            appendChild(option) { this.options.push(option); },
            addEventListener(type, fn) { if (type === 'change') this.change = fn; },
        },
        'glyph-info': { textContent: '', title: '' },
    };
    const sandbox = { console, document: { getElementById: (id) => elements[id] || null, createElement: () => ({}) } };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(readWeb('js/glitch-engine.js'), sandbox, { filename: 'js/glitch-engine.js' });
    const original = { pickGlyph: sandbox.GlitchEngine.pickGlyph, glyphBank: sandbox.GlitchEngine.glyphBank };
    vm.runInContext(readWeb('js/glyph-tables.js'), sandbox, { filename: 'js/glyph-tables.js' });
    vm.runInContext(readWeb('js/glyph-library.js'), sandbox, { filename: 'js/glyph-library.js' });
    return { sandbox, G: sandbox.SignalGlyphs, E: sandbox.GlitchEngine, original, elements };
}

test('Revision 3 engine typesets hand out whole Unicode code points, including astral glyphs', () => {
    const { original } = glyphSandbox();
    let astral = 0;
    for (const realm of ['reality', 'virtual', 'mix']) {
        const bank = original.glyphBank(realm);
        assert.ok(bank.length > 0, realm);
        bank.forEach((ch) => assertCodePoint(ch, 'glyphBank ' + realm));
        astral += bank.filter((ch) => ch.codePointAt(0) > 0xffff).length;
        const rng = seeded();
        for (let i = 0; i < 4000; i++) assertCodePoint(original.pickGlyph(realm, rng, i % 3), 'pickGlyph ' + realm);
    }
    assert.ok(astral > 0, 'the typesets include astral glyphs, so UTF-16 indexing would split them');
});

test('the selected table drives main ASCII and every sub-voice takes its own table rotated forward from it', () => {
    const { G } = glyphSandbox();
    assert.equal(G.names.length, 125);
    assert.deepEqual([...G.voices], VOICES);
    assert.equal(G.current, ENGINE, 'Revision 3 engine glyphs stay the default');
    G.set(G.names[10]);
    VOICES.forEach((voice, i) => assert.equal(G.tableFor(voice), G.names[10 + i], voice));
    assert.equal(new Set(VOICES.map((voice) => G.tableFor(voice))).size, VOICES.length, 'no two voices share a table');
    G.set(G.names[124]);
    assert.equal(G.tableFor('ASCII'), G.names[124]);
    assert.equal(G.tableFor('Cyber Rain'), G.names[0], 'the rotation wraps around');
    assert.equal(G.tableFor('R3 Data Bomb'), G.names[7]);
    assert.equal(G.tableFor('Some other voice'), G.names[124], 'unknown voices follow the main table');
    assert.deepEqual([...G.rotation()].map((r) => r.table), VOICES.map((voice) => G.tableFor(voice)));
    for (const mode of [ALL, ENGINE]) {
        G.set(mode);
        VOICES.forEach((voice) => assert.equal(G.tableFor(voice), mode, mode + ' ' + voice));
    }
    const before = G.version;
    G.set('no such table');
    assert.equal(G.current, ENGINE);
    assert.equal(G.version, before, 'an unknown name falls back without a change');
});

test('per-voice glyph sets are stable arrays refilled in place, without whitespace, when the table changes', () => {
    const { G, original } = glyphSandbox();
    G.set(G.names[0]);
    const fallback = ['x'];
    const ascii = G.setFor('ASCII', fallback);
    const rain = G.setFor('Cyber Rain');
    assert.deepEqual([...ascii], [...G.banks[G.names[0]]].filter(visible));
    assert.deepEqual([...rain], [...G.banks[G.names[1]]].filter(visible));
    const stamp = ascii.glyphVersion;
    assert.equal(G.setFor('ASCII', fallback), ascii, 'same array while nothing changed');
    assert.equal(ascii.glyphVersion, stamp, 'no refill while nothing changed');
    const version = G.version;
    G.set(G.names[0]);
    assert.equal(G.version, version, 'reselecting the same table is not a change');
    G.set(G.names[3]);
    assert.equal(G.setFor('ASCII', fallback), ascii, 'a voice that captured its array keeps following the selection');
    assert.ok(ascii.glyphVersion > stamp);
    assert.deepEqual([...ascii], [...G.banks[G.names[3]]].filter(visible));
    assert.deepEqual([...G.setFor('Cyber Rain')], [...G.banks[G.names[4]]].filter(visible));

    G.set(ENGINE);
    assert.deepEqual([...G.setFor('ASCII', ['A', ' ', 'B'])], ['A', 'B'], 'Engine realms keeps the voice glyphs');
    const engineSet = G.setFor('Matrix ASCII');
    assert.deepEqual([...engineSet], [...original.glyphBank()].filter(visible));

    G.set(ALL);
    const mixed = G.setFor('Cyber Rain');
    assert.ok(mixed.length > 0 && mixed.length <= G.names.length * 8);
    const everything = new Set(G.names.flatMap((name) => G.banks[name]));
    mixed.forEach((ch) => assert.ok(everything.has(ch), ch));

    for (const name of G.names) {
        G.set(name);
        for (const voice of VOICES) {
            const set = G.setFor(voice);
            assert.ok(set.length > 0, name + ' ' + voice);
            set.forEach((ch) => assertCodePoint(ch, name + ' ' + voice));
            assert.ok(set.every(visible), name + ' ' + voice + ' has whitespace');
        }
    }
});

test('Revision 3 voices pick from the rotated table of the voice painting at the time', () => {
    const { G, E, original } = glyphSandbox();
    G.set(G.names[20]);
    const tableOf = (voice) => new Set([...G.banks[G.tableFor(voice)], '\u00b7']);
    const rng = seeded();
    for (const voice of ['R3 Matrix ASCII', 'R3 Matrix Chord']) {
        G.withVoice(voice, () => {
            assert.equal(G.voice, voice);
            for (let i = 0; i < 300; i++) assert.ok(tableOf(voice).has(E.pickGlyph('virtual', rng, i % 3)), voice);
            assert.deepEqual([...E.glyphBank('mix')], [...G.banks[G.tableFor(voice)]]);
        });
    }
    assert.equal(G.voice, null);
    assert.throws(() => G.withVoice('R3 ASCII', () => { throw new Error('paint failed'); }), /paint failed/);
    assert.equal(G.voice, null, 'the voice context is restored after a throw');
    for (let i = 0; i < 100; i++) assert.ok(tableOf('ASCII').has(E.pickGlyph('mix', rng, 0)), 'outside a voice, main ASCII');

    G.set(ENGINE);
    const a = seeded(99), b = seeded(99);
    for (let i = 0; i < 500; i++) {
        const realm = ['reality', 'virtual', 'mix'][i % 3];
        assert.equal(G.withVoice('R3 Matrix ASCII', () => E.pickGlyph(realm, a, i % 3)), original.pickGlyph(realm, b, i % 3));
    }
    assert.deepEqual([...E.glyphBank('virtual')], [...original.glyphBank('virtual')]);
});

test('the glyph select and info line show the selection and the sub-voice rotation', () => {
    const { G, elements } = glyphSandbox();
    const select = elements['glyph-bank'];
    const info = elements['glyph-info'];
    assert.equal(select.options.length, 2 + G.names.length);
    assert.equal(info.textContent, 'Using Revision 3 engine glyphs');
    select.value = G.names[0];
    select.change();
    assert.equal(G.current, G.names[0]);
    assert.match(info.textContent, /^[\d,.\s]+ code points \u00b7 main ASCII \u00b7 sub-voices rotate$/);
    const lines = info.title.split('\n');
    assert.equal(lines.length, VOICES.length + 1);
    assert.equal(lines[0], 'Main ASCII: ' + G.names[0]);
    assert.equal(lines[1], 'Cyber Rain: ' + G.names[1]);
    assert.equal(lines[8], 'R3 Data Bomb: ' + G.names[8]);
    assert.match(lines[9], /^Unicode 15\.1\.0 tables: verified \(125 tables, 127\D?648 code points\)$/);
    G.set(ALL);
    assert.equal(select.value, ALL);
    assert.match(info.textContent, /every voice mixes 125 tables$/);
});

test('host and Revision 3 glyph voices are routed through the per-voice tables', () => {
    const player = readWeb('js/glitch-player.js');
    const r3 = readWeb('js/r3-factories.js');
    assert.match(player, /const chars = Array\.from\(latin \+ /, 'the host atlas is built from code points');
    assert.match(player, /const chSet = voiceGlyphSet\('ASCII', /);
    assert.match(player, /voiceGlyph\('Cyber Rain'\)/);
    assert.match(player, /ch: voiceGlyph\('Matrix ASCII', realm, k % 3\)/);
    assert.match(player, /ch: voiceGlyph\('Matrix Chord', realm, tone\)/);
    assert.match(player, /const glyphAtlas = voiceGlyphAtlas\('Data Bomb'\);/);
    assert.match(r3, /glyphs\.withVoice\('R3 ' \+ baseName, render\)/);
    assert.match(r3, /G\.setFor\('R3 ' \+ glyphVoice, R3_ATLAS_CHARS\)/);
    assert.match(r3, /G\.setFor\('R3 Data Bomb', R3_ATLAS_CHARS\)/);
    const verbatim = r3.slice(r3.indexOf('/* ===== BEGIN VERBATIM GLITCH REVISION 3 FACTORY SOURCE ===== */'));
    assert.doesNotMatch(verbatim.slice(0, verbatim.indexOf('END VERBATIM')), /SignalGlyphs|setFor|withVoice|glyphVoice/,
        'the verbatim Revision 3 source is untouched');

    const factory = player.slice(player.indexOf('function glitchASCIIArtOverlayFactory('));
    const capture = factory.indexOf("const chSet = voiceGlyphSet('ASCII', asciiFallback);");
    const renderStart = factory.indexOf('const renderFn = (progress) => {');
    const refresh = factory.indexOf("voiceGlyphSet('ASCII', asciiFallback);", renderStart);
    assert.ok(capture > 0 && renderStart > capture, 'the main ASCII voice captures its set once');
    assert.ok(refresh > renderStart && refresh < factory.indexOf('paintScatterField(', renderStart),
        'the main ASCII voice refreshes its captured set on every painted frame, before drawing');
});

test('Revision 3 ASCII follows table changes made after the R3 engine was created', () => {
    const { sandbox, G } = glyphSandbox();
    sandbox.performance = { now: () => 1000 };
    sandbox.addEventListener = () => {};
    vm.runInContext(readWeb('js/r3-factories.js'), sandbox, { filename: 'js/r3-factories.js' });
    const captured = new Map();
    const setFor = G.setFor;
    G.setFor = function (voice, fallback) {
        const set = setFor.call(this, voice, fallback);
        if (!captured.has(voice)) captured.set(voice, set);
        return set;
    };
    const alphas = Object.create(null);
    // A canvas under 8 px makes every R3 render return before drawing.
    const engine = { canvas: { width: 4, height: 4 }, effectAlphas: alphas, liveAlpha: (name) => alphas[name] || 0,
        sizeFor: () => 1, depthFor: () => 1 };
    const runners = sandbox.GC3FactoryBank.createRunners(engine);
    const context = new Proxy({}, { get: (target, key) => (key in target ? target[key] : () => {}) });
    const paintAll = () => runners.forEach((run) => run(context, 2000));

    assert.deepEqual([...captured.keys()], ['R3 ASCII'], 'only R3 ASCII captures a glyph array when created');
    const chSet = captured.get('R3 ASCII');
    const engineGlyphs = [...chSet];
    assert.equal(engineGlyphs.slice(0, 4).join(''), 'ABCD', 'Engine realms keeps the Revision 3 atlas glyphs');

    alphas['ASCII GC#(3)'] = 1;
    G.set(G.names[10]);
    paintAll();
    assert.equal(G.tableFor('R3 ASCII'), G.names[12]);
    assert.deepEqual([...chSet], [...G.banks[G.names[12]]].filter(visible), 'the captured set takes the rotated table');

    G.set(G.names[40]);
    paintAll();
    assert.deepEqual([...chSet], [...G.banks[G.names[42]]].filter(visible));

    G.set(ENGINE);
    paintAll();
    assert.deepEqual([...chSet], engineGlyphs, 'switching back restores the Revision 3 glyphs');
});

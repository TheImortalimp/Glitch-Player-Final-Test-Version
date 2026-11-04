import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { readWeb } from './harness.mjs';
import { glyphChecksum, renderTables } from '../../tools/build-glyph-tables.mjs';

// SHA-256 over "name:cp,cp,...\n" for every table, taken from the tables as
// shipped before the rebuild and checked against Unicode 15.1.0, IBMGRAPH.TXT and CP437.TXT.
const PINNED_SHA256 = 'b4e8be2912083e16fe17540b77eaedf87fb0f681a82932a8b45429fdef0d8ec7';
const CP437 = 'IBM PC CP437 graphics';
const FORBIDDEN = [[0x0000, 0x001f], [0x007f, 0x009f], [0xd800, 0xdfff], [0xe000, 0xf8ff], [0xfdd0, 0xfdef], [0xf0000, 0x10ffff]];
const forbidden = (cp) => (cp & 0xfffe) === 0xfffe || FORBIDDEN.some(([lo, hi]) => cp >= lo && cp <= hi);
const expand = (table) => table.codePoints
    ? [...table.codePoints]
    : table.runs.flatMap(([lo, hi]) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i));

function loadTables() {
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(readWeb('js/glyph-tables.js'), sandbox, { filename: 'js/glyph-tables.js' });
    return JSON.parse(JSON.stringify(sandbox.window.GlitchGlyphTables));
}

/* Runs the real glyph library over the given table data with a stubbed select. */
function loadLibrary(data) {
    const warnings = [];
    const select = { value: '', options: [], appendChild(o) { this.options.push(o); }, addEventListener() {} };
    const elements = { 'glyph-bank': select, 'glyph-info': { textContent: '', title: '' } };
    const sandbox = {
        console: { warn: (...args) => warnings.push(args.join(' ')) },
        document: { getElementById: (id) => elements[id] || null, createElement: () => ({}) }
    };
    sandbox.window = sandbox;
    if (data !== undefined) sandbox.GlitchGlyphTables = data;
    vm.createContext(sandbox);
    vm.runInContext(readWeb('js/glyph-library.js'), sandbox, { filename: 'js/glyph-library.js' });
    return { G: sandbox.SignalGlyphs, warnings, select, info: elements['glyph-info'], data: sandbox.GlitchGlyphTables };
}

test('the generated tables are the pinned Unicode 15.1.0 and CP437 data, in the shipped order', () => {
    const data = loadTables();
    assert.equal(data.format, 1);
    assert.equal(data.unicodeVersion, '15.1.0');
    assert.equal(data.tables.length, 125);
    assert.equal(data.tableCount, 125);
    assert.equal(data.codePointCount, 127648);
    assert.equal(data.tables[0].name, 'ASCII (printable)');
    assert.equal(data.tables.at(-1).name, CP437);
    const hash = crypto.createHash('sha256');
    let total = 0;
    for (const table of data.tables) {
        const cps = expand(table);
        total += cps.length;
        hash.update(table.name + ':' + cps.map((cp) => cp.toString(16)).join(',') + '\n');
    }
    assert.equal(total, 127648);
    assert.equal(hash.digest('hex'), PINNED_SHA256);
});

test('every table is well formed: sorted runs inside its blocks, no controls, surrogates, private use or noncharacters', () => {
    const data = loadTables();
    assert.equal(new Set(data.tables.map((t) => t.name)).size, data.tables.length, 'unique names');
    for (const table of data.tables) {
        const cps = expand(table);
        assert.equal(cps.length, table.count, table.name);
        assert.equal(glyphChecksum(cps), table.checksum, table.name);
        assert.equal(new Set(cps).size, cps.length, table.name + ' duplicates');
        for (const cp of cps) assert.ok(!forbidden(cp), `${table.name}: U+${cp.toString(16)}`);
        if (table.name === CP437) {
            assert.equal(cps.length, 160);
            assert.deepEqual(cps.slice(0, 3), [0x263a, 0x263b, 0x2665], 'bytes 0x01-0x03 are the IBM PC faces and heart');
            assert.equal(cps[31], 0x2302, 'byte 0x7F is HOUSE');
            assert.equal(cps.at(-1), 0x00a0, 'byte 0xFF is NO-BREAK SPACE');
            continue;
        }
        let last = -1;
        const span = [...table.blocks].sort((a, b) => a[0] - b[0])
            .reduce((out, [a, b]) => (out.length && a <= out.at(-1)[1] + 1 ? (out.at(-1)[1] = b) : out.push([a, b]), out), []);
        for (const [lo, hi] of table.runs) {
            assert.ok(lo > last && hi >= lo, table.name + ' runs are sorted and disjoint');
            assert.ok(span.some(([a, b]) => lo >= a && hi <= b), table.name + ' run inside its blocks');
            last = hi;
        }
    }
    const ascii = expand(data.tables[0]);
    assert.equal(ascii.length, 95);
    assert.deepEqual([ascii[0], ascii.at(-1)], [0x20, 0x7e]);
});

test('the committed file is exactly what the generator renders, so hand edits are caught', () => {
    const data = loadTables();
    assert.equal(renderTables(data.tables), readWeb('js/glyph-tables.js').replace(/\r\n/g, '\n'));
});

test('the library accepts every verified table and freezes the banks', () => {
    const { G, warnings, select, info, data } = loadLibrary(loadTables());
    assert.deepEqual(warnings, []);
    assert.deepEqual({ ...G.integrity, rejected: [...G.integrity.rejected] },
        { unicodeVersion: '15.1.0', tables: 125, codePoints: 127648, ok: true, rejected: [] });
    assert.equal(G.names.length, 125);
    assert.ok(Object.isFrozen(G.names) && Object.isFrozen(G.banks) && Object.isFrozen(G.integrity));
    assert.ok(Object.isFrozen(data) && Object.isFrozen(data.tables[0].runs[0]), 'source data is frozen');
    for (const name of G.names) {
        assert.ok(Object.isFrozen(G.banks[name]), name);
        assert.throws(() => G.banks[name].push('x'), { name: 'TypeError' });
    }
    assert.throws(() => { G.banks.Injected = ['x']; }, { name: 'TypeError' });
    assert.equal(G.banks['Box Drawing'].length, 128);
    assert.equal(G.banks['CJK Extension B'][0], '\u{20000}');
    assert.equal(select.options.length, 127);
    assert.match(info.title, /Unicode 15\.1\.0 tables: verified \(125 tables, 127\D?648 code points\)/);
});

function tampered(mutate) {
    const data = loadTables();
    mutate(data.tables, data);
    return loadLibrary(data);
}

test('a table whose data no longer matches its checksum is dropped, the rest keep working', () => {
    const { G, warnings, info } = tampered((tables) => {
        const box = tables.find((t) => t.name === 'Box Drawing');
        box.runs[0][1] -= 1;
        box.count -= 1;
    });
    assert.equal(G.integrity.ok, false);
    assert.deepEqual([...G.integrity.rejected].map((r) => [r.name, r.reason]), [['Box Drawing', 'checksum mismatch']]);
    assert.equal(G.names.length, 124);
    assert.ok(!G.names.includes('Box Drawing'));
    assert.match(warnings.join('\n'), /Box Drawing \(checksum mismatch\)/);
    G.set('Box Drawing');
    assert.equal(G.current, 'Engine realms (Revision 3)', 'a preset naming a rejected table falls back to the engine');
    G.set('Block Elements');
    assert.equal(G.current, 'Block Elements');
    assert.match(info.title, /check failed, 1 table\(s\) removed/);
});

test('forbidden code points, runs outside the blocks, bad shapes and duplicate names are rejected even with valid checksums', () => {
    const reseal = (table) => { const cps = expand(table); table.count = cps.length; table.checksum = glyphChecksum(cps); };
    const cases = [
        ['private use', (t) => { t[0].blocks = [[0xe000, 0xe0ff]]; t[0].runs = [[0xe000, 0xe010]]; reseal(t[0]); }, 'forbidden code point'],
        ['C1 control', (t) => { t[1].runs = [[0x0085, 0x0085], ...t[1].runs]; t[1].blocks = [[0x0080, 0x00ff]]; reseal(t[1]); }, 'forbidden code point'],
        ['outside its blocks', (t) => { t[2].runs = [...t[2].runs, [0x4e00, 0x4e01]]; reseal(t[2]); }, 'run outside its blocks'],
        ['unsorted runs', (t) => { const g = t.find((x) => x.name === 'Greek'); g.runs = [...g.runs].reverse(); reseal(g); }, 'runs overlap or are unsorted'],
        ['noncharacter', (t) => { const c = t.at(-1); c.codePoints = [...c.codePoints, 0xfffe]; reseal(c); }, 'forbidden code point'],
        ['duplicate code point', (t) => { const c = t.at(-1); c.codePoints = [...c.codePoints, 0x263a]; reseal(c); }, 'duplicate code point'],
        ['duplicate name', (t) => { t[5].name = t[4].name; }, 'duplicate or reserved name'],
        ['reserved name', (t) => { t[6].name = 'All scripts'; }, 'duplicate or reserved name'],
        ['strange name', (t) => { t[7].name = '<img>'; }, 'bad name'],
        ['missing runs', (t) => { delete t[8].runs; }, 'bad runs or blocks']
    ];
    for (const [label, mutate, reason] of cases) {
        const { G } = tampered(mutate);
        assert.equal(G.integrity.ok, false, label);
        assert.equal(G.integrity.rejected.length, 1, label);
        assert.equal(G.integrity.rejected[0].reason, reason, label);
        assert.equal(G.names.length, 124, label);
    }
});

test('a missing or emptied table file leaves only the engine glyphs, without throwing', () => {
    for (const data of [undefined, { format: 2, tables: [] }, { format: 1, tables: 'x' }]) {
        const { G, warnings } = loadLibrary(data);
        assert.equal(G.integrity.ok, false);
        assert.equal(G.names.length, 0);
        assert.match(warnings.join('\n'), /missing or malformed/);
        G.set('ASCII (printable)');
        assert.equal(G.current, 'Engine realms (Revision 3)');
        G.set('All scripts');
        assert.equal(typeof G.pickFor('Matrix Chord', Math.random), 'string');
        assert.ok(G.setFor('Cyber Rain').length > 0);
    }
});

test('a table removed from the file is reported even though every remaining table checks out', () => {
    const { G, warnings } = tampered((tables) => { tables.splice(10, 1); });
    assert.equal(G.integrity.ok, false);
    assert.equal(G.integrity.rejected.length, 0);
    assert.match(warnings.join('\n'), /totals differ/);
});

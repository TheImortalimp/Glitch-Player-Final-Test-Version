// Rebuilds webui/js/glyph-tables.js from pinned, hash-checked reference files.
//
//   node tools/build-glyph-tables.mjs              download the references, write the tables
//   node tools/build-glyph-tables.mjs --check      download, regenerate, compare with the committed file
//   node tools/build-glyph-tables.mjs --ref <dir>  read the references from <dir> (or <dir>/15.1.0) instead
//
// Every reference must match its pinned size and SHA-256 before it is parsed.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(root, 'webui', 'js', 'glyph-tables.js');
const UNICODE_VERSION = '15.1.0';
const CP437_TABLE = 'IBM PC CP437 graphics';

const REFERENCES = Object.freeze([
    { name: 'UnicodeData.txt', url: `https://www.unicode.org/Public/${UNICODE_VERSION}/ucd/UnicodeData.txt`,
        bytes: 1914200, sha256: '2fc713e6a31a87c4850a37fe2caffa4218180fadb5de86b43a143ddb4581fb86' },
    { name: 'Blocks.txt', url: `https://www.unicode.org/Public/${UNICODE_VERSION}/ucd/Blocks.txt`,
        bytes: 10995, sha256: '443ee0524a775bf021777c296f5b591b5611c8aef6bc922887d27b0bc13892b5' },
    { name: 'IBMGRAPH.TXT', url: 'https://www.unicode.org/Public/MAPPINGS/VENDORS/MISC/IBMGRAPH.TXT',
        bytes: 3748, sha256: '5c8052b5a9c3852b1cb4b6a1b5d1591e8d26604e7ed457cbdc6f1cbe09463cf2' },
    { name: 'CP437.TXT', url: 'https://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/PC/CP437.TXT',
        bytes: 9794, sha256: '6bad4dabcdf5940227c7d81fab130dcb18a77850b5d79de28b5dc4e047b0aaac' }
]);

// Table name -> Unicode blocks. The order is the selector order and the voice
// rotation order, so never reorder, rename or remove an entry.
const TABLES = Object.freeze([
    ['ASCII (printable)', ['Basic Latin'], [0x20]],
    ['Latin-1 Supplement', ['Latin-1 Supplement']],
    ['Latin Extended A', ['Latin Extended-A']],
    ['Latin Extended B', ['Latin Extended-B']],
    ['IPA', ['IPA Extensions']],
    ['Greek', ['Greek and Coptic']],
    ['Cyrillic', ['Cyrillic', 'Cyrillic Supplement']],
    ['Armenian', ['Armenian']],
    ['Hebrew', ['Hebrew']],
    ['Arabic', ['Arabic']],
    ['Syriac', ['Syriac']],
    ['Thaana', ['Thaana']],
    ['NKo', ['NKo']],
    ['Devanagari', ['Devanagari']],
    ['Bengali', ['Bengali']],
    ['Gurmukhi', ['Gurmukhi']],
    ['Gujarati', ['Gujarati']],
    ['Oriya', ['Oriya']],
    ['Tamil', ['Tamil']],
    ['Telugu', ['Telugu']],
    ['Kannada', ['Kannada']],
    ['Malayalam', ['Malayalam']],
    ['Sinhala', ['Sinhala']],
    ['Thai', ['Thai']],
    ['Lao', ['Lao']],
    ['Tibetan', ['Tibetan']],
    ['Myanmar', ['Myanmar']],
    ['Georgian', ['Georgian']],
    ['Hangul Jamo', ['Hangul Jamo']],
    ['Ethiopic', ['Ethiopic']],
    ['Cherokee', ['Cherokee']],
    ['Canadian Aboriginal', ['Unified Canadian Aboriginal Syllabics']],
    ['Ogham', ['Ogham']],
    ['Runic', ['Runic']],
    ['Khmer', ['Khmer']],
    ['Mongolian', ['Mongolian']],
    ['Latin Extended Additional', ['Latin Extended Additional']],
    ['Greek Extended', ['Greek Extended']],
    ['Punctuation', ['General Punctuation']],
    ['Superscripts and Subscripts', ['Superscripts and Subscripts']],
    ['Currency Symbols', ['Currency Symbols']],
    ['Letterlike Symbols', ['Letterlike Symbols']],
    ['Number Forms', ['Number Forms']],
    ['Arrows', ['Arrows']],
    ['Mathematical Operators', ['Mathematical Operators']],
    ['Technical Symbols', ['Miscellaneous Technical']],
    ['Enclosed Alphanumerics', ['Enclosed Alphanumerics']],
    ['Box Drawing', ['Box Drawing']],
    ['Block Elements', ['Block Elements']],
    ['Geometric Shapes', ['Geometric Shapes']],
    ['Miscellaneous Symbols', ['Miscellaneous Symbols']],
    ['Dingbats', ['Dingbats']],
    ['Braille Patterns', ['Braille Patterns']],
    ['Supplemental Arrows', ['Supplemental Arrows-B']],
    ['CJK Punctuation', ['CJK Symbols and Punctuation']],
    ['Hiragana', ['Hiragana']],
    ['Katakana', ['Katakana']],
    ['Bopomofo', ['Bopomofo']],
    ['Hangul Compatibility Jamo', ['Hangul Compatibility Jamo']],
    ['CJK Strokes', ['CJK Strokes']],
    ['Enclosed CJK', ['Enclosed CJK Letters and Months']],
    ['CJK Unified Ideographs', ['CJK Unified Ideographs']],
    ['Yi Syllables', ['Yi Syllables']],
    ['Javanese', ['Javanese']],
    ['Hangul Syllables', ['Hangul Syllables']],
    ['CJK Compatibility Ideographs', ['CJK Compatibility Ideographs']],
    ['Fullwidth Forms', ['Halfwidth and Fullwidth Forms']],
    ['Deseret', ['Deseret']],
    ['Egyptian Hieroglyphs', ['Egyptian Hieroglyphs']],
    ['Musical Symbols', ['Musical Symbols']],
    ['Mathematical Alphanumeric', ['Mathematical Alphanumeric Symbols']],
    ['Mahjong Tiles', ['Mahjong Tiles']],
    ['Playing Cards', ['Playing Cards']],
    ['Pictographs', ['Miscellaneous Symbols and Pictographs']],
    ['Emoticons', ['Emoticons']],
    ['Transport Symbols', ['Transport and Map Symbols']],
    ['Supplemental Symbols', ['Supplemental Symbols and Pictographs']],
    ['Samaritan', ['Samaritan']],
    ['Mandaic', ['Mandaic']],
    ['Arabic Extended A', ['Arabic Extended-A']],
    ['Limbu', ['Limbu']],
    ['Tai Le', ['Tai Le']],
    ['New Tai Lue', ['New Tai Lue']],
    ['Buginese', ['Buginese']],
    ['Balinese', ['Balinese']],
    ['Sundanese', ['Sundanese']],
    ['Batak', ['Batak']],
    ['Lepcha', ['Lepcha']],
    ['Ol Chiki', ['Ol Chiki']],
    ['Glagolitic', ['Glagolitic']],
    ['Coptic', ['Coptic']],
    ['Tifinagh', ['Tifinagh']],
    ['CJK Extension A', ['CJK Unified Ideographs Extension A']],
    ['Lisu', ['Lisu']],
    ['Vai', ['Vai']],
    ['Bamum', ['Bamum']],
    ['Syloti Nagri', ['Syloti Nagri']],
    ['Phags-pa', ['Phags-pa']],
    ['Saurashtra', ['Saurashtra']],
    ['Kayah Li', ['Kayah Li']],
    ['Rejang', ['Rejang']],
    ['Cham', ['Cham']],
    ['Tai Viet', ['Tai Viet']],
    ['Meetei Mayek', ['Meetei Mayek']],
    ['Linear B Syllabary', ['Linear B Syllabary']],
    ['Old Italic', ['Old Italic']],
    ['Gothic', ['Gothic']],
    ['Ugaritic', ['Ugaritic']],
    ['Old Persian', ['Old Persian']],
    ['Osmanya', ['Osmanya']],
    ['Phoenician', ['Phoenician']],
    ['Kharoshthi', ['Kharoshthi']],
    ['Brahmi', ['Brahmi']],
    ['Cuneiform', ['Cuneiform']],
    ['Bamum Supplement', ['Bamum Supplement']],
    ['Tangut', ['Tangut']],
    ['Kana Supplement', ['Kana Supplement']],
    ['Chess Symbols', ['Chess Symbols']],
    ['CJK Extension B', ['CJK Unified Ideographs Extension B']],
    ['CJK Extension C', ['CJK Unified Ideographs Extension C']],
    ['CJK Extension D', ['CJK Unified Ideographs Extension D']],
    ['CJK Extension E', ['CJK Unified Ideographs Extension E']],
    ['CJK Extension F', ['CJK Unified Ideographs Extension F']],
    ['CJK Extension G', ['CJK Unified Ideographs Extension G']]
]);

function parseArgs(argv) {
    const options = { check: false, ref: null };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--check') options.check = true;
        else if (argv[i] === '--ref' && argv[i + 1]) options.ref = path.resolve(argv[++i]);
        else throw new Error('Unknown argument: ' + argv[i]);
    }
    return options;
}

async function loadReference(reference, refDir) {
    let bytes;
    if (refDir) {
        const candidates = [path.join(refDir, reference.name), path.join(refDir, UNICODE_VERSION, reference.name)];
        const found = candidates.find((file) => fs.existsSync(file));
        if (!found) throw new Error(`${reference.name} not found in ${refDir}`);
        bytes = fs.readFileSync(found);
    } else {
        const response = await fetch(reference.url, { redirect: 'error' });
        if (!response.ok) throw new Error(`${reference.url}: HTTP ${response.status}`);
        bytes = Buffer.from(await response.arrayBuffer());
    }
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    if (bytes.length !== reference.bytes || sha256 !== reference.sha256) {
        throw new Error(`${reference.name} does not match its pinned hash (${bytes.length} bytes, ${sha256})`);
    }
    return bytes.toString('latin1');
}

function dataLines(text) {
    return text.split(/\r?\n/).map((line) => line.replace(/#.*$/, '').trim()).filter(Boolean);
}

function parseBlocks(text) {
    const blocks = new Map();
    for (const line of dataLines(text)) {
        const match = /^([0-9A-F]{4,6})\.\.([0-9A-F]{4,6});\s*(.+)$/.exec(line);
        if (!match) throw new Error('Unexpected Blocks.txt line: ' + line);
        blocks.set(match[3], [parseInt(match[1], 16), parseInt(match[2], 16)]);
    }
    return blocks;
}

// Returns a lookup from code point to General_Category; <..., First>/<..., Last>
// pairs describe whole assigned ranges (ideographs, Hangul, Tangut and so on).
function parseUnicodeData(text) {
    const single = new Map();
    const ranges = [];
    let open = null;
    for (const line of dataLines(text)) {
        const fields = line.split(';');
        const cp = parseInt(fields[0], 16);
        const [name, gc] = [fields[1], fields[2]];
        if (name.endsWith(', First>')) open = { cp, gc };
        else if (name.endsWith(', Last>')) {
            if (!open || open.gc !== gc) throw new Error('Unpaired range in UnicodeData.txt at ' + fields[0]);
            ranges.push([open.cp, cp, gc]);
            open = null;
        } else single.set(cp, gc);
    }
    return (cp) => single.get(cp) || (ranges.find(([lo, hi]) => cp >= lo && cp <= hi) || [])[2] || null;
}

// IBM PC graphics in byte order: 0x01-0x1F and 0x7F from IBMGRAPH.TXT, 0x80-0xFF from CP437.TXT.
function cp437Graphics(ibmgraph, cp437) {
    const low = new Map();
    for (const line of dataLines(ibmgraph)) {
        const [unicode, byte] = line.split(/\s+/);
        if (!/^[0-9A-F]{2}$/i.test(byte)) continue;
        const value = parseInt(byte, 16);
        if ((value >= 0x01 && value <= 0x1f) || value === 0x7f) {
            if (low.has(value)) throw new Error('Duplicate IBMGRAPH byte ' + byte);
            low.set(value, parseInt(unicode, 16));
        }
    }
    const high = new Map();
    for (const line of dataLines(cp437)) {
        const [byte, unicode] = line.split(/\s+/);
        const value = parseInt(byte, 16);
        if (value >= 0x80 && value <= 0xff) high.set(value, parseInt(unicode, 16));
    }
    const order = [];
    for (let b = 0x01; b <= 0x1f; b++) order.push(b);
    order.push(0x7f);
    for (let b = 0x80; b <= 0xff; b++) order.push(b);
    return order.map((b) => {
        const cp = b < 0x80 ? low.get(b) : high.get(b);
        if (!Number.isInteger(cp)) throw new Error('No CP437 mapping for byte 0x' + b.toString(16));
        return cp;
    });
}

function toRuns(codePoints) {
    const runs = [];
    for (const cp of codePoints) {
        const last = runs[runs.length - 1];
        if (last && cp === last[1] + 1) last[1] = cp;
        else runs.push([cp, cp]);
    }
    return runs;
}

// FNV-1a over three little-endian bytes per code point. glyph-library.js uses the same function.
export function glyphChecksum(codePoints) {
    let hash = 0x811c9dc5;
    for (const cp of codePoints) {
        for (const byte of [cp & 0xff, (cp >>> 8) & 0xff, (cp >>> 16) & 0xff]) {
            hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
        }
    }
    return hash.toString(16).padStart(8, '0');
}

export function buildTables(texts) {
    const blocks = parseBlocks(texts['Blocks.txt']);
    const categoryOf = parseUnicodeData(texts['UnicodeData.txt']);
    const tables = TABLES.map(([name, blockNames, keep = []]) => {
        const ranges = blockNames.map((blockName) => {
            const range = blocks.get(blockName);
            if (!range) throw new Error(`Unicode ${UNICODE_VERSION} has no block named ${blockName}`);
            return range;
        });
        const codePoints = [];
        for (const [lo, hi] of ranges) {
            for (let cp = lo; cp <= hi; cp++) {
                const gc = categoryOf(cp);
                if (gc && (!/^[MCZ]/.test(gc) || keep.includes(cp))) codePoints.push(cp);
            }
        }
        return { name, blocks: ranges, runs: toRuns(codePoints), count: codePoints.length, checksum: glyphChecksum(codePoints) };
    });
    const graphics = cp437Graphics(texts['IBMGRAPH.TXT'], texts['CP437.TXT']);
    tables.push({ name: CP437_TABLE, codePoints: graphics, count: graphics.length, checksum: glyphChecksum(graphics) });
    return tables;
}

export function renderTables(tables) {
    const total = tables.reduce((sum, table) => sum + table.count, 0);
    const lines = [
        '/* Generated by tools/build-glyph-tables.mjs. Do not edit by hand: change the',
        '   generator, run it and commit the result. Sources (size and SHA-256 pinned in',
        `   the generator): Unicode Character Database ${UNICODE_VERSION} UnicodeData.txt and`,
        '   Blocks.txt, and the Unicode IBMGRAPH.TXT and Microsoft CP437.TXT mappings.',
        '   Unicode data (c) Unicode, Inc., used under the Unicode License v3.',
        '   Each Unicode table holds the assigned code points of its blocks, excluding',
        '   marks (M*), controls/format/private use/surrogates (C*) and separators (Z*);',
        '   ASCII keeps U+0020. The CP437 table lists the IBM PC graphics in byte order',
        '   0x01-0x1F, 0x7F, 0x80-0xFF. glyph-library.js validates every table on load. */',
        `window.GlitchGlyphTables={"format":1,"unicodeVersion":"${UNICODE_VERSION}","tableCount":${tables.length},"codePointCount":${total},"tables":[`
    ];
    tables.forEach((table, index) => {
        lines.push(JSON.stringify(table) + (index < tables.length - 1 ? ',' : ''));
    });
    lines.push(']};', '');
    return lines.join('\n');
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const texts = {};
    for (const reference of REFERENCES) texts[reference.name] = await loadReference(reference, options.ref);
    const output = renderTables(buildTables(texts));
    if (options.check) {
        const committed = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8').replace(/\r\n/g, '\n') : '';
        if (committed !== output) {
            console.error('webui/js/glyph-tables.js differs from the pinned references; run node tools/build-glyph-tables.mjs');
            process.exit(1);
        }
        console.log(`glyph tables match Unicode ${UNICODE_VERSION} and the CP437 references`);
        return;
    }
    fs.writeFileSync(OUTPUT, output, 'utf8');
    console.log('wrote ' + path.relative(root, OUTPUT));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch((error) => {
        console.error(error.message);
        process.exit(1);
    });
}

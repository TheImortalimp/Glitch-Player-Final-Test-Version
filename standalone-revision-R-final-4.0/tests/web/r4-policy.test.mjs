import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPolicy } from './harness.mjs';

const policy = loadPolicy();

test('R4Policy is frozen and cannot be replaced', () => {
    assert.ok(Object.isFrozen(policy));
    assert.throws(() => { globalThis.R4Policy = {}; }, TypeError);
    assert.equal(globalThis.R4Policy, policy);
});

test('YouTube input accepts only video and playlist IDs from YouTube hosts', () => {
    const accept = [
        ['dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['  dQw4w9WgXcQ  ', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['https://youtube.com/watch?v=dQw4w9WgXcQ&t=42', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['https://music.youtube.com/watch?v=dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['https://youtu.be/dQw4w9WgXcQ?si=abc', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['https://www.youtube.com/shorts/dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['https://www.youtube.com/embed/dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['https://www.youtube.com/live/dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', playlistId: '' }],
        ['https://www.youtube.com/playlist?list=PL1234567890abcdef', { videoId: '', playlistId: 'PL1234567890abcdef' }],
        ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLx_y-z', { videoId: 'dQw4w9WgXcQ', playlistId: 'PLx_y-z' }],
        ['HTTPS://WWW.YOUTUBE.COM/watch?v=dQw4w9WgXcQ', { videoId: 'dQw4w9WgXcQ', playlistId: '' }]
    ];
    for (const [input, expected] of accept) {
        assert.deepEqual({ ...policy.parseAllowedYouTubeInput(input) }, expected, input);
    }
    const reject = [
        '', '   ', null, undefined, 42, {}, 'dQw4w9WgXc', 'dQw4w9WgXcQQ', 'dQw4w9WgX<Q',
        'https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ',
        'https://evil.example/watch?v=dQw4w9WgXcQ',
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        'javascript://www.youtube.com/%0Aalert(1)//?v=dQw4w9WgXcQ',
        'data:text/html,https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'file://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://user:pass@www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com:8443/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ%22onerror',
        'https://www.youtube.com/watch?v=../../etc/pass',
        'https://www.youtube.com/playlist?list=PL<script>',
        'https://www.youtube.com/playlist?list=' + 'A'.repeat(129),
        'https://www.youtube.com/channel/UC123',
        'https://www.youtube.com/watch?v=' + 'a'.repeat(2048)
    ];
    for (const input of reject) {
        assert.equal(policy.parseAllowedYouTubeInput(input), null, String(input));
    }
});

test('local files are classified by MIME type first, then by final extension', () => {
    assert.equal(policy.classifyLocalFile('song.bin', 'audio/mpeg'), 'audio');
    assert.equal(policy.classifyLocalFile('clip.bin', 'VIDEO/MP4'), 'video');
    assert.equal(policy.classifyLocalFile('clip.mkv', ''), 'video');
    assert.equal(policy.classifyLocalFile('CLIP.WMV', ''), 'video');
    assert.equal(policy.classifyLocalFile('clip.ts', 'text/vnd.trolltech.linguist'), 'video');
    assert.equal(policy.classifyLocalFile('track.wma', ''), 'audio');
    assert.equal(policy.classifyLocalFile('track.flac', ''), 'audio');
    assert.equal(policy.classifyLocalFile('track.mp3.exe', 'application/x-msdownload'), '');
    assert.equal(policy.classifyLocalFile('notes.txt', 'text/plain'), '');
    assert.equal(policy.classifyLocalFile(undefined, undefined), '');
});

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 0xff, 0xd9]);
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
const syncsafe = (n) => [(n >> 21) & 0x7f, (n >> 14) & 0x7f, (n >> 7) & 0x7f, n & 0x7f];
const be32 = (n) => [(n >>> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255];

function apicBody({ encoding = 0, mime = 'image/png', description = 'cover', image = PNG } = {}) {
    const desc = encoding === 1 ?
        [0xff, 0xfe, ...Buffer.from(description, 'utf16le'), 0, 0] :
        [...Buffer.from(description, 'latin1'), 0];
    return [encoding, ...Buffer.from(mime, 'latin1'), 0, 3, ...desc, ...image];
}

function id3({ version = 3, frames, tagFlags = 0, extended = [], padding = 32, trailer = 256 }) {
    const frameBytes = frames.flatMap(({ id = 'APIC', body, flags = [0, 0] }) => [
        ...Buffer.from(id, 'latin1'),
        ...(version === 4 ? syncsafe(body.length) : be32(body.length)),
        ...flags,
        ...body
    ]);
    const content = [...extended, ...frameBytes, ...new Array(padding).fill(0)];
    return new Uint8Array([0x49, 0x44, 0x33, version, 0, tagFlags, ...syncsafe(content.length), ...content,
        ...new Array(trailer).fill(0x55)]);
}

function artBytes(bytes) {
    const art = policy.findId3Artwork(bytes);
    return art && { type: art.type, data: Buffer.from(bytes.subarray(art.start, art.end)) };
}

test('artwork type comes from magic bytes, never from the declared MIME', () => {
    assert.equal(policy.sniffArtworkType(new Uint8Array(PNG)), 'image/png');
    assert.equal(policy.sniffArtworkType(new Uint8Array(JPEG)), 'image/jpeg');
    assert.equal(policy.sniffArtworkType(new Uint8Array(Buffer.from('GIF89a'))), 'image/gif');
    assert.equal(policy.sniffArtworkType(new Uint8Array(Buffer.from('RIFF\0\0\0\0WEBPVP8 '))), 'image/webp');
    assert.equal(policy.sniffArtworkType(new Uint8Array(SVG)), '');
    assert.equal(policy.sniffArtworkType(new Uint8Array(0)), '');

    const declaredSvg = artBytes(id3({ frames: [{ body: apicBody({ mime: 'image/svg+xml' }) }] }));
    assert.equal(declaredSvg.type, 'image/png');
    assert.deepEqual(declaredSvg.data, PNG);
    assert.equal(policy.findId3Artwork(id3({ frames: [{ body: apicBody({ mime: 'image/png', image: SVG }) }] })), null);
});

test('ID3v2.3 frame sizes are plain integers and v2.4 sizes are syncsafe', () => {
    const longDescription = 'x'.repeat(300);
    const v3 = artBytes(id3({ version: 3, frames: [
        { id: 'TIT2', body: [0, ...Buffer.from('A title long enough to matter'.repeat(6))] },
        { body: apicBody({ description: longDescription, image: JPEG }) }
    ] }));
    assert.equal(v3.type, 'image/jpeg');
    assert.deepEqual(v3.data, JPEG);

    const v4 = artBytes(id3({ version: 4, frames: [{ body: apicBody({ description: longDescription }) }] }));
    assert.equal(v4.type, 'image/png');
    assert.deepEqual(v4.data, PNG);
});

test('ID3 descriptions, extended headers and data length indicators are skipped correctly', () => {
    const utf16 = artBytes(id3({ frames: [{ body: apicBody({ encoding: 1, description: 'Front cover' }) }] }));
    assert.deepEqual(utf16.data, PNG);

    const v3Extended = artBytes(id3({ version: 3, tagFlags: 0x40, extended: [...be32(6), 0, 0, 0, 0, 0, 0],
        frames: [{ body: apicBody() }] }));
    assert.deepEqual(v3Extended.data, PNG);

    const v4Extended = artBytes(id3({ version: 4, tagFlags: 0x40, extended: [...syncsafe(6), 1, 0],
        frames: [{ body: apicBody() }] }));
    assert.deepEqual(v4Extended.data, PNG);

    const body = apicBody();
    const dli = artBytes(id3({ version: 4, frames: [{ body: [...syncsafe(body.length), ...body], flags: [0, 0x01] }] }));
    assert.deepEqual(dli.data, PNG);
});

test('unsupported or malformed ID3 artwork is rejected', () => {
    const body = apicBody();
    assert.equal(policy.findId3Artwork(id3({ version: 2, frames: [{ body }] })), null);
    assert.equal(policy.findId3Artwork(id3({ tagFlags: 0x80, frames: [{ body }] })), null);
    assert.equal(policy.findId3Artwork(id3({ version: 4, frames: [{ body, flags: [0, 0x08] }] })), null);
    assert.equal(policy.findId3Artwork(id3({ version: 4, frames: [{ body, flags: [0, 0x04] }] })), null);
    assert.equal(policy.findId3Artwork(id3({ version: 3, frames: [{ body, flags: [0, 0x80] }] })), null);
    assert.equal(policy.findId3Artwork(id3({ frames: [{ body: apicBody({ image: [] }) }] })), null);
    assert.equal(policy.findId3Artwork(id3({ frames: [{ body: [7, ...body.slice(1)] }] })), null);

    const truncated = id3({ frames: [{ body }], padding: 0, trailer: 0 }).slice(0, 40);
    assert.equal(policy.findId3Artwork(truncated), null);

    const oversizedFrame = id3({ frames: [{ body }] });
    oversizedFrame.set(be32(0x7fffffff), 14);
    assert.equal(policy.findId3Artwork(oversizedFrame), null);

    assert.equal(policy.findId3Artwork(new Uint8Array(Buffer.from('RIFF....WAVEfmt '))), null);
    assert.equal(policy.findId3Artwork([0x49, 0x44, 0x33, 3, 0, 0, 0, 0, 0, 0]), null);
    assert.equal(policy.findId3Artwork(null), null);
});

const goodEntry = () => ({ name: 'My preset', settings: { effects: { 'Signal Tear': 0.5, 'Cyber Rain': 0 } } });

test('user preset entries require a bounded name and finite 0..1 effect levels', () => {
    assert.ok(policy.validPresetEntry(goodEntry()));
    assert.ok(policy.validPresetEntry({ name: 'x'.repeat(80), settings: { alphas: { Flash: 1 } } }));
    const bad = [
        null, [], 'preset',
        { ...goodEntry(), name: '' },
        { ...goodEntry(), name: '   ' },
        { ...goodEntry(), name: 'x'.repeat(81) },
        { ...goodEntry(), name: 42 },
        { name: 'No settings' },
        { name: 'Array effects', settings: { effects: [0.5] } },
        { name: 'Too high', settings: { effects: { Flash: 1.01 } } },
        { name: 'Negative', settings: { effects: { Flash: -0.01 } } },
        { name: 'NaN', settings: { effects: { Flash: Number.NaN } } },
        { name: 'Infinity', settings: { effects: { Flash: Number.POSITIVE_INFINITY } } },
        { name: 'String', settings: { effects: { Flash: '0.5' } } },
        { name: 'Too many', settings: { effects: Object.fromEntries(Array.from({ length: 129 }, (_, i) => ['fx' + i, 0])) } }
    ];
    for (const entry of bad) assert.equal(policy.validPresetEntry(entry), false, JSON.stringify(entry));
});

test('preset backups accept the v2 array and the signal-lab export, up to 500 valid entries', () => {
    const entries = [goodEntry(), { name: 'Second', settings: { effects: { Flash: 0.2 } } }];
    assert.equal(policy.presetBackupEntries(entries), entries);
    const exported = { format: 'signal-lab-presets', version: 1, presets: entries };
    assert.equal(policy.presetBackupEntries(exported), entries);
    assert.equal(policy.presetBackupEntries(Array.from({ length: 500 }, (_, i) => ({ ...goodEntry(), name: 'p' + i }))).length, 500);
    assert.equal(policy.presetBackupEntries(Array.from({ length: 501 }, (_, i) => ({ ...goodEntry(), name: 'p' + i }))), null);
    assert.equal(policy.presetBackupEntries([goodEntry(), { name: '', settings: {} }]), null);
    for (const payload of [null, 'x', 7, {}, { presets: 'nope' }]) {
        assert.equal(policy.presetBackupEntries(payload), null, JSON.stringify(payload));
    }
    assert.equal(policy.MAX_USER_PRESETS, 500);
    assert.equal(policy.MAX_PRESET_NAME_CHARS, 80);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readWeb } from './harness.mjs';
import { buildManifest } from '../../tools/build-effects-manifest.mjs';

const committed = JSON.parse(fs.readFileSync(path.join(ROOT, 'webui', 'data', 'effects.manifest.json'), 'utf8'));

test('the committed effects manifest matches the registry in glitch-player.js', () => {
    assert.deepEqual(committed, buildManifest(readWeb('js/glitch-player.js')));
});

test('the manifest defines 43 voices, each once, starting at zero', () => {
    assert.equal(committed.voiceCount, 43);
    assert.equal(committed.voices.filter((v) => v.kind === 'timed').length, 39);
    assert.equal(committed.voices.filter((v) => v.kind === 'master').length, 4);
    assert.equal(new Set(committed.voices.map((v) => v.id)).size, 43);
    assert.ok(committed.voices.every((v) => v.defaultAlpha === 0));
});

test('only Flash and Strobe (and any R3 twin) are photosensitive, with the 20% / 35% caps', () => {
    for (const v of committed.voices) {
        const base = v.id.replace(/^R3 /, '');
        assert.equal(v.photosensitive, base === 'Flash' || base === 'Strobe', v.id);
        if (base === 'Flash') assert.equal(v.cap, 0.2);
        if (base === 'Strobe') assert.equal(v.cap, 0.35);
    }
});

test('every voice has a transition character and the lights are never hard-cut', () => {
    for (const v of committed.voices) assert.ok(['glide', 'cut', 'neutral'].includes(v.transition), v.id);
    for (const id of ['Flash', 'Strobe', 'R3 Flash', 'R3 Strobe']) {
        const v = committed.voices.find((x) => x.id === id);
        if (v) assert.equal(v.transition, 'neutral', id);
    }
    assert.ok(committed.voices.some((v) => v.transition === 'glide'));
    assert.ok(committed.voices.some((v) => v.transition === 'cut'));
});

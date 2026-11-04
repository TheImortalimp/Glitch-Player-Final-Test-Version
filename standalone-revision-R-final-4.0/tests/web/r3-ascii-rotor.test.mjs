import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readWeb } from './harness.mjs';

const r3 = readWeb('js/r3-factories.js');
const ascii = r3.slice(r3.indexOf('function glitchASCIIArtOverlayFactory('), r3.indexOf('function rebuildMatrixRain') > 0 ? r3.indexOf('function rebuildMatrixRain') : undefined);

test('the R3 ASCII rotor shows one face at a time: the scatter and the stacks never mix (4.2.4)', () => {
    assert.ok(ascii.includes('const w006 = Math.max(0, 2 * rotW - 1);'), 'the 006 face owns the upper half of the rotor weight');
    assert.ok(ascii.includes('const ensW = Math.max(0, 1 - 2 * rotW);'), 'the ENS face owns the lower half');
    assert.ok(ascii.includes('if (w006 > 0.02) {'), 'the 006 scatter paints only on its own face');
    assert.ok(ascii.includes('* ensW * /* 4.2.4: ENS face only */'), 'stack spawning follows the ENS face only');
    assert.ok(!/const a = \(1 - rotW\)/.test(ascii), 'no stack alpha still crossfades against the scatter');
});

test('the soothing small-stack face dominates and every activation opens on it (4.2.4)', () => {
    assert.ok(ascii.includes('let rotStyle006 = false;'), 'the voice is created on the ENS face');
    assert.ok(ascii.includes('rotW = 0;'), 'a reset returns to the ENS face');
    assert.ok(ascii.includes('rotUntil = now + 5200 + Math.random() * 4800;'), 'the calm face dwells long');
    assert.ok(ascii.includes('1200 + Math.random() * 1200 :'), 'the 006 scatter only strikes briefly');
    assert.ok(ascii.includes('Math.min(1, dt / 0.22);'), 'the rotor eases gently');
});

test('the wild 006 face is split along the slider: it only strikes at 90-100% and grows with it (4.2.4)', () => {
    assert.ok(ascii.includes('const wildK = clamp01((s - 0.9) / 0.1);'), 'the wild band starts at 90%');
    assert.ok(ascii.includes('rotStyle006 = wildK > 0 && !rotStyle006;'), 'below the band the rotor never strikes 006');
    assert.ok(ascii.includes('if (wildK <= 0 && rotStyle006) {'), 'leaving the band returns to the soothing face');
    assert.ok(ascii.includes('(1 + 0.6 * wildK); /* 4.2.4: larger glyphs deeper in the band */'), 'the scatter grows deeper in the band');
});

test('R3 ASCII stacks keep their own lane: overlapping placements are re-rolled (4.2.4)', () => {
    assert.ok(ascii.includes('for (let tries = 0; tries < 6; tries++) {'), 'placement retries exist');
    assert.ok(ascii.includes('Math.abs(o.x - sx) < glyphPx * 1.3'), 'a doubled column is rejected');
});

test('the R3 ASCII profile carries the lifted 4.2.4 peak', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'webui', 'data', 'effects.manifest.json'), 'utf8'));
    const voice = manifest.voices.find((v) => v.id === 'R3 ASCII');
    assert.ok(voice, 'R3 ASCII voice exists');
    assert.deepEqual(voice.blendProfile.peak, [0.18, 0.72]);
    assert.equal(voice.blendProfile.rate, 0.14);
});

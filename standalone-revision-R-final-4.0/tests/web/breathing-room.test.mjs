import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readWeb } from './harness.mjs';

const player = readWeb('js/glitch-player.js');

/* Runs the R4.1.1 BREATHING ROOM block from glitch-player.js with stubbed
   surroundings, so the rest behaviour can be driven deterministically. */
function breathSandbox({ traits = {}, lights = new Set() } = {}) {
    const start = player.indexOf('          const BREATH_ODDS');
    const end = player.indexOf('          const PARKED_EPSILON');
    assert.ok(start > 0 && end > start, 'breathing-room block');
    const context = vm.createContext({});
    vm.runInContext(`
        const HARD_CUT_MODES = new Set(['snap', 'burst', 'flipflop']);
        const voiceTraits = ${JSON.stringify(traits)};
        const lightNames = new Set(${JSON.stringify([...lights])});
        function isManualLight(name) { return lightNames.has(name); }
        let nextRandom = 0;
        Math.random = () => nextRandom;
        ${player.slice(start, end)}
        globalThis.sb = {
            setRandom(v) { nextRandom = v; },
            breathing(name, now, mode) { return voiceBreathing(name, now, mode); },
            until(name) { return voiceBreathUntil[name] || 0; },
            odds: BREATH_ODDS,
            bounds: BREATH_MS
        };
    `, context);
    return context.sb;
}

test('the breathing-room constants are sane: odds under one, rest bounds ordered and over a second', () => {
    const sb = breathSandbox();
    assert.ok(sb.odds > 0 && sb.odds < 1);
    assert.ok(sb.bounds[0] >= 1000 && sb.bounds[1] > sb.bounds[0]);
});

test('a voice that starts a breath holds through it and wakes after it ends', () => {
    const sb = breathSandbox();
    sb.setRandom(0); // certain breath, minimum duration
    assert.equal(sb.breathing('ASCII', 10000, 'smooth'), true, 'the breath begins');
    const until = sb.until('ASCII');
    assert.equal(until, 10000 + sb.bounds[0], 'minimum rest at the low roll');
    sb.setRandom(0.99);
    assert.equal(sb.breathing('ASCII', until - 1, 'smooth'), true, 'still resting inside the window');
    assert.equal(sb.breathing('ASCII', until, 'smooth'), false, 'awake once the breath ends');
});

test('a high roll never starts a breath', () => {
    const sb = breathSandbox();
    sb.setRandom(0.99);
    assert.equal(sb.breathing('VHS Glitch', 0, 'smooth'), false);
    assert.equal(sb.until('VHS Glitch'), 0);
});

test('the rest length stays inside the fixed bounds at the highest roll', () => {
    const sb = breathSandbox();
    // Just below the smooth-mode odds so the breath still starts, maximising the duration roll.
    sb.setRandom(sb.odds - 0.001);
    assert.equal(sb.breathing('Neon Grad', 0, 'smooth'), true);
    assert.ok(sb.until('Neon Grad') <= sb.bounds[1], 'never rests past the ceiling');
});

test('the lights never breathe: their calmer automation is untouched', () => {
    const sb = breathSandbox({ lights: new Set(['Flash', 'Strobe']) });
    sb.setRandom(0);
    assert.equal(sb.breathing('Flash', 0, 'smooth'), false);
    assert.equal(sb.breathing('Strobe', 0, 'smooth'), false);
    assert.equal(sb.until('Flash'), 0);
    assert.equal(sb.until('Strobe'), 0);
});

test('glide voices breathe a little more often and the wild modes halve the odds', () => {
    const sb = breathSandbox({ traits: { 'Neon Grad': { kind: 'glide' } } });
    // Base odds pass for a glide voice but not for the wild modes.
    sb.setRandom(0.27);
    assert.equal(sb.breathing('Neon Grad', 0, 'smooth'), true, 'glide voice breathes at base odds');
    for (const mode of ['snap', 'burst', 'flipflop', 'flipBurst', 'zoomBurst']) {
        const name = 'wild-' + mode;
        assert.equal(sb.breathing(name, 0, mode), false, mode + ' halves the odds');
    }
    sb.setRandom(0.10);
    assert.equal(sb.breathing('fresh-snap', 0, 'snap'), true, 'a low roll still breathes in a wild mode');
});

test('the retarget loop gives a breathing voice its silence', () => {
    const loop = player.indexOf('if (voiceBreathing(name, now, mode)) continue;');
    const retarget = player.indexOf('function retargetRandomization(');
    const loopEnd = player.indexOf('function stepContinualRandomization(');
    assert.ok(retarget > 0 && loop > retarget && loop < loopEnd,
        'voiceBreathing guards the retarget loop');
});

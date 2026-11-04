import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readWeb } from './harness.mjs';

const player = readWeb('js/glitch-player.js');

/* Runs the R4.1.3 EFFECT CANCELLATION block with stubbed lights. */
function cancelSandbox() {
    const start = player.indexOf('          const userCancelled = {};');
    const end = player.indexOf('          function randRange(');
    assert.ok(start > 0 && end > start, 'cancellation block');
    const context = vm.createContext({});
    vm.runInContext(`
        const lights = new Set(['Flash', 'Strobe']);
        function isManualLight(name) { return lights.has(name); }
        ${player.slice(start, end)}
        globalThis.sb = {
            cancel(name) { setEffectCancelled(name, true); },
            wake(name) { setEffectCancelled(name, false); },
            is(name) { return isEffectCancelled(name); }
        };
    `, context);
    return context.sb;
}

test('a cancelled effect stays cancelled until it is woken, and waking clears it', () => {
    const sb = cancelSandbox();
    sb.cancel('ASCII');
    assert.equal(sb.is('ASCII'), true);
    sb.wake('ASCII');
    assert.equal(sb.is('ASCII'), false);
});

test('the lights are never latched by the cancellation system', () => {
    const sb = cancelSandbox();
    sb.cancel('Flash');
    sb.cancel('Strobe');
    assert.equal(sb.is('Flash'), false);
    assert.equal(sb.is('Strobe'), false);
});

test('ZERO ALL cancels every effect so nothing can automatically start afterwards', () => {
    const zero = player.slice(player.indexOf('function zeroAllEffects()'), player.indexOf("if ($('zeroAllBtn'))"));
    assert.ok(zero.includes('setEffectCancelled(name, true)'), 'ZERO ALL latches the cancellation');
});

test('every automation path respects the cancellation latch', () => {
    assert.ok(/const parked = profileNames\.filter\(\(n\) =>\s*!automationHeld\(n\) && !isEffectCancelled\(n\)/.test(player),
        "Auto Glitch's unpark skips cancelled effects");
    assert.ok(player.includes("if (isEffectCancelled(name)) { randomTargets[name] = 0; continue; }"),
        'the continual randomizer skips cancelled effects');
    assert.equal((player.match(/if \(isEffectCancelled\(name\)\) return;/g) || []).length >= 3, true,
        'aesthetic bursts skip cancelled effects in peak, suppress and dip phases');
    assert.ok(player.includes('!isEffectCancelled(n) &&'),
        'burst group availability ignores cancelled voices');
});

test('a slider dragged to zero cancels its effect; presets and Randomize All re-determine them', () => {
    assert.ok(player.includes('setEffectCancelled(def.name, v < PARKED_EFFECT_EPSILON)'),
        'the slider mirrors park intent into cancellation');
    assert.equal((player.match(/setEffectCancelled\(name, v < PARKED_EFFECT_EPSILON\)/g) || []).length, 2,
        'preset apply and Randomize All determine the cancelled set');
    assert.ok(player.includes('setEffectCancelled(name, false); /* R4.1.3: a tuned pick is user intent'),
        'a tuned voice pick wakes its pair');
});

test('voices separate: each carries join odds and glides travel longer than cuts', () => {
    assert.ok(player.includes('join: 0.6 + Math.random() * 0.3'), 'per-voice separation odds');
    assert.ok(player.includes('if (trait && Math.random() > trait.join) continue;'), 'the retarget loop staggers voices');
    assert.ok(player.includes("(kind === 'glide' ? 0.62 : kind === 'cut' ? 1.35 : 1)"), 'glides travel slower (longer transitions)');
});

test('MACHINE decks are determined by one reproducible seed', () => {
    assert.ok(player.includes('function buildMachinePresets(seedOverride)'), 'the builder accepts a seed');
    assert.ok(player.includes('buildMachinePresets.lastSeed = seed;'), 'the deck seed is recorded');
});

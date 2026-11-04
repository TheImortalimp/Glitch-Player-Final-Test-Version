import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readWeb } from './harness.mjs';

/* The generator lives inside the player's closure, so its source slice runs with stubbed globals. */
function loadGenerator() {
    const player = readWeb('js/glitch-player.js');
    const slice = player.slice(player.indexOf('function mulberry32'), player.indexOf('const LAB_EFFECT_ALIASES'));
    const factory = new Function('window', 'GlitchEngine', 'LIGHT_CEILING', 'profileNames', 'document',
        slice + ';return buildMachinePresets;');
    return factory({ crypto: webcrypto }, undefined, { Flash: 0.2, Strobe: 0.35 }, [], {});
}

test('MACHINE presets are built from a fresh seed each time (start and Refresh)', () => {
    const build = loadGenerator();
    const first = build();
    const second = build();
    assert.equal(Object.keys(first).length, 80);
    assert.notEqual(first['Deepseek-2'].seed, second['Deepseek-2'].seed);
    assert.notDeepEqual(first['Deepseek-5'].alphas, second['Deepseek-5'].alphas);
});

test('generated MACHINE lights stay within the Flash/Strobe caps and never peak together', () => {
    const build = loadGenerator();
    for (let run = 0; run < 5; run++) {
        const bank = build();
        for (const [name, preset] of Object.entries(bank).slice(1)) {
            assert.ok(preset.alphas.Flash <= 0.2, name + ' Flash');
            assert.ok(preset.alphas.Strobe <= 0.35, name + ' Strobe');
            assert.ok(!(preset.alphas.Flash > 0.1 && preset.alphas.Strobe > 0.175), name + ' both lights high');
        }
    }
});

test('the MACHINE bank is not frozen', () => {
    const player = readWeb('js/glitch-player.js');
    assert.ok(!/Object\.freeze\(machinePresets\)/.test(player));
});

test('DROP THE MILK? deck keeps all 80 presets and never repeats a family back to back', () => {
    const player = readWeb('js/glitch-player.js');
    const start = player.indexOf('function orderMilkDeck');
    const slice = player.slice(start, player.indexOf('function setMilkActive'));
    const order = new Function(slice + ';return orderMilkDeck;')();
    const bank = Array.from({ length: 80 }, (_, i) => ({ id: i + 1, family: 'F' + Math.floor(i / 10), hueOffset: (i * 47) % 360 }));
    for (let run = 0; run < 20; run++) {
        const deck = order(bank);
        assert.equal(new Set(deck.map((p) => p.id)).size, 80);
        let repeats = 0;
        for (let i = 1; i < deck.length; i++) if (deck[i].family === deck[i - 1].family) repeats++;
        assert.ok(repeats <= 8, 'family repeats: ' + repeats);
    }
});

test('automatic light retargeting keeps the caps and skips a peak while the other light is high', () => {
    const player = readWeb('js/glitch-player.js');
    const start = player.indexOf('function stepLightWander');
    const body = player.slice(start, player.indexOf('function stepLightArm'));
    assert.match(body, /Math\.pow\(Math\.random\(\), lt\.pow\) \* lightCap\(name\)/);
    const traits = player.slice(player.indexOf('function rollLightTrait'), start);
    assert.match(traits, /pow: 1\.3 \+ Math\.random\(\) \* 1\.0/);
    assert.match(traits, /rate: 0\.7 \+ Math\.random\(\) \* 0\.5/);
    assert.match(body, /lightWanderAt\[name\] = now \+ 1200 \+/);
    assert.match(body, /> 0\.5 \* lightCap\(other\)\) t \*= 0\.4/);
    assert.match(body, /clampLight\(name, lightWanderTarget\[name\]/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, readWeb } from './harness.mjs';

const player = readWeb('js/glitch-player.js');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'webui', 'data', 'effects.manifest.json'), 'utf8'));
const voiceIds = new Set(manifest.voices.map((v) => v.id));

function readGroups() {
    const start = player.indexOf('          const AESTHETIC_GROUPS = {');
    assert.ok(start > 0, 'AESTHETIC_GROUPS block');
    const end = player.indexOf('\n          };', start);
    assert.ok(end > start, 'AESTHETIC_GROUPS end');
    const context = vm.createContext({});
    vm.runInContext(player.slice(start, end) + '\n          };\n          globalThis.groups = AESTHETIC_GROUPS;', context);
    return context.groups;
}

const groups = readGroups();
const NEW_GROUPS = ['prismDrift', 'moonlightVeil', 'glyphRainfall', 'crtDaydream'];

test('the beautiful effects palette holds 16 curated groups including the R4.1.1 four', () => {
    assert.equal(Object.keys(groups).length, 16);
    for (const key of NEW_GROUPS) assert.ok(groups[key], key);
});

test('every palette group names only real voices and keeps its ranges ordered inside 0..1', () => {
    for (const [key, g] of Object.entries(groups)) {
        assert.ok(Array.isArray(g.effects) && g.effects.length >= 2, key + ' has at least two voices');
        for (const name of g.effects) assert.ok(voiceIds.has(name), key + ' names a real voice: ' + name);
        for (const name of g.suppress || []) assert.ok(voiceIds.has(name), key + ' suppresses a real voice: ' + name);
        for (const range of [g.peakRange, g.dipRange]) {
            assert.ok(range[0] >= 0 && range[1] <= 1 && range[0] <= range[1], key + ' range inside 0..1');
        }
        for (const span of [g.holdMs, g.dipMs, g.restMs]) {
            assert.ok(span[0] > 0 && span[1] >= span[0], key + ' timing span ordered');
        }
        assert.ok(g.dipRange[1] < g.peakRange[1], key + ' dips below its peak');
    }
});

test('the four R4.1.1 groups are light-free and rest long enough to breathe', () => {
    for (const key of NEW_GROUPS) {
        const g = groups[key];
        for (const name of g.effects) {
            const base = name.replace(/^R3 /, '');
            assert.ok(base !== 'Flash' && base !== 'Strobe', key + ' stays light-free');
        }
        assert.ok(g.restMs[0] >= 5000, key + ' rests at least five seconds');
        assert.ok(g.holdMs[0] >= 2000, key + ' holds its scene calmly');
        assert.ok(g.peakRange[1] <= 0.9, key + ' peaks below full blast');
    }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readWeb, runInSandbox, webScripts } from './harness.mjs';

const player = readWeb('js/glitch-player.js');

function arrayBlock(name) {
    const start = player.indexOf('const ' + name + ' = [');
    assert.ok(start >= 0, name + ' not found');
    return player.slice(start, player.indexOf('];', start));
}

function objectBlock(name) {
    const start = player.indexOf('const ' + name + ' = ');
    assert.ok(start >= 0, name + ' not found');
    const end = /\n\s*\}\)?;/g;
    end.lastIndex = start;
    assert.ok(end.exec(player), name + ' has no end');
    return player.slice(start, end.lastIndex);
}

function registrations(name) {
    return [...arrayBlock(name).matchAll(/\{\s*name:\s*'([^']+)'(?:,\s*factory:\s*([^,]+?))?,\s*defaultAlpha:\s*([^\s}]+)\s*\}/g)]
        .map(([, effect, factory, alpha]) => ({ effect, factory: factory && factory.trim(), alpha: Number(alpha) }));
}

const timed = registrations('timedEffectsDefs');
const masters = registrations('masterEffectsDefs');
const voices = [...timed, ...masters].map((def) => def.effect);
const profileNames = [...objectBlock('blendProfiles').matchAll(/^\s*'([^']+)':\s*\{/gm)].map((m) => m[1]);
const aliases = Object.fromEntries([...objectBlock('LAB_EFFECT_ALIASES').matchAll(/'([^']+)':\s*'([^']+)'/g)]
    .map((m) => [m[1], m[2]]));

const PROJECTOR_EFFECTS = ['Chromatic Echo', 'Temporal Slices', 'Signal Tear', 'Cyber Rain', 'Prism Rift', 'Orbit HUD',
    'Neon Grad', 'Scanlines', 'Flash', 'HSL Rainbow', 'ASCII', 'Font Burn', 'Strobe', 'Gemini Bomb', 'Data Bands',
    'VHS Glitch', 'R3 Ghost Spectrum', 'R3 V-Sync'];
const AI_WARP_VOICES = ['Rolling Scan', 'Tape Grain', 'Tracking Tear', 'R3 B&W Invert', 'R3 Hue/Color Cycle'];
const GLITCH_PLAYER_3_EFFECTS = ['Tech Artist', 'Data Bomb', 'Ink Glyphs', 'Matrix ASCII', 'Matrix Chord',
    'B&W Invert', 'Hue/Color Cycle', 'R3 Neon Grad', 'R3 Scanlines', 'R3 Gemini Bomb', 'R3 Tech Artist',
    'R3 Data Bomb', 'R3 Ink Glyphs', 'R3 Matrix ASCII', 'R3 Matrix Chord', 'R3 HSL Rainbow', 'R3 ASCII',
    'R3 Font Burn', 'R3 Data Bands', 'R3 VHS Glitch'];

function deepFrozen(value) {
    if (!value || typeof value !== 'object') return true;
    return Object.isFrozen(value) && Object.values(value).every(deepFrozen);
}

test('the merged registry has 39 timed voices and 4 master voices, all booting at zero', () => {
    assert.equal(timed.length, 39);
    assert.equal(masters.length, 4);
    assert.equal(new Set(voices).size, voices.length, 'duplicate registration');
    for (const def of [...timed, ...masters]) assert.equal(def.alpha, 0, def.effect);
});

test('every source app contributes all of its effects to the merged registry', () => {
    for (const name of [...PROJECTOR_EFFECTS, ...AI_WARP_VOICES, ...GLITCH_PLAYER_3_EFFECTS]) {
        assert.ok(voices.includes(name), name + ' is missing');
    }
});

test('each voice has exactly one blend profile and a defined renderer', () => {
    assert.deepEqual([...profileNames].sort(), [...voices].sort());
    const source = webScripts().map((s) => s.source).join('\n');
    const r3Index = objectBlock('R3_FACTORY_INDEX');
    for (const { effect, factory } of timed) {
        const r3 = /^r3Factory\('([^']+)'\)$/.exec(factory);
        if (r3) {
            assert.ok(r3Index.includes("'" + r3[1] + "':"), effect + ' has no Revision 3 runner');
        } else if (!/^r3SystemFactory\('(ghost|vsync)'\)$/.test(factory)) {
            assert.match(factory, /^[A-Za-z_$][\w$]*$/, effect);
            assert.ok(new RegExp('(?:function\\s+' + factory + '\\s*\\(|(?:const|let|var)\\s+' + factory + '\\s*=)')
                .test(source), factory + ' is not defined');
        }
    }
});

test('automatic peaks never select Flash or Strobe', () => {
    const peakPool = [...arrayBlock('peakPool').matchAll(/'([^']+)'/g)].map((m) => m[1]);
    assert.ok(peakPool.length > 0);
    assert.ok(!peakPool.includes('Flash') && !peakPool.includes('Strobe'));
    for (const name of peakPool) assert.ok(profileNames.includes(name), name);
});

test('the 250 LAB snapshots are unique, deep-frozen, flash-free and map onto registered voices', () => {
    const window = {};
    runInSandbox('js/glyph-library.js', { window, document: { getElementById: () => null } });
    const bank = window.GlitchMachinePresets;
    assert.equal(bank.length, 250);
    assert.ok(deepFrozen(bank));
    assert.equal(new Set(bank.map((p) => p.id)).size, 250);
    for (const target of Object.values(aliases)) assert.ok(AI_WARP_VOICES.includes(target), target);
    for (const preset of bank) {
        assert.match(preset.id, /^M\d{3}$/);
        assert.ok(preset.name.length > 0 && preset.name.length <= 80, preset.id);
        for (const [name, level] of Object.entries(preset.settings.effects || {})) {
            assert.ok(name !== 'Flash' && name !== 'Strobe', preset.id + ' contains ' + name);
            assert.ok(profileNames.includes(aliases[name] || name), preset.id + ' uses unknown effect ' + name);
            assert.ok(Number.isFinite(level) && level >= 0 && level <= 1, preset.id + ' ' + name);
        }
    }
});

test('the GHOST / OF ME easter egg stays behind confirmation without automatically enabling Flash/Strobe', () => {
    const literal = /const GHOST_OF_ME = Object\.freeze\((\{.*\})\);/.exec(player);
    assert.ok(literal, 'GHOST_OF_ME literal not found');
    const preset = JSON.parse(literal[1]);
    assert.equal(preset.name, 'GHOST / OF ME');
    for (const name of Object.keys(preset.settings.effects)) assert.ok(profileNames.includes(name), name);
    for (const name of Object.keys(preset.settings.sliderLocks)) {
        assert.ok(name === 'global' || profileNames.includes(name), name);
    }
    assert.match(player, /window\.confirm\('GHOST \/ OF ME enables intense effects and continual randomization\. Flash and Strobe keep your manual levels\./);
    assert.doesNotMatch(player, /const flashText =|const reveal =/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readWeb } from './harness.mjs';

const player = readWeb('js/glitch-player.js');
const HZ = 60;

/* Copies the source from a start marker through an end marker. Each marker must occur once. */
function declarations(startMarker, endMarker) {
    const start = player.indexOf(startMarker);
    const end = player.indexOf(endMarker, start + 1);
    assert.ok(start >= 0 && end > start, `markers not found in order: ${startMarker}`);
    assert.equal(player.indexOf(startMarker, start + 1), -1, `duplicate marker: ${startMarker}`);
    assert.equal(player.indexOf(endMarker, end + 1), -1, `duplicate marker: ${endMarker}`);
    return player.slice(start, end + endMarker.length);
}

/* Returns one whole function declaration, found by brace depth. */
function functionSource(name) {
    const head = `function ${name}(`;
    const at = player.indexOf(head);
    assert.ok(at >= 0, `missing function ${name}`);
    assert.equal(player.indexOf(head, at + 1), -1, `duplicate function ${name}`);
    let depth = 0;
    for (let i = player.indexOf('{', at); i < player.length; i++) {
        if (player[i] === '{') depth++;
        if (player[i] === '}' && --depth === 0) return player.slice(at, i + 1);
    }
    throw new Error(`unterminated function ${name}`);
}

/* Runs the real engine and light block in one vm context. The rest of the player
   that the block reads is stubbed here. Math.random is seeded so the wander is repeatable. */
function lightSandbox() {
    const sandbox = {};
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    const run = (code) => vm.runInContext(code, sandbox);
    run(readWeb('js/glitch-engine.js'));
    run(declarations('const clamp = (v, a, b)', 'const lerp = (a, b, t) => a + (b - a) * t;'));
    run(declarations('const PARKED_EPSILON = 0.02;', 'const crParked = {};'));
    run(declarations('const effectAlphas = {};', 'const smoothedStrength = {};'));
    run(`
        let isAiWarpActive = false;
        let sliderLocks = {};
        let randomTargets = {};
        let sliderWritten = {};
        let sliderElements = {
            Flash: { value: '', closest() { return null; } },
            Strobe: { value: '', closest() { return null; } },
        };
        function softK() { return 1; }
        function bwMasterLevel() { return 0; }
        function getGhostMode() { return 'OFF'; }
        function getVsyncMode() { return 'OFF'; }
        function updateContinuousEffectsCache() {}
        Math.random = (() => {
            let seed = 12345;
            return () => {
                seed = (seed * 16807) % 2147483647;
                return (seed - 1) / 2147483646;
            };
        })();
    `);
    sandbox.bodyClasses = new Set();
    sandbox.document = { body: { classList: { contains: (c) => sandbox.bodyClasses.has(c) } } };
    sandbox.presetLockKeys = new Set();
    sandbox.masterOpacity = 1;
    sandbox.masterControls = { effectIntensity: 1 };
    sandbox.video = null;
    sandbox.localAudio = null;
    return { sandbox, run };
}

test('the Flash and Strobe switch starts OFF, and its label and aria-pressed follow it', () => {
    const { sandbox, run } = lightSandbox();
    const button = { textContent: '', attributes: {}, setAttribute(key, value) { this.attributes[key] = value; } };
    sandbox.button = button;
    run('lightSwitchEl = button; paintLightSwitch();');
    assert.equal(button.textContent, 'Flash & Strobe (automatic): OFF');
    assert.equal(button.attributes['aria-pressed'], 'false');
    sandbox.setLightAutomation(true);
    assert.equal(button.textContent, 'Flash & Strobe (automatic): ON');
    assert.equal(button.attributes['aria-pressed'], 'true');
});

test('switching the lights on parks them at zero and re-picks a target at once', () => {
    const { sandbox, run } = lightSandbox();
    sandbox.setLightAutomation(true);
    assert.equal(run('crParked.Flash && crParked.Strobe'), true);
    assert.equal(run('lightWanderAt.Flash + lightWanderAt.Strobe'), 0);
    assert.equal(run('(effectAlphas.Flash || 0) + (effectAlphas.Strobe || 0)'), 0);
});

test('manual levels are capped at 20% for Flash and 35% for Strobe, and other voices are not capped', () => {
    const { sandbox, run } = lightSandbox();
    sandbox.setLightLevelNow('Flash', 0.9);
    sandbox.setLightLevelNow('Strobe', 1);
    assert.equal(run('effectAlphas.Flash'), 0.2);
    assert.equal(run('effectAlphas.Strobe'), 0.35);
    assert.equal(run('sliderElements.Flash.value'), '0.200');
    assert.equal(run('sliderElements.Strobe.value'), '0.350');
    assert.equal(sandbox.clampLight('Flash', NaN), 0);
    assert.equal(sandbox.clampLight('Strobe', -1), 0);
    assert.equal(sandbox.clampLight('ASCII', 0.9), 0.9);
});

test('with the switch on, twenty seconds of wandering stays under the caps and really moves', () => {
    const { sandbox, run } = lightSandbox();
    sandbox.setLightAutomation(true);
    const flashLevels = new Set();
    const strobeLevels = new Set();
    for (let tick = 1; tick <= 20 * HZ; tick++) {
        sandbox.stepLightWander(tick * 1000 / HZ, 1 / HZ);
        const flash = run('effectAlphas.Flash || 0');
        const strobe = run('effectAlphas.Strobe || 0');
        assert.ok(flash >= 0 && flash <= 0.20, `Flash left its cap at tick ${tick}: ${flash}`);
        assert.ok(strobe >= 0 && strobe <= 0.35, `Strobe left its cap at tick ${tick}: ${strobe}`);
        flashLevels.add(flash);
        strobeLevels.add(strobe);
    }
    assert.ok(flashLevels.size > 20, 'Flash should keep moving');
    assert.ok(strobeLevels.size > 20, 'Strobe should keep moving');
    assert.ok(Math.max(...flashLevels) > 0.02, 'Flash should rise above the parked level');
});

test('a locked slider keeps its level while the switch is on', () => {
    const { sandbox, run } = lightSandbox();
    sandbox.setLightAutomation(true);
    sandbox.setLightLevelNow('Strobe', 0.2);
    run('sliderLocks.Strobe = true');
    for (let tick = 1; tick <= 5 * HZ; tick++) sandbox.stepLightWander(tick * 1000 / HZ, 1 / HZ);
    assert.equal(run('effectAlphas.Strobe'), 0.2);
});

test('switching automation off leaves capped manual output active and keeps levels and locks', () => {
    const { sandbox, run } = lightSandbox();
    run(functionSource('effectLiveStrength'));
    sandbox.setLightAutomation(true);
    sandbox.setLightLevelNow('Flash', 0.1);
    sandbox.setLightLevelNow('Strobe', 0.2);
    run('sliderLocks.Strobe = true');
    sandbox.setLightAutomation(false);
    assert.equal(run('effectLiveStrength("Flash")'), 0.1);
    assert.equal(run('effectLiveStrength("Strobe")'), 0.2);
    assert.equal(run('effectAlphas.Flash'), 0.1);
    assert.equal(run('effectAlphas.Strobe'), 0.2);
    assert.equal(run('sliderElements.Flash.value'), '0.100');
    assert.equal(run('sliderElements.Strobe.value'), '0.200');
    assert.equal(run('sliderLocks.Strobe'), true);
    sandbox.setLightAutomation(true);
    assert.equal(run('effectAlphas.Flash'), 0.1, 'the levels return when the switch is turned on again');
    assert.equal(run('effectAlphas.Strobe'), 0.2);
});

test('a hand-locked light keeps its current level when automation is switched off', () => {
    const { sandbox, run } = lightSandbox();
    run(functionSource('effectLiveStrength'));
    sandbox.setLightAutomation(true);
    sandbox.setLightLevelNow('Flash', 0.1);
    run('effectAlphas.Flash = 0.18; sliderLocks.Flash = true;');
    sandbox.setLightAutomation(false);
    assert.equal(run('effectAlphas.Flash'), 0.18);
    assert.equal(run('lightStored.Flash'), 0.18);
    assert.equal(run('sliderElements.Flash.value'), '0.180');
    assert.equal(run('effectLiveStrength("Flash")'), 0.18);
});

test('a light stopped by the user lands on exactly zero within ten seconds', () => {
    const { sandbox, run } = lightSandbox();
    sandbox.setLightAutomation(true);
    sandbox.setLightLevelNow('Flash', 0.15);
    run('lightStoppedByUser.Flash = true');
    for (let tick = 1; tick <= 10 * HZ; tick++) sandbox.stepLightWander(tick * 1000 / HZ, 1 / HZ);
    assert.equal(run('effectAlphas.Flash'), 0);
});

test('a manual level is not pulled back toward an earlier wander target', () => {
    const { sandbox, run } = lightSandbox();
    sandbox.setLightAutomation(true);
    run('lightWanderTarget.Flash = 0.15; lightWanderAt.Flash = Infinity;');
    sandbox.setLightLevelNow('Flash', 0.05);
    for (let tick = 1; tick <= HZ / 2; tick++) sandbox.stepLightWander(tick * 1000 / HZ, 1 / HZ);
    assert.ok(Math.abs(run('effectAlphas.Flash') - 0.05) <= 0.005);
});

test('automated Flash or Strobe eases to zero while local media is held', () => {
    const { sandbox, run } = lightSandbox();
    run(functionSource('effectLiveStrength'));
    run('effectAlphas.ASCII = 0.5;');
    sandbox.setLightAutomation(true);
    sandbox.setLightLevelNow('Strobe', 0.3);
    for (let tick = 1; tick <= 3 * HZ; tick++) sandbox.stepLightArm(1 / HZ);
    assert.ok(Math.abs(run('effectLiveStrength("Strobe")') - 0.3) < 1e-9);
    sandbox.bodyClasses.add('local-audio');
    sandbox.localAudio = { paused: true, ended: false };
    for (let tick = 1; tick <= 5 * HZ; tick++) sandbox.stepLightHold(1 / HZ);
    assert.equal(run('lightHold'), 0);
    assert.equal(run('heldLevel("Strobe")'), 0);
    assert.equal(run('effectLiveStrength("Strobe")'), 0);
    assert.equal(run('effectAlphas.Strobe'), 0.3);
    assert.equal(run('effectLiveStrength("ASCII")'), 0.5);
});

test('paused or ended local media eases Flash and Strobe to zero, and they come back on play', () => {
    const { sandbox, run } = lightSandbox();
    sandbox.setLightAutomation(true);
    sandbox.setLightLevelNow('Flash', 0.15);
    sandbox.setLightLevelNow('Strobe', 0.3);
    sandbox.bodyClasses.add('local-video');
    sandbox.video = { paused: true, ended: false };
    for (let tick = 1; tick <= 5 * HZ; tick++) sandbox.stepLightHold(1 / HZ);
    assert.equal(run('heldLevel("Flash")'), 0);
    assert.equal(run('heldLevel("Strobe")'), 0);
    assert.equal(run('effectAlphas.Flash'), 0.15, 'the stored level is kept');
    sandbox.video.paused = false;
    for (let tick = 1; tick <= HZ; tick++) sandbox.stepLightHold(1 / HZ);
    assert.ok(run('lightHold') > 0.9, 'the hold eases back after play');
    sandbox.video.ended = true;
    for (let tick = 1; tick <= 5 * HZ; tick++) sandbox.stepLightHold(1 / HZ);
    assert.equal(run('lightHold'), 0, 'an ended clip holds too');
});

test('YouTube and the canvas never hold, and a local clip that is playing does not', () => {
    const { sandbox, run } = lightSandbox();
    sandbox.setLightAutomation(true);
    sandbox.setLightLevelNow('Flash', 0.15);
    sandbox.video = { paused: true, ended: true };
    sandbox.localAudio = { paused: true, ended: true };
    assert.equal(run('localMediaHeld()'), false);
    for (let tick = 1; tick <= 5 * HZ; tick++) sandbox.stepLightHold(1 / HZ);
    assert.equal(run('lightHold'), 1);
    sandbox.bodyClasses.add('local-video');
    sandbox.video = { paused: false, ended: false };
    assert.equal(run('localMediaHeld()'), false);
});

test('switching the lights off keeps their hand and preset locks and leaves other voices alone', () => {
    const { sandbox, run } = lightSandbox();
    sandbox.presetLockKeys.add('Flash');
    sandbox.presetLockKeys.add('ASCII');
    run('sliderLocks.Flash = true; sliderLocks.Strobe = true; sliderLocks.ASCII = true;');
    sandbox.setLightAutomation(true);
    sandbox.setLightAutomation(false);
    assert.equal(run('presetLockKeys.has("Flash")'), true);
    assert.equal(run('sliderLocks.Flash'), true);
    assert.equal(run('sliderLocks.Strobe'), true);
    assert.equal(run('sliderLocks.ASCII'), true);
    assert.equal(run('presetLockKeys.has("ASCII")'), true);
});

test('the board, crowd, Milk and beat readers take the held level', () => {
    assert.match(functionSource('boardHarmony'), /heldLevel\(profileNames\[i\]\)/);
    assert.match(functionSource('updateSmoothedStrengths'), /heldLevel\(profileNames\[i\]\)/);
    assert.match(functionSource('milkVoiceBlend'), /heldLevel\(name\) \* masterOpacity/);
    assert.match(functionSource('frame'), /heldLevel\(profileNames\[i\]\)/);
});

test('manual Flash and Strobe output remains live while automation is OFF', () => {
    const { sandbox, run } = lightSandbox();
    run(functionSource('effectLiveStrength'));
    sandbox.setLightLevelNow('Flash', 0.2);
    sandbox.setLightLevelNow('Strobe', 0.35);
    assert.equal(run('lightAutomationOn'), false);
    assert.equal(run('effectLiveStrength("Flash")'), 0.2);
    assert.equal(run('effectLiveStrength("Strobe")'), 0.35);
    assert.match(functionSource('applySettings'), /setLightLevelNow\(name, s\.alphas && s\.alphas\[name\] !== undefined \? s\.alphas\[name\] : 0\)/);
    assert.doesNotMatch(functionSource('applySettings'), /skipLights/);
    assert.doesNotMatch(functionSource('presetAutoStep'), /skipLights/);
});

test('the switch prompt states the caps, what OFF does and the seizure warning', () => {
    const { run } = lightSandbox();
    const prompt = run('LIGHT_SWITCH_PROMPT');
    assert.match(prompt, /never above 20% \(Flash\) or 35% \(Strobe\)/);
    assert.match(prompt, /While local media is paused or ended, their movement stops and their output eases to 0/);
    assert.match(prompt, /When off, automatic movement stops and the capped slider or preset levels remain active\. Their levels and locks are kept/);
    assert.match(prompt, /photosensitive epilepsy/);
    assert.match(prompt, /not a photosensitivity-safe mode/);
});

test('the switch click asks before turning the lights on, and turning them off does not ask', () => {
    const at = player.indexOf("lightSwitch.addEventListener('click'");
    assert.ok(at >= 0, 'switch click handler not found');
    const handler = player.slice(at, at + 400);
    assert.match(handler, /if \(lightAutomationOn\) \{\s*setLightAutomation\(false\);\s*\} else if \(window\.confirm\(LIGHT_SWITCH_PROMPT\)\) \{\s*setLightAutomation\(true\);/);
    assert.equal(player.includes('releaseLightLocks'), false);
});

test('zero all turns the switch off and parks every effect', () => {
    const body = functionSource('zeroAllEffects');
    assert.match(body, /setLightAutomation\(false\);/);
    assert.match(body, /crParked\[name\] = true;/);
});

test('the preset cycler applies capped Flash and Strobe values, and applying a preset never unparks by hand', () => {
    assert.match(functionSource('presetAutoStep'), /applyPresetByName\(name, store\);/);
    const apply = functionSource('applySettings');
    assert.match(apply, /setLightLevelNow\(name, s\.alphas && s\.alphas\[name\] !== undefined \? s\.alphas\[name\] : 0\)/);
    assert.doesNotMatch(apply, /skipLights/);
    assert.doesNotMatch(apply, /crParked\[[^\]]+\] = false/);
});

test('turning Continual Randomization on from a preset retargets from now', () => {
    assert.match(functionSource('applySettings'), /retargetRandomization\(performance\.now\(\)\)/);
});

test('the frame loop moves lights only while playing and never from Continual Randomization', () => {
    const frame = functionSource('frame');
    const wander = frame.indexOf('if (lightAutomationOn && !localMediaHeld()) stepLightWander(now, dt);');
    assert.ok(wander > 0, 'frame should call stepLightWander behind the switch and the local-media hold');
    assert.ok(frame.indexOf('document.hidden') < wander, 'the wander should follow the hidden-page gate');
    assert.ok(frame.indexOf("classList.contains('playback-on')") < wander, 'the wander should follow the playback gate');
    assert.ok(frame.indexOf("classList.contains('playback-on')") < frame.indexOf('stepLightHold(dt);'), 'the hold eases only once playback is on');
    assert.doesNotMatch(functionSource('stepContinualRandomization'), /stepLightWander/);
});

test('the switch is session only and is never captured into presets', () => {
    const body = functionSource('captureSettings');
    const at = body.lastIndexOf('return {');
    assert.ok(at >= 0, 'captureSettings return object not found');
    assert.equal(/lightAutomationOn|lightSwitch/.test(body.slice(at)), false);
});

test('Trigger reads the capped live level', () => {
    assert.match(functionSource('triggerTimedEffect'), /def\.factory\(\(\) => effectLiveStrength\(def\.name\)\)/);
    assert.match(functionSource('effectLiveStrength'), /lightCap\(name\)/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readWeb } from './harness.mjs';

const player = readWeb('js/glitch-player.js');
const html = readWeb('index.html');
const css = readWeb('css/glitch-player.css');
const r4css = readWeb('css/r4.css');

test('the ear listens fully on both sources: the canvas ear is never starved and YouTube gets its boost (4.2.4)', () => {
    const step = player.slice(player.indexOf('function softStep('), player.indexOf('let softHudEl'));
    assert.ok(step.includes("nowPlaying && nowPlaying.kind === 'youtube'"), 'the YouTube picture speaks for its audio');
    assert.ok(step.includes('videoPalette.energy * (yt ? 1.25 : 1)'), 'the full-listen boost rides YouTube energy');
    assert.ok(step.includes('videoPalette.motion * (yt ? 1.3 : 1)'), 'and its motion');
    assert.ok(step.includes("SOFT.ctx.state === 'suspended' && el && !el.paused"), 'a suspended context keeps being resumed');
    assert.ok(player.includes("el.addEventListener('play', () => {"), 'the tap re-arms on every local play');
});

test('the audio and canvas levels monitor hides and shows with its own buttons and remembers the choice (4.2.4)', () => {
    assert.ok(/<button id="earHudHide" class="ear-hud-hide" type="button" title="[^"]+">/.test(html), 'the hide button sits in the monitor head');
    assert.ok(/<button id="earHudShow" type="button" hidden title="[^"]+">/.test(html), 'the show tab exists and starts hidden');
    assert.ok(player.includes("localStorage.setItem('glitch-ear-hud-open'"), 'the visibility is persisted');
    assert.ok(player.includes("localStorage.getItem('glitch-ear-hud-open') !== '0'"), 'the monitor restores its last state');
    assert.ok(css.includes('.ear-hud-hide {'), 'the hide button is styled');
    assert.ok(css.includes('pointer-events: auto'), 'the controls are clickable over the display-only monitor');
    assert.ok(css.includes('body.playback-on #earHudShow'), 'the show tab appears during playback');
    assert.ok(r4css.includes('body:not(.playback-on) #earHudShow'), 'the show tab is gated until playback like the monitor');
});

test('the EAR mode and the auto SOFT-EYE setting survive restarts (4.2.4)', () => {
    assert.ok(player.includes("localStorage.getItem('glitch-ear-mode')"), 'the ear mode is restored');
    assert.ok(player.includes("localStorage.setItem('glitch-ear-mode', SOFT.earMode)"), 'and saved on every change');
    assert.ok(player.includes("localStorage.getItem('glitch-soft-eye-on') === '0'"), 'SOFT-EYE restores an OFF choice');
    assert.ok(player.includes("localStorage.setItem('glitch-soft-eye-on', SOFT.enabled ? '1' : '0')"), 'and saves every toggle');
});

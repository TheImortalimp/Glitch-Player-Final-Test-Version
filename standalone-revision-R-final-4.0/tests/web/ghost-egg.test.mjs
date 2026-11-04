import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readWeb, loadPolicy } from './harness.mjs';

const player = readWeb('js/glitch-player.js');
const policy = loadPolicy();
const GHOST_URL = 'https://www.youtube.com/watch?v=DmStNF35o1w';

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

const startSource = functionSource('startPlayback');
const hookMatch = /let ghostNotice = '';\s*if \(videoId === GHOST_TRACK_VIDEO_ID && ghostStartHook\) \{\s*ghostNotice = ghostStartHook\(\);\s*if \(!ghostNotice\) return;\s*\}/.exec(startSource);
const noticeMatch = /showNotificationMessage\(ghostNotice \?[\s\S]*?\);/.exec(startSource);
const idMatch = /const GHOST_TRACK_VIDEO_ID = '[A-Za-z0-9_-]{11}';/.exec(player);
const eggStart = player.indexOf('(function installEasterEgg() {');
const eggSource = player.slice(eggStart, player.indexOf('})();', eggStart) + '})();'.length);

test('startPlayback runs the GHOST hook after the link is parsed and before anything is replaced', () => {
    assert.ok(hookMatch, 'GHOST start hook not found in startPlayback');
    assert.ok(noticeMatch, 'GHOST notice not found in startPlayback');
    assert.ok(idMatch, 'GHOST_TRACK_VIDEO_ID not found');
    const parsed = startSource.indexOf('const { videoId, playlistId } = target;');
    const replaced = startSource.indexOf('++localMediaGeneration;');
    assert.ok(parsed >= 0 && parsed < hookMatch.index, 'the hook reads the parsed video ID');
    assert.ok(hookMatch.index < replaced, 'a failed GHOST load returns before the current source is stopped');
    assert.ok(eggStart > 0 && player.indexOf("const GHOST_TRACK_URL = '" + GHOST_URL + "';", eggStart) > 0);
});

/* Runs the real egg, bindSuggestedStart and startPlayback hook in one strict
   vm context. The rest of the player they read is stubbed and recorded. */
function ghostSandbox({ playing = false, dismissed = false, accept = true, automationOn = false, applyThrows = false, youtubeReady = true } = {}) {
    const calls = [];
    const notices = [];
    const confirms = [];
    const timers = [];
    const keydown = [];
    const classSet = (set) => ({
        add: (...names) => names.forEach((n) => set.add(n)),
        remove: (...names) => names.forEach((n) => set.delete(n)),
        contains: (n) => set.has(n),
    });
    const body = new Set(playing ? ['welcome-dismissed', 'playback-on'] : dismissed ? ['welcome-dismissed'] : []);
    const root = new Set();
    const element = () => ({
        style: {}, className: '', textContent: '',
        setAttribute() {}, appendChild() {}, remove() {},
    });
    const card = () => ({
        hidden: true, style: { display: 'none' }, attributes: {}, listeners: {}, focused: false,
        setAttribute(key, value) { this.attributes[key] = value; },
        addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
        focus() { this.focused = true; },
    });
    const ghostLink = card();
    const welcomeGhostLink = card();
    const sandbox = {
        calls, notices, confirms, ghostLink, welcomeGhostLink,
        parseAllowedYouTubeInput: (url) => policy.parseAllowedYouTubeInput(url),
        ytInput: { value: '' },
        welcomeEnterBtn: { click() { calls.push(['welcomeEnter']); body.add('welcome-dismissed'); } },
        randomSeedSlider: { value: '' },
        effectAlphas: {},
        presetTravel: { active: false, start: 0, dur: 0 },
        Math: Object.create(Math, { random: { value: () => 0.5 } }),
        document: {
            body: { classList: classSet(body), appendChild() {} },
            documentElement: { classList: classSet(root) },
            createElement: element,
            addEventListener(type, fn) { if (type === 'keydown') keydown.push(fn); },
        },
        setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
        clearTimeout() {},
        setInterval: () => 0,
        clearInterval() {},
    };
    sandbox.window = {
        confirm: (text) => { confirms.push(text); return accept; },
        matchMedia: () => ({ matches: false }),
    };
    vm.createContext(sandbox);
    vm.runInContext(`'use strict';
        let lightAutomationOn = ${automationOn};
        let youtubeReady = ${youtubeReady};
        const $ = (id) => (id === 'ghostLink' ? ghostLink : id === 'welcomeGhostLink' ? welcomeGhostLink : null);
        ${functionSource('isTypingTarget')}
        function mapLabSnapshot(settings) { return settings; }
        function applySettings(settings) {
            calls.push(['applySettings', settings.glyphBank]);
            if (${applyThrows}) throw new Error('boom');
            effectAlphas.Flash = Math.min(0.2, settings.effects.Flash);
            effectAlphas.Strobe = Math.min(0.35, settings.effects.Strobe);
        }
        function stepPresetTravel() { calls.push(['stepPresetTravel']); }
        function setLightAutomation(on) { lightAutomationOn = !!on; calls.push(['setLightAutomation', on]); }
        function updateContinuousEffectsCache() {}
        function setCurrentPresetDisplay(text) { calls.push(['display', text]); }
        function showNotificationMessage(text) { notices.push(text); }
        ${idMatch[0]}
        let ghostStartHook = null;
        let localMediaGeneration = 0;
        function startPlayback(url, loop = false) {
            calls.push(['startPlayback', url]);
            if (!youtubeReady) return;
            const target = parseAllowedYouTubeInput(url);
            if (!target) return;
            const { videoId, playlistId } = target;
            ${hookMatch[0]}
            ++localMediaGeneration;
            calls.push(['loadTrack', videoId, playlistId]);
            ${noticeMatch[0]}
            return true;
        }
        ${functionSource('bindSuggestedStart')}
        ${eggSource}
    `, sandbox, { filename: 'ghost-egg-sandbox.js' });
    const named = (name) => calls.filter((c) => c[0] === name).map((c) => [...c]);
    return {
        sandbox, calls, notices, confirms, ghostLink, welcomeGhostLink, root, body, named,
        chord: (extra = {}) => keydown.forEach((fn) => fn({
            ctrlKey: true, altKey: true, shiftKey: false, metaKey: false, repeat: false, key: 'g', code: 'KeyG',
            target: null, preventDefault() {}, ...extra,
        })),
        clickCard: () => ghostLink.listeners.click.forEach((fn) => fn({ preventDefault() {}, stopPropagation() {} })),
        clickLandingCard: () => welcomeGhostLink.listeners.click.forEach((fn) => fn({ preventDefault() {} })),
        type: (url) => vm.runInContext('startPlayback(' + JSON.stringify(url) + ')', sandbox),
        /* a local file starting, as playLocalFile does before playback is confirmed */
        startLocal: () => vm.runInContext('++localMediaGeneration', sandbox),
        finishShow: () => timers.sort((a, b) => a.ms - b.ms).splice(0).forEach((t) => t.fn()),
        lightsOn: () => vm.runInContext('lightAutomationOn', sandbox),
    };
}

test('Ctrl+Alt+G on the landing page reveals the MISSING LINK card in the gold panel; starting it loads GHOST with the lights ON', () => {
    const egg = ghostSandbox();
    egg.chord();
    assert.equal(egg.confirms.length, 1);
    assert.match(egg.confirms[0], /^GHOST \/\/ OF ME - photosensitivity warning: /);
    assert.equal(egg.named('applySettings').length, 0, 'the chord alone does not load GHOST before playback');
    assert.equal(egg.named('startPlayback').length, 0);
    assert.equal(egg.welcomeGhostLink.hidden, false, 'the landing card is revealed');
    assert.equal(egg.ghostLink.hidden, false, 'the link-tree card is revealed too');
    assert.equal(egg.ghostLink.style.display, '');
    assert.equal(egg.sandbox.ytInput.value, GHOST_URL);

    egg.finishShow();
    assert.equal(egg.named('welcomeEnter').length, 0, 'the show and the card stay on the landing page');
    assert.ok(egg.root.has('ghost-egg-armed'));
    assert.ok(egg.welcomeGhostLink.focused);
    assert.ok(!egg.ghostLink.focused);
    assert.match(egg.notices.at(-1), /MISSING LINK revealed/);
    assert.equal(egg.named('applySettings').length, 0, 'still not loaded until the track starts');

    egg.clickLandingCard();
    const order = egg.calls.map((c) => c[0]);
    assert.equal(egg.named('welcomeEnter').length, 1, 'the card leaves the welcome screen first');
    assert.ok(order.indexOf('welcomeEnter') < order.indexOf('startPlayback'));
    assert.deepEqual(egg.named('startPlayback'), [['startPlayback', GHOST_URL]]);
    assert.deepEqual(egg.named('applySettings'), [['applySettings', 'All scripts']]);
    assert.ok(order.indexOf('applySettings') < order.indexOf('setLightAutomation'), 'levels land through applySettings first');
    assert.ok(order.indexOf('setLightAutomation') < order.indexOf('loadTrack'), 'GHOST is loaded before the track starts');
    assert.deepEqual(egg.named('setLightAutomation'), [['setLightAutomation', true]]);
    assert.deepEqual(egg.named('display'), [['display', 'LOADED: GHOST // OF ME [HIDDEN]']]);
    assert.equal(egg.named('stepPresetTravel').length, 0, 'no glide was active');
    assert.equal(egg.notices.at(-1),
        'GHOST // OF ME loaded \u00b7 Flash 20% \u00b7 Strobe 35% \u00b7 Flash & Strobe (automatic) ON. Loading the MISSING LINK track.');
    assert.ok(!egg.ghostLink.focused, 'the track started, so focus is not moved');
});

test('on the link tree, Ctrl+Alt+G focuses the MISSING LINK card there; starting it loads GHOST', () => {
    const egg = ghostSandbox({ dismissed: true });
    egg.chord();
    assert.equal(egg.ghostLink.hidden, false);
    egg.finishShow();
    assert.equal(egg.named('welcomeEnter').length, 0);
    assert.ok(egg.root.has('ghost-egg-armed'));
    assert.ok(egg.ghostLink.focused);
    assert.ok(!egg.welcomeGhostLink.focused);
    egg.clickCard();
    assert.deepEqual(egg.named('startPlayback'), [['startPlayback', GHOST_URL]]);
    assert.equal(egg.named('applySettings').length, 1);
    assert.deepEqual(egg.named('setLightAutomation'), [['setLightAutomation', true]]);
});

test('if the landing card cannot start the track, the link tree stays open on its card', () => {
    const egg = ghostSandbox({ youtubeReady: false });
    egg.chord();
    egg.finishShow();
    egg.clickLandingCard();
    assert.equal(egg.named('welcomeEnter').length, 1);
    assert.equal(egg.named('startPlayback').length, 1);
    assert.equal(egg.named('loadTrack').length + egg.named('applySettings').length, 0);
    assert.ok(egg.ghostLink.focused, 'focus moves to the link-tree card');
    assert.ok(egg.root.has('ghost-egg-armed'));
});

test('a source started during the show wins: the end of the show does not re-arm, refocus or replace its notice', () => {
    const egg = ghostSandbox();
    egg.chord();
    egg.clickLandingCard();
    const loaded = egg.notices.at(-1);
    assert.match(loaded, /^GHOST \/\/ OF ME loaded .*Flash & Strobe \(automatic\) ON\. Loading the MISSING LINK track\.$/);
    egg.finishShow();
    assert.ok(!egg.root.has('ghost-egg-armed'), 'the track already started, so the egg is not re-armed');
    assert.ok(!egg.ghostLink.focused && !egg.welcomeGhostLink.focused, 'focus is not moved to a card');
    assert.equal(egg.notices.at(-1), loaded, 'the loaded / automatic ON notice stays');
    assert.equal(egg.named('applySettings').length, 1);

    const other = ghostSandbox({ dismissed: true });
    other.chord();
    other.startLocal();
    other.finishShow();
    assert.ok(!other.root.has('ghost-egg-armed'), 'another source clears the reveal');
    assert.ok(!other.ghostLink.focused);
    assert.ok(!other.notices.some((n) => /MISSING LINK revealed/.test(n)));
    assert.equal(other.named('applySettings').length, 0, 'another source never gets GHOST');

    const failed = ghostSandbox({ applyThrows: true });
    failed.chord();
    failed.clickLandingCard();
    failed.finishShow();
    assert.equal(failed.notices.at(-1), 'GHOST // OF ME could not be loaded: boom', 'the failure stays on screen');
    assert.ok(!failed.root.has('ghost-egg-armed'));
    assert.equal(failed.named('loadTrack').length, 0);
});

test('the chord follows the physical G key; inside a text field only a typed g counts', () => {
    const layout = ghostSandbox({ playing: true });
    layout.chord({ key: '\u043f' });
    assert.equal(layout.confirms.length, 1, 'physical G on a non-Latin layout');

    const field = { tagName: 'INPUT', type: 'text' };
    const typing = ghostSandbox({ playing: true });
    typing.chord({ key: '\u00a9', target: field });
    typing.chord({ key: '\u00a9', target: { tagName: 'TEXTAREA' } });
    typing.chord({ key: 'h', code: 'KeyH' });
    typing.chord({ key: 'g', code: 'KeyH', shiftKey: true });
    assert.equal(typing.confirms.length, 0, 'an AltGr character in a field never opens the warning');
    typing.chord({ key: 'g', target: field });
    assert.equal(typing.confirms.length, 1, 'a typed g still works in a field');

    const button = ghostSandbox({ playing: true });
    button.chord({ key: '\u00a9', target: { tagName: 'INPUT', type: 'range' } });
    assert.equal(button.confirms.length, 1, 'a slider is not a text field');
});

test('a typed or pasted MISSING LINK link loads GHOST in any URL form; without the chord the lights stay still', () => {
    const forms = [
        GHOST_URL,
        'DmStNF35o1w',
        '  https://youtu.be/DmStNF35o1w?t=42  ',
        'https://m.youtube.com/watch?v=DmStNF35o1w&feature=share',
        'https://music.youtube.com/watch?v=DmStNF35o1w',
        'https://www.youtube.com/embed/DmStNF35o1w',
        'https://www.youtube.com/watch?v=DmStNF35o1w&list=RDDmStNF35o1w&start_radio=1',
    ];
    for (const form of forms) {
        const egg = ghostSandbox();
        assert.equal(egg.type(form), true, form);
        assert.equal(egg.named('applySettings').length, 1, form);
        assert.equal(egg.named('setLightAutomation').length, 0, form + ' must not switch the lights on without the warning');
        assert.equal(egg.lightsOn(), false, form);
        assert.deepEqual(egg.named('loadTrack')[0].slice(0, 2), ['loadTrack', 'DmStNF35o1w'], form);
        assert.match(egg.notices.at(-1), /automatic movement OFF \(Ctrl\+Alt\+G turns it on\)\. Loading the MISSING LINK track\.$/, form);
    }
    const already = ghostSandbox({ automationOn: true });
    already.type(GHOST_URL);
    assert.deepEqual(already.named('setLightAutomation'), [['setLightAutomation', true]], 'an ON switch stays ON');
    assert.match(already.notices.at(-1), /Flash & Strobe \(automatic\) ON\./);
});

test('other links and playlists without the GHOST video never load GHOST', () => {
    for (const form of ['https://www.youtube.com/watch?v=gopYmb38DgM', 'https://www.youtube.com/playlist?list=RDDmStNF35o1w',
        'https://evil.example/watch?v=DmStNF35o1w', 'not a link']) {
        const egg = ghostSandbox();
        egg.type(form);
        assert.equal(egg.named('applySettings').length, 0, form);
        assert.ok(!egg.notices.some((n) => /GHOST/.test(n)), form);
    }
});

test('Ctrl+Alt+G during playback loads GHOST once and switches to the MISSING LINK track', () => {
    const egg = ghostSandbox({ playing: true });
    egg.chord();
    assert.deepEqual(egg.named('startPlayback'), [['startPlayback', GHOST_URL]]);
    assert.equal(egg.named('applySettings').length, 1, 'loaded once, by the start hook');
    assert.deepEqual(egg.named('setLightAutomation'), [['setLightAutomation', true]]);
    assert.equal(egg.named('loadTrack').length, 1);
    assert.equal(egg.ghostLink.hidden, true, 'the card is not needed during playback');
    egg.finishShow();
    assert.ok(!egg.root.has('ghost-egg-armed'));
    assert.equal(egg.named('welcomeEnter').length, 0);
});

test('during playback without YouTube, GHOST still lands over the current source', () => {
    const egg = ghostSandbox({ playing: true, youtubeReady: false });
    egg.chord();
    assert.equal(egg.named('startPlayback').length, 1);
    assert.equal(egg.named('loadTrack').length, 0);
    assert.equal(egg.named('applySettings').length, 1);
    assert.deepEqual(egg.named('setLightAutomation'), [['setLightAutomation', true]]);
    assert.match(egg.notices.at(-1), /^GHOST \/\/ OF ME loaded .*Flash & Strobe \(automatic\) ON\.$/);
});

test('a GHOST load failure is reported, blocks the track and is not retried', () => {
    const typed = ghostSandbox({ applyThrows: true });
    assert.equal(typed.type(GHOST_URL), undefined);
    assert.equal(typed.named('loadTrack').length, 0, 'the MISSING LINK track does not start without GHOST');
    assert.equal(typed.notices.at(-1), 'GHOST // OF ME could not be loaded: boom');
    const chord = ghostSandbox({ playing: true, applyThrows: true });
    chord.chord();
    assert.equal(chord.named('applySettings').length, 1, 'no second attempt after the hook failed');
    assert.equal(chord.named('setLightAutomation').length, 0);
    assert.equal(chord.named('loadTrack').length, 0);
});

test('declined, modified, repeated or overlapping chords do nothing', () => {
    const declined = ghostSandbox({ accept: false });
    declined.chord();
    assert.equal(declined.confirms.length, 1);
    assert.equal(declined.ghostLink.hidden, true);
    assert.equal(declined.welcomeGhostLink.hidden, true);
    assert.equal(declined.named('startPlayback').length + declined.named('applySettings').length, 0);
    declined.type(GHOST_URL);
    assert.equal(declined.named('setLightAutomation').length, 0, 'a declined warning grants no consent');

    const egg = ghostSandbox({ playing: true });
    egg.chord({ shiftKey: true });
    egg.chord({ metaKey: true });
    egg.chord({ repeat: true });
    egg.chord({ key: 'h', code: 'KeyH' });
    egg.chord({ ctrlKey: false });
    egg.chord({ altKey: false });
    assert.equal(egg.confirms.length, 0);
    egg.chord();
    egg.chord();
    assert.equal(egg.confirms.length, 1, 'a second chord during the show is ignored');
    egg.finishShow();
    egg.chord();
    assert.equal(egg.confirms.length, 2, 'the chord works again after the show');
});

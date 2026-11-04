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
function ghostSandbox({ playing = false, accept = true, automationOn = false, applyThrows = false, youtubeReady = true } = {}) {
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
    const body = new Set(playing ? ['welcome-dismissed', 'playback-on'] : []);
    const root = new Set();
    const element = () => ({
        style: {}, className: '', textContent: '',
        setAttribute() {}, appendChild() {}, remove() {},
    });
    const ghostLink = {
        hidden: true, style: { display: 'none' }, attributes: {}, listeners: {}, focused: false,
        setAttribute(key, value) { this.attributes[key] = value; },
        addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
        focus() { this.focused = true; },
    };
    const sandbox = {
        calls, notices, confirms, ghostLink,
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
        const $ = (id) => (id === 'ghostLink' ? ghostLink : null);
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
        function startPlayback(url, loop = false) {
            calls.push(['startPlayback', url]);
            if (!youtubeReady) return;
            const target = parseAllowedYouTubeInput(url);
            if (!target) return;
            const { videoId, playlistId } = target;
            ${hookMatch[0]}
            calls.push(['loadTrack', videoId, playlistId]);
            ${noticeMatch[0]}
            return true;
        }
        ${functionSource('bindSuggestedStart')}
        ${eggSource}
    `, sandbox, { filename: 'ghost-egg-sandbox.js' });
    const named = (name) => calls.filter((c) => c[0] === name).map((c) => [...c]);
    return {
        sandbox, calls, notices, confirms, ghostLink, root, body, named,
        chord: (extra = {}) => keydown.forEach((fn) => fn({
            ctrlKey: true, altKey: true, shiftKey: false, metaKey: false, repeat: false, key: 'g',
            preventDefault() {}, ...extra,
        })),
        clickCard: () => ghostLink.listeners.click.forEach((fn) => fn({ preventDefault() {}, stopPropagation() {} })),
        type: (url) => vm.runInContext('startPlayback(' + JSON.stringify(url) + ')', sandbox),
        finishShow: () => timers.sort((a, b) => a.ms - b.ms).splice(0).forEach((t) => t.fn()),
        lightsOn: () => vm.runInContext('lightAutomationOn', sandbox),
    };
}

test('Ctrl+Alt+G before playback only reveals the MISSING LINK card; starting it loads GHOST with the lights ON', () => {
    const egg = ghostSandbox();
    egg.chord();
    assert.equal(egg.confirms.length, 1);
    assert.match(egg.confirms[0], /^GHOST \/\/ OF ME - photosensitivity warning: /);
    assert.equal(egg.named('applySettings').length, 0, 'the chord alone does not load GHOST before playback');
    assert.equal(egg.named('startPlayback').length, 0);
    assert.equal(egg.ghostLink.hidden, false);
    assert.equal(egg.ghostLink.style.display, '');
    assert.equal(egg.sandbox.ytInput.value, GHOST_URL);

    egg.finishShow();
    assert.equal(egg.named('welcomeEnter').length, 1, 'the source screen opens for the card');
    assert.ok(egg.root.has('ghost-egg-armed'));
    assert.ok(egg.ghostLink.focused);
    assert.match(egg.notices.at(-1), /MISSING LINK revealed/);
    assert.equal(egg.named('applySettings').length, 0, 'still not loaded until the track starts');

    egg.clickCard();
    assert.deepEqual(egg.named('startPlayback'), [['startPlayback', GHOST_URL]]);
    assert.deepEqual(egg.named('applySettings'), [['applySettings', 'All scripts']]);
    const order = egg.calls.map((c) => c[0]);
    assert.ok(order.indexOf('applySettings') < order.indexOf('setLightAutomation'), 'levels land through applySettings first');
    assert.ok(order.indexOf('setLightAutomation') < order.indexOf('loadTrack'), 'GHOST is loaded before the track starts');
    assert.deepEqual(egg.named('setLightAutomation'), [['setLightAutomation', true]]);
    assert.deepEqual(egg.named('display'), [['display', 'LOADED: GHOST // OF ME [HIDDEN]']]);
    assert.equal(egg.named('stepPresetTravel').length, 0, 'no glide was active');
    assert.equal(egg.notices.at(-1),
        'GHOST // OF ME loaded \u00b7 Flash 20% \u00b7 Strobe 35% \u00b7 Flash & Strobe (automatic) ON. Loading the MISSING LINK track.');
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
    assert.equal(declined.named('startPlayback').length + declined.named('applySettings').length, 0);
    declined.type(GHOST_URL);
    assert.equal(declined.named('setLightAutomation').length, 0, 'a declined warning grants no consent');

    const egg = ghostSandbox({ playing: true });
    egg.chord({ shiftKey: true });
    egg.chord({ metaKey: true });
    egg.chord({ repeat: true });
    egg.chord({ key: 'h' });
    egg.chord({ ctrlKey: false });
    assert.equal(egg.confirms.length, 0);
    egg.chord();
    egg.chord();
    assert.equal(egg.confirms.length, 1, 'a second chord during the show is ignored');
    egg.finishShow();
    egg.chord();
    assert.equal(egg.confirms.length, 2, 'the chord works again after the show');
});

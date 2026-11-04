import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readWeb, loadPolicy } from './harness.mjs';

const player = readWeb('js/glitch-player.js');
const html = readWeb('index.html');
function fn(name) {
    const start = player.indexOf('function ' + name + '(');
    const end = player.indexOf('\n          }', start);
    assert.ok(start >= 0 && end > start, name);
    return player.slice(start, end + '\n          }'.length);
}

test('the logo lists exactly the local picker extensions, with a codec caveat', () => {
    const policy = loadPolicy();
    const accept = /id="fileInput" accept="([^"]+)"/.exec(html)[1].split(',');
    for (const kind of ['audio', 'video']) {
        assert.ok(Object.isFrozen(policy.mediaExtensions[kind]));
        for (const extension of policy.mediaExtensions[kind]) {
            assert.ok(accept.includes('.' + extension), extension);
            assert.equal(policy.classifyLocalFile('sample.' + extension, ''), kind);
        }
    }
    assert.equal(accept.filter((s) => s.startsWith('.')).length,
        policy.mediaExtensions.audio.length + policy.mediaExtensions.video.length);
    assert.match(player, /welcomeAudioTypes'\)\.textContent = R4\.mediaExtensions\.audio\.join/);
    assert.match(player, /welcomeVideoTypes'\)\.textContent = R4\.mediaExtensions\.video\.join/);
    assert.match(html, /depends on installed Windows codecs/);
});

test('logo entry opens source selection, not the HUD; startup effect controls are inert', () => {
    const elements = new Map();
    const classes = new Set();
    const document = {
        body: { classList: { add: (value) => classes.add(value) } },
        getElementById(id) {
            if (!elements.has(id)) elements.set(id, { hidden: id === 'sourceScreen',
                addEventListener(type, cb) { this[type] = cb; }, focus() { this.focused = true; } });
            return elements.get(id);
        }
    };
    const context = vm.createContext({ document, window: { R4Policy: loadPolicy() } });
    vm.runInContext(player.slice(0, player.indexOf('/* ===')), context);
    assert.equal(elements.get('sourceScreen').hidden, true);
    assert.equal(elements.get('sliderContainer').inert, true);
    elements.get('welcomeEnterBtn').click();
    assert.equal(elements.get('welcomeScreen').hidden, true);
    assert.equal(elements.get('sourceScreen').hidden, false);
    assert.equal(elements.get('sourceHeading').focused, true);
    assert.equal(elements.get('sliderContainer').inert, true);
    assert.ok(classes.has('welcome-dismissed'));
    assert.ok(!classes.has('playback-on'));
});

test('the restored Fade W2B2W link waits for YouTube playback before the HUD or randomization', () => {
    assert.match(html, /<button type="button" id="testCanvas" class="suggested ytLink"/);
    assert.match(player, /const FADE_WHITE_URL = 'https:\/\/www\.youtube\.com\/watch\?v=kCP2xZvhJk0';/);
    const start = player.indexOf('(function bindTestCanvas()');
    const bind = player.slice(start, player.indexOf('})();', start));
    assert.match(bind, /if \(!startPlayback\(FADE_WHITE_URL, true\)\) return;/);
    assert.doesNotMatch(bind, /activatePlaybackUi\(/);
    assert.match(bind, /if \(automationHeld\(name\)\) continue;/);
    assert.match(fn('startPlayback'), /ensureOverlayStack\(\);\s*return true;\s*\}$/);
});

test('YouTube opens the HUD on confirmed playing, not on link submission or stale player events', () => {
    let active = 0;
    const context = vm.createContext({
        nowPlaying: { kind: 'youtube' }, activeLoopVideoId: null,
        activatePlaybackUi(mode) { assert.equal(mode, 'youtube'); active++; },
        syncYouTubeNowPlaying() {}
    });
    vm.runInContext(fn('onPlayerStateChange') + ';globalThis.change = onPlayerStateChange;', context);
    for (const state of [-1, 0, 2, 3, 5]) context.change({ data: state });
    assert.equal(active, 0);
    context.change({ data: 1 });
    assert.equal(active, 1);
    context.nowPlaying.kind = 'local-audio';
    context.change({ data: 1 });
    assert.equal(active, 1);
    assert.doesNotMatch(fn('startPlayback'), /activatePlaybackUi\(/);
    assert.match(fn('onPlayerReady'), /if \(nowPlaying\.kind !== 'youtube'\)/);
    assert.match(fn('playLocalFile'), /await firstAttempt;\s*if \(!stale\(\)\) activatePlaybackUi/);
});

test('effects work and whole-app filters wait until media starts, while display cadence still warms up', () => {
    assert.match(fn('frame'), /if \(!document\.body\.classList\.contains\('playback-on'\)\) \{\s*noteFrameCadence\(dtMs\);\s*return;/);
    assert.match(fn('applyMasterFilters'), /if \(!document\.body\.classList\.contains\('playback-on'\)\) \{\s*document\.documentElement\.style\.filter = '';/);
    const welcome = readWeb('css/welcome-screen.css');
    const overlay = /#welcomeScreen \{[^}]*?background: ([^;]+);/.exec(welcome);
    assert.ok(overlay, 'welcome overlay background');
    assert.doesNotMatch(overlay[1], /transparent/, 'the overlay over the live backdrop never fades to fully transparent');
    assert.match(overlay[1], /radial-gradient\(circle at 50% 28%, rgba\(255, 211, 101, 0\.14\), rgba\(255, 211, 101, 0\.03\) 34%\)/);
    assert.match(welcome, /#welcomeScreen::before \{\s*position: fixed;[^}]*width: 150%;[^}]*animation: gold-scan 7s ease-in-out infinite;/);
    assert.match(welcome, /\.welcomePanel::before \{[^}]*animation: panel-sheen 6s ease-in-out infinite;/);
    assert.match(welcome, /@media \(prefers-reduced-motion: reduce\) \{\s*#welcomeScreen::before,\s*\.welcomePanel,\s*\.welcomePanel::before,\s*\.welcomePanel::after,\s*\.welcomeGlints::before,\s*\.welcomeGlints::after,\s*\.welcomeGlints i,\s*\.welcomeGhostLink \{ animation: none; \}\s*\.welcomeMark::after \{ animation: none; opacity: 0; \}/);
    /* landing gold card: silver sheen, turning rim, glints, prism and interval tint */
    assert.match(welcome, /\.welcomePanel::after \{[^}]*animation: panel-silver 9s ease-in-out infinite;/);
    assert.match(welcome, /\.welcomeGlints \{[^}]*z-index: -1;[^}]*pointer-events: none;/, 'glints sit under the text');
    assert.match(welcome, /\.welcomeGlints::after \{[^}]*conic-gradient\(from var\(--rim\)[^}]*mask-composite: exclude;[^}]*animation: rim-turn 14s linear infinite;/);
    assert.match(welcome, /\.welcomeGlints::before \{[^}]*opacity: 0;[^}]*animation: prism-drift 16s/, 'the prism is invisible without motion');
    assert.match(welcome, /\.welcomeGlints i \{[^}]*opacity: 0;[^}]*animation: glint 6\.4s/, 'glints are invisible without motion');
    const tint = /@keyframes card-tint \{([^@]*?)\n\}/.exec(welcome);
    assert.ok(tint, 'card-tint keyframes');
    assert.doesNotMatch(tint[1], /invert|brightness|opacity/, 'the interval tint never inverts or flashes');
    assert.match(tint[1], /0%, 82% \{ filter: hue-rotate\(0deg\) grayscale\(0\); \}/);
    assert.match(tint[1], /98%, 100% \{ filter: hue-rotate\(360deg\) grayscale\(0\); \}/);
    assert.match(welcome, /\.welcomePanel \{[^}]*animation: card-tint 30s linear -18s infinite;/);
    assert.match(welcome, /\.welcomeMark \{\s*position: relative;\s*flex-shrink: 0;/);
    assert.doesNotMatch(welcome, /\.welcomeMark \{[^}]*overflow/);
    assert.match(welcome, /\.welcomeMark::after \{[^}]*hsl\(42 100% 62% \/ 0\.36\)[^}]*mask-image: radial-gradient\(farthest-side, #000 62%, transparent\);[^}]*animation: logo-gleam 10s ease-in-out infinite, gleam-hue 24s linear infinite;[^}]*pointer-events: none;/);
    assert.match(welcome, /@keyframes logo-gleam \{\s*0%, 70% \{ background-position-x: 135%; opacity: 0; \}/);
    assert.match(welcome, /@keyframes gleam-hue \{\s*from \{ filter: hue-rotate\(0deg\) saturate\(1\.35\); \}\s*to \{ filter: hue-rotate\(360deg\) saturate\(1\.35\); \}/);
});

test('local source readiness waits for actual playback and reports decoding / play failures', async () => {
    const context = vm.createContext({ cancelLocalAttempt: null, DOMException });
    vm.runInContext(fn('attemptLocalSource') + ';globalThis.attempt = attemptLocalSource;', context);
    function media(error) {
        const listeners = new Map();
        return { listeners, error: null, videoWidth: 640, videoHeight: 360,
            addEventListener: (name, cb) => listeners.set(name, cb),
            removeEventListener: (name) => listeners.delete(name),
            load() {}, play: () => error ? Promise.reject(error) : Promise.resolve() };
    }
    const video = media();
    let ready = false;
    const pending = context.attempt(video, 'blob:test', 'video').then(() => { ready = true; });
    await Promise.resolve();
    assert.equal(ready, false);
    assert.ok(!video.listeners.has('loadeddata'));
    video.listeners.get('playing')();
    await pending;
    assert.equal(ready, true);
    assert.equal(video.listeners.size, 0);
    await assert.rejects(context.attempt(media(new DOMException('Not playable', 'NotSupportedError')),
        'blob:bad', 'video'), (error) => error.mediaCode === 4);
});

test('Flash and Strobe are held out of shared automation and preset glides even without user locks', () => {
    const context = vm.createContext({
        sliderLocks: { ASCII: true }, presetLockKeys: new Set(), profileNames: ['Flash', 'Strobe', 'ASCII', 'Scanlines'],
        effectAlphas: { Flash: 0.14, Strobe: 0.09, ASCII: 0.2, Scanlines: 0 },
        randomTargets: {}, sliderElements: {}, sliderWritten: {}, masterOpacity: 0.5,
        globalSliderEl: null, clamp01: (v) => Math.min(1, Math.max(0, v)), easeInOutCubic: (v) => v,
        presetTravel: { active: true, start: 0, dur: 100, fromA: { Flash: 0.14, Strobe: 0.09, ASCII: 0.2, Scanlines: 0 },
            toA: { Flash: 1, Strobe: 1, ASCII: 1, Scanlines: 0.6 }, fromOp: 0.5, toOp: 0.5 }
    });
    vm.runInContext([fn('isManualLight'), fn('automationHeld'), fn('stepPresetTravel'),
        'globalThis.held = automationHeld; globalThis.step = stepPresetTravel;'].join('\n'), context);
    assert.ok(context.held('Flash'));
    assert.ok(context.held('Strobe'));
    assert.ok(context.held('ASCII'));
    assert.ok(!context.held('Scanlines'));
    context.step(100);
    assert.deepEqual({ ...context.effectAlphas }, { Flash: 0.14, Strobe: 0.09, ASCII: 0.2, Scanlines: 0.6 });
    for (const name of ['retargetRandomization', 'randomizeBoard', 'applyRandomSeed']) {
        assert.match(fn(name), /automationHeld\(name\)/, name);
    }
    assert.match(fn('autoGlitchStep'), /if \(isManualLight\(def\.name\)\) return;/);
    assert.match(fn('autoGlitchStep'), /if \(def && !isManualLight\(def\.name\)\)/);
    assert.match(fn('applySettings'), /if \(isManualLight\(name\) \|\| held\(name\)\) continue;/);
});

test('external links are canceled in-app and handed only after a gesture and confirmation to the Windows browser', () => {
    const main = fs.readFileSync(path.join(ROOT, 'host', 'MainForm.cs'), 'utf8');
    assert.match(main, /e\.Cancel = true;[\s\S]*?e\.IsUserInitiated && AppPolicy\.IsAllowedExternalUri/);
    assert.match(main, /e\.Handled = true;\s*if \(e\.IsUserInitiated && AppPolicy\.IsAllowedExternalUri/);
    assert.match(main, /ProcessStartInfo\(uri\) \{ UseShellExecute = true \}/);
    assert.match(main, /"Open this link in your default browser\?/);
});

test('fullscreen keys reach the native host with WebView2 focused without enabling browser shortcuts', () => {
    const main = fs.readFileSync(path.join(ROOT, 'host', 'MainForm.cs'), 'utf8');
    assert.match(main, /AreBrowserAcceleratorKeysEnabled = false/);
    assert.match(main, /view\.KeyDown \+= \(_, e\) =>\s*\{\s*if \(HandleWindowKey\(e\.KeyData\)\) e\.Handled = true;/);
    assert.match(main, /return HandleWindowKey\(keyData\) \|\| base\.ProcessCmdKey/);
    assert.match(main, /keyData == Keys\.F11 \|\| keyData == \(Keys\.Alt \| Keys\.Enter\)/);
    assert.match(main, /keyData == Keys\.Escape && fullScreen/);
    assert.match(main, /BeginInvoke\(\(\) =>\s*\{\s*if \(toggle\) ToggleFullScreen\(\);\s*else ExitFullScreen\(\);/);
});

test('the YouTube link tree is named buttons in one grid, and the native window bar clears the HUD', () => {
    const css = readWeb('css/r4.css');
    const map = player.slice(player.indexOf('const SUGGESTED = ['), player.indexOf('];', player.indexOf('const SUGGESTED = [')));
    const ids = [...map.matchAll(/\['([A-Za-z0-9]+)', 'https:\/\/www\.youtube\.com\//g)].map((m) => m[1]);
    assert.equal(ids.length, 11);
    ids.push('testCanvas');
    const tree = /<div id="ytLinkTree"[^>]*>([\s\S]*?)\n\s*<\/div>/.exec(html)[1];
    for (const id of ids) {
        const card = new RegExp(`<button type="button" id="${id}" class="suggested ytLink" title="[^"]+">\\s*<span class="ytLinkName">([^<]+)</span>\\s*<span class="ytLinkMeta">[^<]+</span>\\s*</button>`).exec(tree);
        assert.ok(card, id);
        assert.match(card[1], /^[A-Z0-9 .]+$/, id);
    }
    const ghost = /<button type="button" id="ghostLink" class="suggested ytLink" title="[^"]+" hidden>\s*<span class="ytLinkName">MISSING LINK<\/span>\s*<span class="ytLinkMeta">[^<]+<\/span>\s*<\/button>/.exec(tree);
    assert.ok(ghost, 'hidden MISSING LINK card');
    assert.match(player, /bindSuggestedStart\(ghostLink, GHOST_TRACK_URL, false\);/);
    assert.equal((tree.match(/<button /g) || []).length, ids.length + 1);
    assert.doesNotMatch(tree, /https?:/);
    assert.match(html, /id="rev3-mark"[^>]*>REVISION 4 &nbsp;\/\/&nbsp; HARD LIGHT &nbsp;\/\/&nbsp; MOONLIGHT</);
    assert.match(css, /body:has\(> #windowControls:not\(\[hidden\]\)\) \{ --r4-bar: 36px; \}/);
    assert.match(css, /:is\(#wired-btn, #nowPlayingHud, #rightRack, #sliderContainer,\s+#rev3-mark, #preset-toggle-btn, #preset-dropdown-container, \.notification\)\s*\{\s*translate: 0 var\(--r4-bar\);/);
    assert.match(css, /#windowDrag \{[^}]*height: var\(--r4-bar\);/);
    assert.match(css, /body:has\(> #windowControls:not\(\[hidden\]\)\) :is\(#welcomeScreen, #sourceScreen\) \{\s*border-top: var\(--r4-bar\) solid transparent;\s*background-origin: border-box;\s*\}/);
    assert.match(css, /#ytLinkTree > #testCanvas::after \{[^}]*animation: link-gleam 8s ease-in-out infinite, gleam-hue 24s linear infinite;[^}]*pointer-events: none;/);
    assert.deepEqual([...new Set(css.match(/#ytLinkTree > [^{]*::after/g))], ['#ytLinkTree > #testCanvas::after']);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\*, \*::before, \*::after \{ animation: none !important;[^}]*\}\s*#ytLinkTree > #testCanvas::after \{ opacity: 0; \}/);
    /* landing backdrop behind the screens, gone once playback starts; interval tint on the link cards */
    assert.match(html, /<div id="landingBackdrop" aria-hidden="true"><canvas><\/canvas><\/div>\s*<section id="welcomeScreen"/);
    assert.match(css, /#landingBackdrop \{[^}]*position: fixed;[^}]*z-index: 9999;[^}]*pointer-events: none;/);
    assert.match(css, /body\.playback-on #landingBackdrop \{ display: none; \}/);
    assert.match(css, /body:not\(\.playback-on\) \.notification \{ z-index: 20500; \}/);
    assert.match(css, /#ytLinkTree > \.ytLink:not\(#ghostLink\) \{ animation: card-tint 26s linear -18\.3s infinite; \}/);
    assert.match(css, /#ytLinkTree > \.ytLink:not\(#ghostLink\):is\(:hover, :focus-visible\) \{ animation: none; \}/);
    assert.match(css, /html\.ghost-egg-armed #sourceScreen,\s*html\.ghost-egg-armed \.welcomePanel \{ animation: ghost-egg-armed 24s linear infinite; \}/);
    const landing = /<button id="welcomeGhostLink" type="button" class="welcomeGhostLink" title="[^"]+" hidden><span class="welcomeGhostName">MISSING LINK<\/span><span class="welcomeGhostMeta">[^<]+<\/span><\/button>/.exec(html);
    assert.ok(landing, 'hidden landing MISSING LINK card');
    assert.ok(html.indexOf('class="welcomeActions"') < landing.index && landing.index < html.indexOf('</section>'), 'inside the gold card actions');
});

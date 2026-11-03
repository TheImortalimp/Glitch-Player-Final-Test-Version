import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readWeb } from './harness.mjs';

const lf = (text) => text.replace(/\r\n/g, '\n');
const mainForm = lf(fs.readFileSync(path.join(ROOT, 'host', 'MainForm.cs'), 'utf8'));
const player = lf(readWeb('js/glitch-player.js'));
const css = lf(readWeb('css/r4.css'));
const html = lf(readWeb('index.html'));

function methodBody(source, signature) {
    const start = source.indexOf(signature);
    assert.ok(start > 0, signature + ' exists');
    return source.slice(start, source.indexOf('\n    }\n', start));
}

test('the host captures the frame itself and saves it only through a Save dialog outside the app folders', () => {
    const body = methodBody(mainForm, 'private async Task CaptureFreezeFrameAsync(string id)');
    assert.match(body, /if \(!AppPolicy\.IsRequestId\(id\)\)/);
    assert.match(body, /if \(freezeFrameBusy\)/);
    assert.match(body, /CapturePreviewAsync\(CoreWebView2CapturePreviewImageFormat\.Png, stream\)/);
    assert.match(body, /ChooseSavePathOutsideApp\(dialog\)/);
    assert.match(body, /await Task\.Yield\(\);[\s\S]*new SaveFileDialog/, 'the modal dialog runs outside the WebView2 callback');
    assert.match(body, /File\.WriteAllBytes\(dialog\.FileName, png\)/);
    assert.match(body, /freezeFrameBusy = false;/);
    assert.equal((mainForm.match(/CapturePreviewAsync\(/g) || []).length, 1, 'one capture call site');
    assert.doesNotMatch(mainForm, /ToBase64String|data:image/, 'no image data is ever posted back to the page');

    const reply = methodBody(mainForm, 'private void PostFreezeResult(string id, string error)');
    assert.match(reply, /"freeze:captured\|" \+\s*JsonSerializer\.Serialize\(new \{ id, ok = error == null, error \}\)/);

    const chooser = methodBody(mainForm, 'private bool ChooseSavePathOutsideApp(SaveFileDialog dialog)');
    assert.match(chooser, /IsInsideFolder\(dialog\.FileName, AppContext\.BaseDirectory\)/);
    assert.match(chooser, /IsInsideFolder\(dialog\.FileName, AppPaths\.DataDir\)/);
    assert.match(methodBody(mainForm, 'private void ExportPresets(string json)'), /ChooseSavePathOutsideApp\(dialog\)/);
});

test('the page hides every HUD layer but keeps the stage, FX veils and filter defs while capturing', () => {
    const rule = /html\.freeze-frame-capture body > :not\(#effects-wrapper\):not\(#moon-veil\):not\(#color-shift-overlay\):not\(\.svg-defs\),\s*html\.freeze-frame-capture body > :not\(#effects-wrapper\):not\(#moon-veil\):not\(#color-shift-overlay\):not\(\.svg-defs\) \* \{\s*visibility: hidden !important;\s*transition: none !important;\s*\}/;
    assert.match(css, rule);
    assert.match(player, /shiftOverlay\.id = 'color-shift-overlay';/, 'the hue-shift FX overlay keeps the id the rule exempts');

    const stage = /<div id="effects-wrapper">([\s\S]*?)\n    <\/div>/.exec(html);
    assert.ok(stage, 'stage wrapper');
    assert.doesNotMatch(stage[1], /<button|<input|<select|class="wired-button"/, 'no controls live inside the stage');
    assert.match(html, /<button id="freezeFrameBtn" class="wired-button" type="button"/);
    const rack = /<div id="ghostBtnRack">[\s\S]*?\n    <\/div>/.exec(html);
    assert.ok(rack && rack[0].includes('id="freezeFrameBtn"'), 'the button sits in the effect-mode rack');
});

test('S triggers Freeze Frame only outside text fields and the welcome screen, and the HUD always returns', () => {
    const start = player.indexOf('(function bindFreezeFrame() {');
    assert.ok(start > 0);
    const block = player.slice(start, player.indexOf('\n          })();', start));
    assert.match(block, /root\.classList\.add\('freeze-frame-capture'\)/);
    assert.match(block, /finally \{\s*root\.classList\.remove\('freeze-frame-capture'\);/);
    assert.match(block, /await hudFreePaint\(\);\s*await host\.captureFreezeFrame\(\);/);
    assert.match(block, /if \(e\.key !== 's' && e\.key !== 'S'\) return;/);
    assert.match(block, /if \(isTypingTarget\(e\.target\) \|\| \(welcomeScreen && !welcomeScreen\.hidden\)\) return;/);
    assert.match(block, /e\.repeat \|\| e\.ctrlKey \|\| e\.altKey \|\| e\.metaKey/);
    assert.doesNotMatch(block, /postMessage|chrome\.webview/, 'the capture goes through GlitchHost only');
});

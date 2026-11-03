import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT } from './harness.mjs';

const hostSource = (name) => fs.readFileSync(path.join(ROOT, 'host', name), 'utf8');

function pageScript() {
    const match = /PageScript\s*=\s*"""\r?\n([\s\S]*?)\r?\n"""\s*;/.exec(hostSource('CursorGuard.cs'));
    assert.ok(match, 'CursorGuard.PageScript raw string literal');
    return match[1];
}

/* Minimal stand-ins for the DOM pieces the page script touches. A fresh class per sandbox owns its
   configurable cssText accessor and setProperty directly, as Chromium's CSSStyleDeclaration.prototype does. */
function makeStyleClass() {
    return class CSSStyleDeclaration {
        constructor() { this.map = new Map(); }
        setProperty(name, value, priority) {
            if (value === '' || value == null) this.map.delete(name);
            else this.map.set(name, { value: String(value), priority: priority || '' });
        }
        getPropertyValue(name) { return this.map.has(name) ? this.map.get(name).value : ''; }
        getPropertyPriority(name) { return this.map.has(name) ? this.map.get(name).priority : ''; }
        removeProperty(name) { const old = this.getPropertyValue(name); this.map.delete(name); return old; }
        get cssText() { return [...this.map].map(([k, d]) => k + ': ' + d.value + ';').join(' '); }
        set cssText(text) {
            this.map.clear();
            for (const declaration of String(text).split(';')) {
                const colon = declaration.indexOf(':');
                if (colon > 0) this.map.set(declaration.slice(0, colon).trim().toLowerCase(), { value: declaration.slice(colon + 1).trim(), priority: '' });
            }
        }
    };
}

function installGuard() {
    const Style = makeStyleClass();
    const styled = (children = []) => ({ nodeType: 1, style: new Style(), computedCursor: '', querySelectorAll: () => children });
    const listeners = {};
    const observers = [];
    const documentElement = styled();
    const context = vm.createContext({
        CSSStyleDeclaration: Style,
        document: { documentElement },
        addEventListener: (name, fn, options) => { listeners[name] = { fn, options }; },
        getComputedStyle: (el) => ({ cursor: el.style.getPropertyValue('cursor') || el.computedCursor || 'auto' }),
        MutationObserver: class {
            constructor(callback) { this.callback = callback; observers.push(this); }
            observe(target, options) { this.target = target; this.options = options; }
        }
    });
    context.window = context;
    const source = pageScript();
    vm.runInContext(source, context, { filename: 'CursorGuard.PageScript' });
    return { context, source, listeners, observers, documentElement, styled };
}

test('the host awaits the page-level cursor guard before its first navigation', () => {
    const main = hostSource('MainForm.cs');
    const init = main.slice(main.indexOf('private async Task InitializeWebViewAsync()'), main.indexOf('private void ConfigureCore('));
    const attach = init.indexOf('await CursorGuard.AttachAsync(core);');
    assert.ok(attach > 0, 'InitializeWebViewAsync awaits CursorGuard.AttachAsync');
    assert.ok(attach < init.indexOf('core.Navigate('), 'the guard is registered before the app document loads');
    assert.match(main, /CursorGuard\.HardenBrowser\(core\);/);
});

test('playback is kept out of Windows media controls, so media keys and other apps cannot drive it', () => {
    const main = hostSource('MainForm.cs');
    const features = /--disable-features=([A-Za-z,]+)/.exec(main);
    assert.ok(features, 'AdditionalBrowserArguments disables features');
    assert.ok(features[1].split(',').includes('HardwareMediaKeyHandling'));
    assert.equal((main.match(/--disable-features=/g) || []).length, 1, 'a second flag would override the first');
});

test('the host pushes only validated refresh rates and drops its display-settings subscription on close', () => {
    const main = hostSource('MainForm.cs');
    const start = main.indexOf('private void PostDisplayRefresh(');
    assert.ok(start > 0, 'PostDisplayRefresh exists');
    const body = main.slice(start, start + main.slice(start).search(/\r?\n    \}\r?\n/));
    assert.match(body, /AppPolicy\.BuildDisplayRefreshMessage\(ReadRefreshHz\(device\), others\);/);
    assert.match(body, /if \(message == null \|\| \(!force && message == postedRefresh\)\) return;/);
    assert.match(body, /core\.PostWebMessageAsString\(message\);/);
    assert.doesNotMatch(main, /"display:/, 'only AppPolicy builds the display message');
    assert.match(main, /SystemEvents\.DisplaySettingsChanged \+= OnDisplaySettingsChanged;/);
    assert.match(main, /FormClosed \+= \(_, _\) => Microsoft\.Win32\.SystemEvents\.DisplaySettingsChanged -= OnDisplaySettingsChanged;/);
    const policy = hostSource('AppPolicy.cs');
    const split = policy.slice(policy.indexOf('public static bool TrySplitMessage('), policy.indexOf('public static bool IsPlausibleRefreshHz('));
    assert.match(split, /return kind is "media:convert"/);
    assert.doesNotMatch(split, /"display:/, 'the page cannot send display messages to the host');
});

test('every WebView2 permission request is denied without a prompt and is not remembered', () => {
    const main = hostSource('MainForm.cs');
    assert.match(main, /core\.PermissionRequested \+= OnPermissionRequested;/);
    const start = main.indexOf('private void OnPermissionRequested(');
    assert.ok(start > 0, 'OnPermissionRequested exists');
    const body = main.slice(start, main.indexOf('\n    }', start));
    assert.match(body, /e\.State = CoreWebView2PermissionState\.Deny;/);
    assert.match(body, /e\.SavesInProfile = false;/);
    assert.doesNotMatch(body, /PermissionState\.Allow|if\s*\(|switch|\?/, 'the decision is unconditional');
    assert.doesNotMatch(main, /PermissionState\.Allow/);
});

test('setProperty only accepts built-in cursor keywords and leaves other properties alone', () => {
    const { styled } = installGuard();
    const { style } = styled();
    style.setProperty('cursor', 'url(x.cur), auto');
    style.setProperty('cursor', 'none');
    assert.equal(style.getPropertyValue('cursor'), '');
    style.setProperty('cursor', ' Pointer ');
    assert.equal(style.getPropertyValue('cursor'), 'pointer');
    style.setProperty('CURSOR', 'url(y.ani), auto');
    assert.equal(style.getPropertyValue('cursor'), 'pointer');
    style.setProperty('color', 'red', 'important');
    assert.equal(style.getPropertyValue('color'), 'red');
    assert.equal(style.getPropertyPriority('color'), 'important');
});

test('cssText assignments drop an unsafe cursor and keep every other declaration', () => {
    const { styled } = installGuard();
    const { style } = styled();
    style.cssText = 'cursor: url(x.cur), auto; color: red; opacity: 0.5';
    assert.equal(style.getPropertyValue('cursor'), '');
    assert.equal(style.getPropertyValue('color'), 'red');
    assert.equal(style.getPropertyValue('opacity'), '0.5');
    style.cssText = 'cursor: crosshair; color: blue';
    assert.equal(style.getPropertyValue('cursor'), 'crosshair');
    assert.equal(style.cssText, 'cursor: crosshair; color: blue;');
});

test('the mutation observer cleans direct style.cursor assignments in added and changed nodes', () => {
    const { observers, styled } = installGuard();
    assert.equal(observers.length, 1);
    assert.deepEqual({ ...observers[0].options, attributeFilter: [...observers[0].options.attributeFilter] },
        { attributes: true, attributeFilter: ['style'], childList: true, subtree: true });

    /* Chromium's style.cursor setter is a named-property interceptor, so these writes bypass the prototype guards. */
    const changed = styled();
    changed.style.map.set('cursor', { value: 'url("x.cur"), auto', priority: '' });
    changed.style.map.set('color', { value: 'red', priority: '' });
    const child = styled();
    child.style.map.set('cursor', { value: 'url(y.cur), auto', priority: '' });
    const safe = styled();
    safe.style.map.set('cursor', { value: 'text', priority: '' });
    const added = styled([child, safe]);
    observers[0].callback([
        { type: 'attributes', target: changed },
        { type: 'childList', addedNodes: [{ nodeType: 3 }, added] }
    ]);
    assert.equal(changed.style.getPropertyValue('cursor'), '');
    assert.equal(changed.style.getPropertyValue('color'), 'red');
    assert.equal(child.style.getPropertyValue('cursor'), '');
    assert.equal(safe.style.getPropertyValue('cursor'), 'text');
});

test('pointer events reset a stylesheet cursor to auto and the guard installs only once', () => {
    const { context, source, listeners, observers, documentElement, styled } = installGuard();
    assert.deepEqual(Object.keys(listeners).sort(), ['mousemove', 'mouseover', 'pointerdown', 'pointermove']);
    for (const { options } of Object.values(listeners)) assert.deepEqual({ ...options }, { capture: true, passive: true });

    const target = styled();
    target.computedCursor = 'url("theme.cur"), auto';
    documentElement.computedCursor = 'url(page.ani), auto';
    listeners.pointermove.fn({ composedPath: () => [target], target });
    assert.equal(target.style.getPropertyValue('cursor'), 'auto');
    assert.equal(target.style.getPropertyPriority('cursor'), 'important');
    assert.equal(documentElement.style.getPropertyValue('cursor'), 'auto');

    const plain = styled();
    plain.computedCursor = 'pointer';
    listeners.mouseover.fn({ target: plain });
    assert.equal(plain.style.getPropertyValue('cursor'), '');

    assert.equal(context.__sysCursorGuard, 1);
    vm.runInContext(source, context);
    assert.equal(observers.length, 1, 'a second injection is a no-op');
});

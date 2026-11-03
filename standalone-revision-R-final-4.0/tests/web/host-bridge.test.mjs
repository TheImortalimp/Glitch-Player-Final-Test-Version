import test from 'node:test';
import assert from 'node:assert/strict';
import { runInSandbox } from './harness.mjs';

const HASH = 'a'.repeat(64);

function loadBridge({ native = true, throwOnPost = false, document } = {}) {
    const posted = [];
    const listeners = [];
    const timers = new Map();
    let nextTimer = 0;
    const webview = {
        postMessage(message) {
            if (throwOnPost) throw new Error('host gone');
            posted.push({ message });
        },
        postMessageWithAdditionalObjects(message, objects) {
            if (throwOnPost) throw new Error('host gone');
            posted.push({ message, objects });
        },
        addEventListener(type, listener) {
            if (type === 'message') listeners.push(listener);
        }
    };
    const window = native ? { chrome: { webview } } : {};
    runInSandbox('js/host-bridge.js', {
        window,
        document,
        File,
        Blob,
        URL,
        DOMException,
        TextEncoder,
        setTimeout(fn, ms) { const id = ++nextTimer; timers.set(id, { fn, ms }); return id; },
        clearTimeout(id) { timers.delete(id); }
    });
    return {
        host: window.GlitchHost,
        posted,
        timers,
        deliver(data) { listeners.forEach((listener) => listener({ data })); },
        result(id, body) { this.deliver('media:result|' + JSON.stringify({ id, ...body })); }
    };
}

const video = () => new File([new Uint8Array([1, 2, 3])], 'clip.wmv', { type: 'video/x-ms-wmv' });

test('GlitchHost is frozen', () => {
    const { host } = loadBridge();
    assert.ok(Object.isFrozen(host));
    assert.equal(host.isNativeHost, true);
});

test('native window state is strictly validated before updating shield and fullscreen controls', () => {
    const elements = new Map(), classes = new Set();
    const document = {
        body: { classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } } },
        getElementById(id) { if (!elements.has(id)) elements.set(id, {}); return elements.get(id); },
        querySelectorAll() { return []; }
    };
    const bridge = loadBridge({ document });
    assert.equal(elements.get('windowControls').hidden, false);
    for (const bad of ['window:state|full,on,extra', 'window:state|other,on', 'window:state|full,ON']) bridge.deliver(bad);
    assert.equal(classes.size, 0);
    bridge.deliver('window:state|full,on');
    assert.ok(classes.has('native-fullscreen'));
    assert.equal(elements.get('windowShield').textContent, 'SHIELD: ON');
    bridge.deliver('window:state|window,off');
    assert.equal(classes.size, 0);
    assert.equal(elements.get('windowShield').textContent, 'SHIELD: OFF');
});

test('outside the Windows host, conversion falls back to a blob URL and nothing is posted', async () => {
    const { host, posted } = loadBridge({ native: false });
    assert.equal(host.isNativeHost, false);
    const url = await host.convertLocalMedia(video(), 'video');
    assert.match(url, /^blob:/);
    URL.revokeObjectURL(url);
    assert.equal(host.exportPresets([]), false);
    host.log('ok');
    assert.equal(posted.length, 0);
});

test('conversion requests post one File and resolve only with a validated media-r4.local URL', async () => {
    const bridge = loadBridge();
    const file = video();
    const pending = bridge.host.convertLocalMedia(file, 'video');
    assert.equal(bridge.posted.length, 1);
    assert.equal(bridge.posted[0].message, 'media:convert|{"id":"1","kind":"video"}');
    assert.equal(bridge.posted[0].objects.length, 1);
    assert.equal(bridge.posted[0].objects[0], file);
    bridge.result('1', { url: 'https://media-r4.local/' + HASH + '.mp4' });
    assert.equal(await pending, 'https://media-r4.local/' + HASH + '.mp4');
    assert.equal(bridge.timers.size, 0);
});

test('host replies with an unexpected URL are rejected', async () => {
    const badUrls = [
        'http://media-r4.local/' + HASH + '.mp4',
        'https://media-r4.local:444/' + HASH + '.mp4',
        'https://media-r4.local.evil.example/' + HASH + '.mp4',
        'https://player-r4.local/' + HASH + '.mp4',
        'https://media-r4.local/' + HASH.toUpperCase() + '.mp4',
        'https://media-r4.local/' + HASH + '.m4a',
        'https://media-r4.local/' + HASH + '.mp4?x=1',
        'https://media-r4.local/' + HASH + '.mp4#x',
        'https://user@media-r4.local/' + HASH + '.mp4',
        'https://media-r4.local/sub/' + HASH + '.mp4',
        'javascript:alert(1)',
        42
    ];
    for (const url of badUrls) {
        const bridge = loadBridge();
        const pending = bridge.host.convertLocalMedia(video(), 'video');
        bridge.result('1', { url });
        await assert.rejects(pending, /invalid local media URL/, String(url));
    }
    const audio = loadBridge();
    const audioPending = audio.host.convertLocalMedia(new File(['x'], 'a.wma'), 'audio');
    audio.result('1', { url: 'https://media-r4.local/' + HASH + '.mp4' });
    await assert.rejects(audioPending, /invalid local media URL/);
});

test('host errors are surfaced but bounded; malformed or unrelated messages are ignored', async () => {
    const bridge = loadBridge();
    const pending = bridge.host.convertLocalMedia(video(), 'video');
    bridge.deliver(42);
    bridge.deliver('media:result');
    bridge.deliver('media:resultX|{"id":"1","error":"spoof"}');
    bridge.deliver('other|{"id":"1","error":"spoof"}');
    bridge.deliver('media:result|not json');
    bridge.deliver('media:result|{"id":1,"error":"numeric id"}');
    bridge.result('999', { error: 'unknown id' });
    bridge.deliver('media:result|' + 'x'.repeat(2200001));
    bridge.result('1', { error: 'E'.repeat(5000) });
    await assert.rejects(pending, (error) => error.message === 'E'.repeat(1000));
});

test('a new conversion aborts the superseded one (the host drops it without replying)', async () => {
    const bridge = loadBridge();
    const first = bridge.host.convertLocalMedia(video(), 'video');
    const second = bridge.host.convertLocalMedia(video(), 'video');
    await assert.rejects(first, { name: 'AbortError' });
    assert.equal(bridge.posted.length, 2);
    bridge.result('1', { url: 'https://media-r4.local/' + HASH + '.mp4' });
    bridge.result('2', { url: 'https://media-r4.local/' + HASH + '.mp4' });
    assert.equal(await second, 'https://media-r4.local/' + HASH + '.mp4');
    assert.equal(bridge.timers.size, 0);
});

test('cancellation notifies the host and rejects locally; invalid IDs are ignored', async () => {
    const bridge = loadBridge();
    const pending = bridge.host.convertLocalMedia(video(), 'video');
    bridge.host.cancelLocalMedia('1; drop');
    bridge.host.cancelLocalMedia(1);
    assert.equal(bridge.posted.length, 1);
    bridge.host.cancelAllLocalMedia();
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(bridge.posted[1].message, 'media:cancel|1');
    assert.equal(bridge.timers.size, 0);

    const single = bridge.host.convertLocalMedia(video(), 'video');
    bridge.host.cancelLocalMedia('2');
    await assert.rejects(single, { name: 'AbortError' });
    assert.equal(bridge.posted.at(-1).message, 'media:cancel|2');
});

test('conversion requests time out after ten minutes and reject invalid arguments', async () => {
    const bridge = loadBridge();
    const pending = bridge.host.convertLocalMedia(video(), 'video');
    const [[, timer]] = [...bridge.timers];
    assert.equal(timer.ms, 10 * 60 * 1000);
    timer.fn();
    await assert.rejects(pending, /timed out/);
    await assert.rejects(bridge.host.convertLocalMedia('C:\\file.wmv', 'video'), { name: 'TypeError' });
    await assert.rejects(bridge.host.convertLocalMedia(video(), 'exe'), { name: 'TypeError' });
    const broken = loadBridge({ throwOnPost: true });
    await assert.rejects(broken.host.convertLocalMedia(video(), 'video'), /rejected the request/);
    assert.equal(broken.timers.size, 0);
});

test('preset export posts the signal-lab format and enforces count and size limits', () => {
    const bridge = loadBridge();
    const presets = [{ name: 'A', settings: { effects: { Flash: 0.1 } } }];
    assert.equal(bridge.host.exportPresets(presets), true);
    const [kind, json] = [bridge.posted[0].message.slice(0, 15), bridge.posted[0].message.slice(15)];
    assert.equal(kind, 'presets:export|');
    assert.deepEqual(JSON.parse(json), { format: 'signal-lab-presets', version: 1, presets });
    assert.throws(() => bridge.host.exportPresets('nope'), { name: 'TypeError' });
    assert.throws(() => bridge.host.exportPresets(new Array(501).fill(presets[0])), { name: 'TypeError' });
    assert.throws(() => bridge.host.exportPresets([{ name: 'big', settings: { blob: 'x'.repeat(2 * 1024 * 1024) } }]),
        { name: 'RangeError' });
});

test('renderer log codes are restricted to a short safe alphabet', () => {
    const bridge = loadBridge();
    bridge.host.log('media:convert.failed_1');
    for (const code of ['', 'Upper', '../etc', 'a b', 'a|b', 'x'.repeat(65), 42, null]) bridge.host.log(code);
    assert.deepEqual(bridge.posted.map((p) => p.message), ['log|media:convert.failed_1']);
});

test('display refresh pushes are distinct integer 20–500 Hz lists and reach at most four listeners', () => {
    const bridge = loadBridge();
    const seen = [];
    const lists = [];
    bridge.host.onDisplayRefresh((hz, rates) => { seen.push(hz); lists.push(rates); });
    for (const bad of ['display:refresh|19', 'display:refresh|501', 'display:refresh|24.5', 'display:refresh|-60',
        'display:refresh|0x3C', 'display:refresh| 60', 'display:refresh|', 'display:refreshX|60', 'display:refresh|1000', 60,
        'display:refresh|60,60', 'display:refresh|60,19', 'display:refresh|60,', 'display:refresh|,60', 'display:refresh|60;24',
        'display:refresh|60, 24', 'display:refresh|60,24,25,30,48,50,72,75,90']) {
        bridge.deliver(bad);
    }
    assert.deepEqual(seen, []);
    bridge.deliver('display:refresh|24');
    bridge.deliver('display:refresh|144');
    bridge.deliver('display:refresh|60,24,25,30,48,50,72,75');
    assert.deepEqual(seen, [24, 144, 60]);
    assert.deepEqual(lists.map((rates) => [...rates]), [[24], [144], [60, 24, 25, 30, 48, 50, 72, 75]]);
    lists[2].push(999);

    const late = [];
    bridge.host.onDisplayRefresh((hz, rates) => late.push([hz, [...rates]]));
    assert.deepEqual(late, [[60, [60, 24, 25, 30, 48, 50, 72, 75]]], 'a late listener receives an unaltered copy at once');
    bridge.host.onDisplayRefresh('not a function');
    bridge.host.onDisplayRefresh(() => {});
    bridge.host.onDisplayRefresh(() => {});
    const overflow = [];
    bridge.host.onDisplayRefresh((hz) => overflow.push(hz));
    bridge.deliver('display:refresh|60');
    assert.deepEqual(overflow, []);
    assert.deepEqual(seen, [24, 144, 60, 60]);
    assert.equal(bridge.posted.length, 0, 'the page never asks the host for anything to learn the rate');
});

test('freeze frame posts one numeric capture request and settles only on the matching host reply', async () => {
    const bridge = loadBridge();
    const capture = bridge.host.captureFreezeFrame();
    assert.equal(bridge.posted.length, 1);
    assert.match(bridge.posted[0].message, /^freeze:capture\|[0-9]{1,20}$/);
    assert.equal(bridge.posted[0].objects, undefined, 'a capture request carries no files');
    const id = bridge.posted[0].message.slice('freeze:capture|'.length);
    await assert.rejects(bridge.host.captureFreezeFrame(), /already being captured/);
    assert.equal(bridge.posted.length, 1, 'a second capture is refused while one is in flight');

    let settled = false;
    capture.then(() => { settled = true; }, () => { settled = true; });
    for (const bad of [
        'freeze:captured|' + JSON.stringify({ id: String(Number(id) + 1), ok: true }),
        'freeze:captured|' + JSON.stringify({ id: Number(id), ok: true }),
        'freeze:captured|not json',
        'freeze:captured|null',
        'freeze:capturedX|' + JSON.stringify({ id, ok: true }),
        'xfreeze:captured|' + JSON.stringify({ id, ok: true }),
        'freeze:captured|' + JSON.stringify({ id, ok: true, pad: 'x'.repeat(1100) }),
        { id, ok: true }
    ]) bridge.deliver(bad);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(settled, false);
    bridge.deliver('freeze:captured|' + JSON.stringify({ id, ok: true, error: null }));
    await capture;
    assert.equal(bridge.timers.size, 0);

    const failed = bridge.host.captureFreezeFrame();
    const failedId = bridge.posted[1].message.slice('freeze:capture|'.length);
    assert.notEqual(failedId, id);
    bridge.deliver('freeze:captured|' + JSON.stringify({ id: failedId, ok: 'true', error: 'E'.repeat(400) }));
    await assert.rejects(failed, (error) => error.message === 'E'.repeat(300));
});

test('freeze frame times out, frees the slot and needs the native host', async () => {
    const bridge = loadBridge();
    const capture = bridge.host.captureFreezeFrame();
    const [timer] = bridge.timers.values();
    assert.equal(timer.ms, 10000);
    timer.fn();
    await assert.rejects(capture, /timed out/);
    const id = bridge.posted[0].message.slice('freeze:capture|'.length);
    bridge.deliver('freeze:captured|' + JSON.stringify({ id, ok: true }));

    const next = bridge.host.captureFreezeFrame();
    assert.equal(bridge.posted.length, 2);
    bridge.deliver('freeze:captured|' + JSON.stringify({ id: bridge.posted[1].message.slice(15), ok: true }));
    await next;

    const outside = loadBridge({ native: false });
    await assert.rejects(outside.host.captureFreezeFrame(), /app host/);
    assert.equal(outside.posted.length, 0);

    const gone = loadBridge({ throwOnPost: true });
    await assert.rejects(gone.host.captureFreezeFrame(), /rejected the request/);
    await assert.rejects(gone.host.captureFreezeFrame(), /rejected the request/, 'a failed post frees the slot');
    assert.equal(gone.timers.size, 0);
});

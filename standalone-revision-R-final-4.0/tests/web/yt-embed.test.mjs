import test from 'node:test';
import assert from 'node:assert/strict';
import { runInSandbox } from './harness.mjs';

const ID = 'dQw4w9WgXcQ';
const NOCOOKIE = 'https://www.youtube-nocookie.com';

function loadYouTube() {
    const handlers = [];
    class Element {
        constructor(tag) {
            this.tagName = tag;
            this.attributes = {};
            this.children = [];
            this.removed = false;
        }
        setAttribute(name, value) { this.attributes[name] = String(value); }
        getAttribute(name) { return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null; }
        replaceChildren(...children) { this.children = children; }
        remove() { this.removed = true; }
    }
    const mounts = { player: new Element('div') };
    const document = {
        getElementById: (id) => mounts[id] || null,
        createElement(tag) {
            const element = new Element(tag);
            if (tag === 'iframe') {
                element.contentWindow = {
                    posted: [],
                    postMessage(data, origin) { this.posted.push({ data: JSON.parse(data), origin }); }
                };
            }
            return element;
        }
    };
    const window = {
        addEventListener(type, handler) { if (type === 'message') handlers.push(handler); },
        setInterval: () => 1,
        clearInterval: () => {}
    };
    runInSandbox('js/yt-embed.js', {
        window, document, Element, URLSearchParams, console,
        location: { origin: 'https://player-r4.local' }
    });
    return {
        YT: window.YT,
        mounts,
        Element,
        send(player, message, { origin = NOCOOKIE, source = player.iframe.contentWindow } = {}) {
            const data = typeof message === 'string' ? message : JSON.stringify({ id: player.id, ...message });
            handlers.forEach((handler) => handler({ origin, source, data }));
        }
    };
}

function commands(player, origin = NOCOOKIE) {
    return player.iframe.contentWindow.posted
        .filter((p) => p.origin === origin && p.data.event === 'command')
        .map((p) => [p.data.func, p.data.args]);
}

test('the bundled YouTube controller is frozen and validates the video ID and mount', () => {
    const { YT, Element } = loadYouTube();
    assert.ok(Object.isFrozen(YT));
    assert.throws(() => new YT.Player('player', { videoId: 'bad' }), { name: 'TypeError' });
    assert.throws(() => new YT.Player('player', { videoId: ID + '"' }), { name: 'TypeError' });
    assert.throws(() => new YT.Player('missing', { videoId: ID }), { name: 'TypeError' });
    assert.throws(() => new YT.Player({}, { videoId: ID }), { name: 'TypeError' });
    // Rejected players must not be registered for message routing.
    assert.equal(new YT.Player(new Element('div'), { videoId: ID }).id, 'gpr4_1');
});

test('the iframe is a sandboxed youtube-nocookie embed with fixed parameters', () => {
    const { YT, mounts } = loadYouTube();
    const player = new YT.Player('player', {
        videoId: ID,
        playerVars: { controls: 1, fs: 1, listType: 'playlist', list: 'PLgood_list-1', loop: 1 }
    });
    const iframe = player.iframe;
    assert.deepEqual(mounts.player.children, [iframe]);
    const src = new URL(iframe.src);
    assert.equal(src.origin, NOCOOKIE);
    assert.equal(src.pathname, '/embed/' + ID);
    assert.equal(src.searchParams.get('enablejsapi'), '1');
    assert.equal(src.searchParams.get('origin'), 'https://player-r4.local');
    assert.equal(src.searchParams.get('fs'), '0');
    assert.equal(src.searchParams.get('controls'), '1');
    assert.equal(src.searchParams.get('list'), 'PLgood_list-1');
    assert.equal(src.searchParams.get('playlist'), ID);
    assert.equal(iframe.getAttribute('sandbox'), 'allow-scripts allow-same-origin allow-presentation');
    assert.equal(iframe.referrerPolicy, 'strict-origin-when-cross-origin');
    assert.equal(iframe.allow, 'autoplay; encrypted-media; picture-in-picture');

    const badList = new YT.Player('player', { videoId: ID, playerVars: { listType: 'playlist', list: 'PL<script>' } });
    assert.equal(new URL(badList.iframe.src).searchParams.get('list'), null);
});

test('messages are accepted only from YouTube origins and from the player iframe itself', () => {
    const yt = loadYouTube();
    let ready = 0;
    const player = new yt.YT.Player('player', { videoId: ID, events: { onReady: () => { ready++; } } });
    player.playVideo();
    assert.deepEqual(commands(player), []);

    yt.send(player, { event: 'onReady' }, { origin: 'https://evil.example' });
    yt.send(player, { event: 'onReady' }, { origin: 'https://www.youtube-nocookie.com.evil.example' });
    yt.send(player, { event: 'onReady' }, { source: { postMessage() {} } });
    yt.send(player, { event: 'onReady' }, { source: null });
    yt.send(player, 'not json');
    yt.send(player, '[1,2]');
    yt.send(player, JSON.stringify({ id: player.id, event: 'onReady', pad: 'x'.repeat(65536) }));
    yt.send(player, { event: 'onReady', id: 'gpr4_999' });
    assert.equal(ready, 0);
    assert.equal(player.ready, false);

    yt.send(player, { event: 'onReady' });
    assert.equal(ready, 1);
    assert.deepEqual(commands(player), [['playVideo', []]]);
    yt.send(player, { event: 'onReady' });
    assert.equal(ready, 1);
});

test('player info from the frame is type-checked and bounded', () => {
    const yt = loadYouTube();
    const states = [];
    const player = new yt.YT.Player('player', { videoId: ID, events: { onStateChange: (e) => states.push(e.data) } });
    yt.send(player, { event: 'infoDelivery', info: {
        currentTime: 12.5, duration: 99, playerState: 1,
        videoData: { video_id: ID, title: 'T'.repeat(600), author: 'A'.repeat(300) }
    } });
    assert.equal(player.getCurrentTime(), 12.5);
    assert.equal(player.getDuration(), 99);
    assert.equal(player.getPlayerState(), 1);
    assert.equal(player.getVideoData().title.length, 512);
    assert.equal(player.getVideoData().author.length, 256);

    yt.send(player, { event: 'infoDelivery', info: {
        currentTime: -1, duration: 'long', playerState: 42, videoData: { video_id: 'javascript:x', title: 'Spoof' }
    } });
    assert.equal(player.getCurrentTime(), 12.5);
    assert.equal(player.getDuration(), 99);
    assert.equal(player.getPlayerState(), 1);
    assert.equal(player.getVideoData().video_id, ID);
    yt.send(player, { event: 'onStateChange', info: 2 });
    yt.send(player, { event: 'onStateChange', info: 99 });
    assert.deepEqual(states, [1, 2]);
    assert.equal(player.getVideoUrl(), 'https://www.youtube.com/watch?v=' + ID);
});

test('commands reject invalid IDs, playlists and seek values', () => {
    const yt = loadYouTube();
    const player = new yt.YT.Player('player', { videoId: ID });
    yt.send(player, { event: 'onReady' });
    player.loadVideoById('bad');
    player.loadVideoById({ videoId: '../evil/xx' });
    player.loadPlaylist([ID, 'bad']);
    player.loadPlaylist([]);
    player.loadPlaylist({ list: 'PL bad' });
    player.seekTo(-5);
    player.seekTo(Number.NaN);
    player.setVolume(Number.POSITIVE_INFINITY);
    assert.deepEqual(commands(player), []);

    player.loadVideoById(ID);
    player.loadPlaylist([ID]);
    player.loadPlaylist({ list: 'PLok', listType: 'search', index: -3, startSeconds: 4 });
    player.seekTo(30);
    player.setVolume(250);
    assert.deepEqual(commands(player), [
        ['loadVideoById', [ID]],
        ['loadPlaylist', [[ID]]],
        ['loadPlaylist', [{ list: 'PLok', listType: 'playlist', index: 0, startSeconds: 4 }]],
        ['seekTo', [30, true]],
        ['setVolume', [100]]
    ]);
});

test('a destroyed player stops sending and ignores further messages', () => {
    const yt = loadYouTube();
    let ready = 0;
    const player = new yt.YT.Player('player', { videoId: ID, events: { onReady: () => { ready++; } } });
    player.destroy();
    assert.equal(player.iframe.removed, true);
    yt.send(player, { event: 'onReady' });
    player.playVideo();
    assert.equal(ready, 0);
    assert.deepEqual(commands(player), []);
});

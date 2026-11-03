import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WEBUI, readWeb, webScripts } from './harness.mjs';

const html = readWeb('index.html');
const scripts = webScripts();
const SCRIPT_ORDER = ['glitch-engine.js', 'glyph-library.js', 'r3-factories.js', 'r3-ghost-vsync.js',
    'r4-policy.js', 'host-bridge.js', 'yt-embed.js', 'glitch-player.js'];

function csp() {
    const meta = [...html.matchAll(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/gi)];
    assert.equal(meta.length, 1, 'exactly one CSP meta tag');
    assert.ok(html.indexOf(meta[0][0]) < html.search(/<(script|link)\b/i), 'CSP must precede all resources');
    return Object.fromEntries(meta[0][1].split(';').map((d) => d.trim()).filter(Boolean)
        .map((d) => { const [name, ...values] = d.split(/\s+/); return [name, values.join(' ')]; }));
}

function filesMatching(pattern) {
    return scripts.filter(({ source }) => pattern.test(source)).map(({ name }) => name).sort();
}

test('the Content Security Policy is exact and has no unsafe, wildcard or plain-http sources', () => {
    const policy = csp();
    assert.deepEqual(policy, {
        'default-src': "'none'",
        'script-src': "'self'",
        'style-src': "'self'",
        'img-src': "'self' data: blob: https://i.ytimg.com",
        'media-src': "'self' blob: https://media-r4.local",
        'frame-src': 'https://www.youtube-nocookie.com https://www.youtube.com',
        'connect-src': "'none'",
        'font-src': "'self'",
        'object-src': "'none'",
        'base-uri': "'none'",
        'form-action': "'none'",
        'worker-src': "'none'",
        'require-trusted-types-for': "'script'",
        'trusted-types': "'none'"
    });
    const all = Object.values(policy).join(' ');
    assert.doesNotMatch(all, /unsafe-|\*|http:|'strict-dynamic'|nonce-|sha\d+-/);
    assert.match(html, /<meta name="referrer" content="strict-origin-when-cross-origin">/);
});

test('index.html loads only the bundled scripts and stylesheets, in order, with no inline code', () => {
    const tags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    assert.deepEqual(tags.map((t) => t[1].trim()), SCRIPT_ORDER.map((name) => 'src="js/' + name + '"'));
    for (const tag of tags) assert.equal(tag[2], '', 'inline script body');
    assert.equal((html.match(/<script\b/gi) || []).length, SCRIPT_ORDER.length);
    assert.deepEqual(scripts.map((s) => s.name).sort(), [...SCRIPT_ORDER].sort(), 'unreferenced script in webui/js');

    const styles = [...html.matchAll(/<link\b([^>]*)>/gi)].map((m) => m[1]);
    for (const attrs of styles) assert.match(attrs, /^\s*rel="stylesheet"\s+href="css\/[a-z0-9-]+\.css"\s*$/);
    for (const href of styles.map((s) => /href="([^"]+)"/.exec(s)[1])) {
        assert.ok(fs.existsSync(path.join(WEBUI, href)), href);
    }
});

test('index.html has no inline handlers, inline styles, embeds or script URLs', () => {
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
    assert.doesNotMatch(html, /\sstyle\s*=/i);
    assert.doesNotMatch(html, /<(style|iframe|object|embed|base|form|frame|frameset|portal|applet)\b/i);
    assert.doesNotMatch(html, /javascript:|vbscript:|data:text\/html/i);
});

test('stylesheets do not import or fetch remote resources', () => {
    const cssDir = path.join(WEBUI, 'css');
    for (const name of fs.readdirSync(cssDir).filter((n) => n.endsWith('.css'))) {
        const css = fs.readFileSync(path.join(cssDir, name), 'utf8');
        assert.doesNotMatch(css, /@import|https?:|\/\/[a-z]|expression\s*\(|(?<![\w-])behavior\s*:/i, name);
        for (const [, ref] of css.matchAll(/url\(\s*['"]?([^'")]+)/gi)) {
            assert.match(ref, /^(#|data:image\/|[a-z0-9_./-]+$)/i, name + ' url(' + ref + ')');
        }
    }
});

test('scripts contain no HTML, code-evaluation, network, storage-escape or window-opening sinks', () => {
    const forbidden = {
        'HTML injection': /\.(inner|outer)HTML\b|insertAdjacentHTML|document\.write|createContextualFragment|DOMParser|srcdoc/,
        'code evaluation': /\beval\s*\(|new\s+Function\b|set(Timeout|Interval)\s*\(\s*['"`]|importScripts|WebAssembly/,
        'script injection': /createElement\(\s*['"]script|setAttribute\(\s*['"](on[a-z]+|src|href)['"]/i,
        'network access': /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|RTCPeerConnection/,
        'background workers': /new\s+(Shared)?Worker\b|serviceWorker/,
        'windows and clipboard': /window\.open\s*\(|navigator\.clipboard|execCommand/,
        'cookies and databases': /document\.cookie|indexedDB|openDatabase/,
        'script URLs': /javascript:|vbscript:|data:text\/html/i,
        'location changes': /location\.(href|assign|replace)\s*[=(]|\blocation\s*=[^=]/
    };
    for (const [label, pattern] of Object.entries(forbidden)) {
        assert.deepEqual(filesMatching(pattern), [], label);
    }
});

test('host messaging, frames and remote image sources are confined to their modules', () => {
    assert.deepEqual(filesMatching(/chrome\.webview/), ['host-bridge.js']);
    assert.deepEqual(filesMatching(/postMessage\s*\(/), ['host-bridge.js', 'yt-embed.js']);
    assert.deepEqual(filesMatching(/createElement\(\s*['"]iframe/), ['yt-embed.js']);
    assert.deepEqual(filesMatching(/addEventListener\(\s*['"]message['"]/), ['host-bridge.js', 'yt-embed.js']);
    const frameSrc = [...scripts.find((s) => s.name === 'yt-embed.js').source.matchAll(/\.src\s*=\s*([^;]+)/g)];
    assert.equal(frameSrc.length, 1);
    assert.match(frameSrc[0][1], /^'https:\/\/www\.youtube-nocookie\.com\/embed\/' \+/);
});

test('every hard-coded URL uses HTTPS and an allow-listed origin', () => {
    const allowed = new Set(['https://www.youtube.com', 'https://youtube.com', 'https://www.youtube-nocookie.com',
        'https://i.ytimg.com', 'https://www.imortalimp.nl', 'https://media-r4.local']);
    const sources = [...scripts, { name: 'index.html', source: html }];
    for (const { name, source } of sources) {
        for (const [origin] of source.matchAll(/\b[a-z][a-z0-9+.-]*:\/\/[A-Za-z0-9.-]+(?::\d+)?/gi)) {
            assert.ok(allowed.has(origin), name + ' references ' + origin);
        }
    }
});

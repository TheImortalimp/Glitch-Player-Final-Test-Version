#!/usr/bin/env node
/* Generates webui/data/surfaces.manifest.json: the screens of the player, their DOM ids,
   link-tree cards and animations, derived from index.html, the CSS and glitch-player.js.
   `--check` fails when the committed manifest differs from the code. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEBUI = path.join(ROOT, 'webui');
const OUT = path.join(WEBUI, 'data', 'surfaces.manifest.json');
const read = (relative) => fs.readFileSync(path.join(WEBUI, relative), 'utf8');

/* Hand-defined structure: which DOM ids make up each surface, in the 4.0 flow order. */
const SURFACES = [
    { id: 'window-chrome', phase: 'always', elements: ['windowDrag', 'windowControls', 'windowResize'], css: ['css/r4.css'] },
    { id: 'landing-backdrop', phase: 'landing', elements: ['landingBackdrop'], css: ['css/welcome-screen.css'], script: 'js/landing-backdrop.js' },
    { id: 'landing-card', phase: 'landing', elements: ['welcomeScreen', 'welcomeEnterBtn', 'welcomeGhostLink'], css: ['css/welcome-screen.css'] },
    { id: 'source-screen', phase: 'source', elements: ['sourceScreen', 'sourceHeading', 'ytInput', 'startBtn', 'openFileWrap'], css: ['css/r4.css'] },
    { id: 'link-tree', phase: 'source', elements: ['ytLinkTree'], css: ['css/r4.css'] },
    { id: 'canvas-stack', phase: 'playback', elements: ['effects-wrapper', 'video', 'localAudio', 'ytWarpShell', 'glitchCanvas', 'moon-veil', 'rev3-mark'], css: ['css/glitch-player.css'] },
    { id: 'hud-now-playing', phase: 'playback', elements: ['nowPlayingHud', 'npHudPanel'], css: ['css/glitch-player.css'] },
    { id: 'hud-ear', phase: 'playback', elements: ['earHud'], css: ['css/glitch-player.css'] },
    { id: 'hud-effects-rack', phase: 'playback', elements: ['rightRack', 'ghostBtnRack', 'sliderContainer', 'ui-toggle-tab'], css: ['css/glitch-player.css'] },
    { id: 'preset-browser', phase: 'playback', elements: ['preset-toggle-btn', 'preset-dropdown-container'], css: ['css/glitch-player.css'] },
];

export function buildManifest() {
    const html = read('index.html');
    const player = read('js/glitch-player.js');
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

    const linkTree = html.slice(html.indexOf('id="ytLinkTree"'), html.indexOf('id="openFileWrap"'));
    const cards = [...linkTree.matchAll(/<button type="button" id="([^"]+)"[^>]*title="([^"]*)"[^>]*><span class="ytLinkName">([^<]*)<\/span>/g)]
        .map(([, id, title, name]) => ({ id, name, title }));

    const gated = player.match(/const playbackControls = \[([^\]]+)\]/);
    const playbackControls = gated ? [...gated[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];

    const surfaces = SURFACES.map((surface) => {
        const css = surface.css.map((file) => ({ file, source: read(file) }));
        return {
            id: surface.id,
            phase: surface.phase,
            elements: surface.elements.map((id) => ({ id, present: ids.has(id) })),
            gatedUntilPlayback: surface.elements.filter((id) => playbackControls.includes(id)),
            script: surface.script || null,
            keyframes: [...new Set(css.flatMap(({ source }) => [...source.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1])))].sort(),
            reducedMotionRule: css.some(({ source }) => /prefers-reduced-motion:\s*reduce/.test(source)),
        };
    });

    return { format: 'glitch-player-surfaces-manifest', version: 1, flow: ['landing', 'source', 'playback'], playbackControls, linkTree: cards, surfaces };
}

const json = (manifest) => JSON.stringify(manifest, null, 2) + '\n';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const next = json(buildManifest());
    if (process.argv.includes('--check')) {
        const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
        if (current !== next) { console.error('surfaces.manifest.json is stale; run tools/build-surfaces-manifest.mjs'); process.exit(1); }
        console.log('surfaces.manifest.json is up to date');
    } else {
        fs.mkdirSync(path.dirname(OUT), { recursive: true });
        fs.writeFileSync(OUT, next);
        console.log('wrote ' + path.relative(ROOT, OUT));
    }
}

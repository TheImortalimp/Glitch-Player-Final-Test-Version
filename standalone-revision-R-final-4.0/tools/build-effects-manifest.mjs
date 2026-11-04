#!/usr/bin/env node
/* Generates webui/data/effects.manifest.json from the registry in glitch-player.js.
   `--check` fails when the committed manifest differs from what the code defines. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'webui', 'js', 'glitch-player.js');
const OUT = path.join(ROOT, 'webui', 'data', 'effects.manifest.json');

const PROJECTOR = ['Chromatic Echo', 'Temporal Slices', 'Signal Tear', 'Cyber Rain', 'Prism Rift', 'Orbit HUD',
    'Neon Grad', 'Scanlines', 'Flash', 'HSL Rainbow', 'ASCII', 'Font Burn', 'Strobe', 'Gemini Bomb', 'Data Bands',
    'VHS Glitch', 'R3 Ghost Spectrum', 'R3 V-Sync'];
const AI_WARP = ['Rolling Scan', 'Tape Grain', 'Tracking Tear', 'R3 B&W Invert', 'R3 Hue/Color Cycle'];
const CAPS = { Flash: 0.2, Strobe: 0.35 };

export function buildManifest(source) {
    const block = (start, end) => {
        const from = source.indexOf(start);
        if (from < 0) throw new Error(start + ' not found');
        return source.slice(from, source.indexOf(end, from));
    };
    const defs = (name) => [...block('const ' + name + ' = [', '];')
        .matchAll(/\{\s*name:\s*'([^']+)'(?:,\s*factory:\s*([^,]+?))?,\s*defaultAlpha:\s*([^\s}]+)\s*\}/g)]
        .map(([, effect, factory, alpha]) => ({ name: effect, factory: factory ? factory.trim() : null, defaultAlpha: Number(alpha) }));
    const profiles = {};
    for (const m of block('const blendProfiles = {', '\n          };')
        .matchAll(/^\s*'([^']+)':\s*\{\s*ambient:\s*\[([^\]]+)\],\s*peak:\s*\[([^\]]+)\],\s*rate:\s*([\d.]+)/gm)) {
        profiles[m[1]] = { ambient: m[2].split(',').map(Number), peak: m[3].split(',').map(Number), rate: Number(m[4]) };
    }
    const transitions = Object.fromEntries([...block('const VOICE_TRANSITION = Object.freeze({', '});')
        .matchAll(/'([^']+)':\s*'(glide|cut)'/g)].map((m) => [m[1], m[2]]));
    const transition = (name) => transitions[name.replace(/^R3 /, '')] || transitions[name] || 'neutral';
    const origin = (name) => (PROJECTOR.includes(name) ? 'glitch-canvas-projector'
        : AI_WARP.includes(name) ? 'ai-warp-engine' : 'revision-3.0');
    const voice = (kind) => (def) => ({
        id: def.name,
        kind,
        origin: origin(def.name),
        r3Twin: def.name.startsWith('R3 ') ? def.name.slice(3) : null,
        factory: def.factory,
        defaultAlpha: def.defaultAlpha,
        cap: CAPS[def.name.replace(/^R3 /, '')] ?? 1,
        transition: transition(def.name),
        photosensitive: Object.hasOwn(CAPS, def.name.replace(/^R3 /, '')),
        blendProfile: profiles[def.name] || null,
    });
    const voices = [...defs('timedEffectsDefs').map(voice('timed')), ...defs('masterEffectsDefs').map(voice('master'))];
    return { format: 'glitch-player-effects-manifest', version: 1, voiceCount: voices.length, voices };
}

const json = (manifest) => JSON.stringify(manifest, null, 2) + '\n';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const next = json(buildManifest(fs.readFileSync(SOURCE, 'utf8')));
    if (process.argv.includes('--check')) {
        const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
        if (current !== next) { console.error('effects.manifest.json is stale; run tools/build-effects-manifest.mjs'); process.exit(1); }
        console.log('effects.manifest.json is up to date');
    } else {
        fs.mkdirSync(path.dirname(OUT), { recursive: true });
        fs.writeFileSync(OUT, next);
        console.log('wrote ' + path.relative(ROOT, OUT));
    }
}

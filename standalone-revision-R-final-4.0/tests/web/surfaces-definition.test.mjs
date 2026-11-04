import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './harness.mjs';
import { buildManifest } from '../../tools/build-surfaces-manifest.mjs';

const committed = JSON.parse(fs.readFileSync(path.join(ROOT, 'webui', 'data', 'surfaces.manifest.json'), 'utf8'));

test('the committed surfaces manifest matches the code', () => {
    assert.deepEqual(committed, buildManifest());
});

test('every defined surface element exists in index.html', () => {
    for (const surface of committed.surfaces) {
        for (const element of surface.elements) assert.ok(element.present, surface.id + ' -> ' + element.id);
    }
});

test('every surface with animation has a reduced-motion rule', () => {
    for (const surface of committed.surfaces.filter((s) => s.keyframes.length)) {
        assert.ok(surface.reducedMotionRule, surface.id);
    }
});

test('the link tree lists the named cards including the MISSING LINK ghost card', () => {
    const names = committed.linkTree.map((card) => card.name);
    assert.ok(names.length >= 12);
    for (const name of ['TERMINAL 1987', 'REVISIONS', 'MOONLIGHT', 'DEFCON 1', 'WHITE 2 BLACK 2 WHITE']) assert.ok(names.includes(name), name);
    assert.ok(committed.linkTree.some((card) => card.id === 'ghostLink'));
});

test('playback controls stay gated until media starts', () => {
    for (const id of ['rightRack', 'ghostBtnRack', 'sliderContainer', 'preset-dropdown-container', 'earHud']) {
        assert.ok(committed.playbackControls.includes(id), id);
    }
});

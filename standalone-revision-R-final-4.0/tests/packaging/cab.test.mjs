import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const app = path.join(root, 'out', 'app');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'out', 'cab-build', 'manifest.json'), 'utf8'));
const cache = path.join(process.env.LOCALAPPDATA, 'Glitch-Player-R4', 'runtime', manifest.cabHash);
function verify() {
    const result = spawnSync(path.join(app, 'GlitchPlayerR4.exe'), ['--verify'], { encoding: 'utf8', timeout: 60000 });
    assert.ifError(result.error);
    return result;
}

test('CAB launcher verifies new and cached files and refuses payload/cache tampering or redirection', () => {
    let result = verify();
    assert.equal(result.status, 0, result.stderr);
    for (const f of manifest.files) {
        const bytes = fs.readFileSync(path.join(cache, f.path));
        assert.equal(bytes.length, f.size);
        assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), f.hash);
    }
    result = verify();
    assert.equal(result.status, 0, result.stderr);
    const html = path.join(cache, 'webui', 'index.html');
    const original = fs.readFileSync(html);
    try {
        fs.appendFileSync(html, 'tampered');
        result = verify();
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /mismatch|Integrity check/);
    } finally { fs.writeFileSync(html, original); }
    const extra = path.join(cache, 'unexpected.dll');
    try {
        fs.writeFileSync(extra, 'not a runtime dependency', { flag: 'wx' });
        result = verify();
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /unexpected files/);
    } finally { if (fs.existsSync(extra)) fs.unlinkSync(extra); }
    const junction = path.join(cache, 'redirect-test');
    try {
        fs.symlinkSync(path.join(root, 'tests'), junction, 'junction');
        result = verify();
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /redirected/);
    } finally { if (fs.existsSync(junction)) fs.unlinkSync(junction); }
    const cab = path.join(app, 'payload.cab');
    const size = fs.statSync(cab).size;
    try {
        fs.appendFileSync(cab, Buffer.from([0]));
        result = verify();
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Integrity check failed/);
    } finally { fs.truncateSync(cab, size); }
    result = verify();
    assert.equal(result.status, 0, result.stderr);
});

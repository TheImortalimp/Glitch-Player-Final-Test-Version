import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readWeb } from './harness.mjs';

const player = readWeb('js/glitch-player.js');

/* Runs hardCutValue plus the R4.1.2 PER-TRACK TIMING block with stubbed
   surroundings, so cuts and timing profiles can be driven deterministically. */
function timingSandbox() {
    const start = player.indexOf('          /* Returns the value to jump to for a hard cut');
    const end = player.indexOf('          /* R4.1.1 BREATHING ROOM');
    assert.ok(start > 0 && end > start, 'hard-cut and track-timing block');
    const context = vm.createContext({});
    vm.runInContext(`
        const HARD_CUT_MODES = new Set(['snap', 'burst', 'flipflop']);
        const HARD_CUT_MIN_GAP_MS = 900;
        const hardCutAt = {};
        const recentHardCuts = [];
        const voiceTraits = { probe: { kind: 'cut', cutOdds: 1 } };
        const randBehavior = 'snap';
        let nowPlaying = { kind: '', videoId: '', duration: 0 };
        function isManualLight() { return false; }
        function voiceTransition() { return 'cut'; }
        function softWild() { return false; }
        function clamp01(v) { return Math.min(1, Math.max(0, v)); }
        let nextRandom = 0.5;
        Math.random = () => nextRandom;
        ${player.slice(start, end)}
        globalThis.sb = {
            setRandom(v) { nextRandom = v; },
            play(videoId, duration) { nowPlaying = { kind: 'youtube', videoId, duration: duration || 0 }; },
            local() { nowPlaying = { kind: 'local-video', videoId: '', duration: 0 }; },
            cut(cur, target, now) { delete hardCutAt.probe; return hardCutValue('probe', cur, target, now); },
            timing() { return activeTrackTiming(); },
            table: TRACK_TIMINGS,
            dflt: TRACK_TIMING_DEFAULT
        };
    `, context);
    return context.sb;
}

const sb = timingSandbox();

test('every named link-tree track, the fade link and the ghost track carry a timing profile', () => {
    const suggested = player.slice(player.indexOf('const SUGGESTED = ['), player.indexOf('];', player.indexOf('const SUGGESTED = [')));
    const ids = new Set([...suggested.matchAll(/watch\?v=([\w-]{11})/g)].map((m) => m[1]));
    ids.add('kCP2xZvhJk0'); // WHITE 2 BLACK 2 WHITE fade link
    ids.add('DmStNF35o1w'); // GHOST // OF ME MISSING LINK track
    assert.ok(ids.size >= 12, 'the link tree still names its tracks');
    for (const id of ids) assert.ok(sb.table[id], 'timing profile for ' + id);
});

test('every timing profile stays inside sane bounds', () => {
    for (const [id, t] of Object.entries(sb.table)) {
        assert.ok(t.pace >= 0.6 && t.pace <= 1.5, id + ' pace');
        assert.ok(t.breath >= 0.6 && t.breath <= 1.5, id + ' breath');
        assert.ok(t.cut >= 0 && t.cut <= 1, id + ' cut bias');
    }
});

test('unknown videos class themselves by the duration YouTube reports; local media keeps defaults', () => {
    sb.play('unknown0000', 600);
    let t = sb.timing();
    assert.ok(t.pace > 1 && t.cut < 0.5, 'long-form sits calm');
    sb.play('unknown0000', 120);
    t = sb.timing();
    assert.ok(t.pace < 1 && t.cut > 0.5, 'short tracks run livelier');
    sb.play('unknown0000', 300);
    assert.deepEqual(sb.timing(), sb.dflt, 'mid lengths keep the defaults');
    sb.local();
    assert.deepEqual(sb.timing(), sb.dflt, 'local media keeps the defaults');
});

test('cuts land on a soft-to-hard spectrum biased by the track, never a full slam', () => {
    sb.setRandom(0.5); // mid jitter: depth = 0.5 + 0.45 * cut bias
    sb.play('KlcsGjI6Jms', 0); // NIGHT CITY WALK — softest
    const soft = sb.cut(0, 1, 10000);
    sb.play('jmEAP7aGo0o', 0); // DEFCON 1 — hardest
    const hard = sb.cut(0, 1, 20000);
    assert.ok(soft !== null && hard !== null, 'both tracks cut at a certain roll');
    assert.ok(soft < hard, 'the soft track cuts softer than the hard one');
    for (const v of [soft, hard]) assert.ok(v >= 0.5 && v <= 0.95, 'cut depth inside the spectrum');
    sb.setRandom(0); // lowest jitter still respects the floor
    assert.ok(sb.cut(0, 1, 30000) >= 0.5);
});

test('a soft track also cuts less often than a hard one', () => {
    // Odds roll 0.75: NIGHT CITY (freq 0.6 + 0.8 * 0.15 = 0.72 at cutOdds 1) skips,
    // while DEFCON 1 (1.28) still cuts.
    sb.setRandom(0.75);
    sb.play('KlcsGjI6Jms', 0);
    assert.equal(sb.cut(0, 1, 40000), null, 'the soft track skips the cut');
    sb.play('jmEAP7aGo0o', 0);
    assert.ok(sb.cut(0, 1, 50000) !== null, 'the hard track still cuts');
});

test('the confluence guard lets at most two hard cuts land close together', () => {
    sb.setRandom(0.1);
    sb.play('jmEAP7aGo0o', 0);
    assert.ok(sb.cut(0, 1, 100000) !== null, 'first cut lands');
    assert.ok(sb.cut(0, 1, 100100) !== null, 'second cut lands');
    assert.equal(sb.cut(0, 1, 100200), null, 'a third simultaneous cut is refused');
    assert.ok(sb.cut(0, 1, 101000) !== null, 'the window clears and cutting resumes');
});

test('the BIRDCAGE radio card carries its measured timing profile', () => {
    const t = sb.table.PD3RCwNseqQ;
    assert.ok(t, 'BIRDCAGE profile exists');
    assert.ok(player.includes("'suggestedBirdcage', 'https://www.youtube.com/watch?v=PD3RCwNseqQ&list=RDPD3RCwNseqQ&start_radio=1'"),
        'the link tree carries the BIRDCAGE radio playlist card');
    assert.ok(player.includes("id === 'suggestedBirdcage'"), 'the BIRDCAGE card loops like the other radio playlists');
    assert.ok(player.includes('338 s measured'), 'the profile records the measured first-track length');
});

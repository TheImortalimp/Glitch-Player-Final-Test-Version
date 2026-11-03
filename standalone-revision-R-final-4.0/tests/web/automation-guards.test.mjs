import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readWeb } from './harness.mjs';

const player = readWeb('js/glitch-player.js');

function functionBody(name) {
    const start = player.indexOf('function ' + name + '(');
    assert.ok(start > 0, name + ' exists');
    const end = player.indexOf('\n          }\n', start);
    return player.slice(start, end);
}

test('lock buttons record user locks separately from locks restored by a preset', () => {
    assert.match(functionBody('toggleUserLock'), /presetLockKeys\.delete\(key\)/);
    for (const key of ["'global'", 'def.name', "'master:' \\+ d.key", "'vsync'"]) {
        assert.match(player, new RegExp('toggleUserLock\\(' + key + '\\)'), key);
    }
});

test('applying a preset releases only preset-sourced locks and never moves a user-locked control', () => {
    const body = functionBody('applySettings');
    assert.match(body, /presetLockKeys\.forEach\(\(key\) => \{ sliderLocks\[key\] = false; \}\);\s*presetLockKeys\.clear\(\);/);
    assert.match(body, /const held = \(key\) => !!sliderLocks\[key\];/);
    assert.match(body, /held\('global'\) \? masterOpacity : /);
    assert.match(body, /held\('vsync'\)/);
    assert.match(body, /held\('master:' \+ /);
    assert.match(body, /presetLockKeys\.add\(key\)/);
    assert.equal((body.match(/sliderLocks\[[^\]]+\] = false/g) || []).length, 1,
        'the only unlock in applySettings is the release of preset-sourced locks');
});

test('the preset glide and Auto Glitch boost skip user-locked voices', () => {
    const glide = functionBody('stepPresetTravel');
    assert.match(glide, /if \(isManualLight\(n\) \|\| \(sliderLocks\[n\] && !presetLockKeys\.has\(n\)\)\) continue;/);
    assert.match(glide, /const globalHeld = sliderLocks\.global && !presetLockKeys\.has\('global'\);/);
    assert.match(functionBody('updateSmoothedStrengths'), /\(automationHeld\(name\) \? 1 : glitchBoost\)/);
});

test('the frame governor scales its thresholds to the display refresh rate reported by the host', () => {
    const governor = functionBody('governorStep');
    assert.match(governor, /\(heavy >= 2 \? 24 : 27\) \* governorPace/);
    assert.match(governor, /emaFrameMs < 14 \* governorPace/);
    const pace = functionBody('setGovernorHz');
    assert.match(pace, /Math\.max\(1, 60 \/ hz\)/, 'displays at 60 Hz or faster keep the original thresholds');
    assert.match(pace, /qualityTier > qualityFloor/);
    assert.match(player, /window\.GlitchHost\.onDisplayRefresh\(setDisplayRefresh\)/);
    assert.match(functionBody('frame'), /noteFrameCadence\(dtMs\);\s*\/\/[^\n]*\n\s*governorStep\(Math\.min\(dtMs, 250\), drawWorkMs\);/,
        'a resume gap after minimising cannot read as a burst of overload');
    assert.match(functionBody('frame'), /draw\(now\);\s*drawWorkMs = performance\.now\(\) - workStart;/,
        'only frames that drew report their main-thread work');
});

/* Runs the governor's pace and cadence code from glitch-player.js with stand-ins for the
   state it shares with governorStep. */
function governorSandbox() {
    const start = player.indexOf('          let governorPace = 1;');
    const tail = player.indexOf('function noteFrameCadence(');
    assert.ok(start > 0 && tail > start, 'governor pace block');
    const end = player.indexOf('\n          }\n', tail) + '\n          }'.length;
    const context = vm.createContext({});
    vm.runInContext(`
        let emaFrameMs = 1000 / 60, governorSlow = 7, governorFast = 0, qualityTier = 0, qualityFloor = 0, applied = 0;
        function applyQualityTier() { applied++; }
        ${player.slice(start, end)}
        globalThis.gov = {
            setDisplayRefresh, noteFrameCadence,
            feed(ms, n) { for (let i = 0; i < n; i++) noteFrameCadence(ms); },
            degrade(tier) { qualityTier = tier; },
            state() { return { pace: +governorPace.toFixed(2), cadenceHz, qualityTier, applied, governorSlow }; }
        };`, context);
    return context.gov;
}

test('the governor follows the display that actually paces frames, not only the window\'s display', () => {
    const gov = governorSandbox();
    gov.setDisplayRefresh(60, [60, 24]);
    assert.equal(gov.state().pace, 1);
    gov.degrade(2);
    gov.feed(1000 / 24, 47);
    assert.equal(gov.state().pace, 1, 'nothing changes before a full 48-frame window');
    gov.feed(1000 / 24, 1);
    assert.deepEqual({ ...gov.state() }, { pace: 2.5, cadenceHz: 24, qualityTier: 0, applied: 1, governorSlow: 0 },
        'a 24 Hz cadence is not overload: the false slow count and the dropped tier are undone');
    gov.feed(1000 / 24, 96);
    assert.equal(gov.state().applied, 1, 'a steady cadence does not resize the canvas again');
    gov.setDisplayRefresh(60, [60, 24]);
    assert.equal(gov.state().pace, 2.5, 'a repeated push keeps the measured display');
    gov.setDisplayRefresh(60, [60]);
    assert.deepEqual([gov.state().pace, gov.state().cadenceHz], [1, 0], 'a push without that display returns to the window rate');
});

test('a board too slow for its display still reads as overload, and gaps are not cadence samples', () => {
    const single = governorSandbox();
    single.setDisplayRefresh(60, [60]);
    single.feed(1000 / 30, 96);
    assert.equal(single.state().pace, 1, '30 fps on a 60 Hz display');
    const attached = governorSandbox();
    attached.setDisplayRefresh(60, [60, 24]);
    attached.feed(1000 / 30, 96);
    assert.equal(attached.state().pace, 1, '30 fps matches neither 60 Hz nor 24 Hz');
    const mixed = governorSandbox();
    mixed.setDisplayRefresh(60, [60, 24]);
    for (let i = 0; i < 96; i++) mixed.noteFrameCadence(i % 3 ? 1000 / 24 : 1000 / 60);
    assert.deepEqual([mixed.state().pace, mixed.state().cadenceHz], [1, 60], 'on-time frames reveal the 60 Hz cadence');
    const gaps = governorSandbox();
    gaps.setDisplayRefresh(60, [60, 24]);
    gaps.feed(70000, 200);
    gaps.feed(0, 10);
    gaps.feed(NaN, 10);
    assert.equal(gaps.state().cadenceHz, 0);
    const hostless = governorSandbox();
    hostless.feed(1000 / 24, 96);
    assert.equal(hostless.state().pace, 1, 'without a host report nothing is guessed');
});

test('half of a 60 Hz cadence is not taken for an attached 30 Hz display once 60 Hz frames were seen', () => {
    const seen = governorSandbox();
    seen.setDisplayRefresh(60, [60, 30]);
    seen.feed(1000 / 60, 48);
    seen.feed(1000 / 30, 480);
    assert.equal(seen.state().pace, 1, 'a 60 Hz board held to 30 fps is overload, not a 30 Hz display');
    seen.setDisplayRefresh(60, [60, 30]);
    seen.feed(1000 / 30, 48);
    assert.equal(seen.state().pace, 1, 'a repeated push keeps what was measured');
    seen.setDisplayRefresh(30, [30, 60]);
    seen.feed(1000 / 30, 48);
    assert.equal(seen.state().pace, 2, 'a new display setup is measured afresh');
    const tv = governorSandbox();
    tv.setDisplayRefresh(60, [60, 30]);
    tv.feed(1000 / 30, 48);
    assert.deepEqual([tv.state().pace, tv.state().cadenceHz], [2, 30], 'with no faster frames, the 30 Hz display is pacing');
});

/* Runs the whole quality governor from glitch-player.js, tiers through governorStep,
   with an idle board as its surroundings. */
function governorStepSandbox() {
    const start = player.indexOf('          const QUALITY_TIERS = [');
    const tail = player.indexOf('function governorStep(');
    assert.ok(start > 0 && tail > start, 'governor block');
    const end = player.indexOf('\n          }\n', tail) + '\n          }'.length;
    const context = vm.createContext({});
    vm.runInContext(`
        const renderBudget = { lowPower: false };
        function resizeGlitchCanvas() {}
        const profileNames = [], effectAlphas = {}, milk = { active: false, target: 0 };
        let isContinuallyRandomizing = false, isAutoGlitching = false, isAiWarpActive = false;
        ${player.slice(start, end)}
        globalThis.gov = {
            setDisplayRefresh,
            run(n, intervalMs, workMs) { for (let i = 0; i < n; i++) governorStep(intervalMs, workMs); return qualityTier; },
            /* perTier[tier] = [frame interval, work] for a board whose timing depends on the tier it runs at */
            board(n, perTier) {
                let ups = 0;
                for (let i = 0; i < n; i++) {
                    const tier = qualityTier;
                    noteFrameCadence(perTier[tier][0]);
                    governorStep(perTier[tier][0], perTier[tier][1]);
                    if (qualityTier < tier) ups++;
                }
                return { tier: qualityTier, ups, pace: governorPace };
            }
        };`, context);
    return context.gov;
}

test('on a 24 Hz display a dropped tier comes back once drawn frames leave headroom, and not while busy or GPU bound', () => {
    const gov = governorStepSandbox();
    gov.setDisplayRefresh(24, [24]);
    const period = 1000 / 24;
    assert.equal(gov.run(300, period * 2, 70), 2, 'missed vsyncs drop the board to the lowest tier');
    assert.equal(gov.run(3000, period, 0.6 * period), 2, 'on cadence but busy: no headroom, and 14 ms frames are impossible at 24 Hz');
    assert.equal(gov.run(3000, period * 2, 5), 2, 'an idle main thread with missed vsyncs is still overload');
    assert.equal(gov.run(3000, period, 0.6 * period), 2);
    assert.equal(gov.run(380, period, 0.3 * period), 2, 'headroom has to hold for the whole wait');
    assert.equal(gov.run(60, period, 0.3 * period), 1);
    assert.equal(gov.run(300, period, 0.3 * period), 1, 'the next tier is measured afresh');
    assert.equal(gov.run(100, period, 0.3 * period), 0);
});

test('a step up that is undone soon after doubles the wait before the next one', () => {
    const gov = governorStepSandbox();
    gov.setDisplayRefresh(24, [24]);
    const period = 1000 / 24;
    gov.run(300, period * 2, 70);
    gov.run(3000, period, 0.6 * period);
    assert.equal(gov.run(1200, period, 0.3 * period), 0);
    assert.equal(gov.run(120, period * 2, 30), 1, 'the board relapses right after stepping up');
    assert.equal(gov.run(700, period, 0.3 * period), 1, 'the usual wait is no longer enough');
    assert.equal(gov.run(200, period, 0.3 * period), 0);
});

test('a 60 Hz board held to 30 fps steps down even with a 30 Hz display attached', () => {
    const p = 1000 / 60;
    const gov = governorStepSandbox();
    gov.setDisplayRefresh(60, [60, 30]);
    gov.board(200, [[p, 2], [p, 2], [p, 2]]);
    const overloaded = gov.board(3000, [[2 * p, 20], [p, 6], [p, 4]]);
    assert.deepEqual([overloaded.tier, overloaded.pace], [1, 1]);
    const tv = governorStepSandbox();
    tv.setDisplayRefresh(60, [60, 30]);
    assert.deepEqual({ ...tv.board(3000, [[2 * p, 20], [2 * p, 10], [2 * p, 6]]) }, { tier: 0, ups: 0, pace: 2 },
        'a display that really runs at 30 Hz keeps the full tier');
});

test('a board held back by its GPU stops probing the faster tier, and a lighter load brings it back', () => {
    const p = 1000 / 60;
    const gov = governorStepSandbox();
    gov.setDisplayRefresh(60, [60]);
    const gpuBound = [[2 * p, 6], [p, 4], [p, 3]];
    assert.equal(gov.board(20000, gpuBound).ups, 5, 'each failed step up doubles the wait');
    assert.deepEqual({ ...gov.board(40000, gpuBound) }, { tier: 1, ups: 2, pace: 1 }, 'the waits stop growing at 25,600 frames');
    const lighter = [[p, 2.5], [p, 1.5], [p, 1]];
    assert.deepEqual({ ...gov.board(100, lighter) }, { tier: 0, ups: 1, pace: 1 }, 'clearly less work restores the usual wait');
    assert.deepEqual({ ...gov.board(5000, lighter) }, { tier: 0, ups: 0, pace: 1 });
});

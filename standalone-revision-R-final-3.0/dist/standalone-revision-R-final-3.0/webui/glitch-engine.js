/* =============================================================================
   GLITCH ENGINE — voice format for every board effect
   Ghost-Key: 'Gh0sTs 1n Th3 Sh3lLs - D1giTaL R3BiRtHs - f34Rd0t.C0mM4'

   Format (same as B&W Invert 0 / 50 / 75 / 100):
     map(level) → { t, hueDeg, invert, rail, realm, ... }
     reality[]  → analog / physical confine (CRT, phosphor, 75% negative cap)
     virtual[]  → digital / VR confine (full wheel, data, LED, infinite net)

   Ghost : OFF · DIA · SPECTRUM · CRT · PLASMA · LED
   V-Sync: OFF · ON (scanphasing) · GHOST_OFF (vertical color sync harmony)
           · FULL (sharp)
   Matrix: ASCII rain + Chord(s) edit IRL scripts vs machine glyphs
           on the same Ghost-Key / 0-50-75-100 rails
   R2    : SOFT-EYE — crescendo scheduler, light-burst gate, audio ear,
           Neon Aurora v2, pace tables (see bottom of file)
   ============================================================================= */
(function (root) {
    'use strict';

    var LANDMARKS = [0, 0.50, 0.75, 1.0];
    var GHOST_MODES = ['OFF', 'DIA', 'SPECTRUM', 'CRT', 'PLASMA', 'LED'];
    var VSYNC_MODES = ['OFF', 'ON', 'GHOST_OFF', 'FULL'];

    var GHOST_PROFILES = {
        OFF:      { realm: 'off',     split: 0,    chan: 0,    lines: 0,    glow: 0,    warp: 0,    blur: 0,    hueA: 0,   hueB: 0,   sat: 1,    gray: 0,    crt: 0, led: 0, dia: 0 },
        DIA:      { realm: 'reality', split: 0.88, chan: 0.72, lines: 0.50, glow: 0.22, warp: 0.38, blur: 0.35, hueA: 313, hueB: 145, sat: 1.22, gray: 0.06, crt: 0, led: 0, dia: 1 },
        SPECTRUM: { realm: 'mix',     split: 1.00, chan: 0.90, lines: 1.00, glow: 0.45, warp: 0.70, blur: 1.00, hueA: 135, hueB: 75,  sat: 1.45, gray: 0.30, crt: 0, led: 0, dia: 0 },
        CRT:      { realm: 'reality', split: 0.70, chan: 0.65, lines: 1.65, glow: 0.30, warp: 0.45, blur: 0.80, hueA: 55,  hueB: 25,  sat: 0.85, gray: 0.74, crt: 1, led: 0, dia: 0 },
        PLASMA:   { realm: 'virtual', split: 1.15, chan: 1.00, lines: 0.80, glow: 0.60, warp: 0.95, blur: 1.25, hueA: 195, hueB: 100, sat: 1.85, gray: 0.16, crt: 0, led: 0, dia: 0 },
        LED:      { realm: 'virtual', split: 1.38, chan: 1.22, lines: 0.22, glow: 0.90, warp: 1.12, blur: 0.12, hueA: 0,   hueB: 120, sat: 2.05, gray: 0.00, crt: 0, led: 1, dia: 0 }
    };

    var VSYNC_METHODS = {
        OFF:       { bar: 0,    tears: 0,    roll: 0,    hum: 0,    snap: 0, sharp: 0,   scanphase: 0,   harmony: 0 },
        ON:        { bar: 1.0,  tears: 0.55, roll: 0,    hum: 0.35, snap: 0, sharp: 0.62, scanphase: 1,   harmony: 0.28 },
        GHOST_OFF: { bar: 0.35, tears: 0.12, roll: 0.14, hum: 0.18, snap: 0, sharp: 0.40, scanphase: 0.32, harmony: 1.00 },
        FULL:      { bar: 1.15, tears: 1.0,  roll: 0.85, hum: 0.85, snap: 1, sharp: 1.00, scanphase: 0.88, harmony: 0.55 }
    };

    var VSYNC_LABELS = {
        OFF:       'V-Sync: OFF',
        ON:        'V-Sync: SCANPHASING',
        GHOST_OFF: 'V-Sync: VERTICAL COLOR HARMONY',
        FULL:      'V-Sync: SHARP'
    };

    function clamp01(v) {
        v = +v || 0;
        return v < 0 ? 0 : v > 1 ? 1 : v;
    }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function pick(rng, arr) { return arr[(rng() * arr.length) | 0]; }

    /* ----- TYPESETS pulled from the atlas (named scripts, not a flat DB) ----- */
    var GHOST_KEY = 'Gh0sTs 1n Th3 Sh3lLs - D1giTaL R3BiRtHs - f34Rd0t.C0mM4';
    var GHOST_KEY_STANZAS = ['Gh0sTs 1n Th3 Sh3lLs', 'D1giTaL R3BiRtHs', 'f34Rd0t.C0mM4'];
    var TYPESETS = {
        latin: { script: "latin", source: "ASCII / Basic Latin printable — typewriter, passport, terminal IRL", realm: "reality", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:\"<>,./?`~ " },
        cyrillic: { script: "cyrillic", source: "Cyrillic + Ukrainian/Belarusian/Macedonian extras (Windows-1251 world)", realm: "reality", chars: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюяІЇЄЎЃЅЋЌЏіїєўѓѕћќџ" },
        greek: { script: "greek", source: "Greek + tonos (ISO 8859-7 print/signage)", realm: "reality", chars: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωςΆΈΉΊΌΎΏάέήίόύώΐΰϊϋ" },
        hebrew: { script: "hebrew", source: "Hebrew block — IRL square script", realm: "reality", chars: "אבגדהוזחטיכךלמםנןסעפףצץקרשת׳״־" },
        arabic: { script: "arabic", source: "Arabic letters — IRL abjad", realm: "reality", chars: "ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهويأبتثجحخدذرزسشصضطظعغفقكلمنهويى" },
        devanagari: { script: "devanagari", source: "Devanagari (Hindi/Sanskrit ISCII lineage)", realm: "reality", chars: "अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहँंःॐ०१२३४५६७८९" },
        thai: { script: "thai", source: "Thai — IRL abugida", realm: "reality", chars: "กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮัาำิีึืุูใไ่้็๋์ๆ๐๑๒๓๔๕๖๗๘๙" },
        hangul: { script: "hangul", source: "Hangul jamo (keyboard/jamo, not precomposed syllables)", realm: "reality", chars: "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㄲㄸㅃㅆㅉㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ" },
        hanzi: { script: "hanzi", source: "Common Chinese mixed Hans/Hant frequency", realm: "reality", chars: "的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分的一是在不了有和人這中大為上個國我以要他時來用們生到作地於出就分子你说年着那她也得里后自会家可下而过天去能对小多然心学么之都好看起发当没成只如事把还第样道想种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感" },
        javanese: { script: "javanese", source: "Aksara Jawa (Unicode Javanese block)", realm: "reality", chars: "ꦀꦄꦅꦆꦇꦈꦉꦊꦋꦌꦍꦎꦏꦐꦑꦒꦓꦔꦕꦖꦗꦘꦙꦚꦛꦜꦝꦞꦟꦠꦡꦢꦣꦤꦥꦦꦧꦨꦩꦪꦫꦬꦭꦮꦯꦰꦱꦲ꧀꧐꧑꧒꧓꧔꧕꧖꧗꧘꧙" },
        katakana: { script: "katakana", source: "Japanese Katakana + dakuten — Wachowski digital rain / JIS X 0201", realm: "virtual", chars: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォッヴー" },
        symbols: { script: "box-block", source: "Box Drawing + Block Elements + geometric + arrows (IBM CP437 / VGA)", realm: "virtual", chars: "░▒▓█─│┌┐└┘├┤┬┴┼═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬━┃┄┅┆┇┈┉┊┋┍┎┏┑┒┓┕┖┗┙┚┛┝┞┟┠┡┢┣┥┦┧┨┩┪┫┭┮┯┰┱┲┳┵┶┷┸┹┺┻┽┾┿╀╁╂╃╄╅╆╇╈╉╊╋╌╍╎╏╭╮╯╰╱╲╳╴╵╶╷╸╹╺╻╼╽╾╿▀▁▂▃▄▅▆▇▉▊▋▌▍▎▏▐▔▕■□◆◇▲△▼▽●○◦★☆←↑→↓↔×÷±≠≈≤≥∞√∑∏∫∂∆" },
        superscript: { script: "cp437-misc", source: "Latin-1 + CP437 extras + dingbats + misc symbols (machine IBM PC)", realm: "virtual", chars: "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»ÁÂÀ©¢¥ãÃ¤ðÐÊËÈıÍÎÏ¦ÌÓßÔÒõÕµþÞÚÛÙýÝ¯´≡±‗¾¶§÷¸°¨·¹³²■•̫͡ʕ͓ʔ❁◡‿♥♠♦♣♪♫☼►◄↕‼▬↨↑↓→←∟↔▲▼≈≠≤≥∑∏∫☮☯✞✡☪☢☣⚕⚖⚗⚙⚛☘☤⚚⚜✠☥♀♂⚢⚣⚤⚥⚦⚧✂✒✉☎✆✇✈☏⛴⛷⛸♨♻⚐⚑⚔⚘⚝⚞⚟✁✃✄☦☧☨☩☫☬☭☸☹☺☻☽☾♡♢♤♧♬♭♮♯⚒✎✏✑✓✔✕✖✗✘✙✚✛✜✝✟□△▶▷▽◀◁◆◇○●◦★☆⚰⚱🗜🛰🛩🕹ᔑʖᓵ↸ᒷ⎓⊣⍑⋮ꖎᒲᑑ∷ᓭℸ⚍⍊⨅" },
        mathoperator: { script: "math", source: "Unicode Mathematical Operators + gothic/math alphanumerics", realm: "virtual", chars: "∀∁∂∃∄∆∇∎−∓∔∕∕∗∗∙√∛∜∝∞∴∵∸∺∿≀⊌⊍⊎⊓⊔⊕⊖⊗⊘⊙⊚⊛⊜⊝⊞⊟⊠⊡⊢⊢⊺⊺⊼⊽⊿⋄⋄⋆⋇⋉⋊⋋⋌⋒⋓⟎⟏⟑⟒⟓⟓⧜⧝⧞⧸⧹⨝⨝⨝⨠⨠⨹⨺⨻⨼⨼⨼⨿⩤⩥⫶⫼⫽⫾⫿≫∦𝕲∭∄∂⋥ ⊶≋⧉ ⨇⩈𝕸 𝛙ℵ⪌⟁ ⟆⦆⌘𝛴⦻⎈" },
        ghostkey: { script: 'leet', source: 'Ghost-Key stanza alphabet (leetspeak IRL/VR hinge)', realm: 'mix', chars: "Gh0sT1n3SlLDgiaRBtHf4d.CmM" }
    };
    var TYPESET_REALITY = ['latin', 'cyrillic', 'greek', 'hebrew', 'arabic', 'devanagari', 'thai', 'hangul', 'hanzi', 'javanese'];
    var TYPESET_VIRTUAL = ['katakana', 'symbols', 'superscript', 'mathoperator'];
    var TYPESET_NAMES = TYPESET_REALITY.concat(TYPESET_VIRTUAL).concat(['ghostkey']);

    function ghostKeyHash(s) {
        var h = 0x811c9dc5;
        s = String(s || '');
        for (var i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return h >>> 0;
    }
    function ghostKeyMeta(key) {
        key = key || GHOST_KEY;
        var stanzas = GHOST_KEY_STANZAS;
        var seed = ghostKeyHash(key);
        var hues = stanzas.map(function (st) { return ghostKeyHash(st) % 360; });
        var r = hues[0];
        var rel = function (h) { return ((h - r) % 360 + 360) % 360; };
        return {
            key: key,
            stanzas: stanzas.slice(),
            seed: seed,
            hues: hues.slice(),
            home: hues[0],
            fear: seed % 360,
            steps: [0, rel(hues[1]), rel(hues[2])]
        };
    }
    function matrixChords() {
        var gk = ghostKeyMeta();
        return [
            { name: 'shell',     realm: 'reality', steps: gk.steps.slice() },
            { name: 'flesh',     realm: 'reality', steps: [0, 70, 145] },
            { name: 'paper',     realm: 'reality', steps: [0, 48, 96] },
            { name: 'street',    realm: 'reality', steps: [0, 38, 112] },
            { name: 'body',      realm: 'reality', steps: [0, 90, 165] },
            { name: 'rain',      realm: 'virtual', steps: [0, 120, 240] },
            { name: 'net',       realm: 'virtual', steps: [0, 150, 210] },
            { name: 'code',      realm: 'virtual', steps: [0, 180, 270] },
            { name: 'infinite',  realm: 'virtual', steps: [0, 137.5, 222.5] },
            { name: 'fearcomma', realm: 'virtual', steps: [0, (gk.fear % 90) + 40, 160 + (gk.seed % 80)] }
        ];
    }
    function typesetNamesFor(realm) {
        if (realm === 'virtual') return TYPESET_VIRTUAL.slice();
        if (realm === 'reality') return TYPESET_REALITY.slice();
        return TYPESET_REALITY.concat(TYPESET_VIRTUAL);
    }
    function pickTypeset(realm, rng) {
        rng = rng || Math.random;
        if (rng() < 0.07) return 'ghostkey';
        if (realm === 'virtual' && rng() < 0.46) return 'katakana';
        if (realm === 'reality' && rng() < 0.30) return 'latin';
        var names = typesetNamesFor(realm);
        return names[(rng() * names.length) | 0];
    }
    function pickGlyph(realm, rng, toneIndex) {
        rng = rng || Math.random;
        var name = pickTypeset(realm, rng);
        if (toneIndex === 1 && realm === 'virtual' && rng() < 0.25) name = 'mathoperator';
        if (toneIndex === 2 && realm === 'reality' && rng() < 0.20) name = 'hanzi';
        var set = TYPESETS[name] || TYPESETS.latin;
        var chars = set.chars || '01';
        var ch = chars[(rng() * chars.length) | 0];
        if (ch === ' ' || !ch) ch = chars[(rng() * chars.length) | 0] || '0';
        return ch;
    }
    function glyphBank(realm) {
        var names = typesetNamesFor(realm).concat(['ghostkey']);
        var out = '';
        for (var i = 0; i < names.length; i++) {
            var set = TYPESETS[names[i]];
            if (set) out += set.chars;
        }
        return out.split('');
    }
    function pickMatrixChord(realm, rng) {
        rng = rng || Math.random;
        var all = matrixChords();
        var pool = all.filter(function (c) { return realm === 'mix' || c.realm === realm; });
        if (!pool.length) pool = all;
        return pool[(rng() * pool.length) | 0];
    }
    function typesetInfo() {
        var out = {};
        TYPESET_NAMES.forEach(function (n) {
            var s = TYPESETS[n];
            out[n] = { script: s.script, source: s.source, realm: s.realm, count: s.chars.length };
        });
        return out;
    }


    /* ----- B&W Invert 0 / 50 / 75 / 100 (canonical voice map) ----- */
    function bwInvertMap(level) {
        var t = clamp01(level);
        var invert = 0;
        var rail = 'hue';
        if (t <= 0.50) {
            invert = 0;
            rail = 'hue';
        } else if (t <= 0.75) {
            invert = ((t - 0.50) / 0.25) * 0.75;
            rail = 'emission';
        } else {
            invert = 0.75;
            rail = 'emission';
        }
        var kNeg = invert / 0.75;
        return {
            t: t,
            hueDeg: t * 360,
            invert: invert,
            contrast: 1 + kNeg * 0.14,
            sat: t <= 0.50 ? (1 + t * 0.08) : Math.max(0.72, 1 - kNeg * 0.18),
            rail: rail,
            live: t > 0.008,
            negative: invert,
            realm: t <= 0.50 ? 'reality' : 'virtual',
            landmark: t < 0.25 ? 0 : t < 0.625 ? 0.50 : t < 0.875 ? 0.75 : 1
        };
    }

    function bwInvertCssParts(level) {
        var m = bwInvertMap(level);
        if (!m.live) return [];
        var parts = ['hue-rotate(' + m.hueDeg.toFixed(1) + 'deg)'];
        if (m.invert > 0.004) {
            parts.push('invert(' + m.invert.toFixed(3) + ')');
            parts.push('contrast(' + m.contrast.toFixed(3) + ')');
            parts.push('brightness(' + (1 - (m.invert / 0.75) * 0.05).toFixed(3) + ')');
            if (m.sat < 0.98) parts.push('saturate(' + m.sat.toFixed(3) + ')');
        } else if (m.sat > 1.01) {
            parts.push('saturate(' + m.sat.toFixed(3) + ')');
        }
        return parts;
    }

    /* Each voice: primary realm + reality/virtual bands (min,max for ambient / peak).
       Reality = analog confine. Virtual = digital/VR confine. */
    var VOICES = {
        'B&W Invert':      { realm: 'mix',     reality: [0.00, 0.50], virtual: [0.75, 1.00], landmarks: true },
        'Hue/Color Cycle': { realm: 'virtual', reality: [0.04, 0.35], virtual: [0.40, 1.00] },
        'HSL Rainbow':     { realm: 'virtual', reality: [0.04, 0.32], virtual: [0.35, 1.00] },
        'Neon Grad':       { realm: 'mix',     reality: [0.04, 0.40], virtual: [0.20, 0.95] },
        'Scanlines':       { realm: 'reality', reality: [0.06, 0.55], virtual: [0.00, 0.28] },
        'VHS Glitch':      { realm: 'reality', reality: [0.05, 0.60], virtual: [0.00, 0.35] },
        'Data Bands':      { realm: 'reality', reality: [0.05, 0.58], virtual: [0.08, 0.70] },
        'Flash':           { realm: 'reality', reality: [0.04, 0.48], virtual: [0.10, 0.85] },
        'Strobe':          { realm: 'reality', reality: [0.03, 0.42], virtual: [0.12, 0.90] },
        'ASCII':           { realm: 'virtual', reality: [0.02, 0.28], virtual: [0.25, 1.00] },
        'Font Burn':       { realm: 'virtual', reality: [0.02, 0.30], virtual: [0.22, 1.00] },
        'Tech Artist':     { realm: 'virtual', reality: [0.02, 0.26], virtual: [0.28, 1.00] },
        'Data Bomb':       { realm: 'virtual', reality: [0.00, 0.22], virtual: [0.18, 0.92] },
        'Ink Glyphs':      { realm: 'mix',     reality: [0.04, 0.45], virtual: [0.20, 1.00] },
        'Gemini Bomb':     { realm: 'virtual', reality: [0.02, 0.24], virtual: [0.16, 0.88] },
        'Matrix ASCII':    { realm: 'mix',     reality: [0.08, 0.58], virtual: [0.22, 1.00] },
        'Matrix Chord':    { realm: 'mix',     reality: [0.06, 0.52], virtual: [0.20, 0.95] }
    };

    function ghostProfile(mode) {
        return GHOST_PROFILES[mode] || GHOST_PROFILES.SPECTRUM;
    }

    function vsyncMethod(mode) {
        return VSYNC_METHODS[mode] || VSYNC_METHODS.OFF;
    }

    /* Board realm from Ghost × V-Sync × Warp × B&W invert. */
    function realmFromBoard(ctx) {
        ctx = ctx || {};
        var gm = ctx.ghost || 'OFF';
        var vm = ctx.vsync || 'OFF';
        var gp = ghostProfile(gm);
        var bw = bwInvertMap(ctx.bw || 0);
        var warp = !!ctx.warp;
        if (gp.realm === 'off') {
            if (warp || bw.realm === 'virtual') return 'virtual';
            if (vm === 'FULL' || vm === 'ON') return 'reality';
            return 'mix';
        }
        if (gp.realm === 'reality' && bw.rail === 'hue' && !warp) return 'reality';
        if (gp.realm === 'virtual' || gp.led || warp || bw.landmark >= 0.75) return 'virtual';
        return 'mix';
    }

    function mapVoice(name, level, ctx) {
        if (name === 'B&W Invert') return bwInvertMap(level);
        var t = clamp01(level);
        var v = VOICES[name] || { realm: 'mix' };
        var realm = realmFromBoard(ctx);
        return {
            t: t,
            hueDeg: t * 360,
            rail: t <= 0.50 ? 'reality' : (t >= 0.75 ? 'virtual' : 'mix'),
            realm: v.realm,
            boardRealm: realm,
            live: t > 0.008,
            landmark: t < 0.25 ? 0 : t < 0.625 ? 0.50 : t < 0.875 ? 0.75 : 1
        };
    }

    function confineTarget(name, value, ctx) {
        var v = VOICES[name];
        if (!v) return clamp01(value);
        var realm = realmFromBoard(ctx);
        var rng = (ctx && ctx.rng) || Math.random;
        var band;
        if (realm === 'reality') band = v.reality;
        else if (realm === 'virtual') band = v.virtual;
        else band = rng() < 0.5 ? v.reality : v.virtual;
        if (!band) return clamp01(value);
        var lo = band[0], hi = band[1];
        var out = clamp01(value);
        if (out < lo) out = lerp(out, lo, 0.65);
        if (out > hi) out = lerp(out, hi, 0.65);
        if (v.landmarks || name === 'B&W Invert') {
            var marks = realm === 'reality' ? [0, 0.50] : realm === 'virtual' ? [0.75, 1.0] : LANDMARKS;
            var nearest = marks[0], dist = Math.abs(out - marks[0]);
            for (var i = 1; i < marks.length; i++) {
                var d = Math.abs(out - marks[i]);
                if (d < dist) { dist = d; nearest = marks[i]; }
            }
            if (dist < 0.12 || rng() < 0.35) out = nearest;
        }
        return clamp01(out);
    }

    function randomizeTarget(name, rng, ctx) {
        rng = rng || Math.random;
        var v = VOICES[name] || { reality: [0.04, 0.4], virtual: [0.1, 0.9], realm: 'mix' };
        var realm = realmFromBoard(ctx);
        var band = (realm === 'virtual') ? v.virtual : (realm === 'reality') ? v.reality :
            (rng() < 0.5 ? v.reality : v.virtual);
        if (!band) band = [0.05, 0.7];
        if (v.landmarks || name === 'B&W Invert') {
            var marks = realm === 'reality' ? [0, 0.50] : realm === 'virtual' ? [0.75, 1.0] : LANDMARKS;
            return pick(rng, marks);
        }
        return lerp(band[0], band[1], rng());
    }

    function comboGhostAnchor(mode) {
        return { OFF: 0, DIA: 28, SPECTRUM: 45, CRT: 18, PLASMA: 78, LED: 96 }[mode] || 0;
    }

    function comboVsyncAnchor(mode) {
        return { OFF: 0, ON: 8, GHOST_OFF: 32, FULL: 42 }[mode] || 0;
    }


    var CHROMA_VOICES = ['Hue/Color Cycle', 'HSL Rainbow', 'Neon Grad', 'Matrix Chord'];

    function hueCycleMap(level, ctx) {
        var t = clamp01(level);
        var sat = t <= 0.50 ? (1 + t * 0.10) : Math.max(0.92, 1.06 - (t - 0.50) * 0.16);
        var contrast = t <= 0.50 ? 1 : (1 + ((t - 0.50) / 0.50) * 0.07);
        return {
            t: t,
            hueDeg: t * 360,
            sat: sat,
            contrast: contrast,
            live: t > 0.008,
            realm: t <= 0.50 ? 'reality' : 'virtual',
            landmark: t < 0.25 ? 0 : t < 0.625 ? 0.50 : t < 0.875 ? 0.75 : 1
        };
    }
    /* Hue Saturation Lighting Rainbow — three rails, same 0 / 50 / 75 / 100 landmarks.
       H = full wheel. S = chroma prism. L = lighting rainbow (paper → glare → shade). */
    function hslRainbowMap(level, ctx) {
        var t = clamp01(level);
        var hueDeg = t * 360;
        var satPct, lightPct, satFilter, brightFilter, satSwing, lightSwing, hueStops;
        if (t <= 0.50) {
            satPct = 38 + t * 84;
            lightPct = 54 + t * 12;
            satFilter = 1 + t * 0.16;
            brightFilter = 1 + t * 0.04;
            satSwing = 14 + t * 12;
            lightSwing = 8 + t * 8;
            hueStops = 3;
        } else if (t <= 0.75) {
            var u = (t - 0.50) / 0.25;
            satPct = 80 + u * 18;
            lightPct = 60 + u * 18;
            satFilter = 1.08 + u * 0.14;
            brightFilter = 1.02 + u * 0.08;
            satSwing = 20 + u * 18;
            lightSwing = 12 + u * 14;
            hueStops = 5;
        } else {
            var v = (t - 0.75) / 0.25;
            satPct = 98 - v * 6;
            lightPct = 50 + 28 * Math.sin(v * Math.PI);
            satFilter = 1.22 - v * 0.04;
            brightFilter = 1.10 - v * 0.05;
            satSwing = 38 + v * 10;
            lightSwing = 26 + v * 12;
            hueStops = 7;
        }
        return {
            t: t,
            hueDeg: hueDeg,
            satPct: satPct,
            lightPct: lightPct,
            satFilter: satFilter,
            brightFilter: brightFilter,
            satSwing: satSwing,
            lightSwing: lightSwing,
            hueStops: hueStops,
            live: t > 0.008,
            realm: t <= 0.50 ? 'reality' : 'virtual',
            landmark: t < 0.25 ? 0 : t < 0.625 ? 0.50 : t < 0.875 ? 0.75 : 1
        };
    }
    function neonFilterMap(level, ctx) {
        var t = clamp01(level);
        var realm = realmFromBoard(ctx);
        return {
            t: t,
            sat: realm === 'reality' ? 46 + t * 16 : (realm === 'virtual' ? 72 + t * 26 : 58 + t * 22),
            veil: realm === 'reality' ? 0.07 + t * 0.09 : 0.12 + t * 0.18,
            light: realm === 'reality' ? 62 : 70,
            confMix: realm === 'virtual' ? 0.42 : 0.26,
            blend: realm === 'reality' ? 'soft-light' : 'screen',
            live: t > 0.008,
            realm: realm
        };
    }
    function colorShiftMap(level, ctx) {
        var t = clamp01(level);
        var realm = realmFromBoard(ctx);
        return {
            t: t,
            opacity: realm === 'virtual' ? 0.09 + t * 0.26 : (realm === 'reality' ? 0.05 + t * 0.14 : 0.07 + t * 0.20),
            sat: realm === 'virtual' ? 88 : (realm === 'reality' ? 58 : 74),
            blend: realm === 'reality' ? 'soft-light' : 'color-dodge',
            travel: realm === 'virtual' ? 2.0 : 3.2,
            live: t > 0.006,
            realm: realm
        };
    }
    function easeHueDeg(cur, tgt, k) {
        var d = ((tgt - cur) % 360 + 540) % 360 - 180;
        return ((cur + d * k) % 360 + 360) % 360;
    }
    function isChromaVoice(name) {
        return CHROMA_VOICES.indexOf(name) !== -1;
    }
    function chromaRateScale(name) {
        return isChromaVoice(name) ? 0.52 : 1;
    }

    function ghostSkinHue(mode) {
        return { DIA: 313, SPECTRUM: 165, CRT: 42, PLASMA: 295, LED: 145 }[mode];
    }


    /* =========================================================================
       R2 — SOFT-EYE · CRESCENDO · AUDIO EAR   (baked into the ghost)
       "an easier viewer experience": slow, gradual transitions between voices,
       no regular strobing/flashing, fewer Matrix bursts — with only OCCASIONAL
       'WILD' crescendos where the chroma voices (HSL Rainbow, Neon Aurora,
       Hue Cycle, B&W Dia shader) spin fast and Ghost/V-Sync fire colour +
       dia-inverted LIGHT BURSTS.  Timing comes from BOTH the audio ear
       (spectral flux onsets, energy build / drop) and the video canvas.
       ========================================================================= */
    var SOFT_EYE = {
        version: 'softeye-1',
        pace: {
            retargetK:   2.35,   /* randomizer retarget cadence × (slower)          */
            holdK:       1.90,   /* timing-mode hold ×                              */
            rateK:       0.55,   /* slider travel rate × in calm                    */
            wildRateK:   1.35,   /* slider travel rate × inside a crescendo         */
            restK:       1.80,   /* aesthetic-burst rest / hold ×                   */
            sparkK:      2.10,   /* auto-glitch spark interval ×                    */
            timedDurK:   1.55,   /* timed one-shot effect lifetime ×                */
            presetTravelMs:     [3400, 5400],
            presetTravelWildMs: [1300, 2000],
            presetAutoMs:       [9500, 19500],
            presetAutoWildMs:   [3800, 6600]
        },
        /* per-mode travel scale (the old 5 / 7 / 12 / 9 were the slams) */
        timingScale: { smooth: 0.90, snap: 2.0, flipflop: 1.7, burst: 2.6, linger: 0.35, flipBurst: 3.2, zoomBurst: 3.0 },
        wildOnlyModes: ['flipBurst', 'zoomBurst', 'burst'],
        calmModes: ['smooth', 'linger', 'flipflop', 'smooth', 'linger'],
        lightVoices: ['Flash', 'Strobe'],
        busyVoices:  ['ASCII', 'Matrix ASCII', 'Data Bomb', 'Gemini Bomb', 'Matrix Chord'],
        /* randomizer target ceilings while calm (k = 0). Lerped to 1.0 at k = 1. */
        calmCaps:  { 'Flash': 0.16, 'Strobe': 0.10, 'Matrix ASCII': 0.40, 'ASCII': 0.46, 'Data Bomb': 0.42, 'Gemini Bomb': 0.42, 'Matrix Chord': 0.55 },
        /* paint-alpha multipliers while calm (lerped to 1.0 at k = 1) */
        paintCalm: { 'Flash': 0.50, 'Strobe': 0.30, 'Matrix ASCII': 0.62, 'ASCII': 0.72, 'Data Bomb': 0.80, 'Gemini Bomb': 0.80 },
        /* Strobe pulse rate — kept BELOW the 3 Hz photosensitive band, always */
        strobeHz:  { calm: 1.05, wild: 2.60 },
        /* chroma spin multipliers (HSL Rainbow prism, Neon flow, Hue Cycle) */
        chromaSpin: { calm: 0.55, wild: 3.40, beatLift: 0.45 },
        /* Matrix ASCII stream population × */
        matrixK:   { calm: 0.48, wild: 1.0 },
        crescendo: {
            calmMs:    [40000, 85000],
            swellMs:   [2800, 5000],
            wildMs:    [4500, 9500],
            releaseMs: [5200, 8800],
            minGapMs:  30000,
            dropGapMs: 12000,       /* a real heard DROP may come sooner than the timer gap */
            presetWildOdds: 0.30,   /* a busy preset pick may CALL a crescendo */
            audioBuildOdds: 0.22,   /* per-second odds while the ear hears a build */
            audioDropOdds:  0.65    /* odds a heard DROP calls one (if gap allows) */
        },
        burst: {
            calmGapMs: [16000, 38000],
            wildGapMs: [1500, 3400],
            calmDurMs: [1700, 2600],
            wildDurMs: [650, 1250],
            calmOdds:  0.45,       /* calm timer fires a soft one only sometimes */
            onsetGate: 0.62        /* ear onset needed to pull a burst forward   */
        }
    };

    function smoothstep01(u) { u = clamp01(u); return u * u * (3 - 2 * u); }
    function easeInOutCubic01(t) { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function rangeRoll(rng, r) { return r[0] + (rng || Math.random)() * (r[1] - r[0]); }

    /* ----- CRESCENDO — calm → swell → wild → release → calm -------------- */
    function createCrescendo(opts) {
        opts = opts || {};
        var rng = opts.rng || Math.random;
        var C = Object.assign({}, SOFT_EYE.crescendo, opts);
        var st = { phase: 'calm', k: 0, since: 0, until: 0, source: 'boot', count: 0, lastWildEnd: -1e9, strength: 1, breath: 0 };
        function enter(phase, now, range) { st.phase = phase; st.since = now; st.until = now + rangeRoll(rng, range); }
        function begin(now, source, strength) {
            st.source = source || 'timer';
            st.strength = strength == null ? 1 : Math.max(0.35, clamp01(strength));
            st.count++;
            enter('swell', now, C.swellMs);
        }
        var api = {
            state: st,
            k: function () { return st.k; },
            phase: function () { return st.phase; },
            isWild: function () { return st.k > 0.5; },
            gapOk: function (now, gapMs) { return (now - st.lastWildEnd) >= (gapMs || C.minGapMs); },
            /* ask for a crescendo (preset roulette / audio). true = accepted */
            request: function (now, source, strength, odds) {
                if (st.phase !== 'calm') return false;
                if (!api.gapOk(now)) return false;
                if (odds != null && rng() >= odds) return false;
                begin(now, source, strength);
                return true;
            },
            step: function (now, dt, ear) {
                if (!st.until) { st.since = now; st.until = now + rangeRoll(rng, C.calmMs); }
                var u;
                if (st.phase === 'calm') {
                    st.k += (0 - st.k) * Math.min(1, dt * 1.2);
                    if (ear && ear.active && ear.ready) {
                        if (ear.drop > 0.48 && api.gapOk(now, C.dropGapMs) && rng() < C.audioDropOdds * ear.drop) { begin(now, 'audio-drop', 0.7 + 0.3 * ear.drop); ear.drop = 0; ear.buildCredit = 0; }
                        else if (api.gapOk(now) && ear.buildCredit > 3.5) { begin(now, 'audio-build', 0.6 + 0.4 * ear.build); ear.buildCredit = 0; }
                        else if (api.gapOk(now) && ear.build > 0.6 && rng() < C.audioBuildOdds * dt * ear.build) { begin(now, 'audio-build', 0.6 + 0.4 * ear.build); ear.buildCredit = 0; }
                    }
                    if (st.phase === 'calm' && now >= st.until) begin(now, 'timer', 0.55 + 0.45 * rng());
                } else if (st.phase === 'swell') {
                    u = clamp01((now - st.since) / (st.until - st.since));
                    st.k = smoothstep01(u) * st.strength;
                    if (u >= 1) enter('wild', now, C.wildMs);
                } else if (st.phase === 'wild') {
                    u = clamp01((now - st.since) / (st.until - st.since));
                    st.breath = 0.5 + 0.5 * Math.sin(now * 0.0019);
                    st.k = st.strength * (0.88 + 0.12 * st.breath);
                    if (u >= 1) enter('release', now, C.releaseMs);
                } else { /* release */
                    u = clamp01((now - st.since) / (st.until - st.since));
                    st.k = st.strength * (1 - easeInOutCubic01(u));
                    if (u >= 1) { st.phase = 'calm'; st.lastWildEnd = now; st.since = now; st.until = now + rangeRoll(rng, C.calmMs); st.k = 0; }
                }
                return st.k;
            }
        };
        return api;
    }

    /* ----- LIGHT-BURST GATE — colour / dia-inverted light events ---------- */
    function createBurstGate(opts) {
        opts = opts || {};
        var rng = opts.rng || Math.random;
        var B = Object.assign({}, SOFT_EYE.burst, opts);
        var st = { active: false, kind: 'dia', start: 0, dur: 1, amp: 0, nextAt: 0, count: 0, p: 0, env: 0, lastFire: -1e9 };
        function fire(now, k, ear) {
            var wild = k > 0.5;
            st.active = true;
            st.start = now;
            st.dur = rangeRoll(rng, wild ? B.wildDurMs : B.calmDurMs);
            st.amp = wild ? (0.7 + 0.3 * k) : (0.35 + 0.25 * rng());
            var r = rng();
            st.kind = r < 0.42 ? 'dia' : r < 0.78 ? 'color' : 'both';
            if (ear && ear.active && ear.bass > 0.6 && rng() < 0.5) st.kind = 'dia';
            st.count++;
            st.lastFire = now;
            st.nextAt = now + st.dur + rangeRoll(rng, wild ? B.wildGapMs : B.calmGapMs);
        }
        return {
            state: st,
            env: function () { return st.active ? st.env : 0; },
            kind: function () { return st.active ? st.kind : null; },
            step: function (now, dt, k, ear) {
                if (!st.nextAt) st.nextAt = now + rangeRoll(rng, B.calmGapMs) * 0.6;
                if (st.active) {
                    st.p = clamp01((now - st.start) / st.dur);
                    st.env = Math.pow(Math.sin(st.p * Math.PI), 1.35) * st.amp;   /* soft bell — never a cut */
                    if (st.p >= 1) { st.active = false; st.env = 0; }
                    return st.env;
                }
                var wild = k > 0.5;
                var onset = ear && ear.active ? ear.onset : 0;
                if (wild) {
                    /* entering a crescendo pulls a calm-scheduled gate forward */
                    if (st.nextAt - now > B.wildGapMs[1]) st.nextAt = now + rangeRoll(rng, B.wildGapMs) * 0.4;
                    if (now >= st.nextAt) fire(now, k, ear);
                    else if (onset > B.onsetGate && now - st.lastFire > B.wildGapMs[0]) fire(now, k, ear);
                } else if (st.nextAt - now < B.calmGapMs[0] * 0.35 && st.lastFire > now - B.wildGapMs[1] * 2) {
                    /* just left a crescendo: re-space onto the calm gap */
                    st.nextAt = now + rangeRoll(rng, B.calmGapMs) * 0.6;
                } else if (now >= st.nextAt) {
                    /* calm: only occasionally, and a heard drop makes it likely */
                    var odds = B.calmOdds + (ear && ear.active ? 0.45 * ear.drop : 0);
                    if (rng() < odds) fire(now, k, ear);
                    else st.nextAt = now + rangeRoll(rng, B.calmGapMs) * 0.5;
                }
                return 0;
            },
            /* value for the B&W Dia rail during a burst: rides cur → 0.75 (negative
               light emission) and back along the bell; if cur < 0.5 it passes the
               0.50 dia landmark on the way — the inverted light burst */
            diaValue: function (cur, env) {
                var top = 0.75;
                var e = clamp01(env);
                return cur + (top - cur) * e;
            }
        };
    }

    /* ----- AUDIO EAR — pure DSP on analyser byte arrays -------------------- */
    function createEar(opts) {
        opts = opts || {};
        var st = {
            active: false, source: 'none',
            level: 0, bass: 0, mid: 0, treb: 0,
            onset: 0, beat: 0, flux: 0, fluxAvg: 0.02,
            energy: 0, energyFast: 0, energyLong: 0, build: 0, drop: 0, buildCredit: 0,
            peakHold: 0.2, quietFor: 0, tempoK: 1, lastOnsetAt: -1e9, ibi: 0.5,
            warm: 0, ready: false
        };
        var prev = null;
        var hist = [];   /* 1 s ring of energy for drop detection */
        function bandMean(arr, lo, hi) {
            var s = 0, n = 0;
            for (var i = lo; i < hi && i < arr.length; i++) { s += arr[i]; n++; }
            return n ? s / (n * 255) : 0;
        }
        function commonDynamics(now, dt) {
            /* AGC — normalise against a slow peak hold so quiet mixes still read */
            st.peakHold = Math.max(st.level, st.peakHold - dt * 0.05, 0.12);
            var norm = clamp01(st.level / st.peakHold);
            st.energyFast += (norm - st.energyFast) * Math.min(1, dt / 0.35);
            st.energy += (norm - st.energy) * Math.min(1, dt / 2.2);
            st.energyLong += (norm - st.energyLong) * Math.min(1, dt / 14);
            hist.push({ t: now, e: st.energyFast });
            while (hist.length && now - hist[0].t > 2600) hist.shift();
            /* the quietest moment in the last ~2.6 s (skipping the newest 250 ms) */
            var quiet = 1, qi;
            for (qi = 0; qi < hist.length; qi++) { if (now - hist[qi].t > 400 && hist[qi].e < quiet) quiet = hist[qi].e; }
            if (quiet === 1) quiet = st.energyFast;
            /* warm-up: the AGC needs ~3.5 s before build / drop are trusted */
            st.warm += dt;
            st.ready = st.warm > 3.5;
            /* DROP: fast energy leaps well above the quietest recent moment
               (breakdown → drop) — decays on its own */
            var dropRaw = st.ready ? clamp01((st.energyFast - quiet - 0.12) / 0.24) * clamp01((0.55 - quiet) / 0.30 + 0.2) : 0;
            st.drop = Math.max(dropRaw, st.drop - dt * 1.6);
            /* BUILD: sustained rise of the 2 s energy over the 14 s baseline; a credit
               accumulates while the build holds (≈7 s of strong build = a call) and
               bleeds away when the music settles */
            st.build = st.ready ? clamp01((st.energy - st.energyLong - 0.06) / 0.20) * clamp01(st.energy / 0.55) : 0;
            st.buildCredit = st.ready ? Math.max(0, st.buildCredit + dt * ((st.build - 0.45) * (st.build > 0.45 ? 1 : 1.8))) : 0;
            if (norm < 0.12) st.quietFor += dt; else st.quietFor = 0;
            st.beat = Math.max(st.onset, st.beat - dt * 2.8);
        }
        return {
            state: st,
            /* live analyser feed — freq: Uint8Array(freqBinCount), time: Uint8Array(fftSize) */
            feedSpectrum: function (freq, time, dt, sampleRate, source) {
                var n = freq.length;
                var nyq = (sampleRate || 44100) / 2;
                var binHz = nyq / n;
                var b1 = Math.max(2, Math.round(160 / binHz)), b2 = Math.round(2000 / binHz), b3 = Math.min(n, Math.round(9000 / binHz));
                st.bass = bandMean(freq, 1, b1);
                st.mid = bandMean(freq, b1, b2);
                st.treb = bandMean(freq, b2, b3);
                var lvl;
                if (time && time.length) {
                    var acc = 0;
                    for (var i = 0; i < time.length; i += 2) { var v = (time[i] - 128) / 128; acc += v * v; }
                    lvl = Math.sqrt(acc / (time.length / 2)) * 2.2;
                } else lvl = st.bass * 0.5 + st.mid * 0.35 + st.treb * 0.15;
                st.level += (clamp01(lvl) - st.level) * Math.min(1, dt * 12);
                /* spectral flux → adaptive onset */
                if (!prev || prev.length !== n) { prev = new Float32Array(n); }
                var flux = 0, cnt = Math.min(n, b3);
                for (var j = 1; j < cnt; j++) { var d = freq[j] / 255 - prev[j]; if (d > 0) flux += d; prev[j] = freq[j] / 255; }
                flux /= cnt;
                st.flux = flux;
                st.fluxAvg += (flux - st.fluxAvg) * Math.min(1, dt / 1.6);
                var raw = flux / (st.fluxAvg * 1.55 + 0.004);
                var onset = clamp01((raw - 1) / 1.6);
                var now = performance.now();
                if (onset > 0.55 && now - st.lastOnsetAt > 180) {
                    var ibi = (now - st.lastOnsetAt) / 1000;
                    if (ibi < 2.5) st.ibi += (ibi - st.ibi) * 0.25;
                    st.lastOnsetAt = now;
                }
                st.onset = onset;
                st.tempoK = clamp01(0.5 / Math.max(0.25, st.ibi)) + 0.5;
                if (st.source !== (source || 'media')) { st.warm = 0; st.ready = false; st.peakHold = 0.2; hist.length = 0; }
                st.active = true;
                st.source = source || 'media';
                commonDynamics(now, dt);
                return st;
            },
            /* no audio reachable (YouTube iframe) — synthesize a pseudo-ear from the
               video canvas profile so the same automation still has a pulse */
            feedVisual: function (energy, motion, dt) {
                var lvl = clamp01(0.55 * (energy || 0) + 0.45 * (motion || 0));
                var jump = clamp01((lvl - st.level) * 5.5);
                st.level += (lvl - st.level) * Math.min(1, dt * 3);
                st.bass = clamp01(energy || 0); st.mid = lvl; st.treb = clamp01(motion || 0);
                st.onset = jump;
                st.active = false;
                st.source = 'canvas';
                commonDynamics(performance.now(), dt);
                return st;
            },
            reset: function () { prev = null; hist.length = 0; st.active = false; st.source = 'none'; st.onset = st.beat = st.drop = st.build = st.buildCredit = 0; st.warm = 0; st.ready = false; st.peakHold = 0.2; }
        };
    }

    /* ----- pace helpers the board reads every frame ------------------------ */
    function softCap(name, target, k) {
        var cap = SOFT_EYE.calmCaps[name];
        if (cap == null) return target;
        var lim = lerp(cap, 1, clamp01(k));
        return target > lim ? lim : target;
    }
    function softPaintK(name, k) {
        var c = SOFT_EYE.paintCalm[name];
        if (c == null) return 1;
        return lerp(c, 1, clamp01(k));
    }
    function softTimingScale(mode) {
        var v = SOFT_EYE.timingScale[mode];
        return v == null ? 1 : v;
    }
    function softPickMode(mode, k, rng) {
        rng = rng || Math.random;
        if (SOFT_EYE.wildOnlyModes.indexOf(mode) !== -1 && k < 0.5) {
            return pick(rng, SOFT_EYE.calmModes);
        }
        if (mode === 'snap' && k < 0.5 && rng() < 0.6) return 'smooth';
        return mode;
    }
    function softRateK(k) { return lerp(SOFT_EYE.pace.rateK, SOFT_EYE.pace.wildRateK, clamp01(k)); }
    function softCadenceK(k) { return lerp(SOFT_EYE.pace.retargetK, 1.0, clamp01(k)); }
    function softStrobeHz(k) { return lerp(SOFT_EYE.strobeHz.calm, SOFT_EYE.strobeHz.wild, clamp01(k)); }
    function softChromaSpin(k, beat) {
        return lerp(SOFT_EYE.chromaSpin.calm, SOFT_EYE.chromaSpin.wild, clamp01(k)) * (1 + SOFT_EYE.chromaSpin.beatLift * clamp01(beat || 0));
    }
    function softMatrixK(k) { return lerp(SOFT_EYE.matrixK.calm, SOFT_EYE.matrixK.wild, clamp01(k)); }
    function softGroupAllowed(effects, k) {
        for (var i = 0; i < effects.length; i++) {
            if (SOFT_EYE.lightVoices.indexOf(effects[i]) !== -1 && k < 0.45) return false;
        }
        return true;
    }

    /* ----- NEON AURORA v2 — the better Neon Grad ---------------------------
       Ribbons of light (2 calm / 3 wild) flowing across the frame on a slow
       angle, additive, with soft blooms at the ribbon crests.  `flow` is the
       ribbon travel (deg/s of phase) — rapid inside a crescendo. */
    function neonAuroraMap(level, ctx, k, beat) {
        var t = clamp01(level);
        k = clamp01(k || 0);
        var realm = realmFromBoard(ctx);
        var base = neonFilterMap(level, ctx);
        var spin = softChromaSpin(k, beat);
        return {
            t: t, realm: realm, live: t > 0.008,
            ribbons: k > 0.5 ? 3 : 2,
            flow: (14 + 26 * t) * spin,                       /* phase deg/s */
            angleRate: (1.6 + 2.2 * k) * (0.6 + 0.4 * t),     /* deg/s of the band angle */
            width: 0.22 + 0.16 * t + 0.10 * k,                /* ribbon half-width (frame frac) */
            sat: Math.min(100, base.sat + 18 + 14 * k),
            light: base.light + 4 + 6 * k,
            veil: base.veil * (0.9 + 0.5 * k),
            blend: realm === 'reality' ? 'soft-light' : 'screen',
            glowBlend: 'lighter',
            confMix: base.confMix,
            hueSpread: 38 + 42 * k,                            /* deg between ribbon hues */
            bloomA: 0.55 + 0.35 * k
        };
    }

    root.GlitchEngine = {
        LANDMARKS: LANDMARKS,
        GHOST_MODES: GHOST_MODES,
        VSYNC_MODES: VSYNC_MODES,
        GHOST_PROFILES: GHOST_PROFILES,
        VSYNC_METHODS: VSYNC_METHODS,
        VSYNC_LABELS: VSYNC_LABELS,
        VOICES: VOICES,
        bwInvertMap: bwInvertMap,
        bwInvertCssParts: bwInvertCssParts,
        mapVoice: mapVoice,
        ghostProfile: ghostProfile,
        vsyncMethod: vsyncMethod,
        realmFromBoard: realmFromBoard,
        confineTarget: confineTarget,
        randomizeTarget: randomizeTarget,
        comboGhostAnchor: comboGhostAnchor,
        comboVsyncAnchor: comboVsyncAnchor,
        ghostSkinHue: ghostSkinHue,
        GHOST_KEY: GHOST_KEY,
        GHOST_KEY_STANZAS: GHOST_KEY_STANZAS,
        TYPESETS: TYPESETS,
        TYPESET_REALITY: TYPESET_REALITY,
        TYPESET_VIRTUAL: TYPESET_VIRTUAL,
        TYPESET_NAMES: TYPESET_NAMES,
        ghostKeyHash: ghostKeyHash,
        ghostKeyMeta: ghostKeyMeta,
        matrixChords: matrixChords,
        pickMatrixChord: pickMatrixChord,
        pickTypeset: pickTypeset,
        pickGlyph: pickGlyph,
        glyphBank: glyphBank,
        typesetInfo: typesetInfo,
        hueCycleMap: hueCycleMap,
        hslRainbowMap: hslRainbowMap,
        neonFilterMap: neonFilterMap,
        colorShiftMap: colorShiftMap,
        easeHueDeg: easeHueDeg,
        CHROMA_VOICES: CHROMA_VOICES,
        isChromaVoice: isChromaVoice,
        chromaRateScale: chromaRateScale,
        /* R2 SOFT-EYE */
        SOFT_EYE: SOFT_EYE,
        createCrescendo: createCrescendo,
        createBurstGate: createBurstGate,
        createEar: createEar,
        softCap: softCap,
        softPaintK: softPaintK,
        softTimingScale: softTimingScale,
        softPickMode: softPickMode,
        softRateK: softRateK,
        softCadenceK: softCadenceK,
        softStrobeHz: softStrobeHz,
        softChromaSpin: softChromaSpin,
        softMatrixK: softMatrixK,
        softGroupAllowed: softGroupAllowed,
        neonAuroraMap: neonAuroraMap,
        smoothstep01: smoothstep01,
        easeInOutCubic01: easeInOutCubic01,
        version: 'engine-2.0-softeye'
    };
})(typeof window !== 'undefined' ? window : this);

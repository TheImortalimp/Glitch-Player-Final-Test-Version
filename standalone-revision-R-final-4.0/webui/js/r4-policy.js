'use strict';
/* Standalone Revision R Final 4.0 - pure input policy.
   DOM-free validation shared by glitch-player.js and the Node tests in tests/web. */
(function (root) {
    const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
    const PLAYLIST_ID = /^[A-Za-z0-9_-]{1,128}$/;
    const YOUTUBE_HOSTS = Object.freeze(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com',
        'youtu.be', 'www.youtu.be']);
    const mediaExtensions = Object.freeze({
        audio: Object.freeze('mp3 m4a aac wav ogg oga opus flac wma aif aiff ac3 amr'.split(' ')),
        video: Object.freeze('mp4 m4v webm mov mkv avi wmv asf mpg mpeg ts m2ts mts 3gp 3g2 ogv'.split(' '))
    });
    const LOCAL_AUDIO_EXT = new RegExp('\\.(' + mediaExtensions.audio.join('|') + ')$');
    const LOCAL_VIDEO_EXT = new RegExp('\\.(' + mediaExtensions.video.join('|') + ')$');
    const MAX_USER_PRESETS = 500;
    const MAX_PRESET_NAME_CHARS = 80;
    const MAX_PRESET_EFFECTS = 128;
    const ARTWORK_SIGNATURES = Object.freeze([
        Object.freeze(['image/jpeg', Object.freeze([0xff, 0xd8, 0xff])]),
        Object.freeze(['image/png', Object.freeze([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])]),
        Object.freeze(['image/gif', Object.freeze([0x47, 0x49, 0x46, 0x38])])
    ]);

    /* Only video and playlist IDs leave this function; the URL itself is never loaded. */
    function parseAllowedYouTubeInput(input) {
        const trimmed = typeof input === 'string' ? input.trim() : '';
        if (!trimmed || trimmed.length > 2048) return null;
        if (VIDEO_ID.test(trimmed)) return { videoId: trimmed, playlistId: '' };
        let parsed;
        try { parsed = new URL(trimmed); } catch (_) { return null; }
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
        if (parsed.username || parsed.password || parsed.port) return null;
        const host = parsed.hostname.toLowerCase();
        if (!YOUTUBE_HOSTS.includes(host)) return null;
        let videoId = '';
        const playlistId = parsed.searchParams.get('list') || '';
        if (host.endsWith('youtu.be')) {
            videoId = parsed.pathname.replace(/^\/+/, '').split('/')[0] || '';
        } else {
            videoId = parsed.searchParams.get('v') || '';
            if (!videoId) {
                const segments = parsed.pathname.split('/').filter(Boolean);
                if (['embed', 'shorts', 'live'].includes(segments[0])) videoId = segments[1] || '';
            }
        }
        if (videoId && !VIDEO_ID.test(videoId)) return null;
        if (playlistId && !PLAYLIST_ID.test(playlistId)) return null;
        if (!videoId && !playlistId) return null;
        return { videoId, playlistId };
    }

    function classifyLocalFile(name, type) {
        const lowerName = typeof name === 'string' ? name.toLowerCase() : '';
        const lowerType = typeof type === 'string' ? type.toLowerCase() : '';
        if (lowerType.startsWith('audio/')) return 'audio';
        if (lowerType.startsWith('video/')) return 'video';
        if (LOCAL_AUDIO_EXT.test(lowerName)) return 'audio';
        if (LOCAL_VIDEO_EXT.test(lowerName)) return 'video';
        return '';
    }

    /* The declared APIC MIME is ignored: only recognised raster images are accepted. */
    function sniffArtworkType(bytes) {
        for (const [type, signature] of ARTWORK_SIGNATURES) {
            if (bytes.length >= signature.length && signature.every((b, i) => bytes[i] === b)) return type;
        }
        if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
            bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp';
        return '';
    }

    function readApicFrame(bytes, start, end, version, formatFlags) {
        let p = start;
        if (version === 4) {
            if (formatFlags & 0x0e) return null;          /* compressed, encrypted or unsynchronised */
            if (formatFlags & 0x01) p += 4;               /* data length indicator */
        } else if (formatFlags & 0xe0) {
            return null;                                  /* compressed, encrypted or grouped */
        }
        if (p >= end) return null;
        const encoding = bytes[p++];
        if (encoding > 3) return null;
        while (p < end && bytes[p] !== 0) p++;            /* MIME type (ignored) */
        p += 2;                                           /* MIME terminator + picture type */
        if (encoding === 1 || encoding === 2) {
            while (p + 1 < end && (bytes[p] !== 0 || bytes[p + 1] !== 0)) p += 2;
            p += 2;
        } else {
            while (p < end && bytes[p] !== 0) p++;
            p += 1;
        }
        if (p >= end) return null;
        const type = sniffArtworkType(bytes.subarray(p, end));
        return type ? { type, start: p, end } : null;
    }

    /* Returns the byte range and sniffed type of the first ID3v2.3/2.4 APIC image, or null. */
    function findId3Artwork(bytes) {
        if (!(bytes instanceof Uint8Array)) return null;
        if (bytes.length < 10 || bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return null;
        const version = bytes[3];
        if ((version !== 3 && version !== 4) || (bytes[5] & 0x80)) return null;
        const syncsafe = (p) => ((bytes[p] & 0x7f) << 21) | ((bytes[p + 1] & 0x7f) << 14) |
            ((bytes[p + 2] & 0x7f) << 7) | (bytes[p + 3] & 0x7f);
        const plain = (p) => bytes[p] * 0x1000000 + (bytes[p + 1] << 16) + (bytes[p + 2] << 8) + bytes[p + 3];
        const tagEnd = Math.min(bytes.length, 10 + syncsafe(6));
        let pos = 10;
        if (bytes[5] & 0x40) {
            if (pos + 4 > tagEnd) return null;
            pos += version === 4 ? syncsafe(pos) : plain(pos) + 4;
        }
        while (pos + 10 <= tagEnd && bytes[pos] !== 0) {
            const size = version === 4 ? syncsafe(pos + 4) : plain(pos + 4);
            const dataStart = pos + 10;
            const dataEnd = dataStart + size;
            if (size <= 0 || dataEnd > tagEnd) return null;
            if (bytes[pos] === 0x41 && bytes[pos + 1] === 0x50 && bytes[pos + 2] === 0x49 && bytes[pos + 3] === 0x43) {
                return readApicFrame(bytes, dataStart, dataEnd, version, bytes[pos + 9]);
            }
            pos = dataEnd;
        }
        return null;
    }

    function isPlainRecord(value) {
        return !!value && typeof value === 'object' && !Array.isArray(value);
    }

    function validPresetSettings(settings) {
        if (!isPlainRecord(settings)) return false;
        const effects = isPlainRecord(settings.effects) ? settings.effects :
            (isPlainRecord(settings.alphas) ? settings.alphas : null);
        if (!effects || Object.keys(effects).length > MAX_PRESET_EFFECTS) return false;
        return Object.keys(effects).every((name) =>
            typeof effects[name] === 'number' && Number.isFinite(effects[name]) &&
            effects[name] >= 0 && effects[name] <= 1);
    }

    function validPresetName(name) {
        return typeof name === 'string' && name.trim().length > 0 && name.length <= MAX_PRESET_NAME_CHARS;
    }

    function validPresetEntry(entry) {
        return isPlainRecord(entry) && validPresetName(entry.name) && validPresetSettings(entry.settings);
    }

    /* Accepts the glitchCanvasPresets_v2 array or a {format, version, presets} backup; null when invalid. */
    function presetBackupEntries(payload) {
        const entries = Array.isArray(payload) ? payload :
            (isPlainRecord(payload) && Array.isArray(payload.presets) ? payload.presets : null);
        if (!entries || entries.length > MAX_USER_PRESETS || !entries.every(validPresetEntry)) return null;
        return entries;
    }

    const policy = Object.freeze({
        mediaExtensions,
        MAX_USER_PRESETS,
        MAX_PRESET_NAME_CHARS,
        MAX_PRESET_EFFECTS,
        parseAllowedYouTubeInput,
        classifyLocalFile,
        sniffArtworkType,
        findId3Artwork,
        isPlainRecord,
        validPresetSettings,
        validPresetName,
        validPresetEntry,
        presetBackupEntries
    });
    Object.defineProperty(root, 'R4Policy', { value: policy, writable: false, configurable: false, enumerable: false });
})(typeof window !== 'undefined' ? window : globalThis);

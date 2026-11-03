'use strict';
(() => {
    const pending = new Map();
    let nextId = 0;
    const isNativeHost = !!(window.chrome && window.chrome.webview &&
        typeof window.chrome.webview.postMessage === 'function');

    function post(message, files) {
        if (!isNativeHost) return false;
        try {
            if (files && files.length) {
                window.chrome.webview.postMessageWithAdditionalObjects(message, files);
            } else {
                window.chrome.webview.postMessage(message);
            }
            return true;
        } catch (error) {
            throw new Error('The local app host rejected the request: ' + error.message);
        }
    }

    function validMediaUrl(url, kind) {
        try {
            const parsed = new URL(url);
            const suffix = kind === 'video' ? '\\.mp4' : '\\.m4a';
            return parsed.protocol === 'https:' &&
                parsed.hostname === 'media-r4.local' &&
                parsed.port === '' && parsed.username === '' && parsed.password === '' &&
                parsed.search === '' && parsed.hash === '' &&
                new RegExp('^/[0-9a-f]{64}' + suffix + '$').test(parsed.pathname);
        } catch (_) {
            return false;
        }
    }

    function onHostMessage(event) {
        if (typeof event.data !== 'string' || event.data.length > 2200000) return;
        const divider = event.data.indexOf('|');
        if (divider !== 'media:result'.length || event.data.slice(0, divider) !== 'media:result') return;
        let result;
        try {
            result = JSON.parse(event.data.slice(divider + 1));
        } catch (_) {
            return;
        }
        if (!result || typeof result.id !== 'string') return;
        const request = pending.get(result.id);
        if (!request) return;
        pending.delete(result.id);
        clearTimeout(request.timer);
        if (typeof result.error === 'string') {
            request.reject(new Error(result.error.slice(0, 1000)));
        } else if (validMediaUrl(result.url, request.kind)) {
            request.resolve(result.url);
        } else {
            request.reject(new Error('The host returned an invalid local media URL.'));
        }
    }

    function abortPending(id, notifyHost) {
        const request = pending.get(id);
        if (!request) return;
        if (notifyHost) post('media:cancel|' + id);
        clearTimeout(request.timer);
        pending.delete(id);
        request.reject(new DOMException('Media conversion cancelled.', 'AbortError'));
    }

    if (isNativeHost) window.chrome.webview.addEventListener('message', onHostMessage);

    window.GlitchHost = Object.freeze({
        isNativeHost,

        convertLocalMedia(file, kind) {
            if (!(file instanceof File) || (kind !== 'video' && kind !== 'audio')) {
                return Promise.reject(new TypeError('Choose one local audio or video file.'));
            }
            if (!isNativeHost) {
                return Promise.resolve(URL.createObjectURL(file));
            }
            // The host runs one conversion at a time and drops a superseded one without replying.
            Array.from(pending.keys()).forEach((oldId) => abortPending(oldId, false));
            const id = String(++nextId);
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    pending.delete(id);
                    reject(new Error('The media conversion request timed out.'));
                }, 10 * 60 * 1000);
                pending.set(id, { resolve, reject, timer, kind });
                let sent = false;
                try {
                    sent = post('media:convert|' + JSON.stringify({ id, kind }), [file]);
                } catch (error) {
                    clearTimeout(timer);
                    pending.delete(id);
                    reject(error);
                    return;
                }
                if (!sent) {
                    clearTimeout(timer);
                    pending.delete(id);
                    reject(new Error('The local media host is unavailable.'));
                }
            });
        },

        cancelLocalMedia(id) {
            if (typeof id !== 'string' || !/^[0-9]{1,20}$/.test(id)) return;
            if (pending.has(id)) abortPending(id, true);
            else post('media:cancel|' + id);
        },

        cancelAllLocalMedia() {
            Array.from(pending.keys()).forEach((id) => abortPending(id, true));
        },

        exportPresets(presets) {
            if (!Array.isArray(presets) || presets.length > 500) {
                throw new TypeError('Preset export must be an array of no more than 500 user presets.');
            }
            const json = JSON.stringify({
                format: 'signal-lab-presets',
                version: 1,
                presets
            });
            if (new TextEncoder().encode(json).length > 2 * 1024 * 1024) {
                throw new RangeError('The preset export exceeds the 2 MB limit.');
            }
            return post('presets:export|' + json);
        },

        log(code) {
            if (typeof code !== 'string' || !/^[a-z0-9][a-z0-9:._-]{0,63}$/.test(code)) return;
            post('log|' + code);
        }
    });
})();

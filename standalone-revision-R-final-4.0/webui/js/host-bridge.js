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

    let displayRefreshHz = 0;
    let displayRates = [];
    const refreshListeners = [];

    // "<window display Hz>[,<other display Hz>...]": at most eight distinct integer rates.
    function onDisplayRefresh(text) {
        if (!/^[0-9]{2,3}(,[0-9]{2,3}){0,7}$/.test(text)) return;
        const rates = text.split(',').map(Number);
        if (rates.some((hz) => hz < 20 || hz > 500) || new Set(rates).size !== rates.length) return;
        displayRefreshHz = rates[0];
        displayRates = rates;
        refreshListeners.forEach((listener) => {
            try { listener(rates[0], rates.slice()); } catch (_) {}
        });
    }

    // At most one freeze frame is in flight; the host replies once it holds the picture.
    let freezeRequest = null;

    function onFreezeCaptured(text) {
        if (!freezeRequest || text.length > 1024) return;
        let result;
        try {
            result = JSON.parse(text);
        } catch (_) {
            return;
        }
        if (!result || result.id !== freezeRequest.id) return;
        const request = freezeRequest;
        freezeRequest = null;
        clearTimeout(request.timer);
        if (result.ok === true) {
            request.resolve();
        } else {
            request.reject(new Error(typeof result.error === 'string' && result.error
                ? result.error.slice(0, 300)
                : 'The frame could not be captured.'));
        }
    }

    function onHostMessage(event) {
        if (typeof event.data !== 'string' || event.data.length > 2200000) return;
        const divider = event.data.indexOf('|');
        if (/^window:state\|(window|full),(on|off)$/.test(event.data)) {
            const [mode, shield] = event.data.slice('window:state|'.length).split(',');
            document.body.classList.toggle('native-fullscreen', mode === 'full');
            document.getElementById('windowShield').textContent = 'SHIELD: ' + shield.toUpperCase();
            return;
        }
        if (divider === 'display:refresh'.length && event.data.slice(0, divider) === 'display:refresh') {
            onDisplayRefresh(event.data.slice(divider + 1));
            return;
        }
        if (divider === 'freeze:captured'.length && event.data.slice(0, divider) === 'freeze:captured') {
            onFreezeCaptured(event.data.slice(divider + 1));
            return;
        }
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
    if (isNativeHost && typeof document !== 'undefined') {
        document.getElementById('windowControls').hidden = false;
        document.getElementById('windowResize').hidden = false;
        document.querySelectorAll('[data-window-command]').forEach((button) => {
            button.addEventListener('click', () => post('window:command|' + button.dataset.windowCommand));
        });
        document.querySelectorAll('[data-resize]').forEach((edge) => {
            edge.addEventListener('pointerdown', (event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                post('window:command|resize-' + edge.dataset.resize);
            });
        });
    }

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

        // Asks the host to capture the rendered page. The host saves the PNG through its own
        // Save dialog, so no image data ever comes back into the page.
        captureFreezeFrame() {
            if (!isNativeHost) return Promise.reject(new Error('Freeze Frame needs the Glitch Player app host.'));
            if (freezeRequest) return Promise.reject(new Error('A freeze frame is already being captured.'));
            const id = String(++nextId);
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    if (freezeRequest && freezeRequest.id === id) freezeRequest = null;
                    reject(new Error('The freeze frame request timed out.'));
                }, 10000);
                freezeRequest = { id, resolve, reject, timer };
                let sent = false;
                try {
                    sent = post('freeze:capture|' + id);
                } catch (error) {
                    clearTimeout(timer);
                    freezeRequest = null;
                    reject(error);
                    return;
                }
                if (!sent) {
                    clearTimeout(timer);
                    freezeRequest = null;
                    reject(new Error('The local app host is unavailable.'));
                }
            });
        },

        log(code) {
            if (typeof code !== 'string' || !/^[a-z0-9][a-z0-9:._-]{0,63}$/.test(code)) return;
            post('log|' + code);
        },

        onDisplayRefresh(listener) {
            if (typeof listener !== 'function' || refreshListeners.length >= 4) return;
            refreshListeners.push(listener);
            if (displayRefreshHz) listener(displayRefreshHz, displayRates.slice());
        }
    });
})();

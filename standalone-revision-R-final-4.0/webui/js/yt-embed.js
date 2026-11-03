'use strict';
(() => {
    const acceptedOrigins = new Set([
        'https://www.youtube-nocookie.com',
        'https://www.youtube.com',
        'https://youtube.com'
    ]);
    const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
    const playlistPattern = /^[A-Za-z0-9_-]{1,128}$/;
    const PlayerState = Object.freeze({
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
    });

    let nextPlayerId = 0;
    const players = new Map();

    function validVideoId(value) {
        return typeof value === 'string' && videoIdPattern.test(value);
    }

    function validPlaylist(value) {
        return typeof value === 'string' && playlistPattern.test(value);
    }

    function handleMessage(event) {
        if (!acceptedOrigins.has(event.origin) || !event.source) return;
        if (typeof event.data !== 'string' || event.data.length > 65536) return;
        let message;
        try {
            message = JSON.parse(event.data);
        } catch (_) {
            return;
        }
        if (!message || typeof message !== 'object' || Array.isArray(message)) return;
        const player = players.get(String(message.id));
        if (!player || event.source !== player.iframe.contentWindow) return;
        player.receive(message);
    }

    window.addEventListener('message', handleMessage);

    function Player(elementOrId, options) {
        if (!(this instanceof Player)) return new Player(elementOrId, options);
        options = options && typeof options === 'object' ? options : {};
        const mount = typeof elementOrId === 'string' ?
            document.getElementById(elementOrId) : elementOrId;
        if (!(mount instanceof Element)) throw new TypeError('YouTube player mount element was not found.');
        const initialVideoId = options.videoId || '';
        if (initialVideoId && !validVideoId(initialVideoId)) throw new TypeError('Invalid YouTube video ID.');

        this.id = 'gpr4_' + (++nextPlayerId);
        this.mount = mount;
        this.options = options;
        this.events = options.events && typeof options.events === 'object' ? options.events : {};
        this.iframe = document.createElement('iframe');
        this.iframe.title = 'YouTube video player';
        this.iframe.width = String(options.width || '100%');
        this.iframe.height = String(options.height || '100%');
        this.iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        this.iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
        this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
        this.iframe.setAttribute('allowfullscreen', '');
        this.iframe.setAttribute('loading', 'eager');
        this.iframe.setAttribute('frameborder', '0');
        this.ready = false;
        this.destroyed = false;
        this.state = PlayerState.UNSTARTED;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 100;
        this.videoData = {};
        this.loop = false;
        this.pendingCommands = [];

        players.set(this.id, this);
        this.configureSource(initialVideoId, options.playerVars || {});
        mount.replaceChildren(this.iframe);
        this.pingTimer = window.setInterval(() => this.ping(), 250);
        this.ping();
    }

    Player.prototype.configureSource = function (videoId, vars) {
        if (videoId && !validVideoId(videoId)) throw new TypeError('Invalid YouTube video ID.');
        const params = new URLSearchParams();
        params.set('enablejsapi', '1');
        params.set('origin', location.origin);
        params.set('controls', String(vars.controls === 1 ? 1 : 0));
        params.set('rel', String(vars.rel === 1 ? 1 : 0));
        params.set('playsinline', String(vars.playsinline === 0 ? 0 : 1));
        params.set('autoplay', String(vars.autoplay === 0 ? 0 : 1));
        params.set('fs', '0');
        params.set('iv_load_policy', '3');
        params.set('widget_referrer', location.origin);
        if (vars.loop === 1 && videoId) {
            params.set('loop', '1');
            params.set('playlist', videoId);
            this.loop = true;
        }
        if (vars.listType === 'playlist' && validPlaylist(vars.list)) {
            params.set('listType', 'playlist');
            params.set('list', vars.list);
        }
        this.videoData = videoId ? { video_id: videoId } : {};
        this.iframe.src = 'https://www.youtube-nocookie.com/embed/' +
            (videoId || '') + '?' + params.toString();
    };

    Player.prototype.ping = function () {
        if (this.destroyed || !this.iframe.contentWindow) return;
        this.postToFrame({
            event: 'listening',
            id: this.id,
            channel: 'widget'
        });
    };

    Player.prototype.postToFrame = function (message) {
        if (this.destroyed || !this.iframe.contentWindow) return;
        const data = JSON.stringify(message);
        for (const origin of acceptedOrigins) {
            try { this.iframe.contentWindow.postMessage(data, origin); }
            catch (_) { /* The frame may not yet be at this origin. */ }
        }
    };

    Player.prototype.receive = function (message) {
        const info = message.info && typeof message.info === 'object' && !Array.isArray(message.info) ?
            message.info : null;
        if (message.event === 'onReady' || message.event === 'initialDelivery') {
            this.markReady();
        } else if (message.event === 'infoDelivery' && info) {
            this.markReady();
            if (Number.isFinite(info.currentTime) && info.currentTime >= 0) this.currentTime = info.currentTime;
            if (Number.isFinite(info.duration) && info.duration >= 0) this.duration = info.duration;
            if (Number.isInteger(info.playerState) && Object.values(PlayerState).includes(info.playerState)) {
                this.setState(info.playerState);
            }
            if (info.videoData && typeof info.videoData === 'object' && !Array.isArray(info.videoData)) {
                const videoId = info.videoData.video_id;
                if (!videoId || validVideoId(videoId)) {
                    this.videoData = {
                        video_id: videoId || '',
                        title: typeof info.videoData.title === 'string' ? info.videoData.title.slice(0, 512) : '',
                        author: typeof info.videoData.author === 'string' ? info.videoData.author.slice(0, 256) : ''
                    };
                }
            }
        } else if (message.event === 'onStateChange' && Number.isInteger(message.info)) {
            this.setState(message.info);
        } else if (message.event === 'onError') {
            const code = Number.isInteger(message.info) ? message.info : 5;
            this.fire('onError', { target: this, data: code });
        }
    };

    Player.prototype.markReady = function () {
        if (this.ready || this.destroyed) return;
        this.ready = true;
        window.clearInterval(this.pingTimer);
        const queued = this.pendingCommands.splice(0);
        for (const command of queued) this.send(command.func, command.args);
        this.fire('onReady', { target: this });
    };

    Player.prototype.setState = function (state) {
        if (!Object.values(PlayerState).includes(state)) return;
        if (this.state === state) return;
        this.state = state;
        this.fire('onStateChange', { target: this, data: state });
    };

    Player.prototype.fire = function (name, event) {
        const callback = this.events[name];
        if (typeof callback === 'function') {
            try { callback(event); } catch (error) { console.error('YouTube event callback failed:', error); }
        }
    };

    Player.prototype.send = function (func, args) {
        if (this.destroyed) return;
        if (!this.ready) {
            this.pendingCommands.push({ func, args: Array.isArray(args) ? args : [] });
            return;
        }
        this.postToFrame({
            event: 'command',
            func,
            args: Array.isArray(args) ? args : [],
            id: this.id,
            channel: 'widget'
        });
    };

    Player.prototype.unMute = function () { this.send('unMute', []); };
    Player.prototype.mute = function () { this.send('mute', []); };
    Player.prototype.setVolume = function (volume) {
        if (!Number.isFinite(volume)) return;
        this.volume = Math.max(0, Math.min(100, Math.round(volume)));
        this.send('setVolume', [this.volume]);
    };
    Player.prototype.playVideo = function () { this.send('playVideo', []); };
    Player.prototype.pauseVideo = function () { this.send('pauseVideo', []); };
    Player.prototype.stopVideo = function () { this.send('stopVideo', []); };
    Player.prototype.seekTo = function (seconds, allowSeekAhead) {
        if (!Number.isFinite(seconds) || seconds < 0) return;
        this.send('seekTo', [seconds, allowSeekAhead !== false]);
    };
    Player.prototype.setLoop = function (loop) {
        this.loop = !!loop;
        this.send('setLoop', [this.loop]);
    };
    Player.prototype.loadVideoById = function (value) {
        const id = typeof value === 'string' ? value : value && value.videoId;
        if (!validVideoId(id)) return;
        this.videoData = { video_id: id };
        this.send('loadVideoById', [typeof value === 'string' ? id : value]);
    };
    Player.prototype.loadPlaylist = function (value) {
        if (Array.isArray(value)) {
            const ids = value.filter(validVideoId).slice(0, 50);
            if (ids.length !== value.length || ids.length === 0) return;
            this.send('loadPlaylist', [ids]);
            return;
        }
        if (!value || typeof value !== 'object' || !validPlaylist(value.list)) return;
        const request = {
            list: value.list,
            listType: value.listType === 'user_uploads' ? 'user_uploads' : 'playlist',
            index: Number.isInteger(value.index) && value.index >= 0 ? value.index : 0
        };
        if (value.startSeconds != null && Number.isFinite(value.startSeconds) && value.startSeconds >= 0)
            request.startSeconds = value.startSeconds;
        this.send('loadPlaylist', [request]);
    };
    Player.prototype.getVideoData = function () { return { ...this.videoData }; };
    Player.prototype.getDuration = function () { return this.duration; };
    Player.prototype.getCurrentTime = function () { return this.currentTime; };
    Player.prototype.getPlayerState = function () { return this.state; };
    Player.prototype.getVideoUrl = function () {
        const id = this.videoData.video_id;
        return validVideoId(id) ? 'https://www.youtube.com/watch?v=' + encodeURIComponent(id) : '';
    };
    Player.prototype.getIframe = function () { return this.iframe; };
    Player.prototype.destroy = function () {
        if (this.destroyed) return;
        this.destroyed = true;
        window.clearInterval(this.pingTimer);
        this.pendingCommands.length = 0;
        players.delete(this.id);
        this.iframe.remove();
    };

    window.YT = Object.freeze({ Player, PlayerState });
})();

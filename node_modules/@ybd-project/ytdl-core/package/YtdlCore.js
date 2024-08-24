"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.cache = exports.createProxyAgent = exports.createAgent = exports.getVideoID = exports.getURLVideoID = exports.validateURL = exports.validateID = exports.filterFormats = exports.chooseFormat = exports.getInfo = exports.getBasicInfo = void 0;
exports.downloadFromInfo = downloadFromInfo;
const stream_1 = require("stream");
const miniget_1 = __importDefault(require("miniget"));
const m3u8stream_1 = __importStar(require("m3u8stream"));
const info_1 = require("./info");
Object.defineProperty(exports, "getBasicInfo", { enumerable: true, get: function () { return info_1.getBasicInfo; } });
Object.defineProperty(exports, "getInfo", { enumerable: true, get: function () { return info_1.getInfo; } });
const utils_1 = __importDefault(require("./utils"));
const format_utils_1 = require("./format-utils");
Object.defineProperty(exports, "chooseFormat", { enumerable: true, get: function () { return format_utils_1.chooseFormat; } });
Object.defineProperty(exports, "filterFormats", { enumerable: true, get: function () { return format_utils_1.filterFormats; } });
const url_utils_1 = require("./url-utils");
Object.defineProperty(exports, "validateID", { enumerable: true, get: function () { return url_utils_1.validateID; } });
Object.defineProperty(exports, "validateURL", { enumerable: true, get: function () { return url_utils_1.validateURL; } });
Object.defineProperty(exports, "getURLVideoID", { enumerable: true, get: function () { return url_utils_1.getURLVideoID; } });
Object.defineProperty(exports, "getVideoID", { enumerable: true, get: function () { return url_utils_1.getVideoID; } });
const agent_1 = require("./agent");
Object.defineProperty(exports, "createAgent", { enumerable: true, get: function () { return agent_1.createAgent; } });
Object.defineProperty(exports, "createProxyAgent", { enumerable: true, get: function () { return agent_1.createProxyAgent; } });
const package_json_1 = __importDefault(require("../package.json"));
/* Private Constants */
const STREAM_EVENTS = ['abort', 'request', 'response', 'error', 'redirect', 'retry', 'reconnect'];
/* Private Functions */
function createStream(options = {}) {
    const STREAM = new stream_1.PassThrough({
        highWaterMark: (options && options.highWaterMark) || 1024 * 512,
    });
    STREAM._destroy = () => {
        STREAM.destroyed = true;
    };
    return STREAM;
}
function pipeAndSetEvents(req, stream, end) {
    // Forward events from the request to the stream.
    STREAM_EVENTS.forEach((event) => {
        req.prependListener(event, stream.emit.bind(stream, event));
    });
    req.pipe(stream, { end });
}
function downloadFromInfoCallback(stream, info, options) {
    options ??= {};
    options.requestOptions ??= {};
    if (!info.formats.length) {
        stream.emit('error', Error('This video is unavailable'));
        return;
    }
    let format;
    try {
        format = (0, format_utils_1.chooseFormat)(info.formats, options);
    }
    catch (e) {
        stream.emit('error', e);
        return;
    }
    stream.emit('info', info, format);
    if (stream.destroyed) {
        return;
    }
    let contentLength, downloaded = 0;
    const ondata = (chunk) => {
        downloaded += chunk.length;
        stream.emit('progress', chunk.length, downloaded, contentLength);
    };
    utils_1.default.applyDefaultHeaders(options);
    if (options.IPv6Block) {
        options.requestOptions = Object.assign({}, options.requestOptions, {
            localAddress: utils_1.default.getRandomIPv6(options.IPv6Block),
        });
    }
    if (options.agent) {
        if (options.agent.jar) {
            utils_1.default.setPropInsensitive(options.requestOptions.headers, 'cookie', options.agent.jar.getCookieStringSync('https://www.youtube.com'));
        }
        if (options.agent.localAddress) {
            options.requestOptions.localAddress = options.agent.localAddress;
        }
    }
    // Download the file in chunks, in this case the default is 10MB,
    // anything over this will cause youtube to throttle the download
    const DL_CHUNK_SIZE = typeof options.dlChunkSize === 'number' ? options.dlChunkSize : 1024 * 1024 * 10;
    let req;
    let shouldEnd = true;
    if (format.isHLS || format.isDashMPD) {
        req = (0, m3u8stream_1.default)(format.url, {
            chunkReadahead: info.live_chunk_readahead ? +info.live_chunk_readahead : undefined,
            begin: options.begin || (format.isLive ? Date.now() : undefined),
            liveBuffer: options.liveBuffer,
            requestOptions: options.requestOptions,
            parser: format.isDashMPD ? 'dash-mpd' : 'm3u8',
            id: format.itag.toString(),
        });
        req.on('progress', (segment, totalSegments) => {
            stream.emit('progress', segment.size, segment.num, totalSegments);
        });
        pipeAndSetEvents(req, stream, shouldEnd);
    }
    else {
        const requestOptions = Object.assign({}, options.requestOptions, {
            maxReconnects: 6,
            maxRetries: 3,
            backoff: { inc: 500, max: 10000 },
        });
        let shouldBeChunked = DL_CHUNK_SIZE !== 0 && (!format.hasAudio || !format.hasVideo);
        if (shouldBeChunked) {
            let start = (options.range && options.range.start) || 0;
            let end = start + DL_CHUNK_SIZE;
            const rangeEnd = options.range && options.range.end;
            contentLength = options.range ? (rangeEnd ? rangeEnd + 1 : parseInt(format.contentLength)) - start : parseInt(format.contentLength);
            const getNextChunk = () => {
                if (stream.destroyed)
                    return;
                if (!rangeEnd && end >= contentLength)
                    end = 0;
                if (rangeEnd && end > rangeEnd)
                    end = rangeEnd;
                shouldEnd = !end || end === rangeEnd;
                requestOptions.headers = Object.assign({}, requestOptions.headers, {
                    Range: `bytes=${start}-${end || ''}`,
                });
                req = (0, miniget_1.default)(format.url, requestOptions);
                req.on('data', ondata);
                req.on('end', () => {
                    if (stream.destroyed)
                        return;
                    if (end && end !== rangeEnd) {
                        start = end + 1;
                        end += DL_CHUNK_SIZE;
                        getNextChunk();
                    }
                });
                pipeAndSetEvents(req, stream, shouldEnd);
            };
            getNextChunk();
        }
        else {
            // Audio only and video only formats don't support begin
            if (options.begin) {
                format.url += `&begin=${(0, m3u8stream_1.parseTimestamp)(options.begin)}`;
            }
            if (options.range && (options.range.start || options.range.end)) {
                requestOptions.headers = Object.assign({}, requestOptions.headers, {
                    Range: `bytes=${options.range.start || '0'}-${options.range.end || ''}`,
                });
            }
            req = (0, miniget_1.default)(format.url, requestOptions);
            req.on('response', (res) => {
                if (stream.destroyed)
                    return;
                contentLength = contentLength || parseInt(res.headers['content-length']);
            });
            req.on('data', ondata);
            pipeAndSetEvents(req, stream, shouldEnd);
        }
    }
    stream._destroy = () => {
        stream.destroyed = true;
        if (req) {
            req.destroy();
            req.end();
        }
    };
}
/* Public Constants */
const cache = {
    info: info_1.CACHE,
    watch: info_1.WATCH_PAGE_CACHE,
}, version = package_json_1.default.version;
exports.cache = cache;
exports.version = version;
/* Public Functions */
const ytdl = (link, options = {}) => {
    const STREAM = createStream(options);
    (0, info_1.getInfo)(link, options).then((info) => {
        downloadFromInfoCallback(STREAM, info, options);
    }, STREAM.emit.bind(STREAM, 'error'));
    return STREAM;
};
/** Can be used to download video after its `info` is gotten through
 * `ytdl.getInfo()`. In case the user might want to look at the
 * `info` object before deciding to download. */
function downloadFromInfo(info, options = {}) {
    const STREAM = createStream(options);
    if (!info.full) {
        throw new Error('Cannot use `ytdl.downloadFromInfo()` when called with info from `ytdl.getBasicInfo()`');
    }
    setImmediate(() => {
        downloadFromInfoCallback(STREAM, info, options);
    });
    return STREAM;
}
ytdl.downloadFromInfo = downloadFromInfo;
ytdl.getBasicInfo = info_1.getBasicInfo;
ytdl.getInfo = info_1.getInfo;
ytdl.chooseFormat = format_utils_1.chooseFormat;
ytdl.filterFormats = format_utils_1.filterFormats;
ytdl.validateID = url_utils_1.validateID;
ytdl.validateURL = url_utils_1.validateURL;
ytdl.getURLVideoID = url_utils_1.getURLVideoID;
ytdl.getVideoID = url_utils_1.getVideoID;
ytdl.createAgent = agent_1.createAgent;
ytdl.createProxyAgent = agent_1.createProxyAgent;
ytdl.cache = cache;
ytdl.version = version;
module.exports = ytdl;
exports.default = ytdl;
//# sourceMappingURL=YtdlCore.js.map
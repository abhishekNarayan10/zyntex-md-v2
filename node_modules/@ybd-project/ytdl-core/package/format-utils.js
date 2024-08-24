"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortFormats = sortFormats;
exports.filterFormats = filterFormats;
exports.chooseFormat = chooseFormat;
exports.addFormatMeta = addFormatMeta;
const utils_1 = __importDefault(require("./utils"));
const formats_1 = __importDefault(require("./meta/formats"));
/* Private Constants */
// Use these to help sort formats, higher index is better.
const AUDIO_ENCODING_RANKS = ['mp4a', 'mp3', 'vorbis', 'aac', 'opus', 'flac'], VIDEO_ENCODING_RANKS = ['mp4v', 'avc1', 'Sorenson H.283', 'MPEG-4 Visual', 'VP8', 'VP9', 'H.264'];
/* Private Functions */
function getEncodingRank(ranks, format) {
    return ranks.findIndex((enc) => format.codecs && format.codecs.includes(enc));
}
function getVideoBitrate(format) {
    return format.bitrate || 0;
}
function getVideoEncodingRank(format) {
    return getEncodingRank(VIDEO_ENCODING_RANKS, format);
}
function getAudioBitrate(format) {
    return format.audioBitrate || 0;
}
function getAudioEncodingRank(format) {
    return getEncodingRank(AUDIO_ENCODING_RANKS, format);
}
/** Sort formats by a list of functions. */
function sortFormatsBy(a, b, sortBy) {
    let res = 0;
    for (const FUNC of sortBy) {
        res = FUNC(b) - FUNC(a);
        if (res !== 0) {
            break;
        }
    }
    return res;
}
function getQualityLabel(format) {
    return parseInt(format.qualityLabel) || 0;
}
function sortFormatsByVideo(a, b) {
    return sortFormatsBy(a, b, [getQualityLabel, getVideoBitrate, getVideoEncodingRank]);
}
function sortFormatsByAudio(a, b) {
    return sortFormatsBy(a, b, [getAudioBitrate, getAudioEncodingRank]);
}
/** Gets a format based on quality or array of quality's */
function getFormatByQuality(quality, formats) {
    const getFormat = (itag) => formats.find((format) => `${format.itag}` === `${itag}`) || null;
    if (Array.isArray(quality)) {
        const FOUND = quality.find((itag) => getFormat(itag));
        if (!FOUND) {
            return null;
        }
        return getFormat(FOUND) || null;
    }
    else {
        return getFormat(quality || '') || null;
    }
}
/* Public Functions */
function sortFormats(a, b) {
    return sortFormatsBy(a, b, [
        // Formats with both video and audio are ranked highest.
        (format) => +!!format.isHLS,
        (format) => +!!format.isDashMPD,
        (format) => +(parseInt(format.contentLength) > 0),
        (format) => +(format.hasVideo && format.hasAudio),
        (format) => +format.hasVideo,
        (format) => parseInt(format.qualityLabel) || 0,
        getVideoBitrate,
        getAudioBitrate,
        getVideoEncodingRank,
        getAudioEncodingRank,
    ]);
}
function filterFormats(formats, filter) {
    let fn;
    switch (filter) {
        case 'videoandaudio':
        case 'audioandvideo': {
            fn = (format) => format.hasVideo && format.hasAudio;
            break;
        }
        case 'video': {
            fn = (format) => format.hasVideo;
            break;
        }
        case 'videoonly': {
            fn = (format) => format.hasVideo && !format.hasAudio;
            break;
        }
        case 'audio': {
            fn = (format) => format.hasAudio;
            break;
        }
        case 'audioonly': {
            fn = (format) => format.hasAudio && !format.hasVideo;
            break;
        }
        default: {
            if (typeof filter === 'function') {
                fn = filter;
            }
            else {
                throw new TypeError(`Given filter (${filter}) is not supported`);
            }
        }
    }
    return formats.filter((format) => !!format.url && fn(format));
}
function chooseFormat(formats, options) {
    if (typeof options.format === 'object') {
        if (!options.format.url) {
            throw new Error('Invalid format given, did you use `ytdl.getInfo()`?');
        }
        return options.format;
    }
    if (options.filter) {
        formats = filterFormats(formats, options.filter);
    }
    if (formats.some((format) => format.isHLS)) {
        formats = formats.filter((format) => format.isHLS || !format.isLive);
    }
    const QUALITY = options.quality || 'highest';
    let format;
    switch (QUALITY) {
        case 'highest': {
            format = formats[0];
            break;
        }
        case 'lowest': {
            format = formats[formats.length - 1];
            break;
        }
        case 'highestaudio': {
            formats = filterFormats(formats, 'audio');
            formats.sort(sortFormatsByAudio);
            const BEST_AUDIO_FORMAT = formats[0];
            formats = formats.filter((format) => sortFormatsByAudio(BEST_AUDIO_FORMAT, format) === 0);
            const WORST_VIDEO_QUALITY = formats.map((format) => parseInt(format.qualityLabel) || 0).sort((a, b) => a - b)[0];
            format = formats.find((format) => (parseInt(format.qualityLabel) || 0) === WORST_VIDEO_QUALITY);
            break;
        }
        case 'lowestaudio': {
            formats = filterFormats(formats, 'audio');
            formats.sort(sortFormatsByAudio);
            format = formats[formats.length - 1];
            break;
        }
        case 'highestvideo': {
            formats = filterFormats(formats, 'video');
            formats.sort(sortFormatsByVideo);
            const BEST_VIDEO_FORMAT = formats[0];
            formats = formats.filter((format) => sortFormatsByVideo(BEST_VIDEO_FORMAT, format) === 0);
            const WORST_VIDEO_QUALITY = formats.map((format) => format.audioBitrate || 0).sort((a, b) => a - b)[0];
            format = formats.find((format) => (format.audioBitrate || 0) === WORST_VIDEO_QUALITY);
            break;
        }
        case 'lowestvideo': {
            formats = filterFormats(formats, 'video');
            formats.sort(sortFormatsByVideo);
            format = formats[formats.length - 1];
            break;
        }
        default: {
            format = getFormatByQuality(QUALITY, formats);
            break;
        }
    }
    if (!format) {
        throw new Error(`No such format found: ${QUALITY}`);
    }
    return format;
}
function addFormatMeta(format) {
    format = Object.assign({}, formats_1.default[format.itag] || {}, format);
    format.hasVideo = !!format.qualityLabel;
    format.hasAudio = !!format.audioBitrate;
    const CONTAINER = format.mimeType && format.mimeType.split(';')[0].split('/')[1];
    format.container = CONTAINER || null;
    const CODECS = format.mimeType && utils_1.default.between(format.mimeType, 'codecs="', '"');
    format.codecs = CODECS || null;
    const VIDEO_CODEC = format.hasVideo && format.codecs && format.codecs.split(', ')[0];
    format.videoCodec = VIDEO_CODEC || null;
    const AUDIO_CODEC = format.hasAudio && format.codecs && format.codecs.split(', ')[0];
    format.audioCodec = AUDIO_CODEC || null;
    format.isLive = /\bsource[/=]yt_live_broadcast\b/.test(format.url);
    format.isHLS = /\/manifest\/hls_(variant|playlist)\//.test(format.url);
    format.isDashMPD = /\/manifest\/dash\//.test(format.url);
    return format;
}
exports.default = { sortFormats, filterFormats, chooseFormat, addFormatMeta };
//# sourceMappingURL=format-utils.js.map
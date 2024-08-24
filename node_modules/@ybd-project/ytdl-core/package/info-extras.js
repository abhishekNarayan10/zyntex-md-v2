"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMedia = getMedia;
exports.getAuthor = getAuthor;
exports.getRelatedVideos = getRelatedVideos;
exports.getLikes = getLikes;
exports.cleanVideoDetails = cleanVideoDetails;
exports.getStoryboards = getStoryboards;
exports.getChapters = getChapters;
const querystring_1 = __importDefault(require("querystring"));
const m3u8stream_1 = require("m3u8stream");
const utils_1 = __importDefault(require("./utils"));
/* Private Constants */
const BASE_URL = 'https://www.youtube.com/watch?v=', TITLE_TO_CATEGORY = {
    song: { name: 'Music', url: 'https://music.youtube.com/' },
};
/* Private Functions */
function getText(obj) {
    if (obj && obj.runs) {
        return obj.runs[0].text;
    }
    else if (obj) {
        return obj.simpleText;
    }
    return null;
}
function isVerified(badges) {
    const IS_FOUND_VERIFIED_BADGE = !!badges.find((b) => b.metadataBadgeRenderer.tooltip === 'Verified');
    return !!badges && IS_FOUND_VERIFIED_BADGE;
}
function parseRelatedVideo(details, rvsParams) {
    if (!details) {
        return null;
    }
    try {
        const RVS_DETAILS = rvsParams.find((elem) => elem.id === details.videoId);
        let viewCount = getText(details.viewCountText), shortViewCount = getText(details.shortViewCountText);
        if (!/^\d/.test(shortViewCount)) {
            shortViewCount = (RVS_DETAILS && RVS_DETAILS.short_view_count_text) || '';
        }
        viewCount = (/^\d/.test(viewCount) ? viewCount : shortViewCount).split(' ')[0];
        const BROWSE_ENDPOINT = details.shortBylineText.runs[0].navigationEndpoint.browseEndpoint, CHANNEL_ID = BROWSE_ENDPOINT.browseId, NAME = getText(details.shortBylineText), USER = (BROWSE_ENDPOINT.canonicalBaseUrl || '').split('/').slice(-1)[0], VIDEO = {
            id: details.videoId,
            title: getText(details.title),
            published: getText(details.publishedTimeText),
            author: {
                id: CHANNEL_ID,
                name: NAME,
                user: USER,
                channel_url: `https://www.youtube.com/channel/${CHANNEL_ID}`,
                user_url: `https://www.youtube.com/user/${USER}`,
                thumbnails: details.channelThumbnail.thumbnails.map((thumbnail) => {
                    thumbnail.url = new URL(thumbnail.url, BASE_URL).toString();
                    return thumbnail;
                }),
                verified: isVerified(details.ownerBadges || []),
            },
            short_view_count_text: shortViewCount.split(' ')[0],
            view_count: viewCount.replace(/,/g, ''),
            length_seconds: details.lengthText ? Math.floor((0, m3u8stream_1.parseTimestamp)(getText(details.lengthText)) / 1000) : rvsParams && rvsParams.length_seconds,
            thumbnails: details.thumbnail.thumbnails || [],
            richThumbnails: details.richThumbnail ? details.richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails : [],
            isLive: !!(details.badges && details.badges.find((b) => b.metadataBadgeRenderer.label === 'LIVE NOW')),
        };
        utils_1.default.deprecate(VIDEO, 'author_thumbnail', VIDEO.author.thumbnails[0].url, 'relatedVideo.author_thumbnail', 'relatedVideo.author.thumbnails[0].url');
        utils_1.default.deprecate(VIDEO, 'video_thumbnail', VIDEO.thumbnails[0].url, 'relatedVideo.video_thumbnail', 'relatedVideo.thumbnails[0].url');
        return VIDEO;
    }
    catch (err) {
        return null;
    }
}
/* Public Functions */
/** Get video media. [Note]: Media cannot be obtained for several reasons. */
function getMedia(info) {
    let media = {
        category: '',
        category_url: '',
        thumbnails: [],
    }, results = [];
    try {
        results = info.response.contents.twoColumnWatchNextResults.results.results.contents;
    }
    catch (err) { }
    let videoSecondaryInfoRenderer = results.find((v) => v.videoSecondaryInfoRenderer);
    if (!videoSecondaryInfoRenderer) {
        return null;
    }
    try {
        const METADATA_ROWS = (videoSecondaryInfoRenderer.metadataRowContainer || videoSecondaryInfoRenderer.videoSecondaryInfoRenderer.metadataRowContainer).metadataRowContainerRenderer.rows;
        for (const ROW of METADATA_ROWS) {
            const ROW_RENDERER = ROW.metadataRowRenderer, RICH_ROW_RENDERER = ROW.richMetadataRowRenderer;
            if (ROW_RENDERER) {
                const TITLE = getText(ROW.metadataRowRenderer.title).toLowerCase(), CONTENTS = ROW_RENDERER.contents[0];
                media[TITLE] = getText(CONTENTS);
                const RUNS = CONTENTS.runs;
                if (RUNS && RUNS[0].navigationEndpoint) {
                    media[`${TITLE}_url`] = new URL(RUNS[0].navigationEndpoint.commandMetadata.webCommandMetadata.url, BASE_URL).toString();
                }
                if (TITLE in TITLE_TO_CATEGORY) {
                    media.category = TITLE_TO_CATEGORY[TITLE].name;
                    media.category_url = TITLE_TO_CATEGORY[TITLE].url;
                }
            }
            else if (RICH_ROW_RENDERER) {
                const CONTENTS = RICH_ROW_RENDERER.contents, BOX_ART = CONTENTS.filter((meta) => meta.richMetadataRenderer.style === 'RICH_METADATA_RENDERER_STYLE_BOX_ART');
                for (const { richMetadataRenderer } of BOX_ART) {
                    const META = richMetadataRenderer;
                    media.year = getText(META.subtitle);
                    const TYPE = getText(META.callToAction).split(' ')[1];
                    media[TYPE] = getText(META.title);
                    media[`${TYPE}_url`] = new URL(META.endpoint.commandMetadata.webCommandMetadata.url, BASE_URL).toString();
                    media.thumbnails = META.thumbnail.thumbnails;
                }
                const TOPIC = CONTENTS.filter((meta) => meta.richMetadataRenderer.style === 'RICH_METADATA_RENDERER_STYLE_TOPIC');
                for (const { richMetadataRenderer } of TOPIC) {
                    const META = richMetadataRenderer;
                    media.category = getText(META.title);
                    media.category_url = new URL(META.endpoint.commandMetadata.webCommandMetadata.url, BASE_URL).toString();
                }
            }
        }
    }
    catch (err) { }
    return media;
}
function getAuthor(info) {
    let channelName = null, channelId = null, user = null, thumbnails = [], subscriberCount = null, verified = false;
    try {
        const TWO_COLUMN_WATCH_NEXT_RESULTS = info.response.contents.twoColumnWatchNextResults.results.results.contents, SECONDARY_INFO_RENDERER = TWO_COLUMN_WATCH_NEXT_RESULTS.find((v) => v.videoSecondaryInfoRenderer && v.videoSecondaryInfoRenderer.owner && v.videoSecondaryInfoRenderer.owner.videoOwnerRenderer), VIDEO_OWNER_RENDERER = SECONDARY_INFO_RENDERER.videoSecondaryInfoRenderer.owner.videoOwnerRenderer;
        channelName = VIDEO_OWNER_RENDERER.title.runs[0].text || null;
        channelId = VIDEO_OWNER_RENDERER.navigationEndpoint.browseEndpoint.browseId;
        user = (VIDEO_OWNER_RENDERER?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || VIDEO_OWNER_RENDERER.navigationEndpoint.commandMetadata.webCommandMetadata.url).replace('/', '');
        thumbnails = VIDEO_OWNER_RENDERER.thumbnail.thumbnails.map((thumbnail) => {
            thumbnail.url = new URL(thumbnail.url, BASE_URL).toString();
            return thumbnail;
        });
        subscriberCount = utils_1.default.parseAbbreviatedNumber(getText(VIDEO_OWNER_RENDERER.subscriberCountText));
        verified = isVerified(VIDEO_OWNER_RENDERER.badges);
    }
    catch (err) { }
    try {
        const AUTHOR = {
            id: channelId,
            name: channelName,
            user,
            channel_url: channelId ? `https://www.youtube.com/channel/${channelId}` : '',
            external_channel_url: channelId ? `https://www.youtube.com/channel/${channelId}` : '',
            user_url: 'https://www.youtube.com/' + user,
            thumbnails,
            subscriber_count: subscriberCount,
            verified,
        };
        if (thumbnails?.length) {
            utils_1.default.deprecate(AUTHOR, 'avatar', AUTHOR.thumbnails[0]?.url, 'author.thumbnails', 'author.thumbnails[0].url');
        }
        return AUTHOR;
    }
    catch (err) {
        return null;
    }
}
function getRelatedVideos(info) {
    let rvsParams = [], secondaryResults = [];
    try {
        rvsParams = info.response.webWatchNextResponseExtensionData?.relatedVideoArgs.split(',').map((e) => querystring_1.default.parse(e)) || [];
    }
    catch (err) { }
    try {
        secondaryResults = info.response.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results;
    }
    catch (err) { }
    const VIDEOS = [];
    for (const RESULT of secondaryResults) {
        const DETAILS = RESULT.compactVideoRenderer;
        if (DETAILS) {
            const VIDEO = parseRelatedVideo(DETAILS, rvsParams);
            if (VIDEO) {
                VIDEOS.push(VIDEO);
            }
        }
        else {
            const AUTOPLAY = RESULT.compactAutoplayRenderer || RESULT.itemSectionRenderer;
            if (!AUTOPLAY || !Array.isArray(AUTOPLAY.contents)) {
                continue;
            }
            for (const CONTENT of AUTOPLAY.contents) {
                const VIDEO = parseRelatedVideo(CONTENT.compactVideoRenderer, rvsParams);
                if (VIDEO) {
                    VIDEOS.push(VIDEO);
                }
            }
        }
    }
    return VIDEOS;
}
function getLikes(info) {
    try {
        const CONTENTS = info.response.contents.twoColumnWatchNextResults.results.results.contents, VIDEO = CONTENTS.find((r) => r.videoPrimaryInfoRenderer), BUTTONS = VIDEO.videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons, ACCESSIBILITY_TEXT = BUTTONS.find((b) => b.segmentedLikeDislikeButtonViewModel).segmentedLikeDislikeButtonViewModel.likeButtonViewModel.likeButtonViewModel.toggleButtonViewModel.toggleButtonViewModel.defaultButtonViewModel.buttonViewModel.accessibilityText;
        return parseInt(ACCESSIBILITY_TEXT.match(/[\d,.]+/)[0].replace(/\D+/g, ''));
    }
    catch (err) {
        return null;
    }
}
function cleanVideoDetails(videoDetails, microformat) {
    const DETAILS = videoDetails;
    if (DETAILS.thumbnail) {
        DETAILS.thumbnails = DETAILS.thumbnail.thumbnails;
        delete DETAILS.thumbnail;
        utils_1.default.deprecate(DETAILS, 'thumbnail', { thumbnails: DETAILS.thumbnails }, 'DETAILS.thumbnail.thumbnails', 'DETAILS.thumbnails');
    }
    const DESCRIPTION = DETAILS.shortDescription || getText(DETAILS.description);
    if (DESCRIPTION) {
        DETAILS.description = DESCRIPTION;
        delete DETAILS.shortDescription;
        utils_1.default.deprecate(DETAILS, 'shortDescription', DETAILS.description, 'DETAILS.shortDescription', 'DETAILS.description');
    }
    if (microformat) {
        // Use more reliable `lengthSeconds` from `playerMicroformatRenderer`.
        DETAILS.lengthSeconds = microformat.playerMicroformatRenderer.lengthSeconds || videoDetails.lengthSeconds;
    }
    return DETAILS;
}
function getStoryboards(info) {
    if (!info) {
        return [];
    }
    const PARTS = info.storyboards && info.storyboards.playerStoryboardSpecRenderer && info.storyboards.playerStoryboardSpecRenderer.spec && info.storyboards.playerStoryboardSpecRenderer.spec.split('|');
    if (!PARTS) {
        return [];
    }
    const _URL = new URL(PARTS.shift() || '');
    return PARTS.map((part, i) => {
        let [thumbnailWidth, thumbnailHeight, thumbnailCount, columns, rows, interval, nameReplacement, sigh] = part.split('#');
        _URL.searchParams.set('sigh', sigh);
        thumbnailCount = parseInt(thumbnailCount, 10);
        columns = parseInt(columns, 10);
        rows = parseInt(rows, 10);
        const STORYBOARD_COUNT = Math.ceil(thumbnailCount / (columns * rows));
        return {
            templateUrl: _URL.toString().replace('$L', i.toString()).replace('$N', nameReplacement),
            thumbnailWidth: parseInt(thumbnailWidth, 10),
            thumbnailHeight: parseInt(thumbnailHeight, 10),
            thumbnailCount,
            interval: parseInt(interval, 10),
            columns,
            rows,
            storyboardCount: STORYBOARD_COUNT,
        };
    });
}
function getChapters(info) {
    const PLAYER_OVERLAY_RENDERER = info.response && info.response.playerOverlays && info.response.playerOverlays.playerOverlayRenderer, PLAYER_BAR = PLAYER_OVERLAY_RENDERER && PLAYER_OVERLAY_RENDERER.decoratedPlayerBarRenderer && PLAYER_OVERLAY_RENDERER.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer && PLAYER_OVERLAY_RENDERER.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer.playerBar, MARKERS_MAP = PLAYER_BAR && PLAYER_BAR.multiMarkersPlayerBarRenderer && PLAYER_BAR.multiMarkersPlayerBarRenderer.markersMap, MARKER = Array.isArray(MARKERS_MAP) && MARKERS_MAP.find((m) => m.value && Array.isArray(m.value.chapters));
    if (!MARKER) {
        return [];
    }
    const CHAPTERS = MARKER.value.chapters;
    return CHAPTERS.map((chapter) => {
        return {
            title: getText(chapter.chapterRenderer.title),
            start_time: chapter.chapterRenderer.timeRangeStartMillis / 1000,
        };
    });
}
exports.default = { getMedia, getAuthor, getRelatedVideos, getLikes, cleanVideoDetails, getStoryboards, getChapters };
//# sourceMappingURL=info-extras.js.map
"use strict";
/* Public Functions */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateID = validateID;
exports.validateURL = validateURL;
exports.getURLVideoID = getURLVideoID;
exports.getVideoID = getVideoID;
/** Returns true if given id satifies YouTube's id format. */
const ID_REGEX = /^[a-zA-Z0-9-_]{11}$/;
function validateID(id) {
    return ID_REGEX.test(id.trim());
}
/**
 * Get video ID.
 *
 * There are a few type of video URL formats.
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://m.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/v/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://music.youtube.com/watch?v=VIDEO_ID
 *  - https://gaming.youtube.com/watch?v=VIDEO_ID
 */
const VALID_QUERY_DOMAINS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'gaming.youtube.com']), VALID_PATH_DOMAINS = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts|live)\/)/;
function getURLVideoID(link) {
    const PARSED = new URL(link.trim());
    let id = PARSED.searchParams.get('v');
    if (VALID_PATH_DOMAINS.test(link.trim()) && !id) {
        const PATHS = PARSED.pathname.split('/');
        id = PARSED.host === 'youtu.be' ? PATHS[1] : PATHS[2];
    }
    else if (PARSED.hostname && !VALID_QUERY_DOMAINS.has(PARSED.hostname)) {
        throw new Error('Not a YouTube domain');
    }
    if (!id) {
        throw new Error(`No video id found: "${link}"`);
    }
    id = id.substring(0, 11);
    if (!validateID(id)) {
        throw new TypeError(`Video id (${id}) does not match expected format (${ID_REGEX.toString()})`);
    }
    return id;
}
/** Gets video ID either from a url or by checking if the given string matches the video ID format. */
const URL_REGEX = /^https?:\/\//;
function getVideoID(str) {
    if (validateID(str)) {
        return str;
    }
    else if (URL_REGEX.test(str.trim())) {
        return getURLVideoID(str);
    }
    else {
        throw new Error(`No video id found: ${str}`);
    }
}
/** Checks wether the input string includes a valid id. */
function validateURL(str) {
    try {
        getURLVideoID(str);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.default = { validateID, validateURL, getURLVideoID, getVideoID };
//# sourceMappingURL=url-utils.js.map
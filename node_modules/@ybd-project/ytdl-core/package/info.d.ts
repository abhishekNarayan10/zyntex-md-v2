import { Cache } from './cache';
import { YTDL_GetInfoOptions } from './types/options';
import { YTDL_VideoInfo } from './types/youtube';
declare const CACHE: Cache, WATCH_PAGE_CACHE: Cache;
declare function getBasicInfo(link: string, options?: YTDL_GetInfoOptions): Promise<YTDL_VideoInfo>;
declare function getInfo(link: string, options?: YTDL_GetInfoOptions): Promise<YTDL_VideoInfo>;
declare const validateID: typeof import("./url-utils").validateID, validateURL: typeof import("./url-utils").validateURL, getURLVideoID: typeof import("./url-utils").getURLVideoID, getVideoID: typeof import("./url-utils").getVideoID;
export { CACHE, WATCH_PAGE_CACHE, getBasicInfo, getInfo, validateID, validateURL, getURLVideoID, getVideoID };
declare const _default: {
    CACHE: Cache;
    WATCH_PAGE_CACHE: Cache;
    getBasicInfo: typeof getBasicInfo;
    getInfo: typeof getInfo;
    validateID: typeof import("./url-utils").validateID;
    validateURL: typeof import("./url-utils").validateURL;
    getURLVideoID: typeof import("./url-utils").getURLVideoID;
    getVideoID: typeof import("./url-utils").getVideoID;
};
export default _default;

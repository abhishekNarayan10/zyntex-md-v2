import { PassThrough } from 'stream';
import { getBasicInfo, getInfo } from './info';
import { chooseFormat, filterFormats } from './format-utils';
import { validateID, validateURL, getURLVideoID, getVideoID } from './url-utils';
import { createAgent, createProxyAgent } from './agent';
import { YTDL_DownloadOptions } from './types/options';
import { YTDL_VideoInfo } from './types/youtube';
declare const cache: {
    info: import("./cache").Cache;
    watch: import("./cache").Cache;
}, version: string;
declare const ytdl: {
    (link: string, options?: YTDL_DownloadOptions): PassThrough;
    downloadFromInfo: typeof downloadFromInfo;
    getBasicInfo: typeof getBasicInfo;
    getInfo: typeof getInfo;
    chooseFormat: typeof chooseFormat;
    filterFormats: typeof filterFormats;
    validateID: typeof validateID;
    validateURL: typeof validateURL;
    getURLVideoID: typeof getURLVideoID;
    getVideoID: typeof getVideoID;
    createAgent: typeof createAgent;
    createProxyAgent: typeof createProxyAgent;
    cache: {
        info: import("./cache").Cache;
        watch: import("./cache").Cache;
    };
    version: string;
};
/** Can be used to download video after its `info` is gotten through
 * `ytdl.getInfo()`. In case the user might want to look at the
 * `info` object before deciding to download. */
declare function downloadFromInfo(info: YTDL_VideoInfo, options?: YTDL_DownloadOptions): PassThrough;
export { downloadFromInfo, getBasicInfo, getInfo, chooseFormat, filterFormats, validateID, validateURL, getURLVideoID, getVideoID, createAgent, createProxyAgent, cache, version };
export default ytdl;

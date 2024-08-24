import { YTDL_Media, YTDL_Author, YTDL_WatchPageInfo, YTDL_RelatedVideo, YTDL_Storyboard, YTDL_Chapter, YTDL_VideoDetails, YTDL_MoreVideoDetails, YT_YTInitialPlayerResponse } from './types/youtube';
/** Get video media. [Note]: Media cannot be obtained for several reasons. */
declare function getMedia(info: YTDL_WatchPageInfo): YTDL_Media | null;
declare function getAuthor(info: YTDL_WatchPageInfo): YTDL_Author | null;
declare function getRelatedVideos(info: YTDL_WatchPageInfo): Array<YTDL_RelatedVideo>;
declare function getLikes(info: YTDL_WatchPageInfo): number | null;
declare function cleanVideoDetails(videoDetails: YTDL_VideoDetails, microformat: YT_YTInitialPlayerResponse['microformat'] | null): YTDL_MoreVideoDetails;
declare function getStoryboards(info: YT_YTInitialPlayerResponse | null): Array<YTDL_Storyboard>;
declare function getChapters(info: YTDL_WatchPageInfo): Array<YTDL_Chapter>;
export { getMedia, getAuthor, getRelatedVideos, getLikes, cleanVideoDetails, getStoryboards, getChapters };
declare const _default: {
    getMedia: typeof getMedia;
    getAuthor: typeof getAuthor;
    getRelatedVideos: typeof getRelatedVideos;
    getLikes: typeof getLikes;
    cleanVideoDetails: typeof cleanVideoDetails;
    getStoryboards: typeof getStoryboards;
    getChapters: typeof getChapters;
};
export default _default;

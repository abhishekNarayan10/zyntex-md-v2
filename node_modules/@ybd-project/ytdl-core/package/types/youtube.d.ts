import { YTDL_ClientTypes } from '../meta/clients';
export type YT_StreamingFormat = {
    itag: number;
    url: string;
    mimeType: string;
    bitrate: number;
    width: number;
    height: number;
    lastModified: string;
    contentLength: string;
    quality: string;
    fps: number;
    qualityLabel: string;
    projectionType: string;
    averageBitrate: number;
    audioQuality: string;
    approxDurationMs: string;
    audioSampleRate: string;
    audioChannels: number;
};
type YT_EndscreenElementRenderer = {
    endscreenElementRenderer: {
        style: 'CHANNEL';
        image: {
            thumbnails: Array<YTDL_Thumbnail>;
        };
        title: {
            runs: Array<{
                text: string;
            }>;
        };
        metadata: {
            runs: Array<{
                text: string;
            }>;
        };
        endpoint: {
            browseEndpoint: {
                browseId: string;
            };
        };
    };
};
export type YT_YTInitialPlayerResponse = {
    playabilityStatus: {
        status: string;
        reason?: string;
        messages?: string[];
    };
    videoDetails: {
        videoId: string;
        title: string;
        lengthSeconds: string;
        keywords: Array<string>;
        channelId: string;
        isOwnerViewing: boolean;
        shortDescription: string;
        isCrawlable: boolean;
        thumbnail: {
            thumbnails: Array<YTDL_Thumbnail>;
        };
        allowRatings: boolean;
        viewCount: string;
        author: string;
        isPrivate: boolean;
        isUnpluggedCorpus: boolean;
        isLiveContent: boolean;
    };
    microformat: {
        playerMicroformatRenderer: {
            thumbnail: {
                thumbnails: Array<YTDL_Thumbnail>;
            };
            title: {
                simpleText: string;
            };
            description: {
                simpleText: string;
            };
            lengthSeconds: string;
            ownerProfileUrl: string;
            externalChannelId: string;
            isFamilySafe: boolean;
            availableCountries: Array<string>;
            isUnlisted: boolean;
            hasYpcMetadata: boolean;
            viewCount: string;
            category: string;
            publishDate: string;
            ownerChannelName: string;
            uploadDate: string;
            isShortsEligible: boolean;
            channelId?: string;
        };
    };
    storyboards: {
        playerStoryboardSpecRenderer: {
            spec: string;
        };
    };
    streamingData: {
        expiresInSeconds: string;
        formats: Array<YT_StreamingFormat>;
        adaptiveFormats: Array<YT_StreamingFormat>;
        serverAbrStreamingUrl: string;
        dashManifestUrl?: string;
        hlsManifestUrl?: string;
    };
    endscreen: {
        endscreenRenderer: {
            elements: Array<YT_EndscreenElementRenderer>;
        };
    };
};
export type YT_YTInitialData = {
    contents: {
        twoColumnWatchNextResults: {
            results: {
                results: {
                    contents: Array<any>;
                };
            };
            secondaryResults: {
                secondaryResults: {
                    results: Array<any>;
                    continuations: Array<any>;
                };
            };
        };
    };
    webWatchNextResponseExtensionData?: {
        relatedVideoArgs: string;
    };
    playerOverlays: {
        playerOverlayRenderer: {
            decoratedPlayerBarRenderer: {
                decoratedPlayerBarRenderer: {
                    playerBar: {
                        multiMarkersPlayerBarRenderer: {
                            markersMap: [
                                {
                                    value: {
                                        chapters: Array<{
                                            chapterRenderer: {
                                                title: {
                                                    simpleText: string;
                                                };
                                                timeRangeStartMillis: number;
                                            };
                                        }>;
                                    };
                                }
                            ];
                        };
                    };
                };
            };
        };
    };
};
export type YT_CompactVideoRenderer = {
    videoId: string;
    thumbnail: {
        thumbnails: Array<YTDL_Thumbnail>;
    };
    title: {
        simpleText: string;
    };
    publishedTimeText: {
        simpleText: string;
    };
    viewCountText: {
        simpleText: string;
    };
    shortViewCountText: {
        simpleText: string;
    };
    shortBylineText: {
        runs: [
            {
                text: string;
                navigationEndpoint: {
                    browseEndpoint: {
                        browseId: string;
                        canonicalBaseUrl: string;
                    };
                };
            }
        ];
    };
    channelThumbnail: {
        thumbnails: Array<YTDL_Thumbnail>;
    };
    lengthText: {
        simpleText: string;
    };
    ownerBadges?: Array<any>;
    richThumbnail?: {
        movingThumbnailRenderer: {
            movingThumbnailDetails: {
                thumbnails: Array<YTDL_Thumbnail>;
            };
        };
    };
    badges?: Array<{
        metadataBadgeRenderer: {
            label: string;
        };
    }>;
};
export type YTDL_WatchPageInfo = {
    page: 'watch';
    player_response: YT_YTInitialPlayerResponse | null;
    response: YT_YTInitialData;
    html5Player: string | null;
};
export type YTDL_Thumbnail = {
    url: string;
    width: number;
    height: number;
};
export type YTDL_Media = {
    category: string;
    category_url: string;
    thumbnails: Array<YTDL_Thumbnail>;
    game?: string;
    game_url?: string;
    year?: number;
    song?: string;
    artist?: string;
    artist_url?: string;
    writers?: string;
    licensed_by?: string;
    [key: string]: any;
};
export type YTDL_Author = {
    id: string;
    name: string;
    thumbnails: Array<YTDL_Thumbnail>;
    verified: boolean;
    user?: string;
    channel_url: string;
    external_channel_url?: string;
    user_url?: string;
    subscriber_count?: number;
};
export type YTDL_RelatedVideo = {
    id?: string;
    title?: string;
    published?: string;
    author: YTDL_Author;
    short_view_count_text?: string;
    view_count?: string;
    length_seconds?: number;
    thumbnails: Array<YTDL_Thumbnail>;
    richThumbnails: Array<YTDL_Thumbnail>;
    isLive: boolean;
};
export type YTDL_Storyboard = {
    templateUrl: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    thumbnailCount: number;
    interval: number;
    columns: number;
    rows: number;
    storyboardCount: number;
};
export type YTDL_Chapter = {
    title: string;
    start_time: number;
};
export type YTDL_MicroformatRenderer = {
    thumbnail: {
        thumbnails: Array<YTDL_Thumbnail>;
    };
    embed: {
        iframeUrl: string;
        flashUrl: string;
        width: number;
        height: number;
        flashSecureUrl: string;
    };
    title: {
        simpleText: string;
    };
    description: {
        simpleText: string;
    };
    lengthSeconds: string;
    ownerProfileUrl: string;
    ownerGplusProfileUrl?: string;
    externalChannelId: string;
    isFamilySafe: boolean;
    availableCountries: Array<string>;
    isUnlisted: boolean;
    hasYpcMetadata: boolean;
    viewCount: string;
    category: string;
    publishDate: string;
    ownerChannelName: string;
    liveBroadcastDetails?: {
        isLiveNow: boolean;
        startTimestamp: string;
        endTimestamp?: string;
    };
    uploadDate: string;
};
export type YTDL_VideoFormat = {
    itag: number;
    url: string;
    mimeType?: string;
    bitrate?: number;
    audioBitrate?: number;
    width?: number;
    height?: number;
    initRange?: {
        start: string;
        end: string;
    };
    indexRange?: {
        start: string;
        end: string;
    };
    lastModified: string;
    contentLength: string;
    quality: 'tiny' | 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'hd1440' | 'hd2160' | 'highres' | string;
    qualityLabel: '144p' | '144p 15fps' | '144p60 HDR' | '240p' | '240p60 HDR' | '270p' | '360p' | '360p60 HDR' | '480p' | '480p60 HDR' | '720p' | '720p60' | '720p60 HDR' | '1080p' | '1080p60' | '1080p60 HDR' | '1440p' | '1440p60' | '1440p60 HDR' | '2160p' | '2160p60' | '2160p60 HDR' | '4320p' | '4320p60';
    projectionType?: 'RECTANGULAR';
    fps?: number;
    averageBitrate?: number;
    audioQuality?: 'AUDIO_QUALITY_LOW' | 'AUDIO_QUALITY_MEDIUM';
    colorInfo?: {
        primaries: string;
        transferCharacteristics: string;
        matrixCoefficients: string;
    };
    highReplication?: boolean;
    approxDurationMs?: string;
    targetDurationSec?: number;
    maxDvrDurationSec?: number;
    audioSampleRate?: string;
    audioChannels?: number;
    container: 'flv' | '3gp' | 'mp4' | 'webm' | 'ts' | null;
    hasVideo: boolean;
    hasAudio: boolean;
    codecs: string | null;
    videoCodec?: string | null;
    audioCodec?: string | null;
    isLive: boolean;
    isHLS: boolean;
    isDashMPD: boolean;
};
export type YTDL_VideoDetails = {
    videoId: string;
    title: string;
    shortDescription: string;
    lengthSeconds: string;
    keywords?: Array<string>;
    channelId: string;
    isOwnerViewing: boolean;
    isCrawlable: boolean;
    thumbnails: Array<YTDL_Thumbnail>;
    averageRating: number;
    allowRatings: boolean;
    viewCount: string;
    author: string;
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    isLiveContent: boolean;
    isLive: boolean;
};
export interface YTDL_MoreVideoDetailsAdditions {
    video_url: string;
    age_restricted: boolean;
    likes: number | null;
    media: YTDL_Media | null;
    author: YTDL_Author | null;
    thumbnails?: Array<YTDL_Thumbnail>;
    storyboards: Array<YTDL_Storyboard>;
    chapters: Array<YTDL_Chapter>;
    description?: string | null;
    published?: number | null;
}
export type YTDL_MoreVideoDetails = Omit<YTDL_VideoDetails, 'author' | 'thumbnail' | 'shortDescription'> & Omit<YTDL_MicroformatRenderer, 'title' | 'description'> & YTDL_MoreVideoDetailsAdditions;
export type YTDL_VideoInfo = {
    html5Player: string;
    formats: Array<YTDL_VideoFormat>;
    related_videos: Array<YTDL_RelatedVideo>;
    videoDetails: YTDL_MoreVideoDetails;
    full: boolean;
    clients: Array<YTDL_ClientTypes>;
    _watchPageInfo: YTDL_WatchPageInfo;
    _playerResponses: {
        webCreator?: YT_YTInitialPlayerResponse | null;
        ios?: YT_YTInitialPlayerResponse | null;
        android?: YT_YTInitialPlayerResponse | null;
        iosCreator?: YT_YTInitialPlayerResponse | null;
        androidCreator?: YT_YTInitialPlayerResponse | null;
        web?: YT_YTInitialPlayerResponse | null;
        mweb?: YT_YTInitialPlayerResponse | null;
        tv?: YT_YTInitialPlayerResponse | null;
        webSafari?: YT_YTInitialPlayerResponse | null;
        mediaconnect?: YT_YTInitialPlayerResponse | null;
    };
    iv_load_policy?: string;
    iv_allow_in_place_switch?: string;
    iv_endscreen_url?: string;
    iv_invideo_url?: string;
    iv3_module?: string;
    rmktEnabled?: string;
    uid?: string;
    vid?: string;
    focEnabled?: string;
    baseUrl?: string;
    storyboard_spec?: string;
    serialized_ad_ux_config?: string;
    player_error_log_fraction?: string;
    sffb?: string;
    ldpj?: string;
    videostats_playback_base_url?: string;
    innertube_context_client_version?: string;
    t?: string;
    live_chunk_readahead?: number;
    fade_in_start_milliseconds: string;
    timestamp: string;
    ad3_module: string;
    relative_loudness: string;
    allow_below_the_player_companion: string;
    eventid: string;
    token: string;
    atc: string;
    cr: string;
    apply_fade_on_midrolls: string;
    cl: string;
    fexp: string[];
    apiary_host: string;
    fade_in_duration_milliseconds: string;
    fflags: string;
    ssl: string;
    pltype: string;
    enabled_engage_types: string;
    hl: string;
    is_listed: string;
    gut_tag: string;
    apiary_host_firstparty: string;
    enablecsi: string;
    csn: string;
    status: string;
    afv_ad_tag: string;
    idpj: string;
    sfw_player_response: string;
    account_playback_token: string;
    encoded_ad_safety_reason: string;
    tag_for_children_directed: string;
    no_get_video_log: string;
    ppv_remarketing_url: string;
    fmt_list: string[][];
    ad_slots: string;
    fade_out_duration_milliseconds: string;
    instream_long: string;
    allow_html5_ads: string;
    core_dbp: string;
    ad_device: string;
    itct: string;
    root_ve_type: string;
    excluded_ads: string;
    aftv: string;
    loeid: string;
    cver: string;
    shortform: string;
    dclk: string;
    csi_page_type: string;
    ismb: string;
    gpt_migration: string;
    loudness: string;
    ad_tag: string;
    of: string;
    probe_url: string;
    vm: string;
    afv_ad_tag_restricted_to_instream: string;
    gapi_hint_params: string;
    cid: string;
    c: string;
    oid: string;
    ptchn: string;
    as_launched_in_country: string;
    avg_rating: string;
    fade_out_start_milliseconds: string;
    midroll_prefetch_size: string;
    allow_ratings: string;
    thumbnail_url: string;
    iurlsd: string;
    iurlmq: string;
    iurlhq: string;
    iurlmaxres: string;
    ad_preroll: string;
    tmi: string;
    trueview: string;
    host_language: string;
    innertube_api_key: string;
    show_content_thumbnail: string;
    afv_instream_max: string;
    innertube_api_version: string;
    mpvid: string;
    allow_embed: string;
    ucid: string;
    plid: string;
    midroll_freqcap: string;
    ad_logging_flag: string;
    ptk: string;
    vmap: string;
    watermark: string[];
    dbp: string;
    ad_flags: string;
    no_embed_allowed?: boolean;
};
export {};

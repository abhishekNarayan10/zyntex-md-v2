import { YT_YTInitialPlayerResponse } from './types/youtube';
import { YTDL_DownloadOptions, YTDL_RequestOptions } from './types/options';
/** Extract string inbetween another */
declare function between(haystack: string, left: RegExp | string, right: string): string;
declare function tryParseBetween<T = unknown>(body: string, left: RegExp | string, right: string, prepend?: string, append?: string): T | null;
/** Get a number from an abbreviated number string. */
declare function parseAbbreviatedNumber(string: string): number | null;
/** Match begin and end braces of input JS, return only JS */
declare function cutAfterJS(mixedJson: string): string;
/** Checks if there is a playability error. */
declare function playError(playerResponse: YT_YTInitialPlayerResponse | null): Error | null;
/** Undici request */
declare function request<T = unknown>(url: string, options?: YTDL_RequestOptions): Promise<T>;
/** Temporary helper to help deprecating a few properties. */
declare function deprecate(obj: Object, prop: string, value: Object, oldPath: string, newPath: string): void;
declare let lastUpdateCheck: number;
declare function checkForUpdates(): Promise<void> | null;
declare function isIPv6(ip: string): boolean;
/** Normalize an IPv6 Address */
declare function normalizeIP(ip: string): Array<number>;
/** Gets random IPv6 Address from a block */
declare function getRandomIPv6(ip: string): string;
declare function saveDebugFile(name: string, body: any): string;
declare function getPropInsensitive<T = unknown>(obj: any, prop: string): T;
declare function setPropInsensitive(obj: any, prop: string, value: any): string | null;
declare function applyDefaultAgent(options: YTDL_DownloadOptions): void;
declare function applyOldLocalAddress(options: YTDL_DownloadOptions): void;
declare function applyIPv6Rotations(options: YTDL_DownloadOptions): void;
declare function applyDefaultHeaders(options: YTDL_DownloadOptions): void;
declare function generateClientPlaybackNonce(length: number): string;
export { between, tryParseBetween, parseAbbreviatedNumber, cutAfterJS, playError, request, deprecate, lastUpdateCheck, checkForUpdates, isIPv6, normalizeIP, getRandomIPv6, saveDebugFile, getPropInsensitive, setPropInsensitive, applyDefaultAgent, applyOldLocalAddress, applyIPv6Rotations, applyDefaultHeaders, generateClientPlaybackNonce };
declare const _default: {
    between: typeof between;
    tryParseBetween: typeof tryParseBetween;
    parseAbbreviatedNumber: typeof parseAbbreviatedNumber;
    cutAfterJS: typeof cutAfterJS;
    playError: typeof playError;
    request: typeof request;
    deprecate: typeof deprecate;
    lastUpdateCheck: number;
    checkForUpdates: typeof checkForUpdates;
    isIPv6: typeof isIPv6;
    normalizeIP: typeof normalizeIP;
    getRandomIPv6: typeof getRandomIPv6;
    saveDebugFile: typeof saveDebugFile;
    getPropInsensitive: typeof getPropInsensitive;
    setPropInsensitive: typeof setPropInsensitive;
    applyDefaultAgent: typeof applyDefaultAgent;
    applyOldLocalAddress: typeof applyOldLocalAddress;
    applyIPv6Rotations: typeof applyIPv6Rotations;
    applyDefaultHeaders: typeof applyDefaultHeaders;
    generateClientPlaybackNonce: typeof generateClientPlaybackNonce;
};
export default _default;

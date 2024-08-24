import vm from 'node:vm';
import { Cache } from './cache';
import { YTDL_RequestOptions } from './types/options';
declare const CACHE: Cache;
declare function extractFunctions(body: string): (vm.Script | null)[];
declare function getFunctions<T = unknown>(html5PlayerFile: string, options: YTDL_RequestOptions): T | null;
declare function setDownloadURL(format: any, decipherScript: vm.Script, nTransformScript: vm.Script): void;
declare function decipherFormats(formats: any, html5PlayerFile: string, options: YTDL_RequestOptions): Promise<Record<string, string>>;
export { CACHE, extractFunctions, getFunctions, setDownloadURL, decipherFormats };
declare const _default: {
    CACHE: Cache;
    extractFunctions: typeof extractFunctions;
    getFunctions: typeof getFunctions;
    setDownloadURL: typeof setDownloadURL;
    decipherFormats: typeof decipherFormats;
};
export default _default;

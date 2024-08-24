import { Dispatcher, request } from 'undici';
import { YTDL_ClientTypes } from '../meta/clients';
import { YTDL_Agent } from './agent';
import { YTDL_VideoFormat } from './youtube';
export type YTDL_Filter = 'audioandvideo' | 'videoandaudio' | 'video' | 'videoonly' | 'audio' | 'audioonly' | ((format: YTDL_VideoFormat) => boolean);
export type YTDL_ChooseFormatOptions = {
    quality?: 'lowest' | 'highest' | 'highestaudio' | 'lowestaudio' | 'highestvideo' | 'lowestvideo' | string | number | string[] | number[];
    filter?: YTDL_Filter;
    format?: YTDL_VideoFormat;
};
export type YTDL_GetInfoOptions = {
    lang?: string;
    requestCallback?: () => {};
    requestOptions?: Parameters<typeof request>[1];
    agent?: YTDL_Agent;
    poToken?: string;
    visitorData?: string;
    /** You can specify whether to include Player API responses.
     * @default false
     */
    includesPlayerAPIResponse?: boolean;
    /** You can specify whether to include data obtained from Watch pages.
     * @default false
     */
    includesWatchPageInfo?: boolean;
    /** You can specify the client from which you want to retrieve video information. (Changing it is not recommended.)
     * @default ["web_creator", "ios", "android"]
     */
    clients?: Array<YTDL_ClientTypes>;
};
export interface YTDL_DownloadOptions extends YTDL_GetInfoOptions, YTDL_ChooseFormatOptions {
    range?: {
        start?: number;
        end?: number;
    };
    begin?: string | number;
    liveBuffer?: number;
    highWaterMark?: number;
    IPv6Block?: string;
    dlChunkSize?: number;
}
export type YTDL_RequestOptions = {
    requestOptions?: Omit<Dispatcher.RequestOptions, 'origin' | 'path' | 'method'> & Partial<Pick<Dispatcher.RequestOptions, 'method'>>;
};

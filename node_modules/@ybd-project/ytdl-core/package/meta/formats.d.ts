/** * http://en.wikipedia.org/wiki/YouTube#Quality_and_formats */
type YTDL_FormatData = {
    mimeType: string;
    qualityLabel: string | null;
    bitrate: number | null;
    audioBitrate: number | null;
};
declare const FORMATS: Record<number, YTDL_FormatData>;
export default FORMATS;

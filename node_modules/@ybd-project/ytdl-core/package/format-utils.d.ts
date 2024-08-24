import { YTDL_VideoFormat } from './types/youtube';
import { YTDL_ChooseFormatOptions } from './types/options';
declare function sortFormats(a: Object, b: Object): number;
declare function filterFormats(formats: Array<YTDL_VideoFormat>, filter?: YTDL_ChooseFormatOptions['filter']): Array<YTDL_VideoFormat>;
declare function chooseFormat(formats: Array<YTDL_VideoFormat>, options: YTDL_ChooseFormatOptions): YTDL_VideoFormat;
declare function addFormatMeta(format: YTDL_VideoFormat): YTDL_VideoFormat;
export { sortFormats, filterFormats, chooseFormat, addFormatMeta };
declare const _default: {
    sortFormats: typeof sortFormats;
    filterFormats: typeof filterFormats;
    chooseFormat: typeof chooseFormat;
    addFormatMeta: typeof addFormatMeta;
};
export default _default;

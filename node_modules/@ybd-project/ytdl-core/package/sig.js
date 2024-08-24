"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE = void 0;
exports.extractFunctions = extractFunctions;
exports.getFunctions = getFunctions;
exports.setDownloadURL = setDownloadURL;
exports.decipherFormats = decipherFormats;
const querystring_1 = __importDefault(require("querystring"));
const node_vm_1 = __importDefault(require("node:vm"));
const cache_1 = require("./cache");
const utils_1 = __importDefault(require("./utils"));
const Log_1 = require("./utils/Log");
/* Private Constants */
const DECIPHER_NAME_REGEXPS = [
    '\\bm=([a-zA-Z0-9$]{2,})\\(decodeURIComponent\\(h\\.s\\)\\)',
    '\\bc&&\\(c=([a-zA-Z0-9$]{2,})\\(decodeURIComponent\\(c\\)\\)',
    // eslint-disable-next-line max-len
    '(?:\\b|[^a-zA-Z0-9$])([a-zA-Z0-9$]{2,})\\s*=\\s*function\\(\\s*a\\s*\\)\\s*\\{\\s*a\\s*=\\s*a\\.split\\(\\s*""\\s*\\)',
    '([\\w$]+)\\s*=\\s*function\\((\\w+)\\)\\{\\s*\\2=\\s*\\2\\.split\\(""\\)\\s*;',
];
// LavaPlayer regexps
const VARIABLE_PART = '[a-zA-Z_\\$][a-zA-Z_0-9]*';
const VARIABLE_PART_DEFINE = `\\"?${VARIABLE_PART}\\"?`;
const BEFORE_ACCESS = '(?:\\[\\"|\\.)';
const AFTER_ACCESS = '(?:\\"\\]|)';
const VARIABLE_PART_ACCESS = BEFORE_ACCESS + VARIABLE_PART + AFTER_ACCESS;
const REVERSE_PART = ':function\\(a\\)\\{(?:return )?a\\.reverse\\(\\)\\}';
const SLICE_PART = ':function\\(a,b\\)\\{return a\\.slice\\(b\\)\\}';
const SPLICE_PART = ':function\\(a,b\\)\\{a\\.splice\\(0,b\\)\\}';
const SWAP_PART = ':function\\(a,b\\)\\{' + 'var c=a\\[0\\];a\\[0\\]=a\\[b%a\\.length\\];a\\[b(?:%a.length|)\\]=c(?:;return a)?\\}';
const DECIPHER_REGEXP = `function(?: ${VARIABLE_PART})?\\(a\\)\\{` + `a=a\\.split\\(""\\);\\s*` + `((?:(?:a=)?${VARIABLE_PART}${VARIABLE_PART_ACCESS}\\(a,\\d+\\);)+)` + `return a\\.join\\(""\\)` + `\\}`;
const HELPER_REGEXP = `var (${VARIABLE_PART})=\\{((?:(?:${VARIABLE_PART_DEFINE}${REVERSE_PART}|${VARIABLE_PART_DEFINE}${SLICE_PART}|${VARIABLE_PART_DEFINE}${SPLICE_PART}|${VARIABLE_PART_DEFINE}${SWAP_PART}),?\\n?)+)\\};`;
const SCVR = '[a-zA-Z0-9$_]';
const FNR = `${SCVR}+`;
const AAR = '\\[(\\d+)]';
const N_TRANSFORM_NAME_REGEXPS = [
    // NewPipeExtractor regexps
    `${SCVR}+="nn"\\[\\+${SCVR}+\\.${SCVR}+],${SCVR}+=${SCVR}+\\.get\\(${SCVR}+\\)\\)&&\\(${SCVR}+=(${SCVR}+)\\[(\\d+)]`,
    `${SCVR}+="nn"\\[\\+${SCVR}+\\.${SCVR}+],${SCVR}+=${SCVR}+\\.get\\(${SCVR}+\\)\\).+\\|\\|(${SCVR}+)\\(""\\)`,
    `\\(${SCVR}=String\\.fromCharCode\\(110\\),${SCVR}=${SCVR}\\.get\\(${SCVR}\\)\\)&&\\(${SCVR}=(${FNR})(?:${AAR})?\\(${SCVR}\\)`,
    `\\.get\\("n"\\)\\)&&\\(${SCVR}=(${FNR})(?:${AAR})?\\(${SCVR}\\)`,
    // Skick regexps
    '(\\w+).length\\|\\|\\w+\\(""\\)',
    '\\w+.length\\|\\|(\\w+)\\(""\\)',
];
// LavaPlayer regexps
const N_TRANSFORM_REGEXP = 'function\\(\\s*(\\w+)\\s*\\)\\s*\\{' + 'var\\s*(\\w+)=(?:\\1\\.split\\(""\\)|String\\.prototype\\.split\\.call\\(\\1,""\\)),' + '\\s*(\\w+)=(\\[.*?]);\\s*\\3\\[\\d+]' + '(.*?try)(\\{.*?})catch\\(\\s*(\\w+)\\s*\\)\\s*\\' + '{\\s*return"enhanced_except_([A-z0-9-]+)"\\s*\\+\\s*\\1\\s*}' + '\\s*return\\s*(\\2\\.join\\(""\\)|Array\\.prototype\\.join\\.call\\(\\2,""\\))};';
const DECIPHER_ARGUMENT = 'sig';
const N_ARGUMENT = 'ncode';
const DECIPHER_FUNC_NAME = 'YBDProjectDecipherFunc';
const N_TRANSFORM_FUNC_NAME = 'YBDProjectNTransformFunc';
/* ----------- */
/* Private Functions */
function matchRegex(regex, str) {
    const MATCH = str.match(new RegExp(regex, 's'));
    if (!MATCH) {
        throw new Error(`Could not match ${regex}`);
    }
    return MATCH;
}
function matchFirst(regex, str) {
    return matchRegex(regex, str)[0];
}
function matchGroup1(regex, str) {
    return matchRegex(regex, str)[1];
}
function getFunctionName(body, regexps) {
    let fn;
    for (const REGEX of regexps) {
        try {
            fn = matchGroup1(REGEX, body);
            try {
                fn = matchGroup1(`${fn.replace(/\$/g, '\\$')}=\\[([a-zA-Z0-9$\\[\\]]{2,})\\]`, body);
            }
            catch (err) { }
            break;
        }
        catch (err) {
            continue;
        }
    }
    if (!fn || fn.includes('['))
        throw Error();
    return fn;
}
function getExtractFunctions(extractFunctions, body) {
    for (const extractFunction of extractFunctions) {
        try {
            const FUNC = extractFunction(body);
            if (!FUNC)
                continue;
            return new node_vm_1.default.Script(FUNC);
        }
        catch (err) {
            continue;
        }
    }
    return null;
}
/* Decipher */
function extractDecipherFunc(body) {
    try {
        const HELPER_OBJECT = matchFirst(HELPER_REGEXP, body), DECIPHER_FUNCTION = matchFirst(DECIPHER_REGEXP, body), RESULTS_FUNCTION = `var ${DECIPHER_FUNC_NAME}=${DECIPHER_FUNCTION};`, CALLER_FUNCTION = `${DECIPHER_FUNC_NAME}(${DECIPHER_ARGUMENT});`;
        return HELPER_OBJECT + RESULTS_FUNCTION + CALLER_FUNCTION;
    }
    catch (e) {
        return null;
    }
}
function extractDecipherWithName(body) {
    try {
        const DECIPHER_FUNCTION_NAME = getFunctionName(body, DECIPHER_NAME_REGEXPS), FUNC_PATTERN = `(${DECIPHER_FUNCTION_NAME.replace(/\$/g, '\\$')}function\\([a-zA-Z0-9_]+\\)\\{.+?\\})`, DECIPHER_FUNCTION = `var ${matchGroup1(FUNC_PATTERN, body)};`, HELPER_OBJECT_NAME = matchGroup1(';([A-Za-z0-9_\\$]{2,})\\.\\w+\\(', DECIPHER_FUNCTION), HELPER_PATTERN = `(var ${HELPER_OBJECT_NAME.replace(/\$/g, '\\$')}=\\{[\\s\\S]+?\\}\\};)`, HELPER_OBJECT = matchGroup1(HELPER_PATTERN, body), CALLER_FUNCTION = `${DECIPHER_FUNC_NAME}(${DECIPHER_ARGUMENT});`;
        return HELPER_OBJECT + DECIPHER_FUNCTION + CALLER_FUNCTION;
    }
    catch (e) {
        return null;
    }
}
let decipherWarning = false;
function extractDecipher(body) {
    const DECIPHER_FUNCTION = getExtractFunctions([extractDecipherWithName, extractDecipherFunc], body);
    if (!DECIPHER_FUNCTION && !decipherWarning) {
        Log_1.Logger.warning(`Could not parse decipher function.\nPlease report this issue with the "${utils_1.default.saveDebugFile('base.js', body)}" file on https://github.com/ybd-project/ytdl-core/issues.\nStream URL will be missing.`);
        decipherWarning = true;
    }
    return DECIPHER_FUNCTION;
}
/* N-Transform */
function extractNTransformFunc(body) {
    try {
        const N_FUNCTION = matchFirst(N_TRANSFORM_REGEXP, body), RESULTS_FUNCTION = `var ${N_TRANSFORM_FUNC_NAME}=${N_FUNCTION};`, CALLER_FUNCTION = `${N_TRANSFORM_FUNC_NAME}(${N_ARGUMENT});`;
        return RESULTS_FUNCTION + CALLER_FUNCTION;
    }
    catch (e) {
        return null;
    }
}
function extractNTransformWithName(body) {
    try {
        const N_FUNCTION_NAME = getFunctionName(body, N_TRANSFORM_NAME_REGEXPS), FUNCTION_PATTERN = `(${N_FUNCTION_NAME.replace(/\$/g, '\\$')}=\\s*function([\\S\\s]*?\\}\\s*return (([\\w$]+?\\.join\\(""\\))|(Array\\.prototype\\.join\\.call\\([\\w$]+?,[\\n\\s]*(("")|(\\("",""\\)))\\)))\\s*\\}))`, N_TRANSFORM_FUNCTION = `var ${matchGroup1(FUNCTION_PATTERN, body)};`, CALLER_FUNCTION = `${N_FUNCTION_NAME}(${N_ARGUMENT});`;
        return N_TRANSFORM_FUNCTION + CALLER_FUNCTION;
    }
    catch (e) {
        return null;
    }
}
let nTransformWarning = false;
function extractNTransform(body) {
    const N_TRANSFORM_FUNCTION = getExtractFunctions([extractNTransformFunc, extractNTransformWithName], body);
    if (!N_TRANSFORM_FUNCTION && !nTransformWarning) {
        // This is optional, so we can continue if it's not found, but it will bottleneck the download.
        Log_1.Logger.warning(`Could not parse n transform function.\nPlease report this issue with the "${utils_1.default.saveDebugFile('base.js', body)}" file on https://github.com/distubejs/ytdl-core/issues.`);
        nTransformWarning = true;
    }
    return N_TRANSFORM_FUNCTION;
}
/* ----------- */
/* Public Constants */
const CACHE = new cache_1.Cache(1);
exports.CACHE = CACHE;
/* Public Functions */
function extractFunctions(body) {
    return [extractDecipher(body), extractNTransform(body)];
}
function getFunctions(html5PlayerFile, options) {
    return CACHE.getOrSet(html5PlayerFile, async () => {
        const BODY = await utils_1.default.request(html5PlayerFile, options), FUNCTIONS = extractFunctions(BODY);
        CACHE.set(html5PlayerFile, FUNCTIONS);
        return FUNCTIONS;
    });
}
function setDownloadURL(format, decipherScript, nTransformScript) {
    if (!decipherScript) {
        return;
    }
    const decipher = (url) => {
        const ARGS = querystring_1.default.parse(url);
        if (!ARGS.s) {
            return ARGS.url;
        }
        const COMPONENTS = new URL(decodeURIComponent(ARGS.url?.toString() || '')), CONTEXT = {};
        CONTEXT[DECIPHER_ARGUMENT] = decodeURIComponent(ARGS.s.toString() || '');
        COMPONENTS.searchParams.set(ARGS.sp?.toString() || 'sig', decipherScript.runInNewContext(CONTEXT));
        return COMPONENTS.toString();
    }, nTransform = (url) => {
        const COMPONENTS = new URL(decodeURIComponent(url)), N = COMPONENTS.searchParams.get('n');
        if (!N || !nTransformScript) {
            return url;
        }
        const CONTEXT = {};
        CONTEXT[N_ARGUMENT] = N;
        COMPONENTS.searchParams.set('n', nTransformScript.runInNewContext(CONTEXT));
        return COMPONENTS.toString();
    }, CIPHER = !format?.url, VIDEO_URL = format?.url || format.signatureCipher || format.cipher;
    format.url = nTransform(CIPHER ? decipher(VIDEO_URL) : VIDEO_URL);
    delete format.signatureCipher;
    delete format.cipher;
}
async function decipherFormats(formats, html5PlayerFile, options) {
    const DECIPHERED_FORMATS = {}, [decipherScript, nTransformScript] = (await getFunctions(html5PlayerFile, options)) || [];
    formats.forEach((format) => {
        if (!format) {
            return;
        }
        setDownloadURL(format, decipherScript, nTransformScript);
        DECIPHERED_FORMATS[format.url] = format;
    });
    return DECIPHERED_FORMATS;
}
exports.default = { CACHE, extractFunctions, getFunctions, setDownloadURL, decipherFormats };
//# sourceMappingURL=sig.js.map
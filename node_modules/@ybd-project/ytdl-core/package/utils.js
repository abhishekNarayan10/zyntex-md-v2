"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastUpdateCheck = void 0;
exports.between = between;
exports.tryParseBetween = tryParseBetween;
exports.parseAbbreviatedNumber = parseAbbreviatedNumber;
exports.cutAfterJS = cutAfterJS;
exports.playError = playError;
exports.request = request;
exports.deprecate = deprecate;
exports.checkForUpdates = checkForUpdates;
exports.isIPv6 = isIPv6;
exports.normalizeIP = normalizeIP;
exports.getRandomIPv6 = getRandomIPv6;
exports.saveDebugFile = saveDebugFile;
exports.getPropInsensitive = getPropInsensitive;
exports.setPropInsensitive = setPropInsensitive;
exports.applyDefaultAgent = applyDefaultAgent;
exports.applyOldLocalAddress = applyOldLocalAddress;
exports.applyIPv6Rotations = applyIPv6Rotations;
exports.applyDefaultHeaders = applyDefaultHeaders;
exports.generateClientPlaybackNonce = generateClientPlaybackNonce;
const undici_1 = require("undici");
const node_fs_1 = require("node:fs");
const Constants_1 = require("./utils/Constants");
const Log_1 = require("./utils/Log");
const agent_1 = __importDefault(require("./agent"));
const ESCAPING_SEQUENCE = [
    { start: '"', end: '"' },
    { start: "'", end: "'" },
    { start: '`', end: '`' },
    { start: '/', end: '/', startPrefix: /(^|[[{:;,/])\s?$/ },
];
/** Check for updates. */
const UPDATE_INTERVAL = 1000 * 60 * 60 * 12;
/* ----------- */
/* Private Functions */
function findPropKeyInsensitive(obj, prop) {
    return Object.keys(obj).find((p) => p.toLowerCase() === prop.toLowerCase()) || null;
}
/* ----------- */
/* Private Classes */
class UnrecoverableError extends Error {
}
class RequestError extends Error {
    statusCode;
    constructor(message) {
        super(message);
        this.statusCode = 0;
    }
}
/* ----------- */
/* Public Functions */
/** Extract string inbetween another */
function between(haystack, left, right) {
    let pos = null;
    if (left instanceof RegExp) {
        const MATCH = haystack.match(left);
        if (!MATCH) {
            return '';
        }
        pos = (MATCH.index || 0) + MATCH[0].length;
    }
    else {
        pos = haystack.indexOf(left);
        if (pos === -1) {
            return '';
        }
        pos += left.length;
    }
    haystack = haystack.slice(pos);
    pos = haystack.indexOf(right);
    if (pos === -1) {
        return '';
    }
    haystack = haystack.slice(0, pos);
    return haystack;
}
function tryParseBetween(body, left, right, prepend = '', append = '') {
    try {
        const BETWEEN_STRING = between(body, left, right);
        if (!BETWEEN_STRING) {
            return null;
        }
        return JSON.parse(`${prepend}${BETWEEN_STRING}${append}`);
    }
    catch (err) {
        return null;
    }
}
/** Get a number from an abbreviated number string. */
function parseAbbreviatedNumber(string) {
    const MATCH = string
        .replace(',', '.')
        .replace(' ', '')
        .match(/([\d,.]+)([MK]?)/);
    if (MATCH) {
        const UNIT = MATCH[2];
        let number = MATCH[1];
        number = parseFloat(number);
        return Math.round(UNIT === 'M' ? number * 1000000 : UNIT === 'K' ? number * 1000 : number);
    }
    return null;
}
/** Match begin and end braces of input JS, return only JS */
function cutAfterJS(mixedJson) {
    let open = null, close = null;
    if (mixedJson[0] === '[') {
        open = '[';
        close = ']';
    }
    else if (mixedJson[0] === '{') {
        open = '{';
        close = '}';
    }
    if (!open) {
        throw new Error(`Can't cut unsupported JSON (need to begin with [ or { ) but got: ${mixedJson[0]}`);
    }
    // States if the loop is currently inside an escaped js object
    let isEscapedObject = null;
    // States if the current character is treated as escaped or not
    let isEscaped = false;
    // Current open brackets to be closed
    let counter = 0;
    for (let i = 0; i < mixedJson.length; i++) {
        if (isEscapedObject !== null && !isEscaped && mixedJson[i] === isEscapedObject.end) {
            isEscapedObject = null;
            continue;
        }
        else if (!isEscaped && isEscapedObject === null) {
            for (const ESCAPED of ESCAPING_SEQUENCE) {
                if (mixedJson[i] !== ESCAPED.start) {
                    continue;
                }
                if (!ESCAPED.startPrefix || mixedJson.substring(i - 10, i).match(ESCAPED.startPrefix)) {
                    isEscapedObject = ESCAPED;
                    break;
                }
            }
            if (isEscapedObject !== null) {
                continue;
            }
        }
        isEscaped = mixedJson[i] === '\\' && !isEscaped;
        if (isEscapedObject !== null) {
            continue;
        }
        if (mixedJson[i] === open) {
            counter++;
        }
        else if (mixedJson[i] === close) {
            counter--;
        }
        if (counter === 0) {
            return mixedJson.slice(0, i + 1);
        }
    }
    throw new Error(`Can't cut unsupported JSON (no matching closing bracket found)`);
}
/** Checks if there is a playability error. */
function playError(playerResponse) {
    const PLAYABILITY = playerResponse && playerResponse.playabilityStatus;
    if (!PLAYABILITY) {
        return null;
    }
    if (PLAYABILITY.status === 'ERROR' || PLAYABILITY.status === 'LOGIN_REQUIRED') {
        return new UnrecoverableError(PLAYABILITY.reason || (PLAYABILITY.messages && PLAYABILITY.messages[0]));
    }
    else if (PLAYABILITY.status === 'LIVE_STREAM_OFFLINE') {
        return new UnrecoverableError(PLAYABILITY.reason || 'The live stream is offline.');
    }
    else if (PLAYABILITY.status === 'UNPLAYABLE') {
        return new UnrecoverableError(PLAYABILITY.reason || 'This video is unavailable.');
    }
    return null;
}
/** Undici request */
async function request(url, options = {}) {
    const { requestOptions } = options, REQUEST_RESULTS = await (0, undici_1.request)(url, requestOptions), STATUS_CODE = REQUEST_RESULTS.statusCode.toString(), LOCATION = REQUEST_RESULTS.headers['location'] || null;
    if (STATUS_CODE.startsWith('2')) {
        const CONTENT_TYPE = REQUEST_RESULTS.headers['content-type'] || '';
        if (CONTENT_TYPE.includes('application/json')) {
            return REQUEST_RESULTS.body.json();
        }
        return REQUEST_RESULTS.body.text();
    }
    else if (STATUS_CODE.startsWith('3') && LOCATION) {
        return request(LOCATION.toString(), options);
    }
    const ERROR = new RequestError(`Status Code: ${STATUS_CODE}`);
    ERROR.statusCode = REQUEST_RESULTS.statusCode;
    throw ERROR;
}
/** Temporary helper to help deprecating a few properties. */
function deprecate(obj, prop, value, oldPath, newPath) {
    Object.defineProperty(obj, prop, {
        get: () => {
            Log_1.Logger.warning(`\`${oldPath}\` will be removed in a near future release, ` + `use \`${newPath}\` instead.`);
            return value;
        },
    });
}
/** Check for updates. */
let updateWarnTimes = 0;
let lastUpdateCheck = 0;
exports.lastUpdateCheck = lastUpdateCheck;
function checkForUpdates() {
    const YTDL_NO_UPDATE = process.env.YTDL_NO_UPDATE;
    if (!YTDL_NO_UPDATE && Date.now() - lastUpdateCheck >= UPDATE_INTERVAL) {
        exports.lastUpdateCheck = lastUpdateCheck = Date.now();
        const GITHUB_URL = 'https://api.github.com/repos/ybd-project/ytdl-core/contents/package.json';
        return request(GITHUB_URL, {
            requestOptions: { headers: { 'User-Agent': 'Chromium";v="112", "Microsoft Edge";v="112", "Not:A-Brand";v="99' } },
        }).then((response) => {
            const BUFFER = Buffer.from(response.content, response.encoding), PKG_FILE = JSON.parse(BUFFER.toString('ascii'));
            if (PKG_FILE.version !== Constants_1.VERSION && updateWarnTimes++ < 5) {
                Log_1.Logger.warning('@ybd-project/ytdl-core is out of date! Update with "npm install @ybd-project/ytdl-core@latest".');
            }
        }, (err) => {
            Log_1.Logger.warning('Error checking for updates:', err.message);
            Log_1.Logger.warning('You can disable this check by setting the `YTDL_NO_UPDATE` env variable.');
        });
    }
    return null;
}
/** Quic check for a valid IPv6 */
const IPV6_REGEX = /^(([0-9a-f]{1,4}:)(:[0-9a-f]{1,4}){1,6}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,6}(:[0-9a-f]{1,4})|([0-9a-f]{1,4}:){1,7}(([0-9a-f]{1,4})|:))\/(1[0-1]\d|12[0-8]|\d{1,2})$/;
function isIPv6(ip) {
    return IPV6_REGEX.test(ip);
}
/** Normalize an IPv6 Address */
function normalizeIP(ip) {
    const PARTS = ip.split('::').map((part) => part.split(':')), PART_START = PARTS[0] || [], PART_END = PARTS[1] || [], FULL_IP = new Array(8).fill(0);
    PART_END.reverse();
    for (let i = 0; i < Math.min(PART_START.length, 8); i++) {
        FULL_IP[i] = parseInt(PART_START[i], 16) || 0;
    }
    for (let i = 0; i < Math.min(PART_END.length, 8); i++) {
        FULL_IP[7 - i] = parseInt(PART_END[i], 16) || 0;
    }
    return FULL_IP;
}
/** Gets random IPv6 Address from a block */
function getRandomIPv6(ip) {
    if (!isIPv6(ip)) {
        throw new Error('Invalid IPv6 format');
    }
    const [rawAddr, rawMask] = ip.split('/');
    let base10Mask = parseInt(rawMask);
    if (!base10Mask || base10Mask > 128 || base10Mask < 24) {
        throw new Error('Invalid IPv6 subnet');
    }
    const BASE_10_ADDR = normalizeIP(rawAddr), RANDOM_ADDR = new Array(8).fill(1).map(() => Math.floor(Math.random() * 0xffff)), MERGED_ADDR = RANDOM_ADDR.map((randomItem, idx) => {
        const STATIC_BITS = Math.min(base10Mask, 16);
        base10Mask -= STATIC_BITS;
        const MASK = 0xffff - (2 ** (16 - STATIC_BITS) - 1);
        return (BASE_10_ADDR[idx] & MASK) + (randomItem & (MASK ^ 0xffff));
    });
    return MERGED_ADDR.map((x) => x.toString(16)).join(':');
}
function saveDebugFile(name, body) {
    const FILENAME = `${+new Date()}-${name}`;
    (0, node_fs_1.writeFileSync)(FILENAME, body);
    return FILENAME;
}
function getPropInsensitive(obj, prop) {
    const KEY = findPropKeyInsensitive(obj, prop);
    return KEY && obj[KEY];
}
function setPropInsensitive(obj, prop, value) {
    const KEY = findPropKeyInsensitive(obj, prop);
    obj[KEY || prop] = value;
    return KEY;
}
let oldCookieWarning = true;
let oldDispatcherWarning = true;
function applyDefaultAgent(options) {
    if (!options.agent) {
        const { jar } = agent_1.default.defaultAgent, COOKIE = getPropInsensitive(options?.requestOptions?.headers, 'cookie');
        if (COOKIE) {
            jar.removeAllCookiesSync();
            agent_1.default.addCookiesFromString(jar, COOKIE);
            if (oldCookieWarning) {
                oldCookieWarning = false;
                Log_1.Logger.warning('Using old cookie format, please use the new one instead. (https://github.com/ybd-project/ytdl-core#cookies-support)');
            }
        }
        if (options.requestOptions?.dispatcher && oldDispatcherWarning) {
            oldDispatcherWarning = false;
            Log_1.Logger.warning('Your dispatcher is overridden by `ytdl.Agent`. To implement your own, check out the documentation. (https://github.com/ybd-project/ytdl-core#how-to-implement-ytdlagent-with-your-own-dispatcher)');
        }
        options.agent = agent_1.default.defaultAgent;
    }
}
let oldLocalAddressWarning = true;
function applyOldLocalAddress(options) {
    const REQUEST_OPTION_LOCAL_ADDRESS = options.requestOptions.localAddress;
    if (!options.requestOptions || !REQUEST_OPTION_LOCAL_ADDRESS || REQUEST_OPTION_LOCAL_ADDRESS === options.agent?.localAddress) {
        return;
    }
    options.agent = agent_1.default.createAgent(undefined, {
        localAddress: REQUEST_OPTION_LOCAL_ADDRESS,
    });
    if (oldLocalAddressWarning) {
        oldLocalAddressWarning = false;
        Log_1.Logger.warning('Using old localAddress option, please add it to the agent options instead. (https://github.com/ybd-project/ytdl-core#ip-rotation)');
    }
}
let oldIpRotationsWarning = true;
function applyIPv6Rotations(options) {
    if (options.IPv6Block) {
        options.requestOptions = Object.assign({}, options.requestOptions, {
            localAddress: getRandomIPv6(options.IPv6Block),
        });
        if (oldIpRotationsWarning) {
            oldIpRotationsWarning = false;
            oldLocalAddressWarning = false;
            Log_1.Logger.warning('IPv6Block option is deprecated, ' + 'please create your own ip rotation instead. (https://github.com/ybd-project/ytdl-core#ip-rotation)');
        }
    }
}
function applyDefaultHeaders(options) {
    options.requestOptions = Object.assign({}, options.requestOptions);
    options.requestOptions.headers = Object.assign({}, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36',
    }, options.requestOptions.headers);
}
function generateClientPlaybackNonce(length) {
    const CPN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    return Array.from({ length }, () => CPN_CHARS[Math.floor(Math.random() * CPN_CHARS.length)]).join('');
}
exports.default = { between, tryParseBetween, parseAbbreviatedNumber, cutAfterJS, playError, request, deprecate, lastUpdateCheck, checkForUpdates, isIPv6, normalizeIP, getRandomIPv6, saveDebugFile, getPropInsensitive, setPropInsensitive, applyDefaultAgent, applyOldLocalAddress, applyIPv6Rotations, applyDefaultHeaders, generateClientPlaybackNonce };
//# sourceMappingURL=utils.js.map
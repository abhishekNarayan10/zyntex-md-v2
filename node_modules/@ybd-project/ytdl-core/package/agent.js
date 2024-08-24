"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAgent = void 0;
exports.createAgent = createAgent;
exports.createProxyAgent = createProxyAgent;
exports.addCookies = addCookies;
exports.addCookiesFromString = addCookiesFromString;
const undici_1 = require("undici");
const tough_cookie_1 = require("tough-cookie");
const undici_2 = require("http-cookie-agent/undici");
/* Private Functions */
function convertSameSite(sameSite) {
    switch (sameSite) {
        case 'strict':
            return 'strict';
        case 'lax':
            return 'lax';
        case 'no_restriction':
        case 'unspecified':
        default:
            return 'none';
    }
}
function convertCookie(cookie) {
    if (cookie instanceof tough_cookie_1.Cookie) {
        return cookie;
    }
    else {
        const EXPIRES = typeof cookie.expirationDate === 'number' ? new Date(cookie.expirationDate * 1000) : 'Infinity';
        return new tough_cookie_1.Cookie({
            key: cookie.name,
            value: cookie.value,
            expires: EXPIRES,
            domain: (0, tough_cookie_1.canonicalDomain)(cookie.domain || ''),
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: convertSameSite(cookie.sameSite || ''),
            hostOnly: cookie.hostOnly,
        });
    }
}
/* Public Functions */
function addCookies(jar, cookies) {
    if (!cookies || !Array.isArray(cookies)) {
        throw new Error('cookies must be an array');
    }
    const CONTAINS_SOCS = cookies.some((cookie) => {
        if (cookie instanceof tough_cookie_1.Cookie) {
            return false;
        }
        return cookie.name === 'SOCS';
    });
    if (!CONTAINS_SOCS) {
        cookies.push({
            domain: '.youtube.com',
            hostOnly: false,
            httpOnly: false,
            name: 'SOCS',
            path: '/',
            sameSite: 'lax',
            secure: true,
            session: false,
            value: 'CAI',
        });
    }
    for (const COOKIE of cookies) {
        jar.setCookieSync(convertCookie(COOKIE), 'https://www.youtube.com');
    }
}
function addCookiesFromString(jar, cookies) {
    if (!cookies || typeof cookies !== 'string') {
        throw new Error('cookies must be a string');
    }
    const COOKIES = cookies
        .split(';')
        .map((cookie) => tough_cookie_1.Cookie.parse(cookie))
        .filter((c) => c !== undefined);
    return addCookies(jar, COOKIES);
}
function createAgent(cookies = [], opts = {}) {
    const OPTIONS = Object.assign({}, opts);
    if (!OPTIONS.cookies) {
        const JAR = new tough_cookie_1.CookieJar();
        addCookies(JAR, cookies);
        OPTIONS.cookies = { jar: JAR };
    }
    return {
        dispatcher: new undici_2.CookieAgent(OPTIONS),
        localAddress: OPTIONS.localAddress,
        jar: OPTIONS.cookies.jar,
    };
}
function createProxyAgent(options, cookies = []) {
    if (typeof options === 'string') {
        options = {
            uri: options,
        };
    }
    if (options.factory) {
        throw new Error('Cannot use factory with createProxyAgent');
    }
    const JAR = new tough_cookie_1.CookieJar();
    addCookies(JAR, cookies);
    const ASSIGN_TARGET = {
        factory: (origin, opts) => {
            const CLIENT_OPTIONS = Object.assign({ cookies: { jar: JAR } }, opts);
            return new undici_2.CookieClient(origin, CLIENT_OPTIONS);
        },
    }, PROXY_OPTIONS = Object.assign(ASSIGN_TARGET, options);
    return {
        dispatcher: new undici_1.ProxyAgent(PROXY_OPTIONS),
        localAddress: options.localAddress,
        jar: JAR,
    };
}
const defaultAgent = createAgent();
exports.defaultAgent = defaultAgent;
exports.default = { defaultAgent, createAgent, createProxyAgent, addCookies, addCookiesFromString };
//# sourceMappingURL=agent.js.map
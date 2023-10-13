"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Musixmatch = exports.Google = void 0;
const tslib_1 = require("tslib");
const jsdom_1 = require("jsdom");
const axios_1 = tslib_1.__importDefault(require("axios"));
const requestOptions = {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        Accept: "text/html",
    },
};
function get(dom, querySelect) {
    var _a, _b;
    return (_b = (_a = dom.window.document
        .querySelector(querySelect)) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.split(": ")[1];
}
function Google(name, language = "en") {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!name || typeof name != "string")
            throw new TypeError("Invalid name was provided");
        if (language && typeof language != "string")
            throw new TypeError("Invalid language was provided");
        const { data } = yield (0, axios_1.default)("https://google.com/search", Object.assign(Object.assign({}, requestOptions), { params: { q: `Lyrics ${name}`, lr: `lang_${language}` } }));
        const dom = new jsdom_1.JSDOM(data);
        const elements = Array.from(dom.window.document.querySelectorAll(".ujudUb"));
        if (!elements.length)
            throw new Error("No result were found");
        return {
            songwriters: get(dom, ".auw0zb"),
            title: (_a = dom.window.document.querySelector("div.PZPZlf.ssJ7i.B5dxMb")) === null || _a === void 0 ? void 0 : _a.textContent,
            artist: get(dom, "div[data-attrid='kc:/music/recording_cluster:artist']"),
            genres: get(dom, "div[data-attrid='kc:/music/recording_cluster:skos_genre']"),
            sources: [
                "Google",
                (_b = dom.window.document.querySelector("span.S4TQId")) === null || _b === void 0 ? void 0 : _b.textContent,
            ].filter(Boolean),
            lyrics: elements
                .map((_, i) => {
                const line = Array.from(elements[i].querySelectorAll("span"));
                return line.map((_, index) => line[index].textContent).join("\n");
            })
                .join("\n\n"),
        };
    });
}
exports.Google = Google;
function Musixmatch(name) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!name || typeof name != "string")
            throw new TypeError("Invalid name was provided");
        let data = yield (0, axios_1.default)(`https://musixmatch.com/search/${name}`, requestOptions).then((res) => res.data);
        let dom = new jsdom_1.JSDOM(data);
        const element = dom.window.document.querySelector(".title");
        const [title, artist, endpoint] = [
            element === null || element === void 0 ? void 0 : element.textContent,
            (_a = dom.window.document.querySelector(".artist")) === null || _a === void 0 ? void 0 : _a.textContent,
            element === null || element === void 0 ? void 0 : element.getAttribute("href"),
        ];
        if (!endpoint)
            throw new Error("No result were found");
        data = yield (0, axios_1.default)(`https://musixmatch.com`.concat(endpoint), requestOptions).then((res) => res.data);
        dom = new jsdom_1.JSDOM(data);
        const elements = Array.from(dom.window.document.querySelectorAll(".lyrics__content__ok"));
        return {
            songwriters: (_b = get(dom, ".mxm-lyrics__copyright")) === null || _b === void 0 ? void 0 : _b.replace("\n", ""),
            title,
            artist,
            genres: undefined,
            sources: ["Musixmatch"],
            lyrics: elements.map((_, i) => elements[i].textContent).join("\n\n"),
        };
    });
}
exports.Musixmatch = Musixmatch;

const { default: axios } = require("axios");

async function ping() {

    const start = Date.now();
    await axios.get("https://google.com");
    const end = Date.now();
    const ping = end - start;
    const res = [{
        'r' : ping
    }]
    return res
}

module.exports = {ping}
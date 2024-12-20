const { default: axios } = require("axios");
let newMessage = require("../index.js")
const {reply} = require("../index.js")

newMessage().then((r) => {
    if(r[0].message === 'ping'){
        async function ping() {

            const start = Date.now();
            await axios.get("https://google.com");
            const end = Date.now();
            const ping = end - start;
            reply(ping)
        }
    }
}).catch((err) => {
    console.log(err)
});

module.exports = {ping}
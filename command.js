
const { reply, read, type, react } = require(".")
const { default: axios } = require('axios')

async function cmd(body, prefix,) {
    if (body === prefix + 'ping') {
        read(), type(), react('📍')
        const start = Date.now()
        await axios.get('https://google.com')
        const end = Date.now()
        const ping = end - start
        reply(
            '```Pong: ' + ping + 'ms```'
        )
    }
}

module.exports = cmd;
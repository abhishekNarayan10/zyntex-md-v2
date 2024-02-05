
const { default: axios } = require('axios')
const start = Date.now()
axios.get('https://google.com')
const end = Date.now()
const ping = end - start

console.log(ping)
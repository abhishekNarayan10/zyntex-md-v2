const axios  = require('axios');
const cheerio = require('cheerio');
const qs = require('qs')
require('dotenv').config('./env')

async function instadl(url) {
    const req_url = 'https://v3.saveig.app/api/ajaxSearch'
    const options = {
        q: url ,
        t: 'media',
        lang: 'en'
    }
    const userName = process.env.BRIGHT_USERNAME;
    const passWord = process.env.BRIGHT_PASSWORD;
    const port = 22225;
    const sessionId = (10000000 * Math.random()) | 0
    const u = userName + - + 'session' + - + sessionId
    const hearders = {
        auth: {
            username : u,
            password : passWord
        },
        host: 'brd.superproxy.io',
        port: port,
        rejectUnauthorized: false
    }

    try{

        const response = await axios.post(req_url , qs.stringify(options) , {hearders})
        const $ = cheerio.load(response.data.data)
        const downloadItems = $(".download-items")

        const res = []

        downloadItems.each((index, element) => {
            const download_url = $(element)
            .find(".download-items__btn > a")
            .attr("href")
            res.push({download_url})
        })

        return res

    }catch(err){
        throw new Error(err)
    }
}

module.exports = {instadl}
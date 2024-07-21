const axios  = require('axios');
const cheerio = require('cheerio');
require('dotenv').config('./.env')

async function newsScrape() {
    const url = 'https://www.asianetnews.com/news'
    const userName = process.env.BRIGHT_USERNAME;
    const passWord = process.env.BRIGHT_PASSWORD;
    const port = 22225;
    const sessionId = (10000000 * Math.random()) | 0
    const u = userName + - + 'session' + - + sessionId
    const options = {
        auth: {
            username : u,
            password : passWord
        },
        host: 'brd.superproxy.io',
        port: port,
        rejectUnauthorized: false
    }

    try{

        const response = await axios.get(url , options)
        const $ = cheerio.load(response.data)
        var mainHead = $('h4.art-heading').text().trim()
        var maindHeadThumb = $('#news-lp > div.top-2 > div > section > div > div > div:nth-child(2) > div:nth-child(1) > div > div.large-horizontal-article-with-ad.white-bg.dark-box-shadow > div.arti-img-div > a > img').attr('src')
        var titles = [
            {
                'headNews' : mainHead,
                'thumbnail' : maindHeadThumb
            }
        ]
        var t = $('p.cont-p')
        t.each(function(){
            titles.push({
                title: $(this).text().trim(),
            })
        })
        
        return titles

    }catch(err){
        throw new Error(err)
    }
}

module.exports = { newsScrape }
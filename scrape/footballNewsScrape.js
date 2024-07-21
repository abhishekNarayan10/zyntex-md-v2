const axios  = require('axios');
const cheerio = require('cheerio');
require('dotenv').config('./env')

async function footballNewsScrape() {
    const url = 'https://onefootball.com/en/home'
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
        var mainHead = $('#__next > main > div > div > div.xpaLayoutContainer.XpaLayout_xpaLayoutContainerFullWidth__arqR4.xpaLayoutContainerFullWidth--gallery > div > section > ul > li.Gallery_gallery__teaser--mobile--xl__xyOSs > article > a.NewsTeaser_teaser__content__BP26f > p.NewsTeaser_teaser__title__OsMxr').text().trim()
        var maindHeadThumb = $('#__next > main > div > div > div.xpaLayoutContainer.XpaLayout_xpaLayoutContainerFullWidth__arqR4.xpaLayoutContainerFullWidth--gallery > div > section > ul > li.Gallery_gallery__teaser--mobile--xl__xyOSs > article > a.NewsTeaser_teaser__imageWrapper__BlyNn > div > picture > img').attr('src')
        var titles = [
            {
                'headNews' : mainHead,
                'thumbnail' : maindHeadThumb
            }
        ]
        var t = $('p.NewsTeaser_teaser__title__OsMxr')
        t.each(function(){
            titles.push({
                title: $(this).text().trim(),
            })
        })

        return titles

    }catch(err){
        throw new Error(err)
    }
}footballNewsScrape()

module.exports = { footballNewsScrape }
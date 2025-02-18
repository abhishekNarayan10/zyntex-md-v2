const axios  = require('axios');
const cheerio = require('cheerio');
require('dotenv').config('./env')

async function footballLiveMatch() {
    const url = 'https://onefootball.com/en/matches?only_live=true'
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

        var leagueHead = $('#__next > main > div > div > div:nth-child(6) > div > div > div > div > h2').text().trim()
        var opp1 = $('#__next > main > div > div > div:nth-child(6) > div > div > ul > li:nth-child(1) > a > article > div > div.SimpleMatchCard_simpleMatchCard__teamsContent__vSfWK > div:nth-child(1) > span.SimpleMatchCardTeam_simpleMatchCardTeam__name__7Ud8D').text().trim()
        var opp1s = $('#__next > main > div > div > div:nth-child(6) > div > div > ul > li:nth-child(1) > a > article > div > div.SimpleMatchCard_simpleMatchCard__teamsContent__vSfWK > div:nth-child(1) > span.SimpleMatchCardTeam_simpleMatchCardTeam__score__UYMc_').text().trim()
        var opp2 = $('#__next > main > div > div > div:nth-child(6) > div > div > ul > li:nth-child(1) > a > article > div > div.SimpleMatchCard_simpleMatchCard__teamsContent__vSfWK > div:nth-child(2) > span.SimpleMatchCardTeam_simpleMatchCardTeam__name__7Ud8D').text().trim()
        var opp2s = $('#__next > main > div > div > div:nth-child(6) > div > div > ul > li:nth-child(1) > a > article > div > div.SimpleMatchCard_simpleMatchCard__teamsContent__vSfWK > div:nth-child(2) > span.SimpleMatchCardTeam_simpleMatchCardTeam__score__UYMc_').text().trim()
        var time = $('#__next > main > div > div > div:nth-child(6) > div > div > ul > li:nth-child(1) > a > article > div > div.SimpleMatchCard_simpleMatchCard__matchContent__prwTf > span').text().trim()

        var titles = [
            {
                'league' : leagueHead,
                'opp1' : opp1,
                'opp1score' : opp1s,
                'opp2' : opp2,
                'opp2score' : opp2s,
                'time' : time,
            }
        ]


        console.log(titles)



        // const div = $('#__next > main > div > div > div:nth-child(6) > div')
        // div.each(function(){

        // })



    
        // var mainHead = $('#__next > main > div > div > div.xpaLayoutContainer.XpaLayout_xpaLayoutContainerFullWidth__arqR4.xpaLayoutContainerFullWidth--gallery > div > section > ul > li.Gallery_gallery__teaser--mobile--xl__xyOSs > article > a.NewsTeaser_teaser__content__BP26f > p.NewsTeaser_teaser__title__OsMxr').text().trim()
        // var maindHeadThumb = $('#__next > main > div > div > div.xpaLayoutContainer.XpaLayout_xpaLayoutContainerFullWidth__arqR4.xpaLayoutContainerFullWidth--gallery > div > section > ul > li.Gallery_gallery__teaser--mobile--xl__xyOSs > article > a.NewsTeaser_teaser__imageWrapper__BlyNn > div > picture > img').attr('src')
        
        // var t = $('p.NewsTeaser_teaser__title__OsMxr')
        // t.each(function(){
        //     titles.push({
        //         title: $(this).text().trim(),
        //     })
        // })

        return titles

    }catch(err){
        throw new Error(err)
    }
}footballLiveMatch()

module.exports = { footballLiveMatch }
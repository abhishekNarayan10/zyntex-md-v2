const axios  = require('axios');
const cheerio = require('cheerio');
require('dotenv').config('./env')

async function lyrics(q) {

    const url = `https://genius.com/api/search/multi?per_page=1&q=${q}`
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

    try {

        const response = await axios.get(url, options)
        const lyrics_url = response.data.response.sections[0].hits[0]?.result.url
        const lyrics_thumb = response.data.response.sections[0].hits[0]?.result.header_image_url
        const lyrics_title = response.data.response.sections[0].hits[0]?.result.title
        const author = response.data.response.sections[0].hits[0]?.result.primary_artist_names
        
        const r = await axios.get(lyrics_url , options)
        const $ = cheerio.load(r.data)
        const lyrics = $('#lyrics-root > div.Lyrics__Container-sc-1ynbvzw-1.kUgSbL').text().replace(/([A-HJ-Z])/g, "\n$1").trim()
        let n = lyrics.replace(/[\()]/g, "")
        let n1 = n.replace(/\[/g, "\n");
        let n2 = n1.replace(/]/g, "\n");
        
        const res = [
            {
                'title' : lyrics_title,
                'author' : author,
                'thumbnail' : lyrics_thumb,
                'lyrics' : n2
            }
        ]
        return res
        
    } catch (err) {
        console.log(err)
        
    }

}

module.exports = {lyrics}
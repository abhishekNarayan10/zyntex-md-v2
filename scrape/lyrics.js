const axios  = require('axios');
const cheerio = require('cheerio');
const { RetryHandler } = require('undici-types');
require('dotenv').config('./env')

async function lyrics(faded) {

    const url = `https://lrclib.net/api/search?q=${q}`
    try{

        const r = await fetch(url);
        if(r.status === 404){
            return "Can't find this song!"
        }else{
            const response = await r.json();
            const lyrics_title = response.trackName;
            const author = response.artistName;
            const lyrics_thumb = '';
            const n2 = response.plainLyrics;
        }
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
const axios  = require('axios');
const cheerio = require('cheerio');


async function lyrics(q) {

    const url = `https://lrclib.net/api/search?q=${q}`
    try{

        const r = await fetch(url);
        if(r.status === 404){
            return "Can't find this song!"
        }else{
            const response = await r.json();
            var lyrics_title = response[0].trackName;
            var author = response[0].artistName;
            var lyrics_thumb = '';
            if(response[0].instrumental === true){
                var n2 = "[ Instrumental ]";
                var n3 = "[ Instrumental ]";
            } else {
                n2 = response[0].plainLyrics;
                n3 = response[0].syncedLyrics;
            }
        }
        const res = [
            {
                'title' : lyrics_title,
                'author' : author,
                'thumbnail' : lyrics_thumb,
                'lyrics' : n2,
                'synced_lyrics' : n3
            }
        ] 
        return res
        
    } catch (err) {
        console.log(err)
        
    }

}

module.exports = {lyrics}
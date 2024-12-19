const axios  = require('axios');
const cheerio = require('cheerio');


async function lyrics(q) {

    const url = `https://lrclib.net/api/search?q=${q}`
    try{

        const r = await fetch(url);
        const response = await r.json();
        if(!response[0]){
            var lyrics_title = ":("
            var author = ":( "
            var lyrics_thumb = ":("
            var n2 = "Can't find lyrics for this song!"
            var n3 = "Can't find lyrics for this song!"
        }else{
            lyrics_title = response[0].trackName;
            author = response[0].artistName;
            lyrics_thumb = '';
            if(response[0].instrumental === true){
                n2 = "[ Instrumental ]";
                n3 = "[ Instrumental ]";
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
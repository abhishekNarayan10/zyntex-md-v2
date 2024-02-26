const { default: makeWASocket,
  AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, getAggregateVotesInPollMessage, downloadMediaMessage,
  makeCacheableSignalKeyStore, makeInMemoryStore, PHONENUMBER_MCC, proto,
  useMultiFileAuthState, WAMessageContent, WAMessageKey,
  Mimetype, MessageType,
  MessageOptions
} = require('@whiskeysockets/baileys')
let { Boom } = require("@hapi/boom")
const fs = require('fs')
const ytdl = require('ytdl-core')
require('dotenv').config()
const { Google, Musixmatch } = require("@flytri/lyrics-finder")
const c = require('ansi-colors')
var figlet = require("figlet");
const yts = require('yt-search')
const { default: pino } = require('pino')
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { default: axios } = require('axios')
const fetch = require('node-fetch');
const getFBInfo = require("@xaviabot/fb-downloader");
const randomBgm = require('./assets/Bgm/bgm.js')

let botName = '𝙕𝙮𝙣𝙩3𝙭!'
const prefix = process.env.BOT_PREFIX || '.'
module.exports = prefix
if (process.env.OWNER_NUMBER === undefined || process.env.OWNER_NUMBER === '' || !process.env.OWNER_NUMBER.startsWith('+')) {
  console.log(c.redBright.italic('Plaese set a appropriate value on your .env file for OWNER_NUMBER'))
  return
}
var ownerNumber = process.env.OWNER_NUMBER

if (fs.existsSync('./Zynt3x.mp4')) {
  fs.unlinkSync('./Zynt3x.mp4')
}
if (fs.existsSync('./Zynt3x.mp3')) {
  fs.unlinkSync('./Zynt3x.mp3')
}

figlet.text(
  "ZYNTEX-MD",
  {
    font: "Cybermedium",
    horizontalLayout: "default",
    verticalLayout: "default",
    whitespaceBreak: true,
  },
  function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(c.red.bold(data));
    console.log(c.gray.bold(`------------------------------------------------`))
  }
)
const sessionFile = './session.json'

async function zyntex() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionFile)
  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(c.blue.italic(`Baileys Version: ${version}\nIs Latest: ${isLatest}`))
  console.log(c.gray.bold(`------------------------------------------------`))
  const zyn = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ['Zynt3x - MD', 'safari', '1.0.0']
  })

  zyn.ev.on('creds.update', saveCreds)

  zyn.ev.on('connection.update', async (tex) => {
    let { lastDisconnect, connection } = tex
    if (connection === "connecting") {
      console.log(c.green('Connecting to Whatsapp...'))
    }
    if (connection === "open") {
      await zyn.sendMessage(zyn.user.id, { text: '*BOT STARTED SUCCESSFULLY!*\nPrefix: ' + `${prefix}` + '\n\n _Thanks For Using Zynt3x - MD_' })
      console.log(c.green('Successfully connected to Whatsapp!'))
      console.log(c.green('\n\nBOT STARTED SUCCESSFULLY!'))
    }
    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (reason === DisconnectReason.badSession) {
        console.log(c.red(`Bad Session!, Please Delete ${sessionFile} and Scan Again`));
        zyn.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log(c.blue("Connection closed!, reconnecting...."));
        zyntex();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log(c.blue("Connection Lost from Server!, Reconnecting..."));
        zyntex();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(c.green("Connection Replaced!, Another Session Opened, Please Close Current Session"));
        zyn.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(c.red(`Device Logged Out, Please Delete  '${sessionFile}'  and Scan Again.`));
        zyn.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log(c.green("Restart Required, Restarting..."));
        zyntex();
      } else if (reason === DisconnectReason.timedOut) {
        console.log(c.red("Connection TimedOut,") + c.green(" Reconnecting..."));
        zyntex();
      } else {
        zyn.end(c.red(`DisconnectReason: ${reason}|${lastDisconnect.error}`));
      }
    }
  })

  zyn.ev.on('messages.upsert', async (m) => {

    try {

      let userName = m.messages[0].pushName

      const q = m.messages[0]
      if (!q) return

      const messageTypes = Object.keys(q.message)
      const messageType = messageTypes[0]

      const id = m.messages[0].key.remoteJid
      const key = m.messages[0].key

      let i = {
        remoteJid: q.key.remoteJid,
        id: q.key.id
      }

      let body = ''
      if (messageType === 'conversation' && m.type === 'notify') {
        var grpMsg = q.message.conversation
        body = grpMsg
      } else if (messageType === 'extendedTextMessage' && m.type === 'notify') {
        var dmMsg = q.message.extendedTextMessage.text
        body = dmMsg
      }



      const reply = (msg) => {
        zyn.sendMessage(id, { text: msg }, { quoted: q })
      }

      const sendVideo = async(path , cap) => {
        await zyn.sendMessage(id, {video: {url : path}  , mimetype: 'video/mp4' , caption: cap},{quoted : q})
      }
      const sendImage = async(path , cap) => {
        await zyn.sendMessage(id, {image : {url : path} , caption: cap},{quoted:q})
      }
       const sendAudio = async(path) => {
        await zyn.sendMessage(id, {audio: {url:path}, mimetype: 'audio/mp4'} ,{quoted:q})
      }
      const sendVoice = async(path) => {
        await zyn.sendMessage(id, {audio: {url: path},mimetype: 'audio/mp4' , ptt:true, waveform:  [100, 0, 100, 0, 100, 0, 100]} , {quoted:q})
      }
      const message = (msg) => {
        zyn.sendMessage(id, { text: msg })
      }

      const read = () => {
        zyn.readMessages([q.key])
      }

      const type = () => {
        zyn.sendPresenceUpdate('composing', id)
        delay(1000)
      }

      const record = () => {
        zyn.sendPresenceUpdate('recording', id)
        delay(1000)
      }

      const errorMsg = (query, command, example) => {
        reply('_*' + query + '*_\n\n```ex:  ' + prefix + command + ' <' + example + '>```')
      }

      const react = (emoji) => {
        zyn.sendMessage(id, { react: { text: emoji, key: q.key } })
      }

      if (body === prefix + 'ping') {
        read(), type(), react('📍')
        const start = Date.now()
        await axios.get('https://google.com')
        const end = Date.now()
        const ping = end - start
        return reply(
          '```Pong: ' + ping + 'ms```'
        )
      }

      // await cmd(body,prefix)


      if (body === prefix + 'alive') {

        read(), type(), react('🪼')
        const msg = `*Hey! ${userName}* \n*I'm Alive...*`;
        sendVoice(randomBgm)
        sendImage('./assets/alive.jpg' , msg)

      }

      if (body === prefix + 'quote') {
        read(), type(), react('📜')

        const response = await fetch('https://api.quotable.io/random')
        const quote = await response.json()

        const qc = quote.content
        const qa = quote.author
        reply(`_*${qc}*_\n\n- *${qa}*`)

      }


      if (body.startsWith(prefix + 'ytv')) {
        read(), type(), react('🎥')

        const url = body.slice(4).trim()

        if (!url) {
          errorMsg('Give a Youtube video Url!', 'ytv', 'YouTube Video Url')
        } else {

          try {

            ytdl.getInfo(url).then((res) => {
              const videoTitle = res.videoDetails.title

              reply('_*Downloading...*_\n' + '_' + videoTitle + '_')

              const videoStream = ytdl(url, { quality: '18' })
              const videoFileName = './Zynt3x.mp4'
              videoStream.pipe(fs.createWriteStream(videoFileName))

              videoStream.on('finish', () => {


                async function send() {
                  await zyn.sendMessage(id, { video: { url: videoFileName }, mimetype: 'video/mp4', caption: '```' + videoTitle + '```' }, { quoted: q })
                } send()


              })
            })

          } catch (err) {
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }

      }


      if (body.startsWith(prefix + 'lyrics')) {
        read(), type(), react('💎')

        const lyricQuery = body.slice(8);


        if (!lyricQuery) {
          errorMsg('Need a Query!', 'lyrics', 'Song Name')
        } else {
          try {

            Musixmatch(lyricQuery).then((response) => {


              const title = response.title
              const author = response.artist
              const res = response.lyrics


              try {

                if (response.lyrics.length == 0) {
                  try {
                    Google(lyricQuery).then((res) => {
                      reply(`_*${title}*_\n*${author}*\n\n${res}`)
                    })
                  } catch (err) {
                    reply(err)
                  }
                } else {
                  try {
                    reply(`_*${title}*_\n*${author}*\n\n${res}`)
                  } catch (err) {
                    reply(err)
                  }
                }

              } catch (e) {
                reply('*No Results Found!*')
              }
            })

          } catch (e) {
            reply('*An error occured!*' + e)
          }
        }
      }



      if (body.startsWith(prefix + 'yta')) {
        read(), type(), react('🎶')

        const url = body.slice(4).trim()

        if (!url) {
          errorMsg('Need Youtube video Url!', 'yta', 'YouTube Video Url')
        } else {

          try {

            ytdl.getInfo(url).then((res) => {
              const videoTitle = res.videoDetails.title
              reply('_*Downloading...*_\n' + '_' + videoTitle + '_')


              let stream = ytdl(url, {
                quality: 'lowestaudio',
              })

              const fileName = './Zynt3x.mp3'



              stream.pipe(fs.createWriteStream(fileName))

              stream.on('finish', () => {


                async function send() {

                  await zyn.sendMessage(id, { audio: { url: fileName }, mimetype: 'audio/mp4' }, { quoted: q })

                } send()


              })
            })

          } catch (err) {
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }

      }

      if (body.startsWith(prefix + 'song')) {
        read(), type(), react('🎵')
        const query = body.slice(5)

        if (!query || body.includes('https://youtu.be')) {
          errorMsg('Need a Query!', 'song', 'Query')
        } else {
          try {

            yts(query).then((res) => {
              const videos = res.videos.slice(0, 3)
              const url = videos[0].url
              const r = res.all[0].thumbnail

              ytdl.getInfo(url).then((res) => {
                const videoTitle = res.videoDetails.title

                reply('_*Downloading...*_\n' + '_' + videoTitle + '_')


                let stream = ytdl(url, {
                  quality: 'lowestaudio',
                })

                const fileName = './Zynt3x.mp3'



                stream.pipe(fs.createWriteStream(fileName))

                stream.on('finish', () => {


                  async function send() {

                    await zyn.sendMessage(id, {
                      audio: { url: fileName }, mimetype: 'audio/mp4', contextInfo: {
                        externalAdReply: {
                          title: videoTitle,
                          body: botName,
                          thumbnailUrl: r,
                          mediaType: 1,
                          showAdAttribution: true,
                          renderLargerThumbnail: false,
                          sourceUrl: res.videoDetails.video_url
                        }
                      }
                    }, { quoted: q })

                  } send()


                })

              })



            })

          } catch (err) {
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }


      }




      if (body.startsWith(prefix + 'video')) {
        read(), type(), react('🎦')

        const query = body.slice(6)

        if (!query || body.includes('https://youtu.be')) {
          errorMsg('Need a Query!', 'video', 'Query')
        } else {

          try {

            yts(query).then((res) => {
              const videos = res.videos.slice(0, 3)
              const url = videos[0].url

              ytdl.getInfo(url).then((res) => {
                const videoTitle = res.videoDetails.title

                reply('_*Downloading...*_\n' + '_' + videoTitle + '_')

                const videoStream = ytdl(url, { quality: '18' })
                const videoFileName = './Zynt3x.mp4'
                videoStream.pipe(fs.createWriteStream(videoFileName))

                videoStream.on('finish', () => {


                  async function send() {
                    await zyn.sendMessage(id, { video: { url: videoFileName }, mimetype: 'video/mp4', caption: '```' + videoTitle + '```' }, { quoted: q })
                  } send()


                })
              })

            })

          } catch (err) {
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }

      }


      // if(body.startsWith(prefix + 'ig')){
      //   read()
      //   const url = body.slice(3).trim()
      //   if(!url) throw errorMsg('Need a Instagram Link!' , 'ig' , 'Instagram Link')

      //   try {
      //     var res = await fetch(`https://inrl-web-fkns.onrender.com/api/insta?url=${url}`);
      //     let rr = await res.json().then((r) => {

      //       if (!r || !r.result || r.result.length === 0) {
      //         reply('_*No Results Found!*_');
      //       }else{
      //         const result = r.result[0]

      //         async function send(){  
      //           await zyn.sendMessage(id, {video: {url: result}, mimetype:'video/mp4' , caption: botName + ' with ❤️'},{quoted:q})
      //         }send()
      //       }

      //     })
      //   } catch (err) {
      //     reply('*An Error Occured!*\n' + `_*${err}*_`);
      //   }

      // }


      if (body.startsWith(prefix + 'ai')) {
        read(), type(), react('🪄')
        let query = body.slice(3)

        if (!query) {
          errorMsg('Need a Query!', 'ai', 'Query')
        } else {
          reply('*Generating...*  🔄')
          try {

            const genAI = new GoogleGenerativeAI("AIzaSyBd4SAi5JADrlqYS0m4gvWMlWSiSVD2Wyg");

            async function run() {
              const model = genAI.getGenerativeModel({ model: "gemini-pro" });
              const result = await model.generateContent(query);
              const response = await result.response;
              const text = response.text();
              reply(text);
            }

            run();

          } catch (err) {

            reply('*An Error Occured!*\n' + `_*${err}*_`)

          }
        }

      }

      if (body.startsWith(prefix + 'error')) {
        read(), type(), react('🧰')
        const query = body.slice('6')
        if (!query) {
          errorMsg('Need a Query!', 'error', 'Query')
        } else {
          let bot = zyn.user.id
          let date = new Date().getDate()
          let month = new Date().getMonth()
          let year = new Date().getFullYear()
          let h = new Date().getHours()
          let m = new Date().getMinutes()
          let s = new Date().getSeconds()
          const i = `${bot} , ${date}/${month}/${year} , ${h};${m};${s}`
          const msg = `*Error[${i}]:* ` + '```' + query + '```'

          await zyn.sendMessage('916282888139@s.whatsapp.net', { text: msg }).then(
            reply('*Thank you for describing your error!* \n*Your error has been sent to admin.*')
          )
        }
      }

      if(body === prefix + 'technews'){
        read(),type(),react('📰')
        async function randomTechNews() {
          try{
            const newsArray = await axios.get("https://fantox001-scrappy-api.vercel.app/technews/random")
            const randomNews = newsArray.data;
            const news = randomNews.news
            const thumb = randomNews.thumbnail
            const msg = `*${news}*`
            sendImage(thumb , msg)
          } catch(err){
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }
        
        randomTechNews();
      }

      if(body.startsWith(prefix + 'fb')){
        read(),type(),react('☄️')
        const url = body.slice(3)
        if(!url){
          errorMsg('Need a Facebook Url!' , 'fb', 'Url')
        }else{
          try {
            reply('_*Downloading...*_') 
            getFBInfo(url).then((res) => {
              sendVideo(res.hd , res.title)
            })
          } catch (err) {
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }
      }

      if(body.startsWith(prefix + 'yts')){
        read(),type(),react('')
        const query = body.slice(5)
        if(!query){
          errorMsg('Need a Query or a Youtube video Url' , 'yts' , 'Query/Url')
        }else if(query.includes('https://youtu.be')){
          read(),type(),react()
          const videoId = body.slice(5)
          const id = videoId.split('https://youtube.com/watch?v=')
          try{
            yts({videoId: id[1]}).then((res)=>{
            let cap = `•ᴛɪᴛʟᴇ: *${res.title}* \n •ᴜʀʟ: *${res.url}* \n •ᴅᴜʀᴀᴛɪᴏɴ: *${res.timestamp}* \n •ᴠɪᴇᴡꜱ: *${res.views}* \n •ᴀᴜᴛʜᴏʀ: *${res.author}* •ᴜᴘʟᴏᴅᴇᴅ: *${res.ago} \n •ᴜᴘʟᴏᴀᴅᴇᴅ ᴅᴀᴛᴇ: *${res.uploadDate}* \n •ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ: _${res.description}_ `
            sendImage(res.thumbnail , cap )
          })
          }catch(err){
           reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }else{
          try{
            yts(query).then((res)=>{
              const r = res.videos
              var msg = `_Search results for '${query}'._\n\n\n *1. ${r[0].title}* \n _Url: ${r[0].url}_ \n\n *2. ${r[1].title}* \n _Url: ${r[1].url}_ \n\n *3. ${r[2].title}* \n _Url: ${r[2].url}_ \n\n *4. ${r[3].title}* \n _Url: ${r[3].url}_ \n\n *5. ${r[4].title}* \n _Url: ${r[4].url}_ \n\n *6. ${r[5].title}* \n _Url: ${r[5].url}_ \n\n *7. ${r[6].title}* \n _Url: ${r[6].url}_ \n\n *8. ${r[7].title}* \n _Url: ${r[7].url}_ \n\n *9. ${r[8].title}* \n _Url: ${r[8].url}_ \n\n *10. ${r[9].title}* \n _Url: ${r[9].url}_ \n\n _For downloading:_ \n     _${prefix}yta <Copied Url> (For audio)._ \n     _${prefix}ytv <Copied Url> (For video)._ \n\n _${prefix}yts <Copied Url> (Gets you more information of the video)._ \n\n _Note: Videos larger than 100MB is not sent._`
              reply(msg)
            })
          }catch(err){
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }
      }


    } catch (err) {
      console.log(err)
    }

  })

} zyntex()    

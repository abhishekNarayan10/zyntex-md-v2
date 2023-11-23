const {default:makeWASocket,
AnyMessageContent,delay, DisconnectReason, fetchLatestBaileysVersion, getAggregateVotesInPollMessage,downloadMediaMessage,
makeCacheableSignalKeyStore, makeInMemoryStore, PHONENUMBER_MCC,proto,
useMultiFileAuthState, WAMessageContent,WAMessageKey, 
Mimetype, MessageType, 
MessageOptions
} = require('@whiskeysockets/baileys')
let { Boom } = require("@hapi/boom")
const fs = require('fs')
const ytdl = require('ytdl-core')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
require('dotenv').config()
const { Google, Musixmatch } = require("@flytri/lyrics-finder")
const c = require('ansi-colors')
var figlet = require("figlet");
const yts = require( 'yt-search' )
const { generate } = require("sanzy-chatgptv2")
const { default: pino } = require('pino')


let botName = '𝙕𝙮𝙣𝙩𝙚𝙭!'
const prefix = process.env.BOT_PREFIX || '.'
module.exports = prefix
if(process.env.OWNER_NUMBER === undefined || process.env.OWNER_NUMBER === '' || !process.env.OWNER_NUMBER.startsWith('+') ){
  console.log(c.redBright.italic('Plaese set a appropriate value on your .env file for OWNER_NUMBER'))
  return
}else{
  var ownerNumber = process.env.OWNER_NUMBER
}

if(fs.existsSync('./Zynt3x.mp4')){
  fs.unlinkSync('./Zynt3x.mp4')
}
if(fs.existsSync('./Zynt3x.mp3')){
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
    const { version , isLatest } = await fetchLatestBaileysVersion()
    console.log(c.blue.italic(`Baileys Version: ${version}\nIs Latest: ${isLatest}` ))
    console.log(c.gray.bold(`------------------------------------------------`))
    const zyn = makeWASocket({
      logger: pino({level: "silent"}),
      printQRInTerminal: true,
      auth: state,
      browser:['Zynt3x - MD' , 'safari' , '1.0.0']
    })


    zyn.ev.on('connection.update' , async(tex) => {
      let { lastDisconnect , connection } = tex
      if(connection) {
        console.log(c.green(`Connection Status: ${connection}`))
      }
      if (connection === "close") {
        let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (reason === DisconnectReason.badSession) {
        console.log(c.red(`Bad Session!, Please Delete ${sessionFile} and Scan Again`));
        zyn.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log(c.blue("Connection closed!, reconnecting...."));
        zyntex();
      }else if (reason === DisconnectReason.connectionLost) {
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
      }}
    })

    zyn.ev.on('messages.upsert' , async(m) => {

      try{

        let userName = m.messages[0].pushName

        const q = m.messages[0]
        if(!q) return

        const messageTypes = Object.keys (q.message)
        const messageType = messageTypes[0]

        const id = m.messages[0].key.remoteJid
        const key = m.messages[0].key

        let msg = {
          remoteJid: q.key.remoteJid ,
          id: q.key.id
        }

        let body = ''
        if(messageType === 'conversation' && m.type === 'notify'){
          var grpMsg = q.message.conversation
          body = grpMsg
        }else if (messageType === 'extendedTextMessage' && m.type === 'notify'){
          var dmMsg = q.message.extendedTextMessage.text
          body = dmMsg 
        }



        const reply = (msg) => {
          zyn.sendMessage(id, { text: msg }, { quoted: q })
        }
        const message = (msg) => {
          zyn.sendMessage(id, {text: msg})
        }
      
        const read = () =>{
          zyn.readMessages([q.key])
        }

        const type = () => {
          zyn.sendPresenceUpdate('composing' , id)
          delay(1000)
        }

        const record = () => {
          zyn.sendPresenceUpdate('recording' , id)
          delay(1000)
        }

        const errorMsg = (query , command , example) => {
          reply('_*' + query + '*_\n\n```ex:  ' +prefix + command + ' <' + example + '>```')
        }

        const reaction = {
          react: {
            key: msg
          }
        }

        //messaging!


        if(body === prefix +'alive'){

          read() , type()

          const response = await fetch('https://api.quotable.io/random')
          const quote = await response.json()
        
          const qc = quote.content
          const qa = quote.author

          const msg = '*Hey! Im Alive*' + '\n\n' + '```' + qc + '\n\n-' + qa + '```'

          await zyn.sendMessage(id, {image: {url : 'https://i.ibb.co/bj0z6Qk/Picsart-23-01-13-22-45-07-160.jpg'} , caption:msg} , {quoted:q})



        }

        

        if(body.startsWith(prefix + 'ai')){
          read() , type()
          
          let query = body.slice(3)

          if(!query){
            errorMsg('Need a Query!' , '.ai' , 'Query')
          }else{
            try{

              async function gpt(){

                generate(query).then((res) => {
            
                  reply(res.reply)
                    
                }).catch((err) => {
                  reply('*An Error Occured!*\n' + `_*${err}*_`)
                })
              }gpt()

            }catch(err){

              reply('*An Error Occured!*\n' + `_*${err}*_`)

            }
          }
        
        }


        if(body === prefix + 'quote'){
          read() , type()
  
          const response = await fetch('https://api.quotable.io/random')
          const quote = await response.json()
                                      
          const qc = quote.content
          const qa = quote.author
          reply(`_*${qc}*_\n\n- *${qa}*`)
            
        }


        if(body.startsWith(prefix + 'ytv')){
          read() , type()

          const url = body.slice(4).trim()
      
          if(!url){
            errorMsg('Give a Youtube video Url!' , 'ytv' , 'YouTube Video Url')
          }else{
      
              try{
      
              ytdl.getInfo(url).then((res) => {
                  const videoTitle = res.videoDetails.title
                      
                  reply('_*Downloading...*_\n' + '_' + videoTitle + '_')
                      
                      const videoStream = ytdl(url, { quality: '18' })
                      const videoFileName = './Zynt3x.mp4'
                      videoStream.pipe(fs.createWriteStream(videoFileName))
                      
                      videoStream.on('finish', () => {
                      
      
                        async function send(){  
                          await zyn.sendMessage(id, {video: {url: videoFileName}, mimetype:'video/mp4', caption: '```' + videoTitle + '```'},{quoted:q})
                        }send()
                          
                      
                      })
                  })
              
                  }catch(err){
                  reply('*An Error Occured!*\n' + `_*${err}*_`)
                  }
              }
                  
      }


      if(body.startsWith(prefix + 'lyrics')){
          read() , type()

            const lyricQuery = body.slice(8);
  
  
           if(!lyricQuery){
             errorMsg('Need a Query!', 'lyrics' , 'Song Name')
            }else{
              try{

                Musixmatch(lyricQuery).then((response) => {
      
  
                  const title = response.title
                  const author = response.artist
                  const res = response.lyrics
        
    
                  try{

                    if(response.lyrics.length == 0){
                    try{
                       Google(lyricQuery).then((res)=>{
                        reply(`_*${title}*_\n*${author}*\n\n${res}`)
                       })
                     }catch(err){
                      reply(err)
                     }
                   }else{
                     try{
                       reply(`_*${title}*_\n*${author}*\n\n${res}`)
                     }catch(err){
                       reply(err)
                     }
                  }

                  }catch(e){
                    reply('*No Results Found!*')
                  }
                })

              }catch(e){
                reply('*An error occured!*' + e)
              }
            }
          }



          if(body.startsWith(prefix + 'yta')){
            read() , type()

            const url = body.slice(4).trim()
        
            if(!url){
              errorMsg('Need Youtube video Url!' , 'yta' , 'YouTube Video Url')
            }else{
        
                try{
        
                ytdl.getInfo(url).then((res) => {
                    const videoTitle = res.videoDetails.title
                    const r = res.videoDetails.thumbnail.thumbnails[4].url
                        
                    reply('_*Downloading...*_\n' + '_' + videoTitle + '_')


                    let stream = ytdl(url, {
                      quality: 'lowestaudio',
                    })

                    const fileName = './Zynt3x.mp3'



                    stream.pipe(fs.createWriteStream(fileName))
                      
                      stream.on('finish', () => {
                      
      
                        async function send(){  

                          await zyn.sendMessage(id, {audio: {url: fileName}, mimetype:'audio/mp4'},{quoted:q})
                          
                        }send()
                          
                      
                      })
                    })
                
                    }catch(err){
                    reply('*An Error Occured!*\n' + `_*${err}*_`)
                    }
                }
                    
        }



        if(body.startsWith(prefix + 'song')){
          await zyn.sendMessage(id, {react: {text: '💫' , key: i}})
          read() , type()
          
          const query = body.slice(5)
      
          if(!query){
            errorMsg('Need a Query!' , 'song' , 'Query')
          }else{
      
              try{

                yts(query).then((res) => {
                  const videos = res.videos.slice(0 , 3)
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
                      
      
                        async function send(){  

                          await zyn.sendMessage(id, {audio: {url: fileName}, mimetype:'audio/mp4' ,contextInfo: {
                            externalAdReply: {
                              title: videoTitle,
                              body: botName,
                              thumbnailUrl: r,
                              mediaType: 1,
                              showAdAttribution: true,
                              renderLargerThumbnail: false,
                              sourceUrl: res.videoDetails.video_url
                            }
                          }},{quoted:q})
                          
                        }send()
                          
                      
                      })
                    
                    })


                  
                })
              
                  }catch(err){
                  reply('*An Error Occured!*\n' + `_*${err}*_`)
                  }
              }
                  
      }





      if(body.startsWith(prefix + 'video')){
        read() , type()

        const query = body.slice(6)
    
        if(!query){
          errorMsg('Need a Query!' , 'video' , 'Query')
        }else{
    
            try{

              yts(query).then((res) => {
                const videos = res.videos.slice(0 , 3)
                const url = videos[0].url

                ytdl.getInfo(url).then((res) => {
                  const videoTitle = res.videoDetails.title
                      
                  reply('_*Downloading...*_\n' + '_' + videoTitle + '_')
                      
                      const videoStream = ytdl(url, { quality: '18' })
                      const videoFileName = './Zynt3x.mp4'
                      videoStream.pipe(fs.createWriteStream(videoFileName))
                      
                      videoStream.on('finish', () => {
                      
      
                        async function send(){  
                          await zyn.sendMessage(id, {video: {url: videoFileName}, mimetype:'video/mp4', caption: '```' + videoTitle + '```'},{quoted:q})
                        }send()
                          
                      
                      })
                  })
                
                })
            
                }catch(err){
                reply('*An Error Occured!*\n' + `_*${err}*_`)
                }
            }
                
      }

        
      if(body.startsWith(prefix + 'ig')){
        read()
        const url = body.slice(3).trim()
        if(!url) throw errorMsg('Need a Instagram Link!' , 'ig' , 'Instagram Link')

        try {
          var res = await fetch(`https://inrl-web-fkns.onrender.com/api/insta?url=${url}`);
          let rr = await res.json().then((r) => {

            if (!r || !r.result || r.result.length === 0) {
              reply('_*No Results Found!*_');
            }else{
              const result = r.result[0]
  
              async function send(){  
                await zyn.sendMessage(id, {video: {url: result}, mimetype:'video/mp4' , caption: botName + ' with ❤️'},{quoted:q})
              }send()
            }
  
          })
        } catch (err) {
          reply('*An Error Occured!*\n' + `_*${err}*_`);
        }

      }
        

      
     }catch(err){
        console.log(err)
      }
      
    })

  zyn.ev.on('creds.update', saveCreds)

}zyntex()    

const {default:makeWASocket,
AnyMessageContent,
delay, 
DisconnectReason, 
fetchLatestBaileysVersion, 
getAggregateVotesInPollMessage, 
makeCacheableSignalKeyStore, 
makeInMemoryStore, 
PHONENUMBER_MCC,
proto, 
useMultiFileAuthState, 
WAMessageContent, 
WAMessageKey, 
Mimetype, 
MessageType, 
MessageOptions} = require('@whiskeysockets/baileys')
let { Boom } = require("@hapi/boom")
const fs = require('fs')
const ytdl = require('ytdl-core')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
require('dotenv').config()
const { Google, Musixmatch } = require("@flytri/lyrics-finder")
const c = require('ansi-colors')
var figlet = require("figlet");



const prefix = process.env.BOT_PREFIX || '.'
if(process.env.OWNER_NUMBER === undefined || process.env.OWNER_NUMBER === '' || !process.env.OWNER_NUMBER.startsWith('+') ){
  console.log(c.redBright.italic('Plaese set a appropriate value on your .env file for OWNER_NUMBER'))
  return
}else{
  var ownerNumber = process.env.OWNER_NUMBER
}

if(fs.existsSync('./Zynt3x.mp4')){
  fs.unlinkSync('./Zynt3x.mp4')
}
// if(fs.existsSync('./Zynt3x.mp3')){
//   fs.unlinkSync('./Zynt3x.mp3')
// }
// if(fs.existsSync('./Zynt3x.png')){
//   fs.unlinkSync('./Zynt3x.png')
// }

figlet("Zynt3x-MD", function (e , data) {
    console.log(c.redBright.bold(data))
    if(e){
        console.log(e)
    }
    console.log(c.gray.bold(`------------------------------------------------`))
});

const sessionFile = './session.json'

async function zyntex() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionFile)
    const { version , isLatest } = await fetchLatestBaileysVersion()
    console.log(c.blue.italic(`Baileys Version: ${version}\nIs Latest: ${isLatest}` ))
    console.log(c.gray.bold(`------------------------------------------------`))
    const zyn = makeWASocket({
      printQRInTerminal: true,
      auth: state,
    })

    zyn.ev.on('creds.update', saveCreds)

    zyn.ev.on('connection.update' , async(tex) => {
      let { lastDisconnect , connection } = tex
      if(connection) {
        console.log(c.green(`Connection Status: ${connection}`))
      }
      if (connection === "close") {
        let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (reason === DisconnectReason.badSession) {
        console.log(c.red(`Bad Session!, Please Delete session.json and Scan Again`));
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

        const q = m.messages[0]
        if(!q) return

        const messageTypes = Object.keys (q.message)
        const messageType = messageTypes[0]

        const id = m.messages[0].key.remoteJid

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
      
        const read = ()=>{
          zyn.readMessages([q.key])
        }

        const replyVideo = (u , c) => {
          zyn.sendMessage(id, {video: {url: u}, mimetype:'video/mp4', caption: c},{quoted:q})
        }

        const type = () => {
          zyn.sendPresenceUpdate('composing' , id)
          delay(1000)
        }

        const recording = () => {
          zyn.sendPresenceUpdate('recording' , id)
          delay(1000)
        }

        //messaging!

        if (body.startsWith(prefix + 'ai')) {read() , type()
          const command = `tgpt -q "${body.slice(3).trim()}"`;
          try {
            const { stdout, stderr } = await executeCommand(command);
            const response = stdout || stderr;
            reply(response);
          } catch (error) {
            reply(`Error: ${error.message}`);
          }
      
          async function executeCommand(command) {
            try {
              const { stdout, stderr } = await exec(command);
              return{ stdout, stderr };
            } catch (error) {
              throw error;
            }
        }
        }
        if(body === prefix + 'quote'){read() , type()
  
          const response = await fetch('https://api.quotable.io/random')
          const quote = await response.json()
                                      
          const qc = quote.content
          const qa = quote.author
          reply(`_*${qc}*_\n\n- *${qa}*`)
            
        }


        if(body.startsWith(prefix + 'yt')){read() , type()
          const url = body.slice(3).trim()
      
          if(!url){
              reply('_*Give a Youtube Url*_\n\n```ex:' + prefix + 'yt <YouTube Video Url>```')
          }else{
      
              try{
      
              ytdl.getInfo(url).then((res) => {
                  const videoTitle = res.videoDetails.title
                      
                  reply('_*Downloading...*_\n' + '_' + videoTitle + '_')
                      
                      const videoStream = ytdl(url, { quality: '18' })
                      const videoFileName = 'Zyntex.mp4'
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
       




      }catch(err){
        console.log(err)
      }
      



    })




    // zyn.ev.on('messages.upsert' , async(m) => {
    //   try{
    //     const q = m.messages[0]
    //     if(!q) return

    //     const messageTypes = Object.keys (q.message)
    //     const messageType = messageTypes[0]
    //     const id = m.messages[0].key.remoteJid
    //     const fromMe = m.messages[0].key.fromMe === true

    //     const reply = (msg) => {
    //       zyn.sendMessage(id, { text: msg }, { quoted: q })
    //     }
    //      const message = (msg) => {
    //       zyn.sendMessage(id, {text: msg})
    //     }

    //     const read = ()=>{
    //       zyn.readMessages([q.key])
    //     }
    //     const react = (r) =>{
    //       react: {
    //         text: r
    //         key: [q.key]
    //       }
    //     }
    //     // const gm = q.message.conversation
    //     // const dm = q.message.extendedTextMessage.text

    //     // const body = (messageType === 'conversation') ? gm : '' || (messageType === 'extendedTextMessage') ? dm : ''

    //     // messaging in group
    //     if(messageType === 'conversation' && m.type === 'notify'){
    //       const body = q.message.conversation


    //       if(body === prefix + 'quote'){quote()
  
    //         const response = await fetch('https://api.quotable.io/random')
    //         const quote = await response.json()
                                
    //         const qc = quote.content
    //         const qa = quote.author
    //         reply(`_*${qc}*_\n\n- *${qa}*`)
      
    //       }

    //       if(body.startsWith(prefix + 'yt')){
    //         const url = body.slice(3).trim()

    //         if(!url){
    //           reply('_*Give me a Youtube Url*_\n\n```ex:' + prefix + 'yt <YouTube Video Url>```')
    //         }else{

    //           try{

    //             ytdl.getInfo(url).then((res) => {
    //               const videoTitle = res.videoDetails.title
                
    //               reply('_*Downloading...*_\n' + '_' + videoTitle + '_')
                
    //               const videoStream = ytdl(url, { quality: '18' })
    //               const videoFileName = 'Zynt3x.mp4'
    //               videoStream.pipe(fs.createWriteStream(videoFileName))
                  
    //               videoStream.on('end', () => {
                
    //                 async function yt(){
      
    //                   try{

    //                     await zyn.sendMessage(id, {video: {url:videoFileName}, caption: '```' + videoTitle + '```'},{quoted:q}).then(()=>{
    //                       fs.unlink(videoFileName)
    //                     })

    //                   }catch(er){}
    //                 }yt()
                
    //               })
    //             })
        
    //           }catch(err){
    //             reply('*An Error Occured!*\n' + `_*${err}*_`)
    //           }
    //         }
            
    //       }

    //       if(body.startsWith(prefix + 'lyrics')){read()

    //         const lyricQuery = body.slice(8).trim();
  
  
    //        if(!lyricQuery){
    //          reply('```Please provide a song name!\n\nex:```' + prefix + '```lyrics <Song Name>```');
    //         }else{
    //           try{

    //             Musixmatch(lyricQuery).then((response)=>{
      
  
    //               const title = response.title
    //               const author = response.artist
    //               const res = response.lyrics
        
    
    //               if(response.lyrics.length == 0){
    //                 try{
    //                    Google(lyricQuery).then((res)=>{
    //                     reply(`_*${title}*_\n*${author}*\n\n${res}`)
    //                    })
    //                  }catch(err){
    //                   reply(err)
    //                  }
    //                }else{
    //                  try{
    //                    reply(`_*${title}*_\n*${author}*\n\n${res}`)
    //                  }catch(err){
    //                    reply(err)
    //                  }
    //               }
    //             })

    //           }catch(err){
    //             reply('*No Results Found!*')
    //           }
    //         }
    //       }

           
    //     // messaging in dm
    //     }else if(messageType === 'extendedTextMessage' && m.type === 'notify'){
    //       const body = q.message.extendedTextMessage.text


    //       if(body === prefix + 'quote'){read()
  
    //         const response = await fetch('https://api.quotable.io/random')
    //         const quote = await response.json()
                                
    //         const qc = quote.content
    //         const qa = quote.author
    //         reply(`_*${qc}*_\n\n- *${qa}*`)
      
    //       }


    //       if(body.startsWith(prefix + 'yt')){
    //         read()
    //         react(reaction[0].yt)

    //         const url = body.slice(3).trim()

    //         if(!url){
    //           reply('_*Give me a Youtube Url*_\n\n```ex:' + prefix + 'yt <YouTube Video Url>```')
    //         }else{

    //           try{

    //             ytdl.getInfo(url).then((res) => {
    //               const videoTitle = res.videoDetails.title
                
    //               reply('_*Downloading...*_\n' + '_' + videoTitle + '_')
                
    //               const videoStream = ytdl(url, { quality: '18' })
    //               const videoFileName = 'Zynt3x.mp4'
    //               videoStream.pipe(fs.createWriteStream(videoFileName))
                  
    //               videoStream.on('end', () => {
                
      
    //                 async function yt(){

    //                   try{

    //                     await zyn.sendMessage(id, {video: {url:videoFileName}, caption: '```' + videoTitle + '```'},{quoted:q}).then(()=>{
    //                       fs.unlink(videoFileName)
    //                     })

    //                   }catch(err){}
                      

    //                 }yt()
              
                
    //               })
    //             })
        
    //           }catch(err){
    //             reply('*An Error Occured!*\n' + `_*${err}*_`)
    //           }

    //         }
            
    //       }



           
    //       if(body.startsWith(prefix + 'lyrics')){read()

    //         const lyricQuery = body.slice(8).trim();
  
  
    //        if(!lyricQuery){
    //          reply('```Please provide a song name!\n\nex: .lyrics faded```');
    //         }else{

    //           try{
    //             Musixmatch(lyricQuery).then((response)=>{
      
  
    //               const title = response.title
    //               const author = response.artist
    //               const res = response.lyrics
      
    //               if(response.lyrics.length == 0){
    //                 try{
    //                    Google(lyricQuery).then((res)=>{
    //                     reply(`_*${title}*_\n*${author}*\n\n${res}`)
    //                    })
    //                  }catch(err){
    //                   reply(err)
    //                  }
    //                }else{
    //                  try{
    //                    reply(`_*${title}*_\n*${author}*\n\n${res}`)
    //                  }catch(err){
    //                    reply(err)
    //                  }
    //                 }
    //             })
    //           }catch(err){
    //             reply('*No Results Found!*')
    //           }
  
              
    //         }
    //       }


        
        
        
        
        
        
        
    //     }
    //   }catch(err){
    //     console.log(err)
    //   }
    // })


}zyntex()    

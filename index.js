const {
  default: makeWASocket,
  AnyMessageContent,
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  getAggregateVotesInPollMessage,
  downloadMediaMessage,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  PHONENUMBER_MCC,
  proto,
  useMultiFileAuthState,
  WAMessageContent,
  WAMessageKey,
  Mimetype,
  MessageType,
  MessageOptions,
  jidNormalizedUser,
  BufferJSON,} = require("@whiskeysockets/baileys");
let { Boom } = require("@hapi/boom");
const fs = require("fs");
const ytdl = require('@distube/ytdl-core');
require("dotenv").config();
const c = require("ansi-colors");
var figlet = require("figlet");
const yts = require("yt-search");
const { default: pino } = require("pino");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { default: axios } = require("axios");
const randomBgm = require('./assets/Bgm/bgm.js');
const randomAliveImages = require('./assets/Alive Images/alive_img.js')
const mumaker = require('mumaker')
const CryptoJS = require("crypto-js");
const {newsScrape} = require('./scrape/newsScrape.js')
const {footballNewsScrape} = require('./scrape/footballNewsScrape.js')
const {instadl} = require('./scrape/instadl')
const {lyrics} = require('./scrape/lyrics.js')

 
////////////plugins/////////////

// const {ping} = require('./plugins/ping.js')
// const {quote} = require('./plugins/quote.js')

////////////plugins/////////////


let botName = "𝙕𝙮𝙣𝙩3𝙭!";
const prefix = process.env.BOT_PREFIX || ".";
if (
  process.env.OWNER_NUMBER === undefined ||
  process.env.OWNER_NUMBER === "" ||
  !process.env.OWNER_NUMBER.startsWith("+")
) {
  console.log(
    c.redBright.italic(
      "Plaese set a appropriate value on your .env file for OWNER_NUMBER"
    )
  );
  return;
}
var ownerNumber = process.env.OWNER_NUMBER;

if (fs.existsSync("./Zynt3x.mp4")) {
  fs.unlinkSync("./Zynt3x.mp4");
}
if (fs.existsSync("./Zynt3x.mp3")) {
  fs.unlinkSync("./Zynt3x.mp3");
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
    console.log(
      c.gray.bold(`------------------------------------------------`)
    );
  }
);
if(process.env.SESSION_ID === undefined){
  console.log(c.red("No session ID found in .env file"))
}else if (!process.env.SESSION_ID.startsWith('Zynt3x:::')){
  console.log(c.red("Session ID is not valid!"))
}
const sessionFile = "./session";
  const data = process.env.SESSION_ID
  const ciphertext = data.slice(9)
  var bytes  = CryptoJS.AES.decrypt(ciphertext, 'Zynt3x!');
  var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  const t = JSON.stringify(decryptedData)
  let file = fs.createWriteStream('./session/creds.json')
  file.write(t)

// fs.writeFile('./session/creds.json', t, function (err) {
//   if (err) throw err;
//   console.log('SESSION FILE CREATED');
// });

async function zyntex() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionFile);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(
    c.blue.italic(`Baileys Version: ${version}\nIs Latest: ${isLatest}`)
  );
  console.log(c.gray.bold(`------------------------------------------------`));
  const zyn = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["Zynt3x - MD", "safari", "1.0.0"],
  });

  zyn.ev.on("creds.update", saveCreds);

  zyn.ev.on("connection.update", async (tex) => {
    let { lastDisconnect, connection } = tex;
    if (connection === "connecting") {
      console.log(c.green("Connecting to Whatsapp..."));
    }
    if (connection === "open") {
      await zyn.sendMessage(zyn.user.id, {
        text:
          "*BOT STARTED SUCCESSFULLY!*\nPrefix: " +
          `${prefix}` +
          "\n\n _Thanks For Using Zynt3x - MD_",
      });
      console.log(c.green("Successfully connected to Whatsapp!"));
      console.log(c.green("\n\nBOT STARTED SUCCESSFULLY!"));
    }
    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(
          c.red(`Bad Session!, Please Delete ${sessionFile} and Scan Again`)
        );
        zyn.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log(c.blue("Connection closed!, reconnecting...."));
        zyntex();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log(c.blue("Connection Lost from Server!, Reconnecting..."));
        zyntex();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          c.green(
            "Connection Replaced!, Another Session Opened, Please Close Current Session"
          )
        );
        zyn.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(
          c.red(
            `Device Logged Out, Please Delete '${sessionFile}' and Scan Again.`
          )
        );
        zyn.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log(c.green("Restart Required, Restarting..."));
        zyntex();
      } else if (reason === DisconnectReason.timedOut) {
        console.log(
          c.red("Connection TimedOut,") + c.green(" Reconnecting...")
        );
        zyntex();
      } else {
        zyn.end(c.red(`DisconnectReason: ${reason}|${lastDisconnect.error}`));
      }
    }
  });

  zyn.ev.on("messages.upsert", async (m) => {
    try {
      let userName = m.messages[0].pushName;

      const q = m.messages[0];
      if (!q) return;

      const messageTypes = Object.keys(q?.message)
      const messageType = messageTypes[0]

      const id = m.messages[0].key.remoteJid
      const key = m.messages[0].key

      let i = {
        remoteJid: q.key.remoteJid,
        id: q.key.id,
      };


        let body = ''
        if (messageType === 'conversation' && m.type === 'notify') {
          var grpMsg = q.message.conversation
          body = grpMsg
        } else if (messageType === 'extendedTextMessage' && m.type === 'notify') {
          var dmMsg = q.message.extendedTextMessage.text
          body = dmMsg
        }


      // if (messageType === "imageMessage" && m.type === "notify") {
      //   var imgMsg = q.message.imageMessage.url;
      //   var imgMsgCaption = q.message.imageMessage.caption;
      // }
      // if (messageType === "audioMessage" && m.type === "notify") {
      //   var audMsg = q.message.audioMessage.url;
      // }
      // if (messageType === "videoMessage" && m.type === "notify") {
      //   var vidMsg = q.message.videoMessage.url;
      //   var vidMsgCaption = q.message.videoMessage.caption;
      // }

      const reply = async(msg) => {
        await zyn.sendMessage(id, { text: msg }, { quoted: q });
      };
  
      const sendVideo = async(path , cap) => {
        await zyn.sendMessage(id, {video: {url : path} , mimetype: 'video/mp4' , caption: cap},{quoted : q})
      }
      const sendImage = async(path , cap) => {
        await zyn.sendMessage(id, {image : {url : path}, caption: cap},{quoted:q})
      }
      const sendAudio = async(path) => {
        await zyn.sendMessage(id, {audio: {url:path}, mimetype: 'audio/mp3'} ,{quoted:q})
      }
      const sendAudioV2 = async(path , title , body , thumb , mediaType , url) => {
        await zyn.sendMessage(id, { 

          audio: { url: path },
            mimetype: 'audio/mp3',
            contextInfo: {
              externalAdReply: {
                title: title,
                body: body,
                thumbnailUrl: thumb,
                mediaType: mediaType,
                showAdAttribution: true,
                renderLargerThumbnail: false,
                sourceUrl: url,
              },
            },

        } ,{quoted:q})
      }
      const sendVoice = async(path) => {
        await zyn.sendMessage(id, {audio: {url: path},mimetype: 'audio/mp4' , ptt:true, waveform: [0 , 100 , 0 , 100 , 0]} , {quoted:q})
      }
      const message = (msg) => {
        zyn.sendMessage(id, { text: msg });
      };

      const read = () => { 
        zyn.readMessages([q.key]);
      };

      const type = () => {
        zyn.sendPresenceUpdate("composing", id);
        delay(1000);
      };

      const record = () => {
        zyn.sendPresenceUpdate("recording", id);
        delay(1000);
      };

      const errorMsg = (query, command, example) => {
        reply(
          "_*" +
            query +
            "*_\n\n```ex:  " +
            prefix +
            command +
            " <" +
            example +
            ">```"
        );
      };

      const react = (emoji) => {
        zyn.sendMessage(id, { react: { text: emoji, key: q.key } });
      };
  
      //messaging!
      if (body === prefix + "alive") {
        read(), type(), react("🪼")

        const msg = `*Hey! ${userName}* \n*I'm Alive...*`;
        sendVoice(randomBgm)
        sendImage(randomAliveImages , msg)
      }

      /* if (body === prefix + "ping") {
        read(), type(), react("📍");
        try{
          await fetch('www.google.com')
          reply(' ```Pin')
        }catch(err){
          reply("*An Error Occured!*\n" + `_*${err}*_`);
        }
      }
      */

      // if (body === prefix + "quote") {
      //   read(), type(), react("📜");
      //   try{
      //     quote().then((res) => {
      //       reply(res[0].r)
      //     })
      //   }catch(err){
      //     reply("*An Error Occured!*\n" + `_*${err}*_`);
      //   }
      // }





























      
      if (body.startsWith(prefix + "ytv")) {
        read(), type(), react("🎥");

        const url = body.slice(4).trim();

        if (!url) {
          errorMsg("Give a Youtube video Url!", "ytv", "YouTube Video Url");
        } else {
          try {
            
          } catch (err) {
            reply("*An Error Occured!*\n" + `_*${err}*_`);
          }
        }
      }

      if (body.startsWith(prefix + "lyrics")) {
        read(), type(), react('💎');
        const lyricQuery = body.slice(8)

        if (!lyricQuery) {
          errorMsg("Need a Query!", "lyrics", "Song Name");
        } else {
          try {
            lyrics(lyricQuery).then((res) => {
              reply(`*${res[0].author}-${res[0].title}*\n\n${res[0].lyrics} \n\n > ${botName} `)
              // sendImage(res[0].thumbnail , `*${res[0].author}-${res[0].title}*\n\n${res[0].lyrics} \n\n > ${botName} `)
            })
          } catch (e) {
            reply("*An error occured!*" + e);
          }
        }
      }

      if (body.startsWith(prefix + "yta")) {
        read(), type(), react("🎶");

        const url = body.slice(4).trim();

        if (!url) {
          errorMsg("Need Youtube video Url!", "yta", "YouTube Video Url");
        } else {
          try {
            ytdl.getInfo(url).then((res) => {
              const videoTitle = res.videoDetails.title;
              reply("_*Downloading...*_\n" + "_" + videoTitle + "_");

              let stream = ytdl(url, {
                quality: "lowestaudio",
              });

              const fileName = "./Zynt3x.mp3";

              stream.pipe(fs.createWriteStream(fileName));

              stream.on("finish", () => {
                sendAudio(fileName);
                return 0;
              });
            });
          } catch (err) {
            reply("*An Error Occured!*\n" + `_*${err}*_`);
          }
        }
      }

      if (body.startsWith(prefix + "song")) {
        read(), type(), react("🎵");
        const query = body.slice(5);

        if (!query || body.includes('https://youtube.com/watch?v=')) {
          errorMsg("Need a Query!", "song", "Query");
        } else {
          try {
            yts(query).then((res) => {
              const videos = res.videos.slice(0, 3);
              const url = videos[0].url;
              const r = res.all[0].thumbnail;
              ytdl.getInfo(url).then((res) => {
                const videoTitle = res.videoDetails.title;

                reply("_*Downloading...*_\n" + "_" + videoTitle + "_");

                let stream = ytdl(url, {
                  quality: "lowestaudio",
                });
                
                const fileName = "./Zynt3x.mp3";

                stream.pipe(fs.createWriteStream(fileName));

                stream.on("finish", () => {
                  sendAudioV2(fileName , videoTitle , botName , r , 1 , res.videoDetails.video_url);
                  return 0;

                  

                  // async function send() {
                  //   await zyn.sendMessage(
                  //     id,
                  //     {
                  //       audio: { url: fileName },
                  //       mimetype: "audio/mp4",
                  //       contextInfo: {
                  //         externalAdReply: {
                  //           title: videoTitle,
                  //           body: botName,
                  //           thumbnailUrl: r,
                  //           mediaType: 1,
                  //           showAdAttribution: true,
                  //           renderLargerThumbnail: false,
                  //           sourceUrl: res.videoDetails.video_url,
                  //         },
                  //       },
                  //     },
                  //     { quoted: q }
                  //   );
                  // }
                  // send();
                });
              });
            });
          } catch (err) {
            reply("*An Error Occured!*\n" + `_*${err}*_`);
          }
        }
      }

      if(body.startsWith(prefix + "video")) {
        read(), type(), react("🎦");

        const query = body.slice(6);

        if (!query || body.includes('https://youtube.com/watch?v=')) {
          errorMsg("Need a Query!", "video", "Query");
        } else {
          try {
            yts(query).then((res) => {
              const videos = res.videos.slice(0, 3);
              const url = videos[0].url;

              ytdl.getInfo(url).then((res) => {
                const videoTitle = res.videoDetails.title;

                reply("_*Downloading...*_\n" + "_" + videoTitle + "_");

                const videoStream = ytdl(url, { quality: "18" });
                const videoFileName = "./Zynt3x.mp4";
                videoStream.pipe(fs.createWriteStream(videoFileName));

                videoStream.on("finish", () => {
                  async function send() {
                    await zyn.sendMessage(
                      id,
                      {
                        video: { url: videoFileName },
                        mimetype: "video/mp4",
                        caption: "```" + videoTitle + "```",
                      },
                      { quoted: q }
                    );
                  }
                  send();
                });
              });
            });
          } catch (err) {
            reply("*An Error Occured!*\n" + `_*${err}*_`);
          }
        }
      }

      if (body.startsWith(prefix + "ai")) {
        read(), type(), react("🪄");
        let query = body.slice(3);

        if (!query) {
          errorMsg("Need a Query!", ".ai", "Query");
        } else {
          reply("*Generating...*  🔄");
          try {
            const genAI = new GoogleGenerativeAI(
              "AIzaSyBd4SAi5JADrlqYS0m4gvWMlWSiSVD2Wyg"
            );

            async function run() {
              const model = genAI.getGenerativeModel({ model: "gemini-pro" });
              const result = await model.generateContent(query);
              const response = await result.response;
              const text = response.text();
              reply(text);
            }

            run();
          } catch (err) {
            reply("*An Error Occured!*\n" + `_*${err}*_`);
          }
        }
      }

      if (body.startsWith(prefix + "error")) {
        read(), type(), react("🧰");
        const query = body.slice("6");
        if (!query) {
          errorMsg("Need a Query!", "error", "Query");
        } else {
          let bot = zyn.user.id;
          let date = new Date().getDate();
          let month = new Date().getMonth();
          let year = new Date().getFullYear();
          let h = new Date().getHours();
          let m = new Date().getMinutes();
          let s = new Date().getSeconds();
          const i = `${bot} , ${date}/${month}/${year} , ${h};${m};${s}`;
          const msg = `*Error[${i}]:* ` + "```" + query + "```";

          await zyn
            .sendMessage("916282888139@s.whatsapp.net", { text: msg })
            .then(
              reply(
                "*Thank you for describing your error!* \n*Your error has been sent to admin.*"
              )
            );
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
              sendVideo(res.hd , botName)
            })
          } catch (err) {
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }
      }

      
      if(body.startsWith(prefix + 'yts')){
        read(),type(),react('🍭')
        const query = body.slice(5)
        if(!query){
          errorMsg('Need a Query or a Youtube video Url' , 'yts' , 'Query/Url')
        }else if(!query.includes('https://youtube.com/watch?v=')){
          try{
            yts(query).then((res)=>{
              const r = res.videos
              var msg = `_Search results for '${query}'._\n\n\n *1. ${r[0].title}* \n _Url: ${r[0].url}_ \n\n *2. ${r[1].title}* \n _Url: ${r[1].url}_ \n\n *3. ${r[2].title}* \n _Url: ${r[2].url}_ \n\n *4. ${r[3].title}* \n _Url: ${r[3].url}_ \n\n *5. ${r[4].title}* \n _Url: ${r[4].url}_ \n\n *6. ${r[5].title}* \n _Url: ${r[5].url}_ \n\n *7. ${r[6].title}* \n _Url: ${r[6].url}_ \n\n *8. ${r[7].title}* \n _Url: ${r[7].url}_ \n\n *9. ${r[8].title}* \n _Url: ${r[8].url}_ \n\n *10. ${r[9].title}* \n _Url: ${r[9].url}_ \n\n\n _For downloading:_ \n     _${prefix}yta <Copied Url> (For audio)._ \n     _${prefix}ytv <Copied Url> (For video)._ \n\n _${prefix}yts <Copied Url> (Gets you more information about the video)._ \n\n _Note: Videos/Audios larger than 100MB is not sent._`
              reply(msg)
            })
          }catch(err){
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }else if(query.includes('https://youtube.com/watch?v=')){
          const videoId = body.slice(5)
          const id = videoId.split('https://youtube.com/watch?v=')
          try{
            yts({videoId: id[1]}).then((res)=>{
            let cap = `•ᴛɪᴛʟᴇ: *${res.title}* \n\n •ᴜʀʟ: *${res.url}* \n\n •ᴅᴜʀᴀᴛɪᴏɴ: *${res.timestamp}* \n\n •ᴠɪᴇᴡꜱ: *${res.views}* \n\n •ᴀᴜᴛʜᴏʀ: *${res.author.name}* \n\n •ᴜᴘʟᴏᴀᴅᴇᴅ: *${res.ago}* \n\n •ᴜᴘʟᴏᴀᴅᴇᴅ ᴅᴀᴛᴇ: *${res.uploadDate}* \n\n •ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ: \n _ ${res.description} _ `
            sendImage(res.thumbnail , cap )
          })
          }catch(err){
           reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }
      }
        
      if(body.startsWith(prefix + 'textpro')){
        read(),type(),react()
        const q = body.slice(9)
        if(!q || !q.includes(',') || !q.includes('https://textpro.me/')){
          reply(`_*eg: ${prefix} textpro <Copied Url from below> , <Name>*_\n\n*Urls:* \n _1. https://textpro.me/create-3d-thunder-text-effects-online-1147.html_ \n _(3D thunder text effects)_ \n\n _2. https://textpro.me/create-a-gradient-text-shadow-effect-online-1141.html_ \n _(gradient text shadow)_ \n\n _3. https://textpro.me/create-realistic-3d-text-effect-frozen-winter-1099.html_ \n _(realistic 3D text effect frozen winter)_ \n\n _4. https://textpro.me/create-artistic-typography-online-1086.html_ \n _(artistic typography)_ \n\n _5. https://textpro.me/create-gradient-neon-light-text-effect-online-1085.html_ \n _(gradient neon light text)_ \n\n _6. https://textpro.me/create-light-glow-sliced-text-effect-online-1068.html_ \n _(light glow sliced text)_ \n\n _7. https://textpro.me/make-a-batman-logo-online-free-1066.html_ \n _(bataman logo)_ \n\n _8. https://textpro.me/create-green-horror-style-text-effect-online-1036.html_ \n _(green horror style text effect)_ \n\n _9. https://textpro.me/create-harry-potter-text-effect-online-1025.html_ \n _(harry potter text effect)_ \n\n _10. https://textpro.me/matrix-style-text-effect-online-884.html_ \n _(matrix style text effect)_ \n\n _11. https://textpro.me/create-blackpink-logo-style-online-1001.html_ \n _(blackpink logo style)_`)
        }else{
          try{
            const query = q.split(',')
            const url = query[0]
            const name = query[1]
            mumaker.textpro(url , name).then((res)=>{
              sendImage(res.image , `_Generated by ${botName}_`)
            })
          }catch(err){
            reply('*An Error Occured!*\n' + `_*${err}*_`)
          }
        }

      }



      // if(body ===  prefix + "menu" || body === prefix + "list"){
      //   read(), type() , react("📍")
      //   sendImage("https://i.ibb.co/CzfPYJV/colton-orr-2020-4.jpg" , 
      //   `
      //   ━━【ＭＥＮＵ】━━
      //   \n\n\n▸ *${prefix}alive* _(To check wheather the bot is working or not)_
      //   \n\n▸ *${prefix}menu/list* _(For full commands and uses)_
      //   \n\n▸ *${prefix}quote* _(Generates a random quote with author)_
      //   \n\n▸ *${prefix}ping* _(Pings the server)_
      //   \n\n▸ *${prefix}song* _(Downloads song from youtube by query)_
      //   \n\n▸ *${prefix}video* _(Downloads video from youtube by query)_
      //   \n\n▸ *${prefix}yta* _(Downloads song from youtube by link)_
      //   \n\n▸ *${prefix}ytv* _(Downloads video from youtube by link)_
      //   \n\n▸ *${prefix}yts* _(Searches youtube by query or link)_
      //   \n\n▸ *${prefix}lyrics* _(Gets you lyrics of popular songs)_
      //   \n\n▸ *${prefix}fb* _(Downloads video from facebook)_
      //   \n\n▸ *${prefix}ai* _(Helps you to chat with google gemini ai)_
      //   \n\n▸ *${prefix}technews* _(Gets you a random tech news)_
      //   \n\n▸ *${prefix}error* _(Describe errors to developer while using this bot)_
      //   \n\n▸ *${prefix}textpro* _(Adds stylish texts to stylish backgrounds)_
      //   \n\n▸ *${prefix}weather* _(Gets Weather Informations)_
      //   `
      // )
      // }


      if(body.startsWith(prefix + 'weather')){
        react('❄️') , read() , type()
        const q = body.slice(9).trim()
        if(!q){
          errorMsg("Need a Query!", "weather", "Query");
        }else{
          const u = 'https://api.openweathermap.org/data/2.5/weather?units=metric&q='
          const api = 'cd04ae4cec5f1b747c75eae5b3103e9f'
          const url = u + q + "&appid=" + api;
           
          if(response.status === 404){
            reply("_*Can't find this location*_")
          }else{
            const data = await response.json();
            const w = data.weather[0].main
            let r = data.weather[0].icon
            const icon = `https://openweathermap.org/img/wn/` + `${r}` + `@2x.png`
            sendImage(icon, `_*Results For ${data.name},${data.sys.country}*_ \n\n *Temperature: ${data.main.temp}°C* \n *Humidity: ${data.main.humidity}* \n *Pressure: ${data.main.pressure}Pa* \n *Wind Speed: ${data.wind.speed}km/h*`)
          } 
        }

      }

      if(body.startsWith(prefix + 'img')) {
        react('🪄') , type() , read()
        const q = body.slice(5)
        if(!q){
          errorMsg("Need a Query!" , "img" ,"Query")
        }else{
          reply("*Generating...*  🔄");
          sendImage(`https://image.pollinations.ai/prompt/${q}?nologo=1` , `> Made with ❤️ by ${botName}`)
        }
      }

      if(body === prefix + 'news'){
      react('📰') , type() , read()
      newsScrape().then((res) => {
        sendImage(res[0].thumbnail , `*${res[0].headNews}* \n__________________\n\n1) ${res[2].title}\n2) ${res[3].title}\n3) ${res[4].title}\n4) ${res[5].title}\n5) ${res[6].title}`)
      })}

      if(body === prefix + 'footballnews'){
      react('⚽') , type() , read()
      footballNewsScrape().then((res) => {
         sendImage(res[0].thumbnail , `*${res[0].headNews}* \n__________________\n\n1) ${res[2].title}\n2) ${res[3].title}\n3) ${res[4].title}\n4) ${res[5].title}\n5) ${res[6].title}`)
      })}
      if(body.startsWith(prefix + 'ig')){
        react('❄️') , read() , type()
        const url = body.slice(3).trim()
        if(!url || !body.includes('www.instagram.com')){
          errorMsg("Need a Instagram Url!", "ig", "url")
        }else{
          try {
            if(url.includes('reel')){
              instadl(url).then((res)=>{
                sendVideo(res[0].download_url , `> Made with ❤️ by ${botName}`)
              })
            }else{
              instadl(url).then((res)=>{
                res.forEach(element => {
                  sendImage(element.download_url , `> Made with ❤️ by ${botName}` )
                });
                  // console.log(i)
                  // sendImage(res[i].download_url , `Made with ❤️ by ${botName}` )
              })
            }
          } catch (e) {
            reply("*An error occured!*" + e)
          }
        }
      }
      

    } catch (err) {
      console.log(err);
    }
  });
}
zyntex();

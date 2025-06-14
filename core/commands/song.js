const { newCommand } = require("../handler/config");
const yts = require("yt-search");

newCommand(
  "song",
  async (zyn, id, userName, args, ctx) => {
    await ctx.read();
    await ctx.type();
    await ctx.react("🎵");

    if (!args[0] || args[0].includes("https://youtube.com/watch?v=")) {
      await ctx.errorMsg("Query Needed", "song", "Faded");
    } else {
      try {
        yts(args[0]).then((res) => {
          (async () => {
            const { default: got } = await import('got');
            const r = res.videos;
            await ctx.reply("_*Downloading...*_\n" + "_" + r[0].title + "_");
            const url = r[0].url;
            const streamUrl = `https://ironman.koyeb.app/ironman/dl/yta?url=${encodeURIComponent(url)}`
            const buffer = await got(streamUrl).buffer();
            const sizeInMB = (buffer.length / (1024 * 1024)).toFixed(2);
            if(sizeInMB >= 100){
                ctx.reply("Size exceeded 100MB")
                return
            }
            await ctx.sendAudioV2(streamUrl , r[0].title , "𝙕𝙮𝙣𝙩3𝙭!" , r[0].thumbnail , 1 , url )


          })()
        });
      } catch (err) {
        ctx.reply("*An Error Occured!*\n" + `_*${err}*_`);
      }
    }
  },
  {
    description: "Download Songs from YouTube",
  }
);

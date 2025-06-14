// // if (body === prefix + "alive") {
//   read(), type(), react("🪼");

// //   const msg = `*Hey! ${userName}* \n*I'm Alive...*`;
// //   sendVoice(randomBgm);
// //   sendImage(randomAliveImages, msg);
// // }

const { newCommand } = require('../handler/config');
const randomBgm = require("../../assets/Bgm/bgm.js");
const randomAliveImages = require("../../assets/Alive Images/alive_img.js");

newCommand("alive", async (zyn, id, userName, args, ctx) => {
  await ctx.read();
  await ctx.type();
  await ctx.react("🪼");

  const msg = `*Hey! ${userName}* \n\n*I'm Alive...*`;
  await ctx.sendVoice(randomBgm);
  await ctx.sendImage(randomAliveImages, msg);

}, {
  description: "Check if the bot is alive or not."
});

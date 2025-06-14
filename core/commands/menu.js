const { commands, newCommand } = require('../handler/config');

newCommand("menu", async (zyn, id, userName, args, ctx) => {
  await ctx.read();
  await ctx.type();

  let text = ```🤖 Hey ${userName} Here is the Command Menu*\n\n```;

  for (const [name, data] of commands.entries()) {
    text += `• *.${name}* — ${data.description || "No description"}\n`;
  }

  await ctx.reply(text);
}, {
  description: "Show all available commands"
});
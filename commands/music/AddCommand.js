var Command = require("../Command.js");

module.exports = class AddCommand extends Command
{
  constructor()
  {
    super();

    this.name = "add";
    this.description = "add music to playlist";
    this.usage = "<url / query>";
  }

  async doCommand(msg, app, text)
  {
    //if query doesnt begin with http(s)://, prepend ytsearch:
    if(text.match(/^https?:\/\//i) == null)
    {
      text = U.canUseCommand(perms, {permissions: ["dev"]}, pl) ? "ytsearch:" + text : "scsearch:" + text;
    }

    if(text.match(/(www\.youtube\.com|youtu\.?be)\/.+$/i) && !U.canUseCommand(perms, {permissions: ["dev"]}, pl))
    {
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Youtube is disabled", "Youtube playback has been disabled because of Youtube blocking music bots. Join the support server for more info"));
      return;
    }

    //app.bot.createMessage(msg.channel.id, text);

    await app.lavalink.add(msg, text, false);
  }
}

var U = require.main.require("./utils/Utils.js");
var P = require.main.require("./utils/Permissions.js");

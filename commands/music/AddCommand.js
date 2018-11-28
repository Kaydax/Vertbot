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
      text = "ytsearch:" + text;
    }

    //app.bot.createMessage(msg.channel.id, text);

    await app.lavalink.add(msg, text, false);
  }
}

var U = require.main.require("./utils/Utils.js");

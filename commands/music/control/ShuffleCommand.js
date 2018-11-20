var Command = require("../../Command.js");

module.exports = class ShuffleCommand extends Command
{
  constructor()
  {
    super();

    this.name = "shuffle";
    this.description = "toggle shuffle";
    this.usage = "<on/off>"
    this.permissions = ["dj"];
  }

  async doCommand(msg, app, text)
  {
    var cmd = text.trim().toLowerCase();
    var pl = await app.db.getPlaylist(msg.channel.guild.id);

    if(cmd == "on")
    {
      await pl.setShuffle(true);
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Shuffle is now on", "Shuffle is now turned on"));
    }
    else if(cmd == "off")
    {
      await pl.setShuffle(false);
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Shuffle is now off", "Shuffle is now turned off"));
    }
    else if(cmd == "")
    {
      app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Shuffle is currently:", (pl.shuffle ? "on" : "off")));
    }
    else
    {
      U.sendHelp(app, msg, this, true);
    }
  }
}

var U = require.main.require("./utils/Utils.js");

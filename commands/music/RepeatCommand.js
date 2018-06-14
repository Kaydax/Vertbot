var Command = require("../Command.js");

module.exports = class RepeatCommand extends Command
{
  constructor()
  {
    super();

    this.name = "repeat";
    this.description = "Toggle Repeat for the Playlist";
    this.usage = "<on/off>"
  }

  async doCommand(msg, app, text)
  {
    var cmd = text.trim().toLowerCase();
    var pl = await app.db.getPlaylist(msg.channel.guild.id);

    if(cmd == "on")
    {
      await pl.setRepeat(true);
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Repeat is now on", "Repeat is now turned on"));
    }
    else if(cmd == "off")
    {
      await pl.setRepeat(false);
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Repeat is now off", "Repeat is now turned off"));
    }
    else if(cmd == "")
    {
      app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Repeat is currently:", (pl.repeat ? "on" : "off")));
    }
    else
    {
      U.sendHelp(app, msg, this, true);
    }
  }
}

var U = require.main.require("./utils/Utils.js");

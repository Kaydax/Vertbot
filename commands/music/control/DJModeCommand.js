var Command = require("../../Command.js");

module.exports = class DJModeCommand extends Command
{
  constructor()
  {
    super();

    this.name = "djmode";
    this.description = "Turn on or off the requirement for the dj role";
    this.usage = "<on/off>"
    this.permissions = ["admin"];
  }

  async doCommand(msg, app, text)
  {
    var cmd = text.trim().toLowerCase();
    var pl = await app.db.getPlaylist(msg.channel.guild.id);

    if(cmd == "on")
    {
      await pl.setDJMode(true);
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("DJ Mode is now on", "DJ Mode is now turned on"));
    }
    else if(cmd == "off")
    {
      await pl.setDJMode(false);
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("DJ Mode is now off", "DJ Mode is now turned off"));
    }
    else if(cmd == "")
    {
      app.bot.createMessage(msg.channel.id, U.createQuickEmbed("DJ Mode is currently:", (pl.djmode ? "on" : "off")));
    }
    else
    {
      U.sendHelp(app, msg, this, true);
    }
  }
}

var U = require.main.require("./utils/Utils.js");

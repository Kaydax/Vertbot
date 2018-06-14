var Command = require("../Command.js");

module.exports = class SilentCommand extends Command
{
  constructor()
  {
    super();

    this.name = "silent";
    this.description = "toggle silent";
    this.usage = "<on/off>"
  }

  async doCommand(msg, app, text)
  {
    var cmd = text.trim().toLowerCase();
    var pl = await app.db.getPlaylist(msg.channel.guild.id);

    if(cmd == "on")
    {
      await pl.setSilent(true);
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Silent is now on", "Silent is now turned on"));
    }
    else if(cmd == "off")
    {
      await pl.setSilent(false);
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Silent is now off", "Silent is now turned off"));
    }
    else if(cmd == "")
    {
      app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Silent is currently:", (pl.silent ? "on" : "off")));
    }
    else
    {
      U.sendHelp(app, msg, this, true);
    }
  }
}

var U = require.main.require("./utils/Utils.js");

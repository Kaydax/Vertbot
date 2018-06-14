var Command = require("../Command.js");

module.exports = class ClearCommand extends Command
{
  constructor()
  {
    super();

    this.name = "clear";
    this.description = "clear the playlist";
  }

  async doCommand(msg, app, text)
  {
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    pl.clear();
    if(U.currentVC(app, msg.channel.guild.id) != null)
    {
      app.lavalink.stop(msg);
    }
    app.bot.createMessage(msg.channel.id, "playlist cleared");
  }
}

var U = require.main.require("./utils/Utils.js");

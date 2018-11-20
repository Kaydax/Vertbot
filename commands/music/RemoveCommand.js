var Command = require("../Command.js");

module.exports = class ClearCommand extends Command
{
  constructor()
  {
    super();

    this.name = "remove";
    this.description = "remove an item from the playlist";
    this.usage = "<# for video>";
    this.permissions = ["dj"];
  }

  async doCommand(msg, app, text)
  {
    var cmd = text.trim().toLowerCase();
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    var hasNumber = /\d/;
    var number = U.getVal(cmd, 1, pl.tracks.length) - 1;

    if(pl.tracks.length == 0)
    {
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("The playlist is empty", "You can't remove something that isn't there ya know..."));
      return;
    }

    if(hasNumber.test(cmd))
    {
      if(cmd != "")
      {
        app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Removed track", "`" + (number + 1 + ": ") + pl.tracks[number].info.title + "` has been removed from the playlist"));
        await pl.removeTrack(number);
      }
    } else {
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Could not remove track", "You seem to have not put any numbers or something broke..."));
      return;
    }
  }
}

var U = require.main.require("./utils/Utils.js");

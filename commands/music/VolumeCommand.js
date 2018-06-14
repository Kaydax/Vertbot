var Command = require("../Command.js");

module.exports = class VolumeCommand extends Command
{
  constructor()
  {
    super();

    this.name = "volume";
    this.description = "Sets the volume of the playback";
  }

  async doCommand(msg, app, text)
  {
    var vc = U.msg2vc(msg);
    var cmd = text.trim().toLowerCase();
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    var player = await app.lavalink.getPlayer(vc);
    var volume = U.getVolume(msg.content, 0, 150);

    if(cmd != "")
    {
      pl.setVolume(volume);
      if(player != null)
      {
        player.setVolume(volume);
      }
      U.reply(app, msg, "Volume has been set to " + pl.volume);
    } else {
      U.reply(app, msg, "Volume is currently " + pl.volume);
    }
  }
}

/*
[=add https://www.youtube.com/watch?v=dJaVI7jzc8s
[=add https://www.youtube.com/watch?v=WNxZiBexDM8
[=add https://www.youtube.com/watch?v=IUun0CWrvT0
*/
var U = require.main.require("./utils/Utils.js");

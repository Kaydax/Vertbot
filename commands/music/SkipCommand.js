var Command = require("../Command.js");

module.exports = class SkipCommand extends Command
{
  constructor()
  {
    super();

    this.name = "skip";
    this.description = "skip the current playlist item";
  }

  async doCommand(msg, app, text)
  {
    var vc = U.msg2vc(msg);
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    var gid = U.msg2gid(msg);

    if(pl.repeat == false)
    {
      //glitch likely caused by lavalink grabbing its own (slightly outdated) copy of the playlist
      await pl.next(); //advance playlist (wait for save confirmation to prevent glitch)

      app.lavalink.play(vc, msg);
    } else {
      U.reply(app, msg, "Turn of Repeat in order to skip");
    }
  }
}

/*
[=add https://www.youtube.com/watch?v=dJaVI7jzc8s
[=add https://www.youtube.com/watch?v=WNxZiBexDM8
[=add https://www.youtube.com/watch?v=IUun0CWrvT0
*/
var U = require.main.require("./utils/Utils.js");

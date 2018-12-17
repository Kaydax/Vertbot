var Command = require("../Command.js");

module.exports = class GotoCommand extends Command
{
  constructor()
  {
    super();

    this.name = "goto";
    this.description = "Goto a song in the playlist";
    this.usage = "<# for video>"
    this.permission = ["dj"]
  }

  async findSong(songNum, pl)
  {
    //This is prob the best way to make this command work with shuffle turned on... but this may change
    return pl.indexes.indexOf(songNum, 0);
  }

  async doCommand(msg, app, text)
  {
    var vc = U.msg2vc(msg);
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    var gid = U.msg2gid(msg);
    var num = text.match(/\d+/)[0] - 1;

    //glitch likely caused by lavalink grabbing its own (slightly outdated) copy of the playlist
    if(text.match(/^\d+$/) && (text.match(/^\d+$/) != 0))
    {
      await pl.setPosition(pl.shuffle ? await this.findSong(num, pl) : num); //advance playlist (wait for save confirmation to prevent glitch)
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Set new track", "Set track to: `" + pl.tracks[text.match(/^\d+$/)[0] - 1].info.title + "`"));

      if(U.currentVC(app, gid) != null)
      {
        app.lavalink.play(vc, msg, app);
      }
    } else {
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Invalid number", "Please put a valid number"));
    }
  }
}

/*
[=add https://www.youtube.com/watch?v=dJaVI7jzc8s
[=add https://www.youtube.com/watch?v=WNxZiBexDM8
[=add https://www.youtube.com/watch?v=IUun0CWrvT0
*/
var U = require.main.require("./utils/Utils.js");

var Command = require("../Command.js");

module.exports = class GotoCommand extends Command
{
  constructor()
  {
    super();

    this.name = "goto";
    this.description = "Goto a song in the playlist";
    this.usage = "<# for video>"
  }

  async doCommand(msg, app, text)
  {
    var vc = U.msg2vc(msg);
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    var gid = U.msg2gid(msg);

    //glitch likely caused by lavalink grabbing its own (slightly outdated) copy of the playlist
    //if()
    if(text.match(/^\d+$/) && (text.match(/^\d+$/) != 0) && (text.match(/^\d+$/) ))
    {
      app.bot.createMessage(msg.channel.id, text.match(/^\d+$/)[0]);
      await pl.setPosition(text.match(/\d+/)[0] - 1); //advance playlist (wait for save confirmation to prevent glitch)

      app.lavalink.play(vc, msg);
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

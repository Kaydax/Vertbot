var Command = require("../Command.js");

module.exports = class VolumeCommand extends Command
{
  constructor()
  {
    super();

    this.name = "volume";
    this.usage = "<#>"
    this.description = "Sets the volume of the playback";
  }

  async volume(msg, app, cmd, pl, perms)
  {
    var vc = U.msg2vc(msg);
    var hasNumber = /\d/;
    var player = await app.lavalink.getPlayer(vc, true);
    var volume = U.canUseCommand(perms, {permissions: ["admin"]}, pl) ? U.getVal(cmd, 0, 1000) : U.getVal(cmd, 0, 100);

    if(hasNumber.test(cmd))
    {
      if(cmd != "")
      {
        pl.setVolume(volume);
        if(player != null)
        {
          player.setVolume(volume);
        }
        app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Volume has been changed", "The volume has been set to " + pl.volume + "%"));
      }
    } else {
      if(cmd != "")
      {
        app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Could not change volume", "You seem to have not put any numbers or something broke..."));
        return;
      } else {
        app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Volume:", "Currently " + pl.volume + "%"));
      }
    }

    return;
  }

  async doCommand(msg, app, text)
  {
    var cmd = text.trim().toLowerCase();
    var hasNumber = /\d/;
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    var perms = await P.getPerms(app, msg);


    //Getto permission check to have less code and to make it so the command can still be used in some ways
    if(pl.djmode == true && U.canUseCommand(perms, {permissions: ["dj"]}, pl))
    {
      await this.volume(msg, app, cmd, pl, perms);
    } else {
      if(pl.djmode == false || pl.djmode == undefined) { await this.volume(msg, app, cmd, pl, perms); }

      if(pl.djmode == true)
      {
        if(hasNumber.test(cmd))
        {
          //The person failed the getto permission check and we display the fact they don't have the role we want
          app.bot.createMessage(msg.channel.id, U.createErrorEmbed("You don't have permissions", "You seem to not have `dj`"));
        } else {
          //Cool the person has the role we want
          app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Volume:", "Currently " + pl.volume + "%"));
        }
      }
    }
  }
}

/*
[=add https://www.youtube.com/watch?v=dJaVI7jzc8s
[=add https://www.youtube.com/watch?v=WNxZiBexDM8
[=add https://www.youtube.com/watch?v=IUun0CWrvT0
*/
var U = require.main.require("./utils/Utils.js");
var P = require.main.require("./utils/Permissions.js");

var Command = require("../Command.js");

module.exports = class BassCommand extends Command
{
  constructor()
  {
    super();

    this.name = "bassboost";
    this.aliases = ["boost"];
    this.description = "crank that bass up to 11 (well actually 100)";
    this.usage = "<#>";
  }

  async bassBoost(msg, app, cmd, pl, perms)
  {
    var vc = U.msg2vc(msg);
    var hasNumber = /\d/;
    var player = await app.lavalink.getPlayer(vc, true);
    var boost = U.getVal(msg.content, 0, 100) / 100;

    if(hasNumber.test(cmd))
    {
      if(cmd != "")
      {
        //Bands: 0-15, Gain: -0.25-1.0
        pl.setBoost(boost);
        if(player != null)
        {
          var bands = [{"band": 0,"gain": boost},{"band": 1,"gain": boost},{"band": 2,"gain": boost}]
          player.setEQ(bands);
        }
        app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Bass boost has been changed", "The bass boost has been set to " + (pl.boost * 100) + "%"));
      }
    } else {
      if(cmd != "")
      {
        app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Could not change bass boost", "You seem to have not put any numbers or something broke..."));
      } else {
        app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Bass boost:", "Currently " + (pl.boost * 100) + "%"));
      }
    }
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
      await this.bassBoost(msg, app, cmd, pl, perms);
    } else {
      if(pl.djmode == false || pl.djmode == undefined) { await this.bassBoost(msg, app, cmd, pl, perms); }

      if(pl.djmode == true)
      {
        if(hasNumber.test(cmd))
        {
          //The person failed the getto permission check and we display the fact they don't have the role we want
          app.bot.createMessage(msg.channel.id, U.createErrorEmbed("You don't have permissions", "You seem to not have `dj`"));
        } else {
          //Cool the person has the role we want
          app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Bass boost:", "Currently " + (pl.boost * 100) + "%"));
        }
      }
    }
  }
}

var U = require.main.require("./utils/Utils.js");
var P = require.main.require("./utils/Permissions.js");

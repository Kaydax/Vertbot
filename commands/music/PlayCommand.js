var Command = require("../Command.js");

module.exports = class PlayCommand extends Command
{
  constructor()
  {
    super();

    this.name = "play";
    this.aliases = ["join"];
    this.description = "play music";
    this.usage = "<url / query>";
  }

  async doCommand(msg, app, text)
  {
    var vc = U.msg2vc(msg);
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    var perms = await P.getPerms(app, msg);
    if(msg.member.voiceState.channelID != null)
    {
      if(text.length > 0)
      {
        if(text.match(/^https?:\/\//i) == null)
        {
          text = U.canUseCommand(perms, {permissions: ["youtube"]}, pl) ? "ytsearch:" + text : "scsearch:" + text;
        }

        if(text.match(/(www\.youtube\.com|youtu\.?be)\/.+$/i) && !U.canUseCommand(perms, {permissions: ["youtube"]}, pl))
        {
          app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Youtube is disabled", "Youtube playback has been disabled because of Youtube blocking music bots. Join the support server for more info"));
          return;
        }

        //app.bot.createMessage(msg.channel.id, text);

        await app.lavalink.add(msg, text, true, vc, app);
      } else {
        app.lavalink.play(vc, msg, app, true);
      }
    } else {
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("No Voice Channel", "You seem to not be connected to any voice channel"));
    }
  }
}

var U = require.main.require("./utils/Utils.js");
var P = require.main.require("./utils/Permissions.js");

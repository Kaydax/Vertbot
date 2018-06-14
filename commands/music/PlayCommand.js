var Command = require("../Command.js");

module.exports = class PlayCommand extends Command
{
  constructor()
  {
    super();

    this.name = "play";
    this.aliases = ["join"];
    this.description = "play music";
    this.usage = "<url?>";
  }

  async doCommand(msg, app, text)
  {
    if(msg.member.voiceState.channelID != null)
    {
      app.lavalink.play(U.msg2vc(msg), msg, true);
    } else {
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("No Voice Channel", "You seem to not be connected to any voice channel I can see. This may have something to do with my permissions"));
    }
  }
}

var U = require.main.require("./utils/Utils.js");

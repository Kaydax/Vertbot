var Command = require("../Command.js");

module.exports = class VideoCommand extends Command {
  constructor()
  {
    super();

    this.name = "videochat";
    this.description = "Creates a link to allow video chat in your current voice channel";
  }

  async doCommand(msg, app, text)
  {
    var vc = U.msg2vc(msg);
    if(vc != undefined || vc != null)
    {
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Created video chat link", "[Click Here](https://discordapp.com/channels/" + msg.channel.guild.id + "/" + vc.id + ")"));
    } else {
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("No Voice Channel", "You seem to not be connected to any voice channel"));
    }
  }
}

var U = require.main.require("./utils/Utils.js");

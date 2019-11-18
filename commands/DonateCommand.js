var Command = require("./Command.js");

module.exports = class PingCommand extends Command
{
  constructor()
  {
    super();

    this.name = "donate";
    this.description = "Help me run this bot!";
  }

  async doCommand(msg, app, text)
  {
    app.bot.createMessage(msg.channel.id, U.createDonateEmbed());
  }
}

var U = require.main.require("./utils/Utils.js");

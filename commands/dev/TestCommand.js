var Command = require("../Command.js");

module.exports = class TestCommand extends Command
{
  constructor()
  {
    super();

    this.name = "test";
    this.usage = "";
    this.description = "A command that is used for anything I need it for";
    this.permissions = ["dev"];
  }

  async doCommand(msg, app, text)
  {
    app.bot.createMessage(U.getLogicalChannel(app, msg.channel.guild).id, U.createWelcomeEmbed(app));
  }
}

/*
NOTE:
This command is nothing important, as it has no use at all. It just exist for the purpose of debugging
the bot itself during development and should be ignored.
*/

var U = require.main.require("./utils/Utils.js");

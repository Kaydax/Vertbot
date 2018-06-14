var Command = require("./Command.js");

module.exports = class HelpCommand extends Command
{
  constructor()
  {
    super();

    this.name = "help";
    this.description = "shows you the help menu";
  }

  doCommand(msg, app, text)
  {
    U.sendHelp(app, msg, this.getRoot());
  }
}

var U = require.main.require("./utils/Utils.js");

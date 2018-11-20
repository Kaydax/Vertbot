var Command = require("./Command.js");

module.exports = class HelpCommand extends Command
{
  constructor()
  {
    super();

    this.name = "help";
    this.description = "shows you the help menu";
  }

  async doCommand(msg, app, text)
  {
    var command;
    var self = false;
    //if empty, use root
    if(text.trim() == "")
    {
      command = this.getRoot();
    }
    else
    {
      //grab subcommand
      command = this.getRoot().findCommand(text);
      //if not found, use root
      command = command == null ? this.getRoot() : command.sub
      //Check if the command has sub commands or not, and if none are found then display just that command
      self = command.commands.length == 0 ? true : false
    }

    U.sendHelp(app, msg, command, self);
  }
}

var U = require.main.require("./utils/Utils.js");

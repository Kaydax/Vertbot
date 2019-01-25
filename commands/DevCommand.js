var Command = require("./Command.js");

module.exports = class DevCommand extends Command
{
  //TODO: shuffle, loop, silent, volume (auto?), autoremove (queue mode?)
  constructor()
  {
    super();

    this.name = "dev";
    this.description = "Commands for only my developer";
    this.usage = "<subcommand>";
    this.permissions = ["dev"];

    this.addCommand("./dev/PermCommand.js");
    this.addCommand("./dev/PermsCommand.js");
    this.addCommand("./dev/AvatarCommand.js");
    this.addCommand("./dev/ReconnectCommand.js");
    this.addCommand("./dev/SayCommand.js");
    this.addCommand("./dev/TestCommand.js");
  }
}

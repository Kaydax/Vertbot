var Command = require("./Command.js");

module.exports = class MusicCommand extends Command
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
    this.addCommand("./dev/AvatarCommand.js");
  }
}

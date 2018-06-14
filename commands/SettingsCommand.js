var Command = require("./Command.js");

module.exports = class SettingsCommand extends Command
{
  //TODO: shuffle, loop, silent, volume (auto?), autoremove (queue mode?)
  constructor()
  {
    super();

    this.name = "settings";
    this.description = "Commands for bot settings";
    this.usage = "<subcommand>";

    this.addCommand("./settings/PrefixCommand.js");
  }
}

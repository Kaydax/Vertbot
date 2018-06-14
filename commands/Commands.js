var Command = require("./Command.js");

module.exports = class Commands extends Command
{
  constructor()
  {
    super();

    this.addCommand("./HelpCommand.js");
    this.addCommand("./PingCommand.js");
    this.addCommand("./SettingsCommand.js");
    this.addCommand("./InfoCommand.js");
    this.addCommand("./MusicCommand.js");
    this.addCommand("./DevCommand.js");

    this.init();
  }
}

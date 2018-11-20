var Command = require("../Command.js");

module.exports = class ControlCommand extends Command
{
  //TODO: shuffle, loop, silent, volume (auto?), autoremove (queue mode?)
  constructor()
  {
    super();

    this.name = "control";
    this.description = "Commands for music control related things";
    this.usage = "<subcommand>";

    this.addCommand("./music/control/RepeatCommand.js");
    this.addCommand("./music/control/SilentCommand.js");
    this.addCommand("./music/control/ShuffleCommand.js");
    this.addCommand("./music/control/DJModeCommand.js");
  }
}

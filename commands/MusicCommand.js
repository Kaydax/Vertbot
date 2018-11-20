var Command = require("./Command.js");

module.exports = class MusicCommand extends Command
{
  //TODO: shuffle, loop, silent, volume (auto?), autoremove (queue mode?)
  constructor()
  {
    super();

    this.name = "music";
    this.description = "Commands for music related things";
    this.usage = "<subcommand>";

    this.addCommand("./music/PlayCommand.js");
    this.addCommand("./music/AddCommand.js");
    this.addCommand("./music/StopCommand.js");
    this.addCommand("./music/ClearCommand.js");
    this.addCommand("./music/RemoveCommand.js");
    this.addCommand("./music/SkipCommand.js");
    this.addCommand("./music/GotoCommand.js");
    this.addCommand("./music/VolumeCommand.js");
    this.addCommand("./music/BassCommand.js");
    this.addCommand("./music/PlaylistCommand.js");
    this.addCommand("./music/ControlCommand.js");
  }
}

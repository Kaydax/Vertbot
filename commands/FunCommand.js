var Command = require("./Command.js");

module.exports = class FunCommand extends Command
{
  //TODO: shuffle, loop, silent, volume (auto?), autoremove (queue mode?)
  constructor()
  {
    super();

    this.name = "fun";
    this.description = "Commands for some random fun things";
    this.usage = "<subcommand>";

    this.addCommand("./fun/AsciiCommand.js");
    this.addCommand("./fun/BooruCommand.js");
    this.addCommand("./fun/VideoCommand.js");
  }
}

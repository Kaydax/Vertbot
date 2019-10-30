var Command = require("../Command.js");

module.exports = class StopCommand extends Command
{
  constructor()
  {
    super();

    this.name = "stop";
    this.aliases = ["leave"];
    this.description = "stop playing music";
    this.permissions = ["dj"];
  }

  async doCommand(msg, app, text)
  {
    app.lavalink.stop(msg, app);
  }
}

var U = require.main.require("./utils/Utils.js");

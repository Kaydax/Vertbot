var Command = require("../Command.js");

module.exports = class StopCommand extends Command
{
  constructor()
  {
    super();

    this.name = "stop";
    this.aliases = ["leave"];
    this.description = "stop playing music";
  }

  async doCommand(msg, app, text)
  {
    var vc = U.msg2vc(msg);

    app.lavalink.stop(msg);
  }
}

var U = require.main.require("./utils/Utils.js");

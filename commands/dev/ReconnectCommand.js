var Command = require("../Command.js");

module.exports = class ReconnectCommand extends Command
{
  constructor()
  {
    super();

    this.name = "reconnect";
    this.usage = "";
    this.description = "Reconnects to Cadmium";
    this.permissions = ["dev"];
  }

  async doCommand(msg, app, text)
  {
    app.cadmium.connect().then(() => {
      app.bot.createMessage(msg.channel.id, "Connection succeeded.");
    }).catch((ex) => {
      app.bot.createMessage(msg.channel.id, "Connection failed: ```" + ex.stack + "```");
    })
  }
}

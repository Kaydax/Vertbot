var Command = require("../Command.js");

module.exports = class SayCommand extends Command
{
  constructor()
  {
    super();

    this.name = "dsay";
    this.usage = "<words>";
    this.description = "Makes me say something";
    this.permissions = ["dev"];
  }

  async doCommand(msg, app, text)
  {
    msg.delete("Vertbot tts message (dsay)");
    app.bot.createMessage(msg.channel.id, text);
  }
}

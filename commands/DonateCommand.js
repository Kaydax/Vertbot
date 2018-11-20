var Command = require("./Command.js");

module.exports = class PingCommand extends Command
{
  constructor()
  {
    super();

    this.name = "donate";
    this.description = "Help me run this bot!";
  }

  async doCommand(msg, app, text)
  {
    app.bot.createMessage(msg.channel.id, 'If you would like to help by donating go here: https://donatebot.io/checkout/317570975908495361');
  }
}

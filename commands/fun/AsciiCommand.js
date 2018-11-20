var Command = require("../Command.js");

module.exports = class AsciiCommand extends Command
{
  constructor()
  {
    super();

    this.name = "ascii";
    this.description = "Make some fun ascii text art!";
    this.usage = "<text>"
  }

  async doCommand(msg, app, text)
  {
    if(text == "")
    {
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("No text", "You put no text in, so I can't create the ascii art..."));
      return;
    }

    figlet(text, function(err, data) {
      if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
      }
      app.bot.createMessage(msg.channel.id, U.wrapCode(data));
    });
  }
}

var U = require.main.require("./utils/Utils.js");
var figlet = require("figlet");

var Command = require("./Command.js");

module.exports = class InfoCommand extends Command
{
  constructor()
  {
    super();

    this.name = "info";
    this.description = "Gives you important info about me";
  }

  async doCommand(msg, app, text)
  {
    var prefix = (await app.db.getGuildSettings(msg.channel.guild.id)).prefix || app.config.prefix;
    app.bot.createMessage(msg.channel.id, U.createInfoEmbed(app, msg.channel.guild.id, prefix));
  }
}

var U = require.main.require("./utils/Utils.js");

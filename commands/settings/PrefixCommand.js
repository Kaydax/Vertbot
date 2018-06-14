var Command = require("../Command.js");

module.exports = class PrefixCommand extends Command
{
  constructor()
  {
    super();

    this.name = "prefix";
    this.description = "Sets my prefix";
  }

  async doCommand(msg, app, text)
  {
    /*var prefix = (await app.db.getGuildSettings(msg.channel.guild.id)).prefix || this.config.prefix;
    var newPrefix = msg.content.slice(prefix.length).trim().split(/\s+/)[1];
    //await this.settings.set(msg.channel.guild.id, "prefix", newPrefix);
    (await app.db.getGuildSettings(msg.channel.guild.id)).setPrefix(newPrefix);

    app.bot.createMessage(msg.channel.id, "set prefix to " + newPrefix);

    return;*/

    var prefix = (await app.db.getGuildSettings(msg.channel.guild.id)).prefix || this.config.prefix;

    if(text.length != 0)
    {
      app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Prefix has been set", "The prefix has been set to: `" + text + "`"));
      (await app.db.getGuildSettings(msg.channel.guild.id)).setPrefix(text);
      return;
    } else
    {
      app.bot.createMessage(msg.channel.id, U.createQuickEmbed("The prefix is currently:", "`" + prefix + "`"));
      return;
    }
  }
}

var U = require.main.require("./utils/Utils.js");

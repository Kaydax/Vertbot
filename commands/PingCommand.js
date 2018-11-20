var Command = require("./Command.js");

module.exports = class PingCommand extends Command
{
  constructor()
  {
    super();

    this.name = "ping";
    this.description = "pong";
  }

  async doCommand(msg, app, text)
  {
    app.bot.createMessage(msg.channel.id, 'Here is my current shard latency: ' + msg.channel.guild.shard.latency + "ms");
  }
}

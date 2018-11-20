var Command = require("../Command.js");

module.exports = class AvatarCommand extends Command
{
  constructor()
  {
    super();

    this.name = "avatar";
    this.usage = "<url>";
    this.description = "Sets the avatar to what ever url you put in";
    this.permissions = ["dev"];
  }

  async doCommand(msg, app, text)
  {
    var url = text.trim();
    const res = await require('snekfetch').get(url);
    app.bot.editSelf({ avatar: `data:image/jpg;base64,${res.body.toString('base64')}` });
    app.bot.createMessage(msg.channel.id, "Avatar Set!")
  }
}

var U = require.main.require("./utils/Utils.js");

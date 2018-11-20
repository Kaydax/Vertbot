var Command = require("../Command.js");

module.exports = class PermsCommand extends Command
{
  constructor()
  {
    super();

    this.name = "perms";
    this.description = "get the perms of a user";
  }

  async doCommand(msg, app, text)
  {
    text = text.trim();
    if(text == "")
    {
      //TODO: help?
      U.reply(app, msg, "AAAAAAAAA " + text);
      return;
    }

    var id = U.str2id(text);
    var member = U.getMemberById(msg.channel.guild, id);

    if(member == null)
    {
      //TODO: help member not found
      U.reply(app, msg, "AAAAAAAAA no member```" + text + "``` " + id);
      return;
    }

    var dbp = Array.from(await P.getDBPerms(app, member));
    var gp = Array.from(await P.getGuildPerms(app, member));
    var rp = Array.from(await P.getRolePerms(app, member));
    var cp = Array.from(await P.getConfigPerms(app, member));

    var str = "";
    if(dbp.length > 0)
    {
      str += "Database: " + dbp.join(", ") + "\n";
    }
    if(gp.length > 0)
    {
      str += "Guild: " + gp.join(", ") + "\n";
    }
    if(rp.length > 0)
    {
      str += "Role: " + rp.join(", ") + "\n";
    }
    if(cp.length > 0)
    {
      str += "Config: " + cp.join(", ") + "\n";
    }

    U.reply(app, msg, "Permissions for: " + text + U.wrapCode(str));
  }
}

var U = require.main.require("./utils/Utils.js");
var P = require.main.require("./utils/Permissions.js");

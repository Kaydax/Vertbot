var Command = require("../Command.js");

module.exports = class PermCommand extends Command
{
  constructor()
  {
    super();

    this.name = "perm";
    this.usage = "<user> <add/remove> <permission>";
    this.description = "Add and remove permissions from users";
    this.permissions = ["dev"];
  }

  async doCommand(msg, app, text)
  {
    var tokens = text.toLowerCase().split(/\s+/);

    //not enough tokens
    if(tokens.length < 3)
    {
      U.sendHelp(app, msg, this, true);
      return;
    }

    var mention = tokens[0];

    //grab id
    var id = U.str2id(mention);
    //fail, no user id provided
    if(id == null)
    {
      U.sendHelp(app, msg, this, true);
      return;
    }

    //grab user settings
    var us = await app.db.getUserSettings(id);
    var command = tokens[1];
    var perm = tokens[2];

    if(command == "add")
    {
      if(us.hasPermission(perm))
      {
        U.reply(app, msg, mention + " already has '" + perm + "'");
      }
      else
      {
        await us.addPermission(perm);
        U.reply(app, msg, "Gave '" + perm + "' to " + mention);
      }
    }
    else if(command == "remove")
    {
      if(!us.hasPermission(perm))
      {
        U.reply(app, msg, mention + " doesn't have '" + perm + "'");
      }
      else
      {
        await us.removePermission(perm);
        U.reply(app, msg, "Removed '" + perm + "' from " + mention);
      }
    }
    else if(command == "get")
    {
      var perms = us.getPermissions().join(", ");

      U.reply(app, msg, mention + " has: " + perms);
    }
  }
}

var U = require.main.require("./utils/utils.js");

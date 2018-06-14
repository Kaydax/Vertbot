module.exports = class Command
{
  constructor()
  {
    this.name = "";
    this.aliases = [];
    this.usage = "";
    this.description = "";
    this.commandFiles = [];
    this.commands = [];
    //required permissions (must have all; except for hierarchy)
    this.permissions = [];
    this.parent = null;
    //TODO: guild/dm commands?
  }

  setParent(parent)
  {
    this.parent = parent;
  }

  /** returns the root of the command tree */
  getRoot()
  {
    var parent = this.parent;

    while(parent.parent != null)
    {
      parent = parent.parent;
    }

    return parent;
  }

  init()
  {
    //TODO: other init stuff
    this.reload();
  }

  reload()
  {
    this.commands = this.commandFiles.map((e) =>
    {
      //console.log("loading " + e + " in " + this.constructor.name);
      var sub = new (require(e))();
      sub.setParent(this);
      return sub;
    });
  }

  async doCommand(message, app, text)
  {
    text = text || message.content;

    //grab permissions for user that sent the message
    var perms = await P.getPerms(app, message);

    var ret = this.findCommand(text);

    if(ret != null && ret.sub != this)
    {
      if(!U.canUseCommand(perms, ret.sub))
      {
        app.bot.createMessage(message.channel.id, U.wrapMention(message, "you seem to not have access to this command, so I can't let you use it."));
        return;
      }

      ret.sub.doCommand(message, app, ret.text);
    }

    //TODO: display help, but not on root level
    //TODO: we can use this != root check for that
    if(this.parent != null)
    {
      app.bot.createMessage(message.channel.id, U.wrapMention(message, U.wrapCode(this.getHelp())));
    }
  }

  /** pass a command FILENAME not an object */
  addCommand(commandFile)
  {
    if(this.commandFiles.includes(commandFile))
    {
      console.log("REEEEEEE YOU ALREADY ADDED THIS COMMAND");

      return;
    }

    this.commandFiles.push(commandFile);

    this.reload();
  }

  findCommand(text)
  {
    var ret = {};
    ret.text = null;
    ret.sub = null;

    text = text.trim(); //TODO: hmm
    var token = text.split(/\s+/)[0]; //grab the first token in text
    token = token.toLowerCase() //just to be safe

    var matches = this.findMatchingCommands(token);

    //no matches found
    if(matches.length == 0)
    {
      return null;
    }

    //TODO: filter out commands user cant access?
    //matches = matches.filter((e) => U.canUseCommand(perms, e));

    return {sub: matches[0], text: text.slice(token.length).trim()}; //TODO: trim?
  }

  /** pass it a single command token, if perms is passed, performs permission checks, returns {cmd, canUse} */
  findMatchingCommands(token)
  {
    token = token.toLowerCase(); //just to be safe

    var commands = [];
    for(var i = 0; i < this.commands.length; i++)
    {
      var sub = this.commands[i];

      if(sub.name.toLowerCase().startsWith(token) || sub.aliases.some((e) => e.toLowerCase().startsWith(token)))
      {
        //var canUse = perms == null ? true : U.canUseCommand(perms, e);
        //TODO: command visibility based on "hidden" and permissions (recursively?)
        commands.push(sub);
      }

      //grab subcommand's matches too
      commands = commands.concat(sub.findMatchingCommands(token));
    }

    return commands;
  }

  /** padLength = how much to pad name+usage by */
  formatHelp(name, usage, desc, padLength)
  {
    var nameUsage = name + " " + usage;
    padLength = padLength == null ? nameUsage.length - 1 : padLength;

    nameUsage = pad(Array(padLength + 2).join(" "), nameUsage);

    return nameUsage + " | " + desc; //TODO: OwO
  }

  /** if self, then print command's own help line, otherwise, print help for all subcommands */
  getHelp(self)
  {
    if(self)
    {
      return this.formatHelp(this.name, this.usage, this.description);
    }

    var str = "";
    var nameUsageLen = 0;
    var data = [];

    //iterate over each subcommand, gather data, get max length of name + usage
    this.commands.forEach((e) =>
    {
      nameUsageLen = Math.max(nameUsageLen, e.name.length + e.usage.length);

      data.push([e.name, e.usage, e.description]);
    });

    //create help return string (pad name + usage to max length)
    data.forEach((e) =>
    {
      str += this.formatHelp(e[0], e[1], e[2], nameUsageLen);
      str += "\n";
    });

    return str;
  }

}

var U = require.main.require("./utils/Utils.js");
var P = require.main.require("./utils/Permissions.js");

function pad(pad, str, padLeft)
{
  if (typeof str === 'undefined')
    return pad;
  if (padLeft)
  {
    return (pad + str).slice(-pad.length);
  }
  else
  {
    return (str + pad).substring(0, pad.length);
  }
}

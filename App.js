module.exports = class App
{
  constructor()
  {
    var secret = require("./secret.js");
    this.bot = new Eris(secret.discord, { maxShards: 'auto' });
    this.commands = new Commands(this);

    this.config = JSON.parse(fs.readFileSync("./config.json"));

    this.db = new Database(this);
    //this.yt = new YouTube();
    //this.yt.setKey(secret.youtube);

    this.bot.on("ready", this.onReady.bind(this));
    this.bot.on("messageCreate", this.onMessage.bind(this));
    this.bot.on("error", this.onDisconnect.bind(this))

    this.bot.connect();
  }

  onReady()
  {
    console.log("Ready!");
    //TODO: init function?
    this.lavalink = new Lavalink(this);
    //this.settings = new Settings(this);
  }

  onDisconnect(err, id)
  {
    //this.bot.disconnect();
    //console.log("Lost connection to discord, trying to reconnect...");
    //this.bot.connect();
    console.log(err);
  }

  async onMessage(msg)
  {
    try
    {
      //var prefix = await this.settings.get(msg.channel.guild.id, "prefix") || this.config.prefix;
      var prefix = (this.bot.user.id == "430118450795380736") ? "[=" : (await this.db.getGuildSettings(msg.channel.guild.id)).prefix || this.config.prefix;

      if(msg.content.startsWith(prefix) || msg.content.startsWith(this.bot.user.mention))
      {
        var text = msg.content.startsWith(prefix) ? msg.content.slice(prefix.length).trim() : msg.content.slice(this.bot.user.mention.length).trim(); //TODO: trim?

        this.commands.doCommand(msg, this, text);
      }
    }
    catch(e)
    {
      console.log(e);
      //this.bot.createMessage(msg.channel.id, "" + (typeof e));
    }
  }
}

//var YouTube = require('youtube-node');
var Eris = require('eris');
var assert = require("assert");
var util = require('./utils/Utils.js');
var Commands = require("./commands/Commands.js");
var Lavalink = require("./utils/Lavalink.js");
var Database = require("./utils/Database.js");
var Settings = require("./utils/Settings.js");
//var RestartHandler = require("./utils/RestartHandler.js");
var fs = require("fs");

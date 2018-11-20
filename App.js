module.exports = class App
{
  constructor()
  {
    var secret = require("./secret.js");
    this.bot = new Eris(secret.discord, { maxShards: 'auto' });
    this.commands = new Commands(this);
    this.version = "2.0.0"

    this.config = JSON.parse(fs.readFileSync("./config.json"));

    this.db = new Database(this);
    this.youtube = new Youtube(secret.youtube);

    this.bot.on("ready", this.onReady.bind(this));
    this.bot.on("guildCreate", this.onJoin.bind(this));
    this.bot.on("messageCreate", this.onMessage.bind(this));
    this.bot.on("error", this.onDisconnect.bind(this));

    this.bot.connect();
  }

  onReady()
  {
    console.log("Ready!");
    //TODO: init function?
    this.lavalink = new Lavalink(this);
    //this.settings = new Settings(this);

    var secret = require("./secret.js");

    const DBL = require("dblapi.js");
    if(this.bot.user.id == "316520238835433482")
    {
      //Discord Bots List
      console.log("DBL updating enabled...");
      const dbl = new DBL(secret.dbl, {statsInterval: 900000}, this.bot);
      dbl.on('posted', this.onPosted.bind(this));

      //Discord Bots (API is disabled atm)
      /*setInterval(() => {
        DBA.postGuilds(this.bot, secret.dbots);
        console.log("Posted stats to dbots!");
      }, 900000);*/
    }
  }

  onDisconnect(err, id)
  {
    //this.bot.disconnect();
    //console.log("Lost connection to discord, trying to reconnect...");
    //this.bot.connect();
    console.log(err);
  }

  //Called when Discord Bots List updates its data
  onPosted()
  {
    console.log("Server count updated for dbl");
  }

  onJoin(guild)
  {
    var channel = U.getLogicalChannel(this, guild);

    if(channel != null)
    {
      this.bot.createMessage(channel.id, U.createWelcomeEmbed(this));
    }
  }

  async onMessage(msg)
  {
    try
    {
      if(!msg.channel.type == 1)
      {
        //var prefix = (await this.db.getGuildSettings(msg.channel.guild.id)).prefix || this.config.prefix;
        var prefix = (this.bot.user.id == "430118450795380736") ? "[=" : (await this.db.getGuildSettings(msg.channel.guild.id)).prefix || this.config.prefix;

        var mention = msg.content.startsWith(this.bot.user.mention) ? "<@" + this.bot.user.id + ">" : "<@!" + this.bot.user.id + ">"

        if((msg.content.startsWith(prefix) || msg.content.startsWith(mention)) && !msg.author.bot)
        {
          //the command
          var text = msg.content.startsWith(prefix) ? msg.content.slice(prefix.length).trim() : msg.content.slice((mention).length).trim(); //TODO: trim?

          this.commands.doCommand(msg, this, text); //Command system
        }
      } else {
        if(!msg.author.bot)
        {
          this.bot.createMessage(msg.channel.id, U.createErrorEmbed("This is a DM chat", "I can't do anything in dms"));
        }
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
var U = require('./utils/Utils.js');
var DBA = require('./utils/Discord-Bots-api.js');
var Youtube = require('./utils/Youtube-Search.js');
var Commands = require("./commands/Commands.js");
var Lavalink = require("./utils/Lavalink.js");
var Database = require("./utils/Database.js");
var Settings = require("./utils/Settings.js");
//var RestartHandler = require("./utils/RestartHandler.js");
var fs = require("fs");

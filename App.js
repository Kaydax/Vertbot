module.exports = class App
{
  constructor()
  {
    var secret = require("./secret.js");
    this.bot = new Eris(secret.discord, { maxShards: 'auto' });
    this.commands = new Commands(this);
    this.version = require('./package.json').version; //"2.1.2"
    this.config = JSON.parse(fs.readFileSync("./config.json"));

    if(this.config.disableDBL == false)
    {
      this.dbl = new DBL(secret.dbl, this.bot)
      this.dbl.on("posted", this.onPosted.bind(this));
      this.dbl.on("error", this.onDBLError.bind(this))

      setInterval(() => {
        DBA.postGuilds(this.bot, secret.dbots);
      }, 1800000);
    }

    this.db = new Database(this);
    this.youtube = new Youtube(secret.youtube);
    this.cadmium = new Cadmium({
      version: require('./package.json').cadmiumVersion,
      secret: this.config.cadmium.secret,
      url: this.config.cadmium.url,
      app: this
    });

    this.cadmium.connect().then(() => {
      console.log("Cadmium connected.");
    }).catch(ex => {
      console.log("Cadmium connnection failed: " + ex);
    });

    this.cadmium.on('packet', packet => {
      console.log('packet', packet);
      let url = packet.url;
      this.bot.createMessage(packet.channel, "Cadmium requested play " + url);
    });

    this.cadmium.on('error', err => {
      console.log("Cadmium error: " + err);
    });

    this.bot.on("ready", this.onReady.bind(this));
    this.bot.on("guildCreate", this.onJoin.bind(this));
    this.bot.on("messageCreate", this.onMessage.bind(this));
    this.bot.on("error", this.onDisconnect.bind(this));

    this.bot.connect();
  }

  onReady()
  {
    console.log("Ready!");
    this.bot.editStatus("online", {name: "v-help for info", type: 0})
    var secret = require("./secret.js");
    if(this.config.disableDBL == false) { DBA.postGuilds(this.bot, secret.dbots); } //Post the guild stats to dbots apon launch
    //TODO: init function?
    this.lavalink = new Lavalink(this);
    //this.settings = new Settings(this);
  }

  onPosted()
  {
    console.log("Server count posted!");
  }

  onDBLError()
  {
    console.error("Server count could not be posted. This may be because of the fact there is no token");
  }

  onDisconnect(err, id)
  {
    //this.bot.disconnect();
    //console.log("Lost connection to discord, trying to reconnect...");
    //this.bot.connect();
    console.log(err);
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
var DBL = require("dblapi.js");
var assert = require("assert");
var U = require('./utils/Utils.js');
var DBA = require('./utils/Discord-Bots-api.js');
var Youtube = require('./utils/Youtube-Search.js');
var Commands = require("./commands/Commands.js");
var Lavalink = require("./utils/Lavalink.js");
var Database = require("./utils/Database.js");
var Settings = require("./utils/Settings.js");
var Cadmium = require("./utils/Cadmium.js");
//var RestartHandler = require("./utils/RestartHandler.js");
var fs = require("fs");

/** mongoose database io stuff */
module.exports = class Database
{
  constructor(app)
  {
    this.app = app;
    this.dbUrl = this.app.config.dbUrl;
    this.dbName = this.app.config.dbName; //"vertbot"; //TODO: putin config

    this.db = mongoose.createConnection(this.dbUrl + "/" + this.dbName); //TODO change dburl to dburl + dbname
    this.GuildSetting = this.db.model("guildSetting", schema.guildSetting, "settings");
    this.Playlist = this.db.model("playlist", schema.playlist, "settings");
    this.User = this.db.model("user", schema.user, "settings");
    //TODO: create other settings likewise

    //TODO: autosave?
  }

  //TODO: inter-shard communication

  async getGuildSettings(gid)
  {
    var gs = await this.GuildSetting.findOne({id: gid, type: "guild"}).exec();

    if(gs == null)
    {
      return new this.GuildSetting({id: gid});
    }

    return gs;
  }

  async getPlaylist(gid)
  {
    var pl = await this.Playlist.findOne({id: gid, type: "playlist"}).exec();

    if(pl == null)
    {
      return new this.Playlist({id: gid});
    }

    return pl;
  }

  async getUserSettings(uid)
  {
    var user = await this.User.findOne({id: uid, type: "user"}).exec();

    if(user == null)
    {
      return new this.User({id: uid});
    }

    return user;
  }

}

var mongoose = require("mongoose");
var schema = require("./Schema.js");

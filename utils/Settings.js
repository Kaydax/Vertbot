/** read from database on load, periodically save back to database */

module.exports = class Settings
{
  constructor(app)
  {
    this.app = app;

    //global settings
    //per-guild settings (maps ids to mongodb documents)
    this.guildSettings = {};
    //per-channel settings?
    //per-user settings?

    //map of guild ids to "dirty" (upload to mongo) flags
    this.guildDirtyFlags = new Set();

    this.load();

    setTimeout(this.doAutoSave.bind(this), this.app.config.autoSaveInterval);
  }

  /** uses jsonpath */
  guildGet(gid, query)
  {
    console.log(query);
    var gs = this.getGuildSettings(gid, true);

    return jp.value(gs, query);
  }

  guildSet(gid, query, value)
  {
    console.log(query);
    var gs = this.getGuildSettings(gid, true);

    jp.value(gs, query, value);
    this.markGuildDirty();
  }

  doAutoSave()
  {
    if(this.app.config.autoSave)
    {
      this.save();
    }

    setTimeout(this.doAutoSave.bind(this), this.app.config.autoSaveInterval);
  }

  markGuildDirty(gid)
  {
    this.guildDirtyFlags.add(gid);
  }

  async load()
  {
    //load all guild settings for this shard
    var ids = Array.from(this.app.bot.guilds).map(([k, v]) => v.id);
    //grab guild settings from database
    var gs = await this.app.db.getGuildSettings(ids);
    //store in local cache (mapped by id)
    gs.forEach((e) => this.guildSettings[e.id] = e);

    gs.forEach((e) => console.log(e.id + ": " + e.prefix));
  }

  /** creates object if create is true, not null-safe */
  getGuildSettings(gid, create)
  {
    if(!this.guildSettings[gid] && create)
    {
      this.guildSettings[gid] = this.createNewGS(gid);
      this.setDirty(gid);
    }

    return this.guildSettings[gid];
  }

  createNewGS(gid)
  {
    var gs = {};
    gs.type = "guild";
    gs.id = gid;

    return gs;
  }

  save()
  {
    //for each guild with dirty flag set
    this.guildDirtyFlags.forEach(async (id, flag) =>
    {
      if(flag)
      {
        //grab guild settings
        var gs = this.getGuildSettings(id);
        //replace in mongodb
        var res = await this.app.db.updateGuildSettings(gs);
        //console.log("updated settings for guild " + id);
      }
    });

    console.log("...Saved Settings..."); //ocd
    this.guildDirtyFlags.clear();
  }
}

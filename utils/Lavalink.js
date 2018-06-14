module.exports = class Lavalink
{
  //TODO: store voice channel or something because uhhhhh if the user moves or d/cs what happens to msg2vc
  //TODO: playlist control with left/right + 0-9
  //TODO: add checks for user (so they cant stop other peoples music)
  constructor(app)
  {
    this.app = app;

    this.nodes = [{ host: 'localhost', port: 80, region: 'us', password: 'youshallnotpass' }]; //TODO
    this.regions = {
      eu: ['eu', 'amsterdam', 'frankfurt', 'russia', 'hongkong', 'singapore', 'sydney'],
      us: ['us', 'brazil'],
    };

    this.shardCount = app.bot.shards.size; //lol size instead of length
    this.userId = app.bot.user.id;

    //TODO: currently assuming single lavalink node...
    this.node = this.nodes[0];

    this.playerManager = new PlayerManager(this.app.bot, this.nodes,
    {
      numShards: this.shardCount, // number of shards
      userId: this.userId, // the user id of the bot
      regions: this.regions,
      defaultRegion: 'us',
      //defaultRegion: 'us-central',
    });

    this.app.bot.voiceConnections = this.playerManager;
  }

  /** pass voice channel and the message that caused the command, if play is called with an OOB position, position will be reset to 0 */
  async play(vc, msg, doMessage)
  {
    //get next track to play
    var pl = await this.app.db.getPlaylist(vc.guild.id);
    if(pl.tracks.length == 0)
    {
      this.app.bot.createMessage(msg.channel.id, "No tracks in playlist");
      return;
    }
    if(pl.position < 0 || pl.position >= pl.tracks.length)
    {
      await pl.restart();
    }

    var track = pl.currentTrack();

    if(track == null)
    {
      if(msg != null)
      {
        this.app.bot.createMessage(msg.channel.id, "Track really shouldnt be null here... =/");
      }
      return;
    }

    //grab player
    var player = this.getPlayer(vc);
    //if its null, join voice channel
    if(player == null)
    {
      player = await this.join(vc);
      this.registerPlayerEvents(player, msg);
    }

    player.setVolume(pl.volume);
    player.play(track.track); // track is the base64 track we get from Lavalink
    if(!pl.silent || doMessage)
    {
      this.app.bot.createMessage(msg.channel.id, "Playing track " + (pl.position + 1) + " / " + pl.tracks.length + ": " + track.info.title);
    }
  }

  async stop(msg)
  {
    var vc = U.currentVC(this.app, msg.channel.guild.id);
    if(vc == null)
    {
      //throw "Bot is not in a vc";
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("No Voice Channel", "You seem to not be connected to any voice channel I can see. This may have something to do with my permissions"));
    }

    var player = await this.getPlayer(vc);
    if(player == null)
    {
      console.log("player stuck in vc?");
    }

    player.stop();
    this.unregisterPlayerEvents(player);

    this.app.bot.leaveVoiceChannel(vc.id);
  }

  async add(msg, search)
  {
    var tracks = await this.resolveTracks(this.node, search);

    if(tracks.length == 0)
    {
      this.app.bot.createMessage(msg.channel.id, "No tracks to add");
      return;
    }

    var pl = await this.app.db.getPlaylist(msg.channel.guild.id);

    //pl.addAll(tracks);
    //pl.add(tracks[0]);

    msg.content.match(/https?:/) != null ? pl.addAll(tracks) : pl.add(tracks[0]);

    //this.app.bot.createMessage(msg.channel.id, "Adding " + tracks.length + " tracks");
    this.app.bot.createMessage(msg.channel.id, "Adding '" + tracks[0].info.title + "'");
    //var res = await U.youtube(this.app, tracks[0].info.identifier);
    //console.log(JSON.stringify(res.items[0].snippet.thumbnails.maxres.url, null, 2));
  }

  async onDisconnect(err)
  {
    if(err)
    {
      throw "player disconnected: " + err;
    }

    console.log("player disconnected");
  }

  async onError(err)
  {
    throw "player error: " + err;
  }

  async onStuck(info)
  {
    console.log("player stuck player stuck please i beg you: " + info);
  }

  async onEnd(data, msg)
  {
    // REPLACED reason is emitted when playing without stopping, I ignore these to prevent skip loops
    if(data.reason && data.reason === 'REPLACED')
    {

      return;
    }

    //advance playlist
    var pl = await this.app.db.getPlaylist(msg.channel.guild.id);
    await pl.next();
    var vc = U.currentVC(this.app, msg.channel.guild.id);

    if(pl.shuffle)
    {
      await pl.setPosition(Math.floor(Math.random() * pl.tracks.length));
    }

    //playlist ended
    if(pl.position >= pl.tracks.length)
    {
      if(pl.repeat)
      {
        //do repeat
          await pl.restart();
      }
      else
      {
        setTimeout(() => this.stop(msg), 1000);
        this.app.bot.createMessage(msg.channel.id, "Playlist over");
        return;
      }
    }

    //play next song
    this.play(vc, msg);
  }

  unregisterPlayerEvents(player)
  {
    player.removeAllListeners("disconnect");
    player.removeAllListeners("error");
    player.removeAllListeners("stuck");
    player.removeAllListeners("end");
  }

  registerPlayerEvents(player, msg)
  {
    //remove listeners to prevent memory leaks
    this.unregisterPlayerEvents(player);

    player.on("disconnect", (e) => this.onDisconnect(e, msg));
    player.on("error", (e) => this.onError(e, msg));
    player.on("stuck", (e) => this.onStuck(e, msg));
    player.on("end", (e) => this.onEnd(e, msg));
  }

  getPlayer(channel, unsafe)
  {
    if(!channel || !channel.guild)
    {
      if(unsafe)
      {
        return null;
      }

      throw "channel is null or not a guild channel";
    }

    return this.playerManager.get(channel.guild.id);
  }

  join(channel)
  {
    if(!channel || !channel.guild)
    {
      return Promise.reject('Not a guild channel.');
    }

    return this.app.bot.joinVoiceChannel(channel.id);
  }

  getPlayerOld(channel)
  {
    if(!channel || !channel.guild) {
        return Promise.reject('Not a guild channel.');
    }
    //let player = this.app.bot.voiceConnections.get(channel.guild.id);
    let player = this.playerManager.get(channel.guild.id);
    if (player) {
        return Promise.resolve(player);
    }

    let options = {};//create a variable called "options", and store an empty object in it.
    if (channel.guild.region) {
        options.region = channel.guild.region; //put "channel.guild.region"'s info in options.region
    }

    //return this.app.bot.voiceConnections.join(channel.guild.id, channel.id, options);
    //return this.playerManager.join(channel.guild.id, channel.id, options);
    //return this.app.bot.voiceConnections.join(channel.guild.id, channel.id, null);
    var conn = this.app.bot.joinVoiceChannel(channel.id);

    return conn;
  }

  async resolveTracks(node, search)
  {
    try
    {
      var result = await superagent.get(`http://${node.host}:2333/loadtracks?identifier=${search}`)
        .set('Authorization', node.password)
        .set('Accept', 'application/json');
    }
    catch (err)
    {
      throw err;
    }

    if (!result) {
        throw 'Unable play that video.';
    }

    return result.body; // array of tracks resolved from lavalink
  }
}

var {PlayerManager} = require("eris-lavalink");
var superagent = require("superagent");
var U = require.main.require("./utils/Utils.js");

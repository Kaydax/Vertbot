module.exports = class Lavalink
{
  //TODO: store voice channel or something because uhhhhh if the user moves or d/cs what happens to msg2vc
  //TODO: playlist control with left/right + 0-9
  //TODO: add checks for user (so they cant stop other peoples music)
  constructor(app)
  {
    this.app = app;

    //Note: As of 3.1.X and up, the WS and Rest Ports are the same
    this.nodes = this.app.config.nodes //[{ host: 'localhost', port: 80, region: 'us', password: 'youshallnotpass' }];
    this.regions = {
      asia: ['hongkong', 'singapore', 'sydney'],
      eu: ['eu', 'amsterdam', 'frankfurt', 'russia'],
      us: ['us', 'brazil'],
    };

    this.shardCount = app.bot.shards.size; //lol size instead of length
    this.userId = app.bot.user.id;

    //TODO: currently assuming single lavalink node...
    this.node = this.nodes[0];
    //console.log(this.nodes[0]);

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
  async play(vc, msg, app, doMessage)
  {
    //get next track to play
    var pl = await this.app.db.getPlaylist(vc.guild.id);

    if(pl.tracks.length == 0)
    {
      this.app.bot.createMessage(msg.channel.id, U.createErrorEmbed("No tracks in playlist", "There seems to be no tracks in the playlist, please add some and try again"));
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
        this.app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Track is null", "The track really shouldn't be null here..."));
      }
      return;
    }

    if(!vc.permissionsOf(this.app.bot.user.id).has("voiceConnect"))
    {
      if(msg != null)
      {
        this.app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Invalid permissions", "It seems that I don't have permission to join that voice channel"));
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
    var bands = [{"band": 0,"gain": pl.boost},{"band": 1,"gain": pl.boost},{"band": 2,"gain": pl.boost}];
    player.setEQ(bands);
    player.play(track.track); // track is the base64 track we get from Lavalink
    if(!pl.silent || doMessage)
    {
      var position = pl.shuffle ? pl.indexes[pl.position] + 1 : pl.position + 1;
      this.app.bot.createMessage(msg.channel.id, U.createNowPlayingEmbed(position + " / " + pl.tracks.length, "**" + track.info.title + "**"));
    }
  }

  async stop(msg, app)
  {
    var vc = U.currentVC(this.app, msg.channel.guild.id);
    if(vc == null)
    {
      //throw "Bot is not in a vc";
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("No Voice Channel", "You seem to not be connected to any voice channel"));
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

  async add(msg, search, play, vc, app)
  {
    var tracks = await this.resolveTracks(this.node, search);

    if(tracks.tracks.length == 0)
    {
      this.app.bot.createMessage(msg.channel.id, U.createErrorEmbed("No tracks to add", "There seems to be nothing found that I can add. Try to make your search more clear"));
      return;
    }

    //Show the video info from text search
    if(search.startsWith("ytsearch:"))
    {
      var info = tracks.tracks[0].info;
      var title = info.title;
      var id = info.identifier;
      var author = info.author;

      //This used to be using the youtube api until I figured out how the thumbnail's worked

      this.app.bot.createMessage(msg.channel.id, U.createSearchEmbed(title, id, author));
    }

    var pl = await this.app.db.getPlaylist(msg.channel.guild.id);

    //pl.addAll(tracks);
    //pl.add(tracks[0]);

    //Lavalink 3 uses tracks.tracks[0] and not tracks[0] to add playlist info support

    if(msg.content.match(/https?:/) != null)
    {
      await pl.addAll(tracks.tracks)
    } else {
      await pl.add(tracks.tracks[0]);
    }
    //this.app.bot.createMessage(msg.channel.id, "Adding " + tracks.length + " tracks");

    if(tracks.loadType == "PLAYLIST_LOADED") {
      this.app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Added new playlist", "Added all of `" + tracks.playlistInfo.name + "` to the playlist"))
    } else {
      this.app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Added new track", "Added `" + tracks.tracks[0].info.title + "` to the playlist"));
    }

    await pl.createShuffleArray();

    if(play)
    {
      await pl.setPosition(pl.tracks.length - 1);
      this.play(vc, msg, app, true);
    }

    //This is for debuging track info:
    //console.log(tracks);

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
        this.app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Finished playing", "Playlist over"));
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
      var result = await superagent.get(`http://${node.host}:${node.restport}/loadtracks?identifier=${search}`)
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

var {PlayerManager} = require("vertbot-eris-lavalink");
var superagent = require("superagent");
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();
var U = require.main.require("./utils/Utils.js");

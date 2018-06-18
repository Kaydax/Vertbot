var U = {};

var fd = require("format-duration");

module.exports = U;

/** finds the voice channel of the user that sent the given message */
U.msg2vc = function(msg)
{
  var vcid = msg.member.voiceState.channelID;
  var vc = msg.channel.guild.channels.get(vcid);

  return vc;
}

U.msg2gid = function(msg)
{
  var gid = msg.channel.guild.id;

  return gid;
}

U.currentVC = function(app, gid)
{
  var guild = app.bot.guilds.get(gid);
  var member = guild.members.get(app.bot.user.id);
  var vcid = member.voiceState.channelID;
  var vc = guild.channels.get(vcid);

  return vc;
}

/*U.sharedVc = function(app, msg, gid)
{
  if()
  {

  } else {

  }
}*/

U.onOff = function(onOff)
{
  return onOff ? "on" : "off";
}

U.wrapMention = function(msg, text)
{
  return msg.author.mention + " " + text;
}

U.wrapCode = function(text)
{
  return "```\n" + text + "```";
}

/** convert milliseconds to string */
//TODO: optional minutes/hours based on a second input (total time)
U.ms2str = function(ms, total)
{
  return fd(ms); //:^)
}

U.sendHelp = function(app, msg, command, self)
{
  U.reply(app, msg, U.wrapCode(command.getHelp(self)));
}

U.reply = function(app, msg, text)
{
  app.bot.createMessage(msg.channel.id, U.wrapMention(msg, text));
}

U.getVolume = function(v, min, max)
{
  var val = v.replace( /^\D+/g, '');
  return (val > min) ? ((val < max) ? val : max) : min;
}

U.str2id = function(str)
{
  str = str.trim();
  var id = str.match(/<@(\d+)>|(\d+)/);
  if(id == null)
  {
    return null;
  }

  id = id[0];

  return id;
}

/** returns true if the permission set has access to the command */
U.canUseCommand = function(userPerms, command)
{
  if(command.permissions.length == 0)
  {
    return true;
  }

  //if we have all permissions
  return command.permissions.every((reqPerm) => {
    //if require permission is in user perms
    if(userPerms.includes(reqPerm))
    {
      return true;
    }

    //REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEturn
    if(reqPerm == "dev" && userPerms.includes("dev"))
    {
      return true;
    }
    else if(reqPerm == "owner" && ["dev", "owner"].some((e) => userPerms.includes(e)))
    {
      return true;
    }
    else if(reqPerm == "admin" && ["dev", "owner", "admin"].some((e) => userPerms.includes(e)))
    {
      return true;
    }
    else if(reqPerm == "donor" && ["dev", "donor"].some((e) => userPerms.includes(e)))
    {
      return true;
    }

    return false;

  });
}

U.youtube = function(app, id)
{
  return new Promise((resolve, reject) =>
  {
    app.yt.getById(id, function(err, res)
    {
      if(err)
      {
        reject(err);
      }
      else
      {
        resolve(res);
      }
    });
  });
}

U.hexToColour = function(hex)
{
  return parseInt(hex, 16);
}

U.getCurrentShard = function(app, gid)
{
  return (app.bot.guilds.get(gid).shard.id + 1) + " / " + ((app.bot.shards.size != undefined || app.bot.shards.size != null) ? app.bot.shards.size : "1");
}

//------------Embeds------------
U.embedField = function(name, value, inline)
{
  return {
    name: name,
    value: value,
    inline: inline
  }
}

U.thumbnail = function(url, width, height)
{
  return {
    url: url,
    proxy_url: url,
    width: width,
    height: height
  }
}

U.author = function(name, url, icon)
{
  return {
    name: name,
    url: url,
    icon_url: icon,
    proxy_icon_url: icon
  }
}

U.createSearchEmbed = function(data)
{

}

U.createPlaylistEmbed = function(pl, player, vc)
{
  //TODO: fill these in
  var curTrack = pl.tracks[pl.position];
  var nowPlaying = vc == undefined ? "Nothing" : curTrack.info.title;
  //TODO: player null check
  var time = player == null || curTrack == null ? "0:00 / 0:00" : U.ms2str(player.state.position) + " / " + U.ms2str(curTrack.info.length);
  var modes = U.wrapCode("Repeat: " + U.onOff(pl.repeat) + ", Shuffle: " + U.onOff(pl.shuffle) + ", Silent: " + U.onOff(pl.silent));

  //var trackNames = pl.tracks.map((e) => e.info.title);

  //find start, end centered around current position (pl.position)
  var beforeAfter = 7;
  var start = pl.position - beforeAfter;
  var end = pl.position + beforeAfter;

  var str = "```markdown\n";
  for(var i = start; i < end; i++)
  {
    if(i >= 0 && i < pl.tracks.length)
    {
      var t = pl.tracks[i];
      str += i == pl.position ? "> " : "  ";
      str += i + 1 + ":   ";
      str += t.info.title.length > 50 ? (t.info.title.substring(0, 50) + "...") : t.info.title;
      str += "\n";
    }
  }
  str += "\n{" + pl.tracks.length + " videos in total}```\n"

  return {
    embed:
    {
      fields:
      [
        U.embedField("Playlist:", str, false),
        U.embedField("Now Playing:", nowPlaying, false),
        U.embedField("Time:", time, false),
        U.embedField("Modes:", modes, false)
      ]
    }
  };
}

U.createInfoEmbed = function(app, gid, prefix)
{
  return {
    embed:
    {
      author: U.author("Vertbot", "https://wiki.kaydax.xyz/", "https://kaydax.xyz/other/Vertbot-April.png"),
      description: "Vertbot is a Discord bot built with Eris and Lavalink. Its main purpose is to be one of the only Discord bots that give people the power to give little lag music playback with very few limitations and have fun commands to anyone to mess around with.",
      fields:
      [
        U.embedField("Current prefix:", prefix, true),
        U.embedField("Servers:", "" + app.bot.guilds.size, true),
        U.embedField("Shard:", U.getCurrentShard(app, gid), true)
      ]
    }
  } //U.embedField("", "", true)
}

U.createSuccessEmbed = function(reason, desc)
{
  return {
    embed:
    {
      title: "Success: " + reason,
      description: desc,
      color: U.hexToColour("009b19")
    }
  }
}

U.createErrorEmbed = function(reason, desc)
{
  return {
    embed:
    {
      title: "Error: " + reason,
      description: desc,
      color: U.hexToColour("c04040")
    }
  }
}

U.createQuickEmbed = function(title, desc)
{
  return {
    embed:
    {
      title: title,
      description: desc
    }
  }
}
//------------------------------

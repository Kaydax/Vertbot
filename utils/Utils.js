var U = {};

var fd = require("format-duration");
var format = require("number-format.js");

module.exports = U;

U.getUsersInVc = function(msg, vc)
{
  var members = Array.from(vc.voiceMembers.keys());
  var users = 0;
  var guild = msg.channel.guild;

  for(var i = 0; i < members.length; i++)
  {
    if(!U.getMemberById(guild, members[i]).bot)
    {
      users++
    }
  }

  return users;
}

U.hasRoleWithName = function(member, role)
{
  role = role.toLowerCase();

  //get roles from guild
  var rolesWithName = member.guild.roles;

  //filter roles that have the same name as "role"
  rolesWithName = rolesWithName.filter((e) => e.name.toLowerCase() == role);

  //map to ids
  rolesWithName = rolesWithName.map((e) => parseInt(e.id));
  //console.log("role we want: " + rolesWithName)
  //get roles of member
  var userRoles = member.roles;

  for(var i = 0; i < userRoles.length; i++)
  {
    var id = parseInt(userRoles[i]);

    if(rolesWithName.includes(id))
    {
      return true;
    }
  }

  return false;
}

U.getMemberById = function(guild, id)
{
  return guild.members.filter((e) => e.id == id)[0];
}

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
  //console.log("extra large penis", command, command.constructor.name, command.getHelp)
  U.reply(app, msg, U.wrapCode(command.getHelp(self)));
}

U.reply = function(app, msg, text)
{
  app.bot.createMessage(msg.channel.id, U.wrapMention(msg, text));
}

U.getVal = function(v, min, max)
{
  var val = v.replace( /^\D+/g, '');
  return (val > min) ? ((val < max) ? val : max) : min;
}

U.str2id = function(str)
{
  str = str.trim();
  var id = str.match(/<@!?(\d+)>|(\d+)/);
  if(id == null)
  {
    return null;
  }

  //id = id[0];
  id = id[1];

  return id;
}

/** returns true if the permission set has access to the command */
U.canUseCommand = function(userPerms, command, pl)
{
  if(command.permissions.length == 0)
  {
    return true;
  }

  //if we have all permissions
  //REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEturn
  return command.permissions.every((reqPerm) => {

    if(userPerms.includes("dev"))
    {
      return true;
    }

    //if require permission is in user perms
    if(userPerms.includes(reqPerm))
    {
      return true;
    }

    //override owner -> admin
    if(reqPerm == "admin" && ["owner"].some((e) => userPerms.includes(e)))
    {
      return true;
    }

    //override owner & admin -> dj
    if(reqPerm == "dj" && ["owner", "admin"].some((e) => userPerms.includes(e)))
    {
      return true;
    }

    //override the dj permission check if dj mode is turned on
    if((reqPerm == "dj" && pl.djmode == false) || (reqPerm == "dj" && pl.djmode == undefined))
    {
      return true;
    }

    return false; //User does not have the permissions to use the command

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

U.getLogicalChannel = function(app, guild)
{
  var chans = guild.channels.filter(c => !c.type);
  var channels = Array.from(chans);

  channels.sort((a,b) => a.position - b.position);

  //Bot channel check
  for(var i = 0; i < channels.length; i++)
  {
    if(channels[i].name.match(/(-bot)|(bot-)|^bot$/gi))
    {
      return channels[i];
    }
  }

  //General Channel Check
  for(var i = 0; i < channels.length; i++)
  {
    if(channels[i].name.match(/(-general)|(general-)|^general$/gi))
    {
      return channels[i];
    }
  }

  //If the general and bot channel cannot be found, use the first channel the bot can speak in
  for(var i = 0; i < channels.length; i++)
  {
    if(U.canSpeak(app, channels[i]))
    {
      return channels[i];
    }
  }

  //If all else fails return null
  return null;
}

U.canSpeak = function(app, chan)
{
  var id = app.bot.user.id;

  return chan.permissionsOf(id).has("sendMessages");
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

U.createSearchEmbed = function(title, id, author)
{
  var url = "https://youtube.com/watch?v=" + id; //This is the link back to the video... you should understand how this works already
  var thumbnail = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; //This is pretty much how the api gets the thumbnail, but without the api
  return {
    embed:
    {
      color: U.hexToColour("00C4B1"),
      description: "[" + title + "](" + url + ")",
      author:
      {
        name: author
      },
      image:
      {
        url: thumbnail
      }
    }
  }
}

U.createPlaylistEmbed = function(pl, player, vc)
{
  //TODO: fill these in
  var curTrack = pl.shuffle ? pl.tracks[pl.indexes[pl.position]] : pl.tracks[pl.position];
  var position = pl.shuffle ? pl.indexes[pl.position] : pl.position;
  var nowPlaying = vc == undefined ? "Nothing" : curTrack.info.title;
  //TODO: player null check
  var time = player == null || curTrack == null ? "0:00 / 0:00" : U.ms2str(player.state.position) + " / " + U.ms2str(curTrack.info.length);
  var modes = U.wrapCode("Repeat: " + U.onOff(pl.repeat) + ", Shuffle: " + U.onOff(pl.shuffle) + ", Silent: " + U.onOff(pl.silent) + ", DJ Mode: " + U.onOff(pl.djmode));

  //var trackNames = pl.tracks.map((e) => e.info.title);

  //find start, end centered around current position (pl.position)
  var beforeAfter = 7;
  var start = position - beforeAfter;
  var end = position + beforeAfter;

  var str = "```markdown\n";
  for(var i = start; i < end; i++)
  {
    if(i >= 0 && i < pl.tracks.length)
    {
      var t = pl.tracks[i];
      str += i == position ? "> " : "  ";
      str += position <= 992 ? (i + 1 + ": ").padEnd(5, " ") : (i + 1 + ": ").padEnd(6, " ");
      str += position <= 992 ? (t.info.title.length > 50 ? (t.info.title.substring(0, 50) + "...") : t.info.title) : (t.info.title.length > 48 ? (t.info.title.substring(0, 48) + "...") : t.info.title);
      str += "\n";
    }
  }
  str += "\n{" + pl.tracks.length + " videos in total}```\n"

  return {
    embed:
    {
      color: U.hexToColour("00C4B1"),
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

U.createInfoEmbed = function(app, gid, prefix, msg)
{
  return {
    embed:
    {
      author: U.author("Vertbot", "https://kaydax.xyz/", app.bot.user.avatarURL),
      description: "I'm Vertbot, a Discord bot built with Eris and Lavalink. My main purpose is to be one of the only Discord bots that give people the power to play music with little lag and very few limitations.",
      color: U.hexToColour("00C4B1"),
      fields:
      [
        U.embedField("Current prefix:", prefix, true),
        U.embedField("Current Build:", app.version, true),
        U.embedField("Uptime:", U.ms2str(app.bot.uptime), true),
        U.embedField("Servers:", format("#,###.", app.bot.guilds.size), true),
        U.embedField("Users:", format("#,###.", app.bot.users.size), true),
        U.embedField("Shard:", U.getCurrentShard(app, gid), true),
        U.embedField("My Discord:", "[Join Now](https://discord.gg/WPUU2dF)", true),
        U.embedField("Servers using music:", app.bot.voiceConnections.size, true),
        U.embedField("Ping:", msg.channel.guild.shard.latency, true)
      ],
      footer:
      {
        text: "Developed by: Kaydax#0001 & tehZevo#0321."
      }
    }
  } //U.embedField("", "", true)
}

U.createWelcomeEmbed = function(app)
{
  return {
    embed:
    {
      author: U.author("Vertbot", "https://kaydax.xyz/", app.bot.user.avatarURL),
      description: "Hello, I'm Vertbot! Thank you for adding me to your server. To get started just do `v-help` and look through the list of commands. If you don't understand how to use the commands, join my support server.",
      color: U.hexToColour("00C4B1"),
      fields:
      [
        U.embedField("My Support Server:", "[Join Now](https://discord.gg/WPUU2dF)", true),
        U.embedField("Vote For Me:", "[Please Vote](https://discordbots.org/bot/316520238835433482/vote)", true),
        U.embedField("Donate Now:", "Please help me continue to run by [clicking here](https://donatebot.io/checkout/317570975908495361) else do `v-donate`", true),
      ],
      footer:
      {
        text: "Developed by: Kaydax#0001 & tehZevo#0321"
      }
    }
  }
}

U.createDonateEmbed = function()
{
  return {
    embed:
    {
      title: "",
      description: "If you want to help me [click here](https://donatebot.io/checkout/317570975908495361)",
      color: U.hexToColour("00C4B1"),
      fields:
      [
        U.embedField("I also support crypto:", "
        ```\n
        Bitcoin: 12gzEmGsNtqPpaJQG4dKGAFcgvu7aP6q47\n
        Ethereum: 0xCC4050FF70008D3D9875CeEFbDCbCe27F5bc61bd\n
        XRP: r4TQWdYrpiibCwmXWZhajbnUcwHZvKRebn\n
        BAT: 0xCC4050FF70008D3D9875CeEFbDCbCe27F5bc61bd\n
        Stellar: GBCVXJJQDIT2WJYRVN23DBC635VPZDRGCBG3A3ILMGJWZOCWK4GSKAEF\n
        Bitcoin Cash: qpytmmpm8an6cfds3t8mqyxnn4pcmqderscv6dgtar\n
        Binance Coin: bnb1pf4mwyh76g5y4gqjh9khlsagqxy8trjhnel0mq\n
        Bitcoin SV: 1DXqBUUXUwiEjSJy4zFg7Hsn455iCxBwCi\n
        Dash: XxB815XHAMGdv5PECfWtnx6oyHmP4FW2pv\n
        Litecoin: LdCHqHD4ggWdRQF84TSBU5BahJAn7LvF2q\n
        NEO: AR1piF14vZfesSmERGbsyJ1b5cct6SYqUL\n
        Tron: TULZsQj4539DHi9mA9Df7RFBmjAeQeSkoV\n
        TUSD: 0xCC4050FF70008D3D9875CeEFbDCbCe27F5bc61bd\n
        USDC: 0xCC4050FF70008D3D9875CeEFbDCbCe27F5bc61bd\n
        ```", false),
      ]
    }
  }
}

U.createBooruEmbed = function(user, image, tags, url)
{
  return {
    embed:
    {
      title: "Booru command requested by " + user,
      color: U.hexToColour("00C4B1"),
      image:
      {
        url: image,
        proxy_url: image
      },
      fields:
      [
        U.embedField("Tags:", "```" + tags + "```", false),
        U.embedField("Post URL:", url, false)
      ]
    }
  }
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

U.createNowPlayingEmbed = function(pos, desc)
{
  return {
    embed:
    {
      title: "Now Playing " + pos + ":",
      description: desc,
      color: U.hexToColour("00C4B1")
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
      description: desc,
      color: U.hexToColour("00C4B1")
    }
  }
}
//------------------------------

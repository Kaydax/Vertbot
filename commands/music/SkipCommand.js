var Command = require("../Command.js");

module.exports = class SkipCommand extends Command
{
  constructor()
  {
    super();

    this.name = "skip";
    this.description = "skip the current playlist item";
    this.votes = [];
  }

  async voteSkip(msg, app, vc)
  {
    var user = msg.author.id;

    if(this.votes.includes(user))
    {
      return;
    } else {
      this.votes.push(user);
    }

    return;
  }

  async skip(msg, app, text, pl, vc)
  {
    if(pl.repeat == false || pl.repeat == undefined)
    {
      //glitch likely caused by lavalink grabbing its own (slightly outdated) copy of the playlist
      await pl.next(); //advance playlist (wait for save confirmation to prevent glitch)

      app.lavalink.play(vc, msg, app, true);
    } else {
      app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Repeat is on", "Turn off Repeat in order to skip"));
    }

    return;
  }

  async doCommand(msg, app, text)
  {
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    var vc = U.msg2vc(msg);
    var beforeVotes = this.votes;
    var perms = await P.getPerms(app, msg);
    var gid = U.msg2gid(msg);

    //Getto permission check to have less code and to make it so the command can still be used in some ways
    if(pl.djmode == true && U.canUseCommand(perms, {permissions: ["dj"]}, pl))
    {
      this.skip(msg, app, text, pl, vc)
    } else {
      if(pl.djmode == false || pl.djmode == undefined) { await this.skip(msg, app, text, pl, vc); }

      if(pl.djmode == true)
      {
        await this.voteSkip(msg, app, vc);

        var currentVotes = this.votes.length;
        var quota = U.getUsersInVc(msg, vc) / 2;
        var voteString = currentVotes + "/" + Math.round(quota);

        console.log(voteString);

        if(currentVotes >= quota)
        {
          app.bot.createMessage(msg.channel.id, U.createSuccessEmbed("Vote Passed", voteString + " voted"));
          await this.skip(msg, app, text, pl, vc);
          this.votes = [];
        } else {
          app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Vote Skip:", voteString + " voted"));
        }
      }
    }
  }
}

/*
[=add https://www.youtube.com/watch?v=dJaVI7jzc8s
[=add https://www.youtube.com/watch?v=WNxZiBexDM8
[=add https://www.youtube.com/watch?v=IUun0CWrvT0
*/
var U = require.main.require("./utils/Utils.js");
var P = require.main.require("./utils/Permissions.js");

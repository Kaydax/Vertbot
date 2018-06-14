var Command = require("../Command.js");

module.exports = class PlaylistCommand extends Command
{
  constructor()
  {
    super();

    this.name = "list";
    this.aliases = ["playlist", "np", "nowplaying"];
    this.description = "show the playlist";
  }

  async doCommand(msg, app, text)
  {
    var pl = await app.db.getPlaylist(msg.channel.guild.id);
    var vc = U.currentVC(app, msg.channel.guild.id);
    var player = app.lavalink.getPlayer(vc, true); //jeebus

    app.bot.createMessage(msg.channel.id, U.createPlaylistEmbed(pl, player, vc));
  }
}

var U = require.main.require("./utils/Utils.js");

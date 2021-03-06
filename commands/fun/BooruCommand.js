var Command = require("../Command.js");

module.exports = class BooruCommand extends Command
{
  constructor()
  {
    super();

    this.name = "booru";
    this.description = "NSFW commands are the best";
    this.usage = "<site> <tags>"
  }

  async doCommand(msg, app, text)
  {
    var sites = ["danbooru","konachan","konachannet","yandere","gelbooru","rule34","safebooru","tbib","xbooru","youhateus"]
    if(text <= 0)
    {
      app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Here are the sites that are supported:","```" + sites.join("\n") + "```"));
    } else if(text.split(' ')[0] == "help") {
      app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Here are the sites that are supported:","```" + sites.join("\n") + "```"));
    } else {
      var array = text.split(' ');
      var site = array[0];
      var tag = array.splice(1, text.length);
      if(msg.channel.nsfw == true)
      {
        if(sites.indexOf(site) > -1)
        {
          const images = kaori.search(site, { tags: tag, random: true }).then((images) =>
          {
            images.map(image => {
              console.log();
              app.bot.createMessage(msg.channel.id, U.createBooruEmbed(msg.author.username, image.fileURL, image.tags.join(" "), image.fileURL))
            });
          }).catch(err => app.bot.createMessage(msg.channel.id, U.createErrorEmbed("Something went wrong", "```" + err + "```")));
        } else {
          app.bot.createMessage(msg.channel.id, U.createQuickEmbed("Here are the sites that are supported:","```" + sites.join("\n") + "```"));
        }
      } else {
        app.bot.createMessage(msg.channel.id, U.createErrorEmbed("This channel is not NSFW", "This command can only be used in channels that are marked as NSFW"))
      }
    }
  }
}

var U = require.main.require("./utils/Utils.js");
var kaori = require('kaori');

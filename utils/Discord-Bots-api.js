//Basically discord-bots-api on npm but for only posting the guild count

var DBA = {};
module.exports = DBA;

DBA.postGuilds = async function(bot, token)
{
  var url = "https://bots.discord.pw/api/bots/316520238835433482/stats";
  for(var i = 0; i < bot.shards.size; i++)
  {
    var options =
    {
      method: 'POST',
      uri: url,
      body: {
        "shard_id": i,
        "shard_count": bot.shards.size,
        "server_count": bot.guilds.size
      },
      headers: {
        "Authorization": token
      },
      json: true
    };
    rp(options).catch(function (err) {
      console.log(err);
    });
  }
}

var rp = require('request-promise');
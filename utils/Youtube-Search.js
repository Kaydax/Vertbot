//This is like youtube-node but made for my own use case
//This really is only for the times you actually need to use the youtube api
module.exports = class YoutubeSearch
{
  constructor(key)
  {
    this.key = key;
  }

  //https://www.googleapis.com/youtube/v3/search?part=snippet&q={The_Search}&type=video&key={The_Key}
  async getVideoInfo(id)
  {
    return rp("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&type=video&key=" + this.key).then(function(response) {
      return JSON.parse(response).items[0];
    });
  }
}

var rp = require('request-promise');

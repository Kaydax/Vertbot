/** interfaces with settings */
module.exports = class Playlist
{
  constructor(app)
  {
    this.app = app;
  }

  /** for now, just increment position */
  next(gid)
  {
    //increment position TODO: itll keep incrementing lol..
    var position = this.getPosition(gid) || 0;
    this.setPosition(gid, position + 1);

    //get current track
    //return this.currentTrack(gid);
  }

  goto(pos, gid)
  {
    this.setPosition(gid, pos);
  }

  currentTrack(gid)
  {
    var position = this.getPosition(gid) || 0;
    var tracks = this.getTracks(gid);

    //if position is out of range, return null
    if(position < 0 || position >= tracks.length)
    {
      return null;
    }

    //grab track
    return tracks[position];
  }

  restart(gid)
  {
    var position = this.getPosition(gid) || 0;
    this.setPosition(gid, position + 1);
  }

  addAll(gid, tracks)
  {
    tracks.forEach((e) => this.add(gid, e));
  }

  add(gid, track)
  {
    var tracks = this.app.settings.guildSet(gid, "$.playlist.tracks[(@.length)]", track);
  }

  /** grabs guild playlist from settings, creates if not exist */
  getPlaylist(gid)
  {
    return this.app.settings.guildGet(gid, "$.playlist");
  }

  /** gets playlist tracks, creates if not exist */
  getTracks(gid)
  {
    this.app.settings.guildGet(gid, "$.playlist.tracks");
  }

  /** returns position, creates if not exist */
  getPosition(gid)
  {
    return this.app.settings.guildGet(gid, "$.playlist.position");
  }

  setPosition(gid, position)
  {
    this.app.settings.guildSet(gid, "$.playlist.position", position);
  }
}

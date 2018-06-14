var mongoose = require("mongoose");
var Schema = mongoose.Schema;
//oh boy here we go...

var S = {};
module.exports = S;

var guildSetting = Schema({
  id: String, //guild id
  type: {type: String, default: "guild"},
  prefix: String,
});

S.guildSetting = guildSetting;

guildSetting.methods.setPrefix = function(prefix)
{
  this.prefix = prefix;
  //console.log("new prefix: " + prefix)
  this.save();
}

var playlist = Schema({
  id: String, //guild id
  type: {type: String, default: "playlist"},
  tracks: [],
  position: {type: Number, default: 0},
  volume: {type: Number, default: 100},
  shuffle: Boolean,
  repeat: Boolean,
  autoRemove: Boolean,
  silent: Boolean,
  //TODO: volume, time, etc
});

S.playlist = playlist;

playlist.methods.currentTrack = function()
{
  return this.tracks[this.position || 0];
}

playlist.methods.clear = async function()
{
  //clear
  this.tracks.splice(0, this.tracks.length);
  this.position = 0;
  return await this.save();
}

playlist.methods.next = async function()
{
  //increment, null safe
  this.position = this.position == null ? 0 : this.position;
  this.position = this.position + 1;//Math.min(, this.tracks.length);
  return await this.save();
}

playlist.methods.setPosition = async function(pos)
{
  this.position = pos
  return await this.save();
}

playlist.methods.restart = async function()
{
  this.position = 0;
  return await this.save();
}

//TODO: make add/addall cleaner?
playlist.methods.add = async function(track)
{
  this.tracks.push(track);
  return await this.save();
}

playlist.methods.addAll = async function(tracks)
{
  for(var track of tracks)
  {
    await await this.add(track);
  }
}

playlist.methods.setRepeat = async function(repeat)
{
  this.repeat = repeat;

  return await this.save();
}

playlist.methods.setShuffle = async function(shuffle)
{
  this.shuffle = shuffle;

  return await this.save();
}

playlist.methods.setSilent = async function(silent)
{
  this.silent = silent;

  return await this.save();
}

var user = Schema({
  id: String, //user id
  type: {type: String, default: "user"},
  permissions: [String], //this should be a set but whatever
});

S.user = user;

user.methods.addPermission = async function(perm)
{
  perm = perm.trim().toLowerCase();

  if(this.permissions.includes(perm))
  {
    //already has perm
    return;
  }

  this.permissions.push(perm);

  return await this.save();
}

user.methods.removePermission = async function(perm)
{
  perm = perm.trim().toLowerCase();

  this.permissions = this.permissions.filter((e) => e != perm);

  return await this.save();
}

user.methods.hasPermission = function(perm)
{
  return this.permissions.includes(perm);
}

user.methods.getPermissions = function(perm)
{
  return this.permissions;
}

//Added by Kaydax | Start
playlist.methods.setVolume = async function(volume)
{
  this.volume = volume;

  return await this.save();
}
//End

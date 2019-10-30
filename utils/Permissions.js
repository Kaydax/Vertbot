var Eris = require("eris");

var P = {}

module.exports = P;

//dev
//donor
//owner, admin

//dev > owner > admin > donor

/** returns all permissions of user that sent the given message */
P.getPerms = async function(app, msg)
{
  var member = msg.member;
  var dbp = await P.getDBPerms(app, member);
  var gp = await P.getGuildPerms(app, member);
  var rp = await P.getRolePerms(app, member);
  var cp = await P.getConfigPerms(app, member);

  return Array.from(new Set([...dbp,...gp, ...cp,...rp]));
}

P.getDBPerms = async function(app, member)
{
  //TODO: get from database (donor?)
  var uid = member.id;
  var us = await app.db.getUserSettings(uid);
  var perms = us.getPermissions();

  return new Set(perms);
}

P.getGuildPerms = async function(app, member)
{
  var perms = new Set();

  var userPerms = member.permission
  if(userPerms.has("administrator"))
  {
    perms.add("admin");
  }

  if(member.guild.ownerID == member.id)
  {
    perms.add("owner");
  }

  //guild.ownerID

  return perms;
}

P.getRolePerms = async function(app, member)
{
  //role name: permission name
  var mappings = {
    "dj": "dj"
  };

  var perms = new Set();

  for(var key in mappings)
  {
    if(U.hasRoleWithName(member, key))
    {
      perms.add(mappings[key]);
    }
  }

  return perms;
}

P.getConfigPerms = async function(app, member)
{
  //dev, etc
  var uid = member.id;
  var perms = (app.config.perms || {})[uid];

  if(perms == null)
  {
    return new Set();
  }

  return new Set(perms);
}

var U = require.main.require("./utils/Utils.js");

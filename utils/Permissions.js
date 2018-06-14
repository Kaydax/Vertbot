var P = {}

module.exports = P;

//dev
//donor
//owner, admin

//dev > owner > admin > donor

/** returns all permissions of user that sent the given message */
P.getPerms = async function(app, msg)
{
  var dbp = await P.getDBPerms(app, msg);
  var gp = await P.getGuildPerms(app, msg);
  var cp = await P.getConfigPerms(app, msg);

  return Array.from(new Set([...dbp, ...gp, ...cp]));
}

P.getDBPerms = async function(app, msg)
{
  //TODO: get from database (donor?)
  var uid = msg.author.id;
  var us = await app.db.getUserSettings(uid);
  var perms = us.getPermissions();

  return new Set(perms);
}

P.getGuildPerms = async function(app, msg)
{
  //TODO: owner, admin, etc
  return new Set();
}

P.getConfigPerms = async function(app, msg)
{
  //dev, etc
  var uid = msg.author.id;
  var perms = (app.config.perms || {})[uid];

  if(perms == null)
  {
    return new Set();
  }

  return new Set(perms);
}

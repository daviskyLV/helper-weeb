const mariadb = require('mariadb');
const sqlstring = require("sqlstring");
const PWInfo = require("../BotSecrets/PWInfo_HelpfulWeeb.js");
const Settings = require("./Settings.js");

const pool = mariadb.createPool({host: "localhost", user: PWInfo.MYSQL_user, password: PWInfo.MYSQL_pw, connectionLimit: 7, database: "weebHelperDATA"});

// Caches across modules (filled by other modules, not this one)
var GlobUsrCache = {}; // "USER_ID": {"Money":0, "XP":0, "Description": "", "MiscJSON": {}, "LastXP": 0, "LastUsed": 0, "LastUpdated": 0}
var ServSetCache = {}; // "SERVER_ID": {"ignored_channels": {}, "welcome_msg": "", "LastUsed": 0, "LastUpdated": 0}
var CmdSetCache = {}; // "SERVER_ID CommandName": {"FreeUse": 1, "UsagePerms": {}, "ChannelUse": 1, "ChannelPerms": {}, "LastUsed": 0, "LastUpdated":0}
// LastUsed is when was the last time the cache was used
// LastUpdated is when was the last time it was saved to database
// FreeUse means is command available for everyone to use, ChannelUse means is it in every channel,
// if !FreeUse then UsagePerms are userids and roleids who can use it {"u8888":1,"r11111":1}
// if !ChannelUse then ChannelPerms is which channels can have the command, otherwise its which channels cant have the command

function Waiter(taim) { //taim is in seconds
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, taim*1000);
  });
}

async function DoQuery(cmd) {
  let conn;
  try {
    conn = await pool.getConnection();

    let res = await conn.query(cmd);

    return res;
  } catch (err) {
    console.log("DB connection error! ",err);
  } finally {
    if (conn) conn.release(); // release to pool
  }
}


// SAVE FUNCTIONS FOR REUSE
var GlobUsrSave = function(key) {
  let v = GlobUsrCache[key];
  let MiscJSONstr = JSON.stringify(GlobUsrCache[key].MiscJSON);
  let MySQLcmd = sqlstring.format('UPDATE GlobalUsers SET Money = ?, XP = ?, Description = ?, MiscJSON = ? WHERE (userid = ?)', [v.Money, v.XP, v.Description, MiscJSONstr, key]);
  DoQuery(MySQLcmd);
  GlobUsrCache[key].LastUpdated = Date.now();
}
var ServSetSave = function(key) {
  let v = ServSetCache[key];
  let MiscJSONstr = JSON.stringify(ServSetCache[key].ignored_channels);
  let MySQLcmd = sqlstring.format('UPDATE ServerSettings SET ignored_channels = ?, welcome_msg = ? WHERE (server_id = ?)', [MiscJSONstr, v.welcome_msg, key]);
  DoQuery(MySQLcmd);
  ServSetCache[key].LastUpdated = Date.now();
}
var CmdSetSave = function(key) {
  let v = CmdSetCache[key];
  let splt = key.split(" "); let servid = splt[0]; let cmdname = splt[1];
  let usagePstr = JSON.stringify(CmdSetCache[key].UsagePerms);
  let channelPstr = JSON.stringify(CmdSetCache[key].ChannelPerms); //{"FreeUse": 1, "UsagePerms": {}, "ChannelUse": 1, "ChannelPerms": {}, "LastUsed": 0, "LastUpdated":0}
  let MySQLcmd = sqlstring.format('UPDATE CommandSettings SET free_use = ?, usage_perms = ?, channel_use = ?, channel_perms = ? WHERE (server_id = ? AND command_name = ?)', [v.FreeUse, usagePstr, v.ChannelUse, channelPstr, servid, cmdname]);
  DoQuery(MySQLcmd);
  CmdSetCache[key].LastUpdated = Date.now();
}

// FORCE SAVING DATA to DATABASE
exports.ForceSave = async function(cmd, vars) {
  if (cmd && vars) { // save specific thing
    let resp = await DoQuery(sqlstring.format(cmd, vars));
    return resp;
  } else { // save all cache (in case of shutdown)
    // Global Users
    Object.keys(GlobUsrCache).forEach(async function(key) {
      await GlobUsrSave(key);
    });
    // Server Settings
    Object.keys(ServSetCache).forEach(async function(key) {
      await ServSetSave(key);
    });
    // Command Settings
    Object.keys(CmdSetCache).forEach(async function(key) {
      await CmdSetSave(key);
    });
    return true;
  }
}

// DATABASE INFO GETTING
exports.GetGlobalUser = async function(userid) {
  if (userid) {
    if (GlobUsrCache[userid.toString()]) { // user info already cached
      return GlobUsrCache[userid.toString()];
    } else { // not cached, getting from database
      let resp = await DoQuery("SELECT * FROM GlobalUsers WHERE userid="+userid)
      if (resp[0]) { // got user from query
        if (resp[0].MiscJSON) {
          resp[0].MiscJSON = JSON.parse(resp[0].MiscJSON);
        } else {resp[0].MiscJSON = {};}
        if (!resp[0].Description) {resp[0].Description = "";}
        GlobUsrCache[userid.toString()] = {"Money":resp[0].Money,"XP":resp[0].XP,"Description":resp[0].Description,"MiscJSON":resp[0].MiscJSON, "LastXP":0, "LastUsed": Date.now(), "LastUpdated": Date.now()};
        return GlobUsrCache[userid.toString()];
      } else { // no user in database, creating new
        GlobUsrCache[userid.toString()] = {"Money":0, "XP": 0, "Description": "", "MiscJSON": {}, "LastXP": 0, "LastUsed": Date.now(), "LastUpdated": Date.now()};
        DoQuery(`INSERT INTO GlobalUsers (userid, Money, XP) VALUES (${userid}, ${0}, ${0})`); // update Database
        return GlobUsrCache[userid.toString()];
      }
    }
  } else { // return all
    return GlobUsrCache;
  }
}

exports.GetServerSettings = async function(serverid) {
  if (serverid) {
    if (ServSetCache[serverid.toString()]) { // server info already cached
      return ServSetCache[serverid.toString()];
    } else { // not cached, getting from database
      let resp = await DoQuery("SELECT * FROM ServerSettings WHERE server_id="+serverid)
      if (resp[0]) { // got user from query
        if (resp[0].ignored_channels) {
          resp[0].ignored_channels = JSON.parse(resp[0].ignored_channels);
        } else {resp[0].ignored_channels = {};}
        if (!resp[0].welcome_msg) {resp[0].welcome_msg = "";} //{"ignored_channels": {}, "welcome_msg": "", "LastUsed": 0, "LastUpdated": 0}
        ServSetCache[serverid.toString()] = {"ignored_channels": resp[0].ignored_channels, "welcome_msg": resp[0].welcome_msg, "LastUsed": Date.now(), "LastUpdated": Date.now()};
        return ServSetCache[serverid.toString()];
      } else { // no server in database, creating new
        ServSetCache[serverid.toString()] = {"ignored_channels": {}, "welcome_msg": "", "LastUsed": Date.now(), "LastUpdated": Date.now()};
        DoQuery(`INSERT INTO ServerSettings (server_id) VALUES (${serverid})`); // update Database
        return ServSetCache[serverid.toString()];
      }
    }
  } else { // return all
    return ServSetCache;
  }
}

exports.GetCommandSettings = async function(serverid,cmdname) {
  if (serverid && cmdname) {
    if (CmdSetCache[serverid.toString()]) { // server cmd info already cached
      return CmdSetCache[serverid.toString()];
    } else { // not cached, getting from database
      let resp = await DoQuery(sqlstring.format("SELECT * FROM CommandSettings WHERE (server_id = ? AND command_name = ?)", [serverid, cmdname]))
      if (resp[0]) { // got cmd from query
        if (resp[0].usage_perms) {
          resp[0].usage_perms = JSON.parse(resp[0].usage_perms);
        } else {resp[0].usage_perms = {};}
        if (resp[0].channel_perms) {
          resp[0].channel_perms = JSON.parse(resp[0].channel_perms);
        } else {resp[0].channel_perms = {};} //"SERVER_ID CommandName": {"FreeUse": 1, "UsagePerms": {}, "ChannelUse": 1, "ChannelPerms": {}, "LastUsed": 0, "LastUpdated":0}

        CmdSetCache[serverid.toString()+" "+cmdname] = {"FreeUse": resp[0].free_use, "ChannelUse": resp[0].channel_use,"UsagePerms": resp[0].usage_perms, "ChannelPerms": resp[0].channel_perms, "LastUsed": Date.now(), "LastUpdated": Date.now()};
        return CmdSetCache[serverid.toString()+" "+cmdname];
      } else { // no server cmd in database, creating new
        CmdSetCache[serverid.toString()+" "+cmdname] = {"FreeUse": 1, "ChannelUse": 1,"UsagePerms": {}, "ChannelPerms": {}, "LastUsed": Date.now(), "LastUpdated": Date.now()};
        DoQuery(sqlstring.format("INSERT INTO CommandSettings (server_id, command_name, free_use, usage_perms, channel_use, channel_perms) VALUES (?, ?, ?, ?, ?, ?)", [serverid, cmdname, 1, "{}", 1, "{}"])); // update Database
        return CmdSetCache[serverid.toString()+" "+cmdname];
      }
    }
  } else { // return all
    return CmdSetCache;
  }
}


// AUTOMATIC LOOPS
async function CacheCleaner() { // Cleans cache every now and then (also saves data)
  while (true) {
    await Waiter(Settings.MYSQLCacheRefresh);

    // Global Users
    Object.keys(GlobUsrCache).forEach(function(key) {
      if (GlobUsrCache[key].LastUpdated+Settings.AutosaveInterval*1000 <= Date.now()) { // autosaving
        GlobUsrSave(key);
      }
      if (GlobUsrCache[key].LastUsed+Settings.MYSQLCacheClean*1000 <= Date.now()) { // remove entry from cache
        if (v.LastUpdated+Settings.AutosaveIgnore*1000 <= Date.now()) { // autosave was too long ago, saving again
          GlobUsrSave(key);
        }
        delete GlobUsrCache[key];
      }
    });

    // Server Settings
    Object.keys(ServSetCache).forEach(function(key) {
      if (ServSetCache[key].LastUpdated+Settings.AutosaveInterval*1000 <= Date.now()) { // autosaving
        ServSetSave(key);
      }
      if (ServSetCache[key].LastUsed+Settings.MYSQLCacheClean*1000 <= Date.now()) { // remove entry from cache
        if (v.LastUpdated+Settings.AutosaveIgnore*1000 <= Date.now()) { // autosave was too long ago, saving again
          ServSetSave(key);
        }
        delete ServSetCache[key];
      }
    });

    // Command Settings
    Object.keys(CmdSetCache).forEach(function(key) {
      if (CmdSetCache[key].LastUpdated+Settings.AutosaveInterval*1000 <= Date.now()) { // autosaving
        CmdSetSave(key);
      }
      if (CmdSetCache[key].LastUsed+Settings.MYSQLCacheClean*1000 <= Date.now()) { // remove entry from cache
        if (v.LastUpdated+Settings.AutosaveIgnore*1000 <= Date.now()) { // autosave was too long ago, saving again
          CmdSetSave(key);
        }
        delete CmdSetCache[key];
      }
    });
  }
}
CacheCleaner();

async function Autosaver() {
  while (true) {
    await Waiter(Settings.AutosaveInterval/2);

    // Global Users
    Object.keys(GlobUsrCache).forEach(function(key) {
      if (GlobUsrCache[key].LastUpdated+Settings.AutosaveInterval*1000 <= Date.now()) { // autosaving
        GlobUsrSave(key);
      }
    });

    // Server Settings
    Object.keys(ServSetCache).forEach(function(key) {
      if (ServSetCache[key].LastUpdated+Settings.AutosaveInterval*1000 <= Date.now()) { // autosaving
        ServSetSave(key);
      }
    });
  }

  // Command Settings
  Object.keys(CmdSetCache).forEach(function(key) {
    if (CmdSetCache[key].LastUpdated+Settings.AutosaveInterval*1000 <= Date.now()) { // autosaving
      CmdSetSave(key);
    }
  });
}
Autosaver();

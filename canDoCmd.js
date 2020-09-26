const Discord = require('discord.js');
const Settings = require("./Settings.js");
const mysqlCache = require("./mysql_cache.js");

exports.check = async function(msg) {
  let CmdName = (msg.content.split(/\s/g)[0]).substring(Settings.Prefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace

  if (msg.channel.type !== "text") {return true;} // if its not a text channel, then its not a nsfw command
  if (msg.member && msg.member.hasPermission("ADMINISTRATOR")) { // admin of server, can bypass channel restrictions
    return true;
  } else { // checking for permission
    let guildId = msg.channel.guild.id;
    let ServSet = await mysqlCache.GetServerSettings(guildId);
    if (!ServSet.ignored_channels[msg.channel.id]) { // channel not ignored
      let CmdSet = await mysqlCache.GetCommandSettings(guildId, CmdName);
      let UsrAllowed = false;
      let ChanAllowed = false;
      // user/role check
      if (CmdSet.FreeUse) { // blacklisted users
        let UserGud = false;
        let RoleBad = false;
        if (!CmdSet.UsagePerms["u"+msg.author.id]) {UserGud = true;}
        //console.log(msg.member);
        msg.member["_roles"].forEach(function(val,rkey) {
          if (CmdSet.UsagePerms["r"+rkey]) {RoleBad=true;}
        });

        if (UserGud && !RoleBad) {
          UsrAllowed = true;
        }
      } else { // whitelisted users
        let UserGud = false;
        let RoleGud = false;
        if (CmdSet.UsagePerms["u"+msg.author.id]) {UserGud = true;}
        msg.member["_roles"].forEach(function(val,rkey) {
          if (CmdSet.UsagePerms["r"+rkey]) {RoleGud=true;}
        });

        if (UserGud || RoleGud) {
          UsrAllowed = true;
        }
      }
      // channel check (YES IK I CAN MAKE IT AS ONE IF STATEMENT, BUT THEN IT WOULDNT BE AS READABLE)
      if (CmdSet.ChannelUse && !CmdSet.ChannelPerms[msg.channel.id]) { // blacklisted channel
        ChanAllowed = true;
      } else if (!CmdSet.ChannelUse && CmdSet.ChannelPerms[msg.channel.id]) { // whitelisted channel
        ChanAllowed = true;
      }

      if (UsrAllowed && ChanAllowed) {
        return true;
      } else {return false;}
    }
  }
}

const Discord = require('discord.js');
const Settings = require("../Settings.js");
const permCheck = require("../canDoCmd.js");
const mysqlCache = require("../mysql_cache.js");

exports.command = async function(msg,bot,botInfo,otherInfo) {
  let CmdName = (msg.content.split(/\s/g)[0]).substring(Settings.Prefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace

  if (!Settings.NSFWCmds[CmdName] || (msg.channel.type == "text" && msg.channel.nsfw)) { // either not NSFW or is in NSFW channel
    let ExecCmd = async function() {
      if (msg.member && msg.member.hasPermission("ADMINISTRATOR") && msg.channel.type == "text") { // is allowed to do the command
        let servSet = await mysqlCache.GetServerSettings(msg.channel.guild.id);
        let leftover = msg.content.substring(Settings.Prefix.length+CmdName.length+1);
        if (leftover.length == 0) { // ignore this channel
          delete servSet.ignored_channels[msg.channel.id];
        } else {
          msg.mentions.channels.forEach(function(val,key){
            delete servSet.ignored_channels[key];
          });
        }
        msg.channel.send("The bot will no longer ignore these channels!")
        .catch(console.log);
      }
    }

    ExecCmd();
  } else { // not in nsfw channel
    msg.reply("This command can only be used in NSFW channels! (only on servers)");
  }
}

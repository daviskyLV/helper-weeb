const Discord = require('discord.js');
const Settings = require("../Settings.js");
const permCheck = require("../canDoCmd.js");

exports.command = async function(msg,bot,botInfo) {
  let CmdName = (msg.content.split(/\s/g)[0]).substring(Settings.Prefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace

  if (!Settings.NSFWCmds[CmdName] || (msg.channel.type == "text" && msg.channel.nsfw)) { // either not NSFW or is in NSFW channel
    let ExecCmd = function() {
      let uptime = Math.floor(bot.uptime/1000) // in seconds
      let endTString = ""; // normalized uptime in readable format
      if (Math.floor(uptime/(24*60*60)) > 0) { // days
        endTString = Math.floor(uptime/(24*60*60))+"d ";
      }
      if (Math.floor((uptime%(24*60*60))/(3600)) > 0) { //hours
        endTString = endTString+Math.floor((uptime%(24*60*60))/(3600))+"h ";
      }
      if (Math.floor((uptime%(60*60))/(60)) > 0) { //minutes
        endTString = endTString+Math.floor((uptime%(60*60))/(60))+"m ";
      }
      endTString = endTString+(uptime%60)+"s";

      msg.channel.send("Bot's uptime: "+endTString)
        .catch(console.log);
    }

    let allow = await permCheck.check(msg);
    if (allow) {ExecCmd();}
  } else { // not in nsfw channel
    msg.reply("This command can only be used in NSFW channels! (only on servers)");
  }
}

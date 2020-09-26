const Discord = require('discord.js');
const Settings = require("../Settings.js");
const permCheck = require("../canDoCmd.js");

exports.command = async function(msg,bot,botInfo,otherInfo) {
  let CmdName = (msg.content.split(/\s/g)[0]).substring(Settings.Prefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace

  if (!Settings.NSFWCmds[CmdName] || (msg.channel.type == "text" && msg.channel.nsfw)) { // either not NSFW or is in NSFW channel
    let ExecCmd = function() {
      let randSong = otherInfo["KewlSongs"][Math.floor(Math.random()*otherInfo["KewlSongs"].length)]
      msg.channel.send("**A random song from my playlist:**\n https://www.youtube.com/watch?v="+randSong)
          .catch(console.log);
    }

    let allow = await permCheck.check(msg);
    if (allow) {ExecCmd();}
  } else { // not in nsfw channel
    msg.reply("This command can only be used in NSFW channels! (only on servers)");
  }
}

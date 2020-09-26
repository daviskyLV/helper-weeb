const Discord = require('discord.js');
const Settings = require('../Settings.js');
const permCheck = require("../canDoCmd.js");

exports.command = async function(msg,bot,botInfo) {
  let CmdName = (msg.content.split(/\s/g)[0]).substring(Settings.Prefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace

  if (!Settings.NSFWCmds[CmdName] || (msg.channel.type == "text" && msg.channel.nsfw)) { // either not NSFW or is in NSFW channel
    let ExecCmd = function() {
      let Rolled = 1;
      const DefaultMax = 100;
      const cmdLen = ("roll").length
      if (msg.content.length <= Settings.Prefix.length+cmdLen) { // just the command itself
        Rolled = Math.ceil(Math.random()*DefaultMax);
      } else { // some other text after command
        //var cmd = (msg.content.split(/\s/g)[0]).substring(Settings.Prefix.length,msg.content.length)
        let divided = msg.content.substring(Settings.Prefix.length+cmdLen).split(/\s/g);
        if (divided.length >= 2) { // has to be at least 2, cuz first one is always a whitespace
          var cur = 1; var done = false; var Parameter = "";
          do {
            if (divided[cur].length > 0) {
              Parameter = divided[cur]
              done = true;
              cur++;
            } else {cur++;}
            if (cur >= divided.length) {
              done = true;
            }
          }
          while (!done);

          if (Parameter.length > 0 && Number(Parameter)) {
            Rolled = Math.ceil(Math.random()*Number(Parameter));
          } else {Rolled = Math.ceil(Math.random()*DefaultMax);}
        } else { // default
          Rolled = Math.ceil(Math.random()*DefaultMax);
        }
      }

      msg.reply("you rolled "+Rolled+" points!")
        .catch(console.log);
    }

    let allow = await permCheck.check(msg);
    if (allow) {ExecCmd();}
  } else { // not in nsfw channel
    msg.reply("This command can only be used in NSFW channels! (only on servers)")
    .catch(console.log);
  }
}

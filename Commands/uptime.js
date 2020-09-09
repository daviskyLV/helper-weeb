const Discord = require('discord.js');
const MessageEmbed = Discord.MessageEmbed;

exports.command = function(msg,bot,botInfo) {
  var uptime = Math.floor(bot.uptime/1000) // in seconds
  var endTString = ""; // normalized uptime in readable format
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

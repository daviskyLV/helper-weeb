const Discord = require('discord.js');
const MessageEmbed = Discord.MessageEmbed;

exports.command = function(msg,bot,botInfo) {
  var curTime = new Date()
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

  const embed = new MessageEmbed()
    .setTitle("Bot's info & data")
    .setColor(0xd400ff)
    .setThumbnail(botInfo["AvatarURL"])
    .addField("Basic info", "**Join Date**: "+botInfo["JoinDate"]+"\n**Avatar URL**: "+botInfo["AvatarURL"]+"\n**Uptime**: "+endTString)
    .addField("Usage", "**Servers**: "+botInfo["ServerCount"]);
  msg.channel.send(embed)
    .catch(console.log);
}

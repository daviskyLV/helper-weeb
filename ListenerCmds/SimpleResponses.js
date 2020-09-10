const Discord = require('discord.js');

exports.listened = function(msg,bot,botInfo, otherInfo) {
  // simple message matching
  var msgMatch = {
    // "matching message": "response message"
    "owo": "What's this?"
  }
  if (msgMatch[msg.content.toLowerCase()]) {
    msg.channel.send("What's this?")
      .catch(console.log);
  }
}

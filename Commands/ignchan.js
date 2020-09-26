const Discord = require('discord.js');
//const Settings = require("../Settings.js");
const SameCmd = require("./ignore-channel.js");
//const permCheck = require("../canDoCmd.js");

// acronym for ignore-channel command
exports.command = async function(msg,bot,botInfo,otherInfo) {
  SameCmd.command(msg,bot,botInfo,otherInfo);
}

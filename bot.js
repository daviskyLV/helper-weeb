const Discord = require('discord.js');
const client = new Discord.Client();
const PWInfo = require("../BotSecrets/PWInfo_HelpfulWeeb.js");
const fs = require('fs');

const CmdsFolder = "./Commands/";

const Presences = ["with w!help","with your waifu","on the bed uwu"];
var PresenceTimer = 15; // how many seconds for the presence to change
var Prefix = "w!"; // for commands
var AdminPrefix = "wa!";
var AdminId = {"243089691107262466":1};

var BotInfo = {};

function Waiter(taim) { //taim is in seconds
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, taim*1000);
  });
}

commandList = {};
fs.readdir(CmdsFolder, (err, files) => {
  files.forEach(file => {
    if (file.substring(file.length-3,file.length)) {
      commandList[file.substring(0,file.length-3)] = require(CmdsFolder+file);
      console.log("added cmd: "+file.substring(0,file.length-3));
    }
  });
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  BotInfo["JoinDate"] = client.user.createdAt.toUTCString();
  BotInfo["AvatarURL"] = client.user.displayAvatarURL();
  BotInfo["ServerCount"] = client.guilds.cache.size;
  console.log(client.guilds.cache);

  async function PresenceLoop() {
    var cur = 0;
    while (true) {
      client.user.setPresence({ activity: { name: Presences[cur], type: 0 }, status: 'online' })
        .catch(console.log);
      await Waiter(PresenceTimer);
      if (cur >= Presences.length-1) {
        cur = 0;
      } else {cur++;}
      BotInfo["ServerCount"] = client.guilds.cache.size;
    }
  }
  PresenceLoop();
});

client.on('message', msg => {
  if (!msg.author.bot) {
    if (msg.content.substring(0,AdminPrefix.length) == AdminPrefix) { // admin command with prefix
      var cmd = (msg.content.split(/\s/g)[0]).substring(AdminPrefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace
    } else if (msg.content.substring(0,Prefix.length) == Prefix) { // basic command with prefix
      var cmd = (msg.content.split(/\s/g)[0]).substring(Prefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace
      if (commandList[cmd]) {
        commandList[cmd].command(msg,client,BotInfo);
      }
    }
  }
});

client.login(PWInfo.Token);

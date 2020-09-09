const Discord = require('discord.js');
const client = new Discord.Client();
const PWInfo = require("../BotSecrets/PWInfo_HelpfulWeeb.js");
const fs = require('fs');

const CmdsFolder = "./Commands/";

const Presences = ["with w!help","with your waifu","on the bed uwu"];
var PresenceTimer = 15; // how many seconds for the presence to change
var StatsUpdateT = 60; // how often stats about global usage and server's stats should be updated
var Prefix = "w!"; // for commands
var AdminPrefix = "wa!";
var AdminId = {"243089691107262466":1};
// Can use admin commands (to shutdown,restart,etc the bot)
// Must be discord user ID!

var BotInfo = {};

function Waiter(taim) { //taim is in seconds
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, taim*1000);
  });
}
function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

var Frozen = false;
var commandList = {};
fs.readdir(CmdsFolder, (err, files) => {
  files.forEach(file => {
    if (file.substring(file.length-3,file.length)) {
      commandList[file.substring(0,file.length-3)] = require(CmdsFolder+file);
      console.log("added cmd: "+file.substring(0,file.length-3));
    }
  });
});

var AdminCmds = {
  "exit": function(msg) {
    Frozen = true;
    console.log("Shutting down the bot! Action taken by: "+msg.author.id);
    console.log("BotInfo: ",BotInfo);
    msg.channel.send("Shutting down the bot! ;-;")
      .catch(console.log);

    setTimeout((function() {
      return process.exit();
    }), 2500);
  },
  "restart": function(msg) {
    Frozen = true;
    console.log("Restarting the bot! Action taken by: "+msg.author.id);
    console.log("BotInfo: ",BotInfo);
    msg.channel.send("Restarting the bot! Should take up to 15 seconds")
      .catch(console.log);

    fs.readdir(CmdsFolder, (err, files) => {
      files.forEach(file => {
        if (file.substring(file.length-3,file.length)) {
          commandList[file.substring(0,file.length-3)] = requireUncached(CmdsFolder+file);
          console.log("added cmd: "+file.substring(0,file.length-3));
        }
      });
    });

    setTimeout((function() {
      Frozen = false;
      return true;
    }), 15000);
  }
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  BotInfo["JoinDate"] = client.user.createdAt.toUTCString();
  BotInfo["AvatarURL"] = client.user.displayAvatarURL();
  BotInfo["ServerCount"] = client.guilds.cache.size;
  BotInfo["ServingAmount"] = 0;
  BotInfo["Emojis"] = {};
  client.guilds.cache.forEach(serv => {
    BotInfo["ServingAmount"] = BotInfo["ServingAmount"]+serv.members.cache.filter(member => member.bot === false).size;
    serv.emojis.cache.forEach(emoji => {
      BotInfo["Emojis"][emoji.id] = emoji;
      console.log(emoji);
    });
  });

  async function PresenceLoop() {
    var cur = 0;
    while (true) {
      client.user.setPresence({ activity: { name: Presences[cur], type: 0 }, status: 'online' })
        .catch(console.log);
      await Waiter(PresenceTimer);
      if (cur >= Presences.length-1) {
        cur = 0;
      } else {cur++;}
    }
  }
  PresenceLoop();
  async function StatsLoop() {
    while (true) {
      await Waiter(StatsUpdateT);
      BotInfo["ServerCount"] = client.guilds.cache.size;
      BotInfo["ServingAmount"] = 0;
      BotInfo["Emojis"] = {};
      client.guilds.cache.forEach(serv => {
        BotInfo["ServingAmount"] = BotInfo["ServingAmount"]+serv.members.cache.filter(member => member.bot === false).size;
        serv.emojis.cache.forEach(emoji => {
          BotInfo["Emojis"][emoji.id] = emoji;
          console.log(emoji);
        });
      });
    }
  }
  StatsLoop();
});

client.on('message', msg => {
  if (!msg.author.bot && !Frozen) {
    if (msg.content.substring(0,AdminPrefix.length) == AdminPrefix) { // admin command with prefix
      var cmd = (msg.content.split(/\s/g)[0]).substring(AdminPrefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace
      if (AdminCmds[cmd]) {
        AdminCmds[cmd](msg);
      }
    } else if (msg.content.substring(0,Prefix.length) == Prefix) { // basic command with prefix
      var cmd = (msg.content.split(/\s/g)[0]).substring(Prefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace
      if (commandList[cmd]) {
        commandList[cmd].command(msg,client,BotInfo);
      }
    }
  }
});

client.login(PWInfo.Token);

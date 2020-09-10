const Discord = require('discord.js');
const request = require("request");
const client = new Discord.Client();
const PWInfo = require("../BotSecrets/PWInfo_HelpfulWeeb.js");
const fs = require('fs');
const Settings = require("./Settings.js");

const CmdsFolder = "./Commands/";
const ListenerFolder = "./ListenerCmds/";

var BotInfo = {};
var KewlSongs = [];

// USEFUL FUNCTIONS
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


// COMMAND LOADING
var Frozen = false;
var commandList = {};
var listenerCmds = {};
fs.readdir(CmdsFolder, (err, files) => {
  files.forEach(file => {
    if (file.substring(file.length-3,file.length)) {
      commandList[file.substring(0,file.length-3)] = require(CmdsFolder+file);
      console.log("added cmd: "+file.substring(0,file.length-3));
    }
  });
});
fs.readdir(ListenerFolder, (err, files) => {
  files.forEach(file => {
    if (file.substring(file.length-3,file.length)) {
      listenerCmds[file.substring(0,file.length-3)] = require(ListenerFolder+file);
      console.log("added listener: "+file.substring(0,file.length-3));
    }
  });
});


// ADMIN COMMANDS
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
    fs.readdir(ListenerFolder, (err, files) => {
      files.forEach(file => {
        if (file.substring(file.length-3,file.length)) {
          listenerCmds[file.substring(0,file.length-3)] = requireUncached(ListenerFolder+file);
          console.log("added listener: "+file.substring(0,file.length-3));
        }
      });
    });

    setTimeout((function() {
      Frozen = false;
      msg.channel.send("Bot restarted!")
        .catch(console.log);
      return true;
    }), 15000);
  }
};


// STARTUP
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  BotInfo["JoinDate"] = client.user.createdAt.toUTCString();
  BotInfo["AvatarURL"] = client.user.displayAvatarURL();
  BotInfo["ServerCount"] = client.guilds.cache.size;
  BotInfo["ServingAmount"] = 0;
  client.guilds.cache.forEach(serv => {
    BotInfo["ServingAmount"] = BotInfo["ServingAmount"]+serv.members.cache.filter(member => member.user.bot === false).size;
  });

  async function PresenceLoop() {
    var cur = 0;
    while (true) {
      client.user.setPresence({ activity: { name: Settings.Presences[cur], type: 0 }, status: 'online' })
        .catch(console.log);
      await Waiter(Settings.PresenceTimer);
      if (cur >= Settings.Presences.length-1) {
        cur = 0;
      } else {cur++;}
    }
  }
  PresenceLoop();
  async function StatsLoop() {
    while (true) {
      await Waiter(Settings.StatsUpdateT);
      BotInfo["ServerCount"] = client.guilds.cache.size;
      BotInfo["ServingAmount"] = 0;
      client.guilds.cache.forEach(serv => {
        BotInfo["ServingAmount"] = BotInfo["ServingAmount"]+serv.members.cache.filter(member => member.user.bot === false).size;
      });
    }
  }
  StatsLoop();
});


// MESSAGE DETECTION
client.on('message', msg => {
  if (!msg.author.bot && !Frozen) {
    if (msg.content.substring(0,Settings.AdminPrefix.length) == Settings.AdminPrefix && Settings.AdminId[msg.author.id.toString()]) { // admin command with prefix
      var cmd = (msg.content.split(/\s/g)[0]).substring(Settings.AdminPrefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace
      if (AdminCmds[cmd]) {
        AdminCmds[cmd](msg);
      }
    } else if (msg.content.substring(0,Settings.Prefix.length) == Settings.Prefix) { // basic command with prefix
      var cmd = (msg.content.split(/\s/g)[0]).substring(Settings.Prefix.length,msg.content.length).toLowerCase(); // the given command trimmed down to first whitespace
      if (commandList[cmd]) {
        commandList[cmd].command(msg,client,BotInfo,{"KewlSongs":KewlSongs});
      }
    } else {
      Object.keys(listenerCmds).forEach(function(key) {
        listenerCmds[key].listened(msg, client, BotInfo, {"KewlSongs":KewlSongs});
      });
    }
  }
});

client.login(PWInfo.Token);


/// LOOPS ///
async function YoutubeAPILoop() {
    function YoutubeGET(url) {
        request(url, {json: true}, (err,res,body) => {
            if (err) {return console.log(err);}
            if (body.items) {
                body.items.forEach((val, index) => {
                    KewlSongs.push(val.snippet.resourceId.videoId);
                });
            }
            if (body.nextPageToken) {
                YoutubeGET("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId="+Settings.YTPlaylist+"&key="+PWInfo.YoutubeToken+"&pageToken="+body.nextPageToken);
            }
        });
    }

    while (true) {
      KewlSongs = [];
      YoutubeGET("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId="+Settings.YTPlaylist+"&key="+PWInfo.YoutubeToken);
      await Waiter(Settings.YoutubeAPIT);
    }
}
//YoutubeAPILoop();

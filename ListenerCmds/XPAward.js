const Discord = require('discord.js');
const Settings = require("../Settings.js");
const mysqlCache = require("../mysql_cache.js");

exports.listened = function(msg,bot,botInfo, otherInfo) {
  // awarding points+xp for chatting;
  mysqlCache.GetGlobalUser(msg.author.id)
  .then(function(resp) {
    if (resp.LastXP+Math.ceil(Math.random()*Settings.XPCooldown-.5)*1000  <= Date.now()) { // if its time to award XP
      let MaxXP = Math.ceil(Math.random()*(Settings.XPReward[1]-Settings.XPReward[0]) -.5); // max XP reward for the message sent
      resp.XP = resp.XP+ msg.content.length%MaxXP;
      resp.LastXP = Date.now();
      if (Math.random() <= Settings.MoneyChance) { // yay monies too!
        resp.Money = resp.Money+msg.content.length%MaxXP;
      }
    }
    resp.LastUsed = Date.now();
  });
}

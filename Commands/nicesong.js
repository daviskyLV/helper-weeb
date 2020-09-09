const Discord = require('discord.js');

exports.command = function(msg,bot,botInfo,otherInfo) {
    var randSong = otherInfo["KewlSongs"][Math.floor(Math.random()*otherInfo["KewlSongs"].length)]
    msg.channel.send("**A random song from my playlist:**\n https://www.youtube.com/watch?v="+randSong)
        .catch(console.log);
}
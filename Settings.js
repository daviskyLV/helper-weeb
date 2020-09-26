exports.Presences = ["with w!help","with your waifu","on the bed uwu"];
// ALL TIMINGS ARE IN SECONDS
exports.PresenceTimer = 15; // how many seconds for the presence to change
exports.StatsUpdateT = 600; // how often stats about global usage and server's stats should be updated
exports.YoutubeAPIT = 3600; // how often the youtube api stuff is refreshed
exports.Prefix = "w!"; // for commands
exports.AdminPrefix = "wa!"; // internal bot related commands (such as restart or exit)
exports.AdminId = {'243089691107262466':1};
// Can use admin commands (to shutdown,restart,etc the bot)
// Must be discord user ID!
exports.YTPlaylist = "PLE34DXLoeScDvm5HQxFo-LpHi9wk1-TmA";
exports.MYSQLCacheClean = 600; // after how long time to clean the entry from cache
exports.MYSQLCacheRefresh = 180; // after how long to refresh the cache to see are there any old entries
exports.AutosaveInterval = 100; // after how long time for the cache to autosave to database
exports.AutosaveIgnore = 3; // how much time passes before cache cleaner doesnt ignore autosave

exports.NSFWCmds = { // commands that can only be in NSFW channels
};

// Global money and XP awarding
exports.XPCooldown = 69;
exports.XPReward = [21,69]; // not in points, but rather msg.length%XPReward   XPReward = random num between min and max
exports.MoneyChance = .1; // chance tht when XP is awarded, money will be too

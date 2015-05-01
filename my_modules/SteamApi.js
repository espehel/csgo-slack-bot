var http = require("http");
var config = require("../config");

// get is a simple wrapper for request()
// which sets the http method to GET
var request = function(url, callback){
    http.get(url, function (response) {
    // data is streamed in chunks from the server
    // so we have to handle the "data" event
    var buffer = "",
        data;

    //buffers data
    response.on("data", function (chunk) {
        buffer += chunk;
        //console.log(buffer);
    });

    //returns data
    response.on("end", function (err) {
        data = JSON.parse(buffer);
        //console.log(data);
        callback(data);
    });
})
};


module.exports.getUserStats = function(userId, callback){
    var url = 'http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key='+config.steamApiKey+'&steamid='+userId;
    console.log(url);
    request(url, function (data) {
        //console.log(data);
        if(Object.keys(data).length == 0) {
            return;
        }
        callback(data['playerstats']['stats']);
    });
};
module.exports.getUserKD = function(userId, callback){
    var url = 'http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key='+config.steamApiKey+'&steamid='+userId;
    console.log(url);
    request(url, function (data) {
        //console.log(data);
        if(Object.keys(data).length == 0) {
            return;
        }
        var kills = 0;
        var deaths = 0;
        data['playerstats']['stats'].forEach(function(entry){
            if(entry.name == 'total_kills')
                kills = entry.value;
            if(entry.name == 'total_deaths')
                deaths = entry.value;
        })
        callback(kills/deaths);
    });
};
module.exports.getLastMatchStats = function(userId, callback){
    var url = 'http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key='+config.steamApiKey+'&steamid='+userId;
    console.log(url);
    request(url, function (data) {
        //console.log(data);
        if(Object.keys(data).length == 0) {
            return;
        }
        var won = 0;
        var ctw = 0;
        var tw = 0;
        var kills = 0;
        var deaths = 0;
        var mvps = 0;
        var damage = 0;
        data['playerstats']['stats'].forEach(function(entry){
            if(entry.name == 'last_match_wins')
                won = entry.value;
            if(entry.name == 'last_match_kills')
                kills = entry.value;
            if(entry.name == 'last_match_deaths')
                deaths = entry.value;
            if(entry.name == 'last_match_mvps')
                mvps = entry.value;
            if(entry.name == 'last_match_damage')
                damage = entry.value;
            if(entry.name == 'last_match_t_wins')
                tw = entry.value;
            if(entry.name == 'last_match_ct_wins')
                ctw = entry.value;
        })
        callback({won: won,lost: (tw+ctw)-won, kills: kills, deaths: deaths, mvps: mvps, damage: damage});
    });
};

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
//Tries to check if the match is ranked by looking at rounds and players
function validateMatch(matchDAO) {
    //check for players
    if(matchDAO.players != 10)
        return false;

    //check number of rounds
    var valid = function(matchDAO){
        if(matchDAO.won == 16)
            return true;

        var rounds = matchDAO.tw+matchDAO.ctw;
        if(rounds == 30)
            return true;
        if(rounds-matchDAO.won == 16)
            return true;
        return false;
    }(matchDAO);
    return valid;
}



module.exports.getIdByVanityurl = function(vanityurl, callback){
    var url = 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key='+config.steamApiKey+'&vanityurl='+vanityurl;
    console.log(url);
    request(url, function (data) {
        if(Object.keys(data).length == 0) {
            return;
        }
        if(data['response']['success'] == '1')
            callback(data['response']['steamid']);
        else
            callback(-1);
    });
};module.exports.getUserStats = function(userId, callback){
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
        /*var won = 0;
        var ctw = 0;
        var tw = 0;
        var kills = 0;
        var deaths = 0;
        var mvps = 0;
        var damage = 0;*/
        var matchDAO = {};
        data['playerstats']['stats'].forEach(function(entry){
            if(entry.name == 'last_match_wins')
                matchDAO.won = entry.value;
            if(entry.name == 'last_match_kills')
                matchDAO.kills = entry.value;
            if(entry.name == 'last_match_deaths')
                matchDAO.deaths = entry.value;
            if(entry.name == 'last_match_mvps')
                matchDAO.mvps = entry.value;
            if(entry.name == 'last_match_damage')
                matchDAO.damage = entry.value;
            if(entry.name == 'last_match_t_wins')
                matchDAO.tw = entry.value;
            if(entry.name == 'last_match_ct_wins')
                matchDAO.ctw = entry.value;
            if(entry.name == 'last_match_max_players')
                matchDAO.players = entry.value;
        })
        var validMatch = validateMatch(matchDAO);

        callback({won: matchDAO.won,lost: (matchDAO.tw+matchDAO.ctw)-matchDAO.won,
            kills: matchDAO.kills, deaths: matchDAO.deaths, mvps: matchDAO.mvps, damage: matchDAO.damage, validMatch: validMatch});
    });
};

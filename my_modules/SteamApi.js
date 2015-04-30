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
        callback(data['playerstats']['stats']);
    });
};
module.exports.getUserKD = function(userId, callback){
    var url = 'http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key='+config.steamApiKey+'&steamid='+userId;
    console.log(url);
    request(url, function (data) {
        //console.log(data);
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
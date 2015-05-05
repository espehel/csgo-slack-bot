var steamApi = require("./my_modules/SteamApi.js");
var userData = require("./my_modules/UserData.js");
var config = require('./config');
var SlackClient = require('slack-client');
var utils = require('./my_modules/Utils.js');


getArgs = function (command) {
    return command.substring(1).toLowerCase().split(" ");
}

executeCommand = function(command,user, callback){
    var args = getArgs(command);
    if(args.length == 0)
        return;
    console.log("COMMAND: ", args);
    if(args[0] == "kd"){
        var steamuser;
        if(args.length == 2)
            steamuser = args[1];
        else
            steamuser = user;

        userData.getUserIdByName(steamuser, function(result) {
            steamApi.getUserKD(result,function(data){
                callback(data);
            })
        })
    }
    else if(args[0] == "register"){
        if(args.length == 1)
            return;

        var id = args[1];
        if(isNaN(id))
            steamApi.getIdByVanityurl(id, function (data) {
                if(data != -1)
                    userData.putUserIdByName(user,data);
                else
                    callback("The ID is not an valid steamid64 or a registered vanity url");
            })
        else
            userData.putUserIdByName(user,args[1]);
    }
    else if(args[0] == "id"){
        userData.getUserIdByName(user, function (result) {
            callback(result);
        })
    }
    else if(args[0] == "lastmatch"){
        userData.getUserIdByName(user, function (result) {
            steamApi.getLastMatchStats(result, function (data) {
                callback("Last match stats for "+user+": \n" +
                    "Rounds Won/Lost: "+ data.won+"/"+data.lost+"\n" +
                    "Kills: "+data.kills+"\n" +
                    "Deaths: "+data.deaths+"\n" +
                    "Rounds mvp: "+data.mvps+"\n" +
                    "Damage per kill: "+utils.damagePerKill(data)+"\n" +
                    "Valid match: "+data.validMatch);
            })
        })
    }
    else if(args[0] == "submit"){
        if(args.length == 1)
            return;

        var element = args[1];
        if(element =="lastmatch"){
            userData.getUserIdByName(user, function (result) {
                steamApi.getLastMatchStats(result, function (data) {
                    if(data.validMatch)
                        userData.putMatchDataById(user,result,data);
                    else
                        console.log("WARN: invalid match");
                })
            })
        }
    }
    else if (args[0] == "highscore"){
        if(args.length == 1)
            return;

        var element = args[1];
        if(element =="lastmatch"){
            userData.getAllMatchData(function (result) {
                result.sort(function (a, b) {
                    var kd = utils.kd(b)-utils.kd(a);
                    if(kd != 0)
                        return kd;
                    var kills = b.kills- a.kills
                    if(kills != 0)
                        return kills;
                    return b.mvps- a.mvps;
                });
                var output = "Name: Kills, Deaths, Won/Lost, MVPs \n";
                result.forEach(function(entry){
                    output += entry.name +": " + entry.kills +", " +entry.deaths + ", " + entry.won +"/" + entry.lost + ", " + entry.mvps + "\n";
                });
                callback(output);

            })
        }


    }
    else if(args[0] == "help"){
        callback("Commands supported by csgoBot: \n" +
            "!kd:\tRetreives your kill/death ratio.\n" +
            "!id:\tRetreives the id currently linked to your nick.\n" +
            "!lastmatch:\tRetreives the stats for the last match you played.\n" +
            "!register \<steamid\>:\tLinks the steamid or a vanity url to your nick.\n" +
            "!submit lastmatch:\tSubmits your last match to the highscore list.\n" +
            "!highscore lastmatch:\tDisplays the top ten users with their last match submitted.\n" +
            "");
    }
};

var bot = new SlackClient(config.slackToken,true,true);
console.log(config.slackToken);

bot.on('open', function(){
   console.log('Connected to ' + bot.team.name);
});

bot.on('message', function (message) {
    var channel = bot.getChannelGroupOrDMByID(message.channel);
    if(config.slackChannels.indexOf(channel.name) == -1)
        return;
    var user = bot.getUserByID(message.user);

    if (message.type === 'message') {

        if(typeof message.text === 'undefined' || message.text.length == 0)
            return;

        if(message.text.charAt(0) == '!')
            executeCommand(message.text,user.name, function (data) {
                console.log("SENDING: " + data);
                channel.send(data.toString());
            })
    }
});

bot.on('error',function(error){
    console.log("ERROR: ",error);
})







bot.login();
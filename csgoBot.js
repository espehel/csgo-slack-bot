var steamApi = require("./my_modules/SteamApi.js");
var userData = require("./my_modules/UserData.js");
var config = require("./config");
var SlackClient = require('slack-client');


getArgs = function (command) {
    return command.substring(1).toLowerCase().split(" ");
}

executeCommand = function(command,user, callback){
    var args = getArgs(command);
    if(args.length == 0)
        return;
    console.log("COMMAND: ", args);
    if(args[0] == "kd"){
        userData.getUserIdByName(user, function(result) {
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
                    "Damage per kill: "+data.damage/data.kills);
            })
        })
    }
    else if(args[0] == "help"){
        callback("Commands supported by csgoBot: \n" +
            "!kd:\tRetreives your kill/death ratio.\n" +
            "!id:\tRetreives the id currently linked to your nick.\n" +
            "!lastmatch:\tRetreives the stats for the last match you played.\n" +
            "!register \<steamid\>:\tLinks the steamid or a vanity url to your nick.\n" +
            "");
    }
};

/*userData.getUserIdByName('asd', function(result){
    console.log(result);
});*/
/*executeCommand('!kd','espen', function (data) {
    console.log(data);
});*/
/*executeCommand('!register 123','espen', function (data) {
    console.log(data);
});*/
/*executeCommand('!kd','espen', function (data) {
    console.log(data);
});*/

/*executeCommand('!register 76561197993060799','espen', function (data) {
    console.log(data);
});*/
/*executeCommand('!kd','espen', function (data) {
    console.log(data);
});*/



var bot = new SlackClient(config.slackToken,true,true);
console.log(config.slackToken);

bot.on('open', function(){
   console.log('Connected to ' + bot.team.name);
});

bot.on('message', function (message) {
    var channel = bot.getChannelGroupOrDMByID(message.channel);
    var user = bot.getUserByID(message.user);

    if (message.type === 'message') {

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
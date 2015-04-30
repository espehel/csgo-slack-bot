var steamApi = require("./my_modules/SteamApi.js");
var userData = require("./my_modules/UserData.js");
var config = require("./config");
var irc = require("irc");
var SlackClient = require('slack-client');


/*steamApi.getUserStats('76561197993060799', function(data){
    console.log(data);
});*/
/*
var bot = new irc.Client(config.server, config.botname, {
    channels: config.channels,
    port: config.port,
    password: config.pass
});
bot.addListener('message', function(from, to, message){
    console.log(from + ' => ' + to + ': ' + message);
});
bot.addListener('error', function(message) {
    console.log('error: ', message);
});
bot.addListener('raw', function(message) {
    console.log(message.server +'('+message.rawCommand+'): ',message.args);
});
*/

getArgs = function (command) {
    return command.substring(1).toLowerCase().split(" ");
}

executeCommand = function(command,user, callback){
    var args = getArgs(command);
    if(args.length == 0)
        return;
    console.log("COMMAND: ", args);
    if(args[0] == "kd"){
        steamApi.getUserKD(userData.getUserIdByName(user),function(data){
            callback(data);
        })
    }
    else if(args[0] == "register"){

    }
};


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


        //console.log(channel.name + ':' + user.name + ':' + message.text);

    }
});

bot.on('error',function(error){
    console.log("ERROR: ",error);
})







bot.login();
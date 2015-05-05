var mongo = require('mongoskin');
var config = require("../config");
var db = mongo.db(config.databasePath, {native_parser:true});


module.exports.getUserIdByName = function (name, callback) {
    db.collection('steamid').find({name:name}).toArray(function(err, result) {
        if (err) throw err;
        if(result.length==0) {
            callback(-1);
            return;
        }
        callback(result[0]['steamid']);
    });
};
module.exports.putUserIdByName = function(userName,userId){
    module.exports.getUserIdByName(userName, function(result){
        if(result == -1) {
            db.collection('steamid').insert({name: userName, steamid: userId}, function (err, result) {
                if (err) throw err;
            });
        }
        db.collection('steamid').update({name:userName}, {'$set': {steamid :userId}}, function(err) {
        if (err) throw err;
        });
    })
};
module.exports.getAllMatchData = function (callback) {
    db.collection('matches').find().toArray(function(err, result) {
        if (err) throw err;

        callback(result);
    });
};
module.exports.getMatchDataByName = function (name, callback) {
    db.collection('matches').find({name:name}).toArray(function(err, result) {
        if(result.length==0) {
            callback(-1);
            return;
        }
        callback(result[0]);
    });
};
module.exports.putMatchDataById = function(userName, userId, matchdata){
    matchdata.name = userName;
    matchdata.steamid=userId;
    module.exports.getMatchDataByName(matchdata.name, function(result){
        console.log(result);
        if(result == -1) {
            db.collection('matches').insert(matchdata, function (err, result) {
                if (err) throw err;
            });
        }
        db.collection('matches').update({name:matchdata.name}, {'$set': {won: matchdata.won,lost: matchdata.lost, kills: matchdata.kills,
            deaths: matchdata.deaths, mvps: matchdata.mvps, damage: matchdata.damage, validMatch: matchdata.validMatch, steamid: matchdata.steamid}}, function(err) {
        if (err) throw err;
        });
    })
};




//handles the edgecases of the kd when kills or deaths is zero
module.exports.kd = function(matchdata){
    if(matchdata.deaths == 0)
        return matchdata.kills;
    if(matchdata.kills == 0)
        return 0;
    return matchdata.kills/matchdata.deaths;
}
//handles the edgecases of the damage per kill when kills is zero
module.exports.damagePerKill = function(matchdata){
    if(matchdata.kills == 0)
        return 0;
    return matchdata.damage/matchdata.kills;
}

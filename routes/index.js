exports.ajaxGetPlayers = function (req, res, appData) {
    var team = "nie udało się";
    if (req.params[0]) {
        team = req.params[0];
    }
    // appData.getTeamData(team);
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf8'
    });
    res.end(JSON.stringify(appData.getTeamData(team)));
};

exports.ajaxGetTeams = function (req, res, appData) {
    // appData.getTeamData(team);
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf8'
    });
    res.end(JSON.stringify({'home': appData.getTeamData('home'), 'away': appData.getTeamData('away')}));
};

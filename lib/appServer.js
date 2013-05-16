//Socket.io
var socketio = require('socket.io');
// var socket = io.listen(server);


exports.listen = function(server, appData) {
    var io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (client) {
    	//wyślij obecny stan danych
		client.emit('teamsData', { home: appData.getTeamData('home'), away: appData.getTeamData('away') });
		    var facts = appData.getAllFacts();

		for(var i in facts){
			if(facts[i].id !== -1){
				facts[i].playerName = appData.getPlayerName(facts[i].playerTeam, facts[i].playerId);
			    facts[i].playerNum =  appData.getPlayerNum(facts[i].playerTeam, facts[i].playerId);
			    if(facts[i].ftype === 'goal'){
					client.emit('newGoal', facts[i]);
				} else if(facts[i].ftype === 'yellow'){
					client.emit('newYellow', facts[i]);
				} else if(facts[i].ftype === 'red'){
					client.emit('newRed', facts[i]);
				}
			}
		}
		//nasłuch
	    client.on('minusCountUp', function (data) {
			var newCount = data;
			newCount.count = appData.minusCountUp(data.team, data.id);
				
	        client.broadcast.emit('newMinusCount', newCount);
			client.emit('newMinusCount', newCount);
	    });
		
		client.on('plusCountUp', function (data) {
			var newCount = data;
			newCount.count = appData.plusCountUp(data.team, data.id);
				
	        client.broadcast.emit('newPlusCount', newCount);
			client.emit('newPlusCount', newCount);
	    });

	    client.on('newData', function (data) {
			var newData = data;
			console.log(data);
			if(data.type === 'teamName'){
				if(appData.getTeamName(data.team,data.value) !== data.value){
					appData.setTeamName(data.team,data.value);
					client.broadcast.emit('setNewData', data);
				}
			}
			if(data.type === 'playerNum'){
				if(appData.getPlayerNum(data.team,data.id,data.value) !== data.value){
					appData.setPlayerNum(data.team,data.id,data.value);
					client.broadcast.emit('setNewData', data);
				}
			}
			if(data.type === 'playerName'){
				if(appData.getPlayerName(data.team,data.id,data.value) !== data.value){
					appData.setPlayerName(data.team,data.id,data.value);
					client.broadcast.emit('setNewData', data);
				}
			}
	    });

	    client.on('newGoal', function (data) {
	    	data.playerName = appData.getPlayerName(data.playerTeam, data.playerId);
	    	data.playerNum =  appData.getPlayerNum(data.playerTeam, data.playerId);
	    	data.id = appData.addFact(data,'goal');
	    	console.log(data);
	    	client.broadcast.emit('newGoal', data);
	    	client.emit('newGoal', data);
	    	console.log(appData.getScore);
	    	client.broadcast.emit('newScore', appData.getScore());
	    	client.emit('newScore', appData.getScore());
	    });

	    client.on('newYellow', function (data) {
	    	data.playerName = appData.getPlayerName(data.playerTeam, data.playerId);
	    	data.playerNum =  appData.getPlayerNum(data.playerTeam, data.playerId);
	    	data.id = appData.addFact(data,'yellow');
	    	console.log(data);
	    	client.broadcast.emit('newYellow', data);
	    	client.emit('newYellow', data);
	    });

	    client.on('newRed', function (data) {
	    	data.playerName = appData.getPlayerName(data.playerTeam, data.playerId);
	    	data.playerNum =  appData.getPlayerNum(data.playerTeam, data.playerId);
	    	data.id = appData.addFact(data,'red');
	    	console.log(data);
	    	client.broadcast.emit('newRed', data);
	    	client.emit('newRed', data);
	    });

	    client.on('rmFact', function (data) {
	    	//console.log(data);
	    	appData.rmFact(data);
	    	client.broadcast.emit('rmFact',data);
	    	client.emit('rmFact', data);

	    	client.broadcast.emit('newScore', appData.getScore());
	    	client.emit('newScore', appData.getScore());
	    });
    });
};
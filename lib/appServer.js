//Socket.io
var socketio = require('socket.io');

//funkcja do czyszczenia danych w bazie danych
var clearData = function (socket, appData, timer, callback){
	var mongo = require('mongodb');
	var db = new mongo.Db('test', new mongo.Server('localhost', 27017), {safe: true});
	db.open(function (err) {
		if(err){ console.log(err); } 
		else{
			console.log('MongoDB Connected!');
			var homeTeamData = {}, awayTeamData = {}, factsData = {};
			db.collection('livescore', function (err, coll) {
				if(err) { console.log(err); }
				else{
					coll.remove(function(err) { 
						if(err) { console.log(err); } 
						else{
							console.log('Clear time data in DB');
							db.close();
							//czyszczenie flag danych
							appData.clearIsData();
							timer.clearIsData();
							//wywołanie callBack-u
							callback(socket);
						}
					});
				}
			});
		}
	});
};

//interwał czasowy
var timeInterval;

//hasło administratora
var adminPasswd = 'admin123';

exports.listen = function(server, appData, timer) {
	var io = socketio.listen(server);

	io.sockets.on('connection', function (client) {

		//wyślij obecny stan danych P1
		appData.getAllData(client, function (client){
			client.emit('teamsData', { home: appData.getTeamData('home'), away: appData.getTeamData('away') });
			client.emit('newScore', appData.getScore());

			var facts = appData.getAllFacts();
			for(var i in facts){
				if(facts[i] && facts[i].id !== -1){
					facts[i].playerName = appData.getPlayerName(facts[i].playerTeam, facts[i].playerId);
					facts[i].playerNum =  appData.getPlayerNum(facts[i].playerTeam, facts[i].playerId);
					if(facts[i].ftype === 'goal'){
						client.emit('newGoal', facts[i]);
					} else if(facts[i].ftype === 'yellow'){
						client.emit('newYellow', {'id':facts[i].id, 'playerId': facts[i].playerId,
							'playerTeam': facts[i].playerTeam, 'playerNum': facts[i].playerNum,
							'playerName': facts[i].playerName, 'time': facts[i].time,
							'sendOut': appData.getPlayer(facts[i].playerTeam, facts[i].playerId)});
					} else if(facts[i].ftype === 'red'){
						client.emit('newRed', {'id':facts[i].id, 'playerId': facts[i].playerId,
							'playerTeam': facts[i].playerTeam, 'playerNum': facts[i].playerNum,
							'playerName': facts[i].playerName, 'time': facts[i].time,
							'sendOut': appData.getPlayer(facts[i].playerTeam, facts[i].playerId)});
					}
				}
			}
		});

		//Wyślij obecny stan danych P2
		timer.getAllData(client, function (client){
			client.emit('setTime', timer.getCurrentTime());
			client.emit('setHalf', timer.getCurrentHalf());
		});

		//nasłuch
		client.on('minusCountUp', function (data) {
			if(timer.getCurrentHalfNum() > 0 && !timer.getIsEnd()){
				var newCount = data;
				newCount.count = appData.minusCountUp(data.team, data.id);
					
				client.broadcast.emit('newMinusCount', newCount);
				client.emit('newMinusCount', newCount);
			}
		});
		
		client.on('plusCountUp', function (data) {
			if(timer.getCurrentHalfNum() > 0 && !timer.getIsEnd()){
				var newCount = data;
				newCount.count = appData.plusCountUp(data.team, data.id);
					
				client.broadcast.emit('newPlusCount', newCount);
				client.emit('newPlusCount', newCount);
			}
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
			data.sendOut = appData.getPlayer(data.playerTeam, data.playerId).sendOut;
			console.log(data);
			client.broadcast.emit('newYellow', data);
			client.emit('newYellow', data);
		});

		client.on('newRed', function (data) {
			data.playerName = appData.getPlayerName(data.playerTeam, data.playerId);
			data.playerNum =  appData.getPlayerNum(data.playerTeam, data.playerId);
			data.id = appData.addFact(data,'red');
			data.sendOut = appData.getPlayer(data.playerTeam, data.playerId).sendOut;
			console.log(data);
			client.broadcast.emit('newRed', data);
			client.emit('newRed', data);
		});

		client.on('rmFact', function (data) {
			//console.log(data);
			var removedFact = appData.rmFact(data);
			client.broadcast.emit('rmFact',{'id':data, 
				'playerId': removedFact.playerId, 'playerTeam': removedFact.playerTeam, 
				'sendOut': appData.getPlayer(removedFact.playerTeam,removedFact.playerId).sendOut});
			client.emit('rmFact', {'id':data, 
				'playerId': removedFact.playerId, 'playerTeam': removedFact.playerTeam, 
				'sendOut': appData.getPlayer(removedFact.playerTeam,removedFact.playerId).sendOut});

			client.broadcast.emit('newScore', appData.getScore());
			client.emit('newScore', appData.getScore());
		});

		client.on('startHalf', function(){
			var permission = timer.startHalf();
			if(permission){
				timeInterval = setInterval(function(){ 
					timer.incTime();  
					client.emit('setTime', timer.getCurrentTime());
					client.broadcast.emit('setTime', timer.getCurrentTime());
				}, 60000);

				client.emit('setHalf', timer.getCurrentHalf());
				client.emit('setTime', timer.getCurrentTime());
				client.broadcast.emit('setHalf', timer.getCurrentHalf());
				client.broadcast.emit('setTime', timer.getCurrentTime());
			}
		});

		client.on('endHalf', function(){
			var permission = timer.endHalf();
			if(permission){
				clearInterval(timeInterval);
				client.emit('setHalf', timer.getCurrentHalf());
				client.emit('setTime', timer.getCurrentTime());
				client.broadcast.emit('setHalf', timer.getCurrentHalf());
				client.broadcast.emit('setTime', timer.getCurrentTime());
			}
		});

		client.on('stopHalf', function() {
			var permission = timer.stopHalf();
			if(permission){
				clearInterval(timeInterval);
				client.emit('setHalf', timer.getCurrentHalf());
				client.broadcast.emit('setHalf', timer.getCurrentHalf());
			}
		});
		
		client.on('endGame', function() {
			var permission = timer.endGame();
			if(permission){
				clearInterval(timeInterval);
				client.emit('setHalf', timer.getCurrentHalf());
				client.broadcast.emit('setHalf', timer.getCurrentHalf());
			}
		});

		client.on('makeSub', function(data){
			// console.log(data);
			if(data.time === '0\''){
				data.time = 0;
			}
			appData.makeSub(data);
			client.emit('makeSub', data);
			client.broadcast.emit('makeSub', data);
		});

		client.on('newGame', function(){
			clearData(client, appData, timer, function(client){
				//Wyślij nowy stan danych P2
				appData.getAllData(client, function (client){
					client.emit('teamsData', { home: appData.getTeamData('home'), away: appData.getTeamData('away') });
					client.broadcast.emit('teamsData', { home: appData.getTeamData('home'), away: appData.getTeamData('away') });
					client.emit('newScore', appData.getScore());
					client.broadcast.emit('newScore', appData.getScore());

					var facts = appData.getAllFacts();
					for(var i in facts){
						if(facts[i] && facts[i].id !== -1){
							facts[i].playerName = appData.getPlayerName(facts[i].playerTeam, facts[i].playerId);
							facts[i].playerNum =  appData.getPlayerNum(facts[i].playerTeam, facts[i].playerId);
							if(facts[i].ftype === 'goal'){
								client.emit('newGoal', facts[i]);
								client.broadcast.emit('newGoal', facts[i]);
							} else if(facts[i].ftype === 'yellow'){
								client.emit('newYellow', facts[i]);
								client.broadcast.emit('newYellow', facts[i]);
							} else if(facts[i].ftype === 'red'){
								client.emit('newRed', facts[i]);
								client.broadcast.emit('newRed', facts[i]);
							}
						}
					}
				});

				//Wyślij nowy stan danych P2
				timer.getAllData(client, function (client){
					client.emit('setTime', timer.getCurrentTime());
					client.broadcast.emit('setTime', timer.getCurrentTime());
					client.emit('setHalf', timer.getCurrentHalf());
					client.broadcast.emit('setHalf', timer.getCurrentHalf());
				});
			});
		});

		client.on('checkPassword', function (data){
			if(data.passwd === adminPasswd){
				client.emit('checkPassword', true);
			}else{
				client.emit('checkPassword', false);
			}
		});

		client.on('timeUp', function(){
			timer.incTime();
			client.emit('setTime', timer.getCurrentTime());
			client.broadcast.emit('setTime', timer.getCurrentTime());
		});

		client.on('timeDown', function(){
			timer.decTime();
			client.emit('setTime', timer.getCurrentTime());
			client.broadcast.emit('setTime', timer.getCurrentTime());
		});
	});
};
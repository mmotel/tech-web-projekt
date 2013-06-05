module.exports = function(){

	var mongo = require('mongodb');

	var isData = false;
	var homeTeam = {};
	var homeTeamName = {};
	var homeTeamGoals = {};
	var awayTeam = {};
	var awayTeamName = {};
	var awayTeamGoals = {};
	var facts = {};
	var factId = {};

	var homeChanges = 0;
	var awayChanges = 0;
	
	var Player = function(Id, Number, Name, Minus, Plus,SendOut, TakenDown, Red, Yellow, Goals){
		this.id = Id;
		this.number = Number;
		this.name = Name;
		this.plusCount = Minus;
		this.minusCount = Plus;
		this.sendOut = SendOut;
		this.takenDown = TakenDown;
		this.takenDownTime = 0;
		this.takenUpTime = 0;
		this.red = Red;
		this.yellow = Yellow;
		this.goals = Goals;
		return this;
	};

	var Fact = function(Id, fType, PlayerId, PlayerTeam, Team, Time){
		this.id = Id;
		this.ftype = fType;
		this.playerId = PlayerId;
		this.playerTeam = PlayerTeam;
		this.team = Team;
		this.time = Time;
		return this;
	};

	var nextFactId = function(){ 
		factId++;
		return factId; 
	};

	var flushData = function(query, setter){
		if(query.dtype === 'home') { homeChanges = 0; }
		else if(query.dtype === 'away'){ awayChanges = 0; }

		var dbf = new mongo.Db('test', new mongo.Server('localhost', 27017), {safe: true});
		dbf.open(function (err) {
			if(err){ console.log(err); } 
			else{
				console.log('MongoDB Connected!');
				var homeTeamData = {}, awayTeamData = {}, factsData = {};
				dbf.collection('livescore', function (err, coll) {
					if(err) { console.log(err); }
					else{
						coll.update(query, {$set: setter}, function (err){
							if(err){
								console.log(err);
							}
						});
						console.log('Flush data to DB');
					}
				});
			}
		});
	};


	var findPlayerById = function(playerTeam, playerId){
		var i;
		console.log('playerTeam: ' + playerTeam);
		console.log('playerId: ' + playerId);

		if(playerTeam === 'home'){
			if(homeTeam[playerId].id === (playerTeam+playerId)){
				return playerId;
			}
			else{
				for(i=1; i < homeTeam.length; i++){
					if(homeTeam[i].id === (playerTeam+playerId)){
						return i;
					}
				}
			}
		}else{
			if(awayTeam[playerId].id === (playerTeam+playerId)){
				return playerId;
			}
			else{
				for(i=1; i < awayTeam.length; i++){
					if(awayTeam[i].id === (playerTeam+playerId)){
						return i;
					}
				}
			}
		}
	};

	return {
		clearIsData: function(){
			isData = false;
		},
		getAllData: function (socket, callback){
			if(!isData){
				var db = new mongo.Db('test', new mongo.Server('localhost', 27017), {safe: true});
				db.open(function (err) {
					if(err){ console.log(err); } 
					else{
						console.log('MongoDB Connected!');
						var homeTeamData = {}, awayTeamData = {}, factsData = {};
						db.collection('livescore', function (err, coll) {
							if(err) { console.log(err); }
							else{
								coll.find().toArray(function (err, items) {
									if(err) { console.log(err); }
									else {
										if(items.length === 0 || items.length === 1){
											var data = require('./makeData')('match');
											homeTeamData = data.home;
											awayTeamData = data.away;
											factsData = data.facts; //console.log(factsData);
											coll.insert(homeTeamData, function(err){ if(err) { console.log(err); } });
											coll.insert(awayTeamData, function(err){ if(err) { console.log(err); } });
											coll.insert(factsData, function(err){ if(err) { console.log(err); } });
											console.log('Set match data in DB');
										}
										else {
											for(var i =0; i < items.length; i++){
												if(items[i].dtype === 'home'){
													homeTeamData = items[i];
												}else if(items[i].dtype === 'away'){
													awayTeamData = items[i];
												}else if(items[i].dtype === 'facts'){
													factsData = items[i];
													console.log(factsData);
												}
											}
											console.log('Get match data from DB');
										}
										db.close();
										//uzupełnienie referencji pól z danymi
										homeTeam = homeTeamData.team;
										homeTeamName = homeTeamData.name;
										homeTeamGoals = homeTeamData.goals;
										awayTeam = awayTeamData.team;
										awayTeamName = awayTeamData.name;
										awayTeamGoals = awayTeamData.goals;
										facts = factsData.facts;
										factId = factsData.factId;
										//ustawienie flagi ściagnięcia danych
										isData = true;
										//wywołanie callBack-u
										callback(socket);
									}
								});
							}
						});
					}
				});
			}
			else {
				//wywołanie callBack-u
				callback(socket);
				console.log('Match data from memory');
			}
		},
		makeSub: function(data){
			var p;
			var p1Id = findPlayerById(data.team, data.p1);
			var p2Id = findPlayerById(data.team, data.p2);
			console.log('p1Id: ' + p1Id + ' p2Id: ' + p2Id);
			if(data.team === 'home'){
				p = new Player(homeTeam[p1Id].id ,homeTeam[p1Id].number ,homeTeam[p1Id].name,
						homeTeam[p1Id].plusCount ,homeTeam[p1Id].minusCount ,homeTeam[p1Id].sendOut,
						true ,homeTeam[p1Id].red ,homeTeam[p1Id].yellow, 
						homeTeam[p1Id].goals);

				if(data.time === 0){
					p.takenDown = false;
					p.takenDownTime = 0;
					homeTeam[p2Id].takenUpTime = 0;
				}else{
					p.takenDownTime = data.time;
					homeTeam[p2Id].takenUpTime = data.time;
				}
				// homeTeam[data.p2].id = homeTeam[data.p1].id;
				homeTeam[p1Id] = homeTeam[p2Id];
				homeTeam[p2Id] = p;
				flushData({'dtype': 'home'}, {'team': homeTeam});
			} else {
				p = new Player(awayTeam[p1Id].id ,awayTeam[p1Id].number ,awayTeam[p1Id].name,
						awayTeam[p1Id].plusCount ,awayTeam[p1Id].minusCount ,awayTeam[p1Id].sendOut,
						true ,awayTeam[p1Id].red ,awayTeam[p1Id].yellow,
						awayTeam[p1Id].goals);

				if(data.time === 0){
					p.takenDown = false;
					p.takenDownTime = 0;
					awayTeam[p2Id].takenUpTime = 0;
				}else{
					p.takenDownTime = data.time;
					awayTeam[p2Id].takenUpTime = data.time;
				}
				// awayTeam[data.p2].id = awayTeam[data.p1].id;
				awayTeam[p1Id] = awayTeam[p2Id];
				awayTeam[p2Id] = p;
				flushData({'dtype': 'away'}, {'team': awayTeam});
			}
		},
		getScore: function(){
			var scores = {};
			scores.home = homeTeamGoals;
			scores.away = awayTeamGoals;
			// console.log(scores);
			return scores;
		},
		addFact: function(data, type){
			var newId = nextFactId();
			var factToAdd = new Fact(newId, type, data.playerId, data.playerTeam, data.team, data.time);
			facts[newId] = factToAdd;
			//console.log(factToAdd);
			if(type === 'goal'){
				if(data.playerTeam === 'home' && data.team === 'home'){
					homeTeam[findPlayerById(data.playerTeam, data.playerId)].goals += 1;
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else if(data.team === 'away') {
					awayTeam[findPlayerById(data.playerTeam, data.playerId)].goals += 1;
					flushData({'dtype': 'away'}, {'team': awayTeam});
				}
				if(data.team === 'home'){
					homeTeamGoals += 1;
					flushData({'dtype': 'home'}, {'goals': homeTeamGoals});
				} else {
					awayTeamGoals += 1;
					flushData({'dtype': 'away'}, {'goals': awayTeamGoals});
				}

			} else
			if(type === 'yellow'){
				if(data.playerTeam === 'home'){
					homeTeam[findPlayerById(data.playerTeam, data.playerId)].yellow += 1;
					if(homeTeam[findPlayerById(data.playerTeam, data.playerId)].yellow === 2){
						homeTeam[findPlayerById(data.playerTeam, data.playerId)].sendOut = true;
					}
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else {
					awayTeam[findPlayerById(data.playerTeam, data.playerId)].yellow += 1;
					if(awayTeam[findPlayerById(data.playerTeam, data.playerId)].yellow === 2){
						awayTeam[findPlayerById(data.playerTeam, data.playerId)].sendOut = true;
					}
					flushData({'dtype': 'away'}, {'team': awayTeam});
				}
			} else
			if(type === 'red'){
				if(data.playerTeam === 'home'){
					homeTeam[findPlayerById(data.playerTeam, data.playerId)].red += 1;
					homeTeam[findPlayerById(data.playerTeam, data.playerId)].sendOut = true;
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else {
					awayTeam[findPlayerById(data.playerTeam, data.playerId)].red += 1;
					awayTeam[findPlayerById(data.playerTeam, data.playerId)].sendOut = true;
					flushData({'dtype': 'away'}, {'team': awayTeam});
				}
			}
			flushData({'dtype': 'facts'}, {'facts': facts});
			return newId;
		},
		rmFact: function(fid){
			//console.log(facts[fid]);	
			var f = facts[fid];
			if(f.ftype === 'goal'){
				if(f.playerTeam === 'home' && f.team === 'home'){
					homeTeam[findPlayerById(f.playerTeam, f.playerId)].goals -= 1;
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else if(f.team === 'away'){
					awayTeam[findPlayerById(f.playerTeam, f.playerId)].goals -= 1;
					flushData({'dtype': 'away'}, {'team': awayTeam});
				}

				if(f.team === 'home'){
					homeTeamGoals -= 1;
					flushData({'dtype': 'home'}, {'goals': homeTeamGoals});
				} else {
					awayTeamGoals -= 1;
					flushData({'dtype': 'away'}, {'goals': awayTeamGoals});
				}

			} else
			if(f.ftype === 'yellow'){
				if(f.playerTeam === 'home'){
					homeTeam[findPlayerById(f.playerTeam, f.playerId)].yellow -= 1;
					if(homeTeam[findPlayerById(f.playerTeam, f.playerId)].yellow === 1){
						homeTeam[findPlayerById(f.playerTeam, f.playerId)].sendOut = false;
					}
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else {
					awayTeam[findPlayerById(f.playerTeam, f.playerId)].yellow -= 1;
					if(awayTeam[findPlayerById(f.playerTeam, f.playerId)].yellow === 1){
						awayTeam[findPlayerById(f.playerTeam, f.playerId)].sendOut = false;
						flushData({'dtype': 'away'}, {'team': awayTeam});
					}
				}
			} else
			if(f.ftype === 'red'){
				if(f.playerTeam === 'home'){
					homeTeam[findPlayerById(f.playerTeam, f.playerId)].red -= 1;
					homeTeam[findPlayerById(f.playerTeam, f.playerId)].sendOut = false;
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else {
					awayTeam[findPlayerById(f.playerTeam, f.playerId)].red -= 1;
					awayTeam[findPlayerById(f.playerTeam, f.playerId)].sendOut = false;
					flushData({'dtype': 'away'}, {'team': awayTeam});
				}
			}
			facts[fid].id = -1;
			flushData({'dtype': 'facts'}, {'facts': facts});
			return facts[fid];
		},
		getAllFacts: function() { return facts; },
		getTeamData: function(team){
			if(team === 'home'){
				return { team: homeTeam, name: homeTeamName };
			}
			else if(team === 'away'){
				return { team: awayTeam, name: awayTeamName };
			}
			else{
				return null;
			}
		},
		minusCountUp: function(team, id){
			var count;
			if(team === 'home'){
				count = ++(homeTeam[findPlayerById(team, id)].minusCount);
				homeChanges++;
				if(homeChanges === 10){
					flushData({'dtype': 'home'}, {'team': homeTeam});
					homeChanges = 0;
				}
				return count;
			}
			else if(team === 'away'){
				count = ++(awayTeam[findPlayerById(team, id)].minusCount);
				awayChanges++;
				if(awayChanges === 10){
					flushData({'dtype': 'away'}, {'team': awayTeam});
					awayChanges = 0;
				}
				return count;
			}
		},
		plusCountUp: function(team, id){
			var count;
			if(team === 'home'){
				count = ++(homeTeam[findPlayerById(team, id)].plusCount);
				homeChanges++;
				if(homeChanges === 10){
					flushData({'dtype': 'home'}, {'team': homeTeam});
					homeChanges = 0;
				}
				return count;
			}
			else if(team === 'away'){
				count = ++(awayTeam[findPlayerById(team, id)].plusCount);
				awayChanges++;
				if(awayChanges === 10){
					flushData({'dtype': 'away'}, {'team': awayTeam});
					awayChanges = 0;
				}
				return count;
			}
		},
		getMinusCount: function(team, id){
			if(team === 'home'){
				return homeTeam[findPlayerById(team, id)].minusCount;
			}
			else if(team === 'away'){
				return awayTeam[findPlayerById(team, id)].minusCount;
			}
			else{
				return null;
			}
		},
		getPlusCount: function(team, id){
			if(team === 'home'){
				return homeTeam[findPlayerById(team, id)].plusCount;
			}
			else if(team === 'away'){
				return awayTeam[findPlayerById(team, id)].plusCount;
			}
			else{
				return null;
			}
		},
		setTeamName: function(team,name){
			if(team === 'home'){
				homeTeamName = name;
				flushData({'dtype': 'home'}, {'name': name});
			}
			else if(team === 'away'){
				awayTeamName = name;
				flushData({'dtype': 'away'}, {'name': name});
			}
		},
		getTeamName: function(team,name){
			if(team === 'home'){
				return homeTeamName;
			}
			else if(team === 'away'){
				return awayTeamName;
			}
			else{
				return null;
			}
		},
		setPlayerName: function(team,id,name){
			if(team === 'home'){
				homeTeam[findPlayerById(team, id)].name = name;
				flushData({'dtype': 'home'}, {'team': homeTeam});
			}
			else if(team === 'away'){
				awayTeam[findPlayerById(team, id)].name = name;
				flushData({'dtype': 'away'}, {'team': awayTeam});
			}
		},
		getPlayerName: function(team,id){
			if(team === 'home'){
				return homeTeam[findPlayerById(team, id)].name;
			}
			else if(team === 'away'){
				return awayTeam[findPlayerById(team, id)].name;
			}
			else{
				return null;
			}
		},
		setPlayerNum: function(team,id,num){
			if(team === 'home'){
				homeTeam[findPlayerById(team, id)].number = num;
				flushData({'dtype': 'home'}, {'team': homeTeam});
			}
			else if(team === 'away'){
				awayTeam[findPlayerById(team, id)].number = num;
				flushData({'dtype': 'away'}, {'team': awayTeam});
			}
		},
		getPlayerNum: function(team,id){
			if(team === 'home'){
				return homeTeam[findPlayerById(team, id)].number;
			}
			else if(team === 'away'){
				return awayTeam[findPlayerById(team, id)].number;
			}
			else{
				return null;
			}
		},
		getPlayer: function(team,id){
			if(team === 'home'){
				return homeTeam[findPlayerById(team, id)];
			}
			else if(team === 'away'){
				return awayTeam[findPlayerById(team, id)];
			}
			else{
				return null;
			}
		}
	};
};
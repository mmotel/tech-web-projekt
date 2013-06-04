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
			if(data.team === 'home'){
				p = new Player(homeTeam[data.p1].id ,homeTeam[data.p1].number ,homeTeam[data.p1].name,
						homeTeam[data.p1].plusCount ,homeTeam[data.p1].minusCount ,homeTeam[data.p1].sendOut,
						true ,homeTeam[data.p1].red ,homeTeam[data.p1].yellow, 
						homeTeam[data.p1].goals);

				homeTeam[data.p1] = homeTeam[data.p2];
				homeTeam[data.p2] = p;

				homeTeam[data.p1].takenUpTime = data.time;
				homeTeam[data.p2].takenDownTime = data.time;
				// console.log(homeTeam[data.p1]);
				// console.log(homeTeam[data.p2]);
				flushData({'dtype': 'home'}, {'team': homeTeam});
			} else {
				p = new Player(awayTeam[data.p1].id ,awayTeam[data.p1].number ,awayTeam[data.p1].name,
						awayTeam[data.p1].plusCount ,awayTeam[data.p1].minusCount ,awayTeam[data.p1].sendOut,
						true ,awayTeam[data.p1].red ,awayTeam[data.p1].yellow,
						awayTeam[data.p1].goals);

				awayTeam[data.p1] = awayTeam[data.p2];
				awayTeam[data.p2] = p;

				homeTeam[data.p1].takenUpTime = data.time;
				homeTeam[data.p2].takenDownTime = data.time;
				// console.log(awayTeam[data.p1]);
				// console.log(awayTeam[data.p2]);
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
					homeTeam[data.playerId].goals += 1;
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else if(data.team === 'away') {
					awayTeam[data.playerId].goals += 1;
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
					homeTeam[data.playerId].yellow += 1;
					if(homeTeam[data.playerId].yellow === 2){
						homeTeam[data.playerId].sendOut = true;
					}
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else {
					awayTeam[data.playerId].yellow += 1;
					if(awayTeam[data.playerId].yellow === 2){
						awayTeam[data.playerId].sendOut = true;
					}
					flushData({'dtype': 'away'}, {'team': awayTeam});
				}
			} else
			if(type === 'red'){
				if(data.playerTeam === 'home'){
					homeTeam[data.playerId].red += 1;
					homeTeam[data.playerId].sendOut = true;
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else {
					awayTeam[data.playerId].red += 1;
					awayTeam[data.playerId].sendOut = true;
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
					homeTeam[f.playerId].goals -= 1;
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else if(f.team === 'away'){
					awayTeam[f.playerId].goals -= 1;
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
					homeTeam[f.playerId].yellow -= 1;
					if(homeTeam[f.playerId].yellow === 1){
						homeTeam[f.playerId].sendOut = false;
					}
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else {
					awayTeam[f.playerId].yellow -= 1;
					if(awayTeam[f.playerId].yellow === 1){
						awayTeam[f.playerId].sendOut = false;
						flushData({'dtype': 'away'}, {'team': awayTeam});
					}
				}
			} else
			if(f.ftype === 'red'){
				if(f.playerTeam === 'home'){
					homeTeam[f.playerId].red -= 1;
					homeTeam[f.playerId].sendOut = false;
					flushData({'dtype': 'home'}, {'team': homeTeam});
				} else {
					awayTeam[f.playerId].red -= 1;
					awayTeam[f.playerId].sendOut = false;
					flushData({'dtype': 'away'}, {'team': awayTeam});
				}
			}
			facts[fid].id = -1;
			flushData({'dtype': 'facts'}, {'facts': facts});
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
				count = ++(homeTeam[id].minusCount);
				homeChanges++;
				if(homeChanges === 10){
					flushData({'dtype': 'home'}, {'team': homeTeam});
					homeChanges = 0;
				}
				return count;
			}
			else if(team === 'away'){
				count = ++(awayTeam[id].minusCount);
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
				count = ++(homeTeam[id].plusCount);
				homeChanges++;
				if(homeChanges === 10){
					flushData({'dtype': 'home'}, {'team': homeTeam});
					homeChanges = 0;
				}
				return count;
			}
			else if(team === 'away'){
				count = ++(awayTeam[id].plusCount);
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
				return homeTeam[id].minusCount;
			}
			else if(team === 'away'){
				return awayTeam[id].minusCount;
			}
			else{
				return null;
			}
		},
		getPlusCount: function(team, id){
			if(team === 'home'){
				return homeTeam[id].plusCount;
			}
			else if(team === 'away'){
				return awayTeam[id].plusCount;
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
				homeTeam[id].name = name;
				flushData({'dtype': 'home'}, {'team': homeTeam});
			}
			else if(team === 'away'){
				awayTeam[id].name = name;
				flushData({'dtype': 'away'}, {'team': awayTeam});
			}
		},
		getPlayerName: function(team,id){
			if(team === 'home'){
				return homeTeam[id].name;
			}
			else if(team === 'away'){
				return awayTeam[id].name;
			}
			else{
				return null;
			}
		},
		setPlayerNum: function(team,id,num){
			if(team === 'home'){
				homeTeam[id].number = num;
				flushData({'dtype': 'home'}, {'team': homeTeam});
			}
			else if(team === 'away'){
				awayTeam[id].number = num;
				flushData({'dtype': 'away'}, {'team': awayTeam});
			}
		},
		getPlayerNum: function(team,id){
			if(team === 'home'){
				return homeTeam[id].number;
			}
			else if(team === 'away'){
				return awayTeam[id].number;
			}
			else{
				return null;
			}
		}
	};
};
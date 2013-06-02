module.exports = function(){

	var mongo = require('mongodb');
	var db = new mongo.Db('test', new mongo.Server('localhost', 27017), {safe: true});

	var homeTeam = {};
	var homeTeamName = {};
	var homeTeamGoals = {};
	var awayTeam = {};
	var awayTeamName = {};
	var awayTeamGoals = {};
	var facts = {};
	var factId = {};
	
	var Player = function(Id, Number, Name, Minus, Plus,SendOut, TakenDown, Red, Yellow, Goals){
		this.id = Id;
		this.number = Number;
		this.name = Name;
		this.plusCount = Minus;
		this.minusCount = Plus;
		this.sendOut = SendOut;
		this.takenDown = TakenDown;
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
	}

	var nextFactId = function(){ 
		factId++;
		return factId; 
	};

	return {
		getAllData: function (socket, callback){
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
									console.log(items.length);
									if(items.length === 0){
										var data = require('./makeData')();
										homeTeamData = data.home;
										awayTeamData = data.away;
										factsData = data.facts; //console.log(factsData);
										coll.insert(homeTeamData, function(err){ if(err) { console.log(err); } });
										coll.insert(awayTeamData, function(err){ if(err) { console.log(err); } });
										coll.insert(factsData, function(err){ if(err) { console.log(err); } });
									}
									else {
										for(var i =0; i < items.length; i++){
											if(items[i].dtype === 'home'){
												homeTeamData = items[i];
											}else if(items[i].dtype === 'away'){
												awayTeamData = items[i];
											}else if(items[i].dtype === 'facts'){
												factsData = items[i]; //console.log(factsData);
											}
										}
									}
									db.close();
									//uzupełnienie referencji pól z danymi
									homeTeam = awayTeamData.team;
									homeTeamName = awayTeamData.name;
									homeTeamGoals = awayTeamData.goals;
									awayTeam = awayTeamData.team;
									awayTeamName = awayTeamData.name;
									awayTeamGoals = awayTeamData.goals;
									facts = factsData.facts;
									factId = factsData.factId;
									//wywołanie callBack-u
									callback(socket);
								}
							});
						}
					});
			    }
			});
		},
		makeSub: function(data){
			if(data.team === 'home'){
				var p = new Player(homeTeam[data.p1].id ,homeTeam[data.p1].number ,homeTeam[data.p1].name
						,homeTeam[data.p1].plusCount ,homeTeam[data.p1].minusCount ,homeTeam[data.p1].sendOut
						,true ,homeTeam[data.p1].red ,homeTeam[data.p1].yellow 
						,homeTeam[data.p1].goals);

				homeTeam[data.p1] = homeTeam[data.p2];
				homeTeam[data.p2] = p;
				// console.log(homeTeam[data.p1]);
				// console.log(homeTeam[data.p2]);
			} else {
				var p = new Player(awayTeam[data.p1].id ,awayTeam[data.p1].number ,awayTeam[data.p1].name
						,awayTeam[data.p1].plusCount ,awayTeam[data.p1].minusCount ,awayTeam[data.p1].sendOut
						,true ,awayTeam[data.p1].red ,awayTeam[data.p1].yellow 
						,awayTeam[data.p1].goals);

				awayTeam[data.p1] = awayTeam[data.p2];
				awayTeam[data.p2] = p;
				// console.log(awayTeam[data.p1]);
				// console.log(awayTeam[data.p2]);
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
				} else if(data.team === 'away') {
					awayTeam[data.playerId].goals += 1;
				}
				if(data.team === 'home'){
					homeTeamGoals += 1;
				} else {
					awayTeamGoals += 1;
				}

			} else
			if(type === 'yellow'){
				if(data.playerTeam === 'home'){
					homeTeam[data.playerId].yellow += 1;
					if(homeTeam[data.playerId].yellow === 2){
						homeTeam[data.playerId].sendOut = true;
					}
				} else {
					awayTeam[data.playerId].yellow += 1;
					if(awayTeam[data.playerId].yellow === 2){
						awayTeam[data.playerId].sendOut = true;
					}
				}
			} else
			if(type === 'red'){
				if(data.playerTeam === 'home'){
					homeTeam[data.playerId].red += 1;
					homeTeam[data.playerId].sendOut = true;
				} else {
					awayTeam[data.playerId].red += 1;
					awayTeam[data.playerId].sendOut = true;
				}
			}
			return newId;
		},
		rmFact: function(fid){
			//console.log(facts[fid]);	
			var f = facts[fid];
			if(f.ftype === 'goal'){
				if(f.playerTeam === 'home' && f.team === 'home'){
					homeTeam[f.playerId].goals -= 1;
				} else if(f.team === 'away'){
					awayTeam[f.playerId].goals -= 1;
				}

				if(f.team === 'home'){
					homeTeamGoals -= 1;
				} else {
					awayTeamGoals -= 1;
				}

			} else
			if(f.ftype === 'yellow'){
				if(f.playerTeam === 'home'){
					homeTeam[f.playerId].yellow -= 1;
					if(homeTeam[f.playerId].yellow === 1){
						homeTeam[f.playerId].sendOut = false;
					}
				} else {
					awayTeam[f.playerId].yellow -= 1;
					if(awayTeam[f.playerId].yellow === 1){
						awayTeam[f.playerId].sendOut = false;
					}
				}
			} else
			if(f.ftype === 'red'){
				if(f.playerTeam === 'home'){
					homeTeam[f.playerId].red -= 1;
					homeTeam[f.playerId].sendOut = false;
				} else {
					awayTeam[f.playerId].red -= 1;
					awayTeam[f.playerId].sendOut = false;
				}
			}
			facts[fid].id = -1;
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
		getMatchData: function(){},
		minusCountUp: function(team, id){
			if(team === 'home'){
				return ++(homeTeam[id].minusCount);
			}
			else if(team === 'away'){
				return ++(awayTeam[id].minusCount);
			}
		},
		plusCountUp: function(team, id){
			if(team === 'home'){
				return ++(homeTeam[id].plusCount);
			}
			else if(team === 'away'){
				return ++(awayTeam[id].plusCount);
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
			}
			else if(team === 'away'){
				awayTeamName = name;
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
			}
			else if(team === 'away'){
				awayTeam[id].name = name;
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
			}
			else if(team === 'away'){
				awayTeam[id].number = num;
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
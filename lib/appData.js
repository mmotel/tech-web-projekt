module.exports = function(){
	
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
	
	var homeTeam = [];
	var homeTeamName = 'home team name';
	var homeTeamGoals = 0;
	var awayTeam = [];
	var awayTeamName = 'away team name';
	var awayTeamGoals = 0;

	var facts = [];
	var factId = 0;

	var nextFactId = function(){ 
		factId++;
		return factId; 
	};
	
	for(var i=1; i < 19; i++){
		var homeNewId = 'home' + (i < 10 ? '0' + i : i);
		var awayNewId = 'away' + (i < 10 ? '0' + i : i);
		homeTeam[i] = new Player(homeNewId,i,'home player name '+i,0,0,false,false,0,0,0);// num: 100, name: player name
		awayTeam[i] = new Player(awayNewId,i,'away player name '+i,0,0,false,false,0,0,0);
	};


	return {
		getScore: function(){
			var scores = {};
			scores.home = homeTeamGoals;
			scores.away = awayTeamGoals;
			console.log(scores);
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
				} else {
					awayTeam[data.playerId].yellow += 1;
				}
			} else
			if(type === 'red'){
				if(data.playerTeam === 'home'){
					homeTeam[data.playerId].red += 1;
				} else {
					awayTeam[data.playerId].red += 1;
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
				} else {
					awayTeam[f.playerId].yellow -= 1;
				}
			} else
			if(f.ftype === 'red'){
				if(f.playerTeam === 'home'){
					homeTeam[f.playerId].red -= 1;
				} else {
					awayTeam[f.playerId].red -= 1;
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
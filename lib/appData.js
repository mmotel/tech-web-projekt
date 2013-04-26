module.exports = function(){
	
	var Player = function(Id, Number, Name, Minus, Plus){
		this.id = Id;
		this.number = Number;
		this.name = Name;
		this.plusCount = Minus;
		this.minusCount = Plus;
		return this;
	};
	
	var homeTeam = [];
	var homeTeamName = 'team name';
	var awayTeam = [];
	var awayTeamName = 'team name';
	
	for(var i=1; i < 19; i++){
		var homeNewId = 'home' + (i < 10 ? '0' + i : i);
		var awayNewId = 'away' + (i < 10 ? '0' + i : i);
		homeTeam[i] = new Player(homeNewId,'-1','player name',0,0);
		awayTeam[i] = new Player(awayNewId,'-1','player name',0,0);
	};


	return {
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
		getPlayerName: function(team,id,name){
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
		getPlayerNum: function(team,id,num){
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
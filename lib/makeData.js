module.exports = function (type){

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
	if(type === 'match'){
		var homeTeamData = {};
		var awayTeamData = {};

		homeTeamData.dtype = 'home';
		homeTeamData.team = [];
		homeTeamData.name = 'home team name';
		homeTeamData.goals = 0;

		awayTeamData.dtype = 'away';
		awayTeamData.team = [];
		awayTeamData.name = 'away team name';
		awayTeamData.goals = 0;

		for(var i=1; i < 19; i++){
			var homeNewId = 'home' + i;
				var awayNewId = 'away' + i;
				homeTeamData.team[i] = new Player(homeNewId,i,'home player name '+i,0,0,false,false,0,0,0);// num: 100, name: player name
				awayTeamData.team[i] = new Player(awayNewId,i,'away player name '+i,0,0,false,false,0,0,0);
		}

		var factsData = {};
		factsData.dtype = 'facts';
		factsData.facts = [];
		factsData.factId = 0;

		return {'home': homeTeamData, 'away': awayTeamData, 'facts': factsData};
	}
	else if(type === 'time'){
		var timerData = {};
		timerData.dtype = 'timer';
		timerData.time = 0;
		timerData.half = 0;
		timerData.isBreak = false;
		timerData.isEnd = false;
		timerData.isStoped = false;

		return {'timer': timerData};
	}
};
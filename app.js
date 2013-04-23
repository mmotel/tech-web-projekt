/*jshint node: true */
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname, 'public')));
});

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("Serwer nasłuchuje na porcie " + app.get('port'));
});
//moduł przechowujący dane aplikacji

var appData = (function(){
	
	var Player = function(Id, Number, Name, Minus, Plus){
		this.id = Id;
		this.number = Number;
		this.name = Name;
		this.plusCount = Minus;
		this.minusCount = Plus;
		return this;
	};
	
	var homeTeam = [];
	var homeTeamName = 'home team';
	var awayTeam = [];
	var awayTeamName = 'away team';
	
	for(var i=1; i < 19; i++){
		var homeNewId = 'home' + (i < 10 ? '0' + i : i);
		var awayNewId = 'away' + (i < 10 ? '0' + i : i);
		homeTeam[i] = new Player(homeNewId,i,'player name',0,0);
		awayTeam[i] = new Player(awayNewId,i,'player name',0,0);
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
		}
	};
})();

//Socket.io
var io = require('socket.io');
var socket = io.listen(server);


socket.on('connection', function (client) {
    'use strict';

    client.emit('homeTeamData', appData.getTeamData('home'));
	client.emit('awayTeamData', appData.getTeamData('away'));

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
});
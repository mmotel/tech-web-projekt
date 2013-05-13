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
var appData = require('./lib/appData')();

//Socket.io
var io = require('socket.io');
var socket = io.listen(server);

socket.on('connection', function (client) {
    'use strict';

    client.emit('teamsData', { home: appData.getTeamData('home'), away: appData.getTeamData('away') });
    var facts = appData.getAllFacts();
	for(var i in facts){
		facts[i].playerName = appData.getPlayerName(facts[i].playerTeam, facts[i].playerId);
    	facts[i].playerNum =  appData.getPlayerNum(facts[i].playerTeam, facts[i].playerId);
    	if(facts[i].ftype === 'goal'){
			client.emit('newGoal', facts[i]);
		}
	}

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
    	appData.addFact(data,'goal');
    	console.log(data);
    	client.broadcast.emit('newGoal', data);
    	client.emit('newGoal', data);

    })
});
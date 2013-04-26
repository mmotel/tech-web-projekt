/*jshint node: true, browser: true, jquery: true */
/*global io: false */
var socket;
$(function () {
    'use strict';

    //funkcja obsługująca kliknięcie przycisku "minus"
	var minusClick = function(that){
		var playerId = $(that).parent().parent().attr('id');
		var TeamTypeString = playerId.substring(0,4);
		var Id = parseInt(playerId.substring(4,6), 10);
		socket.emit('minusCountUp', { team: TeamTypeString, id: Id });
	};
	//funkcja obsługująca kliknięcie przycisku "plus"
	var plusClick = function(that){
		var playerId = $(that).parent().parent().attr('id');
		var TeamTypeString = playerId.substring(0,4);
		var Id = parseInt(playerId.substring(4,6), 10);
		socket.emit('plusCountUp', { team: TeamTypeString, id: Id });
	};
	//funkcja obsługująca onBlur dla pól input
	var inputTextOnBlur = function(that, dataType){
		var playerId = $(that).parent().parent().attr('id');
		if(!playerId){ playerId = $(that).parent().parent().parent().attr('id'); }
		var TeamTypeString = playerId.substring(0,4);
		var Id = parseInt(playerId.substring(4,6), 10);
		var value = $(that).val();
		console.log(value);
		if(value !== ''){
			var data = { team: TeamTypeString, id: Id, value: value, type: dataType };
			socket.emit('newData', data);
		}
	};

	//łączenie z serwerem
    socket = io.connect('http://localhost:3000');
	console.log('connecting…');

    socket.on('connect', function (data) {
        console.log('Połączony!');
    });
	
    socket.on('teamsData', function (data) {
    	myAdminGUI.drawTeam('home', data.home);
    	myAdminGUI.drawTeam('away', data.away);
    	//obsługa klawisza minus
		$(' .minus button').click(function(){ minusClick(this); });
		//obsługa klawisza plus
		$(' .plus button').click(function(){ plusClick(this); });
		//obsługa nowych danych w polach formularza
		$(' .playerNum input[type="text"]').blur(function(){	inputTextOnBlur(this, 'playerNum'); });
		$(' .playerName input[type="text"]').blur(function(){ inputTextOnBlur(this, 'playerName'); });
		$('#homeName').blur(function(){	inputTextOnBlur(this, 'teamName'); });
		$('#awayName').blur(function(){	inputTextOnBlur(this, 'teamName'); });
    });
	
	// socket.on('awayTeamData', function (data) {
	// 	myAdminGUI.drawTeam('away', data);
	// });
	
	socket.on('newMinusCount', function (data) {
        var id = data.id < 10 ? '0' + data.id : data.id;
		var selector = data.team + id;
		$('#' + selector + ' .minusCount').text(data.count);
    });
	
	socket.on('newPlusCount', function (data) {
        var id = data.id < 10 ? '0' + data.id : data.id;
		var selector = data.team + id;
		$('#' + selector + '  .plusCount').text(data.count);
    });
});
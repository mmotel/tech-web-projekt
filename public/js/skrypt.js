/*jshint node: true, browser: true, jquery: true */
/*global io: false */
var socket;
$(function () {
    'use strict';

    //funkcja obsługująca kliknięcie przycisku "minus"
	var minusClick = function(that){
				var playerId = $(that).parent().parent().attr('id');
				console.log(playerId);
				var TeamTypeString = playerId.substring(0,4);
				var Id = parseInt(playerId.substring(4,6), 10);
				socket.emit('minusCountUp', { team: TeamTypeString, id: Id });
	};
	//funkcja obsługująca kliknięcie przycisku "plus"
	var plusClick = function(that){
				var playerId = $(that).parent().parent().attr('id');
				console.log(playerId);
				var TeamTypeString = playerId.substring(0,4);
				var Id = parseInt(playerId.substring(4,6), 10);
				socket.emit('plusCountUp', { team: TeamTypeString, id: Id });
	};

	//łączenie z serwerem
    socket = io.connect('http://localhost:3000');
	console.log('connecting…');

    socket.on('connect', function (data) {
        console.log('Połączony!');
    });
	
    socket.on('teamsData', function (data) {
    	myGUI.drawTeam('home', data.home);
		myGUI.drawTeam('away', data.away);

		//obsługa klawisza minus
		$(' .minus button').click(function(){ minusClick(this); });
		//obsługa klawisza plus
		$(' .plus button').click(function(){ plusClick(this); });

	});
	
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

    socket.on('setNewData', function (data){
    	 console.log(data.value + " : " + data.type);
    	if(data.type === 'teamName'){
    		$('#'+data.team+'Name').text(data.value);
    		$('#'+data.team+'SubsName').text(data.value);
    	} else{
    		var id = data.id < 10 ? '0' + data.id : data.id;
			var selector = data.team + id;
			if(data.type === 'playerNum'){
				$('#' + selector + ' .playerNum').text(data.value);
			}
			else if(data.type === 'playerName'){
				$('#' + selector + ' .playerName').text(data.value);
			}
    	}
    });
});
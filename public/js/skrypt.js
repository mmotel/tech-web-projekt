/*jshint node: true, browser: true, jquery: true */
/*global io: false */
var socket;
$(function () {
    'use strict';
	//łączenie z serwerem
    socket = io.connect('http://localhost:3000');
	console.log('connecting…');

    socket.on('connect', function (data) {
        console.log('Połączony!');
    });
	//funckja wypełniająca zawodnika danymi
	var drawPlayer = function(data){
		return '<div class="teamMember" id="' + data.id +'">' +
						'<span class="playerNum">' + data.number + '</span>' +
						'<span class="playerName">' + data.name + '</span>' +
						'<span class="countButton"><span class="plus">' + data.plusCount +' </span></span>' +
						'<span class="countButton"><span class="minus">' + data.minusCount + '</span></span>' +
					'</div>';
	};
	//dane aplikacji
	
    socket.on('homeTeamData', function (data) {
    	myGUI.drawTeam('home', data);
    });
	
	socket.on('awayTeamData', function (data) {
		myGUI.drawTeam('away', data);
	});
	
	socket.on('newMinusCount', function (data) {
        var id = data.id < 10 ? '0' + data.id : data.id;
		var selector = data.team + id;
		$('#' + selector + ' .minus').text(data.count);
    });
	
	socket.on('newPlusCount', function (data) {
        var id = data.id < 10 ? '0' + data.id : data.id;
		var selector = data.team + id;
		$('#' + selector + ' .plus').text(data.count);
    });
});
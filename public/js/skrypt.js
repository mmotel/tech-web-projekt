/*jshint node: true, browser: true, jquery: true */
/*global io: false */
var socket;
$(function () {
    'use strict';

    $('#score td').css('text-align', 'center');

    //funkcja obsługująca kliknięcie przycisku "minus"
	var minusClick = function(that){
				var playerId = $(that).parent().parent().attr('id');
				//console.log(playerId);
				var TeamTypeString = playerId.substring(0,4);
				var Id = parseInt(playerId.substring(4,playerId.length), 10);
				socket.emit('minusCountUp', { team: TeamTypeString, id: Id });
	};
	//funkcja obsługująca kliknięcie przycisku "plus"
	var plusClick = function(that){
				var playerId = $(that).parent().parent().attr('id');
				//console.log(playerId);
				var TeamTypeString = playerId.substring(0,4);
				var Id = parseInt(playerId.substring(4,playerId.length), 10);
				socket.emit('plusCountUp', { team: TeamTypeString, id: Id });
	};

	//łączenie z serwerem
    socket = io.connect('http://localhost:3000');
	console.log('connecting…');

    socket.on('connect', function (data) {
        console.log('Połączony!');
        $('#factsTable').children().remove();
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
        var id = data.id;
		var selector = data.team + id;
		$('#' + selector + ' .minusCount').text(data.count);
    });
	
	socket.on('newPlusCount', function (data) {
        var id = data.id;
		var selector = data.team + id;
		$('#' + selector + '  .plusCount').text(data.count);
    });

    socket.on('setNewData', function (data){
    	 //console.log(data.value + " : " + data.type);
    	if(data.type === 'teamName'){
    		$('#'+data.team+'Name').text(data.value);
    		$('#'+data.team+'TeamMatchDataName').text(data.value);
    		$('#'+data.team+'SubsName').text(data.value);
    	} else{
    		var id = data.id;
			var selector = data.team + id;
			if(data.type === 'playerNum'){
				$('#' + selector + ' .playerNum').text(data.value);
			}
			else if(data.type === 'playerName'){
				$('#' + selector + ' .playerName').text(data.value);
			}
    	}
    });

    socket.on('newGoal', function (data){
        //console.log(data);
        if(data.team === 'home'){
            $('#factsTable').append('<tr id="fact'+(data.id)
                +'"><td class="home"><h6>'+
            data.time + 'min. GOL ' + data.playerNum + '. ' + data.playerName +
            '</h6></td><td class="spacer"> </td></td></tr>');
        }
        else{
            $('#factsTable').append('<tr id="fact'+(data.id)
                +'"><td class="home"></td><td class="away"><h6>'+
            data.time + 'min. GOL ' + data.playerNum + '. ' + data.playerName +
            '</h6></td></tr>');
        }
    });

    socket.on('newYellow', function (data){
        //console.log(data);
        if(data.id !== -1){
            if(data.team === 'home'){
                $('#factsTable').append('<tr id="fact'+(data.id)
                +'"><td class="home"><h6>'+
                data.time + 'min. ŻÓŁTA ' + data.playerNum + '. ' + data.playerName +
                '</h6></td><td class="away"></td></tr>');
            }
            else{
                $('#factsTable').append('<tr id="fact'+(data.id)
                +'"><td class="home"></td><td class="away"><h6>'+
                data.time + 'min. ŻÓŁTA ' + data.playerNum + '. ' + data.playerName +
                '</h6></td></tr>');
            }
        }
    });

    socket.on('newRed', function (data){
        //console.log(data);
        if(data.id !== -1){
            if(data.team === 'home'){
                $('#factsTable').append('<tr id="fact'+(data.id)
                +'"><td class="home"><h6>'+
                data.time + 'min. CZERWONA ' + data.playerNum + '. ' + data.playerName +
                '</h6></td><td class="away"></td></tr>');
            }
            else{
                $('#factsTable').append('<tr id="fact'+(data.id)
                +'"><td class="home"></td><td class="away"><h6>'+
                data.time + 'min. CZERWONA ' + data.playerNum + '. ' + data.playerName +
                '</h6></td></tr>');
            }
        }
    });

    socket.on('rmFact', function (data){
        //console.log(data);
        $('#fact'+data).remove();
    });

    socket.on('newScore', function (data){
        $('#homeTeamGoals').text(data.home);
        $('#awayTeamGoals').text(data.away);
    });

    socket.on('setTime', function (data){

        $('#time').text(data+'\'');
    });

    socket.on('setHalf', function (data){
        console.log(data);
        $('#halfName').text(data);
    });

    socket.on('makeSub', function(data){

        var p1 = $('#'+data.team+data.p1);
        var p2 = $('#'+data.team+data.p2);

        $(p1).replaceWith(p2);

        $('#'+data.team+'Subs').append(p1);
    });
});
/*jshint node: true, browser: true, jquery: true */
/*global io: false */
var socket;
$(function () {
    'use strict';
    $('#score td').css('text-align', 'center');

    //obsługa kliknięcia przycisku "gol"
    var goalBtnClick = function(teamType){
    	var homeTeamName = $('#homeName').val();
    	var awayTeamName = $('#awayName').val();
    	$('#myGoalModalLabel').text('Gol dla ' + (teamType === 'home' ? homeTeamName : awayTeamName));
    	$('#homeName1').text(homeTeamName + (teamType === 'home' ? '' : ' (samobójczy)'));
    	$('#awayName1').text(awayTeamName + (teamType === 'away' ? '' : ' (samobójczy)'));

    	//get home team first team
    	$('#homeTeamList1').children().remove();
    	$('#homeTeamList1').append('<option value="null">---</option>');

    	var ht = $('#homeFirstTeam tr');
    	for(var i = 0; i < 11; i++){
    		var playerNumber = $(ht[i]).children().filter('.playerNum').children().filter('input').val();
    		var playerName = $(ht[i]).children().filter('.playerName').children().filter('input').val();

    		$('#homeTeamList1').append('<option value="'+ $(ht[i]).attr('id') +'">' + 
    		 playerNumber + ' ' + playerName + '</option>');
    	}
    	//get away team first team
    	$('#awayTeamList1').children().remove();
    	$('#awayTeamList1').append('<option value="null">---</option>');

    	var at = $('#awayFirstTeam tr');
    	for(var i = 0; i < 11; i++){
    		var playerNumber = $(at[i]).children().filter('.playerNum').children().filter('input').val();
    		var playerName = $(at[i]).children().filter('.playerName').children().filter('input').val();

    		$('#awayTeamList1').append('<option value="'+ $(ht[i]).attr('id') +'">' + 
    		 playerNumber + ' ' + playerName + '</option>');
    	}


    	$('#myGoalModal').modal('show');
    	//TO DO click action for save btn
    };
	    //przypisanie akcji
		$('#homeTeamGoalBtn').click(function(){	 goalBtnClick('home');	});
		$('#awayTeamGoalBtn').click(function(){	 goalBtnClick('away');	});

	//obsługa kliknięcia przycisku "zółta" i "czerwona"
	var cardBtnClick = function(teamType, cardName){
    	var teamName = $('#'+teamType+'Name').val();
    	$('#myCardModalLabel').text(teamName + ': ' + (cardName === 'yellow' ? 'żółta' : 'czerwona') + ' kartka');
    	$('#teamName1').text(teamName);

    	//get team first team
    	$('#playersList1').children().remove();
    	$('#playersList1').append('<option value="null">---</option>');

    	var ht = $('#'+teamType+'FirstTeam tr');
    	for(var i = 0; i < 11; i++){
    		var playerNumber = $(ht[i]).children().filter('.playerNum').children().filter('input').val();
    		var playerName = $(ht[i]).children().filter('.playerName').children().filter('input').val();

    		$('#playersList1').append('<option value="'+ $(ht[i]).attr('id') +'">' + 
    		 playerNumber + ' ' + playerName + '</option>');
    	}

    	$('#myCardModal').modal('show');
    	//TO DO click action for save btn
    };
	    //przypisanie akcji dla "żółta"
		$('#homeTeamYellowCardBtn').click(function(){		 cardBtnClick('home','yellow');	});
		$('#awayTeamYellowCardBtn').click(function(){		 cardBtnClick('away','yellow');	});
		//przypisanie akcji dla "czerwona"
		$('#homeTeamRedCardBtn').click(function(){		 cardBtnClick('home','red');	});
		$('#awayTeamRedCardBtn').click(function(){		 cardBtnClick('away','red');	});

	//obsługa kliknięcia "zmiana"
	var subBtnClick = function(teamType){
    	var homeTeamName = $('#homeName').val();
    	var awayTeamName = $('#awayName').val();
    	$('#mySubModalLabel').text((teamType === 'home' ? homeTeamName : awayTeamName) + ': zmiana');

    	//get team first team
    	$('#playersList3').children().remove();
    	$('#playersList3').append('<option value="null">---</option>');

    	var ht = $('#'+teamType+'FirstTeam tr');
    	for(var i = 0; i < 11; i++){
    		var playerNumber = $(ht[i]).children().filter('.playerNum').children().filter('input').val();
    		var playerName = $(ht[i]).children().filter('.playerName').children().filter('input').val();

    		$('#playersList3').append('<option value="'+ $(ht[i]).attr('id') +'">' + 
    		 playerNumber + ' ' + playerName + '</option>');
    	}
    	//get substitutions
    	$('#playersList4').children().remove();
    	$('#playersList4').append('<option value="null">---</option>');

    	var ht = $('#'+teamType+'Subs tr');
    	for(var i = 0; i < 7; i++){
    		var playerNumber = $(ht[i]).children().filter('.playerNum').children().filter('input').val();
    		var playerName = $(ht[i]).children().filter('.playerName').children().filter('input').val();

    		$('#playersList4').append('<option value="'+ $(ht[i]).attr('id') +'">' + 
    		 playerNumber + ' ' + playerName + '</option>');
    	}


    	$('#mySubModal').modal('show');
    	//TO DO click action for save btn
    };
    	

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
		$('#homeName').blur(function(){	inputTextOnBlur(this, 'teamName'); $('#homeTeamMatchDataName').text($(this).val()); });
		$('#awayName').blur(function(){	inputTextOnBlur(this, 'teamName'); $('#awayTeamMatchDataName').text($(this).val()); });
		//obsługa klawisza "zmiana"
		$('#homeSub').click(function(){	 subBtnClick('home');	});
		$('#awaySub').click(function(){	 subBtnClick('away');	});
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
});
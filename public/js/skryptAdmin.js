/*jshint node: true, browser: true, jquery: true */
/*global io: false */
var socket;
$(function () {
    'use strict';
    $('#score td').css('text-align', 'center');

    var goalSaveBtnClick = function(){

        var homePlayerId = $('#goalList1').val();
        homePlayerId = homePlayerId.substring(0, homePlayerId.lenght);
        console.log(homePlayerId);

        var awayPlayerId = $('#goalList2').val();
        awayPlayerId = awayPlayerId.substring(0, awayPlayerId.lenght);
        console.log(awayPlayerId);

        if(homePlayerId === 'null' && awayPlayerId === 'null'){
            $('#goalList1').parent().addClass('error');
            $('#goalList2').parent().addClass('error');
            $('#goalModalInfo').css('color','#b94a48');
            $('#goalModalInfo').text('Wybierz strzelca przed zapisaniem.');
        }
        else{
            var goalEventData = {};
            if(homePlayerId !== 'null'){
                goalEventData.time = $('#time').text();
                goalEventData.playerId = parseInt(homePlayerId.substring(4,6));
                goalEventData.playerTeam = 'home';
                
                $('#myGoalModal').modal('hide');
            }
            else{
                goalEventData.time = $('#time').text();
                goalEventData.playerId = parseInt(awayPlayerId.substring(4,6));
                goalEventData.playerTeam = 'away';
                
                $('#myGoalModal').modal('hide');
            }
            //---
            if($('#myGoalModalLabel').text().substring(8,$('#myGoalModalLabel').text().lenght) === $('#homeName').val()){
                goalEventData.team = 'home';

            }
            else{
                goalEventData.team = 'away';
            }
            console.log(goalEventData);
            socket.emit('newGoal', goalEventData);
        }

    };

    //obsługa kliknięcia przycisku "gol"
    var goalBtnClick = function(teamType){
         $('#goalList1').parent().removeClass('error');
         $('#goalList2').parent().removeClass('error');
         $('#goalModalInfo').text('');

    	var homeTeamName = $('#homeName').val();
    	var awayTeamName = $('#awayName').val();
        if((homeTeamName.length > 0) && (awayTeamName.length > 0) && (homeTeamName !== awayTeamName)){
        	$('#myGoalModalLabel').text('Gol dla ' + (teamType === 'home' ? homeTeamName : awayTeamName));
        	$('#homeName1').text(homeTeamName + (teamType === 'home' ? '' : ' (samobójczy)'));
        	$('#awayName1').text(awayTeamName + (teamType === 'away' ? '' : ' (samobójczy)'));

        	//get home team first team
        	$('#goalList1').children().remove();
        	$('#goalList1').append('<option value="null">---</option>');

        	var ht = $('#homeFirstTeam tr');
        	for(var i = 0; i < 11; i++){
        		var playerNumber = $(ht[i]).children().filter('.playerNum').children().filter('input').val();
        		var playerName = $(ht[i]).children().filter('.playerName').children().filter('input').val();

        		$('#goalList1').append('<option value="'+ $(ht[i]).attr('id') +'">' + 
        		 playerNumber + ' ' + playerName + '</option>');
        	}
        	//get away team first team
        	$('#goalList2').children().remove();
        	$('#goalList2').append('<option value="null">---</option>');

        	var at = $('#awayFirstTeam tr');
        	for(var i = 0; i < 11; i++){
        		var playerNumber = $(at[i]).children().filter('.playerNum').children().filter('input').val();
        		var playerName = $(at[i]).children().filter('.playerName').children().filter('input').val();

        		$('#goalList2').append('<option value="'+ $(at[i]).attr('id') +'">' + 
        		 playerNumber + ' ' + playerName + '</option>');
        	}
            //TO DO click action for save btn
            

        	$('#myGoalModal').modal('show');
        }
    	
    };
	    //przypisanie akcji
		$('#homeTeamGoalBtn').click(function(){	 goalBtnClick('home');	});
		$('#awayTeamGoalBtn').click(function(){	 goalBtnClick('away');	});
        $('#myGoalModalSaveBtn').click(function(){ goalSaveBtnClick(); });

	//obsługa kliknięcia przycisku "zółta" i "czerwona"
	var cardBtnClick = function(teamType, cardName){
    	var teamName = $('#'+teamType+'Name').val();
    	$('#myCardModalLabel').text(teamName + ': ' + (cardName === 'yellow' ? 'żółta' : 'czerwona') + ' kartka');
    	$('#teamName1').text(teamName);

    	//get team first team
    	$('#cardList').children().remove();
    	$('#cardList').append('<option value="null">---</option>');

    	var ht = $('#'+teamType+'FirstTeam tr');
    	for(var i = 0; i < 11; i++){
    		var playerNumber = $(ht[i]).children().filter('.playerNum').children().filter('input').val();
    		var playerName = $(ht[i]).children().filter('.playerName').children().filter('input').val();

    		$('#cardList').append('<option value="'+ $(ht[i]).attr('id') +'">' + 
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
    	$('#subList1').children().remove();
    	$('#subList1').append('<option value="null">---</option>');

    	var ht = $('#'+teamType+'FirstTeam tr');
    	for(var i = 0; i < 11; i++){
    		var playerNumber = $(ht[i]).children().filter('.playerNum').children().filter('input').val();
    		var playerName = $(ht[i]).children().filter('.playerName').children().filter('input').val();

    		$('#subList1').append('<option value="'+ $(ht[i]).attr('id') +'">' + 
    		 playerNumber + ' ' + playerName + '</option>');
    	}
    	//get substitutions
    	$('#subList2').children().remove();
    	$('#subList2').append('<option value="null">---</option>');

    	var ht = $('#'+teamType+'Subs tr');
    	for(var i = 0; i < 7; i++){
    		var playerNumber = $(ht[i]).children().filter('.playerNum').children().filter('input').val();
    		var playerName = $(ht[i]).children().filter('.playerName').children().filter('input').val();

    		$('#subList2').append('<option value="'+ $(ht[i]).attr('id') +'">' + 
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

    socket.on('newGoal', function (data){
        console.log(data);
        if(data.team === 'home'){
            $('#factsTable').append('<tr><td class="home"><h6>'+
            data.time + 'min. GOL ' + data.playerNum + '. ' + data.playerName +
            '</h6></td><td class="spacer"> </td><td class="away"></td></tr>');
        }
        else{
            $('#factsTable').append('<tr><td class="home"></td><td class="spacer"></td><td class="away"><h6>'+
            data.time + 'min. GOL ' + data.playerNum + '. ' + data.playerName +
            '</h6></td></tr>');
        }

    });

});
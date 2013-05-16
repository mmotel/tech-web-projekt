/*jshint node: true, browser: true, jquery: true */
/*global io: false */
var socket;
$(function () {

    var goalTeam = '';
    var yellowTeam = '';
    var redTeam = '';
    var subTeam = '';

    'use strict';
    $('#score td').css('text-align', 'center');
    //obsługa przycisku "zapisz" dla gola
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
            if(goalTeam === 'home'){
                goalEventData.team = 'home';

            }
            else{
                goalEventData.team = 'away';
            }
            console.log(goalEventData);
            socket.emit('newGoal', goalEventData);
            goalTeam = '';
        }
    };

    //obsługa kliknięcia przycisku "gol"
    var goalBtnClick = function(teamType){
        $('#goalList1').parent().removeClass('error');
        $('#goalList2').parent().removeClass('error');
        $('#goalModalInfo').text('');

    	var homeTeamName = '';
    	var awayTeamName = '';

        	//clear home team list
        	$('#goalList1').children().remove();
        	$('#goalList1').append('<option value="null">---</option>');
            //clear away team list
            $('#goalList2').children().remove();
            $('#goalList2').append('<option value="null">---</option>');

            $.getJSON('http://localhost:3000/AJAX/getTeams/', function(data){ //console.log(data); 
                //set home team data
                homeTeamName = data.home.name;
            	var ht = data.home.team;
            	for(var i = 1; i < 12; i++){
            		var playerNumber = ht[i].number;
            		var playerName = ht[i].name;

            		$('#goalList1').append('<option value="'+ ht[i].id +'">' + 
            		 (playerNumber != '100' ? playerNumber : '#') + ' ' + (playerName !== 'player name' ? playerName : 'imię i nazwisko') +
                      '</option>');
            	}
                //set away team data
                awayTeamName = data.away.name;
                var at = data.away.team;
                for(var i = 1; i < 12; i++){
                    var playerNumber = at[i].number;
                    var playerName = at[i].name;

                    $('#goalList2').append('<option value="'+ at[i].id +'">' + 
                     (playerNumber != '100' ? playerNumber : '#') + ' ' + (playerName !== 'player name' ? playerName : 'imię i nazwisko') + 
                     '</option>');
                }
                //show modal
                 if((homeTeamName.length > 0) && (awayTeamName.length > 0) && (homeTeamName !== awayTeamName)){
                    $('#myGoalModalLabel').text('Gol dla ' + (teamType === 'home' ? homeTeamName : awayTeamName));
                    $('#homeName1').text(homeTeamName + (teamType === 'home' ? '' : ' (samobójczy)'));
                    $('#awayName1').text(awayTeamName + (teamType === 'away' ? '' : ' (samobójczy)'));
                    $('#myGoalModal').modal('show');
                }
            });
    };

	    //przypisanie akcji
		$('#homeTeamGoalBtn').click(function(){	 goalBtnClick('home'); goalTeam = 'home';	});
		$('#awayTeamGoalBtn').click(function(){	 goalBtnClick('away'); goalTeam = 'away';	});
        $('#myGoalModalSaveBtn').click(function(){ goalSaveBtnClick(); });

    //obsługa kliknięcia przycisku "zapisz" dla żółtej
    var yellowCardSaveBtnClick = function(){

        var playerId = $('#yellowCardList').val();
        playerId = playerId.substring(0, playerId.lenght);
        console.log(playerId === 'null');


        if(playerId === 'null'){
            $('#yellowCardList').parent().addClass('error');
            $('#yellowModalInfo').css('color','#b94a48');
            $('#yellowModalInfo').text('Wybierz zawodnika przed zapisaniem.');
        }
        else{
            var yellowEventData = {};

                yellowEventData.time = $('#time').text();
                yellowEventData.playerId = parseInt(playerId.substring(4,6));
                yellowEventData.playerTeam = yellowTeam;
                
                $('#myYellowCardModal').modal('hide');

                yellowEventData.team = yellowTeam;
            console.log(yellowEventData);
            socket.emit('newYellow', yellowEventData);
            yellowTeam = '';
        }
    };
	//obsługa kliknięcia przycisku "zółta"
	var yellowCardBtnClick = function(teamType){
        $('#yellowCardList').parent().removeClass('error');
        $('#yellowModalInfo').text('');

        $.getJSON('http://localhost:3000/AJAX/getPlayers/'+teamType+'/', function(data){


        	var teamName = data.name;
        	$('#myYellowCardModalLabel').text(teamName + ': żółta kartka');
        	$('#teamName1').text(teamName);

        	//get team first team
        	$('#yellowCardList').children().remove();
        	$('#yellowCardList').append('<option value="null">---</option>');

        	var ht = data.team;
        	for(var i = 1; i < 12; i++){
        		var playerNumber = ht[i].number;
        		var playerName = ht[i].name;

        		$('#yellowCardList').append('<option value="'+ ht[i].id +'">' + 
        		 (playerNumber != '100' ? playerNumber : '#') + ' ' + (playerName !== 'player name' ? playerName : 'imię i nazwisko') +
                  '</option>');
        	}

        	$('#myYellowCardModal').modal('show');
        	//TO DO click action for save btn
        });
    };
	    //przypisanie akcji dla "żółta"
		$('#homeTeamYellowCardBtn').click(function(){     yellowCardBtnClick('home','yellow'); yellowTeam = 'home';   });
		$('#awayTeamYellowCardBtn').click(function(){     yellowCardBtnClick('away','yellow'); yellowTeam = 'away';   });
        $('#myYellowCardModalSaveBtn').click(function() {   yellowCardSaveBtnClick();   });


    //obsługa kliknięcia przycisku "zapisz" dla czerwonej
    var redCardSaveBtnClick = function(){

        var playerId = $('#redCardList').val();
        playerId = playerId.substring(0, playerId.lenght);
        console.log(playerId === 'null');


        if(playerId === 'null'){
            $('#redCardList').parent().addClass('error');
            $('#redModalInfo').css('color','#b94a48');
            $('#redModalInfo').text('Wybierz zawodnika przed zapisaniem.');
        }
        else{
            var redEventData = {};

                redEventData.time = $('#time').text();
                redEventData.playerId = parseInt(playerId.substring(4,6));
                redEventData.playerTeam = redTeam;
                
                $('#myRedCardModal').modal('hide');

                redEventData.team = redTeam;
            console.log(redEventData);
            socket.emit('newRed', redEventData);
            redTeam = '';
        }
    };
    //obsługa kliknięcia przycisku "czerwona"
    var redCardBtnClick = function(teamType){
        $.getJSON('http://localhost:3000/AJAX/getPlayers/'+teamType+'/', function(data){


            var teamName = data.name;
            $('#myRedCardModalLabel').text(teamName + ': czerwona kartka');
            $('#teamName2').text(teamName);

            //get team first team
            $('#redCardList').children().remove();
            $('#redCardList').append('<option value="null">---</option>');

            var ht = data.team;
            for(var i = 1; i < 12; i++){
                var playerNumber = ht[i].number;
                var playerName = ht[i].name;

                $('#redCardList').append('<option value="'+ ht[i].id +'">' + 
                 (playerNumber != '100' ? playerNumber : '#') + ' ' + (playerName !== 'player name' ? playerName : 'imię i nazwisko') +
                  '</option>');
            }

            $('#myRedCardModal').modal('show');
            //TO DO click action for save btn
        });
    };
		//przypisanie akcji dla "czerwona"
		$('#homeTeamRedCardBtn').click(function(){    redCardBtnClick('home','red'); redTeam = 'home';	});
		$('#awayTeamRedCardBtn').click(function(){    redCardBtnClick('away','red'); redTeam = 'away';	});
        $('#myRedCardModalSaveBtn').click(function() {   redCardSaveBtnClick();   });

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
    //fynkcja obsługująca usunięcie faktu
    var rmFactBtnClick = function(that){
        var factId = $(that).attr('id').substring(6,9);
        var id = parseInt(factId,10);
        // console.log(id + ' : ' + 'fact' + factId);
        // console.log($('#fact' + factId));
        socket.emit('rmFact', id);

    };

	//łączenie z serwerem
    socket = io.connect('http://localhost:3000');
	console.log('connecting…');

    socket.on('connect', function (data) {
        console.log('Połączony!');
        $('#factsTable').children().remove();
    });
	
    socket.on('teamsData', function (data) {
    	myAdminGUI.drawTeam('home', data.home);
    	myAdminGUI.drawTeam('away', data.away);
    	//obsługa klawisza minus
		$(' .minus button').click(function(){ minusClick(this); });
		//obsługa klawisza plus
		$(' .plus button').click(function(){ plusClick(this); });
		//obsługa nowych danych w polach formularza
		$(' .playerNum input[type="text"]').blur(function(){ inputTextOnBlur(this, 'playerNum'); });
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
        //console.log(data);
            if(data.team === 'home'){
                $('#factsTable').append('<tr id="fact'+(data.id > 10 ? data.id : '0'+data.id)
                +'"><td class="home"><h6>'+
                data.time + 'min. GOL ' + data.playerNum + '. ' + data.playerName +
                '<button type="button" class="close" id="factRm'+(data.id > 10 ? data.id : '0'+data.id)
                +'">×</button></h6></td><td class="spacer"> </td><td class="away"></td></tr>');
            }
            else{
                $('#factsTable').append('<tr id="fact'+(data.id > 10 ? data.id : '0'+data.id)
                +'"><td class="home"></td><td class="spacer"></td><td class="away"><h6>'+
                data.time + 'min. GOL ' + data.playerNum + '. ' + data.playerName +
                '<button type="button" class="close" id="factRm'+(data.id > 10 ? data.id : '0'+data.id)
                +'">×</button></h6></td></tr>');
            }
            $('#factRm'+(data.id > 10 ? data.id : '0'+data.id)).click(function(){ rmFactBtnClick(this); });
    });

    socket.on('newYellow', function (data){
        console.log(data);

            if(data.team === 'home'){
                $('#factsTable').append('<tr id="fact'+(data.id > 10 ? data.id : '0'+data.id)
                +'"><td class="home"><h6>'+
                data.time + 'min. ŻÓŁTA ' + data.playerNum + '. ' + data.playerName +
                '<button type="button" class="close" id="factRm'+(data.id > 10 ? data.id : '0'+data.id)
                +'">×</button></h6></td><td class="spacer"> </td><td class="away"></td></tr>');
            }
            else{
                $('#factsTable').append('<tr id="fact'+(data.id > 10 ? data.id : '0'+data.id)
                +'"><td class="home"></td><td class="spacer"></td><td class="away"><h6>'+
                data.time + 'min. ŻÓŁTA ' + data.playerNum + '. ' + data.playerName +
                '<button type="button" class="close" id="factRm'+(data.id > 10 ? data.id : '0'+data.id)
                +'">×</button></h6></td></tr>');
            }
            $('#factRm'+(data.id > 10 ? data.id : '0'+data.id)).click(function(){ rmFactBtnClick(this); });
        
    });

    socket.on('newRed', function (data){
        console.log(data);

            if(data.team === 'home'){
                $('#factsTable').append('<tr id="fact'+(data.id > 10 ? data.id : '0'+data.id)
                +'"><td class="home"><h6>'+
                data.time + 'min. CZERWONA ' + data.playerNum + '. ' + data.playerName +
                '<button type="button" class="close" id="factRm'+(data.id > 10 ? data.id : '0'+data.id)
                +'">×</button></h6></td><td class="spacer"> </td><td class="away"></td></tr>');
            }
            else{
                $('#factsTable').append('<tr id="fact'+(data.id > 10 ? data.id : '0'+data.id)
                +'"><td class="home"></td><td class="spacer"></td><td class="away"><h6>'+
                data.time + 'min. CZERWONA ' + data.playerNum + '. ' + data.playerName +
                '<button type="button" class="close" id="factRm'+(data.id > 10 ? data.id : '0'+data.id)
                +'">×</button></h6></td></tr>');
            }
            $('#factRm'+(data.id > 10 ? data.id : '0'+data.id)).click(function(){ rmFactBtnClick(this); });
        
    });

    socket.on('rmFact', function (data){
        //console.log(data);
        $('#fact'+(data > 10 ? data : '0'+data)).remove();
    });

    socket.on('newScore', function (data){
        $('#homeTeamGoals').text(data.home);
        $('#awayTeamGoals').text(data.away);
    });

});
/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(function () {
	'use strict';
	var socket;
	//flagi
	var goalTeam = '';
	var yellowTeam = '';
	var redTeam = '';
	var subTeam = '';

	$('#panelBody').hide();
	//kilka poprawek stylistycznych
	$('#score td').css('text-align', 'center');

	// $('button').css('margin','2px');

	//obsługa przycisku "zapisz" dla gola
	var goalSaveBtnClick = function(){

		var homePlayerId = $('#goalList1').val();
		homePlayerId = homePlayerId.substring(0, homePlayerId.length);
		//console.log(homePlayerId);

		var awayPlayerId = $('#goalList2').val();
		awayPlayerId = awayPlayerId.substring(0, awayPlayerId.length);
		//console.log(awayPlayerId);

		if(homePlayerId === 'null' && awayPlayerId === 'null'){
			$('#goalList1').parent().addClass('error');
			$('#goalList2').parent().addClass('error');
			$('#goalModalInfo').css('color','#b94a48');
			$('#goalModalInfo').text('Wybierz strzelca przed zapisaniem.');
		}
		else{
			var goalEventData = {};
			if(homePlayerId !== 'null'){
				goalEventData.time = $('#myGoalModalTime').text() +'\'';
				goalEventData.playerId = parseInt(homePlayerId.substring(4,homePlayerId.length),10);
				goalEventData.playerTeam = 'home';
				
				$('#myGoalModal').modal('hide');
			}
			else{
				goalEventData.time = $('#myGoalModalTime').text() +'\'';
				goalEventData.playerId = parseInt(awayPlayerId.substring(4,awayPlayerId.length),10);
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
			//console.log(goalEventData);
			socket.emit('newGoal', goalEventData);
			goalTeam = '';
		}
	};

	//obsługa kliknięcia przycisku "gol"
	var goalBtnClick = function(teamType){
		if($('#time').text() === '0\'' || $('#halfName').text() === 'koniec meczu') return;
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
				var playerNumber;
				var playerName;
				homeTeamName = data.home.name;
				var ht = data.home.team;
				for(var i = 1; i < 12; i++){
					if(!ht[i].sendOut){
						playerNumber = ht[i].number;
						playerName = ht[i].name;

						$('#goalList1').append('<option value="'+ ht[i].id +'">' + 
						(playerNumber != '100' ? playerNumber : '#') + ' ' +
							(playerName !== 'player name' ? playerName : 'imię i nazwisko') +
							'</option>');
					}
				}
				//set away team data
				awayTeamName = data.away.name;
				var at = data.away.team;
				for(var j = 1; j < 12; j++){
					if(!ht[j].sendOut){
						playerNumber = at[j].number;
						playerName = at[j].name;

						$('#goalList2').append('<option value="'+ at[j].id +'">' + 
						(playerNumber != '100' ? playerNumber : '#') + ' ' +
							(playerName !== 'player name' ? playerName : 'imię i nazwisko') + 
							'</option>');
					}
				}
				//show modal
				if((homeTeamName.length > 0) && (awayTeamName.length > 0) && (homeTeamName !== awayTeamName)){
					var time = $('#time').text();
					time = parseInt(time.substring(0,time.length-1),10);
					//console.log(time);
					$('#myGoalModalTime').text(time);
					$('#myGoalModalLabel').text('Gol dla ' + (teamType === 'home' ? homeTeamName : awayTeamName));
					$('#homeName1').text(homeTeamName + (teamType === 'home' ? '' : ' (samobójczy)'));
					$('#awayName1').text(awayTeamName + (teamType === 'away' ? '' : ' (samobójczy)'));
					$('#myGoalModal').modal('show');
				}
			});
	};

		//przypisanie akcji
		$('#homeTeamGoalBtn').click(function(){	goalBtnClick('home'); goalTeam = 'home';	});
		$('#awayTeamGoalBtn').click(function(){	goalBtnClick('away'); goalTeam = 'away';	});
		$('#myGoalModalSaveBtn').click(function(){ goalSaveBtnClick(); });
		$('#myGoalModalTimeDown').click(function() {
			var goalTime = $('#myGoalModalTime').text();
			goalTime = parseInt(goalTime,10);
			if(goalTime > 1){
				goalTime -= 1;
				$('#myGoalModalTime').text(goalTime);
			}
		});

		$('#myGoalModalTimeUp').click(function() {
			var goalTime = $('#myGoalModalTime').text();
			goalTime = parseInt(goalTime,10);
			if(goalTime >= 1){
				goalTime += 1;
				$('#myGoalModalTime').text(goalTime);
			}
		});

	//obsługa kliknięcia przycisku "zapisz" dla żółtej
	var yellowCardSaveBtnClick = function(){

		var playerId = $('#yellowCardList').val();
		playerId = playerId.substring(0, playerId.length);
		//console.log(playerId === 'null');


		if(playerId === 'null'){
			$('#yellowCardList').parent().addClass('error');
			$('#yellowModalInfo').css('color','#b94a48');
			$('#yellowModalInfo').text('Wybierz zawodnika przed zapisaniem.');
		}
		else{
			var yellowEventData = {};

				yellowEventData.time = $('#myYellowCardModalTime').text() +'\'';
				yellowEventData.playerId = parseInt(playerId.substring(4,playerId.length),10);
				yellowEventData.playerTeam = yellowTeam;
				
				$('#myYellowCardModal').modal('hide');

				yellowEventData.team = yellowTeam;
			//console.log(yellowEventData);
			socket.emit('newYellow', yellowEventData);
			yellowTeam = '';
		}
	};
	//obsługa kliknięcia przycisku "zółta"
	var yellowCardBtnClick = function(teamType){
		if($('#time').text() === '0\'' || $('#halfName').text() === 'koniec meczu') return;
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
				if(!ht[i].sendOut){
					var playerNumber = ht[i].number;
					var playerName = ht[i].name;

					$('#yellowCardList').append('<option value="'+ ht[i].id +'">' + 
						(playerNumber != '100' ? playerNumber : '#') + ' ' + (playerName !== 'player name' ? playerName : 'imię i nazwisko') +
						'</option>');
				}
			}
			var time = $('#time').text();
			time = parseInt(time.substring(0,time.length-1),10);
			$('#myYellowCardModalTime').text(time);
			$('#myYellowCardModal').modal('show');
		});
	};
		//przypisanie akcji dla "żółta"
		$('#homeTeamYellowCardBtn').click(function() {	yellowCardBtnClick('home','yellow'); yellowTeam = 'home';	});
		$('#awayTeamYellowCardBtn').click(function() {	yellowCardBtnClick('away','yellow'); yellowTeam = 'away';	});
		$('#myYellowCardModalSaveBtn').click(function() {	yellowCardSaveBtnClick();	});
		$('#myYellowCardModalTimeDown').click(function() {
			var yellowTime = $('#myYellowCardModalTime').text();
			yellowTime = parseInt(yellowTime,10);
			if(yellowTime > 1){
				yellowTime -= 1;
				$('#myYellowCardModalTime').text(yellowTime);
			}
		});

		$('#myYellowCardModalTimeUp').click(function() {
			var yellowTime = $('#myYellowCardModalTime').text();
			yellowTime = parseInt(yellowTime,10);
			if(yellowTime >= 1){
				yellowTime += 1;
				$('#myYellowCardModalTime').text(yellowTime);
			}
		});

	//obsługa kliknięcia przycisku "zapisz" dla czerwonej
	var redCardSaveBtnClick = function(){

		var playerId = $('#redCardList').val();
		playerId = playerId.substring(0, playerId.length);
		//console.log(playerId === 'null');


		if(playerId === 'null'){
			$('#redCardList').parent().addClass('error');
			$('#redModalInfo').css('color','#b94a48');
			$('#redModalInfo').text('Wybierz zawodnika przed zapisaniem.');
		}
		else{
			var redEventData = {};

				redEventData.time = $('#myRedCardModalTime').text() + '\'';
				redEventData.playerId = parseInt(playerId.substring(4,playerId.length),10);
				redEventData.playerTeam = redTeam;
				
				$('#myRedCardModal').modal('hide');

				redEventData.team = redTeam;
			//console.log(redEventData);
			socket.emit('newRed', redEventData);
			redTeam = '';
		}
	};
	//obsługa kliknięcia przycisku "czerwona"
	var redCardBtnClick = function(teamType){
		if($('#time').text() === '0\'' || $('#halfName').text() === 'koniec meczu') return;
		$.getJSON('http://localhost:3000/AJAX/getPlayers/'+teamType+'/', function(data){


			var teamName = data.name;
			$('#myRedCardModalLabel').text(teamName + ': czerwona kartka');
			$('#teamName2').text(teamName);

			//get team first team
			$('#redCardList').children().remove();
			$('#redCardList').append('<option value="null">---</option>');

			var ht = data.team;
			for(var i = 1; i < 12; i++){
				if(!ht[i].sendOut){
					var playerNumber = ht[i].number;
					var playerName = ht[i].name;

					$('#redCardList').append('<option value="'+ ht[i].id +'">' + 
						(playerNumber != '100' ? playerNumber : '#') + ' ' + 
						(playerName !== 'player name' ? playerName : 'imię i nazwisko') +
						'</option>');
				}
			}
			var time = $('#time').text();
			time = parseInt(time.substring(0,time.length-1),10);
			$('#myRedCardModalTime').text(time);
			$('#myRedCardModal').modal('show');
			//TO DO click action for save btn
		});
	};
		//przypisanie akcji dla "czerwona"
		$('#homeTeamRedCardBtn').click(function(){    redCardBtnClick('home','red'); redTeam = 'home';	});
		$('#awayTeamRedCardBtn').click(function(){    redCardBtnClick('away','red'); redTeam = 'away';	});
		$('#myRedCardModalSaveBtn').click(function() {   redCardSaveBtnClick();   });
		$('#myRedCardModalTimeDown').click(function() {
			var redTime = $('#myRedCardModalTime').text();
			redTime = parseInt(redTime,10);
			if(redTime > 1){
				redTime -= 1;
				$('#myRedCardModalTime').text(redTime);
			}
		});

		$('#myRedCardModalTimeUp').click(function() {
			var redTime = $('#myRedCardModalTime').text();
			redTime = parseInt(redTime,10);
			if(redTime >= 1){
				redTime += 1;
				$('#myRedCardModalTime').text(redTime);
			}
		});

	//obsługa kliknięcia przycisku "zapisz" dla zmiany
	var subSaveBtnClick = function(){

		var playerDownId = $('#subList1').val();
		playerDownId = playerDownId.substring(0, playerDownId.length);
		var playerUpId = $('#subList2').val();
		playerUpId = playerUpId.substring(0, playerUpId.length);


		if(playerDownId === 'null'|| playerUpId === 'null'){
			$('#subList1').parent().addClass('error');
			$('#subList2').parent().addClass('error');
			$('#subModalInfo').css('color','#b94a48');
			$('#subModalInfo').text('Wybierz zawodników przed zapisaniem.');
		}else{
			var subEventData = {};
			subEventData.p1 = parseInt(playerDownId.substring(4,playerDownId.length),10);
			subEventData.p2 = parseInt(playerUpId.substring(4,playerUpId.length),10);
			subEventData.team = subTeam;
			subEventData.time = $('#mySubModalTime').text() + '\'';
			// console.log(subEventData);
			socket.emit('makeSub', subEventData);
			subTeam = '';
			$('#mySubModal').modal('hide');
		}
	};

	//obsługa kliknięcia "zmiana"
	var subBtnClick = function(teamType){

		$('#subList1').parent().removeClass('error');
		$('#subList2').parent().removeClass('error');
		$('#subModalInfo').text('');

		$.getJSON('http://localhost:3000/AJAX/getPlayers/'+teamType+'/', function(data){
			var playerNumber2;
			var playerName2;
			var teamName = data.name;
			$('#mySubModalLabel').text(teamName + ': zmiana');

			//get team first team
			$('#subList1').children().remove();
			$('#subList1').append('<option value="null">---</option>');

			var team = data.team;
			for(var i = 1; i < 12; i++){
				if(!team[i].sendOut){
					playerNumber2 = team[i].number;
					playerName2 = team[i].name;

					$('#subList1').append('<option value="'+ team[i].id +'">' + 
						(playerNumber2 != '100' ? playerNumber2 : '#') + ' ' + 
						(playerName2 !== 'player name' ? playerName2 : 'imię i nazwisko') +
						'</option>');
				}
			}
			//get team sub team
			$('#subList2').children().remove();
			$('#subList2').append('<option value="null">---</option>');

			for(var j = 12; j < 19; j++){
				if(!team[j].takenDown){
					playerNumber2 = team[j].number;
					playerName2 = team[j].name;

					$('#subList2').append('<option value="'+ team[j].id +'">' + 
						(playerNumber2 != '100' ? playerNumber2 : '#') + ' ' + 
						(playerName2 !== 'player name' ? playerName2 : 'imię i nazwisko') +
						'</option>');
				}
			}
			var time = $('#time').text();
			time = parseInt(time.substring(0,time.length-1),10);
			$('#mySubModalTime').text(time);
			$('#mySubModal').modal('show');
			//TO DO click action for save btn
		});
	};
		//przypisanie akcji klawiszowi "zapisz" dla zmiany
		$('#mySubModalSaveBtn').click(function(){ subSaveBtnClick(); });

		$('#mySubModalTimeDown').click(function() {
			var subTime = $('#mySubModalTime').text();
			subTime = parseInt(subTime,10);
			if(subTime > 1){
				subTime -= 1;
				$('#mySubModalTime').text(subTime);
			}
		});

		$('#mySubModalTimeUp').click(function() {
			var subTime = $('#mySubModalTime').text();
			subTime = parseInt(subTime,10);
			if(subTime >= 1){
				subTime += 1;
				$('#mySubModalTime').text(subTime);
			}
		});

	//funkcja obsługująca kliknięcie przycisku "minus"
	var minusClick = function(that){
		var playerId = $(that).parent().parent().attr('id');
		var TeamTypeString = playerId.substring(0,4);
		var Id = parseInt(playerId.substring(4,playerId.length), 10);
		socket.emit('minusCountUp', { team: TeamTypeString, id: Id });
	};

	//funkcja obsługująca kliknięcie przycisku "plus"
	var plusClick = function(that){
		var playerId = $(that).parent().parent().attr('id');
		var TeamTypeString = playerId.substring(0,4);
		var Id = parseInt(playerId.substring(4,playerId.length), 10);
		socket.emit('plusCountUp', { team: TeamTypeString, id: Id });
	};

	//funkcja obsługująca onBlur dla pól input
	var inputTextOnBlur = function(that, dataType){
		var playerId = $(that).parent().parent().attr('id');
		if(!playerId){ playerId = $(that).parent().parent().parent().attr('id'); }
		var TeamTypeString = playerId.substring(0,4);
		var Id = parseInt(playerId.substring(4,playerId.length), 10);
		var value = $(that).val();
		//console.log(value.length !== 0);
		if(value.length !== 0){
			if(dataType === 'teamName'){ $('#'+TeamTypeString+'TeamMatchDataName').text($(that).val()); }
			var data = { team: TeamTypeString, id: Id, value: value, type: dataType };
			socket.emit('newData', data);
		}
	};

	//funkcja obsługująca usunięcie faktu
	var rmFactBtnClick = function(that){
		var factId = $(that).attr('id');
		var id = parseInt(factId.substring(6,factId.length),10);
		// console.log(id + ' : ' + 'fact' + factId);
		// console.log($('#fact' + factId));
		socket.emit('rmFact', id);
	};
	//przypisanie akcji do przycisków obsługujących czas
		$('#timeStartBtn').click(function(){ socket.emit('startHalf'); });
		$('#timeEndBtn').click(function(){ socket.emit('endHalf'); });
		$('#timeStopBtn').click(function(){ socket.emit('stopHalf'); });
		$('#gameEndBtn').click(function(){ $('#myEndMatchModal').modal('show'); });

		$('#myEndMatchModalSaveBtn').click(function() { 
			socket.emit('endGame');
			$('#myEndMatchModal').modal('hide');
		});

		$('#newGameBtn').click(function(){ socket.emit('newGame'); });

	//bosługa potiwerdzenia "logowania"
	$('#myLoginModalSaveBtn').click(function(){
		var passwd = $('#myLoginModalPassword').val();
		if(passwd.length > 0){
			socket.emit('checkPassword', {'passwd': passwd});
			$('#myLoginModalPassword').val('');
		}
	});

	//łączenie z serwerem
	socket = io.connect('http://localhost:3000');
	//console.log('connecting…');

	socket.on('connect', function (data) {
		//console.log('Połączony!');
		$('#factsTable').children().remove();
		$('#myLoginModal').modal('show');
	});

	socket.on('checkPassword', function (data){
		if(data){
			$('#panelBody').show();
			$('#myLoginModal').modal('hide');
		}
	});
	
	socket.on('teamsData', function (data) {
		//clear facts!!!!!!!!!!!!!!!!!!!!!!!!!!#########@@@@@@@@@@@@@@@@@@@@@<---------------------------
		$('#newGamePanel').css('display', 'none');
		$('#timePanel').css('display', 'block');
		myAdminGUI.drawTeam('home', data.home);
		myAdminGUI.drawTeam('away', data.away);
		//obsługa klawisza minus
		$(' .minus button').click(function(){ minusClick(this); });
		//obsługa klawisza plus
		$(' .plus button').click(function(){ plusClick(this); });

		$('#homeSubs button').css({'display': 'none'});
		$('#awaySubs button').css({'display': 'none'});
		//obsługa nowych danych w polach formularza
		$(' .playerNum input[type="text"]').blur(function(){ inputTextOnBlur(this, 'playerNum'); });
		$(' .playerName input[type="text"]').blur(function(){ inputTextOnBlur(this, 'playerName'); });
		$('#homeName').blur(function(){	inputTextOnBlur(this, 'teamName'); /*$('#homeTeamMatchDataName').text($(this).val());*/ });
		$('#awayName').blur(function(){	inputTextOnBlur(this, 'teamName'); /*$('#awayTeamMatchDataName').text($(this).val());*/ });
		//obsługa klawisza "zmiana"
		$('#homeSub').click(function(){	subBtnClick('home'); subTeam = 'home';	});
		$('#awaySub').click(function(){	subBtnClick('away'); subTeam = 'away';	});
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

	socket.on('newGoal', function (data){
		//console.log(data);
			if(data.team === 'home'){
				$('#factsTable').append('<tr id="fact'+(data.id) +
					'"><td class="home"><h6>'+
				data.time + 'min. GOL ' + data.playerNum + '. ' + data.playerName +
				'<button type="button" class="close" id="factRm'+(data.id) +
					'">×</button></h6></td><td class="spacer"> </td><td class="away"></td></tr>');
			}
			else{
				$('#factsTable').append('<tr id="fact'+(data.id) +
					'"><td class="home"></td><td class="spacer"></td><td class="away"><h6>'+
				data.time + 'min. GOL ' + data.playerNum + '. ' + data.playerName +
				'<button type="button" class="close" id="factRm'+(data.id) +
					'">×</button></h6></td></tr>');
			}
			$('#factRm'+(data.id)).click(function(){ rmFactBtnClick(this); });
	});

	socket.on('newYellow', function (data){
		//console.log(data);

			if(data.team === 'home'){
				$('#factsTable').append('<tr id="fact'+(data.id) + 
					'"><td class="home"><h6>'+
				data.time + 'min. ŻÓŁTA ' + data.playerNum + '. ' + data.playerName +
				'<button type="button" class="close" id="factRm'+(data.id) + 
					'">×</button></h6></td><td class="spacer"> </td><td class="away"></td></tr>');
			}
			else{
				$('#factsTable').append('<tr id="fact'+(data.id) + 
					'"><td class="home"></td><td class="spacer"></td><td class="away"><h6>'+
				data.time + 'min. ŻÓŁTA ' + data.playerNum + '. ' + data.playerName +
				'<button type="button" class="close" id="factRm'+(data.id) + 
					'">×</button></h6></td></tr>');
			}
			$('#factRm'+(data.id)).click(function(){ rmFactBtnClick(this); });
			if(data.sendOut){
				$('#'+data.playerTeam+data.playerId + ' button').hide();
			}
	});

	socket.on('newRed', function (data){
		//console.log(data);

			if(data.team === 'home'){
				$('#factsTable').append('<tr id="fact'+(data.id) + 
					'"><td class="home"><h6>'+
				data.time + 'min. CZERWONA ' + data.playerNum + '. ' + data.playerName +
				'<button type="button" class="close" id="factRm'+(data.id) + 
					'">×</button></h6></td><td class="spacer"> </td><td class="away"></td></tr>');
			}
			else{
				$('#factsTable').append('<tr id="fact'+(data.id) + 
					'"><td class="home"></td><td class="spacer"></td><td class="away"><h6>'+
				data.time + 'min. CZERWONA ' + data.playerNum + '. ' + data.playerName +
				'<button type="button" class="close" id="factRm'+(data.id) + 
					'">×</button></h6></td></tr>');
			}
			$('#factRm'+(data.id)).click(function(){ rmFactBtnClick(this); }); 
			if(data.sendOut){
				$('#'+data.playerTeam+data.playerId + ' button').hide();
			}
	});

	socket.on('rmFact', function (data){
		//console.log(data);
		$('#fact'+data.id).remove();
		if(!data.sendOut){
			$('#'+data.playerTeam+data.playerId + ' button').show();
		}
	});

	socket.on('newScore', function (data){
		$('#homeTeamGoals').text(data.home);
		$('#awayTeamGoals').text(data.away);
	});

	socket.on('setTime', function (data){
		//console.log(data);
		$('#time').text(data+'\'');
	});

	socket.on('setHalf', function (data){
		//console.log(data);
		$('#halfName').text(data);
		if(data === 'koniec meczu'){
			$('#timePanel').toggle();
			$('#newGamePanel').toggle();
		}
	});

	socket.on('makeSub', function(data){

		var p1 = $('#'+data.team+(data.p1));
		var p2 = $('#'+data.team+(data.p2));

		// var p1Id = data.team+data.p1;
		// var p2Id = data.team+data.p2;

		$(p1).replaceWith(p2);

		$('#'+data.team+'Subs').append(p1);

		// $('#'+p1Id).attr('id', 'subPlayer');
		// $('#'+p2Id).attr('id', p1Id);
		// $('#subPlayer').attr('id', p2Id);

		if(data.time !== 0){
			$('#'+data.team+data.p2 + ' .playerSubs').append('<i class="icon-arrow-up"></i>'+data.time +' ');
			$('#'+data.team+data.p1 + ' .playerSubs').append('<i class="icon-arrow-down"></i>'+data.time +' ');
		}

		$('#homeSubs button').css({'display': 'none'});
		$('#awaySubs button').css({'display': 'none'});
		$('#homeFirstTeam button').css({'display': 'block'});
		$('#awayFirstTeam button').css({'display': 'block'});
	});

});
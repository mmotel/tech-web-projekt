var myGUI = (function(){
	//funkcja wypełniająca zawodnika danymi
	var drawPlayer = function(data){
		return '<div class="teamMember" id="' + data.id +'">' +
						'<span class="playerNum">' + data.number + '</span>' +
						'<span class="playerName">' + data.name + '</span>' +
						'<span class="countButton"><span class="plus">' + data.plusCount +' </span></span>' +
						'<span class="countButton"><span class="minus">' + data.minusCount + '</span></span>' +
					'</div>';
	};
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

	return {
		drawTeam: function(teamType, data){
			var Team = data.team;
			//wypełnianie nazwy drużyny
			$('.'+ teamType +'Team > .teamName').text(data.name);
			$('.'+ teamType +'Team .subTitle').text(data.name + ': ławka rezerwowych');
			//drukowanie zawodników drużyny
			var FirstTeam = $('#'+ teamType +'FirstTeam');
			$(FirstTeam).children().remove(); //czyszczenie
			for(var i=1; i < 12; i++){
				$(FirstTeam).append(drawPlayer(Team[i]));
			};
			//drukowanie rezrwowych drużyny
			var Substitutions = $('#'+ teamType +'Substitutions');
			$(Substitutions).children().filter('div').remove(); //czyszczenie
			for(var i=12; i < 19; i++){
				$(Substitutions).append(drawPlayer(Team[i]));
			};
			//obsługa klawisza minus
			$('.'+ teamType +'Team span.minus').click(function(){ minusClick(this); });
			//obsługa klawisza plus
			$('.'+ teamType +'Team span.plus').click(function(){ plusClick(this); });
		}
	};

})();
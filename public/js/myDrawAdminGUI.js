var myAdminGUI = (function(){
	//funkcja wypełniająca zawodnika danymi
	var drawPlayer = function(data, team){
		return '<tr id="' + data.id +'">' +
						'<td class="playerNum"><input class="input-block-level" type="text" placeholder="' 
							+ data.number + '"/></td>' +
						'<td class="playerName"><input class="input-block-level" type="text" placeholder="'
						 + data.name + '"/></td>' +
						'<td class="yellow"><button class="btn btn-warning">'+
							'0</button></td>'+
						'<td class="red"><button class="btn btn-danger">'+
							'0</button></td>' +
						'<td class="goal"><button class="btn btn-inverse">'+
							'0</button></td>'+
						'<td class="sub"><button class="btn btn-primary">'+
							'<i class="icon-arrow-down icon-white"></i></button></td>' +
						'<td class="plusCount">'+ data.plusCount +'</td>' +
						'<td class="minusCount">'+ data.minusCount +'</td>' +
					'</tr>';
	};

	var drawSubPlayer = function(data, team){
		return '<tr id="' + data.id +'">' +
						'<td class="playerNum"><input class="input-block-level" type="text" placeholder="' 
							+ data.number + '"/></td>' +
						'<td class="playerName"><input class="input-block-level" type="text" placeholder="'
						 + data.name + '"/></td>' +
						'<td class="yellow"><button class="btn btn-warning">'+
							'0</button></td>'+
						'<td class="red"><button class="btn btn-danger">'+
							'0</button></td>' +
						'<td class="goal"><button class="btn btn-inverse">'+
							'0</button></td>'+
						'<td class="sub"><button class="btn btn-success">'+
							'<i class="icon-arrow-up icon-white"></i></button></td>' +
						'<td class="plusCount">'+ data.plusCount +'</td>' +
						'<td class="minusCount">'+ data.minusCount +'</td>' +
					'</tr>';
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
			$('#teams > #'+teamType).append('<form class="form-inline"><span>'+
				(teamType==='home' ? 'Gospodarze' : 'Goście') +
				': </span><input type="text" class="input-xlarge" id="'+teamType+'Name" placeholder="'
				+data.name+'"></input></form>');
			$('#teams > #'+teamType).append('<table id="'+teamType+'FirstTeam" class="table'+
				' table-striped table-hover table-bordered"></table>');
			$('#teams > #'+teamType).append('<h5 id="'+teamType+'SubsName">ławka rezerwowych</h5>');
			$('#teams > #'+teamType).append('<table id="'+teamType+'Subs" class="table'+
				' table-striped table-hover table-bordered"></table>');

			var firstTeam = $('#'+teamType+'FirstTeam');
			for(var i=1; i<12; i++){
				$(firstTeam).append(drawPlayer(Team[i], teamType));
			}

			var firstTeam = $('#'+teamType+'Subs');
			for(var i=12; i<19; i++){
				$(firstTeam).append(drawSubPlayer(Team[i], teamType));
			}

			//obsługa klawisza minus
			$('#'+ teamType +' .minus button').click(function(){ minusClick(this); });
			//obsługa klawisza plus
			$('#'+ teamType +' .plus button').click(function(){ plusClick(this); });

			$('#'+teamType +' .yellow button').tooltip({trigger: 'hover', title: 'żółta kartka'});
			$('#'+teamType +' .red button').tooltip({trigger: 'hover', title: 'czerwona kartka'});
			$('#'+teamType +' .goal button').tooltip({trigger: 'hover', title: 'gol'});
			$('#'+teamType +' .sub button').tooltip({trigger: 'hover', title: 'zmiana'});
		}
	};


})();
var myGUI = (function(){
	//funkcja wypełniająca zawodnika danymi
	var drawPlayer = function(data, team){
		return '<tr id="' + data.id +'">' +
						'<td class="playerNum">' + (data.number !== '-1' ? data.number : '#') + '</td>' +
						'<td class="playerName">' + data.name + '</td>' +
						'<td class="plus"><button class="btn btn-success">'+
							'<i class="icon-thumbs-up icon-white"></i></button></td>'+
						'<td class="plusCount">' + data.plusCount + '</td>' +
						'<td class="minus"><button class="btn btn-danger">'+
							'<i class="icon-thumbs-down icon-white"></i></button></td>'+
						'<td class="minusCount">' + data.minusCount + '</td>' +
					'</tr>';
	};
	
	return {
		drawTeam: function(teamType, data){
			var Team = data.team;
			$('#teams > #'+teamType).children().remove();
			$('#teams > #'+teamType).append('<h3 id="'+teamType+'Name">'+data.name+'</h3>');
			$('#teams > #'+teamType).append('<table id="'+teamType+'FirstTeam" class="table'+
				' table-striped table-hover table-bordered"></table>');
			$('#teams > #'+teamType).append('<h5 id="'+teamType+'SubsName">'+data.name+': ławka rezerwowych</h5>');
			$('#teams > #'+teamType).append('<table id="'+teamType+'Subs" class="table'+
				' table-striped table-hover table-bordered"></table>');

			var firstTeam = $('#'+teamType+'FirstTeam');
			for(var i=1; i<12; i++){
				$(firstTeam).append(drawPlayer(Team[i], teamType));
			}

			var firstTeam = $('#'+teamType+'Subs');
			for(var i=12; i<19; i++){
				$(firstTeam).append(drawPlayer(Team[i], teamType));
			}

			//formatowanie tekstu w td
			$('td.playerNum').css('text-align','right');
			$('td.plusCount').css('text-align','center');
			$('td.minusCount').css('text-align','center');
			$('td.plus').css('text-align','center');
			$('td.minus').css('text-align','center');

			//legenda
			$('#'+teamType +' .plus button').tooltip({trigger: 'hover', title: 'plus'});
			$('#'+teamType +' .minus button').tooltip({trigger: 'hover', title: 'minus'});
		}
	};

})();
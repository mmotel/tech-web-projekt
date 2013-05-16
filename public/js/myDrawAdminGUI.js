var myAdminGUI = (function(){
	//funkcja wypełniająca zawodnika danymi
	var drawPlayer = function(data, team){
		return '<tr id="' + data.id +'">' +
						'<td class="playerNum"><input class="input-block-level" type="text" placeholder="#" value="' 
							+ (data.number !== '100' ? data.number : '') + '"/></td>' +
						'<td class="playerName"><input class="input-block-level" type="text" placeholder="imię i nazwisko" value="'
						 + (data.name !== 'player name' ? data.name : '') + '"/></td>' +
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
			$('#'+teamType+'TeamMatchDataName').text((teamType==='home' ? 'Gospodarze' : 'Goście'));
			$('#teams > #'+teamType).children().remove();
			$('#teams > #'+teamType).append('<div class="row-fluid">'+
				'<div class="span12"><h4>'+ (teamType==='home' ? 'Gospodarze' : 'Goście') + ': </h4></div></div>');
			$('#teams > #'+teamType).append('<div class="row-fluid">'+
				'<div class="span8"><input type="text" class="input-block-level" id="'+teamType+'Name"'+
					' placeholder="nazwa drużyny"'+
					'value="'+ (data.name !== teamType+' team name' ? data.name : '') +'"/></div>'+
				'<div class="span4 sub"><button class="btn btn-info" id="'+teamType+'Sub"><i class="icon-arrow-down icon-white"></i>'+
					'<i class="icon-arrow-up icon-white"></i></button></div>'+
				'</div>');
			$('#teams > #'+teamType).append('<table id="'+teamType+'FirstTeam" class="table'+
				' table-striped table-hover table-bordered"></table>');
			$('#teams > #'+teamType).append('<h5 id="'+teamType+'SubsName">'+(teamType==='home' ? 'Gospodarze' : 'Goście') +
				': ławka rezerwowych</h5>');
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
			$('td.plusCount').css('text-align','center');
			$('td.minusCount').css('text-align','center');
			$('td.plus').css('text-align','center');
			$('td.minus').css('text-align','center');
			
			//legenda
			$('#'+teamType +' .plus button').tooltip({trigger: 'hover', title: 'plus'});
			$('#'+teamType +' .minus button').tooltip({trigger: 'hover', title: 'minus'});
			$('#'+teamType +' .sub button').tooltip({trigger: 'hover', title: 'zmiana'});
		}
	};

})();
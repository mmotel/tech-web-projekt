module.exports = function(){

	var mongo = require('mongodb');

	var isData = false;
	var time = {};
	var half = {};
	var isBreak = {};
	var isEnd = {};
	var isStoped = {};

	var flushData = function(query, setter){
		var dbf = new mongo.Db('test', new mongo.Server('localhost', 27017), {safe: true});
		dbf.open(function (err) {
			if(err){ console.log(err); } 
			else{
				console.log('MongoDB Connected!');
				var homeTeamData = {}, awayTeamData = {}, factsData = {};
				dbf.collection('livescore', function (err, coll) {
					if(err) { console.log(err); }
					else{
						coll.update(query, {$set: setter}, function (err){
							if(err){
								console.log(err);
							}
						});
						console.log('Flush data to DB');
					}
				});
			}
		});
	};

	return {
		clearIsData: function(){
			isData = false;
		},
		getAllData: function(socket, callback){
			if(!isData){
				var db = new mongo.Db('test', new mongo.Server('localhost', 27017), {safe: true});
				db.open(function (err) {
					if(err){ console.log(err); } 
					else{
						console.log('MongoDB Connected!');
						var timerData= {};
						db.collection('livescore', function (err, coll) {
							if(err) { console.log(err); }
							else{
								coll.find().toArray(function (err, items) {
									if(err) { console.log(err); }
									else {
										if(items.length === 0 || items.length === 3){
											var data = require('./makeData')('time');
											timerData = data.timer;
											coll.insert(timerData, function(err){ if(err) { console.log(err); } });
											console.log('Set timer data in DB');
										}
										else {
											for(var i =0; i < items.length; i++){
												if(items[i].dtype === 'timer'){
													timerData = items[i];
												}
											}
											console.log('Get timer data from DB');
										}
										db.close();
										//uzupełnienie referencji pól z danymi
										time = timerData.time;
										half = timerData.half;
										isBreak = timerData.isBreak;
										isEnd = timerData.isEnd;
										isStoped = timerData.isStoped;
										//ustawienie flagi ściagnięcia danych
										isData = true;
										//wywołanie callBack-u
										callback(socket);
									}
								});
							}
						});
					}
				});
			}
			else{
				//wywołanie callBack-u
				callback(socket);
				console.log('Timer data from memory');
			}
		},
		getCurrentHalf: function() {
			if(half === 0){
				return 'przed rozpoczęciem';
			}else if(isBreak){
				return 'przerwa';
			}else if(isEnd){
				return 'koniec meczu';
			}
			else if(isStoped){
				return 'mecz został przerwany';
			}else if(half === 1){
				return 'pierwsza połowa';
			} else if(half === 2){
				return 'druga połowa';
			}else if(half === 3){
				return 'dogrywka: pierwsza połowa';
			}else if(half === 4){
				return 'dogrywka: druga połowa';
			}else if(half === 5){
				return 'rzuty karne';
			}else {
				return '';
			}
		},
		getCurrentHalfNum: function() {
			return half;
		},
		getIsEnd: function() {
			return isEnd;
		},
		getIsBreak: function() {
			return isBreak;	
		},
		getIsStopped: function() {
			return isStoped;
		},
		startHalf: function(){
			if((isBreak || half === 0) && !isStoped){
				half += 1;
				if(half === 1){
					time = 1;
				} else if(half === 2){
					time = 45;
				}else if(half === 3){
					time = 90;
				}else if(half === 4){
					time = 105;
				}else if(half === 5){
					time = 120;
				}
				isBreak = false;
				if(half < 6){
					flushData({'dtype': 'timer'}, {'half': half});
					flushData({'dtype': 'timer'}, {'time': time});
					return true;
				}else{
					return false;
				}
				
			}else if(isStoped){
				isStoped = false;
				flushData({'dtype': 'timer'}, {'isStoped': isStoped});
				return true;
			}
			else {
				return false;
			}
		},
		endHalf: function(){
			if(!isEnd && !isBreak){
				isBreak = true;
				flushData({'dtype': 'timer'}, {'isBreak': isBreak});
				return true;
			} else {
				return false;
			}
		},
		getCurrentTime: function(){
			return time;
		},
		stopHalf: function(){
			if(!isStoped && !isBreak && !isEnd){
				isStoped = true;
				flushData({'dtype': 'timer'}, {'isStoped': isStoped});
				return true;
			}
			else{
				return false;
			}
		},
		endGame: function(){
			if(!isEnd && half > 0){
				isBreak = false;
				isStoped = false;
				isEnd = true;
				flushData({'dtype': 'timer'}, {'isBreak': isBreak});
				flushData({'dtype': 'timer'}, {'isStoped': isStoped});
				flushData({'dtype': 'timer'}, {'isEnd': isEnd});
				return true;
			}
			else {
				return false;
			}
		},
		incTime: function() { 
			time += 1; 
			flushData({'dtype': 'timer'}, {'time': time});
		}
	};
};
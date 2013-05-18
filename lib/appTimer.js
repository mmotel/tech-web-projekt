module.exports = function(){

			var time = 0;
			var half = 0;
			var isBreak = false;
			var isEnd = false;

			return {
				getCurrentHalf: function() {
					if(half === 0){
						return 'przed rozpoczęciem';
					}else if(isBreak){
						return 'przerwa';
					}else if(isEnd){
						return 'koniec meczu';
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
				startHalf: function(){
					if(isBreak || half === 0){
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
							return true;
						}else{
							return false;
						}

						
					}else{
						return false;
					}
				},
				endHalf: function(){
					if(!isBreak){
						isBreak = true;
						return true;
					} else {
						return false;
					}
				},
				getCurrentTime: function(){
					return time;
				},
				stopHalf: function(){
					clearInterval(timeInterval);
					isBreak = true;
				},
				endGame: function(){
					if(!isEnd){
						clearInterval(timeInterval);
						isBreak = false;
						isEnd = true;
					}
				},
				incTime: function() { time += 1; }
			}
};
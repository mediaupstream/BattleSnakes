/** ---------------------------------------------------------------------------------------------------------
 *	Game Object
 */

battleSnake.Game = function(limit){
	
	this.player = []; // holds both players
	
	this.powerups = null;
	
	this.t = new Tool();
	this.hasStarted = false;
	this.gameOver = false;

	this.hitOptions = {
		segments: true,
		stroke: true,
		fill: true,
		tolerance: 5,
	};
	
	this.time = 100;
	this.timeCard = null;
	
	this.bounds = [700, 520]; // see the css rule for #snakegame
	this.loop = 0; // just a loop counter for FPS limiting
	this.limit = (limit) ? limit : 8; // to slow the game down make this higher
	
	this.el = $('#snakeskin');
	this.bgcolor = '#74ACC4';
	
	this.countdownEl = null;
	
	this.pulsate = function(color, time){
		var s = this;
		s.el.css('background-color', color);
		setTimeout(function(){
			s.el.css('background-color', '');
		}, time);
	};
	
	this.endGame = function(winner, message){
		battleSnake.sounds.bgm.on = false;
		battleSnake.sounds.play('gameOver');
		this.gameOver = true;
		
		// show 'REMATCH' | 'START SCREEN' buttons
		$('.gameOverMsg').text(winner + ' won the match! ... '+message)
		$('#gameOver').slideDown();
		// show twitter results share button (optionally)
		
	};
	
	this.countDown = function(timelimit){
		var self = this;
		var t = this.countdownEl;
		var counter = 0;
		var timer = setInterval(function(){
			
			if(self.gameOver){ clearInterval(timer); }
			
			t.text(secondsToTime(timelimit));
			
			if(timelimit < 10){
				battleSnake.sounds.play('beep');
			}
			
			// reset powerup counter
			if(counter == 4){
				// set random powerups every 10 seconds 1 0f 3 chances
				if(rand(0,1) == 1){
					if(self.player[0].id === now.core.clientId){
						self.powerups.add();
					}
				}
				counter = 0; 
			}
			
			// game over
			if(timelimit == 0){
				clearInterval(timer);
				// determine who has the most points
				var ps1 = self.player[0].score, ps2 = self.player[1].score;
				// check for DRAW... @@todo
				var msg = ' by having the highest score!';
				var winner = (ps1 > ps2) ? self.player[0].name : self.player[1].name;
				
				if(ps1 == ps2){
					winner = "Nobody";
					msg = " You each had " + ps1 +" points!";
				}				
				
				now.gameOver(winner, msg);
				return false;
			}
			timelimit--;
			counter++;
		} , 1000);
		
	};
	
	this.tick = function(){
		var self = this;
		
		// onFrame - Game Tick function
		view.onFrame = function(event){
			
			if(!snake && self.hasStarted){
				var snake = now.core.clientId;
				snake = (self.player[0].id === snake) ? self.player[0] : self.player[1];
			}
			
			if(!self.gameOver && self.hasStarted){
				self.loop++;
				if(self.loop >= self.limit){
					snake.move();
					self.loop = 0;
				}
			}
		};
		
	};
	
	this.keymap = function(){
		
		var snake = now.core.clientId;
		snake = (this.player[0].id === snake) ? this.player[0] : this.player[1];
		
		this.t.onKeyDown = function(event) {
			switch(event.key){
				case 'up'		: if(snake.dir() != 'down') snake.dir('up'); break;
				case 'down'	: if(snake.dir() != 'up') snake.dir('down'); break;
				case 'right': if(snake.dir() != 'left') snake.dir('right'); break;
				case 'left'	: if(snake.dir() != 'right') snake.dir('left'); break;
				case 'space': snake.dir('none'); break;
				case 'g': snake.grow(3); break;
				case 's': snake.shrink(3); break;
				
				case 'n': console.log(localStorage.getItem('name') ); break;
				case 'm': localStorage.setItem('name', 'Derek Anderson'); break;
			}
		};
	};
	
	// NowJS game methods		
	this.now = function(){
		var self = this;
		return {
			
			gameOver: function(user, message){
				self.endGame(user, message);
			},
			
			setPlayer: function(name, player){
				if(player == 'player1'){
					console.log('player1: '+ name +' | now.player1: '+ now.player1.name);
					// blue
					$('#chooseBlue a').text(name+' is ready!').parent().addClass('disable');
				} else {
					// red
					console.log('player2: '+ name +' | now.player2: '+ now.player2.name);
					$('#chooseRed a').text(name+' is ready!').parent().addClass('disable');
				}
				
				if(now.player1 && now.player2){
					// START THE MATCH
					now.createSnakes(now.player1, now.player2);
				}
				
			},
			
			playerLeft: function(player){
					// @@todo gameover with Player Left message
					now.gameOver('You', 'Your Foe Ran Away!');
			},
			
			playerEaten: function(id){
				// @@todo gameover - Player was Eaten!
				// console.log(self.player[id].name + ' was eaten');
			},
			
			updateScore: function(id, score){
				self.player[id].scoreCard[id].text(score);
			},
			
			snakeDir: function(id, dir){
				var p = self.player[id];
				p.prevDir = p._dir;
				p._dir = dir;
			},
			
			colorAll: function(id, color, tail){
				self.player[id].colorAll(color, tail);
			},
			
			setGameLoop: function(limit){
				self.loop = limit;
			},
			
			wantRematch: function(rematch){
				if(rematch){
					$('.rematchMsg').slideDown();
				} else {
					// decline rematch
					$('.rematchMsg').slideUp();
					window.location.href = '/';
				}
			},
			
			startRematch: function(uuid){
				window.location.href = '/'+uuid;
			},
			
			createSnakes: function(player1, player2){
				console.log(player1.name +' vs '+ player2.name);
				self.player = [];
				self.player.push ( new battleSnake.Snake( player1 ) );
				self.player.push ( new battleSnake.Snake( player2 ) );
				
				battleSnake.startGame();
			},
			
			growSnake: function(id, i){
				self.player[id].add(i);
			},
			
 			shrinkSnake: function(id, i){
				// self.player[id].del(i);
				self.player[id]._shrink(i);
			},
			
			moveSnake: function(id, x, y){
				self.player[id].moveSnake(x, y);
			},
			
		};
	};
	
	now.game = this.now();
	
	
};
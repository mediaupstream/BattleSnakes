/** ---------------------------------------------------------------------------------------------------------
 *	Snake Object  'v'
 */
battleSnake.Snake = function(user){
	this.user			= user;
	this.id				= user.clientId;
	this.name			= user.name;
	this.player		= user.player;
	this.index		= null;
	
	this.shield = false;
	this.ghost  = false;
	
	this.opponent = null;
	
	this.score		= 1000;
	this.scoreCard = [];
	
	this.size 		= 20;
	this.color 		= (this.player === 'player1') ? '#2bace0' : '#e02b2e';
	this.tailColor = (this.player === 'player1') ? '#ffd025' : '#77e02b';
	this._dir  		= 'none';
	this.prevDir 	= 'none';
	this.cache = []; // position cache for 'parts'
	this.part 	= []; // holds the snake parts
	this.initialized = false;
	
	this.game = battleSnake.game;
	
	this.init = function(){
		var self = this;
		var pos = (this.player === 'player1') ? new Point(90, 370) : new Point(610, 370);
		this.index = (this.player === 'player1') ? 0 : 1;
		
		this.score = 1000;
		this.scoreCard[0] = $('#blue .score');
		this.scoreCard[1] = $('#red .score');
		
		// set the playerName 
		var name = this.name;
		if(!this.index){
			$('#blue .name').text(name); // player 1 name
			this.opponent = 1;
		} else {
			$('#red .name').text(name); // player 2 name
			this.opponent = 0;
		}
		
		// create the snake head
		this.part[0] = new Path.Rectangle(pos, this.size);
		this.head = this.part[0];
		this.head.fillColor = 'black';
		this.grow(13, true);
		
		this.startPosition();
		
		this.initialized = true;
		
	};
	
	this.startPosition = function(){
		var len = this.part.length;
		for(var i=0; i<this.part.length; i++){
			this.dir('up');
			this.move();
		}
		this.dir('none');
	}
	
	// get or set the current snake movement direction
	this.dir 	= function(d){
		now.snakeDir(this.index, d);
		this._setDir(d);
	};
	this._setDir = function(d){
		var t = this;
		if(!d){ return t._dir; }
		t.prevDir = t._dir;
		t._dir = d;
	
		if(t.prevDir !== t._dir){
			now.updateGameLoop( this.game.limit );
			// this.game.loop = this.game.limit;  // speed things up
		}
	};

	// Snake methods
	this.tail 		= function(){ return this.part[this.part.length-1]; };
	this.width 		= function(i){ return this.part[i].bounds.width; };
	this.height 	= function(i){ return this.part[i].bounds.height; };
	this.position = function(i, position){
		if(!position){ return this.part[i].position; }
		this.part[i].position = position;
	};
	this.x = function(i, x){
		if(this.part[i]){
			if(!x){ return this.part[i].position.x; }
			this.part[i].position.x = x;
		}
	};
	this.y = function(i, y){
		if(this.part[i]){
			if(!y){ return this.part[i].position.y; }
			this.part[i].position.y = y;
		}
	};
	this.moveX = function(right, i){
		var t = this, s = t.size;
		i = (i) ? i : 0;
		return (right) ? (t.x(i) + s) : (t.x(i) - s);
	};
	this.moveY = function(up, i){
		var t = this, s = t.size;
		i = (i) ? i : 0;
		return (up) ? (t.y(i) - s) : (t.y(i) + s);
	};
	
	this.move = function(){
		var x = this.x(0), y = this.y(0), cx = x, cy = y;
		switch(this._dir){
			case 'up'	 	: y = this.moveY(true); break;
			case 'down'	: y = this.moveY(false); break;
			case 'right': x = this.moveX(true); break;
			case 'left'	: x = this.moveX(false); break;
		}
		
		if(!(x == cx && y == cy)){
			if(this.hitTest(x, y)){
				now.moveSnake(this.index, x, y);
				this.moveSnake(x, y);
			}
		}
	};
	
	this.moveSnake = function(x, y){
		// cache the head!
		this.cache[0] = this.head.position;
		// move the head!
		this.x(0, x);
		this.y(0, y);
	
		// move the body!
		for(var i=1,l=this.cache.length; i<=l; i++){
			if(this.part[i]){
				this.cache[i] = this.position(i);
				this.position(i, this.cache[i-1]);
			}
		}
	};
	

	this.del = function(i){
		if(this.part[i]){
			this.part[i].remove();
			this.part.remove(i);
		}
	};
	
	this.add = function(amount){
		for(var i=0; i<amount; i++){
			var tail = this.part[this.part.length-1];
			tail.fillColor = this.color;
			var newBit = tail.clone();
			newBit.opacity = 0.85;
			this.part.push( newBit );
		}
		
		// set head colors
		// this.tail().fillColor = this.tailColor;
		this.head.fillColor = 'black';
		
		this.head.moveAbove(this.part[1]);
		this.blink('#ffd025');
	};
	

	this.grow = function(amount, init){
		amount = (amount) ? amount : 1;
		if(!init){
			battleSnake.sounds.play('grow');
			this.game.pulsate('#e6abd4', 100); // celebrate
			this.animateBg();
			now.growSnake(this.index, amount);
			// give points
			this.score += 250;
			now.updateScore(this.index, this.score);
		} 
		this.add(amount);
	};
	
	
	this.shrink = function(amount){
		battleSnake.sounds.play('shrink');
		this.game.pulsate('#333', 100);
		amount = (!amount) ? 1 : amount;
		
		now.shrinkSnake(this.index, amount);
		this._shrink(amount);
		
		if(this.part.length <= 0){
			console.log('I was eaten!!!');
			// now.playerEaten(this.index);
			var loser = battleSnake.game.player[this.index].name;
			var winner = (this.index) ? battleSnake.game.player[0].name : battleSnake.game.player[1].name;
			
			now.gameOver(winner, loser +' was eaten!');
			return;
		}
		
		this.score -= 250;
		this.score = (this.score <= 0) ? 0 : this.score;
		
		now.updateScore(this.index, this.score);
		
		this.animateBg();
		
	};
	
	
	this._shrink = function(amount){
		var t = 0;
		for(var i=0; i<amount; i++){
			t = this.part.length;
			if(t > 0){ this.del(t-1); }
		}
		
		// this.tail().fillColor = this.tailColor;
		this.blink('#777');
	};
	
	

	this.animateBg = function(){
		var b = Math.floor(this.part.length * 25);
		// if(b <= 1875){
			$('body').css('background-position', '0 '+b+'px');
		// }
	};
	
	
	this.startShield = function(time){
		battleSnake.sounds.play('item');
		var self = this;
		this.shield = true;
		now.colorAll(this.index, '#444');
		this.colorAll('#444');
		setTimeout(function(){
			battleSnake.sounds.play('item');
			self.shield = false;
			now.colorAll(self.index, self.color, true);
			self.colorAll(self.color, true);
		}, time * 1000);
	};
	
	this.startGhost = function(time){
		battleSnake.sounds.play('item');
		var self = this;
		this.shield = true;
		now.colorAll(this.index, '#fff');
		this.colorAll('#ccc');
		setTimeout(function(){
			battleSnake.sounds.play('item');
			self.shield = false;
			now.colorAll(self.index, self.color, true);
			self.colorAll(self.color, true);
		}, time * 1000);
	};

	
	this.switcheroo = function(op){
		var a = op.part.length;
		var b = this.part.length;
		if(a > b){
			this.blink('#fff');
			// shrink opponent - grow me
			op.shrink(Math.floor(a-b));
			this.grow(Math.floor(a-b));
		} else if(a < b) {
			this.blink('#fff');
			op.grow(Math.floor(b-a));
			this.shrink(Math.floor(b-a));
		}
	};
	

	this.rotate = function(i, deg){
		var s = this.part[i], x = this.x(i), y = this.y(i);
		s.transform( new Matrix.getRotateInstance(deg, x, y) );
	};
	
	this.powerup = function(power, op){
		switch(power){
			case 'icon-deadly': break;
			case 'icon-switch': this.switcheroo(op); break;
			case 'icon-heart': this.grow(3); break;
			case 'icon-zap': this.grow(1); op.shrink(1); break;
			case 'icon-shield': this.startShield(10); break;
			case 'icon-ghost': this.startGhost(10); break;
		}
	};
	
	this.hitTest = function(x, y){
		var op = battleSnake.game.player[this.opponent];
		var up = battleSnake.game.powerups;
		
		// loop through all mice and hitTest the current snake head x,y
		var p = new Point(x, y);
		
		/*
		// check if we hit a mice 
		for(var i=0,l=mice.part.length; i<l; i++){
			if(mice.part[i].hitTest(p, this.game.hitOptions)){
				// hit!
				// now.delMice(i);
				// mice.add(1);
				this.grow(3);
				return true;
			}
		} */
		
		// check if we ate opponent tail!
		if(op.part[op.part.length-1]){
			if(op.tail().hitTest(p, this.game.hitOptions)){
				if(!op.shield){
					// hit!
					op.shrink(3);
					this.grow(3);
					return true;
				}
				return false;
			}
		}
		
		// check if we ate POWERUPS!!!!
		for(var i=0; i<up.part.length; i++){
			var ux = up.part[i]._position._x, uy = up.part[i]._position._y;
			if(ux == x && uy == y){
				// we hit a power up, check what type it is and issue a powerup effect!
				now.removePowerup(i);
				this.powerup(up.part[i]._image.id, op);
				return true;
			}
		}
		
		// check if we collide with opponents!
		// if(op.part[0]){
		// 	if(op.part[0].hitTest(p, this.game.hitOptions)){
		// 		// this.shrink(3);
		// 		return false;
		// 	}
		// }
		for(var i=1,l=op.part.length; i<l; i++){
			// loop through all of our snake parts
			if(op.part[i].hitTest(p, this.game.hitOptions)){
				this.dir('none');
				return false;
			}
		}
		
		
	
		// check if we hit a wall
		if((x < (this.size) || x > (this.game.bounds[0] - this.size)) || 
			 (y < (this.size) || y > (this.game.bounds[1] - this.size)) ){
			// we are out of the playing area
			this.dir('none');
			if(!this.shield){
				this.shrink(3);
			}
			return false;
		}
		
		
		// check if we hit ourselves

		for(var i=1,l=this.part.length; i<l; i++){
			// loop through all of our snake parts
			if(this.part[i].hitTest(p, this.game.hitOptions)){
				this.dir('none');
				return false;
			}
		}
		
		
		return true;
	};

	this.colorize = function(i){
		var h = i / this.part.length;
		this.part[i].fillColor.saturation -= h;
	};
	
	this.colorAll = function(color, tail){
		for(var i=1; i<this.part.length; i++){
			this.part[i].fillColor = color;
		}
		if(tail){
			this.tail().fillColor = this.tailColor;
		}
	};
	
	this.setColor = function(i, color){
		if(this.part[i]){
			this.part[i].fillColor = color;
		}
	};

	this.blink = function(color, delay){
		delay = (delay) ? delay : 150;
		var t = this;
		var l = t.part.length;
		if(l > 2){
			for(var i=1; i<l; i++){
				t.setColor(i, color);
			}

			setTimeout(function(){
				for(var i=1; i<l; i++){
					t.setColor(i, t.color);
				}
				t.tail().fillColor = t.tailColor;
			}, delay);
		}
	};
	
};
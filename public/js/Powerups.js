/** ---------------------------------------------------------------------------------------------------------
 *	Powerups, NICE!
 */
battleSnake.Powerups = function(){
	this.part = [];
	this.size = 20;	
	this.list = [
		// 'icon-deadly',
		'icon-switch',
		'icon-heart',
		'icon-zap',
		'icon-shield',
		'icon-ghost'
	];

	this.last = function(){ return this.part[this.part.length-1]; };
	
	this.add = function(powerup, pos){
		var f = Math.floor;
		var r = rand;
		
		if(!powerup){
			powerup = f(r(0, this.list.length-1));
		}
		
		var x = f(r(1,34) * 20), 
				y = f(r(1,24) * 20);
				
		if(this.hitTest(x, y)){
			return this.add(powerup, pos);
		} else {
			// add powerup at x, y
			now.addPowerup(powerup, x, y);
			// this.create(powerup, x, y);
		}
	};
	
	this.create = function(powerup, x, y){
		var p = new Raster( this.list[powerup] );
		p.position = new Point(x, y);
		this.part.push( p );
		
		// console.log(p._image.id); // icon-heart
	};
	
	this.hitTest = function(x, y){
		/*
		var p1 = this.game.player1;
		var p2 = this.game.player2;
		if(p1){
			for(var i=0,l=p1.part.length; i<l; i++){
				if(p1.part[i].hitTest(new Point(x,y))){
					return true;
				}
			}
		}
		if(p2){
			for(var i=0,l=p2.part.length; i<l; i++){
				if(p2.part[i].hitTest(new Point(x,y))){
					return true;
				}
			}
		}
		*/
		// don't place me on a snake part... meh who carez
		return false;
	};

	this.del = function(i){
		this.part[i].remove();
		this.part.remove(i);
	};

	// NowJS mice methods		
	this.now = function(){
		var self = this;
		return {
			addPowerup: function(powerup, x, y){
				self.create(powerup, x, y);
			},
 			removePowerup: function(i){
				self.del(i);
			}
		};
	};
	now.powerup = this.now();
	
};

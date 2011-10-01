/** ---------------------------------------------------------------------------------------------------------
 *	Sound Object, depends on soundManager (http://schillmania.com/projects/soundmanager2/)
 */
battleSnake.Sound = function(soundManager){
	this.grow = null;
	this.shrink = null;
	this.on = true;
	
	this.bgm = {};
	this.bgm.current = 1;
	this.bgm.on = false; // @@todo change this to true
	
	this.bgm.pause = function(){
		this.on = false;
		soundManager.pause('bgm'+this.current);
	};
	this.bgm.resume = function(){
		this.on = true;
		soundManager.resume('bgm'+this.current);
	};
	this.bgm.play = function(i){
		this.current = i;
		soundManager.play('bgm'+this.current);
	};
	this.bgm.start = function(){
		if(this.on){
			this.current = rand(0,3);
			this.play(this.current);
		}
	};
	this.bgm.toggle = function(){
		if(this.on){
			this.on = false;
			this.pause();
		} else {
			this.on = true;
			this.resume();
		}
	};
	
	this.play = function(key){
		if(this.on && typeof this[key].play === 'function'){
			this[key].play();
		}
	};

	this.init = function(){
		var self = this;
		this.grow   = soundManager.createSound({id: 'grow', multiShot: true, url: 'sfx/grow2.mp3', volume:100});
		this.shrink = soundManager.createSound({id: 'shrink', multiShot: true, url: 'sfx/shrink.mp3', volume:80});
		this.sword  = soundManager.createSound({id: 'sword', multiShot: true, url: 'sfx/sword.mp3', volume:60});
		this.beep   = soundManager.createSound({id: 'beep', multiShot: true, url: 'sfx/beep.mp3', volume:40});
		this.hover	= soundManager.createSound({id: 'hover', multiShot: true, url: 'sfx/button2.mp3', volume:50});
		this.item		= soundManager.createSound({id: 'item', multiShot: true, url: 'sfx/grow1.mp3', volume:100});
		this.click  = soundManager.createSound({id: 'ui.click', multiShot: true, url: 'sfx/click.mp3', volume:60});
		
		this.gameOver  = soundManager.createSound({id: 'gameOver', multiShot: true, url: 'sfx/game over.mp3', volume:100});
		
		soundManager.createSound({id: 'bgm1', url: 'sfx/bgm/zelda3.mp3', volume:95, onfinish: self.bgm.start});
		soundManager.createSound({id: 'bgm2', url: 'sfx/bgm/dissolve.mp3', volume:95, onfinish: self.bgm.start});
		soundManager.createSound({id: 'bgm3', url: 'sfx/bgm/zelda2.mp3', volume:95, onfinish: self.bgm.start});
	};
	
};
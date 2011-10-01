now.titleScreen = function(show){
	battleSnake.ui.titleScreen(show);
};

now.choosePlayer = function(){
	battleSnake.ui.choosePlayer(true);
};

now.updateSnakesCount = function(c){
	var txt = (c == 1) ? c + ' Snake online' : c + ' Snakes online';
	$('#snakesOnline').text(txt);
};

battleSnake.controls = function(){
	
	$('a').not('.external').click(function(e){
		e.preventDefault();
	});
	
	// $('a.disable, .disable a').click(function(){
	// 	return false;
	// });
	
	$('#extras a, #startScreen a, #chooseRed, #chooseBlue').jrumble({
		rumbleEvent:'hover',
		rumbleSpeed: 200
	});
	$('#gameOver h2').jrumble({ rumbleEvent: 'constant', rumbleSpeed: 200});
	
	// gameOver buttons
	$('#rematch').click(function(){
		// check if player wants to rematch...
		now.wantRematch(true);
	});
	
	$('#declineRematch').click(function(){
		// $('#rematchMsg').slideUp();
		now.wantRematch(false);
	});
	
	$('#quitMatch').click(function(){
		window.location.href = '/';
		return false;
	});
	
	$('#acceptRematch').click(function(){
		now.startRematch();
		// window.location.href = '/'+uuid;
	});
	
	
	$('#chooseRed').click(function(){
		if(!$(this).hasClass('disable')){
			now.setPlayer('player2');
			$('#chooseBlue a').text('Waiting for other player');
			$('#chooseRed, #chooseBlue').addClass('disable');
		}
	});
		
	$('#chooseBlue').click(function(){
		if(!$(this).hasClass('disable')){
			now.setPlayer('player1');
			$('#chooseRed a').text('Waiting for other player');
			$('#chooseRed, #chooseBlue').addClass('disable');
		}
	});
	
	
	$('#musicToggle').click(function(){
		if(battleSnake.sounds.on){
			
			localStorage.setItem('sound', 'off');
			
			battleSnake.sounds.on = false;
			battleSnake.sounds.bgm.on = false;
			battleSnake.sounds.bgm.pause();
			$(this).text('sound: off');
		} else {
			
			localStorage.setItem('sound', 'on');
			
			battleSnake.sounds.on = true;
			battleSnake.sounds.bgm.on = true;
			battleSnake.sounds.bgm.resume(); 
			$(this).text('sound: on');
		}
	});
	
	$('#quickPlay').click(function(){
		if( !$('#play-msg').is(':visible') ){
			now.findMatch();
			$('.msg').slideUp();
			$('#play-msg').slideDown();
		}
	});
	
	$('#challengeFriend').click(function(){
		$('.msg').slideUp();
		// generate new UUID link for match
		var id = uuid(10);
		var link = '<a class="shareLink" href="'+id+'">http://battlesnakes.mediaupstream.com/'+id+'</a>';
		var msg = 'Share the link above to have a private battle with your friend!';
		$('#challenge-msg').html(link+'<br><br>'+msg).slideDown();;
	});
	
	
	$('.btn').click(function(){
		if(!$(this).parent().hasClass('disable')){
			battleSnake.sounds.play('click');
		}
	}).mouseover(function(){
		if(!$(this).parent().hasClass('disable')){
			battleSnake.sounds.play('hover');
		}
	});
	
	/*
	var ctrl = function(action){
		switch(action){
			case 'ready': {
				now.findMatch();
			} break;
		}
	};
	*/
};

battleSnake.ui = {};

battleSnake.ui.choosePlayer = function(show){
	if(show){
		$('#chooseRed a').text('Red Snake').parent().removeClass('disable');
		$('#chooseBlue a').text('Blue Snake').parent().removeClass('disable');
		
		if(now.player1){
			// blue
			$('#chooseBlue a').text(now.player1.name+' is ready!').parent().addClass('disable');
		}
		if(now.player2){
			// red
			$('#chooseRed a').text(now.player2.name+' is ready!').parent().addClass('disable');
		}
		
		
		$('#choosePlayer').fadeIn();
	} else {
		$('#choosePlayer').fadeOut();
	}
};

battleSnake.ui.titleScreen = function(show){
	var logo = $('#logo');
	var startScreen = $('#startScreen');
	var ctrl = $('#ctrl');
	
	if(show){
		
		startScreen.slideDown('fast');
		ctrl.css('opacity', 0.0);
		// play sound
		setTimeout(function(){
			battleSnake.sounds.play('sword');
		}, 1200);
		
		logo.css('top', '-180px');
		// drop in the logo
		logo.delay(1600).animate({'top': '40px'}, 2000, 'easeOutElastic', function(){
			// fadeIn the menu buttons
			$('#startOptions').fadeIn();
		});
	} else {
		// hide the screen
		startScreen.slideUp();
		ctrl.css('opacity', 1.0);
		$('#startOptions').fadeOut();
		$('.msg').hide();
	}

};



battleSnake.initSound = function(){
	// Setup the sound
	soundManager.url = 'js/swf';
	battleSnake.sounds = new battleSnake.Sound(soundManager);
	soundManager.onready(function() {
		battleSnake.sounds.init();
		battleSnake.sounds.bgm.start();
	});
};


battleSnake.init = function(){
	
	// Setup the UI controls
	battleSnake.controls();
	
	// toggle the sound based on preferences
	if(localStorage.getItem('sound') == 'off'){
		$('#musicToggle').trigger('click');
	}
	
	battleSnake.game = new battleSnake.Game();
	battleSnake.game.countdownEl = $('#timer');
	// the game tick
	battleSnake.game.tick();

};

battleSnake.resetGame = function(){
	// reset the game stuffs
	battleSnake.game = new battleSnake.Game();
	battleSnake.game.countdownEl = $('#timer');
	battleSnake.game.tick();
};

battleSnake.startGame = function(){
	$('#gameOver').slideUp();
	// hide the screen
	battleSnake.ui.titleScreen(false);
	battleSnake.ui.choosePlayer(false);
	
	// @@todo - COUNT DOWN 3,2,1 here...
	
	console.log('game is starting');
	
	battleSnake.sounds.bgm.on = true;
	
	battleSnake.game.powerups = new battleSnake.Powerups();
	
	battleSnake.game.player[0].init();
	battleSnake.game.player[1].init();
	
	
	battleSnake.game.hasStarted = true;
	
	// the keyboard controls map
	battleSnake.game.keymap();
	
	battleSnake.game.countDown(180);
	
};




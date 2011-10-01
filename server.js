/**
 *	BattleSnake - A Multiplayer Snake game built with NowJS
 *	Created by Derek Anderson <derek@mediaupstream.com>
 *
 *	MIT License, code on github: http://github.com/mediaupstream/battlesnake
 */

var Connect = require('connect'),
		fs			= require('fs'),
		Quip 		= require('quip'),
		nowjs 	= require('now'),
		log			= require('eyes').inspector({ maxLength: null }),
		utils		= Connect.utils,
		webroot	= __dirname + '/public/',
		names 	= require('./mortalKombatNames'), // this is important!
		port		= process.env.PORT || 3000;
		

var render = function(fileName, res){
	if(!fileName) res.ok('missing file');
	fs.readFile(webroot + fileName, 'utf8', function(e, html){
		if(e) res.ok('error reading file: '+ fileName);
		res.ok( html );
	});
};

var http = Connect.createServer(
	Connect.query(),
	Connect.bodyParser(),
	Connect.cookieParser(),
	Connect.session({ secret: '123454321asdfgfdsa!@#' }),
	Connect.favicon(),
	Quip(),
	Connect.router(function(app){
		
		app.get('/', function(req, res, next){
			res.headers({'Set-Cookie': 'group=null'});
			render('index.html', res);
		});
		
		
		app.get('/:group', function(req, res, next){
			var cookie = utils.serializeCookie('group', req.params.group);
			res.headers({'Set-Cookie': cookie });
			render('index.html', res);
		});
		
	}),
	
	Connect.static(webroot),
	
	// default route for "Page Not Found"
	function (req, res, next){
		res.notFound('Page not found.');
	},
	Connect.errorHandler({ dumpExceptions: true, showStack: true })
);

http.listen(port);

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

/**
 *	NowJS Code Stuffz
 */

if (process.env.PORT) {
	// Production
	var everyone = nowjs.initialize(http, {'port': 80, 'socketio':{
		"transports": ["xhr-polling"],
		"polling duration": 10,
		"log level": 0
	}});
} else {
	// Development
	
	log('========================================');
	log('=            Battle Snakes             =');
	log('=      by Derek Anderson (C) 2011      =');
	log('========================================');
	var everyone = nowjs.initialize(http, {"log level": 1});
}


var snakesOnline = 0;
var battle = {};

battle.groups = []; // queue of groups with only 1 user

battle.getUserList = function(group){
	group = (group) ? group : 'everyone';
	if(!group.gropuName){
		group = nowjs.getGroup(group);
	}
	var list = null;
	group.getUsers(function(users){
		list = users;
	});
	return list;
};

battle.getUsers = function(group){
	group = (group) ? group : 'everyone';
	group = nowjs.getGroup(group);
	var list = [];
	group.getUsers(function(users){
		if(users){
			for(var i = 0; i < users.length; i++){
				nowjs.getClient(users[i], function(){
					list.push(this.user);
				});
			}
		}
	});
	return list;
};

battle.clearGroupQueue = function(group){
	for(var i=0; i < battle.groups.length; i++){
		if(battle.groups[i] === group){
			battle.groups.remove(i);
		}
	}
};

battle.createGroup = function(group, privateGroup){
	if(!privateGroup){
		battle.groups.push(group);
	}
	return nowjs.getGroup(group);
};

battle.groupCount = function(group){
	var c = 0;
	nowjs.getGroup(group).count(function(count){
		c = count;
	});
	return c;
};

battle.joinGroup = function(group, user){
	nowjs.getGroup(group).addUser(user);
};

battle.findMatch = function(user){
	if(battle.groups.length > 0){
		// join the first group
		if(user.clientId){
			battle.joinGroup(battle.groups[0], user.clientId);
			// slide up both screens to reveal "Choose Player" screen
			nowjs.getGroup(user.group).now.titleScreen(false);
		}
	} else {
		// start a new group
		if(user.clientId){
			battle.startGroup(user);
		}
	}
};

/**
 *	usage: battle.choosePlayer('player1', 'groupNameHere');
 */
battle.choosePlayer = function(user, player, group){
	var group = nowjs.getGroup(group);
	user.player = player;
	group.now[player] = user;
	
	// log('setPlayer for user '+user.name, player);
	// update everyones ui
	group.now.game.setPlayer(user.name, player); // player.name, 'player1';
	
};


battle.startGroup = function(user, name){
	var privateGroup = (name) ? true : false;
	var groupId = (name) ? name : utils.uid(25);
	var group = battle.createGroup(groupId, privateGroup);
	group.now.groupName = group.groupName;
	group.now.player1 = null;
	group.now.player2 = null;
	
	group.on('join', function(){
		this.user.group = group.groupName;
		var users = battle.getUsers(this.user.group);
		
		// log('users in this group', users.length);
		if(users.length == 2 && !name){
			battle.clearGroupQueue(group.groupName);
		}
		
		// display Choose Player / Ready Up screen
		this.now.choosePlayer();
		
	});
	
	group.on('leave', function(){
		log('user leaving group!');
		this.user.group = null;
		// remove the active players
		if(group.now[this.user.player]){
			var winner = (this.user.player == 'player1') ? group.now[this.user.player] : group.now['player2'];
			group.now[this.user.player] = null;
			// @@todo - maybe auto win match for other player ?
			group.now.game.playerLeft(this.user.player);
			group.now.game.gameOver(winner, this.user.name +' ran away!');
		}
		
	});
	
	// Join the group we just created
	if(user.clientId){
		battle.joinGroup(group.groupName, user.clientId);
	}
	
};

battle.init = function(){
	
	nowjs.on('connect', function(){
		
		snakesOnline++;
		everyone.now.updateSnakesCount(snakesOnline);
		
		this.user.name = names.generate();
		this.user.group = (this.user.cookie.group) ? this.user.cookie.group : null;
		
		if(this.user.group != 'null' && this.user.clientId){
			
			// log('Challenging a friend');
			if(battle.groupCount(this.user.group) > 0){
				// log('joining the group');
				battle.joinGroup(this.user.group, this.user.clientId);
			} else {
				// log('creating the private group');
				battle.startGroup(this.user, this.user.group);
			}
			
		} else {
			
			// show the startScreen
			this.now.titleScreen(true);
			
			// auto start match, for testing purposes...
			// var user = this.user;
			// setTimeout(function(){
				// battle.findMatch(user);
			// }, 2500);
		}
	});
	
	nowjs.on('disconnect', function(){
		snakesOnline--;
		everyone.now.updateSnakesCount(snakesOnline);
	});
	
	everyone.now.findMatch = function(){
		battle.findMatch(this.user);
	};
	
	everyone.now.changeName = function(name){
		this.user.name = name;
		// nowjs.getGroup(this.user.group).now.updateNames(name);
	};
	
	everyone.now.setPlayer = function(p){
		battle.choosePlayer(this.user, p, this.user.group);
	};
	
	everyone.now.gameOver = function(winner, message){
		nowjs.getGroup(this.user.group).now.game.gameOver(winner, message);
	};
	
	everyone.now.wantRematch = function(rematch){
		nowjs.getGroup(this.user.group).exclude([this.user.clientId]).now.game.wantRematch(rematch);
	};
	
	everyone.now.startRematch = function(){
		var uuid = 'rematch-' + utils.uid(8);
		nowjs.getGroup(this.user.group).now.game.startRematch(uuid);
	};
	
	/**
	 *	Game Messagine
	 */
	
	// --- Powerups
	everyone.now.addPowerup = function(powerup, x, y){
		nowjs.getGroup(this.user.group).now.powerup.addPowerup(powerup, x, y);
	};

	everyone.now.removePowerup = function(i){
		nowjs.getGroup(this.user.group).now.powerup.removePowerup(i);
	};

	
	// --- Snakes
	
	everyone.now.updateScore = function(id, score){
		nowjs.getGroup(this.user.group).now.game.updateScore(id, score);
	};
	
	everyone.now.shrinkSnake = function(id, i){
		nowjs.getGroup(this.user.group).exclude([this.user.clientId]).now.game.shrinkSnake(id, i);
	};

	everyone.now.growSnake = function(id, i){
		nowjs.getGroup(this.user.group).exclude([this.user.clientId]).now.game.growSnake(id, i);
	};

	everyone.now.moveSnake = function(id, x, y){
		nowjs.getGroup(this.user.group).exclude([this.user.clientId]).now.game.moveSnake(id, x, y);
	};
	
	everyone.now.colorAll = function(id, color, tail){
		nowjs.getGroup(this.user.group).exclude([this.user.clientId]).now.game.colorAll(id, color, tail);
	};
	
	
	// everyone.now.moveSnakes = function(){
	// 	nowjs.getGroup(this.user.group).now.game.moveSnakes();
	// };
	
	everyone.now.playerEaten = function(player){
		nowjs.getGroup(this.user.group).exclude([this.user.clientId]).now.game.playerEaten(player);
	};
	
	everyone.now.createSnakes = function(player1, player2){
		nowjs.getGroup(this.user.group).exclude([this.user.clientId]).now.game.createSnakes(player1, player2);
	};
	
	everyone.now.updateGameLoop = function(limit){
		nowjs.getGroup(this.user.group).now.game.setGameLoop(limit);
	}
	
	everyone.now.snakeDir = function(id, dir){
		nowjs.getGroup(this.user.group).exclude([this.user.clientId]).now.game.snakeDir(id, dir);
	};
	
	

}(); // Shang Tsung: IT HAS BEGUN! 
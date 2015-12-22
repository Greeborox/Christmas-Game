function startSantaGame(){
	var gameBoard = document.getElementById("game");
	var game = new SantaGame(gameBoard);
	game.initSanta();
}

var SantaGame = function(canvas) {
	var that = this;
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.gameStates = {};
	this.initSanta = function() {
		this.game = new this.GameEngine(this.canvas, this.gameLoop, this.gameStates);
		this.gameStates.menuState = new this.MenuState(this.game);
		this.gameStates.gameState = new this.GameState(this.game);
		this.activateKeyboard();
		this.game.start();
	};

	this.activateKeyboard = function() {
		window.addEventListener("keydown", function keydown(e) {
			var keycode = e.which || window.event.keycode;
			if(keycode == 37 || keycode == 39 || keycode == 32) {
				e.preventDefault();
			}
			that.game.keyDown(keycode);
		});
		window.addEventListener("keyup", function keydown(e) {
			var keycode = e.which || window.event.keycode;
			that.game.keyUp(keycode);
		});
	};
	this.gameLoop = function(game){
		var currentState = game.returnState();
		if(currentState) {
			if(currentState.update) {
				currentState.update();
			}
			if(currentState.draw) {
				currentState.draw();
			}
		}
	};
	this.GameEngine = function(gameBoard, gameLoop, gameStates){
		var that = this;
		this.gameBoard = gameBoard;
		this.gameLoop = gameLoop;
		this.gameStates = gameStates;
		this.stateStack = [];
		this.pressedKeys = {};
		this.config = {
			fps: 50,
			width: canvas.width,
			height: canvas.height,
			welcomePicSrc: "GFX/welcomeScreen.png",
			santaImage: "GFX/santa.png",
			toyPlaneImg: "GFX/plane.png",
			presentImg: "GFX/gift.png",
			exPresentImg: "GFX/exGift.png",
			bombImg: "GFX/bomb.png",
			explosionImg: "GFX/explosion.png",
			hurtSantaImg: "GFX/hurtSanta.png"
		};
		this.returnState = function() {
			if(this.stateStack.length < 0) {
				return null;
			} else {
				return this.stateStack[this.stateStack.length-1];
			}
		};
		this.changeState = function(state) {
			if(this.returnState) {
				this.stateStack.pop();
			}
			if(state.enter){
				state.enter();
			}
			this.stateStack.push(state);
		};
		this.removeState = function() {
			if(this.returnState) {
				this.stateStack.pop();
			}
		};
		this.addState = function(state) {
			if(state.enter){
				state.enter();
			}
			this.stateStack.push(state);
		};
		this.start = function() {
			this.changeState(this.gameStates.menuState);
			this.intervalID = setInterval(function(){that.gameLoop(that)},1000/that.config.fps);
		};
		this.keyDown = function(key){
			this.pressedKeys[key] = true;
			if(this.returnState() && this.returnState().keyDown){
				this.returnState().keyDown(key);
			}
		};
		this.keyUp = function(key){
			delete this.pressedKeys[key];
			if(this.returnState() && this.returnState().keyUp){
				this.returnState().keyUp();
			}
		};
	};

	this.MenuState = function(game){
		var ctx = game.gameBoard.getContext("2d");
		this.welcomeScreen = new Image();
		this.welcomeScreen.src = game.config.welcomePicSrc;
		this.draw = function(){
			ctx.clearRect(0,0, game.config.width, game.config.height);
			ctx.drawImage(this.welcomeScreen, 25, (canvas.height/2)-180)
		};
		this.keyDown = function(key){
			if(key === 32 ){ // Spacja
				console.log("spacja")
				game.changeState(game.gameStates.gameState);
			} 
		};
	};
	this.GameState = function(game){
		var ctx = game.gameBoard.getContext("2d");
		this.santa;
		this.hurtSanta;
		this.presents = [];
		this.exPresents = [];
		this.bombs = [];
		this.explosions = [];
		this.Santa = function() {
			this.x = 10;
			this.y = game.config.height-105;
			this.speed = 300;
			this.width = 40;
			this.height = 55;
			this.moving = false;
			this.currFrame = 0;
			this.frameNum = 11;
			this.frameTick = 2;
			this.direction = 0;
			this.ticks = 0;
			this.image = new Image();
			this.image.src = game.config.santaImage;
			this.update = function() {
				if(!this.moving){
					this.currFrame = 0;
				} else {
					if(this.ticks > this.frameTick) {
						this.currFrame++;
						if(this.currFrame === this.frameNum) {
							this.currFrame = 0;
						}
						this.ticks=0;
					} else {
						this.ticks++;
					}
				}
			};
			this.draw = function() {
				ctx.drawImage(this.image,this.width*this.currFrame,this.height*this.direction,this.width,this.height,this.x,this.y,this.width+45,this.height+45);
				//ctx.drawImage(this.image,this.x,this.y);
			};
		};
		this.HurtSanta = function(x,y){
			this.x = x;
			this.y = y;
			this.width = 50;
			this.height = 45;
			this.currFrame = 0;
			this.frameNum = 8;
			this.frameTick = 4;
			this.ticks = 0;
			this.image = new Image();
			this.image.src = game.config.hurtSantaImg;
			this.destroyed = false;
			this.update = function(){
				if(this.ticks > this.frameTick) {
					this.currFrame++;
					if(this.currFrame === this.frameNum) {
						this.destoryed = true;
					}
					this.ticks=0;
				} else {
					this.ticks++;
				}
			}
			this.draw = function(){
				ctx.drawImage(this.image,this.width*this.currFrame,0,this.width,this.height,this.x,this.y,this.width+40,this.height+40);
			}
		};
		this.ToyPlane = function() {
			this.x = 10;
			this.y = 10;
			this.speed = 200;
			this.size = 40;
			this.currFrame = 0;
			this.frameNum = 7;
			this.frameTick = 2;
			this.ticks = 0;
			this.direction = 0;
			this.image = new Image();
			this.image.src = game.config.toyPlaneImg;
			this.update = function(){
				if(this.ticks > this.frameTick) {
					this.currFrame++;
					if(this.currFrame === this.frameNum) {
						this.currFrame = 0;
					}
					this.ticks=0;
					} else {
						this.ticks++;
					}
				if(!this.direction)	{
					if(this.x<game.config.width-100){
						this.x += this.speed*1/game.config.fps;
					} else {
						this.direction = 1;
					}
				} else {
					if(this.x>10){
						this.x -= this.speed*1/game.config.fps;
					} else {
						this.direction = 0;
					}
				}
			};
			this.draw = function(){
				ctx.drawImage(this.image,this.size*this.currFrame,this.size*this.direction,this.size,this.size,this.x,this.y,this.size+45,this.size+45);
			}
		};
		this.Present = function(x){
			this.x = x;
			this.y = 105;
			this.speed = 200;
			this.width = 30;
			this.height = 35;
			this.currFrame = 0;
			this.frameNum = 3;
			this.frameTick = 2;
			this.ticks = 0;
			this.image = new Image();
			this.image.src = game.config.presentImg;
			this.update = function(){
				if(this.ticks > this.frameTick) {
					this.currFrame++;
					if(this.currFrame === this.frameNum) {
						this.currFrame = 0;
					}
					this.ticks=0;
				} else {
					this.ticks++;
				}
				this.y += this.speed*(1/game.config.fps);
			}
			this.draw = function(){
				ctx.drawImage(this.image,this.width*this.currFrame,0,this.width,this.height,this.x,this.y,this.width+20,this.height+20);
			}
		};
		this.ExPresent = function(x,y){
			this.x = x;
			this.y = y;
			this.width = 34;
			this.height = 35;
			this.currFrame = 0;
			this.frameNum = 6;
			this.frameTick = 2;
			this.ticks = 0;
			this.image = new Image();
			this.image.src = game.config.exPresentImg;
			this.destroyed = false;
			this.update = function(){
				if(this.ticks > this.frameTick) {
					this.currFrame++;
					if(this.currFrame === this.frameNum) {
						this.destoryed = true;
					}
					this.ticks=0;
				} else {
					this.ticks++;
				}
			}
			this.draw = function(){
				ctx.drawImage(this.image,this.width*this.currFrame,0,this.width,this.height,this.x,this.y,this.width+20,this.height+20);
			}
		};
		this.Bomb = function(x){
			this.x = x;
			this.y = 105;
			this.speed = 200;
			this.size = 30;
			this.currFrame = 0;
			this.frameNum = 3;
			this.frameTick = 2;
			this.ticks = 0;
			this.image = new Image();
			this.image.src = game.config.bombImg;
			this.update = function(){
				if(this.ticks > this.frameTick) {
					this.currFrame++;
					if(this.currFrame === this.frameNum) {
						this.currFrame = 0;
					}
					this.ticks=0;
				} else {
					this.ticks++;
				}
				this.y += this.speed*(1/game.config.fps);
			}
			this.draw = function(){
				ctx.drawImage(this.image,this.size*this.currFrame,0,this.size,this.size,this.x,this.y,this.size+20,this.size+20);
			}
		};
		this.Explosion = function(x,y){
			this.x = x;
			this.y = y;
			this.width = 70;
			this.height = 50;
			this.currFrame = 0;
			this.frameNum = 5;
			this.frameTick = 4;
			this.ticks = 0;
			this.image = new Image();
			this.image.src = game.config.explosionImg;
			this.destroyed = false;
			this.update = function(){
				if(this.ticks > this.frameTick) {
					this.currFrame++;
					if(this.currFrame === this.frameNum) {
						this.destoryed = true;
					}
					this.ticks=0;
				} else {
					this.ticks++;
				}
			}
			this.draw = function(){
				ctx.drawImage(this.image,this.width*this.currFrame,0,this.width,this.height,this.x,this.y,this.width+35,this.height+35);
			}
		};
		this.enter = function(){
			this.santa = new this.Santa();
			this.plane = new this.ToyPlane();
			this.bombs.push(new this.Bomb(game.config.width/2));
		};
		this.update = function(){
			if(game.pressedKeys[39]) {
				this.santa.moving = true;
				this.santa.direction = 0;
				if(this.santa.x<game.config.width-this.santa.width-55)
				this.santa.x += this.santa.speed*(1/game.config.fps);
			}
			if(game.pressedKeys[37]) {
				this.santa.moving = true;
				this.santa.direction = 1
				if(this.santa.x>=10)
				this.santa.x -= this.santa.speed*(1/game.config.fps);
			}
			if(this.santa){
				this.santa.update();
			}
			this.plane.update();
			for(var i = 0; i<this.presents.length;i++){
				this.presents[i].update();
				if(this.presents[i].y >= game.config.height-60){
					this.exPresents.push(new this.ExPresent(this.presents[i].x,this.presents[i].y));
					this.presents.splice(i,1);
				}
			}
			for(var i = 0; i<this.exPresents.length;i++){
				this.exPresents[i].update();
				if(this.exPresents[i].destroyed) {
					this.exPresents.splice(i,1);
				}
			}
			for(var i = 0; i<this.bombs.length;i++){
				this.bombs[i].update();
				if(this.bombs[i].y >= game.config.height-60){
					this.explosions.push(new this.Explosion(this.bombs[i].x-20,this.bombs[i].y-20));
					this.bombs.splice(i,1);
				}
			}
			for(var i = 0; i<this.explosions.length;i++){
				this.explosions[i].update();
				if(this.explosions[i].destroyed) {
					this.explosions.splice(i,1);
				}
			}
			if(this.hurtSanta){
				this.hurtSanta.update();
				if(this.hurtSanta.destroyed) {
					this.hurtSanta = null;
				}
			}
			if(this.santa){	
				this.checkCollisions();
			}
		};
		this.draw = function(){
			ctx.clearRect(0,0, game.config.width, game.config.height);
			if(this.santa){
			this.santa.draw();
			}
			if(this.hurtSanta){
				this.hurtSanta.draw();
			}
			this.plane.draw();
			for(var i = 0; i<this.presents.length;i++){
				this.presents[i].draw();
			}
			for(var i = 0; i<this.exPresents.length;i++){
				this.exPresents[i].draw();
			}
			for(var i = 0; i<this.bombs.length;i++){
				this.bombs[i].draw();
			}
			for(var i = 0; i<this.explosions.length;i++){
				this.explosions[i].draw();
			}
		};
		this.checkCollisions = function(){
			santa = this.santa;
			for(var i = 0; i<this.presents.length;i++){
				var present = this.presents[i];
				if(present.x >= santa.x && present.x <= santa.x+santa.width){
					if(present.y >= santa.y && present.y <= santa.y+santa.height) {
						this.presents.splice(i,1);
						//dodaj punkty
					}
				}
			}
			for(var i = 0; i<this.explosions.length;i++){
				var explosion = this.explosions[i];
				if(santa.x+santa.width >= explosion.x && santa.x-santa.width <= explosion.x+(explosion.width/2)) {
					this.hurtSanta = new this.HurtSanta(this.santa.x,this.santa.y+10);
					this.santa=null;
				}
			}
		}
		this.keyUp = function(){
			this.santa.moving = false;
		};
	};
};

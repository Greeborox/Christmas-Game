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
		this.presents = [];
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
			
		}
		this.enter = function(){
			this.santa = new this.Santa();
			this.plane = new this.ToyPlane();
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
			this.santa.update();
			this.plane.update();
		};
		this.draw = function(){
			ctx.clearRect(0,0, game.config.width, game.config.height);
			this.santa.draw();
			this.plane.draw();
		};
		this.keyUp = function(){
			this.santa.moving = false;
		};
	};
};


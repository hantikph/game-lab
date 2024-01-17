// script.js

window.addEventListener('load', function(){
	// canvas setup
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	canvas.width = 300;
	canvas.height = 500;

	class InputHandler {
		constructor(game){
			this.game = game;
			window.addEventListener('keydown', e => {
				if ((	(e.key === 'ArrowLeft') ||
						(e.key === 'ArrowRight')
					) && this.game.keys.indexOf(e.key) === -1){
					this.game.keys.push(e.key);
				}
			});
			window.addEventListener('keyup', e => {
				if (this.game.keys.indexOf(e.key) > -1){
					this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
				}
			});
		}
	}
	class Spawner {
		constructor(game){
			this.game = game;
			this.width = 85;
			this.height = 50;
			this.x = 20;
			this.y = 50;
			this.speedX = 1;
		}
		update(){
			this.x += this.speedX;
			if (this.x + this.width > this.game.width - 5) this.speedX = -this.speedX;
			else if (this.x < 5) this.speedX = -this.speedX;
		}
		draw(context){
			context.fillStyle = 'green';
			context.fillRect(this.x, this.y, this.width, this.height);
		}
		
	}
	class Player {
		constructor(game){
			this.game = game;
			this.width = 60;
			this.height = 90;
			this.x = this.game.width * 0.5;
			this.y = this.game.height * 0.7;
			this.speedX = 0;
			this.maxSpeed = 2;
			// powerUp option
			this.powerUp = false;
			this.powerUpTimer = 0;
			this.powerUpLimit = 3000;
		}
		update(deltaTime){
			if (this.game.keys.includes('ArrowLeft')) this.speedX = -this.maxSpeed;
			else if (this.game.keys.includes('ArrowRight')) this.speedX = this.maxSpeed;
			else this.speedX = 0;
			this.x += this.speedX;
			// horizontal boundary
			if (this.x > this.game.width - this.width -5) this.x = this.game.width - this.width - 5;
			else if (this.x < 5) this.x = 5;
			// power up status
			if (this.powerUp){
				if (this.powerUpTimer > this.powerUpLimit){
					this.powerUpTimer = 0;
					this.powerUp = false;
					this.maxSpeed = 2;
				} else {
					this.powerUpTimer += deltaTime;
				}
			}
		}
		draw(context){
			context.fillStyle = 'orange';
			context.fillRect(this.x, this.y, this.width, this.height);
		}
		enterPowerUp(){
			this.powerUpTimer = 0;
			this.powerUp = true;
			this.maxSpeed = 4;
		}
	}
	class Coin {
		constructor(game, x, y){
			this.game = game;
			this.x = x;
			this.y = y;
			this.speedX = Math.random() * 1.5 - 0.5;
			this.speedY = Math.random() * 0.5 - 2 ;
			this.gravity = 0.1;
			this.markedForDeletion = false;
			this.bounced = false;
			this.bottomBounceBoundary = this.game.height * 0.8;
		}
		update(){
			this.speedY += this.gravity;
			this.x -= this.speedX;
			this.y += this.speedY;
			if (this.y > this.game.height * 0.9) this.markedForDeletion = true;
			if (this.y > this.bottomBounceBoundary && !this.bounced){
				this.bounced = true;
				this.speedY *= -0.5;
			}
		}
		draw(context){
			context.fillStyle = 'blue';
			context.fillRect(this.x, this.y, this.width, this.height);
			context.fillStyle = 'blue';
			context.font = '20px Bungee Spice';
			context.fillText(this.score, this.x + this.width * 0.25, this.y + this.height * 0.75);
		}
	}
	class Golden extends Coin {
		constructor(game, x, y){
			super(game, x, y);
			this.width = 30;
			this.height = 30;
			this.score = 3;
		}
	}
	class Silver extends Coin {
		constructor(game, x, y){
			super(game, x, y);
			this.width = 15;
			this.height = 15;
			this.score = 2;
		}
	}
	class Jewel extends Coin {
		constructor(game, x, y){
			super(game, x, y);
			this.width = 20;
			this.height = 20;
			this.score = 10;
			this.type = 'jewel';
		}
	}
	class Storm {

	}
	class Layer {
		constructor(game, image, speedModifier){
			this.game = game;
			this.image = image;
			this.speedModifier = speedModifier;
			this.width = 1768;
			this.height = 500;
			this.x = 0;
			this.y = 0;
		}
		update(){
			if (this.x <= -this.width) this.x = 0;
			this.x -= this.game.speed * this.speedModifier;
		}
		draw(context){
			context.drawImage(this.image, this.x, this.y);
			context.drawImage(this.image, this.x + this.width, this.y);
		}
	}
	class Background {
		constructor(game){
			this.game = game;
			this.image1 = document.getElementById('layer1');
			this.layer1 = new Layer(this.game, this.image1, 0.1);
			this.image3 = document.getElementById('layer3');
			this.layer3 = new Layer(this.game, this.image3, 0);
			this.layers = [this.layer1, this.layer3]
		}
		update(){
			this.layers.forEach(layer => layer.update());

		}
		draw(context){
			this.layers.forEach(layer => layer.draw(context));
		}
	}
	class Effects {

	}
	class UI {
		constructor(game){
			this.game = game;
			this.fontSize = 23;
			this.fontFamily = 'Bungee Spice';
			this.color = 'white';
		}
		draw(context){
			context.save();
			context.fillStyle = this.color;
			context.shadowOffsetX = 2;
			context.shadowOffsetY = 2;
			context.shadowColor = 'black';
			context.font = this.fontSize + 'px ' + this.fontFamily;
			// display score
			context.fillText('Score: ' + this.game.score, 165, 30);
			// display game timer
			const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
			context.fillText('Timer: ' + formattedTime, 7, 30);
			// game over messages
			if (this.game.gameOver){
				context.textAlign = 'center';
				let message1;
				let message2;
				if (this.game.score > this.game.winningScore){
					message1 = 'You Win!';
					message2 = 'Well done!';
				} else {
					message1 = 'You lose!';
					message2 = 'Try again next time'
				}
				context.font = '40px ' + this.fontFamily;
				context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);
				context.font = '20px ' + this.fontFamily;
				context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
			}
			context.restore();
		}
	}
	class Game {
		constructor(width, height){
			this.width = width;
			this.height = height;
			this.background = new Background(this);
			this.player = new Player(this);
			this.spawner = new Spawner(this);
			this.input = new InputHandler(this);
			this.ui = new UI(this);
			this.keys = [];
			this.coins = [];
			this.coinTimer = 0;
			this.coinInterval = 450;
			this.gameOver = false;
			this.score = 0;
			this.winningScore = 50;
			this.gameTime = 0;
			this.timeLimit = 15000;
			this.speed = 1;
		}
		update(deltaTime){
			if (!this.gameOver) this.gameTime += deltaTime;
			if (this.gameTime > this.timeLimit) this.gameOver = true;
			this.background.update();
			this.player.update(deltaTime);
			this.spawner.update();
			this.coins.forEach(coin => {
				coin.update();
				if (this.checkCollision(this.player, coin)){
					coin.markedForDeletion = true;
					if (coin.type === 'jewel') this.player.enterPowerUp();
					if (!this.gameOver && !coin.bounced) this.score += coin.score;
					// if (this.score > this.winningScore) this.gameOver = true;
				}
			});
			this.coins = this.coins.filter(coin => !coin.markedForDeletion);
			if (this.coinTimer > this.coinInterval && !this.gameOver){
				this.addCoin();
				this.coinTimer = 0;
			} else {
				this.coinTimer += deltaTime
			}
		}
		draw(context){
			this.background.draw(context);
			this.player.draw(context);
			this.spawner.draw(context);
			this.coins.forEach(coin => {
				coin.draw(context);
			});
			this.ui.draw(context);
		}
		addCoin(){
			const randomise = Math.random();
			if (randomise < 0.3) this.coins.push(new Golden(this, this.spawner.x, this.spawner.y));
			else if (randomise < 0.8) this.coins.push(new Silver(this, this.spawner.x, this.spawner.y));
			else this.coins.push(new Jewel(this, this.spawner.x, this.spawner.y));
		}
		checkCollision(rect1, rect2){
			return (	rect1.x < rect2.x + rect2.width &&
						rect1.x + rect1.width > rect2.x &&
						rect1.y < rect2.y + rect2.height &&
						rect1.y + rect1.height > rect2.y

			)
		}
	}
	const game = new Game(canvas.width, canvas.height);
	let lastTime = 0;
	// animation loop
	function animate(timeStamp){
		const deltaTime = timeStamp - lastTime;
		lastTime = timeStamp;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.draw(ctx);
		game.update(deltaTime);
		requestAnimationFrame(animate);
	}
	animate(0);
});
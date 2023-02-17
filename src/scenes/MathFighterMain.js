import Phaser from 'phaser'
import scoreLabel from '../game/ScoreLabel';

export default class MathFighterMain extends Phaser.Scene
{
	constructor(){
		super('main-scene');
	}
	
	init(){
		this.gameHalfWidth = this.scale.width / 2;
		this.gameHalfHeight = this.scale.height / 2;

		// sprites
		this.player = undefined;
		this.enemy = undefined;
		this.slash = undefined;

		// text
		this.startGame = false;
		this.questionText = undefined;
		this.resultText = undefined;
		this.welcomeText = undefined;

		// button
		this.button1 = undefined;
		this.button2 = undefined;
		this.button3 = undefined;
		this.button4 = undefined;
		this.button5 = undefined;
		this.button6 = undefined;
		this.button7 = undefined;
		this.button8 = undefined;
		this.button9 = undefined;
		this.button0 = undefined;
		this.buttonDel = undefined;
		this.buttonOk = undefined;

		// numbers
		this.numberArray = [];
		this.number = 0;

		// questions
		this.questions = [];

		// check answer
		this.correctAnswer = undefined;

		// attacks
		this.playerAttack = false;
		this.enemyAttack = false;

		// score label
		this.scoreLabel = 0;

		// timer
		this.timerLabel = undefined;
		this.countDownTimer = 60;
		this.timedEvent = undefined;
	}

	preload(){
        this.load.image(`bg`, `images/bg_layer1.png`);
		this.load.image(`fightbg`, `images/fight-bg.png`);
		this.load.image(`tile`, `images/tile.png`);
		this.load.image(`startbtn`, `images/start_button.png`);

		// spritesheets
		this.load.spritesheet(`player`, `images/warrior1.png`, {
			frameWidth: 80,
			frameHeight: 80
		});

		this.load.spritesheet(`enemy`, `images/warrior2.png`, {
			frameWidth: 80,
			frameHeight: 80
		});

		this.load.spritesheet(`numpad`, `images/numbers.png`, {
			frameWidth: 131,
			frameHeight: 71.25
		});

		this.load.spritesheet(`slash`, `images/slash.png`, {
			frameWidth: 42,
			frameHeight: 88
		});
    }

    create(){
        // stage
		this.add.image(240, 320, `bg`);
		const fightbg = this.add.image(240, 160, `fightbg`);
		const tile = this.physics.add.staticImage(240, fightbg.height - 40, `tile`);

		// player
		this.player = this.physics.add.sprite(
			this.gameHalfWidth - 150,
			this.gameHalfHeight - 200,
			`player`
		).setOffset(-50, -8).setBounce(0.2);

		// enemy
		this.enemy = this.physics.add.sprite(
			this.gameHalfWidth + 150,
			this.gameHalfHeight - 200,
			`enemy`
		).setOffset(50, -8).setBounce(0.2).setFlipX(true);

		// slash
		this.slash = this.physics.add.sprite(240, 60, `slash`)
		.setActive(false)
		.setVisible(false)
		.setGravityY(-500)
		.setOffset(0, -10)
		.setDepth(1)
		.setCollideWorldBounds(true);

		// tile collider
		this.physics.add.collider(this.player, tile);
		this.physics.add.collider(this.enemy, tile);

		// overlap physics
		this.physics.add.overlap(this.slash, this.player, this.spriteHit, null, this);
		this.physics.add.overlap(this.slash, this.enemy, this.spriteHit, null, this);

		// animation
		this.spriteAnimation();

		// welcome text
		// @ts-ignore
		let welcomeText = this.add.text(
			this.gameHalfWidth - 165,
			this.gameHalfHeight + 275,
			`Made with ❤️ by GrendpaCornel09 on GitHub`, {
			align: `center`,
			fontFamily: `Georgia`,
			fontSize: `20px`,
			// @ts-ignore
			fill: `#000`
		}).setScale(0.8);
		// start button
		let startButton = this.add.image(this.gameHalfWidth, this.gameHalfHeight + 181, `startbtn`).setInteractive().setScale(0.5);
		startButton.on(`pointerdown`, () => {
			this.gameStart();
			startButton.destroy();
		}, this);

		// score label
		this.scoreLabel = this.createScoreLabel(26, 16, 0);

		// timer
		this.timerLabel = this.add.text(this.gameHalfWidth, 16, null).setDepth(5);
    }

	// @ts-ignore
	update(time){
		if(this.correctAnswer == true && !this.playerAttack){
			this.player.anims.play(`playerAttack`, true);
			this.time.delayedCall(500, () => {
				this.createSlash(this.player.x + 60, this.player.y, 0, 600, false);
			});
			this.playerAttack = true;
		}

		if(this.correctAnswer == undefined){
			this.player.anims.play(`playerStand`, true);
			this.enemy.anims.play(`enemyStand`, true);
		}

		if(this.correctAnswer == false && !this.enemyAttack){
			this.enemy.anims.play(`enemyAttack`, true);
			this.time.delayedCall(500, () => {
				this.createSlash(this.enemy.x - 60, this.enemy.y, 2, -600, true);
			});
			this.enemyAttack = true;
		}

		// timer
		if(this.startGame = true) {
			this.timerLabel.setStyle({
				fontSize: `24px`,
				fill: `#000`,
				fontStyle: `bold`,
				align: `center`,
			// @ts-ignore
			}).setText(this.countDownTimer);
		}
	}

	getOperator(){
		const operators = [`+`, `-`, `*`, `/`];
		return operators[Phaser.Math.Between(0, operators.length - 1)];
	}

	gameStart(){
		this.startGame = true;
		this.player.anims.play(`playerStand`, true);
		this.enemy.anims.play(`enemyStand`, true);
		this.createButtons();
		
		this.input.on(`gameobjectdown`, this.addNumber, this);

		this.resultText = this.add.text(this.gameHalfWidth, 250, `0`, {
			fontSize: `32px`,
			fontFamily: `Arial`,
			// @ts-ignore
			fill: `#000`
		});

		this.questionText = this.add.text(this.gameHalfWidth - 10, 100, `0`, {
			fontSize: `32px`,
			fontFamily: `Arial`,
			// @ts-ignore
			fill: `#000`
		});

		this.generateQuestions();

		// timed event
		this.timedEvent = this.time.addEvent({
			delay: 1000,
			callback: this.gameOver,
			callbackScope: this,
			loop: true
		});
	}

	// @ts-ignore
	addNumber(pointer, object, event){
		let value = object.getData(`value`);

		if(isNaN(value)){
			if(value == `del`){
				this.numberArray.pop();
				
				if(this.numberArray.length < 1){
					this.numberArray[0] = 0;
				}
			}
			
			if(value == `ok`){
				this.checkAnswer();
				this.numberArray = [];
				this.numberArray[0] = 0;
			}
		}

		else{
			// button 0
			if(this.numberArray.length == 1 && this.numberArray[0] == 0){
				this.numberArray[0] = value;
			}

			else{
				if(this.numberArray.length < 10){
					this.numberArray.push(value);
				}
			}
		}

		this.number = parseInt(this.numberArray.join(``));
		// @ts-ignore
		this.resultText.setText(this.number);
		const textHalfWidth = this.resultText.width * 0.5;
		this.resultText.setX(this.gameHalfWidth - textHalfWidth);
		event.stopPropagation();
	}

	generateQuestions(){
		let number1 = Phaser.Math.Between(0, 50);
		let number2 = Phaser.Math.Between(0, 50);
		let operator = this.getOperator();

		if(operator === `+`){
			this.questions[0] = `${number1} + ${number2}`;
			this.questions[1] = number1 + number2;
		}

		if(operator === `-`){
			if(number2 > number1){
				this.questions[0] = `${number2} - ${number1}`;
				this.questions[1] = number2 - number1;
			}

			else{
				this.questions[0] = `${number1} - ${number2}`;
				this.questions[1] = number1 - number2;
			}
		}

		if(operator === `*`){
			this.questions[0] = `${number1} * ${number2}`;
			this.questions[1] = number1 * number2;
		}

		if(operator === `/`){
			do{
				number1 = Phaser.Math.Between(0, 50);
				number2 = Phaser.Math.Between(0, 50);
			}
			while(!Number.isInteger(number1/number2));

			this.questions[0] = `${number1} / ${number2}`;
			this.questions[1] = number1 / number2
		}

		this.questionText.setText(this.questions[0]);
		const textHalfWidth = this.questionText.width * 0.5;
		this.questionText.setX(this.gameHalfWidth - textHalfWidth);
	}

	checkAnswer(){
		if(this.number == this.questions[1]){
			this.correctAnswer = true;
		}

		else{
			this.correctAnswer = false;
		}
	}

	createSlash(x, y, frame, velocity, flip = false){
		this.slash.setPosition(x, y)
		.setActive(true)
		.setVisible(true)
		.setFrame(frame)
		.setVelocityX(velocity)
		.setFlipX(flip);
	}

	spriteHit(slash, sprite){
		slash.x = 0;
		slash.y = 0;
		slash.setActive(false);
		slash.setVisible(false);

		if(sprite.texture.key == `player`){
			sprite.anims.play(`playerHit`, true);
			
			// @ts-ignore
			if(this.scoreLabel.getScore() > 0){
				// @ts-ignore
				this.scoreLabel.add(-50);
			}
		}

		else{
			sprite.anims.play(`enemyHit`, true);
			// @ts-ignore
			this.scoreLabel.add(50);
		}

		this.time.delayedCall(500, () => {
			this.playerAttack = false;
			this.enemyAttack = false;
			this.correctAnswer = undefined;
			this.generateQuestions();
		});
	}

	createScoreLabel(x, y, score) {
		const style = {
			fontSize: `24px`,
			fill: '#000',
			fontStyle: `bold`
		};

		const label = new scoreLabel(this, x, y, score, style).setDepth(1);

		this.add.existing(label);
		return label;
	}

	gameOver(){
		this.countDownTimer -= 1;
		
		if(this.countDownTimer < 0){
			this.scene.start(`gameOver`, {
				// @ts-ignore
				score: this.scoreLabel.getScore()
			});
		}
	}

	createButtons(){
		const startPositionY = this.scale.height - 246;
		const widthDifference = 131;
		const heightDifference = 71.25;

		// 2, 5, 8, 0
		this.button2 = this.add.image(
			this.gameHalfWidth,
			startPositionY,
			`numpad`,
			1
		).setInteractive().setData(`value`, 2);

		this.button5 = this.add.image(
			this.gameHalfWidth,
			this.button2.y + heightDifference,
			`numpad`,
			4
		).setInteractive().setData(`value`, 5);

		this.button8 = this.add.image(
			this.gameHalfWidth,
			this.button5.y + heightDifference,
			`numpad`,
			7
		).setInteractive().setData(`value`, 8);

		this.button0 = this.add.image(
			this.gameHalfWidth,
			this.button8.y + heightDifference,
			`numpad`,
			10
		).setInteractive().setData(`value`, 0);

		// 1, 4, 7, Del
		this.button1 = this.add.image(
			this.button2.x - widthDifference,
			startPositionY,
			`numpad`,
			0
		).setInteractive().setData(`value`, 1);

		this.button4 = this.add.image(
			this.button5.x - widthDifference,
			this.button1.y + heightDifference,
			`numpad`,
			3
		).setInteractive().setData(`value`, 4);

		this.button7 = this.add.image(
			this.button8.x - widthDifference,
			this.button4.y + heightDifference,
			`numpad`,
			6
		).setInteractive().setData(`value`, 7);

		this.buttonDel = this.add.image(
			this.button0.x - widthDifference,
			this.button7.y + heightDifference,
			`numpad`,
			9
		).setInteractive().setData(`value`, `del`);

		// 3, 6, 9, Ok
		this.button3 = this.add.image(
			this.button2.x + widthDifference,
			startPositionY,
			`numpad`,
			2
		).setInteractive().setData(`value`, 3);

		this.button6 = this.add.image(
			this.button5.x + widthDifference,
			this.button3.y + heightDifference,
			`numpad`,
			5
		).setInteractive().setData(`value`, 6);

		this.button9 = this.add.image(
			this.button8.x + widthDifference,
			this.button6.y + heightDifference,
			`numpad`,
			8
		).setInteractive().setData(`value`, 9);

		this.buttonOk = this.add.image(
			this.button0.x + widthDifference,
			this.button9.y + heightDifference,
			`numpad`,
			11
		).setInteractive().setData(`value`, `ok`);
	}

	spriteAnimation(){
		// player
		this.anims.create({
			key: `playerDie`,
			frames: this.anims.generateFrameNumbers(`player`, {
				start: 0,
				end: 4
			}),
			frameRate: 10
		});

		this.anims.create({
			key: `playerHit`,
			frames: this.anims.generateFrameNumbers(`player`, {
				start: 5,
				end: 9
			}),
			frameRate: 10
		});

		this.anims.create({
			key: `playerAttack`,
			frames: this.anims.generateFrameNumbers(`player`, {
				start: 10, 
				end: 14
			}),
			frameRate: 10
		});

		this.anims.create({
			key: `playerStand`,
			frames: this.anims.generateFrameNumbers(`player`, {
				start: 15,
				end: 19
			}),
			frameRate: 10,
			repeat: -1
		});

		// enemy
		this.anims.create({
			key: `enemyDie`,
			frames: this.anims.generateFrameNumbers(`enemy`, {
				start: 0,
				end: 4
			}),
			frameRate: 10
		});

		this.anims.create({
			key: `enemyHit`,
			frames: this.anims.generateFrameNumbers(`enemy`, {
				start: 5,
				end: 9
			}),
			frameRate: 10
		});

		this.anims.create({
			key: `enemyAttack`,
			frames: this.anims.generateFrameNumbers(`enemy`, {
				start: 10,
				end: 14
			}),
			frameRate: 10
		});

		this.anims.create({
			key: `enemyStand`,
			frames: this.anims.generateFrameNumbers(`enemy`, {
				start: 15,
				end: 19
			}),
			frameRate: 10,
			repeat: -1
		});
	}
}
import Phaser from 'phaser';
import scoreLabel from '../game/ScoreLabel';

export default class Scene extends Phaser.Scene
{
	constructor(){
		super('gameOver');
	}
	
	init(data){
		// game half size
		this.gameHalfWidth = this.scale.width / 2;
		this.gameHalfHeight = this.scale.height / 2;

		// score
		this.score = data.score;
	}

	preload(){
        this.load.image(`bg`, `images/bg_layer1.png`);
		this.load.image(`restartbtn`, `images/restart.png`);
		this.load.image(`gameover`, `images/gameover.png`);
    }

    create(){
        this.add.image(this.gameHalfWidth, this.gameHalfHeight, `bg`);
		this.add.image(this.gameHalfWidth, this.gameHalfHeight - 125, `gameover`).setScale(1.4);
		this.add.image(this.gameHalfWidth, this.gameHalfHeight + 150, `restartbtn`).setScale(0.8);

		this.score = this.add.text(this.gameHalfWidth - 150, this.gameHalfHeight, `Your score: ${this.score}`, {
			fontSize: `35px`,
			color: `#000`,
			fontStyle: `bold`,
			align: `center`,
		}).setDepth(5);
    }

	update(){
		
	}
}

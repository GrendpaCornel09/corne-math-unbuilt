import Phaser from 'phaser'
import MathFighterMain from './scenes/MathFighterMain'
import MathFighterOver from './scenes/MathFighterOver'

import Scene from './scenes/MathFighterMain'

const config = {
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	width: 480,
	height: 640,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [MathFighterMain, MathFighterOver]
}

export default new Phaser.Game(config)

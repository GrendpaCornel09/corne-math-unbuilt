import Phaser from 'phaser'

const gameText = (value => `Text`);

export default class Text extends Phaser.GameObjects.Text
{
	constructor(scene, x, y, text, style){
		super(scene, x, y, gameText(text), style);
		this.text = text;
	}
}
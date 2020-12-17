import PlayerTypes from './playerTypes'

export default class Player {
	constructor(scene, position, player, isCurrentPlayer) {
		this.scene = scene;
		this.position = position;
		this.id = player.id;
		this.name = player.name;
		this.number = player.number;

		this.isCurrentPlayer = isCurrentPlayer;
		this.type = PlayerTypes.UNINITIATED;
		// this.hand = scene.add.group();
		this.hand = [];
		
		// const fontSize = isCurrentPlayer ? 21 : 18;
		const fontSize = 18;
		const fontColour = isCurrentPlayer ? "#FFFFFF" : "#000000"
		this.name = isCurrentPlayer ? player.name + ' (You)' : player.name;

		this.playerHeading = scene.add.text(position.x, position.y, this.name, 
			{fontSize: fontSize, fill: fontColour, align: "center"});
		this.playerHeading.angle = position.angle;
	}

	// setPlayerType(type) {
		// this.type = type
		// if (this.type === PlayerTypes.DEALER) {
		// 	this.dealerHeading = this.scene.add.text(this.position.x, this.position.y, 'Dealer', 
		// 	{fontSize: 12, fill: "#123456", align: "center"});
		// 	this.playerHeading.angle = this.position.angle;
		// } else {
		// 	if (this.dealerHeading) {
		// 		this.dealerHeading.destroy();
		// 	}
		// }
	// }

	setHand(card) {
		this.hand.push(card);
	}
}
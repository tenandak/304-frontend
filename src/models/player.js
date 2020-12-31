import PlayerTypes from './playerTypes'

export default class Player {
	constructor(scene, position, player, isCurrentPlayer) {
		this.scene = scene;
		this.position = position;
		this.id = player.id;
		this.name = player.name;
		this.number = player.number;
		this.teamId = "";

		this.isCurrentPlayer = isCurrentPlayer;
		this.type = PlayerTypes.UNINITIATED;
		this.hand = [];
		
		const fontSize = 18;
		const fontColour = isCurrentPlayer ? "#FFFFFF" : "#000000"
		this.name = isCurrentPlayer ? player.name + ' (You)' : player.name;

		this.playerHeading = scene.add.text(position.x, position.y, this.name, 
			{fontSize: fontSize, fill: fontColour, align: "center"});
		this.playerHeading.angle = position.angle;
	}

	setHand(card) {
		this.hand.push(card);
	}

	findCardById(cardId) {
		return this.hand.find(c => c.id === cardId);
	}

	removeCardFromHand(cardId) {
		this.hand = this.hand.filter(c => c.id !== cardId);
	}

	destroyPlayer() {
		this.hand = [];
		this.playerHeading.destroy();
	}
}
export default class Team {

	constructor(id, playerIds, x, y, scene) {
		this.id = id;
		this.points = 13;
		this.winningPoints = 0;
		this.playerIds = playerIds;
		this.cardPile = [];
		this.pilePosition = {
			x: x,
			y: y
		}
		this.scene = scene;
		this.createTeamBoard();
	}

	createTeamBoard() {
		this.teamBoard = this.scene.add.text(this.pilePosition.x, this.pilePosition.y, this.id, 
			{ fill: '#ff2646', align: 'center', fontSize: 21 });
		this.pointBoard = this.scene.add.text(this.pilePosition.x, this.pilePosition.y + 25, this.points, 
			{ fill: '#00cc00', align: 'center', fontSize: 18 });
	}

	updatePointBoard() {
		this.pointBoard.setText(this.points);
	}

	addToCardPile(cards) {
		this.cardPile.push(...cards);
	}

	clearCardPile() {
		this.cardPile = [];
	}

	destroyTeam() {
		this.teamBoard.destroy();
		this.pointBoard.destroy();
	}

} 
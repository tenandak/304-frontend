export default class Team {

	constructor(team, x, y, scene) {
		this.id = team.id;
		this.points = team.givingPoints;
		this.winningPoints = team.winningPoints;
		this.playerIds = team.playerIds;
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
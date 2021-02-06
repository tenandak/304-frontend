import Round from '../models/round';
import Team from '../models/team';

export default class Game {
	
	constructor(scene, gameObj, players) {
		this.scene = scene;
		this.socket = scene.socket;
		this.currentPlayer = scene.currentPlayer;
        this.players = players;
		this.teams = this.createTeams(gameObj.teams);
		this.round = new Round(this, gameObj.rounds[0], players);
	}

    createTeams(teams) {
        var team13 = new Team(teams[0], 35, 435, this.scene);
        var team24 = new Team(teams[1], 775, 435, this.scene);
    	return [team13, team24];
    }

    endGame() {
        this.teams.forEach(t => t.destroyTeam());
        this.round.endRound();
    }
}
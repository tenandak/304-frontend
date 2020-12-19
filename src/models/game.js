import Card from '../models/card';
import Team from '../models/team';
import Player from '../models/player';
import Round from '../models/round';

export default class Game {
	
	constructor(scene, playerList, socket) {
		this.scene = scene;
		this.currentPlayer = scene.currentPlayer;
		this.playerList = playerList;
		this.socket = socket;
		this.starterIndex = 0;

		this.teams = this.createTeams();
		this.rounds = [];
	}

	beginGame() {
		this.rounds.push(this.createRound());
    }

    createRound() {
    	var round = new Round(this);
    }


	shuffleDeck() {
        var frames = this.textures.get('cards').getFrameNames();
        Phaser.Utils.Array.Shuffle(frames);
        return frames;
    }

    //TODO: convert to class
    createTeams() {
    	for (var i = 0; i < 4; i++) {
    		var j = i % 2;
    		var teamId = j === 0 ? 'team13' : 'team24';
    		this.playerList[i].teamId = teamId;
    	}

        var team13 = new Team("team13", [this.playerList[0].id, this.playerList[2].id], 35, 435, this.scene);
        var team24 = new Team("team24", [this.playerList[1].id, this.playerList[3].id], 775, 435, this.scene);
    	return [team13, team24];
    }
}


//game - 4 players, 2 teams, 1 deck, overall points, multiple rounds
//round - dealer, winner/loser, 4 plays, 8 cards per player, 1 trump
//play - 4 cards at the table, one winner per play
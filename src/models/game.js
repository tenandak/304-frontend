import Card from '../models/card';
import Player from '../models/player';
import Round from '../models/round';

export default class Game {
	
	constructor(scene, playerList, socket) {
		this.scene = scene;
		this.currentPlayer = scene.currentPlayer;
		this.playerList = playerList;
		this.socket = socket;
		this.starterIndex = 0;
		
		this.teams = [];
		// this.teams = createTeams(playerList);
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
}


//game - 4 players, 2 teams, 1 deck, overall points, multiple rounds
//round - dealer, winner/loser, 4 plays, 8 cards per player, 1 trump
//play - 4 cards at the table, one winner per play
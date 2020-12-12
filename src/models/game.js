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



        //set player 1 as the dealer
        // if (this.currentPlayer.id === this.playerList[this.starterIndex].id) {
            // this.currentPlayer.setPlayerType(PlayerTypes.DEALER);
            // var frames = this.shuffleDeck();
            // console.log('emitting deal cards');
            // this.socket.emit("dealCards", frames);
            // this.distributeCards(frames);
        // }
    }

    createRound() {
    	var round = new Round(this);
    }


	shuffleDeck() {
        console.log('should only shuffle once');
        var frames = this.textures.get('cards').getFrameNames();
        Phaser.Utils.Array.Shuffle(frames);
        return frames;
    }
}


//game - 4 players, 2 teams, 1 deck, overall points, multiple rounds
//round - dealer, winner/loser, 4 plays, 8 cards per player, 1 trump
//play - 4 cards at the table, one winner per play
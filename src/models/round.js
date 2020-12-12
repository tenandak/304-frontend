import { getPlayerPositions, getPlayerHandPosition} from '../models/playerPositions';
export default class Round { 

	constructor(game) {
		this.scene = game.scene;
		this.socket = game.socket;
		this.setupRound()
		this.deck = game.scene.add.group();

		this.currentPlayer = game.currentPlayer;
		this.starterPlayer = game.playerList[game.starterIndex];
		this.starterIndex = game.starterIndex;
		this.teams = game.teams;
		this.playerList = game.playerList;

		this.createDeck(game);
		// this.deck = this.shuffleCards(game.deck)

	}

	createDeck(game) {
		var frames = this.scene.textures.get('cards').getFrameNames();
        if (this.currentPlayer.id === this.starterPlayer.id) {
            Phaser.Utils.Array.Shuffle(frames);
            this.socket.emit("createDeck", frames);
        }
	}

	setupRound() {
		let self = this;
		this.socket.on('createDeck', function (frames) {
			for (var i = 0; i < frames.length; i++) {
	            if (frames[i] !== 'back') {
	                const card = self.scene.add.sprite(450, 275, 'cards', frames[i]).setInteractive();
	                card.setScale(0.4);
	                self.deck.add(card);
	            }
        	}
        	self.startRound();
		});
	}

	startRound() {
		this.dealHalfDeck(0, 16, 0, () => {
			console.log('NOW THE SECOND HALF');
			this.dealHalfDeck(16, 32, 4);
		});
		//this.selectBidder
		

	}

	dealHalfDeck(start, end, startHandPosition, onComplete) {
		let self = this;
        const timeline = this.scene.tweens.createTimeline();
        var j = 0;
        for (var i = start; i < end; i++) {
            var handPosition = (i % 4) + startHandPosition;
            var card = this.deck.children.entries[i];

            var receivingPlayerIndex = -1;
            if (j >= 0 && j < 4) {
                receivingPlayerIndex = this.starterIndex == 4 ? 0 : this.starterIndex;
            } else if (j >= 4 && j < 8) {
                receivingPlayerIndex = this.starterIndex + 1 == 4 ? 0 : this.starterIndex + 1;
            } else if (j >= 8 && j < 12) {
                receivingPlayerIndex = this.starterIndex + 2 == 4 ? 0 : this.starterIndex + 2;
                // this.player3Hand.add(card);
            } else if (j >= 12 && j < 16) {
                receivingPlayerIndex = this.starterIndex + 3 == 4 ? 0 : this.starterIndex + 3;
            }
            var player = this.playerList[receivingPlayerIndex];
            j++;

            var playerHandPosition = getPlayerHandPosition(player.position.name, handPosition, this.scene.config)
            player.setHand(card);
            timeline.add({ 
                targets: card, 
                y: {value : playerHandPosition.y }, 
                x: { value : playerHandPosition.x}, 
                angle: playerHandPosition.angle,
                duration: 250 
            });
        }
        timeline.setCallback('onComplete', () => {
        	if (onComplete) {
            	onComplete();
        	}
        });  
        timeline.play();
	}

}
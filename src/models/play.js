export default class Play { 

	constructor(round, starterIndex, playerList, currentPlayer) {
		this.round = round;
		this.socket = round.socket;
		this.starterIndex = starterIndex;
		this.playerList = playerList;
		this.currentPlayer = currentPlayer;
		this.table = [];
		this.firstCardSuit = "";
		this.teams = round.teams;
	}

	createMove(movingPlayer) {
    this.zone = this.round.scene.add.zone(450, 265, 625, 250).setRectangleDropZone(625, 250);

    // var graphics = this.round.scene.add.graphics();
    // graphics.lineStyle(2, 0xffff00);
    // graphics.strokeRect(this.zone.x - this.zone.input.hitArea.width / 2, this.zone.y - this.zone.input.hitArea.height / 2, this.zone.input.hitArea.width, this.zone.input.hitArea.height);

		var self = this;
		var cards = movingPlayer.hand;
		cards.forEach((c) => {
			// c.enableDrag(true);
			c.onClick(() => {
				cards.forEach(c => c.removeCardFrameListeners());
				self.socket.emit("playerMoved", self.currentPlayer.id, c.id);
			});
		});
	}

	//may need to put trump in constructor since it's the same throughout the round?
	beginPlay(trump, isTrumpKnown) {
		let self = this;
		self.trump = trump;
		self.isTrumpKnown = isTrumpKnown;
		let movingPlayer = this.playerList[this.starterIndex];

		this.socket.on('playerMoved', function(playerId, cardId) {
			var card = movingPlayer.hand.find(c => c.id === cardId);
			movingPlayer.removeCardFromHand(cardId);
        	self.table.push({
        		playerId: playerId,
        		card: card
        	});

			const timeline = self.round.scene.tweens.createTimeline();
			timeline.add(card.changePositionTween(movingPlayer.position.play.x, movingPlayer.position.play.y, movingPlayer.position.angle));

	        timeline.setCallback('onComplete', () => {
	        	let playerCards = movingPlayer.hand;
	        	let tableCards = self.table;
	        	card.showCard();

				if (tableCards.length === 1) {
					self.firstCardSuit = card.suit;
				}
				
				if (tableCards.length === 4) {
					self.determinePlayWinner(tableCards, self.trump, self.isTrumpKnown, self.firstCardSuit);
				} else {
					var nextIndex = (self.starterIndex + tableCards.length) % 4;
					movingPlayer = self.playerList[nextIndex];
					if (movingPlayer.id === self.currentPlayer.id) {
						var move = self.createMove(movingPlayer);
					}
				}
	        }); 

        	timeline.play();

		});

		if (movingPlayer.id === this.currentPlayer.id) {
			var move = this.createMove(movingPlayer);
		}
	}

	determinePlayWinner(table, trump, isTrumpKnown, firstCardSuit) {
		let cards = table.map(tc => { return tc.card});
		let trumpSuit = trump.suit;

		let sortedCards = cards.sort((c1, c2) => {
			if (c1.suit === trumpSuit && c2.suit !== trumpSuit) {
				return -1;
			} else if (c1.suit !== trumpSuit && c2.suit === trumpSuit) {
				return 1;
			} else if (c1.suit === trumpSuit && c2.suit === trumpSuit) {
				return (c1.value > c2.value ? -1 : 1);
			} else if (c1.suit === firstCardSuit && c2.suit !== firstCardSuit) {
				return -1;
			} else if (c1.suit !== firstCardSuit && c2.suit === firstCardSuit) {
				return 1;
			} else if (c1.suit === firstCardSuit && c2.suit === firstCardSuit) {
				return (c1.value > c2.value ? -1 : 1);
			} else {
				return 0;
			}
		});

		let highestCard = sortedCards[0];
		let winningPlayerId = table.find(tc => tc.card.id === highestCard.id).playerId;
		this.onPlayComplete(winningPlayerId);
	}

	onPlayComplete(winningPlayerId) {
			let cards = this.table.map(tc => { return tc.card});
			let winningPlayer = this.playerList.find(p => p.id === winningPlayerId);
			let winningTeam = this.teams.find(t => t.id === winningPlayer.teamId);

			const timeline = this.round.scene.tweens.createTimeline();

			for (var i = 0; i < cards.length; i++) {
				timeline.add(cards[i].changePositionTween(winningTeam.pilePosition.x + 70, winningTeam.pilePosition.y + 70, 0));
			}
			
			winningTeam.addToCardPile(cards);

			timeline.setCallback('onComplete', () => {
				if (this.currentPlayer.id === winningPlayerId) {
					this.socket.emit('nextPlay', winningPlayerId);
				}
				timeline.destroy();	
			});

			timeline.play();
	}

	clearListeners() {
		this.socket.off('playerMoved');
		this.socket.off('playComplete');
		this.round.scene.input.off('drag');
		this.round.scene.input.off('drop');
	}

}
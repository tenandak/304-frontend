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
		this.isTrumpKnown = false;
	}

	createMove(movingPlayer) {
		var self = this;
		
    	this.zone = this.round.scene.add.zone(450, 265, 625, 250).setRectangleDropZone(625, 250);
		var cards = movingPlayer.hand;
		cards.forEach((c) => {
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

				if (tableCards.length === 1) {
					self.firstCardSuit = card.suit;
	        		card.showCard();
				} else if (tableCards[tableCards.length - 1].card.suit === self.firstCardSuit) {
					card.showCard();
				} else if (self.isTrumpKnown) {
					card.showCard();
				}
				
				if (tableCards.length === 4) {
					self.determinePlayWinner(self.firstCardSuit);
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

	determinePlayWinner(firstCardSuit) {
		let cards = this.table.map(tc => { return tc.card});
		let trumpSuit = this.trump.suit;

		if (!this.isTrumpKnown) {
			var someonePlayedTrump = false;
			cards.forEach(c => {
				if (c.suit === this.trump.suit) {
					someonePlayedTrump = true; //going to duplicate but should happen once
					c.showCard();
				}
			});

			if (someonePlayedTrump) {
				this.isTrumpKnown = true;
			}

			if (someonePlayedTrump && !this.hasTrumpPlayed) {
				this.trump.showCard();
				const timeline = this.round.scene.tweens.createTimeline();
				timeline.add({
	                targets: this.trump.cardFrame, 
	                scaleX: 1.5, 
	                scaleY: 1.5, 
	                duration: 350 
				});
				timeline.add({
	                targets: this.trump.cardFrame, 
	                scaleX: 0.4, 
	                scaleY: 0.4, 
	                duration: 350 
				});
		        timeline.add(this.trump.moveBack());
		        let self = this;
		        timeline.setCallback('onComplete', () => { 
		        	if (!self.currentPlayer.findCardById(self.trump.id)) {
		        		self.trump.hideCard();
		        	}
		        	timeline.destroy()
		        });
		        timeline.play();
			}
		}

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
		let winningPlayerId = this.table.find(tc => tc.card.id === highestCard.id).playerId;
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
					this.socket.emit('nextPlay', winningPlayerId, this.isTrumpKnown);
				}
				timeline.destroy();	
			});
			timeline.play();
	}

	clearListeners() {
		this.socket.off('playerMoved');
		this.socket.off('playComplete');
	}

}
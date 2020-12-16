import { getPlayerPositions, getPlayerHandPosition} from '../models/playerPositions';
import Play from '../models/Play';

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
		this.bidList = this.createBidList();

		this.bidWaitContainer = this.createBidWaitContainer('');
		this.bidWaitContainer.setVisible(false);

		this.createDeck(game);
		// this.deck = this.shuffleCards(game.deck)
	}

	createBidList() {
		return this.playerList.map(p => {
			return {
				id: p.id,
				bid: 0
			};
		})
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

		this.socket.on('promptBid', function(id, minimum, isForced, canAskPartner, bidList, title) {
			self.bidWaitContainer.destroy();
			self.bidList = bidList;
			if (self.currentPlayer.id === id) {
	            var bidContainer = self.createBidContainer(id, minimum, isForced, canAskPartner, title);
        	} else {
        		self.bidWaitContainer = self.createBidWaitContainer(title);
        	}
		});

		this.socket.on('selectTrump', function(id, bid) {
			self.bidWaitContainer.destroy();
			var player = self.playerList.find(p => p.id === id);
			if (self.currentPlayer.id === id) {
				var title = "Please select your trump";
				self.bidWaitContainer = self.createBidWaitContainer(title);
				self.selectTrump();
        	} else {
        		var title = "Player " + player.number + " is selecting trump";
        		self.bidWaitContainer = self.createBidWaitContainer(title);
        	}
		});

		this.socket.on('trumpSelected', function(playerId, cardId) {
			var player = self.playerList.find(p => p.id === playerId);
			var card = player.hand.children.entries.find(c => c.frame.name === cardId);

			const timeline = self.scene.tweens.createTimeline();
			timeline.add({ 
                targets: card, 
                y: {value : player.position.trump.y }, 
                x: { value : player.position.trump.x }, 
                angle: player.position.angle,
                duration: 250 
            });

	        timeline.setCallback('onComplete', () => {
	        	self.bidWaitContainer.destroy();
	        	let playerCards = player.hand.children.entries;
				playerCards.forEach(card => {
					card.removeAllListeners();
				});
	        	self.dealHalfDeck(16, 32, 4, () => {
	        		self.beginRound();
	        	});
	        }); 

        	timeline.play();
		});
	}

	beginRound() {
		var play = new Play(this, this.starterIndex, this.playerList);
		play.beginPlay();

	}

	selectTrump() {
		let playerCards = this.currentPlayer.hand.children.entries;
		playerCards.forEach(card => {
			card.on('pointerdown', () => {
				this.socket.emit("trumpSelected", this.currentPlayer.id, card.frame.name);
				// console.log('SELECTING A CARD', e, card.frame.name
			});
		});
	}

	startRound() {
		this.dealHalfDeck(0, 16, 0, () => {
			if (this.currentPlayer.id === this.starterPlayer.id) {
				this.socket.emit("promptBid", this.starterPlayer.id, 
					170, false, true, this.bidList, "Player " + this.starterPlayer.number + " is selecting a bid");
			}
		});
		// this.dealHalfDeck(16, 32, 4);
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

	createBidWaitContainer(title) {
		var self = this;
        var container = this.scene.add.container(450, 225);
        var rectangle = this.scene.add.rectangle(0, 0, 400, 100, 0x6ae3ff);
        const actionHeader = this.scene.add.text(-145, -10, title, { fill: '#000000', align: 'center' });
        container.add([rectangle, actionHeader]);
        return container;
	}

    createBidContainer (id, minimum, isForced, canAskPartner, title) {
    	var self = this;
        var container = this.scene.add.container(450, 225);
        var rectangle = this.scene.add.rectangle(0, 0, 400, 300, 0x6ae3ff);
        const actionHeader = this.scene.add.text(-145, -140, title, { fill: '#000000', align: 'center' });
        const selectionHeader = this.scene.add.text(-125, -65, 'Please select a bid option', { fill: '#000000', align: 'center' });
        container.add([rectangle, actionHeader, selectionHeader]);

        var j = -30;
        var k = -160;

		function callbackClosure(i, callback) {
		  return function() {
		    return callback(i);
		  }
		}

        for (var i = minimum; i <= 250; i+=10) {
        	const addBid = this.scene.add.text(k, j, i, { fill: '#000000' })
        	.setInteractive()
          	.on('pointerdown', callbackClosure(i, function(i) {
	          	container.destroy();
			  	self.rotateBid(id, i, null);
  			}));

          	container.add([addBid]);
          	if (j == 90) {
          		j = -30;
          		k = -60;
          	} else {
          		j+= 30;
          	}
        }

        if (!isForced) {
        	if (canAskPartner) {
        		const pickAskPartner = this.scene.add.text(40, -30, 'Ask Partner', { fill: '#000000' })
		          .setInteractive()
		          .on('pointerdown', callbackClosure(i, function(i) {
		          	container.destroy();
				  	self.rotateBid(id, minimum, 'askPartner');
		  		  }));
		  		container.add([pickAskPartner]);   
        	} else {
        		const pickPass = this.scene.add.text(40, -30, 'Pass', { fill: '#000000' })
		          .setInteractive()
		          .on('pointerdown', callbackClosure(i, function(i) {
		          	container.destroy();
				  	self.rotateBid(id, minimum, 'pass');
		  		  }));
        		container.add([pickPass]);      
        	}
        }
        return container;
    }

    rotateBid(id, bidValue, passType) {
    	var player = this.playerList.find(p => p.id === id);
    	if (passType === 'askPartner') {
    		var partnerId = this.teams[player.teamId].playerIds.find(pid => pid !== id);
    		for (var i = 0; i < 4; i++) {
    			if (this.bidList[i].id === id) {
    				this.bidList[i].bid = 'pass';
    			}
    		}
    		var partner = this.playerList.find(p => p.id === partnerId);
    		const title = "Player " + player.number + " has asked partner \n" + partner.name + " is selecting a bid";
    		this.socket.emit("promptBid", partnerId, bidValue, true, false, this.bidList, title);
    	} else if (passType === 'pass') {
    		var bidderIndex = 0;
    		for (var i = 0; i < 4; i++) {
    			if (this.bidList[i].id === id) {
    				this.bidList[i].bid = 'pass';
    				bidderIndex = i;
    			}
    		}
    		var passes = this.bidList.filter(b => b.bid === 'pass');
    		var finalBidder = this.bidList.find(b => b.bid !== 'pass');
    		if (passes && passes.length === 3) {
    			this.bidWaitContainer.destroy();
    			this.socket.emit("selectTrump", finalBidder.id, finalBidder.bid);
    		} else {
    			for (var i = 0; i < 4; i++) {
	    			const nextPlayerBid = this.bidList[(bidderIndex + i + 1) % 4];
	    			if (nextPlayerBid.bid !== 'pass' && nextPlayerBid.id !== id) {
	    				var nextPlayer = this.playerList.find(p => p.id === nextPlayerBid.id);
	    				const title = "Player " + player.number + " has passed \n" + nextPlayer.name + " is selecting a bid";
	    				this.socket.emit("promptBid", nextPlayerBid.id, bidValue, false, false, this.bidList, title);
	    				break;
	    			}
    			}
    		}
    	} else {
    		var bidderIndex = 0;
    		for (var i = 0; i < 4; i++) {
    			if (this.bidList[i].id === id) {
    				this.bidList[i].bid = bidValue;
    				bidderIndex = i;
    			}
    		}

    		for (var i = 0; i < 4; i++) {
    			const nextPlayerBid = this.bidList[(bidderIndex + i + 1) % 4];
    			if (nextPlayerBid.bid !== 'pass' && nextPlayerBid.id !== id) {
    				var nextPlayer = this.playerList.find(p => p.id === nextPlayerBid.id);
    				const title = "Player " + player.number + " has bid " + bidValue + "\n" + nextPlayer.name + " is selecting a bid";
    				this.socket.emit("promptBid", nextPlayerBid.id, bidValue + 10, false, false, this.bidList, title);
    				break;
    			}
    		}
    	}
    }

}
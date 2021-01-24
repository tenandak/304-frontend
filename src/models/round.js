import Play from '../models/play';
import Card from '../models/card';
import getBidPoints from '../models/bidPoints';
import { getPlayerPositions, getPlayerHandPosition} from '../models/playerPositions';


export default class Round { 

	constructor(game) {
		this.scene = game.scene;
		this.socket = game.socket;
		this.setupRound();
        this.deck = [];
        this.trump = null;
        this.bid = null;

		this.currentPlayer = game.currentPlayer;
		this.starterPlayer = game.playerList[game.starterIndex];
		this.starterIndex = game.starterIndex;
		this.teams = game.teams;
		this.playerList = game.playerList;
		this.bidList = this.createBidList();

		this.bidWaitContainer = this.createBidWaitContainer('');
		this.bidWaitContainer.setVisible(false);

		this.createDeck(game);
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
                    var card = new Card(self.scene, 450, 275, frames[i]);
                    card.hideCard()
                    self.deck.push(card);
	            }
        	}
        	self.startRound();
		});

		this.socket.on('promptBid', function(id, minimum, isForced, canAskPartner, bidList, title, keepPrevBid) {
			self.bidWaitContainer.destroy();
			self.bidList = bidList;
			if (self.currentPlayer.id === id) {
                self.bidWaitContainer = self.createBidContainer(id, minimum, isForced, canAskPartner, title, keepPrevBid);
        	} else {
        		self.bidWaitContainer = self.createBidWaitContainer(title);
        	}
		});

		this.socket.on('selectTrump', function(id, bid, bidList) {
            self.bidList = bidList;
			self.bidWaitContainer.destroy();

            if (self.trump && self.bid) {
                if (id === self.bid.playerId && self.bid.bid === bid) {
                    self.bid = {
                        playerId: id,
                        bid: bid,
                    };
                    self.beginRound();
                } else {
                    self.reselectingTrump(id, bid);
                    self.openSelectTrumpContainer(id, bid, true);
                }
            } else {
                self.openSelectTrumpContainer(id, bid, false);
            }
		});

		this.socket.on('trumpSelected', function(playerId, cardId, beginRound) {
            self.bidWaitContainer.destroy();
			var player = self.playerList.find(p => p.id === playerId);
			var card = player.hand.find(c => c.id === cardId);

            const timeline = self.scene.tweens.createTimeline();

            // card.hideCard();
            self.trump = card;
            timeline.add(card.changePositionTween(player.position.trump.x, player.position.trump.y, player.position.angle));

            timeline.setCallback('onComplete', () => {
                self.bidWaitContainer.destroy();
                let playerCards = player.hand;
                playerCards.forEach(card => {
                    card.removeCardFrameListeners();
                });

                if (beginRound) {
                    self.beginRound();
                } else {
                    self.dealHalfDeck(16, 32, 4, () => {

                        var finalBidder = self.bidList.find(b => b.bid !== 'pass' && b.bid > 0);
                        var finalBidderNumber = self.playerList.find(p => p.id === finalBidder.id).number;
                        self.bidList.forEach(b => {
                            if (b.bid === 'pass') {
                                b.bid = 0
                            }
                        });
                        var newMinimum = finalBidder.bid < 250 ? 250 : finalBidder.bid;
                        if (self.currentPlayer.id === finalBidder.id) {
                            self.socket.emit("promptBid", finalBidder.id, newMinimum, false, false, self.bidList,
                            "Player " + finalBidderNumber + " has bid " + finalBidder.bid, true);
                        }
                    });
                }
                timeline.destroy();
            }); 
            timeline.play();
		});
	}

    openSelectTrumpContainer(id, bid, beginRound) {
        this.bid = {
            playerId: id,
            bid: bid,
        };
        var player = this.playerList.find(p => p.id === id);
        if (this.currentPlayer.id === id) {
            var title = "Please select your trump";
            this.bidWaitContainer = this.createBidWaitContainer(title);
            this.selectTrump(beginRound);
        } else {
            var title = "Player " + player.number + " is selecting trump";
            this.bidWaitContainer = this.createBidWaitContainer(title);
        }
    }

    reselectingTrump(playerId, bid) {
        const timeline = this.scene.tweens.createTimeline();
        timeline.add(this.trump.moveBack());
        timeline.play();
    }

    //TODO: socket for play winner and start next play OR turn onto a callback function
	beginRound() {
        let self = this;
        let totalPlays = 0;
        this.socket.on('nextPlay', function(winningPlayerId, isTrumpKnown) {
            totalPlays++;

            var newStarterIndex = self.playerList.findIndex(p => p.id === winningPlayerId);
            self.play.clearListeners();
            if (totalPlays < 8) {
                self.play = new Play(self, newStarterIndex, self.playerList, self.currentPlayer);
                self.play.beginPlay(self.trump, isTrumpKnown);
            } else {
                self.determineRoundWinner();
                if (self.teams.find(t => t.points !== 0)) {
                    totalPlays = 0;
                    self.restartRound();
                } else {
                    alert("we have a winner!!!")
                }
                
            }

        });

		this.play = new Play(this, this.starterIndex, this.playerList, this.currentPlayer);
		this.play.beginPlay(this.trump, false);
	}

    determineRoundWinner() {
        var player = this.playerList.find(p => p.id === this.bid.playerId);
        var team = this.teams.find(t => t.id === player.teamId);
        var otherTeam = this.teams.find(t => t.id !== player.teamId);
        var cardValues = team.cardPile.map(c => c.value);
        var total = cardValues.reduce((a,b) => a + b, 0);

        var points = getBidPoints(this.bid.bid);
        if (total >= this.bid.bid) {
            alert (team.id + " wins " + "with bid: " + this.bid.bid + " and points: " + total);
            team.winningPoints += points.win;
            otherTeam.points -= points.win;
        } else {
            alert (team.id + " loses " + "with bid: " + this.bid.bid + " and points: " + total);
            otherTeam.winningPoints += points.lose;
            team.points -= points.lose;
        }
        team.updatePointBoard();
        otherTeam.updatePointBoard();
    }

    restartRound() {
        let self = this;
        const timeline = this.scene.tweens.createTimeline();
        var cardPiles = this.teams.map(t => t.cardPile);

        cardPiles.forEach((cp) => {
            cp.forEach(c => timeline.add(c.changePositionTween(450, 275, 0)));
            this.deck.push(...cp);
        });

        this.teams.forEach(t => t.clearCardPile());

        timeline.setCallback('onComplete', () => {
            this.starterIndex = (this.starterIndex + 1) % 4;
            this.starterPlayer = this.playerList[this.starterIndex];
            this.trump = null;
            this.bid = null;
            this.bidList = this.createBidList();

            this.startRound();
        }); 

        timeline.play();
    }

	selectTrump(beginRound) {
		let playerCards = this.currentPlayer.hand;
		playerCards.forEach(card => {
            card.onClick(() => {
                this.socket.emit("trumpSelected", this.currentPlayer.id, card.id, beginRound);
            });
		});
	}

	startRound() {
		this.dealHalfDeck(0, 16, 0, () => {
			if (this.currentPlayer.id === this.starterPlayer.id) {
				this.socket.emit("promptBid", this.starterPlayer.id, 
					170, false, true, this.bidList, "Player " + this.starterPlayer.number + " is selecting a bid", false);
			}
		});
	}

	dealHalfDeck(start, end, startHandPosition, onComplete) {
		let self = this;
        const timeline = this.scene.tweens.createTimeline();
        var j = 0;
        for (var i = start; i < end; i++) {
            var handPosition = (i % 4) + startHandPosition;
            var card = this.deck[i];

            var receivingPlayerIndex = -1;
            if (j >= 0 && j < 4) {
                receivingPlayerIndex = this.starterIndex % 4;
            } else if (j >= 4 && j < 8) {
                receivingPlayerIndex = (this.starterIndex + 1) % 4;
            } else if (j >= 8 && j < 12) {
                receivingPlayerIndex = (this.starterIndex + 2) % 4;
                // this.player3Hand.add(card);
            } else if (j >= 12 && j < 16) {
                receivingPlayerIndex = (this.starterIndex + 3) % 4;
            }
            var player = this.playerList[receivingPlayerIndex];
            if (this.currentPlayer.id === player.id) {
                card.showCard();
            }
            j++;

            var playerHandPosition = getPlayerHandPosition(player.position.name, handPosition, this.scene.config)
            player.setHand(card);
            timeline.add(card.changePositionTween(playerHandPosition.x, playerHandPosition.y, playerHandPosition.angle));
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

    createBidContainer (id, minimum, isForced, canAskPartner, title, keepPrevBid) {
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

        for (var i = minimum; i <= 300; i+=10) {
        	const addBid = this.scene.add.text(k, j, i, { fill: '#000000' })
        	.setInteractive()
          	.on('pointerdown', callbackClosure(i, function(i) {
	          	container.destroy();
			  	self.rotateBid(id, i, null, false);
  			}));

          	container.add([addBid]);
          	if (j == 90) {
          		j = -30;
          		k += 100;
          	} else {
          		j+= 30;
          	}
        }

        if (!isForced) {
        	if (canAskPartner) {
        		const pickAskPartner = this.scene.add.text(k, j, 'Ask Partner', { fill: '#000000' })
		          .setInteractive()
		          .on('pointerdown', callbackClosure(i, function(i) {
		          	container.destroy();
				  	self.rotateBid(id, minimum, 'askPartner', false);
		  		  }));
		  		container.add([pickAskPartner]);   
        	} else {
        		const pickPass = this.scene.add.text(40, j+30, 'Pass', { fill: '#000000' })
		          .setInteractive()
		          .on('pointerdown', callbackClosure(i, function(i) {
		          	container.destroy();
                    self.rotateBid(id, minimum, 'pass', keepPrevBid);
		  		  }));
        		container.add([pickPass]);      
        	}
        }
        return container;
    }

    rotateBid(id, bidValue, passType, keepPrevBid) {
    	var player = this.playerList.find(p => p.id === id);
    	if (passType === 'askPartner') {
    		var team = this.teams.find(t => t.id === player.teamId);
            var partnerId = team.playerIds.find(pid => pid !== player.id);
    		for (var i = 0; i < 4; i++) {
    			if (this.bidList[i].id === id) {
    				this.bidList[i].bid = 'pass';
    			}
    		}

    		var partner = this.playerList.find(p => p.id === partnerId);
    		const title = "Player " + player.number + " has asked partner \n" + partner.name + " is selecting a bid";
    		this.socket.emit("promptBid", partnerId, bidValue, true, false, this.bidList, title, false);
    	} else if (passType === 'pass') {
    		var bidderIndex = 0;
    		for (var i = 0; i < 4; i++) {
    			if (this.bidList[i].id === id) {
                    if (!keepPrevBid) {
                        this.bidList[i].bid = 'pass';
                    }

    				bidderIndex = i;
    			}
    		}
    		var passes = this.bidList.filter(b => b.bid === 'pass');
    		var finalBidder = this.bidList.find(b => b.bid !== 'pass');
    		if (passes && passes.length === 3) {
    			this.bidWaitContainer.destroy();

    			this.socket.emit("selectTrump", finalBidder.id, finalBidder.bid, this.bidList);
    		} else {
    			for (var i = 0; i < 4; i++) {
	    			const nextPlayerBid = this.bidList[(bidderIndex + i + 1) % 4];
	    			if (nextPlayerBid.bid !== 'pass' && nextPlayerBid.id !== id) {
	    				var nextPlayer = this.playerList.find(p => p.id === nextPlayerBid.id);
	    				const title = "Player " + player.number + " has passed \n" + nextPlayer.name + " is selecting a bid";
	    				this.socket.emit("promptBid", nextPlayerBid.id, bidValue, false, false, this.bidList, title, false);
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
    				this.socket.emit("promptBid", nextPlayerBid.id, bidValue + 10, false, false, this.bidList, title, false);
    				break;
    			}
    		}
    	}
    }

    endRound() {
        this.socket.off('promptBid');
        this.socket.off('nextPlay');
        this.socket.off('trumpSelected');
        this.socket.off('createDeck');
        this.socket.off('playerMoved');
        this.socket.off('playComplete');

        this.deck.forEach(c => c.destroyCard());
        this.deck = [];
        this.bidWaitContainer.destroy();
    }

}
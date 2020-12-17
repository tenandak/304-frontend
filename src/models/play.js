export default class Play { 

	constructor(round, starterIndex, playerList, currentPlayer) {
		this.round = round;
		this.socket = round.socket;
		this.starterIndex = starterIndex;
		this.playerList = playerList;
		this.currentPlayer = currentPlayer;
		this.table = [];
	}

	createMove(movingPlayer) {
    this.zone = this.round.scene.add.zone(450, 265, 625, 250).setRectangleDropZone(625, 250);

    // var graphics = this.round.scene.add.graphics();
    // graphics.lineStyle(2, 0xffff00);
    // graphics.strokeRect(this.zone.x - this.zone.input.hitArea.width / 2, this.zone.y - this.zone.input.hitArea.height / 2, this.zone.input.hitArea.width, this.zone.input.hitArea.height);

		// var player = this.playerList[this.starterIndex];
		var self = this;
		var cards = movingPlayer.hand;
		cards.forEach((c) => {
			c.enableDrag(true);
		});

		this.round.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
			console.log('DRAGGING IS CALLED');
			// gameObject.setScale(gameObject.y / height);
	        gameObject.x = pointer.x;
	        gameObject.y = pointer.y;
	    });

	    this.round.scene.input.on('drop', function (pointer, gameObject, dropZone) {
	    	gameObject.x = movingPlayer.position.play.x;
        	gameObject.y = movingPlayer.position.play.y;
        	self.socket.emit("playerMoved", self.currentPlayer.id, gameObject.frame.name);
	    });
	}

	beginPlay() {
		let self = this;
		// let totalMoves = 0;
		let movingPlayer = this.playerList[this.starterIndex];

		this.socket.on('playerMoved', function(playerId, cardId) {
			// var player = self.playerList.find(p => p.id === playerId); NEED TO FIGURE OUT WHY NULL
			var card = movingPlayer.hand.find(c => c.id === cardId);
        	self.table.push(card);

			const timeline = self.round.scene.tweens.createTimeline();
			timeline.add(card.changePositionTween(movingPlayer.position.play.x, movingPlayer.position.play.y, movingPlayer.position.angle));

	        timeline.setCallback('onComplete', () => {
	        	let playerCards = movingPlayer.hand;
	        	let tableCards = self.table;

				playerCards.forEach(c => {
					c.enableDrag(false)
				});
				
				if (tableCards.length === 4) {
					alert("table is full!");
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

		// var player = this.playerList[this.starterIndex];
		if (movingPlayer.id === this.currentPlayer.id) {
			var move = this.createMove(movingPlayer);
		}
	}


}
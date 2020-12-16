export default class Play { 

	constructor(round, starterIndex, playerList) {
		this.round = round;
		this.starterIndex = starterIndex;
		this.playerList = playerList;
	}

	createMove(player) {
    this.zone = this.round.scene.add.zone(450, 265, 625, 250).setRectangleDropZone(625, 250);

    // var graphics = this.round.scene.add.graphics();
    // graphics.lineStyle(2, 0xffff00);
    // graphics.strokeRect(this.zone.x - this.zone.input.hitArea.width / 2, this.zone.y - this.zone.input.hitArea.height / 2, this.zone.input.hitArea.width, this.zone.input.hitArea.height);

		var player = this.playerList[this.starterIndex];
		var cards = player.hand;
		cards.children.entries.forEach((c) => {
			this.round.scene.input.setDraggable(c);
		});

		this.round.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
			console.log('DRAGGING IS CALLED');
			// gameObject.setScale(gameObject.y / height);
	        gameObject.x = pointer.x;
	        gameObject.y = pointer.y;
	    });

	    this.round.scene.input.on('drop', function (pointer, gameObject, dropZone) {
	    	console.log('DRAGGING IS CALLED');
	    	gameObject.x = player.position.play.x;
        	gameObject.y = player.position.play.y;
	    });
	}

	beginPlay() {
		var player = this.playerList[this.starterIndex];
		var move = this.createMove(player);
	}


}
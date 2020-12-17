export default class Card {
    constructor(scene, x, y, frame) {
    	this.cardFrame = scene.add.sprite(x, y, 'cards', frame).setInteractive();
	    this.cardFrame.setScale(0.4);

	    this.scene = scene;
    	this.id = this.cardFrame.frame.name;

    }

    changePositionTween(x, y, angle) {
    	return { 
                targets: this.cardFrame, 
                x: {value : x}, 
                y: {value : y}, 
                angle: angle,
                duration: 250 
        };
    }

    onClick(clickMethod) {
    	this.cardFrame.on('pointerdown', () => {
			clickMethod();
		});
    }

    removeCardFrameListeners() {
		this.cardFrame.removeAllListeners();
    }

    enableDrag(isEnabled) {
    	if (isEnabled) {
			this.scene.input.setDraggable(this.cardFrame);
    	} else {
    		this.scene.input.setDraggable(this.cardFrame, false);
    	}
    }
}



        // this.render = (x, y, sprite) => {
        //     let card = scene.add.image(x, y, sprite).setScale(0.3, 0.3).setInteractive();
        //     scene.input.setDraggable(card);
        //     return card;
        // }
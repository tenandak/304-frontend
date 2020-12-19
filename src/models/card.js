export default class Card {
    constructor(scene, x, y, frame) {
	    this.scene = scene;
    	this.frame = frame;
    	
    	this.cardFrame = scene.add.sprite(x, y, 'cards', frame).setInteractive();
	    this.cardFrame.setScale(0.4);

    	this.id = this.cardFrame.frame.name;
    	this.type = this.cardFrame.frame.customData.type;
    	this.value = this.cardFrame.frame.customData.value;
    	this.suit = this.cardFrame.frame.customData.suit;
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

    hideCard() {
    	this.cardFrame.setFrame('back');
    }

    showCard() {
        this.cardFrame.setFrame(frame);
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
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

        this.prevX = x;
        this.prevY = y;
        this.prevAngle = 0;
    }

    changePositionTween(x, y, angle) {
        this.prevX = this.cardFrame.x;
        this.prevY = this.cardFrame.y;
        this.prevAngle = this.cardFrame.angle;

    	return { 
                targets: this.cardFrame, 
                x: {value : x}, 
                y: {value : y}, 
                angle: angle,
                duration: 250 
        };
    }

    moveBack() {
        console.log('CURRENT POSITION', this.cardFrame.x, this.cardFrame.y);
        console.log('PREVIOUS POSITION', this.prevX, this.prevY);
        var newPositionTweet = { 
                targets: this.cardFrame, 
                x: {value : this.prevX}, 
                y: {value : this.prevY}, 
                angle: this.prevAngle,
                duration: 250 
        };

        this.prevX = this.cardFrame.x;
        this.prevY = this.cardFrame.y;
        this.prevAngle = this.cardFrame.angle;

        return newPositionTweet;
    }

    hideCard() {
    	this.cardFrame.setFrame('back');
    }

    showCard() {
        this.cardFrame.setFrame(this.frame);
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
import Card from '../models/card';
import Player from '../models/player';
import { getPlayerPositions, getPlayerHandPosition} from '../models/playerPositions';
import PlayerTypes from '../models/playerTypes'
import io from 'socket.io-client';

export default class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'Game'
        });
        this.config = {
            width: 900,
            height: 550,
        };
    }


    preload() {
        this.load.atlas('cards', 'src/assets/cards.png', 'src/assets/cards.json');
    }


    create() {
        let self = this;
        let config = this.config;
        self.deck = this.add.group();
        self.currentPlayer = null;
        self.playerObjs = {};
        self.playerList = [];
        self.dealerIndex = 0;
        self.playerPositions = getPlayerPositions(config);

        var style = { fontSize: "16px", fill: "#ffffff", align: "center", border: "1px solid #ffffff" };
        var beforeGameText = self.add.text(config.width/3, config.height/2, 
            'THE GAME WILL BEGIN WHEN \nFOUR PLAYERS HAVE ENTERED THE ROOM', style);
        beforeGameText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);


        // this.socket = io('http://localhost:3000');
        this.socket = io('http://localhost:3000', {transports: ['websocket', 'polling', 'flashsocket']});

        this.socket.on('connect', function () {
            console.log('Connected!');
        });

        this.socket.on('PlayerRegistered', function (players) {
            if (self.currentPlayer === null && players.length <= 4) {
                self.currentPlayer = new Player(self, self.playerPositions[0], players[players.length - 1], true);
                self.playerObjs[self.currentPlayer.id] = self.currentPlayer;

                var lastPosition = 3;
                for (let i = players.length - 2; i >= 0; i--) {
                    let prevJoinedPlayer = new Player(self, self.playerPositions[lastPosition], players[i], false);
                    self.playerObjs[prevJoinedPlayer.id] = prevJoinedPlayer;
                    lastPosition--;
                }                
            } else {
                var newPlayerRelativeIndex = (players.length) - self.currentPlayer.number;
                let newJoinedPlayer = new Player(self, self.playerPositions[newPlayerRelativeIndex], 
                    players[players.length - 1], false);
                self.playerObjs[newJoinedPlayer.id] = newJoinedPlayer;
            }

            if (players.length === 4) {
                beforeGameText.destroy();
                self.playerList = players;
                self.beginGame();
            }

        });

        this.socket.on('dealCards', function (frames) {
            console.log('create deck');
            for (var i = 0; i < frames.length; i++) {
                if (frames[i] !== 'back') {
                    const card = self.add.sprite(450, 275, 'cards', frames[i]).setInteractive();
                    card.setScale(0.5);
                    self.deck.add(card);
                }
            }

            console.log('distribute deck');
            // start with the right from the dealer

            const timeline = self.tweens.createTimeline();
            //PUT BACK self.deck.children.size
            for (var i = 0; i < 16; i++) {
                var handPosition = i % 4;
                var card = self.deck.children.entries[i];

                var receivingPlayerIndex = -1;
                if (i >= 0 && i < 4) {
                    receivingPlayerIndex = self.dealerIndex + 1 == 4 ? 0 : self.dealerIndex + 1;
                } else if (i >= 4 && i < 8) {
                    receivingPlayerIndex = self.dealerIndex + 2 == 4 ? 0 : self.dealerIndex + 2;
                } else if (i >= 8 && i < 12) {
                    receivingPlayerIndex = self.dealerIndex + 3 == 4 ? 0 : self.dealerIndex + 3;
                    // this.player3Hand.add(card);
                } else if (i >= 12 && i < 16) {
                    receivingPlayerIndex = self.dealerIndex + 4 == 4 ? 0 : self.dealerIndex + 4;
                }
                var player = self.playerObjs[self.playerList[receivingPlayerIndex].id];

                var playerHandPosition = getPlayerHandPosition(player.position.name, handPosition, self.config)
                player.setHand(card);
                timeline.add({ 
                    targets: card, 
                    y: {value : playerHandPosition.y }, 
                    x: { value : playerHandPosition.x}, 
                    angle: playerHandPosition.angle,
                    duration: 250 
                });
            }
            timeline.play();
        });
    }

    beginGame() {
        //set player 1 as the dealer
        if (this.currentPlayer.id === this.playerList[this.dealerIndex].id) {
            this.currentPlayer.setPlayerType(PlayerTypes.DEALER);
            var frames = this.shuffleDeck();
            console.log('emitting deal cards');
            this.socket.emit("dealCards", frames);
            // this.distributeCards(frames);
        }
    }

    shuffleDeck() {
        console.log('should only shuffle once');
        var frames = this.textures.get('cards').getFrameNames();
        Phaser.Utils.Array.Shuffle(frames);
        return frames;
    }

    distributeCards (frames) {
        // var config = this.config;
        // const timeline = this.tweens.createTimeline();
        // for (var i = 0; i < this.deck.children.size; i++) {
        //     var handPosition = i % 4;
        //     var card = this.deck.children.entries[i];
        //     if (i >= 0 && i < 4) {
        //         timeline.add({ 
        //             targets: card, 
        //             y: {value : config.height - 35*3 }, 
        //             x: { value : config.width/2 - 50 + (handPosition*35)}, 
        //             angle: 0,
        //             ease: 'Power1',
        //             duration: 250 
        //         });
        //         // this.player1Hand.add(card);
        //     } else if (i >= 4 && i < 8) {
        //         timeline.add({ 
        //             targets: card, 
        //             y: {value : config.height/2 + 50 - (handPosition*35) }, 
        //             x: { value : config.width - 35*3},
        //             angle: 90, 
        //             duration: 250 
        //         });
        //         // this.player2Hand.add(card);
        //     } else if (i >= 8 && i < 12) {
        //         timeline.add({ 
        //             targets: card, 
        //             y: {value : 35*3 }, 
        //             x: { value : config.width/2 + 50 - (handPosition*35)},
        //             angle: 180, 
        //             duration: 250 
        //         });
        //         // this.player3Hand.add(card);
        //     } else if (i >= 12 && i < 16) {
        //         this.player4Hand.add(card);
        //         timeline.add({ 
        //             targets: card, 
        //             y: {value : config.height/2 - 50 + (handPosition*35) }, 
        //             x: { value : 35*3},
        //             angle: 270, 
        //             duration: 250 
        //         });
        //     }
        // }
        
        // timeline.play();
    }
    
    update() {
    
    }
}
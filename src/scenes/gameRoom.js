// import Card from '../models/card';
import Player from '../models/player';
import Game from '../models/game';
import { getPlayerPositions, getPlayerHandPosition} from '../models/playerPositions';
import PlayerTypes from '../models/playerTypes'
import io from 'socket.io-client';

export default class GameRoom extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameRoom'
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
        self.game = null;
        self.currentPlayer = null;
        self.playerObjs = {};
        self.playerPositions = getPlayerPositions(config);

        this.beforeGameHeader();

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
                self.beforeGameText.destroy();
                var playerList = players.map(p => self.playerObjs[p.id]);

                self.game = new Game(self, playerList, self.socket);
                self.game.beginGame();
            }

        });

        this.socket.on('dealCards-old', function (frames) {
            console.log('create deck');


            var bidContainer = self.createBidContainer(self, false);
            bidContainer.setVisible(false); 

            // clickButton.visible = false;
            
            timeline.setCallback('onComplete', () => {
                console.log('TIMELINE COMPLETE!!')
                receivingPlayerIndex = self.dealerIndex + 1 == 4 ? 0 : self.dealerIndex + 1;
                if (self.playerList[receivingPlayerIndex].id === self.currentPlayer.id) {
                    bidContainer.setVisible(true); 
                }

            });  

            timeline.play();

        });
    }

    beforeGameHeader() {
        var style = { fontSize: "16px", fill: "#ffffff", align: "center", border: "1px solid #ffffff" };
        this.beforeGameText = this.add.text(this.config.width/3, this.config.height/2, 
            'THE GAME WILL BEGIN WHEN \nFOUR PLAYERS HAVE ENTERED THE ROOM', style);
        this.beforeGameText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }

    createBidContainer (self, isForced) {
        var container = self.add.container(450, 275);
        var rectangle = self.add.rectangle(0, 0, 300, 300, 0x6ae3ff);
        const header = self.add.text(-100, -100, 'Would you like to bid?', { fill: '#000000', align: 'center' });

        const pick70 = self.add.text(-80, -30, '70', { fill: '#000000' })
          .setInteractive()
          .on('pointerdown', () => console.log('70'));
        const pick80 = self.add.text(-80, 0, '80', { fill: '#000000' })
          .setInteractive()
          .on('pointerdown', () => console.log('80'));
        const pick90 = self.add.text(-80, 40, '90', { fill: '#000000' })
          .setInteractive()
          .on('pointerdown', () => console.log('90'));

        const pick100 = self.add.text(0, -30, '100', { fill: '#000000' })
          .setInteractive()
          .on('pointerdown', () => console.log('100'));
        const pick250 = self.add.text(0, 0, '250', { fill: '#000000' })
          .setInteractive()
          .on('pointerdown', () => console.log('250'));
        const pickAskPartner = self.add.text(0, 40, 'Ask Partner', { fill: '#000000' })
          .setInteractive()
          .on('pointerdown', () => console.log('askPartner'));             
       

        container.add([rectangle, pick70, pick80, pick90, pick100, pick250, pickAskPartner, header]);
        return container;
    }

    update() {
    
    }
}
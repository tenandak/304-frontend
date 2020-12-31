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

    update() {
        
    }

    create() {
        let self = this;
        let config = this.config;
        self.game = null;
        self.currentPlayer = null;
        self.playerObjs = {};
        self.playerPositions = getPlayerPositions(config);
        self.beforeGameHeader();

        this.socket = io('http://localhost:3000', {transports: ['websocket', 'polling', 'flashsocket']});

        this.socket.on('connect', function () {
            console.log('Connected!');
        });

        this.socket.on('playerRegistered', function (players) {
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

        this.socket.on('gameFull', function() {
            self.beforeGameText.destroy();
            if (self.currentPlayer === null) {
                self.gameIsFullHeader();
            }
        });

        this.socket.on('removePlayer', function(playerId) {
            if (self.playerObjs[playerId] !== null) {
                var removedPlayer = self.playerObjs[playerId];
                removedPlayer.destroyPlayer();
                delete self.playerObjs[playerId]; 
                self.game.endGame();
                self.beforeGameHeader();
            }
        });
    }

    gameIsFullHeader() {
        this.displayHeader('THIS GAME IS CURRENTLY FULL \nFOUR PLAYERS HAVE ENTERED THE ROOM');
    }

    beforeGameHeader() {
        this.displayHeader('THE GAME WILL BEGIN WHEN \nFOUR PLAYERS HAVE ENTERED THE ROOM');
    }

    displayHeader(headerText) {
        var style = { fontSize: "21px", fill: "#ffffff", align: "center", border: "1px solid #ffffff" };
        this.beforeGameText = this.add.text(this.config.width/4, this.config.height/2, 
            headerText, style);
        this.beforeGameText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }
}
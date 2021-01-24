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
        console.log('INSIDE GAMEROOM.JS CREATE');
        console.log('process.env', process.env);
        let self = this;
        let config = this.config;
        self.game = null;
        self.currentPlayer = undefined;
        self.playerObjs = {};
        self.playerPositions = getPlayerPositions(config);
        self.beforeGameHeader();
        this.socket = io(process.env.API_URL, {transports: ['websocket', 'polling', 'flashsocket']});

        this.socket.on('connect', function () {
            console.log('player connected!');
            self.currentPlayerId = self.socket.id;
        });

        this.socket.on('playerJoined', function (players) {
            let playerIndex;
            for (let i = 0; i < players.length; i++) {
                if (players[i] && (players[i].id === self.currentPlayerId)) {
                    if (self.currentPlayer === undefined) {
                        self.currentPlayer = new Player(self, self.playerPositions[0], players[i], true);
                        self.playerObjs[self.currentPlayer.id] = self.currentPlayer;
                    }
                    playerIndex = i;
                }
            }

            for (let j = 1; j < players.length; j++) { //should only be # of players - yourself
                playerIndex = (playerIndex + 1) % 4;
                if (players[playerIndex] !== null && !self.playerObjs[players[playerIndex].id]) {
                    let otherPlayer =
                        new Player(self, self.playerPositions[j], players[playerIndex], false);
                    self.playerObjs[otherPlayer.id] = otherPlayer;
                }
            }

            let playerList = players
                .filter(p => p !== null)
                .map(p => self.playerObjs[p.id]);

            if (playerList.length === 4) {
                self.beforeGameText.destroy();
                self.game = new Game(self, playerList, self.socket);
                self.game.beginGame();
            }
        });

        this.socket.on('gameFull', function() {
            self.beforeGameText.destroy();
            if (self.currentPlayer === undefined) {
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
import Phaser from "phaser";
import GameRoom from "./scenes/gameRoom";

const config = {
    type: Phaser.AUTO,
    parent: "304-front-end",
    backgroundColor: '#247293',
    width: 900,
    height: 550,
    scene: [
        GameRoom
    ]
};
console.log('INDEX JS dotnev', process.env);
const game = new Phaser.Game(config);
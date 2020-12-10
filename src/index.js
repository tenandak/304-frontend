import Phaser from "phaser";
import Game from "./scenes/game";

const config = {
    type: Phaser.AUTO,
    parent: "304-front-end",
    backgroundColor: '#247293',
    width: 900,
    height: 550,
    scene: [
        Game
    ]
};

const game = new Phaser.Game(config);


class Game {

    _gameboards = {};

    constructor () {

    }

    addGameBoard (gameBoard) {

        this._gameboards[this.generateId()] = gameBoard;

    }

    generateId (length = 4) {

        var id = "";

        do {

            for (let i = 0; i < length; i++) {

                id += Math.floor(Math.random() * 10);

            }

        }while (this.getGameBoard(id));

        return id;

    }

    getGameBoard (id) {

        return this._gameboards[id];

    }

}

exports.Game = Game;
exports.generate

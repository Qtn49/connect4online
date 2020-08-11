class Game {

    _gameboards = {};
    _players = {};

    constructor () {

    }

    addGameBoard (gameBoard) {

        this._gameboards[this.generateId()] = gameBoard;

    }

    addPlayer (player) {

        let id = this.generateId();

        this._players[id] = player;

        return id;

    }

    generateId (length = 4) {

        var id = "";

        do {

            for (let i = 0; i < length; i++) {

                id += Math.floor(Math.random() * 10);

            }

        }while (this.getPlayer(id));

        return id;

    }

    getPlayer (id) {

        return this._players[id];

    }

    broadcast (message) {

        for (let [,p] of Object.entries(this._players)) {

            console.log(p)
            p.ws.send(message);

        }

    }

}

exports.Game = Game;

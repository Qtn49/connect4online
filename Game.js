class Game {

    _gameboards = {};
    _players = [];

    constructor () {

    }

    addGameBoard (gameBoard) {



    }

    addPlayer (player) {

        this._players.push(player);

    }

    getPlayer (id) {

        return this._players.find(player => {
            return player._id.toString() === id.toString();
        });

    }

    broadcast (message) {

        for (let [,p] of Object.entries(this._players)) {

            console.log(p)
            p.ws.send(message);

        }

    }

}

exports.Game = Game;

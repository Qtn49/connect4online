class Game {

    _gameboards = [];
    _players = [];

    constructor () {

    }

    addGameBoard (gameBoard) {

        this._gameboards.push(gameBoard);

    }

    findGameBoard (player1, player2) {

        this._gameboards.forEach((g) => {
            console.log(g);
            if (g.players.indexOf(player1) !== -1 && g.getPlayers().indexOf(player2) !== -1) {
                return g;
            }
        });

        return null;

    }

    findGameBoardById (id) {

        return this._gameboards.filter(g => g._id === id)[0];

    }

    addPlayer (player) {

        this._players.push(player);

    }

}

exports.Game = Game;

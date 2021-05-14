const uniqid = require('uniqid');

class GameBoard {

    _id;
    _board;
    _players = [];

    constructor (player1, player2) {

        this._id = uniqid();
        this._board = new Array(7).fill(0).map(() => new Array(6).fill(0));
        if (Math.random() < 0.5)
            player1._playing = true;
        else
            player2._playing = true;
        this._players.push(player1, player2);

    }

    play(column, redTurn) {

        for (let i in this._board[column]) {
            if (this._board[column][i] === 0) {

                this._board[column][i] = this.getValue(redTurn);

                return i;

            }
        }

        return -1;

    }

    getValue(redTurn) {
        return redTurn ? 1 : -1;
    }

    checkWinner(row, column) {

        var coords = [];

        coords.push(this.checkVertical(row, column));

        coords.push(this.checkRow(row, column));

        coords.push(this.checkDiagonalLeft(row, column));

        coords.push(this.checkDiagonalRight(row, column));

        coords = coords.filter(value => value);

        return coords;

    }

    checkVertical(row, column) {

        let i = row, n = 0, value = this._board[column][row];

        while (this._board[column][i] === value) {

            i--;
            n++;

        }

        return n === 4 ? [i + 1, parseInt(column), parseInt(row), parseInt(column)] : null;

    }

    checkRow(row, column) {

        let i = column, value = this._board[column][row], n = 0;

        while (i > 0 && this._board[i - 1][row] === value) {
            i--;
        }

        let start = i;

        while (i <= 6 && this._board[i][row] === value) {

            i++;
            n++;

        }

        return n === 4 ? [parseInt(row), parseInt(start), parseInt(row), i - 1] : null;

    }

    checkDiagonalLeft (row, column) {

        let i = column, j = row, value = this._board[column][row], n = 0;

        while (i > 0 && j > 0 && this._board[i - 1][j - 1] === value) {
            i--;
            j--;

        }

        let columnStart = i, rowStart = j;

        while (i < 7 && this._board[i][j] === value) {

            i++;
            j++;
            n++;

        }

        return n === 4 ? [parseInt(rowStart), parseInt(columnStart), j - 1, i - 1] : null;

    }

    checkDiagonalRight (row, column) {

        let i = parseInt(column), j = row, value = this._board[column][row], n = 0;

        while (i < 6 && j > 0 && this._board[i + 1][j - 1] === value) {
            i++;
            j--;

        }

        let columnStart = i, rowStart = j;

        while (i > 0 && this._board[i][j] === value) {

            i--;
            j++;
            n++;

        }

        return n === 4 ? [parseInt(rowStart), parseInt(columnStart), j - 1, i - 1] : null;

    }

    reset() {
        this._board = new Array(7).fill(0).map(() => new Array(6).fill(0));
        this.players.forEach(el => {
            el._playing = false;
        });
        if (Math.random() < 0.5)
            this.players[0]._playing = true;
        else
            this.players[1]._playing = true;
    }

    getCurrentPlayer() {
        return this._players.filter(p => p._playing)[0];
    }

    getWaitingPlayer() {
        return this._players.filter(p => !p._playing)[0];
    }

    get id() {
        return this._id;
    }

    get players() {
        return this._players;
    }
}

exports.GameBoard = GameBoard;

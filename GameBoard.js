class GameBoard {

    _board;

    constructor() {

        this._board = new Array(7).fill(0).map(() => new Array(6).fill(0));

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

        coords = coords.filter(value => value);

        console.log(coords)

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
            console.log(i)
            i--;

        }

        let start = i;

        while (this._board[i][row] === value) {

            i++;
            n++;

        }

        return n === 4 ? [parseInt(row), parseInt(start), parseInt(row), i] : null;

    }

}

exports.GameBoard = GameBoard;

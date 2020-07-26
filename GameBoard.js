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

        coords.push(this.checkDiagonalLeft(row, column));

        coords.push(this.checkDiagonalRight(row, column));

        coords = coords.filter(value => value);

        console.log('win', coords)

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
            console.log('bite 1')

        }

        let start = i;

        while (i <= 6 && this._board[i][row] === value) {

            console.log(i)
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

            console.log(i)

        }

        return n === 4 ? [parseInt(rowStart), parseInt(columnStart), j - 1, i - 1] : null;

    }

    checkDiagonalRight (row, column) {

        let i = parseInt(column), j = row, value = this._board[column][row], n = 0;

        console.log('yo', i + 1, this._board[i])

        while (i < 6 && j > 0 && this._board[i + 1][j - 1] === value) {
            i++;
            j--;
            console.log('value', i)

        }

        let columnStart = i, rowStart = j;

        while (i > 0 && this._board[i][j] === value) {

            i--;
            j++;
            n++;

            console.log(i)

        }

        return n === 4 ? [parseInt(rowStart), parseInt(columnStart), j - 1, i - 1] : null;

    }

}

exports.GameBoard = GameBoard;

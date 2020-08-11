class Player {

    _ws = null;
    _color = "";
    _pseudo = "";

    constructor (pseudo) {

        this._pseudo = pseudo;

    }

    get ws() {
        return this._ws;
    }

    set ws(value) {
        this._ws = value;
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
    }

    get pseudo() {
        return this._pseudo;
    }

    set pseudo(value) {
        this._pseudo = value;
    }

}

exports.Player = Player;

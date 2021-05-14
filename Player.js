const uniqid = require('uniqid');

class Player {


    _id;
    _ws = null;
    _color = "";
    _pseudo = "";
    _playing = false;

    constructor (pseudo) {

        this._id = uniqid();
        this._pseudo = pseudo;

    }

    get id() {
        return this._id;
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

    get playing() {
        return this._playing;
    }

    set playing(value) {
        this._playing = value;
    }

}

exports.Player = Player;

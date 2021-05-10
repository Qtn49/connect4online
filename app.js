var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Twig = require('twig');
const session = require('cookie-session');
const sep = '#';
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 9000});
const Game = require('./Game');
const GameBoard = require('./GameBoard');
const Player = require('./Player').Player;

var app = express();
var players = {};

var game = new Game.Game();
var redTurn = Math.random() < 0.5;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');
app.set("twig options", {
    allow_async: true, // Allow asynchronous compiling
    strict_variables: false
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
        secret: 'secret session'
}));

/* GET home page. */
app.get('/', function(req, res, next) {
    res.render('index.html.twig');
});

/* GET game page. */
app.get('/play', function(req, res, next) {
    res.render('game.html.twig');
});

/* GET multi-player page. */
app.get('/login', function(req, res, next) {
    res.render('login.html.twig');
});

/* GET waiting page. */
app.get('/wait', function(req, res) {

    if (!req.session.player) {

        res.redirect('/login');
        return;
    }

    res.render('wait.html.twig', {
        pseudo: req.session.player._pseudo,
        id: req.session.player._id

    });

});

app.get('/newPlayer', function (req, res) {
    res.redirect('/login');
});

app.post('/newPlayer', function(req, res) {

    let pseudo = req.body.login;

    if (checkPseudo(pseudo)) {

        let player = req.session.player = new Player(pseudo);
        game.addPlayer(player);

        res.redirect('/wait');

    }else {

        res.render('login.html.twig', {
            error: true
        });

    }
});

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error');
});

function checkPseudo (pseudo) {

    return !pseudo.includes(sep);

}

app.listen(8000);

module.exports = app;

var gameboard;

wss.on('connection', (ws) => {

    ws.on('message', (message) => {
        console.log(message);
        let data = message.split(sep);
        console.log(data);

        switch (data[0]) {

            case 'start':
                gameboard = new GameBoard.GameBoard();
                redTurn = Math.random() < 0.5;

                ws.send('start' + sep + JSON.stringify(redTurn));
                break;
            case 'played':
                let row = gameboard.play(data[1], redTurn);
                let result = gameboard.checkWinner(row, data[1]);

                if (result.length > 0) {

                    ws.send('win' + sep + JSON.stringify(redTurn) + sep + JSON.stringify(result));

                }

                if (row > -1) {
                    redTurn = !redTurn;
                    ws.send('play' + sep + row + sep + JSON.stringify(redTurn));
                }

                ws.send('game' + sep + JSON.stringify(gameboard._board));

                break;
            case 'newPlayer':
                let player = game.getPlayer(data[1]);

                player.ws = ws;

                game.broadcast('newPlayer' + sep + JSON.stringify(game._players));

                break;

            case 'invite':

                let invited = game.getPlayer(data[1]);
                invited.ws.send('invite' + sep + data[2] + sep + game.getPlayer(data[2])._pseudo);

            case 'multiplay':

                game.addGameBoard(new GameBoard())

        }

    });

});


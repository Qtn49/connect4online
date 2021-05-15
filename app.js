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
var players = [];

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

/**
 * GET solo login page
 */
app.get('/solo', function (req, res) {
    res.render('login.html.twig', {
        'mode': 'solo'
    });
});

/**
 * GET multi login page
 */
app.get('/multi', function (req, res) {
    res.render('login.html.twig', {
        'mode': 'multi'
    });
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

    if (typeof req.body.login !== "undefined") {

        let pseudo = req.body.login;

        if (checkPseudo(pseudo)) {

            let player = req.session.player = new Player(pseudo);
            players.push(player);

            res.redirect('/wait');

        }else {

            res.render('login.html.twig', {
                error: true
            });

        }

    }else if (typeof req.body.player1 !== "undefined" && typeof req.body.player2 !== "undefined") {

        let player1 = new Player(req.body.player1);
        let player2 = new Player(req.body.player2);

        player1._color = 'red';
        player2._color = 'yellow';

        gameboard = new GameBoard.GameBoard(player1, player2);
        gameboard.mode = 'solo';
        game.addGameBoard(gameboard);

        res.render('game.html.twig', {
            'mode': 'solo',
            'player1': JSON.stringify(player1),
            'player2': JSON.stringify(player2),
            'gameboardId': JSON.stringify(gameboard._id),
        });

    }else {

        res.render('login.html.twig', {
            error: true
        });

    }

});

app.get('/newMultiGame', function (req, res) {

    let player = getPlayer(req.query.id);
    let opponentPlayer = getPlayer(req.query.idOpponent);

    if (req.query.invited) {
        player._color = 'red';
        opponentPlayer._color = 'yellow';

        gameboard = new GameBoard.GameBoard(player, opponentPlayer);
        gameboard.mode = 'multi';
        game.addGameBoard(gameboard);

        res.render('game.html.twig', {
            'mode': 'multi',
            'player1': JSON.stringify(player),
            'player2': JSON.stringify(opponentPlayer),
            'gameboardId': JSON.stringify(gameboard._id),
        });
        opponentPlayer._ws.send('startGame' + sep + req.query.id);
        
    }else {

        res.render('game.html.twig', {
            'mode': 'multi',
            'player1': JSON.stringify(player),
            'player2': JSON.stringify(opponentPlayer),
            'gameboardId': JSON.stringify(gameboard._id),
        });

    }
});

// catch 404 and forward to error handler
app.get('*', function(req, res, next) {

    res.status(404).render('404.html.twig');

});

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
        let data = message.split(sep);

        switch (data[0]) {

            case 'initiateGame':
                gameboard = game.findGameBoardById(JSON.parse(data[1]));

                gameboard.getPlayer(data[2]).ws = ws;

                ws.send('start' + sep + JSON.stringify(gameboard.getCurrentPlayer()._id) + sep + JSON.stringify(gameboard._id));
                break;

            case 'played':
                gameboard = game.findGameBoardById(data[1]);
                let row = gameboard.play(data[2], redTurn);
                let result = gameboard.checkWinner(row, data[2]);
                let message = 'game' + sep + JSON.stringify(gameboard._board);

                if (result.length > 0) {

                    message = 'win' + sep + JSON.stringify(redTurn) + sep + JSON.stringify(result);

                }

                if (row > -1) {
                    redTurn = !redTurn;
                    let playMessage = 'play' + sep + row + sep + JSON.stringify(redTurn);
                    if (gameboard.mode === 'multi')
                        gameboard.sendMessage(playMessage, gameboard.getWaitingPlayer()._id);
                    ws.send(playMessage);
                }

                if (gameboard.mode === 'multi')
                    gameboard.sendMessage(message, gameboard.getWaitingPlayer()._id);
                ws.send(message);

                gameboard.switchTurn();

                break;
            case 'newPlayer':
                let player = getPlayer(data[1]);

                player.ws = ws;

                broadcast('newPlayer' + sep + JSON.stringify(players));

                break;

            case 'invite':

                let invited = getPlayer(data[1]);
                invited.ws.send('invite' + sep + data[2] + sep + getPlayer(data[2])._pseudo);
                break;

            case 'hover':
                gameboard = game.findGameBoardById(data[1]);
                gameboard.sendMessage('hover' + sep + data[2], gameboard.getWaitingPlayer()._id);
                break;

            case 'reset':

                gameboard = game.findGameBoardById(JSON.parse(data[1]));
                gameboard.reset();

                ws.send('start' + sep + JSON.stringify(gameboard.getCurrentPlayer()._id) + sep + JSON.stringify(gameboard._id));
                break;

        }

    });

});

function getPlayer (id) {

    return players.find(player => {
        return player._id.toString() === id.toString();
    });

}

function broadcast (message) {


    for (let [,p] of Object.entries(players)) {

        p.ws.send(message);

    }

}


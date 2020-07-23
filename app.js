var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Twig = require('twig');
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 9000});
const Game = require('./Game');
const GameBoard = require('./GameBoard');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

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

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
    res.render('error');
});

app.listen(8000);

module.exports = app;

var gameboard;

wss.on('connection', (ws) => {

    ws.on('message', (message) => {
        console.log(message);
        let data = message.split(':');
        console.log(data);

        switch (data[0]) {

            case 'start':
                gameboard = new GameBoard.GameBoard();
                redTurn = Math.random() < 0.5;

                ws.send('start:' + JSON.stringify(redTurn));
                break;
            case 'played':
                let row = gameboard.play(data[1], redTurn);

                if (gameboard.checkWinner(row, data[1])) {

                    ws.send('win:' + JSON.stringify(redTurn) + ':' + row + ':' + data[1]);

                }

                if (row > -1) {
                    redTurn = !redTurn;
                    ws.send('play:' + row + ':' + JSON.stringify(redTurn));
                }

                break;
        }

    });

});


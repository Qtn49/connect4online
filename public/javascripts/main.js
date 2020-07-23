var svg = document.getElementById('svg');
var hover = document.getElementById('hover');
var newPiece = document.getElementById('new_piece');
var board = document.getElementById('board');
var play;
var show = true;
var playing = false;
var over = false;
var column;

const ws = new WebSocket("ws://localhost:9000");

ws.onopen = () => {
    ws.send('start');
};

svg.addEventListener('mousemove', function (event) {
    if (!show || over)
        return;
    hover.setAttribute('visibility', 'visible');
    hover.setAttribute('x', event.clientX - event.clientX % 100 - 600);
    newPiece.setAttribute('visibility', 'visible');
    newPiece.setAttribute('cx', event.clientX - event.clientX % 100 - 600 + 50);
});

svg.addEventListener('mouseleave', function () {
    hideAll();
    show = true;
});

svg.addEventListener('mousedown', function (event) {
    if (!playing && !over) {
        column = (event.clientX - event.clientX % 100 - 600) / 100;
        ws.send('played:' + column);
    }
});

function goDown (piece, hover, row) {

    var y = parseInt(piece.getAttribute('cy'));

    if (y >= 480 - (80 * row)) {
        svg.removeChild(hover);
        clearInterval(play);
        playing = false;
        return;
    }

    piece.setAttribute('cy', y + 5);

    hover.setAttribute('y', parseInt(hover.getAttribute('y')) + 5);
    hover.setAttribute('height', parseInt(hover.getAttribute('height')) - 5);

}

function setPlayerColor (redTurn) {

    if (redTurn) {

        hover.setAttribute('fill', 'url(#red-gradient)');
        newPiece.setAttribute('fill', 'red');

    }else {

        hover.setAttribute('fill', 'url(#yellow-gradient)');
        newPiece.setAttribute('fill', 'yellow');

    }

}

function playTurn (row, redTurn) {

    var hoverClone = hover.cloneNode(), newPieceClone = newPiece.cloneNode();
    newPieceClone.setAttribute('row', row);
    newPieceClone.setAttribute('column', column);
    svg.insertBefore(newPieceClone, newPiece.previousSibling);
    playing = true;
    play = setInterval(goDown, 10, newPieceClone, svg.appendChild(hoverClone), row);
    hideAll();
    setPlayerColor(redTurn);

}

function hideAll () {

    hover.setAttribute('visibility', 'hidden');
    newPiece.setAttribute('visibility', 'hidden');

}

function gameOver (redTurn) {

    over = true;
    // hideAll();

    if (redTurn)
        console.log('the red player won');
    else
        console.log('the yellow player won');

}

function flashy (row, column) {

    var piece = [];

    for (let i = 0; i < 4; i++) {
        piece.push(document.querySelector('[row = "' + row-- + '"][column = "' + column +'"]'));
    }

    for (var p of piece) {
        if (p) {
            p.style.opacity = p.style.opacity * -1 + 1;
        }
    }

}

ws.onmessage = (message) => {
    var data = message.data.split(':');
    switch (data[0]) {

        case 'start':
            setPlayerColor(JSON.parse(data[1]));
            break;
        case 'play':
            playTurn(data[1], JSON.parse(data[2]));
            show = false;
            break;
        case 'win':
            gameOver(JSON.parse(data[1]));
            setInterval(flashy, 500, data[2], data[3]);
            break;

    }
};

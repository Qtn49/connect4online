var svg = document.getElementById('svg');
var hover = document.getElementById('hover');
var newPiece = document.getElementById('new_piece');
var board = document.getElementById('board');
var play;
var playing = false;
var over = false;
var column;

const ws = new WebSocket("ws://localhost:9000");

ws.onopen = () => {
    ws.send('start');
};

window.onload = init();
window.onorientationchange = alert('bruh');

svg.addEventListener('mousemove', onHover);
// svg.addEventListener('touchmove', onHover);

svg.addEventListener('mouseleave', function () {
    hideAll();
});

svg.addEventListener('mousedown', onClick);
// svg.addEventListener('touchend', onClick);

function onHover (event) {

    if (over)
        return;

    console.log(event)

    hover.setAttribute('visibility', 'visible');
    hover.setAttribute('x', event.clientX - svg.getBoundingClientRect().x - (event.clientX - svg.getBoundingClientRect().x) % 100);
    newPiece.setAttribute('visibility', 'visible');
    newPiece.setAttribute('cx', event.clientX - svg.getBoundingClientRect().x - (event.clientX - svg.getBoundingClientRect().x) % 100 + (svg.clientWidth / 7) / 2);
    console.log(event.clientX - svg.getBoundingClientRect().x - (event.clientX - svg.getBoundingClientRect().x) % 100, event.clientX);
    
}

function onClick (event) {

    console.log('oh hé')

    if (!playing && !over) {
        column = (event.clientX - event.clientX % 100 - (svg.getBoundingClientRect().x - svg.getBoundingClientRect().x % 100)) / 100;
        ws.send('played:' + column);
    }

}

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

function flashy (coords) {

    let pieces = [];

    for (let c of coords) {

        if (c[1] === c[3]) {

            for (let i = c[0]; i <= c[2]; i++) {

                pieces.push(document.querySelector('[row = "' + i + '"][column = "' + c[1] + '"]'));
                console.log(document.querySelector('[row = "' + i + '"][column = "' + c[1] + '"]'), i, c[1])

            }

        }else if (c[0] === c[2]) {

            for (let i = c[1]; i <= c[3]; i++) {

                pieces.push(document.querySelector('[row = "' + c[0] + '"][column = "' + i + '"]'));

            }
        }else {

            let row = c[0], column = c[1];

            for (let i = 0; i < 4; i++) {

                pieces.push(document.querySelector('[row = "' + row + '"][column = "' + column + '"]'));
                console.log(i, document.querySelector('[row = "' + row + '"][column = "' + column + '"]'));

                row++;

                if (c[1] < c[3])
                    column++;
                else
                    column--;

            }

        }

    }

    pieces = pieces.filter((value, index, array) => array.indexOf(value) === index);

    for (var p of pieces) {
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
            break;
        case 'win':
            gameOver(JSON.parse(data[1]));
            setInterval(flashy, 500, JSON.parse(data[2]));
            break;

    }
};

function init () {

    console.log(svg.clientWidth)
    // svg.setAttribute('width', '' + innerWidth / (1920 / 700));
    // svg.setAttribute('height', '' + innerHeight / (1920 / 600));
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

        if(window.innerHeight > window.innerWidth){
            alert("Please use Landscape!");
            svg.style.display = "none";
        }

    }
}

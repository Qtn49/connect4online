var svg = document.getElementById('svg');
var hover = document.getElementById('hover');
var newPiece = document.getElementById('new_piece');
var board = document.getElementById('board');
var play;

svg.addEventListener('mousemove', function (event) {
    hover.setAttribute('visibility', 'visible');
    hover.setAttribute('x', event.clientX - event.clientX % 100 - 600);
    newPiece.setAttribute('visibility', 'visible');
    newPiece.setAttribute('cx', event.clientX - event.clientX % 100 - 600 + 50);
});

svg.addEventListener('mouseleave', function () {
    hover.setAttribute('visibility', 'hidden');
    newPiece.setAttribute('visibility', 'hidden');
});

svg.addEventListener('mousedown', function () {
    var hoverClone = hover.cloneNode(), newPieceClone = newPiece.cloneNode();
    svg.insertBefore(newPieceClone, newPiece.previousSibling);
    hover.setAttribute('visibility', 'hidden');
    play = setInterval(goDown, 10, newPieceClone, svg.appendChild(hoverClone));
    // newPiece.setAttribute('visibility', 'hidden');
    // goDown(svg.appendChild(newPiece.cloneNode()));
});

function goDown (piece, hover) {

    var y = parseInt(piece.getAttribute('cy'));

    if (y >= 500 - 30) {
        svg.removeChild(hover);
        clearInterval(play);
        return;
    }

    piece.setAttribute('cy', y + 5);

    /*if (parseInt(hover.getAttribute('y')) === y) {
        console.log('bite')
        clearInterval(play);
        return;
    }*/

    if (hover.getAttribute('y') <= y + 30) {
        hover.setAttribute('y', parseInt(hover.getAttribute('y')) + 5);
        hover.setAttribute('height', parseInt(hover.getAttribute('height')) - 5);
    }

}

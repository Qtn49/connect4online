var svg = document.getElementById('svg');
var hover = document.getElementById('hover');
var newPiece = document.getElementById('new_piece');
var board = document.getElementById('board');
var play;
var userTurn = true;
var playing = false;
var over = false;
var column;
const sep = '#';
var valide = false;
var flashyLoop;

// Création de la WebSocket
const ws = new WebSocket("ws://localhost:9000", 'echo-protocol');
var pseudo = document.getElementById("player");
var currentPlayerIndex = 0;

// Mise en ecoute de la WebSocket
ws.onopen = () => {
    ws.send('initiateGame' + sep + JSON.stringify(gameboardId));
};

// Verification de la taille de l'ecran au chargement
window.onload = init();

// excute la fonction onHover lorsque la souris bouge sur le plateau
svg.addEventListener('mousemove', onHover);
// svg.addEventListener('touchmove', onHover);

// Cacher les traces du jeu lorsque la souris sort du plateau
svg.addEventListener('mouseleave', function () {
    hideAll();
});

// Executer la fonction onClick lorsqu'on clique sur le plateau
svg.addEventListener('mousedown', onClick);
// svg.addEventListener('touchend', onClick);

// suivre la souris sur la coordonnees x avec le la piece et la couleur au-dessus de la colonne correspondante, on valide le tour avec la variable valide afin d'eviter de pouvoir jouer sans avoir bougé la souris
function onHover (event) {

    if (over || !userTurn)
        return;

    valide = true;
    // hover.setAttribute('visibility', 'visible');
    let row = event.clientX - svg.getBoundingClientRect().x - (event.clientX - svg.getBoundingClientRect().x) % 100;
    hover.setAttribute('x', row);
    newPiece.setAttribute('visibility', 'visible');
    newPiece.setAttribute('cx', row + (svg.clientWidth / 7) / 2);

}

// Quand on clique, si le tour est valide et que la piece precedente est tombee et que le jeu n'est pas termine, on attribue la valeur false a la variable valide puis on affiche le repassage de la colonne en couleur et on recupere la colonne sur laquelle on a joue avant de l'envoyer au serveur pour l'analyser
function onClick (event) {

    if (!playing && !over && valide && userTurn) {
        valide = false;
        hover.setAttribute('visibility', 'visible');
        column = parseInt((event.clientX - svg.getBoundingClientRect().x) / 100);
        currentPlayerIndex = (currentPlayerIndex + 1) % 2;
        pseudo.textContent = players[currentPlayerIndex]._pseudo;
        ws.send('played' + sep + gameboardId + sep + column);
    }

}

// Deplacement de la piece qui tombe

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

// Attribution de la couleur de la piece et du repassage de la colonne en couleur
function setPlayerColor () {

    let color = players[currentPlayerIndex]._color;

    hover.setAttribute('fill', 'url(#' + color + '-gradient)');
    newPiece.setAttribute('fill', color);
    pseudo.setAttribute('style', 'color: ' + color + ';');

}

// Execution du tour : on place la nouvelle piece puis on la fait descendre a l'aide de la fonction goDown qu'on exeecute toutes les 10ms jusqu'a ce que la piece soit tombee
function playTurn (row) {

    console.log()
    var hoverClone = hover.cloneNode(), newPieceClone = newPiece.cloneNode();
    newPieceClone.setAttribute('row', row);
    newPieceClone.setAttribute('column', column);
    svg.insertBefore(newPieceClone, newPiece.previousSibling);
    playing = true;
    if (mode === 'multi')
        userTurn = !userTurn;
    play = setInterval(goDown, 10, newPieceClone, svg.appendChild(hoverClone), row);
    hideAll();
    setPlayerColor();

}

// Fonction permettant de cacher la piece a ajouter et le repassage de la colonne en couleur

function hideAll () {

    hover.setAttribute('visibility', 'hidden');
    newPiece.setAttribute('visibility', 'hidden');

}

/**
 * Fonction to reset the game
 *
 * retirer tous les elements avec l'identifiant new_piece
 *
 */
function resetGame() {

    var children = Array.from(svg.children);
    children.forEach(function (el) {
        if (el.getAttribute('id') === 'new_piece' && el.getAttribute('visibility') === 'visible') {
            svg.removeChild(el);
        }
    });
    over = false;
    clearInterval(flashyLoop);

}

// Fonction qui s'execute a la fin du jeu permettant d'afficher une fenetre de fin et de definir la variable over a true
function gameOver (redTurn) {

    over = true;
    // hideAll();

    if (redTurn)
        console.log('the red player won');
    else
        console.log('the yellow player won');

    bootbox.confirm({
        message: 'the ' + ((redTurn) ? 'yellow' : 'red') + ' player won !\nWould you like to play again ?',
        centerVertical: true,
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Back to menu',
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Play again',
            },
        },
        callback: function (result) {
            if (result) {
                console.log(players);
                ws.send('reset' + sep + JSON.stringify(gameboardId));
            }else {
                location.href = '/';
            }
        }
    });

}


function setCurrentPlayer(firstPlayerId) {

    players.forEach((player, i) => {
        if (player._id === firstPlayerId)
            currentPlayerIndex = i;
    });

    if (currentPlayerIndex === 0 && mode === 'multi')
        pseudo.textContent = 'Your';
    else
        pseudo.textContent = players[currentPlayerIndex]._pseudo + "'s";

}


// Fonction permettant d'afficher les pieces gagnantes en clignotant

//TODO revoir l'optimisation de la fonction

function flashy (coords) {

    let pieces = [];

    for (let c of coords) {

        if (c[1] === c[3]) {

            for (let i = c[0]; i <= c[2]; i++) {

                pieces.push(document.querySelector('[row = "' + i + '"][column = "' + c[1] + '"]'));

            }

        }else if (c[0] === c[2]) {

            for (let i = c[1]; i <= c[3]; i++) {

                pieces.push(document.querySelector('[row = "' + c[0] + '"][column = "' + i + '"]'));

            }
        }else {

            let row = c[0], column = c[1];

            for (let i = 0; i < 4; i++) {

                pieces.push(document.querySelector('[row = "' + row + '"][column = "' + column + '"]'));

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

// verification des messages envoyes par le serveur afin d'executer les fonctions correspondantes

ws.onmessage = (message) => {
    var data = message.data.split(sep);
    switch (data[0]) {

        case 'start':
            console.log(data);
            setCurrentPlayer(JSON.parse(data[1]));
            gameboardId = JSON.parse(data[2]);
            if (currentPlayerIndex !== 0 && mode === 'multi')
                userTurn = false;
            setPlayerColor();
            resetGame();
            break;
        case 'play':
            playTurn(data[1]);
            break;
        case 'win':
            gameOver(JSON.parse(data[1]));
            flashyLoop = setInterval(flashy, 500, JSON.parse(data[2]));
            break;
        case 'game':
            break;

    }
};

// Fonction permettant de tester la taille de l'ecran

function init () {

    if (innerWidth < svg.clientWidth || innerHeight < svg.clientHeight) {

        alert('sorry but your device is too small');
        document.body.style.display = "none";

    }

}

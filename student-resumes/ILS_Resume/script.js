
//Define our HTML elements
const a1 = document.querySelector('#ta1');
const a1Text = document.querySelector('#a1');

const a2 = document.querySelector('#ta2');
const a2Text = document.querySelector('#a2');

const a3 = document.querySelector('#ta3');
const a3Text = document.querySelector('#a3');

const b1 = document.querySelector('#tb1');
const b1Text = document.querySelector('#b1');

const b2 = document.querySelector('#tb2');
const b2Text = document.querySelector('#b2');

const b3 = document.querySelector('#tb3');
const b3Text = document.querySelector('#b3');

const c1 = document.querySelector('#tc1');
const c1Text = document.querySelector('#c1');

const c2 = document.querySelector('#tc2');
const c2Text = document.querySelector('#c2');

const c3 = document.querySelector('#tc3');
const c3Text = document.querySelector('#c3');

const messageBox = document.querySelector('#TTTM');
const playButton = document.querySelector('#play');

const playerForm = document.querySelector('#add_player');
const playerNameInput = document.querySelector('#name_input');
const playerMarkerSelect = document.querySelector('#marker_select');
const addPlayerButton = document.querySelector('#Player_submit');
const game = document.querySelector('#game');
const controller = document.querySelector('#controller');
const positionSelect = document.getElementById('positionSelect');
const chooseButton = document.querySelector('#choose');

playButton.onclick = newGame;
//Define our variables
let players = [];
let position = 1;
let gameBoard = [[], [], []];
let playerUp = 0;

//Constructor for players
function Player(position, name, marker) {
    this.position = position;
    this.name = name;
    this.marker = marker;
}

//Victory!
function victory(playerUp) {
    messageBox.innerHTML = "Congrats " + players[playerUp].name + "! You fucking won!";
}
//Draw
function draw() {
    messageBox.innerHTML = "I think I see a DRAW y'all!";
}

function choosePosition(marker) {
    let posStr = document.querySelector('#positionSelect').value;
    //messageBox.innerHTML = posStr;
    //messageBox.innterHTML += positionSelect.options.length;
    document.getElementById(posStr).innerText = marker;
    //We need to amend the array as well
    let colNo;
    let row;
    switch (posStr) {
        case "a1":
            colNo = 0;
            row = 0;
            break;
        case "a2":
            colNo = 0;
            row = 1;
            break;
        case "a3":
            colNo = 0;
            row = 2;
            break;
        case "b1":
            colNo = 1;
            row = 0;
            break;
        case "b2":
            colNo = 1;
            row = 1;
            break;
        case "b3":
            colNo = 1;
            row = 2;
            break;
        case "c1":
            colNo = 2;
            row = 0;
            break;
        case "c2":
            colNo = 2;
            row = 1;
            break;
        case "c3":
            colNo = 2;
            row = 2;
            break;
    }
    //now fix the array
    gameBoard[colNo][row] = marker;
    console.log(gameBoard[colNo][row]);

    //Now check for victory
    //rows
    for (let i = 0; i < 3; i++) {
        if (gameBoard[i][0] == marker && gameBoard[i][1] == marker && gameBoard[i][2] == marker) {
            victory(playerUp);
            return;
        }
    }
    //columns
    for (let i = 0; i < 3; i++) {
        if (gameBoard[0][i] == marker && gameBoard[1][i] == marker && gameBoard[2][i] == marker) {
            victory(playerUp);
            return;
        }
    }
    //diagnol top-left
    if (gameBoard[0][0] == marker && gameBoard[1][1] == marker && gameBoard[2][2] == marker) {
        victory(playerUp);
        return;
    }
    //diagnol top-right
    if (gameBoard[2][0] == marker && gameBoard[2][2] == marker && gameBoard[0][2] == marker) {
        victory(playerUp);
        return;
    }
    //remove from list
    for (let i = 0; i < positionSelect.length; i++) {
        if (posStr == positionSelect[i].value) {
            positionSelect.remove(i);
        }
    }
    console.log(positionSelect.length);
    if (positionSelect.length == 0) {
        draw();
        return;
    }
    if (playerUp == 0) {
        playerUp = 1;
    } else {
        playerUp = 0;
    }
    chooseButton.removeEventListener("click", choosePosition);
    gameTurn(playerUp);
}

//Main loop
function gameTurn(playerUp) {
    messageBox.innerHTML = "You're up " + players[playerUp].name + "!"
    chooseButton.onclick = () => choosePosition(players[playerUp].marker);
    
}

//Function to initiate the game by adding the players
function newGame() {
    playButton.style.display = 'none';
    messageBox.innerHTML = 'Would you like to play a game?  Add player 1 please!';
    playerForm.style.display = 'block';
    //addPlayerButton.onclick = () => addPlayer(position);
    addPlayerButton.addEventListener("click", () => addPlayer(position)); // Set initial position
}

//Function to add a player to the game
function addPlayer(position) {
    let name = playerNameInput.value;
    let marker = playerMarkerSelect.value;

    const newPlayer = new Player(position, name, marker);

    players.push(newPlayer);
    console.log(newPlayer.name + '<br>' + newPlayer.marker);
    position++;

    if (position < 3) {
        messageBox.innerHTML = 'Great!  Now add player ' + position + '!';
        if (newPlayer.marker.value = "X") {
            playerMarkerSelect.remove(0);
        } else {
            playerMarkerSelect.remove(1);
        }
        //addPlayerButton.onclick = () => addPlayer(position);
        addPlayerButton.removeEventListener("click", addPlayer);
        addPlayerButton.addEventListener("click", () => addPlayer(position));
    } else {
        messageBox.innerHTML = 'OK, let\'s get started!<br>Player 1: ' + players[0].name + '<br>Player 2: ' + players[1].name;
        playerForm.style.display = 'none';
        controller.style.display = 'block';
        gameTurn(playerUp);
    }
    
}

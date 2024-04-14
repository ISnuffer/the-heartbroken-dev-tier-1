//The intention of this script is to teach a bot how to dynamically learn
//the game of BlackJack.  The game will be built in sections.  At the time
//of writing, the GUI is completed for the entire human-based game.  The
//gui independently records certain data points for the user.  Our
//first step is to design the game using OOP where possible.  This will
//be completed in Javascript.  We'll use the flask python webserver for a backend 
//when the game has been completed, and start recording data to a mySQL
//database for our data source.  When we have some data collected, we will
//program our bot to dynamically make decisions based on query data from 
//our database.  Let's rock!

//Define our HTML elements
//GUI column
const messageBox = document.getElementById('messages');
const guiForm = document.getElementById('gui');
const playerNameText = document.getElementById('playerName');
const nameInput = document.getElementById('nameInput');
const startGameButton = document.getElementById('startHumanGame');
const chipsText = document.getElementById('chips');
const roundNoText = document.getElementById('roundNo');
const winsText = document.getElementById('wins');
const lossesText = document.getElementById('losses');
const anteText = document.getElementById('ante');
const anteInput = document.getElementById('anteInput');
const anteUpButton = document.getElementById('anteUp');
const anteDownButton = document.getElementById('anteDown');
const anteSubmitButton = document.getElementById('anteSubmit');
const userActionsForm = document.getElementById('userActions');
const actionSelect = document.getElementById('actionSelect');
const currentScoreText = document.getElementById('currentScore');
const actionButton = document.getElementById('actionButton');

//Game Table
const blackJackTable = document.getElementById('blackJackTable');
const splitStackDiv = document.getElementById('splitStack');
const splitCardImage = document.getElementsByClassName('split');
const mainStackDiv = document.getElementById('mainStack');
const dealerCardImage = document.getElementsByClassName('dealerCard');
const playerCardImage = document.getElementsByClassName('playerCard');


//Define global variables
let gameDeck;
let ourPlayer;
let gameDealer;
let score;


//Set up our constructors
//dealer constructor
function dealer() {
    this.hand = [];
}

//player constructor
function player(human, name, chips) {
    this.human = human;
    this.hand = [];
    this.name = name;
    this.chips = chips;
    this.wins = 0;
    this.losses = 0;
    this.rounds = this.wins + this.losses;
    this.ante;
    this.splitHand = [];
    this.split = false;
    
}

//deck constructor
function deck() {
    //card constructor
    function card(color, suit, suitSrc, text, points) {
        this.name = text + "_" + suit;
        this.points = points;
        this.color = color;
        this.suit = suit;
        this.suitSrc = suitSrc;
        this.text = text;
        this.element;
    }
    //Our array and values
    this.cards = [];
    const suits = ['hearts', 'diamonds', 'spades', 'clubs'];
    const values = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    //define some values for the loops
    let color;
    let suit;
    let suitSrc;
    let text;
    let points;
    let cardPositions = [];
    let cardCAP;
    let rand;

    for (let i = 0; i < (suits.length * values.length); i++){
        cardPositions.push(i);
    }

    //We need a couple loops to populate the deck
    //for each suit
    for (let loopy = 0; loopy < suits.length; loopy++) {
        //for each value
        for (let loopy2 = 0; loopy2 < values.length; loopy2++){
            //First establish color
            if (loopy < 2) {
                color = 'redText';
            } else {
                color = 'blackText';
            }
            //suit
            suit = suits[loopy];
            //suitSrc
            suitSrc = '<img src="./' + suit + '.svg" style="width: 7.5px; height: 10px;">';
            //text
            text = values[loopy2];
            //points.  We'll treat A as 11 to start
            if (isNaN(text) == false) {
                points = text;
            } else if (text !== 'A') {
                points = '10';
            } else {
                points = '11';
            }

            //Now we have our values.  Time to create card!
            //add to cardsCAP
            rand = Math.random();
            cardCAP = cardPositions.splice(Math.floor(rand * cardPositions.length - 1), 1);
            this.cards[cardCAP] = new card(color, suit, suitSrc, text, points);
        }
    }

}


//initial eventListener and message
messageBox.innerText = "Welcome to the black jack table!  Enter your name and hit start game to begin.";

startGameButton.addEventListener("click", newGame);



//functions
function newGame() {
    //Store name in a variable
    let name = nameInput.value;

    //Now let's hide the box and display the name
    nameInput.value = '';
    nameInput.style.display = 'none';
    startGameButton.style.display = 'none';
    playerNameText.innerHTML = name;
    //Now we need to create our player
    ourPlayer = new player(true, name, 200);
    //Now the gameDeck
    gameDeck = new deck();
    //Now the dealer
    gameDealer = new dealer();

    //Now we need to establish ante
    chooseAnte();
}

function chooseAnte() {
    //If out of chips...game over!
    userActionsForm.style.display = 'none';
    let playerChips = Number(chipsText.innerText);
    if (playerChips <= 0) {
        messageBox.innerHTML = 'GAME OVER!  YOU\'RE OUT OF CHIPS!';
        return;
    }
    anteInput.style.display = 'block';
    anteInput.value = 1;
    anteUpButton.style.display = 'block';
    anteDownButton.style.display = 'block';
    anteSubmitButton.style.display = 'block';
    messageBox.innerText += '<br>Choose your ante, then hit submit.';
    anteSubmitButton.addEventListener("click", setAnte);
    anteUpButton.addEventListener('click', upAnte);
    anteDownButton.addEventListener('click', downAnte);
}

function resetHand(player) {
    player.hand = [];
    for (let i = 0; i < playerCardImage.length; i++){
        playerCardImage[i].style.display = 'none';
    }
    dealerCardImage[0].style.display = 'none';
    dealerCardImage[1].style.display = 'none';
    gameDealer.hand = [];
}

function calculateScore() {
    score = Number(0);
    for (let i = 0; i < ourPlayer.hand.length; i++) {
        //Add our score from each card
        score += Number(ourPlayer.hand[i].points);
    }
    currentScoreText.innerHTML = score;
    //If the score is a bust, let's change all aces to '1' and check again
    if (score > 21) {
        let acesChanged = false;
        for (let j = 0; j < ourPlayer.hand.length; j++) {
            //If it's an ace, change score to 1.
            if (ourPlayer.hand[j].text == 'A'){
                ourPlayer.hand[j].points = Number(1);
                acesChanged = true;
            }
        }
        //Now if acesChanged is true, recalculate score
        if (acesChanged == true) {
            calculateScore();
        }
    }
}
function populateUserActionSelect() {
    actionSelect.innerHTML = '';
    actionSelect.innerHTML += '<option value="Hit">Hit</option> <option value="Stay">Stay</option>';
    //Check for splits on the first draw
    if (ourPlayer.hand.length == 2) {
        //If we have a pair
        if (ourPlayer.hand[0].text == ourPlayer.hand[1].text) {
            actionSelect.innerHTML += ' <option value="Split">Split</option> <option value="Double">Double</option>';
        }
    }
    //We need to now set an event listener for taking user input
    actionButton.addEventListener("click", humanTurn_02);
}
//This function will take user input and perform the selected action
function humanTurn_02() {
    let action;
    //CHECKPOINT
    console.log("We have successfully navigated to the commit command");
    //Cancel our event listener
    actionButton.removeEventListener("click", humanTurn_02);
    //Now let's determine our action
    action = actionSelect.value

    //Now call a different function for a different action
    if (action == 'Hit') {
        hit();
        return;
    } else if (action == 'Stay') {
        stay();
        return;
    } else if (action == 'Split') {
        split();
        return;
    } else {
        double();
        return;
    }
}
//We now need functions to process each possible action
function double(){
//We need to double ante, deal one more card, then call a stay
//Double ante
let ante = Number(anteText.innerText);
ante = ante * 2;
anteText.innerText = ante;
//Draw a card
drawCard(gameDeck, 1, ourPlayer);
stay();
}
function split(){
    //Here's the complicated part.  We need to split the hand, then run two hands.
    //Let's splice the hand into the splithand
    const splitCard = player.hand.splice(1, 1);
    player.splitHand.push(splitCard);
    //Now let's reset our decks on screen, and set them up as twos
        playerCardImage[1].style.display = 'none';
    //All cards are hidden; set up split hand first
    splitCardImage[0].style.display = 'block';
    splitCardImage[0].getElementsByClassName('bottomRight')[0].innerText = ourPlayer.splitHand[0].text;
    splitCardImage[0].getElementsByClassName('bottomLeft')[0].innerHTML = ourPlayer.splitHand[0].suitSrc;
    ourPlayer.split = true;
    drawSplit(gameDeck, 1, ourPlayer);
    //Now draw our regular
    drawCard(gameDeck, 1, ourPlayer);
    //Now we reset actions.  We'll worry about the split hand at the end.
    //Now we want to calculate score
    calculateScore();
    populateUserActionSelect();
}
function hit(){
    console.log("You chose to hit.");
    //First we draw a new card
    drawCard(gameDeck, 1, ourPlayer);
    //Now we want to calculate score
    calculateScore();
    //Now check if they busted, and if so start the loss function
    if (score > 21) {
        messageBox.innerHTML = "Your Score: " + score + "<br>";
        loss();
    }
    //Now let's prepare for the next action
    populateUserActionSelect();
}
function stay(){
    let dealerScore = Number(gameDealer.hand[0].points) + Number(gameDealer.hand[1].points);
    console.log("You chose to stay.");
    //We've chosen to stay.  Time to determine winner
    //Write scores to messageBox
    messageBox.innerHTML = 'Dealer Cards: ' + gameDealer.hand[0].name + ', ' + gameDealer.hand[1].name + '<br>Dealer Score: ' + dealerScore + '<br>Your Score: ' + score + '<br>';
    //conditional statement for win or loss
    if (score >= dealerScore) {
        win();
    } else {
        loss();
    }
}

function splitTrue(){
    //Push our split hand to hand, then play as normal
    ourPlayer.hand.push(ourPlayer.splitHand[0]);
    ourPlayer.hand.push(ourPlayer.splitHand[1]);
    ourPlayer.splitHand[0].element.style.display = 'none';
    ourPlayer.splitHand[1].element.style.display = 'none';
    //We need to fill out the stuff
    for (let j = 0; j < 2; j++){
        playerCardImage[j].classList.add(player.hand[j].color);
        playerCardImage[j].getElementsByClassName('topLeft')[0].innerText = player.hand[j].text;
        console.log(player.hand[j].text);
        playerCardImage[j].getElementsByClassName('bottomRight')[0].innerText = player.hand[j].text;
        playerCardImage[j].getElementsByClassName('topRight')[0].innerHTML = player.hand[j].suitSrc;
        console.log(player.hand[j].suitSrc);
        playerCardImage[j].getElementsByClassName('bottomLeft')[0].innerHTML = player.hand[j].suitSrc;
    }
    //Now get our score and go to our actions
    calculateScore();
    populateUserActionSelect();
}

//Win and Loss Functions
function win() {
    let winCount;
    let playerChips;
    let ante;
    messageBox.innerHTML += 'YOU WIN!';
    winCount = Number(winsText.innerText);
    winCount++;
    winsText.innerText = winCount;
    //Now add ante to your chips
    playerChips = Number(chipsText.innerText);
    ante = Number(anteText.innerText);
    playerChips += ante;
    chipsText.innerText = playerChips;
    anteText.innerHTML = '';
    //Will need a reset here
    resetHand(ourPlayer);
    if (gameDeck.cards.length < 26){
        gameDeck = new deck();
    }
    if (ourPlayer.split == false){
        chooseAnte();
    } else {
        splitTrue();
    }
    
}

function loss() {
    let lossCount;
    let playerChips;
    let ante;
    messageBox.innerHTML += 'YOU LOSE!';
    lossCount = Number(lossesText.innerText);
    lossCount++;
    lossesText.innerText = lossCount;
    //Now subtract ante to your chips
    playerChips = Number(chipsText.innerText);
    ante = Number(anteText.innerText);
    playerChips -= ante;
    chipsText.innerText = playerChips;
    anteText.innerHTML = '';
    //Will need a reset here
    resetHand(ourPlayer);
    if (gameDeck.cards.length < 26){
        gameDeck = new deck();
    }
    if (ourPlayer.split == false){
        chooseAnte();
    } else {
        splitTrue();
    }
}
//Ante has been set and cards are ready to be dealt.
function humanTurn_01() {
    console.log('Successfully made it to human turn step.');
    messageBox.innerText = 'Select an option from the dropdown and hit commit.';
    //Draw our first cards
    drawCard(gameDeck, 2, ourPlayer);
    //Now we need a function to draw for our dealer
    dealerDraw(gameDeck);
    //We have everything we need now to start the player actions.
    //Show the userActionsForm
    userActionsForm.style.display = 'block';
    //Add our score
    calculateScore();
    //Populate our select form
    populateUserActionSelect();

}

function dealerDraw(deck) {
    const rand = Math.random();
    //draw two cards for le dealer
    const drawnCards = deck.cards.splice(Math.floor(rand * deck.cards.length) + 1, 2);

    //Now we need to add these to the dealer's hand.
    gameDealer.hand.push(drawnCards[0]);
    gameDealer.hand.push(drawnCards[1]);

    //Now we need to display the cards
    //Only gameDealer.hand[0] needs to be displayed in dealerCardImage[0]
    dealerCardImage[0].getElementsByClassName('bottomRight')[0].innerText = gameDealer.hand[0].text;
    dealerCardImage[0].getElementsByClassName('bottomLeft')[0].innerHTML = gameDealer.hand[0].suitSrc;

    //We need to display the dealer cards now
    dealerCardImage[0].style.display = 'block';
    dealerCardImage[1].style.display = 'block';

}
function drawCard(deck, num, player) {
    for (let i = 0; i < num; i++) {
        const rand = Math.random();
        const card = deck.cards.splice(Math.floor(rand * deck.cards.length) + 1, 1);
        player.hand.push(card[0]);
        //now find which card we are in the array, and take care of business
        for (let j = 0; j < player.hand.length; j++) {
            if (player.hand[j].name == card[0].name) {
                //We found it!
                player.hand[j].element = playerCardImage[j];
                player.hand[j].element.style.display = 'block';
                //We need to fill out the stuff
                playerCardImage[j].classList.add(player.hand[j].color);
                playerCardImage[j].getElementsByClassName('topLeft')[0].innerText = player.hand[j].text;
                console.log(player.hand[j].text);
                playerCardImage[j].getElementsByClassName('bottomRight')[0].innerText = player.hand[j].text;
                playerCardImage[j].getElementsByClassName('topRight')[0].innerHTML = player.hand[j].suitSrc;
                console.log(player.hand[j].suitSrc);
                playerCardImage[j].getElementsByClassName('bottomLeft')[0].innerHTML = player.hand[j].suitSrc;
            }
        }
    }
}

function drawSplit(deck, num, player) {
    for (let i = 0; i < num; i++) {
        const rand = Math.random();
        const card = deck.cards.splice(Math.floor(rand * deck.cards.length) + 1, 1);
        player.hand.push(card[0]);
        //now find which card we are in the array, and take care of business
        for (let j = 0; j < player.splitHand.length; j++) {
            if (player.splitHand[j].name == card[0].name) {
                //We found it!
                player.splitHand[j].element = playerCardImage[j];
                player.splitHand[j].element.style.display = 'block';
                //We need to fill out the stuff
                splitCardImage[j].classList.add(player.splitHand[j].color);
                splitCardImage[j].getElementsByClassName('topLeft')[0].innerText = player.splitHand[j].text;
                console.log(player.splitHand[j].text);
                splitCardImage[j].getElementsByClassName('bottomRight')[0].innerText = player.splitHand[j].text;
                splitCardImage[j].getElementsByClassName('topRight')[0].innerHTML = player.splitHand[j].suitSrc;
                console.log(player.splitHand[j].suitSrc);
                splitCardImage[j].getElementsByClassName('bottomLeft')[0].innerHTML = player.splitHand[j].suitSrc;
            }
        }
    }
}

function setAnte() {
    anteSubmitButton.removeEventListener('click', setAnte);
    let ante = anteInput.value;
    if (isNaN(ante) == true) {
        messageBox.innerText = 'Please enter a number and try again.';
        anteSubmitButton.addEventListener('click', setAnte);
        return;
    }
    ourPlayer.ante = ante;
    anteInput.style.display = 'none';
    anteText.innerHTML = ante;
    anteUpButton.style.display = 'none';
    anteDownButton.style.display = 'none';
    anteSubmitButton.style.display = 'none';
    if (ourPlayer.human == true) {
        humanTurn_01();
    }
}

function upAnte() {
    let ante = anteInput.value;
    anteUpButton.removeEventListener('click', upAnte);
    if (isNaN(ante) == true || ante >= ourPlayer.chips) {
        return;
    }
    ante++;
    anteInput.value = ante;
    anteUpButton.addEventListener('click', upAnte);
}

function downAnte() {
    let ante = anteInput.value;
    anteDownButton.removeEventListener('click', downAnte);
    if (isNaN(ante) == true || ante <= 1) {
        return;
    }
    ante--;
    anteInput.value = ante;
    anteDownButton.addEventListener('click', downAnte);
}





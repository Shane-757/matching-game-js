const gameBoard = document.getElementById("game-board");
const startGameButton = document.getElementById("start-game"); 
let gridSize = 18;

let cardObjects = [];
let numberOfPairs = 9;
startGameButton.addEventListener("click", startGame);

async function fetchCards(numberOfPairs) {
    try {
        const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
        const data = await response.json();

        const cardsResponse = await fetch(`https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=${numberOfPairs}`);
        const cardsData = await cardsResponse.json();
        cardObjects = cardsData.cards;
        cardObjects = [...cardObjects, ...cardObjects];
        cardObjects = shuffleArray(cardObjects);
        createGameBoard();
    } catch (error) {
        console.error("Error fetching cards:", error);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createGameBoard() {
    // Clear the game board before adding cards
    gameBoard.innerHTML = '';

    for (let i = 0; i < gridSize; i++) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.value = cardObjects[i].code;

        const cardImageFront = document.createElement("img");
        cardImageFront.src = cardObjects[i].image;
        cardImageFront.classList.add("card-image-front");
        cardImageFront.style.display = "none";

        const cardImageBack = document.createElement("img");
        cardImageBack.src = "http://4.bp.blogspot.com/_1AgA_BSRr40/TI_YtyvDrnI/AAAAAAAAAkA/MLMj23dgqtM/s1600/hoyleback.jpg";
        cardImageBack.classList.add("card-image-back");

        card.appendChild(cardImageFront);
        card.appendChild(cardImageBack);
        card.addEventListener("click", handleCardClick);
        gameBoard.appendChild(card);
    }
}

let firstCard = null;
let secondCard = null;
let canFlipCard = true;
let matchedPairs = 0;
let score = 0;

function handleCardClick(event) {
    if (!canFlipCard) return;

    const card = event.currentTarget;
    const cardImageFront = card.querySelector(".card-image-front");
    const cardImageBack = card.querySelector(".card-image-back");

    cardImageFront.style.display = "block";
    cardImageBack.style.display = "none";

    if (!firstCard) {
        firstCard = card;
    } else if (firstCard === card) {
        cardImageFront.style.display = "none";
        cardImageBack.style.display = "block";
        return;
    } else {
        secondCard = card;
        checkForMatch();
    }
}

function checkForMatch() {
    canFlipCard = false;
    const firstCardImageFront = firstCard.querySelector(".card-image-front");
    const firstCardImageBack = firstCard.querySelector(".card-image-back");
    const secondCardImageFront = secondCard.querySelector(".card-image-front");
    const secondCardImageBack = secondCard.querySelector(".card-image-back");

    if (firstCard.dataset.value === secondCard.dataset.value) {
        setTimeout(() => {
            firstCard.style.visibility = "hidden";
            secondCard.style.visibility = "hidden";
            firstCard.removeEventListener("click", handleCardClick);
            secondCard.removeEventListener("click", handleCardClick);
            score++;
            matchedPairs++;
            resetCards();
            checkForGameOver();
        }, 500);
    } else {
        setTimeout(() => {
            firstCardImageFront.style.display = "none";
            firstCardImageBack.style.display = "block";
            secondCardImageFront.style.display = "none";
            secondCardImageBack.style.display = "block";
            resetCards();
        }, 1000);
        score--;
    }
}

function resetCards() {
        firstCard = null
        secondCard = null;
        canFlipCard = true;
    }

function checkForGameOver() {
        if (matchedPairs === numberOfPairs) {
            setTimeout(() => {
                alert(`Game Over! Your score: ${score}`);
                location.reload();
            }, 500);
        }
    }


function startGame() {
    const numOfCardsInput = document.getElementById("numOfCards");
    const numOfCards = parseInt(numOfCardsInput.value);

    if (isNaN(numOfCards) || numOfCards < 4 || numOfCards % 2 !== 0) {
        alert("Please enter a valid even number (minimum 4)");
        return;
    }

    gridSize = numOfCards;
    numberOfPairs = gridSize / 2;
    matchedPairs = 0;
    score = 0;

    gameBoard.innerHTML = '';

    fetchCards(numberOfPairs);
}
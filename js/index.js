function updateNotiflixPosition() {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  if (screenWidth < 768) {
    Notiflix.Notify.init({
      position: 'top-center',
    });
  } else {
    Notiflix.Notify.init({
      position: 'right-bottom', // or any other position you prefer for larger screens
    });
  }
}

updateNotiflixPosition();
window.addEventListener('resize', updateNotiflixPosition);

const gameBoard = document.getElementById("game-board");
const startGameButton = document.getElementById("start-game");
let gridSize = 18;

let cardObjects = [];
let numberOfPairs = 9;
startGameButton.addEventListener("click", startGame);

async function fetchCards(numberOfPairs) {
  const cardDeckSelect = document.getElementById("cardDeck");
    const selectedCardDeck = cardDeckSelect.value;
    
  try {
    if (selectedCardDeck === "standard") {
      const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
      const data = await response.json();
      const cardsResponse = await fetch(`https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=${numberOfPairs}`);
      const cardsData = await cardsResponse.json();
      cardObjects = cardsData.cards;
    } else if (selectedCardDeck === "magic") {
      const response = await fetch("https://api.magicthegathering.io/v1/cards?contains=imageUrl");
      const data = await response.json();
      const allCards = data.cards.filter(card => card.imageUrl);
      cardObjects = getRandomCards(allCards, numberOfPairs).map(card => ({
        code: card.id,
        image: card.imageUrl
      }));
    } else if (selectedCardDeck === "pokemon") {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${numberOfPairs}`);
      const data = await response.json();
      const pokemons = data.results;
      const pokemonDetails = await Promise.all(
        pokemons.map(async (pokemon) => {
          const detailResponse = await fetch(pokemon.url);
          return detailResponse.json();
        })
      );
      cardObjects = pokemonDetails.map((pokemon) => ({
        code: pokemon.id,
        image: pokemon.sprites.front_default,
      }));
    }
    cardObjects = [...cardObjects, ...cardObjects];
    cardObjects = shuffleArray(cardObjects);
    createGameBoard();
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
}

function getRandomCards(cards, count) {
  const shuffledCards = shuffleArray(cards);
  return shuffledCards.slice(0, count);
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

     const cardDeckSelect = document.getElementById("cardDeck");
    const selectedCardDeck = cardDeckSelect.value;
    let cardImageBackUrl;

    if (selectedCardDeck === "magic") {
      cardImageBackUrl = "https://gamepedia.cursecdn.com/mtgsalvation_gamepedia/f/f8/Magic_card_back.jpg";
    } else if (selectedCardDeck === "pokemon") {
      cardImageBackUrl = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/4f7705ec-8c49-4eed-a56e-c21f3985254c/dah43cy-a8e121cb-934a-40f6-97c7-fa2d77130dd5.png/v1/fill/w_1024,h_1420,strp/pokemon_card_backside_in_high_resolution_by_atomicmonkeytcg_dah43cy-fullview.png";
    } else {
      cardImageBackUrl = "http://4.bp.blogspot.com/_1AgA_BSRr40/TI_YtyvDrnI/AAAAAAAAAkA/MLMj23dgqtM/s1600/hoyleback.jpg";
    }

    for (let i = 0; i < gridSize; i++) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.value = cardObjects[i].code;

        const cardImageFront = document.createElement("img");
        cardImageFront.src = cardObjects[i].image;
        cardImageFront.classList.add("card-image-front");
        cardImageFront.style.display = "none";

        const cardImageBack = document.createElement("img");
        cardImageBack.src = cardImageBackUrl;
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

    // Check if the card is already flipped
    if (cardImageFront.style.display === "block") {
        return;
    }

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
           addCardsToDiscardPile(firstCard, secondCard);
            firstCard.style.visibility = "hidden";
            secondCard.style.visibility = "hidden";
            firstCard.removeEventListener("click", handleCardClick);
            secondCard.removeEventListener("click", handleCardClick);
            score += 2; // Increase score by 2 for correct match
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
        score--; // Decrease score by 1 for incorrect match
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
             Notiflix.Notify.success(`Game Over! Your score: ${score}`);
            setTimeout(() => {
                location.reload();
            }, 2500);
        }, 500);
    }
}

function startGame() {
    const numOfCardsInput = document.getElementById("numOfCards");
    const numOfCards = parseInt(numOfCardsInput.value);

    if (isNaN(numOfCards) || numOfCards < 4 || numOfCards % 2 !== 0) {
        Notiflix.Notify.failure("Please enter a valid even number (minimum 4)");
        return;
    }
    gridSize = numOfCards;
    numberOfPairs = gridSize / 2;
    matchedPairs = 0;
    score = 0;

    gameBoard.innerHTML = '';

    fetchCards(numberOfPairs);
}

function addCardsToDiscardPile(card1, card2) {
  const discardPile = document.getElementById("discard-pile");

  // Create discard cards with the card back image
  const cardBackUrl = getCardBackImageUrl();
  const discardCard1 = createDiscardCard(cardBackUrl);
  const discardCard2 = createDiscardCard(cardBackUrl);

  // Add a rotation and offset to give the appearance of stacking
  const rotation = Math.random() * 5 - 2.5; 
  const offsetX = Math.random() * 4 - 2; 
  const offsetY = Math.random() * 4 - 2; 
  discardCard1.style.transform += ` rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`;
  discardCard2.style.transform += ` rotate(${-rotation}deg) translate(${offsetX}px, ${offsetY}px)`;

  // Add the discard cards to the discard pile
  discardPile.appendChild(discardCard1);
  discardPile.appendChild(discardCard2);
}

function createDiscardCard(cardBackUrl) {
  const discardCard = document.createElement("div");
  discardCard.classList.add("discard-card");

  const cardImageBack = document.createElement("img");
  cardImageBack.src = cardBackUrl;
  cardImageBack.style.width = "100%";
  cardImageBack.style.height = "100%";

  discardCard.appendChild(cardImageBack);
  return discardCard;
}

function getCardBackImageUrl() {
  const cardDeckSelect = document.getElementById("cardDeck");
  const selectedCardDeck = cardDeckSelect.value;
  let cardImageBackUrl;

  if (selectedCardDeck === "magic") {
    cardImageBackUrl = "https://gamepedia.cursecdn.com/mtgsalvation_gamepedia/f/f8/Magic_card_back.jpg";
  } else if (selectedCardDeck === "pokemon") {
    cardImageBackUrl = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/4f7705ec-8c49-4eed-a56e-c21f3985254c/dah43cy-a8e121cb-934a-40f6-97c7-fa2d77130dd5.png/v1/fill/w_1024,h_1420,strp/pokemon_card_backside_in_high_resolution_by_atomicmonkeytcg_dah43cy-fullview.png";
  } else {
    cardImageBackUrl = "http://4.bp.blogspot.com/_1AgA_BSRr40/TI_YtyvDrnI/AAAAAAAAAkA/MLMj23dgqtM/s1600/hoyleback.jpg";
  }

  return cardImageBackUrl;
}
const LocalStorage = {
    save(key, value) {
        this.saveRaw(key, JSON.stringify(value));
    },

    saveRaw(key, rawValue) {
        localStorage.setItem(key, rawValue);
    },

    load(key) {
        return JSON.parse(this.loadRaw(key));
    },

    loadRaw(key) {
        return localStorage.getItem(key);
    },

    has(key) {
        return this.loadRaw(key) !== null;
    }
};

const $newCardDialog = document.getElementById('new-card-dialog');

const $cardSlides = document.getElementById('card-slides');
const $cards = document.getElementsByClassName('card');

const $previousCardButton = document.getElementById('previous-card-button');
const $nextCardButton = document.getElementById('next-card-button');
const $cardSlidesProgress = document.getElementById('card-slides-progress');

const $clearCardsButton = document.getElementById('clear-cards-button');
const $addCardButton = document.getElementById('add-card-button');
const $closeNewCardPanelButton = document.getElementById('close-new-card-panel-button');

const $newCardForm = document.getElementById('new-card-form');

loadCards();

$previousCardButton.addEventListener('click', goToPreviousCard);
$nextCardButton.addEventListener('click', goToNextCard);

$clearCardsButton.addEventListener('click', clearCards);
$addCardButton.addEventListener('click', showAddCardPanel);
$closeNewCardPanelButton.addEventListener('click', hideAddCardPanel);

$newCardForm.addEventListener('submit', handleCardSubmission);

function goToPreviousCard() {
    goToSiblingCard('previous');
}

function goToNextCard() {
    goToSiblingCard('next');
}

function goToSiblingCard(siblingType) {
    if (getCardsCount() === 0) {
        return;
    }

    const siblingSelectors = {
        next($card) {
            return $card.nextElementSibling;
        },

        previous($card) {
            return $card.previousElementSibling;
        }
    };

    const slideDirections = {
        next: 'left',
        previous: 'right'
    };

    goToCard(siblingSelectors[siblingType](getActiveCard()), slideDirections[siblingType]);
}

function goToCard($newActiveCard, slideDirection) {
    if ($newActiveCard === null) {
        return;
    }

    markCardInactive(getActiveCard(), slideDirection);
    markCardActive($newActiveCard, slideDirection);

    updateCardSlidesProgress();
}

function markCardActive($card, slideDirection) {
    markCardActiveness($card, true, slideDirection);
}

function markCardInactive($card, slideDirection) {
    markCardActiveness($card, false, slideDirection);
}

function markCardActiveness($card, isActive, slideDirection) {
    $card.classList.toggle('is-active', isActive);

    $card.classList.remove('is-flipped');

    const slideType = isActive ? 'in' : 'out';
    const slideClassName = `slide-${slideType}-${slideDirection}`;
    $card.classList.add(slideClassName);

    setTimeout(() => {
        $card.classList.remove(slideClassName);
    }, 300);
}

function getCardsCount() {
    return $cards.length;
}

function getActiveCard() {
    return $cards.item(getActiveCardIndex());
}

function getActiveCardNumber() {
    return getActiveCardIndex() + 1;
}

function getActiveCardIndex() {
    return Array.from($cards).findIndex($card => $card.classList.contains('is-active'));
}

function clearCards() {
    $cardSlides.innerHTML = '';
    updateCardSlidesProgress();
    saveCards();
}

function addCard({ question, answer }) {
    const $card = createCardDOM(question, answer);

    if (getCardsCount() === 0) {
        $card.classList.add('is-active');
    }

    $cardSlides.appendChild($card);

    updateCardSlidesProgress();
    saveCards();
}

function createCardDOM(question, answer) {
    const $card = document.createElement('li');
    $card.classList.add('card');
    $card.addEventListener('click', flipCard.bind(null, $card));

    const $question = document.createElement('div');
    $question.classList.add('card-side');
    $question.innerText = question;

    $card.appendChild($question);

    const $answer = document.createElement('div');
    $answer.classList.add('card-side');
    $answer.innerText = answer;

    $card.appendChild($answer);

    return $card;
}

function flipCard($card) {
    $card.classList.toggle('is-flipped');
}

function updateCardSlidesProgress() {
    $cardSlidesProgress.textContent = getActiveCardNumber() + '/' + getCardsCount();
}

function handleCardSubmission(event) {
    event.preventDefault();

    const submissionData = new FormData($newCardForm);

    addCard({
        question: submissionData.get('question'),
        answer: submissionData.get('answer')
    });

    hideAddCardPanel();
    $newCardForm.reset();
}

function showAddCardPanel() {
    setAddCardPanelVisibility(true);
}

function hideAddCardPanel() {
    setAddCardPanelVisibility(false);
}

function setAddCardPanelVisibility(isVisible) {
    $newCardDialog.hidden = !isVisible;
}

function loadCards() {
    if (!LocalStorage.has('cards')) {
        return;
    }

    const cards = LocalStorage.load('cards');
    cards.forEach(addCard);
}

function saveCards() {
    const cards = Array.from($cards).map(getCardObjectFromCardDOM);
    LocalStorage.save('cards', cards);
}

function getCardObjectFromCardDOM($card) {
    return {
        question: $card.firstChild.textContent,
        answer: $card.lastChild.textContent,
    };
}

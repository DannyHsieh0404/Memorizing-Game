const Symbols = [
  'https://i.ibb.co/G3nX1tV/imgbin-playing-card-bucket-and-spade-others-f-RSg-Uj-Uwu6-XWLCB9-Xq-ZYz-BQhf-removebg-preview.png', // 黑桃
  'https://i.ibb.co/fSS6k0v/png-clipart-shape-heart-poker-love-black-removebg-preview.png', // 愛心
  'https://i.ibb.co/F7259c2/464-4643579-diamonds-cards-poker-simbolo-diamante-hd-png-download-removebg-preview.png', // 方塊
  'https://i.ibb.co/ynkDs88/188-1880282-naipe-paus-club-playing-card-png-transparent-png-removebg-preview.png' // 梅花
]

const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}
/////////////////////////////////////////////////////////////////////

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>`
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  flipCards(...cards) {
    cards.forEach(card => {
      // flip the contents
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        // load front side
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // load back side
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.forEach(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

/////////////////////////////////////////////////////////////////////

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) { return }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        // 1. Flip the card
        view.flipCards(card)
        // 2. Change the state
        this.currentState = GAME_STATE.SecondCardAwaits
        // 3. Store the revealed card
        model.revealedCards.push(card)
        break

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        view.renderTriedTimes(++model.triedTimes)

        // check if the cards are paired
        if (model.isRevealedCardsMatched()) {
          // Change the state
          this.currentState = GAME_STATE.CardsMatched
          // Change the colour of the paired cards
          view.pairCards(...model.revealedCards)
          // Add the score
          view.renderScore(model.score += 10)
          // Clean up the revealedCards array
          model.revealedCards = []

          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          // Change the state
          this.currentState = GAME_STATE.FirstCardAwaits

        } else {
          // Change the state
          this.currentState = GAME_STATE.CardsMatchFailed

          // Show the animation
          view.appendWrongAnimation(...model.revealedCards)

          // Flip the cards to the back (after 1 sec)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  }
}

/////////////////////////////////////////////////////////////////////

const model = {
  revealedCards: [],
  score: 0,
  triedTimes: 0,

  isRevealedCardsMatched() {
    return (this.revealedCards[0].dataset.index % 13) === (this.revealedCards[1].dataset.index % 13)
  }
}

/////////////////////////////////////////////////////////////////////
const utility = {
  // shuffling
  getRandomNumberArray(count) {
    // create an array
    let number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      // determine whom to switch with
      const toSwitchIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[toSwitchIndex]] = [number[toSwitchIndex], number[index]]
    }
    return number
  }
}

/////////////////////////////////////////////////////////////////////
controller.generateCards()

// Event listener for cards
document.querySelectorAll('.card').forEach(card => card.addEventListener('click', event => {
  controller.dispatchCardAction(card)
}
))
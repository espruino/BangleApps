let n = 1;
let diceSides = 6;
let replacement = false;
let min = 1;
let max = 10;

Bangle.loadWidgets();
Bangle.drawWidgets();

function showCoinMenu() {
  E.showMenu({
    '': {
      'title': 'Coin flip',
      'back': showMainMenu
    },
    '# of coins': {
      value: n,
      step: 1,
      min: 1,
      onchange: value => n = value
    },
    'Go': () => {
      let resultMenu = {
        '': {
          'title': 'Result',
          'back': showCoinMenu
        }
      };
      let heads = 0;
      for (let i = 0; i < n; i++) {
        let coin = Math.random() < 0.5;
        if (coin) heads++;
        resultMenu[`${i + 1}: ${coin ? 'Heads' : 'Tails'}`] = () => { };
      }
      let tails = n - heads;
      resultMenu[`${heads} heads, ${Math.round(100 * heads / n)}%`] = () => { };
      resultMenu[`${tails} tails, ${Math.round(100 * tails / n)}%`] = () => { };

      E.showMenu(resultMenu);
    }
  });
}


function showDiceMenu() {
  E.showMenu({
    '': {
      'title': 'Dice roll',
      'back': showMainMenu
    },
    '# of dice': {
      value: n,
      step: 1,
      min: 1,
      onchange: value => n = value
    },
    '# of sides': {
      value: diceSides,
      step: 1,
      min: 2,
      onchange: value => diceSides = value
    },
    'Go': () => {
      let resultMenu = {
        '': {
          'title': 'Result',
          'back': showDiceMenu
        }
      };
      let sum = 0;
      let min = diceSides + 1;
      let max = 0;
      for (let i = 0; i < n; i++) {
        let roll = Math.floor(Math.random() * diceSides + 1);
        sum += roll;
        if (roll < min) min = roll;
        if (roll > max) max = roll;
        resultMenu[`${i + 1}: ${roll}`] = () => { };
      }
      resultMenu[`Sum: ${sum}`] = () => { };
      resultMenu[`Min: ${min}`] = () => { };
      resultMenu[`Max: ${max}`] = () => { };
      resultMenu[`Average: ${sum / n}`] = () => { };

      E.showMenu(resultMenu);
    }
  });
}


function showCardMenu() {
  E.showMenu({
    '': {
      'title': 'Card draw',
      'back': showMainMenu
    },
    '# of cards': {
      value: Math.min(52, n),
      step: 1,
      min: 1,
      max: 52,
      onchange: value => n = value
    },
    'Replacement': {
      value: replacement,
      onchange: value => {
        replacement = value;
        if (replacement && n > 52) n = 52;
      }
    },
    'Go': () => {
      n = Math.min(n, 52);
      const SUITS = ['Spades', 'Diamonds', 'Clubs', 'Hearts'];
      const RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
      class Card {
        constructor(suit, rank) {
          this.suit = suit;
          this.rank = rank;
        }

        //Can't use == to check equality, so using Java-inspired .equals()
        equals(other) {
          return this.suit == other.suit && this.rank == other.rank;
        }
      }

      let resultMenu = {
        '': {
          'title': 'Result',
          'back': showCardMenu
        }
      };
      let cards = [];
      for (let i = 0; i < n; i++) {
        let newCard;
        while (true) {
          newCard = new Card(
            SUITS[Math.floor(Math.random() * SUITS.length)],
            RANKS[Math.floor(Math.random() * RANKS.length)]);

          if (replacement) break; //If we are doing replacement, skip the check for duplicates and stop looping

          if (!cards.map(card => card.equals(newCard)).includes(true)) break; //If there are no duplicates found, stop looping
        }

        cards.push(newCard);
        resultMenu[`${newCard.rank} of ${newCard.suit}`] = () => { };
      }

      E.showMenu(resultMenu);
    }
  });
}

function showNumberMenu() {
  E.showMenu({
    '': {
      'title': 'Number choice',
      'back': showMainMenu
    },
    'Minimum': {
      value: min,
      step: 1,
      onchange: value => min = value
    },
    'Maximum': {
      value: max,
      step: 1,
      onchange: value => max = value
    },
    '# of choices': {
      value: n,
      min: 1,
      step: 1,
      onchange: value => n = value
    },
    'Go': () => {
      let resultMenu = {
        '': {
          'title': 'Result',
          'back': showNumberMenu
        }
      };
      for (let i = 0; i < n; i++) {
        let value = Math.floor(min + Math.random() * (max - min + 1));
        resultMenu[`${i + 1}: ${value}`] = () => { };
      }
      E.showMenu(resultMenu);
    }
  });
}

function showMainMenu() {
  E.showMenu({
    '': {
      'title': 'Random'
    },
    'Coin': showCoinMenu,
    'Dice': showDiceMenu,
    'Card': showCardMenu,
    'Number': showNumberMenu
  });
}

showMainMenu();
/**
 * Copyright 2023 Crisp Advice
 * We believe in Finnish
 */

// Modules
var Layout = require("Layout");
var locale = require("locale");
var storage = require("Storage");

// Global variables
let SWAP_SIDE_BUZZ_MILLISECONDS = 50;
let CARD_DATA_FILE = "flashcards.data.json";
let CARD_SETTINGS_FILE = "flashcards.settings.json";
let CARD_EMPTY = "no cards found";
let cards = [];
let cardIndex = 0;
let backSide = false;
let drawTimeout = undefined;
let fontSizes = ["15%","20%","25%"];

let settings = storage.readJSON(CARD_SETTINGS_FILE,1) || { litsId: "", fontSize: fontSizes[1], textSize: 9 };

// Cards data
function wordWrap(str, maxLength) {
  if (maxLength == undefined) {
    maxLength = settings.textSize;
  }
  let res = '';
  while (str.length > maxLength) {
    let found = false;
    // Inserts new line at first whitespace of the line
    for (i = maxLength - 1; i >= 0; i--) {
      if (str.charAt(i)==' ') {
        res = res + [str.slice(0, i), "\n"].join('');
        str = str.slice(i + 1);
        found = true;
        break;
      }
    }
    // Inserts new line at MAX_LENGTH position, the word is too long to wrap
    if (!found) {
      res += [str.slice(0, maxLength), "\n"].join('');
      str = str.slice(maxLength);
    }
  }
  return res + str;
}

function loadLocalCards() {
  var cardsJSON = "";
  if (storage.read(CARD_DATA_FILE))
  {
    cardsJSON = storage.readJSON(CARD_DATA_FILE, 1)  || {};
  }
  refreshCards(cardsJSON,false);
}

function refreshCards(cardsJSON,showMsg)
{
  cardIndex = 0;
  backSide = false;
  cards = [];

  if (cardsJSON && cardsJSON.length) {
    cardsJSON.forEach(card => {
      cards.push([ wordWrap(card.name), wordWrap(card.desc) ]);
    });
  }

  if (!cards.length) {
    cards.push([ wordWrap(CARD_EMPTY), wordWrap(CARD_EMPTY) ]);
    drawMessage("e: cards not found");
  } else if (showMsg) {
    drawMessage("i: cards refreshed");
  }
}

// Drawing a card
let queueDraw = function() {
  let timeout = 60000;
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, timeout - (Date.now() % timeout));
};

let cardLayout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"6x8:3", label:"", id:"widgets", fillx:1 },
    {type:"txt", font:fontSizes[settings.fontSize], label:"ABCDEFGHIJ KLMNOPQRST UVWXYZÅÖÄ", filly:1, fillx:1, id:"card" },
    {type:"txt", font:"6x8:2", label:"00:00", id:"clock", fillx:1, bgCol:g.theme.fg, col:g.theme.bg }
  ]
}, {lazy:true});

function drawCard() {
  cardLayout.card.label = cards[cardIndex][backSide ? 1 : 0];
  cardLayout.clock.label = locale.time(new Date(),1);
  cardLayout.render();
}

function drawMessage(msg) {
  cardLayout.card.label = wordWrap(msg);
  cardLayout.render();
  console.log(msg);
}

function draw() {
  drawCard();
  Bangle.drawWidgets();
  queueDraw();
}

// Handle a touch: swap card side
function handleTouch(zone, event) {
  backSide = !backSide;
  drawCard();
  Bangle.buzz(SWAP_SIDE_BUZZ_MILLISECONDS);
}

// Handle a drag event: cycle cards
function handleDrag(event) {
  let first_x = event.xy[0];
  let last_x = event.xy[event.xy.length - 2];
  let xdiff = last_x - first_x;
  /*
  let first_y = event.xy[1];
  let last_y = event.xy[event.xy.length - 1];
  let ydiff = last_y - first_y;
  */
  if(xdiff > 0) {
    cardIndex = (cardIndex + 1) % cards.length;
  }
  else if(--cardIndex < 0) {
    cardIndex = cards.length - 1;
  }
  drawCard();
}


// initialize
cardLayout.update();
Bangle.loadWidgets();
loadLocalCards();

Bangle.on("touch", handleTouch);
Bangle.on("stroke", handleDrag);

// On start: display the first card
g.clear();
draw();

// cleanup
Bangle.setUI({mode:"clock", remove:function() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  Bangle.removeListener("touch", handleTouch);
  Bangle.removeListener("stroke", handleDrag);
}});

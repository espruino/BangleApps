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
let drawTimeout;
let fontSizes = ["15%","20%","25%"];
let lastDragX = 0;
let lastDragY = 0;

let settings = Object.assign({
  listId: "",
  fontSize: 1,
  cardWidth: 9,
  swipeGesture: 0
}, storage.readJSON(CARD_SETTINGS_FILE, true) || {});

// Cards data
function wordWrap(textStr, maxLength) {
  if (maxLength == undefined) {
    maxLength = settings.cardWidth;
  }
  let res = '';
  let str = textStr.trim();
  while (str.length > maxLength) {
    let found = false;
    // Inserts new line at first whitespace of the line
    for (i = maxLength - 1; i > 0; i--) {
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

function swipeCard(forward)
{
  if(forward) {
    cardIndex = (cardIndex + 1) % cards.length;
  }
  else if(--cardIndex < 0) {
    cardIndex = cards.length - 1;
  }
  drawCard();
}

// Handle a touch: swap card side
function handleTouch(zone, event) {
  backSide = !backSide;
  drawCard();
  Bangle.buzz(SWAP_SIDE_BUZZ_MILLISECONDS);
}

// Handle a stroke event: cycle cards
function handleStroke(event) {
  let first_x = event.xy[0];
  let last_x = event.xy[event.xy.length - 2];
  swipeCard((last_x - first_x) > 0);
}

// Handle a drag event: cycle cards
function handleDrag(event) {
  let isFingerReleased = (event.b === 0);
  if(isFingerReleased) {
    let isHorizontalDrag = (Math.abs(lastDragX) >= Math.abs(lastDragY)) &&
                           (lastDragX !== 0);
    if(isHorizontalDrag) {
      swipeCard(lastDragX > 0);
    }
  }
  else {
    lastDragX = event.dx;
    lastDragY = event.dy;
  }
}

// Ensure pressing the button goes to the launcher (by making this seem like a clock?)
Bangle.setUI({mode:"clock"/*, remove:function() {
  // Code to enable fast load. NOTE: this doesn't work on this app because all
  // functions and vars are declared global: https://www.espruino.com/Bangle.js+Fast+Load
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  Bangle.removeListener("touch", handleTouch);
  if (settings.swipeGesture) { Bangle.removeListener("drag", handleDrag);} else { Bangle.removeListener("stroke", handleStroke); }  
}*/});

// initialize
cardLayout.update();
Bangle.loadWidgets();
loadLocalCards();

Bangle.on("touch", handleTouch);
if (settings.swipeGesture) { Bangle.on("drag", handleDrag); } else { Bangle.on("stroke", handleStroke); }

// On start: display the first card
g.clear();
draw();




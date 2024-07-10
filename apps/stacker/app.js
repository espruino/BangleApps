const HARDWARE_VERSION = process.env.HWVERSION;
const BUTTON = HARDWARE_VERSION === 2 ? BTN : BTN2;
const TICKRATE = 69;
const BLOCK_SIZE = 16;
const GAMEBOARD_X = 16;
const GAMEBOARD_WIDTH = g.getWidth() - 16 - BLOCK_SIZE;
const START_Y = g.getHeight() - BLOCK_SIZE - 1;
const START_LENGTH = 4;
var length;
var rows = [];
var gameState = ""; //win, lose, play

function Block (x, y, match) {
  this.x = x;
  this.y = y;
  this.match = match;
  this.show = true;
}

class Row {
 constructor(x, y, size, direction, match) {
   this.y = y;
   this.size = size;
   this.blocks = [];
   if (Math.random() > 0.49) {
     this.direction = 1;
     this.x = BLOCK_SIZE;
   }
   else {
     this.direction = -1;
     this.x = g.getWidth() - this.size * BLOCK_SIZE;
   }
   this.match = match;
   for (var i = 0; i < size; i++) {
    var b = new Block(this.x + (BLOCK_SIZE * i), this.y, this.match);
    this.blocks.push(b);
  }
 }
  update() {
    this.x += BLOCK_SIZE * this.direction;
    if (this.x + (this.size * BLOCK_SIZE) > GAMEBOARD_X + GAMEBOARD_WIDTH || this.x < GAMEBOARD_X) {
      this.direction = -this.direction;
    }
    for (var i = 0; i < this.size; i++) {
      this.blocks[i].x = this.x + BLOCK_SIZE * i;
    }
  }
  draw() {
    for (var i = 0; i < this.size; i++) {
      if (this.blocks[i].show) {
        g.drawRect({x: this.blocks[i].x, y: this.y, w: BLOCK_SIZE, h: BLOCK_SIZE});
      }
    }
  }
}



function init() {
  Bangle.setLCDPower(1);
  g.setTheme({bg:"#000", fg:"#fff", dark:true}).clear();
  setInterval(update, TICKRATE);
  setWatch(handleInput, BUTTON, {repeat:true});
  changeState("play");
}

function update() {
  "ram"
  if (gameState === "play") {
    g.clear(reset);
    rows[rows.length - 1].update();
    rows.forEach(row => row.draw());
    g.flip();
  }
}

function changeState(gs) {
  gameState = gs;
  g.clear(reset);
  switch(gameState) {
    case "win":
      E.showMessage("YOU WIN!");
      break;
    case "lose":
      E.showMessage("YOU LOSE!");
      break;
    case "play":
      rows = [];
      length = START_LENGTH;
      var first = new Row(GAMEBOARD_X, START_Y, length, 1, true);
      rows.push(first);
      break;
  }
}

function collapse() {
  "ram"
  for (var i = 0; i < rows[rows.length - 1].blocks.length; i++) {
    for (var j = 0; j < rows[rows.length -2].blocks.length; j++) {
      if (rows[rows.length - 1].blocks[i].x === rows[rows.length - 2].blocks[j].x) {
        if (rows[rows.length - 2].blocks[j].match === true)
          rows[rows.length - 1].blocks[i].match = true;
      }
    }
  }
  for (var y = 0; y < rows[rows.length - 1].blocks.length; y++) {
    if (rows[rows.length - 1].blocks[y].match === false) {
      length -= 1;
      if (length < 1) {
        changeState("lose");
      }
      rows[rows.length - 1].blocks[y].show = false;
    }
  }
}

function handleInput() {
  if (gameState === "win" || gameState === "lose") {
    changeState("play");
  }
  else {
    if (rows.length > 1) {
      collapse();
      if (rows[rows.length - 1].y <= -1) {
        changeState("win");
      }
    }
    var r = new Row(GAMEBOARD_X + Math.round(length/2) * BLOCK_SIZE, rows[rows.length - 1].y - BLOCK_SIZE, length, 1, false);
    rows.push(r);
  }
}

init();
update();
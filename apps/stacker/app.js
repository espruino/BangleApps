const TICKRATE = 80;
const BLOCK_SIZE = 16;
const BLOCK_COLOR_PRIMARY = "#ff0000";
const BLOCK_COLOR_SECONDARY = "#ffff00";
const GAMEBOARD_X = 16;
const GAMEBOARD_WIDTH = g.getWidth() - 16 - BLOCK_SIZE;
const START_X = GAMEBOARD_X;
const START_Y = g.getHeight() - BLOCK_SIZE - 1;
const START_LENGTH = 5;
var startTime = 0;
var length = 5;
var updateTimeout;
var rows = [];
var playing = true;

class Block {
  constructor(x, y, match) {
    this.x = x;
    this.y = y;
    this.match = match;
    this.show = true;
  }
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
  setWatch(input_pressed, BTN);
  var test = new Row(START_X, START_Y, length, 1, true);
  rows.push(test);
}

function update() {
  "ram"
  if (playing) {
    g.clear(reset);
    rows[rows.length - 1].update();
    rows.forEach(row => row.draw());
  }
}

function resetGame() {
  playing = true;
  rows = [];
  length = START_LENGTH;
  var test = new Row(START_X, START_Y, length, 1, true);
  rows.push(test);
  update();
}

function lose() {
  print("lose");
  g.clear(reset);
  E.showMessage("YOU LOSE!");
  playing = false;
  setWatch(resetGame, BTN, {repeat:0,debounce:50,edge:"rising"});
}

function win() {
  playing = false;
  setWatch(resetGame, BTN, {repeat:0,debounce:50,edge:"rising"});
  g.clear(reset);
  E.showMessage("YOU WIN!");
}

function collapse() {
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
        lose();
        playing = false;
      }
      rows[rows.length - 1].blocks[y].show = false;
    }
  }
}

function input_pressed() {
  setWatch(input_pressed, BTN);
  if (playing) {
    if (rows.length > 1) {
      collapse();
      if (rows[rows.length - 1].y === -1) {
        win();
      }
    }
    var r = new Row(GAMEBOARD_X + Math.round(length/2) * BLOCK_SIZE, rows[rows.length - 1].y - BLOCK_SIZE, length, 1, false);
    rows.push(r);
  }
}

init();
update();
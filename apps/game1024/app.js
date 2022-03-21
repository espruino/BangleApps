const debugMode = 'off'; // valid values are: off, test, production, development
const middle = {x:Math.floor(g.getWidth()/2)-20, y: Math.floor(g.getHeight()/2)};
const rows = 4, cols = 4;
const borderWidth = 6;
const sqWidth = (Math.floor(Bangle.appRect.w - 48) / rows) - borderWidth;
const cellColors = [{bg:'#00FFFF', fg: '#000000'},
                    {bg:'#FF00FF', fg: '#000000'}, {bg:'#808000', fg: '#FFFFFF'}, {bg:'#0000FF', fg: '#FFFFFF'}, {bg:'#008000', fg: '#FFFFFF'},
                    {bg:'#800000', fg: '#FFFFFF'}, {bg:'#00FF00', fg: '#000000'}, {bg:'#000080', fg: '#FFFFFF'}, {bg:'#FFFF00', fg: '#000000'},
                    {bg:'#800080', fg: '#FFFFFF'}, {bg:'#FF0000', fg: '#FFFFFF'}];
const cellFonts = ["12x20", "12x20", "Vector:14"];
const cellChars = [
  [0,1,2,3,4,5,6,7,8,9,10],
  ['0','A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  ['0','I', 'II', 'III', 'IV', 'V', 'VI', 'VII','VIII', 'IX', 'X']
];
// const numInitialCells = 2;
const maxUndoLevels = 4;
const noExceptions = true;
let charIndex = 0; // plain numbers on the grid


  
const scores = {
  currentScore: 0,
  highScore: 0, 
  lastScores: [0],
  add: function(val) {
    this.currentScore = this.currentScore + Math.pow(2, val);
    debug(() => console.log("new score=",this.currentScore));
  },
  addToUndo: function () {
    this.lastScores.push(this.currentScore);
    if (this.lastScores.length > maxUndoLevels) this.lastScores.shift();
  },
  undo: function () {
    this.currentScore = this.lastScores.pop();
    debug(() => console.log("undo score =", this.currentScore, "rest:", this.lastScores));
  },
  reset: function () {
    this.currentScore = 0;
    this.lastScores = [0];
  },
  draw: function () {
    g.setColor(btnAtribs.fg);
    let ulCorner = {x: Bangle.appRect.x + 6, y: Bangle.appRect.y2 -22 };
    let lrCorner = {x: Bangle.appRect.x2, y: Bangle.appRect.y2 - 1};
    g.fillRect(ulCorner.x, ulCorner.y, lrCorner.x, lrCorner.y)
     .setFont12x20(1)
     .setFontAlign(0,0,0);
    let scrX = Math.floor((ulCorner.x + lrCorner.x)/3);
    let scrY = Math.floor((ulCorner.y + lrCorner.y)/2) + 1;
    g.setColor('#000000')
     .drawString(this.currentScore, scrX+1, scrY+1)
     .setColor(btnAtribs.bg)
     .drawString(this.currentScore, scrX, scrY);
    scrX = Math.floor(4*(ulCorner.x + lrCorner.x)/5);
    g.setFont("6x8:1x2")
     .drawString(this.highScore, btnAtribs.x + Math.floor(btnAtribs.w/2), scrY);
  },
  hsContents: function () {
    return  {"highScore": this.highScore, "lastScore": this.currentScore};
  },
  check: function () {
    this.highScore = (this.currentScore > this.highScore) ? this.currentScore : this.highScore;
    debug(() => console.log('highScore =', this.highScore));
  }
};

// snapshot interval is the number of moves after wich a snapshot is wriiten to file
const snInterval = 1;

const snReadOnInit = true;
// a snapshot contains a json file dump of the last positions of the tiles on the board, including the scores
const snapshot = {
  interval: snInterval,
  snFileName: 'game1024.json',
  counter: 0,
  updCounter: function() {
    this.counter = ++this.counter > this.interval ? 0 : this.counter;
  },
  dump: {gridsize: rows * cols, expVals: [], score: 0, highScore: 0, charIndex: charIndex},
  write: function() {
    require("Storage").writeJSON(this.snFileName, this.dump);
  },
  read: function () {
    let sn = require("Storage").readJSON(this.snFileName, noExceptions);
    if ((typeof sn == "undefined") || (sn.gridsize !== rows * cols)) {
      require("Storage").writeJSON(this.snFileName, this.dump);
      return false;
    } else {
      if ((typeof sn !== "undefined") && (sn.gridsize == rows * cols)){
        this.dump = sn;
        return true;
      }
    }
  },
  setDump: function () {
    this.dump.expVals = [];
    allSquares.forEach(sq => {
      this.dump.expVals.push(sq.expVal);
    });
    this.dump.score = scores.currentScore;
    this.dump.highScore = scores.highScore;
    this.dump.charIndex = charIndex;
  },
  make: function () {
    this.updCounter();
    if (this.counter == this.interval) {
      this.setDump();
      this.write();
      debug(() => console.log("snapped the state of the game:", this.dump));
    }
  },
  recover: function () {
    if (this.read()) {
      this.dump.expVals.forEach((val, idx) => {
        allSquares[idx].setExpVal(val);
      });
      scores.currentScore = this.dump.score ? this.dump.score : 0;
      scores.highScore = this.dump.highScore ? this.dump.highScore : 0 ;
      charIndex = this.dump.charIndex ? this.dump.charIndex : 0 ;
    }
  },
  reset: function () {
    this.dump.gridsize =  rows * cols;
    this.dump.expVals = [];
    for (let i = 0; i< this.dump.gridsize; i++) {
      this.dump.expVals[i] = 0;
    }
    this.dump.score = 0;
    this.dump.highScore = scores.highScore;
    this.dump.charIndex = charIndex;
    this.write();
    debug(() => console.log("reset D U M P E D!", this.dump));
  }
};
const btnAtribs = {x: 134, w: 42, h: 42, fg:'#C0C0C0', bg:'#800000'};
const buttons = {
  all: [],
  draw: function () {
    this.all.forEach(btn => {
      btn.draw();
    });
  },
  add: function(btn) {
    this.all.push(btn);
  }
};
/**
 * to the right = -1
  all tiles move to the left, begin with the outer righthand side tiles
  moving 0 to max 3 places to the right

  find first tile beginning with bottom row, righthand side
 */

const mover = {
  direction: {
    up: {name: 'up', step: 1, innerBegin: 0,    innerEnd: rows-1, outerBegin: 0,    outerEnd: cols-1, iter: rows -1,
      sqIndex: function (m,n) {return m*(cols) + n;}, sqNextIndex: function (m,n) {return m < rows -1 ? (m+1)*(cols) + n : -1;}
    }, 
    down: {name: 'down', step:-1, innerBegin: rows-1, innerEnd: 0,    outerBegin: cols-1, outerEnd: 0, iter: rows -1,
      sqIndex: function (m,n) {return m*(cols) + n;}, sqNextIndex: function (m,n) {return m > 0 ? (m-1)*(cols) + n : -1;}
    }, 
    left: {name: 'left', step: 1, innerBegin: 0,    innerEnd: cols-1, outerBegin: 0,    outerEnd: rows-1, iter: cols -1,
      sqIndex: function (m,n) {return n*(rows) + m;}, sqNextIndex: function (m,n) {return m < cols -1 ? n*(rows) + m +1 : -1;}
    },
    right: {name: 'right', step:-1, innerBegin: cols-1, innerEnd: 0,    outerBegin: rows-1, outerEnd: 0, iter: cols -1,
      sqIndex: function (m,n) {return n*(rows) + m;}, sqNextIndex: function (m,n) {return m > 0 ? n*(rows) + m -1: -1;}
    }
  },
  anyLeft: function() {
    let canContinue = false;
    [this.direction.up,this.direction.left].forEach (dir => {
      const step = dir.step;
      // outer loop for all colums/rows
      for (let n = dir.outerBegin; step*n <= step*dir.outerEnd; n=n+step) {
        // lets move squares one position in a row or column, counting backwards starting from the and where the squares will end up
        for (let m = dir.innerBegin; step*m <= step*dir.innerEnd; m=m+step) {
          const idx = dir.sqIndex(m,n);
          const nextIdx = dir.sqNextIndex(m,n);
          if (allSquares[idx].expVal == 0) {
            canContinue = true; // there is an empty cell found
            break;
          }
          if (nextIdx >= 0) {
            if (allSquares[idx].expVal == allSquares[nextIdx].expVal) {
              canContinue = true; // equal adjacent cells > 0 found
              break;
            } 
            if (allSquares[nextIdx].expVal == 0) {
              canContinue = true; // there is an empty cell found
              break;
            }
          }
          if (canContinue) break;
        }
        if (canContinue) break;
      }
    });
    return canContinue;
  },
  nonEmptyCells: function (dir) {
    debug(() => console.log("Move: ", dir.name));
    const step = dir.step;
    // outer loop for all colums/rows
    for (let n = dir.outerBegin; step*n <= step*dir.outerEnd; n=n+step) {
      // let rowStr = '| ';

      // Move a number of iteration with the squares to move them all to one side
      for (let iter = 0; iter < dir.iter; iter++) {

        // lets move squares one position in a row or column, counting backwards starting from the and where the squares will end up
        for (let m = dir.innerBegin; step*m <= step*dir.innerEnd; m=m+step) {
          // get the array of squares index for current cell
          const idx = dir.sqIndex(m,n);
          const nextIdx = dir.sqNextIndex(m,n);

          if (allSquares[idx].expVal == 0 && nextIdx >= 0) {
            allSquares[idx].setExpVal(allSquares[nextIdx].expVal);
            allSquares[nextIdx].setExpVal(0);
          }
        }
      }
    }
  },
  // add up the conjacent squares with identical values en set next square to empty in the process
  mergeEqlCells: function(dir) {
    const step = dir.step;
    // outer loop for all colums/rows
    for (let n = dir.outerBegin; step*n <= step*dir.outerEnd; n=n+step) {
      // lets move squares one position in a row or column, counting backwards starting from the and where the squares will end up
      for (let m = dir.innerBegin; step*m <= step*dir.innerEnd; m=m+step) {
        const idx = dir.sqIndex(m,n);
        const nextIdx = dir.sqNextIndex(m,n);

        if ((allSquares[idx].expVal > 0) && nextIdx >= 0) {
          if (allSquares[idx].expVal == allSquares[nextIdx].expVal) {
            let expVal = allSquares[idx].expVal;
            allSquares[idx].setExpVal(++expVal);
            allSquares[idx].addToScore();
            allSquares[nextIdx].setExpVal(0);
          }
        }
      }
    }
  }
};
// Minimum number of pixels to interpret it as drag gesture
const dragThreshold = 10;

// Maximum number of pixels to interpret a click from a drag event series
const clickThreshold = 3;

let allSquares = [];
// let buttons = [];

class Button {
  constructor(name, x0, y0, width, height, text, bg, fg, cb, enabled) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x0 + width;
    this.y1 = y0 + height;
    this.name = name;
    this.cb = cb;
    this.text = text;
    this.bg = bg;
    this.fg = fg;
    this.font = "6x8:3";
    this.enabled = enabled;
  }
  disable() {
    this.enabled = false;
  }
  enable() {
    this.enabled = true;
  }
  draw() {
    g.setColor(this.bg)
     .fillRect(this.x0, this.y0, this.x1, this.y1)
     .setFont(this.font)
     .setFontAlign(0,0,0);
    let strX = Math.floor((this.x0+this.x1)/2);
    let strY = Math.floor((this.y0+this.y1)/2);
    g.setColor("#000000")
     .drawString(this.text, strX+2, strY+2)
     .setColor(this.fg)
     .drawString(this.text, strX, strY);
    // buttons.push(this);
  }
  onClick() {if (typeof this.cb === 'function' && this.enabled) {
      this.cb(this);
    }
  }
}

class Cell {
  constructor(x0, y0, width, idx, cb) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x0 + width;
    this.y1 = y0 + width;
    this.expVal = 0;
    this.previousExpVals=[];
    this.idx = idx;
    this.cb = cb;
  }
  getColor(i) {
    return cellColors[i >= cellColors.length ? cellColors.length -1 : i];
  }
  drawBg() {
    g.setColor(this.getColor(this.expVal).bg)
     .fillRect(this.x0, this.y0, this.x1, this.y1);
  }
  drawNumber() {
    if (this.expVal !== 0) {
      g.setFont(cellFonts[charIndex])
       .setFontAlign(0,0,0);
      let char = cellChars[charIndex][this.expVal];
      let strX = Math.floor((this.x0 + this.x1)/2);
      let strY = Math.floor((this.y0 + this.y1)/2);
      g.setColor(this.getColor(this.expVal).fg)
       .drawString(char, strX, strY);
    }
  }
  setExpVal(val) {
    this.expVal = val;
  }
  getIdx() {return this.idx;}
  pushToUndo() {
    // remember this new step
    this.previousExpVals.push(this.expVal);
    // keep the undo list not longer than max undo levels
    if (this.previousExpVals.length > maxUndoLevels) this.previousExpVals.shift();
  }
  popFromUndo() {
    // take one step back
    if (this.previousExpVals.length > 0) {
      this.expVal = this.previousExpVals.pop();
    } 
  }
  removeUndo() {
    this.previousExpVals=[0];
  }
  addToScore() {if (typeof this.cb === 'function') {
      this.cb(this.expVal);
    }
  }
}

function undoGame() {
  g.clear();
  if (scores.lastScores.length > 0) {
    allSquares.forEach(sq => {
      sq.popFromUndo();
      sq.drawBg();
      sq.drawNumber();
    });
    scores.undo();
    scores.draw();
    buttons.draw();
    updUndoLvlIndex();
    snapshot.make();
  }
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
function addToUndo() {
  allSquares.forEach(sq => {
    sq.pushToUndo();
  });
  scores.addToUndo();
}
function addToScore (val) {
  scores.add(val);
  if (val == 10) messageYouWin();
}
function createGrid () {
  let cn =0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x0 = borderWidth + c*(borderWidth + sqWidth) - (rows/2)*(2*borderWidth + sqWidth) + middle.x + Math.floor(sqWidth/3);
      let y0 = borderWidth + r*(borderWidth + sqWidth) - (cols/2)*(2*borderWidth + sqWidth) + middle.y + Math.floor(sqWidth/3);
      let cell = new Cell(x0, y0, sqWidth, c + r*cols, addToScore);
      allSquares.push(cell);
    }
  }
}
function messageGameOver () {
  g.setColor("#1a0d00")
    .setFont12x20(2).setFontAlign(0,0,0)
    .drawString("G A M E", middle.x+13, middle.y-24)
    .drawString("O V E R !", middle.x+13, middle.y+24);
  g.setColor("#ffffff")
    .drawString("G A M E", middle.x+12, middle.y-25)
    .drawString("O V E R !", middle.x+12, middle.y+25);
}
function messageYouWin () {
  g.setColor("#1a0d00")
   .setFont12x20(2)
   .setFontAlign(0,0,0)
   .drawString("YOU HAVE", middle.x+18, middle.y-24)
   .drawString("W O N ! !", middle.x+18, middle.y+24);
  g.setColor("#FF0808")
   .drawString("YOU HAVE", middle.x+17, middle.y-25)
   .drawString("W O N ! !", middle.x+17, middle.y+25);
  Bangle.buzz(200, 1);
}
function makeRandomNumber () {
  return Math.ceil(2*Math.random());
}
function addRandomNumber() {
  let emptySquaresIdxs = [];
  allSquares.forEach(sq => {
    if (sq.expVal == 0) emptySquaresIdxs.push(sq.getIdx());
  });
  if (emptySquaresIdxs.length > 0) {
    let randomIdx = Math.floor( emptySquaresIdxs.length * Math.random() );
    allSquares[emptySquaresIdxs[randomIdx]].setExpVal(makeRandomNumber());
  } 
}
function drawGrid() {
  allSquares.forEach(sq => {
    sq.drawBg();
    sq.drawNumber();
  });
}
function initGame() {
  g.clear();
  // scores.read();
  createGrid();
  if (snReadOnInit) {
    snapshot.recover();
    debug(() => console.log("R E C O V E R E D !", snapshot.dump));
    let sum = allSquares.reduce(function (tv, sq) {return (sq.expVal + tv) ;}, 0);
    if (!sum) {
      addRandomNumber();
    }
  } else {
    addRandomNumber();
   // addToUndo();
  }
  addRandomNumber();
  drawGrid();
  scores.draw();
  buttons.draw();
    // Clock mode allows short-press on button to exit
  Bangle.setUI("clock");
  // Load widgets
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
function drawPopUp(message,cb) {
  g.setColor('#FFFFFF');
  let rDims = Bangle.appRect;
  g.fillPoly([rDims.x+10, rDims.y+20,
              rDims.x+20, rDims.y+10, 
              rDims.x2-30, rDims.y+10, 
              rDims.x2-20, rDims.y+20,
              rDims.x2-20, rDims.y2-40,
              rDims.x2-30, rDims.y2-30,
              rDims.x+20, rDims.y2-30,
              rDims.x+10, rDims.y2-40
  ]);
  buttons.all.forEach(btn => {btn.disable();});
  const btnYes = new Button('yes', rDims.x+16, rDims.y2-80, 54, btnAtribs.h, 'YES', btnAtribs.fg, btnAtribs.bg, cb, true);
  const btnNo  = new Button('no', rDims.x2-80, rDims.y2-80, 54, btnAtribs.h, 'NO', btnAtribs.fg, btnAtribs.bg, cb, true);
  btnYes.draw();
  btnNo.draw();
  g.setColor('#000000');
  g.setFont12x20(1);
  g.setFontAlign(-1,-1,0);
  g.drawString(message, rDims.x+20, rDims.y+20);
  buttons.add(btnYes);
  buttons.add(btnNo);
}
function handlePopUpClicks(btn) {
  const name = btn.name;
  buttons.all.pop(); // remove the no button
  buttons.all.pop(); // remove the yes button
  buttons.all.forEach(b => {b.enable();}); // enable the remaining buttons again
  debug(() => console.log("Button name =", name));
  switch (name) {
    case 'yes':
      resetGame();
      break;
    default:
      g.clear();
      drawGrid();
      scores.draw();
      buttons.draw();
      updUndoLvlIndex();
      Bangle.loadWidgets();
      Bangle.drawWidgets();
  }
}
function resetGame() {
  g.clear();
  scores.reset();
  allSquares.forEach(sq => {sq.setExpVal(0);sq.removeUndo();});
  addRandomNumber();
  addRandomNumber();
  drawGrid();
  scores.draw();
  buttons.draw();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}

/**
 * Function that can be used in test or development environment, or production. 
 * Depends on global constant debugMode
 * @param {function} func function to call like console.log()
 */
 const debug = (func) => {
  switch (debugMode) {
    case "development": 
      if (typeof func === 'function') {
        func();
      }
      break;
    case "off":
    default: break;
  }
};

// Handle a "click" event (only needed for menu button)
function handleclick(e) {
  buttons.all.forEach(btn => {
    if ((e.x >= btn.x0) && (e.x <= btn.x1) && (e.y >= btn.y0) && (e.y <= btn.y1)) {
      btn.onClick();
      debug(() => console.log(btn.name));
    }  
  });
}

// Handle a drag event (moving the stones around)
function handledrag(e) {
  /*debug(Math.abs(e.dx) > Math.abs(e.dy) ?
    (e.dx > 0 ? e => console.log('To the right') : e => console.log('To the left') ) :
    (e.dy > 0 ? e => console.log('Move down')  : e => console.log('Move up') ));
    */
  // [move.right, move.left, move.up, move.down]
  runGame((Math.abs(e.dx) > Math.abs(e.dy) ?
    (e.dx > 0 ?  mover.direction.right :  mover.direction.left ) :
    (e.dy > 0 ?  mover.direction.down  :  mover.direction.up )));
}
// Evaluate "drag" events from the UI and call handlers for drags or clicks
// The UI sends a drag as a series of events indicating partial movements
// of the finger.
// This class combines such parts to a long drag from start to end
// If the drag is short, it is interpreted as click,
// otherwise as drag.
// The approprate method is called with the data of the drag.
class Dragger {

  constructor(clickHandler, dragHandler, clickThreshold, dragThreshold) {
    this.clickHandler = clickHandler;
    this.dragHandler = dragHandler;
    this.clickThreshold = (clickThreshold === undefined ? 3 : clickThreshold);
    this.dragThreshold = (dragThreshold === undefined ? 10 : dragThreshold);
    this.dx = 0;
    this.dy = 0;
    this.enabled = true;
  }

  // Enable or disable the Dragger
  setEnabled(b) {
    this.enabled = b;
  }

  // Handle a raw drag event from the UI
  handleRawDrag(e) {
    if (!this.enabled)
      return;
    this.dx += e.dx; // Always accumulate
    this.dy += e.dy;
    if (e.b === 0) { // Drag event ended: Evaluate full drag
      if (Math.abs(this.dx) < this.clickThreshold && Math.abs(this.dy) < this.clickThreshold)
        this.clickHandler({
          x: e.x - this.dx,
          y: e.y - this.dy
        }); // take x and y from the drag start
      else if (Math.abs(this.dx) > this.dragThreshold || Math.abs(this.dy) > this.dragThreshold)
        this.dragHandler({
          x: e.x - this.dx,
          y: e.y - this.dy,
          dx: this.dx,
          dy: this.dy
        });
      this.dx = 0; // Clear the drag accumulator
      this.dy = 0;
    }
  }

  // Attach the drag evaluator to the UI
  attach() {
    Bangle.on("drag", e => this.handleRawDrag(e));
  }
}

// Dragger is needed for interaction during the game
var dragger = new Dragger(handleclick, handledrag, clickThreshold, dragThreshold);

// Disable dragger as board is not yet initialized
dragger.setEnabled(false);

// Nevertheless attach it so that it is ready once the game starts
dragger.attach();

function runGame(dir){
  addToUndo();
  updUndoLvlIndex();
  mover.nonEmptyCells(dir);
  mover.mergeEqlCells(dir);
  mover.nonEmptyCells(dir);
  addRandomNumber();
  drawGrid();
  scores.check();
  scores.draw();
  // scores.write();
  snapshot.make();
  dragger.setEnabled(true);
  if (!(mover.anyLeft())) {
    debug(() => console.log("G A M E  O V E R !!"));
    snapshot.reset();
    messageGameOver();
  }
}

function updUndoLvlIndex() {
  let x = 170;
  let y = 60;
  g.setColor(btnAtribs.fg)
    .fillRect(x-6,y-6, 176, 67);
  if (scores.lastScores.length > 0) {
    g.setColor("#000000")
    .setFont("4x6:2")
    .drawString(scores.lastScores.length, x, y);
  }
}
function incrCharIndex() {
  charIndex++;
  if (charIndex >= cellChars.length) charIndex = 0;
  drawGrid();
}
buttons.add(new Button('undo', btnAtribs.x, 25, btnAtribs.w, btnAtribs.h, 'U', btnAtribs.fg, btnAtribs.bg, undoGame, true));
buttons.add(new Button('chars', btnAtribs.x, 71, btnAtribs.w, 31, '*', btnAtribs.fg, btnAtribs.bg, function(){incrCharIndex();}, true));
buttons.add(new Button('restart', btnAtribs.x, 106, btnAtribs.w, btnAtribs.h, 'R', btnAtribs.fg, btnAtribs.bg, function(){drawPopUp('Do you want\nto restart?',handlePopUpClicks);}, true));

initGame();

dragger.setEnabled(true);

E.on('kill',function() {
  this.write();
  debug(() => console.log("1024 game got killed!"));
});
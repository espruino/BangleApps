// A 15-puzzle game for the Bangle.js 2 clock
// (C) Dirk Hillbrecht 2022
// Released unter the terms of the MIT license

// The intro screen as large base-64-encoded binary data
const introscreen = E.toArrayBuffer(atob("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"));

// *** Global constants from which several other settings are derived

// Minimum number of pixels to interpret it as drag gesture
const dragThreshold = 10;

// Maximum number of pixels to interpret a click from a drag event series
const clickThreshold = 3;

// Number of steps in stone move animation
const animationSteps = 6;

// Milliseconds to wait between move animation steps
const animationWaitMillis = 30;

// Total width of the playing field (full screen width)
const fieldw = g.getWidth();

// Total height of the playing field (screen height minus widget zones)
const fieldh = g.getHeight() - 48;


// *** Global game characteristics

// Size of the playing field
var stonesPerLine;

// Size of one field
var stonesize;

// Actual left start of the playing field (so that it is centered)
var leftstart;

// Actual top start of the playing field (so that it is centered)
var topstart;

// Number of stones on the board (needed at several occasions)
var stonesPerBoard;

// Set the stones per line globally and all derived values, too
function setStonesPreLine(bPL) {
  stonesPerLine = bPL;
  stonesize = Math.floor(Math.min(fieldw / (stonesPerLine + 1), fieldh / stonesPerLine)) - 2;
  leftstart = (fieldw - ((stonesPerLine + 1) * stonesize + 8)) / 2;
  topstart = 24 + ((fieldh - (stonesPerLine * stonesize + 6)) / 2);
  stonesPerBoard = (stonesPerLine * stonesPerLine);
}


// *** Global app settings

var SETTINGSFILE = "puzzle15.json";

// variables defined from settings
var splashMode;
var startWith;

/* For development purposes
require('Storage').writeJSON(SETTINGSFILE, {
  splashMode: "off",
  startWith: "5x5",
});
/* */

/* OR (also for development purposes)
require('Storage').erase(SETTINGSFILE);
/* */

// Helper method for loading the settings
function def(value, def) {
  return (value !== undefined ? value : def);
}

// Load settings
function loadSettings() {
  var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
  splashMode = def(settings.splashMode, "long");
  startWith = def(settings.startWith, "4x4");
}


// *** Low level helper classes

// One node of a first-in-first-out storage
class FifoNode {
  constructor(payload) {
    this.payload = payload;
    this.next = null;
  }
}

// Simple first-in-first-out (fifo) storage
// Needed to keep the stone movements in order
class Fifo {

  // Initialize an empty Fifo
  constructor() {
    this.first = null;
    this.last = null;
  }

  // Add an element to the end of the internal fifo queue
  add(payload) {
    if (this.last === null) { // queue is empty
      this.first = new FifoNode(payload);
      this.last = this.first;
    } else {
      let newlast = new FifoNode(payload);
      this.last.next = newlast;
      this.last = newlast;
    }
  }

  // Returns the first element in the queue, null if it is empty
  remove() {
    if (this.first === null)
      return null;
    let oldfirst = this.first;
    this.first = this.first.next;
    if (this.first === null)
      this.last = null;
    return oldfirst.payload;
  }

  // Returns if the fifo is empty, i.e. it does not hold any elements
  isEmpty() {
    return (this.first === null);
  }

}

// Helper class to keep track of tasks
// Executes tasks given by addTask.
// Tasks must call Worker.endTask() when they are finished, for this they get the worker passed as parameter.
// If a task is given with addTask() while another task is still running,
// it is queued and executed once the currently running task and all
// previously scheduled tasks have finished.
// Tasks must be functions with the Worker as first and only parameter.
class Worker {

  // Create an empty worker
  constructor() {
    this.tasks = new Fifo();
    this.busy = false;
  }

  // Add a task to the worker
  addTask(task) {
    if (this.busy) // other task is running: Queue this task
      this.tasks.add(task);
    else { // No other task is running: Execute directly
      this.busy = true;
      task(this);
    }
  }

  // Called by the task once it finished
  endTask() {
    if (this.tasks.isEmpty()) // No more tasks queued: Become idle
      this.busy = false;
    else // Call the next task immediately
      this.tasks.remove()(this);
  }

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

// *** Mid-level game mechanics

// Representation of a position where a stone is set.
// Stones can be moved from field to field.
// The playing field consists of a fixed set of fields forming a square.
// During an animation, a series of interim field instances is generated
// which represents the locations of a stone during the animation.
class Field {

  // Generate a field with a left and a top coordinate.
  // Note that these coordinates are "cooked", i.e. they contain all offsets
  // needed place the elements globally correct on the screen
  constructor(left, top) {
    this.left = left;
    this.top = top;
    this.centerx = (left + stonesize / 2) + 1;
    this.centery = (top + stonesize / 2) + 2;
  }

  // Returns whether this field contains the given coordinate
  contains(x, y) {
    return (this.left < x && this.left + stonesize > x &&
      this.top < y && this.top + stonesize > y);
  }

  // Generate a field for the given playing field index.
  // Playing field indexes start at top left with "0"
  // and go from left to right line by line from top to bottom.
  static forIndex(index) {
    return new Field(leftstart + (index % stonesPerLine) * (stonesize + 2),
      topstart + (Math.floor(index / stonesPerLine)) * (stonesize + 2));

  }
  // Special field for the result "stone"
  static forResult() {
    return new Field(leftstart + (stonesPerLine * (stonesize + 2)),
      topstart + ((stonesPerLine - 1) * (stonesize + 2)));
  }

  // Special field for the menu
  static forMenu() {
    return new Field(leftstart + (stonesPerLine * (stonesize + 2)),
      topstart);
  }

}

// Representation of a moveable stone of the game.
// Stones are moved from field to field to solve the puzzle
// Stones are numbered from 0 to the maximum number ot stones.
// Stone "0" represents the gap on the playing field.
// The main knowledge of a Stone instance is how to draw itself.
class Stone {

  // Create stone with the given number
  // The constructor creates the "draw()" function which is used to draw the stone
  constructor(number, targetindex) {
    this.number = number;
    this.targetindex = targetindex;
    // gap: Does not draw anything
    if (number === 0)
      this.draw = function(field) {};
    else if ((number + (stonesPerLine % 2 == 0 ? (Math.floor((number - 1) / stonesPerLine)) : 0)) % 2 == 0) {
      // Black stone
      this.draw = function(field) {
        g.setFont("Vector", (stonesPerLine === 5 ? 16 : 20)).setFontAlign(0, 0).setColor(0, 0, 0);
        g.fillRect(field.left, field.top, field.left + stonesize, field.top + stonesize);
        g.setColor(1, 1, 1).drawString(number, field.centerx, field.centery);
      };
    } else {
      // White stone
      this.draw = function(field) {
        g.setFont("Vector", (stonesPerLine === 5 ? 16 : 20)).setFontAlign(0, 0).setColor(0, 0, 0);
        g.drawRect(field.left, field.top, field.left + stonesize, field.top + stonesize);
        g.drawString(number, field.centerx, field.centery);
      };
    }
  }

  // Returns whether this stone is on its target index
  isOnTarget(index) {
    return index === this.targetindex;
  }
}

// Helper class which knows how to clear the rectangle opened up by the two given fields
class Clearer {

  // Create a clearer for the area between the two given fields
  constructor(startfield, endfield) {
    this.minleft = Math.min(startfield.left, endfield.left);
    this.mintop = Math.min(startfield.top, endfield.top);
    this.maxleft = Math.max(startfield.left, endfield.left);
    this.maxtop = Math.max(startfield.top, endfield.top);
  }

  // Clear the area defined by this clearer
  clearArea() {
    g.setColor(1, 1, 1);
    g.fillRect(this.minleft, this.mintop,
      this.maxleft + stonesize, this.maxtop + stonesize);
  }

}

// Helper class which moves a stone between two fields
class Mover extends Clearer {

  // Create a mover which moves the given stone from startfield to endfield
  // and animate the move in the given number of steps
  constructor(stone, startfield, endfield, steps) {
    super(startfield, endfield);
    this.stone = stone;
    this.startfield = startfield;
    this.endfield = endfield;
    this.steps = steps;
  }

  // Create the coordinate between start and end for the given step
  // Computation uses sinus for a smooth movement
  stepCoo(start, end, step) {
    return start + ((end - start) * ((1 + Math.sin((step / this.steps) * Math.PI - (Math.PI / 2))) / 2));
  }

  // Compute the interim field for the stone to place during the animation
  stepField(step) {
    return new Field(
      (this.minleft === this.maxleft ? this.minleft :
        this.stepCoo(this.startfield.left, this.endfield.left, step)),
      (this.mintop === this.maxtop ? this.mintop :
        this.stepCoo(this.startfield.top, this.endfield.top, step)));
  }

  // Perform one animation step
  animateStep(step, worker) {
    this.clearArea();
    this.stone.draw(this.stepField(step));
    if (step < this.steps) // still steps left: Issue next step
      setTimeout(function(t) {
        t.animateStep(step + 1, worker);
      }, animationWaitMillis, this);
    else // all steps done: Inform the worker
      worker.endTask();
  }

  // Start the animation, this method is called by the worker
  animate(worker) {
    this.animateStep(1, worker);
  }

}

// Representation of the playing field
// Knows to draw the field and to move a stone into a gap
class Board {

  // Generates the actual playing field with all fields and stones
  constructor() {
    this.fields = [];
    this.resultField = Field.forResult();
    this.menuField = Field.forMenu();
    for (i = 0; i < stonesPerBoard; i++)
      this.fields[i] = Field.forIndex(i);
    this.setShuffled();
    //this.setAlmostSolved(); // to test the game end
  }

  /* Set the board into the "solved" position. Useful for showcasing and development
  setSolved() {
    this.stones = [];
    for (i = 0; i < stonesPerBoard; i++)
      this.stones[i] = new Stone((i + 1) % stonesPerBoard, i);
    this.moveCount = 0;
  }
  /* */

  /* Initialize an almost solved playing field. Useful for tests and development
  setAlmostSolved() {
    this.setSolved();
    b = this.stones[this.stones.length - 1];
    this.stones[this.stones.length - 1] = this.stones[this.stones.length - 2];
    this.stones[this.stones.length - 2] = b;
  }
  /* */

  // Initialize a shuffled field. The fields are always solvable.
  setShuffled() {
    let nrs = []; // numbers of the stones
    for (i = 0; i < stonesPerBoard; i++)
      nrs[i] = i;
    this.stones = [];
    let count = stonesPerBoard;
    for (i = 0; i < stonesPerBoard; i++) {
      // Take a random number of the (remaining) numbers
      let curridx = Math.floor(Math.random() * count);
      let currnr = nrs[curridx];
      // Initialize the next stone with that random number
      this.stones[i] = new Stone(currnr, (currnr + (stonesPerBoard - 1)) % stonesPerBoard);
      // Remove the number just taken from the list of numbers
      for (j = curridx + 1; j < count; j++)
        nrs[j - 1] = nrs[j];
      count -= 1;
    }
    // not solvable: Swap the first and second stone which are not the gap.
    // This will always result in a solvable board.
    if (!this.isSolvable()) {
      let a = (this.stones[0].number === 0 ? 2 : 0);
      let b = (this.stones[1].number === 0 ? 2 : 1);
      let bx = this.stones[a];
      this.stones[a] = this.stones[b];
      this.stones[b] = bx;
    }
    this.moveCount = 0;
  }

  // Draws the complete playing field
  draw() {
    new Clearer(this.fields[0], this.fields[this.fields.length - 1]).clearArea();
    for (i = 0; i < this.fields.length; i++)
      this.stones[i].draw(this.fields[i]);
    this.drawResult(null);
    this.drawMenu();
  }

  // returns the index of the field left of the field with the given index,
  // -1 if there is none (index indicates already a leftmost field on the board)
  leftOf(index) {
    return (index % stonesPerLine === 0 ? -1 : index - 1);
  }

  // returns the index of the field right of the field with the given index,
  // -1 if there is none (index indicates already a rightmost field on the board)
  rightOf(index) {
    return (index % stonesPerLine === (stonesPerLine - 1) ? -1 : index + 1);
  }

  // returns the index of the field top of the field with the given index,
  // -1 if there is none (index indicates already a topmost field on the board)
  topOf(index) {
    return (index >= stonesPerLine ? index - stonesPerLine : -1);
  }

  // returns the index of the field bottom of the field with the given index,
  // -1 if there is none (index indicates already a bottommost field on the board)
  bottomOf(index) {
    return (index < (stonesPerLine - 1) * stonesPerLine ? index + stonesPerLine : -1);
  }

  // Return the index of the gap in the field, -1 if there is none (should never happel)
  indexOf0() {
    for (i = 0; i < this.stones.length; i++)
      if (this.stones[i].number === 0)
        return i;
    return -1;
  }

  // Returns the row in which the gap is, 0 is upmost
  rowOf0() {
    let idx = this.indexOf0();
    if (idx < 0)
      return -1;
    return Math.floor(idx / stonesPerLine);
  }

  // Searches the gap on the field and then moves one of the adjacent stones into it.
  // The stone is selected by the given startfunc which returns the index
  // of the selected adjacent field.
  // Startfunc is one of (left|right|top|bottom)Of.
  moveTo0(startfunc, worker) {
    let endidx = this.indexOf0(); // Target field (the gap)
    if (endidx === -1) {
      worker.endTask();
      return;
    }
    let startidx = startfunc(endidx); // Start field (relative to the gap)
    if (startidx === -1) {
      worker.endTask();
      return;
    }
    // Replace in the internal representation
    let moved = this.stones[startidx];
    this.stones[startidx] = this.stones[endidx];
    this.stones[endidx] = moved;
    this.moveCount += 1;
    // Move on screen using an animation effect.
    new Mover(moved, this.fields[startidx], this.fields[endidx], animationSteps).animate(worker);
  }

  // Move the stone right from the gap into the gap
  moveRight(worker) {
    this.moveTo0(this.leftOf, worker);
  }

  // Move the stone left from the gap into the gap
  moveLeft(worker) {
    this.moveTo0(this.rightOf, worker);
  }

  // Move the stone above the gap into the gap
  moveUp(worker) {
    this.moveTo0(this.bottomOf, worker);
  }

  // Move the stone below the gap into the gap
  moveDown(worker) {
    this.moveTo0(this.topOf, worker);
  }

  // Check if the board is solved (all stones at the right position)
  isSolved() {
    for (i = 0; i < this.stones.length; i++)
      if (!this.stones[i].isOnTarget(i))
        return false;
    return true;
  }

  // counts the inversions on the board
  // see https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/
  getInversionCount() {
    let inversions = 0;
    for (outer = 0; outer < stonesPerBoard - 1; outer++) {
      let outernr = this.stones[outer].number;
      if (outernr === 0)
        continue;
      for (inner = outer + 1; inner < stonesPerBoard; inner++) {
        let innernr = this.stones[inner].number;
        if (innernr > 0 && outernr > innernr)
          inversions++;
      }
    }
    return inversions;
  }

  // return whether the puzzle is solvable
  // see https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/
  isSolvable() {
    let invs = this.getInversionCount();
    if (stonesPerLine % 2 !== 0) // odd number of rows/columns
      return (invs % 2 === 0);
    else {
      return ((invs + this.rowOf0()) % 2 !== 0);
    }
  }

  // draw the result field, pass null as argument if not called from worker
  drawResult(worker) {
    let field = this.resultField;
    let solved = this.isSolved();
    if (solved)
      g.setColor(0, 1, 0);
    else
      g.setColor(1, 0, 0);
    g.fillRect(field.left, field.top, field.left + stonesize, field.top + stonesize);
    g.setColor(0, 0, 0);
    g.drawRect(field.left, field.top, field.left + stonesize, field.top + stonesize);
    g.setFont("Vector", 14).setFontAlign(0, 0).drawString(this.moveCount, field.centerx, field.centery);
    if (worker !== null)
      worker.endTask();
    if (solved)
      setTimeout(() => {
        gameEnd(this.moveCount);
      }, 500);
  }

  // draws the menu button
  drawMenu() {
    let field = this.menuField;
    g.setColor(0.5, 0.5, 0.5);
    g.fillRect(field.left, field.top, field.left + stonesize, field.top + stonesize);
    g.setColor(0, 0, 0);
    g.drawRect(field.left, field.top, field.left + stonesize, field.top + stonesize);
    let l = field.left + 8;
    let r = field.left + stonesize - 8;
    let t = field.top + 5;
    for (i = 0; i < 3; i++)
      g.fillRect(l, t + (i * 6), r, t + (i * 6) + 2);
  }

}


// *** Global helper methods

// draw some text with some surrounding to increase contrast
// text is drawn at given (x,y) position with textcol.
// frame is drawn 2 pixels around (x,y) in each direction in framecol.
function framedText(text, x, y, textcol, framecol) {
  g.setColor(framecol);
  for (i = -2; i < 3; i++)
    for (j = -2; j < 3; j++) {
      if (i === 0 && j === 0)
        continue;
      g.drawString(text, x + i, y + j);
    }
  g.setColor(textcol).drawString(text, x, y);
}

// Show the splash screen at program start, call afterSplash afterwards.
// If spash mode is "off", call afterSplash directly.
function showSplash(afterSplash) {
  if (splashMode === "off")
    afterSplash();
  else {
    g.reset();
    g.drawImage(introscreen, 0, 0);
    setTimeout(() => {
      g.setFont("Vector", 40).setFontAlign(0, 0);
      framedText("15", g.getWidth() / 2, g.getHeight() / 2 - g.getFontHeight() * 0.66, "#f00", "#fff");
      setTimeout(() => {
        g.setFont("Vector", 40).setFontAlign(0, 0);
        framedText("Puzzle", g.getWidth() / 2, g.getHeight() / 2 + g.getFontHeight() * 0.66, "#f00", "#fff");
        setTimeout(afterSplash, (splashMode === "long" ? 2000 : 1000));
      }, (splashMode === "long" ? 1000 : 1));
    }, (splashMode === "long" ? 2000 : 1000));
  }
}


// *** Global flow control

// Initialize the game with an explicit number of stones per line
function initGame(bpl) {
  setStonesPreLine(bpl);
  newGame();
}

// Start a new game with the same number of stones per line as before
function newGame() {
  board = new Board();
  continueGame();
}

// Continue the currently running game
function continueGame() {
  E.showMenu();
  board.draw();
  dragger.setEnabled(true);
}

// Show message on game end, allows to restart new game
function gameEnd(moveCount) {
  dragger.setEnabled(false);
  E.showPrompt("You solved the\n" + stonesPerLine + "x" + stonesPerLine + " puzzle in\n" + moveCount + " move" + (moveCount === 1 ? "" : "s") + ".", {
    title: "Puzzle solved",
    buttons: {
      "Again": newGame,
      "Menu": () => showMenu(false),
      "Exit": exitGame
    }
  }).then(v => {
    E.showPrompt();
    setTimeout(v, 10);
  });
}

// A tiny about screen
function showAbout(doContinue) {
  E.showAlert("Author: Dirk Hillbrecht\nLicense: MIT", "Puzzle15").then(() => {
    if (doContinue)
      continueGame();
    else
      showMenu(false);
  });
}

// Show the in-game menu allowing to start a new game
function showMenu(withContinue) {
  var mainmenu = {
    "": {
      "title": "15 Puzzle"
    }
  };
  if (withContinue)
    mainmenu.Continue = continueGame;
  mainmenu["Start 3x3"] = () => initGame(3);
  mainmenu["Start 4x4"] = () => initGame(4);
  mainmenu["Start 5x5"] = () => initGame(5);
  mainmenu.About = () => showAbout(withContinue);
  mainmenu.Exit = exitGame;
  dragger.setEnabled(false);
  g.clear(true);
  E.showMenu(mainmenu);
}

// Handle a "click" event (only needed for menu button)
function handleclick(e) {
  if (board.menuField.contains(e.x, e.y))
    setTimeout(() => showMenu(true), 10);
}

// Handle a drag event (moving the stones around)
function handledrag(e) {
  worker.addTask(Math.abs(e.dx) > Math.abs(e.dy) ?
    (e.dx > 0 ? e => board.moveRight(e) : e => board.moveLeft(e)) :
    (e.dy > 0 ? e => board.moveDown(e) : e => board.moveUp(e)));
  worker.addTask(e => board.drawResult(e));
}

// exit the game, clear screen first to prevent ghost images
function exitGame() {
  g.clear(true);
  setTimeout(load, 300);
}


// *** Main program

g.clear(true);

// Load global app settings
loadSettings();

// We need a worker...
var worker = new Worker();

// Board will be initialized after the splash screen has been shown
var board;

// Dragger is needed for interaction during the game
var dragger = new Dragger(handleclick, handledrag, clickThreshold, dragThreshold);

// Disable dragger as board is not yet initialized
dragger.setEnabled(false);

// Nevertheless attach it so that it is ready once the game starts
dragger.attach();

// Start the game by handling the splash screen sequence
showSplash(() => {
  // Clock mode allows short-press on button to exit
  Bangle.setUI("clock");
  // Load widgets
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  if (startWith === "3x3")
    initGame(3);
  else if (startWith === "4x4")
    initGame(4);
  else if (startWith === "5x5")
    initGame(5);
  else
    showMenu(false);
});

// end of file
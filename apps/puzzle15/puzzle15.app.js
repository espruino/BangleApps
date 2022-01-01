// A 15-puzzle game for the Bangle.js 2 clock
// (C) Dirk Hillbrecht 2022
// Released unter the terms of the MIT license

// *** Global settings
// Note: These could be changed by settings later...

// Minimum number of pixels to interpret it as drag gesture
const dragThreshold = 10;

// Maximum number of pixels to interpret a click from a drag event series
const clickThreshold = 3;

// Number of steps in button move animation
const animationSteps = 6;

// Milliseconds to wait between move animation steps
const animationWaitMillis = 30;

// *** Global settings derived by device characteristics

// Total width of the playing field (full screen width)
const fieldw = g.getWidth();

// Total height of the playing field (screen height minus widget zones)
const fieldh = g.getHeight() - 48;

// Size of the playing field
var buttonsPerLine;

// Size of one button
var buttonsize;

// Actual left start of the playing field (so that it is centered)
var leftstart;

// Actual top start of the playing field (so that it is centered)
var topstart;

// Number of buttons on the board (needed at several occasions)
var buttonsPerBoard;

// Set the buttons per line globally and all derived values, too
function setButtonsPerLine(bPL) {
  buttonsPerLine = bPL;
  buttonsize = Math.floor(Math.min(fieldw / (buttonsPerLine + 1), fieldh / buttonsPerLine)) - 2;
  leftstart = (fieldw - ((buttonsPerLine + 1) * buttonsize + 8)) / 2;
  topstart = 24 + ((fieldh - (buttonsPerLine * buttonsize + 6)) / 2);
  buttonsPerBoard = (buttonsPerLine * buttonsPerLine);
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
    this.centerx = (left + buttonsize / 2) + 1;
    this.centery = (top + buttonsize / 2) + 2;
  }
  // Returns whether this field contains the given coordinate
  contains(x, y) {
    return (this.left < x && this.left + buttonsize > x &&
      this.top < y && this.top + buttonsize > y);
  }
  // Generate a field for the given playing field index.
  // Playing field indexes start at top left with "0"
  // and go from left to right line by line from top to bottom.
  static forIndex(index) {
    return new Field(leftstart + (index % buttonsPerLine) * (buttonsize + 2),
      topstart + (Math.floor(index / buttonsPerLine)) * (buttonsize + 2));
  }
  // Special field for the result "stone"
  static forResult() {
    return new Field(leftstart + (buttonsPerLine * (buttonsize + 2)),
      topstart + ((buttonsPerLine - 1) * (buttonsize + 2)));
  }
  // Special field for the menu
  static forMenu() {
    return new Field(leftstart + (buttonsPerLine * (buttonsize + 2)),
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
    else if ((number + (buttonsPerLine % 2 == 0 ? (Math.floor((number - 1) / buttonsPerLine)) : 0)) % 2 == 0) {
      // Black stone
      this.draw = function(field) {
        g.setFont("Vector", 20).setFontAlign(0, 0).setColor(0, 0, 0);
        g.fillRect(field.left, field.top, field.left + buttonsize, field.top + buttonsize);
        g.setColor(1, 1, 1).drawString(number, field.centerx, field.centery);
      };
    } else {
      // White stone
      this.draw = function(field) {
        g.setFont("Vector", 20).setFontAlign(0, 0).setColor(0, 0, 0);
        g.drawRect(field.left, field.top, field.left + buttonsize, field.top + buttonsize);
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
      this.maxleft + buttonsize, this.maxtop + buttonsize);
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
// TODO: More game mechanics (solving,...)
class Board {
  // Generates the actual playing field with all fields and buttons
  constructor() {
    this.fields = [];
    this.resultField = Field.forResult();
    this.menuField = Field.forMenu();
    for (i = 0; i < buttonsPerBoard; i++)
      this.fields[i] = Field.forIndex(i);
    this.setShuffled();
  }
  // Set the board into the "solved" position
  setSolved() {
    this.buttons = [];
    for (i = 0; i < buttonsPerBoard; i++)
      this.buttons[i] = new Stone((i + 1) % buttonsPerBoard, i);
    this.moveCount = 0;
  }
  setShuffled() {
    let nrs = [];
    for (i = 0; i < buttonsPerBoard; i++)
      nrs[i] = i;
    this.buttons = [];
    let count = buttonsPerBoard;
    for (i = 0; i < buttonsPerBoard; i++) {
      let curridx = Math.floor(Math.random() * count);
      let currnr = nrs[curridx];
      this.buttons[i] = new Stone(currnr, (currnr + (buttonsPerBoard - 1)) % buttonsPerBoard);
      for (j = curridx + 1; j < count; j++)
        nrs[j - 1] = nrs[j];
      count -= 1;
    }
    if (!this.isSolvable()) {
      let a = (this.buttons[0].number === 0 ? 2 : 0);
      let b = (this.buttons[1].number === 0 ? 2 : 1);
      let bx = this.buttons[a];
      this.buttons[a] = this.buttons[b];
      this.buttons[b] = bx;
    }
    this.moveCount = 0;
  }
  // Draws the complete playing field
  draw() {
    new Clearer(this.fields[0], this.fields[this.fields.length - 1]).clearArea();
    for (i = 0; i < this.fields.length; i++)
      this.buttons[i].draw(this.fields[i]);
    this.drawResult(null);
    this.drawMenu();
  }
  // returns the index of the field left of the field with the given index,
  // -1 if there is none (index indicates already a leftmost field on the board)
  leftOf(index) {
    return (index % buttonsPerLine === 0 ? -1 : index - 1);
  }
  rightOf(index) {
    return (index % buttonsPerLine === (buttonsPerLine - 1) ? -1 : index + 1);
  }
  topOf(index) {
    return (index >= buttonsPerLine ? index - buttonsPerLine : -1);
  }
  bottomOf(index) {
    return (index < (buttonsPerLine - 1) * buttonsPerLine ? index + buttonsPerLine : -1);
  }
  // Return the index of the gap in the field, -1 if there is none (should never happel)
  indexOf0() {
    for (i = 0; i < this.buttons.length; i++)
      if (this.buttons[i].number === 0)
        return i;
    return -1;
  }
  // Returns the row in which the gap is, 0 is upmost
  rowOf0() {
    let idx = this.indexOf0();
    if (idx < 0)
      return -1;
    return Math.floor(idx / buttonsPerLine);
  }
  // Moves the stone at the field with the index found by the startfunc operation
  // into the gap field.
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
    let moved = this.buttons[startidx];
    this.buttons[startidx] = this.buttons[endidx];
    this.buttons[endidx] = moved;
    this.moveCount += 1;
    new Mover(moved, this.fields[startidx], this.fields[endidx], animationSteps).animate(worker);
  }
  // Move the stone right fro the gap into the gap
  moveRight(worker) {
    this.moveTo0(this.leftOf, worker);
  }
  moveLeft(worker) {
    this.moveTo0(this.rightOf, worker);
  }
  moveUp(worker) {
    this.moveTo0(this.bottomOf, worker);
  }
  moveDown(worker) {
    this.moveTo0(this.topOf, worker);
  }
  // Check if the board is solved (all stones at the right position)
  isSolved() {
    for (i = 0; i < this.buttons.length; i++)
      if (!this.buttons[i].isOnTarget(i))
        return false;
    return true;
  }
  // counts the inversions on the board
  // see https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/
  getInversionCount() {
    let inversions = 0;
    for (outer = 0; outer < buttonsPerBoard - 1; outer++) {
      let outernr = this.buttons[outer].number;
      if (outernr === 0)
        continue;
      for (inner = outer + 1; inner < buttonsPerBoard; inner++) {
        let innernr = this.buttons[inner].number;
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
    if (buttonsPerLine % 2 !== 0) // odd number of rows/columns
      return (invs % 2 === 0);
    else {
      return ((invs + this.rowOf0()) % 2 !== 0);
    }
  }
  // draw the result field, pass null as argument if not called from worker
  drawResult(worker) {
    let field = this.resultField;
    if (this.isSolved())
      g.setColor(0, 1, 0);
    else
      g.setColor(1, 0, 0);
    g.fillRect(field.left, field.top, field.left + buttonsize, field.top + buttonsize);
    g.setColor(0, 0, 0);
    g.drawRect(field.left, field.top, field.left + buttonsize, field.top + buttonsize);
    g.setFont("Vector", 14).setFontAlign(0, 0).drawString(this.moveCount, field.centerx, field.centery);
    if (worker !== null)
      worker.endTask();
  }
  // draws the menu button
  drawMenu() {
    let field = this.menuField;
    g.setColor(0.5, 0.5, 0.5);
    g.fillRect(field.left, field.top, field.left + buttonsize, field.top + buttonsize);
    g.setColor(0, 0, 0);
    g.drawRect(field.left, field.top, field.left + buttonsize, field.top + buttonsize);
    let l = field.left + 8;
    let r = field.left + buttonsize - 8;
    let t = field.top + 5;
    for (i = 0; i < 3; i++)
      g.fillRect(l, t + (i * 7), r, t + (i * 7) + 3);
  }
}

/*
// Main class, containing the complete game logic
class Puzzle15 {
  constructor() {
    this.worker=new Worker();
    this.board=new Board();
  }
}
*/

// *** Main program

// We need a worker...
var worker = new Worker();

setButtonsPerLine(3);
// ...and the board
var board = new Board();

var dragger;

function initGame(bpl) {
  setButtonsPerLine(bpl);
  board = new Board();
  board.draw();
  dragger.setEnabled(true);
}

function showMenu() {
  var mainmenu = {
    "": {
      "title": "15 Puzzle"
    },
    "< Back": () => {
      E.showMenu();
      dragger.setEnabled(true);
      board.draw();
    }, // remove the menu
    "Start 3x3": function() {
      E.showMenu();
      initGame(3);
    },
    "Start 4x4": function() {
      E.showMenu();
      initGame(4);
    },
    "Start 5x5": function() {
      E.showMenu();
      initGame(5);
    }
  };
  dragger.setEnabled(false);

  E.showMenu(mainmenu);
}

function handleclick(e) {
  if (board.menuField.contains(e.x, e.y)) {
    console.log("GGG - handleclick, dragger: " + dragger);
    g.reset();
    showMenu();
    console.log("showing menu ended");
  }
}

// Handle a drag event
function handledrag(e) {
  worker.addTask(Math.abs(e.dx) > Math.abs(e.dy) ?
    (e.dx > 0 ? e => board.moveRight(e) : e => board.moveLeft(e)) :
    (e.dy > 0 ? e => board.moveDown(e) : e => board.moveUp(e)));
  worker.addTask(e => board.drawResult(e));
}

// Clear the screen once, at startup
g.clear();

// Clock mode allows short-press on button to exit
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// Draw the board initially
board.draw();

dragger = new Dragger(handleclick, handledrag, clickThreshold, dragThreshold);

showMenu();
// Start the interaction
dragger.attach();

console.log("GGG - main program, dragger: " + dragger);

// end of file
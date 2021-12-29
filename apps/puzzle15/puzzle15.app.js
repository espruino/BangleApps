// A 15-puzzle game for the Bangle.js 2 clock
// (C) Dirk Hillbrecht 2022
// Released unter the terms of the MIT license

// *** Global settings
// Note: These could be changed by settings later...

// Minimum number of pixels to interpret it as drag gesture
const dragThreshold = 10;

// Number of steps in button move animation
const animationSteps = 5;

// Milliseconds to wait between move animation steps
const animationWaitMillis = 70;

// Size of the playing field
const buttonsPerLine = 4;

// *** Global settings derived by device characteristics

// Total width of the playing field (full screen width)
const fieldw = g.getWidth();

// Total height of the playing field (screen height minus widget zones)
const fieldh = g.getHeight() - 48;

// Size of one button
const buttonsize = Math.floor(Math.min(fieldw / (buttonsPerLine + 1), fieldh / buttonsPerLine)) - 2;

// Actual left start of the playing field (so that it is centered)
const leftstart = (fieldw - ((buttonsPerLine + 1) * buttonsize + 8)) / 2;

// Actual top start of the playing field (so that it is centered)
const topstart = 24 + ((fieldh - (buttonsPerLine * buttonsize + 6)) / 2);

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
    oldfirst = this.first;
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
  // Generate a field for the given playing field index.
  // Playing field indexes start at top left with "0"
  // and go from left to right line by line from top to bottom.
  static forIndex(index) {
    return new Field(leftstart + (index % buttonsPerLine) * (buttonsize + 2),
      topstart + (Math.floor(index / buttonsPerLine)) * (buttonsize + 2));
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
    if (step < this.steps)  // still steps left: Issue next step
      setTimeout(function(t) {
        t.animateStep(step + 1, worker);
      }, animationWaitMillis, this);
    else  // all steps done: Inform the worker
      worker.endTask();
  }
  // Start the animation, this method is called by the worker
  animate(worker) {
    this.animateStep(1, worker);
  }
}

// Representation of the playing field
// Knows to draw the field and to move a stone into a gap
// TODO: More game mechanics (shuffling, solving,...)
class Board {
  // Generates the actual playing field with all fields and buttons
  constructor() {
    this.fields = [];
    this.buttons = [];
    for (i = 0; i < (buttonsPerLine * buttonsPerLine); i++) {
      this.fields[i] = Field.forIndex(i);
      this.buttons[i] = new Stone((i + 1) % (buttonsPerLine * buttonsPerLine),i);
    }
  }
  // Draws the complete playing field
  draw() {
    new Clearer(this.fields[0], this.fields[this.fields.length - 1]).clearArea();
    for (i = 0; i < this.fields.length; i++)
      this.buttons[i].draw(this.fields[i]);
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
  // Moves the stone at the field with the index found by the startfunc operation
  // into the gap field.
  moveTo0(startfunc, animator) {
    let endidx = this.indexOf0(); // Target field (the gap)
    if (endidx === -1) {
      animator.endTask();
      return;
    }
    let startidx = startfunc(endidx);  // Start field (relative to the gap)
    if (startidx === -1) {
      animator.endTask();
      return;
    }
    let moved = this.buttons[startidx];
    this.buttons[startidx] = this.buttons[endidx];
    this.buttons[endidx] = moved;
    new Mover(moved, this.fields[startidx], this.fields[endidx], animationSteps).animate(animator);
  }
  // Move the stone right fro the gap into the gap
  moveRight(animator) {
    this.moveTo0(this.leftOf, animator);
  }
  moveLeft(animator) {
    this.moveTo0(this.rightOf, animator);
  }
  moveUp(animator) {
    this.moveTo0(this.bottomOf, animator);
  }
  moveDown(animator) {
    this.moveTo0(this.topOf, animator);
  }
  // Check if the board is solved (all stones at the right position)
  isSolved() {
    for (i = 0; i < this.buttons.length; i++)
      if (!this.buttons[i].isOnTarget(i))
        return false;
    return true;
  }
}

// *** Main program

// We need a worker...
var worker = new Worker();
// ...and the board
var board = new Board();

// UI: Accumulation of current drag operation
var currentdrag = {
  x: 0,
  y: 0
};

// Handle a drag event
function handledrag(e) {
  if (e.b === 0) { // Drag event ended: Evaluate drag and start move operation
    if (Math.abs(currentdrag.x) > Math.abs(currentdrag.y)) { // Horizontal drag
      if (currentdrag.x > dragThreshold)
        worker.addTask(e => board.moveRight(e));
      else if (currentdrag.x < -dragThreshold)
        worker.addTask(e => board.moveLeft(e));
    } else { // Vertical drag
      if (currentdrag.y > dragThreshold)
        worker.addTask(e => board.moveDown(e));
      else if (currentdrag.y < -dragThreshold)
        worker.addTask(e => board.moveUp(e));
    }
    currentdrag.x = 0; // Clear the drag accumulator
    currentdrag.y = 0;
  } else { // Drag still running: Accumulate drag shifts
    currentdrag.x += e.dx;
    currentdrag.y += e.dy;
  }
}

// Clear the screen once, at startup
g.clear();
// Drop mode as this is a game
Bangle.setUI(undefined);
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// Draw the board initially
board.draw();
// Start the interaction
Bangle.on("drag", handledrag);

// end of file
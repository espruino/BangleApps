const textInput = require("textinput");

g.reset();
g.clearRect(Bangle.appRect);
E.showMessage("Loading ... ");
Bangle.loadWidgets();
Bangle.drawWidgets();

const localTaskFile = "wrkmem.json";
const savedData     = {
  tasks: [], keyboardAlpha: undefined, settings: {textOutlines: true, noWordBreaks: true}
};

Object.assign(savedData, require("Storage")
.readJSON(localTaskFile, true) || {});

//let currentMenu;

const allTasks = savedData.tasks;
const SWIPE    = {
  LEFT: 2, RIGHT: 0, UP: 3, DOWN: 1,
}

/**
 * A management object that helps us keep track of all our task timeouts.
 * @type {{queueResponseTimeout: nudgeManager.queueResponseTimeout, taskTimeout: null, queueNudge:
 *   nudgeManager.queueNudge, interrupt: nudgeManager.interrupt, responseTimeout: null, activeTask: null}}
 */
const nudgeManager = {
  activeTask             : null, taskTimeout: null, responseTimeout: null, interrupt: () => {
    if (this.taskTimeout) clearTimeout(this.taskTimeout);
    if (this.responseTimeout) clearTimeout(this.responseTimeout);
    this.activeTask = null;
  }, queueNudge          : (task, nudgeFn) => {
    if (this.responseTimeout) clearTimeout(this.responseTimeout);
    if (this.taskTimeout) clearTimeout(this.taskTimeout);
    this.activeTask    = task;
    const backoffIndex = task.useBackoff ? task.backoffIndex : 1;
    const time         = task.incrementalBackoffSet[backoffIndex] * task.interval * 1000;
    this.taskTimeout   = setTimeout(nudgeFn, time);
  }, queueResponseTimeout: (defaultFn) => {
    // This timeout shouldn't be set if we've queued a response timeout, but we clear it anyway.
    if (this.taskTimeout) clearTimeout(this.taskTimeout);
    this.responseTimeout = setTimeout(defaultFn, 15000);
  },
}

let keyboardAlpha, keyboardAlphaShift;

if (textInput.generateKeyboard) {
  //const charSet = textInput.createCharSet("ABCDEFGHIJKLMNOPQRSTUVWXYZ", ["spc", "ok", "del"]);
  keyboardAlpha = textInput.generateKeyboard([
    ["a", "b", "c", "j", "k", "l", "s", "t", "u"],
    ["d", "e", "f", "m", "n", "o", "v", "w", "x"],
    ["g", "h", "i", "p", "q", "r", "y", "z"],
    "spc",
    "ok",
    "del"
  ]);
  keyboardAlphaShift = textInput.generateKeyboard([
    ["A", "B", "C", "J", "K", "L", "S", "T", "U"],
    ["D", "E", "F", "M", "N", "O", "V", "W", "X"],
    ["G", "H", "I", "P", "Q", "R", "Y", "Z"],
    "spc",
    "cncl",
    "del"
  ])
}

/**
 * Save the data in 'savedData' to flash memory.
 */
function save() {
  require("Storage")
  .writeJSON("wrkmem.json", savedData);
}

/**
 * This function is a workaround wrapper for a menu navigation bug. After 'onchange' the menu re-renders itself
 * so to avoid graphical glitches we postpone whatever funciton we actually want by 5ms.
 * @param fn The function you actually want to call
 * @returns {function(): any} The same function wrapped in a setTimeout with a 5ms delay.
 */
function st5(fn) {
  return () => setTimeout(fn, 5);
}

/**
 * Given a position and set of dimensions, create a button object that represents a rectangle in space containing text
 * and some associated functionality.
 * @param x
 * @param y
 * @param w
 * @param h
 * @param text
 * @param callback
 * @returns {{padding: number, r: number, getDrawable: (function(*, *, *, *, *): {r, x, y, y2, x2}), w, x, h, y, text:
 *   string, onTouch: ((function(*, *): (*|undefined))|*)}}
 */
function createButton(x, y, w, h, text, callback) {
  text              = text || "";
  const x2          = x + w;
  const y2          = y + h;
  const r           = 8;
  const padding     = 2;
  const getDrawable = (xOff, yOff, wOff, hOff, rOff) => {
    xOff = xOff || 0;
    yOff = yOff || 0;
    wOff = wOff || 0;
    hOff = hOff || 0;
    rOff = rOff || 0;
    return {x: x + xOff, y: y + yOff, x2: x2 + wOff, y2: y2 + hOff, r: r + rOff};
  };
  let onTouch;
  if (callback) {
    onTouch = (button, xy) => {
      const isTouched = x < xy.x && x2 > xy.x && y < xy.y && y2 > xy.y;
      if (isTouched) {
        Bangle.buzz(30, 1);
        return callback();
      }
    };
  }
  return {
    x, y, w, h, r, text, getDrawable, padding, onTouch
  };
}

/**
 * Given a button object, draw that button onto the screen. This includes the background, borders, effects, and text.
 * @param button
 */
function drawButton(button) {
  const textMaxWidth = button.w - 2 * button.padding;
  let textOutlineCol = g.theme.bgH;
  let textCol        = g.theme.fg;
  if (button.onTouch) {
    g.setColor(g.theme.fg)
     .fillRect(button.getDrawable());
    g.setColor(g.theme.bg)
     .fillRect(button.getDrawable(2, 1, -1, -1));
    g.setColor(g.theme.bg2)
     .fillRect(button.getDrawable(3, 3, -3, -3));
    textOutlineCol = g.theme.bg;
    textCol        = g.theme.fg;
  }
  const font = getBestFontForButton(button);
  // Wrap sometimes adds a line break at the beginning if your string is very small.
  // So we filter out any elements that are empty.
  const wrapText = g.setFont(font)
                    .wrapString(button.text, textMaxWidth)
                    .filter(t => !!t)
                    .join("\n");
  if (savedData.settings.textOutlines) {
    g.setFontAlign(0, 0)
     .setColor(textOutlineCol)
     .drawString(wrapText, button.x + button.w / 2 + 1, button.y + button.h / 2 - 1, false);
    g.setFontAlign(0, 0)
     .setColor(textOutlineCol)
     .drawString(wrapText, button.x + button.w / 2 - 1, button.y + button.h / 2 - 1, false);
    g.setFontAlign(0, 0)
     .setColor(textOutlineCol)
     .drawString(wrapText, button.x + button.w / 2 - 1, button.y + button.h / 2 + 1, false);
    g.setFontAlign(0, 0)
     .setColor(textOutlineCol)
     .drawString(wrapText, button.x + button.w / 2 + 1, button.y + button.h / 2 + 1, false);
  }
  g.setFontAlign(0, 0)
   .setColor(textCol)
   .drawString(wrapText, button.x + button.w / 2, button.y + button.h / 2, false);
  g.reset();
}

/**
 * Given a button object, determine what font would be best to display the button's text without breaching the
 * dimensions of the button itself. Not perfectly at the moment, but serviceably.
 * @param button
 * @returns {string}
 */
function getBestFontForButton(button) {
  const allowedFonts  = ["12x20", "6x15", "6x8", "4x6"];
  let stringMet       = g.setFont("Vector:100")
                         .stringMetrics(button.text);
  let stringArea      = stringMet.width * stringMet.height;
  const sampleMetric  = g.setFont("Vector:100")
                         .stringMetrics("D");
  const vectorRatio   = sampleMetric.height / sampleMetric.width;
  // Effective height helps us handle tall skinny buttons, since text is usually horizontal.
  let effectiveHeight = Math.min(button.h, button.w);
  if (!button.text.includes(" ") && savedData.settings.noWordBreaks) {
    effectiveHeight = effectiveHeight / vectorRatio
  }
  const buttonArea = button.w * effectiveHeight;
  const ratio      = stringArea / buttonArea;
  const vecSize    = Math.floor(100 / ratio);
  if (vecSize > 20) {
    return "Vector:" + vecSize;
  }
  let i;
  for (i = 0; i < allowedFonts.length - 1; i++) {
    stringMet  = g.setFont(allowedFonts[i])
                  .stringMetrics(button.text);
    stringArea = Math.max(stringMet.width, button.w) * stringMet.height;
    if (stringArea < buttonArea * 0.8) {
      break;
    }
  }
  return allowedFonts[i];
}

/**
 * Given a rotation (0-3) and a label, create an object representing a swipe hint, complete with draw instructions,
 * a handler, and the specified rotation.
 * @param rot A number, preferably from the SWIPE enum. 0 = 0 degrees. 1 = 90 degrees. 2 = 180 degrees, etc.
 * @param text The text to display on the swipe hint
 * @param callback The function to be called when the corresponding direction is swiped.
 * @returns {{rot, onSwipe: ((function(*, *): (*|undefined))|*), draw: draw}}
 */
function createSwipeControl(rot, text, callback) {
  let draw     = () => {};
  let appRect  = Bangle.appRect;
  let isSwiped = () => {};
  switch (rot) {
    case 0:
      draw     = () => drawSwipeHint(appRect.x + appRect.w / 2, appRect.y + appRect.h - 6, 0, text);
      isSwiped = (LR, UD) => LR === 1;
      break;
    case 1:
    case -3:
      draw     = () => drawSwipeHint(appRect.x + 6, appRect.y + appRect.h / 2, 1, text);
      isSwiped = (LR, UD) => UD === 1;
      break;
    case 2:
    case -2:
      draw     = () => drawSwipeHint(appRect.x + appRect.w / 2, appRect.y + appRect.h - 16, 0, text, true);
      isSwiped = (LR, UD) => LR === -1;
      break;
    case 3:
    case -1:
      draw     = () => drawSwipeHint(appRect.x + appRect.w - 6, appRect.y + appRect.h / 2, 3, text);
      isSwiped = (LR, UD) => UD === -1;
      break;
  }
  const onSwipe = (LR, UD) => {
    if (isSwiped(LR, UD)) {
      return callback();
    }
  }
  return {draw, onSwipe, rot};
}

/**
 * Given a position, rotation, text, and mirror option, draw a swipe hint on the screen.
 * @param x The x position of the center of the swipe hint.
 * @param y The y position of the center of the swipe hint.
 * @param rot The SWIPE rotation enumerated value (0-3) indicating the direction.
 * @param text The text to display in the hint.
 * @param flip Whether or not to flip the direction of the swipe hint (left to right, up to down, etc).
 */
function drawSwipeHint(x, y, rot, text, flip) {
  const tw   = g.setFont("6x8")
                .stringWidth(text);
  const w    = tw + 41;
  const gRot = Graphics.createArrayBuffer(w, 8, 1, {msb: true});
  gRot.setFont("6x8")
      .setFontAlign(0, -1)
      .drawString(text, w / 2, 1);
  gRot.drawLine(0, 4, (w - tw) / 2 - 4, 4);
  gRot.drawLine((w + tw + 4) / 2, 4, w, 4);
  if (flip) {
    gRot.drawLine(0, 4, 4, 1);
    gRot.drawLine(0, 4, 4, 7);
  } else {
    gRot.drawLine(w, 4, w - 4, 1);
    gRot.drawLine(w, 4, w - 4, 7);
  }
  g.setColor(g.theme.fg)
   .drawImage(gRot, x, y, {rotate: Math.PI / 2 * rot});
}

/**
 * Given a set of options, create a drawable / UI-able menu object that attempts to lay out buttons and swipe hints in
 * a given space. Returns an object with both setUI and render functions.
 * @param options
 * @returns {{setUI: (function(): void), buttons: *[], render: render}}
 */
function createMenu(options) {
  let width           = options.width || Bangle.appRect.w;
  let height          = options.height || Bangle.appRect.h;
  let offsetY         = Bangle.appRect.y;
  const spaceBetween  = options.spaceBetween || 5;
  const spaceAround   = options.spaceAround || 5;
  const titleFont     = options.titleFont || "12x20";
  let marginTop       = 0;
  let marginBottom    = 0;
  let marginLeft      = 0;
  let marginRight     = 0;
  const swipeControls = options.swipeControls || [];
  // Add some margin space to fit swipe control hints if they exist.
  swipeControls.forEach(control => {
    if (control.rot === 0) marginBottom += 8;
    if (control.rot === 1) marginLeft += 8;
    if (control.rot === 2) marginBottom += 8;
    if (control.rot === 3) marginRight += 8;
  });
  // Add top margin to fit the title.
  if (options.title) {
    const mets = g.setFont(titleFont)
                  .stringMetrics(options.title);
    marginTop += mets.height;
  }
  height              = height - marginTop - marginBottom;
  width               = width - marginLeft - marginRight;
  const isHorizontal  = !!options.isHorizontal;
  const numGridSpaces = options.items.reduce((acc, item) => (acc + (item.size || 1)), 0);
  const shortDim      = isHorizontal ? width : height;
  const length        = ((shortDim - spaceBetween) / numGridSpaces) - spaceAround;
  const buttons       = [];
  // currentGrid tracks what grid square we are covering. Any item may cover multiple grid squares.
  let currentGrid     = 0;
  options.items.forEach((item) => {
    let x, y, w, h;
    const mySize   = item.size || 1;
    // myLength represents the shorter of the two dimensions of the button (depending on menu orientation, w / h).
    const myLength = length * mySize + spaceBetween * (mySize - 1);
    if (isHorizontal) {
      x = spaceAround + currentGrid * (length + spaceBetween) + marginLeft;
      y = spaceAround + marginTop + offsetY;
      w = myLength;
      h = height - 2 * spaceAround;
    } else {
      x = spaceAround + marginLeft;
      y = spaceAround + currentGrid * (length + spaceBetween) + marginTop + offsetY;
      w = width - 2 * spaceAround;
      h = myLength;
    }
    currentGrid += item.size || 1;
    buttons.push(createButton(x, y, w, h, item.text, item.callback));
  })

  function render() {
    buttons.forEach(drawButton);
    if (options.title) {
      g.setFont(titleFont)
       .setFontAlign(0, -1)
       .drawString(options.title, width / 2 + marginLeft, offsetY);
    }
    swipeControls.forEach(control => control.draw());
  }

  const touchFunc = (button, xy) => buttons.forEach(b => b.onTouch && b.onTouch(button, xy));
  const swipeFunc = (LR, UD) => swipeControls.forEach(s => s.onSwipe(LR, UD));
  const btnFunc   = options.backFn;
  return {
    buttons, render, setUI: () => Bangle.setUI({mode: "custom", touch: touchFunc, swipe: swipeFunc, btn: btnFunc})
  };
}

/**
 * Given a menu object (a custom menu object created in this app, not an Espruino menu object) draw the menu to the
 * screen and set the UI framework to the one appropriate to that menu.
 * @param menu
 */
function setMenu(menu) {
  save();
  g.reset();
  g.clearRect(Bangle.appRect);
  //currentMenu = menu;
  menu.render();
  menu.setUI();
  Bangle.drawWidgets();
}

/**
 * Create a new task with a given set of initial text. The user will be prompted with a keyboard to title the task.
 * Once the task is created, begin that task.
 * @param initialText
 */
function newTask(initialText) {
  nudgeManager.interrupt();
  initialText = initialText || "";
  textInput.input({text: initialText, keyboardMain: keyboardAlpha, keyboardShift: keyboardAlphaShift})
           .then(text => {
             if (!text) {
               setMenu(mainMenu);
             }
             const task = createTask(text)
             allTasks.unshift(task);
             save();
             startTask(task);
           })
}

/**
 * Begin the indicated task, taking the user to the corresponding menu / display screen and starting all relevant timers
 * @param task
 */
function startTask(task) {
  nudgeManager.queueNudge(task, () => nudge(task));
  g.clear();
  const onPressBack = () => {
    nudgeManager.interrupt();
    setMenu(mainMenu)
  }
  setMenu(getTaskMenu(task, onPressBack));
}

/**
 * Remind the user of an ongoing task, prompting them to affirm that they are on task, distracted, or, after a set time
 * period, unresponsive.
 * @param task
 */
function nudge(task) {
  Bangle.buzz(250, 1)
        .then(() => {
          Bangle.setLocked(false);
          Bangle.setLCDPower(true);
        });
  const nudgeMenu = createMenu({
    title          : "Are you on task?", titleFont: "6x8", items: [
      {text: task.text, size: 1}, {text: "On Task", size: 1, callback: () => affirmOnTask(task)}, {
        text: "Distracted", size: 1, callback: () => affirmDistracted(task)
      }
    ], isHorizontal: false
  });
  setMenu(nudgeMenu);
  nudgeManager.queueResponseTimeout(() => concludeUnresponsive(task));
}

/**
 * Invoked when the user affirms that they are on task, increasing the affirmation count on the given task and
 * advancing the incremental backoff counter. Congratulates the user for the response.
 * @param task
 */
function affirmOnTask(task) {
  task.affirmCount++;
  task.backoffIndex = Math.min(task.incrementalBackoffSet.length - 1, task.backoffIndex + 1);
  showTempMessage("Great job!", "On Task!", () => startTask(task));
}

/**
 * Invoked when the user affirms that they were distracted, increasing the distraction count and lowering the
 * incremental backoff counter. Encourages the user to keep trying.
 * @param task
 */
function affirmDistracted(task) {
  task.distractCount++;
  task.backoffIndex = Math.max(0, task.backoffIndex - 1);
  showTempMessage("Don't worry! You've got this!", "Distracted!", () => startTask(task));
}

/**
 * Invoked when the user has not responded to an "on task?" prompt. Increments the unresponsive count and decrements
 * the incremental backoff counter.
 * @param task
 */
function concludeUnresponsive(task) {
  Bangle.buzz(250, 1)
        .then(() => Bangle.setLCDPower(true));
  task.unresponsiveCount++;
  task.backoffIndex = Math.max(0, task.backoffIndex - 1);
  nudgeManager.queueResponseTimeout(() => concludeUnresponsive(task))
}

/**
 * Shows the user a message for a short period of time, then calls the "then function"
 * @param text
 * @param title
 * @param thenFn
 */
function showTempMessage(text, title, thenFn) {
  E.showMessage(text, {title});
  setTimeout(() => {
    thenFn();
  }, 1500);
}

/**
 * Mark the task as completed and then push it to the bottom of the list.
 * @param task
 */
function completeTask(task) {
  nudgeManager.interrupt();
  task.complete = true;
  removeTask(task, allTasks);
  allTasks.push(task);
  save();
  setMenu(getTaskMenu(task));
}

/**
 * Mark the task as not completed and then push it to the top of the list.
 * @param task
 */
function restartTask(task) {
  task.complete = false;
  removeTask(task, allTasks);
  allTasks.unshift(task);
  save();
  startTask(task);
}

/**
 * Remove the task from the given list.
 * @param task
 * @param list
 */
function removeTask(task, list) {
  const taskIndex = list.findIndex((item) => item === task);
  if (taskIndex !== -1) {
    list.splice(taskIndex, 1);
  }
}

/**
 * Creates a task object given a set of text.
 * @param text
 * @returns {{distractCount: number, backoffIndex: number, incrementalBackoffSet: number[], affirmCount: number,
 *   unresponsiveCount: number, interval: number, text, complete: boolean, useBackoff: boolean}}
 */
function createTask(text) {
  const incrementalBackoffSet = [0.5, 1, 2, 4, 8, 16, 32];
  return {
    text,
    affirmCount      : 0,
    distractCount    : 0,
    unresponsiveCount: 0,
    interval         : 30,
    backoffIndex     : 1,
    incrementalBackoffSet,
    complete         : false,
    useBackoff       : true
  };
}

/**
 * Shows a menu for editing the various properties of a given task. Also exposes the functions to start, restart, or
 * delete the given task.
 * @param task
 * @param backFn
 */
function editTask(task, backFn) {
  nudgeManager.interrupt();
  let editMenu = [];
  if (task.complete) {
    editMenu.push({title: "Start Task", onchange: st5(() => restartTask(task))});
    editMenu.push({title: "View Task", onchange: st5(() => startTask(task))});
  } else {
    editMenu.push({title: "Resume Task", onchange: st5(() => startTask(task))});
  }
  editMenu.push({title: "Rename", onchange: st5(() => renameTask(task, () => editTask(task, backFn)))});
  editMenu.push({title: "Interval", value: task.interval, min: 10, step: 10, onchange: v => task.interval = v});
  editMenu.push({title: "Incremental Backoff", value: !!task.useBackoff, onchange: v => task.useBackoff = v});
  editMenu.push({title: "DELETE", onchange: st5(() => deleteTask(task, () => editTask(task, backFn), backFn))});
  editMenu.push({title: "Statistics:"});
  editMenu.push({title: "On Task: " + task.affirmCount});
  editMenu.push({title: "Distracted: " + task.distractCount});
  editMenu.push({title: "Unresponsive: " + task.unresponsiveCount});
  editMenu[""] = {title: task.text, back: backFn};
  E.showMenu(editMenu);
}

/**
 * Remove the given task from the task list permanently if the user hits "yes" on the confirmation dialogue.
 * @param task The task to delete.
 * @param backFn The function to be called when the user cancels.
 * @param deleteBackFn The function to be called when the user confirms.
 */
function deleteTask(task, backFn, deleteBackFn) {
  E.showPrompt("Delete " + task.text + "?")
   .then(shouldDelete => {
     if (shouldDelete) {
       removeTask(task, allTasks);
       deleteBackFn();
     } else {
       backFn();
     }
   });
}

/**
 * Change the text of the given task, and then execute the given function.
 * @param task
 * @param backFn The function to execute after the renaming. Typically to show some previous menu.
 * @returns {*}
 */
function renameTask(task, backFn) {
  return textInput.input({text: task.text, keyboardMain: keyboardAlpha, keyboardShift: keyboardAlphaShift})
                  .then(text => {
                    task.text = text
                    save();
                    backFn();
                  })
}

/**
 * Get the "menu" that displays a given active task. This may not seem like a menu to users, but it includes swipe
 * controls and can sometimes include pressable buttons as well.
 * @param task
 * @param backFn
 * @returns {{setUI: (function(): void), buttons: *[], render: render}}
 */
function getTaskMenu(task, backFn) {
  const d                 = new Date();
  const h                 = d.getHours(), m = d.getMinutes();
  const time              = h + ":" + m.toString()
                                       .padStart(2, 0);
  const taskSwipeControls = [
    createSwipeControl(SWIPE.LEFT, "Menu", () => {
      setMenu(mainMenu);
      nudgeManager.interrupt();
    }), createSwipeControl(SWIPE.RIGHT, "New Task", newTask),
  ];
  const items             = [];
  if (task.complete) {
    taskSwipeControls.push(createSwipeControl(SWIPE.UP, "Restart", () => restartTask(task)));
    taskSwipeControls.push(createSwipeControl(SWIPE.DOWN,
      "Task List",
      () => showTaskList(() => true, () => startTask(task))));
    items.push({text: task.text + " completed!", size: 1});
    const nextTask = getNextTask(task, allTasks);
    if (nextTask) {
      items.push({text: "next task: " + nextTask.text, size: 2, callback: () => startTask(nextTask)})
    } else {
      items.push({
        text: "Affirmed: " + task.affirmCount + "\nDistracted: " + task.distractCount + "\nUnresponsive: " + task.unresponsiveCount,
        size: 3
      });
    }
  } else {
    items.push({text: task.text, size: 2})
    taskSwipeControls.push(createSwipeControl(SWIPE.UP, "Complete", () => completeTask(task)))
    taskSwipeControls.push(createSwipeControl(SWIPE.DOWN, "Edit Task", () => editTask(task, () => startTask(task))))
  }
  return createMenu({
    items, spaceAround: 0, spaceBetween: 0, swipeControls: taskSwipeControls, title: time, backFn
  });
}

/**
 * Given a task, determine the next incomplete task in the task list and return it. Return undefined if there are no
 * other incomplete tasks.
 * @param task
 * @param list
 * @returns {undefined|*}
 */
function getNextTask(task, list) {
  const activeList       = list.filter(x => (!x.complete || x === task));
  const thisTaskPosition = activeList.findIndex(t => t === task);
  let nextTask           = activeList[0];
  if (thisTaskPosition !== -1 && activeList[thisTaskPosition + 1]) {
    nextTask = activeList[thisTaskPosition + 1];
  }
  return nextTask === task ? undefined : nextTask;
}

/**
 * Show the list of tasks in a menu, filtered by the filterFn. Selecting a task in this menu will bring you to that
 * task's edit menu.
 * @param filterFn
 * @param backFn
 */
function showTaskList(filterFn, backFn) {
  let taskMenu = [];
  const list   = allTasks.filter(filterFn);
  taskMenu     = taskMenu.concat(list.map(task => {
    return {
      // Workaround - navigation has phantom buttons rendered with E.showMenu unless you delay slightly.
      title: task.text, onchange: st5(() => editTask(task, () => showTaskList(filterFn, backFn)))
    }
  }))
  taskMenu[""] = {title: "Tasks", back: backFn};
  E.showMenu(taskMenu);
}

/**
 * Show the menu for editing settings and tasks.
 * @param backFn
 */
function showSettingsMenu(backFn) {
  const settingsMenu = {
    ""               : {title: "Manage", back: backFn},
    "Pending Tasks"  : () => showTaskList(task => !task.complete, () => showSettingsMenu(backFn)),
    "Completed Tasks": () => showTaskList(task => task.complete, () => showSettingsMenu(backFn)),
    "Text Outlines"  : {value: savedData.settings.textOutlines, onchange: v => savedData.settings.textOutlines = v},
    "No Word Breaks" : {value: savedData.settings.noWordBreaks, onchange: v => savedData.settings.noWordBreaks = v}
  }
  E.showMenu(settingsMenu);
}
const mainMenu = createMenu({
  title          : "Working Memory", items: [
    {text: "New Task", size: 2, callback: () => newTask("")}, {
      text: "Manage", size: 1, callback: () => showSettingsMenu(() => setMenu(mainMenu))
    }
  ], isHorizontal: false
});

setMenu(mainMenu);

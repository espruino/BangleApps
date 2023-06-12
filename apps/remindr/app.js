const textInput = require("textinput");

g.clearRect(Bangle.appRect);
g.reset();
E.showMessage("Loading ... ");
Bangle.loadWidgets();
Bangle.drawWidgets();

let currentTaskRef;
const allTasks = [];
let taskTimeout;

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
  g.setFontAlign(0, 0)
   .setColor(textCol)
   .drawString(wrapText, button.x + button.w / 2, button.y + button.h / 2, false);
  g.reset();
}

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
  if (!button.text.includes(" ")) {
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
  return {
    buttons, render, setUI: () => Bangle.setUI({mode: "custom", touch: touchFunc, swipe: swipeFunc})
  };
}


function setMenu(menu) {
  g.clearRect(Bangle.appRect);
  g.reset();
  menu.render();
  menu.setUI();
}

let keyboardAlpha, keyboardNum;
if (textInput.generateKeyboard) {
  const charSet = textInput.createCharSet("ABCDEFGHIJKLMNOPQRSTUVWXYZ", ["spc", "ok", "del"]);
  keyboardAlpha = textInput.generateKeyboard(charSet);
  // keyboardNum   = textInput.generateKeyboard([["1", "2", "3", "4", "5", "6", "7", "8", "9"], ["0"], "del", "ok"]);
}

function newTask(initialText) {
  initialText = initialText || "";
  textInput.input({text: initialText, keyboardMain: keyboardAlpha})
           .then(text => {
             const task = createTask(text)
             allTasks.unshift(task);
             startTask(task);
           })
}

function startTask(task) {
  currentTaskRef = task;
  taskTimeout = setTimeout(() => Bangle.buzz(100, 1), 3000);
  g.clear();
  Bangle.drawWidgets();
  setMenu(getTaskMenu(task));
}

/**
 * Mark the task as completed and then push it to the bottom of the list.
 * @param task
 */
function completeTask(task) {
  task.complete = true;
  removeTask(task, allTasks);
  allTasks.push(task);
  setMenu(getTaskMenu(task));
}

function restartTask(task) {
  task.complete = false;
  removeTask(task, allTasks);
  allTasks.unshift(task);
  setMenu(getTaskMenu(task))
}

function removeTask(task, list) {
  const taskIndex = list.findIndex((item) => item === task);
  if (taskIndex !== -1) {
    list.splice(taskIndex, 1);
  }
}


const SWIPE = {
  LEFT: 2, RIGHT: 0, UP: 3, DOWN: 1,
}

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
    complete         : false
  };
}

function getTaskMenu(task) {
  const taskSwipeControls = [
    createSwipeControl(SWIPE.LEFT, "Menu", () => setMenu(mainMenu)), createSwipeControl(SWIPE.RIGHT, "New Task", newTask),
  ];
  const items             = [];
  if (task.complete) {
    taskSwipeControls.push(createSwipeControl(SWIPE.UP, "Restart", () => restartTask(task)));
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
    items.push({text: task.text})
    taskSwipeControls.push(createSwipeControl(SWIPE.DOWN, "Complete", () => completeTask(task)))
  }
  return createMenu({
    items, spaceAround: 0, spaceBetween: 0, swipeControls: taskSwipeControls
  });
}

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
 * This function is a workaround wrapper for a menu navigation bug. After 'onchange' the menu re-renders itself
 * so to avoid graphical glitches we postpone whatever funciton we actually want by 5ms.
 * @param fn The function you actually want to call
 * @returns {function(): any} The same function wrapped in a setTimeout with a 5ms delay.
 */
function st5(fn) {
  return () => setTimeout(fn, 5);
}

function editTask(task, backFn) {
  let editMenu = [];
  editMenu.push({title: "Rename", onchange: st5(() => renameTask(task, () => editTask(task, backFn)))});
  if (task.complete) {
    editMenu.push({title: "Start Task", onchange: st5(() => restartTask(task))})
    editMenu.push({title: "View Task", onchange: st5(() => startTask(task))})
  } else {
    editMenu.push({title: "Resume Task", onchange: st5(() => startTask(task))})
  }
  editMenu[""]   = {title: task.text, back: backFn};
  E.showMenu(editMenu);
}

function renameTask(task, backFn) {
  return textInput.input({text: task.text, keyboardMain: keyboardAlpha})
                  .then(text => {
                    task.text = text
                    backFn();
                  })
}

function showTaskList(list, backFn) {
  let taskMenu = [];
  taskMenu = taskMenu.concat(list.map(task => {
    return {
      // Workaround - navigation has phantom buttons rendered with E.showMenu unless you delay slightly.
      title: task.text, onchange: st5(() => editTask(task, () => showTaskList(list, backFn)))
    }
  }))
  taskMenu[""]   = {title: "Tasks", back: backFn};
  E.showMenu(taskMenu);
}

const mainMenu = createMenu({
  title          : "Working Memory", items: [
    {text: "New Task", size: 2, callback: newTask}, {
      text: "Manage", size: 1, callback: () => showTaskList(allTasks, () => setMenu(mainMenu))
    }
  ], isHorizontal: false
});

setMenu(mainMenu);

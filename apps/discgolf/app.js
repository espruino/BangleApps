Bangle.loadWidgets();

//
// App imports
//
var Layout = require("Layout");

//
// App variables
//
var holeCount = 1;
var throwCount = 0;
var drawTimeout;
var currentScreen = 'throw';
var redraw = true;
var update = true;
var holeSummary = {
  "< Back" : () => { update = true; redraw = true; currentScreen = 'throw'; E.showMenu(); createThrowLayout(); },
  "Hole #1": { value: 0 },
  "Hole #2": { value: 0 },
  "Hole #3": { value: 0 },
  "Hole #4": { value: 0 },
  "Hole #5": { value: 0 },
  "Hole #6": { value: 0 },
  "Hole #7": { value: 0 },
  "Hole #8": { value: 0 },
  "Hole #9": { value: 0 },
  "Front": { value: 0 },
  "Hole #10": { value: 0 },
  "Hole #11": { value: 0 },
  "Hole #12": { value: 0 },
  "Hole #13": { value: 0 },
  "Hole #14": { value: 0 },
  "Hole #15": { value: 0 },
  "Hole #16": { value: 0 },
  "Hole #17": { value: 0 },
  "Hole #18": { value: 0 },
  "Back": { value: 0 },
};

// Images
function getBackImage() {
  return atob("FhYBAAAAEAAAwAAHAAA//wH//wf//g///BwB+DAB4EAHwAAPAAA8AADwAAPAAB4AAHgAB+AH/wA/+AD/wAH8AA==");
}
function getMenuImage() {
  return {
    width : 20, height : 20, bpp : 1,
    buffer : require("heatshrink").decompress(atob("AAk///D//8CBcDBwITB4AiVA"))
  };
}
function getBasketIcon() {
  return {
    width : 20, height : 20, bpp : 1,
    buffer : require("heatshrink").decompress(atob("gFggF/8EH/0AiWAgtogEW0EDt0Am3ggfsgEf4EB/EA//4j//wEChEP/8AgwnDAgw"))
  };
}
function getFrisbeeIcon() {
  return {
    width : 20, height : 20, bpp : 1,
    buffer : require("heatshrink").decompress(atob("AAf+gF/wE+uEPx0B+PAn0cgf/4F3/0G/1g9/7g1/7AJB4+f/k+v3B/Hcg4WBj/4E4ItC"))
  };
}

var throwLayout;

function createThrowLayout() {
  throwLayout = new Layout( {
    type:"v", c: [
      // Title & menu button
      {
        type:"h", fillx:1, valign:-1, bgCol:g.theme.bg2, col: g.theme.fg2, c: [
          {type:"img", src:getBasketIcon()},
          {type:"txt", pad:4, font:"15%", label:holeCount, id: "holeCount"},
          {type:"txt", pad:4, font:"15%", label: '', fillx:1},
          {type:"btn", src:getMenuImage(), halign:1, cb: l=>{ currentScreen = 'summary'; update = true; redraw = true; }}
        ]
      },
      // Throw count
      {
        type:"h", filly:1, c: [
          {type:"img", pad:4, src:getFrisbeeIcon() },
          {type:"txt", fillx:1, font:"6x8:2", label:"Throws: "+throwCount, id:"throwCount"}
        ]
      }
    ]
  }, {lazy:true});
}

function incrementHole() {
  if (holeCount > 18) return;
  resetThrow();
  holeCount += 1;
  holeSummary["Hole #" + holeCount] = {value: 0};
}
function incrementThrow() {
  throwCount += 1;
  holeSummary["Hole #" + holeCount] = {value: throwCount};
}
function decrementThrow() {
  throwCount -= 1;
  holeSummary["Hole #" + holeCount] = {value: throwCount};
}
function resetThrow() {
  throwCount = 0;
}
function computeFrontScore() {
  var scoreSum = 0;
  for (var i = 1; i < 10; i++) {
    scoreSum += holeSummary["Hole #" + i].value;
  }
  holeSummary.Front = {value: scoreSum};
}
function computeBackScore() {
  var scoreSum = 0;
  for (var i = 1; i < 19; i++) {
    scoreSum += holeSummary["Hole #" + i].value;
  }
  holeSummary.Back = {value: scoreSum};
}

// update the app state/variables
function updateApp() {
  throwLayout.holeCount.label = holeCount;
  throwLayout.throwCount.label = "Throws: " + throwCount;
}

// update the screen
function draw() {
  updateApp();
  if (redraw) {
    throwLayout.forgetLazyState();
    redraw = false;
  }
  if (update) {
    if (currentScreen == 'throw') {
      throwLayout.render();
    } else if (currentScreen == 'summary') {
      E.showMenu(holeSummary);
    }
    update = false;
  }
  // schedule a draw for the next 500ms
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 500 - (Date.now() % 500));
}

//
// button press events
//
setWatch((p) => {
  if (p.time - p.lastTime < 0.2) {
    decrementThrow();
    incrementHole();
  } else {
    incrementThrow();
  }
  computeFrontScore();
  computeBackScore();
  update = true;
}, BTN, {edge:"rising", debounce:50, repeat:true});

//
// main app function start
//
g.clear();
Bangle.drawWidgets();
createThrowLayout();
draw();
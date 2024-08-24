const DEFAULTS = {
  button: 0,
  buttonWhileLocked: false,
  disableBacklightTimeout: true,
  disableLockTimeout: true,
};

const settings = require("Storage").readJSON("splitsw.json", 1) || DEFAULTS;

let renderIntervalId;
let startTime;
let stopTime;
let subtotal;
let currentSplitNumber;
let splitStartTime;
let splitSubtotal;

var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"txt", pad:4, font:"20%", label:"", id:"time", fillx:1},
    {type:"h", c: [
      {type:"btn", pad:4, font:"6x8:2", label:"Start", id:"startStop", cb: l=>startStop() },
      {type:"btn", pad:4, font:"6x8:2", label:"Reset", id:"resetSplit", cb: l=>resetSplit() }
    ]},
    {
      type:"v", pad:4, c: [
        {type:"txt", font:"6x8:2", label:"", id:"split", fillx:1},
        {type:"txt", font:"6x8:2", label:"", id:"prevSplit", fillx:1},
    ]},
  ]
}, {
  // TODO: The layout libary always seems to give the physical button label space
  // even if it's empty (neither of these work)
  // btns:[
  //   {label:"", cb: l=>buttonPress()},
  //   {cb: l=>buttonPress()},
  // ],
  lazy: true,
  back: load,
});

const initStopwatch = function() {
  Bangle.loadWidgets();
  g.clear(true);
  Bangle.drawWidgets(); // TODO: no sign of the widgets!

  // TODO: it looks like this conflicts with using the layout library
  // Bangle.setUI({mode:"custom", btn: ()=>buttonPress()});

  // TODO: there doesn't seem to be an on button event and this
  // conflicts with the setUI back function
  // setWatch(function() {
  //   console.log("Pressed");
  // }, BTN, {edge:"rising", debounce:50, repeat:true});

  // TODO: it would be confusing to react to an unlock button press
  // but not a normal button press!
  // if (settings.buttonWhileLocked === true) {
  //   Bangle.on('lock', function(on, reason) {
  //     if ((on === false) && (reason === 'button')) {
  //       buttonPress();
  //     }
  //   });
  // }

  if (settings.disableBacklightTimeout === true) {
    Bangle.setOptions({backlightTimeout: 0});
    Bangle.setBacklight(1);
  }

  if (settings.disableLockTimeout === true) {
    Bangle.setOptions({lockTimeout: 0});
  }
};

// TODO The code in this function appears in various apps so it might be
// nice to add something to the time_utils module. (There is already a
// formatDuration function but that doesn't quite work the same way.)
const getTime = function(milliseconds) {
  let hrs = Math.floor(milliseconds/3600000);
  let mins = Math.floor(milliseconds/60000)%60;
  let secs = Math.floor(milliseconds/1000)%60;
  let tnth = Math.floor(milliseconds/100)%10;
  let text;

  if (hrs === 0) {
    text = ("0"+mins).slice(-2) + ":" + ("0"+secs).slice(-2) + "." + tnth;
  } else {
    text = ("0"+hrs) + ":" + ("0"+mins).slice(-2) + ":" + ("0"+secs).slice(-2);
  }

  return text;
};

const renderIntervalCallback = function() {
  if (startTime === undefined) {
    return;
  }

  updateStopwatch();
};

const buzz = function() {
  Bangle.buzz(50, 0.5);
};

const buttonPress = function() {
  console.log("Pressed");

  // TODO: start, stop or split depending on the app settings
};

const startStop = function() {
  buzz();

  if (layout.startStop.label === "Start") {
    start();
  } else {
    stop();
  }
};

const start = function() {
  if (stopTime === undefined) {
    startTime = Date.now();
    splitStartTime = startTime;
    subtotal = 0;
    splitSubtotal = 0;
    currentSplitNumber = 1;
  } else {
    subtotal += stopTime - startTime;
    splitSubtotal += stopTime - splitStartTime;
    startTime = Date.now();
    splitStartTime = startTime;
    stopTime = undefined;
  }

  layout.startStop.label = "Stop";
  layout.resetSplit.label = "Split";
  updateStopwatch();

  renderIntervalId = setInterval(renderIntervalCallback, 100);
};

const stop = function() {
  stopTime = Date.now();

  layout.startStop.label = "Start";
  layout.resetSplit.label = "Reset";
  updateStopwatch();

  if (renderIntervalId !== undefined) {
    clearInterval(renderIntervalId);
    renderIntervalId = undefined;
  }
};

const resetSplit = function() {
  buzz();

  if (layout.resetSplit.label === "Reset") {
    reset();
  } else {
    split();
  }
};

const reset = function() {
    layout.startStop.label = "Start";
    layout.resetSplit.label = "Reset";
    layout.split.label = "";
    layout.prevSplit.label = "";

    startTime = undefined;
    stopTime = undefined;
    subtotal = 0;
    currentSplitNumber = 1;
    splitStartTime = undefined;
    splitSubtotal = 0;

    updateStopwatch();
};

const split = function() {
  const splitTime = Date.now() - splitStartTime + splitSubtotal;
  layout.prevSplit.label = "#" + currentSplitNumber + " " + getTime(splitTime);

  splitStartTime = Date.now();
  splitSubtotal = 0;
  currentSplitNumber++;

  updateStopwatch();
};

const updateStopwatch = function() {
  let elapsedTime;

  if (startTime === undefined) {
    elapsedTime = 0;
  } else {
    elapsedTime = Date.now() - startTime + subtotal;
  }

  layout.time.label = getTime(elapsedTime);

  if (splitStartTime !== undefined) {
    const splitTime = Date.now() - splitStartTime + splitSubtotal;
    layout.split.label = "#" + currentSplitNumber + " " + getTime(splitTime);
  }

  layout.render();
  // layout.debug();
};

initStopwatch();
updateStopwatch();

const Layout = require("Layout");

let historyY = [];
let historyZ = [];
const avgSize = 10;

const thresholdY = 2500;
const thresholdPushUpTime = 1400; // mininmal time between two push ups
let tStart;

let avgY;
let avgZ;
let historyAvgY = [];
let historyAvgZ = [];
let historySlopeY = [];
let historySlopeZ = [];

let lastZeroPassType;
let lastZeroPassTime = 0;
let lastPushUpCmpltTime = 0;

let exerciseType = "";
let pushUpCounter = 0;

let layout;

let recordActive = false;


function showMenu() {
  let menu;
  if (pushUpCounter == 0) {
    menu = {
      "": {
        title: "Banglexercise"
      },
      "Start push ups": function() {
        exerciseType = "push ups";
        E.showMenu();
        startRecording();
      }
    };
  } else {
    menu = {
      "": {
        title: "Banglexercise"
      },
      "Last:": {
        value: pushUpCounter + " push ups"
      },
      "Start push ups": function() {
        exerciseType = "push ups";
        E.showMenu();
        startRecording();
      }
    };
  }
  E.showMenu(menu);
}

function accelHandler(accel) {
  const t = Math.round(new Date().getTime()); // time in ms
  const y = accel.y * 8192;
  const z = accel.z * 8192;
  //console.log(t, y, z);

  while (historyY.length > avgSize)
    historyY.shift();
  historyY.push(y);

  if (historyY.length > avgSize / 2)
    avgY = E.sum(historyY) / historyY.length;

  while (historyZ.length > avgSize)
    historyZ.shift();
  historyZ.push(z);

  if (historyZ.length > avgSize / 2)
    avgZ = E.sum(historyZ) / historyZ.length;

  if (avgY) {
    //console.log(avgY, avgZ);
    historyAvgY.push([t, avgY]);
    historyAvgZ.push([t, avgZ]);
  }

  let mY;
  let mZ;
  // slope for Y
  let l = historyAvgY.length;
  if (l > 1) {
    const p1 = historyAvgY[l - 2];
    const p2 = historyAvgY[l - 1];
    mY = (p2[1] - p1[1]) / (p2[0] / 1000 - p1[0] / 1000);
    if (Math.abs(mY) >= thresholdY) {
      historyAvgY.shift();
      historySlopeY.push([t, mY]);
      //console.log(t, Math.abs(mY));

      const lMY = historySlopeY.length;
      if (lMY > 1) {
        const pMY1 = historySlopeY[lMY - 2][1];
        const pMY2 = historySlopeY[lMY - 1][1];
        isValidPushUp(pMY1, pMY2, t);
      }
    }
  }

  // slope for Z
  l = historyAvgZ.length;
  if (l > 1) {
    const p1 = historyAvgZ[l - 2];
    const p2 = historyAvgZ[l - 1];
    mZ = (p2[1] - p1[1]) / (p2[0] - p1[0]);
    historyAvgZ.shift();
    historySlopeZ.push([p2[0] - p1[0], mZ]);
  }
}

function isValidPushUp(p1, p2, t) {
  if (p1 > 0 && p2 < 0) {

    if (lastZeroPassType == "-+") {
      console.log(t, "Push up half complete...");

      layout.progress.label = "...";
      layout.render(layout.progress);
    }

    lastZeroPassType = "+-";
    lastZeroPassTime = t;
  }
  if (p2 > 0 && p1 < 0) {

    if (lastZeroPassType == "+-") {
      // potential complete push up. Let's check the time difference...
      const tDiffLastPushUp = t - lastPushUpCmpltTime;
      const tDiffStart = t - tStart;
      console.log(t, "Push up maybe complete?", Math.round(tDiffLastPushUp), Math.round(tDiffStart));

      if ((lastPushUpCmpltTime <= 0 && tDiffStart >= thresholdPushUpTime) || tDiffLastPushUp >= thresholdPushUpTime) {
        console.log(t, "Push up complete!!!");

        lastPushUpCmpltTime = t;
        pushUpCounter++;

        layout.count.label = pushUpCounter;
        layout.render(layout.count);
        layout.progress.label = "";
        layout.render(layout.progress);

        Bangle.buzz(100, 0.3); // TODO make configurable
      } else {
        console.log(t, "Push up to quick for threshold!");
      }
    }

    lastZeroPassType = "-+";
    lastZeroPassTime = t;
  }
}

/*

function calcPushUps() {
  const l = historySlopeY.length;
  for (let i = 1; i < l; i++) {
    const p1 = historySlopeY[i - 1][1];
    const p2 = historySlopeY[i][1];
    const t = historySlopeY[i][0];
    isValidPushUp(p1, p2, t);
  }
}
*/

function reset() {
  historyY = [];
  historyZ = [];
  historyAvgY = [];
  historyAvgZ = [];
  historySlopeY = [];
  historySlopeZ = [];

  lastZeroPassType = "";
  lastZeroPassTime = 0;
  lastPushUpCmpltTime = 0;
  pushUpCounter = 0;
}


function startRecording() {
  if (recordActive) return;
  g.clear(1);
  reset();
  layout = new Layout({
    type: "v",
    c: [{
        type: "txt",
        id: "type",
        font: "6x8:2",
        label: exerciseType,
        pad: 5
      },
      {
        type: "txt",
        id: "count",
        font: "6x8:9",
        label: pushUpCounter,
        pad: 5,
        bgCol: g.theme.bg
      },
      {
        type: "txt",
        id: "progress",
        font: "6x8:2",
        label: "",
        pad: 5
      },
      {
        type: "txt",
        id: "recording",
        font: "6x8:2",
        label: "RECORDING",
        bgCol: "#f00",
        pad: 5,
        fillx: 1
      },
    ]
  }, {
    btns: [
      {
        label: "STOP",
        cb: () => {
          stopRecording();
        }
      }
    ]
  });
  layout.render();

  Bangle.setPollInterval(80); // 12.5 Hz
  Bangle.on('accel', accelHandler);
  Bangle.buzz(200, 1);
  tStart = new Date().getTime();
  recordActive = true;
}

function stopRecording() {
  if (!recordActive) return;
  g.clear(1);
  Bangle.removeListener('accel', accelHandler);
  showMenu();
  console.log("Found " + pushUpCounter + " push ups!");
  recordActive = false;
}

g.clear(1);
Bangle.drawWidgets();
showMenu();

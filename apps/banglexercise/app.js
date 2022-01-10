const Layout = require("Layout");
const heatshrink = require('heatshrink');

let tStart;
let historyY = [];
let historyZ = [];
let historyAvgY = [];
let historyAvgZ = [];
let historySlopeY = [];
let historySlopeZ = [];

let lastZeroPassType;
let lastZeroPassTime = 0;

let lastExerciseCmpltTime = 0;

let exerciseType = {
  "name": ""
};
const exerciseTypes = [{
    "id": "pushup",
    "name": "Push ups",
    "useYaxe": true,
    "useZaxe": false
  } // add other exercises here
];
let exerciseCounter = 0;

let layout;
let recordActive = false;

/**
 * Thresholds
 */
const avgSize = 6;
const pushUpThresholdY = 2500;
const pushUpThresholdTime = 1400; // mininmal time between two push ups

let hrtValue;

function showMainMenu() {
  let menu;
  menu = {
    "": {
      title: "BanglExercise"
    }
  };

  exerciseTypes.forEach(function(et) {
    menu["Do " + et.name] = function() {
      exerciseType = et;
      E.showMenu();
      startRecording();
    };
  });

  if (exerciseCounter > 0) {
    menu["----"] = {};
    menu["Last:"] = {
      value: exerciseCounter + " " + exerciseType.name
    };
  }

  E.showMenu(menu);
}

function accelHandler(accel) {
  if (!exerciseType) return;
  const t = Math.round(new Date().getTime()); // time in ms
  const y = exerciseType.useYaxe ? accel.y * 8192 : 0;
  const z = exerciseType.useZaxe ? accel.z * 8192 : 0;
  //console.log(t, y, z);

  if (exerciseType.useYaxe) {
    while (historyY.length > avgSize)
      historyY.shift();

    historyY.push(y);

    if (historyY.length > avgSize / 2) {
      const avgY = E.sum(historyY) / historyY.length;
      historyAvgY.push([t, avgY]);
    }
  }

  if (exerciseType.useYaxe) {
    while (historyZ.length > avgSize)
      historyZ.shift();

    historyZ.push(z);

    if (historyZ.length > avgSize / 2) {
      const avgZ = E.sum(historyZ) / historyZ.length;
      historyAvgZ.push([t, avgZ]);
    }
  }

  // slope for Y
  if (exerciseType.useYaxe) {
    let l = historyAvgY.length;
    if (l > 1) {
      const p1 = historyAvgY[l - 2];
      const p2 = historyAvgY[l - 1];
      const mY = (p2[1] - p1[1]) / (p2[0] / 1000 - p1[0] / 1000);
      if (Math.abs(mY) >= pushUpThresholdY) {
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
  }

  // slope for Z
  if (exerciseType.useZaxe) {
    l = historyAvgZ.length;
    if (l > 1) {
      const p1 = historyAvgZ[l - 2];
      const p2 = historyAvgZ[l - 1];
      const mZ = (p2[1] - p1[1]) / (p2[0] - p1[0]);
      historyAvgZ.shift();
      historySlopeZ.push([p2[0] - p1[0], mZ]);
    }
  }
}

function isValidPushUp(p1, p2, t) {
  if (p1 > 0 && p2 < 0) {

    if (lastZeroPassType == "-+") {
      console.log(t, "Push up half complete...");

      layout.progress.label = "*";
      layout.render();
    }

    lastZeroPassType = "+-";
    lastZeroPassTime = t;
  }
  if (p2 > 0 && p1 < 0) {

    if (lastZeroPassType == "+-") {
      // potential complete push up. Let's check the time difference...
      const tDiffLastPushUp = t - lastExerciseCmpltTime;
      const tDiffStart = t - tStart;
      console.log(t, "Push up maybe complete?", Math.round(tDiffLastPushUp), Math.round(tDiffStart));

      if ((lastExerciseCmpltTime <= 0 && tDiffStart >= pushUpThresholdTime) || tDiffLastPushUp >= pushUpThresholdTime) {
        console.log(t, "Push up complete!!!");

        lastExerciseCmpltTime = t;
        exerciseCounter++;

        layout.count.label = exerciseCounter;
        layout.progress.label = "";
        layout.render();

        Bangle.buzz(100, 0.3); // TODO make configurable
      } else {
        console.log(t, "Push up to quick for threshold!");
      }
    }

    lastZeroPassType = "-+";
    lastZeroPassTime = t;
  }
}

function reset() {
  historyY = [];
  historyZ = [];
  historyAvgY = [];
  historyAvgZ = [];
  historySlopeY = [];
  historySlopeZ = [];

  lastZeroPassType = "";
  lastZeroPassTime = 0;
  lastExerciseCmpltTime = 0;
  exerciseCounter = 0;
  tStart = 0;
}


function startRecording() {
  if (recordActive) return;
  g.clear(1);
  reset();
  Bangle.setHRMPower(1, "banglexercise");
  if (!hrtValue) hrtValue = "...";

  layout = new Layout({
    type: "v",
    c: [{
        type: "txt",
        id: "type",
        font: "6x8:2",
        label: exerciseType.name,
        pad: 5
      },
      {
        type: "h",
        c: [{
            type: "txt",
            id: "count",
            font: "6x8:10",
            label: exerciseCounter,
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
        ]
      },
      {
        type: "h",
        c: [{
            type: "img",
            pad: 4,
            src: function() {
              return heatshrink.decompress(atob("h0OwYOLkmQhMkgACByVJgESpIFBpEEBAIFBCgIFCCgsABwcAgQOCAAMSpAwDyBNM"));
            }
          },
          {
            type: "txt",
            id: "hrtRate",
            font: "6x8:2",
            label: hrtValue,
            pad: 5
          },
        ]
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
    ],
    lazy: true
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

  Bangle.setHRMPower(0, "banglexercise");

  Bangle.removeListener('accel', accelHandler);
  showMainMenu();
  recordActive = false;
}

Bangle.on('HRM', function(hrm) {
  hrtValue = hrm.bpm;
});

g.clear(1);
showMainMenu();

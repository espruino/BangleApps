const Layout = require("Layout");
const heatshrink = require('heatshrink');
const storage = require('Storage');

let tStart;
let historyY = [];
let historyZ = [];
let historyAvgY = [];
let historyAvgZ = [];
let historySlopeY = [];
let historySlopeZ = [];

let lastZeroPassCameFromPositive;
let lastZeroPassTime = 0;

let lastExerciseCompletionTime = 0;
let lastExerciseHalfCompletionTime = 0;

let exerciseType = {
  "id": "",
  "name": ""
};

// add new exercises here:
const exerciseTypes = [{
    "id": "pushup",
    "name": "push ups",
    "useYaxe": true,
    "useZaxe": false,
    "thresholdY": 2500,
    "thresholdMinTime": 1400, // mininmal time between two push ups in ms
    "thresholdMaxTime": 5000, // maximal time between two push ups in ms
    "thresholdMinDurationTime": 700, // mininmal duration of half a push ups in ms
  },
  {
    "id": "curl",
    "name": "curls",
    "useYaxe": true,
    "useZaxe": false,
    "thresholdY": 2500,
    "thresholdMinTime": 1000, // mininmal time between two curls in ms
    "thresholdMaxTime": 5000, // maximal time between two curls in ms
    "thresholdMinDurationTime": 500, // mininmal duration of half a push ups in ms
  }
];
let exerciseCounter = 0;

let layout;
let recordActive = false;

// Size of average window for data analysis
const avgSize = 6;

let hrtValue;

let settings = storage.readJSON("banglexercise.json", 1) || {
  'buzz': true
};

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
      startTraining();
    };
  });

  if (exerciseCounter > 0) {
    menu["--------"] = {
      value: ""
    };
    menu["Last:"] = {
      value: exerciseCounter + " " + exerciseType.name
    };
  }
  menu.Exit = function() {
     load();
  };

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
      while (historyAvgY.length > avgSize)
        historyAvgY.shift();
    }
  }

  if (exerciseType.useYaxe) {
    while (historyZ.length > avgSize)
      historyZ.shift();

    historyZ.push(z);

    if (historyZ.length > avgSize / 2) {
      const avgZ = E.sum(historyZ) / historyZ.length;
      historyAvgZ.push([t, avgZ]);
      while (historyAvgZ.length > avgSize)
        historyAvgZ.shift();
    }
  }

  // slope for Y
  if (exerciseType.useYaxe) {
    let l = historyAvgY.length;
    if (l > 1) {
      const p1 = historyAvgY[l - 2];
      const p2 = historyAvgY[l - 1];
      const slopeY = (p2[1] - p1[1]) / (p2[0] / 1000 - p1[0] / 1000);
      // we use this data for exercises which can be detected by using Y axis data
      switch (exerciseType.id) {
        case "pushup":
          isValidYAxisExercise(slopeY, t);
          break;
        case "curl":
          isValidYAxisExercise(slopeY, t);
          break;
      }

    }
  }

  // slope for Z
  if (exerciseType.useZaxe) {
    l = historyAvgZ.length;
    if (l > 1) {
      const p1 = historyAvgZ[l - 2];
      const p2 = historyAvgZ[l - 1];
      const slopeZ = (p2[1] - p1[1]) / (p2[0] - p1[0]);
      historyAvgZ.shift();
      historySlopeZ.push([p2[0] - p1[0], slopeZ]);

      // TODO: we can use this data for some exercises which can be detected by using Z axis data
    }
  }
}

/*
 * Check if slope value of Y-axis data looks like an exercise
 *
 * In detail we look for slop values which are bigger than the configured Y threshold for the current exercise
 * Then we look for two consecutive slope values of which one is above 0 and the other is below zero.
 * If we find one pair of these values this could be part of one exercise.
 * Then we look for a pair of values which cross the zero from the otherwise direction
 */
function isValidYAxisExercise(slopeY, t) {
  if (!exerciseType) return;

  const thresholdY = exerciseType.thresholdY;
  const thresholdMinTime = exerciseType.thresholdMinTime;
  const thresholdMaxTime = exerciseType.thresholdMaxTime;
  const thresholdMinDurationTime = exerciseType.thresholdMinDurationTime;
  const exerciseName = exerciseType.name;

  if (Math.abs(slopeY) >= thresholdY) {
    historyAvgY.shift();
    historySlopeY.push([t, slopeY]);
    //console.log(t, Math.abs(slopeY));

    const lSlopeY = historySlopeY.length;
    if (lSlopeY > 1) {
      const p1 = historySlopeY[lSlopeY - 1][1];
      const p2 = historySlopeY[lSlopeY - 2][1];
      if (p1 > 0 && p2 < 0) {
        if (lastZeroPassCameFromPositive == false) {
          lastExerciseHalfCompletionTime = t;
          //console.log(t, exerciseName + " half complete...");

          layout.progress.label = "½";
          g.clear();
          layout.render();
        }

        lastZeroPassCameFromPositive = true;
        lastZeroPassTime = t;
      }
      if (p2 > 0 && p1 < 0) {
        if (lastZeroPassCameFromPositive == true) {
          const tDiffLastExercise = t - lastExerciseCompletionTime;
          const tDiffStart = t - tStart;
          //console.log(t, exerciseName + " maybe complete?", Math.round(tDiffLastExercise), Math.round(tDiffStart));

          // check minimal time between exercises:
          if ((lastExerciseCompletionTime <= 0 && tDiffStart >= thresholdMinTime) || tDiffLastExercise >= thresholdMinTime) {

            // check maximal time between exercises:
            if (lastExerciseCompletionTime <= 0 || tDiffLastExercise <= thresholdMaxTime) {

              // check minimal duration of exercise:
              const tDiffExerciseHalfCompletion = t - lastExerciseHalfCompletionTime;
              if (tDiffExerciseHalfCompletion > thresholdMinDurationTime) {
                //console.log(t, exerciseName + " complete!!!");

                lastExerciseCompletionTime = t;
                exerciseCounter++;

                layout.count.label = exerciseCounter;
                layout.progress.label = "";
                g.clear();
                layout.render();

                if (settings.buzz)
                  Bangle.buzz(100, 0.4);
              } else {
                //console.log(t, exerciseName + " to quick for duration time threshold!");
                lastExerciseCompletionTime = t;
              }
            } else {
              //console.log(t, exerciseName + " to slow for time threshold!");
              lastExerciseCompletionTime = t;
            }
          } else {
            //console.log(t, exerciseName + " to quick for time threshold!");
            lastExerciseCompletionTime = t;
          }
        }

        lastZeroPassCameFromPositive = false;
        lastZeroPassTime = t;
      }
    }
  }
}


function reset() {
  historyY = [];
  historyZ = [];
  historyAvgY = [];
  historyAvgZ = [];
  historySlopeY = [];
  historySlopeZ = [];

  lastZeroPassCameFromPositive = undefined;
  lastZeroPassTime = 0;
  lastExerciseHalfCompletionTime = 0;
  lastExerciseCompletionTime = 0;
  exerciseCounter = 0;
  tStart = 0;
}


function startTraining() {
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
            font: exerciseCounter < 100 ? "6x8:9" : "6x8:8",
            label: 10,
            pad: 5
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
        label: "TRAINING",
        bgCol: "#f00",
        pad: 5,
        fillx: 1
      },
    ]
  }, {
    btns: [{
      label: "STOP",
      cb: () => {
        stopTraining();
      }
    }],
    lazy: false
  });
  layout.render();

  Bangle.setPollInterval(80); // 12.5 Hz
  Bangle.on('accel', accelHandler);
  tStart = new Date().getTime();
  recordActive = true;
  if (settings.buzz)
    Bangle.buzz(200, 1);
}

function stopTraining() {
  if (!recordActive) return;

  g.clear(1);
  Bangle.removeListener('accel', accelHandler);
  Bangle.setHRMPower(0, "banglexercise");
  showMainMenu();
  recordActive = false;
}

Bangle.on('HRM', function(hrm) {
  hrtValue = hrm.bpm;
});

g.clear(1);
showMainMenu();

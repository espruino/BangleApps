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
//let lastZeroPassTime = 0;

let lastExerciseCompletionTime = 0;
let lastExerciseHalfCompletionTime = 0;

let exerciseType = {
  "id": "",
  "name": ""
};

// add new exercises here:
const exerciseTypes = [{
    "id": "pushup",
    "name": /*LANG*/"Push-ups",
    "useYaxis": true,
    "useZaxis": false,
    "threshold": 2500,
    "thresholdMinTime": 800, // mininmal time between two push ups in ms
    "thresholdMaxTime": 5000, // maximal time between two push ups in ms
    "thresholdMinDurationTime": 600, // mininmal duration of half a push up in ms
  },
  {
    "id": "curl",
    "name": /*LANG*/"Curls",
    "useYaxis": true,
    "useZaxis": false,
    "threshold": 2500,
    "thresholdMinTime": 800, // mininmal time between two curls in ms
    "thresholdMaxTime": 5000, // maximal time between two curls in ms
    "thresholdMinDurationTime": 500, // mininmal duration of half a curl in ms
  },
  {
    "id": "situp",
    "name": /*LANG*/"Sit-ups",
    "useYaxis": false,
    "useZaxis": true,
    "threshold": 3500,
    "thresholdMinTime": 800, // mininmal time between two sit ups in ms
    "thresholdMaxTime": 5000, // maximal time between two sit ups in ms
    "thresholdMinDurationTime": 500, // mininmal duration of half a sit up in ms
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
      title: "BanglExercise",
      back: load
    }
  };

  exerciseTypes.forEach(function(et) {
    menu[et.name] = function() {
      exerciseType = et;
      E.showMenu();
      startTraining();
    };
  });

  if (exerciseCounter > 0) {
    menu["--------"] = {
      value: ""
    };
    menu[/*LANG*/"Last:"] = {
      value: exerciseCounter + " " + exerciseType.name
    };
  }
  menu.exit = function() {
    load();
  };

  E.showMenu(menu);
}

function accelHandler(accel) {
  if (!exerciseType) return;
  const t = Math.round(new Date().getTime()); // time in ms
  const y = exerciseType.useYaxis ? accel.y * 8192 : 0;
  const z = exerciseType.useZaxis ? accel.z * 8192 : 0;
  //console.log(t, y, z);

  if (exerciseType.useYaxis) {
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

  if (exerciseType.useZaxis) {
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
  if (exerciseType.useYaxis) {
    let l = historyAvgY.length;
    if (l > 1) {
      const p1 = historyAvgY[l - 2];
      const p2 = historyAvgY[l - 1];
      const slopeY = (p2[1] - p1[1]) / (p2[0] / 1000 - p1[0] / 1000);
      // we use this data for exercises which can be detected by using Y axis data
      isValidExercise(slopeY, t);
    }
  }

  // slope for Z
  if (exerciseType.useZaxis) {
    let l = historyAvgZ.length;
    if (l > 1) {
      const p1 = historyAvgZ[l - 2];
      const p2 = historyAvgZ[l - 1];
      const slopeZ = (p2[1] - p1[1]) / (p2[0] / 1000 - p1[0] / 1000);
      // we use this data for some exercises which can be detected by using Z axis data
      isValidExercise(slopeZ, t);
    }
  }
}

/*
 * Check if slope value of Y-axis or Z-axis data (depending on exercise type) looks like an exercise
 *
 * In detail we look for slop values which are bigger than the configured threshold for the current exercise type
 * Then we look for two consecutive slope values of which one is above 0 and the other is below zero.
 * If we find one pair of these values this could be part of one exercise.
 * Then we look for a pair of values which cross the zero from the otherwise direction
 */
function isValidExercise(slope, t) {
  if (!exerciseType) return;

  const threshold = exerciseType.threshold;
  const historySlopeValues = exerciseType.useYaxis ? historySlopeY : historySlopeZ;
  const thresholdMinTime = exerciseType.thresholdMinTime;
  const thresholdMaxTime = exerciseType.thresholdMaxTime;
  const thresholdMinDurationTime = exerciseType.thresholdMinDurationTime;
  const exerciseName = exerciseType.name;


  if (Math.abs(slope) >= threshold) {
    historySlopeValues.push([t, slope]);
    //console.log(t, Math.abs(slope));

    const lSlopeHistory = historySlopeValues.length;
    if (lSlopeHistory > 1) {
      const p1 = historySlopeValues[lSlopeHistory - 1][1];
      const p2 = historySlopeValues[lSlopeHistory - 2][1];
      if (p1 > 0 && p2 < 0) {
        if (lastZeroPassCameFromPositive == false) {
          lastExerciseHalfCompletionTime = t;
          console.log(t, exerciseName + /*LANG*/" half complete...");

          layout.progress.label = "½";
          layout.recording.label = /*LANG*/"TRAINING";
          g.clear();
          layout.render();
        }

        lastZeroPassCameFromPositive = true;
        //lastZeroPassTime = t;
      }
      if (p2 > 0 && p1 < 0) {
        if (lastZeroPassCameFromPositive == true) {
          const tDiffLastExercise = t - lastExerciseCompletionTime;
          const tDiffStart = t - tStart;
          console.log(t, exerciseName + /*LANG*/" maybe complete?", Math.round(tDiffLastExercise), Math.round(tDiffStart));

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
                layout.recording.label =/*LANG*/"Good!";

                g.clear();
                layout.render();

                if (settings.buzz)
                  Bangle.buzz(200, 0.5);
              } else {
                console.log(t, exerciseName + /*LANG*/" too quick for duration time threshold!"); // thresholdMinDurationTime
                lastExerciseCompletionTime = t;

                layout.recording.label = /*LANG*/"Go slower!";
                g.clear();
                layout.render();
              }
            } else {
              console.log(t, exerciseName + /*LANG*/" top slow for time threshold!"); // thresholdMaxTime
              lastExerciseCompletionTime = t;

              layout.recording.label = /*LANG*/"Go faster!";
              g.clear();
              layout.render();
            }
          } else {
            console.log(t, exerciseName + /*LANG*/" too quick for time threshold!"); // thresholdMinTime
            lastExerciseCompletionTime = t;

            layout.recording.label = /*LANG*/"Go slower!";
            g.clear();
            layout.render();
          }
        }

        lastZeroPassCameFromPositive = false;
        //lastZeroPassTime = t;
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
  //lastZeroPassTime = 0;
  lastExerciseHalfCompletionTime = 0;
  lastExerciseCompletionTime = 0;
  exerciseCounter = 0;
  tStart = 0;
}


function startTraining() {
  if (recordActive) return;
  g.clear(1);
  reset();
  Bangle.setLCDTimeout(0); // force LCD on
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
            label: exerciseCounter,
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
        label: /*LANG*/"TRAINING",
        bgCol: "#f00",
        pad: 5,
        fillx: 1
      },
    ]
  }, {
    btns: [{
      label: /*LANG*/"STOP",
      cb: () => {
        stopTraining();
      }
    }],
    lazy: false
  });
  layout.render();

  Bangle.setPollInterval(80); // 12.5 Hz

  tStart = new Date().getTime();
  recordActive = true;
  if (settings.buzz)
    Bangle.buzz(200, 1);

  // delay start a little bit
  setTimeout(() => {
    Bangle.on('accel', accelHandler);
  }, 1000);
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
Bangle.loadWidgets();
showMainMenu();

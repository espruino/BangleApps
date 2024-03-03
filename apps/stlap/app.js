const storage = require("Storage");
const heatshrink = require("heatshrink");
const STATE_PATH = "stlap.state.json";
g.setFont("Vector", 24);
const BUTTON_ICONS = {
  play: heatshrink.decompress(atob("jEYwMAkAGBnACBnwCBn+AAQPgAQPwAQP8AQP/AQXAAQPwAQP8AQP+AQgICBwQUCEAn4FggyBHAQ+CIgQ")),
  pause: heatshrink.decompress(atob("jEYwMA/4BBAX4CEA")),
  reset: heatshrink.decompress(atob("jEYwMA/4BB/+BAQPDAQPnAQIAKv///0///8j///EP//wAQQICBwQUCEhgyCHAQ+CIgI="))
};

let state = storage.readJSON(STATE_PATH, 1);
const STATE_DEFAULT = {
  wasRunning: false,              //If the stopwatch was ever running since being reset
  sessionStart: 0,                //When the stopwatch was first started
  running: false,                 //Whether the stopwatch is currently running
  startTime: 0,                   //When the stopwatch was last started.
  pausedTime: 0,                  //When the stopwatch was last paused.
  elapsedTime: 0                  //How much time was spent running before the current start time. Update on pause.
};
if (!state) {
  state = STATE_DEFAULT;
}

let lapFile;
let lapHistory;
if (state.wasRunning) {
  lapFile = 'stlap-' + state.sessionStart + '.json';
  lapHistory = storage.readJSON(lapFile);
  if (!lapHistory)
    lapHistory = {
      final: false, //Whether the stopwatch has been reset. It is expected that the stopwatch app will create a final split when reset. If this is false, it is expected that this hasn't been done, and that the current time should be used as the "final split"
      splits: []  //List of times when the Lap button was pressed
    };
} else
  lapHistory = {
    final: false, //Whether the stopwatch has been reset. It is expected that the stopwatch app will create a final split when reset. If this is false, it is expected that this hasn't been done, and that the current time should be used as the "final split"
    splits: []  //List of times when the Lap button was pressed
  };

//Get the number of milliseconds that stopwatch has run for
function getTime() {
  if (!state.wasRunning) {
    //If the timer never ran, zero ms have passed
    return 0;
  } else if (state.running) {
    //If the timer is running, the time left is current time - start time + preexisting time
    return (new Date()).getTime() - state.startTime + state.elapsedTime;
  } else {
    //If the timer is not running, the same as above but use when the timer was paused instead of now.
    return state.pausedTime - state.startTime + state.elapsedTime;
  }
}

let gestureMode = false;

function drawButtons() {
  //Draw the backdrop
  const BAR_TOP = g.getHeight() - 48;
  const BUTTON_Y = BAR_TOP + 12;
  const BUTTON_LEFT = g.getWidth() / 4 - 12;    //For the buttons, we have to subtract 12 because images do not obey alignment, but their size is known in advance
  const TEXT_LEFT = g.getWidth() / 4;           //For text, we do not have to subtract 12 because they do obey alignment.
  const BUTTON_MID = g.getWidth() / 2 - 12;
  const TEXT_MID = g.getWidth() / 2;
  const BUTTON_RIGHT = g.getHeight() * 3 / 4 - 12;

  g.setColor(0, 0, 1).setFontAlign(0, -1)
    .clearRect(0, BAR_TOP, g.getWidth(), g.getHeight())
    .fillRect(0, BAR_TOP, g.getWidth(), g.getHeight())
    .setColor(1, 1, 1);

  if (gestureMode)
    g.setFont('Vector', 16)
      .drawString('Button: Lap/Reset\nSwipe: Start/stop\nTap: Light', TEXT_MID, BAR_TOP);
  else {
    g.setFont('Vector', 24);
    if (!state.wasRunning) {  //If the timer was never running:
      if (storage.read('stlapview.app.js') !== undefined)         //If stlapview is installed, there should be a button to open it and a button to start the timer
        g.drawLine(g.getWidth() / 2, BAR_TOP, g.getWidth() / 2, g.getHeight())
          .drawString("Laps", TEXT_LEFT, BUTTON_Y)
          .drawImage(BUTTON_ICONS.play, BUTTON_RIGHT, BUTTON_Y);
      else g.drawImage(BUTTON_ICONS.play, BUTTON_MID, BUTTON_Y);  //Otherwise, only a button to start the timer
    } else {                  //If the timer was running:
      g.drawLine(g.getWidth() / 2, BAR_TOP, g.getWidth() / 2, g.getHeight());
      if (state.running) {    //If it is running now, have a lap button and a pause button
        g.drawString("LAP", TEXT_LEFT, BUTTON_Y)
          .drawImage(BUTTON_ICONS.pause, BUTTON_RIGHT, BUTTON_Y);
      } else {                //If it is not running now, have a reset button and a
        g.drawImage(BUTTON_ICONS.reset, BUTTON_LEFT, BUTTON_Y)
          .drawImage(BUTTON_ICONS.play, BUTTON_RIGHT, BUTTON_Y);
      }
    }
  }
}

function drawTime() {
  function pad(number) {
    return ('00' + parseInt(number)).slice(-2);
  }

  let time = getTime();
  g.reset(0, 0, 0)
    .setFontAlign(0, 0)
    .setFont("Vector", 36)
    .clearRect(0, 24, g.getWidth(), g.getHeight() - 48)

    //Draw the time
    .drawString((() => {
      let hours = Math.floor(time / 3600000);
      let minutes = Math.floor((time % 3600000) / 60000);
      let seconds = Math.floor((time % 60000) / 1000);
      let hundredths = Math.floor((time % 1000) / 10);

      if (hours >= 1) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
      else return `${minutes}:${pad(seconds)}:${pad(hundredths)}`;
    })(), g.getWidth() / 2, g.getHeight() / 2);

  //Draw the lap labels if necessary
  if (lapHistory.splits.length >= 1) {
    let lastLap = lapHistory.splits.length;
    let curLap = lastLap + 1;

    g.setFont("Vector", 12)
      .drawString((() => {
        let lapTime = time - lapHistory.splits[lastLap - 1];
        let hours = Math.floor(lapTime / 3600000);
        let minutes = Math.floor((lapTime % 3600000) / 60000);
        let seconds = Math.floor((lapTime % 60000) / 1000);
        let hundredths = Math.floor((lapTime % 1000) / 10);

        if (hours == 0) return `Lap ${curLap}: ${pad(minutes)}:${pad(seconds)}:${pad(hundredths)}`;
        else return `Lap ${curLap}: ${hours}:${pad(minutes)}:${pad(seconds)}:${pad(hundredths)}`;
      })(), g.getWidth() / 2, g.getHeight() / 2 + 18)
      .drawString((() => {
        let lapTime;
        if (lastLap == 1) lapTime = lapHistory.splits[lastLap - 1];
        else lapTime = lapHistory.splits[lastLap - 1] - lapHistory.splits[lastLap - 2];
        let hours = Math.floor(lapTime / 3600000);
        let minutes = Math.floor((lapTime % 3600000) / 60000);
        let seconds = Math.floor((lapTime % 60000) / 1000);
        let hundredths = Math.floor((lapTime % 1000) / 10);

        if (hours == 0) return `Lap ${lastLap}: ${pad(minutes)}:${pad(seconds)}:${pad(hundredths)}`;
        else return `Lap ${lastLap}: ${hours}:${pad(minutes)}:${pad(seconds)}:${pad(hundredths)}`;
      })(), g.getWidth() / 2, g.getHeight() / 2 + 30);
  }
}

drawButtons();

function firstTimeStart(now, time) {
  state = {
    wasRunning: true,
    sessionStart: Math.floor(now),
    running: true,
    startTime: now,
    pausedTime: 0,
    elapsedTime: 0,
  };
  lapFile = 'stlap-' + state.sessionStart + '.json';
  setupTimerIntervalFast();
  Bangle.buzz(200);
  drawButtons();
}

function split(now, time) {
  lapHistory.splits.push(time);
  Bangle.buzz();
}

function pause(now, time) {
  //Record the exact moment that we paused
  state.pausedTime = now;

  //Stop the timer
  state.running = false;
  stopTimerInterval();
  Bangle.buzz(200);
  drawTime();
  drawButtons();
}

function reset(now, time) {
  //Record the time
  lapHistory.splits.push(time);
  lapHistory.final = true;
  storage.writeJSON(lapFile, lapHistory);

  //Reset the timer
  state = STATE_DEFAULT;
  lapHistory = {
    final: false,
    splits: []
  };
  Bangle.buzz(500);
  drawTime();
  drawButtons();
}

function start(now, time) {
  //Start the timer and record when we started
  state.elapsedTime += (state.pausedTime - state.startTime);
  state.startTime = now;
  state.running = true;
  setupTimerIntervalFast();
  Bangle.buzz(200);
  drawTime();
  drawButtons();
}

Bangle.on("touch", (button, xy) => {
  setupTimerIntervalFast();

  //In gesture mode, just turn on the light and then return
  if (gestureMode) {
    Bangle.setLCDPower(true);
    return;
  }

  //If we support full touch and we're not touching the keys, ignore.
  //If we don't support full touch, we can't tell so just assume we are.
  if (xy !== undefined && xy.y <= g.getHeight() - 48) return;

  let now = (new Date()).getTime();
  let time = getTime();

  if (!state.wasRunning) {
    if (storage.read('stlapview.app.js') !== undefined) {
      //If we were never running and stlapview is installed, there are two buttons: open stlapview and start the timer
      if (button == 1) load('stlapview.app.js');
      else firstTimeStart(now, time);
    }
    //If stlapview there is only one button: the start button
    else firstTimeStart(now, time);
  } else if (state.running) {
    //If we are running, there are two buttons: lap and pause
    if (button == 1) split(now, time);
    else pause(now, time);

  } else {
    //If we are stopped, there are two buttons: reset and continue
    if (button == 1) reset(now, time);
    else start(now, time);
  }
});

Bangle.on('swipe', direction => {
  setupTimerIntervalFast();

  let now = (new Date()).getTime();
  let time = getTime();

  if (gestureMode) {
    Bangle.setLCDPower(true);
    if (!state.wasRunning) firstTimeStart(now, time);
    else if (state.running) pause(now, time);
    else start(now, time);
  } else {
    gestureMode = true;
    Bangle.setOptions({
      lockTimeout: 0
    });
    drawTime();
    drawButtons();
  }
});

setWatch(() => {
  let now = (new Date()).getTime();
  let time = getTime();

  if (gestureMode) {
    Bangle.setLCDPower(true);
    if (state.running) split(now, time);
    else reset(now, time);
  }
}, BTN1, { repeat: true });

let timerInterval;
let userWatching = false;

function setupTimerIntervalFast() {
  userWatching = true;
  setupTimerInterval();

  setTimeout(() => {
    userWatching = false;
    setupTimerInterval();
  }, 5000);
}

function setupTimerInterval() {
  if (timerInterval !== undefined) {
    clearInterval(timerInterval);
  }
  timerInterval = setInterval(drawTime, userWatching ? 10 : 1000);
}

function stopTimerInterval() {
  if (timerInterval !== undefined) {
    clearInterval(timerInterval);
    timerInterval = undefined;
  }
}

drawTime();
if (state.running) {
  setupTimerIntervalFast();
}

//Save our state when the app is closed
E.on('kill', () => {
  storage.writeJSON(STATE_PATH, state);
  if (state.wasRunning) {
    storage.writeJSON(lapFile, lapHistory);
  }
});

// change interval depending of whether the user's looking
Bangle.on("twist", setupTimerIntervalFast);

Bangle.loadWidgets();
Bangle.drawWidgets();
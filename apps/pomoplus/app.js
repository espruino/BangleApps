g.clear();

Bangle.POMOPLUS_ACTIVE = true;  //Prevent the boot code from running. To avoid having to reload on every interaction, we'll control the vibrations from here when the user is in the app.

const storage = require("Storage");
const common = require("pomoplus-com.js");

//Expire the state if necessary
if (
  common.settings.pausedTimerExpireTime != 0 &&
  !common.state.running &&
  (new Date()).getTime() - common.state.pausedTime > common.settings.pausedTimerExpireTime
) {
  common.state = common.STATE_DEFAULT;
}

function drawButtons() {
  let w = g.getWidth();
  let h = g.getHeight();
  //Draw the backdrop
  const BAR_TOP = h - 24;
  g.setColor(0, 0, 1).setFontAlign(0, -1)
    .clearRect(0, BAR_TOP, w, h)
    .fillRect(0, BAR_TOP, w, h)
    .setColor(1, 1, 1);

  if (!common.state.wasRunning) {  //If the timer was never started, only show a play button
    g.drawImage(common.BUTTON_ICONS.play, w / 2, BAR_TOP);
  } else {
    g.drawLine(w / 2, BAR_TOP, w / 2, h);
    if (common.state.running) {
      g.drawImage(common.BUTTON_ICONS.pause, w / 4, BAR_TOP)
        .drawImage(common.BUTTON_ICONS.skip, w * 3 / 4, BAR_TOP);
    } else {
      g.drawImage(common.BUTTON_ICONS.reset, w / 4, BAR_TOP)
        .drawImage(common.BUTTON_ICONS.play, w * 3 / 4, BAR_TOP);
    }
  }
}

function drawTimerAndMessage() {
  let w = g.getWidth();
  let h = g.getHeight();
  g.reset()
    .setFontAlign(0, 0)
    .setFont("Vector", 36)
    .clearRect(w / 2 - 60, h / 2 - 34, w / 2 + 60, h / 2 + 34)

    //Draw the timer
    .drawString((() => {
      let timeLeft = common.getTimeLeft();
      let hours = timeLeft / 3600000;
      let minutes = (timeLeft % 3600000) / 60000;
      let seconds = (timeLeft % 60000) / 1000;

      function pad(number) {
        return ('00' + parseInt(number)).slice(-2);
      }

      if (hours >= 1) return `${parseInt(hours)}:${pad(minutes)}:${pad(seconds)}`;
      else return `${parseInt(minutes)}:${pad(seconds)}`;
    })(), w / 2, h / 2)

    //Draw the phase label
    .setFont("Vector", 12)
    .drawString(((currentPhase, numShortBreaks) => {
      if (!common.state.wasRunning) return "Not started";
      else if (currentPhase == common.PHASE_WORKING) return `Work ${numShortBreaks + 1}/${common.settings.numShortBreaks + 1}`
      else if (currentPhase == common.PHASE_SHORT_BREAK) return `Short break ${numShortBreaks + 1}/${common.settings.numShortBreaks}`;
      else return "Long break!";
    })(common.state.phase, common.state.numShortBreaks),
      w / 2, h / 2 + 18);

  //Update phase with vibation if needed
  if (common.getTimeLeft() <= 0) {
    common.nextPhase(true);
  }
}

drawButtons();
Bangle.on("touch", (button, xy) => {
  //If we support full touch and we're not touching the keys, ignore.
  //If we don't support full touch, we can't tell so just assume we are.
  if (xy !== undefined && xy.y <= g.getHeight() - 24) return;

  if (!common.state.wasRunning) {
    //If we were never running, there is only one button: the start button
    let now = (new Date()).getTime();
    common.state = {
      wasRunning: true,
      running: true,
      startTime: now,
      pausedTime: now,
      elapsedTime: 0,
      phase: common.PHASE_WORKING,
      numShortBreaks: 0
    };
    setupTimerInterval();
    drawButtons();
    if (common.settings.showClock) Bangle.showClock();

  } else if (common.state.running) {
    //If we are running, there are two buttons: pause and skip
    if (button == 1) {
      //Record the exact moment that we paused
      let now = (new Date()).getTime();
      common.state.pausedTime = now;

      //Stop the timer
      common.state.running = false;
      clearInterval(timerInterval);
      timerInterval = undefined;
      drawTimerAndMessage();
      drawButtons();

    } else {
      common.nextPhase(false);
    }

  } else {
    //If we are stopped, there are two buttons: Reset and continue
    if (button == 1) {
      //Reset the timer
      common.state = common.STATE_DEFAULT;
      drawTimerAndMessage();
      drawButtons();

    } else {
      //Start the timer and record old elapsed time and when we started
      let now = (new Date()).getTime();
      common.state.elapsedTime += common.state.pausedTime - common.state.startTime;
      common.state.startTime = now;
      common.state.running = true;
      drawTimerAndMessage();
      setupTimerInterval();
      drawButtons();
      if (common.settings.showClock) Bangle.showClock();
    }
  }
});

let timerInterval;

function setupTimerInterval() {
  if (timerInterval !== undefined) {
    clearInterval(timerInterval);
  }
  setTimeout(() => {
    timerInterval = setInterval(drawTimerAndMessage, 1000);
    drawTimerAndMessage();
  }, common.timeLeft % 1000);
}

drawTimerAndMessage();
if (common.state.running) {
  setupTimerInterval();
}

//Save our state when the app is closed
E.on('kill', () => {
  storage.writeJSON(common.STATE_PATH, common.state);
});

Bangle.loadWidgets();
Bangle.drawWidgets();

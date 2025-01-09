g.clear();

Bangle.POMOPLUS_ACTIVE = true;  //Prevent the boot code from running. To avoid having to reload on every interaction, we'll control the vibrations from here when the user is in the app.

const storage = require("Storage");
const common = require("pomoplus-com.js");
const wu = require("widget_utils");

//Expire the state if necessary
if (
  common.settings.pausedTimerExpireTime != 0 &&
  !common.state.running &&
  (new Date()).getTime() - common.state.pausedTime > common.settings.pausedTimerExpireTime
) {
  common.state = common.STATE_DEFAULT;
}

const W = g.getWidth();
const H = g.getHeight();
const SCALING = W/176; // The UI was tweaked to look good on a Bangle.js 2 (176x176 px). SCALING automatically adapts so elements have the same proportions relative to the screen size on devices with other resolutions.
const BUTTON_HEIGHT = 56 * SCALING;
const BUTTON_TOP = H - BUTTON_HEIGHT;

function drawButtons() {
  //Draw the backdrop
  const ICONS_SIZE = 24;
  const ICONS_ANCHOR_Y = BUTTON_TOP + BUTTON_HEIGHT / 2 - ICONS_SIZE / 2;
  g.setColor(0, 0, 1)
    .fillRect({x:0, y:BUTTON_TOP, x2:W-1, y2:H-1,r:15*SCALING})
    .setColor(1, 1, 1);

  if (!common.state.wasRunning) {  //If the timer was never started, only show a play button
    g.drawImage(common.BUTTON_ICONS.play, W / 2 - ICONS_SIZE / 2, ICONS_ANCHOR_Y);
  } else {
    g.setColor(g.theme.bg)
      .fillRect(W / 2 - 2, BUTTON_TOP, W / 2 + 2, H)
      .setColor(1,1,1);
    if (common.state.running) {
      g.drawImage(common.BUTTON_ICONS.pause, W / 4 - ICONS_SIZE / 2, ICONS_ANCHOR_Y)
        .drawImage(common.BUTTON_ICONS.skip, W * 3 / 4 - ICONS_SIZE / 2, ICONS_ANCHOR_Y);
    } else {
      g.drawImage(common.BUTTON_ICONS.reset, W / 4 - ICONS_SIZE / 2, ICONS_ANCHOR_Y)
        .drawImage(common.BUTTON_ICONS.play, W * 3 / 4 - ICONS_SIZE / 2, ICONS_ANCHOR_Y);
    }
  }
}

function drawTimerAndMessage() {
  const ANCHOR_X = W / 2;
  const ANCHOR_Y = H * 3 / 8;
  const TIME_SIZE = 48 * SCALING;
  const LABEL_SIZE = 18 * SCALING;
  g.reset()
    .setFontAlign(0, 0)
    .setFont("Vector", TIME_SIZE)
    .clearRect(0, ANCHOR_Y - TIME_SIZE / 2, W-1, ANCHOR_Y + TIME_SIZE / 2 + 1.2 * LABEL_SIZE)

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
    })(), ANCHOR_X, ANCHOR_Y)

    //Draw the phase label
    .setFont("Vector", LABEL_SIZE)
    .drawString(((currentPhase, numShortBreaks) => {
      if (!common.state.wasRunning) return "Not started";
      else if (currentPhase == common.PHASE_WORKING) return `Work ${numShortBreaks + 1}/${common.settings.numShortBreaks + 1}`
      else if (currentPhase == common.PHASE_SHORT_BREAK) return `Short break ${numShortBreaks + 1}/${common.settings.numShortBreaks}`;
      else return "Long break!";
    })(common.state.phase, common.state.numShortBreaks),
      ANCHOR_X, ANCHOR_Y + 2*LABEL_SIZE);

  //Update phase with vibation if needed
  if (common.getTimeLeft() <= 0) {
    common.nextPhase(true);
  }
}

if (!Bangle.isLocked()) drawButtons();

let hideButtons = ()=>{
    g.clearRect(0,BUTTON_TOP,W-1,H-1);
}

let graphicState = 0; // 0 - all is visible, 1 - widgets are hidden, 2 - widgets and buttons are hidden.
let onButtonSwitchGraphics = (n)=>{
  if (process.env.HWVERSION == 2) n=2; // Translate Bangle.js 2 button to Bangle.js 1 middle button.
  if (n == 2) {
    if (graphicState == 0) {
      wu.hide();
    }
    if (graphicState == 1) {
      hideButtons();
    }
    if (graphicState == 2) {
      wu.show();
      drawButtons();
    }
    graphicState = (graphicState+1) % 3;
  }
}

let onTouchSoftwareButtons = (button, xy) => {
  //If we support full touch and we're not touching the keys, ignore.
  //If we don't support full touch, we can't tell so just assume we are.
  let isOutsideButtonArea = xy !== undefined && xy.y <= g.getHeight() - BUTTON_HEIGHT;
  if (isOutsideButtonArea || graphicState == 2) return;

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
};

Bangle.setUI({
  mode: "custom",
  touch: onTouchSoftwareButtons,
  btn: onButtonSwitchGraphics
})

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

Bangle.on('lock', (on, reason) => {
  if (graphicState==2) return;
  if (on) {
    hideButtons();
    wu.hide();
  }
  if (!on) {
    drawButtons();
    if (graphicState==0) wu.show();
  }
});

//Save our state when the app is closed
E.on('kill', () => {
  storage.writeJSON(common.STATE_PATH, common.state);
});

Bangle.loadWidgets();
Bangle.drawWidgets();
if (Bangle.isLocked()) wu.hide();

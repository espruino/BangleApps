var DEBUG = false;
var FILE = "touchtimer.data.json";

var main = () => {
  Bangle.loadWidgets();
  require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
  
  var settings = readSettings();

  var button1 = new Button({ x1: 1, y1: 35, x2: 58, y2: 70 }, 1);
  var button2 = new Button({ x1: 60, y1: 35, x2: 116, y2: 70 }, 2);
  var button3 = new Button({ x1: 118, y1: 35, x2: 174, y2: 70 }, 3);

  var button4 = new Button({ x1: 1, y1: 72, x2: 58, y2: 105 }, 4);
  var button5 = new Button({ x1: 60, y1: 72, x2: 116, y2: 105 }, 5);
  var button6 = new Button({ x1: 118, y1: 72, x2: 174, y2: 105 }, 6);

  var button7 = new Button({ x1: 1, y1: 107, x2: 58, y2: 140 }, 7);
  var button8 = new Button({ x1: 60, y1: 107, x2: 116, y2: 140 }, 8);
  var button9 = new Button({ x1: 118, y1: 107, x2: 174, y2: 140 }, 9);

  var buttonOK = new Button({ x1: 1, y1: 142, x2: 58, y2: 174 }, "OK");
  var button0 = new Button({ x1: 60, y1: 142, x2: 116, y2: 174 }, 0);
  var buttonDelete = new Button({ x1: 118, y1: 142, x2: 174, y2: 174 }, "<-");

  var timerNumberButtons = [
    button1,
    button2,
    button3,
    button4,
    button5,
    button6,
    button7,
    button8,
    button9,
    button0,
  ];

  var timerInputButtons = [
    button1,
    button2,
    button3,
    button4,
    button5,
    button6,
    button7,
    button8,
    button9,
    buttonOK,
    button0,
    buttonDelete,
  ];

  var buttonStartPause = new Button(
    { x1: 1, y1: 35, x2: 174, y2: 105 },
    "START"
  );
  var buttonStop = new Button({ x1: 1, y1: 107, x2: 174, y2: 174 }, "STOP");

  var timerRunningButtons = [buttonStartPause, buttonStop];

  var timerEdit = new TimerEdit();
  timerNumberButtons.forEach((numberButton) => {
    numberButton.setOnClick((number) => {
      log("number button clicked");
      log(number);
      timerEdit.appendNumber(number);
      timerEdit.draw();
    });
  });

  buttonDelete.setOnClick(() => {
    log("delete button clicked");
    timerEdit.removeNumber();
    timerEdit.draw();
  });

  buttonOK.setOnClick(() => {
    if (timerEdit.timeStr.length === 0) {
      return;
    }

    g.clear();
    timerEdit.draw();

    timerInputButtons.forEach((button) => button.disable());

    timerRunningButtons.forEach((button) => {
      button.enable();
      button.draw();
    });
  });

  var timerIntervalId = undefined;
  var buzzIntervalId = undefined;
  var timerCountDown = undefined;
  buttonStartPause.setOnClick(() => {
    if (buttonStartPause.value === "PAUSE") {
      if (timerCountDown) {
        timerCountDown.pause();
      }

      buttonStartPause.value = "START";
      buttonStartPause.draw();

      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = undefined;
      }

      if (buzzIntervalId) {
        clearInterval(buzzIntervalId);
        buzzIntervalId = undefined;
      }

      return;
    }

    if (buttonStartPause.value === "START") {
      if (!timerCountDown) {
        timerCountDown = new TimerCountDown(timerEdit.timeStr);
      } else {
        timerCountDown.unpause();
      }

      buttonStartPause.value = "PAUSE";
      buttonStartPause.draw();

      timerIntervalId = setInterval(() => {
        timerCountDown.draw();

        // Buzz lightly when there are less then 5 seconds left
        if (settings.countDownBuzz) {
          var remainingSeconds = timerCountDown.getAdjustedTime().seconds;
          var remainingMinutes = timerCountDown.getAdjustedTime().minutes;
          var remainingHours = timerCountDown.getAdjustedTime().hours;
          if (   remainingSeconds <= 5 
              && remainingSeconds  > 0
              && remainingMinutes <= 0
              && remainingHours   <= 0) {
            Bangle.buzz();
          }
        }

        if (timerCountDown.isFinished()) {
          buttonStartPause.value = "FINISHED!";
          buttonStartPause.draw();

          if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = undefined;
          }

          var buzzCount = 1;
          Bangle.buzz(settings.buzzDuration * 1000, 1);
          buzzIntervalId = setInterval(() => {
            if (buzzCount >= settings.buzzCount) {
              clearInterval(buzzIntervalId);
              buzzIntervalId = undefined;

              buttonStartPause.value = "REPEAT";
              buttonStartPause.draw();
              buttonStartPause.value = "START";
              timerCountDown = undefined;
              timerEdit.draw();

              return;
            } else {
              Bangle.buzz(settings.buzzDuration * 1000, 1);
              buzzCount++;
            }
          }, settings.buzzDuration * 1000 + settings.pauseBetween * 1000);
        }
      }, 1000);

      return;
    }
  });

  buttonStop.setOnClick(() => {
    if (timerCountDown) {
      timerCountDown = undefined;
    }

    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      timerIntervalId = undefined;
    }

    if (buzzIntervalId) {
      clearInterval(buzzIntervalId);
      buzzIntervalId = undefined;
    }

    buttonStartPause.value = "START";
    buttonStartPause.draw();

    g.clear();
    timerEdit.reset();
    timerEdit.draw();

    timerRunningButtons.forEach((button) => button.disable());

    timerInputButtons.forEach((button) => {
      button.enable();
      button.draw();
    });
  });

  // initalize
  g.clear();
  timerEdit.draw();
  timerInputButtons.forEach((button) => {
    button.enable();
    button.draw();
  });
};

// lib functions

var log = (message) => {
  if (DEBUG) {
    console.log(JSON.stringify(message));
  }
};

var touchHandlers = [];

Bangle.on("touch", (_button, xy) => {
  log("touch");
  log(xy);

  var x = Math.min(Math.max(xy.x, 1), 174);
  var y = Math.min(Math.max(xy.y, 1), 174);

  touchHandlers.forEach((touchHandler) => {
    touchHandler(x, y);
  });
});

var BUTTON_BORDER_WITH = 2;

class Button {
  constructor(position, value) {
    this.position = position;
    this.value = value;

    this.touchHandler = undefined;
    this.highlightTimeoutId = undefined;
  }

  draw(highlight) {
    g.setColor(g.theme.fg);
    g.fillRect(
      this.position.x1,
      this.position.y1,
      this.position.x2,
      this.position.y2
    );

    if (highlight) {
      g.setColor(g.theme.bgH);
    } else {
      g.setColor(g.theme.bg);
    }
    g.fillRect(
      this.position.x1 + BUTTON_BORDER_WITH,
      this.position.y1 + BUTTON_BORDER_WITH,
      this.position.x2 - BUTTON_BORDER_WITH,
      this.position.y2 - BUTTON_BORDER_WITH
    );

    g.setColor(g.theme.fg);
    g.setFontAlign(0, 0);
    g.setFont("Vector", 35);
    g.drawString(
      this.value,
      this.position.x1 + (this.position.x2 - this.position.x1) / 2 + 2,
      this.position.y1 + (this.position.y2 - this.position.y1) / 2 + 2
    );
  }

  setOnClick(callback) {
    this.touchHandler = (x, y) => {
      if (
        x >= this.position.x1 &&
        x <= this.position.x2 &&
        y >= this.position.y1 &&
        y <= this.position.y2
      ) {
        this.draw(true);
        this.highlightTimeoutId = setTimeout(() => {
          this.draw();
          this.highlightTimeoutId = undefined;
        }, 100);
        setTimeout(() => callback(this.value), 25);
      }
    };
  }

  disable() {
    log("disable button");
    log(this.value);
    var touchHandlerIndex = touchHandlers.indexOf(this.touchHandler);
    if (touchHandlerIndex > -1) {
      log("clearing touch handler");
      touchHandlers.splice(touchHandlerIndex, 1);
    }

    if (this.highlightTimeoutId) {
      log("clearing higlight timeout");
      clearTimeout(this.highlightTimeoutId);
      this.highlightTimeoutId = undefined;
    }
  }

  enable() {
    if (this.touchHandler) {
      touchHandlers.push(this.touchHandler);
    }
  }
}

class TimerEdit {
  constructor() {
    this.timeStr = "";
  }

  appendNumber(number) {
    if (number === 0 && this.timeStr.length === 0) {
      return;
    }

    if (this.timeStr.length <= 6) {
      this.timeStr = this.timeStr + number;
    }
  }

  removeNumber() {
    if (this.timeStr.length > 0) {
      this.timeStr = this.timeStr.slice(0, -1);
    }
  }

  reset() {
    this.timeStr = "";
  }

  draw() {
    log("drawing timer edit");
    var timeStrPadded = this.timeStr.padStart(6, "0");
    var timeStrDisplay =
      "" +
      timeStrPadded.slice(0, 2) +
      "h " +
      timeStrPadded.slice(2, 4) +
      "m " +
      timeStrPadded.slice(4, 6) +
      "s";
    log(timeStrPadded);
    log(timeStrDisplay);

    g.clearRect(0, 0, 176, 34);
    g.setColor(g.theme.fg);
    g.setFontAlign(-1, -1);
    g.setFont("Vector:26x40");
    g.drawString(timeStrDisplay, 2, 0);
  }
}

class TimerCountDown {
  constructor(timeStr) {
    log("creating timer");
    this.timeStr = timeStr;
    log(this.timeStr);
    this.start = Math.floor(Date.now() / 1000);
    log(this.start);
    this.pausedTime = undefined;
  }

  getAdjustedTime() {
    var elapsedTime = Math.floor(Date.now() / 1000) - this.start;

    var timeStrPadded = this.timeStr.padStart(6, "0");
    var timeStrHours = parseInt(timeStrPadded.slice(0, 2), 10);
    var timeStrMinutes = parseInt(timeStrPadded.slice(2, 4), 10);
    var timeStrSeconds = parseInt(timeStrPadded.slice(4, 6), 10);

    var hours = timeStrHours;
    var minutes = timeStrMinutes;
    var seconds = timeStrSeconds - elapsedTime;

    if (seconds < 0) {
      var neededMinutes = Math.ceil(Math.abs(seconds) / 60);

      seconds = seconds + neededMinutes * 60;
      minutes = minutes - neededMinutes;

      if (minutes < 0) {
        var neededHours = Math.ceil(Math.abs(minutes) / 60);

        minutes = minutes + neededHours * 60;
        hours = hours - neededHours;
      }
    }

    if (hours < 0 || minutes < 0 || seconds < 0) {
      hours = 0;
      minutes = 0;
      seconds = 0;
    }

    return { hours: hours, minutes: minutes, seconds: seconds };
  }

  pause() {
    this.pausedTime = Math.floor(Date.now() / 1000);
  }

  unpause() {
    if (this.pausedTime) {
      this.start += Math.floor(Date.now() / 1000) - this.pausedTime;
    }

    this.pausedTime = undefined;
  }

  draw() {
    log("drawing timer count down");
    var adjustedTime = this.getAdjustedTime();
    var hours = adjustedTime.hours;
    var minutes = adjustedTime.minutes;
    var seconds = adjustedTime.seconds;

    var timeStrDisplay =
      "" +
      hours.toString().padStart(2, "0") +
      "h " +
      minutes.toString().padStart(2, "0") +
      "m " +
      seconds.toString().padStart(2, "0") +
      "s";
    log(timeStrDisplay);

    g.clearRect(0, 0, 176, 34);
    g.setColor(g.theme.fg);
    g.setFontAlign(-1, -1);
    g.setFont("Vector:26x40");
    g.drawString(timeStrDisplay, 2, 0);
  }

  isFinished() {
    var adjustedTime = this.getAdjustedTime();
    var hours = adjustedTime.hours;
    var minutes = adjustedTime.minutes;
    var seconds = adjustedTime.seconds;

    if (hours <= 0 && minutes <= 0 && seconds <= 0) {
      return true;
    } else {
      return false;
    }
  }
}

var readSettings = () => {
  log("reading settings");
  var settings = require("Storage").readJSON(FILE, 1) || {
    buzzCount: 3,
    buzzDuration: 1,
    pauseBetween: 1,
  };
  log(settings);
  return settings;
};

// start main function

main();

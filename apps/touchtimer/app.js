var DEBUG = false;

var main = () => {
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

  var timeStr = "";
  timerNumberButtons.forEach((numberButton) => {
    numberButton.setOnClick((value) => {
      log("number button clicked");
      log(value);
      log(timeStr);
      if (value === 0 && timeStr.length === 0) {
        return;
      }

      if (timeStr.length <= 6) {
        timeStr = timeStr + value;
      }
      log(timeStr);
      drawTimer(timeStr);
    });
  });

  buttonDelete.setOnClick(() => {
    log("delete button clicked");
    timeStr = timeStr.slice(0, -1);
    log(timeStr);
    drawTimer(timeStr);
  });

  buttonOK.setOnClick(() => {
    if (timeStr.length === 0) {
      return;
    }

    g.clear();
    drawTimer(timeStr);

    timerInputButtons.forEach((button) => button.disable());

    timerRunningButtons.forEach((button) => {
      button.enable();
      button.draw();
    });
  });

  var timerIntervalId = undefined;
  var buzzIntervalId = undefined;
  buttonStartPause.setOnClick(() => {
    if (buttonStartPause.value === "PAUSE") {
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
      buttonStartPause.value = "PAUSE";
      buttonStartPause.draw();

      var time = timeStrToTime(timeStr);

      timerIntervalId = setInterval(() => {
        time = time - 1;

        timeStr = timeToTimeStr(time);
        drawTimer(timeStr);

        if (time === 0) {
          buttonStartPause.value = "FINISHED!";
          buttonStartPause.draw();

          if (timerIntervalId) {
            clearInterval(timerIntervalId);
            timerIntervalId = undefined;
          }

          var buzzCount = 0;
          Bangle.buzz(1000, 1);
          buzzIntervalId = setInterval(() => {
            if (buzzCount >= 10) {
              clearInterval(buzzIntervalId);
              buzzIntervalId = undefined;
              return;
            } else {
              Bangle.buzz(1000, 1);
              buzzCount++;
            }
          }, 5000);
        }
      }, 1000);

      return;
    }
  });

  buttonStop.setOnClick(() => {
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
    timeStr = "";
    drawTimer(timeStr);

    timerRunningButtons.forEach((button) => button.disable());

    timerInputButtons.forEach((button) => {
      button.enable();
      button.draw();
    });
  });

  // initalize
  g.clear();
  drawTimer(timeStr);
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

var drawTimer = (timeStr) => {
  timeStr = timeStr.padStart(6, "0");
  var timeStrDisplay =
    "" +
    timeStr.slice(0, 2) +
    "h " +
    timeStr.slice(2, 4) +
    "m " +
    timeStr.slice(4, 6) +
    "s";

  g.clearRect(0, 0, 176, 34);
  g.setColor(g.theme.fg);
  g.setFontAlign(-1, -1);
  g.setFont("Vector:26x40");
  g.drawString(timeStrDisplay, 2, 0);
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

var timeToTimeStr = (time) => {
  var hours = Math.floor(time / 3600);
  time = time - hours * 3600;
  var minutes = Math.floor(time / 60);
  time = time - minutes * 60;
  var seconds = time;

  if (hours === 0) {
    hours = "";
  } else {
    hours = hours.toString();
  }

  if (hours.length === 0) {
    if (minutes === 0) {
      minutes = "";
    } else {
      minutes = minutes.toString();
    }
  } else {
    minutes = minutes.toString().padStart(2, "0");
  }

  if (hours.length === 0 && minutes.length === 0) {
    if (seconds === 0) {
      seconds = "";
    } else {
      seconds = seconds.toString();
    }
  } else {
    seconds = seconds.toString().padStart(2, "0");
  }

  return hours + minutes + seconds;
};

var timeStrToTime = (timeStr) => {
  timeStr = timeStr.padStart(6, "0");
  return (
    parseInt(timeStr.slice(0, 2), 10) * 3600 +
    parseInt(timeStr.slice(2, 4), 10) * 60 +
    parseInt(timeStr.slice(4, 6), 10)
  );
};

// start main function

main();

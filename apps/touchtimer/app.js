var DEBUG = true;

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

  var buttonStart = new Button({ x1: 1, y1: 142, x2: 58, y2: 174 }, "GO");
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
    buttonStart,
    button0,
    buttonDelete,
  ];

  var buttonPauseContinue = new Button(
    { x1: 1, y1: 35, x2: 174, y2: 105 },
    "PAUSE"
  );
  var buttonStop = new Button({ x1: 1, y1: 107, x2: 174, y2: 174 }, "STOP");

  var timerRunningButtons = [buttonPauseContinue, buttonStop];

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

  buttonStart.setOnClick(() => {
    g.clear();
    drawTimer(timeStr);

    timerInputButtons.forEach((button) => button.disable());

    timerRunningButtons.forEach((button) => {
      button.enable();
      button.draw();
    });
  });

  buttonStop.setOnClick(() => {
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

// start main function

main();

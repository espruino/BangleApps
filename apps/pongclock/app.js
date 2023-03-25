class Ball {
  constructor(collision) {
    this.collision = collision;
    this.w = 4;
    this.h = this.w;
    this.y = height / 2 - this.h / 2;
    this.x = width / 2 - this.w / 2;
    this.oldX = this.x;
    this.oldY = this.y;
    this.velX = 6;
    this.velY = 3.5 + Math.random();
  }

  reset() {
    this.y = height / 2 - this.h / 2;
    this.x = width / 2 - this.w / 2;
    this.velX = 6;
    this.velY = 3.5 + Math.random();
  }

  checkCollision(that, isLeft) {
    let test = false;
    if (isLeft) {
      test = this.x <= that.w + this.w && this.y > that.y && this.y < that.y + that.h;
    } else {
      test = this.x >= that.x + this.w && this.y > that.y && this.y < that.y + that.h;
    }
    if (test) {
      this.velX = -this.velX;
      this.velY = (3.5 + 2 * Math.random()) * this.velY / Math.abs(this.velY);

      if (isLeft) {
        right.follow = this;
        left.follow = null;
      } else {
        left.follow = this;
        right.follow = null;
      }
    }
  }

  move() {
    if (this.velX > 0) {
      this.checkCollision(right, false);
    } else {
      this.checkCollision(left, true);
    }

    this.x += this.velX;
    this.y += this.velY;

    if (this.y <= this.h) {
      this.y = this.h;
      this.velY = -this.velY;
    }

    if (this.y >= height - this.h) {
      this.y = height - this.h;
      this.velY = -this.velY;
    }

    if (this.x >= width) {
      left.scored();
      restart();
    } else if (this.x < 0) {
      right.scored();
      restart();
    }

  }
}

class Paddle {
  constructor(side) {
    this.side = side;
    this.w = 4; //15;
    this.h = 30; //80;
    this.y = height / 2 - this.h / 2;
    this.follow = null;
    this.target = height / 2 - this.h / 2;
    this.score = 99;
    this.hasLost = false;
  }

  reset() {
    this.follow = null;
    this.hasLost = false;
    this.target = height / 2 - this.h / 2;
    this.y = height / 2 - this.h / 2;
    this.move();
  }

  scored() {
    let d = new Date();
    let value = 0;
    if (this.side == "left") {
      value = d.getHours();
    } else {
      value = d.getMinutes();
    }
    if (this.score < value) {
      this.score++;
    } else {
      this.score = value;
    }
  }

  move() {

    if (this.follow && !this.hasLost) {
      var dy = this.follow.y - this.y - this.h / 2;
      this.y += dy / 2;
    } else {
      this.y += (this.target - this.y) / 10;
    }
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y > height - this.h) {
      this.y = height - this.h;
    }
  }
}

var updateTimeout = null;

function update() {
  var d = new Date();
  var lastStep = Date.now();
  left.move();
  right.move();
  if (d.getHours() != left.score) {
    right.follow = null;
    right.hasLost = true;
  }
  if (d.getMinutes() != right.score) {
    left.follow = null;
    left.hasLost = true;
  }

  ball.move();
  redraw();
  var nextStep = 40 - (Date.now() - lastStep);
  //console.log(nextStep);
  updateTimeout = setTimeout(update, nextStep > 0 ? nextStep : 0);
  return lastStep;
}

function redraw() {
  let fontHeight = width / 3.6;
  let fontTop = top + height / 11;
  let topHeight = top + height;
  g.reset();

  if (settings.isInvers) {
    g.setColor(g.theme.bg);
    g.setBgColor(g.theme.fg);
  }

  g.clearRect(0, top + left.oldY, left.w, top + left.oldY + left.h);
  g.clearRect(width - right.w, top + right.oldY, width, top + right.oldY + right.h);
  //g.clearRect(width / 2 - fontHeight * 1.4,  fontTop, width / 2 + fontHeight * 1.4, fontTop + fontHeight);
  g.clearRect(ball.oldX - ball.w, top + ball.oldY - ball.h, ball.oldX + ball.w, top + ball.oldY + ball.h);

  g.setFontVector(fontHeight);
  /**/
  g.setFontAlign(1, -1);
  g.drawString(("0" + left.score).substr(-2), 5 * width / 11, fontTop, true);
  g.setFontAlign(-1, -1);
  g.drawString(("0" + right.score).substr(-2), 6 * width / 11, fontTop, true);
  /**/

  g.drawLine(width / 2, top, width / 2, topHeight);
  g.fillRect(0, top + left.y, left.w, top + left.y + left.h);
  left.oldY = left.y;
  g.fillRect(width - right.w, top + right.y, width, top + right.y + right.h);
  right.oldY = right.y;
  g.fillCircle(ball.x, top + ball.y, ball.w);
  ball.oldX = ball.x;
  ball.oldY = ball.y;
}

function restart() {
  g.reset();
  if (settings.isInvers) {
    g.setColor(g.theme.bg);
    g.setBgColor(g.theme.fg);
  }
  g.clearRect(0, top, width, top + height);
  ball.reset();
  left.reset();
  right.reset();
  right.follow = ball;
  left.move();
  right.move();
  if (settings.withWidgets) {
    Bangle.drawWidgets();
  }
}

function stop() {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  updateTimeout = null;
  if (pauseTimeout) {
    clearTimeout(pauseTimeout);
  }
  pauseTimeout = null;
}

var pauseTimeout = null;

function pause() {
  stop();
  left.scored();
  right.scored();
  redraw();
  pauseTimeout = setTimeout(pause, Date.now() % 60000);
}

//load settings
const SETTINGS_FILE = "pongclock.json";
var settings = Object.assign({
  // default values
  withWidgets: true,
  isInvers: false,
  playLocked: true,
}, require('Storage').readJSON(SETTINGS_FILE, true) || {});
require('Storage').writeJSON(SETTINGS_FILE, settings);

//make clock
Bangle.setUI("clock");

//setup play area
var height = g.getHeight(),
  width = g.getWidth();
var top = 0;

g.reset();
g.clearRect(0, top, width, height);

if (settings.withWidgets) {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  //console.log(WIDGETS);
  if (global.WIDGETS) {
    let bottom = 0;
    for (var i in WIDGETS) {
      var w = WIDGETS[i];
      if (w.area) {
        if (w.area.indexOf("t") >= 0) {
          top = Bangle.appRect.y;
        }
        if (w.area.indexOf("b") >= 0) {
          bottom = height - Bangle.appRect.y2;
        }
      }
    }
    height -= top + bottom;
  }
}

if (settings.isInvers) {
  g.setColor(g.theme.bg);
  g.setBgColor(g.theme.fg);
}
g.clearRect(0, top, width, top + height);

//setup game
var left = new Paddle("left");
var right = new Paddle("right");
var ball = new Ball(true);

left.x = 20;
right.x = width - 20;

left.scored();
right.scored();

Bangle.on("lock", (on) => {
  //console.log(on);
  if (!settings.playLocked) {
    if (on) {
      pause();
    } else {
      stop();
      update();
    }
  }
});

//start clock
restart();
if (!settings.playLocked && Bangle.isLocked()) {
  pause();
} else {
  update();
}

/*
//local testing
require("Storage").write("pongclock.info",{
  "id":"pongclock",
  "name":"Pong Clock",
  "type":"clock",
  "src":"pongclock.app.js",
  "icon":"pongclock.img"
});
*/

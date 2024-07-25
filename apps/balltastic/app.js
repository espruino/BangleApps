const BANGLEJS2 = process.env.HWVERSION==2;
Bangle.setLCDBrightness(1);
if (!BANGLEJS2) Bangle.setLCDMode("doublebuffered");
Bangle.setLCDTimeout(0);

let points = 0;
let level = 1;
let levelSpeedStart = 0.8;
let nextLevelPoints = 10;
let levelSpeedFactor = 0.2;
let counterWidth = 10;
let gWidth = g.getWidth() - counterWidth;
let gHeight = g.getHeight();
let counter = 160;
let counterMax = 160;
let ballDims = 20;
let ballx = g.getWidth() / 2 - ballDims;
let bally = g.getHeight() / 2 - ballDims;
let dotx = g.getWidth() / 2;
let doty = g.getWidth() / 2;
let ballBuzzTime = 5;
let ballSpeedFactor = 40;
let redrawspeed = 5;
let dotwidth = 5;
let running = false;
let drawInterval;
let xBuzzed = false;
let yBuzzed = false;

let BALL = require("heatshrink").decompress(
  atob(
    "ikUyAROvkQ3v4405AIYHBGq9KpMhktz1/W7feAJAtBEZ9jhkhs0ZgkQ8lKxW+jAdB516627E4X8AIPWzelmolKlpJBjMFEYIpC4kQ0YBBqWKynTFYPe7gpE3ec6gnHkNFrXL7372u2E4WjhGCAIliqWrUIPeKoIpB7h9HoUoqWq999///FIJ3BhGDEIIBBgFBAoWCoUI3vY62aQIW7ymSJooLBEoIADwkQEYVhEoInEGIOjR4O1y/OrIrBUYdr198iH/74nF88cE4gpCA4MY8k59CzBAINrx2164nBtduufPWYIlF++/xkxNoMAAIJPBoSdB52a30ZkNGE4IvBoUpwkxLIOMyWEmAmE7+MqKbEsLLBH4P3zw1BAYJFBFIMY8sQ4cx44nB0tVHYITBEoO967lDgDDC1tVQ4QBD37xBjMmJ4I3BE4IxBPoOMuSrBHYL1BJYbrDvfPLoYBD889jMlEoMhkpJBwkRE4O+jB7B405LoJPEYYUx0xPG7/3vxvBmOnrXsdIOc6jxBE4JfBvfwHIafDFoMRgh3H99+zsUDIOMqWU2YlBAAO1/AnBToN76EhgpTBFYKPBGIIhBEovOrWliuc2YlBE4oABE4etu2UyVrpqJBMoKvBEIPnjvWze97ATBE4YPBEopRC64BC27nBzn0znTAIOlimtq21y4BCEoM1HYOMqIVBE44AB0tVCYIBEigVBE4U1GYIFBymywkwEoJzHABIRBMIIXBWoIDCqOEmOEiABCmIjPAA51BFoVSEoUwAIIZNA"
  )
);

function reset() {
  g.clear();
  level = 1;
  points = 0;
  ballx = g.getWidth() / 2 - ballDims;
  bally = g.getHeight() / 2 - ballDims;
  counter = counterMax;
  createRandomDot();
  drawInterval = setInterval(play, redrawspeed);
  running = true;
}

function collide() {
  try {
    Bangle.buzz(ballBuzzTime, 0.8);
  } catch (e) {}
}

function createRandomDot() {
  dotx = Math.floor(
    Math.random() * Math.floor(gWidth - dotwidth / 2) + dotwidth / 2
  );
  doty = Math.floor(
    Math.random() * Math.floor(gHeight - dotwidth / 2) + dotwidth / 2
  );
}

function checkIfDotEaten() {
  if (
    ballx + ballDims > dotx &&
    ballx <= dotx + dotwidth &&
    bally + ballDims > doty &&
    bally <= doty + dotwidth
  ) {
    collide();
    createRandomDot();
    counter = counterMax;
    points++;

    if (points % nextLevelPoints == 0) {
      level++;
    }
  }
}

function drawLevelText() {
  g.setColor("#26b6c7");
  g.setFontAlign(0, 0);
  g.setFont("4x6", 5);
  g.drawString("Level " + level, g.getWidth()/2, g.getHeight()/2);
}

function drawPointsText() {
  g.setColor("#26b6c7");
  g.setFontAlign(0, 0);
  g.setFont("4x6", 2);
  g.drawString("Points " + points, g.getWidth()/2, g.getHeight()-20);
}

function draw() {
  //bg
  if (!BANGLEJS2) {
    g.setColor("#71c6cf");
  } else {
    g.setColor("#002000");
  }
  g.fillRect(0, 0, g.getWidth(), g.getHeight());

  //counter
  drawCounter();

  //draw level
  drawLevelText();
  drawPointsText();

  //dot
  g.setColor("#ff0000");
  g.fillCircle(dotx, doty, dotwidth);

  //ball
  g.drawImage(BALL, ballx, bally);

  g.flip();
}

function drawCounter() {
  g.setColor("#000000");
  g.fillRect(g.getWidth() - counterWidth, 0, g.getWidth(), gHeight);

  if(counter < 40 ) g.setColor("#fc0303");
  else if (counter < 80 ) g.setColor("#fc9803");
  else g.setColor("#0318fc");

  g.fillRect(
    g.getWidth() - counterWidth,
    gHeight,
    g.getWidth(),
    gHeight - counter
  );
}

function checkCollision() {
  if (ballx < 0) {
    ballx = 0;
    if (!xBuzzed) collide();
    xBuzzed = true;
  } else if (ballx > gWidth - ballDims) {
    ballx = gWidth - ballDims;
    if (!xBuzzed) collide();
    xBuzzed = true;
  } else {
    xBuzzed = false;
  }

  if (bally < 0) {
    bally = 0;
    if (!yBuzzed) collide();
    yBuzzed = true;
  } else if (bally > gHeight - ballDims) {
    bally = gHeight - ballDims;
    if (!yBuzzed) collide();
    yBuzzed = true;
  } else {
    yBuzzed = false;
  }
}

function count() {
  counter -= levelSpeedStart + level * levelSpeedFactor;
  if (counter <= 0) {
    running = false;
    clearInterval(drawInterval);
    setTimeout(function(){ E.showMessage("Press Button 1\nto restart.", "Game over!");},50);
  }
}

function accel(values) {
  ballx -= values.x * ballSpeedFactor;
  bally -= values.y * ballSpeedFactor;
}

function play() {
  if (running) {
    accel(Bangle.getAccel());
    checkCollision();
    checkIfDotEaten();
    count();
    draw();
  }
}

setTimeout(() => {
  reset();
  drawInterval = setInterval(play, redrawspeed);

  setWatch(
    () => {
      if(!running) reset();
    },
    BTN1,
    { repeat: true }
  );

  running = true;
}, 10);

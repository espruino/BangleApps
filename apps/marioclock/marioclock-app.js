/**********************************
  BangleJS MARIO CLOCK
  + Based on Espruino Mario Clock V3 https://github.com/paulcockrell/espruino-mario-clock
  + Converting images to 1bit BMP: Image > Mode > Indexed and tick the "Use black and white (1-bit) palette", Then export as BMP.
  + Online Image convertor: https://www.espruino.com/Image+Converter
  + Images must be converted 1Bit White/Black !!! Not Black/White
**********************************/

const locale = require("locale");
const storage = require('Storage');
const settings = (storage.readJSON('setting.json', 1) || {});
const timeout = settings.timeout || 10;
const is12Hour = settings["12hour"] || false;

// Screen dimensions
let W, H;

let intervalRef, displayTimeoutRef = null;

// Colours
const LIGHTEST = "#effedd";
const LIGHT = "#add795";
const DARK = "#588d77";
const DARKEST = "#122d3e";

const marioSprite = {
  frameIdx: 0,
  x: 35,
  y: 55,
  jumpCounter: 0,
  jumpIncrement: Math.PI / 6,
  isJumping: false
};

const coinSprite = {
  frameIdx: 0,
  x: 34,
  y: 18,
  isAnimating: false,
  yDefault: 18,
};

const pyramidSprite = {
  x: 90,
  height: 34,
};

const ONE_SECOND = 1000;

let timer = 0;
let backgroundArr = [];

function incrementTimer() {
  if (timer > 1000) {
    timer = 0;
  }
  else {
    timer += 50;
  }
}

function drawBackground() {
  // Clear screen
  g.setColor(LIGHTEST);
  g.fillRect(0, 10, W, H);

  // Date bar
  g.setColor(DARKEST);
  g.fillRect(0, 0, W, 9);

  // draw sky
  g.setColor(LIGHT);
  g.fillRect(0, 10, g.getWidth(), 15);
  g.fillRect(0, 17, g.getWidth(), 17);
  g.fillRect(0, 19, g.getWidth(), 19);
  g.fillRect(0, 21, g.getWidth(), 21);
}

function drawFloor() {
  const fImg = require("heatshrink").decompress(atob("ikDxH+rgATCoIBQAQYDP")); // Floor image
  for (let x = 0; x < 4; x++) {
    g.drawImage(fImg, x * 20, g.getHeight() - 5);
  }
}

function drawPyramid() {
  const pPol = [pyramidSprite.x + 10, H - 6, pyramidSprite.x + 50, pyramidSprite.height, pyramidSprite.x + 90, H - 6]; // Pyramid poly

  g.setColor(LIGHT);
  g.fillPoly(pPol);

  pyramidSprite.x -= 1;
  // Reset and randomize pyramid if off-screen
  if (pyramidSprite.x < - 100) {
    pyramidSprite.x = 90;
    pyramidSprite.height = Math.floor(Math.random() * (60 /* max */ - 25 /* min */ + 1) + 25 /* min */);
  }
}

function drawTreesFrame(x, y) {
  const tImg = require("heatshrink").decompress(atob("h8GxH+AAMHAAIFCAxADEBYgDCAQYAFCwobOAZAEFBxo=")); // Tree image

  g.drawImage(tImg, x, y);
  g.setColor(DARKEST);
  g.drawLine(x + 6 /* Match stalk to palm tree */, y + 6 /* Match stalk to palm tree */, x + 6, H - 6);
}

function drawTrees() {
  let newSprite = {x: 90, y: Math.floor(Math.random() * (40 /* max */ - 5 /* min */ + 1) + 15 /* min */)};

  // remove first sprite if offscreen
  let firstBackgroundSprite = backgroundArr[0];
  if (firstBackgroundSprite) {
      if (firstBackgroundSprite.x < -15) backgroundArr.splice(0, 1);
  }

  // set background sprite if array empty
  let lastBackgroundSprite = backgroundArr[backgroundArr.length - 1];
  if (!lastBackgroundSprite) {
    lastBackgroundSprite = newSprite;
    backgroundArr.push(lastBackgroundSprite);
  }

  // add random sprites
  if (backgroundArr.length < 2 && lastBackgroundSprite.x < (16 * 7)) {
    const randIdx = Math.floor(Math.random() * 25);
    if (randIdx < 2) {
      backgroundArr.push(newSprite);
    }
  }

  for (x = 0; x < backgroundArr.length; x++) {
    let scenerySprite = backgroundArr[x];
    scenerySprite.x -= 5;
    drawTreesFrame(scenerySprite.x, scenerySprite.y);
  }
}

function drawCoinFrame(x, y) {
  const cImg = require("heatshrink").decompress(atob("hkPxH+AAcHAAQIEBIXWAAQNEBIWHAAdcBgQLBA4IODBYQKEBAQMDBelcBaJUBM4QRBNYx1EBQILDR4QHBBISdIBIoA==")); // Coin image
  g.drawImage(cImg, x, y);
}

function drawCoin() {
  if (!coinSprite.isAnimating) return;

  coinSprite.y -= 8;
  if (coinSprite.y < (0 - 15 /*Coin sprite height*/)) {
    coinSprite.isAnimating = false;
    coinSprite.y = coinSprite.yDefault;
    return;
  }

  drawCoinFrame(coinSprite.x, coinSprite.y);
}

function drawMarioFrame(idx, x, y) {
  const mFr1 = require("heatshrink").decompress(atob("h8UxH+AAkHAAYKFBolcAAIPIBgYPDBpgfGFIY7EA4YcEBIPWAAYdDC4gLDAII5ECoYOFDogODFgoJCBwYZCAQYOFBAhAFFwZKGHQpMDw52FSg2HAAIoDAgIOMB5AAFGQTtKeBLuNcQwOJFwgJFA=")); // Mario Frame 1
  const mFr2 = require("heatshrink").decompress(atob("h8UxH+AAkHAAYKFBolcAAIPIBgYPDBpgfGFIY7EA4YcEBIPWAAYdDC4gLDAII5ECoYOFDogODFgoJCBwYZCAQYOFBAhAFFwZKGHQpMDw+HCQYEBSowOBBQIdCCgTOIFgiVHFwYCBUhA9FBwz8HAo73GACQA=")); // Mario frame 2

  switch(idx) {
    case 0:
      g.drawImage(mFr1, x, y);
      break;
    case 1:
      g.drawImage(mFr2, x, y);
      break;
    default:
  }
}

function drawMario(date) {
  // calculate jumping
  const seconds = date.getSeconds(),
        milliseconds = date.getMilliseconds();

  if (seconds == 59 && milliseconds > 800 && !marioSprite.isJumping) {
    marioSprite.isJumping = true;
  }

  if (marioSprite.isJumping) {
    marioSprite.y = (Math.sin(marioSprite.jumpCounter) * -12) + 50 /* Mario Y base value */;
    marioSprite.jumpCounter += marioSprite.jumpIncrement;

    if (parseInt(marioSprite.jumpCounter) === 2 && !coinSprite.isAnimating) {
      coinSprite.isAnimating = true;
    }

    if (marioSprite.jumpCounter.toFixed(1) >= 4) {
      marioSprite.jumpCounter = 0;
      marioSprite.isJumping = false;
    }
  }

  // calculate animation timing
  if (timer % 50 === 0) {
    // shift to next frame
    marioSprite.frameIdx ^= 1;
  }

  drawMarioFrame(marioSprite.frameIdx, marioSprite.x, marioSprite.y);
}

function drawBrickFrame(x, y) {
  const brk = require("heatshrink").decompress(atob("ikQxH+/0HACASB6wAQCoPWw4AOrgT/Cf4T/Cb1cAB8H/wVBAB/+A"));
  g.drawImage(brk, x, y);
}

function drawTime(date) {
  // draw hour brick
  drawBrickFrame(20, 25);
  // draw minute brick
  drawBrickFrame(42, 25);

  const h = date.getHours();
  const hours = ("0" + ((is12Hour && h > 12) ? h - 12 : h)).substr(-2);
  const mins = ("0" + date.getMinutes()).substr(-2);

  g.setFont("6x8");
  g.setColor(DARKEST);
  g.drawString(hours, 25, 29);
  g.drawString(mins, 47, 29);
}

function drawDate(date) {
  g.setFont("6x8");
  g.setColor(LIGHTEST);
  let dateStr = locale.date(date, true);
  dateStr = dateStr.replace(date.getFullYear(), "").trim().replace(/\/$/i,"");
  dateStr = locale.dow(date, true) + " " + dateStr;
  g.drawString(dateStr, (W - g.stringWidth(dateStr))/2, 1);
}

function redraw() {
  const date = new Date();

  // Update timers
  incrementTimer();

  // Draw frame
  drawBackground();
  drawFloor();
  drawPyramid();
  drawTrees();
  drawTime(date);
  drawDate(date);
  drawMario(date);
  drawCoin();

  // Render new frame
  g.flip();
}

function clearTimers(){
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }

  if(displayTimeoutRef) {
    clearInterval(displayTimeoutRef);
    displayTimeoutRef = null;
  }
}

function resetDisplayTimeout() {
  if (displayTimeoutRef) clearInterval(displayTimeoutRef);

  displayTimeoutRef = setInterval(() => {
    if (Bangle.isLCDOn()) Bangle.setLCDPower(false);
    clearTimers();
  }, ONE_SECOND * timeout);
}

function startTimers(){
  if(intervalRef) clearTimers();
  intervalRef = setInterval(redraw, 50);

  resetDisplayTimeout();

  redraw();
}

// Main
function init() {
  clearInterval();

  // Initialise display
  Bangle.setLCDMode("80x80");

  // Store screen dimensions
  W = g.getWidth();
  H = g.getHeight();

  // Get Mario to jump!
  setWatch(() => {
    if (intervalRef && !marioSprite.isJumping) marioSprite.isJumping = true;
    resetDisplayTimeout();
  }, BTN1, {repeat:true});

  setWatch(() => {
    Bangle.setLCDMode();
    Bangle.showLauncher();
  }, BTN2, {repeat:false,edge:"falling"});

  Bangle.on('lcdPower', (on) => {
    if (on) {
      startTimers();
    } else {
      clearTimers();
    }
  });

  Bangle.on('faceUp',function(up){
    if (up && !Bangle.isLCDOn()) {
      clearTimers();
      Bangle.setLCDPower(true);
    }
  });

  startTimers();
}

// Initialise!
init();
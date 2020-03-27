/**********************************
  BangleJS MARIO CLOCK V0.1.0
  + Based on Espruino Mario Clock V3 https://github.com/paulcockrell/espruino-mario-clock
  + Converting images to 1bit BMP: Image > Mode > Indexed and tick the "Use black and white (1-bit) palette", Then export as BMP.
  + Online Image convertor: https://www.espruino.com/Image+Converter
**********************************/

var locale = require("locale");

// Screen dimensions
let W, H;

let intervalRef, displayTimeoutRef = null;

// Space to draw watch widgets (e.g battery, bluetooth status)
const WIDGETS_GUTTER = 10;

// Colours
const LIGHTEST = "#effedd";
const LIGHT = "#add795";
const DARK = "#588d77";
const DARKEST = "#122d3e";

// Mario Images
const marioRunningImage1 = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("B8AfwH+B/8f/z4M+KExcnAUSCw87w4L8CJQRNB/YH+AxgCEAPAA="))
};

const marioRunningImage1Neg = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAHwB0DOgY/jt8PDAPAEAB2gOyAAgAAAOAB4AAAA="))
};

const marioRunningImage2 = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("B8AfwH+B/8f/z4M+KExcnAUSCw87w4J6BEsPnSfyT+S+OMAAAAA="))
};

const marioRunningImage2Neg = {
  width : 15, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAHwB0DOgY/jt8PDAPAGEA7QAYhgMMBhAAAAAAAA="))
};

const pyramid = {
  width : 20, height : 20, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAkAAQgAIEAEAgCAEBAAggAEQAAoAAE="))
};

const pipe = {
  width : 9, height : 6, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/8BxaCRSCA=="))
};

const floor = {
  width : 8, height : 3, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/6pE"))
};

const sky = {
  width : 128, height : 30, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("VVVVVVVVVVVVVVVVVVVVVQAAAAAAAAAAAAAAAAAAAABVVVVVVVVVVVVVVVVVVVVVIiIiIiIiIiIiIiIiIiIiIlVVVVVVVVVVVVVVVVVVVVWIiIiIiIiIiIiIiIiIiIiIVVVVVVVVVVVVVVVVVVVVVSIiIiIiIiICIiIiIiIiIiJVVVVVVVVVAVVVVVVVVVVViIiIiIiIiACIiIiIiIiIiFVVVVVVVVQAVVVVVVVVVVUiIiIiIiIgACIiIiIiIiIiVVVVVVVVUAAVVVUBVVVVUKqqqqqqqggAKCqqAKqqqoBVUBVVVVQAABAVVABVVVUAIiACIiIgAAAgAiAAIiIiAFVABVVVUAAAUAVUABRVVQCqgAKCqqAAACAAAAAgCqoAVUABAVVAAAAAAAAAAAVQAKqAAACqoAAAAAAAAAACgABAAAAAUEAAAAAAAAAABQAAgAAAACAAAAAAAAAAAAIAAAAAAABQAAAAAAAAAAAEAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"))
};

const brick = {
  width : 21, height : 15, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("f//0AABoAAsAABgAAMAABgAAMAABgAAMAABgAAMAABoAAsAABf//wA=="))
};

const flower = {
  width : 7, height : 7, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("fY3wjW+OAA=="))
};

const pipePlant = {
  width : 9, height : 15, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("FBsNhsHDWPn/gOLQSKQSKQQ="))
};

const marioSprite = {
  frameIdx: 0,
  frames: [
    marioRunningImage1,
    marioRunningImage2
  ],
  negFrames: [
    marioRunningImage1Neg,
    marioRunningImage2Neg
  ],
  x: 35,
  y: 55,
  jumpCounter: 0,
  jumpIncrement: Math.PI / 10,
  isJumping: false
};

const STATIC_TILES = {
  "_": {img: floor, x: 16 * 8, y: 75},
  "X": {img: sky, x: 0, y: 10},
  "#": {img: brick, x: 0, y: 0},
};

const TILES = {
  "T": {img: pipe, x: 16 * 8, y: 69},
  "^": {img: pyramid, x: 16 * 8, y: 55},
  "*": {img: flower, x: 16 * 8, y: 68},
  "V": {img: pipePlant, x: 16 * 8, y: 60}
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

function drawTile(sprite) {
  g.drawImage(sprite.img, sprite.x, sprite.y);
}

function drawBackground() {
  g.setColor(LIGHTEST);
  g.fillRect(0, 10, W, H);

  // draw floor
  g.setColor(DARK);
  for (var x = 0; x < 16; x++) {
    var floorSprite = Object.assign({}, STATIC_TILES._, {x: x * 8});
    drawTile(floorSprite);
  }

  // draw sky
  var skySprite = STATIC_TILES.X;
  g.setColor(LIGHT);
  drawTile(skySprite);
}

function drawScenery() {
  // new random sprite
  const spriteKeys = Object.keys(TILES);
  const key = spriteKeys[Math.floor(Math.random() * spriteKeys.length)];
  let newSprite = Object.assign({}, TILES[key]);

  // remove first sprite if offscreen
  let firstBackgroundSprite = backgroundArr[0];
  if (firstBackgroundSprite) {
      if (firstBackgroundSprite.x < -20) backgroundArr.splice(0, 1);
  }

  // set background sprite if array empty
  var lastBackgroundSprite = backgroundArr[backgroundArr.length - 1];
  if (!lastBackgroundSprite) {
    lastBackgroundSprite = newSprite;
    backgroundArr.push(lastBackgroundSprite);
  }

  // add random sprites
  if (backgroundArr.length < 6 && lastBackgroundSprite.x < (16 * 7)) {
    var randIdx = Math.floor(Math.random() * 25);
    if (randIdx < spriteKeys.length - 1) {
      backgroundArr.push(newSprite);
    }
  }

  for (x = 0; x < backgroundArr.length; x++) {
    let scenerySprite = backgroundArr[x];

    // clear sprite at previous position
    g.setColor(LIGHTEST);
    drawTile(scenerySprite);

    // draw sprite in new position
    g.setColor(LIGHT);
    scenerySprite.x -= 5;
    drawTile(scenerySprite);
  }
}

function drawMario() {
  // clear old mario frame
  g.setColor(LIGHTEST);
  g.drawImage(
    marioSprite.negFrames[marioSprite.frameIdx],
    marioSprite.x,
    marioSprite.y
  );
  g.drawImage(
    marioSprite.frames[marioSprite.frameIdx],
    marioSprite.x,
    marioSprite.y
  );

  // calculate jumping
  const t = new Date(),
        seconds = t.getSeconds(),
        milliseconds = t.getMilliseconds();

  if (seconds == 59 && milliseconds > 800 && !marioSprite.isJumping) {
    marioSprite.isJumping = true;
  }

  if (marioSprite.isJumping) {
    marioSprite.y = (Math.sin(marioSprite.jumpCounter) * -10) + 50 /* Mario Y base value */;
    marioSprite.jumpCounter += marioSprite.jumpIncrement;

    if (marioSprite.jumpCounter.toFixed(1) >= 4) {
      marioSprite.jumpCounter = 0;
      marioSprite.isJumping = false;
    }
  }

  // calculate animation timing
  if (timer % 100 === 0) {
    // shift to next frame
    marioSprite.frameIdx ^= 1;
  }

  // colour in mario
  g.setColor(LIGHT);
  g.drawImage(
    marioSprite.negFrames[marioSprite.frameIdx],
    marioSprite.x,
    marioSprite.y
  );

  // draw mario
  g.setColor(DARKEST);
  g.drawImage(
    marioSprite.frames[marioSprite.frameIdx],
    marioSprite.x,
    marioSprite.y
  );
}


function drawBrick(x, y) {
  const brickSprite = Object.assign({}, STATIC_TILES['#'], {x: x, y: y});

  // draw brick background colour
  g.setColor(LIGHT);
  g.fillRect(x, y, x + 20, y+14);

  // draw brick sprite
  g.setColor(DARK);
  drawTile(brickSprite);
}

function drawTime() {
  // draw hour brick
  drawBrick(20, 25);
  // draw minute brick
  drawBrick(42, 25);

  const t = new Date();
  const hours = ("0" + t.getHours()).substr(-2);
  const mins = ("0" + t.getMinutes()).substr(-2);

  g.setFont("6x8");
  g.setColor(DARKEST);
  g.drawString(hours, 25, 29);
  g.drawString(mins, 47, 29);
}

function drawDate() {
  const date = new Date();
  const day = locale.dow(date).substr(0, 3);
  const dayNum = ("0" + date.getDate()).substr(-2);
  const month = locale.month(date).substr(0, 3);

  g.setFont("6x8");
  g.setColor(LIGHTEST);
  g.drawString(`${day} ${dayNum} ${month}`, 10, 0, true);
}

function redraw() {
  // Update timers
  incrementTimer();

  // Draw frame
  drawScenery();
  drawTime();
  drawDate();
  drawMario();

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
  }, ONE_SECOND * 10);
}

function startTimers(){
  if(intervalRef) clearTimers();
  intervalRef = setInterval(redraw, 50);

  resetDisplayTimeout();

  drawBackground();
  redraw();
}

// Main
function init() {
  clearInterval();

  // Initialise display
  Bangle.setLCDMode("80x80");
  g.clear();

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
}

// Initialise!
init();
startTimers();

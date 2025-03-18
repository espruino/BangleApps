/**
 * BangleJS MARIO CLOCK
 *
 * + Original Author: Paul Cockrell https://github.com/paulcockrell
 * + Created: April 2020
 * + Based on Espruino Mario Clock V3 https://github.com/paulcockrell/espruino-mario-clock
 * + Online Image convertor: https://www.espruino.com/Image+Converter, Use transparency + compression + 8bit Web + export as Image String
 * + Images must be drawn as PNGs with transparent backgrounds
 */

const locale = require("locale");
const storage = require('Storage');
const settings = (storage.readJSON('setting.json', 1) || {});
const timeout = settings.timeout || 10;
const is12Hour = settings["12hour"] || false;

// Screen dimensions
let W, H;
// Screen brightness
let brightness = 1;

let intervalRef, displayTimeoutRef = null;

// Colours
const LIGHTEST = "#effedd";
const LIGHT = "#add795";
const DARK = "#588d77";
const DARKEST = "#122d3e";
const NIGHT = "#001818";

// Character names
const DAISY = "daisy";
const TOAD = "toad";
const MARIO = "mario";

const characterSprite = {
  frameIdx: 0,
  x: 33,
  y: 55,
  jumpCounter: 0,
  jumpIncrement: Math.PI / 6,
  isJumping: false,
  character: MARIO,
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
const DATE_MODE = "date";
const BATT_MODE = "batt";
const TEMP_MODE = "temp";
const PHON_MODE = "gbri";

let timer = 0;
let backgroundArr = [];
let nightMode = false;
let infoMode = DATE_MODE;

// Used to stop values flapping when displayed on screen
let lastBatt = 0;
let lastTemp = 0;

const phone = {
  get status() {
    return NRF.getSecurityStatus().connected ? /*LANG*/"Yes" : /*LANG*/"No";
  },
  message: null,
  messageTimeout: null,
  messageScrollX: null,
  messageType: null,
};

const SETTINGS_FILE = "marioclock.json";

function readSettings() {
  return require('Storage').readJSON(SETTINGS_FILE, 1) || {};
}

function writeSettings(newSettings) {
  require("Storage").writeJSON(SETTINGS_FILE, newSettings);
}

function phoneOutbound(msg) {
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify(msg));
}

function phoneClearMessage() {
  if (phone.message === null) return;

  if (phone.messageTimeout) {
    clearTimeout(phone.messageTimeout);
    phone.messageTimeout = null;
  }
  phone.message = null;
  phone.messageScrollX = null;
  phone.messageType = null;
}

function phoneNewMessage(type, msg) {

  phoneClearMessage();
  phone.messageTimeout = setTimeout(() => phone.message = null, ONE_SECOND * 30);
  phone.message = msg;
  phone.messageType = type;

  // Notify user and active screen
  if (!(require('Storage').readJSON('setting.json',1)||{}).quiet) {
    Bangle.buzz();
    if (!Bangle.isLCDOn()) {
      clearTimers();
      Bangle.setLCDPower(true);
    }
  }
}

function truncStr(str, max) {
  if (str.length > max) {
    return str.substr(0, max) + '...';
  }
  return str;
}

function phoneInbound(evt) {
  switch (evt.t) {
    case 'notify': {
      const sender = truncStr(evt.sender, 10);
      const subject = truncStr(evt.subject, 15);
      phoneNewMessage("notify", `${sender} - '${subject}'`);
      break;
    }
    case 'call':
      if (evt.cmd === "accept") {
        let nameOrNumber = "Unknown";
        if (evt.name !== null || evt.name !== "") {
          nameOrNumber = evt.name;
        } else if (evt.number !== null || evt.number !== "") {
          nameOrNumber = evt.number;
        }
        phoneNewMessage("call", nameOrNumber);
      }
      break;
    default:
      return null;
  }
}

function genRanNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function switchCharacter() {
  const curChar = characterSprite.character;

  let newChar;
  switch(curChar) {
    case DAISY:
      newChar = MARIO;
      break;
    case  TOAD:
      newChar = DAISY;
      break;
    case MARIO:
    default:
      newChar = TOAD;
  }

  characterSprite.character = newChar;
}

function toggleNightMode() {
  if (!nightMode) {
    nightMode = true;
    return;
  }

  brightness -= 0.30;
  if (brightness <= 0) {
    brightness = 1;
    nightMode = false;
  }
  Bangle.setLCDBrightness(brightness);
}

function incrementTimer() {
  if (timer > 100) {
    timer = 0;
  }
  else {
    timer += 10;
  }
}

function drawBackground() {
  "ram"

  // Clear screen
  const bgColor = (nightMode) ? NIGHT : LIGHTEST;
  g.setColor(bgColor);
  g.fillRect(0, 10, W, H);

  // set cloud colors and draw clouds
  const cloudColor = (nightMode) ? DARK : LIGHT;
  g.setColor(cloudColor);
  g.fillRect(0, 10, W, 15);
  g.fillRect(0, 17, W, 17);
  g.fillRect(0, 19, W, 19);
  g.fillRect(0, 21, W, 21);

  // Date bar
  g.setColor(DARKEST);
  g.fillRect(0, 0, W, 9);
}

function drawFloor() {
  const fImg = require("heatshrink").decompress(atob("ikDxH+rgATCoIBQAQYDP")); // Floor image
  for (let x = 0; x < 4; x++) {
    g.drawImage(fImg, x * 20, g.getHeight() - 5);
  }
}

function drawPyramid() {
  "ram"

  const pPol = [pyramidSprite.x + 10, H - 5, pyramidSprite.x + 50, pyramidSprite.height, pyramidSprite.x + 90, H - 5]; // Pyramid poly

  const color = (nightMode) ? DARK : LIGHT;
  g.setColor(color);
  g.fillPoly(pPol);

  pyramidSprite.x -= 1;
  // Reset and randomize pyramid if off-screen
  if (pyramidSprite.x < - 100) {
    pyramidSprite.x = 90;
    pyramidSprite.height = genRanNum(25, 60);
  }
}

function drawTreesFrame(x, y) {
  const tImg = require("heatshrink").decompress(atob("h8GxH+AAMHAAIFCAxADEBYgDCAQYAFCwobOAZAEFBxo=")); // Tree image

  g.drawImage(tImg, x, y);
  g.setColor(DARKEST);
  g.drawLine(x + 6 /* Match stalk to palm tree */, y + 6 /* Match stalk to palm tree */, x + 6, H - 6);
}

function generateTreeSprite() {
  return {
    x: 90,
    y: genRanNum(30, 60)
  };
}

function drawTrees() {
  // remove first sprite if offscreen
  let firstBackgroundSprite = backgroundArr[0];
  if (firstBackgroundSprite) {
    if (firstBackgroundSprite.x < -15) backgroundArr.splice(0, 1);
  }

  // set background sprite if array empty
  let lastBackgroundSprite = backgroundArr[backgroundArr.length - 1];
  if (!lastBackgroundSprite) {
    const newSprite = generateTreeSprite();
    lastBackgroundSprite = newSprite;
    backgroundArr.push(lastBackgroundSprite);
  }

  // add random sprites
  if (backgroundArr.length < 2 && lastBackgroundSprite.x < (16 * 7)) {
    const randIdx = Math.floor(Math.random() * 25);
    if (randIdx < 2) {
      const newSprite = generateTreeSprite();
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

function drawDaisyFrame(idx, x, y) {
  var frame;

  switch(idx) {
    case 2:
      frame = require("heatshrink").decompress(atob("h0UxH+AAkrAIgAH60rAIQNIBQIABDZErAAwMMBwo0CBxQNEHAQGCBpIPCBoQJCDRIXDBpA7DBIQACw5yCJQgZDP4gNErlcJAZ6GAgNcw+HRI4CCDgNcU44ZDDYSYGDIYACB4QaEDYgMFJAg3DFQ5mFBQYA==")); // daisy jumping
      break;
    case 0:
      frame = require("heatshrink").decompress(atob("h8UxH+AAsHAIgAI60HAIQOJBYIABDpMHAAwNNB4wOJB4gIEHgQBBBxYQCBwYLDDhIaEBxApEw4qDAgIOHDwiIEBwtcFIRWIUgWHw6TIAQXWrlcWZAqBDQIeBBxQaBDxIcCHIQ8JDAIAFWJLPHA=="));
      break;
    case 1:
    default:
      frame = require("heatshrink").decompress(atob("h8UxH+AAsHAIgAI60HAIQOJBYIABDpMHAAwNNB4wOJB4gIEHgQBBBxYQCBwYLDDhIaEBxApEw4qDAgIOHDwiIEBwtcFIRWIUgQvBSZACCBwNcWZQcCAAIPIDgYACFw4YBDYIOCD4waEDYI+HaBQ="));
  }

  g.drawImage(frame, x, y);
}

function drawMarioFrame(idx, x, y) {
  var frame;

  switch(idx) {
    case 2:
      frame = require("heatshrink").decompress(atob("h8UxH+AAkrAAYFCBo9cAAIEB63WB4gMDB4YOFBowfDw4xDBAYADA4YcDGwYACDoYAEBYYBBw4NDCoYOFDIweFFwoZFAQYIDLAQWGEwqgECI6ECJ4JeGQYS9EB4QTHBwImCBYRtDSAwrFawqkFWY7PEBxoMFKoZaELoYICAAg")); // Mario frame jumping
      break;
    case 0:
      frame = require("heatshrink").decompress(atob("h8UxH+AAkrAAYKFBolcAAIPIBgYPDBpgfGFIY7EA4YcEBIPWAAYdDC4gLDAII5ECoYOFDogODFgoJCBwYZCAQYOFBAhAFFwZKGGQgNCw4ACLwgFBBwgKECQpZCCgRqDFQikEJIriIBgzwIdxjiGBxIuEBIo=")); // Mario Frame 1
      break;
    case 1:
    default:
      frame = require("heatshrink").decompress(atob("h8UxH+AAkrAAYKFBolcAAIPIBgYPDBpgfGFIY7EA4YcEBIPWAAYdDC4gLDAII5ECoYOFDogODFgoJCBwYZCAQYOFBAhAFFwZKGHQpMDw+HCQYEBSowOBBQIeJDAQODSwaVHUhwOLfg4FHe4wASA=")); // Mario frame 2
  }

  g.drawImage(frame, x, y);
}

function drawToadFrame(idx, x, y) {
  var frame;

  switch(idx) {
    case 2:
      frame = require("heatshrink").decompress(atob("iEUxH+ACkrAAoNJrnWAAQRGlfWrgACB4QEBCAYOBB44QFB4QICAg4QBBAQbDEgwPCHpAGCGAQ9KAYQPENwoTEH4crw4EDAAgGDB4YABAYIBDP4YLEAAIPHCAQHCCAQTDD4gHDEA4PFGAY3EbooPECob8IPooPFCATGEf44hFAAYLDA==")); // toad jumping
      break;
    case 0:
      frame = require("heatshrink").decompress(atob("iEUxH+ACkHAAoNJrnWAAQRGg/WrgACB4QEBCAYOBB44QFB4QICAg4QBBAQbDEgwPCHpAGCGAQ9KAYQPKCYg/EJAoADAwaKFw4BEP4YQCBIIABB468EB4QADYIoQGDwQOGBYYrCCAwbFFwgQEM4gAEeA4OIH4ghFAAYLD")); // Toad Frame 1
      break;
    case 1:
    default:
      frame = require("heatshrink").decompress(atob("iEUxH+ACkHAAoNJrnWAAQRGg/WrgACB4QEBCAYOBB44QFB4QICAg4QBBAQbDEgwPCHpAGCGAQ9KAYQPKCYg/EJAoADAwaKFw4BEP4YQCBIIABB468EB4QADYIoQGDwQOGBYQrDb4wcGFxYLDMoYgHRYgwKABAMBA")); // Mario frame 2
  }

  g.drawImage(frame, x, y);
}

// Mario speach bubble
function drawNotice(x, y) {
  if (phone.message === null) return;

  let img;
  switch (phone.messageType) {
    case "call":
      img = require("heatshrink").decompress(atob("h8PxH+AAMHABIND6wAJB4INEw9cAAIPFBxAPEBw/WBxYACDrQ7QLI53OSpApDBoQAHB4INLByANNAwo="));
      break;
    case "notify":
      img = require("heatshrink").decompress(atob("h8PxH+AAMHABIND6wAJB4INCrgAHB4QOEDQgOIAIQFGBwovDA4gOGFooOVLJR3OSpApDBoQAHB4INLByANNAwoA="));
      break;
    case "lowBatt":
      img = require("heatshrink").decompress(atob("h8PxH+AAMHABIND6wAJB4INFrgABB4oOEBoQPFBwwDGB0uHAAIOLJRB3OSpApDBoQAHB4INLByANNAwo"));
      break;
  }

  if (img) g.drawImage(img, characterSprite.x, characterSprite.y - 16);
}

function drawCharacter(date, character) {
  "ram"

  // calculate jumping
  const seconds = date.getSeconds(),
    milliseconds = date.getMilliseconds();

  if (seconds == 59 && milliseconds > 800 && !characterSprite.isJumping) {
    characterSprite.isJumping = true;
  }

  if (characterSprite.isJumping) {
    characterSprite.y = (Math.sin(characterSprite.jumpCounter) * -12) + 50 /* Character Y base value */;
    characterSprite.jumpCounter += characterSprite.jumpIncrement;

    if (parseInt(characterSprite.jumpCounter) === 2 && !coinSprite.isAnimating) {
      coinSprite.isAnimating = true;
    }

    if (characterSprite.jumpCounter.toFixed(1) >= 4) {
      characterSprite.jumpCounter = 0;
      characterSprite.isJumping = false;
    }
  }

  // calculate animation timing
  if (timer % 20 === 0) {
    // shift to next frame
    if (characterSprite.isJumping) {
      characterSprite.frameIdx = 2;
    } else {
      characterSprite.frameIdx = characterSprite.frameIdx == 0 ? 1 : 0;
    }
  }

  switch(characterSprite.character) {
    case DAISY:
      drawDaisyFrame(characterSprite.frameIdx, characterSprite.x, characterSprite.y);
      break;
    case TOAD:
      drawToadFrame(characterSprite.frameIdx, characterSprite.x, characterSprite.y);
      break;
    case MARIO:
    default:
      drawMarioFrame(characterSprite.frameIdx, characterSprite.x, characterSprite.y);
  }
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

function buildDateStr(date) {
  let dateStr = locale.date(date, true);
  dateStr = dateStr.replace(date.getFullYear(), "").trim().replace(/\/$/i,"");
  dateStr = locale.dow(date, true) + " " + dateStr;

  return dateStr;
}

function buildBatStr() {
  let batt = parseInt(E.getBattery());
  const battDiff = Math.abs(lastBatt - batt);

  // Suppress flapping values
  // Only update batt if it moves greater than +-2
  if (battDiff > 2) {
    lastBatt = batt;
  } else {
    batt = lastBatt;
  }

  const battStr = `Bat: ${batt}%`;

  return battStr;
}

function buildTempStr() {
  let temp = parseInt(E.getTemperature());
  const tempDiff = Math.abs(lastTemp - temp);

  // Suppress flapping values
  // Only update temp if it moves greater than +-2
  if (tempDiff > 2) {
    lastTemp = temp;
  } else {
    temp = lastTemp;
  }
  const tempStr = `Temp: ${temp}'c`;

  return tempStr;
}

function buildPhonStr() {
  return `Phone: ${phone.status}`;
}

function drawInfo(date) {
  let xPos;
  let str = "";

  if (phone.message !== null) {
    str = phone.message;
    const strLen = g.stringWidth(str);
    if (strLen > W) {
      if (phone.messageScrollX === null || (phone.messageScrollX <= (strLen * -1))) {
        phone.messageScrollX = W;
        resetDisplayTimeout();
      } else {
        phone.messageScrollX -= 2;
      }
      xPos = phone.messageScrollX;
    } else {
      xPos = (W - g.stringWidth(str)) / 2;
    }
  } else {
    switch(infoMode) {
      case PHON_MODE:
        str = buildPhonStr();
        break;
      case TEMP_MODE:
        str = buildTempStr();
        break;
      case BATT_MODE:
        str = buildBatStr();
        break;
      case DATE_MODE:
      default:
        str = buildDateStr(date);
    }
    xPos = (W - g.stringWidth(str)) / 2;
  }

  g.setFont("6x8");
  g.setColor(LIGHTEST);
  g.drawString(str, xPos, 1);
}

function changeInfoMode() {
  phoneClearMessage();

  switch(infoMode) {
    case BATT_MODE:
      infoMode = TEMP_MODE;
      break;
    case TEMP_MODE:
      infoMode = PHON_MODE;
      break;
    case PHON_MODE:
      infoMode = DATE_MODE;
      break;
    case DATE_MODE:
    default:
      infoMode = BATT_MODE;
  }
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
  drawInfo(date);
  drawCharacter(date);
  drawNotice();
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

function loadSettings() {
  const settings = readSettings();
  if (!settings) return;

  if (settings.character) characterSprite.character = settings.character;
  if (settings.nightMode) nightMode = settings.nightMode;
  if (settings.brightness) {
    brightness = settings.brightness;
    Bangle.setLCDBrightness(brightness);
  }
}

function updateSettings() {
  const newSettings = {
    character: characterSprite.character,
    nightMode: nightMode,
    brightness: brightness,
  };
  writeSettings(newSettings);
}

function checkBatteryLevel() {
  if (Bangle.isCharging()) return;
  if (E.getBattery() > 10) return;
  if (phone.message !== null) return;

  phoneNewMessage("lowBatt", "Warning, battery is low");
}

// Main
function init() {
  loadSettings();

  clearInterval();

  // Initialise display
  Bangle.setLCDMode("80x80");

  // Store screen dimensions
  W = g.getWidth();
  H = g.getHeight();

  // Get Mario to jump!
  setWatch(() => {
    if (intervalRef && !characterSprite.isJumping) characterSprite.isJumping = true;
    resetDisplayTimeout();
    phoneClearMessage(); // Clear any phone messages and message timers
  }, BTN3, {repeat: true});

  // Close watch and load launcher app
  setWatch(() => {
    Bangle.setLCDMode();
    Bangle.showLauncher();
  }, BTN2, {repeat: false, edge: "falling"});

  // Change info mode
  setWatch(() => {
    changeInfoMode();
  }, BTN1, {repeat: true});

  Bangle.on('lcdPower', (on) => on ? startTimers() : clearTimers());

  Bangle.on('faceUp', (up) => {
    if (up && !Bangle.isLCDOn()) {
      clearTimers();
      Bangle.setLCDPower(true);
    }
  });

  Bangle.on('swipe', (sDir) => {
    resetDisplayTimeout();

    switch(sDir) {
      // Swipe right (1) - change character (on a loop)
      case 1:
        switchCharacter();
        break;
      // Swipe left (-1) - change day/night mode (on a loop)
      case -1:
      default:
        toggleNightMode();
    }

    updateSettings();
  });

  // Phone connectivity
  try { NRF.wake(); } catch (e) {}

  NRF.on('disconnect', () => {
    phoneNewMessage(null, "Phone disconnected");
  });

  NRF.on('connect', () => {
    setTimeout(() => {
      phoneOutbound({ t: "status", bat: E.getBattery() });
    }, ONE_SECOND * 2);
    phoneNewMessage(null, "Phone connected");
  });

  GB = (evt) => phoneInbound(evt);

  startTimers();

  setInterval(checkBatteryLevel, ONE_SECOND * 60 * 10);
  checkBatteryLevel();
}

// Initialise!
init();

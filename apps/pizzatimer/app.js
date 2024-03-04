/* UI GLOBALS */

//const HOUR_SCENE = 0;
//const MIN_SCENE = 1;
//const SEC_SCENE = 2;
const COUNTDOWN_SCENE = 3;

var currentScene = 0;

//var btn1Watch;
//var btn2Watch;
//var btn3Watch;

var drawInterval;

/* STATE GLOBALS */

var menuTime = new Uint8Array([0,0,0]);
var countdownTime = menuTime.slice(0);
var show = [true, true, true];

/* COUNTDOWN CONSTANTS */

const HOUR_INDEX = 0;
const MIN_INDEX = 1;
const SEC_INDEX = 2;

var flashIndex = HOUR_INDEX;

/* logic */

function setCountdownTime() {
  countdownTime = menuTime.slice(0);
}

function countDownFinished() {
  return countdownTime[HOUR_INDEX] <= 0 &&
         countdownTime[MIN_INDEX] <= 0 &&
         countdownTime[SEC_INDEX] <= 0;
}

function alertCountdownFinished() {
  if (drawInterval) return;
  Bangle.buzz()
    .then(() => new Promise(resolve => setTimeout(resolve, 200)))
    .then(() => Bangle.buzz());
  setTimeout(alertCountdownFinished, 2000);
}

function unsetDrawInterval() {
  clearInterval(drawInterval);
  drawInterval = undefined;
}

function decrementCountdownTime() {
  const allZero = countDownFinished();

  if(allZero) {
    return;
  }

  if (countdownTime[SEC_INDEX] !== 0) {
    countdownTime[SEC_INDEX] = countdownTime[SEC_INDEX] - 1;
    return;
  }

  countdownTime[SEC_INDEX] = 59;

  if (countdownTime[MIN_INDEX] !== 0) {
    countdownTime[MIN_INDEX] = countdownTime[MIN_INDEX] - 1;
    return;
  }

  countdownTime[MIN_INDEX] = 59;

  if (countdownTime[HOUR_INDEX] !== 0) {
    countdownTime[HOUR_INDEX] = countdownTime[HOUR_INDEX] - 1;
    return;
  }
}

function toggleShow(timeIndex) {
  show[timeIndex] = !show[timeIndex];
}

function twoPadded(i) {
  return i.length < 2 ? "0" + i : i;
}

function getTimeString(t) {
  let hour = t[HOUR_INDEX].toString();
  let min = t[MIN_INDEX].toString();
  let sec = t[SEC_INDEX].toString();

  hour = show[HOUR_INDEX] ? twoPadded(hour) : "  ";
  min = show[MIN_INDEX] ? twoPadded(min) : "  ";
  sec = show[SEC_INDEX] ? twoPadded(sec) : "  ";

  return hour + ":" + min + ":" + sec;
}

/* drawing */

/*
  shamelessly stollen from Bluetooth Music Controls
  https://github.com/espruino/BangleApps/blob/6b09377414e02d575b8335bb051c831ecc9da9d9/apps/hidmsic/hid-music.js#L42
*/
function drawArrows() {
  function c(a) {
    return {
      width: 8,
      height: a.length,
      bpp: 1,
      buffer: (new Uint8Array(a)).buffer
    };
  }
  const d = g.getWidth() - 18;
  g.drawImage(c([16,56,124,254,16,16,16,16]),d,40);
  g.drawImage(c([16,16,16,16,254,124,56,16]),d,194);
  g.drawImage(c([0,8,12,14,255,14,12,8]),d,116);
}

function drawTime(input) {
  g.clear();
  g.setFontAlign(0,0);
  g.setFont("4x6",5);
  g.drawString(input, g.getWidth() / 2, g.getHeight() / 2);
}

function drawMenu() {
  const timeString = getTimeString(menuTime);
  drawTime(timeString);
  drawArrows();
}

function drawCountdown() {
  const timeString = getTimeString(countdownTime);
  drawTime(timeString);
}

/* button callbacks */

function getMaxSelectableTime() {
  return flashIndex === HOUR_INDEX ? 23 : 59;
}

/* btn1 */

function incrementMenuTime() {
  const maxTime = getMaxSelectableTime();
  const currentTime = menuTime[flashIndex];
  const newTime = currentTime < maxTime ? currentTime + 1 : 0;
  menuTime[flashIndex] = newTime;
}

/* btn2 */

function incrementScene() {
  currentScene++;
}

function incrementFlashIndex() {
  flashIndex++;
}

function showAll() {
  for(var i = 0; i < show.length; i++) {
    show[i] = true;
  }
}

function showFlashIndex() {
  show[flashIndex] = true;
}

function hideFlashIndex() {
  show[flashIndex] = false;
}

function next() {
  incrementScene();

  if (currentScene === COUNTDOWN_SCENE) {
    showAll();
    startCountdownScene();
  } else {
    showFlashIndex();
    incrementFlashIndex();
    hideFlashIndex();
  }
}

/* btn3 */

function decrementMenuTime() {
  const maxTime = getMaxSelectableTime();
  const currentTime = menuTime[flashIndex];
  const newTime = currentTime > 0 ? currentTime - 1 : maxTime;
  menuTime[flashIndex] = newTime;
}

/* watches */

function setupMenuWatches() {
  clearWatch();
  /*btn1Watch =*/ setWatch(incrementMenuTime, BTN1, {repeat: true});
  /*btn2Watch =*/ setWatch(next, BTN2, {repeat: true});
  /*btn3Watch =*/ setWatch(decrementMenuTime, BTN3, {repeat: true});
}

function setupCountdownWatches() {
  clearWatch();
  /*btn2Watch =*/ setWatch(main, BTN2, {repeat: true});
}

/* scenes */

function menu() {
  drawMenu();
  toggleShow(flashIndex);
}

function countdown() {
  decrementCountdownTime();
  drawCountdown();

  if (countDownFinished()) {
    unsetDrawInterval();
    alertCountdownFinished();
  }
}

/* init */

function unsetDrawInterval() {
  if (!drawInterval) return;
  clearInterval(drawInterval);
  drawInterval = undefined;
}

function startMenuScene() {
  setupMenuWatches();
  unsetDrawInterval();
  menu();
  drawInterval = setInterval(menu, 500);
}

function startCountdownScene() {
  setupCountdownWatches();
  unsetDrawInterval();
  setCountdownTime();
  showAll();
  drawCountdown();
  drawInterval = setInterval(countdown, 1000);
}

/* main */

function reset() {
  currentScene = 0;
  flashIndex = HOUR_INDEX;
  hideFlashIndex();
}

function main() {
  reset();
  startMenuScene();
}

main();

const isB2 = process.env.HWVERSION === 2;

// Bangle.js 1 runs just too fast in direct mode??? (also no getPixel)
if (!isB2) Bangle.setLCDMode("120x120");

const options = Bangle.getOptions();

options.lockTimeout = 0;
options.lcdPowerTimeout = 0;

Bangle.setOptions(options);

g.reset();
g.setBgColor(0, 0, 0);
g.setColor(255, 255, 255);
g.clear();
const h = g.getHeight();

function trigToCoord(ret) {
  return ((ret + 1) * h) / 2;
}

function trigToLen(ret) {
  return (ret * h) / 2;
}

let i = 0.2;
let speedCoef = 0.014;

let flowFile = require("Storage").readJSON("flow.json");

let highestI = (flowFile && flowFile.hiscore) || 0.1;

let colorA = [255, 255, 0];
let colorB = [0, 255, 255];

let x = 0;
let xt = 0;
let safeMode = false;
let lost = false;

function offsetRect(g, x, y, w) {
  g.fillRect(x, y, x + w, y + w);
}

function getColor(num) {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
    [1, 0, 1],
    [0.5, 0.5, 1],
    [1, 0.5, 0],
    [0, 1, 0.5],
    [0.5, 0.5, 0.5],
  ][num];
}

function calculateColor(num) {
  colorA = getColor(Math.floor((num % 1) * 10));
  colorB = getColor(Math.floor((num % 10) - (num % 1)));
}

calculateColor(highestI);

Bangle.on("touch", () => (safeMode = !safeMode));

function resetGame() {
  x = xt = 0;
  safeMode = lost = false;
  i = 0.2;
  speedCoef = 0.014;
  obstaclePeriod = 150;
  obstacleMode = 1;
  g.clear();
  shownScore = false;
  intervalId = setInterval(draw);
}

function checkCollision() {
  lost = g.getPixel(trigToCoord(+x), (h * 2) / 3 - 4) !== 0;
  if (lost) {
    scoringI = i;
    speedCoef = Math.min(speedCoef, 0.02);
    g.setFont(isB2 ? "6x15" : "4x6", 3);
    g.setColor(colorA[0], colorA[1], colorA[2])
      .drawString(
        "Game over",
        trigToCoord(0) - g.stringWidth("Game over") / 2,
        trigToCoord(0)
      )
      .setColor(1, 1, 1);
  }
}

function drawPlayer() {
  if (!safeMode) xt = Math.cos(i * Math.PI * 4) / 7.5;
  else xt = -Math.cos(i * Math.PI * 2) / 20 + 0.35;
  x = x * 0.8 + xt * 0.2;
  if (highestI > 250) calculateColor(i);
  g.setColor(colorA[0], colorA[1], colorA[2]);
  offsetRect(g, trigToCoord(+x), (h * 2) / 3, 3);
  g.setColor(colorB[0], colorB[1], colorB[2]);
  offsetRect(g, trigToCoord(-x), (h * 2) / 3, 3);
}

let obstaclePeriod = 150;
let obstacleMode = 1;

function drawObstracle() {
  g.setColor(1, 1, 1);
  switch (obstacleMode) {
    case 0:
      offsetRect(g, trigToCoord(-0.15), 0, trigToLen(0.3));
      break;
    case 1:
      offsetRect(g, trigToCoord(0.2), 0, trigToLen(0.2));
      offsetRect(g, trigToCoord(-0.4), 0, trigToLen(0.2));
      break;
    case 2:
      break;
  }
  obstaclePeriod--;
  if (obstaclePeriod <= 0) {
    // If we are off cooldown mode, pick a random actual mode
    if (obstacleMode === 2) {
      obstaclePeriod = Math.random() * 50 + 50;
      obstacleMode = Math.round(Math.random());
    } else if (Math.random() > 0.5) {
      // Give it a chance to repeat with no cooldown
      obstaclePeriod = 25 + 2.5 * speedCoef;
      obstacleMode = 2;
    }
  }
}

let shownScore = false;
let scoringI = 0;

function draw() {
  if (!lost) {
    drawPlayer();
    checkCollision();
    speedCoef *= 1.0005;
    drawObstracle();
  } else {
    speedCoef /= 1.05;
    if (speedCoef <= 0.005) {
      clearInterval(intervalId);
      i -= speedCoef;
      g.setFont(isB2 ? "6x15" : "4x6", 1);
      const str = "Hiscore: " + Math.round(highestI * 10);
      g.setColor(
        scoringI > highestI ? 0 : 255,
        0,
        scoringI > highestI ? 255 : 0
      )
        .drawString(
          str,
          trigToCoord(0) - g.stringWidth(str) / 2,
          trigToCoord(0)
        )
        .setColor(255, 255, 255);
      if (scoringI > highestI) {
        highestI = scoringI;
        require("Storage").writeJSON("flow.json", {
          hiscore: highestI,
        });
        calculateColor(highestI);
      }
      setTimeout(resetGame, 3000);
    } else if (speedCoef <= 0.01 && !shownScore) {
      shownScore = true;
      g.setFont(isB2 ? "6x15" : "4x6", 2);
      const str = "Score: " + Math.round(scoringI * 10);
      g.setColor(colorB[0], colorB[1], colorB[2])
        .drawString(
          str,
          trigToCoord(0) - g.stringWidth(str) / 2,
          trigToCoord(0)
        )
        .setColor(1, 1, 1);
    }
  }
  i += speedCoef;
  g.scroll(0, speedCoef * h);
  g.flip();
}

let intervalId;

if (BTN.read()) {
  for (let i = 0; i < 10; i++) {
    const color = getColor(i);
    g.setColor(color[0], color[1], color[2]);
    g.fillRect((i / 10) * h, 0, ((i + 1) / 10) * h, h);
  }
  g.setColor(0);
  g.setFont("Vector", 9);
  let str = "Welcome to the debug screen!";
  g.drawString(
    str,
    trigToCoord(0) - g.stringWidth(str) / 2,
    trigToCoord(0) - 9
  );
  str = "Don't hold BTN while opening to play!";
  g.drawString(str, trigToCoord(0) - g.stringWidth(str) / 2, trigToCoord(0));
  g.flip();
  setInterval(() => {
    g.scroll(0, 0.014 * h);
    i += 0.014;
    calculateColor(i);
    g.setColor(colorA[0], colorA[1], colorA[2]);
    g.fillRect(0, 0, trigToCoord(0), 0.014 * h);
    g.setColor(colorB[0], colorB[1], colorB[2]);
    g.fillRect(trigToCoord(0), 0, trigToCoord(1), 0.014 * h);
  }, 1000 / 30);
} else intervalId = setInterval(draw, 1000 / 30);

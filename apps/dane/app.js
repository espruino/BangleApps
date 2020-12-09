const font = "6x8";
const timeFontSize = 4;
const unixTimeFontSize = 2;
const dateFontSize = 3;
const smallFontSize = 2;
const yOffset = 23;
const width = g.getWidth();
const height = g.getHeight();
const xyCenter = width / 2 + 4;
const cornerSize = 14;
const cornerOffset = 3;
const borderWidth = 1;
const yposTime = 27 + yOffset;
const yposDate = 65 + yOffset + 12;
const yposCounter = 58 + yOffset + 35 + 40;

const mainColor = "#26dafd";
const mainColorDark = "#029dbb";
// const mainColorLight = "#8bebfe";

const secondaryColor = "#df9527";
const secondaryColorDark = "#8b5c15";
// const secondaryColorLight = "#ecc180";

const success = "#00ff00";
// const successDark        = "#000900";
// const successLight        = "#060f06";

const alert = "#ff0000";
// const alertDark          = "#090000";
// const alertLight          = "#0f0606";

let count = 100;
let oldCount = count;



function drawTopLeftCorner(x, y) {
  g.setColor(mainColor);
  const x1 = x - cornerOffset;
  const y1 = y - cornerOffset;
  g.fillRect(x1, y1, x1 + cornerSize, y1 + cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x + cornerSize - cornerOffset, y + cornerSize - cornerOffset);
}

function drawTopRightCorner(x, y) {
  g.setColor(mainColor);
  const x1 = x + cornerOffset;
  const y1 = y - cornerOffset;
  g.fillRect(x1, y1, x1 - cornerSize, y1 + cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x - cornerSize - cornerOffset, y + cornerSize - cornerOffset);
}

function drawBottomLeftCorner(x, y) {
  g.setColor(mainColor);
  const x1 = x - cornerOffset;
  const y1 = y + cornerOffset;
  g.fillRect(x1, y1, x1 + cornerSize, y1 - cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x + cornerSize - cornerOffset, y - cornerSize + cornerOffset);
}

function drawBottomRightCorner(x, y) {
  g.setColor(mainColor);
  const x1 = x + cornerOffset;
  const y1 = y + cornerOffset;
  g.fillRect(x1, y1, x1 - cornerSize, y1 - cornerSize);
  g.setColor("#000000");
  g.fillRect(x, y, x - cornerSize + cornerOffset, y - cornerSize + cornerOffset);
}

function drawFrame(x1, y1, x2, y2) {
  drawTopLeftCorner(x1, y1);
  drawTopRightCorner(x2, y1);
  drawBottomLeftCorner(x1, y2);
  drawBottomRightCorner(x2, y2);
  g.setColor(mainColorDark);
  g.drawRect(x1, y1, x2, y2);
  g.setColor("#000000");
  g.fillRect(x1 + borderWidth, y1 + borderWidth, x2 - borderWidth, y2 - borderWidth);
}

function drawTopFrame(x1, y1, x2, y2) {

  drawBottomLeftCorner(x1, y2);
  drawBottomRightCorner(x2, y2);
  g.setColor(mainColorDark);
  g.drawRect(x1, y1, x2, y2);
  g.setColor("#000000");
  g.fillRect(x1 + borderWidth, y1 + borderWidth, x2 - borderWidth, y2 - borderWidth);
}

function drawFrameNoCorners(x1, y1, x2, y2) {
  g.setColor(mainColorDark);
  g.drawRect(x1, y1, x2, y2);
  g.setColor("#000000");
  g.fillRect(x1 + borderWidth, y1 + borderWidth, x2 - borderWidth, y2 - borderWidth);
}

// function drawBottomFrame(x1,y1,x2,y2) {
//   drawTopLeftCorner(x1,y1);
//   drawTopRightCorner(x2,y1);
//   g.setColor(mainColorDark);
//   g.drawRect(x1,y1,x2,y2);
//   g.setColor("#000000");
//   g.fillRect(x1+borderWidth,y1+borderWidth,x2-borderWidth,y2-borderWidth);
// }

// function getUTCTime(d) {
//   return d.toUTCString().split(' ')[4].split(':').map(function(d){return Number(d);});
// }


function drawTimeText(d) {
  const da = d.toString().split(" ");
  // var dutc = getUTCTime(d);

  const time = da[4].split(":");
  const hours = time[0],
      minutes = time[1],
      seconds = time[2];
  g.setColor(mainColor);
  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}:${seconds}`, xyCenter, yposTime, true);
  const unix = Math.round(d.getTime());

  g.setFont(font, unixTimeFontSize);
  g.setColor(secondaryColor);
  g.drawString(`${unix}`, xyCenter, yposTime + 22, true);
  g.setFont(font, smallFontSize);
}

function drawDateText(d) {
  g.setColor(mainColor);
  g.setFont(font, dateFontSize);
  g.drawString(`${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`, xyCenter, yposDate, true);
}

function drawCounterText() {
  if (count > 255) count = 255;
  if (count < 0) count = 0;
  g.setColor("#000000");
  g.fillRect(37, 58 + yOffset + 36, 203, 58 + 80 + yOffset + 34);
  g.setFontAlign(0, 0);
  g.setColor(alert);
  g.setFont(font, 8);
  g.drawString(`${count}`, xyCenter, yposCounter, true);


}

function levelColor(l) {
  // no icon -> brightest green to indicate charging, even when showing percentage
  if (Bangle.isCharging()) return success;
  if (l >= 50) return success;
  if (l >= 15) return secondaryColorDark;
  return alert;
}

function drawBattery() {
  const l = E.getBattery(), c = levelColor(l);
  count = l;
  const xl = 45 + l * (194 - 46) / 100;
  g.setColor(c).fillRect(46, 58 + 80 + yOffset + 37, xl, height - 5);
}


function drawClock() {
  // main frame
  drawFrame(3, 10 + yOffset, width - 3, height - 3);
  // time frame
  drawTopFrame(20, 10 + yOffset, 220, 58 + yOffset);
  // date frame
  drawTopFrame(28, 58 + yOffset, 212, 58 + yOffset + 35);

  // counter frame
  drawTopFrame(36, 58 + yOffset + 35, 204, 58 + 80 + yOffset + 35);

  // battery frame
  drawFrameNoCorners(44, 58 + 80 + yOffset + 35, 196, height - 3);


  updateClock();

  // const img = makeImg();
  // g.drawImage(img,width/2-(img.width/2),height/2);
}

function updateClock() {
  g.setFontAlign(0, 0);
  const date = new Date();
  drawTimeText(date);
  drawDateText(date);
  drawCounterText();
  drawBattery();
}


Bangle.on('lcdPower', function (on) {
  if (on) drawClock();

});

g.clear();

Bangle.loadWidgets();
Bangle.drawWidgets();

drawClock();


setWatch(Bangle.showLauncher, BTN2, {repeat: false, edge: "falling"});

// setWatch(function () {
//   count++;
//   drawCounterText();
// }, BTN1, {repeat: true, edge: "falling"});
// setWatch(function () {
//   count--;
//   drawCounterText();
// }, BTN3, {repeat: true, edge: "falling"});

// refesh every 100 milliseconds
setInterval(updateClock, 500);



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


// function getImg() {
//   return atob("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");
// }

// function makeImg() {
//   return  {
//     width : 120, height : 120, bpp : 8,
//     transparent : 254,
//     buffer : require("heatshrink").decompress(getImg())
//   }
// }


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



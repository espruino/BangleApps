var d = require("dane_arwes");
var Arwes = d.default();


const font = "6x8";
const timeFontSize = 4;
const unixTimeFontSize = 2;
const dateFontSize = 3;
const smallFontSize = 2;
const yOffset = 23;
const width = g.getWidth();
const height = g.getHeight();
const xyCenter = width / 2 + 4;
const yposTime = 27 + yOffset;
const yposDate = 65 + yOffset + 12;
const yposCounter = 58 + yOffset + 35 + 40;

let count = 100;



function drawTimeText(d) {
  const da = d.toString().split(" ");
  // var dutc = getUTCTime(d);

  const time = da[4].split(":");
  const hours = time[0],
      minutes = time[1],
      seconds = time[2];
  g.setColor(Arwes.C.color.primary.base);
  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}:${seconds}`, xyCenter, yposTime, true);
  const unix = Math.round(d.getTime());

  g.setFont(font, unixTimeFontSize);
  g.setColor(Arwes.C.color.secondary.base);
  g.drawString(`${unix}`, xyCenter, yposTime + 22, true);
  g.setFont(font, smallFontSize);
}

function drawDateText(d) {
  g.setColor(Arwes.C.color.primary.base);
  g.setFont(font, dateFontSize);
  g.drawString(`${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`, xyCenter, yposDate, true);
}

function drawCounterText() {
  if (count > 255) count = 255;
  if (count < 0) count = 0;
  g.setColor("#000000");
  g.fillRect(37, 58 + yOffset + 36, 203, 58 + 80 + yOffset + 34);
  g.setFontAlign(0, 0);
  g.setColor(Arwes.C.color.alert.base);
  g.setFont(font, 8);
  g.drawString(`${count}`, xyCenter, yposCounter, true);


}

function levelColor(l) {
  // no icon -> brightest green to indicate charging, even when showing percentage
  if (Bangle.isCharging()) return Arwes.C.color.success.base;
  if (l >= 50) return Arwes.C.color.success.base;
  if (l >= 15) return Arwes.C.color.secondary.dark;
  return Arwes.C.color.alert.base;
}

function drawBattery() {
  const l = E.getBattery(), c = levelColor(l);
  // count = l;
  const xl = 45 + l * (194 - 46) / 100;
  g.clearRect(46, 58 + 80 + yOffset + 37, 193, height - 5);
  g.setColor(c).fillRect(46, 58 + 80 + yOffset + 37, xl, height - 5);
}

function updateCounter() {
  drawBattery();
  drawCounterText();
}

function drawClock() {
  // main frame
  Arwes.drawFrame(3, 10 + yOffset, width - 3, height - 3);
  // time frame
  Arwes.drawFrameBottomCorners(20, 10 + yOffset, 220, 58 + yOffset);
  // date frame
  Arwes.drawFrameBottomCorners(28, 58 + yOffset, 212, 58 + yOffset + 35);

  // counter frame
  Arwes.drawFrameBottomCorners(36, 58 + yOffset + 35, 204, 58 + 80 + yOffset + 35);

  // battery frame
  Arwes.drawFrameNoCorners(44, 58 + 80 + yOffset + 35, 196, height - 3);


  updateCounter();
  updateClock();

  // const img = makeImg();
  // g.drawImage(img,width/2-(img.width/2),height/2);
}

function updateClock() {
  g.setFontAlign(0, 0);
  const date = new Date();
  drawTimeText(date);
  drawDateText(date);

}


Bangle.on('lcdPower', function (on) {
  if (on) drawClock();

});

g.clear();

Bangle.loadWidgets();
Bangle.drawWidgets();

drawClock();


setWatch(Bangle.showLauncher, BTN2, {repeat: false, edge: "falling"});

setWatch(function () {
  count++;
  drawCounterText();
}, BTN1, {repeat: true, edge: "falling"});
setWatch(function () {
  count--;
  drawCounterText();
}, BTN3, {repeat: true, edge: "falling"});

// refesh every 100 milliseconds
setInterval(updateClock, 500);
setInterval(updateCounter, 1000);



const bigFont = 4;
const smallFont = 2;
const tinyFont = 1;
const green = "#0d1";
const darkGreen = "#091";
const darkerGreen = "#051";
const pip = require("heatshrink").decompress(atob("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"));

function isLeapYear(year)
{
  return !((year % 4) && (year % 100) || !(year % 400));
}

function topLine() {

  g.setColor(green);
  g.setFontAlign(0, -1, 0);

  g.moveTo(0, 50).lineTo(30, 50);
  g.lineTo(30, 40);
  g.lineTo(35, 40).moveTo(90, 40).lineTo(95, 40);
  g.lineTo(95, 50);
  g.lineTo(239, 50);

  g.setFont("6x8", smallFont);
  g.drawString("STAT", 65, 34);
  g.drawString("INV", 130, 34);
  g.drawString("DATA", 190, 34);
  g.setColor(darkGreen);
  g.drawString("STATUS", 45, 55);
  g.drawString("SPEC", 122, 55);
  g.drawString("PERKS", 195, 55);
}

function bottomLine() {
  var today = new Date();
  var yy = today.getFullYear();
  var day = today.getDay(); //day of week as number
  var h = today.getHours();

  var startDate = new Date(yy, 0, 0);
  var oneDay = 1000 * 60 * 60 * 24;
  var daysInYear = 0;
  var diff = today - startDate;
  var currDayInYear = Math.floor(diff / oneDay);

  if (isLeapYear(yy)) daysInYear = 366;
  else daysInYear = 365;

  g.setFont("6x8", tinyFont);

  //first line
  g.setColor(darkerGreen);
  g.fillRect(5, 175, 100, 185); //DATE
  g.fillRect(105, 175, 160, 185);//STIM
  g.fillRect(166, 175, 239, 185); // RADAWAY
  g.setColor(green);

  g.drawString("DATE", 20, 177);
  g.drawString("STIM (3)", 135, 177);
  g.drawString("RADAWAY (8)", 205, 177);

  //second line
  g.setColor(darkerGreen);
  g.fillRect(5, 190, 70, 200);
  g.fillRect(75, 190, 239, 200);

  g.setColor(green);
  g.drawString("HP "+ currDayInYear + "/"+ daysInYear, 38, 192);
  g.drawString("LEVEL " + day, 100, 192); //show week day
  g.drawRect(127, 192, 235, 198); //frame
  g.fillRect(128, 193, 128 + ((107/24)*h), 197); //progress bar showing progress of day
}

function boy() {
  g.drawImage(pip, 165, 85);
}

function drawClock() {
  var t = new Date();
  var h = t.getHours();
  var m = t.getMinutes();
  var dd = t.getDate();
  var mm = t.getMonth()+1; //month is zero-based
  var yy = t.getFullYear();
  var time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);

  //create date string
  if (dd.toString().length < 2) dd = '0' + dd;
  if (mm.toString().length < 2) mm = '0' + mm;
  var date = dd + "." + mm + "." + yy;

  g.setFont("6x8",bigFont);
  g.setColor(green);
  g.setFontAlign(0, -1, 0);

  g.clearRect(0, 110, 150, 140);
  g.drawString(time, 70, 110);

  //draw date
  g.setFont("6x8", tinyFont);
  g.drawString(date, 67, 177);
}

function drawAll() {
  topLine();
  boy();
  bottomLine();
  drawClock();
}

Bangle.on('lcdPower', function(on) {
  if (on) drawAll();
});

g.clear();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
setInterval(drawClock, 1E4);
drawAll();

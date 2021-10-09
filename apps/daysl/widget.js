const storage = require('Storage');
let settings;
let height = 23;
let width = 34;

var debug = 0; //1 = show debug info

//write settings to file
function updateSettings() {
  storage.write('daysleft.json', settings);
}

//Define standard settings
function resetSettings() {
  settings = {
    day : 17,
    month : 6,
    year: 2020
  };
  updateSettings();
}

settings = storage.readJSON('daysleft.json',1); //read storage
if (!settings) resetSettings(); //if settings file was not found, set to standard

var dd = settings.day,
  mm = settings.month-1, //-1 because month is zero-based
  yy = settings.year;

const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
const targetDate = new Date(yy, mm, dd); //is 00:00
const today = new Date(); //includes current time

const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDay = today.getDate();
const todayMorning = new Date (currentYear, currentMonth, currentDay, 0, 0, 0); //create date object with today, but 00:00:00

const diffDays = (targetDate - todayMorning) / oneDay; //calculate day difference

function drawWidget() {
  if (debug == 1) g.drawRect(this.x,this.y,this.x+width,this.y+height); //draw rectangle around widget area
  g.reset();

  //define font size and string position
  //small if number has more than 3 digits (positive number)
  if (diffDays >= 1000) {
    g.setFont("6x8", 1);
    g.drawString(diffDays,this.x+10,this.y+7);
  }
  //large if number has 3 digits (positive number)
  if (diffDays <= 999 && diffDays >= 100) {
    g.setFont("6x8", 2);
    g.drawString(diffDays,this.x,this.y+4);
  }
  //large if number has 2 digits (positive number)
  if (diffDays <= 99 && diffDays >= 10) {
    g.setFont("6x8", 2);
    g.drawString(diffDays,this.x+6,this.y+4);
  }
  //large if number has 1 digit (positive number)
  if (diffDays <= 9 && diffDays >= 0) {
    g.setFont("6x8", 2);
    g.drawString(diffDays,this.x+13,this.y+4);
  }
  //large if number has 1 digit (negative number)
  if (diffDays <= -1 && diffDays >= -9) {
    g.setFont("6x8", 2);
    g.drawString(diffDays,this.x+5,this.y+4);
  }
  //large if number has 2 digits (negative number)
  if (diffDays <= -10 && diffDays >= -99) {
    g.setFont("6x8", 2);
    g.drawString(diffDays,this.x,this.y+4);
  }
  //large if number has 3 digits or more (negative number)
  if (diffDays <= -100) {
    g.setFont("6x8", 1);
    g.drawString(diffDays,this.x,this.y+7);
  }
}

//draw widget
WIDGETS["daysl"]={area:"tl",width:width,draw:drawWidget};
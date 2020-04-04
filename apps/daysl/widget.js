const storage = require('Storage');
let settings;

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

//draw widget
WIDGETS["daysl"]={area:"tl",width:40,draw:function(){
  g.setFont("6x8", 1);
  g.drawString(diffDays,this.x+12,this.y+12);
}};
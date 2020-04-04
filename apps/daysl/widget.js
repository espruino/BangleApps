const storage = require('Storage');
let settings;
var dd = settings.day,
    mm = settings.month-1, //-1 because month is zero-based
    yy = settings.year;

//update file
function updateSettings() {
    storage.write('daysleft.json', settings);
  }

//set standard settings
function resetSettings() {
  settings = {
    day : 17,
    month : 6,
    year: 2020
  };
  updateSettings(); //update file
}

settings = storage.readJSON('daysleft.json',1); //read file
if (!settings) resetSettings(); //if file does not exist, reset settings

const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
const targetDate = new Date(yy, mm, dd); //time is 00:00 then
const today = new Date();

//create date object with today, but 00:00:00
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDay = today.getDate();
const todayMorning = new Date (currentYear, currentMonth, currentDay, 0, 0, 0); //set time to 00:00

const diffDays = (targetDate - todayMorning) / oneDay; //calculate difference of days

//draw widget
WIDGETS["daysl"]={area:"tl",width:40,draw:function(){
  g.setFont("6x8", 1);
  g.drawString(diffDays,this.x+12,this.y+12);
}};
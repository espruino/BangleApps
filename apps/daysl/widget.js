const storage = require('Storage');
let settings;

function updateSettings() {
    storage.write('daysleft.json', settings);
  }

  function resetSettings() {
    settings = {
      day : 17,
      month : 6,
      year: 2020
    };
    updateSettings();
  }

  settings = storage.readJSON('daysleft.json',1);
  if (!settings) resetSettings();

  var dd = settings.day,
      mm = settings.month-1, //month is zero-based
      yy = settings.year;

  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const targetDate = new Date(yy, mm, dd, 23, 59, 59);
  const today = new Date();
  const diffDays = Math.round(Math.abs((targetDate - today) / oneDay));

WIDGETS["daysl"]={area:"tl",width:40,draw:function(){
  g.setFont("6x8", 1);
  g.drawString(diffDays,this.x+12,this.y+12);
}};
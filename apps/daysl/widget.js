const storage = require('Storage');
let settings;

function updateSettings() {
    storage.write('daysleft.json', settings);
  }
  
  function resetSettings() {
    settings = {
      day : 17,
      month : 6,
      year: 1981
    };
    updateSettings();
  }

  settings = storage.readJSON('daysleft.json',1);
  if (!settings) resetSettings();

  var dd = settings.day+1,
      mm = settings.month-1,
      yy = settings.year;

  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const targetDate = new Date(yy, mm, dd);
  const today = new Date();
  const diffDays = Math.round(Math.abs((targetDate - today) / oneDay));

WIDGETS["daysl"]={area:"tl",width:40,draw:function(){

  g.setFont("6x8", 1);
  g.drawString(diffDays,this.x+12,this.y+12);
}};
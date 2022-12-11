g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

const storage = require('Storage');
let settingsChronowid;

function updateSettings() {
  var now = new Date();
  const goal = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
    now.getHours() + settingsChronowid.hours, now.getMinutes() + settingsChronowid.minutes, now.getSeconds() + settingsChronowid.seconds);
  settingsChronowid.goal = goal.getTime();
  storage.writeJSON('chronowid.json', settingsChronowid);
  if (WIDGETS["chronowid"]) WIDGETS["chronowid"].reload();
}

function resetSettings() {
  settingsChronowid = {
    hours : 0,
    minutes : 0,
    seconds : 0,
    started : false,
    counter : 0,
    goal : 0,
  };
  updateSettings();
}

settingsChronowid = storage.readJSON('chronowid.json',1);
if (!settingsChronowid) resetSettings();

E.on('kill', () => {
  updateSettings();
});

function showMenu() {
  const timerMenu = {
    '': {
      'title': 'Set timer'
    },
    '< Back' :  ()=>{load();},
    'Reset values': function() {
      settingsChronowid.hours = 0;
      settingsChronowid.minutes = 0;
      settingsChronowid.seconds = 0;
      settingsChronowid.started = false;
      updateSettings();
      showMenu();
    },
    'Hours': {
      value: settingsChronowid.hours,
      min: 0,
      max: 24,
      step: 1,
      onchange: v => {
        settingsChronowid.hours = v;
        updateSettings();
      }
    },
    'Minutes': {
      value: settingsChronowid.minutes,
      min: 0,
      max: 59,
      step: 1,
      onchange: v => {
        settingsChronowid.minutes = v;
        updateSettings();
      }
    },
    'Seconds': {
      value: settingsChronowid.seconds,
      min: 0,
      max: 59,
      step: 1,
      onchange: v => {
        settingsChronowid.seconds = v;
        updateSettings();
      }
    },
    'Timer on': {
      value: settingsChronowid.started,
      onchange: v => {
        settingsChronowid.started = v;
        updateSettings();
      }
    },
  };

  return E.showMenu(timerMenu);
}

showMenu();

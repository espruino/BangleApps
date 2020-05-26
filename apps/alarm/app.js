const locale = require("locale");
Bangle.loadWidgets();
Bangle.drawWidgets();

var alarms = require("Storage").readJSON("alarm.json",1)||[];
/*alarms = [
  { on : true,
    hr : 6.5, // hours + minutes/60
    msg : "Eat chocolate",
    last : 0, // last day of the month we alarmed on - so we don't alarm twice in one day!
    rp : true, // repeat
  }
];*/

function formatTime(t) {
  var hrs = 0|t;
  var mins = Math.round((t-hrs)*60);
  var d = new Date();
  d.setHours(hrs);
  d.setMinutes(mins);
  return locale.time(d, true);
}

function getCurrentHr() {
  var time = new Date();
  return time.getHours()+(time.getMinutes()/60)+(time.getSeconds()/3600);
}

function showMainMenu() {
  const menu = {
    '': { 'title': 'Alarms'/*LANG*/ },
    'New Alarm'/*LANG*/: ()=>editAlarm(-1)
  };
  alarms.forEach((alarm,idx)=>{
    txt = alarm.on?locale.translate("On"):locale.translate("Off");
    txt += " ".repeat(Math.max(locale.translate("On").length,locale.translate("Off").length) - txt.length);
    txt += " " + formatTime(alarm.hr);
    if (alarm.rp) txt += " (" + "rpt"/*LANG*/ + ")";
    menu[txt] = function() {
      editAlarm(idx);
    };
  });
  menu['< ' + 'Back'/*LANG*/] =  ()=>{load();};
  return E.showMenu(menu);
}

function editAlarm(alarmIndex) {
  var newAlarm = alarmIndex<0;
  var hrs = 12;
  var mins = 0;
  var en = true;
  var repeat = true;
  if (!newAlarm) {
    var a = alarms[alarmIndex];
    hrs = 0|a.hr;
    mins = Math.round((a.hr-hrs)*60);
    en = a.on;
    repeat = a.rp;
  }
  const menu = {
    '': { 'title': 'Alarms'/*LANG*/ },
    'Hours'/*LANG*/: {
      value: hrs,
      onchange: function(v){if (v<0)v=23;if (v>23)v=0;hrs=v;this.value=v;} // no arrow fn -> preserve 'this'
    },
    'Minutes'/*LANG*/: {
      value: mins,
      onchange: function(v){if (v<0)v=59;if (v>59)v=0;mins=v;this.value=v;} // no arrow fn -> preserve 'this'
    },
    'Enabled'/*LANG*/: {
      value: en,
      format: v=>v?"On":"Off",
      onchange: v=>en=v
    },
    'Repeat'/*LANG*/: {
      value: en,
      format: v=>v?"Yes":"No",
      onchange: v=>repeat=v
    }
  };
  function getAlarm() {
    var hr = hrs+(mins/60);
    var day = 0;
    // If alarm is for tomorrow not today (eg, in the past), set day
    if (hr < getCurrentHr())
      day = (new Date()).getDate();
    // Save alarm
    return {
      on : en, hr : hr,
      last : day, rp : repeat
    };
  }
  menu["> " + "Save"/*LANG*/] = function() {
    if (newAlarm) alarms.push(getAlarm());
    else alarms[alarmIndex] = getAlarm();
    require("Storage").write("alarm.json",JSON.stringify(alarms));
    showMainMenu();
  };
  if (!newAlarm) {
    menu["> " + "Delete"/*LANG*/] = function() {
      alarms.splice(alarmIndex,1);
      require("Storage").write("alarm.json",JSON.stringify(alarms));
      showMainMenu();
    };
  }
  menu['< ' + 'Back'/*LANG*/] = showMainMenu;
  return E.showMenu(menu);
}

showMainMenu();

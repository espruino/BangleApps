Bangle.loadWidgets();
Bangle.drawWidgets();

var alarms = require("Storage").readJSON("hardalarm.json",1)||[];
/*alarms = [
  { on : true,
    hr : 6.5, // hours + minutes/60
    msg : "Eat chocolate",
    last : 0, // last day of the month we alarmed on - so we don't alarm twice in one day!
    rp : true, // repeat
    as : false, // auto snooze
  }
];*/

function formatTime(t) {
  var hrs = 0|t;
  var mins = Math.round((t-hrs)*60);
  return hrs+":"+("0"+mins).substr(-2);
}

function getCurrentHr() {
  var time = new Date();
  return time.getHours()+(time.getMinutes()/60)+(time.getSeconds()/3600);
}

function showMainMenu() {
  const menu = {
    '': { 'title': 'Alarms' },
    'New Alarm': ()=>editAlarm(-1)
  };
  alarms.forEach((alarm,idx)=>{
    txt = (alarm.on?"on  ":"off ")+formatTime(alarm.hr);
    if (alarm.rp) txt += " (repeat)";
    menu[txt] = function() {
      editAlarm(idx);
    };
  });
  menu['< Back'] =  ()=>{load();};
  return E.showMenu(menu);
}

function editAlarm(alarmIndex) {
  var newAlarm = alarmIndex<0;
  var hrs = 12;
  var mins = 0;
  var en = true;
  var repeat = true;
  var as = false;
  if (!newAlarm) {
    var a = alarms[alarmIndex];
    hrs = 0|a.hr;
    mins = Math.round((a.hr-hrs)*60);
    en = a.on;
    repeat = a.rp;
    as = a.as;
  }
  const menu = {
    '': { 'title': 'Alarms' },
    'Hours': {
      value: hrs,
      onchange: function(v){if (v<0)v=23;if (v>23)v=0;hrs=v;this.value=v;} // no arrow fn -> preserve 'this'
    },
    'Minutes': {
      value: mins,
      onchange: function(v){if (v<0)v=59;if (v>59)v=0;mins=v;this.value=v;} // no arrow fn -> preserve 'this'
    },
    'Enabled': {
      value: en,
      format: v=>v?"On":"Off",
      onchange: v=>en=v
    },
    'Repeat': {
      value: en,
      format: v=>v?"Yes":"No",
      onchange: v=>repeat=v
    },
    'Auto snooze': {
      value: as,
      format: v=>v?"Yes":"No",
      onchange: v=>as=v
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
      last : day, rp : repeat, as: as
    };
  }
  menu["> Save"] = function() {
    if (newAlarm) alarms.push(getAlarm());
    else alarms[alarmIndex] = getAlarm();
    require("Storage").write("hardalarm.json",JSON.stringify(alarms));
    showMainMenu();
  };
  if (!newAlarm) {
    menu["> Delete"] = function() {
      alarms.splice(alarmIndex,1);
      require("Storage").write("hardalarm.json",JSON.stringify(alarms));
      showMainMenu();
    };
  }
  menu['< Back'] = showMainMenu;
  return E.showMenu(menu);
}

showMainMenu();

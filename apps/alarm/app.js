Bangle.loadWidgets();
Bangle.drawWidgets();

var alarms = require("Storage").readJSON("@alarm")||[];
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
  var mins = 0|((t-hrs)*60);
  return hrs+":"+("0"+mins).substr(-2);
}

function getCurrentHr() {
  var time = new Date();
  return time.getHours()+(time.getMinutes()/60);
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
  if (!newAlarm) {
    var a = alarms[alarmIndex];
    hrs = 0|a.hr;
    mins = 0|((a.hr-hrs)*60);
    en = a.on;
    repeat = a.rp;
  }
  const menu = {
    '': { 'title': 'Alarms' },
    'Hours': {
      value: hrs,
      min: 0,
      max: 23,
      onchange: v=>hrs=v
    },
    'Minutes': {
      value: mins,
      min: 0,
      max: 60,
      onchange: v=>mins=v
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
    }
  };
  function getAlarm() {
    var hr = hrs+(mins/60);
    var day = 0;
    // If alarm is for tomorrow not today, set day
    if (hr > getCurrentHr())
      day = (new Date()).getDate();
    // Save alarm
    return {
      on : en, hr : hr,
      last : day, rp : repeat
    };
  }
  if (newAlarm) {
    menu["> New Alarm"] = function() {
      alarms.push(getAlarm());
      require("Storage").write("@alarm",JSON.stringify(alarms));
      showMainMenu();
    };
  } else {
    menu["> Save"] = function() {
      alarms[alarmIndex] = getAlarm();
      require("Storage").write("@alarm",JSON.stringify(alarms));
      showMainMenu();
    };
  }
  menu['< Back'] = showMainMenu;
  return E.showMenu(menu);
}

function showAlarm(alarm) {
  var msg = formatTime(alarm.hr);
  var buzzCount = 10;
  if (alarm.msg)
    msg += "\n"+alarm.msg;
  E.showPrompt(msg,{
    title:"ALARM!",
    buttons : {"Sleep":true,"Ok":false} // default is sleep so it'll come back in 10 mins
  }).then(function(sleep) {
    buzzCount = 0;
    if (sleep) {
      alarm.hr += 10/60; // 10 minutes
    } else {
      alarm.last = (new Date()).getDate();
      if (!alarm.rp) alarm.on = false;
    }
    require("Storage").write("@alarm",JSON.stringify(alarms));
    load();
  });
  function buzz() {
    Bangle.buzz(100).then(()=>{
      setTimeout(()=>{
        Bangle.buzz(100).then(function() {
          if (buzzCount--)
            setTimeout(buzz, 3000);
        });
      },100);
    });
  }
  buzz();
}

// Check for alarms
var day = (new Date()).getDate();
var hr = getCurrentHr();
var active = alarms.filter(a=>a.on&&(a.hr<hr)&&(a.last!=day));
if (active.length) {
  // if there's an alarm, show it
  active = active.sort((a,b)=>a.hr-b.hr);
  showAlarm(active[0]);
} else {
  // otherwise show the main menu
  showMainMenu();
}

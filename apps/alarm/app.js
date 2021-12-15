Bangle.loadWidgets();
Bangle.drawWidgets();

var alarms = require("Storage").readJSON("alarm.json",1)||[];
/*alarms = [
  { on : true,
    hr : 6.5, // hours + minutes/60
    msg : "Eat chocolate",
    last : 0, // last day of the month we alarmed on - so we don't alarm twice in one day!
    rp : true, // repeat
    as : false, // auto snooze
    timer : 5, // OPTIONAL - if set, this is a timer and it's the time in minutes
  }
];*/

function formatTime(t) {
  var hrs = 0|t;
  var mins = Math.round((t-hrs)*60);
  return hrs+":"+("0"+mins).substr(-2);
}

function formatMins(t) {
  mins = (0|t)%60;
  hrs = 0|(t/60);
  return hrs+":"+("0"+mins).substr(-2);
}

function getCurrentHr() {
  var time = new Date();
  return time.getHours()+(time.getMinutes()/60)+(time.getSeconds()/3600);
}

function showMainMenu() {
  const menu = {
    '': { 'title': 'Alarm/Timer' },
    /*LANG*/'< Back' : ()=>{load();},
    /*LANG*/'New Alarm': ()=>editAlarm(-1),
    /*LANG*/'New Timer': ()=>editTimer(-1)
  };
  alarms.forEach((alarm,idx)=>{
    if (alarm.timer) {
      txt = /*LANG*/"TIMER "+(alarm.on?/*LANG*/"on  ":/*LANG*/"off ")+formatMins(alarm.timer);
    } else {
      txt = /*LANG*/"ALARM "+(alarm.on?/*LANG*/"on  ":/*LANG*/"off ")+formatTime(alarm.hr);
      if (alarm.rp) txt += /*LANG*/" (repeat)";
    }
    menu[txt] = function() {
      if (alarm.timer) editTimer(idx);
      else editAlarm(idx);
    };
  });

  if (WIDGETS["alarm"]) WIDGETS["alarm"].reload();
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
    '': { 'title': /*LANG*/'Alarm' },
    /*LANG*/'< Back' : showMainMenu,
    /*LANG*/'Hours': {
      value: hrs,
      onchange: function(v){if (v<0)v=23;if (v>23)v=0;hrs=v;this.value=v;} // no arrow fn -> preserve 'this'
    },
    /*LANG*/'Minutes': {
      value: mins,
      onchange: function(v){if (v<0)v=59;if (v>59)v=0;mins=v;this.value=v;} // no arrow fn -> preserve 'this'
    },
    /*LANG*/'Enabled': {
      value: en,
      format: v=>v?"On":"Off",
      onchange: v=>en=v
    },
    /*LANG*/'Repeat': {
      value: en,
      format: v=>v?"Yes":"No",
      onchange: v=>repeat=v
    },
    /*LANG*/'Auto snooze': {
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
  menu[/*LANG*/"> Save"] = function() {
    if (newAlarm) alarms.push(getAlarm());
    else alarms[alarmIndex] = getAlarm();
    require("Storage").write("alarm.json",JSON.stringify(alarms));
    showMainMenu();
  };
  if (!newAlarm) {
    menu[/*LANG*/"> Delete"] = function() {
      alarms.splice(alarmIndex,1);
      require("Storage").write("alarm.json",JSON.stringify(alarms));
      showMainMenu();
    };
  }
  return E.showMenu(menu);
}

function editTimer(alarmIndex) {
  var newAlarm = alarmIndex<0;
  var hrs = 0;
  var mins = 5;
  var en = true;
  if (!newAlarm) {
    var a = alarms[alarmIndex];
    mins = (0|a.timer)%60;
    hrs = 0|(a.timer/60);
    en = a.on;
  }
  const menu = {
    '': { 'title': /*LANG*/'Timer' },
    /*LANG*/'Hours': {
      value: hrs,
      onchange: function(v){if (v<0)v=23;if (v>23)v=0;hrs=v;this.value=v;} // no arrow fn -> preserve 'this'
    },
    /*LANG*/'Minutes': {
      value: mins,
      onchange: function(v){if (v<0)v=59;if (v>59)v=0;mins=v;this.value=v;} // no arrow fn -> preserve 'this'
    },
    /*LANG*/'Enabled': {
      value: en,
      format: v=>v?/*LANG*/"On":/*LANG*/"Off",
      onchange: v=>en=v
    }
  };
  function getTimer() {
    var d = new Date(Date.now() + ((hrs*60)+mins)*60000);
    var hr = d.getHours() + (d.getMinutes()/60) + (d.getSeconds()/3600);
    // Save alarm
    return {
      on : en,
      timer : (hrs*60)+mins,
      hr : hr,
      rp : false, as: false
    };
  }
  menu["> Save"] = function() {
    if (newAlarm) alarms.push(getTimer());
    else alarms[alarmIndex] = getTimer();
    require("Storage").write("alarm.json",JSON.stringify(alarms));
    showMainMenu();
  };
  if (!newAlarm) {
    menu["> Delete"] = function() {
      alarms.splice(alarmIndex,1);
      require("Storage").write("alarm.json",JSON.stringify(alarms));
      showMainMenu();
    };
  }
  return E.showMenu(menu);
}

showMainMenu();

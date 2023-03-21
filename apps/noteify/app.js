Bangle.loadWidgets();
Bangle.drawWidgets();

var notes = require("Storage").readJSON("noteify.json", true) || [];
var alarms = require("sched").getAlarms();
msg = "";

function startNote(idx) {
  idx == undefined ? note = "" : note = notes[idx].note;
  require("textinput").input({text:note}).then(result => {
  if (result != "") {
    idx == undefined ? notes.push({"note" : result}) : notes[idx].note = result;
    require("Storage").write("noteify.json",JSON.stringify(notes));
  }
  showMainMenu();
  });
}

function viewNote(idx) {
  var textY = 30;
  var textBound = g.stringMetrics(g.setColor(g.theme.fg).setFont("6x8:2").setFontAlign(-1, -1).drawString(g.wrapString(notes[idx].note, g.getWidth()).join("\n"), 0, textY)).height;
  Bangle.setUI({mode:"custom", drag:e=>{
    textY += e.dy;
    g.setClipRect(0, 30, g.getWidth(), g.getHeight());
    if (textY > 30) textY = 30;
    if (textY < textBound) textY = textBound;
    g.clearRect(0, 30, g.getWidth(), g.getHeight()).setColor(g.theme.fg).setFont("6x8:2").setFontAlign(-1, -1).drawString(g.wrapString(notes[idx].note, g.getWidth()).join("\n"), 0, textY);
  },back:()=>{
      Bangle.setUI();
      showEditMenu(idx);
  }});

}

function showMainMenu() {
  var mainMenu = {
    "" : { "title" : "Noteify" },
    "< Back" : function() { load(); },
    "New note" : function() {
      E.showMenu();
      startNote();
    },
    "Edit alarms/timers" : function() { showAlarmMenu(); },
  };

  notes.forEach((a, idx) => {
    mainMenu[notes[idx].note.length > 12 ? notes[idx].note.substring(0, 12)+"..." : notes[idx].note] = function () { showEditMenu(idx);};
  });
  msg = "";
  E.showMenu(mainMenu);
}

function showEditMenu(idx) {
  var moveNote = notes[idx].note;
  var editMenu = {
    "" : { "title" : notes[idx].note.length > 12 ? notes[idx].note.replace(/\n/g, " ").substring(0, 12)+"..." : notes[idx].note.replace(/\n/g, " ") },
    "View note" : function() {
      E.showMenu();
      viewNote(idx);
    },
    "Edit note" : function() {
      E.showMenu();
      startNote(idx);
    },
    "Delete note" : function() {
      notes.splice(idx,1);
      require("Storage").write("noteify.json",JSON.stringify(notes));
      showMainMenu();
    },
    "Set as alarm" : function() {
      //limit alarm msg to 30 chars
      msg = moveNote.substring(0, 30);
      editAlarm(-1);
    },
    "Set as timer" : function () {
      msg = moveNote.substring(0, 30);
      editTimer(-1);
    },
    "Change position" : {
      value : idx+1,
      min : 1,
      max : notes.length,
      wrap : true,
      onchange : function(v) {
        //save changes from change position
        if (v-1 != idx) {
          notes.splice(v-1, 0, notes.splice(idx, 1)[0]);
          require("Storage").write("noteify.json",JSON.stringify(notes));
        }
      },
    },
    "< Back" : function() {
      showMainMenu();
    },
  };
  E.showMenu(editMenu);
}

function decodeTime(t) {
  t = 0|t; // sanitise
  var hrs = 0|(t/3600000);
  return { hrs : hrs, mins : Math.round((t-hrs*3600000)/60000) };
}

// time in { hrs, mins } -> ms
function encodeTime(o) {
  return o.hrs*3600000 + o.mins*60000;
}

function formatTime(t) {
  var o = decodeTime(t);
  return o.hrs+":"+("0"+o.mins).substr(-2);
}

function getCurrentTime() {
  var time = new Date();
  return (
    time.getHours() * 3600000 +
    time.getMinutes() * 60000 +
    time.getSeconds() * 1000
  );
}

function saveAndReload() {
  require("sched").setAlarms(alarms);
  require("sched").reload();
}

function showAlarmMenu() {
  const menu = {
    '': { 'title': 'Alarm/Timer' },
    '< Back' : ()=>{showMainMenu();},
    'New Alarm': ()=>editAlarm(-1),
    'New Timer': ()=>editTimer(-1)
  };
  alarms.forEach((alarm,idx)=>{
    var type,txt; // a leading space is currently required (JS error in Espruino 2v12)
    if (alarm.timer) {
      type = /*LANG*/"Timer";
      txt = " "+formatTime(alarm.timer);
    } else {
      type = /*LANG*/"Alarm";
      txt = " "+formatTime(alarm.t);
    }
    if (alarm.rp) txt += "\0"+atob("FBaBAAABgAAcAAHn//////wAHsABzAAYwAAMAADAAAAAAwAAMAADGAAzgAN4AD//////54AAOAABgAA=");
    // rename duplicate alarms
    if (menu[type+txt]) {
      var n = 2;
      while (menu[type+" "+n+txt]) n++;
      txt = type+" "+n+txt;
    } else txt = type+txt;
    // add to menu
    menu[txt] = {
      value : "\0"+atob(alarm.on?"EhKBAH//v/////////////5//x//j//H+eP+Mf/A//h//z//////////3//g":"EhKBAH//v//8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA///3//g"),
      onchange : function() {
        if (alarm.timer) editTimer(idx, alarm);
        else editAlarm(idx, alarm);
      }
    };
  });
  if (WIDGETS["alarm"]) WIDGETS["alarm"].reload();
  return E.showMenu(menu);
}

function editDOW(dow, onchange) {
  const menu = {
    '': { 'title': 'Days of Week' },
    '< Back' : () => onchange(dow)
  };
  for (var i = 0; i < 7; i++) (i => {
    var dayOfWeek = require("locale").dow({ getDay: () => i });
    menu[dayOfWeek] = {
      value: !!(dow&(1<<i)),
      onchange: v => v ? dow |= 1<<i : dow &= ~(1<<i),
    };
  })(i);
  E.showMenu(menu);
}

function editAlarm(alarmIndex, alarm) {
  var newAlarm = alarmIndex<0;
  var a = {
    t : 12*3600000, // 12 o clock default
    on : true,
    rp : true,
    as : false,
    dow : 0b1111111,
    last : 0,
    vibrate : "::"
  };
  if (msg != "") a["msg"] = msg;
  if (!newAlarm) Object.assign(a, alarms[alarmIndex]);
  if (alarm) Object.assign(a,alarm);
  var t = decodeTime(a.t);

  var alarmTitle = (a.msg == undefined) ? 'Alarm' : (a.msg.length > 12) ? a.msg.replace(/\n/g, " ").substring(0, 12)+"..." : msg.replace(/\n/g, " ").substring(0, 12)+"...";

  const menu = {
    '': { 'title': alarmTitle },
    '< Back' : () => showAlarmMenu(),
    'Days': {
      value: "SMTWTFS".split("").map((d,n)=>a.dow&(1<<n)?d:".").join(""),
      onchange: () => editDOW(a.dow, d=>{a.dow=d;editAlarm(alarmIndex,a)})
    },
    'Hours': {
      value: t.hrs, min : 0, max : 23, wrap : true,
      onchange: v => t.hrs=v
    },
    'Minutes': {
      value: t.mins, min : 0, max : 59, wrap : true,
      onchange: v => t.mins=v
    },
    'Enabled': {
      value: a.on,
      onchange: v=>a.on=v
    },
    'Repeat': {
      value: a.rp,
      onchange: v=>a.rp=v
    },
    'Vibrate': require("buzz_menu").pattern(a.vibrate, v => a.vibrate=v ),
    'Auto snooze': {
      value: a.as,
      onchange: v=>a.as=v
    }
  };
  menu["Save"] = function() {
    a.t = encodeTime(t);
    a.last = (a.t < getCurrentTime()) ? (new Date()).getDate() : 0;
    a.last = 0;
    if (newAlarm) alarms.push(a);
    else alarms[alarmIndex] = a;
    saveAndReload();
    showMainMenu();
  };
  if (!newAlarm) {
    menu["Delete"] = function() {
      alarms.splice(alarmIndex,1);
      saveAndReload();
      showMainMenu();
    };
  }
  return E.showMenu(menu);
}

function editTimer(alarmIndex, alarm) {
  var newAlarm = alarmIndex<0;
  var a = {
    timer : 5*60*1000, // 5 minutes
    on : true,
    rp : false,
    as : false,
    dow : 0b1111111,
    last : 0,
    vibrate : ".."
  };
  if (msg != "") a["msg"] = msg;
  if (!newAlarm) Object.assign(a, alarms[alarmIndex]);
  if (alarm) Object.assign(a,alarm);
  var t = decodeTime(a.timer);

  var timerTitle = (a.msg == undefined) ? 'Timer' : (a.msg.length > 12) ? a.msg.replace(/\n/g, " ").substring(0, 12)+"..." : msg.replace(/\n/g, " ").substring(0, 12)+"...";

  const menu = {
    '': { 'title': timerTitle },
    '< Back' : () => showMainMenu(),
    'Hours': {
      value: t.hrs, min : 0, max : 23, wrap : true,
      onchange: v => t.hrs=v
    },
    'Minutes': {
      value: t.mins, min : 0, max : 59, wrap : true,
      onchange: v => t.mins=v
    },
    'Enabled': {
      value: a.on,
      onchange: v=>a.on=v
    },
    'Vibrate': require("buzz_menu").pattern(a.vibrate, v => a.vibrate=v ),
  };
  menu["Save"] = function() {
    a.timer = encodeTime(t);
    a.t = getCurrentTime() + a.timer;
    if (newAlarm) alarms.push(a);
    else alarms[alarmIndex] = a;
    saveAndReload();
    showMainMenu();
  };
  if (!newAlarm) {
    menu["Delete"] = function() {
      alarms.splice(alarmIndex,1);
      saveAndReload();
      showMainMenu();
    };
  }
  return E.showMenu(menu);
}

showMainMenu();

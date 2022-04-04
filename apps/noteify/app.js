var notes = require("Storage").readJSON("noteify.json", true) || [];
var alarms = require("Storage").readJSON("alarm.json",1)||[];

var note = "";
var textbox = "";
var pad = [];
var layer = 0;
var enableNote = 0;
var iniNote = 0;
var editNote;
var textBound = 0;
var msg = "";
var enableAlarms = (!require('Storage').read("alarm.js")) ? 0 : 1;

function saveNote() {
  return {
    note : note
  };
}

class keyPad {
  constructor(x1, y1, x2, y2, func) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.func = func;
  }
  get funcName() {
    this.func = func;
  }
  set funcName(a) {
    this.func = a;
  }
  draw() {
    g.drawRect(this.x1, this.y1, this.x2, this.y2).setFont("12x20",1).setFontAlign(0, 0, 0).drawString(this.func, (((this.x2-this.x1)/2)+this.x1), (((this.y2-this.y1)/2)+this.y1));
  }
  onTouch() {
    //prevent keypad from working on menu
    if (enableNote == 1) {
      Bangle.on("touch", (button, xy) => {
        if ((xy.x >= this.x1) && (xy.x <= this.x2) && (xy.y >= this.y1) && (xy.y <= this.y2) && (this.func) && (enableNote == 1)) {
          if (this.func == "space") this.func = " ";
          if (this.func == "<-") {
            note = note.slice(0, -1);
            this.func = "";
          }
          else if ((this.func == "SAVE") || this.func == "BACK") {
            if (note != "") {
              //save edits to existing note
              if (editNote != undefined) {
                notes[editNote].note = note;
              }
              //push new note
              else notes.push(saveNote());
              require("Storage").write("noteify.json",JSON.stringify(notes));
            }
            //exit to menu, reset to default settings
            enableNote = 0;
            g.clear();
            note = "";
            layer = 0;
            textBound = 0;
            //prevent main menu from detecting save tap??
            setTimeout(function(){
              (editNote != undefined) ? showEditMenu(editNote) : showMainMenu();
              editNote = undefined;
            }, 0);
            return;
          }
          else note += this.func;
          //scroll textbox if > 170 pixels or < 165 pixels
          textbox = note.substring(textBound, note.length);
          while ((g.setFont("12x20", 1).stringWidth(textbox)) > 165) {
            textBound++;
            textbox = note.substring(textBound, note.length);
          }
          while (((g.setFont("12x20", 1).stringWidth(textbox)) < 160) && textBound > 0) {
            textBound--;
            textbox = note.substring(textBound, note.length);
          }
          renderKeys();
        }
      });
    }
  }
}

function renderKeys() {
  g.clear();
  if ((editNote == undefined) && (note.length == 0)) {
    g.setFont("Vector", 14).setFontAlign(-1, 0).drawString(textbox, 4, 11);
    g.setFont("12x20", 1);
  }
  else g.setFont("12x20", 1).setFontAlign(-1, 0).drawString(textbox, 4, 11);
    
  if (layer == 0) {
    var a = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "SAVE", "space", "<-"];
    if (note == "") a[9] = "BACK";
    for (var i = 0; i < a.length; i++) {
      pad[i].funcName = a[i];
    }
  }
  else if (layer == 1) {
    var a = ["J", "K", "L", "M", "N", "O", "P", "Q", "R", "SAVE", "space", "<-"];
    if (note == "") a[9] = "BACK";
    for (var i = 0; i < a.length; i++) {
      pad[i].funcName = a[i];
    }
  }
  else if (layer == 2) {
    var a = ["S", "T", "U", "V", "W", "X", "Y", "Z", "0", "SAVE", "space", "<-"];
    if (note == "") a[9] = "BACK";
    for (var i = 0; i < a.length; i++) {
      pad[i].funcName = a[i];
    }
  }
  else if (layer == 3) {
    var a = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "SAVE", "space", "<-"];
    if (note == "") a[9] = "BACK";
    for (var i = 0; i < a.length; i++) {
      pad[i].funcName = a[i];
    }
  }
  else if (layer == 4) {
    var a = [".", ",", "?", "!", "(", ")", "-", "\'", ":", "SAVE", "space", "<-"];
    if (note == "") a[9] = "BACK";
    for (var i = 0; i < a.length; i++) {
      pad[i].funcName = a[i];
    }
  }

  for (var j = 0; j < pad.length; j++) {
    pad[j].draw();
  }
}

function startNote() {
  //edit note
  if (editNote != undefined) {
    note = notes[editNote].note;
    //textbox start at end of note
    textbox = note.substring(textBound - 14);
    while ((g.setFont("12x20", 1).stringWidth(textbox)) > 165) {
            textBound++;
            textbox = note.substring(textBound, note.length);
    }
  }
  //new note
  else textbox = "SWIPE ANY DIRECTION";
  //prevent keypad being drawn multiple times
  if (iniNote == 0) {
    pad[0] = new keyPad(0, 21, 57, 58);
    pad[1] = new keyPad(59, 21, 116, 58);
    pad[2] = new keyPad(118, 21, 175, 58);
    pad[3] = new keyPad(0, 60, 57, 97);
    pad[4] = new keyPad(59, 60, 116, 97);
    pad[5] = new keyPad(118, 60, 175, 97);
    pad[6] = new keyPad(0, 99, 57, 136);
    pad[7] = new keyPad(59, 99, 116, 136);
    pad[8] = new keyPad(118, 99, 175, 136);
    pad[9] = new keyPad(0, 138, 57, 175);
    pad[10] = new keyPad(59, 138, 116, 175);
    pad[11] = new keyPad(118, 138, 175, 175);

    var drag;
    var e;
    
    Bangle.on("drag", e => {
      if (enableNote == 1) {
        if (!drag) { // start dragging
          drag = {x: e.x, y: e.y};
        } 
        else if (!e.b) { // released
          const dx = e.x-drag.x, dy = e.y-drag.y;
          drag = null;
          //horizontal swipes
          if (Math.abs(dx)>Math.abs(dy)+10) {
            //swipe left
            if (dx<0) layer == 4 ? layer = 0 : layer++;
            //swipe right
            if (dx>0) layer == 0 ? layer = 4 : layer--;
          } 
          //vertical swipes
          else if (Math.abs(dy)>Math.abs(dx)+10) {
            //swipe down, hide keypad
            if (dy>0) {
              enableNote = 2;
              g.clear();
              g.setFontAlign(-1, -1).drawString(g.wrapString(note, g.getWidth()).join("\n"), 0, 0);
              return;
            }
          }
        }
        renderKeys();
      }
      else if (enableNote == 2) {
        if (!drag) { // start dragging
          drag = {x: e.x, y: e.y};
        } 
        else if (!e.b) { // released
          const dx = e.x-drag.x, dy = e.y-drag.y;
          drag = null;
          //vertical swipes
          if (Math.abs(dy)>Math.abs(dx)+10) {
            //swipe up, reveal keypad
            if ((dy<0) && (enableNote == 2)) {
              enableNote = 1;
              renderKeys();
            }
          }
        }
      }
    });
  }
  renderKeys();
  for (var i = 0; i < pad.length; i++) {
    pad[i].draw();
    //prevent tap zones being activated multiple times
    if (iniNote == 0) {
      pad[i].onTouch();
    }
  }
  iniNote = 1;
}

function showMainMenu() {
  var mainMenu = {
    "" : { "title" : "Noteify" },
    "< Back" : function() { load(); },
    "New note" : function() { 
      enableNote = 1;
      E.showMenu();
      startNote();
    },
    "Edit alarms/timers" : function() { showAlarmMenu(); },
  };

  notes.forEach((a, idx) => {
    mainMenu[notes[idx].note.length > 15 ? notes[idx].note.substring(0, 15)+"..." : notes[idx].note] = function () { showEditMenu(idx);};
  });
  E.showMenu(mainMenu);
}

function showEditMenu(idx) {
  var moveNote = notes[idx].note;
  var newPos = idx+1;
  var editMenu = {
    "" : { "title" : notes[idx].note.length > 15 ? notes[idx].note.substring(0, 15)+"..." : notes[idx].note },
    "View/edit note" : function() {
      editNote = idx;
      enableNote = 1;
      E.showMenu();
      startNote();
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
      value : newPos,
      min : 1,
      max : notes.length,
      wrap : true,
      onchange : function(v) {
        newPos = v;
      },
    },
    "< Back" : function() {
      //save changes from change position
      if (newPos-1 != idx) {
        var moveNote = notes[idx];
        notes.splice(newPos-1, 0, notes.splice(idx, 1)[0]);
        require("Storage").write("noteify.json",JSON.stringify(notes));
      }
      showMainMenu();
    },
  };
  E.showMenu(editMenu);
}

function getCurrentHr() {
  var time = new Date();
  return time.getHours()+(time.getMinutes()/60)+(time.getSeconds()/3600);
}

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

function showAlarmMenu() {
  const menu = {
    '': { 'title': 'Alarm/Timer' },
    '< Back' : ()=>{showMainMenu();},
    'New Alarm': ()=>editAlarm(-1),
    'New Timer': ()=>editTimer(-1)
  };
  alarms.forEach((alarm,idx)=>{
    if (alarm.timer) {
      txt = "TIMER "+(alarm.on?"on  ":"off ")+formatMins(alarm.timer);
    } else {
      txt = "ALARM "+(alarm.on?"on  ":"off ")+formatTime(alarm.hr);
      if (alarm.rp) txt += " (repeat)";
    }
    menu[txt] = function() {
      if (alarm.timer) editTimer(idx);
      else editAlarm(idx);
    };
  });
  msg = "";
  if (enableAlarms == 1) return E.showMenu(menu);
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
    msg = (!a.msg) ? "" : a.msg;
  }
  var alarmTitle = (msg == "") ? 'Alarm' : (msg.length > 15) ? msg.substring(0, 15)+"..." : msg;

  const menu = {
    '': { 'title': alarmTitle },
    '< Back' : showAlarmMenu,
    'Hours': {
      value: hrs, min : 0, max : 23, wrap : true,
      onchange: v => hrs=v
    },
    'Minutes': {
      value: mins, min : 0, max : 59, wrap : true,
      onchange: v => mins=v
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
      last : day, rp : repeat, as: as, msg: msg
    };
  }
  menu["> Save"] = function() {
    if (newAlarm) alarms.push(getAlarm());
    else alarms[alarmIndex] = getAlarm();
    require("Storage").write("alarm.json",JSON.stringify(alarms));
    showAlarmMenu();
  };
  if (!newAlarm) {
    menu["> Delete"] = function() {
      alarms.splice(alarmIndex,1);
      require("Storage").write("alarm.json",JSON.stringify(alarms));
      showAlarmMenu();
    };
  }
  if (enableAlarms == 1) return E.showMenu(menu);
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
    msg = (!a.msg) ? "" : a.msg;
  }
  var timerTitle = (msg == "") ? 'Alarm' : (msg.length > 15) ? msg.substring(0, 15)+"..." : msg;
  const menu = {
    '': { 'title': timerTitle },
    'Hours': {
      value: hrs, min : 0, max : 23, wrap : true,
      onchange: v => hrs=v
    },
    'Minutes': {
      value: mins, min : 0, max : 59, wrap : true,
      onchange: v => mins=v
    },
    'Enabled': {
      value: en,
      format: v=>v?"On":"Off",
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
      rp : false, as: false, msg: msg
    };
  }
  menu["> Save"] = function() {
    if (newAlarm) alarms.push(getTimer());
    else alarms[alarmIndex] = getTimer();
    require("Storage").write("alarm.json",JSON.stringify(alarms));
    showAlarmMenu();
  };
  if (!newAlarm) {
    menu["> Delete"] = function() {
      alarms.splice(alarmIndex,1);
      require("Storage").write("alarm.json",JSON.stringify(alarms));
      showAlarmMenu();
    };
  }
  if (enableAlarms == 1) return E.showMenu(menu);
}

showMainMenu();

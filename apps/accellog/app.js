var fileNumber = 0;
var MAXLOGS = 9;

function getFileName(n) {
  return "accellog."+n+".csv";
}

function showMenu() {
  var menu = {
    "" : { title : "Accel Logger" },
    "File No" : {
      value : fileNumber,
      min : 0,
      max : MAXLOGS,
      onchange : v => { fileNumber=v; }
    },
    "Start" : function() {
      E.showMenu();
      startRecord();
    },
    "View Logs" : function() {
      viewLogs();
    },
    "Exit" : function() {
      load();
    },
  };
  E.showMenu(menu);
}

function viewLog(n) {
  E.showMessage("Loading...");
  var f = require("Storage").open(getFileName(n), "r");
  var records = 0, l = "", ll="";
  while ((l=f.readLine())!==undefined) {records++;ll=l;}
  var length = 0;
  if (ll) length = (ll.split(",")[0]|0)/1000;

  var menu = {
    "" : { title : "Log "+n }
  };
  menu[records+" Records"] = "";
  menu[length+" Seconds"] = "";
  menu["DELETE"] = function() {
    E.showPrompt("Delete Log "+n).then(ok=>{
      if (ok) {
        E.showMessage("Erasing...");
        f.erase();
        viewLogs();
      } else viewLog(n);
    });
  };
  menu["< Back"] = function() {
    viewLogs();
  };

  E.showMenu(menu);
}

function viewLogs() {
  var menu = {
    "" : { title : "Logs" }
  };

  var hadLogs = false;
  for (var i=0;i<=MAXLOGS;i++) {
    var f = require("Storage").open(getFileName(i), "r");
    if (f.readLine()!==undefined) {
      (function(i) {
        menu["Log "+i] = () => viewLog(i);
      })(i);
      hadLogs = true;
    }
  }
  if (!hadLogs)
    menu["No Logs Found"] = function(){};
  menu["< Back"] = function() { showMenu(); };
  E.showMenu(menu);
}

function startRecord(force) {
  if (!force) {
    // check for existing file
    var f = require("Storage").open(getFileName(fileNumber), "r");
    if (f.readLine()!==undefined)
      return E.showPrompt("Overwrite Log "+fileNumber+"?").then(ok=>{
        if (ok) startRecord(true); else showMenu();
      });
  }
  // display
  g.clear(1);
  Bangle.drawWidgets();
  var w = g.getWidth();
  var h = g.getHeight();
  g.setColor("#ff0000").fillRect(0,h-48,w,h);
  g.setColor("#ffffff").setFont("6x8",2).setFontAlign(0,0).drawString("RECORDING", w/2,h-24);
  g.setFont("6x8").drawString("Samples:",w/2,h/3 - 20);
  g.setFont("6x8").drawString("Time:",w/2,h*2/3 - 20);
  g.setFont("6x8",2).setFontAlign(0,0,1).drawString("STOP",w-10,h/2);

  // now start writing
  f = require("Storage").open(getFileName(fileNumber), "w");
  f.write("Time (ms),X,Y,Z\n");
  var start = getTime();
  var sampleCount = 0;

  function accelHandler(accel) {
    var t = getTime()-start;
    f.write([
      t*1000,
      accel.x*8192,
      accel.y*8192,
      accel.z*8192].map(n=>Math.round(n)).join(",")+"\n");

    sampleCount++;
    g.reset().setFont("6x8",2).setFontAlign(0,0);
    g.drawString("  "+sampleCount+"  ",w/2,h/3,true);
    g.drawString("  "+Math.round(t)+"s  ",w/2,h*2/3,true);
  }

  Bangle.setPollInterval(80); // 12.5 Hz
  Bangle.on('accel', accelHandler);
  setWatch(()=>{
    Bangle.removeListener('accel', accelHandler);
    showMenu();
  }, BTN2);
}


Bangle.loadWidgets();
Bangle.drawWidgets();
showMenu();

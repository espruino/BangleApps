var fileNumber = 0;
var MAXLOGS = 9;

function getFileName(n) {
  return "accellog."+n+".csv";
}

function showMenu() {
  var menu = {
    "" : { title : "Accel Logger" },
    "Exit" : function() {
      load();
    },
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
  };
  E.showMenu(menu);
}

function viewLog(n) {
  E.showMessage("Loading...");
  var f = require("Storage").open(getFileName(n), "r");
  var records = 0, l = "", ll="";
  while ((l=f.readLine())!==undefined) {records++;ll=l;}
  var length = 0;
  if (ll) length = Math.round( (ll.split(",")[0]|0)/1000 );

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

  var Layout = require("Layout");
  var layout = new Layout({ type: "v", c: [
      {type:"txt", font:"6x8", label:"Samples", pad:2},
      {type:"txt", id:"samples", font:"6x8:2", label:"  -  ", pad:5, bgCol:g.theme.bg},
      {type:"txt", font:"6x8", label:"Time", pad:2},
      {type:"txt", id:"time", font:"6x8:2", label:"  -  ", pad:5, bgCol:g.theme.bg},
      {type:"txt", font:"6x8:2", label:"RECORDING", bgCol:"#f00", pad:5, fillx:1},
    ]
  },{btns:[ // Buttons...
    {label:"STOP", cb:()=>{
      Bangle.removeListener('accel', accelHandler);
      showMenu();
    }}
  ]});
  layout.render();

  // now start writing
  var f = require("Storage").open(getFileName(fileNumber), "w");
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
    layout.samples.label = sampleCount;
    layout.time.label = Math.round(t)+"s";
    layout.render(layout.samples);
    layout.render(layout.time);
  }

  Bangle.setPollInterval(80); // 12.5 Hz - the default
  Bangle.on('accel', accelHandler);
}


Bangle.loadWidgets();
Bangle.drawWidgets();
showMenu();

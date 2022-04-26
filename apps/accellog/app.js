var fileNumber = 0;
var MAXLOGS = 9;

function getFileName(n) {
  return "accellog."+n+".csv";
}

function showMenu() {
  var menu = {
    "" : { title : /*LANG*/"Accel Logger" },
    "< Back" : function() {
      load();
    },
    /*LANG*/"File No" : {
      value : fileNumber,
      min : 0,
      max : MAXLOGS,
      onchange : v => { fileNumber=v; }
    },
    /*LANG*/"Start" : function() {
      E.showMenu();
      startRecord();
    },
    /*LANG*/"View Logs" : function() {
      viewLogs();
    },
  };
  E.showMenu(menu);
}

function viewLog(n) {
  E.showMessage(/*LANG*/"Loading...");
  var f = require("Storage").open(getFileName(n), "r");
  var records = 0, l = "", ll="";
  while ((l=f.readLine())!==undefined) {records++;ll=l;}
  var length = 0;
  if (ll) length = Math.round( (ll.split(",")[0]|0)/1000 );

  var menu = {
    "" : { title : "Log "+n },
    "< Back" : () => { viewLogs(); }
  };
  menu[records+/*LANG*/" Records"] = "";
  menu[length+/*LANG*/" Seconds"] = "";
  menu[/*LANG*/"DELETE"] = function() {
    E.showPrompt(/*LANG*/"Delete Log "+n).then(ok=>{
      if (ok) {
        E.showMessage(/*LANG*/"Erasing...");
        f.erase();
        viewLogs();
      } else viewLog(n);
    });
  };


  E.showMenu(menu);
}

function viewLogs() {
  var menu = {
    "" : { title : /*LANG*/"Logs" },
    "< Back" : () => { showMenu(); }
  };

  var hadLogs = false;
  for (var i=0;i<=MAXLOGS;i++) {
    var f = require("Storage").open(getFileName(i), "r");
    if (f.readLine()!==undefined) {
      (function(i) {
        menu[/*LANG*/"Log "+i] = () => viewLog(i);
      })(i);
      hadLogs = true;
    }
  }
  if (!hadLogs)
    menu[/*LANG*/"No Logs Found"] = function(){};
  E.showMenu(menu);
}

function startRecord(force) {
  if (!force) {
    // check for existing file
    var f = require("Storage").open(getFileName(fileNumber), "r");
    if (f.readLine()!==undefined)
      return E.showPrompt(/*LANG*/"Overwrite Log "+fileNumber+"?").then(ok=>{
        if (ok) startRecord(true); else showMenu();
      });
  }
  // display
  g.clear(1);
  Bangle.drawWidgets();

  var Layout = require("Layout");
  var layout = new Layout({ type: "v", c: [
      {type:"txt", font:"6x8", label:/*LANG*/"Samples", pad:2},
      {type:"txt", id:"samples", font:"6x8:2", label:"  -  ", pad:5, bgCol:g.theme.bg},
      {type:"txt", font:"6x8", label:/*LANG*/"Time", pad:2},
      {type:"txt", id:"time", font:"6x8:2", label:"  -  ", pad:5, bgCol:g.theme.bg},
      {type:"txt", font:"6x8:2", label:/*LANG*/"RECORDING", bgCol:"#f00", pad:5, fillx:1},
    ]
  },{btns:[ // Buttons...
    {label:/*LANG*/"STOP", cb:()=>{
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

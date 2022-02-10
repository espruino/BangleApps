var acc;
var HZ = 100;
var SAMPLES = 5*HZ; // 5 seconds
var SCALE = 5000;
var THRESH = 1.04;
var accelx = new Int16Array(SAMPLES);
var accely = new Int16Array(SAMPLES); // North
var accelz = new Int16Array(SAMPLES); // Into clock face
var accelIdx = 0;
var lastAccel;
function accelHandlerTrigger(a) {"ram"
  if (a.mag*2>THRESH) { // *2 because 8g mode
    tStart = getTime();
    g.drawString("Recording",g.getWidth()/2,g.getHeight()/2,1);
    Bangle.removeListener('accel',accelHandlerTrigger);
    Bangle.on('accel',accelHandlerRecord);
    lastAccel.forEach(accelHandlerRecord);
    accelHandlerRecord(a);
  } else {
    if (lastAccel.length>10) lastAccel.shift();
    lastAccel.push(a);
  }
}
function accelHandlerRecord(a) {"ram"
  var i = accelIdx++;
  accelx[i] = a.x*SCALE*2;
  accely[i] = -a.y*SCALE*2;
  accelz[i] = a.z*SCALE*2;
  if (accelIdx>=SAMPLES) recordStop();
}
function recordStart() {"ram"
  Bangle.setLCDTimeout(0); // force LCD on
  accelIdx = 0;
  lastAccel = [];
  Bangle.accelWr(0x18,0b01110100); // off, +-8g
  Bangle.accelWr(0x1B,0x03 | 0x40); // 100hz output, ODR/2 filter
  Bangle.accelWr(0x18,0b11110100); // +-8g
  Bangle.setPollInterval(10); // 100hz input
  setTimeout(function() {
    Bangle.on('accel',accelHandlerTrigger);
    g.clear(1).setFont("6x8",2).setFontAlign(0,0);
    g.drawString("Waiting",g.getWidth()/2,g.getHeight()/2);
  }, 200);
}


function recordStop() {"ram"
  //console.log("Length:",getTime()-tStart);
  Bangle.setPollInterval(80); // default poll interval
  Bangle.accelWr(0x18,0b01101100); // off, +-4g
  Bangle.accelWr(0x1B,0x0); // default 12.5hz output
  Bangle.accelWr(0x18,0b11101100); // +-4g
  Bangle.removeListener('accel',accelHandlerRecord);
  E.showMessage("Finished");
  showData();
}


function showData() {
  g.clear(1);
  var w = g.getWidth()-20; // width
  var m = g.getHeight()/2; // middle
  var s = 12; // how many pixels per G
  g.fillRect(9,0,9,g.getHeight());
  g.setFontAlign(0,0);
  for (var l=-8;l<=8;l++)
    g.drawString(l, 5, m - l*s);

  function plot(a) {
    g.moveTo(10,m - a[0]*s/SCALE);
    for (var i=0;i<SAMPLES;i++)
      g.lineTo(10+i*w/SAMPLES, m - a[i]*s/SCALE);
  }
  g.setColor("#0000ff");
  plot(accelz);
  g.setColor("#ff0000");
  plot(accelx);
  g.setColor("#00ff00");
  plot(accely);

  // work out stats
  var maxAccel = 0;
  var tStart = SAMPLES, tEnd = 0;
  var vel = 0, maxVel = 0;
  for (var i=0;i<SAMPLES;i++) {
    var a = accely[i]/SCALE;
    if (a>0.1) {
      if (i<tStart) tStart=i;
      if (i>tEnd) tEnd=i;
    }
    if (a>maxAccel) maxAccel=a;
    vel += a/HZ;
    if (vel>maxVel) maxVel=vel;
  }
  g.reset();
  g.setFont("6x8").setFontAlign(1,0);
  g.drawString("Max Y Accel: "+maxAccel.toFixed(2)+" g",g.getWidth()-14,g.getHeight()-50);
  g.drawString("Max Y Vel: "+maxVel.toFixed(2)+" m/s",g.getWidth()-14,g.getHeight()-40);
  g.drawString("Time moving: "+(tEnd-tStart)/HZ+" s",g.getWidth()-14,g.getHeight()-30);
  //console.log("End Velocity "+vel);
  g.setFont("6x8").setFontAlign(0,0,1);
  g.drawString("FINISH",g.getWidth()-4,g.getHeight()/2);
  setWatch(function() {
    showMenu();
  }, BTN2);
}

function showBig(txt) {
  g.clear(1);
  g.setFontVector(80).setFontAlign(0,0);
  g.drawString(txt,g.getWidth()/2, g.getHeight()/2);
  g.flip();
}

function countDown() {
  showBig(3);
  setTimeout(function() {
    showBig(2);
    setTimeout(function() {
      showBig(1);
      setTimeout(function() {
        recordStart();
      }, 800);
    }, 1000);
  }, 1000);
}

function showMenu() {
  Bangle.setLCDTimeout(10); // set timeout for LCD in menu
  var menu = {
    "" : { title : "Acceleration Rec" },
    "Start" : function() {
      E.showMenu();
      if (accelIdx==0) countDown();
      else E.showPrompt("Overwrite Recording?").then(ok=>{
        if (ok) countDown(); else showMenu();
      });
    },
    "Plot" : function() {
      E.showMenu();
      if (accelIdx) showData();
      else E.showAlert("No Data").then(()=>{
        showMenu();
      });
    },
    "Save" : function() {
      E.showMenu();
      if (accelIdx) showSaveMenu();
      else E.showAlert("No Data").then(()=>{
        showMenu();
      });
    },
    "Exit" : function() {
      load();
    },
  };
  E.showMenu(menu);
}

function showSaveMenu() {
  var menu = {
    "" : { title : "Save" }
  };
  [1,2,3,4,5,6].forEach(i=>{
    var fn = "accelrec."+i+".csv";
    var exists = require("Storage").read(fn)!==undefined;
    menu["Recording "+i+(exists?" *":"")] = function() {
      var csv = "";
      for (var i=0;i<SAMPLES;i++)
        csv += `${accelx[i]/SCALE},${accely[i]/SCALE},${accelz[i]/SCALE}\n`;
      require("Storage").write(fn,csv);
      showMenu();
    };
  });
  menu["< Back"] = function() {showMenu();};
  E.showMenu(menu);
}

showMenu();

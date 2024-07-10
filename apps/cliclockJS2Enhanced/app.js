var fontsize = g.getWidth()>200 ? 3 : 2;
var fontsizeTime = g.getWidth()>200 ? 4 : 4;

var fontheight = 10*fontsize;
var fontheightTime = 10*fontsizeTime;
var locale = require("locale");
var marginTop = 25;
var flag = false;

var storage = require('Storage');

const settings = storage.readJSON('setting.json',1) || { HID: false };

var sendHid, next, prev, toggle, up, down, profile;
var lasty = 0;
var lastx = 0;

if (settings.HID=="kbmedia") {
  profile = 'Music';
  sendHid = function (code, cb) {
    try {
      NRF.sendHIDReport([1,code], () => {
        NRF.sendHIDReport([1,0], () => {
          if (cb) cb();
        });
      });
    } catch(e) {
      print(e);
    }
  };
  next = function (cb) { sendHid(0x01, cb); };
  prev = function (cb) { sendHid(0x02, cb); };
  toggle = function (cb) { sendHid(0x10, cb); };
  up = function (cb) {sendHid(0x40, cb); };
  down = function (cb) { sendHid(0x80, cb); };
} else {
  E.showPrompt("Enable HID?",{title:"HID disabled"}).then(function(enable) {
    if (enable) {
      settings.HID = "kbmedia";
      require("Storage").write('setting.json', settings);
      setTimeout(load, 1000, "hidmsicswipe.app.js");
    } else setTimeout(load, 1000);
  });
}

if (next) {
  setWatch(function(e) {
    var len = e.time - e.lastTime;
      E.showMessage('lock');
      setTimeout(drawApp, 1000);
      Bangle.setLocked(true);
  }, BTN1, { edge:"falling",repeat:true,debounce:50});
  Bangle.on('drag', function(e) {
    if(!e.b){
      console.log(lasty);
      console.log(lastx);
    if(lasty >  40){
    writeLine('Down', 3);
     // setTimeout(drawApp, 1000);
     // Bluetooth.println(JSON.stringify({t:"music", n:"volumedown"}));
      down(() => {});
    }
      else if(lasty < -40){
       writeLine('Up', 3);
     // setTimeout(drawApp, 1000);
     //Bluetooth.println(JSON.stringify({t:"music", n:"volumeup"}));

      up(() => {});
    } else if(lastx < -40){
    writeLine('Prev', 3);
     // setTimeout(drawApp, 1000);
     // Bluetooth.println(JSON.stringify({t:"music", n:"previous"}));
      prev(() => {});
    } else if(lastx > 40){
    writeLine('Next', 3);
     // setTimeout(drawApp, 1000);
     // Bluetooth.println(JSON.stringify({t:"music", n:"next"}));
      next(() => {});
    } else if(lastx==0 && lasty==0){
    writeLine('play/pause', 3);
      //setTimeout(drawApp, 1000);
      //  Bluetooth.println(JSON.stringify({t:"music", n:"play"}));

      toggle(() => {});
    }
      lastx = 0;
      lasty = 0;
    }
            else{
            lastx = lastx + e.dx;
            lasty = lasty + e.dy;
  }
  });

}


let textCol = g.theme.dark ? "#0f0" : "#080";

function drawAll(){
  updateTime();
  updateRest(new Date());
}

function updateRest(now){
  writeLine(locale.dow(now),1);
  writeLine(locale.date(now,1),2);
}
function updateTime(){
  if (!Bangle.isLCDOn()) return;
  let now = new Date();
  writeLine(locale.time(now,1),0);
  writeLine(flag?" ":"_                     ",3);
  flag = !flag;
  if(now.getMinutes() == 0)
    updateRest(now);
}
function writeLineStart(line){
  if (line==0){
      g.drawString(">",0,marginTop+(line)*fontheight);
  } else {
      g.drawString(">",4,marginTop+(line-1)*fontheight + fontheightTime);

  }
}

function writeLine(str,line){
  if (line == 0){
  var y = marginTop+line*fontheightTime;
  g.setFont("6x8",fontsizeTime);
  g.setColor(textCol).setFontAlign(-1,-1);
  g.clearRect(0,y,((str.length+1)*40),y+fontheightTime-1);
  writeLineStart(line);
  g.drawString(str,25,y);
  } else {
      var y = marginTop+(line-1)*fontheight+fontheightTime;
  g.setFont("6x8",fontsize);
  g.setColor(textCol).setFontAlign(-1,-1);
  g.clearRect(0,y,((str.length+10)*40),y+fontheightTime-1);
  writeLineStart(line);
  g.drawString(str,25,y);
  }

}

g.clear();

Bangle.on('lcdPower',function(on) {
  if (on) drawAll();
});
/*var click =*/ setInterval(updateTime, 1000);
// Show launcher when button pressed
Bangle.setUI("clockupdown", btn=>{
  drawAll(); // why do we redraw here??
});
Bangle.loadWidgets();
Bangle.drawWidgets();
drawAll();

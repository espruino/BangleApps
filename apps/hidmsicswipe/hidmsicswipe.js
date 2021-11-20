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

function drawApp() {
  g.clear();
  if(Bangle.isLocked()==false) E.showMessage('Swipe', 'Music');
  else E.showMessage('Locked', 'Music');
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
      //console.log(lasty);
      //console.log(lastx);
    if(lasty >  40){
    E.showMessage('down');
      setTimeout(drawApp, 1000);
      down(() => {});
    }
      else if(lasty < -40){
    E.showMessage('up');
      setTimeout(drawApp, 1000);
      up(() => {});
    } else if(lastx < -40){
    E.showMessage('prev');
      setTimeout(drawApp, 1000);
      prev(() => {});
    } else if(lastx > 40){
    E.showMessage('next');
      setTimeout(drawApp, 1000);
      next(() => {});
    } else if(lastx==0 && lasty==0){
    E.showMessage('play/pause');
      setTimeout(drawApp, 1000);
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
  
  Bangle.on("lock", function(on) {
    if(!on){
      E.showMessage('unlock');
      setTimeout(drawApp, 1000);
    }
  });

  drawApp();
}

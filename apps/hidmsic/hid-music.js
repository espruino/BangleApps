var storage = require('Storage');

const settings = storage.readJSON('setting.json',1) || { HID: false };

var sendHid, next, prev, toggle, up, down, profile;

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
      setTimeout(load, 1000, "hidmsc.app.js");
    } else setTimeout(load, 1000);
  });
}

function drawApp() {
  g.clear();
  g.setFont("6x8",2);
  g.setFontAlign(0,0);
  g.drawString(profile, 120, 120);
  const d = g.getWidth() - 18;

  function c(a) {
    return {
      width: 8,
      height: a.length,
      bpp: 1,
      buffer: (new Uint8Array(a)).buffer
    };
  }

  g.drawImage(c([16,56,124,254,16,16,16,16]),d,40);
  g.drawImage(c([16,16,16,16,254,124,56,16]),d,194);
  g.drawImage(c([0,8,12,14,255,14,12,8]),d,116);
}

if (next) {
  setWatch(function(e) {
    var len = e.time - e.lastTime;
    if (len > 0.3 && len < 0.9) {
      E.showMessage('prev');
      setTimeout(drawApp, 1000);
      prev(() => {});
    } else {
      E.showMessage('up');
      setTimeout(drawApp, 1000);
      up(() => {});
    }
  }, BTN1, { edge:"falling",repeat:true,debounce:50});

  setWatch(function(e) {
    var len = e.time - e.lastTime;
    if (len > 0.3 && len < 0.9) {
      E.showMessage('next');
      setTimeout(drawApp, 1000);
      next(() => {});
    } else {
      E.showMessage('down');
      setTimeout(drawApp, 1000);
      down(() => {});
    }
  }, BTN3, { edge:"falling",repeat:true,debounce:50});

  setWatch(function(e) {
    E.showMessage('toggle')
    setTimeout(drawApp, 1000);
    toggle();
  }, BTN2, { edge:"falling",repeat:true,debounce:50});

  drawApp();
}

var storage = require('Storage');

const settings = storage.readJSON('setting.json',1) || { HID: false };

var sendHid, camShot, profile;

if (settings.HID=="kbmedia") {
  profile = 'camShutter';
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
  camShot = function (cb) { sendHid(0x80, cb); };
} else {
  E.showPrompt("Enable HID?",{title:"HID disabled"}).then(function(enable) {
    if (enable) {
      settings.HID = "kbmedia";
      require("Storage").write('setting.json', settings);
      setTimeout(load, 1000, "hidcam.app.js");
    } else setTimeout(load, 1000);
  });
}
function drawApp() {
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  g.fillCircle(122,127,60);
  g.drawImage(storage.read("hidcam.img"),100,105);
  const d = g.getWidth() - 18;

  function c(a) {
    return {
      width: 8,
      height: a.length,
      bpp: 1,
      buffer: (new Uint8Array(a)).buffer
    };
  }
  g.fillRect(180,130, 240, 124);
}

if (camShot) {
  setWatch(function(e) {
    E.showMessage('camShot !');
    setTimeout(drawApp, 1000);
    camShot(() => {});
  }, BTN2, { edge:"falling",repeat:true,debounce:50});

  drawApp();
}

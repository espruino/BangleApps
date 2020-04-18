var storage = require('Storage');

const settings = storage.readJSON('setting.json',1) || { HID: false };

var sendHid, camShot, profile;

if (settings.HID) {
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
  E.showMessage('HID disabled');
  setTimeout(load, 1000);
}
function drawApp() {
  g.clear();
  Bangle.loadWidgets()
  Bangle.drawWidgets()
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

  g.drawImage(c([0,8,12,14,255,14,12,8]),d,116);
}

if (camShot) {
  setWatch(function(e) {
      E.showMessage('camShot !');
      setTimeout(drawApp, 1000);
      camShot(() => {});
  }, BTN2, { edge:"falling",repeat:true,debounce:50});

  drawApp();
}

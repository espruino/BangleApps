const storage = require('Storage');
const Layout = require("Layout");
const settings = storage.readJSON('setting.json',1) || { HID: false };
const BANGLEJS2 = process.env.HWVERSION == 2;
const buttonWidth = Bangle.appRect.w/2;
const buttonHeight = (Bangle.appRect.h-16)/2*0.85; // subtract text row and add a safety margin

var sendInProgress = false; // Only send one message at a time, do not flood


function renderBtnArrows(l) {
  const d = g.getWidth() - l.width;

  function c(a) {
    return {
      width: 8,
      height: a.length,
      bpp: 1,
      buffer: (new Uint8Array(a)).buffer
    };
  }

  g.drawImage(c([0,8,12,14,255,14,12,8]),d,g.getHeight()/2);
  if (!BANGLEJS2) {
    g.drawImage(c([16,56,124,254,16,16,16,16]),d,40);
    g.drawImage(c([16,16,16,16,254,124,56,16]),d,194);
  }
}

const layout = new Layout(
	{type:"h", c:[
		{type:"v", width:Bangle.appRect.w-18, c: [
			{type:"h", c:[
				{type:"txt", font:"6x8:2", label:"Joystick"},
			]}
		]},
		{type:"custom", width:18, height: Bangle.appRect.h, render:renderBtnArrows}
	]}
);

const sendHid = function (x, y, btn1, btn2, btn3, btn4, btn5, cb) {
  try {
    const buttons = (btn5<<4) | (btn4<<3) | (btn3<<2) | (btn2<<1) | (btn1<<0);
    if (!sendInProgress) {
      sendInProgress = true;
      NRF.sendHIDReport([buttons, x, y], () => {
        sendInProgress = false;
        if (cb) cb();
      });
    }
  } catch(e) {
    print(e);
  }
};

function drawApp() {
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  layout.render();
}

function update() {
  const btn1 = BTN1 ? BTN1.read() : 0;
  const btn2 = !BANGLEJS2 ? BTN2.read() : 0;
  const btn3 = !BANGLEJS2 ? BTN3.read() : 0;
  const btn4 = !BANGLEJS2 ? BTN4.read() : 0;
  const btn5 = !BANGLEJS2 ? BTN5.read() : 0;
  const acc = Bangle.getAccel();
  var x = acc.x*-127;
  var y = acc.y*-127;

  // check limits
  if (x > 127) x = 127;
  else if (x < -127) x = -127;
  if (y > 127) y = 127;
  else if (y < -127) y = -127;

  sendHid(x & 0xff, y & 0xff, btn1, btn2, btn3, btn4, btn5);
}

if (settings.HID === "joy") {
  drawApp();
  setInterval(update, 100); // 10 Hz
} else {
  E.showPrompt("Enable HID?",{title:"HID disabled"}).then(function(enable) {
    if (enable) {
      settings.HID = "joy";
      storage.write('setting.json', settings);
      setTimeout(load, 1000, "hidjoystick.app.js");
    } else {
      setTimeout(load, 1000);
    }
  });
}

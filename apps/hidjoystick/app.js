const storage = require('Storage');
const Layout = require("Layout");
const settings = storage.readJSON('setting.json',1) || { HID: false };
const BANGLEJS2 = process.env.HWVERSION == 2;
const sidebarWidth=18;
const buttonWidth = (Bangle.appRect.w-sidebarWidth)/2;
const buttonHeight = (Bangle.appRect.h-16)/2*0.85; // subtract text row and add a safety margin

var sendInProgress = false; // Only send one message at a time, do not flood
var touchBtn2 = 0;
var touchBtn3 = 0;
var touchBtn4 = 0;
var touchBtn5 = 0;

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

const layoutChilden = [];
if (BANGLEJS2) { // add virtual buttons in display
	layoutChilden.push({type:"h", c:[
		{type:"btn", width:buttonWidth, height:buttonHeight, label:"BTN2", id:"touchBtn2" },
		{type:"btn", width:buttonWidth, height:buttonHeight, label:"BTN3", id:"touchBtn3" },
	]});
}
layoutChilden.push({type:"h", c:[
	{type:"txt", font:"6x8:2", label:"Joystick" },
]});
if (BANGLEJS2) { // add virtual buttons in display
	layoutChilden.push({type:"h", c:[
		{type:"btn", width:buttonWidth, height:buttonHeight, label:"BTN4", id:"touchBtn4" },
		{type:"btn", width:buttonWidth, height:buttonHeight, label:"BTN5", id:"touchBtn5" },
	]});
}

const layout = new Layout(
	{type:"h", c:[
		{type:"v", width:Bangle.appRect.w-sidebarWidth, c: layoutChilden},
		{type:"custom", width:18, height: Bangle.appRect.h, render:renderBtnArrows }
	]}
);

function isInBox(box, x, y) {
  return x >= box.x && x < box.x+box.w && y >= box.y && y < box.y+box.h;
}

if (BANGLEJS2) {
  Bangle.on('drag', function(event) {
    if (event.b == 0) { // release
      touchBtn2 = touchBtn3 = touchBtn4 = touchBtn5 = 0;
    } else if (isInBox(layout.touchBtn2, event.x, event.y)) {
      touchBtn2 = 1;
      touchBtn3 = touchBtn4 = touchBtn5 = 0;
    } else if (isInBox(layout.touchBtn3, event.x, event.y)) {
      touchBtn3 = 1;
      touchBtn2 = touchBtn4 = touchBtn5 = 0;
    } else if (isInBox(layout.touchBtn4, event.x, event.y)) {
      touchBtn4 = 1;
      touchBtn2 = touchBtn3 = touchBtn5 = 0;
    } else if (isInBox(layout.touchBtn5, event.x, event.y)) {
      touchBtn5 = 1;
      touchBtn2 = touchBtn3 = touchBtn4 = 0;
    } else {
      // outside any buttons, release all
      touchBtn2 = touchBtn3 = touchBtn4 = touchBtn5 = 0;
    }
  });
}

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
  const btn2 = !BANGLEJS2 ? BTN2.read() : touchBtn2;
  const btn3 = !BANGLEJS2 ? BTN3.read() : touchBtn3;
  const btn4 = !BANGLEJS2 ? BTN4.read() : touchBtn4;
  const btn5 = !BANGLEJS2 ? BTN5.read() : touchBtn5;
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

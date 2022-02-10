// Presentor by 7kasper (Kasper Müller)
// Version 3.0

const SpecialReport = new Uint8Array([
  0x05, 0x01,                    // USAGE_PAGE (Generic Desktop)
  0x09, 0x02,                    // USAGE (Mouse)
  0xa1, 0x01,                    // COLLECTION (Application)
  0x85, 0x01,                    //   REPORT_ID (1)
  0x09, 0x01,                    //   USAGE (Pointer)
  0xa1, 0x00,                    //   COLLECTION (Physical)
  0x05, 0x09,                    //     USAGE_PAGE (Button)
  0x19, 0x01,                    //     USAGE_MINIMUM (Button 1)
  0x29, 0x05,                    //     USAGE_MAXIMUM (Button 5)
  0x15, 0x00,                    //     LOGICAL_MINIMUM (0)
  0x25, 0x01,                    //     LOGICAL_MAXIMUM (1)
  0x95, 0x05,                    //     REPORT_COUNT (5)
  0x75, 0x01,                    //     REPORT_SIZE (1)
  0x81, 0x02,                    //     INPUT (Data,Var,Abs)
  0x95, 0x01,                    //     REPORT_COUNT (1)
  0x75, 0x03,                    //     REPORT_SIZE (3)
  0x81, 0x03,                    //     INPUT (Cnst,Var,Abs)
  0x05, 0x01,                    //     USAGE_PAGE (Generic Desktop)
  0x09, 0x30,                    //     USAGE (X)
  0x09, 0x31,                    //     USAGE (Y)
  0x09, 0x38,                    //     USAGE (Wheel)
  0x15, 0x81,                    //     LOGICAL_MINIMUM (-127)
  0x25, 0x7f,                    //     LOGICAL_MAXIMUM (127)
  0x75, 0x08,                    //     REPORT_SIZE (8)
  0x95, 0x03,                    //     REPORT_COUNT (3)
  0x81, 0x06,                    //     INPUT (Data,Var,Rel)
  0x05, 0x0c,                    //     USAGE_PAGE (Consumer Devices)
  0x0a, 0x38, 0x02,              //     USAGE (AC Pan)
  0x15, 0x81,                    //     LOGICAL_MINIMUM (-127)
  0x25, 0x7f,                    //     LOGICAL_MAXIMUM (127)
  0x75, 0x08,                    //     REPORT_SIZE (8)
  0x95, 0x01,                    //     REPORT_COUNT (1)
  0x81, 0x06,                    //     INPUT (Data,Var,Rel)
  0xc0,                          //     END_COLLECTION
  0xc0,                          // END_COLLECTION
  0x05, 0x01,                    // USAGE_PAGE (Generic Desktop)
  0x09, 0x06,                    // USAGE (Keyboard)
  0xa1, 0x01,                    // COLLECTION (Application)
  0x85, 0x02,                    //   REPORT_ID (2)
  0x05, 0x07,                    //   USAGE_PAGE (Keyboard)
  0x19, 0xe0,                    //   USAGE_MINIMUM (Keyboard LeftControl)
  0x29, 0xe7,                    //   USAGE_MAXIMUM (Keyboard Right GUI)
  0x15, 0x00,                    //   LOGICAL_MINIMUM (0)
  0x25, 0x01,                    //   LOGICAL_MAXIMUM (1)
  0x75, 0x01,                    //   REPORT_SIZE (1)
  0x95, 0x08,                    //   REPORT_COUNT (8)
  0x81, 0x02,                    //   INPUT (Data,Var,Abs)
  0x75, 0x08,                    //   REPORT_SIZE (8)
  0x95, 0x01,                    //   REPORT_COUNT (1)
  0x81, 0x01,                    //   INPUT (Cnst,Ary,Abs)
  0x19, 0x00,                    //   USAGE_MINIMUM (Reserved (no event indicated))
  0x29, 0x73,                    //   USAGE_MAXIMUM (Keyboard F24)
  0x15, 0x00,                    //   LOGICAL_MINIMUM (0)
  0x25, 0x73,                    //   LOGICAL_MAXIMUM (115)
  0x95, 0x05,                    //   REPORT_COUNT (5)
  0x75, 0x08,                    //   REPORT_SIZE (8)
  0x81, 0x00,                    //   INPUT (Data,Ary,Abs)
  0xc0                           // END_COLLECTION
]);

const MouseButton = {
  NONE : 0,
  LEFT : 1,
  RIGHT : 2,
  MIDDLE : 4,
  BACK : 8,
  FORWARD: 16
};

const kb = require("ble_hid_keyboard");

const Layout = require("Layout");
const Locale = require("locale");
let mainLayout = new Layout({
  'type': 'v', 
  filly: 1, 
  c: [
    {
      type: 'txt', 
      font: '6x8', 
      label: 'Presentor', 
      valign: -1,
      halign: 0,
      col: g.theme.fg1, 
      // bgCol: g.theme.bg2,
      bgCol: '#00F',
      fillx: 1,
    }, {
      type: 'h',
      fillx: 1,
      c: [
        {
          type: 'txt',
          font: '15%',
          label: '00:00',
          id: 'Time',
          halign: -1,
          pad: 3
        }, {
          fillx: 1
        }, {
          type: 'txt',
          font: '15%',
          label: '00:00',
          id: 'Timer',
          halign: 1,
          pad: 3
        }
      ]
    }, {
      type: 'txt',
      font: '10%',
      label: '+00:00',
      id: 'RestTime',
      col: '#fff'
    }, {
      type: 'txt',
      font: '10%',
      label: '--------------'
    }, {
      type: 'txt',
      font: '15%',
      label: 'Presenting',
      id: 'Subject'
    }, {
      type: 'txt',
      font: '6x8',
      label: 'Swipe up to start the time.',
      id: 'Notes',
      col: '#ff0',
      fillx: 1,
      filly: 1,
      valign: 1
    }
  ]
}, {lazy:true});

let settings = {pparts: [], sversion: 0};
let HIDenabled = true;

// Application variables
let pparti = -1;
let ppartBuzzed = false;
let restBuzzed = false;

let lastx = 0;
let lasty = 0;

// Mouse states
let holding = false;
let trackPadMode = false;

// Timeout IDs.
let timeoutId = -1;
let timeoutHolding = -1;
let timeoutDraw = -1;


let homeRoll = 0;
let homePitch = 0;
let mCal = 0;
let mttl = 0;
let cttl = 0;

// BT helper.
let clearToSend = true;

// Presentation Timers
let ptimers = [];

function delay(t, v) {
  return new Promise((resolve) => { 
      setTimeout(resolve, t)
  });
}

function formatTimePart(time) {
  time = Math.floor(Math.abs(time));
  return time < 10 ? `0${time}` : `${time}`;
}

function formatTime(time, doPlus) {
  if (time == Infinity) return ' --:-- ';
  return `${time < 0 ? '-' : (doPlus ? '+' : '')}${formatTimePart(time/60)}:${formatTimePart(time%60)}`;
}

function loadSettings() {
  settings = require("Storage").readJSON('presentor.json');
  for (let i = 0; i < settings.pparts.length; i++) {
    ptimers[i] = {
      active: false,
      tracked: -1,
      left: settings.pparts[i].minutes * 60 + settings.pparts[i].seconds
    };
  }
}

function getCurrentTimer() {
  if (pparti < 0) return Infinity;
  if (!settings.pparts || pparti >= settings.pparts.length) return Infinity;
  if (ptimers[pparti].tracked == -1) return Infinity;
  ptimers[pparti].left -= (getTime() - ptimers[pparti].tracked);
  ptimers[pparti].tracked = getTime();
  // if we haven't buzzed yet and timer became negative just buzz here.
  // TODO better place?
  if (ptimers[pparti].left <= 0 && !ppartBuzzed) {
    Bangle.buzz(400)
      .then(() => delay(400))
      .then(() => Bangle.buzz(400));
    ppartBuzzed = true;
  }
  return ptimers[pparti].left;
}

function getRestTime() {
  let rem = 0;
  // Add all remaining time from previous presentation parts.
  for (let i = 0; i < pparti; i++) {
    rem += ptimers[i].left;
  }
  if (pparti >= 0 && pparti < ptimers.length && ptimers[pparti].left < 0) {
    rem += ptimers[pparti].left;
  }
  // if we haven't buzzed yet and timer became negative just buzz here.
  // TODO better place?
  if (rem < 0 && !restBuzzed) {
    Bangle.buzz(200)
      .then(() => delay(400))
      .then(() => Bangle.buzz(200))
      .then(() => delay(400))
      .then(() => Bangle.buzz(200));
    restBuzzed = true;
  }
  return rem;
}

function drawMainFrame() {
  var d = new Date();
  // update time
  mainLayout.Time.label = Locale.time(d,1);
  // update timer
  mainLayout.Timer.label = formatTime(getCurrentTimer());
  let restTime = getRestTime();
  mainLayout.RestTime.label = formatTime(restTime, true);
  mainLayout.RestTime.col = restTime < 0 ? '#f00' : (restTime > 0 ? '#0f0' : '#fff');
  mainLayout.render();
  // schedule a draw for the next minute
  if (timeoutDraw != -1) clearTimeout(timeoutDraw);
  timeoutDraw = setTimeout(function() {
    timeoutDraw = -1;
    drawMainFrame();
  }, 1000 - (Date.now() % 1000));
}

function drawMain() {
  g.clear();
  mainLayout.forgetLazyState();
  drawMainFrame();
  // mainLayout.render();
  // E.showMessage('Presentor');
}

function doPPart(r) {
  pparti += r;
  if (pparti < 0) {
    pparti = -1;
    mainLayout.Subject.label = 'PAUSED';
    mainLayout.Notes.label = 'Swipe up to start again.';
    return;
  }
  if (!settings.pparts || pparti >= settings.pparts.length) {
    pparti = settings.pparts.length;
    mainLayout.Subject.label = 'FINISHED';
    mainLayout.Notes.label = 'Good Job!';
    return;
  }
  let ppart = settings.pparts[pparti];
  mainLayout.Subject.label = ppart.subject;
  mainLayout.Notes.label = ppart.notes;
  ptimers[pparti].tracked = getTime();
  // We haven't buzzed if there was time left.
  ppartBuzzed = ptimers[pparti].left <= 0;
  // Always reset buzzstate for the rest timer.
  restBuzzed = getRestTime() < 0;
  drawMainFrame();
}

NRF.setServices(undefined, { hid : SpecialReport });
// TODO: figure out how to detect HID.
NRF.on('HID', function() {
  HIDenabled = true;
});

function moveMouse(x,y,b,wheel,hwheel,callback) {
  if (!HIDenabled) return;
  if (!b) b = 0;
  if (!wheel) wheel = 0;
  if (!hwheel) hwheel = 0;
  NRF.sendHIDReport([1,b,x,y,wheel,hwheel,0,0], function() {
    if (callback) callback();
  });
}

// function getSign(x) {
//   return ((x > 0) - (x < 0)) || +x;
// }

function scroll(wheel,hwheel,callback) {
  moveMouse(0,0,0,wheel,hwheel,callback);
}

// Single click a certain button (immidiatly release).
function clickMouse(b, callback) {
  if (!HIDenabled) return;
  NRF.sendHIDReport([1,b,0,0,0,0,0,0], function() {
    NRF.sendHIDReport([1,0,0,0,0,0,0,0], function() {
      if (callback) callback();
    });
  });
}

function pressKey(keyCode, modifiers, callback) {
  if (!HIDenabled) return;
  if (!modifiers) modifiers = 0;
  NRF.sendHIDReport([2, modifiers,0,keyCode,0,0,0,0], function() {
    NRF.sendHIDReport([2,0,0,0,0,0,0,0], function() {
      if (callback) callback();
    });
  });
}

function handleAcc(acc) {
  let rRoll  = acc.y *  -50;
  let rPitch = acc.x * -100;
  if (mCal > 10) {
    //console.log("x: " +  (rRoll - homeRoll) + " y:" + (rPitch - homePitch));
    moveMouse(acc.y * -50 - homeRoll, acc.x * -100 - homePitch);
  } else {
    //console.log("homeroll: " +homeRoll +"homepitch: " + homePitch);
    homeRoll  = rRoll  * 0.7 + homeRoll  * 0.3;
    homePitch = rPitch * 0.7 + homePitch * 0.3;
    mCal = mCal + 1;
  }
}
Bangle.on('lock', function(on) {
  if (on && holding) {
    Bangle.setLocked(false);
    Bangle.setLCDPower(1);
  }
});

function startHolding() {
  pressKey(kb.KEY.F10);
  holding = true;
  Bangle.buzz();
  E.showMessage('Holding');
  Bangle.on('accel', handleAcc);
  Bangle.setLCDPower(1);
}
function stopHolding() {
  clearTimeout(timeoutId);
  if (holding) {
    pressKey(kb.KEY.F10);
    homePitch = 0;
    homeRoll = 0;
    holding = false;
    mCal = 0;
    Bangle.removeListener('accel', handleAcc);
    Bangle.buzz();
    drawMain();
  } else {
    timeoutId = setTimeout(drawMain, 1000);
  }
  clearTimeout(timeoutHolding);
  timeoutHolding = -1;
}

Bangle.on('drag', function(e) {
  if (cttl == 0) { cttl = getTime(); }
  if (trackPadMode) {
    if (lastx + lasty == 0) {
      lastx = e.x;
      lasty = e.y;
      mttl = getTime();
    }
    if (clearToSend) {
      clearToSend = false;
      let difX = e.x - lastx, difY = e.y - lasty;
      let dT = getTime() - mttl;
      let vX = difX / dT, vY = difY / dT;
      //let qX = getSign(difX) * Math.pow(Math.abs(difX), 1.2);
      //let qY = getSign(difY) * Math.pow(Math.abs(difY), 1.2);
      let qX = difX + 0.02 * vX, qY = difY + 0.02 * vY;
      moveMouse(qX, qY, 0, 0, 0, function() {
        setTimeout(function() {clearToSend = true;}, 50);
      });
      lastx = e.x;
      lasty = e.y;
      mttl = getTime();
      console.log("Dx: " + (qX) + " Dy: " + (qY));
    }
    if (!e.b) {
      // short press
      if (getTime() - cttl < 0.2) {
        clickMouse(MouseButton.LEFT);
        console.log("click left");
      }
      // longer press in center
      else if (getTime() - cttl < 0.6 && e.x > g.getWidth()/4 && e.x < 3 * g.getWidth()/4 && e.y > g.getHeight() / 4 && e.y < 3 * g.getHeight() / 4) {
        clickMouse(MouseButton.RIGHT);
        console.log("click right");
      }
      cttl = 0;
      lastx = 0;
      lasty = 0;
    }
  } else {
    if(!e.b){
      Bangle.buzz(100);
      if(lasty >  40){
        doPPart(-1);
        // E.showMessage('down');
      } else if(lasty < -40){
        doPPart(1);
        // E.showMessage('up');
      } else if(lastx > 40){
        // E.showMessage('right');
        //kb.tap(kb.KEY.RIGHT, 0);
        scroll(-1);
      } else if(lastx < -40){
        // E.showMessage('left');
        //kb.tap(kb.KEY.LEFT, 0);
        scroll(1);
      } else if(lastx==0 && lasty==0 && holding == false){
        // E.showMessage('press');
        clickMouse(MouseButton.LEFT);
      }
      stopHolding();
      lastx = 0;
      lasty = 0;
    } else{
      lastx = lastx + e.dx;
      lasty = lasty + e.dy;
      if (timeoutHolding == -1) {
        timeoutHolding = setTimeout(startHolding, 500);
      }
    }
  }
});


function onBtn() {
  if (trackPadMode) {
    trackPadMode = false;
    stopHolding();
    drawMain();
  } else {
    clearToSend = true;
    trackPadMode = true;
    E.showMessage('Mouse');
  }
  Bangle.buzz();
}
setWatch(onBtn, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat: true});

loadSettings();
drawMain();
// Presentor by 7kasper (Kasper Müller)
// Version 0.14

// Imports
const bt = require("ble_hid_combo");
const Layout = require("Layout");
const Locale = require("locale");

// App Layout
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
let focusMode = false;

// Timeout IDs.
//let timeoutId = -1;
let timeoutHolding = -1;
let timeoutDraw = -1;
let timeoutSendMouse = -1;

let homeRoll = 0;
let homePitch = 0;
let mCal = 0;
let mttl = 0;
let cttl = 0;
let bttl = 0;

// BT helper.
let clearToSend = true;

// Presentation Timers
let ptimers = [];

function delay(t, v) {
  return new Promise((resolve) => { 
      setTimeout(resolve, t);
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
  if (settings.pparts.length == 0) {
    mainLayout.Subject.label = 'PRESENTOR';
    mainLayout.Notes.label = '';
    return;
  }
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

// Turn on Bluetooth as presentor.
NRF.setServices(undefined, { hid : bt.report });
NRF.on('HID', function() {
  if (!HIDenabled) {
    Bangle.buzz(200);
    HIDenabled = true;
  }
});
// 
NRF.setAdvertising([
  {}, // include original Advertising packet
  [   // second packet containing 'appearance'
    2, 1, 6,  // standard Bluetooth flags
    3,3,0x12,0x18, // HID Service
    3,0x19,0xCA,0x03 // Appearance: Presentation Remote
  ]
]);

// function getSign(x) {
//   return ((x > 0) - (x < 0)) || +x;
// }

function handleAcc(acc) {
  let rRoll  = acc.y *  -50;
  let rPitch = acc.x * -100;
  if (mCal > 10) {
    //console.log("x: " +  (rRoll - homeRoll) + " y:" + (rPitch - homePitch));
    bt.moveMouse(acc.y * -50 - homeRoll, acc.x * -100 - homePitch);
  } else {
    //console.log("homeroll: " +homeRoll +"homepitch: " + homePitch);
    homeRoll  = rRoll  * 0.7 + homeRoll  * 0.3;
    homePitch = rPitch * 0.7 + homePitch * 0.3;
    mCal = mCal + 1;
  }
}
Bangle.on('lock', function(on) {
  if (on && (holding || trackPadMode)) {
    Bangle.setLocked(false);
    Bangle.setLCDPower(1);
  }
});

function startHolding() {
  bt.tapKey(bt.KEY.F10, bt.MODIFY.SHIFT);
  holding = true;
  focusMode = true;
  Bangle.buzz();
  E.showMessage('Holding');
  Bangle.on('accel', handleAcc);
  Bangle.setLCDPower(1);
}
function stopHolding() {
  if (holding) {
    bt.tapKey(bt.KEY.F10);
    // bt.tapKey(bt.KEY.F10);
    homePitch = 0;
    homeRoll = 0;
    holding = false;
    focusMode = false;
    mCal = 0;
    Bangle.removeListener('accel', handleAcc);
    Bangle.buzz();
    drawMain();
  } 
  // else {
  //   timeoutId = setTimeout(drawMain, 1000);
  // }
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
      bt.moveMouse(qX, qY, 0, 0, 0, function() {
        timeoutSendMouse = setTimeout(function() {clearToSend = true; timeoutSendMouse = -1;}, 50);
      });
      lastx = e.x;
      lasty = e.y;
      mttl = getTime();
      console.log("Dx: " + (qX) + " Dy: " + (qY));
    } else if (timeoutSendMouse == -1) { // Can happen perhaps on single bluetooth failure.
      timeoutSendMouse = setTimeout(function() {clearToSend = true; timeoutSendMouse = -1;}, 50);
    }
    if (!e.b) {
      if (!focusMode) {
        // short press
        if (getTime() - cttl < 0.2) {
          bt.clickButton(bt.BUTTON.LEFT);
          console.log("click left");
        }
        // longer press in center
        else if (getTime() - cttl < 0.6 && e.x > g.getWidth()/4 && e.x < 3 * g.getWidth()/4 && e.y > g.getHeight() / 4 && e.y < 3 * g.getHeight() / 4) {
          bt.clickButton(bt.BUTTON.RIGHT);
          console.log("click right");
        }
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
        bt.scroll(-1);
      } else if(lastx < -40){
        // E.showMessage('left');
        //kb.tap(kb.KEY.LEFT, 0);
        bt.scroll(1);
      } 
      // Todo re-implement? Seems bit buggy or unnecessary for now.
      // else if(lastx==0 && lasty==0 && holding == false){
      //   // E.showMessage('press');
      //   bt.clickButton(bt.BUTTON.LEFT);
      // }
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
    if ((getTime() - bttl < 0.4 && !focusMode)) {
      E.showMessage('Pointer');
      focusMode = true;
      bt.tapKey(bt.KEY.F10, bt.MODIFY.SHIFT);
    } else {
      trackPadMode = false;
      stopHolding();
      drawMain();
      if (focusMode) {
        bt.tapKey(bt.KEY.F10);
        focusMode = false;
      }
    }
  } else {
    stopHolding();
    clearToSend = true;
    trackPadMode = true;
    E.showMessage('Mouse');
    // Also skip drawing thingy for now.
    if (timeoutDraw != -1) {
      clearTimeout(timeoutDraw);
      timeoutDraw = -1;
    }
    bttl = getTime();
  }
  Bangle.buzz();
}
setWatch(onBtn, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat: true});

// Start App
loadSettings();
drawMain();
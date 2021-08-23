const _Storage = require('Storage');

let interval = null;

let nightMode = false;

let stepFile = 'v.steps.json';
let stepArchiveFile = 'v.stephist.json';

let _Options = {};
let optsFile = 'm_vatch.opts.json';

let _Alarm = {
  inAlarm: false,
  reload: () => {},
  scheduleAlarms: () => {},
  showMsg: (title, msg) => {},
  showNotes: () => {},
};

let _StepData = {};

const pad0 = (n) => (n > 9) ? n : ("0"+n); 

const getToday = () => {
  let d = new Date();
  return d.getFullYear()+'-'+ pad0(d.getMonth()+1) + '-' + pad0(d.getDate());
};

function reload() {
  _StepData =  _Storage.readJSON(stepFile);
  if(!_StepData) {
    _StepData = {
      lastDate: '2020-01-01',
      stepCache: 0,
      lastStepCount: 0,
      updated: true,
    };
  }
  if(getToday() === _StepData.lastDate) {
    _StepData.stepCache += _StepData.lastStepCount;
    _StepData.lastStepCount = 0;
  }
}

function stringFromArray(data)
{
  var count = data.length;
  var str = "";

  for(var index = 0; index < count; index += 1)
    str += String.fromCharCode(data[index]);

  return str;
}

function logD(str) {
  if(_Options.debug) console.log(str);
}


let lastH1 = -1;
let lastH2 = -1;
let lastM1 = -1;
let lastM2 = -1;


let drawBackground = () => {};
let drawTime = () => {};
let drawData = () => {};


function timeCheck() {
  
  if(_Alarm.inAlarm) return;
  
  logD('Again, ' + JSON.stringify(_Options));
  logD('opt.nm = '+_Options.autoNightMode);
  if(_Options.autoNightMode) {
    // this may vary by Bangle.. adjust to taste
    let a = Bangle.getAccel();
    a.x = Math.floor(a.x * 100);
    logD('a.x = ' + a.x);
    if(a.x <= 101 && a.x >= 99) {
      if(!nightMode) {
        nightMode = ! nightMode;
        redrawScreen();
      }
    } else {
      if(nightMode) {
        nightMode = ! nightMode;
        redrawScreen();
      }
    }
  }
  
  let d = new Date();

  let hour = d.getHours();
  let minute = d.getMinutes();

  let h1 = Math.floor(hour / 10);
  let h2 = hour % 10;
  let m1 = Math.floor(minute / 10);
  let m2 = minute % 10;
  
  logD("lastH1 = "+lastH1+": lastM2 = "+lastM2);
  if(h1 == lastH1 && h2 == lastH2 && m1 == lastM1 && m2 == lastM2) {
    return;
  }
  
  logD("drawing time");
  let data = {
    h1: h1,
    h2: h2,
    m1: m1,
    m2: m2,
    hour: hour,
    min: minute,
  };
  drawTime(data, nightMode);
  
  lastH1 = h1;
  lastH2 = h2;
  lastM1 = m1;
  lastM2 = m2;

  if(!nightMode && !_Alarm.inAlarm) {
    logD("drawing data...");
    const mstr="JanFebMarAprMayJunJulAugSepOctNovDec";
    const dowstr = "SunMonTueWedThuFriSat";

    let month = d.getMonth();
    let dow = d.getDay();
    data.month = month;
    data.date = d.getDate();

    data.mon3 = mstr.slice(month*3,month*3+3);
    data.dow = dowstr.substr(dow*3,3);
    data.dateStr = data.dow + " " + data.mon3 + " " + data.date;
    data.steps = _StepData.stepCache + _StepData.lastStepCount;
    data.batt = E.getBattery() + (Bangle.isCharging() ? "+" : "");
    data.charging = Bangle.isCharging();

    drawData(data);
  }

  if(_StepData.updated) {
     _Storage.writeJSON(stepFile, _StepData);
     logD(JSON.stringify(_StepData));
    _StepData.updated = false;
  }
}

function stop () {
  if (interval) {
    clearInterval(interval);
  }
}

function start () {
  if (interval) {
    clearInterval(interval);
  }
  // first time init
  interval = setInterval(timeCheck, 1000);
  timeCheck();
}


function btn1Func() {
  logD("btn1Func");

  if(_Alarm.inAlarm ) {
    _Alarm.inAlarm = false;
  } else {
    if( ! _Options.autoNightMode) {
      nightMode = ! nightMode;
      logD('nm is '+nightMode);
    }
  }
  redrawScreen();
}

function redrawScreen() {
  logD("redrawScreen");
  
  if(nightMode) {
    g.setRotation(1,0);
  } else {
    g.setRotation(0,0);
  }
  lastM1 = -1;
  lastM2 = -1;
  lastH1 = -1;
  lastH2 = -1;
  drawBackground(nightMode);
  timeCheck();
}

function btn2Func() {
  _Alarm.reload();
  _Alarm.scheduleAlarms();
  _Alarm.showNotes();
}

Bangle.on('step', function(cnt) { 
  if(!_StepData.lastDate) return;
  if(_StepData.lastDate !== getToday()) {
    // save previous day's step count
    try {
      let sf = _Storage.readJSON(stepArchiveFile);
      if(!sf) sf = [];
      logD('sf is '+ (typeof sf) +':'+sf);
      // trim to 30
      if(sf.length >= 30 ) sf.shift();
      let steps = _StepData.stepCache +_StepData.lastStepCount;
      let sd = `${_StepData.lastDate},${steps}`;
      sf.push(sd);
      _Storage.writeJSON(stepArchiveFile, sf);
    } catch (err) {
      _Storage.write('err.txt',err);
    }
    /* individual step files by date
    _Storage.write(_StepData.lastDate +'.steps', JSON.stringify(
      _StepData.stepCache +_StepData.lastStepCount
    ));
    */
    _StepData.stepCache = 0 - cnt;
    _StepData.lastDate = getToday();
  }
  _StepData.lastStepCount = cnt;
  _StepData.updated = true;
});

/*
** Advertise a writeable characteristic. Accepts text (in 20 char
** chunks) terminated with __EOM__ by itself. If there's text, show
** it (as an alarm), otherwise reload the alarm & msg files (empty
** string signals another BLE process updated those files)
*/
/*
var BLEMessage = "";
NRF.setServices({
  "feb10001-f00d-ea75-7192-abbadabadebb": {
    "feb10002-f00d-ea75-7192-abbadabadebb": {
      value : [0],
      maxLen : 20,
      writable : true,
      onWrite : function(evt) {
        let str = stringFromArray(evt.data);
        if(str === "__EOM__") {
          if(BLEMessage) {
            showMsg('Message',BLEMessage);
          } else {
            reload();
            scheduleAlarms();
            showMsg('', 'Reloading...');
          }
          BLEMessage = '';
        } else {
          BLEMessage += str;
        }
      }
    }
  }
}, { });
*/

exports.setDrawBackground = function(dBkgd) {
  drawBackground = dBkgd;
};
exports.setDrawTime = function(dTime) {
  drawTime = dTime;
};
exports.setDrawData = function( dData) {
  drawData = dData;
};
exports.begin = function() {
  _Options = _Storage.readJSON(optsFile);
  if(!_Options) _Options = {
    autoNightMode: true,
    useAlarms: false,
    stepManager: true,
    debug: true,
  };
    
  console.log(JSON.stringify(_Options));

  if(_Options.useAlarms) {
    _Alarm = require('m_alarms');
    _Alarm.reload();
    _Alarm.scheduleAlarms();
  }
  // separate the Bangles now
  const isB2 = g.getWidth() < 200;

  if(!isB2) {
    Bangle.on('lcdPower', function (on) {
      if (on) {
        start();
      } else {
        stop();
      }
    });  
    setWatch(btn1Func, BTN1, {repeat:true,edge:"falling"});
    
    if(_Options.useAlarms) {
      setWatch(btn2Func, BTN2, {repeat:true,edge:"falling"});
    }
    setWatch(Bangle.showLauncher, BTN3, {repeat:false,edge:"falling"});
  }
  reload();
  drawBackground(nightMode);
  start();
};


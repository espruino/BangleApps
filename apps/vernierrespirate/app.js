
// get settings
var settings = require("Storage").readJSON("vernierrespirate.json",1)||{};
settings.vibrateBPM = settings.vibrateBPM||27;
// settings.vibrate; // undefined / "calculated" / "vernier"

function saveSettings() {
  require("Storage").writeJSON("vernierrespirate.json", settings);
}


g.clear();
var graphHeight = g.getHeight()-100;
var last = {
  time : Date.now(),
  x : 0,
  y : 24,
};
var avrValue;
var aboveAvr = false;
var lastBreath;
var lastBreaths = [];
var vibrateInterval;

function onMsg(txt) {
  print(txt);
  E.showMessage(txt);
}

function setVibrate(isOn) {
  var wasOn = vibrateInterval!==undefined;
  if (isOn == wasOn) return;

  if (isOn) {
    vibrateInterval = setInterval(function() {
      Bangle.buzz();
    }, 1000);
  } else {
    clearInterval(vibrateInterval);
    vibrateInterval = undefined;
  }
}

function onBreath() {
  var t = Date.now();
  if (lastBreath!==undefined) {
    // time between breaths
    var value = 60000 / (t-lastBreath);
    // average of last 3
    while (lastBreaths.length>=3) lastBreaths.shift(); // keep length small
    lastBreaths.push(value);
    value = E.sum(lastBreaths) / lastBreaths.length;
    // draw value
    g.reset();
    g.clearRect(0,g.getHeight()-100,g.getWidth(),g.getHeight()-50);
    g.setFont("6x8").setFontAlign(0,0);
    g.drawString("Calculated measurement", g.getWidth()/2, g.getHeight()-95);
    g.setFont("Vector",40).setFontAlign(0,0);
    g.drawString(value.toFixed(2), g.getWidth()/2, g.getHeight()-70);
    // set vibration IF we're doing it from our calculations
    if (settings.vibrate == "calculated")
      setVibrate(value > settings.vibrateBPM);
  }
  lastBreath = t;
}

function onData(n, value) {
  g.reset();
  if (n==2) {
    function scale(v) {
      return Math.max(graphHeight - (1+v*4),24);
    }
    if (avrValue==undefined) avrValue=value;
    avrValue = avrValue*0.95 + value*0.05;
    if (avrValue < 1) avrValue = 1;
    if (value > avrValue) {
      if (!aboveAvr) onBreath();
      aboveAvr = true;
    } else aboveAvr = false;

    var t = Date.now();
    var x = Math.round((t - last.time) / 100) // 10 per second
    if (last.x>=g.getWidth()) {
      x = 0;
      last.x = 0;
      last.time = t;
      g.clearRect(0,24,g.getWidth(),graphHeight);
    }
    var y = scale(value);
    g.setPixel(x, scale(avrValue), "#f00");
    g.drawLine(last.x, last.y, x, y);
    last.x = x;
    last.y = y;
  }
  if (n==4) {
    g.clearRect(0,g.getHeight()-50,g.getWidth(),g.getHeight());
    g.setFont("6x8").setFontAlign(0,0);
    g.drawString("GoDirect measurement", g.getWidth()/2, g.getHeight()-45);
    g.setFont("Vector",40).setFontAlign(0,0);
    g.drawString(value.toFixed(2), g.getWidth()/2, g.getHeight()-20);
    // set vibration IF we're doing it from our calculations
    if (settings.vibrate == "vernier")
      setVibrate(value > settings.vibrateBPM);
  }
  Bangle.setLCDPower(1); // ensure LCD is on
}

function connect() {
  var gatt, service, rx, tx;
  var rollingCounter = 0xFF;

  // any button to exit
  Bangle.setUI("updown", function() {
    setVibrate(false);
    Bangle.buzz();
    try {
      if (gatt) gatt.disconnect();
    } catch (e) {
    }
    setTimeout(mainMenu, 1000);
  });

  function sendCommand(subCommand) {
    const command = new Uint8Array(4 + subCommand.length);
    command.set(new Uint8Array(subCommand), 4);
    // Populate the packet header bytes
    command[0] = 0x58; // header
    command[1] = command.length;
    command[2] = --rollingCounter;
    command[3] = E.sum(command) & 0xFF; // checksum
    return tx.writeValue(command);
  }
  function firstSetBit(v) {
      return v & -v;
  }
  function handleResponse(dv) {
    //print(dv.buffer);
    var resType = dv.getUint8(0);
    if (resType==0x20) {
      // [32, 25, 207, 216, 6, 6, 0, 2, 252, 128, 138, 7, 191, 0, 0, 192, 127, 128, 49, 8, 191, 0, 0, 192, 127])
      // 6 = data type = real
      // 6,0 = bit mask for sensors
      // 2 = value count
      if (dv.getUint8(4)!=6) return; //throw "Not float32 data";
      var sensorIds = dv.getUint16(5, true);
      // var count = dv.getUint8(7); doesn't seem right
      var offs = 9;
      while (sensorIds) {
        var value = dv.getFloat32(offs, true);
        var s = firstSetBit(sensorIds);
        if (isFinite(value)) onData(s,value);
        //else print(s,value);
        sensorIds &= ~s;
        offs += 4;
      }
    } else {
      /*var cmd =*/ dv.getUint8(4); // cmd
      //print("CMD",dv.buffer);
    }
  }

  onMsg("Searching...");
  NRF.requestDevice({ filters: [{ namePrefix: 'GDX-RB' }] }).then(function(device) {
    device.on("gattserverdisconnected", function() {
      onMsg("Device disconnected");
    });
    onMsg("Found. Connecting...");
    return device.gatt.connect({minInterval:20, maxInterval:20});
  }).then(function(g) {
    gatt = g;
    return gatt.getPrimaryService("d91714ef-28b9-4f91-ba16-f0d9a604f112");
  }).then(function(s) {
    service = s;
    return service.getCharacteristic("f4bf14a6-c7d5-4b6d-8aa8-df1a7c83adcb");
  }).then(function(c) {
    tx = c;
    return service.getCharacteristic("b41e6675-a329-40e0-aa01-44d2f444babe");
  }).then(function(c) {
    rx = c;
    rx.on('characteristicvaluechanged', function(event) {
      //print("EVT",event.target.value.buffer);
      handleResponse(event.target.value);
    });
    return rx.startNotifications();
  }).then(function() {
    onMsg("Init");
    sendCommand([ // init
      0x1a,    0xa5,    0x4a,    0x06,
      0x49,    0x07,    0x48,    0x08,
      0x47,    0x09,    0x46,    0x0a,
      0x45,    0x0b,    0x44,    0x0c,
      0x43,    0x0d,    0x42,    0x0e,
      0x41,
    ]);
    /*setTimeout(function() {
      print("Set measurement period");
      var us = 100000; // period in us
      sendCommand([0x1b, 0xff, 0x00,
        us & 255,
        (us >> 8) & 255,
        (us >> 16) & 255,
        (us >> 24) & 255,
        0x00,
        0x00,
        0x00,
        0x00]);
    }, 100);*/

  /*  setTimeout(function() {
      print("Get sensor info");
      sendCommand([0x51, 0]); // get sensor IDs
      // returns [152, 10, 1, 39, 81, 253, 54, 0, 0, 0]
      // 54 is the bit mask of available channels
      //sendCommand([106, 16]); // get sensor info
    }, 2000);*/

    setTimeout(function() {
      onMsg("Start measurements");
      //https://github.com/VernierST/godirect-js/blob/main/src/Device.js#L588
      var channels = 6; // data channels 4 and 2
      sendCommand([ // start measurements
      0x18,    0xff,    0x01,    channels,
      0x00,    0x00,    0x00,    0x00,
      0x00,    0x00,    0x00,    0x00,
      0x00,    0x00,    0x00
      ]);
    }, 500);
  }).catch(function() {
    onMsg("Connect Fail");
  });
}

Bangle.loadWidgets();
Bangle.drawWidgets();

function mainMenu() {
  var vibText = ["No","Calculated","Vernier"];
  var vibValue = ["","calculated","vernier"];
  E.showMenu({"":{title:"Respiration Belt"},
    "< Back" : () => { saveSettings(); load(); },
    "Connect" : () => { saveSettings(); E.showMenu(); connect(); },
    "Vib" : {
      value : Math.max(vibValue.indexOf(settings.vibrate),0),
      format : v => vibText[v],
      min:0,max:2,
      onchange : v => { settings.vibrate=vibValue[v]; }
    },
    "BPM" : {
      value : settings.vibrateBPM,
      min:10,max:50,
      onchange : v => { settings.vibrateBPM=v; }
    }
  });
}

mainMenu();

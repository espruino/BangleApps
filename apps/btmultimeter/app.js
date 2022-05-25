var decoded;
var gatt;


function decode(d) {
  var value = d.getUint16(4,1);
  if (value&32768)
    value = -(value&32767);
  var flags = d.getUint8(0);
  var flags2 = d.getUint8(1);
  // mv dc 27,240     "11xxx"
  // mv ac 95,240   "1011xxx"
  // v dc 36,240     "100xxx" 36(2dp) 35(20dp)
  // v ac 100,240   "1100xxx" 100(2dp) 99(20dp) 97(2000dp)
  // ohms 55,241     "110xxx"
  // beep 231,242  "11100xxx"
  // diode 167,242 "10100xxx"
  // capac 76,241   "1001xxx"
  // hz 162,241    "10100xxx"
  // temp 33,242     "100xxx"
  // ncv 96,243     "1100xxx"
  // uA 146,240    "10010xxx"
  // ma 155,240    "10011xxx"
  // A 163,240     "10100xxx"
  var dp = flags&7;
  var range = (flags>>3)&7;
  value *= Math.pow(10, -dp);
  var isAC = !!(flags&64);
  var mode = "?", units = "";
  if (flags2==240) {
    if (flags&128) {
      mode =  "current";
      units = ["","nA","uA","mA","A","kA","MA",""][range];
    } else {
      mode =  "voltage";
      units = ["","nV","uV","mV","V","kV","MV",""][range] + " " + (isAC?"AC":"DC");
    }
  } else if (flags2==241) {
    if (isAC) {
      mode = "capacitance";
      units = ["","nF","uF","mF","F","kF","MF",""][range];
    } else if (flags&128) {
      mode = "frequency";
      units = "Hz";
    } else {
      mode = "resistance";
      units = ["","nOhm","uOhm","mOhm","Ohm","kOhm","MOhm",""][range];
    }
  } else if (flags2==242) {
    if (flags&128) mode = isAC ? "continuity" : "diode";
    else {
      mode = "temperature";
      units = isAC ? "F" : "C";
    }
  } else if (flags2==243) mode = "ncv";
  //console.log(mode+" "+value+" "+units,new Uint8Array(d.buffer).slice());
  decoded = {
    value : value,
    mode : mode, // current/voltage/capacitance/frequency/resistance/temperature
    units : units, // eg 'mA'
    raw : new Uint8Array(d.buffer).slice(),
  };
  updateDisplay(decoded);
}

function updateDisplay(d) {
  var mode = d.mode;
  mode = mode.substr(0,1).toUpperCase()+mode.substr(1);
  var s = d.value.toString();

  var R = Bangle.appRect;
  g.reset().clearRect(R);
  g.setFont("12x20").setFontAlign(-1,-1).drawString(mode, R.x, R.y);
  g.setFont("12x20").setFontAlign(1,1).drawString(d.units, R.x+R.w-1, R.y+R.h-1);
  var fontSize = 80;
  g.setFont("Vector",fontSize).setFontAlign(0,0);
  while (g.stringWidth(s) > R.w-20) {
    fontSize -= 2;
    g.setFont("Vector", fontSize);
  }
  g.drawString(s, R.x+R.w/2, R.y+R.h/2);
}

Bangle.loadWidgets();
Bangle.drawWidgets();
E.showMessage(/*LANG*/"Connecting...");

NRF.requestDevice({ filters: [{ name: 'BDM' }] }).then(function(device) {
  return device.gatt.connect();
}).then(function(g) {
  gatt = g;
  return gatt.getPrimaryService(0xFFF0);
}).then(function(service) {
  return service.getCharacteristic(0xFFF4);
}).then(function(c) {
  c.on('characteristicvaluechanged', function(event) {
    d = event.target.value;
    decode(d);
  });
  return c.startNotifications();
}).then(function() {
  E.showMessage(/*LANG*/"Connected.");
}).catch(function(e) {
  E.showMessage(e.toString());
});

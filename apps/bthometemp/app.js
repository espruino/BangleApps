// history of temperature/pressure readings
var history = [];

// When we get temperature...
function onTemperature(p) {
  // Average the last 5 temperature readings
  while (history.length>4) history.shift();
  history.push(p);
  var avrTemp = history.reduce((i,h)=>h.temperature+i,0) / history.length;
  var avrPressure = history.reduce((i,h)=>h.pressure+i,0) / history.length;
  var t = require('locale').temp(avrTemp).replace("'","°");
  // Draw
  var rect = Bangle.appRect;
  g.reset(1).clearRect(rect.x, rect.y, rect.x2, rect.y2);
  var x = (rect.x+rect.x2)/2;
  var y = (rect.y+rect.y2)/2 + 10;
  g.setFont("6x15").setFontAlign(0,0).drawString("Temperature:", x, y - 65);
  g.setFontVector(50).setFontAlign(0,0).drawString(t, x, y-25);
  g.setFont("6x15").setFontAlign(0,0).drawString("Pressure:", x, y+15 );
  g.setFont("12x20").setFontAlign(0,0).drawString(Math.round(avrPressure)+" hPa", x, y+40);
  // Set Bluetooth Advertising
  // https://bthome.io/format/
  var temp100 = Math.round(avrTemp*100);
  var pressure100 = Math.round(avrPressure*100);

  var advert = [ 0x40, /* BTHome Device Information
              bit 0: "Encryption flag"
              bit 1-4: "Reserved for future use"
              bit 5-7: "BTHome Version" */

              0x01, // Battery, 8 bit
              E.getBattery(),

              0x02, // Temperature, 16 bit
              temp100&255,temp100>>8,

              0x04, // Pressure, 16 bit
              pressure100&255,(pressure100>>8)&255,pressure100>>16
  ];

  require("ble_advert").set(0xFCD2, advert);
}

// Gets the temperature in the most accurate way with pressure sensor
function drawTemperature() {
  Bangle.getPressure().then(p =>{if (p) onTemperature(p);});
}

setInterval(function() {
  drawTemperature();
}, 10000); // update every 10s
Bangle.loadWidgets();
Bangle.setUI({
  mode : "custom",
  back : function() {load();}
});
E.showMessage("Reading temperature...");
drawTemperature();

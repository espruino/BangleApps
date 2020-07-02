
function redraw() {
  var img = require("heatshrink").decompress(atob("sFgxH+AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ACcyAARD/L/5f/If5f/AHdlAAWtIn5ffAAJG/L75h/L8Jh/L8Jh/L8Jh/L8Jh/L8Jh/L8Jh/L8Jh/L8Jh/L8Jh/L8Jh/L8Jh/L8Jh/L8Jh+L8Rh8L8hh6L8xh4L9Bh2L9Rh0L9hhyL9xhwL+BhuL+RhsL+hhqL/5f/Lvpf0LtRfyLthfwLtxfuLuBfsLuRfqLuhfoLuxfmLvBfkLvRfiLvhfgLvxfeLn5fdLX5fdLH5fdK35fdKn5fdKX5fdKH5fdJ35fdJn5fdJX5fdJH5fdI35fdIn4AamQACIf5f/L/5D/L/5f/If5f/L/5D/L/5f/If5f/L/5D/L/5f/If5f/L/5D/L/5f/If5f/L/5D/L/5f/If5f/L/5D/L/4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AnA"));
  g.clear();
  g.drawImage(img, 120-96, 120-96, {scale:2});
}

// Code for button (Puck.js)
var busy = false;

var lastTry = getTime();

function flag() {
  E.showMessage("Working...");
  if (busy && lastTry+5<getTime()) busy=false;
  lastTry = getTime();

  if (busy) {
    digitalPulse(LED1,1,[10,200,10,200,10]);
    return;
  }
  busy = true;
  var gatt;
  NRF.requestDevice({ filters: [{ name: 'Flag' }] })
    .then(function(device) {
      console.log("Found");
      return device.gatt.connect();
    }).then(function(g) {
      console.log("Connected");
      gatt = g;
      return gatt.getPrimaryService(
        "3e440001-f5bb-357d-719d-179272e4d4d9");
    }).then(function(service) {
      console.log("Found service");
      return service.getCharacteristic(
        "3e440002-f5bb-357d-719d-179272e4d4d9");
    }).then(function(characteristic) {
      console.log("Found characteristic");
      return characteristic.writeValue(1);
    }).then(function() {
      console.log("Found service");
      gatt.disconnect();
      console.log("Done!");
      busy=false;
      redraw();
    }).catch(function(e) {
      console.log("ERROR",e);
      busy=false;
      gatt.disconnect();
      redraw();
    });
}

setWatch(flag, BTN, {repeat:true});

Bangle.on("touch", flag);
redraw();

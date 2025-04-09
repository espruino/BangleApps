let gatt;
let temp = "--.-";

function draw() {
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Temp: " + temp + "°C", 10, 30);

  g.setFont("Vector", 40);
  let t = new Date();
  let timeStr = ("0"+t.getHours()).substr(-2) + ":" + ("0"+t.getMinutes()).substr(-2);
  g.drawString(timeStr, 10, 80);
}

setInterval(draw, 60 * 1000);
draw();

function connectPuck() {
  NRF.requestDevice({ filters: [{ name: "Puck.js" }] }).then(device => {
    return device.gatt.connect();
  }).then(g => {
    gatt = g;
    return gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(service => {
    return service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(characteristic => {
    characteristic.on('characteristicvaluechanged', e => {
      let msg = E.toString(e.target.value.buffer);
      if (msg.startsWith("Temp:")) {
        temp = msg.slice(5);
        draw();
      }
    });
    characteristic.startNotifications();
  }).catch(err => {
    console.log("Connection error:", err);
    setTimeout(connectPuck, 10000);
  });
}

connectPuck();

setWatch(() => {
  load();
}, BTN1, { repeat: false, edge: "rising" });
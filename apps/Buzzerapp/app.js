Bluetooth.setConsole(false);
g.clear();
g.setFont("6x8", 2);
g.drawString("Scanning for buzzers...", 10, 30);

let buzzStartTime = 0;

// Helper to decode DataView to string
function decodeBLEString(dataView) {
  let s = "";
  for (let i = 0; i < dataView.byteLength; i++) {
    s += String.fromCharCode(dataView.getUint8(i));
  }
  return s;
}

NRF.requestDevice({ filters: [{ name: "QuizBuzzer" }] }).then(device => {
  g.clear();
  g.drawString("Connecting to:", 10, 20);
  g.drawString(device.name, 10, 40);
  return device.gatt.connect();
}).then(gatt => {
  g.clear();
  g.drawString("Connected!", 10, 20);
  g.drawString("Waiting for buzz...", 10, 50);
  buzzStartTime = Date.now(); // Start waiting here
  return gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
}).then(service => {
  return service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
}).then(characteristic => {
  characteristic.on('characteristicvaluechanged', function(event) {
    let value = decodeBLEString(event.target.value);
    try {
      let msg = JSON.parse(value);
      if (msg.buzz) {
        let now = Date.now();
        let latency = ((now - buzzStartTime) / 1000).toFixed(2);

        Bangle.buzz();
        Bangle.beep();

        g.clear();
        g.drawString("🎉 Buzz Received!", 10, 20);
        g.drawString("Latency: " + latency + "s", 10, 50);
        g.drawString("Press BTN to reset", 10, 80);
      }
    } catch (e) {
      print("Error parsing:", value);
    }
  });

  return characteristic.startNotifications();
}).catch(err => {
  g.clear();
  g.drawString("Connection failed :(", 10, 30);
  g.drawString(err.toString(), 10, 50);
});

setWatch(() => {
  buzzStartTime = Date.now();
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Waiting for buzz...", 10, 30);
}, BTN, { repeat: true, edge: "rising", debounce: 50 });

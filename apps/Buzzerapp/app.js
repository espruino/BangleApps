Bluetooth.setConsole(false);
g.clear();
g.setFont("6x8", 2);

let buzzedList = [];

// Decode DataView to String
function decodeBLEString(dataView) {
  let s = "";
  for (let i = 0; i < dataView.byteLength; i++) {
    s += String.fromCharCode(dataView.getUint8(i)); 
  }
  return s;
}

// Display buzz order
function updateDisplay() {
  g.clear();
  g.drawString("📋 Buzz Order:", 10, 10);
  buzzedList.forEach((name, i) => {
    g.drawString((i + 1) + ". " + name, 10, 30 + i * 20);
  });
  if (buzzedList.length === 0) {
    g.drawString("Waiting for buzzers...", 10, 50);
  }
}

// Sound & vibration feedback
function alertForRank(rank) {
  if (rank === 0) {
    Bangle.buzz(500);
    Bangle.beep();
    setTimeout(() => Bangle.beep(), 200);
  } else {
    Bangle.buzz(150);
  }
}

// Scan and connect
function scanForBuzzers() {
  NRF.requestDevice({ filters: [{ namePrefix: "Puck" }], timeout: 20000 })
    .then(device => device.gatt.connect())
    .then(gatt => gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e"))
    .then(service => service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e"))
    .then(characteristic => {
      characteristic.on('characteristicvaluechanged', event => {
        let value = decodeBLEString(event.target.value);
        try {
          let msg = JSON.parse(value);
          if (msg.buzz && msg.name && !buzzedList.includes(msg.name)) {
            buzzedList.push(msg.name);
            alertForRank(buzzedList.length - 1);
            updateDisplay();
          }
        } catch (e) {
          print("Parse error:", value);
        }
      });
      return characteristic.startNotifications();
    })
    .catch(err => {
      g.clear();
      g.drawString("⚠️ Connect error:", 10, 30);
      g.drawString(err.toString(), 10, 50);
    });
}

// Reset round
setWatch(() => {
  buzzedList = [];
  updateDisplay();
  scanForBuzzers();
}, BTN, { repeat: true, edge: "rising", debounce: 50 });

// Start first scan
updateDisplay();
scanForBuzzers();

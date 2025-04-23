Bluetooth.setConsole(false);
g.clear();
g.setFont("6x8", 2);

let buzzedList = [];

// Decode DataView to string (safe for BLE characteristic)
function decodeBLEString(dataView) {
  let s = "";
  for (let i = 0; i < dataView.byteLength; i++) {
    s += String.fromCharCode(dataView.getUint8(i));
  }
  return s;
}

// Display buzzed order
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

// Feedback for buzzed-in
function alertForRank(rank) {
  if (rank === 0) {
    Bangle.buzz(500);
    Bangle.beep();
    setTimeout(() => Bangle.beep(), 200);
  } else {
    Bangle.buzz(150);
  }
}

// Scan for Puck.js devices one by one
function scanForBuzzers() {
  NRF.requestDevice({ filters: [{ namePrefix: "Puck" }], timeout: 20000 })
    .then(device => device.gatt.connect()
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

          // Disconnect safely after receiving
          let device = characteristic.device;
          if (device && device.gatt && device.gatt.connected) {
            device.gatt.disconnect();
          }
          setTimeout(scanForBuzzers, 1000);
        });
        return characteristic.startNotifications();
      })
    )
    .catch(err => {
      print("Scan/connect failed:", err);
      setTimeout(scanForBuzzers, 2000);
    });
}

// Button on Bangle to reset round
setWatch(() => {
  buzzedList = [];
  updateDisplay();
  scanForBuzzers();
}, BTN, { repeat: true, edge: "rising", debounce: 50 });

// Start initial scan
updateDisplay();
scanForBuzzers();

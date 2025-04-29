const PUCK_NAME = "Puck A"; // Change to "Puck B", "Puck C" on others
let lastSent = 0;

function sendBuzz() {
  if (Date.now() - lastSent < 3000) return; // 3s cooldown
  lastSent = Date.now();
  let msg = JSON.stringify({ buzz: true, name: PUCK_NAME });
  Bluetooth.println(msg);
  LED.set(); setTimeout(() => LED.reset(), 200);
}

setWatch(sendBuzz, BTN, { edge: "rising", repeat: true, debounce: 50 });

NRF.setAdvertising({}, { name: PUCK_NAME, connectable: true });
console.log(PUCK_NAME + " ready!");

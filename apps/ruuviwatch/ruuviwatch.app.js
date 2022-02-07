require("Storage").write("ruuviwatch.info", {
  id: "ruuviwatch",
  name: "Ruuvi Watch",
  src: "ruuviwatch.app.js",
  icon: "ruuviwatch.img",
});

const lookup = {};
const ruuvis = [];
let current = 0;
let scanning = false;

const SCAN_FREQ = 1000 * 30;

// Fonts
const FONT_L = "Vector:60";
const FONT_M = "Vector:20";
const FONT_S = "Vector:16";

// "layout"
const CENTER = g.getWidth() / 2;
const MIDDLE = g.getHeight() / 2;

const PAGING_Y = 25;
const NAME_Y = PAGING_Y + 25;

const TEMP_Y = MIDDLE;
const HUMID_PRESSURE_Y = MIDDLE + 50;

const VOLT_Y = g.getHeight() - 15;
const SCANNING_Y = VOLT_Y - 25;

function int2Hex(str) {
  return ("0" + str.toString(16).toUpperCase()).slice(-2);
}

function p(data) {
  const OFFSET = 7; // 0-4 header, 5-6 Ruuvi id
  const robject = {};
  robject.version = data[OFFSET];

  let temperature = (data[OFFSET + 1] << 8) | (data[OFFSET + 2] & 0xff);
  if (temperature > 32767) {
    temperature -= 65534;
  }
  robject.temperature = temperature / 200.0;

  robject.humidity =
    (((data[OFFSET + 3] & 0xff) << 8) | (data[OFFSET + 4] & 0xff)) / 400.0;
  robject.pressure =
    ((((data[OFFSET + 5] & 0xff) << 8) | (data[OFFSET + 6] & 0xff)) + 50000) /
    100.0;

  let accelerationX = (data[OFFSET + 7] << 8) | (data[OFFSET + 8] & 0xff);
  if (accelerationX > 32767) accelerationX -= 65536; // two's complement
  robject.accelerationX = accelerationX / 1000.0;

  let accelerationY = (data[OFFSET + 9] << 8) | (data[OFFSET + 10] & 0xff);
  if (accelerationY > 32767) accelerationY -= 65536; // two's complement
  robject.accelerationY = accelerationY / 1000.0;

  let accelerationZ = (data[OFFSET + 11] << 8) | (data[OFFSET + 12] & 0xff);
  if (accelerationZ > 32767) accelerationZ -= 65536; // two's complement
  robject.accelerationZ = accelerationZ / 1000.0;

  const powerInfo =
    ((data[OFFSET + 13] & 0xff) << 8) | (data[OFFSET + 14] & 0xff);
  robject.battery = ((powerInfo >>> 5) + 1600) / 1000.0;
  robject.txPower = (powerInfo & 0b11111) * 2 - 40;
  robject.movementCounter = data[OFFSET + 15] & 0xff;
  robject.measurementSequenceNumber =
    ((data[OFFSET + 16] & 0xff) << 8) | (data[OFFSET + 17] & 0xff);

  robject.mac = [
    int2Hex(data[OFFSET + 18]),
    int2Hex(data[OFFSET + 19]),
    int2Hex(data[OFFSET + 20]),
    int2Hex(data[OFFSET + 21]),
    int2Hex(data[OFFSET + 22]),
    int2Hex(data[OFFSET + 23]),
  ].join(":");

  robject.name =
    "Ruuvi " + int2Hex(data[OFFSET + 22]) + int2Hex(data[OFFSET + 23]);
  return robject;
}

function drawAge() {
  const ruuvi = ruuvis[current];
  const created = ruuvi.time;
  const now = new Date().getTime();
  const agoMs = now - created;
  let age = "";
  if (agoMs > SCAN_FREQ) {
    const agoS = agoMs / 1000;
    // not seen since last scan; indicate age
    if (agoS < 60) {
      // seconds
      age = agoS.toFixed(0) + "s ago";
    } else if (agoS < 60 * 60) {
      // minutes
      age = (agoS / 60).toFixed(0) + "m ago";
    } else {
      // hours
      age = (agoS / 60 / 60).toFixed(0) + "h ago";
    }
  }
  if (agoMs > 5 * SCAN_FREQ) {
    // old
    g.setColor("#ff0000");
  }
  g.setFont(FONT_S);
  g.drawString(age, CENTER, SCANNING_Y);
}

function redrawAge() {
  const originalColor = g.getColor();
  g.clearRect(0, SCANNING_Y - 10, g.getWidth(), SCANNING_Y + 10);
  g.setFont(FONT_S);
  g.setColor("#666666");
  if (scanning) {
    g.drawString("Scanning...", CENTER, SCANNING_Y);
  } else if (ruuvis.length > 0 && ruuvis[current]) {
    drawAge();
  } else {
    g.drawString("No tags in sight", CENTER, SCANNING_Y);
  }
  g.setColor(originalColor);
}

function redraw() {
  g.clear();
  g.setColor("#ffffff");

  if (ruuvis.length > 0 && ruuvis[current]) {
    const ruuvi = ruuvis[current];

    // page
    g.setFont(FONT_S);
    g.drawString(
      " (" + (current + 1) + "/" + ruuvis.length + ")",
      CENTER,
      PAGING_Y
    );

    // name
    g.setFont(FONT_M);
    g.drawString(ruuvi.name, CENTER, NAME_Y);

    // age
    redrawAge();

    // temp
    g.setFont(FONT_L);
    g.drawString(ruuvi.temperature.toFixed(2) + "°c", CENTER, TEMP_Y);

    // humid & pressure
    g.setFont(FONT_M);
    g.drawString(
      ruuvi.humidity.toFixed(2) + "% " + ruuvi.pressure.toFixed(2) + "hPa ",
      CENTER,
      HUMID_PRESSURE_Y
    );

    // battery
    g.setFont(FONT_S);
    g.drawString(ruuvi.battery + "v", CENTER, VOLT_Y);
  } else {
    // no ruuvis
    g.drawImage(
      require("Storage").read("ruuviwatch.img"),
      CENTER - 24,
      MIDDLE - 24
    );
  }
}

function scan() {
  if (scanning) return;
  scanning = true;
  NRF.findDevices(
    function (devices) {
      let foundNew = false;
      devices.forEach((device) => {
        const data = p(device.data);
        data.time = new Date().getTime();
        const idx = lookup[data.name];
        if (idx !== undefined) {
          ruuvis[idx] = data;
        } else {
          lookup[data.name] = ruuvis.push(data) - 1;
          foundNew = true;
        }
      });
      scanning = false;
      redraw();
      if (foundNew) {
        Bangle.buzz();
      }
    },
    { timeout: 2000, filters: [{ manufacturerData: { 0x0499: {} } }] }
  );
}

// START
// Button 1 pages up
setWatch(
  () => {
    current--;
    if (current < 0) {
      current = ruuvis.length - 1;
    }
    redraw();
  },
  BTN1,
  { repeat: true }
);
// button triggers scan
setWatch(
  () => {
    scan();
  },
  BTN2,
  { repeat: true }
);
// button 3 pages down
setWatch(
  () => {
    current++;
    if (current >= ruuvis.length) {
      current = 0;
    }
    redraw();
  },
  BTN3,
  { repeat: true }
);

g.setFontAlign(0, 0);
g.clear();
g.drawImage(
  require("Storage").read("ruuviwatch.img"),
  CENTER - 24,
  MIDDLE - 24
);

g.setFont(FONT_M);
g.drawString("Ruuvi Watch", CENTER, HUMID_PRESSURE_Y);

var ageInterval = setInterval(redrawAge, 1000);
var scanInterval = setInterval(scan, SCAN_FREQ);
scan();

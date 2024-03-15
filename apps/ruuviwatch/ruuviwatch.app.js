require("Storage").write("ruuviwatch.info", {
  id: "ruuviwatch",
  name: "Ruuvi Watch",
  src: "ruuviwatch.app.js",
  icon: "ruuviwatch.img",
});

const lookup = {};
const ruuvis = [];
const names = require("Storage").readJSON("RuuviNames") || {};
let current = 0;
let scanning = false;

let paused = false;

const SCAN_FREQ = 1000 * 30;

// ALERT LIMITS
const LIMIT_SAUNA = 60;
const LIMIT_FRIDGE = 4;
const LIMIT_FREEZER = -18;
// TODO add wine cellar limits
// TODO configurable limits

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

  robject.id = int2Hex(data[OFFSET + 22]) + int2Hex(data[OFFSET + 23]);

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
  if (paused) return;
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

function getName(id) {
  let name = names[id] || "Ruuvi";
  return name + " (" + id + ")";
}

function redraw() {
  g.clear();
  g.setColor("#ffffff");
  g.setFontAlign(0, 0);

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
    g.drawString(getName(ruuvi.id), CENTER, NAME_Y);

    // age
    redrawAge();

    // temp
    g.setFont(FONT_L);
    if (
      (ruuvi.name.startsWith("Sauna") && ruuvi.temperature > LIMIT_SAUNA) ||
      (ruuvi.name.startsWith("Fridge") && ruuvi.temperature > LIMIT_FRIDGE) ||
      (ruuvi.name.startsWith("Freezer") && ruuvi.temperature > LIMIT_FREEZER)
    ) {
      g.setColor("#ffe800");
    }
    g.drawString(getTempString(ruuvi.temperature), CENTER, TEMP_Y);
    g.setColor("#ffffff");

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

function getTempString(temp) {
  // workaround: built-in 'locale' looses precision :-(
  let unit = "°C";
  const isF = require("locale").temp(1).endsWith("F");
  if (isF) {
    unit = "°F";
    temp = (temp + 40) * 1.8 - 40;
  }
  return temp.toFixed(2) + unit;
}

function attention(message) {
  // message ignored for now
  Bangle.beep();
  Bangle.beep();
  Bangle.beep();
  Bangle.buzz();
}

function scan() {
  if (scanning) return;
  if (paused) return;
  scanning = true;
  NRF.findDevices(
    function (devices) {
      let foundNew = false;
      devices.forEach((device) => {
        const data = p(device.data);
        data.time = new Date().getTime();
        data.name = names[data.id] || "Ruuvi";

        const idx = lookup[data.id];
        if (idx !== undefined) {
          const old = ruuvis[idx];
          if (
            data.name.startsWith("Sauna") &&
            old.temperature < LIMIT_SAUNA &&
            data.temperature > LIMIT_SAUNA
          ) {
            current = idx;
            attention(data.name + " ready!");
          } else if (
            data.name.startsWith("Fridge") &&
            old.temperature < LIMIT_FRIDGE &&
            data.temperature > LIMIT_FRIDGE
          ) {
            current = idx;
            attention(data.name + " warning!");
          } else if (
            data.name.startsWith("Freezer") &&
            old.temperature < LIMIT_FREEZER &&
            data.temperature > LIMIT_FREEZER
          ) {
            current = idx;
            attention(data.name + " warning!");
          }
          ruuvis[idx] = data;
        } else {
          lookup[data.id] = ruuvis.push(data) - 1;
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

function setName(newName) {
  const ruuvi = ruuvis[current];
  ruuvi.name = newName;
  names[ruuvi.id] = ruuvi.name;
  require("Storage").writeJSON("RuuviNames", names);
}

function closeMenu() {
  E.showMenu();
  paused = false;
  redraw();
}

function showMenu() {
  // TODO make this DRY + indicate current in menu
  if (!ruuvis.length) {
    scan();
    return;
  }
  paused = true;
  const ruuvi = ruuvis[current];
  const id = ruuvi.id;
  const name = getName(id);

  var mainmenu = {
    "": { title: name },
    "Scan now": function () {
      closeMenu();
      scan();
    },
    "Rename tag": function () {
      E.showMenu(namemenu);
    },
    "< Back": function () {
      closeMenu();
    }, // remove the menu
  };
  // Submenu
  var namemenu = {
    "": { title: "Rename " + name },
    Ruuvi: function () {
      setName("Ruuvi");
      closeMenu();
    },
    Indoors: function () {
      setName("Indoors");
      closeMenu();
    },
    Downstairs: function () {
      setName("Downstairs");
      closeMenu();
    },
    Upstairs: function () {
      setName("Upstairs");
      closeMenu();
    },
    Attic: function () {
      setName("Attic");
      closeMenu();
    },
    Basement: function () {
      setName("Basement");
      closeMenu();
    },
    Kitchen: function () {
      setName("Kitchen");
      closeMenu();
    },
    Pantry: function () {
      setName("Pantry");
      closeMenu();
    },
    "Living room": function () {
      setName("Living room");
      closeMenu();
    },
    "Dining room": function () {
      setName("Dining room");
      closeMenu();
    },
    Office: function () {
      setName("Office");
      closeMenu();
    },
    Bedroom: function () {
      setName("Bedroom");
      closeMenu();
    },
    Bathroom: function () {
      setName("Bathroom");
      closeMenu();
    },
    Sauna: function () {
      setName("Sauna");
      closeMenu();
    },
    "Wine cellar": function () {
      setName("Wine cellar");
      closeMenu();
    },
    Outdoors: function () {
      setName("Outdoors");
      closeMenu();
    },
    Porch: function () {
      setName("Porch");
      closeMenu();
    },
    Backyard: function () {
      setName("Backyard");
      closeMenu();
    },
    Garage: function () {
      setName("Garage");
      closeMenu();
    },
    Greenhouse: function () {
      setName("Greenhouse");
      closeMenu();
    },
    Shed: function () {
      setName("Shed");
      closeMenu();
    },
    Fridge: function () {
      setName("Fridge");
      closeMenu();
    },
    Freezer: function () {
      setName("Freezer");
      closeMenu();
    },
    Dryer: function () {
      setName("Dryer");
      closeMenu();
    },
    Washer: function () {
      setName("Washer");
      closeMenu();
    },
    "< Back": function () {
      E.showMenu(mainmenu);
    },
  };
  // Actually display the menu
  E.showMenu(mainmenu);
}

function nextPage() {
  current++;
  if (current >= ruuvis.length) {
    current = 0;
    scan();
  }
  redraw();
}

function prevPage() {
  current--;
  if (current < 0) {
    current = ruuvis.length - 1;
    scan();
  }
  redraw();
}

// START
Bangle.on("swipe", function (dir) {
  if (paused) return;
  if (dir > 0) {
    prevPage();
  } else {
    nextPage();
  }
});
// Button 1 pages up
setWatch(
  () => {
    if (paused) return;
    prevPage();
  },
  BTN1,
  { repeat: true }
);
// button triggers menu
setWatch(
  () => {
    if (paused) return;
    showMenu();
  },
  BTN2,
  { repeat: true }
);
// button 3 pages down
setWatch(
  () => {
    if (paused) return;
    nextPage();
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

setInterval(redrawAge, 1000);
setInterval(scan, SCAN_FREQ);
scan();

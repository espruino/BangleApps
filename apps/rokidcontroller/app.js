/*
 * Rokid Controller for Bangle.js 2
 *
 * Flat YodaOS-inspired interface for the 176x176 round display.
 *
 * Controls
 * - Tap: Select / Enter
 * - Double tap: Back (HID consumer "AC Back"; a keyboard report cannot send KEYCODE_BACK)
 * - Swipe: Previous / Next (vertical sends Up/Down, horizontal sends Left/Right)
 * - Hold BTN1: Confirm / Enter and send UART command "2TAP"
 * - Double press BTN1: Open settings; press again to save and return
 */

var CX = 88;
var DEBUG = true;

var THEME = {
  bg: [0, 0, 0],
  neon: [0, 1, 0.25],
  cyan: [0, 0.72, 0.72],
  mid: [0, 0.48, 0.14],
  dim: [0, 0.20, 0.07]
};

function setC(c) {
  g.setColor(c[0], c[1], c[2]);
}

function fill(c, x1, y1, x2, y2) {
  setC(c);
  g.fillRect(x1, y1, x2, y2);
}

function line(c, x1, y1, x2, y2) {
  setC(c);
  g.drawLine(x1, y1, x2, y2);
}

function centered(text, y) {
  g.drawString(text, CX - g.stringWidth(text) / 2, y);
}

var lastError = "";

function safeCall(fn, label) {
  try {
    fn();
  } catch (e) {
    reportError(label, e);
  }
}

function reportError(label, e) {
  lastError = label + (e && e.message ? ": " + e.message : "");
  log("ERROR " + lastError);
  if (screen === "main") drawError();
}

function clearError() {
  if (!lastError) return;
  lastError = "";
  if (screen === "main") drawMainFrame();
}

function log(msg) {
  if (DEBUG) console.log("[ROKID] " + msg);
}

var HAS_HID = typeof NRF !== "undefined" && typeof NRF.sendHIDReport === "function";
var HAS_UART = typeof Bluetooth !== "undefined" && typeof Bluetooth.println === "function";
var HAS_SEC = typeof NRF !== "undefined" && typeof NRF.getSecurityStatus === "function";
var SIM_MODE = !HAS_HID;

// Composite HID descriptor: report 1 is a keyboard, report 2 is consumer control
// carrying "AC Back" and "AC Home". Bangle.js 2 exposes a single input report with
// a maximum length of 8 bytes, and the report id counts towards that length, so the
// keyboard collection carries five keys instead of six (the same trade ble_hid_combo
// makes). AC Back is the only way to reach KEYCODE_BACK, which is why the old
// double tap (a keyboard Escape) never did anything.
var HID_ID_KEYBOARD = 1;
var HID_ID_CONSUMER = 2;

var HID_REPORT = new Uint8Array([
  0x05, 0x01,        // Usage Page (Generic Desktop)
  0x09, 0x06,        // Usage (Keyboard)
  0xa1, 0x01,        // Collection (Application)
  0x85, 0x01,        //   Report ID (1)
  0x05, 0x07,        //   Usage Page (Key Codes)
  0x19, 0xe0,        //   Usage Minimum (224)
  0x29, 0xe7,        //   Usage Maximum (231)
  0x15, 0x00,        //   Logical Minimum (0)
  0x25, 0x01,        //   Logical Maximum (1)
  0x75, 0x01,        //   Report Size (1)
  0x95, 0x08,        //   Report Count (8)
  0x81, 0x02,        //   Input (Data, Var, Abs)          modifiers
  0x75, 0x08,        //   Report Size (8)
  0x95, 0x01,        //   Report Count (1)
  0x81, 0x01,        //   Input (Const, Ary, Abs)         reserved
  0x19, 0x00,        //   Usage Minimum (0)
  0x29, 0x73,        //   Usage Maximum (115)
  0x15, 0x00,        //   Logical Minimum (0)
  0x25, 0x73,        //   Logical Maximum (115)
  0x95, 0x05,        //   Report Count (5)
  0x75, 0x08,        //   Report Size (8)
  0x81, 0x00,        //   Input (Data, Ary, Abs)          five keys
  0xc0,              // End Collection
  0x05, 0x0c,        // Usage Page (Consumer Devices)
  0x09, 0x01,        // Usage (Consumer Control)
  0xa1, 0x01,        // Collection (Application)
  0x85, 0x02,        //   Report ID (2)
  0x15, 0x00,        //   Logical Minimum (0)
  0x25, 0x01,        //   Logical Maximum (1)
  0x75, 0x01,        //   Report Size (1)
  0x95, 0x02,        //   Report Count (2)
  0x09, 0x24, 0x02,  //   Usage (AC Back)                 -> KEYCODE_BACK
  0x09, 0x23, 0x02,  //   Usage (AC Home)                 -> KEYCODE_HOME
  0x81, 0x06,        //   Input (Data, Var, Rel)
  0x95, 0x06,        //   Report Count (6)
  0x81, 0x01,        //   Input (Const, Ary, Abs)         pad to one byte
  0xc0               // End Collection
]);

var KEY = {
  ENTER: 0x28,
  ESC: 0x29,
  DOWN: 0x51,
  UP: 0x52,
  LEFT: 0x50,
  RIGHT: 0x4f
};

var CONSUMER = {
  BACK: 0x01,
  HOME: 0x02
};

var hidReady = false;

if (HAS_HID) {
  safeCall(function () {
    NRF.setServices(undefined, {
      hid: HID_REPORT,
      uart: true
    });
    hidReady = true;
    log("HID service registered (report 1 keyboard, report 2 consumer)");
  }, "NRF.setServices");

  // A host decides what a BLE peripheral is from its advertising data, not
  // from the GATT server alone. Without the HID service UUID and an Appearance
  // here, Android binds no HID profile to the watch ("No profiles"), so it
  // never attaches an input device and every report below goes nowhere.
  safeCall(function () {
    NRF.setAdvertising([{}, [ // second packet: HID service + Keyboard appearance
      2, 1, 6,                // flags
      3, 3, 0x12, 0x18,       // HID Service (0x1812)
      3, 0x19, 0xc1, 0x03     // Appearance: Keyboard (0x03C1)
    ]]);
    log("HID advertising set");
  }, "NRF.setAdvertising");
} else {
  log("HID unavailable; emulator mode active");
}

var Storage = require("Storage");
var CFG_FILE = "rokidremote.json";
var cfg = Object.assign(
  { axis: "vertical", invert: false },
  Storage.readJSON(CFG_FILE, 1) || {}
);

function saveCfg() {
  safeCall(function () {
    Storage.writeJSON(CFG_FILE, cfg);
  }, "Storage.writeJSON");
}

var screen = "main";
var state = {
  action: "",
  status: "",
  blink: true
};

var lastTapTime = 0;
var dragStart = null;
var btnDownTime = 0;
var btnPressTimes = [];

var DOUBLE_TAP_MS = 350;
var SWIPE_THRESHOLD = 30;
var HOLD_MS = 400;
var BTN_DBL_WINDOW_MS = 450;

var R = {
  title: { y1: 18, y2: 42 },
  status: { y1: 50, y2: 62 },
  action: { y1: 72, y2: 106 },
  mode: { y1: 113, y2: 124 },
  footer: { y1: 142, y2: 153 }
};

var SETTINGS_ROWS = [
  {
    key: "axis",
    y1: 59,
    y2: 81,
    label: "SWIPE AXIS",
    value: function () { return cfg.axis.toUpperCase(); }
  },
  {
    key: "invert",
    y1: 87,
    y2: 109,
    label: "DIRECTION",
    value: function () { return cfg.invert ? "INVERTED" : "NORMAL"; }
  },
  {
    key: "back",
    y1: 115,
    y2: 137,
    label: "SAVE + RETURN",
    value: function () { return "<"; }
  }
];

function divider(y, color) {
  line(color, 38, y, 138, y);
}

function statusText() {
  if (SIM_MODE) return "EMULATOR";
  if (!hidReady) return "HID OFF";

  var connected = false;
  if (HAS_SEC) {
    try {
      connected = !!NRF.getSecurityStatus().connected;
    } catch (e) {}
  }

  return connected ? "BLE CONNECTED" : "BLE ADVERTISING";
}

function drawHeader(title, subtitle) {
  g.setFont("6x8", 1);
  setC(THEME.neon);
  centered(title, 18);

  setC(THEME.cyan);
  centered(subtitle, 29);

  divider(42, THEME.mid);
}

function drawStatus(force) {
  var text = statusText();
  if (!force && text === state.status && !SIM_MODE) return;

  state.status = text;
  fill(THEME.bg, 30, R.status.y1, 146, R.status.y2);

  var active = text === "BLE CONNECTED" || (SIM_MODE && state.blink);
  fill(active ? THEME.neon : THEME.dim, 39, 54, 43, 58);

  g.setFont("6x8", 1);
  setC(active ? THEME.neon : THEME.mid);
  centered(text, 51);
}

function drawError() {
  fill(THEME.bg, 8, 138, 168, 158);
  g.setFont("6x8", 1);
  setC([1, 0.35, 0.35]);

  var msg = "ERR " + lastError;
  if (g.stringWidth(msg) > 158) msg = msg.substr(0, 21) + "..";
  centered(msg, 142);

  setC(THEME.mid);
  centered("HID SEND FAILED", 152);
  g.flip(8, 138, 168, 158);
}

function drawMainFrame() {
  g.clear();
  drawHeader("ROKID REMOTE", "HID CONTROL");
  drawStatus(true);

  g.setFont("6x8", 1);
  setC(THEME.cyan);
  centered("LAST ACTION", 72);
  divider(84, THEME.dim);

  setC(THEME.dim);
  centered("SWIPE: " + cfg.axis.toUpperCase(), R.mode.y1);
  centered("MODE: " + (cfg.invert ? "INVERTED" : "NORMAL"), R.mode.y1 + 10);

  divider(135, THEME.dim);

  if (lastError) {
    drawError();
  } else {
    setC(THEME.mid);
    centered("TAP SELECT  ·  x2 CONFIG", R.footer.y1);
    centered("HOLD BTN CONFIRM", R.footer.y1 + 10);
  }

  g.flip();
}

function drawAction(label, force) {
  if (!force && label === state.action) return;
  state.action = label;

  fill(THEME.bg, 30, 87, 146, 106);
  g.setFont("6x8", 2);
  setC(THEME.neon);
  centered(label, 88);
  g.flip(30, 87, 146, 106);
}

function drawSettingRow(row) {
  line(THEME.mid, 30, row.y1, 146, row.y1);
  line(THEME.dim, 30, row.y2, 146, row.y2);

  g.setFont("6x8", 1);
  setC(THEME.cyan);
  g.drawString(row.label, 31, row.y1 + 7);

  var value = row.value();
  setC(THEME.neon);
  g.drawString(value, 145 - g.stringWidth(value), row.y1 + 7);
}

function drawSettings() {
  g.clear();
  drawHeader("ROKID CONFIG", "INPUT PROFILE");

  SETTINGS_ROWS.forEach(drawSettingRow);

  g.setFont("6x8", 1);
  setC(THEME.dim);
  centered("TAP A ROW TO CHANGE", 149);
  centered("BTN x2 SAVES AND EXITS", 159);

  g.flip();
}

function openSettings() {
  screen = "settings";
  drawSettings();
  log("settings opened");
}

function closeSettings() {
  screen = "main";
  saveCfg();
  state.action = "";
  state.status = "";
  drawMainFrame();
  drawAction("READY", true);
  log("settings saved");
}

// Reports go out one at a time: NRF.sendHIDReport throws "BLE HID already sending"
// when it is called while a report is in flight, so each report waits for the
// previous one's callback.
function sendReports(reports, label) {
  if (!HAS_HID) return;

  var index = 0;

  function next() {
    if (index >= reports.length) {
      clearError();
      return;
    }

    var report = reports[index];
    index += 1;
    safeCall(function () {
      NRF.sendHIDReport(report, next);
    }, label);
  }

  next();
}

function buzz() {
  if (typeof Bangle !== "undefined" && Bangle.buzz) {
    safeCall(function () {
      Bangle.buzz(30);
    }, "Bangle.buzz");
  }
}

function tapKey(code, action) {
  log("input " + action + " -> keyboard " + code + (SIM_MODE ? " [SIM]" : ""));

  sendReports([
    [HID_ID_KEYBOARD, 0, 0, code, 0, 0, 0, 0],
    [HID_ID_KEYBOARD, 0, 0, 0, 0, 0, 0, 0]
  ], "keyboard report");

  buzz();
  drawAction(action);
}

function sendConsumer(bit, action) {
  log("input " + action + " -> consumer " + bit + (SIM_MODE ? " [SIM]" : ""));

  sendReports([
    [HID_ID_CONSUMER, bit],
    [HID_ID_CONSUMER, 0]
  ], "consumer report");

  buzz();
  drawAction(action);
}

function sendUartCmd(command) {
  if (!HAS_UART) return;
  safeCall(function () {
    Bluetooth.println(command);
  }, "Bluetooth.println");
}

Bangle.on("touch", function (zone, e) {
  var y = e && e.y;

  if (screen === "settings") {
    if (typeof y !== "number") return;

    var hit = SETTINGS_ROWS.filter(function (row) {
      return y >= row.y1 && y <= row.y2;
    })[0];

    if (!hit) return;

    if (hit.key === "axis") {
      cfg.axis = cfg.axis === "vertical" ? "horizontal" : "vertical";
      drawSettings();
    } else if (hit.key === "invert") {
      cfg.invert = !cfg.invert;
      drawSettings();
    } else {
      closeSettings();
    }
    return;
  }

  var now = Date.now();
  if (now - lastTapTime < DOUBLE_TAP_MS) {
    sendConsumer(CONSUMER.BACK, "BACK");
    lastTapTime = 0;
  } else {
    tapKey(KEY.ENTER, "SELECT");
    lastTapTime = now;
  }
});

Bangle.on("drag", function (e) {
  if (screen !== "main") return;

  var primary = cfg.axis === "horizontal" ? e.x : e.y;
  if (typeof primary !== "number") return;

  if (e.b && dragStart === null) {
    dragStart = primary;
    return;
  }

  if (!e.b && dragStart !== null) {
    var delta = primary - dragStart;
    dragStart = null;

    if (Math.abs(delta) <= SWIPE_THRESHOLD) return;

    var forward = delta > 0;
    if (cfg.invert) forward = !forward;

    // The glasses' launcher moves through its app grid with Left/Right and only
    // uses Up/Down inside vertical lists, so the axis setting picks the key.
    var code = cfg.axis === "horizontal"
      ? (forward ? KEY.RIGHT : KEY.LEFT)
      : (forward ? KEY.DOWN : KEY.UP);

    tapKey(code, forward ? "NEXT" : "PREVIOUS");
  }
});

var btnWatch = setWatch(function (e) {
  if (e.state) {
    btnDownTime = Date.now();
    return;
  }

  if (Date.now() - btnDownTime >= HOLD_MS) {
    tapKey(KEY.ENTER, "CONFIRM");
    sendUartCmd("2TAP");
    return;
  }

  var now = Date.now();
  btnPressTimes.push(now);
  btnPressTimes = btnPressTimes.filter(function (t) {
    return now - t < BTN_DBL_WINDOW_MS;
  });

  if (btnPressTimes.length >= 2) {
    btnPressTimes = [];
    if (screen === "main") openSettings();
    else closeSettings();
  }
}, BTN1, {
  repeat: true,
  edge: "both",
  debounce: 30
});

safeCall(function () {
  Bangle.setUI({ mode: "custom" });
}, "Bangle.setUI");

drawMainFrame();
drawAction("READY", true);

var statusTimer = setInterval(function () {
  if (SIM_MODE) state.blink = !state.blink;

  if (screen === "main") {
    drawStatus(SIM_MODE);
    g.flip(30, R.status.y1, 146, R.status.y2);
  }
}, 3000);

E.on("kill", function () {
  clearWatch(btnWatch);
  clearInterval(statusTimer);
});

log("Rokid Controller started; SIM_MODE=" + SIM_MODE);
